# CLAUDE.md — MasterCraft DevKit v3.4 (MCV3)

Plugin này giúp Claude Code làm việc với **dự án phần mềm** theo quy trình 8 phases của MCV3. Sprint 4 hoàn thành toàn bộ plugin: Pipeline 8 Phase + Lifecycle Management (Change Manager, Onboard, Evolve, Migrate).

---

## MCP Server

Plugin sử dụng MCP Server `mcv3-project-memory` với 19 tools:

### Sprint 0 — Core (5 tools)

| Tool | Mục đích |
|------|---------|
| `mc_init_project` | Khởi tạo dự án mới, tạo cấu trúc `.mc-data/` |
| `mc_save` | Lưu tài liệu Markdown vào project memory |
| `mc_load` | Đọc tài liệu (có Smart Context Layering) |
| `mc_list` | Liệt kê tài liệu, lọc theo thư mục/loại |
| `mc_status` | Xem trạng thái dự án và đề xuất bước tiếp theo |

### Sprint 1 — Session (5 tools)

| Tool | Mục đích |
|------|---------|
| `mc_checkpoint` | Lưu checkpoint để resume session sau |
| `mc_resume` | Resume từ checkpoint trong session mới |
| `mc_validate` | Validate format và completeness của tài liệu |
| `mc_export` | Export bundle/summary/phase/index |
| `mc_search` | Full-text search trong project memory |

### Sprint 2 — Advanced (9 tools)

| Tool | Mục đích |
|------|---------|
| `mc_snapshot` | Tạo snapshot toàn bộ project tại milestone |
| `mc_rollback` | Rollback về snapshot trước (với safety snapshot tự động) |
| `mc_impact_analysis` | Phân tích ảnh hưởng khi thay đổi requirement/element |
| `mc_traceability` | Link và validate traceability giữa IDs |
| `mc_dependency` | Đăng ký dependency giữa documents |
| `mc_compare` | So sánh 2 versions của document |
| `mc_merge` | Merge content từ nhiều sources vào document |
| `mc_changelog` | Structured changelog management |
| `mc_summary` | Tạo summary project/phase/module |

**Cách dùng:**
```
mc_status()                                      # Xem tất cả projects
mc_status({ projectSlug: "my-project" })         # Xem chi tiết 1 project
mc_load({ projectSlug: "my-project",
          filePath: "_PROJECT/PROJECT-OVERVIEW.md",
          layer: 1 })                             # Chỉ đọc DEPENDENCY MAP
mc_impact_analysis({ projectSlug: "my-project",
                     elementId: "BR-INV-001" })   # Phân tích impact của 1 element
```

---

## Cấu trúc Project Data

Mọi dữ liệu runtime lưu trong `.mc-data/` tại thư mục dự án:

```
.mc-data/
└── projects/
    └── {project-slug}/
        ├── _config.json              # Cấu hình project (slug, name, phase, systems)
        ├── MASTER-INDEX.md           # Bản đồ toàn bộ tài liệu
        ├── _changelog.md             # Lịch sử thay đổi (tự động ghi)
        ├── _PROJECT/                 # Tài liệu cấp dự án
        │   ├── PROJECT-OVERVIEW.md
        │   ├── EXPERT-LOG.md
        │   ├── DATA-DICTIONARY.md
        │   ├── BIZ-POLICY/
        │   ├── PROCESS/
        │   ├── USER-GUIDE.md
        │   ├── ADMIN-GUIDE.md
        │   ├── DEPLOY-OPS.md
        │   └── EVOLUTION-LOG.md      # Sprint 4: Lịch sử evolution
        ├── {SYSTEM-CODE}/            # Tài liệu từng system (VD: ERP, WEB, MOB)
        │   ├── P1-REQUIREMENTS/      # URS files
        │   ├── P2-DESIGN/            # MODSPEC files
        │   └── P3-QA-DOCS/           # TEST files
        ├── _SHARED-SERVICES/         # Shared services
        ├── _VERIFY-CROSS/            # Cross-system verification
        └── _mcv3-work/               # Working files
            ├── _checkpoint.md        # Active checkpoint (overwritten each session)
            ├── _snapshots/           # Versioned snapshots (.bundle.json files)
            ├── _temp/                # Temporary working files
            ├── change-log/           # Sprint 4: CHG-xxx records
            ├── evolution/            # Sprint 4: EVOL-xxx plans
            └── migration/            # Sprint 4: migration reports
```

**QUAN TRỌNG:**
- Chỉ đọc/ghi vào `.mc-data/` khi làm việc với dự án
- KHÔNG sửa files trong thư mục plugin `mcv3-devkit/`

---

## Pipeline 8 Phases

```
Idea → Discovery → Expert → BizDocs → Requirements → Design → QA → CodeGen → Verify → Deploy
```

| Phase | Lệnh | Output chính |
|-------|------|-------------|
| 0. Init | `mc_init_project` | `.mc-data/` structure |
| 1. Discovery | `/mcv3:discovery` | PROJECT-OVERVIEW.md |
| 2. Expert Analysis | `/mcv3:expert-panel` | EXPERT-LOG.md |
| 3. Business Docs | `/mcv3:biz-docs` | BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| 4. Requirements | `/mcv3:requirements` | URS-{MOD}.md (US, FT, AC, NFR, UC per module) |
| 5. Tech Design | `/mcv3:tech-design` | MODSPEC-{MOD}.md (API, DB, COMP, ADR) |
| 6. QA & Docs | `/mcv3:qa-docs` | TEST-{MOD}.md, USER-GUIDE, ADMIN-GUIDE |
| 7. Code Gen | `/mcv3:code-gen` | src/{sys}/{mod}/ + db/migrations/ + test stubs |
| 8a. Verify | `/mcv3:verify` | _VERIFY-CROSS/verification-report.md + traceability-matrix |
| 8b. Deploy-Ops | `/mcv3:deploy-ops` | DEPLOY-OPS.md + deploy-readiness-checklist |

**Phase 6-8 details:**

### Phase 6 — QA & Docs (`/mcv3:qa-docs`)

```
Input: MODSPEC-{MOD}.md + URS-{MOD}.md
Output:
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md:
      TC-xxx (Test Cases với Happy/Error/Edge cases)
      UAT-xxx (User Acceptance Scenarios)
      API test cases cho mỗi endpoint
  - _PROJECT/USER-GUIDE.md (chapter per module)
  - _PROJECT/ADMIN-GUIDE.md (section per module)

Traceability: AC-xxx → TC-xxx
Agents: doc-writer
References: skills/qa-docs/references/
```

### Phase 7 — Code Gen (`/mcv3:code-gen`)

```
Input: MODSPEC-{MOD}.md + TEST-{MOD}.md
Output: source code scaffolding với REQ-ID comments
  - src/{sys}/{mod}/controllers/{mod}.controller.ts
  - src/{sys}/{mod}/services/{mod}.service.ts
  - src/{sys}/{mod}/repositories/{mod}.repository.ts
  - src/{sys}/{mod}/dtos/create-{mod}.dto.ts
  - src/{sys}/{mod}/__tests__/{mod}.service.test.ts (stubs)
  - db/migrations/V{NNN}__create_{table}.sql

Code REQ-ID format:
  /**
   * @req-ids US-{MOD}-001, FT-{MOD}-001
   * @api-ids API-{SYS}-001
   */

Agents: code-gen, tech-expert
References: skills/code-gen/references/
```

### Phase 8a — Verify (`/mcv3:verify`)

```
Input: URS + MODSPEC + TEST + src/
Output:
  - _VERIFY-CROSS/traceability-matrix.md
  - _VERIFY-CROSS/verification-report.md
  - _VERIFY-CROSS/VERIFY-{SYS}-P1-{MOD}.md (per module)

Kiểm tra: PROB → BR → US → FT → API → Code → TC
Status: ✅ READY / ⚠️ NEEDS ATTENTION / ❌ NOT READY

Scripts:
  - ./scripts/generate-traceability-report.sh
  - ./scripts/validate-test-coverage.sh
```

### Phase 8b — Deploy-Ops (`/mcv3:deploy-ops`)

```
Prereq: verification-report.md status = READY
Output:
  - _PROJECT/DEPLOY-OPS.md:
      Deploy Plan (strategy, timeline, commands)
      Go-Live Checklist (T-7 → T+7 days)
      Rollback Plan (triggers, steps)
      Monitoring Setup (metrics, alerts, dashboards)
      SLA Definitions (uptime, response, support)
  - _VERIFY-CROSS/deploy-readiness-checklist.md

Agents: doc-writer, tech-expert
References: skills/deploy-ops/references/
```

---

## Lifecycle Skills (Sprint 4)

Dùng sau khi project đã ở Phase 5+:

### Change Manager (`/mcv3:change-manager`)

```
Mục đích: Quản lý requirements changes sau khi có tài liệu

Khi nào dùng:
  - Stakeholder yêu cầu thay đổi business rule
  - Phát hiện inconsistency cần sửa
  - Regulatory changes ảnh hưởng đến requirements

Flow:
  1. Change Intake: Nhập thay đổi (AI, business rule, workflow, NFR)
  2. Impact Analysis: mc_impact_analysis → xác định documents bị ảnh hưởng
  3. Safety Snapshot: mc_snapshot trước khi sửa
  4. Document Updates: mc_merge từng document, user confirm
  5. Changelog: mc_changelog ghi CHG-xxx record

Output: CHG-xxx record trong _mcv3-work/change-log/
References: skills/change-manager/references/
```

### Onboard (`/mcv3:onboard`)

```
Mục đích: Tutorial tùy chỉnh cho user mới

Modes:
  1. Developer — Setup, pipeline, MCP tools, Formal IDs, demo
  2. PM/BA — Value proposition, workflow, stakeholder gates
  3. Business Owner — Problem/solution, 8-step process, ROI

Output: Cheat sheet + next steps
References: skills/onboard/references/
```

### Evolve (`/mcv3:evolve`)

```
Mục đích: Thêm features/modules/systems vào dự án đã hoàn thành

4 Evolution Scopes:
  1. Sub-feature — Thêm tính năng nhỏ vào module hiện có (PATCH)
  2. New Module — Thêm module mới vào system (MINOR)
  3. New System — Thêm system mới vào project (MINOR/MAJOR)
  4. MVP → Full — Scale up toàn bộ project (MAJOR)

Versioning: Semantic Versioning cho documents (MAJOR.MINOR.PATCH)
Output: EVOL-xxx plan + EVOLUTION-LOG update
References: skills/evolve/references/
```

### Migrate (`/mcv3:migrate`)

```
Mục đích: Import tài liệu cũ vào MCV3 format

5 Migration Sources:
  1. Documents (Word/PDF/Excel) → MCV3 templates
  2. Confluence/Notion → structured format
  3. Codebase (reverse engineering) → URS + MODSPEC
  4. Informal requirements (emails, stories) → formal documents
  5. Mixed sources → gap analysis + consolidation

Output: MCV3 documents + MIGRATION-REPORT.md + gap analysis
References: skills/migrate/references/
```

---

## Smart Context Layering

Dùng `layer` parameter để tiết kiệm context window:

| Layer | Nội dung | Kích thước |
|-------|---------|-----------|
| 0 | Key Facts (`_key-facts.md`) | ~500 bytes |
| 1 | DEPENDENCY MAP section | ~200 bytes |
| 2 | Sections chính (không có code blocks dài) | ~5-10KB |
| 3 | Toàn bộ file (default) | Full |

**Khi nào dùng layer nào:**
- Bắt đầu conversation → Layer 0 hoặc 1 để orientation
- Cần hiểu dependencies → Layer 1
- Review nội dung → Layer 2
- Cần full detail để code → Layer 3

---

## Formal ID System

Mọi tài liệu dùng formal IDs để traceability:

| Prefix | Loại | Ví dụ |
|--------|------|-------|
| `BR-{DOM}-NNN` | Business Rule | BR-INV-001 |
| `US-{MOD}-NNN` | User Story | US-INV-001 |
| `UC-{MOD}-NNN-XX` | Use Case | UC-INV-001-01 |
| `AC-{MOD}-NNN-XX` | Acceptance Criteria | AC-INV-001-01 |
| `FT-{MOD}-NNN` | Feature | FT-INV-001 |
| `TC-{MOD}-NNN` | Test Case | TC-INV-001 |
| `TBL-{SYS}-NNN` | Database Table | TBL-ERP-001 |
| `API-{SYS}-NNN` | API Endpoint | API-ERP-001 |
| `INT-{SYS}-NNN` | Integration | INT-ERP-001 |
| `NFR-NNN` | Non-Functional Requirement | NFR-001 |
| `CHG-NNN` | Change Record (Sprint 4) | CHG-001 |
| `EVOL-NNN` | Evolution Plan (Sprint 4) | EVOL-001 |

**QUAN TRỌNG:** Mọi code file PHẢI có REQ-ID comment:
```typescript
// REQ-ID: US-INV-001
// FEAT-ID: FT-INV-001
export class InventoryService { ... }
```

---

## Quy tắc làm việc

1. **Đọc trước khi làm** — Luôn gọi `mc_status` khi bắt đầu conversation mới
2. **Không skip phases** — Phải có output của phase trước mới sang phase sau (ngoại lệ: dự án in-progress dùng `/mcv3:assess` để assess rồi import mixed-phase)
3. **Dùng templates** — Files trong `templates/` (tổ chức theo phase) là chuẩn tạo tài liệu
4. **Lưu sau khi tạo** — Mọi tài liệu phải được lưu qua `mc_save`
5. **Tiếng Việt** — Documentation và comments bằng tiếng Việt
6. **Snapshot trước khi sửa** — Dùng `mc_snapshot` trước thay đổi lớn (Lifecycle skills)

---

## Skills có sẵn

### Pipeline Skills (Phases 1-8)

| Skill | Command | Phase | Description |
|-------|---------|-------|-------------|
| navigator | `/mcv3:status` | — | Xem dashboard tiến độ dự án |
| discovery | `/mcv3:discovery` | 1 | Tìm hiểu dự án, tạo PROJECT-OVERVIEW |
| expert-panel | `/mcv3:expert-panel` | 2 | Phân tích chuyên gia, tạo EXPERT-LOG |
| biz-docs | `/mcv3:biz-docs` | 3 | Tạo BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| requirements | `/mcv3:requirements` | 4 | Viết URS (US, FT, AC, NFR) per module |
| tech-design | `/mcv3:tech-design` | 5 | Thiết kế MODSPEC (API, DB, COMP, ADR) |
| qa-docs | `/mcv3:qa-docs` | 6 | Tạo TEST docs, USER/ADMIN GUIDE |
| code-gen | `/mcv3:code-gen` | 7 | Generate code scaffolding từ MODSPEC |
| verify | `/mcv3:verify` | 8a | Cross-verify traceability end-to-end |
| deploy-ops | `/mcv3:deploy-ops` | 8b | Tạo Deploy Plan, Rollback, Monitoring, SLA |

### Lifecycle Skills (Sprint 4 — dùng sau Phase 5+)

| Skill | Command | Mục đích |
|-------|---------|---------|
| change-manager | `/mcv3:change-manager` | Quản lý requirements changes với impact analysis |
| onboard | `/mcv3:onboard` | Tutorial cho user mới (Developer / PM / Business Owner) |
| evolve | `/mcv3:evolve` | Thêm sub-feature/module/system mới vào dự án |
| migrate | `/mcv3:migrate` | Import tài liệu cũ vào MCV3 format |

### Assess Skill (Phase A — dùng cho dự án đang phát triển dở)

| Skill | Command | Mục đích |
|-------|---------|---------|
| assess | `/mcv3:assess` | Đánh giá dự án in-progress, tìm gaps, tạo remediation plan |

---

## Agents có sẵn

| Agent | File | Dùng khi |
|-------|------|---------|
| orchestrator | agents/orchestrator.md | Điều phối chung |
| doc-writer | agents/doc-writer.md | Viết tài liệu |
| domain-expert | agents/domain-expert.md | Phân tích nghiệp vụ (7 industries) |
| tech-expert | agents/tech-expert.md | Tư vấn kỹ thuật |
| ux-expert | agents/ux-expert.md | UX/UI design |
| finance-expert | agents/finance-expert.md | Tài chính |
| legal-compliance-expert | agents/legal-compliance-expert.md | Pháp lý & compliance |
| strategy-expert | agents/strategy-expert.md | Chiến lược |
| verifier | agents/verifier.md | Kiểm tra tài liệu |
| code-gen | agents/code-gen.md | Generate code từ MODSPEC |

### Domain Expert Knowledge Bases

| Industry | File | Trọng tâm |
|----------|------|---------|
| F&B | domain-expert/references/industry-fnb.md | Menu, kitchen ops, delivery |
| Logistics | domain-expert/references/industry-logistics.md | WMS, TMS, last-mile |
| Retail | domain-expert/references/industry-retail.md | POS, inventory, omnichannel |
| SaaS | domain-expert/references/industry-saas.md | Subscription, onboarding, churn |
| Healthcare | domain-expert/references/industry-healthcare.md | EMR, HIS, BHYT, KCB law |
| Fintech | domain-expert/references/industry-fintech.md | Core banking, AML, PCI-DSS |
| E-Commerce | domain-expert/references/industry-ecommerce.md | Cart, checkout, marketplace |

---

## Scripts & Hooks

### Scripts

```bash
# Validate test coverage (Phase 6 → 7)
./scripts/validate-test-coverage.sh <project_slug> [system] [module]

# Generate traceability report (Phase 8)
./scripts/generate-traceability-report.sh <project_slug> [output_file]

# Validate phase transition
./scripts/validate-phase-transition.sh  # Tự động gọi bởi hooks

# Auto-checkpoint (gọi bởi SessionStop hook)
./scripts/auto-checkpoint.sh

# Auto-snapshot milestone (gọi bởi PostPhaseCompletion hook)
./scripts/auto-snapshot-milestone.sh

# Load project context (gọi bởi SessionStart hook)
./scripts/load-project-context.sh

# Sprint 4: Validate trước lifecycle skills
./scripts/check-lifecycle-prerequisites.sh <skill> <project_slug>

# Phase A: Quét codebase để hỗ trợ /mcv3:assess
./scripts/scan-codebase.sh [project_root] [output_manifest.json]
```

### Hooks

| Hook | Trigger | Script |
|------|---------|--------|
| SessionStart | Bắt đầu session | load-project-context.sh |
| SessionStop | Kết thúc session | auto-checkpoint.sh |
| PrePhaseTransition | Chuyển phase | validate-phase-transition.sh |
| PostPhaseCompletion | Xong phase | auto-snapshot-milestone.sh |
| PreRequirementsGeneration | Trước /mcv3:requirements | check-bizdocs-ready.sh |
| PreTechDesign | Trước /mcv3:tech-design | check-urs-ready.sh |
| PreQADocs | Trước /mcv3:qa-docs | check-modspec-ready.sh |
| PreCodeGen | Trước /mcv3:code-gen | validate-test-coverage.sh |
| PreVerify | Trước /mcv3:verify | check-code-gen-ready.sh |
| PreDeployOps | Trước /mcv3:deploy-ops | check-verify-ready.sh |
| **PreChangeManager** | **Trước /mcv3:change-manager** | **check-lifecycle-prerequisites.sh** |
| **PreEvolve** | **Trước /mcv3:evolve** | **check-lifecycle-prerequisites.sh** |
| **PreMigrate** | **Trước /mcv3:migrate** | **check-lifecycle-prerequisites.sh** |
| **PreAssess** | **Trước /mcv3:assess** | **check-lifecycle-prerequisites.sh** |

---

## Templates có sẵn

Templates trong `templates/` — tổ chức theo phase (dùng làm base khi tạo tài liệu):

**`templates/p0-init/` — Phase 0: Khởi tạo:**
- `MASTER-INDEX-TEMPLATE.md`
- `key-facts-template.md` — Layer 0 cache file

**`templates/p1-discovery/` — Phase 1: Discovery:**
- `PROJECT-OVERVIEW-TEMPLATE.md`

**`templates/p2-expert/` — Phase 2: Expert Analysis:**
- `EXPERT-LOG-TEMPLATE.md`
- `PROJECT-ARCHITECTURE-TEMPLATE.md`

**`templates/p3-biz-docs/` — Phase 3: Business Docs:**
- `BIZ-POLICY-TEMPLATE.md`
- `PROCESS-TEMPLATE.md`
- `DATA-DICTIONARY-TEMPLATE.md`

**`templates/p4-requirements/` — Phase 4: Requirements:**
- `SYSTEM-INDEX-TEMPLATE.md`
- `URS-TEMPLATE.md`

**`templates/p5-tech-design/` — Phase 5: Tech Design:**
- `MODSPEC-TEMPLATE.md` ← All-in-one: BR + FT + Schema + API + UI
- `ARCHITECTURE-TEMPLATE.md`
- `DATA-MODEL-TEMPLATE.md`
- `SERVICE-SPEC-TEMPLATE.md`

**`templates/p6-qa-docs/` — Phase 6: QA & Docs:**
- `TEST-TEMPLATE.md`
- `USER-GUIDE-TEMPLATE.md`
- `ADMIN-GUIDE-TEMPLATE.md`

**`templates/p8a-verify/` — Phase 8a: Verify:**
- `VERIFY-P1-TEMPLATE.md` đến `VERIFY-PROJECT-TEMPLATE.md` (7 templates)

**`templates/p8b-deploy-ops/` — Phase 8b: Deploy Ops:**
- `DEPLOY-OPS-TEMPLATE.md`

---

## MCP Server Setup

Server được cấu hình trong `.mcp.json` tại root của dự án:

```json
{
  "mcpServers": {
    "mcv3-project-memory": {
      "command": "node",
      "args": ["mcv3-devkit/mcp-servers/project-memory/dist/index.js"],
      "env": {
        "MCV3_PROJECT_ROOT": "."
      }
    }
  }
}
```

Để build server:
```bash
cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build
```

---

## Quick Start

```
# Lần đầu dùng MCV3:
/mcv3:onboard          → Tutorial tùy chỉnh theo loại user

# Bắt đầu dự án mới:
Nói với Claude: "Tạo dự án mới tên X, ngành Y"
/mcv3:discovery        → Bắt đầu pipeline

# Dự án đang chạy:
/mcv3:status           → Xem tiến độ hiện tại
/mcv3:change-manager   → Quản lý requirements changes
/mcv3:evolve           → Thêm features mới

# Import tài liệu cũ:
/mcv3:migrate          → Convert từ Word/Confluence/code

# Dự án đang phát triển dở (có code/docs chưa đồng bộ):
/mcv3:assess           → Đánh giá trạng thái, tìm gaps, lập remediation plan
```

---

## Dự án đang phát triển dở (Ongoing Projects)

Khi nhận bàn giao dự án đang chạy hoặc muốn tích hợp vào MCV3:

### Quy trình nhanh

```
1. /mcv3:assess        → Đánh giá toàn diện: systems, phases, gaps
2. Xem REMEDIATION-PLAN.md → Biết thứ tự ưu tiên fix
3. Chạy skills theo plan:
   - Thiếu URS → /mcv3:migrate hoặc /mcv3:requirements
   - Docs chưa sync với code → /mcv3:change-manager
   - Thiếu MODSPEC → /mcv3:tech-design
   - Cần verify → /mcv3:verify
```

### Per-System Phase Tracking

Dự án in-progress thường có các systems đang ở **phases khác nhau**. MCV3 hỗ trợ:
- `mc_status` hiển thị `currentPhase` per system
- `_config.json` lưu `systems[i].currentPhase` riêng biệt
- `/mcv3:assess` detect và set đúng phase per system sau khi assess

### Loại dự án phổ biến

| Loại | Mô tả | Skill đầu tiên |
|------|-------|--------------|
| A | Có code, không có docs | `/mcv3:assess` → `/mcv3:migrate` |
| B | Có docs cũ, chưa có code | `/mcv3:assess` → `/mcv3:migrate` |
| C | Có cả code + docs, chưa đồng bộ | `/mcv3:assess` → `/mcv3:change-manager` |
| D | Production, muốn formalize | `/mcv3:assess` → skills theo gaps |
