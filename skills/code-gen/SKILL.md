# Code-Gen Skill — `/mcv3:code-gen`

## Mục đích

Chuyển **MODSPEC (Phase 5)** thành **Source Code** — Phase 7.

Sinh code **thông minh theo mức độ chi tiết của specs**:

| Tình huống | Hành vi | Marker |
|-----------|---------|--------|
| Specs đầy đủ (BR, API, TBL, TC rõ ràng) | Sinh code hoàn chỉnh, zero TODO | _(không có marker)_ |
| Specs mơ hồ (BR tồn tại nhưng logic chưa rõ) | Sinh code best-effort | `// REVIEW: [câu hỏi cụ thể]` |
| Specs thiếu (không có BR/TBL cho phần này) | Sinh interface/stub | `// PENDING: Cần bổ sung specs tại Phase X` |

Với mỗi module, tạo:
- **Project structure** theo tech stack đã chọn
- **API route handlers** từ API-{SYS}-NNN specs (có business logic nếu specs đủ)
- **Database migrations** từ TBL-{SYS}-NNN specs (real schema)
- **Service classes** với BR logic từ MODSPEC
- **Config files** (env, docker, CI pipeline)
- **Tests** từ TC specs

Mọi code file PHẢI có **REQ-ID comment** truy về MODSPEC.

---

## DEPENDENCY MAP

```
Requires:
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md (Phase 5 — bắt buộc)
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (Phase 6 — test specs)
  - _PROJECT/PROJECT-OVERVIEW.md (tech stack)
  - _PROJECT/PROJECT-ARCHITECTURE.md (conventions)
Produces:
  - src/{sys}/{mod}/ (code với business logic, REVIEW/PENDING markers nếu cần)
  - src/{sys}/{mod}/__tests__/ (tests từ TC specs)
  - db/migrations/ (real schema từ TBL specs)
  - docker-compose.yml, .env.example (nếu chưa có)
  - .github/workflows/ci.yml (CI pipeline)
Enables: /mcv3:verify (Phase 8)
Agents: code-gen (chuyên biệt), tech-expert (validate)
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_checkpoint, mc_traceability
References:
  - skills/code-gen/references/code-patterns.md
  - skills/code-gen/references/tech-stack-guides.md
  - skills/code-gen/references/embedded-tech-stack-guide.md (Embedded/Firmware)
  - skills/code-gen/references/embedded-code-patterns.md (Embedded/Firmware)
  - skills/code-gen/references/tech-stack-nextjs.md     ← Next.js 14+ App Router
  - skills/code-gen/references/tech-stack-mobile.md     ← React Native + Flutter
  - skills/code-gen/references/database-nosql-guide.md  ← MongoDB, Firebase, Supabase, Redis
  - skills/code-gen/references/implementation-patterns.md ← BR→Code transpiler
  - skills/code-gen/references/query-patterns.md          ← Prisma/SQLAlchemy queries
  - skills/code-gen/references/validation-codegen.md      ← TBL→Zod schemas
  - skills/code-gen/references/test-codegen.md            ← TC→real test code
  - skills/code-gen/references/integration-patterns.md    ← Multi-system HTTP client, events
  - skills/code-gen/references/verification-loop.md       ← Verification & Auto-Fix Loop (Phase 9)
  - skills/code-gen/references/security-checklist.md      ← Security checklist tự động
  - skills/code-gen/references/rollback-mechanism.md      ← Rollback & safety checkpoint
  - templates/p5-tech-design/MODSPEC-TEMPLATE.md
  - templates/p5-tech-design/FIRMWARE-MODSPEC-TEMPLATE.md (Embedded/Firmware)
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:qa-docs` hoàn thành (TEST file có sẵn)
- Sẵn sàng generate code từ design đã hoàn chỉnh
- Tech stack đã được confirm ở Phase 5

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**Documents từ phases trước thiếu (RISK-008 — BLOCKING vs WARNING):**

| Loại file thiếu | Phân loại | Hành động bắt buộc |
|-----------------|-----------|---------------------|
| MODSPEC-{MOD}.md | ❌ BLOCKING | DỪNG — không thể gen code. Chạy `/mcv3:tech-design` |
| TEST-{MOD}.md | ❌ BLOCKING | DỪNG — không thể gen real tests. Chạy `/mcv3:qa-docs` |
| PROJECT-OVERVIEW.md (tech stack) | ⚠️ WARNING | Tự chọn default tech stack — ghi DECISION |
| PROJECT-ARCHITECTURE.md | ⚠️ WARNING | Bỏ qua convention check — tiếp tục với defaults |

**Nguyên tắc phân loại:**
- **BLOCKING** = file chứa specs cần thiết để gen code đúng → DỪNG ngay, báo user file nào thiếu + skill nào để tạo
- **WARNING** = file convention/context → tiếp tục với defaults, ghi DECISION

**MODSPEC chưa có:**
- Báo user: "Chưa có MODSPEC cho module này → Chạy /mcv3:tech-design trước."

**TEST file chưa có:**
- ❌ BLOCKING: DỪNG — không thể generate real test assertions
- Báo user: "Chưa có TEST-{MOD}.md. Chạy /mcv3:qa-docs trước để có test specs."

**Verification Loop step thất bại liên tục (>3 retries):**
- Dừng auto-fix, báo user cụ thể lỗi gì
- Đánh dấu `// REVIEW: [lỗi cụ thể]` tại vị trí có vấn đề
- Tiếp tục generate các module khác, không block toàn bộ

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự chọn module theo MODSPEC files, tự generate code + tests
2. **Tự giải quyết vấn đề** — REVIEW/PENDING markers khi specs không đủ, ghi DECISION
3. **Báo cáo sau khi xong** — list code files + verification results + security findings
4. **User review** — giải thích REVIEW markers, cập nhật nếu user cung cấp thêm specs
5. **Gợi ý bước tiếp** — `/mcv3:verify`

---

## Token Efficiency

**Dự án nhỏ (1-3 modules):**
- Chỉ load references phù hợp với tech stack đã chọn
- Ví dụ: Node.js → chỉ load code-patterns.md + query-patterns.md, không load embedded-code-patterns.md
- Chỉ load verification-loop.md khi cần chạy verification step

**Dự án lớn (5+ modules):**
- Xử lý từng module riêng biệt — không load toàn bộ context cùng lúc
- Sau mỗi module: mc_checkpoint → giải phóng context → load module tiếp theo
- Không load tất cả MODSPEC cùng lúc — chỉ load MODSPEC của module đang generate

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project, tech stack từ _config.json
2. mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → liệt kê MODSPECs
3. mc_list({ subPath: "{SYSTEM}/P3-QA-DOCS" }) → kiểm tra TEST files
4. Kiểm tra project structure hiện tại (src/ đã có gì)
5. Tự xác định module order:
   - MODSPEC available → dependency order (shared/auth trước, business logic sau)
   - mc_checkpoint trước khi bắt đầu generate (pre-codegen checkpoint)
   - Tự bắt đầu generate — không hỏi user confirm

6. [MANDATORY] Scale Detection — Đếm tổng số MODSPEC files:
   - Nếu ≥ 5 modules → CHẾ ĐỘ LARGE PROJECT (xem Batch Mode ở Phase 0 Safety Checkpoint)
     → Ghi log: "Large project: {N} modules detected — kích hoạt Batch Mode"
   - Nếu < 5 modules → Chế độ Standard, tiếp tục bình thường
```

**Nếu thiếu MODSPEC:**
```
⛔ BLOCKING — Chưa có MODSPEC cho module này.
   Hãy chạy /mcv3:tech-design trước.
```

**Mobile Project Path:**
```
Nếu project là Mobile App (React Native / Flutter — phát hiện từ MODSPEC hoặc PROJECT-OVERVIEW):
  - Dùng MOBILE-MODSPEC-TEMPLATE thay vì MODSPEC-TEMPLATE
  - Load tech-stack-mobile.md (Zustand/Riverpod, TanStack Query/Dio, EAS)
  - Output structure: src/{sys}/{mod}/ theo cấu trúc mobile (xem Phase 2c bên dưới)
  - Không generate db/migrations hay docker-compose (backend riêng)
  - Generate thêm: eas.json, app.json env config, mobile CI pipeline
  - Test: Jest + RNTL (RN) hoặc flutter_test + Widget Test (Flutter)
  - Không có backend routes — thay bằng API client + Zustand/Riverpod stores
```

**Embedded Project Path:**
```
Nếu project là Firmware/Embedded (phát hiện từ MODSPEC hoặc PROJECT-OVERVIEW):
  - Dùng FIRMWARE-MODSPEC-TEMPLATE thay vì MODSPEC-TEMPLATE
  - Load embedded-tech-stack-guide.md + embedded-code-patterns.md
  - Output structure khác: src/{sys}/{mod}/*.c, *.h thay vì .ts
  - Không generate db/migrations hay docker-compose
  - Generate: PlatformIO project structure, FreeRTOS tasks, HAL wrappers
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-code-gen-{MOD}",
  sessionSummary: "Chuẩn bị chạy /mcv3:code-gen cho module {MOD}",
  nextActions: ["Tiếp tục /mcv3:code-gen cho module {MOD} — Phase 1: Context Loading & Tech Stack"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu sinh code..."

**Large project batch processing (RISK-006) — áp dụng khi ≥5 modules:**
```
// Phát hiện large project: mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → đếm MODSPEC files
// Nếu ≥5 MODSPEC files → kích hoạt Batch Mode:

1. Lưu BATCH CHECKPOINT trước Phase 1:
   mc_checkpoint({
     label: "pre-code-gen-batch",
     sessionSummary: "Large project: {N} modules cần code gen. Batch mode ON.",
     nextActions: ["Batch 1: Layer 0 (Auth, Shared) + {MOD1}"]
   })

2. Chia modules thành batches theo Multi-System Build Order:
   Batch 1: Layer 0 (Auth + Infrastructure)
   Batch 2: Layer 1 (Master data modules)
   Batch 3: Layer 2 (Business services)
   Batch 4+: Layer 3-4 (Integration, Frontend)

3. Per-module checkpoint sau mỗi module (BẮT BUỘC):
   mc_checkpoint({ label: "code-gen-{MOD}-complete", ... })

4. Batch checkpoint sau mỗi batch:
   mc_checkpoint({ label: "code-gen-batch-{N}-complete", ... })

5. KHÔNG load toàn bộ MODSPEC cùng lúc — chỉ load MODSPEC của module đang generate (layer: 3)
```

---

## Phase 1 — Context Loading & Tech Stack

### 1a. Load MODSPEC đầy đủ

```
// BLOCKING — nếu MODSPEC load fail: ❌ DỪNG ngay, báo user chạy /mcv3:tech-design trước
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 3 })
→ Nếu NOT FOUND / ERROR → ❌ DỪNG: "Chưa tìm thấy MODSPEC-{MOD}.md. Chạy /mcv3:tech-design trước."

// BLOCKING — nếu TEST file load fail: ❌ DỪNG, báo user chạy /mcv3:qa-docs trước
mc_load({ filePath: "{SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md", layer: 2 })
→ Nếu NOT FOUND / ERROR → ❌ DỪNG: "Chưa tìm thấy TEST-{MOD}.md. Chạy /mcv3:qa-docs trước."

mc_load({ filePath: "_PROJECT/PROJECT-ARCHITECTURE.md", layer: 2 })
→ Nếu NOT FOUND → ⚠️ WARNING (không dừng): "Thiếu PROJECT-ARCHITECTURE.md, dùng convention defaults"
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
- BR-{DOM}-NNN specs (business rules — đánh giá mức độ chi tiết)

**Đánh giá mức độ chi tiết của specs:**
```
Với mỗi BR/API/TBL — phân loại:
  FULL: Spec đầy đủ, logic rõ ràng → sinh code hoàn chỉnh
  VAGUE: Spec tồn tại nhưng thiếu chi tiết → sinh best-effort + // REVIEW:
  MISSING: Không có spec cho phần này → sinh interface + // PENDING:
```

### 1c. Load references

```
code-patterns.md + tech stack guide phù hợp (luôn load)
implementation-patterns.md  ← BR→Code transpiler rules
query-patterns.md           ← Real database queries
validation-codegen.md       ← TBL schema → Zod schemas
test-codegen.md             ← TC specs → real tests
```

**Load reference phù hợp với tech stack:**
- Next.js → `references/tech-stack-nextjs.md` (App Router, Server Actions, Prisma)
- React Native / Expo → `references/tech-stack-mobile.md` (Zustand, TanStack Query, EAS)
- Flutter → `references/tech-stack-mobile.md` (Riverpod, go_router, Dio)
- MongoDB / Firebase / Supabase / Redis → `references/database-nosql-guide.md`

### 1d. Auto-notify (không chờ xác nhận — bắt đầu generate ngay)

Thông báo scope rồi tự động bắt đầu (không hỏi "Tiếp tục?"):

```
"⚙️ Bắt đầu generate code module {MOD}:
- Language: {TypeScript / Python / Java}
- Framework: {Express.js / FastAPI / Spring Boot}
- ORM: {Prisma / SQLAlchemy / JPA}
- Output: src/{sys}/{mod}/

Sẽ tạo: {N} handlers, {M} service methods, {K} migrations, {L} test files, CI pipeline.
REVIEW markers: chỗ specs mơ hồ. PENDING markers: chỗ thiếu specs.

→ Generating..."
```

→ Tự động chuyển sang Phase 2 ngay lập tức, không chờ user reply.

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
│   └── {mod}.validator.ts        # Input validation (Zod schemas)
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

### 2c. Mobile Structure — React Native (Expo Router)

```
src/
├── app/
│   └── (tabs)/
│       └── {mod_lower}/
│           ├── index.tsx         # COMP-{SYS}-NNN: List screen
│           ├── [id].tsx          # COMP-{SYS}-NNN: Detail screen
│           └── create.tsx        # COMP-{SYS}-NNN: Create/Edit screen
├── components/
│   └── {mod_lower}/
│       ├── {Mod}Card.tsx         # List item component
│       ├── {Mod}Form.tsx         # Form component
│       ├── {Mod}Skeleton.tsx     # Loading skeleton
│       └── {Mod}Empty.tsx        # Empty state
├── hooks/
│   └── use{Mod}.ts               # FT-{SYS}-NNN: TanStack Query hooks
├── services/api/
│   └── {mod_lower}.api.ts        # API-{SYS}-NNN: Axios API calls
├── stores/
│   └── {mod_lower}.store.ts      # FT-{SYS}-NNN: Zustand store
└── __tests__/
    ├── {mod_lower}.store.test.ts  # Store unit tests
    └── {Mod}ListScreen.test.tsx   # RNTL component tests
```

### 2d. Mobile Structure — Flutter (Feature-First)

```
lib/
└── features/
    └── {mod_lower}/
        ├── data/
        │   ├── datasources/
        │   │   └── {mod_lower}_remote_datasource.dart   # Dio API calls
        │   ├── models/
        │   │   └── {mod_lower}_model.dart               # JSON-serializable DTO
        │   └── repositories/
        │       └── {mod_lower}_repository_impl.dart     # Repository implementation
        ├── domain/
        │   ├── entities/
        │   │   └── {mod_lower}.dart                     # Business entity
        │   ├── repositories/
        │   │   └── {mod_lower}_repository.dart          # Repository interface
        │   └── usecases/
        │       ├── get_{mod_lower}s.dart                # FT-{SYS}-NNN
        │       └── create_{mod_lower}.dart              # FT-{SYS}-NNN
        └── presentation/
            ├── providers/
            │   └── {mod_lower}_provider.dart            # Riverpod provider + state
            ├── pages/
            │   ├── {mod_lower}_list_page.dart           # SCR-{MOD}-001
            │   ├── {mod_lower}_detail_page.dart         # SCR-{MOD}-002
            │   └── create_{mod_lower}_page.dart         # SCR-{MOD}-003
            └── widgets/
                ├── {mod_lower}_card.dart
                └── {mod_lower}_form.dart
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

### 3b. Quy tắc 3 tầng khi sinh code

**Tầng 1 — Specs đầy đủ: Sinh code hoàn chỉnh**

Khi BR, TBL, TC rõ ràng → implement trực tiếp từ specs, không để TODO:

```typescript
// REQ-ID: US-{MOD}-NNN, FT-{MOD}-NNN
// BR-ID: BR-{DOM}-NNN — {Tên BR}

// Ví dụ BR Validation → if/throw pattern (xem implementation-patterns.md)
if (quantity < MIN_QUANTITY) {
  throw new BusinessRuleError('BR-WH-001', `Số lượng tối thiểu là ${MIN_QUANTITY}`);
}

// Ví dụ BR Calculation → named function
function tinhGiaTriTonKho(soLuong: number, donGia: number): number {
  // BR-INV-005: Giá trị tồn kho = số lượng × đơn giá hiện tại
  return soLuong * donGia;
}

// Ví dụ BR Workflow → state machine
const TRANG_THAI_HOP_LE: Record<TrangThaiDon, TrangThaiDon[]> = {
  'cho_duyet': ['da_duyet', 'tu_choi'],
  'da_duyet': ['dang_giao', 'huy'],
  'dang_giao': ['hoan_thanh', 'huy'],
  'hoan_thanh': [],
  'tu_choi': [],
  'huy': []
};
```

**Tầng 2 — Specs mơ hồ: Sinh best-effort + REVIEW**

Khi BR tồn tại nhưng chi tiết chưa đủ để implement hoàn toàn:

```typescript
async xetDuyetDonHang(donId: string, nguoiDuyetId: string): Promise<DonHang> {
  const don = await this.donHangRepository.findById(donId);
  if (!don) throw new NotFoundError(`Đơn hàng ${donId} không tồn tại`);

  // REVIEW: BR-SALES-003 quy định điều kiện xét duyệt nhưng chưa rõ:
  // - Hạn mức tiền tối đa người duyệt cấp 1 có thể duyệt là bao nhiêu?
  // - Nếu vượt hạn mức, cần escalate lên cấp 2 hay từ chối ngay?
  // Hiện tại implement theo flow đơn giản, cần confirm với BA.
  return this.donHangRepository.capNhatTrangThai(donId, 'da_duyet', nguoiDuyetId);
}
```

**Tầng 3 — Thiếu specs: Sinh interface + PENDING**

Khi không có BR/TBL spec cho phần này:

```typescript
// PENDING: Cần bổ sung specs tại Phase 4 (Requirements)
// Module báo cáo tồn kho chưa có URS/FT tương ứng.
// Tạm thời định nghĩa interface để các module khác có thể import.
export interface BaoCaoTonKhoService {
  layBaoCaoTheoKho(khoId: string, tuNgay: Date, denNgay: Date): Promise<BaoCaoTonKho>;
}
```

### 3c. API Route Handler

Từ mỗi API-{SYS}-NNN spec, sinh handler với business logic (nếu specs đủ):

```typescript
// REQ-ID: US-{MOD}-NNN, FT-{MOD}-NNN
// API-ID: API-{SYS}-NNN
router.{method}('{path}', authenticate, authorize(['{role}']), async (req, res) => {
  try {
    const dto = validate{Mod}Dto(req.body); // Zod validation từ TBL specs
    const result = await {mod}Service.{action}(dto);
    return res.status({code}).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
});
```

### 3d. Database Migration (từ TBL specs)

Sinh real schema từ TBL-{SYS}-NNN columns:

```sql
-- Migration: V{NNN}__create_{table_name}.sql
-- REQ-ID: TBL-{SYS}-NNN
-- Tạo bởi /mcv3:code-gen từ MODSPEC-{MOD}.md
-- Ngày: {DATE}

CREATE TABLE {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- {Điền các columns từ TBL spec với đúng kiểu dữ liệu và constraints}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT {name} UNIQUE ({fields}),
    CONSTRAINT {fk} FOREIGN KEY ({col}) REFERENCES {table}(id)
);

CREATE INDEX idx_{table}_{col} ON {table}({col});

-- ROLLBACK:
-- DROP TABLE IF EXISTS {table_name};
```

### 3e. TypeScript Interface + Zod DTO

Từ TBL-{SYS}-NNN columns, sinh interface + Zod schema:

```typescript
// REQ-ID: FT-{MOD}-NNN
// TBL-ID: TBL-{SYS}-NNN
export interface {Mod} {
  id: string;
  // {Fields từ TBL spec với đúng types}
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Zod schema từ column specs (xem validation-codegen.md)
export const Create{Mod}Schema = z.object({
  // {Mỗi column → z.type() với constraints từ TBL spec}
});
export type Create{Mod}Dto = z.infer<typeof Create{Mod}Schema>;
```

### 3f. Test File (từ TC specs)

Từ TEST-{MOD}.md, sinh tests thực với assertions:

```typescript
// REQ-ID: TC-{MOD}-NNN
import { faker } from '@faker-js/faker';

describe('{Mod}Service', () => {

  // TC-{MOD}-001: {Tên test case từ TEST file}
  it('should {expected behavior từ Pass criteria}', async () => {
    // Arrange — factory từ TBL schema
    const input = {
      // {Fields với faker data phù hợp với constraints}
    };

    // Act
    const result = await {mod}Service.{action}(input);

    // Assert — từ TC Pass criteria
    expect(result.id).toBeDefined();
    expect(result.{field}).toBe({expected_value});
  });

  // TC-{MOD}-002: Error case
  it('should throw {ErrorType} when {invalid condition từ TC spec}', async () => {
    // {Invalid input theo TC Preconditions}
    await expect({mod}Service.{action}(invalidInput))
      .rejects.toThrow({ErrorType});
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

# {Module}-specific config từ NFR specs
{MOD_UPPER}_TIMEOUT=30000
{MOD_UPPER}_MAX_RETRIES=3
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

### 4c. CI Pipeline

**Web/Backend:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
```

**Mobile (React Native / Expo):**
```yaml
# .github/workflows/ci-mobile.yml
name: Mobile CI
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit        # TypeScript check
      - run: npm run lint
      - run: npm test -- --coverage --passWithNoTests --forceExit
  # EAS Build (production) — trigger riêng khi merge vào main
  # Xem: skills/deploy-ops/references/mobile-deploy-guide.md

**Mobile (Flutter):**
```yaml
# .github/workflows/ci-flutter.yml
name: Flutter CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: 'stable' }
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      - run: dart format --set-exit-if-changed lib/ test/
```

---

## Phase 5 — Review & Validate

### 5a. Code Review Checklist

```
✅ Mọi file có REQ-ID comment header
✅ Mọi route handler có authenticate + authorize middleware
✅ Mọi input được validate qua Zod schema (không trust raw request)
✅ Lỗi được handle đúng cách (không expose stack trace)
✅ Business logic trong Service, không trong Controller
✅ Database access chỉ trong Repository
✅ Test files tương ứng với TC-IDs trong TEST-{MOD}.md
✅ Mọi BR spec có code implementation tương ứng (nếu spec đủ)
✅ Mọi TBL column có Zod validation tương ứng
✅ CI pipeline file đã tạo
```

### 5b. Tổng kết với user

```
"📁 Tôi đã generate {N} files cho module {MOD}:

Backend:
  src/{sys}/{mod}/controllers/{mod}.controller.ts  ({X} endpoints)
  src/{sys}/{mod}/services/{mod}.service.ts        ({Y} methods)
  src/{sys}/{mod}/repositories/{mod}.repository.ts ({Z} real queries)
  src/{sys}/{mod}/validators/{mod}.validator.ts    (Zod schemas từ TBL+BR)

Database:
  db/migrations/V{NNN}__create_{table}.sql  (real schema với indexes)

Tests:
  src/{sys}/{mod}/__tests__/{mod}.service.test.ts  ({K} test cases)

CI/CD:
  .github/workflows/ci.yml

[Nếu có REVIEW markers]:
⚠️ {M} chỗ cần xem lại — specs mơ hồ, tìm kiếm '// REVIEW:' trong code.
   Câu hỏi cụ thể đã được ghi tại từng vị trí.

[Nếu có PENDING markers]:
📋 {P} chỗ cần bổ sung specs — tìm kiếm '// PENDING:' trong code.
   Cần quay lại Phase 4 hoặc 5 để bổ sung trước khi implement.

[Nếu không có marker nào]:
✅ Code hoàn chỉnh 100% từ specs."
```

---

## Phase 9 — Verification & Auto-Fix Loop
> Lưu ý: "Phase 9" là tên khái niệm trong MCV3 pipeline (Batch E), chạy **giữa** Phase 5 (Review) và Phase 6 (Save) trong luồng code-gen.

SAU KHI gen code cho mỗi module, **BẮT BUỘC** chạy verification loop.
Không được bỏ qua hoặc rút ngắn dù specs đơn giản.

> **RISK-004 — Pre-Completion Gate:** Phase 9 PHẢI chạy đủ 8 bước TRƯỚC KHI chuyển sang Phase 6 (Save) và trước Completion Report.
> Compile FAIL hoặc Tests FAIL sau 3 retries → ❌ DỪNG toàn bộ module — không save, không báo cáo complete.

> **Chi tiết đầy đủ:** `references/verification-loop.md`
> **Security checklist:** `references/security-checklist.md`
> **Rollback khi cần:** `references/rollback-mechanism.md`

### 9.1 Compile Check

```bash
# TypeScript
npx tsc --noEmit

# Python
python -m py_compile src/**/*.py

# Go
go build ./...
```

- PASS → tiếp tục 9.2
- FAIL → đọc error → tự fix (type mismatch, missing import, syntax) → retry (max 3 lần)
- Vẫn fail sau 3 lần → ❌ DỪNG module này: đánh dấu `// COMPILE-ERROR: [error]`, ghi vào Final Report, KHÔNG save code, báo user fix thủ công

### 9.2 Lint Check

```bash
npx eslint src/ --max-warnings 0   # TypeScript/JavaScript
ruff check src/                    # Python
```

- PASS → tiếp tục 9.3
- FAIL auto-fixable → chạy `--fix` flag → verify lại
- Remaining errors → đánh dấu `// LINT-WARNING: [rule]`

### 9.3 Unit Test Run

```bash
npx jest --passWithNoTests --forceExit   # Jest
pytest -x --tb=short                     # pytest
```

- ALL PASS → tiếp tục 9.4
- FAIL → phân tích: lỗi trong code hay test? → fix đúng chỗ → retry (max 3 lần)
- Vẫn fail sau 3 lần → ❌ DỪNG module này: đánh dấu `// TEST-FAIL: [test name] — [lý do]`, ghi vào Final Report, KHÔNG save code, báo user fix thủ công
  // RISK-007: Phân loại kết quả test:
  // - Test fail do assertion sai → BLOCKING (fix code)
  // - Test fail do mock/fixture sai → WARNING (fix test setup, ghi DECISION)

### 9.4 Security Scan

Chạy **security-checklist.md** theo thứ tự:

```
□ Input Validation: mọi req.body có Zod/Joi parse
□ Auth/Authz: non-public routes có authenticate + authorize
□ Data Protection: không leak password/token trong response
□ Injection: không raw SQL với user input, không eval()
□ Secrets: không hardcode credentials, .gitignore có .env
```

- CRITICAL fail → **tự fix ngay** (thêm validation, auth middleware, hash password)
- HIGH fail → đánh dấu `// SECURITY-WARNING: [finding]` + ghi vào Final Report

### 9.5 Integration Check

Kiểm tra cross-layer consistency:

```
□ Controller ↔ Service: mỗi handler gọi service method tồn tại
□ Service ↔ Repository: mỗi repo call có method tương ứng
□ DTO ↔ Zod: mỗi field có validation rule
□ TBL ↔ Migration: mỗi table spec có migration file
□ API Response ↔ Types: mọi endpoint return đúng type
```

- Mismatch → tự thêm missing method/field → verify lại

### 9.6 Migration Test

```
□ Mỗi migration có ROLLBACK script (DROP TABLE / DROP INDEX)
□ Column definitions khớp với TBL specs
□ Indexes và constraints đầy đủ
□ Không có syntax errors trong SQL
```

- Thiếu rollback → sinh thêm rollback script

### 9.7 Coverage Check

```bash
npx jest --coverage --coverageReporters=text-summary   # Jest
pytest --cov=src --cov-report=term-missing             # pytest
```

Thresholds tối thiểu: **Lines ≥ 80%** | **Branches ≥ 70%**

- Dưới threshold → xác định uncovered lines → gen thêm tests (error cases, edge cases) → retry (max 2 lần)

### 9.8 Final Report

Trình bày tổng hợp cho user theo format:

```
╔══════════════════════════════════════════════════════════════╗
║     VERIFICATION REPORT — {MODULE} — {DATE}                 ║
╠══════════════════════════════════════════════════════════════╣
║ COMPILE      │ ✅/❌ │ [kết quả]                            ║
║ LINT         │ ✅/❌ │ [kết quả]                            ║
║ TESTS        │ ✅/❌ │ [X/Y passed]                         ║
║ SECURITY     │ ✅/⚠️ │ [X critical, Y warning]              ║
║ INTEGRATION  │ ✅/❌ │ [All layers consistent / gaps]       ║
║ MIGRATION    │ ✅/❌ │ [Up ✓ | Down ✓]                      ║
║ COVERAGE     │ ✅/❌ │ [Lines: X% | Branches: Y%]           ║
╠══════════════════════════════════════════════════════════════╣
║ REVIEW markers : [N] — cần user xác nhận specs              ║
║ PENDING markers: [N] — cần bổ sung specs                    ║
║ SECURITY-WARNING: [N] — documented                          ║
╠══════════════════════════════════════════════════════════════╣
║ TỔNG KẾT: ✅ READY / ⚠️ ISSUES / ❌ BLOCKED                ║
╚══════════════════════════════════════════════════════════════╝
```

Nếu có FAIL không tự fix được → liệt kê rõ ràng + đề xuất action cho user.

---

## Phase 6 — Save & Traceability

```
// CHỈ chạy Phase 6 khi Phase 9 (Verification Loop) đã PASS — RISK-004

1. Với mỗi file code tạo ra, dùng Write tool (không qua mc_save —
   code là file thật, không phải project memory document)

2. [BẮT BUỘC] mc_traceability({
     // RISK-005: đăng ký TẤT CẢ REQ-ID mappings — code file → spec IDs
     action: "link",
     items: [
       { from: "US-{MOD}-001", to: "src/{sys}/{mod}/services/{mod}.service.ts" },
       { from: "FT-{MOD}-001", to: "src/{sys}/{mod}/services/{mod}.service.ts" },
       { from: "API-{SYS}-001", to: "src/{sys}/{mod}/controllers/{mod}.controller.ts" },
       { from: "TBL-{SYS}-001", to: "db/migrations/V001__create_{table}.sql" },
       { from: "TC-{MOD}-001", to: "src/{sys}/{mod}/__tests__/{mod}.service.test.ts" },
       // ... tất cả IDs từ MODSPEC và TEST file
     ]
   })

3. [BẮT BUỘC — per-module checkpoint] mc_checkpoint({
     // RISK-003: checkpoint riêng cho mỗi module — BẮT BUỘC
     label: "sau-code-gen-{mod}",
     sessionSummary: "Code Gen {MOD}: {N} files, {M} API handlers, {K} migrations",
     nextActions: [
       "Review REVIEW markers nếu có",
       "Bổ sung specs cho PENDING markers nếu có",
       "Chạy /mcv3:verify"
     ]
   })
```

---

## Pre-Completion Verification

Code-Gen có **Phase 9 — Verification & Auto-Fix Loop** tích hợp sẵn (xem `skills/code-gen/references/verification-loop.md`). Section này tóm tắt gates bắt buộc trước Completion Report.

### Tầng 1 — Self-Verification (Verification Loop Steps 1-4)

```
✓ Compile Check PASS (tsc --noEmit / go build / py_compile — zero errors)
✓ Lint Check PASS (ESLint / Ruff — sau khi auto-fix)
✓ Test Run PASS (Jest / pytest — tất cả TCs từ TEST-{MOD}.md)
✓ Security Scan: zero CRITICAL findings (SQL injection, missing auth, hardcoded secrets)
```

### Tầng 2 — Cross-Document (Verification Loop Steps 5-7)

```
✓ Integration consistency: controller → service → repository không có missing methods
✓ Migration: Up + Down scripts hoạt động, có rollback script
✓ Coverage ≥ thresholds: Lines ≥ 80%, Branches ≥ 70%
✓ Mỗi code file có REQ-ID header comment trỏ về MODSPEC IDs
✓ Tất cả API-IDs từ MODSPEC có route handler tương ứng
✓ Tất cả TBL-IDs từ MODSPEC có migration file tương ứng
```

### Tầng 3 — Quality Gate

```
✅ Phase 9 Verification Loop đã chạy đủ 8 bước
✅ Compile: PASS | Lint: PASS | Tests: PASS | Security: 0 CRITICAL
✅ Coverage đạt threshold (Lines ≥ 80%, Branches ≥ 70%)
✅ REVIEW markers ghi rõ câu hỏi cụ thể (không vague như "check this")
✅ PENDING markers ghi rõ "Cần bổ sung tại Phase X"
✅ Không còn TODO/FIXME markers (dùng REVIEW/PENDING thay thế)
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Lưu ý:** Phase 9 Verification Loop kiểm tra output code (compile/test/security). Section này kiểm tra transitions GIỮA các phases — đảm bảo input cho mỗi phase đầy đủ trước khi bước vào.

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển sang phase tiếp theo:

### Sau Phase 0 → trước Phase 1:
- ✓ Tech stack xác định từ MODSPEC hoặc PROJECT-OVERVIEW (không để "unknown")
- ✓ Module order xác định theo dependency (auth/shared trước, business logic sau)
- ✓ Safety checkpoint đã lưu (pre-codegen checkpoint)

### Sau Phase 1 → trước Phase 2:
- ✓ Danh sách đầy đủ: API-IDs, TBL-IDs, BR-IDs, COMP-IDs đã extract từ MODSPEC
- ✓ Mức độ chi tiết của mỗi spec đã phân loại (FULL / VAGUE / MISSING)
- ✓ References phù hợp với tech stack đã load (không load references không liên quan)

### Sau Phase 2 → trước Phase 3:
- ✓ Project structure khớp với tech stack (Flutter structure không dùng cho Node.js project)
- ✓ Tất cả required folders đã định nghĩa trước khi gen code

### Sau Phase 3 → trước Phase 4:
- ✓ **REQ-ID comments**: mỗi file code có `@req-ids` / `@feat-ids` / `@api-ids` header trỏ về IDs trong MODSPEC (không phantom IDs)
- ✓ **API Coverage**: tất cả API-IDs từ MODSPEC có route handler tương ứng (hoặc PENDING marker)
- ✓ **TBL Coverage**: tất cả TBL-IDs từ MODSPEC có migration file tương ứng (hoặc PENDING marker)
- ✓ **BR Implementation**: BR-IDs trong code comments match BR-IDs trong MODSPEC
- ✓ Nếu dự án lớn: checkpoint sau mỗi module — ghi tóm tắt files đã gen + REVIEW/PENDING count

### Sau Phase 4 → trước Phase 5 (Review):
- ✓ Config files có thông tin từ specs (không phải toàn `{placeholder}`)
- ✓ CI pipeline có đủ steps: install → typecheck → lint → test

### Sau Phase 5 → trước Phase 9 (Verification Loop):
- ✓ Code Review Checklist (Phase 5a) đã chạy xong
- ✓ Không có TODO/FIXME markers (chỉ dùng REVIEW/PENDING)
- ✓ REVIEW markers có câu hỏi cụ thể (không vague như "check this")

### Sau Phase 9 → trước Phase 6 (Save):
- ✓ Verification Loop đã chạy đủ 8 bước (9.1 Compile → 9.8 Final Report)
- ✓ Compile: PASS | Lint: PASS | Tests: PASS | Security: 0 CRITICAL
- ✓ Coverage đạt threshold (Lines ≥ 80%, Branches ≥ 70%)
- ✓ Final Report (9.8) đã tạo cho module này
- ✓ Nếu dự án lớn: progress tracking rõ ràng — biết module nào DONE / IN-PROGRESS / PENDING

---

## Post-Gate — Quality Assurance

```
✅ Tất cả MODSPEC API-IDs có route handler tương ứng
✅ Tất cả MODSPEC TBL-IDs có migration file tương ứng
✅ Tất cả files có REQ-ID header comment
✅ Test files tương ứng với TC-IDs
✅ CI pipeline đã tạo
✅ Traceability FT → code đã link

Verification Loop (Phase 9):
✅ Compile: PASS (zero errors)
✅ Lint: PASS (zero warnings)
✅ Tests: ALL PASS + coverage ≥ thresholds
✅ Security: zero CRITICAL findings
✅ Integration: all layers consistent
✅ Migration: up ✓ down ✓ (rollback scripts có sẵn)
✅ REVIEW markers: [count] — cần user xem lại
✅ PENDING markers: [count] — cần bổ sung specs
✅ SECURITY-WARNING: [count] — documented trong Final Report

Completion Report (KHÔNG show full code — chỉ show tóm tắt):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:code-gen
═══════════════════════════════════════════════

✅ Đã sinh code cho {N} modules:
   {MOD1}: {X} files (controller, service, repo, validator, test)
           {M} API handlers, {K} migrations
   {MOD2}: ...

📊 Verification Loop:
   Compile: ✅/❌ | Lint: ✅/❌ | Tests: {X}/{Y} pass
   Coverage: Lines {L}% | Branches {B}%
   Security: {S} CRITICAL, {W} warnings
   REVIEW markers: {R} — cần xác nhận specs
   PENDING markers: {P} — cần bổ sung specs

⚠️ Tổng kết:
   Không có issue    → ✅ Code sẵn sàng verify
   Có REVIEW marker  → ⚠️ {R} điểm cần xác nhận specs (xem REVIEW markers trong code)
   Có PENDING marker → 📋 {P} phần thiếu specs (xem PENDING markers trong code)
   Có lỗi còn lại    → ❌ Cần fix thủ công (xem Final Report ở trên)

🔜 Bước tiếp theo: /mcv3:verify — Cross-verify traceability

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem danh sách files đã tạo? (cho biết module)
   [2] Xem REVIEW/PENDING markers? (để bổ sung specs)
   [3] OK, tiếp tục → /mcv3:verify
═══════════════════════════════════════════════
```

---

## Quy tắc Code Gen

```
REQ-ID-FIRST: Mọi file bắt đầu bằng REQ-ID comment
SPECS-DRIVE-QUALITY: Chất lượng code tỷ lệ thuận với độ chi tiết specs
BR-IMPLEMENT: Khi BR đủ rõ → implement hoàn chỉnh (xem implementation-patterns.md)
REAL-QUERIES: Dùng query-patterns.md để sinh Prisma/SQLAlchemy queries thực
ZOD-SCHEMA: Mọi TBL column có Zod validation tương ứng (xem validation-codegen.md)
REAL-TESTS: Mọi TC spec có test thực với assertions (xem test-codegen.md)
REVIEW-MARKER: Khi specs mơ hồ → sinh code best-effort + // REVIEW: [câu hỏi cụ thể]
PENDING-MARKER: Khi thiếu specs → sinh interface + // PENDING: Cần bổ sung tại Phase X
NO-BUSINESS-IN-CONTROLLER: Logic nghiệp vụ chỉ trong Service
REPOSITORY-PATTERN: Database access chỉ trong Repository
VALIDATE-INPUT: Mọi input từ request phải validate trước xử lý
TYPED: TypeScript strict mode, không dùng any
TESTABLE: Code viết để testable (inject dependencies)
TRACE-TO-SPEC: Mọi method/class trace về MODSPEC spec
CI-PIPELINE: PHẢI tạo CI pipeline file
```
