# Verification & Auto-Fix Loop — Code-Gen Quality Assurance

Sau khi gen code cho mỗi module, **BẮT BUỘC** chạy vòng lặp kiểm tra sau đây theo thứ tự.
Không được bỏ qua bất kỳ bước nào dù specs đơn giản.

---

## Tổng quan

```
Bước 1: Compile Check   → TypeScript / Python / Go build
Bước 2: Lint Check      → ESLint / Ruff / golangci-lint
Bước 3: Unit Test Run   → Jest / pytest / go test
Bước 4: Security Scan   → Checklist tự động (không cần external tool)
Bước 5: Integration Verification → Cross-layer consistency
Bước 6: Migration Test  → Up + Down migration
Bước 7: Coverage Report → Lines ≥ 80%, Branches ≥ 70%
Bước 8: Final Report    → Tổng hợp kết quả cho user
```

**Self-Healing:** Mỗi bước có tối đa **3 retry cycles** khi fail. Nếu vẫn fail sau 3 lần → đánh dấu và báo user rõ ràng.

---

## Bước 1: Compile Check

### Lệnh theo tech stack

```bash
# TypeScript / Node.js
npx tsc --noEmit

# Python
python -m py_compile src/**/*.py
# hoặc nếu dùng mypy:
mypy src/ --ignore-missing-imports

# Go
go build ./...

# Java / Spring Boot
mvn compile -q

# React Native / Expo
npx expo export --platform all --dump-assetmap 2>&1 | head -20
```

### Xử lý kết quả

```
PASS → Tiếp tục Bước 2

FAIL → Đọc error message toàn bộ → Phân tích:
  - Type mismatch → sửa type annotation / cast
  - Missing import → thêm import statement đúng
  - Undefined variable → khai báo hoặc import
  - Syntax error → fix cú pháp
  → Retry (đếm lần 1)

Sau 3 lần fail → đánh dấu trong code:
  // COMPILE-ERROR: [nội dung error message]
  // Cần sửa thủ công trước khi chạy
  → Báo user danh sách lỗi compile còn lại
```

### Self-Healing rules cho compile

| Lỗi phổ biến | Hành động tự fix |
|---|---|
| `Cannot find module 'X'` | Thêm `import X from 'X'` hoặc cài package |
| `Type 'X' is not assignable to type 'Y'` | Thêm type cast hoặc sửa interface |
| `Property 'X' does not exist on type 'Y'` | Thêm field vào interface |
| `Object is possibly 'undefined'` | Thêm optional chaining `?.` hoặc null check |
| `Missing return type` | Thêm return type annotation |

---

## Bước 2: Lint Check

### Lệnh theo tech stack

```bash
# TypeScript / JavaScript — ESLint
npx eslint src/ --max-warnings 0 --ext .ts,.tsx,.js,.jsx

# Python — Ruff
ruff check src/

# Go
golangci-lint run ./...

# Java
# (checkstyle tích hợp trong Maven build — đã cover ở Bước 1)
```

### Xử lý kết quả

```
PASS → Tiếp tục Bước 3

FAIL với auto-fixable errors → Chạy:
  npx eslint src/ --fix   (TypeScript)
  ruff check src/ --fix   (Python)
  → Verify lại → nếu PASS thì tiếp tục

FAIL với manual errors → Sửa từng lỗi:
  - Unused variable → xóa hoặc dùng '_' prefix
  - Missing semicolon / trailing comma → thêm
  - Import order → reorder
  - Unreachable code → xóa

Remaining errors không tự fix được:
  → Đánh dấu: // LINT-WARNING: [rule-name] — [lý do giữ lại]
  → Ghi vào Final Report
```

---

## Bước 3: Unit Test Run

### Lệnh theo tech stack

```bash
# Jest (TypeScript/JavaScript)
npx jest --passWithNoTests --forceExit --testTimeout=30000

# Pytest (Python)
pytest -x --tb=short

# Go
go test ./... -v -timeout 60s

# Spring Boot / JUnit
mvn test -q
```

### Xử lý kết quả

```
ALL PASS → Tiếp tục Bước 4

FAIL → Đọc test output:
  Phân tích failure type:

  (A) Lỗi trong CODE (assertion đúng nhưng code sai):
      - Expected: 200 Received: 400 → fix business logic
      - Expected: [object] Received: null → fix service method trả về đúng
      → Fix code → retry (max 3 lần)

  (B) Lỗi trong TEST (assertion sai so với spec):
      - Test assert sai giá trị không khớp TC spec
      → Fix test assertion cho đúng TC Pass criteria
      → Không sửa code chỉ để test pass

  (C) Infrastructure error (DB connection, env missing):
      - ECONNREFUSED → check test DB config
      - Missing env var → kiểm tra .env.test
      → Fix config → retry

Sau 3 lần fail → đánh dấu:
  // TEST-FAIL: [test name] — [lý do fail, cần sửa thủ công]
  → Ghi vào Final Report với action item
```

### Pattern sửa test thường gặp

```typescript
// SAI: Test không khớp TC spec
expect(result.status).toBe('approved');  // TC nói 'da_duyet'

// ĐÚNG: Sync với TC Pass criteria
expect(result.status).toBe('da_duyet');  // khớp TC-INV-002 Pass criteria
```

---

## Bước 4: Security Scan

**Quan trọng:** Bước này chạy checklist nội bộ, không cần external security tool.

### 4a. SQL Injection Check

```bash
# Tìm raw SQL string concatenation (nguy hiểm)
grep -rn "query.*\$\{" src/ --include="*.ts"
grep -rn "execute.*\+" src/ --include="*.py"
grep -rn "fmt.Sprintf.*SELECT" src/ --include="*.go"

# Tìm raw SQL không qua ORM
grep -rn "\.query(" src/ --include="*.ts"
grep -rn "execute_raw\|raw_query" src/ --include="*.py"
```

**Nếu tìm thấy:** Convert sang parameterized queries / ORM methods.

```typescript
// NGUY HIỂM — SQL Injection
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// AN TOÀN — Parameterized
db.query('SELECT * FROM users WHERE id = $1', [userId])
// Hoặc ORM
prisma.user.findUnique({ where: { id: userId } })
```

### 4b. XSS Check

```bash
# Tìm innerHTML / dangerouslySetInnerHTML với user input
grep -rn "innerHTML\s*=" src/ --include="*.tsx"
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx"

# Tìm template literals trong HTML contexts
grep -rn "\.html\s*=\s*\`" src/ --include="*.ts"
```

**Nếu tìm thấy:** Sử dụng textContent thay innerHTML, hoặc sanitize với DOMPurify.

### 4c. Unprotected Endpoints Check

```bash
# Tìm routes không có authenticate/authorize middleware
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" src/ --include="*.ts" | \
  grep -v "authenticate\|authorize\|public"
```

**Phân loại:**
- Endpoint công khai hợp lệ (login, register, health check) → thêm comment `// PUBLIC: reason`
- Endpoint thiếu auth → thêm `authenticate` middleware ngay

```typescript
// TRƯỚC (thiếu auth)
router.get('/orders', async (req, res) => { ... })

// SAU (có auth)
router.get('/orders', authenticate, authorize(['admin', 'staff']), async (req, res) => { ... })
```

### 4d. Hardcoded Secrets Check

```bash
# Tìm hardcoded credentials
grep -rn "password\s*=\s*['\"]" src/ --include="*.ts" --include="*.py"
grep -rn "api_key\s*=\s*['\"]" src/ --include="*.ts" --include="*.py"
grep -rn "secret\s*=\s*['\"]" src/ --include="*.ts" --include="*.py"
grep -rn "token\s*=\s*['\"]" src/ --include="*.ts" --include="*.py"

# Kiểm tra .gitignore
cat .gitignore | grep -E "\.env|\.key|\.pem"
```

**Nếu tìm thấy hardcoded secret:**
1. Move sang environment variable
2. Cập nhật `.env.example` với placeholder
3. Verify `.gitignore` có `.env`

### 4e. Input Validation Check

```bash
# Kiểm tra route handler có validation không
grep -rn "req\.body" src/ --include="*.ts" | head -20
# So sánh với số lượng Zod validate calls
grep -rn "\.parse\|\.safeParse\|validate(" src/ --include="*.ts" | head -20
```

**Kỳ vọng:** Mỗi `req.body` usage phải đi kèm validation call trước đó.

```typescript
// THIẾU validation — nguy hiểm
router.post('/users', async (req, res) => {
  const user = await userService.create(req.body);  // ❌
});

// CÓ validation — đúng
router.post('/users', async (req, res) => {
  const dto = CreateUserSchema.parse(req.body);     // ✅
  const user = await userService.create(dto);
});
```

### 4f. File Upload Check

```bash
grep -rn "upload\|multer\|formidable\|busboy" src/ --include="*.ts"
```

**Nếu có file upload:** Verify có MIME type whitelist và size limit:

```typescript
// Phải có: MIME whitelist + size limit
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
  fileFilter: (req, file, cb) => {
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Loại file không được hỗ trợ'));
    }
    cb(null, true);
  }
});
```

### Security Scan Output

```
SECURITY-REPORT — {Module} — {Date}

CRITICAL (phải fix ngay):
  [C1] SQL Injection risk tại src/erp/order/repositories/order.repository.ts:45
       Raw query: `SELECT * FROM orders WHERE id = ${id}`
       → Fix: sử dụng parameterized query

  [C2] Unprotected endpoint: GET /api/orders không có authenticate middleware
       → Fix: thêm authenticate middleware

HIGH (nên fix):
  [H1] File upload tại src/erp/docs/controllers/docs.controller.ts:78
       → Thiếu MIME type whitelist

WARNING (đã documented):
  [W1] dangerouslySetInnerHTML tại src/web/cms/components/RichText.tsx:23
       → Đã sanitize với DOMPurify (acceptable)

INFO:
  [I1] CORS config chưa có trong code — cần configure tại app entry point

Kết luận: 2 CRITICAL (tự fix) | 1 HIGH (tự fix) | 1 WARNING (documented) | 1 INFO
```

**Sau scan:** CRITICAL findings → tự fix ngay → chạy lại scan để verify.

---

## Bước 5: Integration Verification

Kiểm tra cross-layer consistency **không cần chạy code**, chỉ cần đọc file.

### 5a. Controller ↔ Service consistency

```
Với mỗi route handler trong controller:
  - route handler gọi service.methodName()
  → Kiểm tra service có method methodName() không
  → Nếu thiếu → thêm method stub vào service
```

### 5b. Service ↔ Repository consistency

```
Với mỗi repository call trong service:
  - service gọi repository.methodName()
  → Kiểm tra repository có method methodName() không
  → Nếu thiếu → thêm method vào repository
```

### 5c. DTO ↔ Zod Schema consistency

```
Với mỗi field trong TypeScript interface/DTO:
  - DTO có field: email: string
  → Zod schema phải có: email: z.string().email()
  → Nếu thiếu → thêm Zod rule
```

### 5d. Schema ↔ Migration consistency

```
Với mỗi TBL spec trong MODSPEC:
  - TBL-ERP-001: bảng orders
  → Migration file phải có: CREATE TABLE orders (...)
  → Nếu thiếu migration → sinh thêm migration file
```

### 5e. API Response ↔ DTO Type consistency

```
Với mỗi API endpoint trả về data:
  - Handler: res.json({ data: orderDto })
  → Type của orderDto phải match API Response spec
  → Nếu mismatch → fix type annotation
```

### Output

```
INTEGRATION VERIFICATION — {Module}

✅ Controller ↔ Service: 8/8 methods matched
✅ Service ↔ Repository: 12/12 methods matched
⚠️ DTO ↔ Zod: 1 field thiếu rule
   → orders/dtos/create-order.dto.ts: field 'deliveryDate' thiếu z.date()
   → Đã tự thêm
✅ Schema ↔ Migration: 3/3 tables có migration
✅ API Response ↔ Types: 8/8 endpoints type-safe
```

---

## Bước 6: Migration Test

### Kiểm tra migration files

```bash
# Liệt kê migration files
ls db/migrations/

# Verify mỗi migration có rollback section
grep -l "ROLLBACK\|DROP TABLE\|ALTER TABLE.*DROP" db/migrations/*.sql
```

### Checklist migration

```
Với mỗi migration file:
  □ Có CREATE TABLE hoàn chỉnh (đúng columns từ TBL spec)
  □ Có indexes (theo INDEX specs trong MODSPEC)
  □ Có foreign key constraints
  □ Có ROLLBACK script (DROP TABLE / DROP INDEX)
  □ Không có syntax errors (có thể kiểm tra bằng SQL parser)
```

### Nếu thiếu rollback

```sql
-- Thêm vào cuối migration file:

-- ==================== ROLLBACK ====================
-- Để rollback migration này:
-- DROP INDEX IF EXISTS idx_{table}_{col};
-- DROP TABLE IF EXISTS {table_name};
-- ==================================================
```

---

## Bước 7: Coverage Report

### Lệnh chạy coverage

```bash
# Jest
npx jest --coverage --coverageReporters=text-summary --forceExit

# Pytest
pytest --cov=src --cov-report=term-missing

# Go
go test ./... -cover -coverprofile=coverage.out
go tool cover -func=coverage.out | tail -1
```

### Thresholds

| Metric | Threshold tối thiểu | Lý tưởng |
|---|---|---|
| Line coverage | ≥ 80% | ≥ 90% |
| Branch coverage | ≥ 70% | ≥ 85% |
| Function coverage | ≥ 85% | ≥ 95% |

### Xử lý khi dưới threshold

```
Nếu coverage < threshold:
  1. Đọc coverage report → tìm uncovered lines
  2. Phân loại:
     (A) Service methods chưa có test → gen test case mới từ TC spec
     (B) Error paths chưa test → thêm error case tests
     (C) Edge cases → thêm boundary tests

  3. Gen thêm tests vào file __tests__/{mod}.service.test.ts
  4. Chạy lại coverage check
  5. Tối đa 2 vòng bổ sung tests
```

### Ví dụ gen thêm test khi thiếu coverage

```typescript
// Thêm test cho error path còn thiếu coverage:
describe('OrderService — error cases', () => {
  it('should throw NotFoundError khi đơn hàng không tồn tại', async () => {
    // Arrange
    const invalidId = faker.string.uuid();
    mockRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.getOrder(invalidId))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw BusinessRuleError khi số lượng < MIN_QUANTITY', async () => {
    // Arrange
    const dto = createValidOrderDto({ quantity: 0 });

    // Act & Assert
    await expect(service.createOrder(dto))
      .rejects.toThrow('BR-INV-001');
  });
});
```

---

## Bước 8: Final Report

Tổng hợp kết quả tất cả bước và trình bày cho user.

### Template Final Report

```
╔══════════════════════════════════════════════════════════════╗
║         VERIFICATION REPORT — {MODULE} — {DATE}             ║
╠══════════════════════════════════════════════════════════════╣
║ COMPILE      │ ✅ PASS    │ 0 errors                        ║
║ LINT         │ ✅ PASS    │ 0 warnings                      ║
║ TESTS        │ ✅ PASS    │ 24/24 passed (0 failed)         ║
║ SECURITY     │ ⚠️ SEE     │ 0 critical, 1 warning (docs'd)  ║
║ INTEGRATION  │ ✅ PASS    │ All layers consistent           ║
║ MIGRATION    │ ✅ PASS    │ Up ✓ | Down ✓                   ║
║ COVERAGE     │ ✅ PASS    │ Lines: 85% | Branches: 73%      ║
╠══════════════════════════════════════════════════════════════╣
║ CODE MARKERS                                                 ║
║  REVIEW markers : 2  → cần user xác nhận specs              ║
║  PENDING markers: 0  → không có phần thiếu specs            ║
╠══════════════════════════════════════════════════════════════╣
║ SECURITY FINDINGS (non-blocking)                             ║
║  [W1] dangerouslySetInnerHTML — đã sanitize với DOMPurify    ║
╠══════════════════════════════════════════════════════════════╣
║ TỔNG KẾT: ✅ Module {MOD} sẵn sàng cho /mcv3:verify         ║
╚══════════════════════════════════════════════════════════════╝

ACTION ITEMS cho user:
1. Review 2 REVIEW markers:
   - src/erp/order/services/order.service.ts:87 → logic xét duyệt đơn hàng
   - src/erp/order/services/order.service.ts:134 → giới hạn hạn mức tín dụng
```

### Final Report khi có FAIL

```
╔══════════════════════════════════════════════════════════════╗
║         VERIFICATION REPORT — {MODULE} — {DATE}             ║
╠══════════════════════════════════════════════════════════════╣
║ COMPILE      │ ❌ FAIL    │ 2 errors (xem bên dưới)         ║
║ LINT         │ ✅ PASS    │ 0 warnings                      ║
║ TESTS        │ ⚠️ PARTIAL │ 21/24 passed (3 failed)         ║
║ SECURITY     │ ❌ CRITICAL│ 1 critical chưa fix được        ║
║ INTEGRATION  │ ✅ PASS    │ All layers consistent           ║
║ MIGRATION    │ ✅ PASS    │ Up ✓ | Down ✓                   ║
║ COVERAGE     │ ⚠️ LOW     │ Lines: 71% (cần ≥80%)           ║
╠══════════════════════════════════════════════════════════════╣
║ ISSUES CẦN FIX THỦ CÔNG                                     ║
║                                                              ║
║ COMPILE ERRORS (2):                                         ║
║  1. src/erp/order/services/order.service.ts:45              ║
║     Type 'OrderStatus' không có value 'pending_payment'     ║
║     → Cần thêm 'pending_payment' vào enum OrderStatus       ║
║                                                              ║
║  2. src/erp/order/repositories/order.repository.ts:67      ║
║     Cannot find name 'PrismaClient' — missing import        ║
║     → Thêm: import { PrismaClient } from '@prisma/client'   ║
║                                                              ║
║ TEST FAILURES (3):                                          ║
║  1. OrderService > createOrder > should validate stock      ║
║     Expected BusinessRuleError, Received: undefined         ║
║     → Service chưa check stock trước khi tạo đơn            ║
║                                                              ║
║ SECURITY CRITICAL (1):                                      ║
║  1. SQL injection tại order.repository.ts:89                ║
║     → Chuyển sang Prisma query                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Self-Healing Rules Tổng hợp

| Loại lỗi | Hành động | Max retry |
|---|---|---|
| Compile error — type mismatch | Sửa type annotation | 3 |
| Compile error — missing import | Thêm import statement | 3 |
| Lint — auto-fixable | Chạy `--fix` flag | 1 |
| Lint — manual | Sửa từng rule | 3 |
| Test fail — logic error | Fix code/test | 3 |
| Test fail — infra/config | Fix config | 2 |
| Security CRITICAL — SQL injection | Convert to ORM | 1 |
| Security CRITICAL — missing auth | Thêm middleware | 1 |
| Security CRITICAL — hardcoded secret | Move to env var | 1 |
| Integration mismatch | Thêm missing method | 1 |
| Coverage below threshold | Gen thêm tests | 2 |

**Quy tắc vàng:** Sau mỗi self-fix, PHẢI chạy lại check đó để verify fix đúng, không tạo lỗi mới.
