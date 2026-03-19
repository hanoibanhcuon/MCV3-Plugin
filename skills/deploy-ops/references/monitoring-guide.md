# Monitoring Guide — Deploy-Ops Reference

## Observability Stack

### 3 Pillars of Observability

```
Metrics  → Grafana + Prometheus (WHAT is happening)
Logs     → Loki / ELK / CloudWatch (WHY it happened)
Traces   → Jaeger / OpenTelemetry (WHERE the bottleneck is)
```

---

## Metrics to Monitor

### Application Metrics (RED Method)

| Metric | Tool | Alert |
|--------|------|-------|
| **R**ate (requests/sec) | Prometheus | Drop > 50% → Warning |
| **E**rrors (error rate %) | Prometheus | > 1% → Warning, > 5% → Critical |
| **D**uration (latency) | Prometheus | p95 > 200ms → Warning, > 1s → Critical |

```
# Prometheus queries (PromQL)
# Error rate
rate(http_requests_total{status=~"5.."}[5m]) /
rate(http_requests_total[5m]) * 100

# p95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Request rate
rate(http_requests_total[5m])
```

### Infrastructure Metrics

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| CPU Usage | > 80% warning, > 95% critical | Scale horizontally |
| Memory Usage | > 85% warning, > 95% critical | Scale up / fix leak |
| Disk Usage | > 75% warning, > 90% critical | Cleanup / expand |
| Network I/O | Abnormal spike | Investigate traffic |
| DB Connections | > 80% pool → Warning | Optimize / scale DB |

### Business Metrics (Golden Signals for Business)

```
Tùy theo domain, nhưng thường gồm:
- Số transactions/hour (so với baseline)
- Revenue per hour (nếu là commerce)
- Active users
- Error rate theo business feature (không chỉ HTTP)
- SLA compliance rate
```

---

## Alerting Rules

### Alert Severity Levels

```yaml
# Prometheus AlertManager rules
groups:
  - name: application
    rules:
      # Critical — immediate action
      - alert: HighErrorRate
        expr: error_rate > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate: {{ $value | humanizePercentage }}"
          runbook: "https://wiki/runbook/high-error-rate"

      # Warning — investigate
      - alert: HighLatency
        expr: http_p95_latency_seconds > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High p95 latency: {{ $value }}s"
```

### Alert Routing

```yaml
# AlertManager config
route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical
      repeat_interval: 1h

    - match:
        severity: warning
      receiver: slack-warning
      repeat_interval: 4h

receivers:
  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: ${PAGERDUTY_KEY}

  - name: slack-warning
    slack_configs:
      - channel: '#monitoring'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .Annotations.summary }}'
```

---

## Logging Best Practices

### Structured Logging Format

```typescript
// Dùng winston hoặc pino
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Log với context (BẮT BUỘC)
logger.info({
  // Standard fields
  timestamp: new Date().toISOString(),
  level: 'info',
  service: '{app-name}',
  version: process.env.APP_VERSION,

  // Request context
  requestId: req.id,
  userId: req.user?.id,
  method: req.method,
  path: req.path,

  // Business context (REQ-ID tracing)
  reqId: 'FT-INV-001',    // Feature ID được thực thi
  module: 'inventory',

  // Message
  message: 'Tạo phiếu nhập kho thành công',
  duration: 123,           // ms

  // Data (không log PII)
  orderId: result.id,
  // KHÔNG log: password, credit card, SSN, etc.
}, 'Order created');
```

### Log Levels

| Level | Khi nào | Example |
|-------|---------|---------|
| `error` | Lỗi ảnh hưởng user, cần action | DB connection failed |
| `warn` | Tình huống bất thường, chưa critical | Cache miss rate cao |
| `info` | Events quan trọng trong business flow | User đăng nhập, order tạo |
| `debug` | Chi tiết để debug (tắt trên production) | SQL queries, API calls |
| `trace` | Rất chi tiết (chỉ khi debug cụ thể) | Function entry/exit |

### Log Retention Policy

```
Hot storage (searchable): 30 ngày
Cold storage (archived): 1 năm
Legal hold (nếu cần): 7 năm

Log điều hướng đến:
- Application logs → CloudWatch Logs / Loki
- Access logs → S3 (compressed)
- Error logs → Sentry / Datadog
- Audit logs → Separate secure storage
```

---

## Distributed Tracing

### OpenTelemetry Setup

```typescript
// tracing.ts — Setup distributed tracing
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_URL,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: '{app-name}',
});

sdk.start();
```

### Trace Correlation

```typescript
// Thêm REQ-ID vào trace attributes
import { trace } from '@opentelemetry/api';

const span = trace.getActiveSpan();
span?.setAttributes({
  'req.id': 'FT-INV-001',
  'user.id': userId,
  'order.id': orderId,
});
```

---

## Dashboards

### Grafana Dashboard Structure

```
1. Overview Dashboard (C-level view):
   - Uptime status (green/red)
   - Total requests today
   - Error rate 24h
   - P95 latency trend

2. Application Dashboard (Engineering):
   - Request rate per endpoint
   - Error rate breakdown (4xx vs 5xx)
   - Latency heatmap
   - Active connections

3. Infrastructure Dashboard:
   - CPU/Memory per pod
   - Network I/O
   - Disk usage
   - Database metrics

4. Business Dashboard (PM view):
   - Orders/hour
   - Revenue/hour
   - Active users
   - Feature usage by FT-ID
```

---

## Incident Response Runbook Template

```markdown
## Runbook: {Tên sự cố}

**Symptom:** {Mô tả triệu chứng}
**Alert:** {Tên alert trong Prometheus/Datadog}
**Severity:** P0 / P1 / P2

### Quick Check
1. Xem dashboard: {URL}
2. Check logs: `kubectl logs -l app={app} --tail=100`
3. Check error rate: `{Prometheus query}`

### Diagnosis Steps
1. {Bước 1}
2. {Bước 2}

### Resolution Options

**Option A: Restart pods** (thường fix 70% issues)
```bash
kubectl rollout restart deployment/{app}
```

**Option B: Scale up** (nếu CPU/Memory quá cao)
```bash
kubectl scale deployment/{app} --replicas=5
```

**Option C: Rollback** (nếu sau deploy mới)
```bash
kubectl rollout undo deployment/{app}
```

### Escalation
- Không resolve sau 30 phút → Escalate to {Tech Lead}
- Database issue → Page {DBA on-call}
- Security incident → Page {Security on-call} + DO NOT investigate yourself
```
