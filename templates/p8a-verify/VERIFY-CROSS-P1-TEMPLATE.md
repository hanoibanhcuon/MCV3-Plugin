# VERIFY CROSS-SYSTEM: PHASE 1
<!-- ============================================================
     KIỂM TRA CROSS-SYSTEM — Tất cả P1 giữa các systems nhất quán?
     Chạy SAU KHI mọi system đã pass P1 verify nội bộ.
     ============================================================ -->

> **Phạm vi:** P1-REQUIREMENTS của TẤT CẢ systems
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL

---

## SYSTEMS ĐƯỢC KIỂM TRA

| System | P1 Internal Verify | Status |
|--------|-------------------|--------|
| {{SYS_A}} | PASS / FAIL | {{DATE}} |
| {{SYS_B}} | PASS / FAIL | {{DATE}} |

---

## CHECKLIST

### 1. Cross-System Consistency

| # | Kiểm tra | ✅/❌ | Ghi chú |
|---|----------|-------|---------|
| 1 | Shared entities (User, Product, Order...) định nghĩa giống nhau? | | |
| 2 | Thuật ngữ nhất quán (khớp DATA-DICTIONARY)? | | |
| 3 | Vai trò user giống nhau khi xuất hiện trong nhiều systems? | | |
| 4 | Business Rules không mâu thuẫn giữa systems? | | |
| 5 | NFR requirements không conflicting? | | |

### 2. Integration Readiness

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| 1 | Mọi INT-XXX trong PROJECT-ARCHITECTURE có US/UC ở cả 2 đầu? | |
| 2 | Data flow giữa systems được định nghĩa rõ trong URS? | |

---

**Kết luận:** {{PASS/FAIL}} — Chuyển P2 không?
