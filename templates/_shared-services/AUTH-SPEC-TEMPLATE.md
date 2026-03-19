# Auth Service Spec — {PROJECT_NAME}

> **Hướng dẫn:** Điền thông tin vào các `{PLACEHOLDER}`. Auth Service là Layer 0 — luôn build/deploy đầu tiên.

---

## DEPENDENCY MAP

```
Requires:
  - _PROJECT/PROJECT-OVERVIEW.md (tech stack)
Provides to:
  - Tất cả systems (JWT validation)
  - {LIST_SYSTEMS}
```

---

## 1. Overview

| Thuộc tính | Giá trị |
|-----------|---------|
| **Service name** | auth-service |
| **Base URL** | /api/v1/auth |
| **Tech stack** | {BACKEND_TECH} |
| **Database** | {DB_TECH} |
| **Token strategy** | JWT RS256 (asymmetric key) |

---

## 2. Token Configuration

```
Access Token:
  - Algorithm: RS256
  - Expiry: 15 phút
  - Payload: { sub, email, roles, permissions, tenantId? }

Refresh Token:
  - Algorithm: RS256
  - Expiry: 7 ngày
  - Storage: HttpOnly cookie hoặc DB (tuỳ security requirement)
  - Rotation: single-use (mỗi lần refresh → token mới)
```

---

## 3. Role Hierarchy

```
{PROJECT_ROLES}
Mặc định:
  Super Admin > Admin > Manager > User > Guest

Ví dụ cho B2B system:
  SUPER_ADMIN
  ADMIN
  WAREHOUSE_MANAGER
  WAREHOUSE_STAFF
  SALES_MANAGER
  SALES_STAFF
  READONLY
```

---

## 4. Permission Matrix

| Resource | ADMIN | {ROLE_1} | {ROLE_2} | {ROLE_3} |
|----------|-------|---------|---------|---------|
| {resource_1}:create | ✅ | ✅ | ❌ | ❌ |
| {resource_1}:read | ✅ | ✅ | ✅ | ✅ |
| {resource_1}:update | ✅ | ✅ | ❌ | ❌ |
| {resource_1}:delete | ✅ | ❌ | ❌ | ❌ |
| {resource_2}:create | ✅ | ❌ | ✅ | ❌ |
| {resource_2}:read | ✅ | ✅ | ✅ | ✅ |

---

## 5. API Endpoints

### AUTH-001: Đăng nhập

```
POST /api/v1/auth/login

Request:
{
  email: string;       // required
  password: string;    // required
}

Response 200:
{
  success: true,
  data: {
    accessToken: string;   // JWT — 15 phút
    refreshToken: string;  // JWT — 7 ngày
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    }
  }
}

Errors:
  401: INVALID_CREDENTIALS
  403: ACCOUNT_DEACTIVATED
  429: TOO_MANY_ATTEMPTS (sau 5 lần sai)
```

### AUTH-002: Đăng ký (nếu self-registration)

```
POST /api/v1/auth/register

Request:
{
  email: string;       // required, unique
  password: string;    // required, min 8 chars
  name: string;        // required
  {EXTRA_FIELDS}
}

Response 201:
{
  success: true,
  data: {
    id: string;
    email: string;
    name: string;
  }
}

Errors:
  409: EMAIL_ALREADY_EXISTS
  400: VALIDATION_ERROR
```

### AUTH-003: Refresh Token

```
POST /api/v1/auth/refresh

Request:
{
  refreshToken: string;
}

Response 200:
{
  success: true,
  data: {
    accessToken: string;   // Token mới
    refreshToken: string;  // Token mới (rotation)
  }
}

Errors:
  401: INVALID_REFRESH_TOKEN
  401: REFRESH_TOKEN_EXPIRED
```

### AUTH-004: Lấy thông tin user hiện tại

```
GET /api/v1/auth/me
Authorization: Bearer {access_token}

Response 200:
{
  success: true,
  data: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    {PROFILE_FIELDS}
  }
}

Errors:
  401: UNAUTHORIZED
```

### AUTH-005: Đăng xuất

```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}

Request:
{
  refreshToken: string;  // Để revoke
}

Response 204: No Content
```

### AUTH-006: Đổi mật khẩu

```
POST /api/v1/auth/change-password
Authorization: Bearer {access_token}

Request:
{
  currentPassword: string;
  newPassword: string;
}

Response 200:
{ success: true, message: "Đổi mật khẩu thành công" }

Errors:
  400: INCORRECT_CURRENT_PASSWORD
  400: NEW_PASSWORD_SAME_AS_OLD
```

---

## 6. Middleware Implementation

```typescript
// Validate JWT — dùng trong mọi protected route
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });

  try {
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
    req.user = {
      id: payload.sub!,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'TOKEN_INVALID_OR_EXPIRED' } });
  }
}

// Role-based authorization
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasRole = roles.some(r => req.user.roles.includes(r));
    if (!hasRole) return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    next();
  };
}

// Permission-based authorization
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.permissions.includes(permission) && !req.user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: { code: 'INSUFFICIENT_PERMISSIONS' } });
    }
    next();
  };
}
```

---

## 7. Database Schema

### TBL-AUTH-001: users

| Column | Type | Nullable | Default | Mô tả |
|--------|------|----------|---------|-------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| email | VARCHAR(255) | NOT NULL | — | UK |
| password_hash | VARCHAR(255) | NOT NULL | — | bcrypt hash |
| name | VARCHAR(255) | NOT NULL | — | |
| is_active | BOOLEAN | NOT NULL | true | |
| email_verified_at | TIMESTAMPTZ | NULL | NULL | |
| last_login_at | TIMESTAMPTZ | NULL | NULL | |
| failed_login_attempts | INT | NOT NULL | 0 | |
| locked_until | TIMESTAMPTZ | NULL | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | NULL | |

### TBL-AUTH-002: user_roles

| Column | Type | Nullable | Mô tả |
|--------|------|----------|-------|
| user_id | UUID | NOT NULL | FK → users.id |
| role | VARCHAR(50) | NOT NULL | Role name |

### TBL-AUTH-003: refresh_tokens

| Column | Type | Nullable | Mô tả |
|--------|------|----------|-------|
| id | UUID | NOT NULL | PK |
| user_id | UUID | NOT NULL | FK → users.id |
| token_hash | VARCHAR(255) | NOT NULL | Hash của refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| revoked_at | TIMESTAMPTZ | NULL | NULL = active |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## 8. Security Notes

```
☐ Mật khẩu hash với bcrypt (cost factor ≥ 12)
☐ Rate limit login: 5 attempts / 15 min per IP + per email
☐ Account lockout sau 5 failed attempts
☐ Refresh token rotation (single-use)
☐ Audit log mọi auth events (login, logout, failed attempts)
☐ JWT private key lưu trong secrets manager (không commit)
☐ HTTPS only trong production
☐ CORS restrictive (whitelist domains)
```
