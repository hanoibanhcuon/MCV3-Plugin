# Migrate Skill — `/mcv3:migrate`

## Mục đích

Hỗ trợ **migrate dự án từ format cũ sang MCV3**. Khi có:
- Documents viết tự do (Word, Confluence, Notion, Google Docs)
- Dự án cũ không có formal ID system
- Muốn import existing codebase vào MCV3 structure
- Chuyển từ một document format khác sang MCV3 templates
- Dự án đang phát triển dở với assets ở nhiều phases cùng lúc (Scope 6)

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

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — auto-detect migration source từ context, tự convert và save
2. **Tự giải quyết vấn đề** — tự classify content vào đúng MCV3 phases, ghi DECISION khi ambiguous
3. **Báo cáo sau khi xong** — MIGRATION-REPORT với count docs converted + gaps detected
4. **User review** — user review MIGRATION-REPORT, confirm generated ACs
5. **Gợi ý bước tiếp** — `/mcv3:requirements` hoặc `/mcv3:tech-design`

**Input bắt buộc từ user:** Nội dung tài liệu cần migrate (paste hoặc mô tả codebase)

---

## Khi nào dùng skill này

- Đang có docs Word/PDF/Confluence muốn chuyển sang MCV3
- Dự án cũ đã có requirements nhưng chưa dùng formal IDs
- Nhận project từ team khác, muốn onboard vào MCV3
- Có Excel specs hoặc email threads muốn formalize
- Codebase hiện tại muốn tạo reverse-engineered documentation

---

## Phase 0 — Auto-Detect Migration Source

Tự detect source từ context — không hỏi:

```
Auto-detect logic từ user message và attachments:
  - User paste nội dung markdown/text → Scope 1 (Documents)
  - User mô tả "Confluence/Notion/Docs" → Scope 2
  - User mô tả "codebase/src/" hoặc paste code → Scope 3
  - User có requirements nhưng không có IDs → Scope 4
  - User đề cập nhiều nguồn → Scope 5
  - User đề cập "dự án đang chạy/in-progress" → Scope 6

Nếu không rõ → ghi DECISION + dùng Scope phù hợp nhất từ context
→ Tự chuyển sang Phase 1 ngay
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-migrate",
  sessionSummary: "Chuẩn bị chạy /mcv3:migrate — import tài liệu cũ vào MCV3",
  nextActions: ["Tiếp tục /mcv3:migrate — Phase 1: Project Initialization"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu migration..."

> **Lưu ý:** Checkpoint này phục vụ **session resume**. Safety snapshot (Phase 1, SAFETY-FIRST) phục vụ **rollback data** — snapshot vẫn bắt buộc trước khi import bất kỳ document nào.

---

## Phase 1 — Project Initialization

> **⚠️ SAFETY-FIRST:** Migration luôn tạo snapshot trước khi import để có thể rollback nếu cần. Đây là bước bắt buộc, không bỏ qua.

### 1a. Nếu chưa có project MCV3

```
"Tên dự án? (VD: 'Hệ thống ERP Công ty ABC')
Domain? (VD: Logistics, Retail, SaaS...)"

mc_init_project({ projectName, domain })
```

Sau khi khởi tạo project mới, tạo ngay baseline snapshot:
```
mc_snapshot({
  projectSlug: "<slug>",
  label: "baseline-before-migration",
  description: "Trạng thái ban đầu trước khi import bất kỳ tài liệu nào"
})
→ "✅ Baseline snapshot đã tạo. Migration có thể rollback về trạng thái này nếu cần."
```

### 1b. Nếu đã có project MCV3

```
mc_status() → xác nhận project
mc_list() → xem documents hiện có
→ "Import vào project: {project_name}"

// Tạo safety snapshot trước khi migrate (bảo vệ documents hiện có)
mc_snapshot({
  projectSlug: "<slug>",
  label: "before-migration-{source}",
  description: "Snapshot trước khi import từ {source} — có thể rollback nếu cần"
})
→ "✅ Safety snapshot đã tạo. Nếu migration có vấn đề, dùng mc_rollback để khôi phục."
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

### 3b. Auto-Start Migration

```
Tự động bắt đầu migration — không chờ confirm:
  Ghi nhận plan vào completion report:
  - BIZ-POLICY: {N} business rules (BR-xxx)
  - URS: {M} user stories (US-xxx)
  - ID ranges per module
→ Chuyển ngay sang Phase 4 (Document Conversion)
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

## Scope 6 — Ongoing Project Integration (Mixed-Phase Mode)

Dùng khi dự án có assets ở **nhiều phases cùng lúc** và không theo thứ tự tuần tự.
Ví dụ: Có code (Phase 7) + có API spec (Phase 5) + có BRD cũ (Phase 3) nhưng thiếu Phase 4.

### Nguyên tắc Mixed-Phase

```
FLEXIBLE_ENTRY: Không cần hoàn thành Phase 1-3 mới được import Phase 5
PER-ASSET_IMPORT: Mỗi asset được import độc lập theo đúng phase của nó
MARK_GAPS: Phases thiếu được đánh dấu rõ, không block import
LINK_WITH_ASSESS: Nên có ASSESSMENT-MATRIX từ /mcv3:assess trước khi làm
```

### Workflow Mixed-Phase

**Bước 0: Safety snapshot (tự động)**

```
// LUÔN tạo snapshot trước khi bắt đầu mixed-phase import
mc_snapshot({
  projectSlug: "<slug>",
  label: "before-mixed-phase-import-{date}",
  description: "Snapshot trước khi import mixed-phase assets — có thể rollback toàn bộ"
})
→ "✅ Safety snapshot đã tạo."

// Tự kiểm tra ASSESSMENT-MATRIX (không hỏi user):
mc_list({ subPath: "_mcv3-work/assessment" })
→ Nếu có ASSESSMENT-MATRIX → dùng làm guide
→ Nếu chưa có → ghi DECISION: "Proceed without assess — user có thể chạy /mcv3:assess sau"
→ Tiếp tục import ngay
```

**Bước 1: Inventory tất cả assets**

```
"Liệt kê tất cả assets bạn có, không cần theo thứ tự:
VD:
  - API_Spec_v3.xlsx → Phase 5 (MODSPEC candidate)
  - BRD_2023.docx → Phase 3/4 (BIZ-POLICY + URS candidate)
  - src/ (codebase) → Phase 7 (Code)
  - swagger.json → Phase 5 (MODSPEC)
  - test_cases.xlsx → Phase 6 (TEST candidate)

Paste danh sách của bạn:"
```

**Bước 2: Phase assignment**

```
Với mỗi asset, tôi xác định:
  - Phase tương ứng trong MCV3
  - Target path trong .mc-data/
  - Import method (convert hoặc reverse-engineer)
  - Estimated effort

"📋 Import Plan:

Asset → Target → Method → Effort
---
API_Spec_v3.xlsx → {SYS}/P2-DESIGN/MODSPEC-{MOD}.md → Convert → Low
BRD_2023.docx → _PROJECT/BIZ-POLICY/ + {SYS}/P1-REQUIREMENTS/ → Convert → Medium
src/ → {SYS}/ (code + annotation) → Annotate → Low
test_cases.xlsx → {SYS}/P3-QA-DOCS/TEST-{MOD}.md → Convert → Low

⚠️ Phases không có asset:
  Phase 1 (Discovery): Sẽ tạo PROJECT-OVERVIEW từ BRD intro + context
  Phase 2 (Expert): Tạm để trống — không block các phases khác

→ Tự động chuyển sang Bước 3 (Import per-phase)"
```

**Bước 3: Import per-phase (không theo thứ tự)**

```
Import theo thứ tự: Phase 5 trước (đã có spec) → Phase 3/4 → Phase 6 → Phase 7

VD: Import API spec trước (vì có sẵn và complete):
  → Convert API_Spec_v3.xlsx → MODSPEC format
  → Assign API-{SYS}-xxx IDs
  → mc_save({path: "{SYS}/P2-DESIGN/MODSPEC-{MOD}.md"})

Sau đó import BRD:
  → Extract business rules → BIZ-POLICY format
  → Extract user stories → URS format
  → Assign BR-xxx, US-xxx IDs
  → mc_save() cho từng file

Chú ý: Các IDs cross-reference nhau sẽ được link sau khi import xong
```

**Bước 4: Update _config.json với per-system phases**

```
Sau khi import xong:
  mc_status({ projectSlug: {slug} })
  → Xem phases nào đã có content

Cập nhật config để phản ánh đúng currentPhase per system:
  - systems[i].currentPhase = phase có content cao nhất
  VD: ERP có đến phase5-design → currentPhase: "phase5-design"
      WEB chỉ có phase3-bizdocs → currentPhase: "phase3-bizdocs"
```

**Bước 5: Gap documentation**

```
Sau import, document rõ gaps còn lại:

"📊 Import Summary:

✅ Imported:
  - Phase 3: BIZ-POLICY-WH.md, BIZ-POLICY-SALES.md
  - Phase 4: URS-WH.md (partial — thiếu ACs)
  - Phase 5: MODSPEC-WH.md, MODSPEC-SALES.md
  - Phase 6: TEST-WH.md (partial)
  - Phase 7: src/ annotated với REQ-IDs

⚠️ Gaps (cần bổ sung):
  - Phase 1: PROJECT-OVERVIEW.md → /mcv3:discovery
  - Phase 2: EXPERT-LOG.md → /mcv3:expert-panel (tùy chọn)
  - Phase 4: Thiếu ACs cho URS-WH → /mcv3:requirements (enrich)
  - Phase 6: Thiếu UAT scenarios → /mcv3:qa-docs (enrich)
  - Phase 8: Cần verify sau khi gaps được fill → /mcv3:verify

Thứ tự fill gaps theo REMEDIATION-PLAN (từ /mcv3:assess)"
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
