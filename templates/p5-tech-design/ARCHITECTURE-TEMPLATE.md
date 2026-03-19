# ARCHITECTURE: {{SYSTEM_NAME}}
<!-- ============================================================
     KIẾN TRÚC HỆ THỐNG — Chi tiết cho 1 system cụ thể.
     Bao gồm: Architecture + Navigation Map + Security per system.
     Tham chiếu PROJECT-ARCHITECTURE.md cho kiến trúc tổng thể.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-ARCHITECTURE.md, SYSTEM-INDEX.md, URS-*.md
       Key IDs: AP-XXX, ADR-XXX (system-level), NFR-XXX
       Output: MODSPEC-*.md tham chiếu đến file này
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Phase:** P2 — System Design
> **Loại:** Tài liệu kiến trúc hệ thống
> **System:** {{SYS_CODE}}
> **Input từ:** P1-REQUIREMENTS/*.md, _PROJECT/PROJECT-ARCHITECTURE.md
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-ARCHITECTURE.md] — Kiến trúc tổng thể
- [REF: SYSTEM-INDEX.md] — Tổng quan system

### Output cho:
- [OUTPUT → MODSPEC-{{MODULE}}.md] — Module Specs tham chiếu đến file này

---

## 1. SYSTEM ARCHITECTURE

### 1.1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    {{SYSTEM_NAME}} ({{SYS_CODE}})           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Module A    │  │  Module B    │  │  Module C        │  │
│  │  ({{A_DESC}})│  │  ({{B_DESC}})│  │  ({{C_DESC}})    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         └─────────────────┼─────────────────┘               │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │   Shared Layer           │                    │
│              │  Database / Cache / MQ   │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Component Structure

```
src/{{sys_code}}/
├── modules/
│   ├── {{module_a}}/
│   │   ├── {{module_a}}.controller.ts
│   │   ├── {{module_a}}.service.ts
│   │   ├── {{module_a}}.module.ts
│   │   └── dto/
│   └── {{module_b}}/
├── common/
│   ├── guards/
│   ├── decorators/
│   └── interceptors/
├── config/
└── main.ts
```

---

## 2. CONVENTIONS (BẮT BUỘC tuân thủ khi code)

### 2.1. API Conventions

| Convention | Format | Ví dụ |
|-----------|--------|-------|
| Base URL | `/api/v1/` | `/api/v1/orders` |
| Resource naming | kebab-case, plural | `/sales-orders`, `/product-items` |
| ID in path | `/{id}` (UUID) | `/orders/{orderId}` |
| Response format | `{success, data, meta?}` | — |
| Error format | `{success:false, error, code}` | — |
| Pagination | `?page=1&limit=20` | — |

### 2.2. Code Conventions

| Convention | Rule |
|-----------|------|
| Language | TypeScript strict mode |
| Naming | camelCase variables, PascalCase classes |
| Error handling | Try-catch + custom exception filters |
| Validation | Class-validator + DTOs |
| Database | TypeORM / Prisma (see DATA-MODEL.md) |

---

## 3. NAVIGATION MAP

```
Entry point: GET /api/v1/{{sys_code}}/

Module Routes:
  /{{module_a}}/     → {{MODULE_A_DESCRIPTION}}
  /{{module_b}}/     → {{MODULE_B_DESCRIPTION}}

Auth: Bearer JWT (from {{AUTH_SERVICE}})
Roles: {{ROLES_LIST}}
```

---

## 4. SECURITY PER SYSTEM

### 4.1. RBAC Matrix

| Role | Module A | Module B | Module C |
|------|---------|---------|---------|
| Admin | CRUD | CRUD | CRUD |
| Manager | CR | CR | R |
| User | R | CR | — |

### 4.2. System-specific Security Rules

| Rule | Mô tả | Áp dụng |
|------|-------|--------|
| Row-level security | Users chỉ thấy data của mình | {{MODULES}} |
| Rate limiting | Max {{N}} requests/minute | All endpoints |

---

## 5. PERFORMANCE & CACHING

| Endpoint / Data | Cache Strategy | TTL | Invalidate khi |
|----------------|---------------|-----|----------------|
| {{ENDPOINT}} | Redis / In-memory / None | {{TTL}} | {{EVENT}} |

---

## 6. DEPLOYMENT

| Env Var | Mô tả | Required |
|---------|-------|---------|
| DB_URL | Database connection string | Có |
| JWT_SECRET | JWT signing secret | Có |
| {{VAR}} | {{MÔ_TẢ}} | {{YN}} |
