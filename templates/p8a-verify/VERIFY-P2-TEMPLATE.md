# VERIFY: P2-DESIGN — {{SYSTEM_NAME}}
<!-- ============================================================
     KIỂM TRA P2 NỘI BỘ SYSTEM
     Chạy sau khi hoàn thành ARCHITECTURE + DATA-MODEL + tất cả MODSPEC.

     [MCV3-v3.1] Update: Bởi /mcv3:tech-design hoặc manual
     ============================================================ -->

> **System:** {{SYS_CODE}}
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL ({{N}} issues)

---

## CHECKLIST

### 1. P2 vs P1 — Cross-Phase Consistency

| # | Kiểm tra | ✅/❌ | Ghi chú |
|---|----------|-------|---------|
| X-001 | Mọi US (US-XXX) trong URS đều có Feature trong MODSPEC? | | |
| X-002 | Mọi UC (UC-XXX) có API endpoint tương ứng? | | |
| X-003 | Mọi BR (BR-XXX) trong BIZ-POLICY xuất hiện trong MODSPEC? | | |
| X-004 | Mọi AC (AC-XXX) có thể map sang test scenarios? | | |
| X-005 | NFR từ URS phản ánh trong MODSPEC/ARCHITECTURE? | | |

### 2. Design Completeness

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| D-001 | ARCHITECTURE.md đầy đủ (RBAC matrix, tech stack, conventions)? | |
| D-002 | DATA-MODEL.md có đủ tables cho tất cả modules? | |
| D-003 | Mọi MODSPEC có đủ: BR, FT, Schema, API, UI? | |
| D-004 | Integration points (INT-XXX) có spec 2 đầu? | |

### 3. Traceability Matrix

| US | FT | UC | API | UI | TC (planned) |
|----|----|----|-----|----|----|
| US-{{MOD}}-001 | FT-{{MOD}}-001 | UC-{{MOD}}-001-01 | API-{{MOD}}-001 | UI-{{MOD}}-SCREEN | TC-{{MOD}}-001 |

---

## ISSUES LOG

| # | Severity | File | Issue | Resolution |
|---|---------|------|-------|-----------|
| 1 | High/Med/Low | {{FILE}} | {{ISSUE}} | {{FIX}} |

---

**Kết luận:** {{PASS/FAIL}}
