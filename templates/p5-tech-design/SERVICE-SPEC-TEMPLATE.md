# SHARED SERVICE SPEC: {{SERVICE_NAME}}
<!-- ============================================================
     ĐẶC TẢ SHARED SERVICE — Service dùng chung cho nhiều systems.
     Ví dụ: AUTH-SPEC.md, NOTIFICATION-SPEC.md, FILE-STORAGE-SPEC.md
     Tất cả system MODSPEC tham chiếu đến các file này.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-ARCHITECTURE.md
       Output: MODSPEC-*.md tham chiếu qua [REF: _SHARED-SERVICES/{{SERVICE}}]
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Loại:** Shared Service Specification
> **Service:** {{SERVICE_CODE}}
> **Dùng bởi systems:** {{DANH_SÁCH_SYSTEMS}}
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-ARCHITECTURE.md] — Global architecture

### Tài liệu tham chiếu service này:
- [REF: {SYSTEM}/P2-DESIGN/MODSPEC-*.md → Integration section]

---

## 1. MỤC ĐÍCH

{{MÔ_TẢ_SERVICE — service này cung cấp chức năng gì, tại sao tách ra shared}}

---

## 2. ARCHITECTURE

### 2.1. Service Flow

```
Client System → [Request] → {{SERVICE_NAME}} → [Response/Event]
                                    ↓
                            External Provider (if any)
```

### 2.2. Tech Stack

| Layer | Technology | Ghi chú |
|-------|-----------|--------|
| Implementation | {{TECH}} | |
| Storage | {{STORAGE}} | |
| External | {{PROVIDER}} | |

---

## 3. API SPECIFICATION

### 3.1. Base URL

```
Internal: http://{{service}}.internal/api/v1
```

### 3.2. Endpoints

#### POST /{{resource}}

**Mục đích:** {{MỤC_ĐÍCH}}

**Request:**
```json
{
  "{{field}}": "{{type}}",
  "{{field}}": "{{type}}"
}
```

**Response 200:**
```json
{
  "success": true,
  "{{field}}": "{{value}}"
}
```

---

## 4. INTEGRATION GUIDE (Cách integrate vào system)

### 4.1. Setup

```typescript
// Trong system muốn dùng service này
import { {{ServiceClient}} } from '@shared/{{service-name}}';

const client = new {{ServiceClient}}({
  baseUrl: process.env.{{SERVICE_URL}},
  apiKey: process.env.{{SERVICE_API_KEY}},
});
```

### 4.2. Usage Example

```typescript
// Ví dụ gọi service
const result = await client.{{method}}({
  {{params}}
});
```

---

## 5. ERROR CODES

| Code | Mô tả | Retry? |
|------|-------|--------|
| ERR-{{SVC}}-001 | {{MÔ_TẢ}} | No |
| ERR-{{SVC}}-002 | {{MÔ_TẢ}} | Yes (3 times) |

---

## 6. SLA & LIMITS

| Metric | Value |
|--------|-------|
| Response time | < {{N}}ms p99 |
| Rate limit | {{N}} requests/minute per system |
| Availability | {{N}}% uptime |
