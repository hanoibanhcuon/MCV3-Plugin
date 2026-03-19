# Tech-Design Skill — `/mcv3:tech-design`

## Mục đích

Chuyển **URS (Phase 4)** thành **Module Specification (MODSPEC)** — Phase 5.

Với mỗi module, tạo file `MODSPEC-{MOD}.md` — tài liệu all-in-one gồm:
- **API Specifications** với ID `API-{SYS}-NNN`
- **Database Schema** với ID `TBL-{SYS}-NNN`
- **Component Design** với ID `COMP-{SYS}-NNN`
- **Integration Points** với ID `INT-{SYS}-NNN`
- **Architecture Decision Records (ADR)** cho các quyết định kỹ thuật quan trọng

Sử dụng **Tech Expert Agent** để validate kiến trúc, scalability, tech stack.

---

## DEPENDENCY MAP

```
Requires:
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md (Phase 4 — bắt buộc)
  - _PROJECT/PROJECT-OVERVIEW.md (Phase 1 — tech stack context)
  - _PROJECT/DATA-DICTIONARY.md (Phase 3 — entities, terms)
Produces:
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md (all-in-one design)
  - {SYSTEM}/P2-DESIGN/ARCHITECTURE.md (system architecture)
  - {SYSTEM}/P2-DESIGN/DATA-MODEL.md (database ERD, cập nhật)
Enables: /mcv3:qa-docs (Phase 6), /mcv3:code-gen (Phase 7)
Agents: tech-expert, ux-expert
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_checkpoint, mc_traceability, mc_dependency
References:
  - skills/tech-design/references/api-design-patterns.md
  - skills/tech-design/references/data-modeling-guide.md
  - skills/tech-design/references/multi-system-design.md ← Multi-system dependency analysis
  - templates/p5-tech-design/MODSPEC-TEMPLATE.md
  - templates/p5-tech-design/ARCHITECTURE-TEMPLATE.md
  - templates/p5-tech-design/DATA-MODEL-TEMPLATE.md
  - templates/p5-tech-design/FIRMWARE-MODSPEC-TEMPLATE.md (Embedded/Firmware)
  - templates/_shared-services/AUTH-SPEC-TEMPLATE.md     ← Shared Auth service spec
  - templates/_shared-services/NOTIFICATION-SPEC-TEMPLATE.md ← Shared Notification spec
  - templates/_shared-services/FILE-SERVICE-SPEC-TEMPLATE.md ← Shared File service spec
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:requirements` hoàn thành (ít nhất 1 URS file)
- Cần thiết kế API, database schema từ requirements
- Cần architecture decisions cho tech stack
- **Embedded/Firmware project**: Dùng FIRMWARE-MODSPEC-TEMPLATE thay vì MODSPEC-TEMPLATE
  - Thiết kế: Pin assignment, peripheral config, RTOS tasks, state machine, communication protocol
  - Phần "API Design" → thay bằng "Communication Protocol" (MQTT topics, BLE GATT, UART packets)
  - Phần "Database Schema" → thay bằng "Memory Layout" (Flash partitions, RAM budget)
  - Phần "Component Design" → thay bằng "RTOS Task Design" (tasks, queues, semaphores)

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project và tech stack từ _config.json
2. mc_list({ subPath: "{SYSTEM}/P1-REQUIREMENTS" }) → liệt kê URS files có sẵn
3. mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 }) → đọc tech context
4. Hỏi user: "Bạn muốn design tech cho module nào?
   [List URS files đã có]"
```

**Nếu không có URS:**
```
⚠️ Chưa tìm thấy URS trong {SYSTEM}/P1-REQUIREMENTS/.
   Hãy chạy /mcv3:requirements trước.
```

---

## Phase 1 — Context Loading & Tech Stack Confirmation

### 1a. Load URS đầy đủ

```
mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 3 })
mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 2 })
```

### 1b. Xác nhận Tech Stack

Từ PROJECT-OVERVIEW.md, extract tech stack. Hỏi user xác nhận:

```
"Tôi thấy project dùng tech stack:
- Backend: {VD: Node.js + TypeScript + Express}
- Database: {VD: PostgreSQL}
- Frontend: {VD: React + TypeScript}
- Cache: {VD: Redis}
- Message Queue: {VD: RabbitMQ / không có}

Đây đúng không? Hay có thay đổi gì?"
```

### 1c. Invoke Tech Expert Agent

```
Spawn tech-expert agent với:
- URS content
- Tech stack info
- Project context

→ Tech Expert trả về:
  - Architecture recommendations
  - Scalability considerations
  - Potential technical risks
  - API design suggestions
  - Database design suggestions
```

---

## Phase 2 — API Design

### 2a. Extract endpoints từ Functional Requirements

Với mỗi FT trong URS, xác định API endpoint(s) cần có:

```
FT-WH-001: Tạo phiếu nhập kho
  → POST /api/v1/warehouse/receipts
  → API-ERP-001

FT-WH-002: Lấy danh sách phiếu nhập kho
  → GET /api/v1/warehouse/receipts
  → API-ERP-002

FT-WH-003: Lấy chi tiết phiếu nhập kho
  → GET /api/v1/warehouse/receipts/:id
  → API-ERP-003
```

### 2b. API Specification Format

```markdown
### API-{SYS}-NNN: {Tên endpoint}

**Method:** POST / GET / PUT / DELETE / PATCH
**Path:** /api/v{version}/{resource}/{sub-resource}
**Auth:** Bearer JWT / API Key / None
**Origin FT:** FT-{MOD}-NNN

**Request:**
\`\`\`typescript
// Headers
Authorization: Bearer {token}
Content-Type: application/json

// Body (POST/PUT)
{
  field1: string;       // Mô tả, required
  field2: number;       // Mô tả, optional
  field3: EnumType;     // Mô tả, enum: ["val1", "val2"]
}

// Query Params (GET)
?page=1&limit=20&sort=created_at:desc&filter[status]=active
\`\`\`

**Response — 200 OK:**
\`\`\`typescript
{
  success: true,
  data: {
    id: string;           // UUID
    // ... other fields
  },
  meta?: {
    page: number,
    total: number
  }
}
\`\`\`

**Response — Errors:**
| Status | Error Code | Khi nào |
|--------|-----------|---------|
| 400 | VALIDATION_ERROR | Input không hợp lệ |
| 401 | UNAUTHORIZED | Chưa auth |
| 403 | FORBIDDEN | Không có quyền |
| 404 | NOT_FOUND | Resource không tồn tại |
| 409 | CONFLICT | Duplicate / conflict |
| 500 | SERVER_ERROR | Lỗi server |

**Business Logic:**
- {Mô tả logic xử lý}
- {Validation rules}
- {Side effects: emit event, update cache, ...}

**Origin AC:** AC-{MOD}-NNN-01, AC-{MOD}-NNN-02
```

### 2c. Guided API Review

Sau khi draft xong toàn bộ API specs:

```
"📡 Tôi đã thiết kế {N} endpoints cho module {MOD}.

Review nhanh:
1. API-ERP-001: POST /receipts — Tạo phiếu nhập kho
   - Request có đủ fields chưa?
   - Response trả về những gì sau khi tạo?

2. Pagination: Tôi dùng cursor-based hay offset-based?
   (Cursor tốt hơn cho large datasets, offset dễ implement hơn)

3. Versioning: /api/v1/ — Khi nào cần v2?"
```

---

## Phase 3 — Database Design

### 3a. Extract entities từ URS + DATA-DICTIONARY

Mỗi Entity từ Data Dictionary → Database Table:

```
ENT-001: Phiếu nhập kho (GoodsReceiptNote)
  → TBL-ERP-001: grn (goods_receipt_notes)
  → Fields: id, po_id, grn_number, status, created_by, created_at, ...

ENT-002: Chi tiết phiếu nhập kho (GRN Line Item)
  → TBL-ERP-002: grn_items (grn_line_items)
  → Fields: id, grn_id, product_id, lot_number, quantity, unit_cost, ...
```

### 3b. Table Specification Format

```markdown
### TBL-{SYS}-NNN: {table_name}

**Tên hiển thị:** {Tên tiếng Việt}
**Origin Entity:** ENT-NNN
**Engine:** InnoDB (MySQL) / Heap (PostgreSQL)

| Column | Type | Nullable | Default | Index | Mô tả |
|--------|------|----------|---------|-------|-------|
| id | UUID/BIGINT | NOT NULL | gen_random_uuid() | PK | Primary key |
| {field} | VARCHAR(255) | NOT NULL | - | UK | Mô tả |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | IX | Ngày tạo |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | IX | Ngày cập nhật |
| deleted_at | TIMESTAMPTZ | NULL | NULL | IX | Soft delete |

**Foreign Keys:**
- {column} → {referenced_table}.id (ON DELETE CASCADE/RESTRICT/SET NULL)

**Indexes:**
- idx_{table}_{columns}: ({column1}, {column2}) — Lý do cần index

**Constraints:**
- {constraint_name}: CHECK ({condition})

**Notes:**
- {Lưu ý đặc biệt về thiết kế}
```

### 3c. Relationships & ERD

```markdown
## ERD — Quan hệ giữa các bảng

\`\`\`
purchase_orders (1) ──── (N) grn (GoodsReceiptNote)
grn (1) ──── (N) grn_items
grn_items (N) ──── (1) products
grn_items (N) ──── (1) inventory_lots
products (N) ──── (1) product_categories
\`\`\`

**Giải thích:**
- 1 PO có thể có nhiều GRN (partial receipts)
- 1 GRN có nhiều line items
- ...
```

### 3d. Migration Strategy

```markdown
## Migration Strategy

**Approach:** {Schema-first / Code-first / Flyway / Liquibase}

**Migration files:**
- V001__create_grn_tables.sql
- V002__add_grn_indexes.sql

**Rollback plan:**
- Mỗi migration có rollback script tương ứng
```

---

## Phase 4 — Component Design

### 4a. Backend Components

```markdown
### COMP-{SYS}-NNN: {ServiceName}

**Loại:** Service / Repository / Controller / Middleware
**Trách nhiệm:** {1 câu mô tả trách nhiệm duy nhất}
**Dependencies:**
- {COMP-SYS-NNN}: {ServiceName} — {lý do dependency}

**Interface:**
\`\`\`typescript
interface {ServiceName} {
  create(dto: CreateDto): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
  // ...
}
\`\`\`

**Business Logic Notes:**
- {Quy tắc quan trọng trong service này}
```

### 4b. Frontend Components (nếu có UI)

```markdown
### COMP-{SYS}-NNN: {ComponentName}

**Loại:** Page / Feature / Shared / Layout
**Route:** /path/to/page (nếu là Page component)
**Props:** {interface definition}
**State:** {local state, global state}
**Events:** {events emitted / callbacks}
```

---

## Phase 5 — Architecture Decision Records

Với mỗi quyết định kỹ thuật quan trọng:

```markdown
### ADR-{SYS}-NNN: {Tiêu đề quyết định}

**Ngày:** {date}
**Status:** Proposed / Accepted / Deprecated

**Bối cảnh:**
{Vấn đề hoặc yêu cầu dẫn đến quyết định này}

**Các phương án đã xem xét:**
1. {Option A}: {Pros/Cons}
2. {Option B}: {Pros/Cons}
3. {Option C}: {Pros/Cons}

**Quyết định:** {Chọn Option X}

**Lý do:**
{Giải thích chi tiết}

**Hệ quả:**
- Positive: {lợi ích}
- Negative: {trade-offs}
- Neutral: {những điều thay đổi nhưng không tốt/xấu hơn}
```

---

## Phase 6 — Save & Validate

```
1. mc_save({
     filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md",
     documentType: "modspec"
   })

// Lưu ARCHITECTURE.md nếu đã tạo trong phase này (lần đầu hoặc cập nhật)
2. mc_save({
     filePath: "{SYSTEM}/P2-DESIGN/ARCHITECTURE.md",
     documentType: "custom"
   })

// Lưu DATA-MODEL.md nếu đã tạo/cập nhật ERD
3. mc_save({
     filePath: "{SYSTEM}/P2-DESIGN/DATA-MODEL.md",
     documentType: "custom"
   })

4. mc_validate({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md" })
   → Xử lý issues

5. mc_dependency({
     action: "register",
     source: "MODSPEC-{MOD}.md",
     dependsOn: ["URS-{MOD}.md", "DATA-DICTIONARY.md"]
   })

6. mc_traceability({
     action: "link",
     items: [
       { from: "FT-WH-001", to: "API-ERP-001" },
       { from: "FT-WH-002", to: "TBL-ERP-001" }
     ]
   })

7. mc_checkpoint({
     label: "sau-modspec-{mod}",
     sessionSummary: "Thiết kế MODSPEC-{MOD}: {N} APIs, {M} tables",
     nextActions: ["Tiếp tục module khác hoặc /mcv3:qa-docs"]
   })
```

---

## Post-Gate

```
✅ Ít nhất 1 MODSPEC đã saved
✅ Tất cả FT có ít nhất 1 API-ID tương ứng
✅ Tất cả Entities có TBL-ID tương ứng
✅ Traceability đã link FT → API và Entity → TBL
✅ Không có MODSPEC ERRORs từ mc_validate
✅ Architecture có ADR cho ít nhất 1 major decision

→ "✅ Phase 5 Technical Design hoàn thành!
   {N} MODSPEC files, {X} APIs, {Y} tables thiết kế.
   Tiếp theo: /mcv3:qa-docs (đầy đủ — khuyến nghị)
   Hoặc: /mcv3:code-gen trực tiếp (chỉ cho Micro/Small project, skip Phase 6)."
```

---

## Quy tắc thiết kế

```
API-FIRST: Thiết kế API contract trước, implement sau
SINGLE RESPONSIBILITY: Mỗi endpoint 1 trách nhiệm
CONSISTENT NAMING: GET/POST/PUT/DELETE đúng HTTP semantics
VERSIONED: /api/v1/ để backward compatible
TYPED: TypeScript interfaces cho tất cả request/response
INDEXED: Mọi FK và filter field đều có index
SOFT-DELETE: Dùng deleted_at thay vì xóa thật
AUDITABLE: created_at, updated_at, created_by bắt buộc
TRACEABLE: API-ID → FT-ID → US-ID liên kết đầy đủ
```
