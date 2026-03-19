# Feature Extension Guide — MCV3 Evolution

Hướng dẫn chi tiết cách extend features trong các scenarios phổ biến.

---

## 1. Extension Scenarios

### Scenario A: Thêm Sub-Feature vào Module

**Context:** Module WH đã có "Nhập kho". Muốn thêm "Barcode Scanning".

**Step 1: Phân tích integration points**
```
Existing: US-WH-001 (Tạo phiếu nhập kho)
          API-ERP-001 (POST /receipts)
          TBL-ERP-001 (receipts table)

New feature hooks into:
  US-WH-001 → Thêm AC mới về barcode
  API-ERP-001 → Thêm barcode field trong items[]
  TBL-ERP-001 → Thêm barcode column
```

**Step 2: Extend URS**
```markdown
## ── v1.1 ADDITIONS ──────────────────
### US-WH-NEW: Thủ kho muốn scan barcode khi nhập kho

[New User Story]

### Extensions to US-WH-001
**Additional AC (v1.1):**
- AC-WH-001-NEW: Given barcode scanner connected, When scan item, Then auto-fill SKU field
## ── END v1.1 ─────────────────────────
```

**Step 3: Extend MODSPEC**
```markdown
## ── v1.1 ADDITIONS ──────────────────
### API-ERP-001 Extension (v1.1)
  items[].barcode: string? (optional, for barcode-scan flow)

### ADR-WH-NEW: Barcode validation strategy
  Decision: Validate via GS1-128 standard
  Reason: Industry standard, library available
## ── END v1.1 ─────────────────────────
```

---

### Scenario B: Thêm Module mới vào System

**Context:** ERP đã có WH, SALES. Muốn thêm HR module.

**Dependencies check:**
```
HR module needs:
  - DATA-DICTIONARY.md (entities: Employee, Department, Position)
  - BIZ-POLICY-HR.md (existing hoặc tạo mới)

HR module enables:
  - URS-HR.md
  - MODSPEC-HR.md
  - Integration với ERP-SALES (employee commission)
```

**Process:**
```
1. Update DATA-DICTIONARY.md với HR entities
2. Tạo BIZ-POLICY-HR.md (nếu chưa có)
3. Chạy /mcv3:requirements → tạo URS-HR.md
4. Chạy /mcv3:tech-design → tạo MODSPEC-HR.md
5. Update SYSTEM-INDEX.md với HR module info
6. Register dependencies:
   mc_dependency({
     action: "register",
     source: "MODSPEC-HR.md",
     dependsOn: ["DATA-DICTIONARY.md", "MODSPEC-SALES.md"]
   })
```

---

### Scenario C: Thêm System mới

**Context:** ERP system đã có. Muốn thêm WEB portal cho khách hàng.

**Architecture considerations:**
```
WEB system cần:
  - API gateway để call ERP APIs
  - Authentication riêng hoặc dùng chung?
  - Data sharing strategy: direct DB vs API-only

Integration contracts:
  INT-ERP-WEB-001: WEB gọi ERP qua REST APIs
  INT-ERP-WEB-002: Shared user authentication (JWT)
  INT-ERP-WEB-003: Event-driven notifications
```

**Process:**
```
1. Update PROJECT-OVERVIEW.md: thêm WEB system
2. Update PROJECT-ARCHITECTURE.md: thêm system boundary diagram
3. Tạo INTEGRATION-MAP.md: ERP ↔ WEB contracts
4. Chạy /mcv3:requirements cho WEB
5. Chạy /mcv3:tech-design cho WEB
6. Update MASTER-INDEX.md
```

---

### Scenario D: MVP → Full Product

**Context:** MVP có 3 core modules. Muốn expand thành full product.

**Gap Analysis approach:**
```
1. mc_list() → danh sách documents hiện có
2. So sánh với full product scope (từ EXPERT-LOG.md)
3. Liệt kê gaps:

Currently have:
  ✅ WH (basic inventory)
  ✅ SALES (basic orders)
  ✅ FINANCE (basic reports)

Missing for full product:
  ❌ HR (employee management)
  ❌ PROCUREMENT (purchase management)
  ❌ CRM (customer management)
  ❌ BI (analytics dashboard)
  ⚠️ WH (advanced: barcode, batch import, multi-warehouse)
  ⚠️ FINANCE (advanced: multi-currency, tax reporting)
```

**Prioritization framework:**
```
Priority 1 — Business Critical:
  PROCUREMENT: Cannot operate without PO management
  CRM: Customer data is core asset

Priority 2 — Operational Efficiency:
  HR: Manual payroll is bottleneck
  WH advanced: Barcode saves 3hr/day of warehouse staff

Priority 3 — Analytics & Reporting:
  BI: Nice to have but not blocking
```

---

## 2. Integration Patterns

### Pattern 1: API Extension

Extending existing API endpoint:

```typescript
// v1: POST /api/wh/receipts
interface CreateReceiptDto {
  supplierId: string;
  poId: string;
  items: ReceiptItem[];
}

// v1.1: Same endpoint, backward compatible
interface CreateReceiptDto {
  supplierId: string;
  poId: string;
  items: ReceiptItemV1_1[];  // Extended item
  scanMode?: 'manual' | 'barcode';  // NEW optional field
}

interface ReceiptItemV1_1 extends ReceiptItem {
  barcode?: string;  // NEW optional field
}
```

### Pattern 2: Event-Driven Extension

Thêm tính năng mà không thay đổi existing code:

```typescript
// Existing: ReceiptService.create() fires an event
this.eventEmitter.emit('receipt.created', receipt);

// New: Subscribe to event (separate service)
@OnEvent('receipt.created')
async handleReceiptCreated(receipt: Receipt) {
  // New behavior: Send notification, Update analytics, etc.
}
```

### Pattern 3: Façade/Adapter Pattern

Khi cần thêm integration với external system:

```typescript
// Existing: Direct database access
class InventoryRepository {
  findBySku(sku: string) { ... }
}

// New: Add façade for barcode scanning integration
class BarcodeInventoryFacade {
  constructor(
    private inventoryRepo: InventoryRepository,
    private barcodeService: BarcodeService
  ) {}

  async findByBarcode(barcode: string) {
    const sku = await this.barcodeService.decode(barcode);
    return this.inventoryRepo.findBySku(sku);
  }
}
```

---

## 3. Extension Checklist

### Khi thêm optional feature

```
□ URS: Thêm US mới với "Version added: vX.Y"
□ URS: Thêm AC mới vào US hiện có (nếu extends)
□ MODSPEC: Thêm API với optional fields
□ MODSPEC: Thêm nullable DB columns
□ TEST: Thêm test cases với "when feature enabled"
□ CODE: Optional parameter, không break existing callers
□ DOCS: Cập nhật USER-GUIDE section
□ CHANGELOG: Ghi "Added: {feature}"
```

### Khi thêm required feature

```
□ BIZ-POLICY: Thêm BR mới nếu có business rule
□ URS: Thêm US + FT + AC mới
□ MODSPEC: Thêm/cập nhật API (version nếu breaking)
□ MODSPEC: Thêm migration script cho DB changes
□ TEST: Test cases đầy đủ (happy path, error, edge)
□ CODE: Implement + unit tests + integration tests
□ DOCS: Update all relevant guides
□ CHANGELOG: Ghi "Added: {feature}, Breaking: {if any}"
□ EVOLUTION-LOG: Thêm EVOL entry
□ VERIFY: Re-run /mcv3:verify sau khi implement
```

### Khi thêm system mới

```
□ PROJECT-OVERVIEW: Cập nhật systems list
□ PROJECT-ARCHITECTURE: Cập nhật system diagram
□ Create SYSTEM-INDEX.md cho system mới
□ Define integration contracts (INT-IDs)
□ BIZ-POLICY: Domain-specific policies cho system mới
□ Full pipeline: URS → MODSPEC → TEST → CODE → VERIFY
□ Update MASTER-INDEX.md
□ Update .mc-data/_config.json: thêm system
```

---

## 4. Anti-patterns trong Feature Extension

### Anti-pattern 1: God Module Growth

❌ Tiếp tục thêm vào 1 module đến khi quá lớn
```
// 200+ URS items, 500+ test cases in one module → unmaintainable
URS-WH.md: 15 User Stories (v1.0)
URS-WH.md: 45 User Stories (v3.0) ← Module quá lớn
```

✅ Split module khi > 30 User Stories:
```
URS-WH-RECEIPT.md    (Nhập kho)
URS-WH-DISPATCH.md   (Xuất kho)
URS-WH-INVENTORY.md  (Tồn kho)
URS-WH-TRANSFER.md   (Điều chuyển)
```

### Anti-pattern 2: Orphan Features

❌ Thêm code không có Requirements truy về được
```typescript
// Code mới không có @req-ids → vi phạm traceability
export class NewFeatureService {
  async doSomething() { ... }
}
```

✅ Luôn tạo US/FT trước khi code:
```typescript
// @req-ids US-WH-NEW, FT-WH-NEW
export class NewFeatureService { ... }
```

### Anti-pattern 3: Silent Breaking Changes

❌ Thay đổi API không thông báo
```typescript
// v1.1: Đột nhiên đổi response format mà không versioning
interface ReceiptResponse {
  // v1.0: { id, status }
  // v1.1: { receiptId, receiptStatus }  ← breaking! name changes
}
```

✅ Version properly:
```typescript
// Keep v1 working, add v2 endpoint
POST /api/v1/receipts → v1.0 format (deprecated but working)
POST /api/v2/receipts → v2.0 format (new)
```

### Anti-pattern 4: Parallel Universe

❌ Mỗi developer tự evolve documents khác nhau, không sync
✅ Dùng `/mcv3:evolve` làm coordination point, snapshot trước mỗi evolution

---

## 5. Feature Flag Pattern

Khi muốn deploy code nhưng chưa enable feature:

**MODSPEC ghi rõ:**
```markdown
### FT-WH-NEW: Barcode Scanning (Feature Flag)
**Feature Flag:** `FEATURE_BARCODE_SCANNING`
**Default:** disabled
**Enable:** Set env var hoặc config
```

**CODE:**
```typescript
// @req-ids FT-WH-NEW
async scanBarcode(barcode: string) {
  if (!this.config.get('FEATURE_BARCODE_SCANNING')) {
    throw new FeatureNotEnabledError('barcode_scanning');
  }
  // ... implementation
}
```

**TEST:**
```typescript
describe('when FEATURE_BARCODE_SCANNING=true', () => {
  // test enabled behavior
});

describe('when FEATURE_BARCODE_SCANNING=false', () => {
  // test disabled behavior
});
```
