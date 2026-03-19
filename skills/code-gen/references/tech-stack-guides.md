# Tech Stack Guides — Code-Gen Reference

## Hướng dẫn cho từng Tech Stack

---

## Node.js + TypeScript + Express

### Project Setup

```bash
# Khởi tạo project
npm init -y
npm install express typescript @types/node @types/express
npm install prisma @prisma/client  # ORM
npm install zod                     # Validation
npm install jsonwebtoken bcrypt     # Auth
npm install --save-dev ts-node ts-node-dev jest @types/jest supertest

# tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true
  }
}
```

### File Naming Convention

```
controllers/    → {mod}.controller.ts
services/       → {mod}.service.ts
repositories/   → {mod}.repository.ts
models/         → {mod}.model.ts (interfaces)
dtos/           → create-{mod}.dto.ts, update-{mod}.dto.ts
routes/         → {mod}.routes.ts
```

### Database Migration (với Prisma)

```prisma
// schema.prisma
model {ModelName} {
  id         String   @id @default(uuid())
  // fields từ TBL-{SYS}-NNN
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  deletedAt  DateTime? @map("deleted_at")

  @@map("{table_name}")
}
```

### Test Setup (Jest + Supertest)

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./test/setup.ts']
};

// test/setup.ts
beforeAll(async () => {
  await db.$connect();
  await db.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await db.$executeRaw`ROLLBACK`;
  await db.$executeRaw`BEGIN`;
});

afterAll(async () => {
  await db.$disconnect();
});
```

---

## Python + FastAPI + SQLAlchemy

### Project Setup

```bash
# pyproject.toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.110"
uvicorn = "^0.29"
sqlalchemy = "^2.0"
alembic = "^1.13"
pydantic = "^2.0"
python-jose = "^3.3"  # JWT
pytest = "^8.0"
httpx = "^0.27"       # Test client
```

### File Naming Convention

```
routers/        → {mod}_router.py
services/       → {mod}_service.py
repositories/   → {mod}_repository.py
models/         → {mod}_model.py  (SQLAlchemy models)
schemas/        → {mod}_schema.py (Pydantic schemas)
```

### Code Skeleton

```python
# {mod}_router.py
# REQ-ID: FT-{MOD}-NNN
# API-ID: API-{SYS}-NNN

from fastapi import APIRouter, Depends, HTTPException
from .{mod}_service import {Mod}Service
from .{mod}_schema import Create{Mod}Schema, {Mod}Response

router = APIRouter(prefix="/api/v1/{resource}", tags=["{mod}"])

@router.post("/", response_model={Mod}Response, status_code=201)
async def create_{mod}(
    data: Create{Mod}Schema,
    service: {Mod}Service = Depends(),
    current_user: User = Depends(get_current_user),
):
    # REQ-ID: FT-{MOD}-001
    return await service.create(data, current_user.id)
```

### Database Migration (với Alembic)

```python
# alembic/versions/{hash}_create_{table}.py
# REQ-ID: TBL-{SYS}-NNN

def upgrade() -> None:
    op.create_table(
        '{table_name}',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text('gen_random_uuid()')),
        # Columns từ TBL spec
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True),
                  server_default=sa.text('NOW()'), nullable=False),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('{table_name}')
```

---

## React + TypeScript (Frontend)

### Project Setup

```bash
npm create vite@latest {project} -- --template react-ts
npm install @tanstack/react-query axios react-router-dom
npm install @hookform/react-hook-form zod @hookform/resolvers
npm install --save-dev @testing-library/react @testing-library/user-event vitest
```

### File Naming Convention

```
pages/          → {ModPage}.tsx
components/     → {ModList}.tsx, {ModForm}.tsx, {ModDetail}.tsx
hooks/          → use{Mod}.ts, use{Mod}List.ts
services/       → {mod}.api.ts
types/          → {mod}.types.ts
```

### API Service Skeleton

```typescript
// {mod}.api.ts
// REQ-ID: FT-{MOD}-NNN

import { apiClient } from '@/lib/api-client';
import type { Create{Mod}Dto, {Mod}, PaginatedResult } from './{mod}.types';

export const {mod}Api = {
  // API-ID: API-{SYS}-001
  create: (dto: Create{Mod}Dto) =>
    apiClient.post<{Mod}>('/api/v1/{resource}', dto),

  // API-ID: API-{SYS}-002
  findAll: (params: {Mod}ListParams) =>
    apiClient.get<PaginatedResult<{Mod}>>('/api/v1/{resource}', { params }),

  // API-ID: API-{SYS}-003
  findById: (id: string) =>
    apiClient.get<{Mod}>(`/api/v1/{resource}/${id}`),

  // API-ID: API-{SYS}-004
  update: (id: string, dto: Update{Mod}Dto) =>
    apiClient.put<{Mod}>(`/api/v1/{resource}/${id}`, dto),

  // API-ID: API-{SYS}-005
  delete: (id: string) =>
    apiClient.delete(`/api/v1/{resource}/${id}`),
};
```

### React Query Hook

```typescript
// use{Mod}.ts
// REQ-ID: FT-{MOD}-NNN

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {mod}Api } from './{mod}.api';

export function use{Mod}List(params: {Mod}ListParams) {
  return useQuery({
    queryKey: ['{mod}', 'list', params],
    queryFn: () => {mod}Api.findAll(params),
  });
}

export function useCreate{Mod}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: {mod}Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{mod}', 'list'] });
    },
  });
}
```

---

## Database Patterns

### PostgreSQL với UUID

```sql
-- Luôn dùng UUID cho primary keys
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Audit columns (bắt buộc)
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
deleted_at TIMESTAMPTZ NULL,  -- soft delete
created_by UUID NOT NULL REFERENCES users(id),
updated_by UUID NOT NULL REFERENCES users(id)

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
BEFORE UPDATE ON {table_name}
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Index Strategy

```sql
-- FK indexes (bắt buộc)
CREATE INDEX idx_{table}_{fk_col} ON {table}({fk_col});

-- Filter indexes (các cột thường WHERE)
CREATE INDEX idx_{table}_status ON {table}(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_{table}_created_by ON {table}(created_by);

-- Composite indexes (hay dùng cùng nhau)
CREATE INDEX idx_{table}_status_created ON {table}(status, created_at DESC);

-- Partial indexes (filter thường xuyên)
CREATE INDEX idx_{table}_active ON {table}(id)
  WHERE deleted_at IS NULL AND status = 'active';
```

---

## CI/CD Config

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        options: --health-cmd pg_isready

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build
```

### Environment Files

```
.env                 → Local development (không commit)
.env.example         → Template (commit vào git)
.env.test            → Test environment
.env.staging         → Staging (CI/CD tự set)
.env.production      → Production (secrets manager)
```
