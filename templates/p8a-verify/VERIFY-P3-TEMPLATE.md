# VERIFY: P3-QA-DOCS — {{SYSTEM_NAME}}
<!-- ============================================================
     KIỂM TRA P3 NỘI BỘ SYSTEM
     Chạy sau khi hoàn thành TEST + USER-GUIDE + ADMIN-GUIDE.
     ============================================================ -->

> **System:** {{SYS_CODE}}
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL

---

## CHECKLIST

### 1. Test Coverage

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| C-001 | Mọi AC (AC-XXX) có Test Case tương ứng? | |
| C-002 | Mọi API endpoint có API Test Case? | |
| C-003 | Mọi BR (BR-XXX) được test? | |
| C-004 | Có test cho Exception Flows? | |
| C-005 | UAT criteria đầy đủ cho mọi vai trò user? | |
| C-006 | Mọi Integration Point (INT-XXX) có test? | |
| C-007 | NFR (performance, security) có test criteria? | |

### 2. User Docs Completeness

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| D-001 | USER-GUIDE đủ chương cho tất cả modules? | |
| D-002 | ADMIN-GUIDE có env vars, backup, troubleshooting? | |
| D-003 | Screenshots/examples đủ rõ cho end-user? | |

### 3. Test Results

| Test Suite | Total | Pass | Fail | Coverage |
|-----------|-------|------|------|---------|
| Unit Tests | {{N}} | {{N}} | {{N}} | {{N}}% |
| Integration | {{N}} | {{N}} | {{N}} | — |
| E2E | {{N}} | {{N}} | {{N}} | — |
| UAT | {{N}} | {{N}} | {{N}} | — |

---

**Kết luận:** {{PASS/FAIL — {{N}} issues cần fix trước go-live}}
