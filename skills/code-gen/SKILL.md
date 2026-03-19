# Code-Gen Skill — `/mcv3:code-gen`

## Mục đích

Chuyển **MODSPEC (Phase 5)** thành **Source Code Scaffolding** — Phase 7.

Với mỗi module, tạo:
- **Project structure** theo tech stack đã chọn
- **API stubs** từ API-{SYS}-NNN specs
- **Database migrations** từ TBL-{SYS}-NNN specs
- **Component skeletons** từ COMP-{SYS}-NNN specs
- **Config files** (env, docker, etc.)

Mọi code file PHẢI có **REQ-ID comment** truy về MODSPEC.

---

## DEPENDENCY MAP

```
Requires:
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md (Phase 5 — bắt buộc)
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (Phase 6 — test stubs)
  - _PROJECT/PROJECT-OVERVIEW.md (tech stack)
  - _PROJECT/PROJECT-ARCHITECTURE.md (conventions)
Produces:
  - src/{sys}/{mod}/ (source code scaffolding)
  - src/{sys}/{mod}/__tests__/ (test file stubs)
  - db/migrations/ (schema migrations)
  - docker-compose.yml, .env.example (nếu chưa có)
Enables: /mcv3:verify (Phase 8)
Agents: code-gen (chuyên biệt), tech-expert (validate)
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_checkpoint, mc_traceability
References:
  - skills/code-gen/references/code-patterns.md
  - skills/code-gen/references/tech-stack-guides.md
  - skills/code-gen/references/tech-stack-nextjs.md     ← Next.js 14+ App Router
  - skills/code-gen/references/tech-stack-mobile.md     ← React Native + Flutter
  - skills/code-gen/references/database-nosql-guide.md  ← MongoDB, Firebase, Supabase, Redis
  - templates/p5-tech-design/MODSPEC-TEMPLATE.md
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:qa-docs` hoàn thành (TEST file có sẵn)
- Sẵn sàng scaffold code từ design đã hoàn chỉnh
- Tech stack đã được confirm ở Phase 5

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project, tech stack từ _config.json
2. mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → liệt kê MODSPECs
3. mc_list({ subPath: "{SYSTEM}/P3-QA-DOCS" }) → kiểm tra TEST files
4. Kiểm tra project structure hiện tại (src/ đã có gì)
5. Hỏi user:
   "Bạn muốn generate code cho module nào?
   [Danh sách MODSPEC files]

   Tech stack đã confirm: {backend} / {database} / {frontend}
   Output folder sẽ là: src/{sys_lower}/{mod_lower}/"
```

**Nếu thiếu MODSPEC:**
```
⚠️ Chưa có MODSPEC cho module này.
   Hãy chạy /mcv3:tech-design trước.
```

---

## Phase 1 — Context Loading & Tech Stack

### 1a. Load MODSPEC đầy đủ

```
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 3 })
mc_load({ filePath: "_PROJECT/PROJECT-ARCHITECTURE.md", layer: 2 })
```

### 1b. Parse từ MODSPEC

Từ MODSPEC, extract:
- Tech stack (Node.js / Python / Java / Go / Next.js / React Native / Flutter)
- Database (PostgreSQL / MySQL / MongoDB / Firebase / Supabase / SQLite)
- Framework (Express / FastAPI / Spring / Gin / Next.js App Router)
- Frontend framework (React / Vue / Angular / Next.js — nếu có)
- API-{SYS}-NNN specs (endpoints)
- TBL-{SYS}-NNN specs (tables)
- COMP-{SYS}-NNN specs (components/services)

**Load reference phù hợp với tech stack:**
- Next.js → `references/tech-stack-nextjs.md` (App Router, Server Actions, Prisma)
- React Native / Expo → `references/tech-stack-mobile.md` (Zustand, TanStack Query, EAS)
- Flutter → `references/tech-stack-mobile.md` (Riverpod, go_router, Dio)
- MongoDB / Firebase / Supabase / Redis → `references/database-nosql-guide.md`

### 1c. Confirm với user

```
"Tôi sẽ generate code với config:
- Language: TypeScript / Python / Java
- Framework: Express.js / FastAPI / Spring Boot
- ORM: Prisma / SQLAlchemy / JPA
- Output: src/{sys}/{mod}/

Tôi sẽ tạo:
✓ {N} API route handlers (từ {N} API specs)
✓ {M} Service methods (từ {M} COMP specs)
✓ {K} Database migrations (từ {K} TBL specs)
✓ {L} Test file stubs (từ {L} TCs)

Tiếp tục?"
```

---

## Phase 2 — Project Structure

### 2a. Standard Backend Structure

```
src/{sys_lower}/{mod_lower}/
├── controllers/
│   └── {mod}.controller.ts       # Route handlers
├── services/
│   └── {mod}.service.ts          # Business logic
├── repositories/
│   └── {mod}.repository.ts       # Database access
├── models/
│   └── {mod}.model.ts            # TypeScript interfaces/types
├── dtos/
│   ├── create-{mod}.dto.ts       # Request DTOs
│   └── update-{mod}.dto.ts
├── validators/
│   └── {mod}.validator.ts        # Input validation
├── routes/
│   └── {mod}.routes.ts           # Route definitions
└── __tests__/
    ├── {mod}.service.test.ts     # Unit tests
    └── {mod}.controller.test.ts  # Integration tests
```

### 2b. Standard Frontend Structure (nếu có UI)

```
src/{sys_lower}/{mod_lower}/
├── pages/
│   └── {ModPage}.tsx             # Page component
├── components/
│   ├── {ModList}.tsx             # List component
│   ├── {ModForm}.tsx             # Form component
│   └── {ModDetail}.tsx           # Detail component
├── hooks/
│   └── use{Mod}.ts               # Custom hooks
├── services/
│   └── {mod}.api.ts              # API calls
├── types/
│   └── {mod}.types.ts            # TypeScript types
└── __tests__/
    └── {ModPage}.test.tsx        # Component tests
```

---

## Phase 3 — Code Generation

### 3a. REQ-ID Header (BẮT BUỘC)

Mọi file code PHẢI có header REQ-ID:

```typescript
/**
 * {Module Name} — {File Role}
 *
 * @module {sys}/{mod}
 * @req-ids US-{MOD}-001, US-{MOD}-002
 * @feat-ids FT-{MOD}-001, FT-{MOD}-002
 * @api-ids API-{SYS}-001, API-{SYS}-002
 * @tbl-ids TBL-{SYS}-001
 */
```

### 3b. API Route Handler Skeleton

Từ mỗi API-{SYS}-NNN spec, sinh:

```typescript
// REQ-ID: US-{MOD}-NNN, FT-{MOD}-NNN
// FEAT-ID: FT-{MOD}-NNN
// API-ID: API-{SYS}-NNN
router.{method}('{path}', authenticate, authorize(['{role}']), async (req, res) => {
  try {
    // TODO: Implement — xem MODSPEC API-{SYS}-NNN
    // Input validation: xem BR-{DOM}-NNN
    const dto = validate{Mod}Dto(req.body);

    // Business logic: xem MODSPEC COMP-{SYS}-NNN
    const result = await {mod}Service.{action}(dto);

    return res.status({code}).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
});
```

### 3c. Service Skeleton

Từ mỗi COMP-{SYS}-NNN spec, sinh:

```typescript
// REQ-ID: FT-{MOD}-NNN
// COMP-ID: COMP-{SYS}-NNN
export class {Mod}Service {

  constructor(
    private readonly {mod}Repository: {Mod}Repository,
    // TODO: Thêm dependencies từ MODSPEC COMP-{SYS}-NNN
  ) {}

  // FT-{MOD}-001: {Tên feature}
  async {action}(dto: Create{Mod}Dto): Promise<{Mod}> {
    // TODO: Implement business logic
    // Business Rules: BR-{DOM}-NNN
    // Xem MODSPEC Phase 2 — Business Rules

    return this.{mod}Repository.create(dto);
  }

  // FT-{MOD}-002: {Tên feature}
  async findById(id: string): Promise<{Mod} | null> {
    // TODO: Implement
    return this.{mod}Repository.findById(id);
  }
}
```

### 3d. Database Migration

Từ mỗi TBL-{SYS}-NNN spec, sinh migration file:

```sql
-- Migration: V{NNN}__create_{table_name}.sql
-- REQ-ID: TBL-{SYS}-NNN
-- Tạo bởi /mcv3:code-gen từ MODSPEC-{MOD}.md
-- Ngày: {DATE}

CREATE TABLE {table_name} (
    -- TODO: Điền schema từ MODSPEC TBL-{SYS}-NNN
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- {Các fields từ spec}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ

    -- Constraints từ spec
    -- CONSTRAINT {name} UNIQUE ({fields})
    -- CONSTRAINT {fk} FOREIGN KEY ({col}) REFERENCES {table}(id)
);

-- Indexes từ spec
-- CREATE INDEX idx_{table}_{col} ON {table}({col});

-- ROLLBACK:
-- DROP TABLE IF EXISTS {table_name};
```

### 3e. TypeScript Interface / DTO

```typescript
// REQ-ID: FT-{MOD}-NNN
// TBL-ID: TBL-{SYS}-NNN
export interface {Mod} {
  id: string;
  // TODO: Fields từ MODSPEC TBL-{SYS}-NNN
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// DTO cho tạo mới (fields bắt buộc)
export interface Create{Mod}Dto {
  // TODO: Từ API-{SYS}-NNN Request body spec
}

// DTO cho cập nhật (tất cả optional)
export interface Update{Mod}Dto extends Partial<Create{Mod}Dto> {}
```

### 3f. Test File Stub

Từ TEST-{MOD}.md, sinh test stubs:

```typescript
// REQ-ID: TC-{MOD}-NNN
// Test stubs cho module {MOD}
// Implement đầy đủ sau khi code hoàn thành

describe('{Mod}Service', () => {

  // TC-{MOD}-001: {Tên test case}
  it('should {expected behavior}', async () => {
    // Arrange — xem TEST-{MOD}.md TC-{MOD}-001 Setup
    // TODO: Setup test data

    // Act
    // TODO: Call service method

    // Assert — xem TEST-{MOD}.md TC-{MOD}-001 Pass criteria
    // TODO: Add assertions
    expect(true).toBe(true); // placeholder
  });

  // TC-{MOD}-002: Error case
  it('should throw when {invalid condition}', async () => {
    // TODO: Implement error case test
    expect(true).toBe(true); // placeholder
  });
});
```

---

## Phase 4 — Config Files

### 4a. Environment Variables

```bash
# .env.example — {Module} config
# REQ-ID: NFR-{SYS}-CONF-NNN

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/{db_name}
DATABASE_POOL_SIZE=10

# {Module}-specific config
{MOD_UPPER}_TIMEOUT=30000
{MOD_UPPER}_MAX_RETRIES=3
# TODO: Thêm env vars từ MODSPEC
```

### 4b. Docker Compose (nếu cần service mới)

```yaml
# docker-compose.yml — thêm service {mod}
# REQ-ID: NFR-{SYS}-INFRA-NNN
services:
  {mod}-service:
    build: ./src/{sys}/{mod}
    environment:
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "{port}:{port}"
    depends_on:
      - postgres
      - redis  # nếu dùng cache
```

---

## Phase 5 — Review & Validate

### 5a. Code Review Checklist

```
✅ Mọi file có REQ-ID comment header
✅ Mọi route handler có authenticate + authorize middleware
✅ Mọi input được validate (không trust raw request)
✅ Lỗi được handle đúng cách (không expose stack trace)
✅ Business logic trong Service, không trong Controller
✅ Database access chỉ trong Repository
✅ Test stubs tương ứng với TC-IDs trong TEST-{MOD}.md
```

### 5b. Guided Review với user

```
"📁 Tôi đã scaffold {N} files cho module {MOD}:

Backend:
  src/{sys}/{mod}/controllers/{mod}.controller.ts  ({X} endpoints)
  src/{sys}/{mod}/services/{mod}.service.ts        ({Y} methods)
  src/{sys}/{mod}/repositories/{mod}.repository.ts ({Z} queries)

Database:
  db/migrations/V{NNN}__create_{table}.sql

Tests:
  src/{sys}/{mod}/__tests__/{mod}.service.test.ts  ({K} stubs)

Tôi để TODO comments ở những chỗ cần implement thực tế.
Muốn tôi implement thêm phần nào chi tiết hơn không?"
```

---

## Phase 6 — Save & Traceability

```
1. Với mỗi file code tạo ra, dùng Write tool (không qua mc_save —
   code là file thật, không phải project memory document)

2. mc_traceability({
     action: "link",
     items: [
       { from: "FT-{MOD}-001", to: "src/{sys}/{mod}/services/{mod}.service.ts" },
       { from: "API-{SYS}-001", to: "src/{sys}/{mod}/controllers/{mod}.controller.ts" },
       { from: "TBL-{SYS}-001", to: "db/migrations/V001__create_{table}.sql" }
     ]
   })

3. mc_checkpoint({
     label: "sau-code-gen-{mod}",
     sessionSummary: "Code Gen {MOD}: {N} files, {M} API handlers, {K} migrations",
     nextActions: ["Implement TODOs", "Chạy /mcv3:verify"]
   })
```

---

## Post-Gate

```
✅ Tất cả MODSPEC API-IDs có route handler tương ứng
✅ Tất cả MODSPEC TBL-IDs có migration file tương ứng
✅ Tất cả files có REQ-ID header comment
✅ Test stubs tương ứng với TC-IDs
✅ Không có syntax errors (TypeScript compile OK)
✅ Traceability FT → code đã link

→ "✅ Phase 7 Code Gen hoàn thành!
   {N} files scaffolded với {M} TODO comments cần implement.
   Tiếp theo: Implement TODOs → /mcv3:verify"
```

---

## Quy tắc Code Gen

```
REQ-ID-FIRST: Mọi file bắt đầu bằng REQ-ID comment
TODO-DRIVEN: Dùng TODO comments cho phần cần implement thêm
NO-BUSINESS-IN-CONTROLLER: Logic nghiệp vụ chỉ trong Service
REPOSITORY-PATTERN: Database access chỉ trong Repository
VALIDATE-INPUT: Mọi input từ request phải validate trước xử lý
TYPED: TypeScript strict mode, không dùng any
TESTABLE: Code viết để testable (inject dependencies)
TRACE-TO-SPEC: Mọi method/class trace về MODSPEC spec
```
