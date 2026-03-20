# CHANGELOG — MasterCraft DevKit (MCV3)

Mọi thay đổi đáng kể của dự án được ghi nhận tại đây.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.11.0] — Auto-Mode Framework — Tất cả skills chạy tự động hoàn toàn — 2026-03-20

### Added

- **`knowledge/auto-mode-protocol.md`** (NEW) — Shared Auto-Mode Protocol cho tất cả 15 skills:
  - 5-bước framework: Auto Execute → Self-Consult → Completion Report → User Review → Next Step
  - DECISION-LOG format: problem, context, experts consulted, choice, reason, alternatives, confidence
  - "KHÔNG BAO GIỜ" list: hỏi module nào, confirm, thêm gì không, module tiếp, bắt đầu, tech stack
  - "LUÔN LUÔN" list: tự chọn order, tự detect tech stack, tự quyết + ghi DECISION, checkpoint, báo cáo

### Changed

- **`CLAUDE.md`** (root) — Cập nhật version lên v3.11.0:
  - Thêm section `## Auto-Mode Framework` với 5-bước flow và KHÔNG BAO GIỜ / LUÔN LUÔN rules
  - Plugin description cập nhật với Auto-Mode Framework feature

- **15 SKILL.md files** — Thêm `## CHẾ ĐỘ VẬN HÀNH — Auto-Mode` section + xóa interactive prompts:
  - `skills/discovery/SKILL.md` — Phase 0/4/5: tự chọn chế độ, tự quyết tiếp tục, báo cáo chuẩn
  - `skills/expert-panel/SKILL.md` — Phase 5: xóa "Hỏi về Open Issues" → tự ghi vào EXPERT-LOG
  - `skills/biz-docs/SKILL.md` — Phase 0/1/2c/2d/4: tự xác định domains, auto-fill từ industry knowledge
  - `skills/requirements/SKILL.md` — Phase 0/1/3b/4/6: module auto-detection, auto-complete generation
  - `skills/tech-design/SKILL.md` — Phase 0/1b/2c: auto module order, auto tech stack extraction
  - `skills/qa-docs/SKILL.md` — Phase 0/1c/3e: auto module order, auto test strategy, auto coverage report
  - `skills/code-gen/SKILL.md` — Phase 0: auto module order, auto-start
  - `skills/verify/SKILL.md` — Phase 0 / Partial Mode: xóa "Bắt đầu verification?", auto-detect scope
  - `skills/deploy-ops/SKILL.md` — Phase 1b: auto-detect deployment info từ PROJECT-ARCHITECTURE
  - `skills/assess/SKILL.md` — Phase 0 / Phase 1a: auto-detect project type, auto-scan codebase
  - `skills/change-manager/SKILL.md` — Phase 0/2c/4b/Multi-Change: auto-apply updates, auto dependency order
  - `skills/evolve/SKILL.md` — Phase 0/2d/2e: auto-detect scope, auto versioning strategy
  - `skills/migrate/SKILL.md` — Phase 0/3b/Scope 6: auto-detect source, auto-start, auto assess check
  - `skills/onboard/SKILL.md` — Phase 1A.4/1D.1/3: auto demo, auto-detect ongoing type, auto-proceed
  - `skills/navigator/SKILL.md` — Thêm CHẾ ĐỘ section (navigator đã auto, confirm consistency)

- **`agents/orchestrator.md`** — Thêm Auto-Mode Protocol reference + cập nhật quy tắc điều phối:
  - Thay "USER-DRIVEN" → "AUTO-PROCEED" (tự chuyển phase khi prerequisites đủ)
  - Thêm section `## Auto-Mode Protocol` với 3 rules: AUTO-EXECUTE, SELF-CONSULT, REPORT-AFTER

- **`agents/doc-writer.md`** — Thêm Auto-Mode Protocol reference:
  - Thêm section `## Auto-Mode Protocol` với 4 rules: AUTO-FILL, DECISION-LOG, NO-PLACEHOLDER, AUTO-COMPLETE-AC

### Rationale

Trước v3.11.0, skills dừng hỏi user tại nhiều điểm: "module nào trước?", "bắt đầu chưa?", "confirm không?". Điều này làm gián đoạn workflow và yêu cầu user phải manually drive từng bước. Auto-Mode Framework giải quyết bằng cách: (1) skills tự động hoàn toàn từ đầu đến cuối, (2) khi ambiguous → tự quyết và ghi DECISION-LOG để user review sau, (3) báo cáo structured sau khi xong để user có full picture. User chỉ cần trigger skill và review report — không cần supervise từng step.

---

## [3.10.1] — Skill Quality Improvements — Semantic Descriptions + Error Handling — 2026-03-20

### Changed

- **15 Command files** (`.claude/commands/mcv3/*.md`) — Cập nhật semantic descriptions:
  - Mỗi file giờ có 1 dòng mô tả rõ skill làm gì, output gì, trigger khi nào
  - Không còn description chung "Đọc file SKILL.md..." — thay bằng context-aware trigger conditions
  - Cải thiện discoverability khi user cần chọn skill phù hợp

- **10 Pipeline SKILL.md files** — Thêm Error Recovery + token efficiency:
  - `skills/discovery/SKILL.md`, `skills/expert-panel/SKILL.md`, `skills/biz-docs/SKILL.md`
  - `skills/requirements/SKILL.md`, `skills/tech-design/SKILL.md`, `skills/qa-docs/SKILL.md`
  - `skills/code-gen/SKILL.md`, `skills/verify/SKILL.md`, `skills/deploy-ops/SKILL.md`
  - `skills/assess/SKILL.md`
  - Mỗi file có section `## Error Recovery` với cases cụ thể: mc_save/load fail, missing prereqs, conflict resolution
  - Checkpoint instructions rõ ràng theo từng phase

- **5 Lifecycle SKILL.md files** — Semantic descriptions + Error Handling:
  - `skills/change-manager/SKILL.md`, `skills/onboard/SKILL.md`, `skills/migrate/SKILL.md`
  - `skills/evolve/SKILL.md` — Thêm `## Error Recovery` section (mc_save fail, Phase 5+ requirement, snapshot fail, merge conflict, version conflict)
  - `skills/navigator/SKILL.md` — Thêm `## Checkpoint Hint` section (read-only skill, gợi ý checkpoint trước skill tiếp theo)

### Rationale

Skills trước đây có descriptions chung chung và thiếu error handling cho các edge cases phổ biến. Cải thiện này giúp: (1) Claude chọn đúng skill hơn nhờ semantic descriptions, (2) Skills recover gracefully khi MCP server fail hoặc missing prerequisites, (3) Users có feedback rõ ràng khi gặp lỗi thay vì session bị stuck.

---

## [3.10.0] — Code Quality Assurance — Verification & Auto-Fix Loop — 2026-03-19

### Added

- **`skills/code-gen/references/verification-loop.md`** (NEW) — Hướng dẫn chi tiết Phase 9 Verification & Auto-Fix Loop với 8 bước bắt buộc:
  - Bước 1: Compile Check (tsc / py_compile / go build) + self-healing max 3 retry
  - Bước 2: Lint Check (ESLint / Ruff) + auto-fix
  - Bước 3: Unit Test Run (Jest / pytest) + phân tích failure + self-fix
  - Bước 4: Security Scan (checklist nội bộ, không cần external tool)
  - Bước 5: Integration Verification (cross-layer consistency check)
  - Bước 6: Migration Test (up + down rollback)
  - Bước 7: Coverage Report (Lines ≥ 80%, Branches ≥ 70%)
  - Bước 8: Final Report template cho user
- **`skills/code-gen/references/security-checklist.md`** (NEW) — Security checklist tự động 6 sections:
  - Input Validation (CRITICAL): Zod/Joi, path params, file uploads, query sanitize
  - Auth & Authz (CRITICAL): authenticate middleware, role-based authorize, password hashing
  - Data Protection (HIGH): sensitive data in response, logging, ORM queries, CORS
  - Injection Prevention (HIGH): SQL string concat, eval(), JSON.parse try-catch
  - Headers & Transport (MEDIUM): Helmet, rate limiting, request size limit
  - Secrets Management (CRITICAL): no hardcoded credentials, .env.example, .gitignore
  - Scoring matrix: CRITICAL fail = BLOCK | HIGH fail = WARN | MEDIUM = INFO
- **`skills/code-gen/references/rollback-mechanism.md`** (NEW) — Rollback safety protocol:
  - Pre-codegen: mc_checkpoint + git branch/stash + file list
  - In-progress: checkpoint per phase, no rollback of passing phases
  - Rollback trigger conditions: compile fail 3x, test fail >50%, security CRITICAL unfixable
  - 3 rollback options: git, manual file delete, mc_rollback
  - Không xóa code user đã viết — chỉ rollback code MCV3 gen

### Changed

- **`skills/code-gen/SKILL.md`** — Thêm **Phase 9: Verification & Auto-Fix Loop** (sau Phase 5, trước Phase 6):
  - 8 sub-phases: compile → lint → test → security → integration → migration → coverage → final report
  - Cập nhật DEPENDENCY MAP: thêm 3 references mới (verification-loop, security-checklist, rollback-mechanism)
  - Cập nhật Post-Gate: thêm Verification Loop quality gates (compile/lint/test/security/integration/migration/coverage)
- **`agents/code-gen.md`** — Thêm section **QUY TẮC KIỂM TRA CHẤT LƯỢNG** (rules 15-36):
  - 6 rules về Compile & Lint (bắt buộc, không skip)
  - 3 rules về Tests (bắt buộc, self-fix)
  - 4 rules về Security (auto-fix CRITICAL, SECURITY-WARNING marker cho HIGH)
  - 3 rules về Integration check
  - 2 rules về Migration rollback
  - 4 rules về Coverage threshold
  - 3 rules về Rollback safety
  - 3 rules về Cross-system verification
  - Cập nhật References: thêm 3 references mới
- **`skills/verify/SKILL.md`** — Thêm Phase 4b.7: Verification Loop Results:
  - Kiểm tra code-gen đã chạy Phase 9 chưa
  - 7 checks: compile errors, test fails, security warnings, coverage, integration, migration
  - Cảnh báo khi thiếu verification loop
- **`CLAUDE.md`** — Cập nhật version 3.8 → 3.10, thêm **Batch E** section:
  - Mô tả Phase 9 Verification Loop
  - Danh sách references mới

### Rationale

Code-gen trước đây chỉ gen code mà không tự kiểm tra. Developer phải chạy compile/test/lint thủ công và tự xử lý security issues. Batch E biến `/mcv3:code-gen` thành một "mini CI pipeline" chạy ngay sau gen code: tự phát hiện và sửa lỗi thường gặp, đảm bảo mọi module pass qua quality gates trước khi sang `/mcv3:verify`.

---

## [3.9.0] — Smart Code-Gen — Gộp SCAFFOLD + IMPLEMENT thành 1 chế độ thông minh — 2026-03-19

### Changed

- **`skills/code-gen/SKILL.md`** — Xóa mode selector (SCAFFOLD/IMPLEMENT), gộp thành 1 flow thông minh:
  - Specs đầy đủ → sinh code hoàn chỉnh tự động
  - Specs mơ hồ → sinh code best-effort + `// REVIEW: [câu hỏi cụ thể]`
  - Thiếu specs → sinh interface + `// PENDING: Cần bổ sung tại Phase X`
  - Phase 0 không còn hỏi chọn mode — user chỉ cần chọn module
  - Post-Gate báo cáo theo markers: không có marker / có REVIEW / có PENDING
- **`agents/code-gen.md`** — Xóa sections "SCAFFOLD mode" và "IMPLEMENT mode", thay bằng `QUY TẮC SINH CODE` thống nhất (14 rules)
- **`CLAUDE.md`** — Cập nhật mô tả: "Smart Code-Gen" thay cho "Full Implementation Engine (IMPLEMENT mode)"
- **`skills/verify/SKILL.md`** — Phase 4b đổi tên từ "IMPLEMENT Mode Completeness" → "Code Completeness Checks"; thêm check REVIEW/PENDING markers
- **`skills/code-gen/references/implementation-patterns.md`** — Đổi "Post-Gate IMPLEMENT Mode" → "Post-Gate Code Quality"; cập nhật checklist với marker pattern
- **`skills/code-gen/references/query-patterns.md`** — Xóa "(dùng trong IMPLEMENT mode)" khỏi mô tả
- **`skills/code-gen/references/validation-codegen.md`** — Xóa "(dùng trong IMPLEMENT mode)" khỏi mô tả
- **`skills/code-gen/references/test-codegen.md`** — Xóa "(dùng trong IMPLEMENT mode)" khỏi mô tả

### Rationale

User không cần chọn mode — Claude tự động sinh code tốt nhất có thể dựa trên mức độ chi tiết của specs hiện có. Điều này loại bỏ friction và giữ nguyên toàn bộ capability của IMPLEMENT mode làm default.

---

## [3.8.0] — Batch D — Full Implementation Engine & Multi-System Orchestration — 2026-03-19

### Added — Full Implementation Engine (Phase 7 IMPLEMENT mode)

- **`skills/code-gen/SKILL.md`** — Thêm 2 modes: SCAFFOLD (cũ) và IMPLEMENT (mới, zero TODOs)
  - IMPLEMENT mode: BR-to-Code transpiler, real queries, Zod schemas, real tests, CI pipeline
  - Mode selector prompt khi bắt đầu Phase 7
- **`skills/code-gen/references/implementation-patterns.md`** — BR-to-Code transpiler rules (6 loại BR):
  - Validation → if/throw, Calculation → function, Workflow → state machine
  - BusinessRuleError class, error codes, GitHub Actions CI YAML
- **`skills/code-gen/references/query-patterns.md`** — Prisma/SQLAlchemy CRUD thực:
  - Create/Read/Update/Delete với nested relations, pagination, sorting
  - Aggregation queries, transaction patterns
- **`skills/code-gen/references/validation-codegen.md`** — TBL column → Zod schemas:
  - Column type mapping, BR refinements, DTO validation middleware
- **`skills/code-gen/references/test-codegen.md`** — TC specs → real test code:
  - faker.js factories, integration tests với DB, error case testing, jest config
- **`agents/code-gen.md`** — Mode-aware rules (SCAFFOLD vs IMPLEMENT), post-gate zero-TODO enforcement

### Added — Multi-System Orchestration (Phase 5 + Phase 7)

- **`skills/tech-design/references/multi-system-design.md`** — Kiến trúc đa system:
  - System dependency analysis (data, API, event), build order algorithm (5 layers)
  - Saga pattern cho distributed transactions
- **`skills/code-gen/references/integration-patterns.md`** — HTTP client patterns:
  - Axios wrapper với retry, circuit breaker, event pub/sub (EventEmitter + Redis)
- **`agents/orchestrator.md`** — Multi-System Build Order Protocol:
  - 5-step algorithm, topological sort, parallel build opportunities per layer
- **`templates/_shared-services/AUTH-SPEC-TEMPLATE.md`** — JWT RS256, RBAC, DB schema
- **`templates/_shared-services/NOTIFICATION-SPEC-TEMPLATE.md`** — Channels, templates, event listeners
- **`templates/_shared-services/FILE-SERVICE-SPEC-TEMPLATE.md`** — Upload/download, storage abstraction

### Added — Audit Fixes (post-Batch D)

- **`skills/verify/SKILL.md`** — Thêm Phase 4b: IMPLEMENT Mode Completeness checks
  - Zero TODO check, BR implementation check, real query check, Zod schema check, CI pipeline check
- **`mcp-servers/project-memory/src/types.ts`** — Thêm `ModuleProgress` interface
  - Track per-module code-gen status (mode, status, filesGenerated, todoCount)
- **`mcp-servers/project-memory/src/tools/mc-checkpoint.ts`** — Thêm `implementationProgress` field
  - Checkpoint có thể lưu Code-Gen Progress table per module

### Changed

- **`settings.json`** — Version bump: `3.7.0` → `3.8.0`, Sprint: `7` → `8`
- **`CLAUDE.md`** — Cập nhật description với Full Implementation Engine + Multi-System Orchestration

---

## [3.7.0] — Batch C — Scale Flexibility & Industry Expansion — 2026-03-19

### Added — Scale Decision Matrix

- **`skills/discovery/references/scale-decision-matrix.md`** — Hướng dẫn chọn pipeline theo quy mô:
  - Micro (< 10 endpoints, 1 dev) → Phase 1 → 5 → 7
  - Small (< 30 endpoints, 1-2 devs) → Phase 1 → 4 → 5 → 7 → 8a
  - Medium / Large / Enterprise — full pipeline tùy mức độ
- `CLAUDE.md` cập nhật "Scale-aware pipeline" rule (quy tắc 2)

### Added — Industry Knowledge Bases (4 ngành mới)

- **`agents/domain-expert/references/industry-realestate.md`** — BĐS VN, Luật Đất đai 2024, CRM môi giới
- **`agents/domain-expert/references/industry-manufacturing.md`** — BOM, MRP, QC, ISO 9001, C/O, Lean
- **`agents/domain-expert/references/industry-education.md`** — LMS, quản lý học sinh, Bộ GD&ĐT
- **`agents/domain-expert/references/industry-hr.md`** — Payroll, BHXH, PIT, Bộ Luật LĐ 2019

### Added — Interview Frameworks mới (4 frameworks)

- `skills/discovery/references/interview-frameworks/ecommerce.md`
- `skills/discovery/references/interview-frameworks/fintech.md`
- `skills/discovery/references/interview-frameworks/healthcare.md`
- `skills/discovery/references/interview-frameworks/realestate.md`

### Added — Biz-Docs Industry References mới (4 ngành)

- `skills/biz-docs/references/industry/ecommerce.md` — KPIs, BRs, compliance E-Commerce
- `skills/biz-docs/references/industry/fintech.md` — KPIs, BRs, PCI-DSS, NHNN
- `skills/biz-docs/references/industry/healthcare.md` — KPIs, BRs, Luật KCB 2023
- `skills/biz-docs/references/industry/saas.md` — KPIs, BRs, SLA, subscription

### Added — Tech Stack Guides mới (3 guides)

- **`skills/code-gen/references/tech-stack-nextjs.md`** — Next.js 14+ App Router, Server Actions, Prisma, NextAuth
- **`skills/code-gen/references/tech-stack-mobile.md`** — React Native / Flutter, Expo, EAS, Zustand, TanStack Query
- **`skills/code-gen/references/database-nosql-guide.md`** — MongoDB, Firebase, Supabase, Redis, SQLite

---

## [3.6.0] — Batch B — Embedded/MCU Module — 2026-03-19

### Added — Embedded/IoT Industry Knowledge Base

- **`agents/domain-expert/references/industry-embedded.md`** — MCU platforms, firmware patterns, IoT protocols, smart farm/home VN
  - Platforms: ESP32, STM32, Arduino, Raspberry Pi
  - Protocols: MQTT, CoAP, Modbus RTU/TCP, BACnet, LoRaWAN
  - RTOS patterns: FreeRTOS tasks, semaphores, state machines
  - Smart Farm & Smart Home use cases cho thị trường VN

### Added — Firmware Templates & Guides

- **`templates/p5-tech-design/FIRMWARE-MODSPEC-TEMPLATE.md`** — Template cho Embedded:
  - Pin map, RTOS task table, State machine diagram, Protocol spec
- **`skills/code-gen/references/embedded-code-patterns.md`** — Code patterns MCU/firmware
- **`skills/code-gen/references/embedded-tech-stack-guide.md`** — Tech stack guide Embedded (734 dòng, 44 code blocks)
- **`skills/qa-docs/references/embedded-test-guide.md`** — Testing strategies cho firmware/hardware
- **`skills/deploy-ops/references/firmware-deploy-guide.md`** — OTA update, flash procedures, rollback

### Added — Interview Framework

- **`skills/discovery/references/interview-frameworks/embedded.md`** — Questions cho Embedded/IoT projects

---

## [3.5.0] — Phase A — Ongoing Project Support — 2026-03-19

### Added — Skill mới: `/mcv3:assess`

- **`/mcv3:assess`** — Đánh giá dự án đang phát triển dở (ongoing/in-progress projects)
  - Phase 0: Project Type Detection — 4 loại (A/B/C/D)
  - Phase 1: Structure Discovery — scan codebase hoặc classify docs
  - Phase 2: Per-System Assessment — đánh giá phase hiện tại của từng system
  - Phase 3: Gap Analysis — phân loại CRITICAL/WARNING/INFO gaps
  - Phase 4: Code-Docs Sync Check — so sánh APIs, DB, business rules
  - Phase 5: Remediation Roadmap — action plan với skill routing
  - Phase 6: Initialize MCV3 — tạo .mc-data/ với per-system phases
  - References: `assessment-checklist.md`, `code-patterns-detection.md`, `sync-check-rules.md`, `project-type-guides.md`

### Added — Script mới

- **`scripts/scan-codebase.sh`** — Quét codebase tự động:
  - Detect tech stack: Node.js/Python/Java/Go/Ruby
  - Detect framework: NestJS/Express/FastAPI/Spring Boot/...
  - Count API endpoints, DB tables, test files
  - Check MCV3 REQ-ID comment status
  - Output: `manifest.json` cho `/mcv3:assess`

### Updated — `/mcv3:migrate` (Scope 6)

- Thêm **Scope 6: Ongoing Project Integration** — Mixed-Phase Mode:
  - Import assets từ nhiều phases cùng lúc (không cần phase sequential)
  - Link với `/mcv3:assess` để assess trước khi import
  - Update `_config.json` với per-system phases sau import

### Updated — MCP Server: Per-System Phase Tracking

- **`types.ts`**: Thêm `currentPhase?: ProjectPhase` vào `SystemInfo` interface
  - Mỗi system có thể ở phase khác nhau (phù hợp dự án in-progress)
  - Field optional — không ảnh hưởng dự án mới
  - `McInitParams.systems` cho phép set per-system phase khi init

- **`mc-status.ts`**: Hiển thị per-system phase trong dashboard
  - `mc_status` show `currentPhase` của từng system nếu có
  - Gợi ý `/mcv3:assess` khi phát hiện per-system phases
  - Suggest assess trong "Bước tiếp theo" section

- **`mc-init.ts`**: Hỗ trợ khởi tạo với per-system phases
  - `mc_init_project` nhận `systems[]` với `currentPhase` per system
  - Validate và normalize system codes khi init

- **`mc-validate.ts`**: Validate per-system phase consistency
  - Function `validatePerSystemPhases()` — kiểm tra phases hợp lệ
  - Warning nếu system phase vượt quá project-level phase quá nhiều
  - Info nếu project-level phase chưa được update sau khi set per-system

### Updated — Documentation

- `CLAUDE.md` — Thêm `/mcv3:assess` vào Skills table, Hooks table, Scripts section
  - Thêm section "Dự án đang phát triển dở (Ongoing Projects)"
  - Cập nhật Quick Start với assess workflow
  - Cập nhật Quy tắc 2 để cho phép mixed-phase với assess

- `README.md` — Thêm section "Working with Existing Projects"
  - Mô tả `/mcv3:assess` skill và workflow
  - Mô tả `scan-codebase.sh` và output format
  - Giải thích Per-System Phase Tracking

### Updated — Configuration

- `hooks/hooks.json` — Thêm hook `PreAssess`
- `settings.json` — Thêm permissions cho assess workflow
- `skills/navigator/SKILL.md` — Thêm routing cho `/mcv3:assess`

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
