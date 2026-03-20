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
Updates: (qua mc_traceability — không tạo file mới)
  - Traceability links: AC → TC, FT → TC (file matrix tạo bởi /mcv3:verify)
Enables: /mcv3:code-gen (Phase 7), /mcv3:verify (Phase 8)
Agents: doc-writer
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_checkpoint, mc_traceability
References:
  - skills/qa-docs/references/test-strategy-patterns.md
  - skills/qa-docs/references/test-case-writing-guide.md
  - skills/qa-docs/references/quality-metrics.md
  - skills/qa-docs/references/mobile-test-guide.md (Mobile App — React Native / Flutter)
  - skills/qa-docs/references/embedded-test-guide.md (Embedded/Firmware)
  - templates/p6-qa-docs/TEST-TEMPLATE.md
  - templates/p6-qa-docs/USER-GUIDE-TEMPLATE.md
  - templates/p6-qa-docs/ADMIN-GUIDE-TEMPLATE.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự chọn module theo MODSPEC files, tự tạo test cases + guides
2. **Tự giải quyết vấn đề** — tự xác định test strategy từ project type, tự cover tất cả ACs
3. **Báo cáo sau khi xong** — test coverage metrics, IDs tạo ra, docs updated
4. **User review** — cập nhật test cases nếu user muốn thêm edge cases
5. **Gợi ý bước tiếp** — `/mcv3:code-gen`

---

## Khi nào dùng skill này

- Sau khi `/mcv3:tech-design` hoàn thành (có ít nhất 1 MODSPEC)
- Cần tạo test cases chính thức cho QA team
- Cần tài liệu hướng dẫn cho end users và admins
- **Mobile App project** (React Native / Flutter): Load `mobile-test-guide.md`, điều chỉnh test strategy:
  - Tier 1 (Unit): Jest (RN) hoặc flutter_test — store/state logic, API client, validators
  - Tier 2 (Component/Widget): React Native Testing Library (RNTL) hoặc Widget Test — screens, forms
  - Tier 3 (E2E): Detox (RN) hoặc integration_test (Flutter) — full user flows trên simulator/emulator
  - Platform-specific: test permissions, offline behavior, push notification handling
  - Tự xác định: include cả iOS + Android (mặc định) + E2E Detox (mặc định cho RN) — ghi DECISION nếu PROJECT-OVERVIEW không chỉ định target platform
- **Embedded/Firmware project**: Load `embedded-test-guide.md`, điều chỉnh test strategy:
  - Tier 1 (Host): Unity tests với mock HAL (PlatformIO native)
  - Tier 2 (On-target): Hardware integration tests trên device thật
  - Protocol tests: Serial/MQTT message validation scripts
  - UAT: Hardware-in-the-loop acceptance testing

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**Documents từ phases trước thiếu (RISK-008 — BLOCKING vs WARNING):**

| Loại file thiếu | Phân loại | Hành động bắt buộc |
|-----------------|-----------|---------------------|
| MODSPEC-{MOD}.md | ❌ BLOCKING | DỪNG — không thể tạo test cases. Chạy `/mcv3:tech-design` |
| URS-{MOD}.md | ⚠️ WARNING | Tiếp tục nhưng tạo TC từ FT specs — ghi rõ "Thiếu AC, TC tạo từ FT" |
| DATA-DICTIONARY.md | ⚠️ WARNING | Bỏ qua entity cross-check — ghi chú vào coverage report |

**Nguyên tắc phân loại:**
- **BLOCKING** = file core design specs → DỪNG ngay, báo user file nào thiếu + skill nào để tạo
- **WARNING** = file supplementary → tiếp tục nhưng ghi rõ limitation vào coverage report

**MODSPEC chưa có:**
- Báo user: "Chưa tìm thấy MODSPEC trong {SYSTEM}/P2-DESIGN/. Chạy /mcv3:tech-design trước."

**URS có nhưng không có AC:**
- Tạo TC từ FT specs trực tiếp (không qua AC)
- Note rõ trong coverage matrix: "AC thiếu — TC tạo từ FT specs"
- Nhắc user bổ sung AC trong URS sau để có traceability đầy đủ

## Coverage Tracking Guidelines

Sau khi tạo Test Cases, tính và báo cáo coverage:

```
Coverage Targets:
  AC Coverage:   Tất cả AC-IDs phải có ≥ 1 TC  (target: 100%)
  FT Coverage:   Tất cả FT-IDs phải có ≥ 1 TC  (target: 100%)
  TC/AC Ratio:   Khuyến nghị ≥ 1.5 TC per AC
  P0 Tests:      Tất cả Must-priority FT → TC Priority P0
```

Báo cáo sau khi tạo xong:
```
"📊 Test Coverage Report — {MOD}:
  AC Coverage: {X}/{Y} ACs có TC ({Z}%)
  FT Coverage: {A}/{B} FTs có TC ({C}%)
  Breakdown:
    - Happy Path:  {N} TCs
    - Error Cases: {M} TCs
    - Edge Cases:  {K} TCs
    - UAT:         {J} scenarios
  ⚠️ Thiếu coverage: [list AC/FT IDs chưa có TC]"
```

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project, phase hiện tại
2. mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → liệt kê MODSPEC files có sẵn
3. mc_list({ subPath: "{SYSTEM}/P3-QA-DOCS" }) → kiểm tra files đã có
4. Tự xác định module order từ MODSPEC files:
   - Ưu tiên modules chưa có TEST file
   - Dependency order: Core → Business → Integration
   - Xử lý tất cả modules, không hỏi user chọn

5. [MANDATORY] Scale Detection — Đếm tổng số MODSPEC files:
   - Nếu ≥ 5 modules → CHẾ ĐỘ LARGE PROJECT (xem Batch Mode ở Phase 0 Safety Checkpoint)
     → Ghi log: "Large project: {N} modules detected — kích hoạt Batch Mode"
   - Nếu < 5 modules → Chế độ Standard, tiếp tục bình thường
```

**Nếu không có MODSPEC:**
```
⛔ BLOCKING — Chưa tìm thấy MODSPEC trong {SYSTEM}/P2-DESIGN/.
   Hãy chạy /mcv3:tech-design trước.
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-qa-docs-{MOD}",
  sessionSummary: "Chuẩn bị chạy /mcv3:qa-docs cho module {MOD}",
  nextActions: ["Tiếp tục /mcv3:qa-docs cho module {MOD} — Phase 1: Context Loading"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu tạo QA docs..."

**Large project batch processing (RISK-006) — áp dụng khi ≥5 modules:**
```
// Phát hiện large project: mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → đếm MODSPEC files
// Nếu ≥5 MODSPEC files → kích hoạt Batch Mode:

1. Lưu BATCH CHECKPOINT trước Phase 1:
   mc_checkpoint({
     label: "pre-qa-docs-batch",
     sessionSummary: "Large project: {N} modules cần QA docs. Batch mode ON.",
     nextActions: ["Batch 1: {MOD1}, {MOD2}, {MOD3}"]
   })

2. Chia modules thành batches (tối đa 3 modules / batch):
   Batch 1: Core modules (Auth, Master data)
   Batch 2: Business logic modules
   Batch 3+: Integration, Reporting modules

3. Per-module checkpoint sau mỗi module (BẮT BUỘC):
   mc_checkpoint({ label: "qa-docs-{MOD}-complete", ... })

4. Batch checkpoint sau mỗi batch (ngoài per-module):
   mc_checkpoint({ label: "qa-docs-batch-{N}-complete", ... })

5. KHÔNG load toàn bộ MODSPEC cùng lúc — chỉ load MODSPEC của module đang làm (layer: 3)
```

---

## Phase 1 — Context Loading

### 1a. Load MODSPEC đầy đủ

```
// BLOCKING — nếu MODSPEC load fail: ❌ DỪNG ngay, báo user chạy /mcv3:tech-design trước
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 3 })
→ Nếu NOT FOUND / ERROR → ❌ DỪNG: "Chưa tìm thấy MODSPEC-{MOD}.md. Chạy /mcv3:tech-design trước."

mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 2 })
→ Nếu NOT FOUND → ⚠️ WARNING (không dừng): "Thiếu URS-{MOD}.md, TC sẽ tạo từ FT specs — không có AC traceability đầy đủ"

mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 1 })
→ Nếu NOT FOUND → ⚠️ WARNING (không dừng): "Thiếu DATA-DICTIONARY.md, bỏ qua entity cross-check"
```

### 1b. Extract traceability links

Từ MODSPEC, lập danh sách:
- Tất cả `FT-{MOD}-NNN` (Features)
- Tất cả `AC-{MOD}-NNN-XX` (Acceptance Criteria)
- Tất cả `API-{SYS}-NNN` (Endpoints cần test)
- Tất cả `BR-{DOM}-NNN` (Business Rules cần validate)

### 1c. Auto-detect Test Strategy

Tự xác định test strategy từ project type — không hỏi user:

```
[Web/Backend project — detect từ MODSPEC/PROJECT-OVERVIEW:]
→ Strategy: Unit Tests + Integration Tests + UAT Scenarios
→ Tools: Jest + Supertest (default cho Node.js) / pytest (Python)

[Mobile project — detect MOBILE-MODSPEC hoặc React Native/Flutter keywords:]
→ Strategy: 3-tier (Unit: Jest/flutter_test, Component: RNTL/Widget, E2E: Detox/integration_test)
→ Ghi DECISION: test strategy cho mobile — include iOS + Android coverage theo mặc định

[Embedded project — detect FIRMWARE-MODSPEC:]
→ Strategy: Host-tests (Unity mock HAL) + On-target + Protocol tests

Tự load guide tương ứng (mobile-test-guide.md / embedded-test-guide.md) theo project type
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

### 3e. Auto-Coverage Report

Sau khi tạo test cases, chạy coverage check tự động và tiếp tục mà không chờ user:

```
Tự tính coverage:
  AC Coverage: {X}/{Y} ACs → nếu <100% → tự tạo thêm TCs cho ACs còn thiếu
  TC/AC ratio: nếu <1.5 → tự thêm edge case TCs quan trọng
  Missing cases: tự detect và tự tạo (không hỏi "Bạn có muốn thêm không?")
Kết quả được ghi vào Completion Report cuối
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

4. [BẮT BUỘC — BLOCKING GATE] mc_validate({ filePath: "{SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md" })
   // RISK-001: BLOCKING GATE — phân loại kết quả (RISK-007):
   → ERROR   → ❌ DỪNG ngay. Fix lỗi → mc_save lại → mc_validate lại (tối đa 3 lần retry)
              Nếu vẫn ERROR sau 3 lần → báo user, không tiếp tục module này
   → WARNING → Phân loại:
       - Format warning (TC ID format sai, thiếu required section) → FIX trước khi tiếp tục
       - Content warning (thiếu pass criteria, AC coverage chưa đủ) → Ghi DECISION + tiếp tục
   → PASS    → ✅ Tiếp tục bước 5

5. [BẮT BUỘC] mc_traceability({
     action: "link",
     items: [
       { from: "AC-{MOD}-001-01", to: "TC-{MOD}-001" },
       { from: "FT-{MOD}-001", to: "TC-{MOD}-001" },
       { from: "US-{MOD}-001", to: "UAT-{MOD}-001" },
       // RISK-005: đăng ký TẤT CẢ TC, UAT IDs — không bỏ sót
       ...
     ]
   })

6. mc_dependency({
     action: "register",
     source: "TEST-{MOD}.md",
     dependsOn: ["MODSPEC-{MOD}.md", "URS-{MOD}.md"]
   })

7. [BẮT BUỘC — per-module checkpoint] mc_checkpoint({
     // RISK-003: checkpoint riêng cho mỗi module — BẮT BUỘC
     label: "sau-qa-docs-{mod}",
     sessionSummary: "QA Docs {MOD}: {N} TCs, {M} UAT, user/admin guide updated",
     nextActions: ["Tiếp tục module khác hoặc /mcv3:code-gen"]
   })
```

---

## Pre-Completion Verification (BẮT BUỘC — RISK-004)

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5).
Lưu ý: Phase 3e "Auto-Coverage Report" đã cover phần coverage. Section này bổ sung cross-document và format checks.

### Tầng 1 — Self-Verification

```
Format & IDs:
  ✓ TC IDs: TC-{MOD}-NNN format, sequential
  ✓ UAT IDs: UAT-{MOD}-NNN format
  ✓ Mỗi TC có: Preconditions + Steps (Action/Input/Expected) + Pass criteria
  ✓ [VERIFIED-BY: AC-{MOD}-NNN-XX] tag có trong mỗi TC
  ✓ Không có TC nào thiếu Priority (P0/P1/P2)

Content Quality:
  ✓ Pass criteria cụ thể và đo lường được (không "hoạt động đúng")
  ✓ Error TCs có expected HTTP status code cụ thể (400/401/403/404/409)
  ✓ UAT scenarios viết bằng ngôn ngữ business (không technical jargon)
  ✓ Không có TC chỉ test 1 điều nhưng có 10+ steps (cần split)
```

### Tầng 2 — Cross-Document

```
  ✓ AC-IDs trong [VERIFIED-BY] tag có trong URS-{MOD}.md (không orphan refs)
  ✓ API-IDs trong API test cases có trong MODSPEC-{MOD}.md
  ✓ Tất cả AC-IDs từ URS đã có ≥ 1 TC (coverage 100%)
  ✓ Tất cả User Stories có ≥ 1 UAT scenario
  ✓ BR-IDs được test trong TC có trong BIZ-POLICY (không phantom BRs)
```

### Tầng 3 — Quality Gate

```
✅ AC Coverage 100% (xem Auto-Coverage Report từ Phase 3e)
✅ FT Coverage 100%
✅ ≥ 1 UAT scenario per User Story
✅ P0 TCs cover tất cả Must-priority FTs
✅ mc_validate PASS
✅ mc_traceability AC → TC đã link
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển sang phase tiếp theo:

### Sau Phase 0 → trước Phase 1:
- ✓ Ít nhất 1 MODSPEC tìm thấy trong {SYSTEM}/P2-DESIGN/
- ✓ Module order xác định rõ ràng (dependency: Core → Business → Integration)
- ✓ Safety checkpoint đã lưu trước khi bắt đầu

### Sau Phase 1 → trước Phase 2:
- ✓ Danh sách đầy đủ: FT-IDs, AC-IDs, API-IDs, BR-IDs đã extract từ MODSPEC + URS
- ✓ Test strategy đã chọn tự động theo project type — ghi DECISION nếu cần
- ✓ Nếu dự án lớn (5+ modules): checkpoint trước khi bắt đầu Phase 2

### Sau Phase 2 → trước Phase 3:
- ✓ Coverage Matrix đã liệt kê TẤT CẢ FT-IDs và AC-IDs (không bỏ sót)
- ✓ Mỗi row trong Coverage Matrix có Priority và Test type placeholder

### Sau Phase 3 → trước Phase 4:
- ✓ **API Coverage**: tất cả API-IDs từ MODSPEC có ≥ 1 API test case (happy path + error)
- ✓ **AC Coverage**: tất cả AC-IDs có ≥ 1 TC — không có orphan AC (xem Auto-Coverage Report Phase 3e)
- ✓ **TC IDs unique**: không có 2 TCs trùng ID trong cùng module
- ✓ **Edge cases**: mỗi FT-ID có ≥ 1 happy path TC + ≥ 1 error/edge case TC
- ✓ [VERIFIED-BY: AC-{MOD}-NNN-XX] tag có đầy đủ trong mỗi TC
- ✓ Nếu dự án lớn: checkpoint sau mỗi module — coverage matrix riêng per module trước khi chuyển module tiếp

### Sau Phase 4 → trước Phase 5:
- ✓ Mỗi US-ID có ≥ 1 UAT scenario (không orphan User Stories)
- ✓ UAT scenarios viết bằng ngôn ngữ business (không technical API details)

### Sau Phase 5 → trước Phase 6:
- ✓ USER-GUIDE có chapter cho module vừa xử lý
- ✓ Không có placeholder text chưa điền trong User Guide chapter

### Sau Phase 6 → trước Phase 7 (Save):
- ✓ ADMIN-GUIDE có section cho module vừa xử lý
- ✓ Coverage matrix tổng hợp đầy đủ tất cả modules đã xử lý
- ✓ Nếu dự án lớn: mọi modules có TEST file — không bỏ sót module nào trong coverage matrix

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

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:qa-docs
═══════════════════════════════════════════════

✅ Đã tạo/cập nhật {N+2} files:
   TEST-{MOD1}.md — {X} TCs, {M} UAT scenarios
   TEST-{MOD2}.md — ...
   USER-GUIDE.md  — cập nhật {N} chapters
   ADMIN-GUIDE.md — cập nhật {N} sections

📊 Test Coverage:
   AC Coverage: {X}% ({A}/{B} ACs có TC)
   FT Coverage: {Y}% ({C}/{D} FTs có TC)

⚠️ {D} quyết định đã tự xử lý (xem DECISION-LOG)

🔜 Bước tiếp theo: /mcv3:code-gen — Generate source code

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:code-gen
═══════════════════════════════════════════════
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
