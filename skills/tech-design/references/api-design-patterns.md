# API Design Patterns — Hướng dẫn thiết kế RESTful API chuẩn MCV3

## 1. URL Naming Conventions

### Resource Naming

```
✅ Đúng:
GET    /api/v1/orders              # Danh sách
POST   /api/v1/orders              # Tạo mới
GET    /api/v1/orders/{id}         # Chi tiết
PUT    /api/v1/orders/{id}         # Update toàn bộ
PATCH  /api/v1/orders/{id}         # Update một phần
DELETE /api/v1/orders/{id}         # Xóa

✅ Nested Resources:
GET    /api/v1/orders/{id}/items   # Line items của order
POST   /api/v1/orders/{id}/items   # Thêm item vào order

❌ Sai:
GET    /api/v1/getOrders           # Không dùng verb trong URL
POST   /api/v1/createOrder         # Không dùng action trong URL
GET    /api/v1/order               # Luôn dùng danh từ số nhiều
```

### Versioning

```
/api/v1/...     # Production stable
/api/v2/...     # Breaking changes
/api/v1-beta/...  # Preview (nếu cần)

KHÔNG dùng:
/api/latest/... # Không stable
```

---

## 2. HTTP Methods Semantics

| Method | Idempotent | Safe | Dùng khi |
|--------|-----------|------|---------|
| GET | ✅ | ✅ | Đọc dữ liệu, không thay đổi state |
| POST | ❌ | ❌ | Tạo resource mới, trigger action |
| PUT | ✅ | ❌ | Replace toàn bộ resource |
| PATCH | ❌* | ❌ | Update một phần resource |
| DELETE | ✅ | ❌ | Xóa resource |

*PATCH có thể idempotent tùy implementation

---

## 3. Request/Response Format Chuẩn

### Standard Response Envelope

```typescript
// Success Response
{
  "success": true,
  "data": { ... },       // Single object
  // hoặc
  "data": [ ... ],       // Array
  "meta": {              // Pagination (cho list endpoints)
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",      // Machine-readable
    "message": "Dữ liệu không hợp lệ",  // Human-readable (tiếng Việt)
    "details": [                      // Field-level errors
      {
        "field": "email",
        "message": "Email không đúng định dạng",
        "value": "not-an-email"
      }
    ],
    "traceId": "req-abc-123"         // For debugging
  }
}
```

### Pagination Patterns

```typescript
// Offset-based (đơn giản, phù hợp bảng < 1M rows)
GET /api/v1/products?page=2&limit=20&sort=created_at:desc

// Cursor-based (hiệu quả cho large datasets)
GET /api/v1/events?cursor=eyJpZCI6MTAwfQ&limit=20

// Response với cursor
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTIwfQ",
    "hasMore": true,
    "limit": 20
  }
}
```

### Filtering & Searching

```
# Simple filter
GET /api/v1/products?status=active&category_id=5

# Range filter
GET /api/v1/orders?created_at[gte]=2024-01-01&created_at[lte]=2024-12-31

# Full-text search
GET /api/v1/products?q=áo+thun+nam

# Multi-value filter
GET /api/v1/orders?status[]=pending&status[]=processing

# Include related resources
GET /api/v1/orders?include=items,customer
```

---

## 4. HTTP Status Codes

### Success (2xx)

| Code | Dùng khi |
|------|---------|
| 200 OK | GET, PUT, PATCH thành công |
| 201 Created | POST tạo resource thành công (kèm Location header) |
| 202 Accepted | Async operation đã accept (chưa xong) |
| 204 No Content | DELETE thành công (không trả body) |

### Client Errors (4xx)

| Code | Error Code | Khi nào |
|------|-----------|---------|
| 400 | VALIDATION_ERROR | Body/query params không hợp lệ |
| 401 | UNAUTHORIZED | Thiếu hoặc sai authentication |
| 403 | FORBIDDEN | Đã auth nhưng không có quyền |
| 404 | NOT_FOUND | Resource không tồn tại |
| 405 | METHOD_NOT_ALLOWED | HTTP method không hỗ trợ |
| 409 | CONFLICT | Duplicate hoặc state conflict |
| 410 | GONE | Resource đã bị xóa vĩnh viễn |
| 422 | UNPROCESSABLE_ENTITY | Business logic validation fail |
| 429 | RATE_LIMIT_EXCEEDED | Quá nhiều requests |

### Server Errors (5xx)

| Code | Error Code | Khi nào |
|------|-----------|---------|
| 500 | SERVER_ERROR | Lỗi không mong đợi |
| 502 | BAD_GATEWAY | Upstream service fail |
| 503 | SERVICE_UNAVAILABLE | Service tạm thời không khả dụng |
| 504 | GATEWAY_TIMEOUT | Timeout từ upstream |

---

## 5. Authentication & Authorization

### JWT Pattern

```typescript
// Request Header
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...

// JWT Payload
{
  "sub": "user-uuid-123",
  "email": "user@example.com",
  "roles": ["warehouse_staff"],
  "permissions": ["grn:create", "grn:read"],
  "iat": 1703001600,
  "exp": 1703030400,    // 8 hours
  "jti": "unique-token-id"
}
```

### Permission-based Authorization

```typescript
// API spec format
/**
 * Permissions required: grn:create
 * Roles allowed: warehouse_staff, warehouse_manager, admin
 */
POST /api/v1/warehouse/receipts
```

---

## 6. Request Validation

### Validation Rules Format

```typescript
// DTO Definition
interface CreateGrnDto {
  poId: string;          // required, UUID format
  lineItems: {
    productId: string;   // required, UUID format
    lotNumber: string;   // required, max: 50 chars
    quantity: number;    // required, min: 0.001, max: 999999
    unitCost: number;    // required, min: 0
  }[];                   // required, minItems: 1, maxItems: 500
  notes?: string;        // optional, max: 500 chars
  receivedAt?: string;   // optional, ISO 8601 format
}

// Validation Errors
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "lineItems[0].quantity", "message": "Số lượng phải lớn hơn 0" },
      { "field": "poId", "message": "ID không đúng định dạng UUID" }
    ]
  }
}
```

---

## 7. Idempotency

Với POST endpoints có risk của duplicate requests:

```typescript
// Client gửi Idempotency-Key header
POST /api/v1/orders
Idempotency-Key: client-generated-uuid-v4

// Server:
// - Lần đầu: xử lý, lưu kết quả theo key
// - Lần sau (same key): trả về cached result, không xử lý lại
// - Key expire sau: 24 giờ
```

---

## 8. Webhook & Events Pattern

```typescript
// Event payload chuẩn
{
  "eventId": "evt-uuid-123",
  "eventType": "order.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0",
  "data": {
    "orderId": "ord-uuid-456",
    "customerId": "cust-uuid-789",
    "totalAmount": 1500000
  },
  "metadata": {
    "tenantId": "tenant-001",
    "correlationId": "req-abc-123"
  }
}
```

---

## 9. API Documentation Standard

```typescript
/**
 * @api {POST} /api/v1/warehouse/receipts Tạo phiếu nhập kho
 * @apiName CreateGRN
 * @apiGroup Warehouse
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiPermission grn:create
 *
 * @apiParam {String} poId UUID của Purchase Order
 * @apiParam {Object[]} lineItems Danh sách items
 * @apiParam {String} lineItems.productId UUID sản phẩm
 * @apiParam {String} lineItems.lotNumber Số lô hàng
 * @apiParam {Number} lineItems.quantity Số lượng (> 0)
 *
 * @apiSuccess {String} id UUID của GRN vừa tạo
 * @apiSuccess {String} grnNumber Mã GRN (auto-generated)
 * @apiSuccess {String} status "pending" | "completed"
 *
 * @apiError VALIDATION_ERROR Input không hợp lệ
 * @apiError NOT_FOUND PO không tồn tại
 * @apiError FORBIDDEN Không có quyền tạo GRN
 *
 * @apiOriginFT FT-WH-001
 * @apiOriginUS US-WH-001, US-WH-002
 */
```

---

## 10. Rate Limiting & Throttling

```
Standard limits:
- Public APIs: 60 requests/minute per IP
- Authenticated APIs: 300 requests/minute per user
- Heavy operations (export, bulk): 10 requests/minute

Response headers:
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 295
X-RateLimit-Reset: 1703001660
```

---

## 11. API Security Checklist

```
□ Tất cả endpoints cần auth đều có kiểm tra JWT
□ Không log sensitive data (password, token, CC number)
□ Input validation trước khi xử lý
□ SQL/NoSQL injection prevention (parameterized queries)
□ CORS configured đúng (không *)
□ Rate limiting có
□ HTTPS only trong production
□ Sensitive endpoints có audit logging
□ File upload có size limit + type validation
□ Response không leak internal server info
```
