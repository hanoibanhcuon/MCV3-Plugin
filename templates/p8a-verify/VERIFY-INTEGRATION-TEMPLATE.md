# VERIFY: INTEGRATION
<!-- ============================================================
     KIỂM TRA TÍCH HỢP GIỮA CÁC SYSTEMS
     Verify cuối cùng trước khi development — mọi INT point đều rõ ràng.
     ============================================================ -->

> **Phạm vi:** Tất cả Integration Points (INT-XXX)
> **Tham chiếu:** PROJECT-ARCHITECTURE.md → Integration Map
> **Ngày kiểm tra:** {{DATE}}
> **Kết quả:** PASS / FAIL

---

## INTEGRATION POINTS VERIFICATION

### INT-001: {{MÔ_TẢ}}

| Mục | Source System | Target System |
|-----|-------------|--------------|
| System | {{SRC}} | {{TGT}} |
| MODSPEC | [REF: MODSPEC-{{MOD_A}}] | [REF: MODSPEC-{{MOD_B}}] |
| API Endpoint | {{ENDPOINT_SRC}} | {{ENDPOINT_TGT}} |
| Data Format | {{FORMAT_GỬI}} | {{FORMAT_NHẬN}} |
| Auth | {{AUTH_SRC}} | {{AUTH_TGT}} |

| # | Kiểm tra | ✅/❌ |
|---|----------|-------|
| 1 | Request format của Source khớp với API spec của Target? | |
| 2 | Response được xử lý đúng tại Source? | |
| 3 | Error handling 2 đầu đã được thiết kế? | |
| 4 | Auth nhất quán (cùng JWT/API key)? | |
| 5 | Data mapping: Enum values khớp nhau? | |

---

## MASTER REQUIREMENTS TRACEABILITY MATRIX

| PROB | BR | US | UC | FT | API | UI | TC | UAT |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| PROB-001 | BR-{{DOM}}-001 | US-{{MOD}}-001 | UC-{{MOD}}-001-01 | FT-{{MOD}}-001 | API-{{MOD}}-001 | UI-{{MOD}}-SCREEN | TC-{{MOD}}-001 | UAT-{{MOD}}-001 |

---

**Kết luận:** {{PASS/FAIL}} — Development có thể bắt đầu không?
