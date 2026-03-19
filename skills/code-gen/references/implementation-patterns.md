# Implementation Patterns — Code-Gen Reference

Hướng dẫn **chuyển BR specs thành code thực** (dùng trong IMPLEMENT mode).

---

## A. BR-to-Code Transpiler Rules

Mỗi loại Business Rule có pattern code tương ứng. Đọc BR type từ MODSPEC, áp dụng pattern phù hợp.

### A1. BR loại Validation → if/throw pattern

```
BR-INV-001: "Số lượng phải >= 0"
```

```typescript
// Trong Service hoặc validator:
// BR-INV-001: Số lượng phải >= 0
if (dto.quantity < 0) {
  throw new BusinessRuleError('BR-INV-001', 'Số lượng không được âm');
}
```

```
BR-INV-002: "SKU phải duy nhất trong hệ thống"
```

```typescript
// BR-INV-002: SKU phải duy nhất trong hệ thống
const existing = await this.inventoryRepo.findBySku(dto.sku);
if (existing) {
  throw new ConflictError(`SKU '${dto.sku}' đã tồn tại [BR-INV-002]`);
}
```

```
BR-ORD-001: "Không thể tạo đơn hàng khi tổng = 0"
```

```typescript
// BR-ORD-001: Tổng đơn hàng phải > 0
const total = this.calculateTotal(dto.items);
if (total <= 0) {
  throw new BusinessRuleError('BR-ORD-001', 'Tổng đơn hàng phải lớn hơn 0');
}
```

---

### A2. BR loại Calculation → function pattern

```
BR-ORD-003: "Tổng = SUM(quantity × unitPrice) × (1 - discount%)"
```

```typescript
/**
 * Tính tổng giá trị đơn hàng
 * @br-ids BR-ORD-003
 */
private calculateOrderTotal(items: OrderItemDto[], discountPercent: number): number {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);
  return subtotal * (1 - discountPercent / 100);
}
```

```
BR-INV-005: "Giá trị tồn kho = SUM(lot_quantity × weighted_avg_cost) theo WAVG"
```

```typescript
/**
 * Tính giá trị tồn kho theo Weighted Average
 * @br-ids BR-INV-005
 */
private calculateInventoryValueWAVG(lots: InventoryLot[]): number {
  const totalQty = lots.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty === 0) return 0;
  const totalValue = lots.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
  return totalValue; // Tổng giá trị = totalQty * WAVG_cost
}

private getWeightedAvgCost(lots: InventoryLot[]): number {
  const totalQty = lots.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty === 0) return 0;
  return lots.reduce((sum, l) => sum + l.quantity * l.unitCost, 0) / totalQty;
}
```

---

### A3. BR loại Workflow/State → state machine pattern

```
BR-ORD-005: "Order: DRAFT → CONFIRMED → SHIPPED → DELIVERED. Không được skip state"
```

```typescript
// Enum trạng thái
export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Transition map hợp lệ
// BR-ORD-005: Chỉ cho phép chuyển trạng thái theo thứ tự
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

/**
 * Validate và thực hiện state transition
 * @br-ids BR-ORD-005
 */
function transitionOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new BusinessRuleError(
      'BR-ORD-005',
      `Không thể chuyển từ ${current} sang ${next}`
    );
  }
}
```

```
BR-GRN-002: "GRN: PENDING → IN_REVIEW → APPROVED | REJECTED"
```

```typescript
export enum GrnStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// BR-GRN-002: Transition rules cho GRN
const GRN_TRANSITIONS: Record<GrnStatus, GrnStatus[]> = {
  [GrnStatus.PENDING]: [GrnStatus.IN_REVIEW],
  [GrnStatus.IN_REVIEW]: [GrnStatus.APPROVED, GrnStatus.REJECTED],
  [GrnStatus.APPROVED]: [],
  [GrnStatus.REJECTED]: [GrnStatus.PENDING], // Cho phép resubmit
};
```

---

### A4. BR loại Authorization → guard/middleware pattern

```
BR-AUTH-001: "Chỉ WAREHOUSE_MANAGER mới được approve GRN"
BR-AUTH-002: "Staff chỉ xem GRN của warehouse mình phụ trách"
```

```typescript
// Guard function (dùng trong service)
// BR-AUTH-001: Chỉ WAREHOUSE_MANAGER được approve GRN
private assertCanApproveGrn(user: AuthUser): void {
  if (!user.roles.includes('WAREHOUSE_MANAGER') && !user.roles.includes('ADMIN')) {
    throw new ForbiddenError('BR-AUTH-001: Không có quyền approve GRN');
  }
}

// Data filter theo scope
// BR-AUTH-002: Staff chỉ xem GRN của warehouse mình
private buildWarehouseScope(user: AuthUser): { warehouseId?: string } {
  if (user.roles.includes('ADMIN') || user.roles.includes('WAREHOUSE_MANAGER')) {
    return {}; // Không filter
  }
  return { warehouseId: user.warehouseId };
}
```

---

### A5. BR loại Notification → event trigger pattern

```
BR-ORD-008: "Khi order CONFIRMED, gửi email xác nhận cho khách hàng"
BR-INV-010: "Khi tồn kho < min_stock, tạo alert cho Purchasing"
```

```typescript
// Event-driven notification
// BR-ORD-008: Gửi email xác nhận khi CONFIRMED
async confirmOrder(orderId: string, userId: string): Promise<Order> {
  const order = await this.orderRepo.findById(orderId);
  transitionOrderStatus(order.status, OrderStatus.CONFIRMED);

  const updated = await this.orderRepo.updateStatus(orderId, OrderStatus.CONFIRMED, userId);

  // BR-ORD-008: Trigger notification event
  this.eventBus.emit('order.confirmed', {
    orderId: updated.id,
    customerId: updated.customerId,
    totalAmount: updated.totalAmount,
  });

  return updated;
}

// Trong NotificationHandler (lắng nghe event riêng):
// BR-INV-010: Kiểm tra min_stock sau mỗi lần xuất kho
async checkLowStockAlert(productId: string): Promise<void> {
  const stock = await this.inventoryRepo.getCurrentStock(productId);
  const product = await this.productRepo.findById(productId);

  if (stock.quantity < product.minStock) {
    // BR-INV-010: Tạo alert cho Purchasing
    this.eventBus.emit('inventory.low_stock', {
      productId,
      currentStock: stock.quantity,
      minStock: product.minStock,
    });
  }
}
```

---

### A6. BR loại Scheduling → cron/job pattern

```
BR-ORD-015: "Tự động hủy order DRAFT sau 24 giờ không có action"
BR-RPT-001: "Báo cáo tồn kho tự động gửi vào 7:00 sáng mỗi ngày"
```

```typescript
// Bull/BullMQ scheduled job
// BR-ORD-015: Tự động hủy draft orders sau 24h
import { Queue, Worker } from 'bullmq';

const orderQueue = new Queue('order-jobs', { connection: redisClient });

// Lên lịch khi tạo order
async createOrder(dto: CreateOrderDto): Promise<Order> {
  const order = await this.orderRepo.create({ ...dto, status: OrderStatus.DRAFT });

  // BR-ORD-015: Hủy sau 24h nếu vẫn DRAFT
  await orderQueue.add(
    'auto-cancel-draft',
    { orderId: order.id },
    { delay: 24 * 60 * 60 * 1000, jobId: `cancel-${order.id}` }
  );

  return order;
}

// Worker xử lý job
const cancelWorker = new Worker('order-jobs', async (job) => {
  if (job.name === 'auto-cancel-draft') {
    const order = await orderRepo.findById(job.data.orderId);
    if (order?.status === OrderStatus.DRAFT) {
      await orderRepo.updateStatus(order.id, OrderStatus.CANCELLED, 'system');
    }
  }
});

// BR-RPT-001: Cron job báo cáo hàng ngày (dùng node-cron)
import cron from 'node-cron';
cron.schedule('0 7 * * *', async () => {
  const report = await inventoryService.generateDailyReport();
  await notificationService.sendReportEmail(report);
});
```

---

## B. Service Implementation Patterns

### B1. CRUD Service — Full Implementation

```typescript
/**
 * @req-ids US-{MOD}-001, US-{MOD}-002, US-{MOD}-003
 * @feat-ids FT-{MOD}-001, FT-{MOD}-002, FT-{MOD}-003
 * @comp-ids COMP-{SYS}-001
 */
export class {Mod}Service {
  constructor(
    private readonly {mod}Repo: I{Mod}Repository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  // ─── CREATE ────────────────────────────────────────────────────────────────

  /**
   * Tạo mới {Mod}
   * @req-ids US-{MOD}-001
   * @br-ids BR-{DOM}-001, BR-{DOM}-002
   */
  async create(dto: Create{Mod}Dto, userId: string): Promise<{Mod}> {
    // 1. Validate business rules
    await this.validate{Mod}BusinessRules(dto);

    // 2. Transform sang domain data
    const data: Create{Mod}Data = {
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    };

    // 3. Lưu DB
    const result = await this.{mod}Repo.create(data);

    // 4. Emit domain event
    this.eventBus.emit('{mod}.created', { id: result.id, createdBy: userId });

    this.logger.info(`[{Mod}Service] Created {mod} id=${result.id}`);
    return result;
  }

  // ─── READ ──────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách {Mod} với pagination, filter, sort
   * @req-ids US-{MOD}-002
   */
  async findAll(filter: {Mod}FilterDto): Promise<PaginatedResult<{Mod}>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...where } = filter;
    return this.{mod}Repo.findAll({ page, limit, sortBy, sortOrder, where });
  }

  /**
   * Lấy chi tiết 1 {Mod} theo ID
   * @req-ids US-{MOD}-003
   */
  async findById(id: string): Promise<{Mod}> {
    const item = await this.{mod}Repo.findById(id);
    if (!item) {
      throw new NotFoundError('{Mod}', id);
    }
    return item;
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  /**
   * Cập nhật {Mod}
   * @req-ids US-{MOD}-004
   */
  async update(id: string, dto: Update{Mod}Dto, userId: string): Promise<{Mod}> {
    // 1. Kiểm tra tồn tại
    const existing = await this.findById(id);

    // 2. Validate business rules cho update
    await this.validate{Mod}UpdateRules(existing, dto);

    // 3. Merge và lưu
    const updated = await this.{mod}Repo.update(id, {
      ...dto,
      updatedBy: userId,
    });

    this.eventBus.emit('{mod}.updated', { id, updatedBy: userId });
    return updated;
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  /**
   * Soft delete {Mod}
   * @req-ids US-{MOD}-005
   * @br-ids BR-{DOM}-010 (điều kiện xóa)
   */
  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id);

    // BR-{DOM}-010: Kiểm tra điều kiện có thể xóa
    await this.assertCanDelete(existing);

    await this.{mod}Repo.softDelete(id, userId);
    this.eventBus.emit('{mod}.deleted', { id, deletedBy: userId });
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private async validate{Mod}BusinessRules(dto: Create{Mod}Dto): Promise<void> {
    // BR-{DOM}-001: {Quy tắc 1}
    // TODO: implement BR checks từ MODSPEC
  }

  private async validate{Mod}UpdateRules(existing: {Mod}, dto: Update{Mod}Dto): Promise<void> {
    // TODO: implement update-specific BR checks
  }

  private async assertCanDelete(item: {Mod}): Promise<void> {
    // BR-{DOM}-010: {Điều kiện xóa}
    // TODO: implement delete guards
  }
}
```

---

### B2. Complex Business Transaction

```typescript
/**
 * Xử lý nghiệp vụ phức tạp có transaction
 * @req-ids US-ORD-010
 * @br-ids BR-ORD-020, BR-INV-015
 */
async processOrderFulfillment(orderId: string, userId: string): Promise<FulfillmentResult> {
  return this.db.$transaction(async (tx) => {
    // 1. Lock order (pessimistic lock)
    const order = await this.orderRepo.findForUpdate(orderId, tx);
    if (!order) throw new NotFoundError('Order', orderId);

    // BR-ORD-020: Order phải ở trạng thái CONFIRMED để fulfill
    transitionOrderStatus(order.status, OrderStatus.SHIPPED);

    // 2. Kiểm tra và trừ tồn kho cho từng line item
    for (const item of order.items) {
      // BR-INV-015: Kiểm tra đủ tồn kho trước khi xuất
      const stock = await this.inventoryRepo.getAvailableStock(item.productId, tx);
      if (stock < item.quantity) {
        throw new BusinessRuleError(
          'BR-INV-015',
          `Không đủ tồn kho cho sản phẩm ${item.productId}: cần ${item.quantity}, có ${stock}`
        );
      }
      await this.inventoryRepo.decreaseStock(item.productId, item.quantity, orderId, tx);
    }

    // 3. Cập nhật order status
    const updated = await this.orderRepo.updateStatus(orderId, OrderStatus.SHIPPED, userId, tx);

    // 4. Ghi fulfillment log
    await this.fulfillmentLogRepo.create({ orderId, processedBy: userId, items: order.items }, tx);

    return { order: updated, itemsShipped: order.items.length };
  });
}
```

---

## C. Controller Implementation Patterns

### C1. Full CRUD Controller

```typescript
/**
 * {Mod} Controller — Xử lý HTTP requests
 * @api-ids API-{SYS}-001 đến API-{SYS}-005
 * @req-ids US-{MOD}-001 đến US-{MOD}-005
 */
export class {Mod}Controller {
  constructor(private readonly {mod}Service: {Mod}Service) {}

  // POST /api/v1/{resources}
  // API-{SYS}-001: Tạo mới {Mod}
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = await validate(Create{Mod}Schema, req.body);
      const result = await this.{mod}Service.create(dto, req.user.id);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  }

  // GET /api/v1/{resources}
  // API-{SYS}-002: Lấy danh sách {Mod}
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = await validate({Mod}FilterSchema, req.query);
      const result = await this.{mod}Service.findAll(filter);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // GET /api/v1/{resources}/:id
  // API-{SYS}-003: Lấy chi tiết {Mod}
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.{mod}Service.findById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  }

  // PATCH /api/v1/{resources}/:id
  // API-{SYS}-004: Cập nhật {Mod}
  async update(req: Request, res: Response): Promise<void> {
    try {
      const dto = await validate(Update{Mod}Schema, req.body);
      const result = await this.{mod}Service.update(req.params.id, dto, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  }

  // DELETE /api/v1/{resources}/:id
  // API-{SYS}-005: Xóa {Mod}
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.{mod}Service.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  }
}
```

### C2. Response Format chuẩn

```typescript
// Pagination response — dùng nhất quán cho mọi list endpoint
res.status(200).json({
  success: true,
  data: result.items,
  meta: {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: Math.ceil(result.total / result.limit),
  },
});

// Error response — dùng handleError() từ code-patterns.md
// Error format chuẩn:
// { success: false, error: { code, message, details?, traceId } }
```

---

## D. REQ-ID Tracing trong Code

### D1. File Header JSDoc (BẮT BUỘC trong IMPLEMENT mode)

```typescript
/**
 * {Module} — {File Role}
 *
 * @module {sys}/{mod}
 * @req-ids US-{MOD}-001, US-{MOD}-002, US-{MOD}-003
 * @feat-ids FT-{MOD}-001, FT-{MOD}-002
 * @api-ids API-{SYS}-001, API-{SYS}-002     (chỉ cho controller)
 * @tbl-ids TBL-{SYS}-001                    (chỉ cho repository)
 * @br-ids BR-{DOM}-001, BR-{DOM}-002        (chỉ cho service)
 * @comp-ids COMP-{SYS}-001                  (component spec ID)
 */
```

### D2. Inline BR comments tại mỗi validation

```typescript
// BR-{DOM}-001: {Tên quy tắc}
if (condition) {
  throw new BusinessRuleError('BR-{DOM}-001', 'Mô tả lỗi');
}
```

### D3. Method-level JSDoc kèm IDs

```typescript
/**
 * Confirm order — chuyển trạng thái DRAFT → CONFIRMED
 * @param orderId - ID của order
 * @param userId - User thực hiện
 * @req-ids US-ORD-005
 * @br-ids BR-ORD-005, BR-ORD-008
 * @api-ids API-ERP-010
 */
async confirmOrder(orderId: string, userId: string): Promise<Order> {
  // ...
}
```

---

## E. CI Pipeline Code Generation

### E1. GitHub Actions — Node.js + TypeScript

```yaml
# .github/workflows/ci.yml
# REQ-ID: NFR-CI-001 (Continuous Integration pipeline)
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db

      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          NODE_ENV: test

      - name: Coverage check (≥80%)
        run: npm run test:coverage -- --coverageThreshold='{"global":{"lines":80,"branches":70}}'

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### E2. package.json scripts chuẩn

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint 'src/**/*.ts' --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config jest.e2e.config.ts",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio",
    "start": "node dist/main.js",
    "start:dev": "ts-node-dev --respawn src/main.ts"
  }
}
```

---

## F. Post-Gate IMPLEMENT Mode

Trong IMPLEMENT mode, **TODO count phải = 0** trước khi phase kết thúc:

```
Kiểm tra TODOs còn lại:
grep -r "// TODO" src/{sys}/{mod}/ --include="*.ts"

Nếu còn TODO → PHẢI implement hoặc convert sang real code
Nếu không còn TODO → ✅ Phase hoàn thành
```

**Checklist sau IMPLEMENT:**
```
✅ Không còn TODO comment trong business logic
✅ Mọi BR spec có code tương ứng (validation, calculation, state machine)
✅ Mọi method có error handling thực sự (không phải placeholder)
✅ Mọi file có REQ-ID JSDoc header
✅ Tất cả inline BR comments khớp với BR-IDs trong MODSPEC
✅ TypeScript compile OK (tsc --noEmit)
✅ Lint pass (eslint)
```
