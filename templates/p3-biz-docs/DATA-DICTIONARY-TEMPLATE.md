# DATA-DICTIONARY
<!-- ============================================================
     TỪ ĐIỂN DỮ LIỆU CHUNG TOÀN DỰ ÁN
     Định nghĩa entities, thuật ngữ dùng chung giữa TẤT CẢ systems.
     Mỗi system có DATA-MODEL riêng → tham chiếu đến file này.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md, Expert sessions
       Key IDs: TERM-XXX, ENT-XXX, ENUM-XXX
       Update: Cập nhật xuyên suốt Phase 1-5
     ============================================================ -->

> **Phase:** Cấp dự án (cập nhật xuyên suốt)
> **Loại:** Tài liệu tham chiếu (Reference Document)
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Context & scope

### Tài liệu tham chiếu file này:
- Tất cả URS files (P1-REQUIREMENTS/)
- Tất cả MODSPEC files (P2-DESIGN/)
- Code files: `[REF: TERM-XXX]` cho type names

---

## 1. THUẬT NGỮ NGHIỆP VỤ (Business Glossary)

<!-- AI và team phải dùng đúng từ này trong mọi tài liệu và code.
     Format tham chiếu: [REF: TERM-XXX] -->

| Mã | Thuật ngữ | Tiếng Anh | Định nghĩa | Ví dụ / Ghi chú |
|----|----------|-----------|------------|-----------------|
| TERM-001 | {{THUẬT_NGỮ}} | {{ENGLISH}} | {{ĐỊNH_NGHĨA}} | {{VÍ_DỤ}} |

---

## 2. MASTER ENTITIES (ENT-XXX — Entities dùng chung)

<!-- Entity được nhiều systems dùng.
     Format tham chiếu: [REF: ENT-XXX] hoặc [REF: ENT-XXX.field] -->

### ENT-001: {{ENTITY_NAME}}

**Mô tả:** {{MÔ_TẢ_ENTITY}}
**Owner system:** {{SYS_CODE}} (hệ thống quản lý master data)
**Read-only systems:** {{DANH_SÁCH}}

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-001.id | id | UUID | Có | ID duy nhất | ALL |
| ENT-001.{{field}} | {{name}} | {{type}} | {{required}} | {{desc}} | {{systems}} |

---

## 3. MASTER ENUMS (ENUM-XXX — Danh mục dùng chung)

<!-- Enum values được nhiều systems dùng chung.
     Code phải dùng đúng value này, không hardcode string.
     Format: [REF: ENUM-XXX] -->

### ENUM-001: {{ENUM_NAME}}

**Mô tả:** {{MÔ_TẢ}}
**Dùng bởi:** {{DANH_SÁCH_SYSTEMS/MODULES}}

| Value | Nhãn tiếng Việt | Nhãn tiếng Anh | Dùng khi | Hệ thống |
|-------|----------------|----------------|---------|---------|
| {{value}} | {{VI_LABEL}} | {{EN_LABEL}} | {{CONDITION}} | {{SYS}} |

---

## 4. DATA OWNERSHIP (Nguồn dữ liệu chính)

<!-- Quy định system nào là "master" — tránh data conflict -->

| Entity | Owner System | Read-only Systems | Sync Method | Sync Frequency |
|--------|------------|------------------|------------|---------------|
| {{ENTITY}} | {{OWNER}} | {{READERS}} | API / Event-driven / Batch | {{FREQ}} |

---

## 5. NAMING CONVENTIONS

<!-- AI phải tuân thủ convention này khi tạo code -->

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Database table | snake_case, plural | `sales_orders`, `product_items` |
| API endpoint | kebab-case, REST | `/api/v1/sales-orders/{id}` |
| Variable/field | camelCase | `orderId`, `totalAmount` |
| Enum value | UPPER_SNAKE_CASE | `ORDER_STATUS_CONFIRMED` |
| File/folder | kebab-case | `sales-order.service.ts` |
