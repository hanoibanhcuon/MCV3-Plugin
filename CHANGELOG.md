# CHANGELOG — MasterCraft DevKit (MCV3)

Mọi thay đổi đáng kể của dự án được ghi nhận tại đây.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.4.0] — Sprint 4 — Lifecycle & Polish — 2026-03-19

### Added — Skills mới (Lifecycle Management)

- **`/mcv3:change-manager`** — Quản lý thay đổi requirements sau khi đã có tài liệu
  - Impact analysis: thay đổi 1 element → xác định toàn bộ documents bị ảnh hưởng
  - Guided document update: hiển thị current vs proposed, user confirm từng bước
  - Safety snapshot trước mỗi thay đổi lớn
  - Structured changelog entry sau mỗi change
  - References: `change-management-patterns.md`, `impact-assessment-guide.md`

- **`/mcv3:onboard`** — Hướng dẫn user mới sử dụng MCV3
  - 3 tutorial modes: Developer, PM/BA, Business Owner
  - Interactive tutorial với demo workflow
  - MCP Server setup verification
  - Cheat sheet đầy đủ tất cả commands
  - References: `quick-start-developer.md`, `quick-start-pm.md`, `quick-start-business.md`

- **`/mcv3:evolve`** — Phát triển và mở rộng dự án đã hoàn thành
  - 4 evolution scopes: thêm sub-feature, thêm module, thêm system, MVP → Full
  - Version management với Semantic Versioning (MAJOR.MINOR.PATCH)
  - Backward compatibility enforcement
  - EVOLUTION-LOG tracking history
  - References: `versioning-patterns.md`, `feature-extension-guide.md`

- **`/mcv3:migrate`** — Migrate tài liệu cũ sang MCV3 format
  - 5 migration sources: Word/PDF, Confluence/Notion, codebase, informal stories, mixed
  - Auto-assign Formal IDs (BR, US, FT, AC, API, TBL)
  - Gap detection và migration report
  - Format conversion: BRD, FRD, Use Case Spec, Swagger, SQL schema → MCV3 templates
  - References: `migration-checklist.md`, `format-conversion-guide.md`

### Added — Industry Knowledge Bases

- **Healthcare** (`agents/domain-expert/references/industry-healthcare.md`)
  - HIS/EMR/LIS/PMS systems
  - Healthcare business rules (KCB law, pharmacy regulations, BHYT)
  - Data model: Patient, Visit, Diagnosis, Prescription
  - ICD-10 coding, eKYC requirements
  - Compliance: Luật KCB 2023, PDPA, audit trail requirements

- **Fintech** (`agents/domain-expert/references/industry-fintech.md`)
  - Core Banking, Digital Banking, Payment systems
  - Business rules: KYC levels, transaction limits (TT 39/2014), AML
  - Data model: Customer, Account, Transaction, Ledger Entry
  - Double-entry bookkeeping trong code
  - Compliance: NHNN regulations, PCI-DSS, AML/CTR reporting
  - Technical patterns: Idempotency, distributed locking, reconciliation

- **E-Commerce** (`agents/domain-expert/references/industry-ecommerce.md`)
  - Marketplace, B2C/B2B, Social Commerce
  - Business rules: inventory management, order lifecycle, promotions
  - Data model: Product/SKU, Cart, Order, Shipment, Payment
  - Cart checkout flow, search/discovery patterns
  - Vietnam integrations: VNPay, MoMo, GHN, GHTK, VAT

### Updated — Documentation

- `README.md` — Cập nhật đầy đủ Sprint 4 features, pipeline mới, tất cả commands
- `CLAUDE.md` — Cập nhật skills table và MCP tools section
- `plugin.json` — Version bump to 3.4.0

### Updated — Configuration

- `settings.json` — Thêm permissions cho Sprint 4 skills
- `hooks/hooks.json` — Thêm hooks cho `PreChangeManager`, `PreEvolve`, `PreMigrate`

---

## [3.3.0] — Sprint 3 — QA + Code + Deploy — 2026-03-17

### Added — Skills mới (Phase 6-8)

- **`/mcv3:qa-docs`** — Tạo Test Cases, UAT Scenarios, User Guide, Admin Guide
  - TC-xxx và UAT-xxx formal IDs
  - AC → TC traceability
  - USER-GUIDE.md chapter per module
  - ADMIN-GUIDE.md section per module
  - References: test-strategy-patterns.md, test-case-writing-guide.md, quality-metrics.md

- **`/mcv3:code-gen`** — Generate code scaffolding từ MODSPEC
  - 5-layer code structure: controller, service, repository, dtos, tests
  - Database migration SQL files
  - REQ-ID comments: `@req-ids US-xxx`, `@api-ids API-xxx`
  - References: code-patterns.md, tech-stack-guides.md

- **`/mcv3:verify`** — Cross-verify traceability end-to-end
  - 4 phases: URS verify, Design verify, Test verify, Code verify
  - Traceability matrix: PROB → BR → US → FT → API → TBL → Code → TC
  - Status: READY / NEEDS ATTENTION / NOT READY
  - References: traceability-guide.md + 7 verify templates

- **`/mcv3:deploy-ops`** — Tạo DEPLOY-OPS.md hoàn chỉnh
  - Deploy plan, Go-live checklist (T-7 → T+7)
  - Rollback plan với triggers
  - Monitoring setup (metrics, alerts, dashboards)
  - SLA definitions (uptime, response, support tiers)
  - References: deploy-patterns.md, monitoring-guide.md, sla-templates.md

### Added — Scripts

- `scripts/validate-test-coverage.sh` — Validate AC coverage trước Code Gen
- `scripts/generate-traceability-report.sh` — Generate traceability report (Phase 8)
- `scripts/check-code-gen-ready.sh` — Check code gen prerequisites
- `scripts/check-verify-ready.sh` — Check verification prerequisites

### Added — Hooks

- `PreQADocs` — Validate MODSPEC trước QA Docs
- `PreCodeGen` — Validate test coverage trước Code Gen
- `PreVerify` — Check code có REQ-ID trước Verify
- `PreDeployOps` — Block nếu verification-report chưa READY

### Added — Templates

- `TEST-TEMPLATE.md` — Test cases với TC-xxx IDs
- `USER-GUIDE-TEMPLATE.md` — User guide per chapter
- `ADMIN-GUIDE-TEMPLATE.md` — Admin guide per section
- `DEPLOY-OPS-TEMPLATE.md` — Deployment operations
- `VERIFY-P1/P2/P3-TEMPLATE.md` — Verification per phase
- `VERIFY-CROSS-P1/P2-TEMPLATE.md` — Cross-system verification
- `VERIFY-INTEGRATION-TEMPLATE.md` — Integration verification
- `VERIFY-PROJECT-TEMPLATE.md` — Project-level verification

### Added — Agents

- `code-gen.md` — Agent generate code scaffolding từ MODSPEC

---

## [3.2.0] — Sprint 2 — Advanced Tools — 2026-03-15

### Added — MCP Tools mới (Sprint 2, tools 11-19)

- **`mc_snapshot`** — Snapshot đầy đủ project state tại milestone
- **`mc_rollback`** — Rollback về snapshot trước (với safety snapshot tự động)
- **`mc_impact_analysis`** — Phân tích ảnh hưởng khi thay đổi requirement
- **`mc_traceability`** — Quản lý traceability matrix PROB→BR→US→FT→API→TC
- **`mc_dependency`** — Quản lý producer-consumer dependencies giữa documents
- **`mc_compare`** — So sánh 2 versions của document
- **`mc_merge`** — Merge content từ nhiều sources vào document
- **`mc_changelog`** — Structured changelog management
- **`mc_summary`** — Tạo summary project/phase/module/executive

### Added — Skills mới

- **`/mcv3:tech-design`** — Thiết kế MODSPEC all-in-one (Phase 5)
  - API endpoints, DB schema, Components, ADR
  - API-{SYS}-xxx và TBL-{SYS}-xxx IDs
  - References: api-design-patterns.md, data-modeling-guide.md

- **`/mcv3:biz-docs`** — Tạo BIZ-POLICY, PROCESS, DATA-DICTIONARY (Phase 3)
  - BR-{DOM}-xxx formal IDs
  - AS-IS/TO-BE process flows
  - Industry templates: F&B, Logistics, Retail, SaaS, HR

### Added — Agents

- `legal-compliance-expert.md` — Pháp lý & compliance
- `finance-expert.md` với references: financial-modeling, pricing-strategies, operations-frameworks
- `strategy-expert.md` với references: business-model-patterns, go-to-market-frameworks, kpi-frameworks

### Added — Scripts

- `scripts/auto-snapshot-milestone.sh` — Tự động snapshot khi milestone
- `scripts/validate-phase-transition.sh` — Validate trước phase transition
- `scripts/load-project-context.sh` — Auto-load context khi start session
- `scripts/auto-checkpoint.sh` — Auto-checkpoint khi end session

---

## [3.1.0] — Sprint 1 — Extended Tools — 2026-03-12

### Added — MCP Tools mới (Sprint 1, tools 6-10)

- **`mc_checkpoint`** — Lưu checkpoint session với nextActions
- **`mc_resume`** — Resume từ checkpoint trong session mới
- **`mc_validate`** — Validate format/completeness/IDs của documents
- **`mc_export`** — Export documents: bundle | summary | phase | index
- **`mc_search`** — Full-text search qua project memory

### Added — Skills mới

- **`/mcv3:requirements`** — Viết URS với formal IDs (Phase 4)
  - US-xxx, FT-xxx, AC-xxx, NFR-xxx, UC-xxx
  - Guided Generation Protocol + Enrichment Loop
  - Completeness checks + traceability matrix

### Added — Industry Reference Templates

- `biz-docs/references/industry/`: F&B, Logistics, Retail
- `biz-docs/references/skeleton/`: HR, Pricing, Process, Sales
- `discovery/references/interview-frameworks/`: general, fnb, logistics, retail, saas

---

## [3.0.0] — Sprint 0 — Foundation — 2026-03-10

### Added — Core Infrastructure

- MCV3 Plugin structure: `plugin.json`, `.mcp.json`, `settings.json`
- Claude.md với đầy đủ hướng dẫn workflow

### Added — MCP Server: `mcv3-project-memory`

Core 5 tools:
- **`mc_init_project`** — Khởi tạo dự án, tạo `.mc-data/` structure
- **`mc_save`** — Lưu artifact Markdown với auto-changelog
- **`mc_load`** — Đọc với Smart Context Layering (4 layers)
- **`mc_list`** — Liệt kê documents với filter
- **`mc_status`** — Dashboard trạng thái dự án

### Added — Core Skills

- **`/mcv3:navigator`** (`/mcv3:status`) — Dashboard tiến độ + next steps
- **`/mcv3:discovery`** — Thu thập requirements, tạo PROJECT-OVERVIEW (Phase 1)
- **`/mcv3:expert-panel`** — AI Expert Panel analysis, tạo EXPERT-LOG (Phase 2)

### Added — Core Agents

- `orchestrator.md` — Điều phối chung
- `doc-writer.md` — Viết tài liệu MCV3 format
- `domain-expert.md` + 4 industry references (FnB, Logistics, Retail, SaaS)
- `ux-expert.md` — UX/UI design
- `verifier.md` — Kiểm tra document quality
- `tech-expert.md` — Technical advice

### Added — Base Templates (17 templates)

- PROJECT-OVERVIEW-TEMPLATE.md, MASTER-INDEX-TEMPLATE.md
- BIZ-POLICY-TEMPLATE.md, PROCESS-TEMPLATE.md
- DATA-DICTIONARY-TEMPLATE.md, EXPERT-LOG-TEMPLATE.md
- URS-TEMPLATE.md, MODSPEC-TEMPLATE.md
- ARCHITECTURE-TEMPLATE.md, SERVICE-SPEC-TEMPLATE.md
- DATA-MODEL-TEMPLATE.md, SYSTEM-INDEX-TEMPLATE.md
- key-facts-template.md

### Added — .mc-data Structure

```
.mc-data/projects/{slug}/
├── _config.json
├── MASTER-INDEX.md
├── _changelog.md
├── _PROJECT/
├── {SYSTEM-CODE}/P1-REQUIREMENTS/
├── {SYSTEM-CODE}/P2-DESIGN/
├── _SHARED-SERVICES/
├── _VERIFY-CROSS/
└── _mcv3-work/
```

---

*Xem thêm chi tiết trong git log và commit messages.*
