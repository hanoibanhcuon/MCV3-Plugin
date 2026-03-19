# Multi-System Design — Tech-Design Reference

Hướng dẫn **thiết kế kiến trúc đa system** — dependency analysis, build order, shared services.

---

## A. System Dependency Analysis

### A1. Data Dependencies (Đúng vs Sai)

**❌ SAI — Direct DB access giữa systems:**
```
System A (Order) truy cập trực tiếp bảng `products` của System B (Inventory)
→ Tạo tight coupling, khó maintain, khó scale độc lập
```

**✅ ĐÚNG — API call giữa systems:**
```
System A (Order) gọi API của System B: GET /api/v1/inventory/products/{id}
→ Loose coupling, có thể deploy độc lập, có contract rõ ràng
```

**✅ ĐÚNG — Event-driven (cho async data sync):**
```
System B emit event: "product.price_updated"
System A listen và cập nhật local cache/denormalized data
→ Eventual consistency, không blocking
```

---

### A2. Shared Data Ownership (Master Data)

**Quy tắc:** Mỗi entity chỉ có **1 system sở hữu** (Single Source of Truth).

```
Master Data Owner:
  - Users/Auth     → AUTH service (tất cả systems validate JWT từ đây)
  - Products       → CATALOG system (Inventory, Order, Sales đều đọc qua API)
  - Customers      → CRM system (Order, Finance đọc qua API hoặc denormalize)
  - Warehouse/Locations → WMS system

Derived/Dependent Data:
  - Order.productName (snapshot tại thời điểm đặt hàng — intentional denormalization)
  - Inventory.reservedQty (tính từ confirmed orders — owned by Inventory)
```

---

### A3. Cross-System Data Flow Diagram

```
Ví dụ: E-Commerce multi-system

                    ┌──────────────┐
                    │  AUTH/IAM    │  ← Tất cả systems validate JWT
                    │  Service     │    không cần gọi auth lại
                    └──────┬───────┘
                           │ JWT Token
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   CATALOG     │  │    ORDER      │  │   INVENTORY   │
│   System      │  │    System     │  │    System     │
│  (Products)   │  │  (Orders)     │  │   (Stock)     │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │ product.created  │ order.confirmed   │ stock.low
        └──────────────────┴──────────────────►│
                            Event Bus           │
                                                ▼
                                        ┌───────────────┐
                                        │  NOTIFICATION │
                                        │   Service     │
                                        └───────────────┘
```

---

## B. Build Order Algorithm

Khi có nhiều systems, cần xác định thứ tự build/deploy để tránh dependency conflicts.

### B1. Layer-based Build Order

```
Layer 0 — Foundation (không phụ thuộc vào system nào khác):
  - Auth Service (JWT issuance + validation)
  - Shared Types / API Contracts package
  - Database setup (migrations)
  - Infrastructure (Redis, RabbitMQ/Kafka, S3)

Layer 1 — Core Data (phụ thuộc Layer 0):
  - Catalog/Product System (master data)
  - Customer/CRM System (master data)
  - User Management (nếu tách riêng khỏi Auth)

Layer 2 — Business Logic (phụ thuộc Layer 0 + 1):
  - Inventory System (phụ thuộc Catalog)
  - Order System (phụ thuộc Catalog + Customer + Inventory)
  - Finance/Accounting (phụ thuộc Order)

Layer 3 — Integration/Orchestration (phụ thuộc tất cả):
  - Notification Service (lắng nghe events từ mọi systems)
  - Reporting/Analytics (đọc từ nhiều systems)
  - API Gateway (aggregate nhiều services)

Layer 4 — Frontend (phụ thuộc tất cả backend):
  - Web App (React/Next.js)
  - Mobile App (React Native/Flutter)
  - Admin Dashboard
```

### B2. Dependency Detection

Từ `_config.json` và MODSPEC INT-{SYS}-NNN, xác định dependencies:

```
Đọc tất cả INT-{SYS}-NNN specs trong mọi MODSPECs
→ Mỗi INT spec chỉ ra: System A calls System B's API hoặc listens to System B's events
→ Build dependency graph
→ Topological sort → build order

Ví dụ:
  INT-ORD-001: Order calls Catalog API → Order depends on Catalog
  INT-ORD-002: Order listens to Inventory events → Order depends on Inventory
  INT-INV-001: Inventory listens to Catalog events → Inventory depends on Catalog

Graph:
  Auth ← (nothing) → Layer 0
  Catalog ← Auth → Layer 1
  Inventory ← Catalog → Layer 2
  Order ← Catalog, Inventory → Layer 2
  Notification ← Order, Inventory → Layer 3
  Web ← Order, Catalog → Layer 4
```

### B3. Parallel Build Opportunities

```
Trong cùng Layer, các systems có thể build/deploy song song:

Layer 0: Auth || SharedTypes || DB-setup (song song)
Layer 1: Catalog || CRM (song song — không phụ thuộc nhau)
Layer 2: Inventory || Order (song song SAU KHI Layer 1 done)
          ⚠️ Nếu Order depends on Inventory → Inventory trước Order
Layer 3: Notification (sau khi tất cả Layer 2 done)
Layer 4: Web || Mobile (song song sau Layer 3)
```

---

## C. Shared Services Patterns

### C1. Centralized Auth

```
Cách 1 — Centralized Token Validation (khuyến nghị cho monorepo):
  - Auth Service issue JWT
  - Mọi service verify JWT locally bằng public key (không gọi Auth service)
  - JWT chứa: { sub, email, roles, permissions, warehouseId, ... }
  - Refresh token flow: client gọi Auth Service khi access token expire

Cách 2 — Auth Gateway (khuyến nghị cho microservices lớn):
  - API Gateway verify JWT trước khi forward request
  - Services nhận user info từ header đã được Gateway inject
  - Headers: X-User-Id, X-User-Roles, X-Tenant-Id
```

### C2. API Gateway

```
Khi nào cần API Gateway:
  - 3+ backend services exposed ra internet
  - Cần: rate limiting tập trung, auth tập trung, request logging
  - Frontend gọi nhiều backends → cần aggregate

Không cần API Gateway khi:
  - Monolith hoặc 1-2 services
  - Microservices internal chỉ call lẫn nhau
  - BFF (Backend for Frontend) pattern đã đủ
```

### C3. Distributed Transaction — Saga Pattern

```
Khi 1 business operation span nhiều services, dùng Saga:

Choreography Saga (dùng Events — đơn giản hơn):
  1. Order Service: create order → emit "order.created"
  2. Inventory Service: listen "order.created" → reserve stock → emit "stock.reserved"
  3. Payment Service: listen "stock.reserved" → charge → emit "payment.completed"
  4. Order Service: listen "payment.completed" → confirm order

  Compensation (rollback):
  - Payment fail → emit "payment.failed"
  - Inventory: listen "payment.failed" → release reserved stock
  - Order: listen "payment.failed" → cancel order

Orchestration Saga (dùng Orchestrator — phức tạp hơn nhưng dễ debug):
  - Order Saga Orchestrator điều phối tất cả steps
  - Gọi từng service theo thứ tự
  - Xử lý compensating transactions khi có lỗi
```

---

## D. Event-Driven Integration

### D1. Domain Event Format chuẩn

```typescript
// Tất cả events trong project phải theo format này
interface DomainEvent<T = unknown> {
  eventId: string;       // UUID — để dedup
  eventType: string;     // 'order.confirmed', 'inventory.stock_updated'
  version: string;       // '1.0' — cho backward compat
  timestamp: string;     // ISO 8601
  aggregateId: string;   // ID của entity gây ra event
  aggregateType: string; // 'Order', 'Inventory'
  data: T;               // Payload
  metadata: {
    correlationId: string;  // Request ID (tracing)
    causationId?: string;   // Event ID gây ra event này
    userId?: string;        // User thực hiện action
    tenantId?: string;      // Multi-tenant
  };
}

// Ví dụ:
const event: DomainEvent<{ orderId: string; amount: number }> = {
  eventId: 'evt-uuid-001',
  eventType: 'order.confirmed',
  version: '1.0',
  timestamp: new Date().toISOString(),
  aggregateId: 'ord-uuid-123',
  aggregateType: 'Order',
  data: { orderId: 'ord-uuid-123', amount: 1500000 },
  metadata: {
    correlationId: 'req-abc-789',
    userId: 'user-uuid-456',
  },
};
```

### D2. Shared Event Topics/Channels

Đặt tên topic theo convention: `{system}.{entity}.{action}`

```
Auth events:
  auth.user.created
  auth.user.deactivated

Catalog events:
  catalog.product.created
  catalog.product.price_updated
  catalog.product.deactivated

Inventory events:
  inventory.stock.updated
  inventory.stock.low_alert
  inventory.grn.approved

Order events:
  order.created
  order.confirmed
  order.shipped
  order.delivered
  order.cancelled

Payment events:
  payment.completed
  payment.failed
  payment.refunded
```

---

## E. Shared Types Package

```
Cho monorepo — tạo @{project}/shared-types package:

packages/shared-types/
├── src/
│   ├── events/
│   │   ├── domain-event.ts      # DomainEvent interface
│   │   ├── order-events.ts      # OrderCreated, OrderConfirmed, ...
│   │   ├── inventory-events.ts  # StockUpdated, StockLow, ...
│   │   └── index.ts
│   ├── dtos/
│   │   ├── pagination.ts        # PaginatedResult, PaginationFilter
│   │   ├── response.ts          # ApiResponse<T>, ErrorResponse
│   │   └── index.ts
│   ├── errors/
│   │   ├── base-errors.ts       # BusinessRuleError, NotFoundError, ...
│   │   └── index.ts
│   └── index.ts
└── package.json
```

---

## F. API Contract Testing (Pact.js)

```typescript
// Consumer-driven contracts: Order service → Catalog service

// 1. Consumer (Order) định nghĩa expectations
// test/contract/catalog.consumer.test.ts
describe('Order → Catalog contract', () => {
  it('should get product by ID', async () => {
    await provider.addInteraction({
      state: 'Product prod-001 exists',
      uponReceiving: 'a request for product prod-001',
      withRequest: {
        method: 'GET',
        path: '/api/v1/catalog/products/prod-001',
        headers: { Authorization: like('Bearer token') },
      },
      willRespondWith: {
        status: 200,
        body: {
          success: true,
          data: {
            id: like('prod-001'),
            name: like('Product Name'),
            price: like(50000),
            status: term({ generate: 'ACTIVE', matcher: 'ACTIVE|INACTIVE' }),
          },
        },
      },
    });

    const result = await catalogClient.getProduct('prod-001');
    expect(result.id).toBeDefined();
  });
});

// 2. Provider (Catalog) verify contracts
// Catalog service chạy Pact verifier để đảm bảo API đúng contract
```
