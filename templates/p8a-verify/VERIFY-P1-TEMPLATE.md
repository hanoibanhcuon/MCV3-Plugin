# VERIFY: P1-REQUIREMENTS — {{SYSTEM_NAME}}
<!-- ============================================================
     KIỂM TRA P1 NỘI BỘ SYSTEM
     Chạy sau khi hoàn thành tất cả URS files của system này.

     [MCV3-v3.1] Update: Bởi /mcv3:requirements hoặc manual review
     ============================================================ -->

> **System:** {{SYS_CODE}}
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL ({{N}} issues)

---

## CHECKLIST

### 1. Completeness

| # | Kiểm tra | ✅/❌ | Ghi chú |
|---|----------|-------|---------|
| C-001 | Mọi Business Rule trong BIZ-POLICY liên quan đều có User Story? | | |
| C-002 | Mọi bước TO-BE trong PROCESS đều có Use Case? | | |
| C-003 | Mọi US có ít nhất 1 UC (happy path)? | | |
| C-004 | Mọi UC có Acceptance Criteria đầy đủ? | | |
| C-005 | NFR được định nghĩa? | | |

### 2. Consistency

| # | Kiểm tra | ✅/❌ | Ghi chú |
|---|----------|-------|---------|
| X-001 | Thuật ngữ nhất quán với DATA-DICTIONARY? | | |
| X-002 | User roles nhất quán với PROJECT-OVERVIEW? | | |
| X-003 | Module codes đúng format theo SYSTEM-INDEX? | | |

### 3. Traceability

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| T-001 | Mọi US có PROB-XXX reference? | |
| T-002 | Mọi BR trong URS có REF đến BIZ-POLICY? | |
| T-003 | Mọi AC có format: Given/When/Then? | |

---

## ISSUES LOG

| # | Severity | File | Issue | Resolution |
|---|---------|------|-------|-----------|
| 1 | High/Med/Low | {{FILE}} | {{ISSUE}} | {{FIX}} |

---

**Kết luận:** {{PASS/FAIL — ghi rõ cần fix gì trước khi chuyển P2}}
