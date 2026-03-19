# Assessment Checklist — Đánh giá từng Phase

## Cách dùng

Dùng checklist này tại Phase 2 của `/mcv3:assess` để đánh giá mỗi system.
Với mỗi item: ✅ done | ⚠️ partial | ❌ missing

---

## Phase 1 — Discovery

**Tài liệu cần có:**
- [ ] PROJECT-OVERVIEW.md hoặc tương đương (BRD intro, project charter)
  - Mô tả vấn đề cần giải quyết (PROB-xxx)
  - Scope in/out (SC-IN-xxx, SC-OUT-xxx)
  - Goals (GL-xxx)
  - Stakeholders (ST-xxx)

**Dấu hiệu đã xong Phase 1 (không cần formal format):**
- Có mô tả rõ "vấn đề là gì"
- Biết ai là stakeholders chính
- Có scope định nghĩa (cái gì trong, cái gì ngoài)

**Dấu hiệu partial:**
- Có pitch deck hoặc email thread với context
- Có README.md mô tả chức năng nhưng không có PROB/GL structure

**Dấu hiệu missing:**
- Chỉ có code, không có bất kỳ mô tả nào về "tại sao"

---

## Phase 2 — Expert Analysis

**Tài liệu cần có:**
- [ ] EXPERT-LOG.md hoặc tương đương (architecture decision records, tech review notes)
  - Domain expert analysis
  - Risk assessment
  - Architecture decisions (ADRs)

**Dấu hiệu đã xong Phase 2:**
- Có lý do chọn tech stack được document
- Có risk list đã được review
- Có người chuyên môn (domain expert) đã review requirements

**Dấu hiệu partial:**
- Có ADR files nhưng không có domain analysis
- Có tech decisions nhưng không có business expert input

**Dấu hiệu missing:**
- Không có bất kỳ architecture/expert decision nào được document

---

## Phase 3 — Business Docs

**Tài liệu cần có:**
- [ ] BIZ-POLICY hoặc tương đương (business rules document)
  - Có ít nhất 5 explicit business rules
  - Rules có source/rationale rõ ràng
- [ ] PROCESS hoặc tương đương (process flows)
  - Happy path defined
  - Exception flows defined
- [ ] DATA-DICTIONARY hoặc tương đương
  - Domain terms và definitions
  - Entity list

**Dấu hiệu đã xong Phase 3:**
- Biết tất cả business rules quan trọng (không chỉ từ code)
- Có process flows cho use cases chính
- Terms đã được define, không còn ambiguity

**Dấu hiệu partial:**
- Business rules implicit trong code nhưng chưa document
- Có Excel với một số rules nhưng incomplete
- Process flows chỉ có happy path

**Dấu hiệu missing:**
- Không có gì về business rules, chỉ có code

---

## Phase 4 — Requirements

**Tài liệu cần có:**
- [ ] URS-{MOD}.md hoặc tương đương per module
  - User Stories với As/Want/So-that format (US-xxx)
  - Acceptance Criteria có Given/When/Then (AC-xxx)
  - Features (FT-xxx)
  - NFRs (NFR-xxx)

**Dấu hiệu đã xong Phase 4:**
- Mỗi user-facing feature có ít nhất 1 US
- Mỗi US có ít nhất 2 ACs (happy + error)
- NFRs defined (performance, security targets)

**Dấu hiệu partial:**
- Có user stories nhưng không có ACs
- Có requirements doc nhưng không có formal IDs
- Có Jira tickets nhưng không structured

**Dấu hiệu missing:**
- Code có features nhưng không có user story nào

**Kiểm tra nhanh (từ code):**
```bash
# Tìm TODO comments có thể là implicit requirements
grep -r "TODO\|FIXME\|business rule\|requirement" src/ --include="*.ts"
grep -r "TODO\|FIXME\|business rule\|requirement" src/ --include="*.py"
```

---

## Phase 5 — Technical Design

**Tài liệu cần có:**
- [ ] MODSPEC-{MOD}.md hoặc tương đương per module
  - API endpoints (API-{SYS}-xxx)
  - DB schema (TBL-{SYS}-xxx)
  - Component design (COMP-{SYS}-xxx)
  - Architecture Decision Records

**Dấu hiệu đã xong Phase 5:**
- Tất cả APIs có spec (method, path, input, output, errors)
- DB tables có column definitions và constraints
- Có ERD hoặc data model diagram

**Dấu hiệu partial:**
- Có Swagger/OpenAPI nhưng chưa sync với code
- Có DB schema nhưng không có business context
- Có diagrams nhưng outdated

**Dấu hiệu missing:**
- APIs chỉ có code, không có spec
- DB schema chỉ suy ra từ migrations

---

## Phase 6 — QA & Docs

**Tài liệu cần có:**
- [ ] TEST-{MOD}.md per module
  - Test cases (TC-xxx) cho mỗi AC
  - UAT scenarios (UAT-xxx)
  - API test cases
- [ ] USER-GUIDE.md
- [ ] ADMIN-GUIDE.md

**Dấu hiệu đã xong Phase 6:**
- Mỗi AC có ít nhất 1 TC
- Có UAT scenarios cho user-facing flows
- User guide cover tất cả main features

**Dấu hiệu partial:**
- Có test files nhưng không có test spec/plan
- Có some test coverage nhưng not documented
- User guide outdated hoặc incomplete

**Dấu hiệu missing:**
- Không có test plan, chỉ có ad-hoc testing

---

## Phase 7 — Code Generation

**Tài liệu cần có (thực ra là code có):**
- [ ] src/ có structure đúng (controller/service/repository)
- [ ] REQ-ID comments trong code (`@req-ids US-xxx`)
- [ ] Test stubs hoặc test files

**Dấu hiệu đã xong Phase 7:**
- Code có REQ-ID comments tracing về requirements
- Test files exist (kể cả empty stubs)
- DB migrations có versioning rõ ràng

**Dấu hiệu partial:**
- Code tồn tại nhưng không có REQ-ID comments
- Test files exist nhưng không trace về ACs

**Dấu hiệu missing:**
- Không có code structure chuẩn
- Code spaghetti không có module separation

---

## Phase 8 — Verify & Deploy

**Tài liệu cần có:**
- [ ] _VERIFY-CROSS/traceability-matrix.md
- [ ] _VERIFY-CROSS/verification-report.md
- [ ] _PROJECT/DEPLOY-OPS.md (nếu đã deploy)

**Dấu hiệu đã xong Phase 8:**
- Có traceability matrix PROB→BR→US→FT→API→Code→TC
- Verification report với status READY
- Deploy plan documented

**Dấu hiệu partial:**
- Có một số traceability links nhưng không đầy đủ
- Deploy runbook exists nhưng không formal

**Dấu hiệu missing:**
- Không có verification, không có traceability

---

## Scoring Guide

Sau khi assess tất cả phases, tính điểm:

| Phase | Weight | done=2 | partial=1 | missing=0 |
|-------|--------|--------|-----------|-----------|
| Phase 1 | 1x | 2 | 1 | 0 |
| Phase 2 | 1x | 2 | 1 | 0 |
| Phase 3 | 2x | 4 | 2 | 0 |
| Phase 4 | 3x | 6 | 3 | 0 |
| Phase 5 | 3x | 6 | 3 | 0 |
| Phase 6 | 2x | 4 | 2 | 0 |
| Phase 7 | 2x | 4 | 2 | 0 |
| Phase 8 | 1x | 2 | 1 | 0 |

Tổng max = 28 điểm

| Điểm | Nhận xét |
|------|---------|
| 24-28 | Dự án documentation tốt — cần finalize format |
| 16-23 | Dự án có documentation nhưng nhiều gaps — cần remediation |
| 8-15 | Dự án thiếu documentation nghiêm trọng — cần migrate và bổ sung |
| < 8 | Dự án gần như không có documentation — bắt đầu từ đầu |
