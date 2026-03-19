# ADMIN GUIDE: {{SYSTEM_NAME}}
<!-- ============================================================
     HƯỚNG DẪN QUẢN TRỊ HỆ THỐNG — 1 file per SYSTEM
     Đối tượng: System Admin / IT Admin

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  ARCHITECTURE.md, _SHARED-SERVICES/*
       Update: Bởi /mcv3:qa-docs skill
     ============================================================ -->

> **Phase:** P3 — QA & Docs
> **System:** {{SYS_CODE}}
> **Đối tượng:** System Admin, IT Admin
> **Phiên bản:** {{VERSION}}

---

## 1. SYSTEM CONFIGURATION

### 1.1. Environment Variables

| Variable | Mô tả | Default | Required | Ví dụ |
|----------|-------|---------|----------|-------|
| `DB_HOST` | Database host | localhost | Có | `db.prod.internal` |
| `DB_PORT` | Database port | 5432 | Có | `5432` |
| `DB_NAME` | Database name | — | Có | `{{project}}_prod` |
| `JWT_SECRET` | JWT signing key | — | Có | (random 64 chars) |
| `{{VAR}}` | {{MÔ_TẢ}} | {{DEFAULT}} | {{YN}} | {{VÍ_DỤ}} |

### 1.2. Configuration Files

| File | Vị trí | Mục đích |
|------|--------|---------|
| `.env.production` | Project root | Production env vars |
| `config/database.ts` | src/config/ | Database connection |
| `config/app.ts` | src/config/ | App settings |

---

## 2. USER MANAGEMENT

### 2.1. Tạo tài khoản mới

```bash
# Qua API
POST /api/v1/admin/users
{ "email": "...", "role": "{{ROLE}}", "name": "..." }

# Qua CLI (nếu có)
npm run cli -- create-user --email=... --role=...
```

### 2.2. RBAC Roles

| Role | Mô tả | Tạo bởi |
|------|-------|--------|
| admin | Toàn quyền | Super Admin |
| manager | Quản lý team | Admin |
| user | Người dùng thường | Admin / Manager |

### 2.3. Reset mật khẩu

```bash
POST /api/v1/admin/users/{userId}/reset-password
# → Gửi email reset link
```

---

## 3. DATABASE MANAGEMENT

### 3.1. Backup

```bash
# Daily backup (cron job đã setup)
pg_dump -U {{DB_USER}} -h {{DB_HOST}} {{DB_NAME}} > backup_$(date +%Y%m%d).sql

# Verify backup
pg_restore --list backup_{{DATE}}.sql | head -20
```

### 3.2. Migration

```bash
# Run migrations
npm run migrate:up

# Rollback 1 step
npm run migrate:down

# Check migration status
npm run migrate:status
```

---

## 4. MONITORING & LOGS

### 4.1. Application Logs

```bash
# Xem log realtime
tail -f /var/log/{{app}}/app.log

# Tìm errors
grep "ERROR" /var/log/{{app}}/app.log | tail -50
```

### 4.2. Health Check Endpoints

| Endpoint | Mô tả | Expected |
|---------|-------|---------|
| `GET /health` | Overall health | `{"status":"ok"}` |
| `GET /health/db` | DB connection | `{"status":"ok","latency":"Xms"}` |
| `GET /metrics` | Prometheus metrics | Metrics data |

### 4.3. Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|---------|--------|
| CPU | > 70% | > 90% | Scale up |
| Memory | > 80% | > 95% | Restart service |
| Error rate | > 1% | > 5% | Investigate logs |
| Response time p95 | > 1s | > 3s | Profile & optimize |

---

## 5. TROUBLESHOOTING

| Vấn đề | Nguyên nhân thường gặp | Giải pháp |
|--------|----------------------|----------|
| App không start | DB connection fail | Kiểm tra DB_HOST, DB_PORT |
| Login fail tất cả users | JWT_SECRET thay đổi | Rollback JWT_SECRET hoặc force logout |
| Slow queries | Missing indexes | Run `EXPLAIN ANALYZE` on slow query |
| {{ISSUE}} | {{CAUSE}} | {{SOLUTION}} |

---

## 6. BACKUP & RECOVERY

### 6.1. Disaster Recovery

```
RTO (Recovery Time Objective): {{N}} hours
RPO (Recovery Point Objective): {{N}} hours

Steps:
1. Restore DB từ backup gần nhất
2. Deploy app từ last known good Docker image
3. Verify health checks
4. Notify users
```
