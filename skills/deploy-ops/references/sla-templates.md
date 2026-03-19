# SLA Templates — Deploy-Ops Reference

## SLA tiers cho các loại ứng dụng

### Tier 1: Enterprise SaaS (99.9% uptime)

```markdown
## SLA — Enterprise SaaS

### Uptime Commitment
| Period | Uptime | Max Downtime |
|--------|--------|-------------|
| Monthly | 99.9% | 43.8 phút |
| Quarterly | 99.9% | 2.19 giờ |
| Yearly | 99.9% | 8.76 giờ |

### Performance SLA
| Metric | Commitment |
|--------|-----------|
| API response p50 | < 100ms |
| API response p95 | < 300ms |
| API response p99 | < 1s |
| Page load (FCP) | < 1.5s |

### Maintenance Windows
- Planned: Thứ 7, 01:00-04:00 ICT (không tính vào downtime)
- Notice: 72 giờ trước

### Support Response
| Severity | First Response | Resolution |
|----------|--------------|-----------|
| P0 Critical | 15 phút (24/7) | 4 giờ |
| P1 Major | 2 giờ (business) | 24 giờ |
| P2 Moderate | 8 giờ (business) | 3 ngày |
| P3 Minor | Next business day | 2 tuần |

### Service Credits
| Uptime | Credit |
|--------|--------|
| < 99.9% và ≥ 99% | 10% monthly fee |
| < 99% và ≥ 95% | 25% monthly fee |
| < 95% | 50% monthly fee |
```

### Tier 2: Internal Tool (99.5% uptime)

```markdown
## SLA — Internal Tool

### Uptime Commitment
| Period | Uptime | Max Downtime |
|--------|--------|-------------|
| Monthly | 99.5% | 3.65 giờ |

### Performance SLA
| Metric | Commitment |
|--------|-----------|
| API response p95 | < 500ms |
| Page load | < 3s |

### Maintenance Windows
- Planned: Chủ nhật, 00:00-06:00 ICT
- Notice: 24 giờ trước

### Support Response
| Severity | First Response | Resolution |
|----------|--------------|-----------|
| P0 Down | 30 phút (business) | 8 giờ |
| P1 Major | 4 giờ (business) | 3 ngày |
| P2+ | Next business day | 2 tuần |
```

### Tier 3: MVP/Startup (99% uptime)

```markdown
## SLA — MVP/Startup

### Uptime Commitment
| Period | Uptime | Max Downtime |
|--------|--------|-------------|
| Monthly | 99% | 7.3 giờ |

### Performance SLA
| Metric | Commitment |
|--------|-----------|
| API response p95 | < 1s |

### Support Response
Best effort, business hours only.
```

---

## SLA Measurement Methodology

### Uptime Calculation

```
Uptime % = ((Total time - Downtime) / Total time) × 100

Không tính vào downtime:
- Planned maintenance (đã thông báo trước)
- Force majeure (thiên tai, sự cố ISP)
- Issues do customer (configuration sai, DDoS từ customer)

Tính là downtime:
- Unplanned outages
- Degraded performance vượt threshold
- Partial availability (core features không hoạt động)
```

### Monitoring Tools cho SLA Tracking

```
Uptime: UptimeRobot / Pingdom / StatusCake (external monitoring)
Metrics: Grafana + Prometheus / Datadog / New Relic
Status page: Statuspage.io / Cachet (thông báo khách hàng)
```

### Status Page Template

```markdown
## Status Page — {APP_NAME}

**Current Status:** 🟢 All Systems Operational

| Component | Status |
|-----------|--------|
| API Server | 🟢 Operational |
| Web Application | 🟢 Operational |
| Database | 🟢 Operational |
| Payment Gateway | 🟢 Operational |

### Uptime (Last 90 days)
- API: 99.97% ████████████████████ |
- Web: 99.95% ████████████████████ |

### Recent Incidents
| Date | Incident | Duration | Status |
|------|---------|---------|--------|
| 2024-03-01 | Database connection spike | 8 phút | Resolved |
```

---

## Incident Post-Mortem Template

```markdown
# Post-Mortem: {Tên sự cố}

**Ngày xảy ra:** {DATE}
**Thời gian detected:** {HH:MM}
**Thời gian resolved:** {HH:MM}
**Total duration:** {N} phút
**Severity:** P0 / P1
**Affected users:** {N} users / {%}

---

## Timeline

| Time | Event |
|------|-------|
| HH:MM | Alert triggered: {alert name} |
| HH:MM | On-call acknowledged |
| HH:MM | Root cause identified: {cause} |
| HH:MM | Mitigation applied: {action} |
| HH:MM | Service restored |
| HH:MM | Incident closed |

---

## Root Cause

{Mô tả chi tiết nguyên nhân gốc}

**Contributing factors:**
- {Factor 1}
- {Factor 2}

---

## Impact

- Users affected: {N} ({%})
- Transactions lost/delayed: {N}
- Revenue impact: ${N} (estimate)
- SLA credit required: {Yes/No} — {%}

---

## What Went Well

- {Điều phát hiện sớm / xử lý tốt}
- {Escalation nhanh}

## What Could Be Improved

- {Điều cần cải thiện}
- {Detection time}

---

## Action Items

| Action | Owner | Due | Priority |
|--------|-------|-----|---------|
| {Fix root cause} | {Name} | {DATE} | P0 |
| {Improve monitoring} | {Name} | {DATE} | P1 |
| {Update runbook} | {Name} | {DATE} | P2 |

---

**Written by:** {Name}
**Review by:** {Tech Lead}
**Published:** {DATE}
```

---

## Capacity Planning Template

```markdown
## Capacity Planning — {APP_NAME} — {QUARTER}

### Current Baseline

| Metric | Current (avg) | Peak | Growth rate/month |
|--------|-------------|------|------------------|
| DAU | {N} | {N} | {%} |
| Requests/day | {N} | {N} | {%} |
| DB size | {N} GB | - | {N} GB/month |
| Storage | {N} GB | - | {N} GB/month |

### Projection (Next 6 months)

| Month | DAU | Requests/day | DB size |
|-------|-----|-------------|--------|
| Month 1 | {N} | {N} | {N} GB |
| Month 3 | {N} | {N} | {N} GB |
| Month 6 | {N} | {N} | {N} GB |

### Scale Triggers

| Trigger | Threshold | Action |
|---------|----------|--------|
| CPU > 80% sustained | 15 phút | Add 2 pods |
| DB connections > 80% | 5 phút | Add read replica |
| Storage > 75% | 24h | Expand storage |
| Response time p95 > 500ms | 10 phút | Investigate + scale |

### Cost Projection

| Component | Current | Month 3 | Month 6 |
|----------|---------|---------|--------|
| App servers | ${N}/mo | ${N}/mo | ${N}/mo |
| Database | ${N}/mo | ${N}/mo | ${N}/mo |
| Storage | ${N}/mo | ${N}/mo | ${N}/mo |
| **Total** | **${N}/mo** | **${N}/mo** | **${N}/mo** |
```
