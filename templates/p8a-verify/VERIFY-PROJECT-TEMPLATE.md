# VERIFY: PROJECT-LEVEL DOCUMENTS
<!-- ============================================================
     KIỂM TRA TÍNH NHẤT QUÁN — Toàn bộ tài liệu cấp dự án
     Chạy sau khi hoàn thành tất cả file trong _PROJECT/
     ============================================================ -->

> **Phạm vi:** Tất cả tài liệu trong `_PROJECT/`
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL ({{N}} issues)

---

## TÀI LIỆU ĐƯỢC KIỂM TRA

| File | Phiên bản | Ngày |
|------|-----------|------|
| PROJECT-OVERVIEW.md | {{VER}} | {{DATE}} |
| PROJECT-ARCHITECTURE.md | {{VER}} | {{DATE}} |
| DATA-DICTIONARY.md | {{VER}} | {{DATE}} |
| EXPERT-LOG.md | {{VER}} | {{DATE}} |
| BIZ-POLICY/*.md | {{VER}} | {{DATE}} |
| PROCESS/*.md | {{VER}} | {{DATE}} |

---

## CHECKLIST

### 1. Completeness

| # | Kiểm tra | ✅/❌ | Ghi chú |
|---|----------|-------|---------|
| C-001 | PROJECT-OVERVIEW có PROB-XXX cho mọi vấn đề chính? | | |
| C-002 | PROJECT-OVERVIEW có BG-XXX và PG-XXX? | | |
| C-003 | Mọi domain có BIZ-POLICY tương ứng? | | |
| C-004 | Mọi quy trình chính có PROCESS document? | | |
| C-005 | DATA-DICTIONARY có thuật ngữ cho mọi domain? | | |
| C-006 | EXPERT-LOG có ít nhất 1 session? | | |
| C-007 | PROJECT-ARCHITECTURE định nghĩa tất cả systems? | | |

### 2. Consistency

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| X-001 | Tên systems nhất quán giữa PROJECT-OVERVIEW và PROJECT-ARCHITECTURE? | |
| X-002 | Thuật ngữ nhất quán với DATA-DICTIONARY trong tất cả files? | |
| X-003 | BR-XXX trong BIZ-POLICY không mâu thuẫn nhau? | |
| X-004 | PROCESS (TO-BE) phù hợp với BIZ-POLICY? | |

### 3. Traceability

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| T-001 | PROB-XXX → có BR-XXX giải quyết? | |
| T-002 | BR-XXX → có nguồn gốc từ EXPERT-LOG hoặc stakeholder? | |
| T-003 | PROCESS PAIN-XXX → có BR/PROC giải quyết? | |

---

## ISSUES LOG

| # | Severity | File | Issue | Resolution |
|---|---------|------|-------|-----------|
| 1 | High/Med/Low | {{FILE}} | {{ISSUE}} | {{FIX}} |

---

**Kết luận:** {{PASS/FAIL}} — Có thể chuyển Phase 4 (URS) không? {{YES/NO — LÝ_DO}}
