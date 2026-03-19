# Migrate Skill — `/mcv3:migrate`

## Mục đích

Hỗ trợ **migrate dự án từ format cũ sang MCV3**. Khi có:
- Documents viết tự do (Word, Confluence, Notion, Google Docs)
- Dự án cũ không có formal ID system
- Muốn import existing codebase vào MCV3 structure
- Chuyển từ một document format khác sang MCV3 templates

---

## DEPENDENCY MAP

```
Requires:
  - Existing documents (Markdown, TXT, PDF content, hoặc paste trực tiếp)
  - mc_init_project (nếu chưa có project MCV3)
Produces:
  - .mc-data/projects/{slug}/ với structure MCV3
  - Documents đã convert theo MCV3 templates
  - _mcv3-work/migration/MIGRATION-REPORT.md
  - Formal IDs được assign cho tất cả requirements
Enables: /mcv3:requirements → /mcv3:tech-design (tiếp tục pipeline)
Agents: doc-writer, verifier
MCP Tools:
  - mc_init_project, mc_status, mc_save, mc_list
  - mc_validate, mc_traceability, mc_checkpoint
References:
  - skills/migrate/references/migration-checklist.md
  - skills/migrate/references/format-conversion-guide.md
```

---

## Khi nào dùng skill này

- Đang có docs Word/PDF/Confluence muốn chuyển sang MCV3
- Dự án cũ đã có requirements nhưng chưa dùng formal IDs
- Nhận project từ team khác, muốn onboard vào MCV3
- Có Excel specs hoặc email threads muốn formalize
- Codebase hiện tại muốn tạo reverse-engineered documentation

---

## Phase 0 — Migration Assessment

```
"🔄 Migration Mode

Bạn đang migrate từ đâu?

[1] Documents có sẵn (Word/PDF/Markdown)
    → Tôi đọc và convert sang MCV3 format

[2] Confluence/Notion/Google Docs
    → Paste nội dung vào đây, tôi convert

[3] Codebase hiện tại (không có docs)
    → Reverse-engineer documentation từ code

[4] Dự án cũ có requirements nhưng không có formal IDs
    → Extract và assign formal IDs

[5] Kết hợp nhiều nguồn
    → Merge nhiều sources vào 1 project MCV3"
```

---

## Phase 1 — Project Initialization

### 1a. Nếu chưa có project MCV3

```
"Tên dự án? (VD: 'Hệ thống ERP Công ty ABC')
Domain? (VD: Logistics, Retail, SaaS...)"

mc_init_project({ projectName, domain })
```

### 1b. Nếu đã có project MCV3

```
mc_status() → xác nhận project
mc_list() → xem documents hiện có
→ "Import vào project: {project_name}"
```

---

## Phase 2 — Source Analysis

### 2a. Nhận input documents

```
"Paste nội dung tài liệu cần migrate.
Hoặc mô tả cấu trúc tài liệu hiện có.

Format nào?
[ ] BRD (Business Requirements Document)
[ ] FRD (Functional Requirements Document)
[ ] SRS (Software Requirements Specification)
[ ] Use Case Specification
[ ] User Stories (informal)
[ ] Excel/Table format
[ ] Process Flow description
[ ] Technical Spec / API Docs
[ ] Other: ___"
```

### 2b. Analyze existing content

Đọc nội dung user cung cấp, identify:

```
Phân tích tài liệu "{source_name}":

✅ Tìm thấy:
  - {N} Business Rules (explicit hoặc implicit)
  - {M} User Stories / Use Cases
  - {K} Functional Requirements
  - {L} Non-functional Requirements

⚠️ Gaps phát hiện:
  - Không có Acceptance Criteria (sẽ generate từ context)
  - Actor/Role chưa được define rõ
  - {X} requirements có thể là duplicate/overlap

❓ Cần clarify:
  - Priority chưa được set (sẽ dùng MoSCoW)
  - {Y} requirements ambiguous — cần user confirm
```

---

## Phase 3 — Mapping Plan

### 3a. Tạo mapping plan

```markdown
# MIGRATION MAPPING PLAN

## Source → Target Mapping

| Source Content | Target Document | Notes |
|----------------|----------------|-------|
| "Kho hàng phải kiểm tra PO trước khi nhập" | BIZ-POLICY-WH.md (BR-WH-001) | Extract từ email thread |
| "Nhân viên kho nhập phiếu nhập hàng" | URS-WH.md (US-WH-001) | Convert từ informal story |
| "Validation: qty > 0" | MODSPEC-WH.md (validation section) | From tech spec |
| "API: POST /receipts" | MODSPEC-WH.md (API section) | From swagger/API docs |

## ID Assignment Strategy

Format: BR-{DOM}-NNN, US-{MOD}-NNN, FT-{MOD}-NNN
Starting from: 001

Namespaces:
  WH (Warehouse): BR-WH-001...
  SALES: BR-SALES-001...
  FINANCE: BR-FIN-001...
```

### 3b. Confirm với user

```
"📋 Migration Plan:

Tôi sẽ tạo:
- BIZ-POLICY: {N} business rules (BR-xxx)
- URS: {M} user stories (US-xxx) với {K} acceptance criteria
- {Các documents khác}

Assign IDs theo:
  WH module: BR-WH-001...050, US-WH-001...020
  SALES module: BR-SALES-001...030, US-SALES-001...015

Bắt đầu migration?"
```

---

## Phase 4 — Document Conversion

### 4a. Convert sang BIZ-POLICY

Với mỗi business rule tìm thấy:

```markdown
# BIZ-POLICY-{DOM}: {Domain Name}

## DEPENDENCY MAP
...

## Business Rules

### BR-{DOM}-001: {Tên rule (trích từ source)}
**Loại:** Operational | Compliance | Process
**Mô tả:** {Diễn đạt lại rõ ràng từ source}
**Nguồn gốc:** {Tên file gốc, hoặc "Stakeholder interview", "Email thread"}
**Effective:** {Ngày nếu có, hoặc "Ngay khi go-live"}
**Exceptions:** {Nếu có}
**Priority:** Must/Should/Could
**Migration note:** Migrated from: {source snippet}
```

### 4b. Convert sang URS

Với informal user stories hoặc use cases:

```markdown
### US-{MOD}-001: {Tiêu đề (derived từ source)}
**Role:** Là {actor — infer từ context nếu không explicit}
**Want:** Tôi muốn {action}
**So that:** Để {benefit}
**Priority:** Must/Should/Could
**Origin:** {Source: BR-xxx hoặc tên file gốc}
**Migration note:** "Derived from: '{source text}'"

#### Acceptance Criteria
> ⚠️ **GENERATED:** AC được generate từ context — cần user verify

- AC-{MOD}-001-01: Given {inferred condition}
  When {inferred action}
  Then {inferred result}
  **Review needed:** Yes

#### Incomplete/TBD
- Priority chưa được set → mặc định Should, cần confirm
- {Other TBD items}
```

### 4c. Convert sang MODSPEC

Với existing technical specs:

```markdown
### API-{SYS}-001: {Endpoint name (from source)}
> **Migration note:** Extracted from: {API docs / swagger / code}

**Method:** {HTTP method}
**Path:** {path — clean up từ source nếu cần}
**Auth:** {From source hoặc TBD}

Input: {Extract từ source}
Output: {Extract từ source}
Errors: {Extract hoặc infer}

> ⚠️ **Needs review:** {Fields còn thiếu hoặc unclear}
```

### 4d. Save converted documents

```
mc_save({
  filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md",
  documentType: "biz-policy"
})

mc_save({
  filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md",
  documentType: "urs"
})
```

---

## Phase 5 — Codebase Reverse Engineering (Scope 3)

Khi migrate từ existing codebase:

### 5a. Phân tích code structure

```
"Để reverse-engineer documentation:
1. Mô tả cấu trúc project của bạn
2. Paste ví dụ file (controller, service, schema)
3. Tôi sẽ tạo documentation từ code"
```

### 5b. Extract từ code

```
Từ controller file → extract API endpoints → MODSPEC API section
Từ service file → extract business logic → BIZ-POLICY, URS
Từ DB schema → extract tables/columns → DATA-DICTIONARY, MODSPEC DB section
Từ test files → extract AC/TC → URS AC section, TEST document
```

### 5c. Generate documentation

```
"🔍 Đã phân tích code:
- {N} controllers → {M} API endpoints
- {K} service methods → {L} business logic items
- {P} DB tables → {Q} entities

Tôi sẽ tạo:
1. DATA-DICTIONARY.md (entities từ DB schema)
2. BIZ-POLICY.md (business rules từ service logic)
3. URS.md (user stories inferred từ functionality)
4. MODSPEC.md (technical design từ code)

⚠️ Note: Tài liệu được reverse-engineer cần team review để confirm accuracy."
```

---

## Phase 6 — Validation & Gap Detection

### 6a. Validate converted documents

```
mc_validate({
  filePath: "...",
  validationType: "all"
})
→ Xử lý tất cả warnings/errors
```

### 6b. Detect gaps sau migration

```
"🔍 GAP ANALYSIS sau migration:

✅ Đã migrate:
  - {N} Business Rules (BIZ-POLICY)
  - {M} User Stories (URS)
  - {K} API endpoints (MODSPEC)

⚠️ Gaps cần bổ sung:
  - Acceptance Criteria: {X} US chưa có đủ AC
  - NFR: Chưa tìm thấy performance/security requirements
  - Actors: {Y} US chưa xác định được Role rõ ràng
  - {Z} requirements trong source chưa được map

❓ Items cần confirm:
  1. US-WH-003: Priority là Must hay Should?
  2. BR-SALES-007: Applies to online channel hay all channels?
  3. API-ERP-005: Authentication required?"
```

### 6c. Tạo Migration Report

```
mc_save({
  filePath: "_mcv3-work/migration/MIGRATION-REPORT.md",
  content: migration_report
})
```

Migration report format:
```markdown
# MIGRATION REPORT — {Project}
**Ngày:** {date}
**Source:** {source description}

## Summary
| Metric | Count |
|--------|-------|
| Documents converted | {N} |
| Business Rules | {M} |
| User Stories | {K} |
| Acceptance Criteria (generated) | {L} |
| APIs migrated | {P} |
| IDs assigned | {Q} |

## Review Required
[List items cần manual review]

## Gaps
[List gaps cần bổ sung]

## Next Steps
1. Review và confirm generated ACs
2. Fill gaps: NFR, priority, actors
3. Continue pipeline: /mcv3:tech-design
```

---

## Phase 7 — Register Traceability

```
// Register tất cả IDs mới
mc_traceability({
  action: "register",
  source: "migration",
  ids: ["BR-WH-001", ..., "US-WH-001", ..., "FT-WH-001", ...]
})
```

---

## Phase 8 — Post-Gate

```
mc_checkpoint({
  label: "migration-complete",
  sessionSummary: "Migration từ {source}: {N} docs, {M} IDs",
  nextActions: [
    "Review MIGRATION-REPORT.md và confirm gaps",
    "Fill missing ACs, NFRs, priorities",
    "Continue: /mcv3:tech-design hoặc /mcv3:requirements (nếu cần)"
  ]
})
```

**Post-Gate checklist:**
```
✅ Tất cả source documents đã được analyze
✅ Business Rules đã extract và assign BR-IDs
✅ User Stories đã extract và assign US-IDs
✅ Technical specs đã extract (nếu có)
✅ Gaps đã identify và document
✅ MIGRATION-REPORT.md đã tạo
✅ Traceability registered

→ "✅ Migration hoàn thành!
   {N} documents converted, {M} IDs assigned.
   Xem MIGRATION-REPORT.md để biết items cần review.
   Tiếp theo: Review gaps → /mcv3:requirements hoặc /mcv3:tech-design"
```

---

## Quy tắc Migration

```
PRESERVE-INTENT: Convert ý nghĩa, không chỉ reformat
MARK-GENERATED: Mọi content được generate (AC, actors) phải có "Generated" tag
FLAG-AMBIGUOUS: Đánh dấu rõ items cần human review
ASSIGN-IDS-SEQUENTIALLY: ID phải sequential, không gap
NO-INFORMATION-LOSS: Mọi content gốc phải được capture, kể cả không fit template
REPORT-EVERYTHING: MIGRATION-REPORT phải đầy đủ để người khác review
```
