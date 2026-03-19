# Format Conversion Guide — MCV3 Migration

Hướng dẫn convert từng format document cụ thể sang MCV3. Dùng bởi `/mcv3:migrate`.

---

## 1. BRD (Business Requirements Document) → MCV3

### Cấu trúc BRD điển hình

```
1. Executive Summary
2. Business Objectives
3. Stakeholders
4. Current State / Problem Statement
5. Proposed Solution
6. Functional Requirements
7. Non-Functional Requirements
8. Assumptions & Constraints
9. Glossary
```

### Mapping BRD → MCV3

| BRD Section | MCV3 Output | Notes |
|-------------|-------------|-------|
| Executive Summary | PROJECT-OVERVIEW: Background | Tóm tắt lại |
| Business Objectives | PROJECT-OVERVIEW: Goals + Success Metrics | Quantify nếu có thể |
| Stakeholders | PROJECT-OVERVIEW: Actors | Tách role và responsibility |
| Current State | PROCESS: AS-IS flows | Diagram nếu có |
| Problem Statement | EXPERT-LOG: PROB-IDs | 1 problem = 1 PROB-ID |
| Proposed Solution | PROJECT-OVERVIEW: Solution Summary | High-level only |
| Functional Requirements | URS: US + FT + AC | Convert từng requirement |
| NFR | URS: NFR section | Quantify thành số liệu |
| Assumptions | PROJECT-OVERVIEW: Assumptions | Giữ nguyên |
| Constraints | PROJECT-OVERVIEW: Constraints | Giữ nguyên |
| Glossary | DATA-DICTIONARY | Convert sang entity format |

### Conversion Example

**BRD Input:**
```
FR-001: The system shall allow warehouse staff to create goods receipt notes
when receiving inventory from suppliers. The system must validate that a
valid Purchase Order exists before allowing receipt creation.
```

**MCV3 Output:**
```markdown
### BR-WH-001: Purchase Order required for goods receipt
**Mô tả:** Mọi phiếu nhập kho phải tham chiếu đến một Purchase Order đã được duyệt
**Applies to:** Tất cả nhập kho từ nhà cung cấp
**Exception:** Emergency receipts được phép với Director approval
**Source:** BRD FR-001

### US-WH-001: Thủ kho muốn tạo phiếu nhập kho
**Role:** Là Thủ kho
**Want:** Tôi muốn tạo phiếu nhập kho khi nhận hàng từ nhà cung cấp
**So that:** Để ghi nhận hàng hóa vào kho và cập nhật tồn kho
**Priority:** Must
**Origin:** BR-WH-001, BRD FR-001

#### Acceptance Criteria
- AC-WH-001-01:
  Given: PO đã được duyệt và thủ kho đã chọn
  When: Điền đủ thông tin và submit
  Then: Phiếu nhập được tạo, tồn kho cập nhật

- AC-WH-001-02:
  Given: Không chọn PO
  When: Cố submit form
  Then: Hiện lỗi "Vui lòng chọn Purchase Order"
```

---

## 2. FRD (Functional Requirements Document) → MCV3

### Cấu trúc FRD điển hình

```
Per Module:
  FR-xxx: Functional Requirement
  UR-xxx: User Requirement
  UC-xxx: Use Case
  NFR-xxx: Non-Functional
```

### Mapping FRD → MCV3

```
FR-xxx (Functional Req) → FT-{MOD}-NNN (Functional Feature) trong URS
UR-xxx (User Req)      → US-{MOD}-NNN (User Story) trong URS
UC-xxx (Use Case)      → UC-{MOD}-NNN-XX (Use Case) trong URS
  UC Main Flow         → Happy path ACs
  UC Alternate Flow    → Additional ACs
  UC Exception Flow    → Error case ACs
NFR-xxx                → NFR-NNN trong URS
```

### Example: UC → User Story + ACs

**FRD Input (Use Case):**
```
UC-003: Create Purchase Order

Primary Actor: Purchasing Manager
Preconditions: User logged in with Purchasing role

Main Flow:
1. User selects "Create PO"
2. System shows blank PO form
3. User selects supplier
4. User adds line items (product, qty, price)
5. User submits PO
6. System validates and assigns PO number
7. System sends to Finance for approval

Alternate Flow: 4a. Invalid product code
  4a1. System shows "Product not found"
  4a2. User corrects or cancels

Exception: 7a. Finance system unavailable
  7a1. PO saved as pending, retry later
```

**MCV3 Output:**
```markdown
### US-PROC-001: Quản lý mua hàng muốn tạo Purchase Order
**Role:** Là Purchasing Manager
**Want:** Tôi muốn tạo Purchase Order cho nhà cung cấp
**So that:** Để chính thức hóa yêu cầu mua hàng và kiểm soát chi phí
**Priority:** Must
**Origin:** FRD UC-003

#### Use Cases
- UC-PROC-001-01: Tạo PO cơ bản
- UC-PROC-001-02: Xử lý mã sản phẩm không hợp lệ
- UC-PROC-001-03: Xử lý Finance system unavailable

#### Acceptance Criteria
- AC-PROC-001-01 (Main flow):
  Given: User có role Purchasing Manager, đã đăng nhập
  When: Điền đủ supplier, ít nhất 1 line item và submit
  Then: PO được tạo với PO number, gửi để Finance duyệt

- AC-PROC-001-02 (Alternate flow):
  Given: User nhập mã sản phẩm không tồn tại
  When: Submit form
  Then: Hiện lỗi "Mã sản phẩm không tìm thấy", form không submit

- AC-PROC-001-03 (Exception):
  Given: Finance system không available
  When: Submit PO
  Then: PO saved với status "Pending Finance Review", retry tự động sau 5 phút
```

---

## 3. User Stories (Informal/Jira/Trello) → MCV3

### Jira Story format

```
Title: As a warehouse manager, I want to view current inventory levels
Acceptance Criteria:
  - [ ] Show all SKUs with current qty
  - [ ] Filter by category
  - [ ] Export to Excel
Labels: warehouse, MVP
Story Points: 5
```

**MCV3 Output:**
```markdown
### US-WH-NEW: Thủ kho muốn xem tồn kho hiện tại
**Role:** Là Thủ kho
**Want:** Tôi muốn xem tồn kho hiện tại theo từng SKU
**So that:** Để quản lý hàng hóa và lên kế hoạch nhập hàng
**Priority:** Must (from Jira: MVP)
**Estimate:** 5 SP
**Source:** Jira PROJ-{ID}: "{original title}"

#### Acceptance Criteria (from Jira ACs, formalized):
- AC-WH-NEW-01:
  Given: Thủ kho đã đăng nhập
  When: Mở trang Inventory
  Then: Hiển thị bảng tất cả SKUs với số lượng tồn kho hiện tại

- AC-WH-NEW-02:
  Given: Đang xem trang Inventory
  When: Chọn filter theo Category
  Then: Danh sách lọc theo category đã chọn, cập nhật real-time

- AC-WH-NEW-03:
  Given: Đang xem trang Inventory (có hoặc không có filter)
  When: Click "Export"
  Then: Download file Excel với dữ liệu hiển thị hiện tại
```

---

## 4. Excel / Table Specs → MCV3

### Excel format mẫu

| ID | Feature Name | Description | Priority | Notes |
|----|-------------|-------------|----------|-------|
| F001 | Login | User login with email/password | High | Include 2FA |
| F002 | Dashboard | Show KPI overview | Medium | |
| F003 | Reports | Export PDF/Excel | Low | Future |

### Conversion script (manual process)

```
Row → US-{MOD}-NNN mapping:
  Column ID: F001 → US-{MOD}-001 (note original ID)
  Column Feature Name → US title (adapt to "As a user...")
  Column Description → US body + ACs
  Column Priority:
    High → Must
    Medium → Should
    Low → Could
    Future/Nice-to-have → Won't (this release)
  Column Notes → AC additions, TBD notes
```

---

## 5. Swagger/OpenAPI → MODSPEC

### OpenAPI 3.0 → MODSPEC API section

**OpenAPI Input:**
```yaml
/api/wh/receipts:
  post:
    summary: Create goods receipt
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [supplierId, poId, items]
            properties:
              supplierId: { type: string, format: uuid }
              poId: { type: string, format: uuid }
              items:
                type: array
                items:
                  properties:
                    skuId: { type: string }
                    quantity: { type: number, minimum: 1 }
    responses:
      '201':
        description: Receipt created
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Receipt'
      '400':
        description: Validation error
      '404':
        description: PO not found
```

**MCV3 Output:**
```markdown
### API-ERP-001: POST /api/wh/receipts
> **Migrated from:** Swagger /api/wh/receipts POST

**Method:** POST
**Path:** /api/wh/receipts
**Auth:** Bearer JWT (warehouse_staff role required)
**Source:** Migrated from Swagger 2.1.0

**Input:**
```json
{
  "supplierId": "uuid — required",
  "poId": "uuid — required, must exist and be approved",
  "items": [
    {
      "skuId": "string — required",
      "quantity": "number — required, minimum: 1"
    }
  ]
}
```

**Output (201):**
```json
{
  "receiptId": "uuid",
  "status": "draft",
  "createdAt": "ISO 8601"
}
```

**Errors:**
- 400: Validation error (missing fields, quantity < 1)
- 404: PO not found or not approved
- 403: User does not have warehouse_staff role

**Traceability:** FT-WH-001, US-WH-001
```

---

## 6. Database Schema → DATA-DICTIONARY + MODSPEC

### SQL Schema → DATA-DICTIONARY

**SQL Input:**
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);
```

**MCV3 Output — DATA-DICTIONARY:**
```markdown
### ENT-WH-001: Phiếu Nhập Kho (Receipt)
**Mô tả:** Ghi nhận việc nhập hàng vào kho từ nhà cung cấp
**Lifecycle:** draft → confirmed | draft → cancelled

| Field | Type | Bắt buộc | Mô tả |
|-------|------|---------|-------|
| id | UUID | Yes | Primary key — tự sinh |
| po_id | UUID FK | Yes | Tham chiếu Purchase Order đã duyệt |
| supplier_id | UUID FK | Yes | Nhà cung cấp |
| status | ENUM | Yes | draft/confirmed/cancelled |
| created_by | UUID FK | Yes | User tạo phiếu |
| created_at | TIMESTAMP | Yes | Thời điểm tạo |
| notes | TEXT | No | Ghi chú tùy chọn |
```

**MCV3 Output — MODSPEC DB section:**
```markdown
### TBL-ERP-001: receipts
**Entity:** ENT-WH-001
**Source:** Migrated from schema v1.0

| Column | Type | Nullable | Default | Index |
|--------|------|----------|---------|-------|
| id | UUID | No | gen_random_uuid() | PK |
| po_id | UUID | No | — | FK, Index |
| supplier_id | UUID | No | — | FK, Index |
| status | VARCHAR(20) | No | 'draft' | Index |
| created_by | UUID | No | — | FK |
| created_at | TIMESTAMPTZ | No | NOW() | Index |
| notes | TEXT | Yes | NULL | — |
```

---

## 7. Confluence / Notion → MCV3

### Conversion process

```
1. Copy page content as Markdown (hoặc paste text)
2. Identify document type (policy? requirements? design?)
3. Apply corresponding conversion template above
4. Handle Confluence-specific elements:
   - {expand} macros → Thêm vào phần cuối document
   - @mentions → Convert thành "Stakeholder: {name}"
   - Status badges → Plain text status
   - Tables → Markdown tables
   - Code blocks → ``` code blocks
   - Images → "[Image: description of image]"
```

### Notion-specific

```
Database views → Thường là requirements list
  → Map columns theo Excel format conversion

Notion Page → Document
  → Determine type → Apply conversion template
```

---

## 8. Tricky Conversions

### Implicit Requirements

Tìm requirements ẩn trong văn bản mô tả:

```
Source: "Nhân viên kho ghi thủ công vào sổ, cuối ngày tổng hợp báo cáo"

Hidden requirements:
→ FT-WH-NEW: Tạo phiếu nhập kho điện tử
→ FT-WH-NEW+1: Tổng hợp báo cáo nhập kho theo ngày
→ NFR-NEW: Dữ liệu real-time, không cần đợi cuối ngày
```

### Conflicting Requirements

```
Source A: "Nhập kho không cần approval"
Source B: "Mọi giao dịch kho cần approval của supervisor"

Resolution:
  BR-WH-CONFLICT: Áp dụng approval cho nhập kho > {threshold} đơn vị
  Note: "[CONFLICT RESOLVED] Dựa trên: [source A] vs [source B]
         Resolution confirmed by: {stakeholder}"
```

### Requirements với số liệu chưa rõ

```
Source: "Hệ thống phải nhanh và có thể chịu tải cao"

Convert sang:
  NFR-001: Response time — [TBD: Cần xác nhận với PM]
    Default: < 2 giây cho 95% requests
  NFR-002: Concurrent users — [TBD: Cần estimate từ business]
    Default: 100 concurrent users
  Note: "[ESTIMATE] Chưa confirm số liệu — cần business input"
```
