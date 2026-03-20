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

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 1b (project đã có) | mc_status → mc_list (sequential) | mc_status ∥ mc_list song song | ~1 round-trip |
| Multi-source analysis | Analyze doc1 → doc2 → ... (sequential) | Analyze tất cả sources song song | ~N−1 lượt xử lý |
| Phase 4e per-doc | mc_save → mc_validate → mc_checkpoint | mc_save → [mc_validate ∥ mc_checkpoint] | ~1 round-trip / doc |
| Phase 7 traceability | mc_traceability(register) → mc_traceability(validate) + mc_checkpoint | register → [validate ∥ mc_checkpoint] | ~1 round-trip |

### Cache Rules

```
✅ mc_list kết quả: Dùng ở Phase 1b, tái sử dụng ở Phase 2 để tránh ID conflicts (không gọi lại)
✅ Format detection rules: Cache 1 lần khi detect source format, dùng lại cho các documents sau
✅ ID namespace: Track assigned IDs in-memory để tránh conflicts khi xử lý batches
```

### Quy tắc áp dụng

```
✅ Phase 1b: mc_status ∥ mc_list = 1 round để xác nhận project + list existing docs
✅ Multi-source: Khi có nhiều source documents → analyze song song, convert sequential
✅ Post-save parallel: mc_validate và mc_checkpoint sau mc_save → chạy song song per document
✅ Phase 7: mc_traceability(register) bắt buộc trước validate; sau validate → [∥ mc_checkpoint]
✅ No re-validation: Pre-Completion Tầng 3 chỉ confirm mc_validate PASS đã done, không re-run
```

---

## CHẾ ĐỘ VẬN HÀNH — Type C (Hybrid) / Type A (Auto cho Scope 6)

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):

**Scope 1-5 (Documents, Confluence, Codebase, Informal, Mixed) — Type C: Hybrid:**
1. **Nhận input ban đầu** — cần nội dung tài liệu cần migrate (paste hoặc mô tả codebase) từ user; nếu đã paste trong message → bắt đầu ngay
2. **Tự động sau khi có input** — auto-detect migration source từ content, tự convert và save; không hỏi format hay scope
3. **Tự giải quyết vấn đề** — tự classify content vào đúng MCV3 phases, ghi DECISION khi ambiguous
4. **Báo cáo sau khi xong** — MIGRATION-REPORT với count docs converted + gaps detected
5. **User review** — user review MIGRATION-REPORT, confirm generated ACs
6. **Gợi ý bước tiếp** — `/mcv3:requirements` hoặc `/mcv3:tech-design`

**Scope 6 (Ongoing/In-Progress Project) — Type A: Fully Auto:**
1. **Không cần user paste gì** — Tự dùng `mc_list` để inventory assets đã có trong project
2. **Auto-detect từ context** — Nếu có ASSESSMENT-MATRIX từ `/mcv3:assess` → dùng làm guide; nếu không có → tự scan
3. **Tự assign phases** — Phân loại assets theo phase tự động, ghi DECISION khi ambiguous
4. **Báo cáo và gợi ý** — Import summary + gaps + next steps

**Input bắt buộc từ user:**
- Scope 1-5: Nội dung tài liệu cần migrate (paste hoặc mô tả codebase)
- **Scope 6: KHÔNG cần input** — skill tự detect assets từ project memory và context

---

## Khi nào dùng skill này

- Đang có docs Word/PDF/Confluence muốn chuyển sang MCV3
- Dự án cũ đã có requirements nhưng chưa dùng formal IDs
- Nhận project từ team khác, muốn onboard vào MCV3
- Có Excel specs hoặc email threads muốn formalize
- Codebase hiện tại muốn tạo reverse-engineered documentation

---

## Phase 0 — Auto-Detect Migration Source

> **⚠️ ENTRY GUARD — Chạy TRƯỚC KHI detect scope (bắt buộc):**
>
> ```
> // Kiểm tra xem project đã migrate chưa — TRƯỚC KHI làm bất cứ điều gì
> mc_list({ projectSlug: "<slug>", subPath: "_mcv3-work/migration" })
>
> → Nếu tìm thấy MIGRATION-REPORT.md:
>     → DỪNG auto-detect scope — KHÔNG chạy lại migration
>     → Hỏi 1 câu duy nhất:
>       "Phát hiện migration đã hoàn thành (MIGRATION-REPORT.md tồn tại).
>        Bạn muốn làm gì?
>        [1] BA Review — bắt đầu/tiếp tục review {G} GENERATED items
>        [2] Migrate thêm — import documents mới vào project (không ghi đè docs cũ)"
>     → User chọn [1] → Nhảy thẳng vào BA Review Mode (bỏ qua toàn bộ Phase 0-8)
>     → User chọn [2] → Tiếp tục Phase 0 auto-detect bình thường bên dưới
>     → User mô tả files/docs mới cụ thể → tự chọn [2], bắt đầu Phase 0
>
> → Nếu KHÔNG có MIGRATION-REPORT.md → Tiếp tục Phase 0 auto-detect bình thường
> ```

Tự detect source từ context — không hỏi:

```
Auto-detect logic từ user message và attachments:
  - User paste nội dung markdown/text → Scope 1 (Documents)
  - User mô tả "Confluence/Notion/Docs" → Scope 2
  - User mô tả "codebase/src/" hoặc paste code → Scope 3
  - User có requirements nhưng không có IDs → Scope 4
  - User đề cập nhiều nguồn → Scope 5
  - User đề cập "dự án đang chạy/in-progress/làm dở/phát triển dở" → Scope 6
  - User vừa chạy /mcv3:assess trước đó (ASSESSMENT-MATRIX tồn tại) → Scope 6
  - Project đang ở phase > phase0-init nhưng không có docs đầy đủ → Scope 6

[SCOPE 6 BYPASS] Nếu detect Scope 6 → BỎ QUA Phase 2a content-paste check
  → Nhảy thẳng vào Scope 6 Workflow (không hỏi user paste gì)
  → Dùng mc_list để tự inventory assets

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
// PARALLEL (2 calls đồng thời):
PARALLEL:
  mc_status() → xác nhận project
  mc_list()   → xem documents hiện có (tái dùng ở Phase 2 để check ID conflicts)
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
[SCOPE 6 FAST PATH] Nếu đã detect Scope 6 ở Phase 0:
  → BỎ QUA toàn bộ Phase 2a
  → Chuyển thẳng sang Scope 6 Workflow (Bước 0 của Scope 6)
  → KHÔNG hỏi user paste gì

[SCOPE 1-5] Auto-detect format từ content — không hỏi:
  - Có "Business Rule" / "BR-" patterns → BRD / BIZ-POLICY
  - Có "As a ... I want ... So that" → User Stories
  - Có "Use Case" / actor / flow → Use Case Specification
  - Có HTTP method (GET/POST) / endpoint / swagger → Technical Spec / API Docs
  - Có table với columns → SRS / Excel/Table format
  - Có "Process" / flow description → Process Flow
  - Không rõ → classify là "General Requirements", ghi DECISION

Nếu user đã paste nội dung vào message → phân tích ngay, không hỏi thêm.
Nếu chưa có content (và KHÔNG phải Scope 6) → hỏi 1 câu duy nhất: "Paste nội dung tài liệu hoặc mô tả codebase cần migrate."
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

> **QUY TẮC BẮT BUỘC:** Mỗi User Story PHẢI có **tối thiểu 2 ACs**.
> - Nếu source đã có ACs → convert nguyên vẹn
> - Nếu source KHÔNG có ACs → **tự generate tối thiểu 2 ACs** từ context (Want + So that + domain knowledge)
> - Không được để User Story trống AC — nếu không generate được 2 ACs → đánh dấu `[NEEDS-REVIEW]` và ghi vào MIGRATION-REPORT

```markdown
### US-{MOD}-001: {Tiêu đề (derived từ source)}
**Role:** Là {actor — infer từ context nếu không explicit}
**Want:** Tôi muốn {action}
**So that:** Để {benefit}
**Priority:** Must/Should/Could
**Origin:** {Source: BR-xxx hoặc tên file gốc}
**Migration note:** "Derived from: '{source text}'"

#### Acceptance Criteria
> ⚠️ **GENERATED:** AC được generate từ context — cần BA verify trước khi dùng làm basis cho MODSPEC

- **AC-{MOD}-001-01:** Given {inferred condition}
  When {inferred action}
  Then {inferred result}
  **Review needed:** Yes

- **AC-{MOD}-001-02:** Given {inferred edge condition}
  When {inferred action}
  Then {inferred error/alternate result}
  **Review needed:** Yes

#### Incomplete/TBD
- Priority chưa được set → mặc định Should, cần confirm
- ACs trên được generate từ context — BA cần xác nhận hoặc sửa trước Phase 5
- {Other TBD items nếu có}
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

### 4e. Validate + Per-Document Checkpoint — PARALLEL

Sau khi save mỗi converted document:

```
// RISK-002 + RISK-003: Sau mc_save → PARALLEL [mc_validate ∥ mc_checkpoint]
PARALLEL (2 calls đồng thời — lặp lại per document):
  mc_validate({
    projectSlug: "<slug>",
    filePath: "<path-of-converted-doc>",
    validationType: "format"
  })
  mc_checkpoint({
    projectSlug: "<slug>",
    label: "migrate-doc-{N}-of-{TOTAL}",
    sessionSummary: "Migration: Đã convert {N}/{TOTAL} documents — vừa xong {doc-name}",
    nextActions: ["Tiếp tục /mcv3:migrate — convert document {N+1}: {next-doc-name}"]
  })
→ Nếu mc_validate FAIL → tự fix format issues trước khi sang document tiếp theo
→ Nếu không tự fix được → đánh dấu "[NEEDS-FIX]" và ghi vào MIGRATION-REPORT gaps
[MANDATORY — PER BATCH] Checkpoint sau mỗi batch/scope, KHÔNG gộp cuối session.
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
[MANDATORY] Nếu ERROR → sửa ngay. KHÔNG tiếp tục khi còn ERROR.
```

### 6b. Detect gaps sau migration

> **Lưu ý:** Việc đảm bảo mỗi US có ≥ 2 ACs được xử lý **inline tại Phase 4b** (khi tạo từng US).
> Phase 6b chỉ TỔNG HỢP và REPORT từ data đã có trong memory — KHÔNG load lại files.

```
"🔍 GAP ANALYSIS sau migration:

✅ Đã migrate:
  - {N} Business Rules (BIZ-POLICY)
  - {M} User Stories (URS) — {G} ACs generated (⚠️ cần BA verify)
  - {K} API endpoints (MODSPEC) [nếu có]

⚠️ Gaps cần bổ sung sau migration:
  - NFR: Chưa tìm thấy performance/security requirements
  - Actors: {Z} US chưa xác định được Role rõ ràng
  - {W} requirements trong source chưa được map rõ
  - ACs được generate (⚠️ GENERATED): {G} ACs — cần BA confirm trước Phase 5

❓ Items cần confirm:
  1. {US-xxx}: Priority là Must hay Should?
  2. {BR-xxx}: Áp dụng cho channel nào?
  3. {AC-xxx}: Business rule có đúng không? (được infer từ context)"
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
**Scope:** {Scope 1-6}

## Summary
| Metric | Count |
|--------|-------|
| Documents converted | {N} |
| Business Rules | {M} |
| User Stories | {K} |
| Acceptance Criteria (generated) | {L} |
| APIs migrated | {P} |
| IDs assigned | {Q} |

## GENERATED Items — Cần BA Review
| Module | URS File | US Count | Generated ACs | Status |
|--------|----------|----------|---------------|--------|
| WMS | ERP/P1-REQUIREMENTS/URS-WMS.md | {N} | {G} | ⏳ PENDING |
| TMS | ERP/P1-REQUIREMENTS/URS-TMS.md | {N} | {G} | ⏳ PENDING |
| ... | ... | ... | ... | ... |
| **TOTAL** | | {total_US} | **{total_G}** | |

> Status values: ⏳ PENDING | 🔄 IN-PROGRESS | ✅ REVIEWED | ⏭️ DEFERRED

## REVIEW-STATUS
*(Được cập nhật tự động sau mỗi BA Review session)*

| Metric | Value |
|--------|-------|
| Review started | — |
| Last updated | — |
| ACs confirmed | 0 / {total_G} |
| ACs modified | 0 |
| ACs removed | 0 |
| ACs added | 0 |
| Modules reviewed | 0 / {total_modules} |

> Xem chi tiết: `_mcv3-work/migration/REVIEW-PROGRESS.md`

## Review Required
[List items cần manual review ngoài ACs — priorities, actors, ambiguous requirements]

## Gaps
| Gap | Severity | Actionable Next Step |
|-----|----------|---------------------|
| {gap description} | CRITICAL / WARNING / INFO | {skill hoặc action} |

## Next Steps (theo thứ tự)
1. **BA Review** — Chọn [1] từ completion report để vào Review Mode
   → Review {total_G} GENERATED ACs trên {total_modules} modules
   → Hoặc resume nếu đã bắt đầu: gọi /mcv3:migrate → chọn [1]
2. **Fill gaps** — /mcv3:requirements: bổ sung NFRs, xác nhận priorities, enrich deferred items
3. **Tech design** — /mcv3:tech-design (sau khi URS đầy đủ và BA đã review)
4. **Verify** — /mcv3:verify (chỉ sau khi có URS + MODSPEC + TEST — Phase 5+6)

⚠️ Không chạy /mcv3:verify ngay — sẽ fail vì thiếu MODSPEC và TEST docs
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

**Bước 0: Safety snapshot + Load Assessment Data (tự động)**

```
// Step 1: Safety snapshot TRƯỚC KHI làm bất cứ điều gì
mc_snapshot({
  projectSlug: "<slug>",
  label: "before-mixed-phase-import-{date}",
  description: "Snapshot trước khi import mixed-phase assets — có thể rollback toàn bộ"
})
→ "✅ Safety snapshot đã tạo."

// Step 2: Detect + LOAD assessment files (không hỏi user)
mc_list({ projectSlug: "<slug>", subPath: "_mcv3-work/assessment" })
→ Nếu có files trong _mcv3-work/assessment/:
    // PARALLEL: Load cả 2 files quan trọng nhất cùng lúc
    PARALLEL:
      mc_load({ projectSlug: "<slug>",
                filePath: "_mcv3-work/assessment/ASSESSMENT-MATRIX.md",
                layer: 2 })    // per-system phase status + gaps
      mc_load({ projectSlug: "<slug>",
                filePath: "_mcv3-work/assessment/REMEDIATION-PLAN.md",
                layer: 2 })    // action plan + skill routing
    → Đọc và cache nội dung: systems list, phases hiện tại, gaps per system
    → Dùng REMEDIATION-PLAN làm thứ tự ưu tiên import

→ Nếu không có files assessment:
    → ghi DECISION: "Proceed without assess data — user có thể chạy /mcv3:assess sau"
→ Tiếp tục import ngay (không dừng hỏi)
```

**Bước 1: Inventory tất cả assets — TỰ ĐỘNG**

```
// Tự scan project — không hỏi user
// Nếu đã load ASSESSMENT-MATRIX ở Bước 0:
→ Dùng systems + assets từ ASSESSMENT-MATRIX làm inventory chính
→ Bổ sung bằng mc_list để lấy paths chính xác trong .mc-data/

// Nếu KHÔNG có assessment data:
// PARALLEL (đồng thời):
PARALLEL:
  mc_list({ projectSlug: "<slug>" })              // Tất cả docs đã có trong project memory
  mc_list({ projectSlug: "<slug>", subPath: "_mcv3-work" })  // Working files

→ Build asset list từ kết quả mc_list

// Sau khi scan xong — show kết quả cho user:
"📋 Tự động detect {N} assets từ project:
  - {path1} → Phase {X} candidate
  - {path2} → Phase {Y} candidate
  ...

⚠️ Nếu bạn có file bên ngoài project (Word, Excel, PDF) cần import thêm,
   paste tên/đường dẫn vào. Nếu không → trả lời 'OK' để tiếp tục."

→ Nếu user trả lời 'OK' hoặc không có gì thêm → chuyển ngay sang Bước 2
→ Nếu user cung cấp thêm files → bổ sung vào asset list, chuyển sang Bước 2
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
// Step 1: Register tất cả IDs mới (phải hoàn thành trước validate)
mc_traceability({
  action: "register",
  source: "migration",
  ids: ["BR-WH-001", ..., "US-WH-001", ..., "FT-WH-001", ...]
})
[MANDATORY] Traceability PHẢI được register trước khi sang Phase 8.

// Step 2: Sau khi register xong → PARALLEL [mc_traceability(validate) ∥ mc_checkpoint]
PARALLEL (2 calls đồng thời):
  mc_traceability({
    action: "validate",
    projectSlug: "<slug>",
    scope: "imported-ids"   // Validate tất cả IDs từ migration này
  })
  mc_checkpoint({
    label: "migration-complete",
    sessionSummary: "Migration từ {source}: {N} docs, {M} IDs, {G} GENERATED ACs cần BA review",
    nextActions: [
      "BA Review: chọn [1] từ completion report hoặc gọi lại /mcv3:migrate",
      "Fill missing NFRs, priorities sau BA Review",
      "Continue pipeline: /mcv3:requirements → /mcv3:tech-design (sau BA review)"
    ]
  })
→ Nếu có orphan IDs (registered nhưng chưa có document) → ghi vào MIGRATION-REPORT gaps
→ Nếu có duplicate IDs với existing → ghi CRITICAL gap, đề xuất re-assign
```

---

## Phase 8 — Post-Gate

> ✅ **Checkpoint đã được gộp vào Phase 7 PARALLEL** — mc_checkpoint chạy song song với mc_traceability(validate), tiết kiệm 1 round-trip. Checkpoint MANDATORY đã được thực thi ở Phase 7.

```
// Nếu Phase 7 checkpoint thất bại (hiếm gặp) → retry checkpoint ngay tại đây:
[FALLBACK ONLY] mc_checkpoint({ label: "migration-complete", ... })
```

SAU KHI TẤT CẢ DOCUMENTS ĐÃ CONVERT VÀ VALIDATE:
╔══════════════════════════════════════════════════════════╗
║  [BẮT BUỘC] Chạy Pre-Completion Verification            ║
║  Xem section "Pre-Completion Verification" bên dưới      ║
║  TRƯỚC KHI viết Completion Report                         ║
║                                                            ║
║  Tầng 1 PASS + Tầng 2 PASS + Tầng 3 PASS                ║
║  → mới được viết Completion Report                        ║
║  Nếu FAIL → tự fix → re-verify (max 2 lần)               ║
╚══════════════════════════════════════════════════════════╝

**Pre-Completion Verification (BẮT BUỘC — RISK-004):**

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

```
Tầng 1 — Self-Verification:
  ✓ Converted docs có đầy đủ MCV3 sections theo templates tương ứng
  ✓ Formal IDs đúng format và sequential (không gap, không duplicate)
  ✓ "⚠️ GENERATED" tag có trên mọi AI-generated content (ACs, actors, NFRs)
  ✓ Mỗi generated AC có "**Review needed:** Yes" marker
  ✓ Mỗi US có section "#### Incomplete/TBD" nếu còn items chưa confirm
  ✓ "[AMBIGUOUS]" / "[NEEDS REVIEW]" tags rõ ràng trên uncertain items
  ✓ Không có duplicate IDs trong namespace
  ✓ [COMPLETENESS] Mỗi US có ít nhất 2 ACs — nếu phát hiện US < 2 ACs → DỪNG, generate thêm

MIGRATION-REPORT:
  ✓ Source documents list đầy đủ (không bỏ sót source nào)
  ✓ Coverage: % content extracted ghi rõ
  ✓ Gaps categorized (critical/warning/info)
  ✓ Số lượng GENERATED items ghi rõ — BA biết bao nhiêu items cần review

Tầng 2 — Cross-Document:
  ✓ IDs assigned không conflict với existing IDs (nếu project đã có docs)
  ✓ Business domain từ source docs match với project domain trong mc_status
  ✓ "Origin BR:" trong mỗi US có BR-ID thực sự tồn tại trong BIZ-POLICY (hoặc gap flagged)
  ✓ Entities mention trong source có ENT-ID trong DATA-DICTIONARY (hoặc gap flagged nếu chưa có DATA-DICTIONARY)
  ✓ Tất cả content significant từ source đã được extract (không bỏ sót)

Tầng 3 — Quality Gate [🚫 BLOCKING GATE]:

> **BẮT BUỘC:** Toàn bộ checklist phải PASS trước khi viết Completion Report.
> Nếu FAIL → tự fix → re-verify (max 2 lần). KHÔNG viết Completion Report khi còn lỗi.

  ✅ Tất cả source documents đã process (không skip)
  ✅ IDs sequential và không conflict
  ✅ MIGRATION-REPORT có đầy đủ gaps list
  ✅ Ambiguous items được flag rõ ràng (không im lặng bỏ qua)
  ✅ mc_validate PASS cho tất cả migrated documents
  ✅ [COMPLETENESS] Mỗi US có ít nhất 2 ACs (kể cả GENERATED) — KHÔNG chấp nhận US không có AC
  ✅ [GENERATED MARKERS] Tất cả generated ACs có "⚠️ GENERATED" tag VÀ "**Review needed:** Yes"
  ✅ MIGRATION-REPORT ghi rõ tổng số GENERATED items để BA biết scope review
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

🔜 Bước tiếp theo (THEO THỨ TỰ):

   ① NGAY BÂY — BA Review (bắt buộc trước khi tiếp tục pipeline):
      → Xem MIGRATION-REPORT.md: _mcv3-work/migration/MIGRATION-REPORT.md
      → Review và confirm/sửa {G} items được đánh dấu ⚠️ GENERATED
      → Đặc biệt: Acceptance Criteria generated cần BA xác nhận trước khi dùng làm basis cho MODSPEC

   ② SAU BA REVIEW — Fill gaps trong URS:
      → /mcv3:requirements — Enrich URS: bổ sung ACs đã confirm, NFRs, xác nhận priorities

   ③ SAU KHI URS ĐẦY ĐỦ — Thiết kế kỹ thuật:
      → /mcv3:tech-design — Tạo MODSPEC cho tất cả modules

   ⚠️ /mcv3:verify chỉ chạy sau khi có đầy đủ URS + MODSPEC + TEST (Phase 5+6)
      → KHÔNG chạy /mcv3:verify ngay sau migrate — sẽ fail vì thiếu MODSPEC và TEST docs

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] BA Review ngay — xem và confirm GENERATED items theo module
   [2] Xem nội dung file đã convert (chỉ đọc)
   [3] OK, tiếp tục → /mcv3:requirements (enrich URS)
═══════════════════════════════════════════════
```

---

## BA Review Mode (Post-Migration Continuation)

> **Tích hợp trong migrate skill — KHÔNG cần skill riêng.**
> Trigger khi user chọn [1], hoặc `/mcv3:migrate` detect pending review từ checkpoint.
> Review theo **module** — không từng AC riêng lẻ — để scalable với dự án lớn.

---

### BR-0: Trigger Conditions — Khi nào Enter Review Mode

```
Condition 1 — User chọn [1] từ Completion Report:
  → Enter Review Mode ngay trong session hiện tại

Condition 2a — Resume BA Review đang dở (PAUSE):
  → User gọi lại `/mcv3:migrate` (bất kỳ lệnh nào)
  → mc_resume() detect checkpoint label chứa "ba-review-paused"
  → Hỏi 1 câu: "Phát hiện BA Review đang dở ({X}/{TOTAL} modules đã review).
     Tiếp tục? [1] Có  [2] Không, bỏ qua"
  → User chọn [1] → load REVIEW-PROGRESS.md, resume đúng vị trí

Condition 2b — Bắt đầu BA Review sau migration complete (session mới):
  → User gọi lại `/mcv3:migrate` (bất kỳ lệnh nào)
  → Phase 0 Entry Guard phát hiện MIGRATION-REPORT.md
  → mc_resume() detect checkpoint label "migration-complete"
  → Phase 0 Entry Guard hỏi: "[1] BA Review  [2] Migrate thêm"
  → User chọn [1] → Enter BA Review Mode (bắt đầu từ module đầu tiên)

Condition 3 — User yêu cầu trực tiếp:
  → Detect keywords: "ba review", "review generated", "tiếp tục review",
    "confirm ac", "review urs" → enter Review Mode
```

---

### BR-1: Pre-Review Bootstrap

```
// Step 1: Load state — PARALLEL (2 calls đồng thời)
PARALLEL:
  mc_load({ filePath: "_mcv3-work/migration/MIGRATION-REPORT.md", layer: 2 })
  mc_load({ filePath: "_mcv3-work/migration/REVIEW-PROGRESS.md", layer: 3 })
  // REVIEW-PROGRESS.md có thể chưa tồn tại → fresh start nếu 404

// Step 2: Build review queue
Từ MIGRATION-REPORT:
  → Extract TẤT CẢ modules đã migrate (không chỉ modules có GENERATED)
  → Sort priority:
      1. Modules có GENERATED ACs (nhiều nhất lên đầu) — cần confirm khẩn
      2. Modules không có GENERATED (cuối queue) — review accuracy

Từ REVIEW-PROGRESS.md (nếu có — resume):
  → modules đã REVIEWED → bỏ khỏi queue
  → modules DEFERRED → xếp cuối queue
  → current_module → resume từ đây

// Step 3: Show intro summary
"📋 BA REVIEW MODE — Full URS Review
══════════════════════════════════════════════
Phạm vi: {TOTAL} modules | {US_TOTAL} User Stories | {G} GENERATED ACs cần confirm
{nếu resume: "Tiếp tục từ: {current_module} ({X}/{TOTAL} modules đã xử lý)"}

REVIEW bao gồm:
  ① Confirm/sửa GENERATED ACs (AI-invented — cần BA xác nhận)
  ② Kiểm tra accuracy toàn bộ US (AI có hiểu đúng intent không?)
  ③ Enrich inline: priority, NFR, US bị thiếu

Commands (gõ bất kỳ lúc nào):
─── AC Commands (Acceptance Criteria) ───────────────
  OK                        → Confirm toàn bộ module (GENERATED + accuracy)
  OK [US-xxx]               → Confirm tất cả ACs của US đó
  OK [AC-xxx]               → Confirm 1 AC cụ thể
  SỬA AC [AC-xxx]: [text]   → Sửa nội dung AC (format: Given/When/Then)
  BỎ AC [AC-xxx]            → Xóa AC (US vẫn giữ ≥ 2 ACs tự động)
  THÊM AC [US-xxx]: [text]  → Thêm AC mới cho US
─── US Commands (User Stories) ──────────────────────
  SỬA US [US-xxx] TITLE: [text]      → Đổi tên US
  SỬA US [US-xxx] PRIORITY: [level]  → Đổi priority (Must/Should/Could/Won't)
  SỬA US [US-xxx] WANT: [text]       → Sửa "I want" intent
  BỎ US [US-xxx]                     → Xóa toàn bộ US (sai hoàn toàn)
  THÊM US: As a [role] / I want [x] / So that [y]  → Thêm US bị thiếu
  FLAG US [US-xxx]: [lý do]          → Đánh dấu conversion error (cần rewrite)
  NFR: [text]                        → Thêm NFR cho module
─── Navigation ───────────────────────────────────────
  NEXT                      → Bỏ qua module (deferred — review sau)
  BACK                      → Quay lại module trước để sửa
  REVIEW [MOD]              → Nhảy đến module cụ thể (VD: REVIEW WMS)
  SUMMARY                   → Xem thống kê hiện tại
  PAUSE / DỪNG              → Lưu tiến độ và dừng
  HELP                      → Xem lại commands này

Bắt đầu với module: {module-name} ({N_GEN} GENERATED ACs | {N_US} US)
══════════════════════════════════════════════"
```

---

### BR-2: Module Review Loop

**Với mỗi module trong review queue — lặp lại cho đến khi hết hoặc PAUSE:**

#### Bước A — Load và hiển thị module

```
mc_load({ filePath: "{SYS}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 3 })

→ Format TÓM TẮT 2 sections — KHÔNG paste full markdown:

"──────────────────────────────────────────────
📦 Module {MOD} — {N_GEN} GENERATED ACs | {K} US tổng | {K_GEN} US có GENERATED
   Tiến độ: {X}/{TOTAL} modules | {C} ACs confirmed hôm nay
──────────────────────────────────────────────

⚠️  SECTION 1 — GENERATED ACs (AI-invented, cần confirm):
────────────────────────────────────────────
{Chỉ show US có GENERATED ACs — skip nếu không có}

[US-{MOD}-001] {Tên US}  [Priority: Must]  ⚠️ GENERATED
  AC-01 ({AC-ID}): Given {context} / When {action} / Then {result}
  AC-02 ({AC-ID}): Given {context} / When {action} / Then {result}

[US-{MOD}-003] {Tên US}  [Priority: Should]  ⚠️ GENERATED
  AC-01 ({AC-ID}): Given {context} / When {action} / Then {result}

{Nếu không có GENERATED: "✅ Không có GENERATED ACs trong module này"}

📋  SECTION 2 — Tất cả US (kiểm tra accuracy conversion):
────────────────────────────────────────────
{Show TẤT CẢ US — kể cả US không có GENERATED — để BA verify AI hiểu đúng không}
{Format ngắn: chỉ title + priority + AC count; không show full AC text}

[US-{MOD}-001] {Tên US}  [Priority: Must]  — {N} ACs  ⚠️ has GENERATED
[US-{MOD}-002] {Tên US}  [Priority: Should] — {N} ACs  ✅ converted
[US-{MOD}-003] {Tên US}  [Priority: Must]  — {N} ACs  ⚠️ has GENERATED
[US-{MOD}-004] {Tên US}  [Priority: Could]  — {N} ACs  ✅ converted
...

{Nếu muốn xem full ACs của 1 US cụ thể: gõ "XEM US-{MOD}-002"}

──────────────────────────────────────────────
Trả lời: OK để accept tất cả, hoặc dùng commands.
Gõ HELP để xem danh sách commands đầy đủ.
──────────────────────────────────────────────"

→ Batch size: tối đa 10 US mỗi lần hiển thị (cả 2 sections gộp lại)
   Nếu module > 10 US → chia batch, sau mỗi batch hỏi:
   "Tiếp tục {N} US tiếp theo? [OK] hoặc [commands]"
→ US đã REVIEWED trong session trước → show "(✅ reviewed)" sau title, skip Section 1
```

#### Bước B — Parse user input

```
Nhận reply từ user → parse thành danh sách actions:

─── AC-level commands (Acceptance Criteria) ─────────────────────────

  "OK"
    → action: CONFIRM_ALL_MODULE (confirm tất cả GENERATED + accept toàn bộ US)

  "OK US-WMS-001"
    → action: CONFIRM_US { us_id: "US-WMS-001" }
      (confirm tất cả GENERATED ACs của US đó)

  "OK AC-WMS-001-01"
    → action: CONFIRM_AC { ac_id: "AC-WMS-001-01" }

  "SỬA AC-WMS-001-01: Given form / When nhập / Then bắt buộc ngày"
    → action: MODIFY_AC { ac_id: "AC-WMS-001-01", new_text: "..." }

  "BỎ AC-WMS-003-02"
    → action: REMOVE_AC { ac_id: "AC-WMS-003-02" }

  "THÊM AC US-WMS-005: Given dashboard / When filter / Then hiển thị hôm nay"
    → action: ADD_AC { us_id: "US-WMS-005", text: "..." }
  [NOTE: backward-compat — "THÊM US-WMS-005: ..." (không có từ AC) cũng parse được]

─── US-level commands (User Stories) ────────────────────────────────

  "SỬA US US-WMS-002 TITLE: Quản lý phiếu nhập kho"
    → action: MODIFY_US_TITLE { us_id: "US-WMS-002", new_title: "..." }

  "SỬA US US-WMS-002 PRIORITY: Must"
    → action: MODIFY_US_PRIORITY { us_id: "US-WMS-002", priority: "Must" }
    → priority values: Must / Should / Could / Won't

  "SỬA US US-WMS-002 WANT: xem danh sách hàng tồn kho theo vị trí"
    → action: MODIFY_US_WANT { us_id: "US-WMS-002", new_want: "..." }

  "BỎ US US-WMS-007"
    → action: REMOVE_US { us_id: "US-WMS-007" }
    → [SAFETY] Nếu module còn ≥ 2 US sau khi xóa → OK
    → [SAFETY] Nếu module còn < 2 US → warning + yêu cầu confirm thêm

  "THÊM US: As a kho trưởng / I want xuất báo cáo tồn kho / So that kiểm soát hàng tháng"
    → action: ADD_US { role: "...", want: "...", so_that: "..." }
    → Auto-assign US ID tiếp theo trong module

  "FLAG US US-WMS-003: AI hiểu sai — đây là import, không phải export"
    → action: FLAG_US { us_id: "US-WMS-003", reason: "..." }
    → Đánh dấu ⚠️ CONVERSION-ERROR để rewrite sau

  "NFR: Thời gian load danh sách < 2 giây với 10,000 SKUs"
    → action: ADD_NFR { text: "..." }
    → Thêm vào NFR section của URS module

  "XEM US-WMS-002"
    → action: SHOW_US_DETAIL { us_id: "US-WMS-002" }
    → Hiển thị full AC text của US đó (read-only, không thay đổi state)

─── Navigation ───────────────────────────────────────────────────────

  Mixed (nhiều actions trên 1 dòng, ngăn cách bằng ";"):
  "OK US-WMS-001; SỬA AC-WMS-002-01: ...; BỎ AC-WMS-003-02; SỬA US US-WMS-004 PRIORITY: Must"
    → [CONFIRM_US, MODIFY_AC, REMOVE_AC, MODIFY_US_PRIORITY] → apply tuần tự

  "NEXT"       → action: DEFER_MODULE
  "PAUSE"      → action: PAUSE_REVIEW
  "BACK"       → action: BACK_TO_PREVIOUS_MODULE
  "REVIEW WMS" → action: JUMP_TO_MODULE { mod: "WMS" }
  "SUMMARY"    → action: SHOW_STATS (không thay đổi state)
  "HELP"       → action: SHOW_HELP

─── Disambiguation rules ─────────────────────────────────────────────
  "BỎ AC-xxx"  → REMOVE_AC (prefix AC-)
  "BỎ US-xxx"  → REMOVE_US (prefix US- nhưng không có AC dash pattern)
  "SỬA AC-xxx" → MODIFY_AC
  "SỬA US-xxx TITLE/PRIORITY/WANT" → MODIFY_US_*
  "THÊM AC US-xxx" hoặc "THÊM US-xxx" → ADD_AC
  "THÊM US: As a..." → ADD_US (không có ID number)

Nếu input không rõ → hiển thị lại commands + hỏi lại:
  "Không nhận ra command. Gõ HELP để xem danh sách."
  (Không tự đoán — tránh áp dụng sai action)
```

#### Bước C — Apply actions vào URS file

```
Gộp TẤT CẢ changes của module này → apply 1 lần duy nhất (BATCH-APPLY):

─── AC-level actions ────────────────────────────────────────────────

Với CONFIRM (OK / OK US-xxx / OK AC-xxx):
  → Xóa "⚠️ **GENERATED**" tag khỏi AC section của US được confirm
  → Xóa "**Review needed:** Yes" khỏi mỗi AC được confirm
  → Thêm "✅ **Reviewed:** {date}" vào dòng ngay sau "#### Acceptance Criteria"
  → Nội dung AC KHÔNG thay đổi

Với MODIFY_AC (SỬA AC-xxx: ...):
  → Replace toàn bộ nội dung dòng AC đó với text mới (Given/When/Then)
  → Xóa "⚠️ **GENERATED**" tag (BA đã review và sửa = confirmed)
  → Thêm "✏️ **BA Modified:** {date}" thay thế GENERATED tag

Với REMOVE_AC (BỎ AC-xxx):
  → Xóa toàn bộ AC block đó
  → [SAFETY CHECK] Đếm ACs còn lại của US đó:
      Nếu còn ≥ 2 ACs → OK, tiếp tục
      Nếu còn < 2 ACs → AUTO-GENERATE 1 AC replacement từ context (US Want + So that)
        → Mark với "⚠️ **GENERATED (auto-replacement):**"
        → Show inline warning: "⚠️ Auto-generated 1 AC thay thế cho {US-xxx} — cần review"

Với ADD_AC (THÊM AC US-xxx: ...):
  → Thêm AC block mới vào cuối AC section của US đó
  → Auto-assign ID: AC-{MOD}-{US-NNN}-{next-XX} (increment từ ID cao nhất hiện có)
  → Mark với "✅ **BA Added:** {date}" (không cần GENERATED tag — BA tự viết)
  → Ghi vào REVIEW-PROGRESS: "added_ac: {ID}"

─── US-level actions ────────────────────────────────────────────────

Với MODIFY_US_TITLE (SỬA US US-xxx TITLE: ...):
  → Replace dòng "**Title:**" của US đó với title mới
  → Thêm "✏️ **BA Modified Title:** {date}" inline sau title
  → Ghi vào REVIEW-PROGRESS: "us_modified: {ID} (title)"

Với MODIFY_US_PRIORITY (SỬA US US-xxx PRIORITY: ...):
  → Replace dòng "**Priority:**" của US đó với level mới (Must/Should/Could/Won't)
  → Thêm "✏️ **BA Modified Priority:** {date}" inline
  → Ghi vào REVIEW-PROGRESS: "us_modified: {ID} (priority)"

Với MODIFY_US_WANT (SỬA US US-xxx WANT: ...):
  → Replace phần "I want [...]" trong US description với text mới
  → Thêm "✏️ **BA Modified Want:** {date}" inline
  → Ghi vào REVIEW-PROGRESS: "us_modified: {ID} (want)"

Với REMOVE_US (BỎ US US-xxx):
  → [SAFETY CHECK] Đếm US còn lại sau khi xóa:
      Nếu module còn ≥ 2 US → OK, xóa toàn bộ US block (title + ACs)
      Nếu module còn < 2 US → hiển thị warning:
        "⚠️ Module {MOD} sẽ còn {N-1} US sau khi xóa.
         Xác nhận? [YES để tiếp tục] [NO để hủy]"
  → Sau khi xóa: ghi vào REVIEW-PROGRESS "us_removed: {ID}"

Với ADD_US (THÊM US: As a ... / I want ... / So that ...):
  → Auto-assign US ID: US-{MOD}-{next-NNN} (increment từ ID cao nhất hiện có)
  → Tạo US block đầy đủ với:
      Title: {want text ngắn gọn — AI tự tóm tắt}
      Priority: Should (default — BA có thể sửa bằng MODIFY_US_PRIORITY)
      Role / Want / So That từ input
      ACs: rỗng — BA tự thêm hoặc để /mcv3:requirements enrich
  → Mark với "➕ **BA Added:** {date}"
  → Ghi vào REVIEW-PROGRESS: "us_added: {ID}"

Với FLAG_US (FLAG US US-xxx: reason):
  → Thêm "⚠️ **CONVERSION-ERROR:** {reason} — Cần rewrite" vào đầu US block
  → KHÔNG xóa US (vẫn giữ để có reference)
  → Ghi vào REVIEW-PROGRESS: "us_flagged: {ID} reason: {reason}"
  → Ghi vào module notes: "[REWRITE-NEEDED] {ID}: {reason}"

Với ADD_NFR (NFR: text):
  → Tìm section "## Non-Functional Requirements" trong URS file
  → Nếu có: append NFR entry mới với ID NFR-{next-NNN}
  → Nếu không có: tạo section mới trước "## Appendix" (hoặc cuối file)
  → Mark với "➕ **BA Added:** {date}"
  → Ghi vào REVIEW-PROGRESS: "nfr_added: NFR-{NNN}"
```

#### Bước D — Post-Save Verification (sau mỗi module)

```
// Bước 1: Save file (1 lần duy nhất cho toàn bộ batch changes của module)
mc_save({ filePath: "{SYS}/P1-REQUIREMENTS/URS-{MOD}.md" })

// Bước 2: Self-verify integrity (inline check — không cần mc_validate full)
Kiểm tra:
  ✓ Mỗi US vẫn có ≥ 2 ACs (kể cả auto-generated replacement)
  ✓ AC IDs vẫn có đúng format {MOD}-NNN-XX (không broken format sau edit)
  ✓ Không còn orphan "**Review needed:** Yes" trên ACs đã confirmed
  ✓ DEPENDENCY MAP của URS có "BA Reviewed: partial/complete" trong Status line
  ✓ Không có ID duplicate sau khi ADD mới

→ Nếu phát hiện lỗi → auto-fix (silent) → re-save (1 lần retry)
→ Nếu vẫn lỗi sau retry → ghi "[VERIFY-WARN]" vào REVIEW-PROGRESS + tiếp tục

// Bước 3: Update REVIEW-PROGRESS.md
{module}: {status} | confirmed: {C} | modified: {M} | removed: {R} | added: {A} | deferred: {D}

// Bước 4: mc_checkpoint per module (RISK-003 — không mất tiến độ)
mc_checkpoint({
  label: "ba-review-module-{MOD}-done",
  sessionSummary: "BA Review {MOD}: {C} confirmed, {M} modified, {R} removed. Còn {X} modules.",
  nextActions: ["Tiếp tục BA Review: module {NEXT-MOD} ({N} GENERATED ACs)"]
})

// Bước 5: Show inline progress (ngắn gọn — 1 dòng)
"✅ {MOD} done: {C} confirmed | {M} modified | {R} removed | {A} added
 → Tiếp theo: {NEXT-MOD} ({N} ACs)"
```

#### Bước E — PAUSE / DỪNG

```
Khi user gõ "PAUSE" hoặc "DỪNG":

// 1. Save REVIEW-PROGRESS state đầy đủ
mc_save({
  filePath: "_mcv3-work/migration/REVIEW-PROGRESS.md",
  content: review_progress_with_full_stats
})

// 2. Checkpoint với đủ context để resume
mc_checkpoint({
  label: "ba-review-paused-at-{MOD}",
  sessionSummary: "BA Review tạm dừng: {X}/{TOTAL} modules done. Tiếp tục tại {CURRENT-MOD}.",
  nextActions: [
    "Resume BA Review: gọi /mcv3:migrate → chọn [1] BA Review",
    "Modules còn lại: {list-pending-modules}"
  ]
})

// 3. Show pause summary
"💾 Đã lưu tiến độ BA Review.
══════════════════════════════════════════════
Đã review: {X}/{TOTAL} modules ({C} ACs confirmed hôm nay)
Chưa review: {list-pending-with-AC-counts}
Deferred: {list-deferred}

Resume: gọi /mcv3:migrate → chọn [1] BA Review
══════════════════════════════════════════════"
```

---

### BR-3: Post-Review Verification (Quality Gate trước khi transition)

**Chạy sau khi tất cả modules đã REVIEWED hoặc DEFERRED (không còn PENDING):**

```
// Step 1: Validate tất cả URS files đã modify — PARALLEL
PARALLEL (foreach reviewed module):
  mc_validate({ filePath: "{SYS}/P1-REQUIREMENTS/URS-{MOD}.md", validationType: "format" })

// Step 2: Cross-module integrity checks
Kiểm tra:
  ✓ Không có US nào còn < 2 ACs sau tất cả removals
  ✓ AC IDs không có duplicate cross-module (edge case: add AC với ID trùng)
  ✓ Tất cả auto-generated replacements được flag rõ trong REVIEW-PROGRESS
  ✓ Deferred modules không > 40% tổng: nếu vượt → warning "Nhiều modules deferred,
    sẽ có GENERATED items vào Phase 5 — cân nhắc review thêm trước /mcv3:tech-design"

// Step 3: Update MIGRATION-REPORT REVIEW-STATUS section
mc_load({ filePath: "_mcv3-work/migration/MIGRATION-REPORT.md", layer: 3 })
→ Cập nhật section "## REVIEW-STATUS" với final stats
→ mc_save()

// Step 4: Final checkpoint
mc_checkpoint({
  label: "ba-review-complete",
  sessionSummary: "BA Review hoàn tất: {X} confirmed, {Y} modified, {Z} removed, {D} deferred.",
  nextActions: ["Tiếp tục /mcv3:requirements để enrich URS (NFRs, priorities, deferred items)"]
})

Nếu có lỗi từ mc_validate:
  → Auto-fix lỗi đơn giản (format, whitespace)
  → Flag lỗi phức tạp trong completion report với "[VERIFY-WARN]"
  → Không block transition
```

---

### BR-4: Review Completion Report

```
══════════════════════════════════════════════
✅ BA REVIEW HOÀN THÀNH
══════════════════════════════════════════════

📊 Kết quả review — Acceptance Criteria:
  ✅ Confirmed (không thay đổi):     {X} ACs ({X_pct}%)
  ✏️ Modified (BA sửa nội dung):     {Y} ACs
  ❌ Removed (đã xóa):               {Z} ACs
  ➕ Added (BA thêm mới):             {A} ACs
  ⏭️ Deferred (để sau):              {D} ACs — {D_MOD} modules
  ⚠️ Auto-replaced (safety):         {K} ACs (GENERATED — cần review thêm)

📊 Kết quả review — User Stories:
  ✏️ Modified title/priority/want:   {U_M} US
  ❌ Removed (AI hiểu sai hoàn toàn): {U_R} US
  ➕ Added (thiếu trong source):      {U_A} US
  ⚠️ Flagged (CONVERSION-ERROR):     {U_F} US — cần rewrite
  ➕ NFRs thêm mới:                   {N_NFR} entries

📁 Modules đã review ({R}/{TOTAL}):
  ✅ {MOD-1}: {C} ACs confirmed | {M} ACs modified | {U_M} US edited
  ✅ {MOD-2}: ...

📁 Modules deferred — chưa review ({D_MOD}):
  ⏭️ {MOD-X}: {N} GENERATED ACs + {U} US chưa verify accuracy
  (Nếu rỗng: "Tất cả modules đã review ✅")

{nếu có VERIFY-WARN}:
⚠️ Verification Warnings:
  - [VERIFY-WARN-001]: {mô tả issue — không block nhưng nên check}

{nếu có CONVERSION-ERROR flags}:
⚠️ US cần rewrite ({U_F} US):
  - {US-xxx}: {lý do flag}
  - {US-yyy}: {lý do flag}
  → Rewrite bằng command: "SỬA US {ID} WANT: ..." hoặc "BỎ US {ID}" + "THÊM US: ..."

══════════════════════════════════════════════
🔜 BƯỚC TIẾP THEO (THEO THỨ TỰ):

{nếu có deferred hoặc CONVERSION-ERROR}:
   ⚠️ ① Còn việc trong BA Review:
      • {D_MOD} modules deferred chưa review
      • {U_F} US flagged cần rewrite
      → Gọi lại /mcv3:migrate → [1] BA Review để tiếp tục

② /mcv3:tech-design — Thiết kế kỹ thuật từ URS đã review
   [Không cần /mcv3:requirements — URS đã đầy đủ sau BA Review]

{nếu deferred > 40%}:
   ⚠️ Lưu ý: {D_MOD}/{TOTAL} modules deferred — nhiều US chưa verify accuracy.
      Cân nhắc review thêm trước /mcv3:tech-design.
══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Review thêm modules deferred / rewrite US flagged?
   [2] Xem chi tiết URS module nào?
   [3] OK → /mcv3:tech-design
══════════════════════════════════════════════
```

---

### BR-5: REVIEW-PROGRESS.md Format

File tracking review state — lưu tại `_mcv3-work/migration/REVIEW-PROGRESS.md`:

```markdown
# REVIEW-PROGRESS
**Project:** {slug}
**Started:** {date}
**Last Updated:** {date}

## Summary
| Metric | Value |
|--------|-------|
| Total modules | {N} |
| Reviewed | {X} |
| Deferred | {D} |
| Pending | {P} |
| ACs Confirmed | {C} |
| ACs Modified | {M} |
| ACs Removed | {R} |
| ACs Added | {A} |
| ACs Auto-replaced | {K} |
| US Modified | {U_M} |
| US Removed | {U_R} |
| US Added | {U_A} |
| US Flagged (CONVERSION-ERROR) | {U_F} |
| NFRs Added | {N_NFR} |

## Module Status
| Module | Status | AC-Confirmed | AC-Modified | AC-Removed | AC-Added | US-Modified | US-Removed | US-Added | US-Flagged | Deferred-ACs |
|--------|--------|-------------|-------------|------------|----------|-------------|------------|----------|------------|--------------|
| WMS | REVIEWED | 31 | 3 | 2 | 1 | 2 | 0 | 0 | 1 | 0 |
| TMS | DEFERRED | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 28 |
| FIN | PENDING | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 20 |

## Flagged US (CONVERSION-ERROR)
| US-ID | Module | Reason | Status |
|-------|--------|--------|--------|
| US-WMS-007 | WMS | AI hiểu sai — đây là import không phải export | PENDING-REWRITE |

## Verify Warnings
- [VERIFY-WARN-001]: {module} — {mô tả issue}
(rỗng nếu không có warning)

## Change Log
- {datetime} | WMS | 31 AC-confirmed, 3 AC-modified, 2 AC-removed, 1 AC-added, 2 US-modified, 1 US-flagged
- {datetime} | TMS | deferred — BA sẽ review sau với stakeholder
- {datetime} | PAUSE | dừng tại FIN, resume lần sau
```

---

### BR-6: Quy tắc vận hành BA Review Mode

```
TRIGGER-AUTO:    Detect checkpoint "ba-review-paused" khi resume → tự động hỏi tiếp tục
                 Detect checkpoint "migration-complete" + MIGRATION-REPORT.md → Entry Guard hỏi [1] BA Review
FULL-SCOPE:      Review ALL modules (không chỉ GENERATED-heavy) — accuracy + completeness
MODULE-FIRST:    Luôn review theo module — không show từng AC/US lẻ nếu chưa load module
2-SECTION:       Mỗi module hiển thị 2 sections: ⚠️ GENERATED (urgent) → 📋 ALL US (accuracy)
BATCH-APPLY:     Gộp tất cả changes của 1 module → 1 mc_save duy nhất (tránh save nhiều lần)
MINIMUM-ACS:     BỎ AC làm US < 2 ACs → auto-generate replacement + flag GENERATED
MINIMUM-US:      BỎ US làm module < 2 US → warning + yêu cầu user confirm thêm
POST-SAVE-CHECK: Verify integrity sau mỗi mc_save (không để lỗi accumulate sang module sau)
CHECKPOINT-PER:  mc_checkpoint sau mỗi module (RISK-003) — không chờ đến PAUSE
AUDIT-TRAIL:     Mọi action (AC/US confirm/modify/remove/add/flag/defer) ghi vào REVIEW-PROGRESS.md
UNKNOWN-CMD:     Input không rõ → hiển thị lại HELP, KHÔNG tự đoán action
DEFERRED-WARN:   Deferred > 40% tổng modules → cảnh báo rõ trong completion report
FLAG-DONT-DELETE: FLAG US không xóa US — giữ reference, chờ BA rewrite hoặc BỎ US
NO-BLOCK:        Deferred + Flagged US không block transition sang /mcv3:tech-design
NO-REQUIREMENTS: Sau BA Review đầy đủ → KHÔNG cần /mcv3:requirements
                 /mcv3:requirements chỉ dùng khi URS chưa tồn tại (dự án từ đầu)
BACK-ALLOWED:    User có thể BACK để sửa lại module vừa review (re-open và re-save)
COMPAT-THÊM:     "THÊM US-xxx: ..." (không có từ AC) vẫn parse được như ADD_AC (backward-compat)
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
