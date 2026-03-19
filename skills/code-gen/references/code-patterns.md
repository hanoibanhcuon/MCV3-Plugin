# Code Patterns — Code-Gen Reference

## Architectural Patterns

### Repository Pattern

```typescript
// Pattern: Repository tách database logic khỏi business logic
// REQ-ID: {FT-MOD-NNN}

export interface I{Mod}Repository {
  findById(id: string): Promise<{Mod} | null>;
  findAll(filter: {Mod}Filter): Promise<PaginatedResult<{Mod}>>;
  create(data: Create{Mod}Data): Promise<{Mod}>;
  update(id: string, data: Update{Mod}Data): Promise<{Mod}>;
  softDelete(id: string): Promise<void>;
}

// Implementation
export class {Mod}Repository implements I{Mod}Repository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<{Mod} | null> {
    return this.db.{table}.findUnique({
      where: { id, deletedAt: null }
    });
  }

  async findAll(filter: {Mod}Filter): Promise<PaginatedResult<{Mod}>> {
    const [items, total] = await Promise.all([
      this.db.{table}.findMany({
        where: buildWhereClause(filter),
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.db.{table}.count({ where: buildWhereClause(filter) })
    ]);
    return { items, total, page: filter.page, limit: filter.limit };
  }
}
```

---

### Service Layer Pattern

```typescript
// Pattern: Service chứa business logic, gọi Repository
// REQ-ID: {FT-MOD-NNN}, BR-{DOM}-NNN

export class {Mod}Service {
  constructor(
    private readonly {mod}Repo: I{Mod}Repository,
    private readonly eventBus?: IEventBus,  // cho async events
  ) {}

  async create(dto: Create{Mod}Dto, userId: string): Promise<{Mod}> {
    // 1. Validate business rules
    await this.validateBusinessRules(dto);

    // 2. Xử lý logic
    const data = this.transformDto(dto, userId);

    // 3. Lưu database
    const result = await this.{mod}Repo.create(data);

    // 4. Emit events (nếu cần)
    this.eventBus?.emit('{mod}.created', { id: result.id });

    return result;
  }

  private async validateBusinessRules(dto: Create{Mod}Dto): Promise<void> {
    // BR-{DOM}-001: {Quy tắc}
    if (!dto.{field}) {
      throw new ValidationError('{BR-ID}: {field} is required');
    }

    // BR-{DOM}-002: {Quy tắc khác}
    if (dto.{field} < 0) {
      throw new ValidationError('{BR-ID}: {field} cannot be negative');
    }
  }
}
```

---

### Controller Pattern

```typescript
// Pattern: Controller chỉ xử lý HTTP, không có business logic
// API-ID: API-{SYS}-NNN

export class {Mod}Controller {
  constructor(private readonly {mod}Service: {Mod}Service) {}

  // POST /api/v1/{resource}
  // API-ID: API-{SYS}-001
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = await validate(Create{Mod}Schema, req.body);
      const result = await this.{mod}Service.create(dto, req.user.id);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  // GET /api/v1/{resource}
  // API-ID: API-{SYS}-002
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = parseFilter(req.query);
      const result = await this.{mod}Service.findAll(filter);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
```

---

## Error Handling Patterns

```typescript
// Custom Error Classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends Error {
  constructor(ruleId: string, message: string) {
    super(`[${ruleId}] ${message}`);
    this.name = 'BusinessRuleError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// Global error handler
export function handleError(res: Response, error: unknown): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ success: false, error: error.message, field: error.field });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ success: false, error: error.message });
  } else if (error instanceof BusinessRuleError) {
    res.status(422).json({ success: false, error: error.message });
  } else if (error instanceof ConflictError) {
    res.status(409).json({ success: false, error: error.message });
  } else {
    console.error('Unexpected error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

---

## Pagination Pattern

```typescript
// Standard pagination response
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Parse pagination từ query params
export function parsePagination(query: Record<string, string>): PaginationOptions {
  return {
    page: Math.max(1, parseInt(query.page || '1')),
    limit: Math.min(100, Math.max(1, parseInt(query.limit || '20'))),
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
  };
}
```

---

## Soft Delete Pattern

```typescript
// Soft delete — dùng deletedAt thay vì xóa thật
// Mọi query PHẢI filter deletedAt: null

// Trong Repository:
findAll() {
  return db.{table}.findMany({
    where: { deletedAt: null }  // LUÔN filter này
  });
}

softDelete(id: string) {
  return db.{table}.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// Restore (nếu cần)
restore(id: string) {
  return db.{table}.update({
    where: { id },
    data: { deletedAt: null }
  });
}
```

---

## Audit Trail Pattern

```typescript
// Mọi entities phải có audit fields
interface AuditableEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;  // userId
  updatedBy: string;  // userId
}

// Service tự động điền audit fields
async create(dto: CreateDto, userId: string) {
  return repo.create({
    ...dto,
    createdBy: userId,
    updatedBy: userId,
  });
}

async update(id: string, dto: UpdateDto, userId: string) {
  return repo.update(id, {
    ...dto,
    updatedBy: userId,
  });
}
```

---

## Input Validation Pattern

```typescript
// Dùng Zod cho TypeScript validation
import { z } from 'zod';

// Schema định nghĩa từ MODSPEC API spec
export const Create{Mod}Schema = z.object({
  // Required fields
  {field}: z.string().min(1).max(255),
  {amount}: z.number().positive().max(999999),
  {status}: z.enum(['active', 'inactive']),

  // Optional fields
  {description}: z.string().max(1000).optional(),
  {tags}: z.array(z.string()).max(10).optional(),
});

export type Create{Mod}Dto = z.infer<typeof Create{Mod}Schema>;

// Validate helper
export async function validate<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ValidationError(message);
    }
    throw error;
  }
}
```

---

## Auth Middleware Pattern

```typescript
// JWT Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.sub!, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token expired or invalid' });
  }
}

// Role-based Authorization middleware
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}
```
