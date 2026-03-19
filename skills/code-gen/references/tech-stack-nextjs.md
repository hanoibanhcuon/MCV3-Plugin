# Tech Stack Guide — Next.js 14+ (App Router)

Reference cho `/mcv3:code-gen` khi tech stack là Next.js 14+ với App Router.

---

## App Router Architecture

Next.js 14+ dùng App Router (`app/`) làm mặc định thay cho Pages Router (`pages/`).

### Cấu trúc thư mục chuẩn

```
src/
├── app/
│   ├── layout.tsx              # Root layout (HTML shell, global providers)
│   ├── page.tsx                # Trang chủ (/)
│   ├── loading.tsx             # Loading UI (Suspense boundary)
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   ├── globals.css
│   │
│   ├── (auth)/                 # Route group — không ảnh hưởng URL
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx          # Nested layout (sidebar, nav)
│   │   ├── page.tsx            # /dashboard
│   │   └── [id]/
│   │       └── page.tsx        # /dashboard/[id]
│   │
│   └── api/                    # Route Handlers
│       └── {resource}/
│           └── route.ts        # GET, POST handlers
│
├── components/
│   ├── ui/                     # Primitive UI components (Button, Input, ...)
│   └── {feature}/              # Feature-specific components
│
├── lib/
│   ├── db.ts                   # Database connection (Prisma client)
│   ├── auth.ts                 # Auth config (NextAuth)
│   └── utils.ts                # Utility functions
│
├── actions/                    # Server Actions
│   └── {resource}.actions.ts
│
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Server Components vs Client Components

### Quyết định dùng loại nào

```
SERVER COMPONENT (mặc định — không có 'use client'):
✅ Data fetching từ database/API
✅ Hiển thị static content
✅ Access env variables (server-side)
✅ Heavy computation (không gửi JS xuống client)
✅ Truy cập trực tiếp backend services

CLIENT COMPONENT ('use client' ở đầu file):
✅ Cần interactivity (onClick, onChange, ...)
✅ Cần React state hoặc lifecycle hooks (useState, useEffect)
✅ Cần browser APIs (window, localStorage, navigator)
✅ Cần real-time updates (WebSocket, EventSource)
✅ Dùng third-party libraries yêu cầu DOM
```

### Pattern: Push "use client" xuống sâu nhất có thể

```tsx
// ✅ Tốt — chỉ phần interactive là Client Component
// app/products/page.tsx (Server Component)
import { db } from '@/lib/db'
import AddToCartButton from './AddToCartButton' // Client Component

export default async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } })

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <AddToCartButton productId={product.id} /> {/* Client island */}
    </div>
  )
}
```

---

## Server Actions (Mutations)

Dùng cho form submissions và data mutations thay vì API routes.

```tsx
// actions/product.actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// REQ-ID: FT-PROD-001
const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export async function createProduct(formData: FormData) {
  const parsed = CreateProductSchema.safeParse({
    name: formData.get('name'),
    price: Number(formData.get('price')),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  await db.product.create({ data: parsed.data })
  revalidatePath('/products')
  return { success: true }
}
```

```tsx
// components/ProductForm.tsx — Client Component gọi Server Action
'use client'
import { createProduct } from '@/actions/product.actions'

export function ProductForm() {
  return (
    <form action={createProduct}>
      <input name="name" type="text" required />
      <input name="price" type="number" required />
      <button type="submit">Tạo sản phẩm</button>
    </form>
  )
}
```

---

## Route Handlers (API Routes)

Dùng khi cần REST API endpoint (cho mobile client, webhooks, third-party).

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// REQ-ID: API-PROD-001
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? 1)

  const products = await db.product.findMany({
    skip: (page - 1) * 20,
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: products })
}

// REQ-ID: API-PROD-002
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const product = await db.product.create({ data: body })
  return NextResponse.json({ data: product }, { status: 201 })
}
```

---

## Middleware

```typescript
// middleware.ts (root level)
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Custom middleware logic
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // RBAC: redirect nếu không có quyền
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Chặn tất cả nếu không có token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/protected/:path*'],
}
```

---

## Data Fetching Patterns

### Fetch với caching

```typescript
// Server Component — fetch với Next.js caching
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: {
      revalidate: 3600,      // ISR: revalidate sau 1 giờ
      // tags: ['products'], // On-demand revalidation
    },
    // cache: 'no-store',    // Dynamic data (không cache)
    // cache: 'force-cache', // Static (mặc định)
  })

  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

### Parallel data fetching

```typescript
// ✅ Tốt — fetch song song, không waterfall
export default async function DashboardPage() {
  const [products, orders, stats] = await Promise.all([
    getProducts(),
    getOrders(),
    getStats(),
  ])

  return <Dashboard products={products} orders={orders} stats={stats} />
}
```

---

## Database: Prisma + PostgreSQL

### Schema mẫu

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  description String?
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  @@map("products")
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Prisma client singleton (tránh hot-reload issues)

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## Auth: NextAuth.js v4

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
          return null
        }

        return { id: user.id, email: user.email, role: user.role, name: user.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}
```

---

## Deployment

### Vercel (khuyến nghị)

```bash
# Vercel CLI
npm i -g vercel
vercel --prod

# Environment variables: set qua Vercel dashboard hoặc CLI
vercel env add DATABASE_URL production
```

### Self-hosted với Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/myapp
      NEXTAUTH_URL: https://yourdomain.com
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Code Gen Scaffolding cho Next.js

Khi MODSPEC chọn Next.js, tạo theo cấu trúc sau:

```
src/
├── app/
│   ├── {module}/
│   │   ├── page.tsx          # COMP-{SYS}-NNN: List view
│   │   ├── [id]/
│   │   │   └── page.tsx      # COMP-{SYS}-NNN: Detail view
│   │   └── new/
│   │       └── page.tsx      # COMP-{SYS}-NNN: Create form
│   └── api/
│       └── {module}/
│           ├── route.ts       # API-{SYS}-NNN: GET, POST
│           └── [id]/
│               └── route.ts   # API-{SYS}-NNN: GET, PUT, DELETE
├── actions/
│   └── {module}.actions.ts    # Server Actions
├── components/
│   └── {module}/
│       ├── {Module}List.tsx
│       ├── {Module}Form.tsx
│       └── {Module}Card.tsx
└── lib/
    └── {module}.service.ts    # Business logic (dùng từ Server Components và Actions)
```
