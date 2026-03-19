# File Service Spec — {PROJECT_NAME}

> **Hướng dẫn:** Điền thông tin vào các `{PLACEHOLDER}`. File Service dùng chung cho mọi system cần upload/download files.

---

## DEPENDENCY MAP

```
Requires:
  - Auth Service (JWT validation)
  - Storage backend: {LOCAL / S3 / GCS / Azure Blob}
Used by:
  - {LIST_SYSTEMS_USING_FILE_SERVICE}
```

---

## 1. Overview

| Thuộc tính | Giá trị |
|-----------|---------|
| **Service name** | file-service |
| **Base URL** | /api/v1/files |
| **Storage** | {S3 / GCS / Local} |
| **Max file size** | {10}MB |

---

## 2. Allowed File Types

```
Images: image/jpeg, image/png, image/webp, image/gif
Documents: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
Spreadsheets: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Others: {CUSTOM_TYPES}

Image size limits:
  - Profile picture: 2MB, max 800×800px (auto-resize)
  - Product image: 5MB, max 2000×2000px
  - Document: 10MB

Disallowed:
  - Executables: .exe, .sh, .bat, .php, .js, .py
  - Archives containing executables
```

---

## 3. API Endpoints

### FILE-001: Upload file

```
POST /api/v1/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form fields:
  file: File             (required)
  category: string       (required) — 'avatar' | 'product' | 'document' | {CATEGORY}
  metadata: JSON string  (optional) — { entityType, entityId, description }

Response 201:
{
  success: true,
  data: {
    id: string;          // UUID
    filename: string;    // Original name
    storedName: string;  // Stored (UUID-based) name
    url: string;         // Public URL hoặc presigned URL
    size: number;        // bytes
    mimeType: string;
    category: string;
    uploadedAt: string;
  }
}

Errors:
  400: FILE_TOO_LARGE
  400: FILE_TYPE_NOT_ALLOWED
  400: MISSING_FILE
```

### FILE-002: Download / Get presigned URL

```
GET /api/v1/files/{id}
Authorization: Bearer {token}

Response 200:
{
  success: true,
  data: {
    id: string;
    url: string;         // Presigned URL (15 phút) hoặc public URL
    expiresAt?: string;
    filename: string;
    size: number;
    mimeType: string;
  }
}

Errors:
  404: FILE_NOT_FOUND
  403: ACCESS_DENIED
```

### FILE-003: Xóa file

```
DELETE /api/v1/files/{id}
Authorization: Bearer {token}

Response 204: No Content

Errors:
  404: FILE_NOT_FOUND
  403: CANNOT_DELETE (file đang được dùng bởi entity khác)
```

---

## 4. Access Control

```
Public files:     Không cần auth để GET (product images, public docs)
Private files:    Cần auth — chỉ owner hoặc ADMIN có thể access
Presigned URLs:   File private → tạo presigned URL (15 phút) khi user authenticated

Kiểm tra quyền:
  - Chỉ user tạo file (uploadedBy) hoặc ADMIN mới được xóa
  - Entity-level access: file của Order #123 → chỉ user có quyền xem Order #123 mới access
```

---

## 5. Image Processing

```
Khi upload image:
  - Validate dimensions (không quá max)
  - Auto-resize nếu vượt limit
  - Generate thumbnail (100x100) — lưu riêng với suffix _thumb
  - Strip EXIF data (privacy)
  - Convert sang WebP cho storage hiệu quả (optional)

Libraries: sharp (Node.js) / Pillow (Python)
```

---

## 6. Storage Backend Abstraction

```typescript
// Interface — dễ switch giữa Local/S3/GCS
interface IStorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>; // Returns URL
  getPresignedUrl(key: string, expiresIn: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// S3 implementation
class S3StorageProvider implements IStorageProvider { ... }

// Local implementation (development)
class LocalStorageProvider implements IStorageProvider { ... }
```

---

## 7. Database Schema

### TBL-FILE-001: files

| Column | Type | Nullable | Mô tả |
|--------|------|----------|-------|
| id | UUID | NOT NULL | PK |
| original_name | VARCHAR(255) | NOT NULL | Tên gốc |
| stored_key | VARCHAR(500) | NOT NULL | Storage key/path |
| url | VARCHAR(2000) | NULL | Public URL (nếu có) |
| size | BIGINT | NOT NULL | bytes |
| mime_type | VARCHAR(100) | NOT NULL | |
| category | VARCHAR(50) | NOT NULL | avatar/product/document |
| is_public | BOOLEAN | NOT NULL | false |
| uploaded_by | UUID | NOT NULL | FK → users.id |
| entity_type | VARCHAR(50) | NULL | Linked entity type |
| entity_id | UUID | NULL | Linked entity ID |
| created_at | TIMESTAMPTZ | NOT NULL | |
| deleted_at | TIMESTAMPTZ | NULL | |
