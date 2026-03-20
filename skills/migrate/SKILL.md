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

## CHẾ ĐỘ VẬN HÀNH — Type C (Hybrid)

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`) — **Type C: Hybrid**:
1. **Nhận input ban đầu** — cần nội dung tài liệu cần migrate (paste hoặc mô tả codebase) từ user; nếu đã paste trong message → bắt đầu ngay
2. **Tự động sau khi có input** — auto-detect migration source từ content, tự convert và save; không hỏi format hay scope
3. **Tự giải quyết vấn đề** — tự classify content vào đúng MCV3 phases, ghi DECISION khi ambiguous
4. **Báo cáo sau khi xong** — MIGRATION-REPORT với count docs converted + gaps detected
5. **User review** — user review MIGRATION-REPORT, confirm generated ACs
6. **Gợi ý bước tiếp** — `/mcv3:requirements` hoặc `/mcv3:tech-design`

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
Lấy tên + domain từ context — không hỏi nếu đã có:
  - Tên dự án: extract từ message của user (VD: "ERP Công ty ABC")
  - Domain: detect từ context (VD: "kho hàng, nhập kho" → Logistics)
  - Nếu không có trong message → hỏi 1 câu duy nhất: "Tên dự án và ngành gì?"

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

### 2a. Nhận và analyze input documents

```
Auto-detect format từ content — không hỏi:
  - Có "Business Rule" / "BR-" patterns → BRD / BIZ-POLICY
  - Có "As a ... I want ... So that" → User Stories
  - Có "Use Case" / actor / flow → Use Case Specification
  - Có HTTP method (GET/POST) / endpoint / swagger → Technical Spec / API Docs
  - Có table với columns → SRS / Excel/Table format
  - Có "Process" / flow description → Process Flow
  - Không rõ → classify là "General Requirements", ghi DECISION

Nếu user đã paste nội dung vào message → phân tích ngay, không hỏi thêm.
Nếu chưa có content → hỏi 1 câu duy nhất: "Paste nội dung tài liệu hoặc mô tả codebase cần migrate."
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

### 4e. Validate + Per-Document Checkpoint

Sau khi save mỗi converted document:

```
// RISK-002: BẮT BUỘC validate sau khi convert mỗi document
mc_validate({
  projectSlug: "<slug>",
  filePath: "<path-of-converted-doc>",
  validationType: "format"
})
→ Nếu validate FAIL → tự fix format issues trước khi sang document tiếp theo
→ Nếu không tự fix được → đánh dấu "[NEEDS-FIX]" và ghi vào MIGRATION-REPORT gaps

// RISK-003: Per-document checkpoint — để resume nếu bị interrupt
mc_checkpoint({
  projectSlug: "<slug>",
  label: "migrate-doc-{N}-of-{TOTAL}",
  sessionSummary: "Migration: Đã convert {N}/{TOTAL} documents — vừa xong {doc-name}",
  nextActions: ["Tiếp tục /mcv3:migrate — convert document {N+1}: {next-doc-name}"]
})
```

> **Lưu ý:** Per-document checkpoint đặc biệt quan trọng khi migrate nhiều documents (>5). Cho phép resume đúng chỗ nếu session bị ngắt giữa chừng.

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

// RISK-005: Verify imported IDs đã được registered và không conflict
mc_traceability({
  action: "validate",
  projectSlug: "<slug>",
  scope: "imported-ids"   // Validate tất cả IDs từ migration này
})
→ Nếu có orphan IDs (registered nhưng chưa có document) → ghi vào MIGRATION-REPORT gaps
→ Nếu có duplicate IDs với existing → ghi CRITICAL gap, đề xuất re-assign
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

**Pre-Completion Verification:**

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

```
Tầng 1 — Self-Verification:
  ✓ Converted docs có đầy đủ MCV3 sections theo templates tương ứng
  ✓ Formal IDs đúng format và sequential (không gap, không duplicate)
  ✓ "Generated" tag có trên mọi AI-generated content (ACs, actors, NFRs)
  ✓ "[AMBIGUOUS]" / "[NEEDS REVIEW]" tags rõ ràng trên uncertain items
  ✓ Không có duplicate IDs trong namespace

MIGRATION-REPORT:
  ✓ Source documents list đầy đủ (không bỏ sót source nào)
  ✓ Coverage: % content extracted ghi rõ
  ✓ Gaps categorized (critical/warning/info)

Tầng 2 — Cross-Document:
  ✓ IDs assigned không conflict với existing IDs (nếu project đã có docs)
  ✓ Business domain từ source docs match với project domain trong mc_status
  ✓ Entities mention trong source có ENT-ID trong DATA-DICTIONARY (hoặc gap flagged)
  ✓ Tất cả content significant từ source đã được extract (không bỏ sót)

Tầng 3 — Quality Gate:
  ✅ Tất cả source documents đã process (không skip)
  ✅ IDs sequential và không conflict
  ✅ MIGRATION-REPORT có đầy đủ gaps list
  ✅ Ambiguous items được flag rõ ràng (không im lặng bỏ qua)
  ✅ mc_validate PASS cho tất cả migrated documents
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

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:migrate
═══════════════════════════════════════════════

✅ Đã convert {N} documents:
   BIZ-POLICY-{DOM}.md — {X} BRs extracted
   URS-{MOD}.md        — {Y} US, {Z} FT (nếu có)
   MIGRATION-REPORT.md — gaps + items cần review

📊 Metrics:
   {M} IDs assigned | {K} gaps cần fill
   Generated items: {G} (cần human verify)
   Ambiguous items: {A} (đánh dấu trong docs)

🔜 Bước tiếp theo:
   → Review MIGRATION-REPORT.md để biết gaps
   → /mcv3:requirements (nếu cần fill URS gaps)
   → /mcv3:tech-design (nếu đã có URS đầy đủ)

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem MIGRATION-REPORT để biết gaps?
   [2] Xem file đã convert nào?
   [3] OK, tiếp tục → /mcv3:requirements
═══════════════════════════════════════════════
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

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> Section này là checklist nhanh GIỮA các phases. Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ, trước Completion Report.

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển phase:

### Sau Phase 0 → trước Phase 1:
- ✓ **BLOCKING:** Source documents/content phải tồn tại — nếu user chưa cung cấp nội dung cần migrate (không có paste, không có file path, không có codebase mô tả) → **DỪNG**, hỏi 1 câu: `"Paste nội dung tài liệu cần migrate hoặc mô tả path codebase."` Không tiếp tục khi không có input.
- ✓ Migration source đã detect (Scope 1-6) — ghi DECISION nếu tự infer
- ✓ Nếu Scope không rõ → dùng Scope phù hợp nhất từ context (không dừng hỏi)
- ✓ Project slug đã xác định (không nhầm project khi import)

### Sau Phase 1 → trước Phase 2:
- ✓ Safety snapshot đã tạo thành công — nếu fail → DỪNG (SAFETY-FIRST không bỏ qua)
- ✓ Nếu project đã có documents: list existing IDs để tránh conflict về sau
- ✓ Project khởi tạo thành công: `.mc-data/` structure đã có

### Sau Phase 2 → trước Phase 3:
- ✓ Tất cả source content đã scan (không skip phần nào của input)
- ✓ Content categories đã identify: BRD, US, API specs, DB schema, code, etc.
- ✓ Gaps và ambiguous items đã note (không bỏ qua im lặng)
- ✓ Batch import lớn (>10 documents): chia batch và ghi batch order vào plan

### Sau Phase 3 → trước Phase 4:
- ✓ ID assignment ranges không conflict với existing IDs trong project
- ✓ Module namespaces rõ ràng (VD: WH, SALES, FIN — không overlap)
- ✓ Mapping plan có đầy đủ Source → Target cho mỗi content piece

### Sau Phase 4 → trước Phase 6:
- ✓ **BLOCKING:** Converted docs phải có đúng MCV3 template structure (headings, sections, IDs) — nếu conversion fail (output rỗng, format broken, không có IDs) → **DỪNG**, tự fix conversion issues trước khi tiếp tục. Báo user nếu không tự fix được: `"❌ Conversion thất bại cho {doc}. Kiểm tra format source và thử lại."`
- ✓ Mọi AI-generated content đều có "Generated" tag
- ✓ Mọi uncertain items đều có "[AMBIGUOUS]" tag
- ✓ Batch import lớn: verify mỗi batch không introduce duplicate IDs trước khi sang batch sau
- ✓ Cross-check: số lượng items trong source ≈ số lượng items đã convert (không bỏ sót)

### Sau Phase 6 → trước Phase 7:
- ✓ GAP-REPORT có đầy đủ categories: missing ACs, missing NFRs, ambiguous items, unmapped content
- ✓ Mỗi gap có severity (critical/warning/info) và actionable next step
- ✓ MIGRATION-REPORT đủ để người khác review (không chỉ tự dùng)
