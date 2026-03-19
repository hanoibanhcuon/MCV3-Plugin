# Data Modeling Guide — Hướng dẫn thiết kế Database Schema chuẩn MCV3

## 1. Quy tắc đặt tên

### Bảng (Tables)
```sql
-- Format: snake_case, số nhiều, danh từ
✅ orders, order_items, inventory_lots, purchase_orders
✅ user_roles, product_categories, warehouse_locations
❌ Order, tblOrders, order_tbl, ORDER
```

### Cột (Columns)
```sql
-- Format: snake_case
id, created_at, updated_at, deleted_at
user_id, product_id, order_id      -- Foreign keys
grn_number, po_number              -- Business identifiers
is_active, is_deleted              -- Boolean flags
status, type                       -- Enum fields
notes, description                 -- Text fields
```

### Indexes
```sql
-- Format: idx_{table}_{columns}
idx_orders_customer_id
idx_orders_status_created_at
idx_products_sku                    -- Unique index
idx_inventory_lots_product_location
```

---

## 2. Mandatory Columns

Mọi bảng trong MCV3 system PHẢI có:

```sql
CREATE TABLE {table_name} (
  -- Primary key
  id          UUID          NOT NULL DEFAULT gen_random_uuid(),

  -- Audit columns
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by  UUID          NULL REFERENCES users(id),
  updated_by  UUID          NULL REFERENCES users(id),

  -- Soft delete (optional nhưng khuyến nghị)
  deleted_at  TIMESTAMPTZ   NULL,
  deleted_by  UUID          NULL REFERENCES users(id),

  PRIMARY KEY (id)
);

-- Auto-update updated_at
CREATE TRIGGER update_{table_name}_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Data Types Guide

### PostgreSQL Types (Khuyến nghị)

| Dữ liệu | Type | Ghi chú |
|---------|------|---------|
| ID | UUID | Dùng `gen_random_uuid()` |
| Text ngắn | VARCHAR(N) | Giới hạn rõ ràng |
| Text dài | TEXT | Không giới hạn |
| Số nguyên | BIGINT | Tránh INT overflow |
| Tiền tệ | NUMERIC(15,2) | Không dùng FLOAT! |
| Phần trăm | NUMERIC(5,2) | VD: 99.99 |
| Số lượng | NUMERIC(10,3) | Cho phép phân số |
| Boolean | BOOLEAN | NOT NULL, có DEFAULT |
| Datetime | TIMESTAMPTZ | Luôn có timezone! |
| Date only | DATE | Không có timezone |
| JSON | JSONB | Indexed JSON |
| Enum | VARCHAR + CHECK | Hoặc PostgreSQL ENUM |
| IP address | INET | PostgreSQL native |
| Array | ARRAY hoặc JSON | Cân nhắc normalize |

### MySQL Types

| Dữ liệu | Type |
|---------|------|
| ID | VARCHAR(36) hoặc BINARY(16) |
| Tiền tệ | DECIMAL(15,2) |
| Datetime | DATETIME(3) hoặc TIMESTAMP |
| JSON | JSON (MySQL 5.7+) |
| Boolean | TINYINT(1) |

---

## 4. Normalization Levels

### 3NF (Third Normal Form) — Mục tiêu chuẩn

```sql
-- ❌ Không chuẩn hóa (1NF vi phạm)
orders: id, items_json, customer_name, customer_email, customer_phone

-- ✅ Đã chuẩn hóa
customers: id, name, email, phone
orders: id, customer_id, status, ...
order_items: id, order_id, product_id, quantity, unit_price
```

### Khi nào được phép denormalize

```
Được phép khi:
1. Read performance quan trọng hơn write performance
2. Field không bao giờ thay đổi (tên/giá tại thời điểm order)
3. Reporting tables (data warehouse)

Ví dụ hợp lệ:
order_items.unit_price_snapshot  -- Giá tại thời điểm đặt hàng
order_items.product_name_snapshot  -- Tên sản phẩm tại thời điểm đặt
```

---

## 5. Relationship Patterns

### One-to-Many (1:N) — Phổ biến nhất

```sql
-- Parent
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  ...
);

-- Child
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  ...
);

-- Index FK columns
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### Many-to-Many (N:N) — Junction Table

```sql
-- Junction table
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),

  PRIMARY KEY (user_id, role_id)
);
```

### Self-Referencing (Tree/Hierarchy)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  parent_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  path TEXT,  -- Materialized path: "root/parent/child"
  ...
);

-- Hoặc dùng ltree extension (PostgreSQL)
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  path LTREE NOT NULL,  -- VD: "food.beverages.soft_drinks"
  ...
);
```

---

## 6. Enumeration Patterns

### Approach 1: Lookup Table (Khuyến nghị)

```sql
-- Linh hoạt, có thể add value mà không cần migrate schema
CREATE TABLE order_statuses (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

INSERT INTO order_statuses VALUES
  ('pending', 'Chờ xử lý', null, false, 1),
  ('processing', 'Đang xử lý', null, false, 2),
  ('completed', 'Hoàn thành', null, true, 3),
  ('cancelled', 'Đã hủy', null, true, 4);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    REFERENCES order_statuses(code),
  ...
);
```

### Approach 2: CHECK Constraint

```sql
-- Đơn giản, ít tables hơn
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  ...
);
```

---

## 7. Indexing Strategy

### Khi nào cần index

```sql
-- 1. Foreign Keys (luôn luôn)
CREATE INDEX idx_{table}_fk ON {table}(foreign_key_column);

-- 2. WHERE clause thường dùng
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- 3. Composite index (thứ tự quan trọng: filter trước, sort sau)
-- Query: WHERE tenant_id = ? AND status = ? ORDER BY created_at
CREATE INDEX idx_orders_tenant_status_date ON orders(tenant_id, status, created_at DESC);

-- 4. Unique constraints
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- 5. Partial index (hiệu quả hơn full index)
CREATE INDEX idx_orders_pending ON orders(created_at)
  WHERE status = 'pending';
```

### Khi nào KHÔNG nên index

```
❌ Columns có cardinality thấp (boolean, status với ít values)
❌ Columns hiếm được query
❌ Tables nhỏ (< 10,000 rows)
❌ Columns thường xuyên update (index overhead khi write)
```

---

## 8. Multi-tenancy Patterns

### Pattern 1: Shared Database, Shared Schema (Row-level)

```sql
-- Thêm tenant_id vào mọi bảng
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),  -- Row-level isolation
  ...
);

-- Composite index với tenant_id đầu tiên
CREATE INDEX idx_orders_tenant ON orders(tenant_id, created_at DESC);

-- Row Level Security (PostgreSQL)
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### Pattern 2: Separate Schemas (Schema-per-tenant)

```sql
-- Mỗi tenant có schema riêng
CREATE SCHEMA tenant_abc;
CREATE TABLE tenant_abc.orders (...);
```

---

## 9. Audit Trail Pattern

```sql
-- Bảng audit log riêng
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_columns TEXT[],
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index để tìm theo record
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
```

---

## 10. Database Migration Best Practices

```sql
-- Format file: V{version}__{description}.sql
-- Ví dụ: V001__create_warehouse_tables.sql

-- Mỗi migration:
-- 1. Chỉ làm 1 việc (1 table hoặc 1 feature)
-- 2. Backward compatible nếu có thể
-- 3. Có rollback script tương ứng

-- ✅ Safe migration (backward compatible)
ALTER TABLE products ADD COLUMN weight_kg NUMERIC(10,3) NULL;

-- ✅ Zero-downtime: Thêm cột nullable trước, backfill sau
ALTER TABLE orders ADD COLUMN new_status VARCHAR(50) NULL;
UPDATE orders SET new_status = status;  -- Backfill
ALTER TABLE orders ALTER COLUMN new_status SET NOT NULL;
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders RENAME COLUMN new_status TO status;

-- ❌ Breaking migration (cần maintenance window)
ALTER TABLE orders RENAME COLUMN total TO total_amount;  -- Breaks existing code
ALTER TABLE products DROP COLUMN description;           -- Data loss
```

---

## 11. Performance Patterns

### Eager Loading vs Lazy Loading

```typescript
// ❌ N+1 problem
const orders = await Order.findAll();
for (const order of orders) {
  const items = await order.getItems(); // N queries!
}

// ✅ Eager loading
const orders = await Order.findAll({
  include: [{ model: OrderItem, include: [Product] }]
});

// ✅ Raw SQL với JOIN khi cần performance
const result = await db.query(`
  SELECT o.*, oi.quantity, p.name as product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.customer_id = $1
`, [customerId]);
```

### Connection Pooling

```
Development: min=1, max=5
Staging: min=2, max=10
Production: min=5, max=50 (tuỳ workload)
```
