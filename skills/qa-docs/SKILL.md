# QA-Docs Skill — `/mcv3:qa-docs`

## Mục đích

Chuyển **MODSPEC (Phase 5)** thành **Tài liệu QA + User/Admin Docs** — Phase 6.

Với mỗi module, tạo:
- **TEST-{MOD}.md** — Test Cases, Test Plans, UAT Scenarios
- **USER-GUIDE.md** — Hướng dẫn sử dụng cho end users
- **ADMIN-GUIDE.md** — Hướng dẫn quản trị hệ thống

Sử dụng formal ID system: `TC-{MOD}-NNN`, `TP-{MOD}-NNN`, `UAT-{MOD}-NNN`.

---

## DEPENDENCY MAP

```
Requires:
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md (Phase 5 — bắt buộc)
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md (Phase 4 — AC traceability)
  - _PROJECT/DATA-DICTIONARY.md (Phase 3 — entities, terms)
Produces:
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (Test Cases + UAT)
  - _PROJECT/USER-GUIDE.md (cập nhật mỗi module)
  - _PROJECT/ADMIN-GUIDE.md (cập nhật mỗi module)
  - _VERIFY-CROSS/traceability-matrix.md (cập nhật TC coverage)
Enables: /mcv3:code-gen (Phase 7), /mcv3:verify (Phase 8)
Agents: doc-writer
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_checkpoint, mc_traceability
References:
  - skills/qa-docs/references/test-strategy-patterns.md
  - skills/qa-docs/references/test-case-writing-guide.md
  - skills/qa-docs/references/quality-metrics.md
  - templates/p6-qa-docs/TEST-TEMPLATE.md
  - templates/p6-qa-docs/USER-GUIDE-TEMPLATE.md
  - templates/p6-qa-docs/ADMIN-GUIDE-TEMPLATE.md
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:tech-design` hoàn thành (có ít nhất 1 MODSPEC)
- Cần tạo test cases chính thức cho QA team
- Cần tài liệu hướng dẫn cho end users và admins

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project, phase hiện tại
2. mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → liệt kê MODSPEC files có sẵn
3. mc_list({ subPath: "{SYSTEM}/P3-QA-DOCS" }) → kiểm tra files đã có
4. Hỏi user: "Bạn muốn tạo QA docs cho module nào?
   [Danh sách MODSPEC files]"
```

**Nếu không có MODSPEC:**
```
⚠️ Chưa tìm thấy MODSPEC trong {SYSTEM}/P2-DESIGN/.
   Hãy chạy /mcv3:tech-design trước.
```

---

## Phase 1 — Context Loading

### 1a. Load MODSPEC đầy đủ

```
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 3 })
mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 2 })
mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 1 })
```

### 1b. Extract traceability links

Từ MODSPEC, lập danh sách:
- Tất cả `FT-{MOD}-NNN` (Features)
- Tất cả `AC-{MOD}-NNN-XX` (Acceptance Criteria)
- Tất cả `API-{SYS}-NNN` (Endpoints cần test)
- Tất cả `BR-{DOM}-NNN` (Business Rules cần validate)

### 1c. Xác định Test Strategy

Hỏi user:
```
"Tôi sẽ tạo test cases theo strategy:
- Unit Tests: Test từng function/method riêng lẻ
- Integration Tests: Test API endpoints end-to-end
- UAT Scenarios: User acceptance test scenarios

Bạn muốn thêm loại test nào khác?
(E2E browser tests / Performance tests / Security tests)"
```

---

## Phase 2 — Test Plan

### 2a. Test Plan Summary

```markdown
## TEST PLAN — {MOD}

### Phạm vi kiểm thử
- In scope: {Danh sách FT-IDs và API-IDs}
- Out of scope: {Những gì không test trong sprint này}

### Môi trường test
- Dev: localhost:3000
- Staging: staging.{project}.com
- Tools: Jest, Supertest, Playwright

### Định nghĩa Done
- ✅ 100% Acceptance Criteria có Test Case
- ✅ Tất cả P0 test cases PASS
- ✅ Không có P0/P1 bugs open
- ✅ UAT sign-off từ Product Owner
```

### 2b. Test Coverage Matrix

Với mỗi AC trong URS, map → ít nhất 1 TC:

```markdown
## TEST COVERAGE MATRIX

| FT / AC | Test Case(s) | Loại | Priority | Status |
|---------|-------------|------|----------|--------|
| FT-{MOD}-001 — {Tên feature} | | | | |
| AC-{MOD}-001-01 | TC-{MOD}-001 | Unit | P0 | Pending |
| AC-{MOD}-001-02 | TC-{MOD}-002 | Integration | P0 | Pending |
| BR-{DOM}-001 | TC-{MOD}-003 | Unit | P1 | Pending |
```

---

## Phase 3 — Test Case Generation

### 3a. Format Test Case chuẩn

Với mỗi TC, tạo theo format sau:

```markdown
### TC-{MOD}-NNN: {Tên test case ngắn gọn}

| Mục | Nội dung |
|-----|---------|
| **Mã** | TC-{MOD}-NNN |
| **Loại** | Unit / Integration / UAT |
| **Implements** | [VERIFIED-BY: AC-{MOD}-NNN-XX] |
| **Priority** | P0 (blocker) / P1 (major) / P2 (minor) |
| **Thời gian** | ~{N} phút |

**Preconditions:**
- {Điều kiện cần thiết trước khi test}
- {Ví dụ: user đã đăng nhập với role Admin}

**Setup:**
```
// Dữ liệu mock/seed cần chuẩn bị
{SETUP_STEPS}
```

**Steps:**
| # | Action | Input | Expected Result |
|---|--------|-------|----------------|
| 1 | {Action} | `{input}` | `{expected}` |
| 2 | {Action} | `{input}` | `{expected}` |

**Pass criteria:**
- {Điều kiện để TC này PASS}

**Teardown:** {Cleanup sau test}

**Notes:** {Lưu ý đặc biệt}
```

### 3b. Happy Path Test Cases

Với mỗi FT-ID, tạo ít nhất 1 happy path TC:
- Đầu vào hợp lệ → Kết quả mong đợi đúng
- Tracing: TC → AC → FT → API

### 3c. Error Case Test Cases

Với mỗi BR và validation rule, tạo TC cho error cases:
- Đầu vào thiếu / sai format → HTTP 400 đúng
- Unauthorized → HTTP 401/403 đúng
- Not found → HTTP 404 đúng
- Business rule violation → Error message đúng

### 3d. API Test Cases

```markdown
### API Test: {ENDPOINT}

```bash
# Happy path
curl -X POST /api/v1/{resource} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "{field}": "{valid_value}" }'
# → Expected: 201 { "success": true, "data": {...} }

# Validation fail
curl -X POST /api/v1/{resource} \
  -d '{ "{field}": null }'
# → Expected: 400 { "error": "{BR-XXX}: {message}" }

# Unauthorized
curl -X POST /api/v1/{resource}
# → Expected: 401 { "error": "Unauthorized" }
```
```

### 3e. Guided Review

Sau khi draft test cases:

```
"📋 Tôi đã tạo {N} test cases cho module {MOD}:
- {X} Unit tests (Happy path + Error cases)
- {Y} Integration tests (API endpoints)
- {Z} UAT scenarios

Coverage: {AC_count} Acceptance Criteria → {TC_count} Test Cases
Tỷ lệ: {ratio} TC/AC (khuyến nghị: ≥ 1.5)

Bạn có muốn thêm test cases cho edge cases nào không?"
```

---

## Phase 4 — UAT Scenarios

### 4a. UAT Format

```markdown
### UAT-{MOD}-NNN: {Tên scenario người dùng cuối}

| Mục | Nội dung |
|-----|---------|
| **Actor** | {Role: Manager / Staff / Admin} |
| **Precondition** | {Điều kiện trước khi test} |
| **Scenario** | {Mô tả ngắn gọn scenario} |
| **Expected outcome** | {Kết quả mong muốn từ góc nhìn user} |
| **Sign-off by** | {Product Owner / Stakeholder tên} |
| **Status** | Pending / Pass / Fail |
```

### 4b. Business Scenario Coverage

Mỗi User Story phải có ít nhất 1 UAT scenario.
UAT viết theo ngôn ngữ business, không technical.

---

## Phase 5 — User Guide (Chapter per module)

### 5a. Chapter format

```markdown
## Chapter {N}: {Module Name}

### Dành cho ai?
{Mô tả role người dùng cho chapter này}

### Tổng quan
{2-3 câu giải thích module làm gì}

### Hướng dẫn từng bước

#### {N.1}. {Tên tác vụ chính}

**Bước 1:** {Mô tả + screenshot placeholder}

**Bước 2:** {Mô tả}

> 💡 **Lưu ý:** {Tips hữu ích}
> ⚠️ **Cảnh báo:** {Điều cần tránh}

### Câu hỏi thường gặp (FAQ)

**Q: {Câu hỏi phổ biến}**
A: {Câu trả lời ngắn gọn}

### Xử lý lỗi thường gặp

| Thông báo lỗi | Nguyên nhân | Cách xử lý |
|--------------|------------|-----------|
| {ERROR_MSG} | {Lý do} | {Steps xử lý} |
```

---

## Phase 6 — Admin Guide (Module section)

### 6a. Admin section format

```markdown
## Admin Section: {Module Name}

### Cấu hình module
{Các config parameter quan trọng}

### Quản lý dữ liệu
- Backup: {Tần suất, cách backup}
- Restore: {Quy trình restore}
- Purge: {Chính sách xóa dữ liệu cũ}

### Monitoring
- Metrics cần theo dõi: {Danh sách}
- Alert thresholds: {Ngưỡng cảnh báo}
- Log locations: {Đường dẫn log}

### Troubleshooting
| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|------------|----------------------|-----------|
| {Symptom} | {Root cause} | {Fix steps} |
```

---

## Phase 7 — Save & Traceability

```
1. mc_save({
     filePath: "{SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md",
     documentType: "test"
   })

2. mc_save({
     filePath: "_PROJECT/USER-GUIDE.md",
     documentType: "user-guide"
   })

3. mc_save({
     filePath: "_PROJECT/ADMIN-GUIDE.md",
     documentType: "admin-guide"
   })

4. mc_validate({ filePath: "{SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md" })
   → Xử lý issues nếu có

5. mc_traceability({
     action: "link",
     items: [
       { from: "AC-{MOD}-001-01", to: "TC-{MOD}-001" },
       { from: "FT-{MOD}-001", to: "TC-{MOD}-001" },
       ...
     ]
   })

6. mc_dependency({
     action: "register",
     source: "TEST-{MOD}.md",
     dependsOn: ["MODSPEC-{MOD}.md", "URS-{MOD}.md"]
   })

7. mc_checkpoint({
     label: "sau-qa-docs-{mod}",
     sessionSummary: "QA Docs {MOD}: {N} TCs, {M} UAT, user/admin guide updated",
     nextActions: ["Tiếp tục module khác hoặc /mcv3:code-gen"]
   })
```

---

## Post-Gate

```
✅ Ít nhất 1 TEST-{MOD}.md đã saved
✅ Tất cả AC có ít nhất 1 TC tương ứng (coverage 100%)
✅ Ít nhất 1 UAT scenario per User Story
✅ USER-GUIDE.md đã cập nhật
✅ ADMIN-GUIDE.md đã cập nhật
✅ Traceability: AC → TC đã link
✅ Không có TEST errors từ mc_validate

→ "✅ Phase 6 QA & Docs hoàn thành!
   {N} Test Cases, {M} UAT Scenarios.
   Test coverage: {X}% AC covered.
   Tiếp theo: /mcv3:code-gen"
```

---

## Quy tắc viết test

```
TRACEABLE: Mọi TC phải link về AC hoặc BR
COMPLETE: Happy path + Error cases + Edge cases
INDEPENDENT: Mỗi TC chạy được độc lập (không phụ thuộc TC khác)
REPEATABLE: Chạy nhiều lần cho cùng kết quả
ATOMIC: Mỗi TC test 1 điều duy nhất
CLEAR: Bước test rõ ràng, không mơ hồ
UAT-READABLE: UAT viết ngôn ngữ business, không technical
```
