# Quick Start — Developer / Tech Lead

Hướng dẫn nhanh cho Developer và Tech Lead sử dụng MCV3.

---

## Tổng quan

MCV3 tự động hóa phần **documentation-heavy** trong software development:

```
Input: Ý tưởng / Business requirements (ngôn ngữ tự nhiên)
Output: Bộ tài liệu kỹ thuật chuẩn + Code scaffolding
```

Developer tập trung vào **logic phức tạp** — MCV3 lo phần template, formal IDs, và traceability.

---

## Setup nhanh (5 phút)

### 1. Copy plugin vào project

```bash
cp -r mcv3-devkit/ /path/to/your/project/
cd /path/to/your/project/
```

### 2. Build MCP Server

```bash
cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build
```

### 3. Cấu hình MCP

Tạo/cập nhật `.mcp.json` ở root project:

```json
{
  "mcpServers": {
    "mcv3-project-memory": {
      "command": "node",
      "args": ["mcv3-devkit/mcp-servers/project-memory/dist/index.js"],
      "env": {
        "MCV3_PROJECT_ROOT": "."
      }
    }
  }
}
```

### 4. Verify

```
mc_status()
→ "No projects found. Use mc_init_project to create one."
```

Setup xong!

---

## Workflow cho Developer

### Scenario A: Dự án mới từ đầu

```
1. /mcv3:discovery      → 30 phút interview, tạo PROJECT-OVERVIEW
2. /mcv3:expert-panel   → AI expert analysis (optional nhưng recommended)
3. /mcv3:biz-docs       → Tạo business rules (skip nếu đã có)
4. /mcv3:requirements   → Tạo URS per module (important!)
5. /mcv3:tech-design    → MODSPEC — đây là input chính cho code gen
6. /mcv3:code-gen       → Generate scaffolding từ MODSPEC
7. Implement logic      → Developer fill in business logic
8. /mcv3:verify         → Check traceability trước PR
```

### Scenario B: Có requirements, cần tech design

```
1. mc_init_project      → Tạo project structure
2. Upload existing docs → mc_save({ filePath: "...", content: "..." })
3. /mcv3:tech-design    → Design từ existing requirements
4. /mcv3:code-gen       → Generate scaffolding
```

### Scenario C: Thay đổi requirements giữa dự án

```
1. /mcv3:change-manager → Impact analysis + cập nhật docs
2. Review code changes  → Xem gợi ý code cần update
3. /mcv3:verify         → Re-verify sau thay đổi
```

---

## MODSPEC — All-in-One Spec

MODSPEC là file quan trọng nhất cho developer. Cấu trúc:

```markdown
# MODSPEC-WH: Warehouse Module

## DEPENDENCY MAP
Requires: URS-WH.md, DATA-DICTIONARY.md
Enables: TEST-WH.md, src/erp/wh/

## 1. Business Rules
BR-WH-001: Kiểm soát nhập kho
  Validation: quantity > 0, supplier exists, PO matches

## 2. API Endpoints
### API-ERP-001: POST /api/wh/receipts
  Input: { supplierId, poId, items: [{skuId, qty, unitPrice}] }
  Output: { receiptId, status, timestamp }
  Auth: warehouse_staff role
  Errors: 400 (invalid), 404 (PO not found), 409 (qty mismatch)

## 3. Database Tables
### TBL-ERP-001: receipts
  - id: UUID PK
  - po_id: UUID FK → purchase_orders
  - created_by: UUID FK → users
  - status: ENUM('draft', 'confirmed', 'cancelled')
  - created_at: TIMESTAMPTZ

## 4. Components (Frontend nếu có)
### COMP-WH-001: ReceiptForm
  Props: { poId, onSubmit }
  State: { items, loading, errors }

## 5. Architecture Decisions
ADR-WH-001: Dùng FIFO cho stock valuation
```

AI đọc MODSPEC này → code scaffolding đúng structure, đúng types.

---

## Code Gen Output Structure

```
src/
└── {sys}/
    └── {mod}/
        ├── controllers/
        │   └── {mod}.controller.ts    ← Routes + HTTP handling
        ├── services/
        │   └── {mod}.service.ts       ← Business logic
        ├── repositories/
        │   └── {mod}.repository.ts    ← DB queries
        ├── dtos/
        │   ├── create-{mod}.dto.ts
        │   └── update-{mod}.dto.ts
        └── __tests__/
            └── {mod}.service.test.ts  ← Test stubs

db/
└── migrations/
    └── V{NNN}__create_{table}.sql
```

Mỗi file có REQ-ID comment header:
```typescript
/**
 * @module {mod}
 * @req-ids US-WH-001, FT-WH-001, FT-WH-002
 * @api-ids API-ERP-001, API-ERP-002
 * @tbl-ids TBL-ERP-001
 */
```

---

## Smart Context Layering — Tiết kiệm tokens

Khi context window đầy, dùng layers thay vì load toàn bộ:

```typescript
// Đầu session — nắm bối cảnh nhanh
mc_load({ projectSlug: "my-project", filePath: "_PROJECT/_key-facts.md", layer: 0 })
// → ~500 bytes, biết ngay: project, phase, systems

// Cần hiểu dependencies
mc_load({ filePath: "ERP/P2-DESIGN/MODSPEC-WH.md", layer: 1 })
// → Chỉ đọc DEPENDENCY MAP section (~200 bytes)

// Review nội dung
mc_load({ filePath: "ERP/P1-REQUIREMENTS/URS-WH.md", layer: 2 })
// → Sections chính, không có code blocks dài (~5KB)

// Cần full detail để code
mc_load({ filePath: "ERP/P2-DESIGN/MODSPEC-WH.md", layer: 3 })
// → Toàn bộ file
```

---

## MCP Tools Developer hay dùng

### Session Management
```
mc_checkpoint({ label: "sau-api-design", nextActions: ["Làm MODSPEC-HR tiếp"] })
mc_resume({ projectSlug: "my-project" })  // Session mới — load lại context
```

### Search & Compare
```
mc_search({ query: "BR-WH-001" })        // Tìm ID này có ở đâu
mc_compare({ fileA: "MODSPEC-WH.md", fileB: "@snapshot:v1" })  // Xem diff
```

### Safety
```
mc_snapshot({ label: "before-big-refactor" })
mc_rollback({ snapshotName: "..." })  // Nếu cần rollback
```

### Analysis
```
mc_impact_analysis({ changeId: "BR-WH-001", changeDescription: "..." })
mc_traceability({ action: "query", queryId: "US-WH-001" })
```

---

## Tips cho Developer

### Tip 1: MODSPEC trước, code sau
Không code trước khi có MODSPEC hoàn chỉnh. MODSPEC là "contract" giữa requirements và code.

### Tip 2: REQ-ID comment là bắt buộc
```typescript
// ❌ Sai
export class WarehouseService {}

// ✅ Đúng
// @req-ids FT-WH-001, FT-WH-002
export class WarehouseService {}
```

### Tip 3: Code gen chỉ là scaffold
Code gen tạo skeleton — bạn cần fill in business logic. Coi như TypeScript boilerplate generator cực nhanh.

### Tip 4: Checkpoint thường xuyên
Sau mỗi phase/module quan trọng, `mc_checkpoint` để resume được sau khi đóng Claude.

### Tip 5: Dùng mc_search để tìm IDs
Không nhớ một BR hay FT nào ở đâu? `mc_search({ query: "BR-WH" })` tìm tất cả.
