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
  - templates/p5-tech-design/MOBILE-MODSPEC-TEMPLATE.md (Mobile App — React Native / Flutter)
  - templates/p5-tech-design/FIRMWARE-MODSPEC-TEMPLATE.md (Embedded/Firmware)
  - templates/_shared-services/AUTH-SPEC-TEMPLATE.md     ← Shared Auth service spec
  - templates/_shared-services/NOTIFICATION-SPEC-TEMPLATE.md ← Shared Notification spec
  - templates/_shared-services/FILE-SERVICE-SPEC-TEMPLATE.md ← Shared File service spec
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự chọn module theo URS files, tự thiết kế API + DB + Components
2. **Tự giải quyết vấn đề** — tech-expert agent validate kiến trúc, tự quyết design decisions
3. **Báo cáo sau khi xong** — list MODSPEC files + API count + table count + ADRs
4. **User review** — cập nhật design nếu user muốn điều chỉnh
5. **Gợi ý bước tiếp** — `/mcv3:qa-docs`

---

## Khi nào dùng skill này

- Sau khi `/mcv3:requirements` hoàn thành (ít nhất 1 URS file)
- Cần thiết kế API, database schema từ requirements
- Cần architecture decisions cho tech stack
- **Mobile App project** (React Native / Flutter): Dùng MOBILE-MODSPEC-TEMPLATE thay vì MODSPEC-TEMPLATE
  - Phần "API Endpoints" → Giữ nguyên, nhưng thêm error handling cho mobile (401 refresh, offline fallback)
  - Phần "Database Schema" → Chuyển thành "Data Schema": API models (TypeScript/Dart) + Local storage (MMKV/Hive)
  - Phần "Component Design" → Thêm State Management (Zustand stores / Riverpod providers)
  - Thêm mới: "Screen Flows & Navigation", "Push Notifications", "Offline Behavior", "Auth Integration"
  - Không cần "Routes & Navigation" web style — thay bằng mobile navigation map (tabs, stack, drawer)
- **Embedded/Firmware project**: Dùng FIRMWARE-MODSPEC-TEMPLATE thay vì MODSPEC-TEMPLATE
  - Thiết kế: Pin assignment, peripheral config, RTOS tasks, state machine, communication protocol
  - Phần "API Design" → thay bằng "Communication Protocol" (MQTT topics, BLE GATT, UART packets)
  - Phần "Database Schema" → thay bằng "Memory Layout" (Flash partitions, RAM budget)
  - Phần "Component Design" → thay bằng "RTOS Task Design" (tasks, queues, semaphores)

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**URS chưa có:**
- Báo user: "Chưa tìm thấy URS trong {SYSTEM}/P1-REQUIREMENTS/. Chạy /mcv3:requirements trước."

**Tech stack chưa xác định:**
- Tự chọn default dựa trên domain và project scale — ghi DECISION (Confidence: MEDIUM)
  Ví dụ: Web/Backend → Node.js + Express + PostgreSQL, Mobile → React Native + Expo
- Tiếp tục thiết kế với default đó — không dừng hỏi user
- User review và điều chỉnh sau khi nhận Completion Report

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0 init | mc_status → mc_list → mc_load(PO) (3 sequential) | [mc_status ∥ mc_list ∥ mc_load(PO layer:2)] — 1 round | ~2 round-trip |
| Phase 0 mc_list | Gọi lại ở Phase 1 để biết modules | Reuse kết quả mc_list từ Phase 0 | 1 call / run |
| Phase 1a context load | mc_load(URS) → mc_load(DATA-DICT) (sequential) | [mc_load(URS layer:3) ∥ mc_load(DATA-DICT layer:2)] — 1 round | ~1 round-trip / module |
| DATA-DICTIONARY | Load lại mỗi module | Load 1 lần ở Phase 0/1, cache cho tất cả modules | N−1 calls |
| Phase 6 save | mc_save(MODSPEC) → mc_save(ARCH) → mc_save(DATA) → mc_validate → mc_dependency → mc_traceability | [mc_save(MODSPEC) ∥ mc_save(ARCH) ∥ mc_save(DATA)] → [mc_validate ∥ mc_dependency ∥ mc_traceability] | ~3 round-trip / module |

### Pre-Assign ID Ranges (Multi-Module Parallel Gen)

```
Khi có ≥ 2 modules → assign ID ranges TRƯỚC khi generate:
  Module 1 (AUTH):    API-{SYS}-001..029, TBL-{SYS}-001..009, COMP-{SYS}-001..009
  Module 2 (WH):      API-{SYS}-030..059, TBL-{SYS}-010..019, COMP-{SYS}-010..019
  Module 3 (SALES):   API-{SYS}-060..089, TBL-{SYS}-020..029, COMP-{SYS}-020..029

→ Cho phép generate content song song mà không conflict IDs
→ Save vẫn tuần tự (sequential) để tránh race condition trong MCP
```

### Cache Shared Data

```
DATA-DICTIONARY.md: Load 1 lần ở Phase 0 (layer:2), dùng cho tất cả modules
→ KHÔNG load lại mỗi module
→ Tiết kiệm: (N_modules − 1) mc_load calls

mc_list(P1-REQUIREMENTS): Gọi 1 lần ở Phase 0, reuse ở Phase 1 module detection
→ KHÔNG gọi mc_list lần 2 trong cùng session
```

### Quy tắc áp dụng

```
✅ Phase 0 parallel: [mc_status ∥ mc_list(P1-REQUIREMENTS) ∥ mc_load(PO layer:2)] — 1 round
✅ Phase 1a parallel: [mc_load(URS layer:3) ∥ mc_load(DATA-DICT layer:2)] — 1 round (module đầu)
   → Module sau: chỉ load URS (DATA-DICT đã cached)
✅ Reuse mc_list: Phase 0 → Phase 1 dùng cùng 1 kết quả mc_list
✅ Pre-assign API/TBL/COMP ID ranges khi gen ≥ 2 modules song song
✅ Phase 6 parallel saves: [mc_save(MODSPEC) ∥ mc_save(ARCH) ∥ mc_save(DATA-MODEL)] — 1 round
✅ Phase 6 parallel post-save: [mc_validate ∥ mc_dependency ∥ mc_traceability] — 1 round
   → mc_validate ERROR → fix → mc_save lại → re-validate (mc_dependency và mc_traceability vẫn giữ)
✅ No re-validation: Pre-Completion chỉ confirm "validate PASS tại Phase 6", không re-run
```

---

## Token Efficiency

**Chọn đúng template, không load tất cả:**
```
Web/Backend project    → Chỉ load MODSPEC-TEMPLATE.md
Mobile project         → Chỉ load MOBILE-MODSPEC-TEMPLATE.md
Embedded/Firmware      → Chỉ load FIRMWARE-MODSPEC-TEMPLATE.md
Multi-system với auth  → Load thêm AUTH-SPEC-TEMPLATE.md
```
- KHÔNG load tất cả templates cùng lúc
- Chỉ load references phù hợp với tech stack đã xác nhận
- Với module nhỏ (<5 endpoints): bỏ qua multi-system-design.md

**Dự án lớn (5+ modules):**
- Thiết kế từng module riêng biệt
- Checkpoint sau mỗi MODSPEC hoàn thành
- Không load toàn bộ URS cùng lúc — chỉ load URS của module đang làm (layer: 3)

---

## Phase 0 — Pre-Gate

```
// SPEED: Gộp mc_status + mc_list + mc_load vào 1 round song song
1. PARALLEL (3 calls đồng thời — 1 round duy nhất):
   - mc_status()  → xác nhận project và tech stack từ _config.json
   - mc_list({ subPath: "{SYSTEM}/P1-REQUIREMENTS" })  → liệt kê URS files (CACHE — reuse ở Phase 1)
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 })  → đọc tech context (CACHE)

   [Đồng thời load DATA-DICTIONARY nếu project đã có:]
   - mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 2 })  → CACHE cho tất cả modules

2. Tự xác định module order từ URS files (dùng kết quả mc_list từ bước 1, không gọi lại):
   - Core/Foundation modules trước (Auth, Master data)
   - Business logic modules theo dependency
   - Xử lý tất cả modules, không hỏi user chọn

5. [MANDATORY] Scale Detection — Đếm tổng số URS files:
   - Nếu ≥ 5 modules → CHẾ ĐỘ LARGE PROJECT (xem Batch Mode ở Phase 0 Safety Checkpoint)
     → Ghi log: "Large project: {N} modules detected — kích hoạt Batch Mode"
   - Nếu < 5 modules → Chế độ Standard, tiếp tục bình thường
```

**Nếu không có URS:**
```
⚠️ Chưa tìm thấy URS trong {SYSTEM}/P1-REQUIREMENTS/.
   Hãy chạy /mcv3:requirements trước.
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-tech-design-{MOD}",
  sessionSummary: "Chuẩn bị chạy /mcv3:tech-design cho module {MOD}",
  nextActions: ["Tiếp tục /mcv3:tech-design cho module {MOD} — Phase 1: Context Loading & Tech Stack"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu thiết kế kỹ thuật..."

**Large project batch processing (RISK-006) — áp dụng khi ≥5 modules:**
```
// Phát hiện large project: mc_list({ subPath: "{SYSTEM}/P1-REQUIREMENTS" }) → đếm URS files
// Nếu ≥5 URS files → kích hoạt Batch Mode:

1. Lưu BATCH CHECKPOINT trước Phase 1:
   mc_checkpoint({
     label: "pre-tech-design-batch",
     sessionSummary: "Large project: {N} modules cần thiết kế. Batch mode ON.",
     nextActions: ["Batch 1: {MOD1}, {MOD2}, {MOD3}"]
   })

2. Chia modules thành batches (tối đa 3 modules / batch):
   Batch 1: Layer 0 (Auth, Shared services) + Module cốt lõi đầu tiên
   Batch 2: Business logic modules
   Batch 3+: Integration, Reporting, Frontend modules

3. Checkpoint sau mỗi batch (ngoài per-module checkpoint):
   mc_checkpoint({ label: "batch-{N}-complete", ... })

4. KHÔNG load toàn bộ URS cùng lúc — chỉ load URS của batch hiện tại
```

---

## Phase 1 — Context Loading & Tech Stack Confirmation

### 1a. Load URS đầy đủ

```
// SPEED: Module đầu tiên → load URS song song với DATA-DICT (nếu chưa cached ở Phase 0)
// SPEED: Module sau → chỉ load URS (DATA-DICT đã cached từ Phase 0 hoặc module đầu)

// Module đầu tiên (DATA-DICT chưa cached):
PARALLEL:
  - mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 3 })
    // BLOCKING: NOT FOUND → ❌ DỪNG: "Chưa tìm thấy URS-{MOD}.md. Chạy /mcv3:requirements trước."
  - mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 2 })  // CACHE → dùng cho tất cả modules
    // NOT FOUND → ⚠️ WARNING: ghi DECISION "Thiếu DATA-DICTIONARY, dùng entity names từ URS"

// Module tiếp theo (DATA-DICT đã cached):
mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 3 })  // Chỉ load URS
```

**Load ARCHITECTURE context (nếu có):**
```
// WARNING-only — không dừng nếu chưa có
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/ARCHITECTURE.md", layer: 1 })
→ Nếu NOT FOUND → ⚠️ WARNING: "Chưa có ARCHITECTURE.md, sẽ tạo mới trong phase này"
→ Tiếp tục bình thường
```

### 1b. Extract Tech Stack từ docs

Từ PROJECT-OVERVIEW.md, extract tech stack và dùng trực tiếp — không hỏi xác nhận:

```
Đọc: _PROJECT/PROJECT-OVERVIEW.md (layer: 2) + _PROJECT/PROJECT-ARCHITECTURE.md (nếu có)
Extract: Backend, Database, Frontend, Cache, Message Queue
Nếu không tìm thấy → ghi DECISION: "Dùng tech stack mặc định [X] dựa trên domain {domain}"
Confidence: MEDIUM nếu dùng default
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

### 2c. API Design Decisions (Auto)

Sau khi draft xong toàn bộ API specs, tự quyết design decisions:

```
Pagination: Tự chọn offset-based (default cho hầu hết cases, dễ implement)
  → Ghi DECISION nếu chọn cursor-based (chỉ khi >1M records expected)
Versioning: /api/v1/ — ghi ADR về versioning strategy
Fields: Dựa trên TBL specs và AC trong URS — không cần hỏi thêm
Responses: Follow standard pattern từ api-design-patterns.md
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
// KHÔNG hiển thị nội dung MODSPEC lên chat — chỉ show tóm tắt sau mc_save

// SPEED: Save tất cả 3 files song song — 1 round
1. PARALLEL (3 saves đồng thời):
   - mc_save({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", documentType: "modspec" })
     → 📄 Đã lưu: MODSPEC-{MOD}.md — {N} APIs (API-{SYS}-001 → ...), {M} tables, {K} components
   - mc_save({ filePath: "{SYSTEM}/P2-DESIGN/ARCHITECTURE.md", documentType: "custom" })
     (chỉ khi đã tạo/cập nhật ARCHITECTURE.md trong phase này)
   - mc_save({ filePath: "{SYSTEM}/P2-DESIGN/DATA-MODEL.md", documentType: "custom" })
     (chỉ khi đã tạo/cập nhật DATA-MODEL.md trong phase này)

// SPEED: validate ∥ dependency ∥ traceability song song sau khi saves xong
2. PARALLEL (post-save — 3 calls đồng thời):
   - [BẮT BUỘC] mc_validate({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md" })
     // BLOCKING GATE (RISK-001) — phân loại kết quả (RISK-007):
     → ERROR   → ❌ DỪNG ngay. Fix lỗi → mc_save lại → [mc_validate ∥ mc_dependency ∥ mc_traceability] lại (tối đa 3 lần retry)
                Nếu vẫn ERROR sau 3 lần → báo user, không tiếp tục
     → WARNING → Format warning → FIX trước; Content warning → Ghi DECISION + tiếp tục
     → PASS    → ✅ Tiếp tục bước 3
   - mc_dependency({
       action: "register",
       source: "MODSPEC-{MOD}.md",
       dependsOn: ["URS-{MOD}.md", "DATA-DICTIONARY.md"]
     })
   - [BẮT BUỘC] mc_traceability({
       action: "link",
       items: [
         // FT → API links (tất cả FT-IDs có API)
         { from: "FT-WH-001", to: "API-ERP-001" },
         // FT → TBL links (tất cả FT-IDs có TBL)
         { from: "FT-WH-002", to: "TBL-ERP-001" },
         // FT → COMP links (tất cả FT-IDs có COMP)
         { from: "FT-WH-001", to: "COMP-ERP-001" },
         // COMP → TBL links (component phụ thuộc table nào)
         { from: "COMP-ERP-001", to: "TBL-ERP-001" },
         // ADR links (design decision ảnh hưởng API/TBL nào)
         { from: "ADR-ERP-001", to: "API-ERP-001" },
         // INT links — CHỈ khi có cross-system calls
         { from: "API-ERP-001", to: "INT-ERP-001" }
       ]
     })
     // Ghi chú: Thêm đủ tất cả items theo module thực tế — ví dụ trên chỉ minh họa pattern

// BẮT BUỘC per-module checkpoint (RISK-003) — lưu sau MỖI MODSPEC, kể cả khi còn modules khác
3. mc_checkpoint({
     label: "sau-modspec-{mod}",
     sessionSummary: "Thiết kế MODSPEC-{MOD}: {N} APIs, {M} tables, {K} components, {J} ADRs",
     nextActions: ["Tiếp tục module tiếp theo: {MOD-NEXT}" // hoặc "/mcv3:qa-docs nếu xong tất cả"]
   })
   → ✅ Per-module checkpoint đã lưu — có thể resume từ đây nếu session bị interrupt
   → Lặp lại Phase 1–6 cho module tiếp theo (nếu còn)
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

### Tầng 1 — Self-Verification

```
Format & IDs:
  ✓ API IDs: API-{SYS}-NNN format, sequential (không gap)
  ✓ TBL IDs: TBL-{SYS}-NNN format
  ✓ COMP IDs: COMP-{SYS}-NNN format
  ✓ Không có placeholder: "[fill in]", "TBD", "TODO" trong specs
  ✓ Mỗi API có: Method + Path + Auth + Request + Response (kể cả error responses)

Content Quality:
  ✓ API paths không trùng nhau (unique path + method combination)
  ✓ Response schemas nhất quán (tất cả dùng cùng 1 pattern: { success, data, meta })
  ✓ Tất cả FK columns trong TBL có cascade behavior ghi rõ
  ✓ Không có TBL thiếu created_at/updated_at
  ✓ Business Logic trong API spec không mâu thuẫn với BR từ BIZ-POLICY
```

### Tầng 2 — Cross-Document

```
  ✓ Tất cả FT-IDs từ URS có ≥ 1 API-ID hoặc COMP-ID tương ứng
  ✓ Không có API-ID nào thiếu "Origin FT" (orphan APIs)
  ✓ Entities từ DATA-DICTIONARY đã được map sang TBL-IDs
  ✓ Tất cả AC error cases từ URS có error response trong API spec tương ứng
  ✓ Tech stack trong MODSPEC khớp với tech stack trong PROJECT-OVERVIEW
```

### Tầng 3 — Quality Gate

```
✅ Tất cả FT-IDs đã có API hoặc TBL coverage
✅ Tất cả Entities từ DATA-DICTIONARY đã có TBL tương ứng
✅ Không có duplicate API paths
✅ ADR có ≥ 1 record (ít nhất 1 major design decision đã ghi)
✅ mc_validate PASS
✅ mc_traceability đã register: FT→API, FT→TBL, FT→COMP, COMP→TBL, ADR→API (và INT nếu có)
```

---

## Phase 6.5 — Pre-Completion Verification (BẮT BUỘC — RISK-004)

> Gọi EXPLICIT sau khi xong tất cả modules, TRƯỚC khi show Completion Report.

```
// Thực thi Pre-Completion Verification (xem section bên dưới) theo thứ tự:
1. Tầng 1 — Self-Verification: kiểm tra format & IDs
2. Tầng 2 — Cross-Document: kiểm tra FT coverage, orphan APIs
3. Tầng 3 — Quality Gate: tổng hợp

→ Nếu Quality Gate có item FAIL → fix trước khi tiếp tục Post-Gate
→ Nếu tất cả ✅ → tiếp tục Post-Gate
```

---

## Post-Gate

```
✅ Ít nhất 1 MODSPEC đã saved
✅ Tất cả FT có ít nhất 1 API-ID tương ứng
✅ Tất cả Entities có TBL-ID tương ứng
✅ Traceability đã link FT → API, FT → TBL, FT → COMP, ADR → API, COMP → TBL (và INT nếu có cross-system)
✅ Không có MODSPEC ERRORs từ mc_validate
✅ Architecture có ADR cho ít nhất 1 major decision

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:tech-design
═══════════════════════════════════════════════

✅ Đã tạo {N} MODSPEC files:
   1. MODSPEC-{MOD1}.md — {X} APIs (API-{SYS}-001 → ...), {Y} tables
   2. MODSPEC-{MOD2}.md — ...
   ARCHITECTURE.md — cập nhật
   DATA-MODEL.md   — cập nhật

⚠️ {D} quyết định đã tự xử lý (xem DECISION-LOG)
   ADRs: {K} Architecture Decision Records

🔜 Bước tiếp theo:
   → /mcv3:qa-docs (khuyến nghị — full pipeline)
   → /mcv3:code-gen (Micro/Small project — skip Phase 6)

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:qa-docs
═══════════════════════════════════════════════
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification:** Section này kiểm tra nhanh GIỮA các internal phases (phòng tránh lỗi lan sang bước tiếp). Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ để chuẩn bị Completion Report.

### Sau Phase 1 → trước Phase 2 (API Design):
- ✓ Tech stack đã xác định (hoặc DECISION ghi rõ default + confidence level)
- ✓ Đã load đủ URS: FT-IDs list sẵn sàng để map sang API endpoints
- ✓ Đã load DATA-DICTIONARY (layer: 2) để biết entity names và field types
- ✓ **Large project (3+ modules, multi-system):** Đã đọc multi-system-design.md — biết build layer order trước khi design API (Layer 0 = Auth, Layer 1 = Master data, ...)

### Sau Phase 2 → trước Phase 3 (Database Design):
- ✓ Tất cả FT-IDs từ URS đã có ≥ 1 API-ID mapping (không có orphan FT)
- ✓ API paths unique: không có 2 API cùng Method + Path
- ✓ Auth requirement đã ghi cho tất cả endpoints (không để trống "Auth: ?")
- ✓ **Multi-system:** Cross-system API calls đã identify với INT-{SYS}-NNN — ghi rõ system nào gọi system nào

### Sau Phase 3 → trước Phase 4 (Component Design):
- ✓ Tất cả Entities từ DATA-DICTIONARY đã có TBL-ID tương ứng (không thiếu bảng)
- ✓ FK references valid: mỗi FK column trỏ tới table.column tồn tại trong MODSPEC hiện tại hoặc module khác (ghi rõ module nào)
- ✓ Không có circular FK dependencies không có lý do (nếu có: ghi ADR giải thích)
- ✓ **Large project:** Tables của shared services (Auth, Notification, File) không bị duplicate trong multiple MODSPECs — chỉ define 1 lần ở SHARED-SERVICES hoặc module Auth

### Sau Phase 4 → trước Phase 5 (ADR):
- ✓ Mỗi component có trách nhiệm duy nhất (không có component "làm tất cả")
- ✓ Dependencies giữa components là one-way (không có circular dependency)
- ✓ Business Logic trong components consistent với BR-IDs từ BIZ-POLICY (không mâu thuẫn rule)

### Sau Phase 5 → trước Phase 6 (Save):
- ✓ Ít nhất 1 ADR cho major design decision (tech stack, DB engine, auth strategy, ...)
- ✓ ADR status ghi rõ "Accepted" hoặc "Proposed" (không để trống status)
- ✓ Không có design decision quan trọng "ẩn" trong spec mà không có ADR giải thích

### Output Readiness → `/mcv3:qa-docs` + `/mcv3:code-gen`:
- ✓ Tất cả FT-IDs đã có API-ID hoặc TBL-ID — qa-docs cần để viết test cases
- ✓ API spec đủ chi tiết: Request/Response schema rõ ràng — code-gen cần để sinh code chính xác
- ✓ TBL schema có đủ constraints và indexes — code-gen cần để sinh migration đúng
- ✓ **Large project (multi-system):** Cross-system APIs nhất quán: nếu System A gọi API System B, response schema phải khớp — kiểm tra ít nhất 1 cross-system call trước khi kết thúc
- ✓ **Large project:** Shared services (Auth, Notification, File) đã defined hoặc referenced — không để mỗi module tự implement riêng, gây duplicate

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
