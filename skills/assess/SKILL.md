# Assess Skill — `/mcv3:assess`

## Mục đích

Đánh giá toàn diện **dự án đang phát triển dở** và tích hợp vào MCV3 workflow.
Khi có:
- Codebase đang chạy nhưng thiếu hoặc không có tài liệu
- Tài liệu cũ chưa đồng bộ với code hiện tại
- Muốn biết dự án đang ở phase nào trong MCV3 pipeline
- Cần roadmap cụ thể để hoàn thiện documentation

---

## DEPENDENCY MAP

```
Requires:
  - Dự án đã tồn tại (codebase, docs, hoặc cả hai)
  - mc_init_project (nếu chưa có project MCV3 — sẽ tự hỏi)
Produces:
  - PROJECT-MANIFEST.md (danh sách systems, modules, assets hiện có)
  - ASSESSMENT-MATRIX.md (per-system phase status + gaps)
  - GAP-REPORT.md (tổng hợp critical/warning/info gaps)
  - SYNC-REPORT.md (so sánh code vs docs — nếu có cả hai)
  - REMEDIATION-PLAN.md (action plan ưu tiên + skill routing)
  - .mc-data/ structure với per-system phase đúng
Enables:
  - Tất cả skills trong MCV3 pipeline (dựa trên gaps tìm thấy)
  - /mcv3:migrate (nếu cần import docs cũ)
  - /mcv3:requirements, /mcv3:tech-design, ... (nếu cần bổ sung)
Agents: orchestrator, domain-expert, tech-expert, doc-writer, verifier
MCP Tools:
  - mc_init_project, mc_status, mc_save, mc_list
  - mc_validate, mc_traceability, mc_snapshot, mc_checkpoint
  - mc_impact_analysis, mc_search
References:
  - skills/assess/references/assessment-checklist.md
  - skills/assess/references/code-patterns-detection.md
  - skills/assess/references/sync-check-rules.md
  - skills/assess/references/project-type-guides.md
```

---

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0 init | mc_status → mc_list (sequential) | mc_status ∥ mc_list song song | ~1 round-trip |
| Phase 1 scan + classify | Scan codebase → classify docs (sequential) | mc_list ∥ Glob/Read scan song song | ~1 round-trip |
| Phase 2 per-system save | mc_save → mc_checkpoint (sequential) | mc_save → [mc_validate ∥ mc_checkpoint] | ~1 round-trip / system |
| Phase 3-4 report saves | mc_save → sequential validate | mc_save → [mc_validate ∥ mc_checkpoint] | ~1 round-trip / report |
| Phase 6 post-assess | mc_snapshot → mc_checkpoint (sequential) | Snapshot sau đó checkpoint | — (phụ thuộc) |

### Cache Rules

```
✅ PROJECT-MANIFEST: Load 1 lần ở Phase 1, tái dùng trong Phase 2+ (không load lại)
✅ mc_list kết quả: Phase 0 → Phase 1 dùng cùng 1 kết quả (không gọi lại)
✅ Per-system parallel: Assess nhiều systems độc lập có thể song song → sequential save
```

### Quy tắc áp dụng

```
✅ Parallel scan: Glob/Read scan codebase + mc_list classify docs = 1 round
✅ Post-save parallel: mc_validate và mc_checkpoint chạy song song sau mc_save
✅ Multi-system: assess systems độc lập song song; save kết quả tuần tự (an toàn hơn)
✅ No re-validation: Nếu validate PASS ở Phase X → Pre-Completion chỉ confirm, không re-run
```

---

## CHẾ ĐỘ VẬN HÀNH — Type C (Hybrid)

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`) — **Type C: Hybrid**:
1. **Nhận input ban đầu** — cần mô tả dự án hoặc path codebase/docs từ user (1 lần); nếu đã có đủ trong message → bắt đầu ngay
2. **Tự động sau khi có input** — tự detect project type (A/B/C/D), tự scan codebase/docs, không hỏi thêm
3. **Tự giải quyết vấn đề** — tự classify docs/code vào đúng phases, ghi DECISION khi ambiguous
4. **Báo cáo sau khi xong** — PROJECT-MANIFEST + ASSESSMENT-MATRIX + GAP-REPORT + REMEDIATION-PLAN
5. **User review** — user xem REMEDIATION-PLAN và chọn action
6. **Gợi ý bước tiếp** — Skill phù hợp theo gap type

---

## Khi nào dùng skill này

- Nhận bàn giao dự án đang chạy từ team khác
- Codebase đã có nhưng chưa có tài liệu MCV3
- Muốn biết documentation còn thiếu gì so với code
- Trước khi dùng `/mcv3:evolve` — cần biết baseline hiện tại
- Muốn onboard MCV3 cho dự án production đang hoạt động

---

## Phase 0 — Auto Project Type Detection

Tự detect project type từ context — không hỏi user:

```
Auto-detect logic:
  1. PARALLEL (nếu project đã tồn tại):
     - mc_status()              → xác nhận project, lấy slug
     - mc_list({ projectSlug }) → liệt kê docs hiện có trong .mc-data/
     [Kết quả mc_list tái dùng ở Phase 1b — KHÔNG gọi lại]
     Nếu chưa có project → mc_status() trước, rồi mc_init_project nếu cần
  2. Scan thư mục hiện tại:
     Code dirs (bất kỳ 1 trong số): src/ | app/ | lib/ | backend/ | api/ | cmd/ | internal/
     → code exists
     Docs dirs (bất kỳ 1 trong số): .mc-data/ | docs/ | doc/ | documents/ | specs/ | requirements/
     → docs exists
     Production signals: Dockerfile + (.env.production | docker-compose.prod.yml | k8s/ | terraform/)
     → production system
  3. Auto-classify:
     - Có code, không có docs → Type A (code only)
     - Có docs, không có code → Type B (docs only)
     - Có cả code lẫn docs → Type C (both, check for drift)
     - Type C + production signals → Type D (production formalization)
     - **BLOCKING context:** Không có code VÀ không có docs VÀ user chưa cung cấp thông tin gì → DỪNG, hỏi: `"Mô tả dự án cần assess (codebase path, docs có sẵn, hoặc mô tả tổng quan)."`
     - **WARNING context:** Không detect được cấu trúc rõ ràng nhưng user đã cung cấp mô tả → ghi DECISION, flag "⚠️ Non-standard structure" trong PROJECT-MANIFEST, tiếp tục assess với thông tin hiện có
  4. Verify detection — ghi vào DECISION-LOG:
     "Type Detection: Type {X} | code dir={path} | docs dir={path} | production={yes/no}"
     Confidence: HIGH (rõ ràng) / MEDIUM (1 trong 2 không chắc) / LOW (cả hai không chắc)
     Confidence LOW → note vào Completion Report "📋 CẦN USER REVIEW: Verify project type {X}"

Tên dự án + domain: lấy từ message của user hoặc từ project name trong mc_status()
→ Không hỏi lại nếu đã có trong context
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu scan, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-assess",
  sessionSummary: "Chuẩn bị chạy /mcv3:assess — đánh giá dự án in-progress",
  nextActions: ["Tiếp tục /mcv3:assess — Phase 1: Project Structure Discovery"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu assessment..."

> **Lưu ý:** Checkpoint này phục vụ **session resume**. Snapshot (step 6d, cuối assess) phục vụ **rollback data** — cả hai cần thiết, không thay thế nhau.

---

## Phase 1 — Project Structure Discovery

### 1a. Scan codebase (nếu có code) — song song với 1b

```
PARALLEL với Phase 1b (classify docs):
  Scan codebase (Glob/Read) + mc_list classify docs = 1 round duy nhất

Tự động scan — không hỏi phương pháp:
1. Chạy ./scripts/scan-codebase.sh (nếu có) → manifest.json
2. Nếu không có script → dùng Glob/Read để detect cấu trúc
3. Detect tech stack từ package.json / requirements.txt / go.mod / Gemfile
4. Detect modules từ controller/service file names
→ Ghi nhận kết quả vào PROJECT-MANIFEST draft
```

Từ output scan, tôi detect:
```
Tech Stack Detection:
  - package.json → Node.js/TypeScript/Express/NestJS
  - requirements.txt / pyproject.toml → Python/FastAPI/Django
  - pom.xml / build.gradle → Java/Spring Boot
  - go.mod → Golang/Gin/Echo
  - Gemfile → Ruby on Rails

Structure Detection:
  - src/*/controllers/ → REST API system
  - src/*/services/ → Service layer
  - src/*/repositories/ hoặc models/ → Data layer
  - db/migrations/ → Database migrations
  - tests/ hoặc __tests__/ → Test files
  - Mono-repo (packages/) vs Multi-system (src/{sys}/)

Module Detection:
  - Mỗi sub-directory trong src/ = 1 module candidate
  - Controller filenames → module names
  - Route prefixes → API modules
```

### 1b. Classify docs (nếu có docs) — song song với 1a

```
Tự động detect docs — không hỏi user:
1. [REUSE kết quả mc_list từ Phase 0 — KHÔNG gọi mc_list lần thứ 2]
   → liệt kê docs đã có trong .mc-data/
2. Glob/Read các thư mục docs/ hoặc đường dẫn user đề cập trong message
3. Classify mỗi file thuộc phase nào trong MCV3:
   VD:
     BRD.docx → Phase 3: Business Docs
     API_Spec.xlsx → Phase 5: Tech Design
     Test_Plan.md → Phase 6: QA
     user_manual.pdf → Phase 6: QA Docs
4. Nếu user cung cấp danh sách files trong message → dùng ngay, không hỏi lại
```

### 1c. Tạo PROJECT-MANIFEST

```markdown
# PROJECT-MANIFEST — {Dự án}
**Ngày assess:** {date}
**Loại dự án:** {A/B/C/D}

## Systems phát hiện
| System Code | Tên | Tech Stack | Source |
|-------------|-----|-----------|--------|
| {SYS} | {Name} | {stack} | {detected-from} |

## Modules per System
| System | Module | Source files | Doc files |
|--------|--------|-------------|-----------|
| {SYS} | {MOD} | {list} | {list} |

## Existing Assets Summary
| Phase | Có gì | Chất lượng | Ghi chú |
|-------|-------|-----------|---------|
| Phase 1-2 | {docs} | {quality} | |
| Phase 3 | {docs} | {quality} | |
| Phase 4 | {docs} | {quality} | |
| Phase 5 | {docs} | {quality} | |
| Phase 6 | {docs} | {quality} | |
| Phase 7 | {code} | {quality} | |
| Phase 8 | {docs} | {quality} | |
```

```
mc_save({
  filePath: "_mcv3-work/assessment/PROJECT-MANIFEST.md",
  documentType: "custom"
})
→ Sau khi save: PARALLEL [mc_validate ∥ mc_checkpoint({ label: "assess-phase1-manifest" })]
  [mc_validate trả về PASS → tiếp tục; FAIL → tự fix format trước khi sang Phase 2]
```

Tự verify PROJECT-MANIFEST trước khi sang Phase 2:
```
✓ Ít nhất 1 system được detect
  → Nếu 0 systems: log WARNING "non-standard structure", assess as single-system project
✓ Mỗi system có ít nhất 1 module (hoặc ghi rõ "modules: []" — không để trống/unknown)
✓ Tech stack xác định được (nếu không → ghi "unknown", tiếp tục bình thường)
✓ Multi-repo detected? → ghi DECISION: "Multi-repo: assess primary repo {path} trước, các repos khác list vào PROJECT-MANIFEST nhưng assess riêng"
```
→ Nếu pass: "✅ PROJECT-MANIFEST verified ({N} systems, {M} total modules). Sang Phase 2..."
→ Nếu 0 systems: "⚠️ Không phát hiện systems — treating toàn bộ codebase/docs như 1 system"

---

## Phase 2 — Per-System Assessment

Với **MỖI system/module** tìm thấy ở Phase 1:

### 2a. Đánh giá phase hiện tại

```
"Phân tích system {SYS}:

Phase 1 — Discovery:
  ✅/❌ PROJECT-OVERVIEW.md (hoặc tương đương)
  → Đánh giá: {done/partial/missing}

Phase 2 — Expert Analysis:
  ✅/❌ EXPERT-LOG.md hoặc architecture decisions
  → Đánh giá: {done/partial/missing}

Phase 3 — Business Docs:
  ✅/❌ Business rules document
  ✅/❌ Process flows
  ✅/❌ Data dictionary
  → Đánh giá: {done/partial/missing}

Phase 4 — Requirements:
  ✅/❌ User Stories / Use Cases
  ✅/❌ Acceptance Criteria
  ✅/❌ Non-functional requirements
  → Đánh giá: {done/partial/missing} [{N} requirements]

Phase 5 — Tech Design:
  ✅/❌ API specification
  ✅/❌ Database schema / ERD
  ✅/❌ Component design
  → Đánh giá: {done/partial/missing}

Phase 6 — QA & Docs:
  ✅/❌ Test cases
  ✅/❌ User guide
  ✅/❌ Admin guide
  → Đánh giá: {done/partial/missing}

Phase 7 — Code Gen:
  ✅/❌ Source code exists
  ✅/❌ REQ-ID comments (MCV3 format)
  ✅/❌ Test stubs
  → Đánh giá: {done/partial/missing}

Phase 8 — Verify:
  ✅/❌ Traceability matrix
  ✅/❌ Verification report
  → Đánh giá: {done/partial/missing}

→ Kết luận: System {SYS} đang ở Phase {N} (currentPhase: phase{N}-{label})"
```

**Quy tắc xác định currentPhase:**
```
currentPhase = phase CUỐI mà TẤT CẢ items đều ✅ done
⚠️ partial KHÔNG count là done

Ví dụ:
  Phase 1 ✅ | Phase 2 ✅ | Phase 3 ⚠️ partial | Phase 4 ❌
  → currentPhase = phase2-expert
  → Phase 3 ghi "IN-PROGRESS", Phase 4+ ghi "NOT STARTED"

Nếu Phase 7 (code) done nhưng Phase 3-4 missing:
  → currentPhase = phase7-code (phản ánh thực tế code đã có)
  → Phase 3-4 là GAPS cần bổ sung, KHÔNG phải "phase hiện tại thấp hơn"
  → Ghi DECISION: "Code-first project: phase7 done, docs phases 3-4 missing"
```

Tham chiếu: `references/assessment-checklist.md`

### 2b. Tạo ASSESSMENT-MATRIX

```markdown
# ASSESSMENT-MATRIX — {Dự án}

## System: {SYS-CODE} — {System Name}

| Phase | Mô tả | Status | Docs hiện có | Còn thiếu |
|-------|-------|--------|-------------|----------|
| Phase 1 | Discovery | ✅ done | PROJECT-OVERVIEW.md | — |
| Phase 2 | Expert | ❌ missing | — | EXPERT-LOG.md |
| Phase 3 | BizDocs | ⚠️ partial | {files} | DATA-DICTIONARY.md |
| Phase 4 | Requirements | ⚠️ partial | BRD.docx (unmigrated) | URS-{MOD}.md |
| Phase 5 | Tech Design | ✅ done | API_Spec.xlsx | MODSPEC-{MOD}.md |
| Phase 6 | QA | ❌ missing | — | TEST-{MOD}.md |
| Phase 7 | Code | ✅ done | src/{sys}/{mod}/ | REQ-ID comments |
| Phase 8 | Verify | ❌ missing | — | traceability-matrix |

**Kết luận currentPhase:** phase5-design
**Docs cần migrate:** BRD.docx, API_Spec.xlsx
**Docs cần tạo mới:** EXPERT-LOG, TEST-{MOD}
```

```
mc_save({
  filePath: "_mcv3-work/assessment/ASSESSMENT-MATRIX.md",
  documentType: "custom"
})

// RISK-003: Sau khi save — PARALLEL [mc_validate ∥ mc_checkpoint]
PARALLEL (2 calls đồng thời):
  mc_validate({ projectSlug, filePath: "_mcv3-work/assessment/ASSESSMENT-MATRIX.md" })
  mc_checkpoint({
    projectSlug: "<slug>",
    label: "assess-system-{SYS}-done",
    sessionSummary: "Assess: Đã hoàn thành system {SYS} — currentPhase: {phase}, {N} gaps",
    nextActions: ["Tiếp tục /mcv3:assess — assess system tiếp theo: {next-system} hoặc sang Phase 3 (Gap Analysis)"]
  })
// Lặp lại per-system parallel này sau mỗi system được assess

Cross-system consistency check (sau khi assess TẤT CẢ systems):
```
✓ System A MODSPEC reference System B APIs → System B currentPhase ≥ phase5-design
✓ Shared services (auth, notification, file) → currentPhase ≤ dependent systems
✓ Nếu có inconsistency → ghi DECISION và flag trong ASSESSMENT-MATRIX row tương ứng
```

### RISK-006: Large Project Batch Protocol (≥5 systems)

Khi dự án có ≥5 systems:
```
// Phát hiện tự động khi systems count ≥ 5
IF systems.length >= 5:
  "⚠️ Dự án lớn phát hiện: {N} systems — dùng batch assessment protocol."

  // Chia thành batches 3-4 systems
  Batch 1: [SYS1, SYS2, SYS3] → assess → checkpoint → tiếp tục
  Batch 2: [SYS4, SYS5, SYS6] → assess → checkpoint → tiếp tục
  ...

  // Checkpoint sau mỗi batch
  mc_checkpoint({
    label: "assess-batch-{N}-of-{TOTAL}",
    sessionSummary: "Assessment: Batch {N}/{TOTAL} hoàn thành — {systems} assessed",
    nextActions: ["Tiếp tục /mcv3:assess — Batch {N+1}: {systems-in-next-batch}"]
  })

  // Sau khi tất cả batches xong → cross-system consistency check toàn bộ
  → Không bỏ qua cross-system check kể cả đã checkpoint per-batch
```

Checkpoint sau Phase 2 (cho dự án lớn — có thể resume tại đây nếu session bị interrupt):
```
mc_checkpoint({
  projectSlug: {slug},
  label: "post-assessment-matrix",
  sessionSummary: "Phase 2 hoàn thành: {N} systems assessed, currentPhase per system recorded",
  nextActions: ["Tiếp tục /mcv3:assess — Phase 3: Gap Analysis"]
})
```

---

## Phase 3 — Gap Analysis

### 3a. Tổng hợp gaps từ tất cả systems

```
"📊 GAP ANALYSIS — {Dự án}

🔴 CRITICAL gaps (bắt buộc fix trước khi tiếp tục):
  1. {SYS}/P1-REQUIREMENTS/ trống — không có URS nào
     → Code tồn tại nhưng không có traceability
  2. Thiếu Formal IDs trong tất cả documents hiện có
     → Không thể validate hay trace requirements

⚠️ WARNING gaps (nên fix):
  3. DATA-DICTIONARY.md chưa có (entities chưa được define chính thức)
  4. Test coverage thấp: {N} ACs không có TC tương ứng
  5. MODSPEC chưa match API code ({M} endpoints thiếu spec)

ℹ️ INFO gaps (optional/tương lai):
  6. User Guide chưa có (có thể dùng /mcv3:qa-docs sau)
  7. NFR chưa được document (performance, security SLAs)

Summary: {N} critical, {M} warnings, {K} info"
```

### 3b. Detect gap categories

Theo `references/sync-check-rules.md`:

```
MISSING_DOCS: Code tồn tại nhưng không có tài liệu tương ứng
  - API endpoint không có MODSPEC entry
  - DB table không có DATA-DICTIONARY entry
  - Service method không trace về User Story nào

OUTDATED_DOCS: Docs tồn tại nhưng không match code
  - API spec có endpoint /v1/orders nhưng code dùng /v2/orders
  - DB schema có column `price` nhưng migration thêm `base_price`
  - URS mô tả flow khác với service logic

INCONSISTENT_DOCS: Docs conflict nhau
  - BIZ-POLICY nói "minimum order = 100k" nhưng URS nói "50k"
  - MODSPEC API có status PENDING nhưng TEST mô tả WAITING

MISSING_TRACEABILITY: IDs không được link
  - BR-WH-001 không có US nào trỏ về
  - US-WH-003 không có FT nào derive từ nó
  - FT-WH-007 không có TC test
```

Gap Deduplication — khi cùng gap type xuất hiện ở nhiều systems:
```
Gom vào 1 entry với list systems bị ảnh hưởng:
  VD: GAP-001: Thiếu URS — Systems bị ảnh hưởng: SYS-A, SYS-B, SYS-C
  → 1 action item trong REMEDIATION-PLAN (chạy /mcv3:requirements cho cả 3 systems)
  → Không tạo 3 action items riêng lẻ → tránh redundancy và user overwhelm
```

Gap Clustering — khi tổng số gaps > 10:
```
Nhóm theo cluster trong GAP-REPORT:
  CLUSTER-DOCS:          gaps về missing/outdated documents
  CLUSTER-SYNC:          gaps về drift giữa code và docs (chỉ Type C/D)
  CLUSTER-TRACEABILITY:  gaps về missing IDs/links
Show cluster summary trong Executive Summary, chi tiết ở phần "Chi tiết Gaps"
```

### 3c. Tạo GAP-REPORT

```
mc_save({
  filePath: "_mcv3-work/assessment/GAP-REPORT.md",
  documentType: "custom"
})
→ Sau khi save: mc_validate({ filePath: "_mcv3-work/assessment/GAP-REPORT.md" })
  [Validate PASS → sang Phase 4; FAIL → tự fix format trước]
```

GAP-REPORT format:
```markdown
# GAP REPORT — {Dự án}
**Ngày:** {date}
**Loại dự án:** {A/B/C/D}

## Executive Summary
| Severity | Count | Ảnh hưởng |
|----------|-------|---------|
| 🔴 CRITICAL | {N} | Chặn pipeline advancement |
| ⚠️ WARNING | {M} | Giảm chất lượng traceability |
| ℹ️ INFO | {K} | Cải thiện documentation |

## Chi tiết Gaps

### 🔴 CRITICAL
#### GAP-001: Thiếu URS cho system {SYS}
- **Ảnh hưởng:** Không thể validate code có đúng requirements không
- **Đề xuất:** Chạy `/mcv3:migrate` → import docs hiện có hoặc `/mcv3:requirements`
- **Effort:** Medium (2-4 sessions)

...

## Strengths (đã có tốt)
- ...
```

---

## Phase 4 — Code-Docs Sync Check

*Chỉ chạy nếu project type C hoặc D (có cả code lẫn docs)*

### 4a. API Endpoint sync

```
Từ code (routes/controllers):
  Detected APIs: [GET /api/v1/orders, POST /api/v1/orders, ...]

Từ MODSPEC docs:
  Specified APIs: [GET /api/v1/orders (API-ERP-001), ...]

So sánh:
  ✅ Aligned: /api/v1/orders → API-ERP-001
  ⚠️ Drifted: /api/v1/orders/{id}/cancel → không có trong MODSPEC
  ❌ Missing in code: API-ERP-005 (/api/v1/orders/bulk) → chưa implement
  ❌ Missing in docs: GET /api/v1/reports → không có spec
```

### 4b. Database sync

```
Từ migrations/schema:
  Tables: orders, order_items, products, ...

Từ DATA-DICTIONARY/MODSPEC:
  Documented: orders (TBL-ERP-001), products (TBL-ERP-002)

So sánh:
  ✅ Aligned: orders → TBL-ERP-001
  ⚠️ Drifted: orders.discount_amount column mới, chưa trong docs
  ❌ Missing in docs: order_items table chưa có TBL-ID
```

### 4c. Business Logic sync

Tham chiếu: `references/sync-check-rules.md`

```
Từ service code:
  if (order.total < 50000) throw ValidationError('Minimum order: 50,000 VND')

Từ BIZ-POLICY docs:
  BR-SALES-001: Giá trị đơn hàng tối thiểu = 100,000 VND

→ ⚠️ DRIFT DETECTED: Code enforce 50k, docs nói 100k
   → Cần clarify với stakeholder và sync lại
```

### 4d. Tạo SYNC-REPORT

Tự verify SYNC-REPORT trước khi lưu:
```
✓ Mỗi drift item có severity rõ ràng (ERROR/WARNING/INFO)
✓ Mỗi ERROR sẽ được reflect là CRITICAL gap trong GAP-REPORT
✓ Confidence level đánh dấu cho từng drift:
  HIGH:   exact string/path/value match
  MEDIUM: normalized match (case, whitespace, path prefix differences)
  LOW:    semantic inference → thêm ghi chú "(cần verify thủ công)"
✓ Không có false positives rõ ràng (VD: test file paths lẫn với source file paths)
```

```
mc_save({
  filePath: "_mcv3-work/assessment/SYNC-REPORT.md",
  documentType: "custom"
})
→ Sau khi save: PARALLEL [mc_validate ∥ mc_checkpoint({ label: "post-sync-report" })]
```

// Checkpoint đã được gộp vào PARALLEL [mc_validate ∥ mc_checkpoint] ở trên (tiết kiệm 1 round-trip)

SYNC-REPORT format:
```markdown
# SYNC REPORT — {Dự án}
**Ngày:** {date}

## Summary
| Category | Aligned | Drifted | Missing in Code | Missing in Docs |
|----------|---------|---------|----------------|----------------|
| API Endpoints | {N} | {M} | {K} | {L} |
| DB Tables | {N} | {M} | {K} | {L} |
| Business Rules | {N} | {M} | — | {L} |

## Drift Details
[Chi tiết từng item bị drift]

## Action Required
[Danh sách items cần sync]
```

---

## Phase 5 — Remediation Roadmap

### 5a. Tổng hợp action plan

```
"📋 REMEDIATION PLAN cho {Dự án}

Tôi đề xuất thực hiện theo thứ tự ưu tiên:

🔴 CRITICAL (làm ngay):
  [1] Import/migrate documents hiện có vào MCV3 format
      → Skill: /mcv3:migrate
      → Effort: Medium | Timeline: 1-2 sessions

  [2] Assign Formal IDs cho tất cả requirements
      → Skill: /mcv3:migrate (option 4: Formal ID assignment)
      → Effort: Low | Timeline: 1 session

⚠️ HIGH (làm sau critical):
  [3] Tạo URS cho modules thiếu: {list}
      → Skill: /mcv3:requirements
      → Effort: High | Timeline: 2-3 sessions per module

  [4] Sync MODSPEC với code thực tế
      → Skill: /mcv3:tech-design (update mode)
      → Effort: Medium | Timeline: 1-2 sessions per module

ℹ️ MEDIUM (lên kế hoạch):
  [5] Tạo Test Cases cho existing code
      → Skill: /mcv3:qa-docs
      → Effort: Medium | Timeline: 1-2 sessions

  [6] Tạo User/Admin Guide
      → Skill: /mcv3:qa-docs
      → Effort: Medium | Timeline: 1 session

Dependencies:
  [2] sau [1] (Formal IDs cần docs đã được import trước)
  [3] sau [1] và [2] (URS creation cần context từ migrated docs)
  [4] sau [3] nếu MODSPEC chưa có; hoặc song song với [3] nếu đã có Swagger/OpenAPI
  [5] và [6] có thể bắt đầu sau [3] hoặc [4]

Parallel opportunities:
  [5] và [6] → Song song (TEST và USER-GUIDE độc lập nhau)
  Nhiều systems → [3] cho SYS-A và [4] cho SYS-B có thể song song nếu khác nhau hoàn toàn

Muốn bắt đầu từ action nào? [1/2/3/4/5/6]"
```

### 5b. Map actions → skills

| Gap Type | Skill | Notes |
|----------|-------|-------|
| Missing docs (Phase 1-3) | `/mcv3:migrate` hoặc `/mcv3:discovery` | Tùy có tài liệu cũ không |
| Missing URS | `/mcv3:requirements` | Từ đầu hoặc từ existing informal reqs |
| Missing MODSPEC | `/mcv3:tech-design` | Từ code hoặc từ existing API docs |
| Missing tests | `/mcv3:qa-docs` | Từ existing URS/MODSPEC |
| Code-docs drift | `/mcv3:change-manager` hoặc manual sync | Tùy severity |
| Missing traceability | `/mcv3:verify` (prep mode) | Sau khi có đủ docs |

### 5c. Tạo REMEDIATION-PLAN

```
[MANDATORY] mc_save({
  filePath: "_mcv3-work/assessment/REMEDIATION-PLAN.md",
  documentType: "custom"
})
```

SAU KHI REMEDIATION-PLAN ĐÃ TẠO:
╔══════════════════════════════════════════════════════════╗
║  [BẮT BUỘC] Chạy Pre-Completion Verification            ║
║  Xem section "Pre-Completion Verification" bên dưới      ║
║  TRƯỚC KHI viết Completion Report                         ║
║                                                            ║
║  Tầng 1 PASS + Tầng 2 PASS + Tầng 3 PASS                ║
║  → mới được viết Completion Report                        ║
║  Nếu FAIL → tự fix → re-verify (max 2 lần)               ║
╚══════════════════════════════════════════════════════════╝

---

## Phase 6 — Initialize MCV3 Project Structure

### 6a. Khởi tạo project (nếu chưa có)

```
Nếu chưa có project MCV3:
  mc_init_project({
    projectName: {name},
    domain: {domain}
  })

Nếu đã có project MCV3:
  mc_status({ projectSlug: {slug} })
  → Xem trạng thái hiện tại
```

### 6b. Ghi nhận per-system phases vào MASTER-INDEX

Dựa trên ASSESSMENT-MATRIX từ Phase 2, ghi rõ currentPhase per system vào tài liệu:

```
// _config.json được quản lý nội bộ bởi MCP server — không dùng mc_save trực tiếp.
// Thay vào đó, ghi nhận phase per system vào ASSESSMENT-MATRIX.md đã lưu,
// và cập nhật MASTER-INDEX.md với thông tin phase hiện tại:

mc_save({
  filePath: "MASTER-INDEX.md",
  // Thêm/cập nhật section "Systems & Current Phases" với thông tin từ assessment
  // VD:
  // | ERP | phase5-design  | MODSPEC-WH.md, MODSPEC-SALES.md |
  // | WEB | phase3-bizdocs | BIZ-POLICY-ECOM.md              |
  documentType: "master-index"
})

// Thông báo cho user về phases per system:
→ "📋 Kết quả assessment per system:
   - ERP: phase5-design (có MODSPEC, chưa có TEST + code)
   - WEB: phase3-bizdocs (có BIZ-POLICY, chưa có URS)
   Dùng /mcv3:status để xem tiến độ mới nhất."
```

### 6b.5 — Pre-Import Safety Snapshot

Tạo snapshot TRƯỚC khi import bất kỳ tài liệu nào vào `.mc-data/`:

```
mc_snapshot({
  projectSlug: {slug},
  label: "pre-import-docs",
  description: "Safety snapshot trước khi import docs cũ — dùng mc_rollback nếu import sai format"
})
```

→ Nếu phát hiện import bị lỗi (format sai, IDs duplicate, file rỗng, encoding lỗi) → `mc_rollback` về snapshot này trước khi thử lại.

---

### 6c. Import existing docs vào đúng folders

Với mỗi doc tìm thấy:
```
Phân loại → đặt đúng path trong .mc-data/:
  API docs → {SYS}/P2-DESIGN/MODSPEC-{MOD}.md
  User stories → {SYS}/P1-REQUIREMENTS/URS-{MOD}.md
  Test plan → {SYS}/P3-QA-DOCS/TEST-{MOD}.md
  Business rules → _PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md
```

Nếu doc chưa ở format MCV3:
```
→ Import dạng thô với placeholder trước (tự động)
→ Ghi vào REMEDIATION-PLAN: "Chạy /mcv3:migrate để convert sang format chuẩn"
```

### 6d. Tạo snapshot assessment

```
mc_snapshot({
  projectSlug: {slug},
  label: "post-assess-pre-remediation",
  description: "Snapshot sau khi assessment hoàn thành — baseline trước khi bắt đầu remediation"
})
```

### 6e. Lưu checkpoint

```
[MANDATORY] mc_checkpoint({
  projectSlug: {slug},
  sessionSummary: "Assessment hoàn thành: {N} systems, {M} critical gaps",
  nextActions: [
    "Xem REMEDIATION-PLAN.md để biết thứ tự ưu tiên",
    "Bắt đầu với: {action-1} → {skill}",
    ...
  ]
})
```

### 6e-verify. Pre-Completion Verification (BẮT BUỘC — RISK-004)

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

```
PROJECT-MANIFEST.md:
  ✓ Tất cả systems phát hiện đã được list với code và tên đầy đủ
  ✓ Modules per system không rỗng (ít nhất 1 module per system)
  ✓ Existing assets có classification đúng (code/docs/both/none)

ASSESSMENT-MATRIX.md:
  ✓ Phase per system được classify đúng (phase0 → phase8)
  ✓ Không có system nào thiếu row trong matrix
  ✓ Gap severity có phân loại rõ ràng (Critical/Warning/Info)

REMEDIATION-PLAN.md:
  ✓ Mỗi gap có action với skill cụ thể (/mcv3:skill)
  ✓ Priority order logic (Critical gaps trước Warning trước Info)
  ✓ Không có "TBD" trong action items

Cross-check:
  ✓ Gaps trong GAP-REPORT match với assessment findings trong ASSESSMENT-MATRIX
  ✓ ERRORs trong SYNC-REPORT (nếu Type C/D) có entry CRITICAL tương ứng trong GAP-REPORT
  ✓ Skills routing đúng (không route "thiếu URS" đến /mcv3:tech-design)
  ✓ Phase per system: currentPhase = last fully DONE phase (⚠️ partial KHÔNG count là done)
  ✓ Docs imported (Phase 6c, nếu có): không rỗng, có markdown heading, không duplicate IDs

Tầng 3 — Quality Gate [🚫 BLOCKING GATE]:

> **BẮT BUỘC:** Toàn bộ checklist phải PASS trước khi viết Completion Report.
> Nếu FAIL → tự fix → re-verify (max 2 lần). KHÔNG viết Completion Report khi còn lỗi.

  ✅ REMEDIATION-PLAN có ≥ 1 actionable item
  ✅ Critical gaps được list rõ ràng (nếu có)
  ✅ [MANDATORY] mc_validate PASS cho assessment docs
```

---

### 6e-verify-inter. Inter-Phase Verification

Kiểm tra tính nhất quán GIỮA các phases (chạy sau Pre-Completion Verification):

```
Phase Prerequisite Check (với mỗi system):
  ✓ **BLOCKING:** Nếu phase ≥ 5 (MODSPEC done) → Phase 4 (URS) phải có ≥ 1 URS file — nếu không → downgrade currentPhase về phase4 và ghi Critical gap
  ✓ **BLOCKING:** Nếu phase ≥ 6 (QA done) → Phase 5 (MODSPEC) phải có ≥ 1 MODSPEC file — nếu không → downgrade currentPhase về phase5 và ghi Critical gap
  ✓ **BLOCKING:** Nếu phase ≥ 7 (code done) → Phase 6 (TEST) phải có ≥ 1 TEST file — nếu không → downgrade currentPhase về phase6 và ghi Critical gap
  ✓ Không có system nào skip phase trung gian mà không có lý do ghi trong ASSESSMENT-MATRIX

Phase-Doc Drift Check (với mỗi system ở phase 5+):
  ✓ MODSPEC modules khớp với URS modules (không có MODSPEC orphan không có URS)
  ✓ TEST modules khớp với MODSPEC modules (không có TEST orphan không có MODSPEC)
  ✓ Code modules (nếu có) có entry tương ứng trong ASSESSMENT-MATRIX

Gap Severity Escalation:
  ✓ Nếu phase skip được phát hiện → severity phải là Critical (không phải Warning)
  ✓ Nếu doc drift được phát hiện → có entry trong GAP-REPORT với action rõ ràng
  ✓ Nếu Type C/D và có SYNC-REPORT → mọi ERROR trong SYNC-REPORT có Critical gap entry

Inter-System Consistency (nếu có nhiều systems):
  ✓ Shared services (AUTH, NOTIFICATION, FILE) được classify đúng — không duplicate across systems
  ✓ Integration dependencies giữa systems được note trong REMEDIATION-PLAN nếu liên quan
  ✓ Build order cho remediation phản ánh đúng inter-system dependencies

Auto-Fix Rule:
  → Nếu phát hiện phase prerequisite violation: tự downgrade phase về đúng level + log decision
  → Nếu phát hiện doc drift: tự thêm Critical gap entry vào GAP-REPORT + REMEDIATION-PLAN
  → Không dừng hỏi user — ghi DECISION-LOG và tiếp tục
```

---

### 6f. Post-Gate

```
Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:assess
═══════════════════════════════════════════════

✅ Đã tạo assessment docs:
   PROJECT-MANIFEST.md    — {N} systems, {M} modules
   ASSESSMENT-MATRIX.md   — phase per system
   GAP-REPORT.md          — {K} critical gaps
   [SYNC-REPORT.md]       — (nếu type C/D)
   REMEDIATION-PLAN.md    — priority order

📊 Tổng kết:
   {N} systems | Phase per system: {summary}
   {K} critical gaps cần xử lý
   {L} docs sẵn sàng migrate/formalize

🔜 Bước tiếp theo (theo REMEDIATION-PLAN.md):
   → {Skill 1}: {description}
   → {Skill 2}: {description}

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết GAP-REPORT hoặc REMEDIATION-PLAN?
   [2] Điều chỉnh priority nào?
   [3] OK, bắt đầu → {Skill 1 từ REMEDIATION-PLAN}
═══════════════════════════════════════════════
```

---

## Quy tắc Assessment

```
NO-JUDGMENT: Không phán xét "dự án làm sai", chỉ phân tích gaps
RESPECT-EXISTING: Code và docs hiện có là valuable input, không phải rác
PRAGMATIC: Ưu tiên gaps block pipeline nhất, không cần perfect từ đầu
PER-SYSTEM-PHASE: Mỗi system có thể ở phase khác nhau — đây là bình thường
PROGRESSIVE: Dự án in-progress không cần hoàn thiện từ phase 1 → 8 tuần tự
DOCUMENT-REALITY: ASSESSMENT-MATRIX phản ánh thực tế, không phải mong muốn
SNAPSHOT-BEFORE-CHANGES: Luôn snapshot trước khi bắt đầu remediation
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với `6e-verify-inter`:** Section này là checklist nhanh GIỮA các phases (trước khi chuyển sang phase tiếp theo). Section `6e-verify-inter` ở trên là cross-cutting consistency check chạy SAU KHI hoàn thành toàn bộ phân tích.

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển phase:

### Sau Phase 0 → trước Phase 1:
- ✓ Project type (A/B/C/D) detected có lý do rõ ràng
- ✓ Nếu type mơ hồ → ghi DECISION với confidence level (HIGH/MEDIUM/LOW)
- ✓ Nếu confidence LOW → note vào Completion Report "📋 CẦN USER REVIEW: Verify project type"

### Sau Phase 1 → trước Phase 2:
- ✓ PROJECT-MANIFEST: ≥1 system detected
- ✓ Mỗi system có: tên, tech stack (hoặc "unknown"), modules list (không để trống)
- ✓ Scan results: không có false positives rõ ràng (folder test data bị detect là module thật)
- ✓ Nếu dự án lớn (≥ 5 systems hoặc ≥ 5 modules): mc_checkpoint trước khi tiếp tục Phase 2 (tránh mất progress nếu session bị interrupt)

### Sau Phase 2 → trước Phase 3:
- ✓ ASSESSMENT-MATRIX: mỗi system có phase assignment (phase1 → phase8)
- ✓ Phase logic nhất quán: system có code (Phase 7) PHẢI có currentPhase ≥ phase5-design hoặc có DECISION giải thích "code-first project"
- ✓ Không có 2 systems conflict về shared resources (VD: System A nói PostgreSQL, System B nói MySQL — nhưng thực tế chung 1 DB)
- ✓ Nếu dự án lớn: ghi summary statistics (bao nhiêu systems ở mỗi phase level)

### Sau Phase 3 → trước Phase 4:
- ✓ GAP-REPORT: mỗi gap có classification (🔴 CRITICAL / ⚠️ WARNING / ℹ️ INFO) + lý do cụ thể
- ✓ Không duplicate gaps: cùng issue ở 2 systems → gộp thành 1 cross-system gap với danh sách systems
- ✓ Mỗi gap actionable: có thể map vào ≥1 MCV3 skill (xem 5b. Map actions → skills)
- ✓ Gap count summary rõ ràng: "X critical, Y warning, Z info"

### Sau Phase 4 → trước Phase 5:
- ✓ SYNC-REPORT: mỗi item có status (aligned/drifted/missing) + evidence (source file/docs path)
- ✓ False positive filter áp dụng: code dùng ORM → raw SQL check không applicable; test files loại ra khỏi API detection
- ✓ Kết quả sync consistent với Phase 2 assessment (VD: nếu Phase 2 nói "no API docs" → sync check không thể report "aligned APIs")

### Sau Phase 5 → trước Phase 6:
- ✓ REMEDIATION-PLAN: actions có dependency order rõ ràng (URS trước MODSPEC, migrate trước assign IDs)
- ✓ Mỗi action → skill MCV3 hợp lệ (verify skill name tồn tại trong pipeline)
- ✓ Effort estimates reasonable (không có "1 hour" cho full URS của 5+ modules)
- ✓ Parallel opportunities identified: actions nào có thể chạy song song

---

## Token Optimization — Dự án lớn (5+ systems, 20+ modules)

Khi project có nhiều systems/modules, dùng các chiến lược sau để tránh quá tải context window:

### Batch Processing:

```
- Assess 3 systems → mc_checkpoint → tiếp 3 systems sau
- Mỗi batch: tóm tắt interim results trước khi sang batch tiếp
- Không load tất cả files cùng lúc — load tuần tự per system
```

### Smart Context Layering (tránh load thừa):

```
Bước đầu (orientation):
  mc_load({ layer: 0 })  → Key facts (~500B) — đủ để biết phase hiện tại
  mc_load({ layer: 1 })  → Dependency map — đủ để biết cần đọc gì tiếp

Khi assess từng system:
  mc_load({ layer: 2 })  → Sections chính (~10KB) — đủ để review phase gaps
  mc_load({ layer: 3 })  → Full doc — chỉ khi cần full detail để sync check

Chiến lược load tuần tự:
  1. MASTER-INDEX (layer 1) → lấy danh sách systems
  2. Với mỗi system: load MODSPEC (layer 2) → xác định tech stack + phase
  3. Assess xong system A → lưu vào ASSESSMENT-MATRIX → sang system B
  4. Chỉ load full (layer 3) khi detect drift hoặc cần sync check chi tiết

Phase 1 scan: chỉ load manifest (tên files + paths), không load full file contents
Phase 2: assess per-system summary (không load full docs trừ khi cần verify chi tiết)
Phase 3: group gaps by system → process từng group, không load tất cả cùng lúc
```

### Summary Layer cho reports lớn:

```
GAP-REPORT > 20 gaps:
  → Thêm Executive Summary đầu file: top 5 critical + statistics per cluster
  → Chi tiết gaps xuống phần "Chi tiết" phía sau

SYNC-REPORT > 30 items:
  → Group by status: aligned (count only), drifted (list), missing (list)
  → Không liệt kê từng aligned item — chỉ count

REMEDIATION-PLAN > 10 actions:
  → Chia thành priority lanes:
     P0 Immediate — làm trong session này (block pipeline)
     P1 This Sprint — làm trong 1-2 sessions tới
     P2 Backlog — lên kế hoạch cho tương lai
```

### Chia nhỏ assessment theo session:

```
- Session 1: Phase 1 (scan) + Phase 2 (assess systems 1-2)
- Session 2: Phase 2 tiếp (assess systems 3+) + Phase 3 (gap analysis)
- Session 3: Phase 4 (sync check) + Phase 5 (remediation plan)
Dùng mc_checkpoint giữa các sessions để resume.
```
