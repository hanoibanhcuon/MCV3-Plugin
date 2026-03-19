# Deploy-Ops Skill — `/mcv3:deploy-ops`

## Mục đích

Tạo **Deployment Documentation** hoàn chỉnh — Phase 8 (Deploy).

Với mỗi dự án, tạo:
- **DEPLOY-OPS.md** — Deploy Plan, Rollback Plan, Monitoring Setup, SLA
- **_VERIFY-CROSS/deploy-readiness-checklist.md** — Go-live checklist
- Cập nhật `_config.json` → phase8-verify

---

## DEPENDENCY MAP

```
Requires:
  - _VERIFY-CROSS/verification-report.md (Phase 8 Verify — bắt buộc)
  - _PROJECT/PROJECT-ARCHITECTURE.md (tech stack, infrastructure)
  - _PROJECT/USER-GUIDE.md (Phase 6 — user documentation)
  - _PROJECT/ADMIN-GUIDE.md (Phase 6 — admin documentation)
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (Phase 6 — test results)
Produces:
  - _PROJECT/DEPLOY-OPS.md (deploy plan + rollback + SLA)
  - _VERIFY-CROSS/deploy-readiness-checklist.md (go-live checklist)
Enables: Go-Live / Production deployment
Agents: doc-writer, tech-expert
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_checkpoint, mc_snapshot
References:
  - skills/deploy-ops/references/deploy-patterns.md
  - skills/deploy-ops/references/monitoring-guide.md
  - skills/deploy-ops/references/sla-templates.md
  - skills/deploy-ops/references/firmware-deploy-guide.md (Embedded/Firmware)
  - templates/p8b-deploy-ops/DEPLOY-OPS-TEMPLATE.md
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:verify` hoàn thành và báo READY
- Cần tạo tài liệu triển khai cho go-live
- Cần SLA definitions và monitoring setup guide
- **Embedded/Firmware project**: Load `firmware-deploy-guide.md`, thay thế nội dung:
  - "Deployment Commands" → Flash programming (esptool.py, STM32CubeProgrammer)
  - "OTA Strategy" → A/B partition, rollback, boot count health check
  - "Go-Live Checklist" → Factory test, batch flash, provisioning, field deployment
  - "Monitoring" → Device online rate, OTA success rate, error rate dashboard

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project
2. mc_load({ filePath: "_VERIFY-CROSS/verification-report.md", layer: 2 })
   → Kiểm tra Overall status

3. Nếu status = "NOT READY":
   ⚠️ Verification report cho thấy dự án chưa sẵn sàng deploy.
      Critical gaps còn tồn tại. Hãy fix và chạy /mcv3:verify lại.

4. Nếu status = "READY" hoặc "NEEDS ATTENTION":
   mc_load({ filePath: "_PROJECT/PROJECT-ARCHITECTURE.md", layer: 2 })
   → Extract: tech stack, infrastructure, environment info
```

---

## Phase 1 — Context Loading

### 1a. Load thông tin cần thiết

```
mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 })
mc_load({ filePath: "_PROJECT/PROJECT-ARCHITECTURE.md", layer: 3 })
mc_list({ documentType: "test" })  → liệt kê tất cả TEST files
mc_list({ subPath: "_VERIFY-CROSS" })  → liệt kê verify documents
```

### 1b. Thu thập thông tin deployment

Hỏi user bổ sung thông tin còn thiếu:

```
"Để tạo DEPLOY-OPS.md, tôi cần thêm thông tin:

1. Deployment strategy: Blue-Green / Canary / Rolling / Big-Bang?
2. Cloud provider: AWS / GCP / Azure / VPS / On-premise?
3. Container: Docker + Kubernetes / Docker Compose / Bare metal?
4. Monitoring stack: Grafana / Datadog / New Relic / custom?
5. Rollback window: bao nhiêu giờ sau deploy?
6. Downtime tolerance: Zero downtime required / Maintenance window OK?
7. Go-live date target: {DATE}?

(Nhập thông tin hoặc nhấn Enter để dùng defaults)"
```

---

## Phase 2 — Deployment Plan

### 2a. Infrastructure Requirements

```markdown
## 1. INFRASTRUCTURE REQUIREMENTS

### Production Environment

| Component | Spec | Provider | Estimated Cost |
|----------|------|---------|---------------|
| App Server | {CPU} / {RAM} | {AWS EC2 / GCP CE / Azure VM} | ${N}/month |
| Database | PostgreSQL {version}, {storage} | {RDS / Cloud SQL / DigitalOcean} | ${N}/month |
| Cache | Redis {version}, {RAM} | {ElastiCache / Upstash} | ${N}/month |
| Storage | S3-compatible, {capacity} | {S3 / GCS / MinIO} | ${N}/month |
| CDN | {bandwidth} | {CloudFront / Cloudflare} | ${N}/month |
| Load Balancer | Layer 7, SSL termination | {ALB / Nginx} | ${N}/month |

**Total estimated: ${TOTAL}/month**

### Staging Environment
{Giống production nhưng smaller specs — 50% cost estimate}

### Network Requirements
- VPC/VNet setup
- Security groups / Firewall rules
- SSL certificate: {Let's Encrypt / ACM / custom}
```

### 2b. Deployment Strategy

```markdown
## 2. DEPLOYMENT PLAN

### Strategy: {Blue-Green / Canary / Rolling / Big-Bang}

**Lý do chọn:** {Giải thích}

### Deployment Order

{Cho Blue-Green:}
```
[Blue env đang chạy] → Deploy to Green → Smoke test → Switch traffic → Monitor → Retire Blue
```

{Cho Canary:}
```
5% traffic → Green → Monitor 30min → 25% → Monitor 1h → 100% → Retire Blue
```

### Deployment Commands

```bash
# 1. Build và tag image
docker build -t {registry}/{app}:{version} .
docker push {registry}/{app}:{version}

# 2. Deploy (Kubernetes example)
kubectl set image deployment/{app} {container}={registry}/{app}:{version}
kubectl rollout status deployment/{app}

# 3. Verify deployment
kubectl get pods -l app={app}
curl https://{domain}/health
```

### Timeline

| Step | Action | Time | Owner |
|------|--------|------|-------|
| T-7 days | Final UAT | 2h | QA Team |
| T-3 days | Staging deployment | 4h | DevOps |
| T-1 day | Pre-flight checks | 2h | DevOps + Dev |
| T-0 | Production deployment | {N}h | DevOps |
| T+1h | Smoke tests | 1h | QA |
| T+24h | Post-deploy review | 1h | All |
```

---

## Phase 3 — Go-Live Checklist

### 3a. Pre-Deployment Checklist (T-7 days)

```markdown
## GO-LIVE CHECKLIST

### Pre-Deployment (T-7 days)

**Development:**
- [ ] Tất cả P0 tests PASS (xem TEST-*.md)
- [ ] Tất cả P1 tests ≥ 95% PASS
- [ ] TypeScript/build không có errors
- [ ] Code review completed
- [ ] Security scan completed (no critical findings)

**QA:**
- [ ] UAT sign-off từ Product Owner
- [ ] Performance tests meet NFR targets
- [ ] Regression tests PASS

**Infrastructure:**
- [ ] Staging environment deployed và tested
- [ ] Database migrations tested trên staging
- [ ] SSL certificates configured
- [ ] Backup strategy configured và tested
- [ ] Monitoring & alerting setup

**Documentation:**
- [ ] USER-GUIDE.md complete
- [ ] ADMIN-GUIDE.md complete
- [ ] Runbook viết xong
- [ ] Incident response procedure defined

### Deployment Day (T-0)

| Step | Task | Owner | Status |
|------|------|-------|--------|
| T-2h | Database backup (final) | DBA | ⏳ |
| T-1h30 | Notify users (maintenance window) | PM | ⏳ |
| T-1h | Deploy _SHARED-SERVICES | DevOps | ⏳ |
| T-30m | Deploy {SYS-A} | DevOps | ⏳ |
| T-0 | Deploy {SYS-B} | DevOps | ⏳ |
| T+15m | Smoke tests | QA | ⏳ |
| T+30m | DNS switch (if needed) | Ops | ⏳ |
| T+1h | Full sanity check | QA | ⏳ |
| T+2h | Go/No-Go decision | Tech Lead | ⏳ |
```

---

## Phase 4 — Rollback Plan

### 4a. Rollback Triggers

```markdown
## 3. ROLLBACK PLAN

### Rollback Triggers

Rollback NGAY nếu:
- Error rate > 5% trong vòng 15 phút sau deploy
- Core feature không hoạt động (P0 scenarios fail)
- Data corruption detected
- Response time > 3x baseline sustained 5 phút

### Rollback Decision Matrix

| Triệu chứng | Mức độ | Action |
|------------|--------|--------|
| Error rate 1-5% | Medium | Monitor thêm 15 phút, chuẩn bị rollback |
| Error rate > 5% | Critical | ROLLBACK NGAY |
| Core feature broken | Critical | ROLLBACK NGAY |
| Performance degraded 2x | High | Investigate, consider rollback |
| Minor UI issues | Low | Hotfix trong working hours |

### Rollback Steps

```bash
# Bước 1: Quyết định rollback (Tech Lead hoặc on-call)
# Thời gian từ quyết định đến rollback: < 5 phút

# Bước 2: Revert application
kubectl rollout undo deployment/{app-name}
# Hoặc: switch traffic về Blue environment

# Bước 3: Verify rollback (kiểm tra version cũ đang chạy)
kubectl rollout status deployment/{app-name}
curl https://{domain}/health
curl https://{domain}/api/version

# Bước 4: Database rollback (CHỈ nếu có schema migration)
# CẢNH BÁO: Chỉ làm nếu migration không backward-compatible
psql -U {user} {db} < backup/pre_deploy_{timestamp}.sql

# Bước 5: Notify stakeholders
# - Slack: #incidents channel
# - Email: {stakeholders}
```

### Rollback Testing

Rollback phải được test trên staging TRƯỚC go-live:
- [ ] Rollback tested trên staging (ngày {DATE})
- [ ] Rollback time: {N} phút
- [ ] Database rollback tested: ✅/N/A
```

---

## Phase 5 — Monitoring Setup

```markdown
## 4. MONITORING & ALERTING

### Key Metrics

| Metric | Tool | Alert threshold | On-call action |
|--------|------|----------------|---------------|
| Error rate | {Grafana/Datadog} | > 1% → Warning, > 5% → Critical | Check logs, rollback if needed |
| Response time p95 | {tool} | > 500ms → Warning, > 2s → Critical | Scale up / investigate |
| CPU usage | {tool} | > 80% → Warning, > 95% → Critical | Scale horizontally |
| Memory usage | {tool} | > 85% → Warning, > 95% → Critical | Restart pod / scale |
| DB connections | {tool} | > 80% pool → Warning | Optimize queries / scale DB |
| Uptime | {UptimeRobot/Pingdom} | Downtime → Immediate alert | Investigate immediately |

### Dashboards

| Dashboard | URL | Audience |
|-----------|-----|---------|
| Application Overview | {grafana_url}/d/app-overview | All |
| Error Tracking | {sentry_url}/projects/{project} | Dev Team |
| Database Performance | {grafana_url}/d/db-perf | DBA, Dev |
| Business Metrics | {grafana_url}/d/business | PM, C-level |

### Log Management

```bash
# Application logs
kubectl logs -f deployment/{app} --tail=100

# Structured log format (JSON)
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "error",
  "message": "...",
  "userId": "...",
  "requestId": "...",
  "module": "{mod}",
  "reqId": "FT-{MOD}-NNN"  // ← REQ-ID trong log
}

# Log retention: 30 ngày hot, 1 năm cold storage
```

### Alerting Channels

| Severity | Channel | Response time |
|----------|---------|--------------|
| P0 Critical | PagerDuty + Slack #alerts | < 5 phút |
| P1 High | Slack #alerts + Email | < 30 phút |
| P2 Medium | Slack #monitoring | < 4 giờ |
| P3 Low | Email digest | Next business day |
```

---

## Phase 6 — SLA Definitions

```markdown
## 5. SLA & SUPPORT

### Service Level Agreement

| Metric | Target | Measurement |
|--------|--------|------------|
| **Uptime** | 99.9% monthly | Uptime monitoring |
| **Response time** | p95 < 200ms | APM tool |
| **Recovery time (RTO)** | < 1 hour | Incident duration |
| **Recovery point (RPO)** | < 4 hours | Backup frequency |

### Support Tiers

| Tier | Priority | Response SLA | Resolution SLA |
|------|----------|-------------|---------------|
| P0 — Critical | System down | 15 phút | 4 giờ |
| P1 — Major | Core feature broken | 1 giờ | 24 giờ |
| P2 — Moderate | Feature degraded | 4 giờ | 3 ngày |
| P3 — Minor | Non-critical issues | Next business day | 2 tuần |

### Maintenance Windows

| Type | Schedule | Duration | Notification |
|------|----------|---------|-------------|
| Planned | Thứ 7, 01:00-04:00 | 3 giờ max | 48h trước |
| Emergency | Khi cần | Tối thiểu | ASAP |
| Database | Chủ nhật, 02:00 | 2 giờ max | 1 tuần trước |

### Incident Response

**Severity P0 — Sự cố nghiêm trọng:**
1. On-call nhận alert → Acknowledge trong 5 phút
2. Đánh giá impact → Quyết định rollback hay fix
3. Thông báo stakeholders (15 phút sau)
4. Resolve + Root cause analysis
5. Post-mortem trong vòng 48 giờ

**Escalation:**
On-call → Tech Lead → CTO (nếu RTO > 2h)
```

---

## Phase 7 — Final Snapshot & Save

```
1. mc_save({
     filePath: "_PROJECT/DEPLOY-OPS.md",
     documentType: "deploy-ops"
   })

2. mc_save({
     filePath: "_VERIFY-CROSS/deploy-readiness-checklist.md",
     documentType: "verify"
   })

3. mc_validate({ filePath: "_PROJECT/DEPLOY-OPS.md" })

4. mc_snapshot({
     label: "pre-production-{version}",
     description: "Full project snapshot trước go-live",
     includeAll: true
   })

5. mc_checkpoint({
     label: "deploy-ops-complete",
     sessionSummary: "Deploy-Ops docs created. Project ready for go-live.",
     nextActions: [
       "Execute go-live checklist",
       "Deploy to production",
       "Monitor post-deployment"
     ]
   })
```

---

## Post-Gate

```
✅ DEPLOY-OPS.md đã saved
✅ Go-live checklist đã tạo
✅ Rollback plan đã documented
✅ Monitoring setup đã định nghĩa
✅ SLA đã định nghĩa
✅ Pre-production snapshot đã tạo

→ "✅ Phase 8 Deploy-Ops hoàn thành!
   🚀 Dự án {name} sẵn sàng cho go-live.

   Next steps:
   1. Review DEPLOY-OPS.md với team
   2. Execute go-live checklist (T-7 days)
   3. Deploy theo deployment plan
   4. Monitor 48h đầu sau go-live

   🎉 Chúc mừng! Đây là phase cuối của pipeline MCV3."
```

---

## Quy tắc Deploy-Ops

```
VERIFY-FIRST: Không tạo DEPLOY-OPS khi verify chưa READY
ROLLBACK-TESTED: Rollback plan phải tested trước go-live
MONITOR-DEFINED: Mọi critical metrics phải có alert
SLA-REALISTIC: SLA phải dựa trên capacity thực tế
SNAPSHOT-BEFORE-DEPLOY: Luôn snapshot trước mọi production change
RUNBOOK-WRITTEN: Mọi operational task phải có runbook
```
