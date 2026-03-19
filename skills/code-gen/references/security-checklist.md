# Security Checklist — Auto-verify sau mỗi module

Chạy checklist này **bắt buộc** sau khi gen code cho mỗi module. Không cần external tools —
tất cả kiểm tra đều dựa trên grep và đọc code.

---

## Cách sử dụng

```
1. Chạy từng section theo thứ tự
2. Đánh dấu: ✅ Pass | ❌ Fail | N/A Không áp dụng
3. CRITICAL fail → TỰ FIX ngay, không tiếp tục sang module khác
4. HIGH fail → đánh dấu // SECURITY-WARNING: trong code + ghi vào Final Report
5. MEDIUM/LOW fail → ghi vào Final Report (informational)
```

---

## Section 1: Input Validation (CRITICAL)

### 1.1 Tất cả endpoints có input validation

```bash
# Đếm số req.body usage
BODY_COUNT=$(grep -rn "req\.body" src/{module}/ --include="*.ts" | wc -l)

# Đếm số validation calls
VALIDATE_COUNT=$(grep -rn "\.parse(\|\.safeParse(\|validate(" src/{module}/ --include="*.ts" | wc -l)

# Kỳ vọng: VALIDATE_COUNT >= BODY_COUNT
```

**Tiêu chí PASS:** Mỗi `req.body` có validation call trước đó trong cùng handler.

**Fix nếu fail:**
```typescript
// Thêm validation trước khi dùng req.body
const dto = CreateOrderSchema.parse(req.body);
// Thay vì dùng req.body trực tiếp
```

---

### 1.2 Path params được validate

```bash
grep -rn "req\.params\." src/{module}/ --include="*.ts"
# Kiểm tra mỗi params có được validate không (UUID format, positive int, etc.)
```

**Tiêu chí PASS:** UUID params được validate bằng `z.string().uuid()`, integer params bằng `z.coerce.number().positive()`.

**Fix nếu fail:**
```typescript
// Thêm param validation
const { id } = ParamIdSchema.parse(req.params);
// Trong validator:
const ParamIdSchema = z.object({ id: z.string().uuid() });
```

---

### 1.3 File uploads có MIME whitelist + size limit

```bash
grep -rn "multer\|upload\|formidable\|busboy" src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** Nếu có file upload, phải có:
- `fileFilter` với MIME type whitelist
- `limits.fileSize` ≤ phù hợp với use case (mặc định 10MB)

**Fix nếu fail:**
```typescript
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (_req, file, cb) => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, ALLOWED.includes(file.mimetype));
  }
});
```

---

### 1.4 Search/filter params được sanitize

```bash
grep -rn "req\.query\." src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** Query params được validate/sanitize trước khi đưa vào query builder.

---

## Section 2: Authentication & Authorization (CRITICAL)

### 2.1 Non-public routes có authenticate middleware

```bash
# Tìm routes không có authenticate
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" src/{module}/ --include="*.ts" | \
  grep -v "authenticate\|public\|health\|/login\|/register\|/forgot"
```

**Tiêu chí PASS:** Mỗi protected route có `authenticate` middleware.

**Fix nếu fail:**
```typescript
router.get('/orders', authenticate, async (req, res) => { ... })
//                    ^^^^^^^^^^^^ thêm middleware
```

---

### 2.2 Role-based routes có authorize middleware

```bash
grep -rn "admin\|manager\|supervisor" src/{module}/ --include="*.ts" | \
  grep -v "authorize\|ROLES\|comment\|//\|doc"
```

**Tiêu chí PASS:** Route chỉ dành cho role cụ thể phải có `authorize(['role'])` middleware.

**Fix nếu fail:**
```typescript
router.delete('/orders/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => { ... })
```

---

### 2.3 Password stored hashed (không plain text)

```bash
grep -rn "password" src/{module}/ --include="*.ts" | \
  grep -v "bcrypt\|argon2\|hash\|compare\|//"
```

**Tiêu chí PASS:** Không có code lưu password dạng plain text vào database.

**Fix nếu fail:**
```typescript
// Phải hash trước khi lưu
const hashedPassword = await bcrypt.hash(password, 12);
await userRepository.create({ ...dto, password: hashedPassword });
```

---

### 2.4 Token validation không bỏ qua

```bash
grep -rn "jwt\.verify\|verifyToken" src/{module}/ --include="*.ts"
grep -rn "\.skip\|bypass\|ignoreAuth" src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** Không có code bypass JWT verification trong production paths.

---

## Section 3: Data Protection (HIGH)

### 3.1 Sensitive data không xuất hiện trong API response

```bash
# Tìm password trong response
grep -rn "password\|secret\|token\|private_key" src/{module}/ --include="*.ts" | \
  grep "res\.json\|return\|response\."
```

**Tiêu chí PASS:** Response DTO không bao gồm password, secret token, private key.

**Fix nếu fail:**
```typescript
// Loại bỏ sensitive fields khỏi response
const { password, refreshToken, ...safeUser } = user;
return res.json({ data: safeUser });
```

---

### 3.2 Sensitive data không được log

```bash
grep -rn "console\.log\|logger\." src/{module}/ --include="*.ts" | \
  grep -i "password\|token\|secret\|credit.card\|card.number"
```

**Tiêu chí PASS:** 0 kết quả log chứa sensitive data.

**Fix nếu fail:**
```typescript
// SAI: log chứa sensitive data
logger.info('User login', { email, password });

// ĐÚNG: chỉ log non-sensitive data
logger.info('User login attempt', { email, ip: req.ip });
```

---

### 3.3 Database queries qua ORM (không raw SQL với user input)

```bash
# Tìm raw SQL
grep -rn "query\s*(\s*['\`]" src/{module}/ --include="*.ts"
grep -rn "\$queryRaw\|\$executeRaw" src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** Raw SQL chỉ dùng cho administrative queries không có user input, hoặc dùng parameterized placeholders.

---

### 3.4 CORS không dùng wildcard * trong production

```bash
grep -rn "cors\|CORS" src/ --include="*.ts" | grep "\*"
```

**Tiêu chí PASS:** CORS config không có `origin: '*'` ngoài development environment.

**Fix nếu fail:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
```

---

## Section 4: Injection Prevention (HIGH)

### 4.1 Không có string concatenation trong SQL

```bash
grep -rn "SELECT\|INSERT\|UPDATE\|DELETE" src/{module}/ --include="*.ts" | \
  grep "\${\|+\s*[a-zA-Z]"
```

**Tiêu chí PASS:** Tất cả SQL queries dùng parameterized placeholders hoặc ORM.

---

### 4.2 Không có eval() với user input

```bash
grep -rn "eval(\|new Function(\|exec(" src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** 0 kết quả, hoặc nếu có thì input không đến từ user request.

---

### 4.3 JSON.parse có try-catch

```bash
grep -rn "JSON\.parse(" src/{module}/ --include="*.ts"
```

**Tiêu chí PASS:** Mỗi `JSON.parse()` trong request handling path được wrap trong try-catch.

**Fix nếu fail:**
```typescript
// SAI
const data = JSON.parse(req.body.payload);

// ĐÚNG
try {
  const data = JSON.parse(req.body.payload);
  // ...
} catch {
  return res.status(400).json({ error: 'Invalid JSON payload' });
}
```

---

## Section 5: Headers & Transport (MEDIUM)

### 5.1 Security headers (Helmet.js hoặc tương đương)

```bash
grep -rn "helmet\|X-Frame-Options\|X-Content-Type\|Content-Security-Policy" src/ --include="*.ts"
```

**Tiêu chí PASS:** Có `helmet()` hoặc manual security headers tại app entry point.

---

### 5.2 Rate limiting trên auth endpoints

```bash
grep -rn "rateLimit\|rate-limit\|express-rate-limit\|throttle" src/ --include="*.ts"
```

**Tiêu chí PASS:** Login, register, forgot-password endpoints có rate limiting.

---

### 5.3 Request size limit

```bash
grep -rn "json(\|urlencoded(" src/ --include="*.ts" | grep "limit"
```

**Tiêu chí PASS:** `express.json({ limit: '...' })` có giới hạn size hợp lý (≤ 10mb).

---

## Section 6: Secrets Management (CRITICAL)

### 6.1 Không có hardcoded credentials

```bash
# Tìm hardcoded secrets phổ biến
grep -rn -E "(password|api_key|apiKey|secret|token|AUTH)\s*[=:]\s*['\"][^'\"]{8,}" \
  src/{module}/ --include="*.ts" --include="*.env"
```

**Tiêu chí PASS:** Không có string literal nào trông như password/token trong code.

---

### 6.2 .env.example tồn tại

```bash
test -f .env.example && echo "EXISTS" || echo "MISSING"
```

**Tiêu chí PASS:** `.env.example` có và chứa tất cả env vars cần thiết (với placeholder values).

---

### 6.3 .gitignore có .env

```bash
grep -n "\.env" .gitignore
```

**Tiêu chí PASS:** `.gitignore` có entry cho `.env`, `.env.local`, `.env.production`.

**Fix nếu fail:**
```bash
echo "\n# Environment files\n.env\n.env.local\n.env.*.local\n*.pem\n*.key" >> .gitignore
```

---

## Scoring & Decision Matrix

### Cách tính điểm

| Severity | Số lượng fail | Quyết định |
|---|---|---|
| CRITICAL | ≥ 1 | ❌ BLOCK — phải fix trước khi tiếp tục |
| HIGH | ≥ 3 | ⚠️ WARN — cần fix, có thể tiếp tục với documentation |
| HIGH | 1-2 | ⚠️ WARN — document và tiếp tục |
| MEDIUM | bất kỳ | ℹ️ INFO — ghi vào report |
| LOW/N/A | bất kỳ | ✅ Không ảnh hưởng |

### Template kết quả

```
SECURITY CHECKLIST RESULT — {Module} — {Date}

CRITICAL (2/6 sections):
  ❌ 1.1 Input validation: 2 endpoints thiếu validation
     → Tự fix: thêm Schema.parse(req.body) vào handler tại:
       - POST /orders → thêm CreateOrderSchema.parse
       - PUT /orders/:id → thêm UpdateOrderSchema.parse
  ✅ 2.1 Authentication: tất cả protected routes có middleware
  ✅ 2.2 Authorization: role-based access đúng
  ✅ 6.1 No hardcoded secrets
  ✅ 6.2 .env.example tồn tại
  ✅ 6.3 .gitignore có .env

HIGH:
  ⚠️ 3.1 Sensitive data in response: password field lộ tại GET /users
     // SECURITY-WARNING: Loại bỏ password khỏi UserResponseDto
     → Đã tự fix: loại password khỏi response DTO

MEDIUM:
  ℹ️ 5.1 Helmet: chưa có security headers — cần thêm tại app.ts

OVERALL: ⚠️ 1 CRITICAL đã fix tự động | 1 WARNING documented | 1 INFO
```

---

## Checklist Nhanh (bản in)

```
Input Validation:
□ [CRITICAL] Tất cả req.body có Zod/Joi validation
□ [CRITICAL] Path params được validate (UUID, số nguyên)
□ [CRITICAL] File uploads có MIME whitelist + size limit
□ [HIGH]     Query params được sanitize

Auth & Authz:
□ [CRITICAL] Non-public routes có authenticate middleware
□ [CRITICAL] Role-restricted routes có authorize middleware
□ [CRITICAL] Password stored hashed (bcrypt/argon2)
□ [HIGH]     JWT verification không bị bypass

Data Protection:
□ [HIGH] Password/token không trong API response
□ [HIGH] Sensitive data không được log
□ [HIGH] Queries qua ORM (không raw SQL với user input)
□ [MEDIUM] CORS không wildcard * trong production

Injection:
□ [HIGH] Không có string concat trong SQL
□ [HIGH] Không có eval() với user input
□ [HIGH] JSON.parse có try-catch

Headers:
□ [MEDIUM] Helmet.js hoặc security headers
□ [MEDIUM] Rate limiting trên auth endpoints
□ [MEDIUM] Request size limit

Secrets:
□ [CRITICAL] Không hardcode credentials
□ [CRITICAL] .env.example tồn tại
□ [CRITICAL] .gitignore có .env
```
