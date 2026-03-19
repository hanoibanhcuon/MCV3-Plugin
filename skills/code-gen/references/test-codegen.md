# Test Code-Gen — Code-Gen Reference

Hướng dẫn **chuyển TC specs thành real test code** khi code-gen.

---

## A. TC Spec → Real Test Code

### A1. Integration Test (API level) — từ TC spec

```
TC-INV-001-01: "Tạo inventory với dữ liệu hợp lệ → 201 + lưu vào DB"
  Steps:
    POST /api/inventory { sku: "SKU001", name: "Sản phẩm A", quantity: 100, unitCost: 50000 }
  Expected:
    - Status 201
    - body.id tồn tại
    - DB có record với sku = "SKU001"
    - body.quantity = 100
```

```typescript
// test/integration/inventory.test.ts
// REQ-ID: TC-INV-001-01

describe('POST /api/v1/inventory', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
  });

  afterEach(async () => {
    // Cleanup sau mỗi test — dùng transaction rollback hoặc truncate
    await prisma.$executeRaw`TRUNCATE TABLE inventory RESTART IDENTITY CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TC-INV-001-01: Tạo inventory hợp lệ
  it('TC-INV-001-01: should create inventory with valid data', async () => {
    // Arrange
    const dto = InventoryFactory.build(); // Dùng Factory

    // Act
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', `Bearer ${testToken('WAREHOUSE_STAFF')}`)
      .send(dto);

    // Assert — TC pass criteria
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.sku).toBe(dto.sku);
    expect(res.body.data.quantity).toBe(dto.quantity);

    // Verify DB record
    const dbRecord = await prisma.inventory.findUnique({
      where: { id: res.body.data.id },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord!.sku).toBe(dto.sku);
    expect(dbRecord!.quantity.toNumber()).toBe(dto.quantity);
    expect(dbRecord!.deletedAt).toBeNull(); // Không bị soft delete
  });

  // TC-INV-001-02: Duplicate SKU → 409
  it('TC-INV-001-02: should return 409 when SKU already exists', async () => {
    // Arrange — tạo record trước
    const existing = await prisma.inventory.create({
      data: InventoryFactory.buildPrisma({ sku: 'DUPE-SKU' }),
    });

    // Act
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', `Bearer ${testToken('WAREHOUSE_STAFF')}`)
      .send(InventoryFactory.build({ sku: 'DUPE-SKU' }));

    // Assert
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  // TC-INV-001-03: Quantity âm → 400
  it('TC-INV-001-03: should return 400 when quantity is negative', async () => {
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', `Bearer ${testToken('WAREHOUSE_STAFF')}`)
      .send(InventoryFactory.build({ quantity: -1 }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'quantity' })
      ])
    );
  });

  // TC-INV-001-04: Không có auth → 401
  it('TC-INV-001-04: should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/inventory')
      .send(InventoryFactory.build()); // Không set Authorization header

    expect(res.status).toBe(401);
  });
});
```

---

### A2. Unit Test (Service level)

```
TC-ORD-005-01: "calculateOrderTotal với discount 10% → kết quả đúng"
TC-ORD-005-02: "createOrder với inventory không đủ → throw BusinessRuleError BR-INV-015"
```

```typescript
// test/unit/order.service.test.ts
// REQ-ID: TC-ORD-005-01, TC-ORD-005-02

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepo: jest.Mocked<IOrderRepository>;
  let mockInventoryRepo: jest.Mocked<IInventoryRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    // Mock dependencies
    mockOrderRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    mockInventoryRepo = {
      getAvailableStock: jest.fn(),
      decreaseStock: jest.fn(),
      findById: jest.fn(),
    };
    mockEventBus = { emit: jest.fn(), on: jest.fn() };

    orderService = new OrderService(mockOrderRepo, mockInventoryRepo, mockEventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TC-ORD-005-01: Tính total đúng với discount
  describe('calculateOrderTotal', () => {
    it('TC-ORD-005-01: should calculate total with 10% discount correctly', () => {
      const items = [
        { productId: 'p1', quantity: 2, unitPrice: 100000 },
        { productId: 'p2', quantity: 1, unitPrice: 200000 },
      ];
      // Subtotal = 2*100000 + 1*200000 = 400000
      // With 10% discount = 400000 * 0.9 = 360000

      const total = orderService['calculateOrderTotal'](items, 10); // private method
      expect(total).toBe(360000);
    });

    it('should return subtotal when discount is 0', () => {
      const items = [{ productId: 'p1', quantity: 3, unitPrice: 50000 }];
      expect(orderService['calculateOrderTotal'](items, 0)).toBe(150000);
    });
  });

  // TC-ORD-005-02: Inventory không đủ
  describe('createOrder', () => {
    it('TC-ORD-005-02: should throw BR-INV-015 when inventory insufficient', async () => {
      // Arrange
      const dto = OrderFactory.build({
        items: [{ productId: 'prod-1', quantity: 10, unitPrice: 50000 }],
      });
      mockInventoryRepo.getAvailableStock.mockResolvedValue(5); // Chỉ có 5

      // Act & Assert
      await expect(
        orderService.createOrder(dto, 'user-123')
      ).rejects.toThrow('BR-INV-015');

      // Verify không tạo order khi inventory không đủ
      expect(mockOrderRepo.create).not.toHaveBeenCalled();
    });

    it('should create order successfully when inventory is sufficient', async () => {
      // Arrange
      const dto = OrderFactory.build();
      const mockOrder = OrderFactory.buildResponse(dto);

      mockInventoryRepo.getAvailableStock.mockResolvedValue(100);
      mockOrderRepo.create.mockResolvedValue(mockOrder);

      // Act
      const result = await orderService.createOrder(dto, 'user-123');

      // Assert
      expect(result.id).toBeDefined();
      expect(mockOrderRepo.create).toHaveBeenCalledOnce();
      expect(mockEventBus.emit).toHaveBeenCalledWith('order.created', expect.objectContaining({
        id: mockOrder.id,
      }));
    });
  });
});
```

---

### A3. Edge Case Tests

```typescript
// TC-INV-002-05: "findAll với page=999 (ngoài range) → trả về empty array, không lỗi"
it('TC-INV-002-05: should return empty array for out-of-range page', async () => {
  // Seed 5 records
  await prisma.inventory.createMany({
    data: Array(5).fill(null).map(() => InventoryFactory.buildPrisma()),
  });

  const res = await request(app)
    .get('/api/v1/inventory?page=999&limit=20')
    .set('Authorization', `Bearer ${testToken()}`);

  expect(res.status).toBe(200);
  expect(res.body.data).toEqual([]);
  expect(res.body.meta.total).toBe(5); // Total vẫn đúng
  expect(res.body.meta.totalPages).toBe(1);
});

// TC-GRN-003-01: "approve GRN bởi user không phải WAREHOUSE_MANAGER → 403"
it('TC-GRN-003-01: should return 403 when non-manager tries to approve', async () => {
  const grn = await prisma.grn.create({ data: GrnFactory.buildPrisma({ status: 'IN_REVIEW' }) });

  const res = await request(app)
    .patch(`/api/v1/grn/${grn.id}/approve`)
    .set('Authorization', `Bearer ${testToken('WAREHOUSE_STAFF')}`); // Staff, not Manager

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe('FORBIDDEN');
});
```

---

## B. Factory Patterns

Dùng faker.js để tạo test data, generate từ TBL schema.

### B1. Simple Factory

```typescript
// test/factories/inventory.factory.ts
import { faker } from '@faker-js/faker/locale/vi';

export const InventoryFactory = {
  // Build DTO (cho API request body)
  build(overrides: Partial<CreateInventoryDto> = {}): CreateInventoryDto {
    return {
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.commerce.productName(),
      quantity: faker.number.float({ min: 0, max: 10000, fractionDigits: 3 }),
      unitCost: faker.number.float({ min: 1000, max: 10000000, fractionDigits: 0 }),
      warehouseId: faker.string.uuid(),
      description: faker.commerce.productDescription(),
      ...overrides,
    };
  },

  // Build Prisma data (cho DB seed trong tests)
  buildPrisma(overrides: Partial<Prisma.InventoryCreateInput> = {}): Prisma.InventoryCreateInput {
    return {
      id: faker.string.uuid(),
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.commerce.productName(),
      quantity: faker.number.float({ min: 0, max: 10000, fractionDigits: 3 }),
      unitCost: faker.number.float({ min: 1000, max: 10000000, fractionDigits: 0 }),
      warehouseId: faker.string.uuid(),
      createdBy: faker.string.uuid(),
      updatedBy: faker.string.uuid(),
      ...overrides,
    };
  },

  // Build response (giả lập response từ service)
  buildResponse(dto: CreateInventoryDto): Inventory {
    return {
      id: faker.string.uuid(),
      ...dto,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: faker.string.uuid(),
      updatedBy: faker.string.uuid(),
    };
  },

  // Build nhiều items
  buildList(count: number, overrides: Partial<CreateInventoryDto> = {}): CreateInventoryDto[] {
    return Array(count).fill(null).map(() => InventoryFactory.build(overrides));
  },
};
```

### B2. Complex Factory (với relations)

```typescript
// test/factories/order.factory.ts

export const OrderFactory = {
  build(overrides: Partial<CreateOrderDto> = {}): CreateOrderDto {
    return {
      customerId: faker.string.uuid(),
      deliveryAddress: {
        street: faker.location.streetAddress(),
        ward: faker.location.county(),
        district: faker.location.county(),
        city: faker.location.city(),
      },
      items: Array(faker.number.int({ min: 1, max: 5 })).fill(null).map(() => ({
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        unitPrice: faker.number.float({ min: 10000, max: 5000000, fractionDigits: 0 }),
        discountPercent: faker.number.float({ min: 0, max: 30, fractionDigits: 1 }),
      })),
      notes: faker.helpers.maybe(() => faker.lorem.sentence()),
      ...overrides,
    };
  },

  buildWithItems(
    items: Partial<OrderItemDto>[],
    overrides: Partial<CreateOrderDto> = {}
  ): CreateOrderDto {
    return OrderFactory.build({
      items: items.map(item => ({
        productId: faker.string.uuid(),
        quantity: 1,
        unitPrice: 100000,
        discountPercent: 0,
        ...item,
      })),
      ...overrides,
    });
  },
};
```

---

## C. Test Setup Helpers

### C1. Test Application Setup

```typescript
// test/helpers/test-app.ts
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';

let testApp: Express;
let testPrismaClient: PrismaClient;

export async function createTestApp(): Promise<Express> {
  if (!testApp) {
    testApp = await createApp({
      database: { url: process.env.DATABASE_URL! },
      jwt: { secret: 'test-secret', expiresIn: '1h' },
    });
  }
  return testApp;
}

export function getTestPrisma(): PrismaClient {
  if (!testPrismaClient) {
    testPrismaClient = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  return testPrismaClient;
}

// Generate JWT token cho test
export function testToken(
  role: 'ADMIN' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_STAFF' | 'SALES_STAFF' = 'ADMIN',
  overrides: Record<string, unknown> = {}
): string {
  return jwt.sign(
    {
      sub: faker.string.uuid(),
      email: faker.internet.email(),
      roles: [role],
      warehouseId: faker.string.uuid(),
      ...overrides,
    },
    'test-secret',
    { expiresIn: '1h' }
  );
}
```

### C2. Database Cleanup Helpers

```typescript
// test/helpers/db-cleanup.ts

// Truncate tất cả tables sau mỗi test suite
export async function cleanupAllTables(prisma: PrismaClient): Promise<void> {
  const tableNames = [
    'audit_logs', 'order_items', 'orders',
    'inventory_lots', 'inventory', 'products',
    'customers', 'users',
  ];
  for (const table of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }
}

// Transaction-based rollback (tốt hơn truncate cho unit tests)
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  // Rollback sau khi test — không để lại data
  return prisma.$transaction(async (tx) => {
    const result = await fn(tx);
    throw new RollbackError(result); // Force rollback
  }).catch((e) => {
    if (e instanceof RollbackError) return e.result as T;
    throw e;
  });
}

class RollbackError extends Error {
  constructor(public result: unknown) { super('rollback'); }
}
```

---

## D. Test Coverage Configuration

### D1. Jest Config

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',           // Entry point
    '!src/**/*.mock.ts',      // Mocks
    '!src/migrations/**',     // Migrations
  ],
  coverageThresholds: {
    global: {
      lines: 80,      // ≥80% line coverage
      branches: 70,   // ≥70% branch coverage
      functions: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterFramework: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

### D2. Test Organization

```
test/
├── setup.ts              # Global test setup (env vars, DB connection)
├── helpers/
│   ├── test-app.ts       # App factory + JWT helpers
│   └── db-cleanup.ts     # DB truncate/rollback helpers
├── factories/
│   ├── inventory.factory.ts
│   ├── order.factory.ts
│   └── customer.factory.ts
├── unit/                 # Unit tests (mock dependencies)
│   ├── inventory.service.test.ts
│   └── order.service.test.ts
└── integration/          # Integration tests (real DB)
    ├── inventory.test.ts
    ├── order.test.ts
    └── auth.test.ts
```

---

## E. TC → Test Mapping Table

Sau khi generate tests, tạo mapping table để traceability:

```
| TC-ID | Test File | Test Name | Status |
|-------|-----------|-----------|--------|
| TC-INV-001-01 | integration/inventory.test.ts | should create inventory... | ✅ Implemented |
| TC-INV-001-02 | integration/inventory.test.ts | should return 409... | ✅ Implemented |
| TC-INV-001-03 | integration/inventory.test.ts | should return 400... | ✅ Implemented |
| TC-ORD-005-01 | unit/order.service.test.ts | should calculate total... | ✅ Implemented |
| TC-ORD-005-02 | unit/order.service.test.ts | should throw BR-INV-015... | ✅ Implemented |
```

**Quy tắc:**
- Mọi TC từ TEST-{MOD}.md phải có ít nhất 1 test tương ứng
- TC Happy path → Integration test (API level)
- TC Error/Edge case → có thể là Unit test hoặc Integration test
- TC Business logic → Unit test (Service level)
