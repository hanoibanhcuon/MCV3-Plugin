# VERIFY CROSS-SYSTEM: PHASE 2
<!-- ============================================================
     KIỂM TRA CROSS-SYSTEM — Tất cả P2 giữa các systems nhất quán?
     ============================================================ -->

> **Phạm vi:** P2-DESIGN của TẤT CẢ systems
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL

---

## CHECKLIST

### 1. Architecture Consistency

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| 1 | API conventions nhất quán giữa tất cả systems? | |
| 2 | Error code format giống nhau? | |
| 3 | Auth flow giống nhau (tham chiếu AUTH-SPEC)? | |
| 4 | Response format chuẩn hóa? | |
| 5 | Data types cho shared entities giống nhau giữa DATA-MODELs? | |

### 2. Integration Verification

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| 1 | Mọi INT-XXX có MODSPEC implement 2 đầu? | |
| 2 | API request/response format khớp nhau giữa systems? | |
| 3 | Shared entity fields giống nhau (tham chiếu DATA-DICTIONARY)? | |

### 3. Traceability (Cross-System)

| PROB | BR | US (System A) | US (System B) | FT-A | FT-B |
|------|-----|--------------|--------------|------|------|
| PROB-001 | BR-{{DOM}}-001 | US-{{MOD_A}}-001 | US-{{MOD_B}}-001 | FT-{{MOD_A}}-001 | FT-{{MOD_B}}-001 |

---

**Kết luận:** {{PASS/FAIL}} — Chuyển P3 không?
