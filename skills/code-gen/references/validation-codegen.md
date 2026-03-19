# Validation Code-Gen — Code-Gen Reference

Hướng dẫn **chuyển TBL schema + BR specs thành Zod validation** khi code-gen.

---

## A. TBL Column → Zod Schema Mapping

Đọc từng column trong TBL spec → áp Zod rule tương ứng:

### A1. String Types

```
TBL column: name VARCHAR(100) NOT NULL
→ z.string().min(1, 'Tên không được để trống').max(100, 'Tên tối đa 100 ký tự')

TBL column: name VARCHAR(100) NULL
→ z.string().max(100).optional()

TBL column: email VARCHAR(255) UNIQUE NOT NULL
→ z.string().email('Email không đúng định dạng').max(255)

TBL column: phone VARCHAR(20) NULL
→ z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Số điện thoại không hợp lệ').optional()

TBL column: url VARCHAR(2048) NULL
→ z.string().url('URL không hợp lệ').max(2048).optional()

TBL column: slug VARCHAR(100) UNIQUE
→ z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang')

TBL column: password VARCHAR(255) NOT NULL (chỉ cho Create)
→ z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(255)
           .regex(/[A-Z]/, 'Phải có chữ hoa')
           .regex(/[0-9]/, 'Phải có số')

TBL column: notes TEXT NULL
→ z.string().max(5000).optional()

TBL column: code VARCHAR(20) NOT NULL (mã hàng, mã kho, v.v.)
→ z.string().min(1).max(20).regex(/^[A-Z0-9_-]+$/, 'Mã chỉ được chứa chữ hoa, số, _, -').toUpperCase()
```

### A2. Numeric Types

```
TBL column: quantity DECIMAL(15,3) NOT NULL CHECK (quantity >= 0)
→ z.number({ invalid_type_error: 'Số lượng phải là số' })
   .min(0, 'Số lượng không được âm')
   .max(9999999999999.999)

TBL column: price DECIMAL(20,4) NOT NULL CHECK (price > 0)
→ z.number().positive('Giá phải lớn hơn 0').max(9999999999999999.9999)

TBL column: discount_percent DECIMAL(5,2) DEFAULT 0 CHECK (discount BETWEEN 0 AND 100)
→ z.number().min(0, 'Discount không được âm').max(100, 'Discount tối đa 100%').default(0)

TBL column: sort_order INT NOT NULL DEFAULT 0
→ z.number().int('Thứ tự phải là số nguyên').min(0).default(0)

TBL column: year SMALLINT NOT NULL CHECK (year BETWEEN 1900 AND 2100)
→ z.number().int().min(1900).max(2100)

TBL column: count BIGINT NOT NULL DEFAULT 0
→ z.number().int().min(0).default(0)
```

### A3. Date/Time Types

```
TBL column: birth_date DATE NULL
→ z.string().date('Định dạng ngày không hợp lệ (YYYY-MM-DD)').optional()
  .transform(s => s ? new Date(s) : undefined)

TBL column: start_date TIMESTAMPTZ NOT NULL
→ z.string().datetime({ offset: true, message: 'Định dạng datetime không hợp lệ' })
  .transform(s => new Date(s))

TBL column: duration_minutes INT NULL CHECK (duration > 0)
→ z.number().int().positive().optional()
```

### A4. Enum Types

```
TBL column: status ENUM('ACTIVE','INACTIVE','PENDING') DEFAULT 'PENDING'
→ z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  }).default('PENDING')

TBL column: type VARCHAR(20) NOT NULL — xác định từ MODSPEC enum list
→ z.enum(['TYPE_A', 'TYPE_B', 'TYPE_C'] as const)

TBL column: priority INT CHECK (priority IN (1,2,3))
→ z.union([z.literal(1), z.literal(2), z.literal(3)], {
    errorMap: () => ({ message: 'Độ ưu tiên phải là 1, 2 hoặc 3' })
  })
```

### A5. UUID / ID Types

```
TBL column: id UUID PRIMARY KEY
→ (không cần trong CreateDto — auto-generated)
   (có trong UpdateDto params / ResponseDto)
→ z.string().uuid('ID không đúng định dạng UUID')

TBL column: customer_id UUID NOT NULL (foreign key)
→ z.string().uuid('customer_id phải là UUID hợp lệ')

TBL column: parent_id UUID NULL (self-reference)
→ z.string().uuid().optional().nullable()
```

### A6. JSON / Array Types

```
TBL column: metadata JSONB NULL
→ z.record(z.unknown()).optional()
  // Hoặc schema cụ thể nếu biết structure:
→ z.object({ key: z.string(), value: z.unknown() }).optional()

TBL column: tags TEXT[] DEFAULT '{}'
→ z.array(z.string().min(1).max(50)).max(20, 'Tối đa 20 tags').default([])

TBL column: permissions JSONB NOT NULL DEFAULT '[]'
→ z.array(z.enum(['read', 'write', 'delete', 'admin'])).default([])
```

### A7. Boolean

```
TBL column: is_active BOOLEAN NOT NULL DEFAULT true
→ z.boolean().default(true)

TBL column: is_verified BOOLEAN NULL
→ z.boolean().optional()
```

---

## B. BR Validation → Zod Refinement

Khi BR có logic phức tạp hơn 1 field, dùng `.refine()` hoặc `.superRefine()`:

### B1. Cross-field validation

```
BR-ORD-010: "End date phải sau start date"
```

```typescript
const OrderPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  data => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'Ngày kết thúc phải sau ngày bắt đầu [BR-ORD-010]',
    path: ['endDate'], // Chỉ field nào lỗi
  }
);
```

```
BR-INV-020: "Nếu type = 'EXPIRABLE', phải có expiry_date"
```

```typescript
const InventoryLotSchema = z.object({
  type: z.enum(['NORMAL', 'EXPIRABLE']),
  expiryDate: z.string().datetime().optional(),
}).refine(
  data => data.type !== 'EXPIRABLE' || !!data.expiryDate,
  {
    message: 'Sản phẩm có hạn sử dụng phải có ngày hết hạn [BR-INV-020]',
    path: ['expiryDate'],
  }
);
```

```
BR-SHIP-005: "Tổng weight của items phải <= max_capacity của vehicle"
```

```typescript
// superRefine — nhiều lỗi cùng lúc
const ShipmentSchema = z.object({
  vehicleId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    weightKg: z.number().positive(),
  })).min(1),
}).superRefine(async (data, ctx) => {
  // BR-SHIP-005: kiểm tra tổng trọng lượng
  const totalWeight = data.items.reduce((sum, i) => sum + i.weightKg * i.quantity, 0);
  const vehicle = await vehicleRepo.findById(data.vehicleId);

  if (vehicle && totalWeight > vehicle.maxCapacityKg) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tổng trọng lượng ${totalWeight}kg vượt quá sức chứa ${vehicle.maxCapacityKg}kg [BR-SHIP-005]`,
      path: ['items'],
    });
  }
});
```

### B2. Conditional validation

```
BR-CUST-008: "Doanh nghiệp phải có tax_code, cá nhân không cần"
```

```typescript
const CustomerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('BUSINESS'),
    name: z.string().min(1),
    taxCode: z.string().min(10).max(13, 'MST tối đa 13 ký tự'),
    // Chỉ BUSINESS mới require taxCode
  }),
  z.object({
    type: z.literal('INDIVIDUAL'),
    name: z.string().min(1),
    taxCode: z.string().optional(), // Optional cho INDIVIDUAL
  }),
]);
```

---

## C. Create DTO vs Update DTO

### C1. Pattern chuẩn (Partial)

```typescript
// CreateDto — schema đầy đủ (required fields bắt buộc)
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  price: z.number().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  categoryId: z.string().uuid(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(20).default([]),
});

// UpdateDto — tất cả fields đều optional (PATCH semantics)
export const UpdateProductSchema = CreateProductSchema
  .partial()  // Tất cả fields thành optional
  .omit({ sku: true }); // Không cho phép đổi SKU sau khi tạo
// Hoặc chỉ cho update một số fields:
export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  description: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).max(20).optional(),
});

// Type inference
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
```

### C2. Nested Object Validation

```typescript
export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  deliveryAddress: z.object({
    street: z.string().min(1).max(255),
    ward: z.string().min(1).max(100),
    district: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
  }),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive('Số lượng phải là số nguyên dương'),
    unitPrice: z.number().positive(),
    discountPercent: z.number().min(0).max(100).default(0),
  })).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm').max(500, 'Tối đa 500 sản phẩm'),
  notes: z.string().max(1000).optional(),
}).refine(
  data => data.items.length > 0,
  { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' }
);
```

### C3. Filter DTO

```typescript
// Query params schema — tất cả optional, có coerce cho number/boolean
export const {Mod}FilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  q: z.string().max(255).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type {Mod}FilterDto = z.infer<typeof {Mod}FilterSchema>;
```

---

## D. File Upload Validation

```typescript
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] as const;

export const FileUploadSchema = z.object({
  file: z.object({
    size: z.number().max(MAX_FILE_SIZE, 'File tối đa 10MB'),
    mimetype: z.enum([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES], {
      errorMap: () => ({ message: 'Định dạng file không được hỗ trợ' }),
    }),
    originalname: z.string().max(255),
  }),
});

// Multipart form với file + metadata
export const CreateProductWithImageSchema = CreateProductSchema.extend({
  imageFile: z.object({
    size: z.number().max(5 * 1024 * 1024, 'Ảnh tối đa 5MB'),
    mimetype: z.enum(ALLOWED_IMAGE_TYPES, {
      errorMap: () => ({ message: 'Chỉ hỗ trợ JPEG, PNG, WebP' }),
    }),
  }).optional(),
});
```

---

## E. Prisma Schema → Zod (Auto-mapping)

Đọc Prisma model → sinh Zod schema tương ứng:

```prisma
// Prisma model
model Product {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(255)
  sku         String   @unique @db.VarChar(100)
  price       Decimal  @db.Decimal(15, 4)
  status      Status   @default(ACTIVE)
  categoryId  String
  description String?  @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}
```

```typescript
// Generated Zod schema (cho API input — KHÔNG include audit fields)
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  price: z.number().positive(),  // Decimal → number
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  categoryId: z.string().cuid(),  // hoặc .uuid() nếu dùng UUID
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().default(true),
  // KHÔNG include: id, createdAt, updatedAt, deletedAt (server-side)
});
```

---

## F. Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Generic validate middleware
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dữ liệu không hợp lệ',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// Dùng trong routes:
router.post('/', authenticate, validateBody(CreateProductSchema), productController.create);
router.patch('/:id', authenticate, validateBody(UpdateProductSchema), productController.update);

// Validate query params
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query params không hợp lệ',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}
```
