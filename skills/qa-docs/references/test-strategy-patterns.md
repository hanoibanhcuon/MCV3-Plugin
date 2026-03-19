# Test Strategy Patterns — QA Reference

## Các loại kiểm thử trong MCV3

### Pyramid Test Strategy

```
         /‾‾‾‾‾‾‾‾‾‾‾‾\
        /   E2E (10%)   \
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
      /  Integration (30%) \
     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
    /     Unit Tests (60%)    \
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

**Nguyên tắc:**
- Unit tests: nhanh, nhiều, test logic nghiệp vụ
- Integration tests: test API endpoints và database
- E2E tests: test user flows quan trọng nhất

---

## Phân loại Test theo Priority

| Priority | Định nghĩa | Blocking? | Khi nào PASS |
|----------|-----------|-----------|-------------|
| P0 | Blocker — Core feature không hoạt động | ✅ PHẢI PASS | Trước mọi deployment |
| P1 | Major — Feature chính bị ảnh hưởng | ⚠️ Cần pass | Trước UAT |
| P2 | Minor — Nice-to-have, edge cases | ℹ️ Best-effort | Khi có thời gian |

**Mapping AC → Priority:**
- AC cho Must-have FT → P0
- AC cho Should-have FT → P1
- AC cho Nice-to-have FT → P2

---

## Test Types per Layer

### Unit Tests

**Khi nào dùng:**
- Test business logic trong service layer
- Test validation / calculation rules (BR-IDs)
- Test transformation functions

**Tools:** Jest, Vitest, pytest, JUnit

**Pattern:**
```typescript
// Arrange
const input = { field: "value" };
// Act
const result = service.calculate(input);
// Assert
expect(result).toEqual(expected);
```

**Coverage target:** 80%+ branch coverage cho business logic

---

### Integration Tests

**Khi nào dùng:**
- Test API endpoints (HTTP request → response)
- Test database operations (CRUD)
- Test 3rd party integrations

**Tools:** Supertest, Postman/Newman, pytest-httpx

**Pattern:**
```typescript
describe("POST /api/v1/resource", () => {
  it("should create resource successfully", async () => {
    const res = await request(app)
      .post("/api/v1/resource")
      .set("Authorization", `Bearer ${token}`)
      .send({ field: "value" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });
});
```

---

### UAT (User Acceptance Test)

**Khi nào dùng:**
- Verify business requirements từ góc nhìn user
- Sign-off trước go-live
- Viết bằng ngôn ngữ business

**Format:** Gherkin-inspired (Given / When / Then):
```
Given: {Điều kiện ban đầu}
When: {User thực hiện action}
Then: {Kết quả mong đợi}
And: {Điều kiện phụ thêm}
```

---

### Performance Tests

**Khi nào cần:**
- NFR-PERF-NNN có trong URS
- API endpoint có thể bị heavy load
- Database query có thể chậm

**Tools:** k6, JMeter, Artillery

**SLA thường dùng:**
- p95 response time < 200ms
- Throughput: 100 req/s sustained
- Error rate < 1% dưới load

---

## Test Data Management

### Chiến lược seed data

```
Option 1 — Factory functions (khuyến nghị):
  createTestUser({ role: "admin" })
  createTestProduct({ status: "active", price: 100 })

Option 2 — Fixtures (JSON files):
  fixtures/users.json, fixtures/products.json

Option 3 — Database seeds:
  npm run seed:test (reset + seed trước mỗi test run)
```

### Isolation

```
RULE: Mỗi test case TỰ TẠO dữ liệu cần thiết
RULE: Mỗi test case TỰ XÓA sau khi xong (teardown)
RULE: KHÔNG dùng chung dữ liệu giữa test cases
```

---

## Regression Testing Strategy

```
Khi nào chạy regression:
- Trước mỗi release
- Sau khi fix bug P0/P1
- Khi refactor module quan trọng

Scope:
- P0 tests: LUÔN chạy
- P1 tests: Chạy khi liên quan đến module thay đổi
- P2 tests: Chạy khi có thời gian
```

---

## Test Report Format

```markdown
## Test Report — {MODULE} — {DATE}

**Tổng quan:**
| Metric | Giá trị |
|--------|--------|
| Tổng TC | {N} |
| PASS | {X} |
| FAIL | {Y} |
| Skip | {Z} |
| Coverage | {AC_covered}/{AC_total} ACs |

**Bugs tìm thấy:**
| Bug ID | TC | Severity | Mô tả ngắn | Status |
|--------|-----|---------|-----------|--------|
| BUG-001 | TC-INV-005 | P0 | {Mô tả} | Open |

**Sign-off:** {Name} — {Date}
```
