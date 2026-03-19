# Query Patterns — Code-Gen Reference

Hướng dẫn sinh **database queries thực** từ TBL specs (dùng trong IMPLEMENT mode).

---

## A. Prisma CRUD Patterns

### A1. Create

```typescript
// Tạo đơn giản
const item = await prisma.{table}.create({
  data: {
    field1: dto.field1,
    field2: dto.field2,
    createdBy: userId,
    updatedBy: userId,
  },
});

// Tạo với nested relation (1-nhiều)
const order = await prisma.order.create({
  data: {
    customerId: dto.customerId,
    status: 'DRAFT',
    createdBy: userId,
    updatedBy: userId,
    items: {
      create: dto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    },
  },
  include: { items: true }, // Trả về cả nested
});

// createMany — bulk insert (không trả về records)
await prisma.{table}.createMany({
  data: dto.items.map(item => ({ ...item, createdBy: userId })),
  skipDuplicates: true, // Bỏ qua nếu đã tồn tại (unique conflict)
});
```

---

### A2. FindMany — Filter, Sort, Pagination, Include

```typescript
// Cơ bản với pagination và soft delete
const items = await prisma.{table}.findMany({
  where: {
    deletedAt: null,           // BẮT BUỘC — soft delete filter
    status: filter.status,     // Filter đơn
  },
  orderBy: { createdAt: 'desc' },
  skip: (filter.page - 1) * filter.limit,
  take: filter.limit,
});

// Với count (chạy song song để tối ưu)
const where = buildWhereClause(filter); // Extract để dùng lại
const [items, total] = await Promise.all([
  prisma.{table}.findMany({
    where,
    orderBy: buildOrderBy(filter.sortBy, filter.sortOrder),
    skip: (filter.page - 1) * filter.limit,
    take: filter.limit,
    include: {
      relatedModel: true,           // 1-1 relation
      items: { where: { deletedAt: null } }, // 1-N với filter
      _count: { select: { items: true } },   // Đếm relations
    },
    select: {                       // Projection (chọn fields cần thiết)
      id: true,
      name: true,
      status: true,
      createdAt: true,
      // KHÔNG select password, sensitive fields
    },
  }),
  prisma.{table}.count({ where }),
]);

// Multi-value filter (IN clause)
where: {
  status: { in: filter.statuses },         // IN ['ACTIVE', 'PENDING']
  categoryId: { in: filter.categoryIds },
}

// Range filter
where: {
  createdAt: {
    gte: filter.dateFrom,  // >=
    lte: filter.dateTo,    // <=
  },
  amount: {
    gte: filter.minAmount,
    lte: filter.maxAmount,
  },
}

// Full-text search (PostgreSQL)
where: {
  OR: [
    { name: { contains: filter.q, mode: 'insensitive' } },
    { code: { contains: filter.q, mode: 'insensitive' } },
    { description: { contains: filter.q, mode: 'insensitive' } },
  ],
}

// Nested filter (relation condition)
where: {
  deletedAt: null,
  customer: {           // Filter qua relation
    email: { endsWith: '@company.com' },
  },
  items: {
    some: {             // Có ít nhất 1 item thỏa điều kiện
      status: 'PENDING',
    },
  },
}
```

---

### A3. FindUnique / FindFirst

```typescript
// findUnique — tìm theo PK hoặc unique field
const item = await prisma.{table}.findUnique({
  where: { id },
  include: { relatedModel: true },
});

// Composite unique
const item = await prisma.{table}.findUnique({
  where: { userId_productId: { userId, productId } }, // Composite key
});

// findFirst — tìm item đầu tiên thỏa điều kiện (không cần unique)
const item = await prisma.{table}.findFirst({
  where: { sku, deletedAt: null },
  orderBy: { createdAt: 'desc' },
});
```

---

### A4. Update / UpdateMany

```typescript
// Update 1 record
const updated = await prisma.{table}.update({
  where: { id },
  data: {
    ...dto,
    updatedBy: userId,
    updatedAt: new Date(), // Prisma auto-update nếu có @updatedAt
  },
});

// Update với nested (upsert items)
const updated = await prisma.order.update({
  where: { id: orderId },
  data: {
    status: dto.status,
    updatedBy: userId,
    items: {
      upsert: dto.items.map(item => ({
        where: { id: item.id ?? '' },
        create: { productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice },
        update: { quantity: item.quantity, unitPrice: item.unitPrice },
      })),
      deleteMany: {   // Xóa items không còn trong list
        id: { notIn: dto.items.map(i => i.id).filter(Boolean) as string[] },
      },
    },
  },
  include: { items: true },
});

// UpdateMany — bulk update
await prisma.{table}.updateMany({
  where: { status: 'PENDING', createdAt: { lt: cutoffDate } },
  data: { status: 'EXPIRED', updatedBy: 'system' },
});

// Increment/Decrement
await prisma.inventory.update({
  where: { id: inventoryId },
  data: {
    quantity: { increment: amount },  // atomic increment
    updatedBy: userId,
  },
});

// Decrement với floor check
await prisma.$executeRaw`
  UPDATE inventory
  SET quantity = GREATEST(0, quantity - ${amount}),
      updated_by = ${userId},
      updated_at = NOW()
  WHERE id = ${inventoryId} AND deleted_at IS NULL
`;
```

---

### A5. Soft Delete

```typescript
// Soft delete — ĐÂY LÀ PATTERN CHUẨN, không dùng delete()
const deleted = await prisma.{table}.update({
  where: { id },
  data: {
    deletedAt: new Date(),
    updatedBy: userId,
  },
});

// Restore (nếu có tính năng khôi phục)
const restored = await prisma.{table}.update({
  where: { id },
  data: {
    deletedAt: null,
    updatedBy: userId,
  },
});

// Kiểm tra trước khi soft delete
const item = await prisma.{table}.findUnique({
  where: { id, deletedAt: null },
});
if (!item) throw new NotFoundError('{Mod}', id);
```

---

### A6. Aggregation

```typescript
// Aggregate — tính toán thống kê
const stats = await prisma.orderItem.aggregate({
  where: { orderId, deletedAt: null },
  _sum: { quantity: true, totalPrice: true },
  _count: { id: true },
  _avg: { unitPrice: true },
  _min: { unitPrice: true },
  _max: { unitPrice: true },
});
const totalAmount = stats._sum.totalPrice ?? 0;

// GroupBy — nhóm theo field
const salesByMonth = await prisma.order.groupBy({
  by: ['status'],
  where: { deletedAt: null, createdAt: { gte: startDate } },
  _count: { id: true },
  _sum: { totalAmount: true },
  orderBy: { _count: { id: 'desc' } },
});

// Raw aggregation (phức tạp hơn — dùng $queryRaw)
const inventoryByWarehouse = await prisma.$queryRaw<Array<{ warehouse_id: string; total_qty: number }>>`
  SELECT warehouse_id, SUM(quantity) as total_qty
  FROM inventory_lots
  WHERE deleted_at IS NULL
  GROUP BY warehouse_id
  ORDER BY total_qty DESC
`;
```

---

### A7. Transaction

```typescript
// $transaction — atomic operations
const result = await prisma.$transaction(async (tx) => {
  // Tất cả operations trong này chạy trong 1 transaction
  const order = await tx.order.update({
    where: { id: orderId },
    data: { status: 'CONFIRMED' },
  });

  await tx.inventory.update({
    where: { id: inventoryId },
    data: { quantity: { decrement: qty } },
  });

  await tx.auditLog.create({
    data: { entityType: 'order', entityId: orderId, action: 'confirm', userId },
  });

  return order;
});

// Interactive transaction với timeout
const result = await prisma.$transaction(
  async (tx) => {
    // ...complex logic
  },
  {
    maxWait: 5000,  // Đợi tối đa 5s để lấy connection
    timeout: 10000, // Transaction timeout 10s
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
);
```

---

### A8. N+1 Prevention

```typescript
// ❌ SAI — N+1 problem
const orders = await prisma.order.findMany({ where: { deletedAt: null } });
for (const order of orders) {
  // N queries thêm!
  const customer = await prisma.customer.findUnique({ where: { id: order.customerId } });
}

// ✅ ĐÚNG — Eager loading với include
const orders = await prisma.order.findMany({
  where: { deletedAt: null },
  include: {
    customer: true,          // 1 query thêm (JOIN)
    items: {
      include: {
        product: true,       // Nested include
      },
    },
  },
});

// ✅ ĐÚNG — Select chỉ fields cần (performance)
const orders = await prisma.order.findMany({
  where: { deletedAt: null },
  select: {
    id: true,
    status: true,
    totalAmount: true,
    customer: {
      select: { id: true, name: true, email: true }, // Không load toàn bộ customer
    },
  },
});
```

---

## B. SQLAlchemy Patterns (Python)

### B1. CRUD cơ bản

```python
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_
from datetime import datetime

# Create
def create_{mod}(db: Session, dto: Create{Mod}Schema, user_id: str) -> {Mod}:
    db_item = {Mod}(
        **dto.model_dump(),
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# FindAll với pagination + filter
def find_all_{mod}s(
    db: Session,
    filter: {Mod}FilterSchema,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[{Mod}], int]:
    query = (
        select({Mod})
        .where({Mod}.deleted_at.is_(None))  # Soft delete filter
    )

    # Dynamic filters
    if filter.status:
        query = query.where({Mod}.status == filter.status)
    if filter.q:
        query = query.where(
            or_(
                {Mod}.name.ilike(f'%{filter.q}%'),
                {Mod}.code.ilike(f'%{filter.q}%'),
            )
        )

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = db.scalars(
        query.order_by({Mod}.created_at.desc())
             .offset((page - 1) * limit)
             .limit(limit)
    ).all()

    return items, total

# Update
def update_{mod}(db: Session, id: str, dto: Update{Mod}Schema, user_id: str) -> {Mod}:
    item = db.get({Mod}, id)
    if not item or item.deleted_at:
        raise NotFoundException('{Mod}', id)

    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.updated_by = user_id
    item.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(item)
    return item

# Soft delete
def soft_delete_{mod}(db: Session, id: str, user_id: str) -> None:
    item = db.get({Mod}, id)
    if not item or item.deleted_at:
        raise NotFoundException('{Mod}', id)
    item.deleted_at = datetime.utcnow()
    item.updated_by = user_id
    db.commit()
```

### B2. Transaction (Python)

```python
from sqlalchemy.orm import Session

def process_order_fulfillment(db: Session, order_id: str, user_id: str):
    # SQLAlchemy session tự quản lý transaction
    try:
        order = db.get(Order, order_id)
        # ... business logic

        for item in order.items:
            inventory = db.query(Inventory).filter(
                and_(Inventory.product_id == item.product_id, Inventory.deleted_at.is_(None))
            ).with_for_update().first()  # Pessimistic lock

            if inventory.quantity < item.quantity:
                raise BusinessRuleError('BR-INV-015', f'Không đủ tồn kho')

            inventory.quantity -= item.quantity

        order.status = 'SHIPPED'
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise
```

---

## C. Complex Query Patterns

### C1. Raw SQL (khi Prisma/SQLAlchemy không đủ)

```typescript
// Prisma $queryRaw — dùng Prisma.sql để tránh SQL injection
import { Prisma } from '@prisma/client';

const result = await prisma.$queryRaw<InventoryReport[]>(
  Prisma.sql`
    SELECT
      p.id          AS product_id,
      p.name        AS product_name,
      p.sku,
      COALESCE(SUM(il.quantity), 0) AS total_quantity,
      COALESCE(SUM(il.quantity * il.unit_cost), 0) AS total_value,
      CASE
        WHEN COALESCE(SUM(il.quantity), 0) < p.min_stock THEN 'LOW'
        WHEN COALESCE(SUM(il.quantity), 0) = 0 THEN 'OUT'
        ELSE 'OK'
      END AS stock_status
    FROM products p
    LEFT JOIN inventory_lots il
      ON il.product_id = p.id AND il.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
      AND (${filter.warehouseId}::uuid IS NULL OR il.warehouse_id = ${filter.warehouseId}::uuid)
    GROUP BY p.id, p.name, p.sku, p.min_stock
    ORDER BY total_quantity ASC
    LIMIT ${filter.limit} OFFSET ${(filter.page - 1) * filter.limit}
  `
);
```

### C2. Window Functions

```typescript
// Ranking, running totals, lead/lag
const salesRanking = await prisma.$queryRaw<SalesRank[]>(
  Prisma.sql`
    SELECT
      s.salesperson_id,
      SUM(o.total_amount) AS total_sales,
      RANK() OVER (ORDER BY SUM(o.total_amount) DESC) AS rank,
      SUM(SUM(o.total_amount)) OVER () AS grand_total
    FROM orders o
    JOIN salespeople s ON s.id = o.salesperson_id
    WHERE o.status = 'DELIVERED'
      AND o.created_at >= ${startDate}
      AND o.created_at < ${endDate}
      AND o.deleted_at IS NULL
    GROUP BY s.salesperson_id
  `
);
```

---

## D. Index Hints & Performance

```typescript
// Kiểm tra query có dùng index không (Prisma explain)
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM {table}
  WHERE status = 'ACTIVE' AND deleted_at IS NULL
  ORDER BY created_at DESC
`;

// Index cần tạo cho các filter thường dùng:
// CREATE INDEX idx_{table}_status ON {table}(status) WHERE deleted_at IS NULL;
// CREATE INDEX idx_{table}_created_at ON {table}(created_at DESC);
// CREATE INDEX idx_{table}_compound ON {table}(status, created_at DESC) WHERE deleted_at IS NULL;
```

---

## E. Helper Functions chuẩn

```typescript
// Build where clause từ filter object (tái sử dụng)
function buildWhereClause(filter: {Mod}FilterDto): Prisma.{Mod}WhereInput {
  const where: Prisma.{Mod}WhereInput = { deletedAt: null };

  if (filter.status) where.status = filter.status;
  if (filter.statuses?.length) where.status = { in: filter.statuses };
  if (filter.q) {
    where.OR = [
      { name: { contains: filter.q, mode: 'insensitive' } },
      { code: { contains: filter.q, mode: 'insensitive' } },
    ];
  }
  if (filter.dateFrom || filter.dateTo) {
    where.createdAt = {
      ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
      ...(filter.dateTo && { lte: new Date(filter.dateTo) }),
    };
  }

  return where;
}

// Build orderBy
function buildOrderBy(
  sortBy = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Prisma.{Mod}OrderByWithRelationInput {
  const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'status'] as const;
  const field = ALLOWED_SORT_FIELDS.includes(sortBy as any) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
}
```
