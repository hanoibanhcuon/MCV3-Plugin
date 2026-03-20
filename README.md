# MasterCraft DevKit v3.10 (MCV3)

> **Claude Code Plugin** — Biến ý tưởng phần mềm thành bộ tài liệu hoàn chỉnh

[![Version](https://img.shields.io/badge/version-3.11.2-blue)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![MCP Tools](https://img.shields.io/badge/MCP%20Tools-19-orange)](mcv3-devkit/mcp-servers/project-memory/)

---

## Giới thiệu

MCV3 là một **Claude Code Plugin** giúp bạn hệ thống hóa toàn bộ quá trình phát triển phần mềm — từ ý tưởng ban đầu đến code scaffolding sẵn sàng implement.

### Đặc điểm nổi bật

- **Formal ID System**: Truy vết từ vấn đề → yêu cầu → thiết kế → code → test
- **MODSPEC All-in-One**: AI đọc 1 file → code được 1 module hoàn chỉnh
- **Smart Code-Gen**: Sinh code thông minh — đầy đủ specs → code hoàn chỉnh; mơ hồ → REVIEW markers
- **Code Quality Assurance**: Verification & Auto-Fix Loop (compile → lint → test → security → coverage)
- **Multi-System Orchestration**: Build order tự động theo layer model, shared services, integration patterns
- **Smart Context Layering**: Quản lý context window hiệu quả cho dự án lớn
- **Scale Decision Matrix**: Pipeline linh hoạt — Micro (3 phases) đến Enterprise (full 8 phases)
- **12 Industries**: F&B, Logistics, Retail, SaaS, Healthcare, Fintech, E-Commerce, Real Estate, Manufacturing, Education, HR/HRM, Embedded/IoT
- **19 MCP Tools**: Từ init đến snapshot, traceability, change management
- **Pipeline 8 Phase**: Từ Discovery → Deploy, không bỏ sót bước nào
- **Lifecycle Management**: Change Manager, Evolution, Migration, Assess cho dự án đang chạy

---

## Cài đặt

### Mac / Linux / Git Bash (Windows)

```bash
# 1. Tải plugin về (hoặc clone repo)
# 2. Chạy installer — cài vào dự án của bạn
bash scripts/install.sh /path/to/your-project
```

Installer tự động:
- Copy plugin files → `mcv3-devkit/`
- Tạo `.claude/CLAUDE.md` với đầy đủ MCV3 instructions
- Cài slash commands → `.claude/commands/mcv3/`
- Cấu hình `.mcp.json` và `.claude/settings.json`
- Build MCP Server (nếu cần)

### Windows (PowerShell)

```powershell
.\scripts\install.ps1 C:\path\to\your-project
```

### Verify

```bash
bash mcv3-devkit/scripts/verify-install.sh
```

Xem chi tiết: [INSTALL.md](INSTALL.md)

---

## Pipeline 8 Phase

```
Idea → Discovery → Expert → BizDocs → Requirements → Design →
QA → CodeGen → Verify → Deploy
```

| Phase | Lệnh | Output chính |
|-------|------|-------------|
| 0. Init | `mc_init_project(...)` | `.mc-data/` structure |
| 1. Discovery | `/mcv3:discovery` | PROJECT-OVERVIEW.md |
| 2. Expert Analysis | `/mcv3:expert-panel` | EXPERT-LOG.md |
| 3. Business Docs | `/mcv3:biz-docs` | BIZ-POLICY, PROCESS, DATA-DICT |
| 4. Requirements | `/mcv3:requirements` | URS-{MOD}.md (US, FT, AC, NFR) |
| 5. Tech Design | `/mcv3:tech-design` | MODSPEC-{MOD}.md (API, DB, ADR) |
| 6. QA & Docs | `/mcv3:qa-docs` | TEST-{MOD}.md, USER/ADMIN GUIDE |
| 7. Code Gen | `/mcv3:code-gen` | Smart code-gen + Verification Loop (compile/lint/test/security) |
| 8a. Verify | `/mcv3:verify` | Traceability matrix + report |
| 8b. Deploy-Ops | `/mcv3:deploy-ops` | DEPLOY-OPS.md + checklist |

---

## Lifecycle Skills (Sprint 4)

Dùng sau khi project đã ở Phase 5+:

| Lệnh | Mục đích |
|------|---------|
| `/mcv3:status` | Dashboard tiến độ dự án (tất cả phases/systems) |
| `/mcv3:change-manager` | Quản lý requirements changes với impact analysis |
| `/mcv3:evolve` | Thêm features/modules/systems mới vào dự án |
| `/mcv3:migrate` | Import tài liệu cũ vào MCV3 format (incl. Scope 6: Ongoing) |
| `/mcv3:onboard` | Hướng dẫn user mới sử dụng plugin |
| `/mcv3:assess` | Đánh giá dự án in-progress, tìm gaps, tạo remediation plan |

---

## Working with Existing Projects (Phase A)

> **Bạn có dự án đang phát triển dở?** — MCV3 hỗ trợ tiếp nhận dự án in-progress.

### Vấn đề phổ biến

- Codebase đang chạy nhưng không có documentation
- Docs cũ (Word/PDF/Confluence) không sync với code
- Muốn biết dự án đang "thiếu" gì so với MCV3 pipeline
- Cần onboard vào MCV3 mà không muốn restart từ đầu

### Skill `/mcv3:assess`

Skill đánh giá chuyên biệt cho dự án in-progress:

```
/mcv3:assess
```

**Workflow:**
1. **Project Type Detection** — Phân loại: code-only / docs-only / mixed / production
2. **Structure Discovery** — Scan codebase → detect systems, modules, tech stack
3. **Per-System Assessment** — Đánh giá từng system đang ở phase nào trong MCV3
4. **Gap Analysis** — Phân loại gaps: CRITICAL / WARNING / INFO
5. **Code-Docs Sync** — So sánh APIs, DB tables, business rules giữa code và docs
6. **Remediation Roadmap** — Action plan với skill MCV3 tương ứng cho từng gap
7. **Initialize MCV3** — Tạo .mc-data/ với per-system phases đúng

**Output:**
- `_mcv3-work/assessment/PROJECT-MANIFEST.md`
- `_mcv3-work/assessment/ASSESSMENT-MATRIX.md`
- `_mcv3-work/assessment/GAP-REPORT.md`
- `_mcv3-work/assessment/SYNC-REPORT.md` (nếu có code + docs)
- `_mcv3-work/assessment/REMEDIATION-PLAN.md`

### Script: `scan-codebase.sh`

Tự động scan tech stack và cấu trúc code:

```bash
./scripts/scan-codebase.sh [project_root] [output.json]
```

Output `manifest.json` với:
- Tech stack (language, framework, ORM, testing)
- Systems và modules detected
- API endpoint count
- Database tables và migration count
- Test file count
- MCV3 REQ-ID comment status

### Per-System Phase Tracking

MCV3 hỗ trợ mỗi system có `currentPhase` riêng:

```json
{
  "systems": [
    { "code": "ERP", "currentPhase": "phase5-design" },
    { "code": "WEB", "currentPhase": "phase3-bizdocs" }
  ]
}
```

`mc_status` hiển thị phase per system, giúp track tiến độ trong dự án phức tạp.

---

## Formal ID System

Mọi tài liệu dùng formal IDs để traceability end-to-end:

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
| `NFR-NNN` | Non-Functional Req | NFR-001 |

Traceability chain: `PROB → BR → US → FT → AC → API/TBL → Code → TC`

---

## Smart Context Layering

Tiết kiệm context window với 4 layers:

```
mc_load({ filePath: "...", layer: 0 })  →  ~500B  Key facts (orientation)
mc_load({ filePath: "...", layer: 1 })  →  ~200B  Dependency map only
mc_load({ filePath: "...", layer: 2 })  →  ~5KB   Main sections
mc_load({ filePath: "...", layer: 3 })  →  Full   All content (default)
```

---

## 19 MCP Tools

### Sprint 0 — Core (5 tools)
| Tool | Mục đích |
|------|---------|
| `mc_init_project` | Khởi tạo dự án, tạo .mc-data/ structure |
| `mc_save` | Lưu artifact Markdown |
| `mc_load` | Đọc với Smart Context Layering |
| `mc_list` | Liệt kê documents |
| `mc_status` | Dashboard trạng thái |

### Sprint 1 — Session (5 tools)
| Tool | Mục đích |
|------|---------|
| `mc_checkpoint` | Lưu checkpoint session |
| `mc_resume` | Resume từ checkpoint |
| `mc_validate` | Validate document format/completeness |
| `mc_export` | Export bundle/summary/phase/index |
| `mc_search` | Full-text search trong project memory |

### Sprint 2 — Advanced (9 tools)
| Tool | Mục đích |
|------|---------|
| `mc_snapshot` | Snapshot đầy đủ project state |
| `mc_rollback` | Rollback về snapshot (với safety snapshot) |
| `mc_impact_analysis` | Phân tích impact khi thay đổi element |
| `mc_traceability` | Quản lý traceability matrix |
| `mc_dependency` | Quản lý document dependencies |
| `mc_compare` | So sánh 2 versions document |
| `mc_merge` | Merge content vào document |
| `mc_changelog` | Structured changelog management |
| `mc_summary` | Tạo summary project/phase/module |

---

## Cấu trúc Plugin

```
mcv3-devkit/
├── .claude-plugin/plugin.json     # Plugin manifest (v3.10.0)
├── .mcp.json                      # MCP server config
├── settings.json                  # Permissions & env vars
├── CLAUDE.md                      # Hướng dẫn cho Claude
├── CHANGELOG.md                   # Lịch sử thay đổi
├── skills/                        # 15 skills
│   ├── discovery/                 # Phase 1
│   ├── expert-panel/              # Phase 2
│   ├── biz-docs/                  # Phase 3
│   ├── requirements/              # Phase 4
│   ├── tech-design/               # Phase 5
│   ├── qa-docs/                   # Phase 6
│   ├── code-gen/                  # Phase 7
│   ├── verify/                    # Phase 8a
│   ├── deploy-ops/                # Phase 8b
│   ├── navigator/                 # Status dashboard
│   ├── change-manager/            # Lifecycle: Change management
│   ├── onboard/                   # Lifecycle: User onboarding
│   ├── evolve/                    # Lifecycle: Feature evolution
│   ├── migrate/                   # Lifecycle: Document migration
│   └── assess/                    # Phase A: Ongoing project assessment
├── agents/                        # 10 agents
│   ├── orchestrator.md
│   ├── doc-writer.md
│   ├── domain-expert.md + 12 industry refs (F&B, Logistics, Retail, SaaS, Healthcare, Fintech, E-Commerce, Real Estate, Manufacturing, Education, HR/HRM, Embedded/IoT)
│   ├── tech-expert.md
│   ├── ux-expert.md
│   ├── finance-expert.md + 3 refs
│   ├── legal-compliance-expert.md
│   ├── strategy-expert.md + 3 refs
│   ├── verifier.md
│   └── code-gen.md
├── mcp-servers/
│   └── project-memory/            # TypeScript MCP Server (19 tools)
│       ├── src/
│       │   ├── index.ts           # Server entry point
│       │   ├── types.ts           # TypeScript types
│       │   ├── tools/             # 19 tool implementations
│       │   └── utils/             # file-io, id-system, template-engine
│       ├── package.json
│       └── tsconfig.json
├── templates/                     # 25 document templates (tổ chức theo phase)
│   ├── p0-init/                   # Phase 0: MASTER-INDEX, key-facts
│   ├── p1-discovery/              # Phase 1: PROJECT-OVERVIEW
│   ├── p2-expert/                 # Phase 2: EXPERT-LOG, PROJECT-ARCHITECTURE
│   ├── p3-biz-docs/               # Phase 3: BIZ-POLICY, PROCESS, DATA-DICTIONARY
│   ├── p4-requirements/           # Phase 4: SYSTEM-INDEX, URS
│   ├── p5-tech-design/            # Phase 5: MODSPEC, ARCHITECTURE, DATA-MODEL, SERVICE-SPEC
│   ├── p6-qa-docs/                # Phase 6: TEST, USER-GUIDE, ADMIN-GUIDE
│   ├── p8a-verify/                # Phase 8a: VERIFY-P1/P2/P3, VERIFY-CROSS, VERIFY-INTEGRATION
│   └── p8b-deploy-ops/            # Phase 8b: DEPLOY-OPS
├── scripts/                       # 7 automation scripts
└── hooks/                         # hooks.json + script references
```

---

## Cấu trúc Project Data (.mc-data/)

Khi dùng MCV3 trên một dự án, dữ liệu lưu tại `.mc-data/`:

```
.mc-data/
└── projects/
    └── {project-slug}/
        ├── _config.json              # Cấu hình project
        ├── MASTER-INDEX.md           # Bản đồ toàn bộ tài liệu
        ├── _changelog.md             # Lịch sử thay đổi
        ├── _PROJECT/                 # Tài liệu cấp dự án
        │   ├── PROJECT-OVERVIEW.md
        │   ├── EXPERT-LOG.md
        │   ├── DATA-DICTIONARY.md
        │   ├── BIZ-POLICY/
        │   ├── PROCESS/
        │   ├── USER-GUIDE.md
        │   ├── ADMIN-GUIDE.md
        │   ├── DEPLOY-OPS.md
        │   └── EVOLUTION-LOG.md      # Sprint 4: evolution history
        ├── {SYSTEM-CODE}/
        │   ├── P1-REQUIREMENTS/      # URS files
        │   ├── P2-DESIGN/            # MODSPEC files
        │   └── P3-QA-DOCS/           # TEST files
        ├── _VERIFY-CROSS/            # Verification docs
        └── _mcv3-work/               # Working files
            ├── checkpoints/
            ├── snapshots/
            ├── change-log/           # Sprint 4: CHG records
            ├── evolution/            # Sprint 4: EVOL plans
            └── migration/            # Sprint 4: migration reports
```

---

## Agents

| Agent | Dùng khi |
|-------|---------|
| `orchestrator` | Điều phối chung, multi-system build order |
| `doc-writer` | Viết tài liệu MCV3 format |
| `domain-expert` | Phân tích nghiệp vụ (12 industries) |
| `tech-expert` | Tư vấn kỹ thuật, architecture |
| `ux-expert` | UX/UI design |
| `finance-expert` | Tài chính, pricing, ROI |
| `legal-compliance-expert` | Pháp lý, compliance |
| `strategy-expert` | Chiến lược, GTM, KPIs |
| `verifier` | Kiểm tra document quality |
| `code-gen` | Generate code + Verification Loop |

---

## Hooks

| Hook | Trigger | Mục đích |
|------|---------|---------|
| `SessionStart` | Bắt đầu session | Auto-load project context |
| `SessionStop` | Kết thúc session | Auto-save checkpoint |
| `PrePhaseTransition` | Chuyển phase | Validate documents đầy đủ |
| `PostPhaseCompletion` | Xong phase | Auto-snapshot milestone |
| `PreRequirementsGeneration` | Trước /mcv3:requirements | Check BizDocs ready |
| `PreTechDesign` | Trước /mcv3:tech-design | Check URS ready |
| `PreQADocs` | Trước /mcv3:qa-docs | Check MODSPEC ready |
| `PreCodeGen` | Trước /mcv3:code-gen | Check test coverage |
| `PreVerify` | Trước /mcv3:verify | Check code có REQ-IDs |
| `PreDeployOps` | Trước /mcv3:deploy-ops | Block nếu not READY |
| `PreChangeManager` | Trước /mcv3:change-manager | Check lifecycle prerequisites |
| `PreEvolve` | Trước /mcv3:evolve | Check lifecycle prerequisites |
| `PreMigrate` | Trước /mcv3:migrate | Check lifecycle prerequisites |
| `PreAssess` | Trước /mcv3:assess | Check lifecycle prerequisites |

---

## Scripts

```bash
# Validate test coverage (Phase 6 → 7)
./scripts/validate-test-coverage.sh <project_slug> [system] [module]

# Generate traceability report (Phase 8)
./scripts/generate-traceability-report.sh <project_slug> [output_file]

# Validate phase transition
./scripts/validate-phase-transition.sh

# Auto-checkpoint (gọi bởi SessionStop hook)
./scripts/auto-checkpoint.sh

# Auto-snapshot milestone (gọi bởi PostPhaseCompletion hook)
./scripts/auto-snapshot-milestone.sh

# Load project context (gọi bởi SessionStart hook)
./scripts/load-project-context.sh

# Sprint 4: Validate trước lifecycle skills (change-manager, evolve, migrate, assess)
./scripts/check-lifecycle-prerequisites.sh <skill> <project_slug>

# Phase A: Quét codebase để hỗ trợ /mcv3:assess
./scripts/scan-codebase.sh [project_root] [output.json]
```

---

## Industry Support

Domain Expert agent có knowledge base cho 12 ngành:

| Industry | Knowledge Base | Trọng tâm |
|----------|---------------|---------|
| F&B | industry-fnb.md | Menu, kitchen ops, delivery |
| Logistics | industry-logistics.md | WMS, TMS, last-mile |
| Retail | industry-retail.md | POS, inventory, omnichannel |
| SaaS | industry-saas.md | Subscription, onboarding, churn |
| Healthcare | industry-healthcare.md | EMR, HIS, BHYT, KCB law |
| Fintech | industry-fintech.md | Core banking, AML, PCI-DSS |
| E-Commerce | industry-ecommerce.md | Cart, checkout, marketplace |
| **Real Estate** | industry-realestate.md | BĐS, CRM, commission, Luật Đất đai 2024 |
| **Manufacturing** | industry-manufacturing.md | BOM, MRP, QC, ISO 9001, C/O |
| **Education** | industry-education.md | LMS, quản lý học sinh, Bộ GD&ĐT |
| **HR/HRM** | industry-hr.md | Payroll, BHXH, PIT, Bộ Luật LĐ 2019 |
| **Embedded/IoT** | industry-embedded.md | MCU platforms, firmware patterns, IoT protocols |

---

## Quick Start

```
# Lần đầu dùng MCV3:
/mcv3:onboard          → Tutorial tùy chỉnh theo loại user bạn là

# Bắt đầu dự án mới:
Nói với Claude: "Tạo dự án mới tên X, ngành Y"
/mcv3:discovery        → Bắt đầu pipeline (discovery tự recommend scale phù hợp)

# Dự án đang chạy:
/mcv3:status           → Xem tiến độ hiện tại (per system)
/mcv3:change-manager   → Quản lý requirements changes
/mcv3:evolve           → Thêm features mới

# Import tài liệu cũ:
/mcv3:migrate          → Convert từ Word/Confluence/code

# Dự án in-progress (code hoặc docs cũ, chưa đồng bộ):
/mcv3:assess           → Đánh giá toàn diện, tìm gaps, nhận remediation plan
```

---

## Tài liệu kỹ thuật

- [CHANGELOG.md](CHANGELOG.md) — Lịch sử thay đổi
- [CLAUDE.md](CLAUDE.md) — Hướng dẫn cho Claude (MCP tools, workflow, ID system)

---

## License

MIT — Xem [LICENSE](LICENSE) để biết chi tiết.
