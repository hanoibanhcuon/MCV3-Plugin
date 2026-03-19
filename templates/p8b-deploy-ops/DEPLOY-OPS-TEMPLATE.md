# DEPLOY-OPS: Deployment & Operations Guide
<!-- ============================================================
     KẾ HOẠCH TRIỂN KHAI & VẬN HÀNH — Chung toàn dự án.
     Bao gồm: Deploy Plan, Go-Live Checklist, Rollback, Training Plan.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-ARCHITECTURE.md, TEST-*.md (all pass)
       Output: Go-live documentation
       Update: Bởi /mcv3:verify skill (Phase 8)
     ============================================================ -->

> **Phase:** P3 — QA, Deploy & Docs
> **Loại:** Tài liệu triển khai & vận hành
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-ARCHITECTURE.md] — Tech stack & infrastructure
- [REF: _VERIFY-CROSS/verification-report.md] — Overall status = READY?

---

## 1. DEPLOYMENT PLAN

### 1.1. Deployment Strategy

| Mục | Giá trị |
|-----|--------|
| Strategy | Big Bang / Phased / Blue-Green / Canary |
| Deployment Order | {{THỨ_TỰ}}: _SHARED-SERVICES → {{SYS_A}} → {{SYS_B}} |
| Rollback Window | {{N}} hours |
| Downtime | {{NONE / N minutes}} |

### 1.2. Deployment Timeline

| Phase | System(s) | Start | End | Owner |
|-------|----------|-------|-----|-------|
| A | _SHARED-SERVICES | {{DATE}} | {{DATE}} | {{NAME}} |
| B | {{SYS_A}} | {{DATE}} | {{DATE}} | {{NAME}} |
| C | {{SYS_B}} | {{DATE}} | {{DATE}} | {{NAME}} |

### 1.3. Infrastructure Requirements

| Resource | Spec | Provider | Cost/month |
|---------|------|---------|-----------|
| App server | {{SPEC}} | {{PROVIDER}} | {{COST}} |
| Database | {{SPEC}} | {{PROVIDER}} | {{COST}} |
| CDN | {{SPEC}} | {{PROVIDER}} | {{COST}} |

---

## 2. GO-LIVE CHECKLIST

### 2.1. Pre-Deployment (T-7 days)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Tất cả UAT tests pass | QA Team | ⏳ |
| 2 | Performance test pass (NFR criteria) | Dev Team | ⏳ |
| 3 | Security scan hoàn thành | Security | ⏳ |
| 4 | Database migration tested trên staging | DBA | ⏳ |
| 5 | Backup strategy configured | Ops | ⏳ |
| 6 | Monitoring & alerting setup | Ops | ⏳ |

### 2.2. Deployment Day (T-0)

| # | Task | Time | Owner | Status |
|---|------|------|-------|--------|
| 1 | Database backup final | T-2h | DBA | ⏳ |
| 2 | Deploy _SHARED-SERVICES | T-1h | DevOps | ⏳ |
| 3 | Deploy {{SYS_A}} | T-30m | DevOps | ⏳ |
| 4 | Smoke test | T+0 | QA | ⏳ |
| 5 | DNS switch | T+30m | Ops | ⏳ |
| 6 | Full sanity check | T+1h | QA | ⏳ |

### 2.3. Post-Deployment (T+1 day to T+7 days)

| # | Task | Owner |
|---|------|-------|
| 1 | Monitor error rates (threshold < 1%) | Ops |
| 2 | User feedback collection | PM |
| 3 | Performance baseline establish | Dev |

---

## 3. ROLLBACK PLAN

### 3.1. Rollback Triggers

Rollback ngay nếu:
- Error rate > 5% trong 15 phút đầu
- Core feature không hoạt động
- Data corruption detected

### 3.2. Rollback Steps

```bash
# 1. Revert app deployment
kubectl rollout undo deployment/{{app-name}}

# 2. Restore database (nếu schema changed)
psql -U {{user}} {{db}} < backup_pre_deploy.sql

# 3. Verify rollback
curl https://{{url}}/health
```

---

## 4. TRAINING PLAN

| Đối tượng | Nội dung | Thời gian | Người đào tạo |
|----------|---------|---------|--------------|
| End users | User Guide + Hands-on | 2h | {{TRAINER}} |
| Admins | Admin Guide + Config | 4h | {{TRAINER}} |
| IT Support | Troubleshooting | 2h | Dev Team |

---

## 5. SLA & SUPPORT

| Metric | Target |
|--------|--------|
| Uptime | {{N}}% monthly |
| Response time (business hours) | < 4 hours |
| Critical bug fix | < 24 hours |
| Support channel | {{EMAIL / TICKET_SYSTEM}} |
