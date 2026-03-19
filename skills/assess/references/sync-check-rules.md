# Sync Check Rules — So sánh Code vs Docs

## Mục đích

Dùng trong Phase 4 của `/mcv3:assess` để phát hiện drift giữa code và documentation.

---

## Rule 1: API Endpoint Sync

### Cách detect

**Step 1: Extract APIs từ code**

```
NestJS:
  @Get('/orders')           → GET /orders
  @Post('/orders')          → POST /orders
  @Put('/orders/:id')       → PUT /orders/:id (với :id là path param)
  @Controller('v1/items')   → prefix /v1/items

Express:
  router.get('/receipts', handler)  → GET /receipts
  app.post('/api/users', handler)   → POST /api/users
```

**Step 2: Extract APIs từ MODSPEC**

```
### API-ERP-001: Danh sách đơn hàng
**Method:** GET
**Path:** /api/v1/orders
→ thu thập: { id: "API-ERP-001", method: "GET", path: "/api/v1/orders" }
```

**Step 3: So sánh**

```
Aligned:
  Code: GET /api/v1/orders
  Docs: GET /api/v1/orders (API-ERP-001)
  → ✅ MATCH

Drifted (path changed):
  Code: GET /api/v2/orders
  Docs: GET /api/v1/orders (API-ERP-001)
  → ⚠️ PATH_DRIFT: v1 → v2, API-ERP-001 cần update

Drifted (method changed):
  Code: PATCH /api/v1/orders/:id/status
  Docs: PUT /api/v1/orders/:id/status (API-ERP-005)
  → ⚠️ METHOD_DRIFT: PUT → PATCH, cần confirm intent

Missing in docs:
  Code: DELETE /api/v1/orders/:id
  Docs: không tìm thấy entry
  → ❌ UNDOCUMENTED_API: cần tạo API-ERP-xxx entry

Missing in code:
  Docs: POST /api/v1/orders/bulk (API-ERP-009)
  Code: không tìm thấy handler
  → ❌ UNIMPLEMENTED_API: API spec nhưng chưa code
```

### Severity Rules

| Loại drift | Severity | Lý do |
|-----------|----------|-------|
| Path version drift (/v1 → /v2) | WARNING | Breaking change với clients |
| Method drift (PUT → PATCH) | WARNING | Semantics khác nhau |
| Undocumented API | WARNING | Không track được behavior |
| Unimplemented API | INFO | Có thể còn đang develop |
| Both missing | INFO | Cần clarify nếu feature needed |

---

## Rule 2: Database Schema Sync

### Cách detect

**Step 1: Extract tables từ code**

```
TypeORM Entity:
  @Entity('orders')
  class Order { ... }
  → table: orders

Prisma schema:
  model Order { ... }
  → table: orders (lowercase, plural)

Django model:
  class Order(models.Model):
    class Meta: db_table = 'orders'
  → table: orders (hoặc myapp_order nếu không có Meta)

Migration files:
  CREATE TABLE orders (...)
  → table: orders
```

**Step 2: Extract tables từ docs**

```
DATA-DICTIONARY:
  ### TBL-ERP-001: orders
  → table: orders, id: TBL-ERP-001

MODSPEC DB section:
  #### TBL-ERP-002: order_items
  → table: order_items, id: TBL-ERP-002
```

**Step 3: So sánh columns**

```
Code (TypeORM):
  @Column() price: number;
  @Column() discount_amount: number;  ← new column

Docs (MODSPEC):
  | price | DECIMAL | ... |  ← documented
  ← discount_amount not in docs

→ ⚠️ COLUMN_DRIFT: discount_amount column mới, chưa có trong docs
```

### Severity Rules

| Loại drift | Severity | Lý do |
|-----------|----------|-------|
| Table in code, not in docs | WARNING | Không biết business purpose |
| Table in docs, not in code | INFO | Có thể planned nhưng chưa implement |
| Column added without docs | WARNING | Không rõ business reason |
| Column renamed | ERROR | Breaking change cho existing data |
| Column type changed | WARNING | Potential data issue |

---

## Rule 3: Business Rules Sync

### Cách detect

**Step 1: Extract rules từ code**

Tìm các patterns sau trong service files:

```typescript
// Pattern 1: Numeric validations
if (order.total < 50000) throw new Error('...')
// → BR candidate: Minimum order = 50,000

// Pattern 2: Constants
const MAX_ITEMS_PER_ORDER = 100;
const MINIMUM_ORDER_VALUE = 50000;
// → BR candidates từ constants

// Pattern 3: Status transitions
if (order.status !== 'PENDING') throw new Error('...')
// → BR: Chỉ cancel order khi status = PENDING

// Pattern 4: Role-based rules
if (!user.hasPermission('APPROVE_ORDER')) throw new Error('...')
// → BR: Chỉ user có quyền APPROVE_ORDER mới được duyệt

// Pattern 5: Date/time rules
if (dayjs().diff(order.createdAt, 'hour') > 24) throw new Error('...')
// → BR: Không thể cancel order sau 24 giờ
```

**Step 2: Extract rules từ BIZ-POLICY**

```
### BR-SALES-001: Giá trị đơn hàng tối thiểu
Mô tả: Giá trị đơn hàng tối thiểu là 100,000 VND
→ { id: "BR-SALES-001", value: 100000, type: "minimum" }
```

**Step 3: So sánh**

```
Code: if (order.total < 50000) → minimum = 50,000
Docs: BR-SALES-001: minimum = 100,000

→ ⚠️ VALUE_DRIFT: Code enforce 50k, docs nói 100k
   → Cần clarify với stakeholder: giá trị nào đúng?
```

### Severity Rules

| Loại drift | Severity | Lý do |
|-----------|----------|-------|
| Value drift (khác số) | ERROR | Business rule sai có thể gây loss |
| Logic drift (khác condition) | ERROR | Behavior khác với design |
| Missing in docs | WARNING | Rule không được explicit document |
| Missing in code | WARNING | Rule có docs nhưng chưa enforce |

---

## Rule 4: Traceability Check

### Kiểm tra từng ID chain

```
Chain: PROB → BR → US → FT → API → Code(@req-ids) → TC

Với mỗi BR-xxx:
  → Tìm US-xxx nào mention BR này
  → Nếu không có: ⚠️ ORPHAN_BR

Với mỗi US-xxx:
  → Tìm AC-xxx của US này
  → Tìm FT-xxx derive từ US này
  → Nếu không có AC: ⚠️ US_NO_AC
  → Nếu không có FT: ℹ️ US_NO_FEATURE

Với mỗi FT-xxx:
  → Tìm API-xxx hoặc COMP-xxx implement FT này
  → Nếu không có: ⚠️ UNIMPLEMENTED_FEATURE

Với mỗi API-xxx:
  → Tìm code file có @req-ids bao gồm API này
  → Nếu không có: ⚠️ API_NO_CODE_LINK

Với mỗi AC-xxx:
  → Tìm TC-xxx test AC này
  → Nếu không có: WARNING nếu < 80% coverage
```

---

## Rule 5: Consistency Check

### Detect inconsistencies giữa docs

**Example:**

```
BIZ-POLICY-SALES.md:
  BR-SALES-005: Đơn hàng dưới 200k không được giảm giá

URS-SALES.md:
  US-SALES-010: Áp dụng discount cho đơn hàng từ 150k

→ INCONSISTENCY: BR-SALES-005 nói 200k, US-SALES-010 nói 150k
```

**Patterns cần kiểm tra:**

| Check | Cách detect |
|-------|-------------|
| Số tiền/threshold mâu thuẫn | So sánh numeric values cùng context |
| Status names khác nhau | "PENDING" vs "WAITING" vs "IN_PROGRESS" |
| Actor names khác nhau | "Nhân viên kho" vs "Warehouse Staff" vs "WH staff" |
| Date format khác nhau | "dd/MM/yyyy" vs "MM/dd/yyyy" vs "ISO 8601" |
| Feature scope mâu thuẫn | Feature A nói có X, Feature B nói không có X |

---

## Severity Summary

| Code | Meaning | Action |
|------|---------|--------|
| ERROR | Code và docs mâu thuẫn rõ ràng | Phải sync trước khi tiếp tục |
| WARNING | Có drift hoặc missing, ảnh hưởng đến quality | Nên sync trong sprint hiện tại |
| INFO | Gap nhỏ, không block | Lên kế hoạch cho tương lai |

---

## Output: SYNC-REPORT Format

```markdown
# SYNC REPORT — {Project}
**Ngày:** {date}
**Scope:** {systems assessed}

## Summary Table
| Category | Total | ✅ Aligned | ⚠️ Drifted | ❌ Missing |
|----------|-------|-----------|----------|---------|
| APIs | {N} | {A} | {D} | {M} |
| DB Tables | {N} | {A} | {D} | {M} |
| DB Columns | {N} | {A} | {D} | {M} |
| Business Rules | {N} | {A} | {D} | {M} |

## Drift Details

### ERRORs
#### DRIFT-001: BR-SALES-001 value mismatch
- **Code:** minimum_order = 50,000
- **Docs:** BR-SALES-001 = 100,000
- **Action:** Clarify với stakeholder, update code hoặc docs

...

### WARNINGs
...

### INFOs
...

## Recommendations
1. Sync {N} critical drifts trước khi chạy `/mcv3:verify`
2. Document {M} undocumented APIs qua `/mcv3:tech-design`
3. Xem xét `/mcv3:change-manager` cho drift về business rules
```
