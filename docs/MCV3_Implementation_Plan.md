# MCV3 v3.1 — Kế Hoạch Triển Khai (Implementation Plan)

> **Dự án:** MasterCraft DevKit v3.1
> **Loại:** Claude Code Plugin
> **Tham chiếu kiến trúc:** [MCV3_Architecture_v3.1.md](./MCV3_Architecture_v3.1.md)
> **Ngày tạo:** 2026-03-19
> **Trạng thái:** PLANNING

---

## 1. TRẠNG THÁI HIỆN TẠI

### 1.1 Đã có

| Asset | File | Trạng thái |
|-------|------|-----------|
| Kiến trúc v3.1 | `MCV3_Architecture_v3.1.md` | ✅ Hoàn chỉnh (23 sections) |
| PROJECT-TEMPLATE | 25 files templates gốc | ✅ Có sẵn — cần adapt cho MCV3 |

### 1.2 Cần build (Inventory tổng)

| Component | Số lượng | Ưu tiên |
|-----------|---------|---------|
| Plugin scaffold (plugin.json, settings.json) | 2 files | P0 |
| MCP Server (TypeScript) | 1 server, 20 tools | P0 |
| Skills (SKILL.md + references) | 13 skills, ~40 files | P0-P1 |
| Agents (agent.md + references) | 11 agents, ~30 files | P0-P1 |
| Hooks + Scripts | 1 config + 8 scripts | P1 |
| Templates (cho .mc-data output) | ~15 templates | P0 |
| Rules generator (CLAUDE.md) | 1 module trong mc_init | P1 |
| **TỔNG** | **~120 files** | |

---

## 2. NGUYÊN TẮC TRIỂN KHAI

### 2.1 Dependency Order (Không thể đảo)

```
Templates ──────────────────────────────────────────────────┐
  (Định nghĩa output format)                               │
                                                            ▼
MCP Server ──────────────────────────────────┐         Tất cả
  (mc_init, mc_save, mc_load — nền tảng)     │         components
                                              ▼         đều dùng
Skills ──────────────────────────────┐    MCP Tools     templates
  (Logic nghiệp vụ mỗi phase)       │                  để tạo
                                      ▼                  output
Agents ──────────────────────┐    Skills
  (Sử dụng skills + MCP)     │
                              ▼
Hooks ────────────────   Agents
  (Tự động hóa agents)
```

**Kết luận:** Build theo thứ tự: Templates → MCP Server → Skills → Agents → Hooks

### 2.2 Nguyên tắc "Test mỗi Sprint"

Mỗi Sprint kết thúc bằng **1 dự án mẫu chạy được end-to-end** qua các phases đã build.

Dự án mẫu: **"Công ty XNK ABC"** — hệ thống ERP + Website + Mobile (đã mô tả trong kiến trúc).

### 2.3 Tech Stack cho MCP Server

| Layer | Công nghệ | Lý do |
|-------|----------|-------|
| Language | **TypeScript** | Chuẩn Claude Code MCP SDK |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK |
| File I/O | Node.js `fs/promises` | Native, không dependency |
| Template Engine | Markdown string interpolation | Đơn giản, kiểm soát được |
| Package Manager | npm | Chuẩn |

---

## 3. SPRINT PLAN

### ═══════════════════════════════════════════════════
### SPRINT 0: FOUNDATION (Tuần 1-2)
### ═══════════════════════════════════════════════════

**Mục tiêu:** Plugin install được vào Claude Code, chạy `/mcv3:navigator`, gọi `mc_init_project` tạo được `.mc-data/`

**Deliverable:** `mcv3-devkit/` → install → tạo dự án → xem status

#### S0-T01: Plugin Scaffold

```
Tạo:
  mcv3-devkit/
  ├── .claude-plugin/plugin.json
  ├── settings.json
  ├── README.md
  └── LICENSE
```

**plugin.json:**
```json
{
  "name": "mcv3-devkit",
  "version": "3.1.0",
  "description": "MasterCraft DevKit — Biến ý tưởng phần mềm thành bộ tài liệu hoàn chỉnh",
  "author": { "name": "MCV3 Team" },
  "skills": "./skills/",
  "agents": "./agents/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S0-T01 | plugin.json, settings.json, README | 1h | — |

#### S0-T02: Templates (Adapt từ PROJECT-TEMPLATE)

```
Tạo (tổ chức theo phase):
  templates/
  ├── p0-init/
  │   ├── MASTER-INDEX-TEMPLATE.md          ← Adapt từ PROJECT-TEMPLATE
  │   └── key-facts-template.md             ← Mới (v3.0)
  ├── p1-discovery/
  │   └── PROJECT-OVERVIEW-TEMPLATE.md      ← Adapt từ PROJECT-OVERVIEW.md
  ├── p2-expert/
  │   ├── EXPERT-LOG-TEMPLATE.md            ← Adapt từ EXPERT-LOG.md
  │   └── PROJECT-ARCHITECTURE-TEMPLATE.md  ← Adapt từ PROJECT-ARCHITECTURE.md
  ├── p3-biz-docs/
  │   ├── BIZ-POLICY-TEMPLATE.md            ← Adapt từ BIZ-POLICY-TEMPLATE.md
  │   ├── PROCESS-TEMPLATE.md               ← Adapt từ PROCESS-TEMPLATE.md
  │   └── DATA-DICTIONARY-TEMPLATE.md       ← Adapt từ DATA-DICTIONARY.md
  ├── p4-requirements/
  │   ├── SYSTEM-INDEX-TEMPLATE.md          ← Adapt từ SYSTEM-INDEX.md
  │   └── URS-TEMPLATE.md                   ← Adapt từ URS-TEMPLATE.md
  ├── p5-tech-design/
  │   ├── MODSPEC-TEMPLATE.md               ← Adapt từ MODSPEC-TEMPLATE.md
  │   ├── ARCHITECTURE-TEMPLATE.md          ← Adapt từ ARCHITECTURE.md (system-level)
  │   ├── DATA-MODEL-TEMPLATE.md            ← Adapt từ DATA-MODEL.md
  │   └── SERVICE-SPEC-TEMPLATE.md          ← Adapt từ SERVICE-SPEC-TEMPLATE.md
  ├── p6-qa-docs/
  │   ├── TEST-TEMPLATE.md                  ← Adapt từ TEST-TEMPLATE.md
  │   ├── USER-GUIDE-TEMPLATE.md            ← Adapt từ USER-GUIDE.md
  │   └── ADMIN-GUIDE-TEMPLATE.md           ← Adapt từ ADMIN-GUIDE.md
  ├── p8a-verify/
  │   ├── VERIFY-P1-TEMPLATE.md             ← Adapt từ P1/_VERIFY.md
  │   ├── VERIFY-P2-TEMPLATE.md             ← Adapt từ P2/_VERIFY.md
  │   ├── VERIFY-P3-TEMPLATE.md             ← Adapt từ P3/_VERIFY.md
  │   ├── VERIFY-PROJECT-TEMPLATE.md        ← Adapt từ _VERIFY-PROJECT.md
  │   ├── VERIFY-CROSS-P1-TEMPLATE.md       ← Adapt từ VERIFY-P1-CROSS.md
  │   ├── VERIFY-CROSS-P2-TEMPLATE.md       ← Adapt từ VERIFY-P2-CROSS.md
  │   └── VERIFY-INTEGRATION-TEMPLATE.md    ← Adapt từ VERIFY-INTEGRATION.md
  └── p8b-deploy-ops/
      └── DEPLOY-OPS-TEMPLATE.md            ← Adapt từ DEPLOY-OPS.md
```

**Adapt = giữ nguyên cấu trúc PROJECT-TEMPLATE + thêm:**
- DEPENDENCY MAP section ở đầu mỗi template
- Formal ID placeholders (BR-XXX, US-XXX, ...)
- Key Facts auto-update notes
- AI Navigation hints

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S0-T02 | 25 template files | 8h | — |

#### S0-T03: MCP Server — Core (5 tools đầu tiên)

```
Tạo:
  mcv3-devkit/mcp-servers/project-memory/
  ├── src/
  │   ├── index.ts              # MCP Server entry point
  │   ├── tools/
  │   │   ├── mc-init.ts        # mc_init_project — tạo .mc-data/ structure
  │   │   ├── mc-save.ts        # mc_save — lưu artifact
  │   │   ├── mc-load.ts        # mc_load — đọc artifact (Layer support)
  │   │   ├── mc-list.ts        # mc_list — liệt kê contents
  │   │   └── mc-status.ts      # mc_status — trạng thái dự án
  │   ├── utils/
  │   │   ├── file-io.ts        # File read/write helpers
  │   │   ├── template-engine.ts # Template interpolation
  │   │   └── id-system.ts      # Formal ID generation + validation
  │   └── types.ts              # TypeScript types
  ├── package.json
  └── tsconfig.json
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S0-T03a | MCP Server skeleton + mc_init | 4h | S0-T02 (templates) |
| S0-T03b | mc_save + mc_load (Layer support) | 4h | S0-T03a |
| S0-T03c | mc_list + mc_status | 2h | S0-T03a |

#### S0-T04: Navigator Skill (Skill đầu tiên)

```
Tạo:
  mcv3-devkit/skills/navigator/
  ├── SKILL.md                  # Logic: đọc status, hiển thị, suggest next
  └── references/
      └── status-display.md     # Format hiển thị status
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S0-T04 | navigator/SKILL.md | 3h | S0-T03 (MCP) |

#### S0-TEST: Kiểm tra Sprint 0

```
Test scenario:
1. Install plugin vào Claude Code → OK?
2. /mcv3:navigator → "Chưa có dự án nào"
3. Nói: "Tạo dự án mới: Công ty XNK ABC, ngành logistics"
   → mc_init_project chạy → .mc-data/ tạo ra đúng structure?
4. /mcv3:navigator → hiển thị trạng thái dự án?
5. mc_load, mc_list hoạt động?
```

| Task | Output | Est. |
|------|--------|------|
| S0-TEST | Test report Sprint 0 | 2h |

**Sprint 0 Total: ~24h (3 ngày)**

---

### ═══════════════════════════════════════════════════
### SPRINT 1: CORE PIPELINE Phase 1-3 (Tuần 3-5)
### ═══════════════════════════════════════════════════

**Mục tiêu:** Chạy được từ ý tưởng → tài liệu nghiệp vụ đầy đủ

**Deliverable:** User nói ý tưởng → ra PROJECT-OVERVIEW + EXPERT-LOG + BIZ-POLICY + PROCESS + DATA-DICTIONARY

#### S1-T01: Discovery Skill (Phase 1)

```
Tạo:
  skills/discovery/
  ├── SKILL.md                          # Phỏng vấn adaptive, detect ngành
  └── references/
      ├── interview-frameworks/
      │   ├── logistics.md              # Câu hỏi XNK
      │   ├── retail.md                 # Câu hỏi Retail
      │   ├── fnb.md                    # Câu hỏi F&B
      │   ├── saas.md                   # Câu hỏi SaaS
      │   └── general.md               # Câu hỏi chung
      └── project-overview-schema.md    # Schema output
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T01 | discovery/SKILL.md + 6 references | 6h | Sprint 0 |

#### S1-T02: Expert Agents (3 agents cho Phase 2)

```
Tạo:
  agents/
  ├── strategy-expert.md
  │   └── references/
  │       ├── business-model-patterns.md
  │       ├── go-to-market-frameworks.md
  │       └── kpi-frameworks.md
  ├── finance-expert.md
  │   └── references/
  │       ├── pricing-strategies.md
  │       ├── financial-modeling.md
  │       └── operations-frameworks.md
  └── domain-expert.md
      └── references/
          ├── industry-logistics.md
          ├── industry-retail.md
          ├── industry-fnb.md
          └── industry-saas.md
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T02a | strategy-expert + 3 references | 4h | — |
| S1-T02b | finance-expert + 3 references | 4h | — |
| S1-T02c | domain-expert + 4 references | 6h | — |

#### S1-T03: Doc-Writer Agent

```
Tạo:
  agents/doc-writer.md          # Agent viết tài liệu, enforce IDs
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T03 | doc-writer.md | 3h | — |

#### S1-T04: Expert Panel Skill (Phase 2)

```
Tạo:
  skills/expert-panel/
  ├── SKILL.md                  # Orchestrate expert agents, bounded parallel
  └── references/
      └── panel-protocol.md     # Quy trình discussion + merge
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T04 | expert-panel/SKILL.md | 4h | S1-T02 (experts), S1-T03 (doc-writer) |

#### S1-T05: Biz-Docs Skill (Phase 3)

```
Tạo:
  skills/biz-docs/
  ├── SKILL.md                  # Guided Generation protocol
  └── references/
      ├── skeleton/             # Skeleton templates cho Guided Gen
      │   ├── pricing-skeleton.md
      │   ├── sales-skeleton.md
      │   ├── hr-skeleton.md
      │   └── process-skeleton.md
      ├── templates/policies/   # (link đến templates/ chung)
      ├── templates/processes/
      └── industry/
          ├── logistics.md
          ├── retail.md
          └── fnb.md
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T05 | biz-docs/SKILL.md + skeletons + industry | 8h | S1-T03 (doc-writer) |

#### S1-T06: MCP Tools bổ sung

```
Thêm vào mcp-servers/project-memory/src/tools/:
  ├── mc-checkpoint.ts          # Lưu checkpoint
  ├── mc-resume.ts              # Load checkpoint + resume
  ├── mc-changelog.ts           # Ghi changelog
  ├── mc-update-index.ts        # Update MASTER-INDEX
  └── mc-summary.ts             # Key Facts extraction
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T06 | 5 MCP tools mới | 6h | Sprint 0 MCP |

#### S1-T07: Hooks cơ bản

```
Tạo:
  hooks/hooks.json              # SessionStart + Stop hooks
  scripts/
  ├── load-project-context.sh   # Auto-load khi session start
  └── auto-checkpoint.sh        # Auto-save khi session end
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T07 | hooks.json + 2 scripts | 3h | S1-T06 (checkpoint) |

#### S1-T08: CLAUDE.md Generator

```
Thêm logic vào mc_init_project:
  → Auto-generate .claude/CLAUDE.md với naming conventions, quality gates
  → Auto-generate .claude/rules/mc-data.md
```

| Task | Output | Est. | Depend |
|------|--------|------|--------|
| S1-T08 | CLAUDE.md generator trong mc_init | 3h | Sprint 0 MCP |

#### S1-TEST: E2E Test Phase 1-3

```
Test scenario:
1. "Tôi muốn xây phần mềm cho công ty XNK ABC"
   → Discovery phỏng vấn → PROJECT-OVERVIEW.md (có PROB-XXX, BG-XXX)
2. "Hỏi ý kiến chuyên gia"
   → Expert agents phân tích → EXPERT-LOG.md (có SESSION-001)
3. "Tạo chính sách và quy trình"
   → Guided Gen: skeleton → user confirm → BIZ-POLICY-SALES.md (có BR-XXX)
   → PROCESS-WAREHOUSE.md (có AS-IS + TO-BE + PAIN-XXX)
   → DATA-DICTIONARY.md (có TERM-XXX, ENT-XXX, ENUM-XXX)
4. Verify: _VERIFY-PROJECT.md pass?
5. Checkpoint tự động lưu khi session end?
6. Resume từ checkpoint khi session mới?
```

| Task | Output | Est. |
|------|--------|------|
| S1-TEST | Test report + fix bugs | 4h |

**Sprint 1 Total: ~51h (6-7 ngày)**

---

### ═══════════════════════════════════════════════════
### SPRINT 2: DESIGN PIPELINE Phase 4-5 (Tuần 6-8)
### ═══════════════════════════════════════════════════

**Mục tiêu:** Từ tài liệu nghiệp vụ → URS → MODSPEC all-in-one

**Deliverable:** URS per module + MODSPEC (BR+FT+API+DB+UI) + cross-system verify

#### S2-T01: Requirements Skill (Phase 4)

| Task | Output | Est. |
|------|--------|------|
| S2-T01 | requirements/SKILL.md + URS logic | 6h |

#### S2-T02: Tech-Design Skill (Phase 5)

| Task | Output | Est. |
|------|--------|------|
| S2-T02a | tech-design/SKILL.md (MODSPEC all-in-one) | 8h |
| S2-T02b | references/architecture-patterns.md + database-patterns.md | 4h |

#### S2-T03: Expert Agents bổ sung

| Task | Output | Est. |
|------|--------|------|
| S2-T03a | tech-expert.md + 4 references (architecture, security, scalability) | 5h |
| S2-T03b | ux-market-expert.md + 4 references (UX, UI patterns, accessibility) | 4h |
| S2-T03c | legal-compliance-expert.md + 3 references (GDPR, industry compliance) | 4h |

#### S2-T04: System Agents

| Task | Output | Est. |
|------|--------|------|
| S2-T04a | orchestrator.md (parallel batches, dependency analysis) | 4h |
| S2-T04b | verifier.md (independent verify protocol) | 3h |

#### S2-T05: MCP Tools — Snapshot + Dependency

```
Thêm tools:
  mc-snapshot.ts, mc-rollback.ts, mc-batch-update.ts,
  mc-impact-analysis.ts, mc-dependency-graph.ts,
  mc-verify.ts, mc-resolve-id.ts, mc-traceability.ts,
  mc-validate-schema.ts
```

| Task | Output | Est. |
|------|--------|------|
| S2-T05a | mc_snapshot + mc_rollback + mc_batch_update | 6h |
| S2-T05b | mc_impact_analysis + mc_dependency_graph | 6h |
| S2-T05c | mc_verify + mc_resolve_id + mc_traceability + mc_validate_schema | 6h |

#### S2-T06: Hooks bổ sung

```
Thêm hooks:
  PostToolUse: validate-ids.sh, update-dependency-map.sh,
               update-key-facts.sh, update-master-index.sh
  SubagentStop: merge-subagent-output.sh
  PreCompact: save-context-before-compact.sh
```

| Task | Output | Est. |
|------|--------|------|
| S2-T06 | hooks.json update + 6 scripts | 4h |

#### S2-TEST: E2E Test Phase 4-5

```
Test scenario (tiếp từ Sprint 1):
1. "Viết URS cho module Kho của ERP"
   → URS-INV.md (US-INV-001, UC-INV-001-01, AC-INV-001-01)
2. "Thiết kế MODSPEC cho module Kho"
   → MODSPEC-INV.md (all-in-one: BR+FT+API+DB+UI)
   → ARCHITECTURE.md + DATA-MODEL.md
3. tech-expert review architecture → OK?
4. Independent Verify → P2/_VERIFY.md pass?
5. Cross-system verify → VERIFY-P2-CROSS.md?
6. Impact analysis: sửa BR-WH-001 → đúng files bị ảnh hưởng?
7. Snapshot + rollback hoạt động?
```

| Task | Output | Est. |
|------|--------|------|
| S2-TEST | Test report + fix bugs | 6h |

**Sprint 2 Total: ~66h (8-9 ngày)**

---

### ═══════════════════════════════════════════════════
### SPRINT 3: QA + CODE + DEPLOY — Phase 6-8 (Tuần 9-11)
### ═══════════════════════════════════════════════════

**Mục tiêu:** Pipeline hoàn chỉnh 8 phases

#### S3-T01: QA-Docs Skill (Phase 6)

| Task | Output | Est. |
|------|--------|------|
| S3-T01 | qa-docs/SKILL.md (TEST + USER-GUIDE + ADMIN-GUIDE) | 6h |

#### S3-T02: Code-Gen Skill (Phase 7) + Code-Generator Agent

| Task | Output | Est. |
|------|--------|------|
| S3-T02a | code-gen/SKILL.md (scaffold → src/) | 6h |
| S3-T02b | code-generator.md agent | 3h |

#### S3-T03: Verify Skill (Phase 8) + DEPLOY-OPS

| Task | Output | Est. |
|------|--------|------|
| S3-T03 | verify/SKILL.md (cross-verify + deploy) | 6h |

#### S3-TEST: E2E Test Full Pipeline

```
Test scenario (full 8 phases):
Phase 1 → PROJECT-OVERVIEW.md ✓
Phase 2 → EXPERT-LOG.md ✓
Phase 3 → BIZ-POLICY/*, PROCESS/*, DATA-DICTIONARY ✓
Phase 4 → URS-INV.md ✓
Phase 5 → MODSPEC-INV.md ✓
Phase 6 → TEST-INV.md, USER-GUIDE.md, ADMIN-GUIDE.md ← NEW
Phase 7 → src/erp/... (code scaffold) ← NEW
Phase 8 → _verify-master.md, DEPLOY-OPS.md ← NEW

Traceability: PROB-001 → BR-WH-001 → US-INV-001 → FT-INV-001
              → API-INV-001 → TC-INV-001-01 — CHAIN HOÀN CHỈNH?
```

| Task | Output | Est. |
|------|--------|------|
| S3-TEST | Full pipeline test + fix bugs | 8h |

**Sprint 3 Total: ~29h (4 ngày)**

---

### ═══════════════════════════════════════════════════
### SPRINT 4: LIFECYCLE + POLISH (Tuần 12-14)
### ═══════════════════════════════════════════════════

**Mục tiêu:** Cover toàn bộ SDLC + production-ready

#### S4-T01: Lifecycle Skills

| Task | Output | Est. |
|------|--------|------|
| S4-T01a | change-manager/SKILL.md + change-analyst.md agent | 6h |
| S4-T01b | onboarding/SKILL.md (import dự án có sẵn) | 6h |
| S4-T01c | evolution/SKILL.md (bug tracking, feature request) | 4h |
| S4-T01d | migration/SKILL.md (system migration) | 4h |

#### S4-T02: Expert Knowledge Bases (bổ sung)

| Task | Output | Est. |
|------|--------|------|
| S4-T02a | strategy-expert references bổ sung | 3h |
| S4-T02b | finance-expert references bổ sung | 3h |
| S4-T02c | domain-expert: thêm industry-healthcare + manufacturing | 4h |

#### S4-T03: Documentation & Polish

| Task | Output | Est. |
|------|--------|------|
| S4-T03a | README.md (installation + usage guide) | 3h |
| S4-T03b | CHANGELOG.md | 1h |
| S4-T03c | Các TODO/placeholder còn thiếu | 4h |

#### S4-TEST: Integration Test + User Testing

| Task | Output | Est. |
|------|--------|------|
| S4-TESTa | Chạy toàn bộ với dự án XNK (full) | 8h |
| S4-TESTb | Chạy với dự án SaaS (industry khác) | 6h |
| S4-TESTc | Test change management (sửa BR → cascade) | 4h |
| S4-TESTd | Test onboarding (import dự án có sẵn) | 4h |

**Sprint 4 Total: ~55h (7 ngày)**

---

## 4. TỔNG HỢP TIMELINE

```
Tuần 1-2:   Sprint 0 — FOUNDATION          (~24h)  ✸ Plugin install + init được
Tuần 3-5:   Sprint 1 — Phase 1-3           (~51h)  ✸ Ý tưởng → Tài liệu nghiệp vụ
Tuần 6-8:   Sprint 2 — Phase 4-5           (~66h)  ✸ Requirements → MODSPEC
Tuần 9-11:  Sprint 3 — Phase 6-8           (~29h)  ✸ QA → Code → Deploy
Tuần 12-14: Sprint 4 — Lifecycle + Polish   (~55h)  ✸ SDLC đầy đủ + production-ready
─────────────────────────────────────────────────────
TỔNG:       14 tuần                         ~225h
```

### Deliverable mỗi Sprint

| Sprint | Milestone | User có thể làm gì |
|--------|-----------|-------------------|
| 0 | Plugin chạy | Install, tạo dự án, xem status |
| 1 | Phase 1-3 | Phỏng vấn → Expert analysis → BIZ-POLICY + PROCESS |
| 2 | Phase 4-5 | URS → MODSPEC all-in-one (code-ready) |
| 3 | Phase 6-8 | TEST + Guide + Code scaffold + Deploy plan |
| 4 | Full SDLC | Change management + Onboarding + Evolution + Migration |

---

## 5. TASK TRACKING

### Sprint 0 — FOUNDATION

| ID | Task | Est. | Status | Depend | Assignee |
|----|------|------|--------|--------|----------|
| S0-T01 | Plugin scaffold (plugin.json, settings.json) | 1h | ⏳ | — | |
| S0-T02 | Templates (adapt 25 files từ PROJECT-TEMPLATE) | 8h | ⏳ | — | |
| S0-T03a | MCP Server skeleton + mc_init_project | 4h | ⏳ | S0-T02 | |
| S0-T03b | mc_save + mc_load (Layer support) | 4h | ⏳ | S0-T03a | |
| S0-T03c | mc_list + mc_status | 2h | ⏳ | S0-T03a | |
| S0-T04 | Navigator Skill | 3h | ⏳ | S0-T03 | |
| S0-TEST | Test Sprint 0 | 2h | ⏳ | ALL | |

### Sprint 1 — CORE PIPELINE

| ID | Task | Est. | Status | Depend | Assignee |
|----|------|------|--------|--------|----------|
| S1-T01 | Discovery Skill + interview frameworks | 6h | ⏳ | S0 | |
| S1-T02a | strategy-expert agent + references | 4h | ⏳ | — | |
| S1-T02b | finance-expert agent + references | 4h | ⏳ | — | |
| S1-T02c | domain-expert agent + references | 6h | ⏳ | — | |
| S1-T03 | doc-writer agent | 3h | ⏳ | — | |
| S1-T04 | Expert Panel Skill | 4h | ⏳ | S1-T02, S1-T03 | |
| S1-T05 | Biz-Docs Skill (Guided Gen) | 8h | ⏳ | S1-T03 | |
| S1-T06 | MCP Tools: checkpoint, resume, changelog, index, summary | 6h | ⏳ | S0-T03 | |
| S1-T07 | Hooks: SessionStart + Stop + 2 scripts | 3h | ⏳ | S1-T06 | |
| S1-T08 | CLAUDE.md generator | 3h | ⏳ | S0-T03 | |
| S1-TEST | E2E Test Phase 1-3 | 4h | ⏳ | ALL | |

### Sprint 2 — DESIGN PIPELINE

| ID | Task | Est. | Status | Depend | Assignee |
|----|------|------|--------|--------|----------|
| S2-T01 | Requirements Skill (URS) | 6h | ⏳ | S1 | |
| S2-T02a | Tech-Design Skill (MODSPEC) | 8h | ⏳ | S1 | |
| S2-T02b | architecture-patterns + database-patterns | 4h | ⏳ | — | |
| S2-T03a | tech-expert agent + 4 references | 5h | ⏳ | — | |
| S2-T03b | ux-market-expert agent + 4 references | 4h | ⏳ | — | |
| S2-T03c | legal-compliance-expert agent + 3 references | 4h | ⏳ | — | |
| S2-T04a | orchestrator agent | 4h | ⏳ | — | |
| S2-T04b | verifier agent | 3h | ⏳ | — | |
| S2-T05a | MCP: snapshot + rollback + batch_update | 6h | ⏳ | S0-T03 | |
| S2-T05b | MCP: impact_analysis + dependency_graph | 6h | ⏳ | S0-T03 | |
| S2-T05c | MCP: verify + resolve_id + traceability + validate_schema | 6h | ⏳ | S0-T03 | |
| S2-T06 | Hooks: PostToolUse + SubagentStop + PreCompact + 6 scripts | 4h | ⏳ | S2-T05 | |
| S2-TEST | E2E Test Phase 4-5 | 6h | ⏳ | ALL | |

### Sprint 3 — QA + CODE + DEPLOY

| ID | Task | Est. | Status | Depend | Assignee |
|----|------|------|--------|--------|----------|
| S3-T01 | QA-Docs Skill | 6h | ⏳ | S2 | |
| S3-T02a | Code-Gen Skill | 6h | ⏳ | S2 | |
| S3-T02b | code-generator agent | 3h | ⏳ | — | |
| S3-T03 | Verify Skill + DEPLOY-OPS | 6h | ⏳ | S2 | |
| S3-TEST | Full Pipeline Test | 8h | ⏳ | ALL | |

### Sprint 4 — LIFECYCLE + POLISH

| ID | Task | Est. | Status | Depend | Assignee |
|----|------|------|--------|--------|----------|
| S4-T01a | change-manager Skill + change-analyst agent | 6h | ⏳ | S3 | |
| S4-T01b | onboarding Skill | 6h | ⏳ | S3 | |
| S4-T01c | evolution Skill | 4h | ⏳ | S3 | |
| S4-T01d | migration Skill | 4h | ⏳ | S3 | |
| S4-T02a-c | Expert knowledge bases bổ sung | 10h | ⏳ | — | |
| S4-T03 | Documentation + Polish | 8h | ⏳ | ALL | |
| S4-TEST | Integration Test (2 dự án mẫu) | 22h | ⏳ | ALL | |

---

## 6. RISK & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MCP Server TypeScript phức tạp hơn dự kiến | Delay Sprint 0-1 | Bắt đầu với 5 tools core, thêm dần |
| SKILL.md quá dài → Claude không follow hết | Output quality giảm | Tách thành sections nhỏ, dùng references/ |
| Agent expert knowledge base chưa đủ sâu | Expert advice thiếu thực tế | Iterate với dự án thực, bổ sung dần |
| Parallel execution (2+1) gây conflict | Data inconsistency | Snapshot trước mỗi batch, verify sau |
| Templates từ PROJECT-TEMPLATE không fit | Phải rewrite nhiều | Adapt incremental, giữ cấu trúc gốc |

---

## 7. DEFINITION OF DONE

### Mỗi Task "Done" khi:

- [ ] Code/file tạo xong, không lỗi syntax
- [ ] Comment/chú thích rõ ràng bằng tiếng Việt
- [ ] Follow Formal ID system (BR-XXX, US-XXX, ...)
- [ ] Có DEPENDENCY MAP (nếu là template/tài liệu)
- [ ] Test cơ bản pass

### Mỗi Sprint "Done" khi:

- [ ] Tất cả tasks complete
- [ ] E2E test scenario pass
- [ ] Dự án mẫu chạy được qua các phases của Sprint đó
- [ ] Không có Critical bugs
- [ ] Checkpoint + Resume hoạt động

### Project "Done" khi:

- [ ] Full pipeline 8 phases chạy end-to-end
- [ ] Traceability chain PROB→BR→US→FT→API→TC hoàn chỉnh
- [ ] 2 dự án mẫu (XNK + SaaS) pass
- [ ] All 13 skills hoạt động
- [ ] All 11 agents hoạt động
- [ ] All 20 MCP tools hoạt động
- [ ] All 8 hooks + scripts hoạt động
- [ ] CLAUDE.md auto-generated đúng
- [ ] README + CHANGELOG hoàn chỉnh

---

## 8. HÀNH ĐỘNG TIẾP THEO (Immediate Next Steps)

```
Bước 1: Confirm plan này → Có cần điều chỉnh gì không?
Bước 2: Bắt đầu Sprint 0:
         → S0-T01: Tạo plugin scaffold
         → S0-T02: Adapt templates (song song)
         → S0-T03: Build MCP Server core
Bước 3: Test Sprint 0 → Fix → Chuyển Sprint 1
```
