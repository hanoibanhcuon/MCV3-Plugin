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

## Khi nào dùng skill này

- Nhận bàn giao dự án đang chạy từ team khác
- Codebase đã có nhưng chưa có tài liệu MCV3
- Muốn biết documentation còn thiếu gì so với code
- Trước khi dùng `/mcv3:evolve` — cần biết baseline hiện tại
- Muốn onboard MCV3 cho dự án production đang hoạt động

---

## Phase 0 — Project Type Detection

```
"🔍 Assessment Mode — MCV3

Dự án bạn đang ở trạng thái nào?

[A] Có codebase, ít/không có docs
    → Tôi scan code, reverse-engineer documentation

[B] Có docs cũ, ít/không có code
    → Tôi phân tích docs, classify vào MCV3 phases

[C] Có cả code lẫn docs nhưng chưa đồng bộ
    → Tôi compare code vs docs, tìm drift

[D] Dự án production, muốn formalize documentation
    → Tôi assess toàn diện, đề xuất remediation plan

Chọn [A/B/C/D]:"
```

Sau khi user chọn:
```
"Dự án của bạn:
- Tên dự án? (VD: 'Hệ thống ERP Công ty ABC')
- Domain/Ngành? (VD: Logistics, Retail, SaaS...)
- Codebase ở đâu? (đường dẫn, hoặc mô tả structure)
- Docs hiện có? (để tôi classify)"
```

---

## Phase 1 — Project Structure Discovery

### 1a. Scan codebase (nếu có code)

```
"Để phân tích codebase, tôi cần:
1. Mô tả cấu trúc thư mục chính
2. Hoặc chạy script scan: ./scripts/scan-codebase.sh
   → Output: manifest.json với tech stack, routes, models, tests

Bạn muốn:
[1] Tôi hướng dẫn scan từng bước
[2] Paste tree output của dự án để tôi phân tích
[3] Mô tả cấu trúc bằng lời"
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

### 1b. Classify docs (nếu có docs)

```
"Paste danh sách files tài liệu bạn có.
Tôi sẽ classify mỗi file thuộc phase nào trong MCV3:

VD:
  BRD.docx → Phase 3: Business Docs
  API_Spec.xlsx → Phase 5: Tech Design
  Test_Plan.md → Phase 6: QA
  user_manual.pdf → Phase 6: QA Docs"
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
```

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

### 3c. Tạo GAP-REPORT

```
mc_save({
  filePath: "_mcv3-work/assessment/GAP-REPORT.md",
  documentType: "custom"
})
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

```
mc_save({
  filePath: "_mcv3-work/assessment/SYNC-REPORT.md",
  documentType: "custom"
})
```

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
mc_save({
  filePath: "_mcv3-work/assessment/REMEDIATION-PLAN.md",
  documentType: "custom"
})
```

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

### 6b. Cập nhật _config.json với per-system phases

Dựa trên ASSESSMENT-MATRIX từ Phase 2, cập nhật config với `currentPhase` per system:

```
Với mỗi system trong project:
  mc_save({
    filePath: "_config.json",
    // Cập nhật systems[i].currentPhase theo assessment
    // VD: ERP system đang ở phase5-design
    //     WEB system đang ở phase3-bizdocs
  })

→ Kết quả: mc_status hiển thị đúng phase per system
```

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
→ Hỏi user: "Muốn migrate sang MCV3 format ngay? → /mcv3:migrate"
→ Hoặc import dạng thô để có placeholder trước
```

### 6d. Tạo snapshot assessment

```
mc_snapshot({
  projectSlug: {slug},
  label: "pre-assessment-baseline",
  description: "Trạng thái dự án trước khi bắt đầu remediation"
})
```

### 6e. Lưu checkpoint

```
mc_checkpoint({
  projectSlug: {slug},
  sessionSummary: "Assessment hoàn thành: {N} systems, {M} critical gaps",
  nextActions: [
    "Xem REMEDIATION-PLAN.md để biết thứ tự ưu tiên",
    "Bắt đầu với: {action-1} → {skill}",
    ...
  ]
})
```

### 6f. Post-Gate

```
"✅ Assessment hoàn thành!

📊 Tổng kết:
  - {N} systems phát hiện
  - {M} modules phân tích
  - Phase hiện tại per system: {summary}
  - {K} critical gaps cần xử lý
  - {L} docs sẵn sàng migrate

📁 Files tạo ra:
  - _mcv3-work/assessment/PROJECT-MANIFEST.md
  - _mcv3-work/assessment/ASSESSMENT-MATRIX.md
  - _mcv3-work/assessment/GAP-REPORT.md
  [- _mcv3-work/assessment/SYNC-REPORT.md] (nếu type C/D)
  - _mcv3-work/assessment/REMEDIATION-PLAN.md

🚀 Bước tiếp theo (theo REMEDIATION-PLAN.md):
  → {Skill 1}: {description}
  → {Skill 2}: {description}

Muốn bắt đầu ngay với action nào?"
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
