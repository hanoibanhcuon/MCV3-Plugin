# MCV3-DevKit — Hướng dẫn sử dụng

> **Phiên bản:** 3.11.2 | **Cập nhật:** 2026-03-20

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt](#2-cài-đặt)
3. [Bắt đầu nhanh (Quick Start)](#3-bắt-đầu-nhanh-quick-start)
4. [Triển khai dự án MỚI — Chi tiết từng bước](#4-triển-khai-dự-án-mới--chi-tiết-từng-bước)
5. [Quy mô dự án — Scale Decision Matrix](#5-quy-mô-dự-án--scale-decision-matrix)
6. [Triển khai dự án CŨ / ĐANG DỞ](#6-triển-khai-dự-án-cũ--đang-dở)
7. [Skills Lifecycle — Sau khi dự án chạy](#7-skills-lifecycle--sau-khi-dự-án-chạy)
8. [Cách MCV3 hoạt động](#8-cách-mcv3-hoạt-động)
9. [Danh sách đầy đủ 15 Skills](#9-danh-sách-đầy-đủ-15-skills)
10. [Danh sách 19 MCP Tools](#10-danh-sách-19-mcp-tools)
11. [12 Ngành nghề hỗ trợ](#11-12-ngành-nghề-hỗ-trợ)
12. [Tech Stacks hỗ trợ](#12-tech-stacks-hỗ-trợ)
13. [FAQ — Câu hỏi thường gặp](#13-faq--câu-hỏi-thường-gặp)
14. [Cập nhật & Update](#14-cập-nhật--update)
15. [Troubleshooting](#15-troubleshooting)
16. [Version History](#16-version-history)

---

## 1. Giới thiệu

### MCV3-DevKit là gì?

**MasterCraft DevKit v3 (MCV3)** là một **Claude Code Plugin** giúp bạn hệ thống hóa toàn bộ quá trình phát triển phần mềm — từ ý tưởng ban đầu đến bộ tài liệu hoàn chỉnh và code scaffolding sẵn sàng implement.

Thay vì tự viết tài liệu theo cách thủ công (thường rời rạc, thiếu nhất quán), MCV3 cung cấp **quy trình 8 bước chuẩn hóa** với AI tự động chạy từng bước, tạo ra bộ tài liệu có thể truy vết từ vấn đề kinh doanh → yêu cầu → thiết kế → code → test.

### Dành cho ai?

| Đối tượng | Lợi ích chính |
|-----------|--------------|
| **Developer / Tech Lead** | Sinh code scaffolding, test cases, API specs từ tài liệu; không tốn thời gian viết boilerplate |
| **PM / BA / Product Owner** | Tạo User Stories, Business Rules, Acceptance Criteria có cấu trúc; dễ trình bày với stakeholders |
| **Business Owner / CEO** | Hiểu rõ phần mềm cần làm gì qua quy trình hỏi đáp; có bộ tài liệu để bàn giao nhóm phát triển |
| **Team onboarding mới** | Member mới dùng `/mcv3:onboard` để nhanh chóng hiểu dự án và quy trình |

### Có thể làm gì?

- **Dự án mới** — Từ landing page đơn giản (3 phases) đến hệ thống Enterprise phức tạp (full 8 phases)
- **Dự án đang dở** — Nhận bàn giao code/docs cũ, đánh giá gaps, lập kế hoạch hoàn thiện
- **Dự án đang chạy** — Quản lý thay đổi yêu cầu, thêm tính năng mới, onboard thành viên mới
- **12 ngành** — F&B, Logistics, Healthcare, Fintech, E-Commerce, Embedded/IoT và 6 ngành khác

---

## 2. Cài đặt

### Yêu cầu tối thiểu

| Phần mềm | Phiên bản |
|----------|-----------|
| **Node.js** | v18 trở lên |
| **Claude Code** | Phiên bản mới nhất |
| **npm** | v8+ (chỉ cần nếu cần build thủ công) |

---

### Cách 1: Cài từ Git Clone (Khuyến nghị cho developer)

```bash
# Bước 1: Clone plugin về
git clone https://github.com/YOUR_ORG/mcv3-plugin.git
cd mcv3-plugin

# Bước 2: Cài vào thư mục dự án của bạn
bash scripts/install.sh /đường/dẫn/đến/dự-án-của-bạn

# Bước 3: Mở dự án trong Claude Code
cd /đường/dẫn/đến/dự-án-của-bạn
```

---

### Cách 2: Tải từ GitHub Release (Dễ nhất)

```bash
# Bước 1: Tải file .plugin từ GitHub Releases
# Đổi đuôi .plugin → .zip rồi giải nén:
unzip mcv3-devkit-3.11.2.zip
cd mcv3-devkit-3.11.2

# Bước 2: Cài vào dự án
bash scripts/install.sh /đường/dẫn/đến/dự-án
```

---

### Cách 3: Windows (PowerShell)

```powershell
# Bước 1: Giải nén file .plugin (đổi tên thành .zip trước)
Expand-Archive .\mcv3-devkit-3.11.2.zip -DestinationPath .
cd mcv3-devkit-3.11.2

# Bước 2: Cài vào dự án
.\scripts\install.ps1 C:\đường\dẫn\đến\dự-án

# Lưu ý — Nếu PowerShell báo lỗi execution policy:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Installer tự động làm gì?

Sau khi chạy installer, dự án của bạn sẽ có:

```
your-project/
├── mcv3-devkit/          ← Toàn bộ plugin (skills, agents, templates, MCP server)
├── .claude/
│   ├── CLAUDE.md         ← Claude đọc file này → tự biết MCV3 đã cài
│   ├── commands/mcv3/    ← Các slash commands (/mcv3:discovery, v.v.)
│   └── settings.json     ← Hooks tự động (checkpoint khi kết thúc session)
├── .mcp.json             ← Kết nối MCP server (Claude Code đọc)
└── .mc-data/             ← Dữ liệu dự án (tạo khi bạn bắt đầu dùng)
```

---

### Verify cài đặt

```bash
bash mcv3-devkit/scripts/verify-install.sh
```

Kết quả mẫu (thành công):
```
✅ Node.js v20.11.0
✅ Plugin version: v3.11.2
✅ MCP Server có thể load được
✅ 17 slash commands
✅ .claude/CLAUDE.md có MCV3 instructions
✅ Auto-checkpoint hook đã cấu hình

Kết quả: ✅ 15 | ❌ 0 | ⚠ 0
✅ Cài đặt hoàn hảo! Sẵn sàng sử dụng.
```

---

## 3. Bắt đầu nhanh (Quick Start)

### Dự án MỚI — 3 bước

```
Bước 1: Mở Claude Code trong thư mục dự án
Bước 2: Gõ /mcv3:onboard   → Nhận tutorial theo loại user của bạn
Bước 3: Gõ /mcv3:discovery → Bắt đầu pipeline (AI phỏng vấn + tạo tài liệu)
```

**Tip:** Nếu bạn đã có ý tưởng rõ, có thể nói thẳng với Claude:
> "Tạo dự án mới tên X, ngành Logistics, cho 2 developer, scope vừa"

Claude sẽ tự khởi tạo dự án và bắt đầu Discovery.

---

### Dự án CŨ / ĐANG DỞ — 3 bước

```
Bước 1: Mở Claude Code trong thư mục dự án đang có code/docs
Bước 2: Gõ /mcv3:assess    → AI tự scan codebase, đánh giá gaps
Bước 3: Đọc REMEDIATION-PLAN.md → Biết bước tiếp theo cần làm gì
```

---

## 4. Triển khai dự án MỚI — Chi tiết từng bước

### Tổng quan pipeline

```
Idea
  ↓
Phase 1: /mcv3:discovery    → Hiểu dự án, scope, stakeholders
  ↓
Phase 2: /mcv3:expert-panel → Phân tích chuyên gia (strategy, finance, legal)
  ↓
Phase 3: /mcv3:biz-docs     → Tài liệu nghiệp vụ (quy tắc, quy trình, data)
  ↓
Phase 4: /mcv3:requirements → Yêu cầu kỹ thuật (User Stories, Features)
  ↓
Phase 5: /mcv3:tech-design  → Thiết kế kỹ thuật (API, Database, Architecture)
  ↓
Phase 6: /mcv3:qa-docs      → Test Cases, User Guide, Admin Guide
  ↓
Phase 7: /mcv3:code-gen     → Sinh code scaffolding + Verification Loop
  ↓
Phase 8a: /mcv3:verify      → Kiểm tra traceability end-to-end
  ↓
Phase 8b: /mcv3:deploy-ops  → Kế hoạch triển khai, Rollback Plan, SLA
```

> **Lưu ý:** Không nhất thiết phải chạy đủ 9 phases. Xem [Scale Decision Matrix](#5-quy-mô-dự-án--scale-decision-matrix) để biết nên bỏ phase nào.

---

### Bước 1: `/mcv3:discovery` — Khám phá dự án

**Mục đích:** Hiểu rõ dự án cần làm gì, cho ai, quy mô thế nào.

**Cách chạy:**
```
/mcv3:discovery
```

**AI làm gì?**
- Phỏng vấn bạn theo block (không hỏi từng câu lẻ tẻ)
- Tự động điều chỉnh câu hỏi theo ngành (F&B, Logistics, Healthcare, v.v.)
- Tạo `PROJECT-OVERVIEW.md` với scope, stakeholders, systems, tech stack

**Output:**
```
.mc-data/projects/{slug}/_PROJECT/PROJECT-OVERVIEW.md
```

**Bao gồm:**
- Mô tả dự án và vấn đề cần giải quyết
- Danh sách systems (VD: ERP, Website, Mobile App)
- Tech stack đề xuất
- Timeline dự kiến
- **Scale recommendation** — AI tự đề xuất nên chạy pipeline nào (Micro/Small/Medium/Large)

---

### Bước 2: `/mcv3:expert-panel` — Phân tích chuyên gia

**Mục đích:** Góc nhìn từ 3 chuyên gia ảo — Strategy, Finance, Legal/Compliance.

**Cách chạy:**
```
/mcv3:expert-panel
```

**AI làm gì?**
- Triệu tập 3 expert agents phân tích dự án
- Strategy Expert: rủi ro thị trường, competitive advantage, GTM
- Finance Expert: cost structure, revenue model, ROI
- Legal/Compliance Expert: quy định pháp lý, PDPA, ngành đặc thù (BHYT, PCI-DSS, v.v.)

**Output:**
```
.mc-data/projects/{slug}/_PROJECT/EXPERT-LOG.md
```

---

### Bước 3: `/mcv3:biz-docs` — Tài liệu nghiệp vụ

**Mục đích:** Hệ thống hóa quy tắc kinh doanh, quy trình, từ điển dữ liệu.

**Cách chạy:**
```
/mcv3:biz-docs
```

**AI làm gì?**
- Tạo Business Rules với formal IDs (`BR-{DOMAIN}-NNN`)
- Vẽ quy trình nghiệp vụ theo domain
- Định nghĩa Data Dictionary (thuật ngữ, entities chính)

**Output:**
```
.mc-data/projects/{slug}/_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOMAIN}.md
.mc-data/projects/{slug}/_PROJECT/PROCESS/PROCESS-{DOMAIN}.md
.mc-data/projects/{slug}/_PROJECT/DATA-DICTIONARY.md
```

---

### Bước 4: `/mcv3:requirements` — Yêu cầu kỹ thuật

**Mục đích:** Chuyển Business Docs thành User Stories, Features, Acceptance Criteria.

**Cách chạy:**
```
/mcv3:requirements
```

**AI làm gì?**
- Đọc BIZ-POLICY + PROCESS + PROJECT-OVERVIEW
- Tạo User Stories (`US-{MOD}-NNN`) cho từng module
- Tạo Functional Requirements (`FT-{MOD}-NNN`)
- Tạo Acceptance Criteria (`AC-{MOD}-NNN-XX`)
- Tạo Non-Functional Requirements (`NFR-NNN`)

**Output:**
```
.mc-data/projects/{slug}/{SYSTEM}/P1-REQUIREMENTS/URS-{MODULE}.md
```

---

### Bước 5: `/mcv3:tech-design` — Thiết kế kỹ thuật

**Mục đích:** Từ yêu cầu → thiết kế API, Database Schema, Architecture.

**Cách chạy:**
```
/mcv3:tech-design
```

**AI làm gì?**
- Tạo MODSPEC (Module Specification) — file all-in-one per module
- Thiết kế API endpoints (`API-{SYS}-NNN`)
- Thiết kế Database Schema — tables, relations, indexes (`TBL-{SYS}-NNN`)
- Architecture Decision Records (ADR)
- Cho Embedded/IoT: Pin map, RTOS tasks, State machine, Protocol specs

**Output:**
```
.mc-data/projects/{slug}/{SYSTEM}/P2-DESIGN/MODSPEC-{MODULE}.md
```

---

### Bước 6: `/mcv3:qa-docs` — Test Cases & Documentation

**Mục đích:** Tạo Test Cases từ Acceptance Criteria; viết User Guide và Admin Guide.

**Cách chạy:**
```
/mcv3:qa-docs
```

**AI làm gì?**
- Tạo Test Cases (`TC-{MOD}-NNN`) — Happy path, Error cases, Edge cases
- Tạo UAT Scenarios cho từng User Story
- Viết User Guide (hướng dẫn sử dụng cho end-user)
- Viết Admin Guide (hướng dẫn quản trị hệ thống)

**Output:**
```
.mc-data/projects/{slug}/{SYSTEM}/P3-QA-DOCS/TEST-{MODULE}.md
.mc-data/projects/{slug}/_PROJECT/USER-GUIDE.md
.mc-data/projects/{slug}/_PROJECT/ADMIN-GUIDE.md
```

---

### Bước 7: `/mcv3:code-gen` — Sinh code

**Mục đích:** Sinh code scaffolding hoàn chỉnh từ MODSPEC + Test Cases.

**Cách chạy:**
```
/mcv3:code-gen
```

**AI làm gì?**
- Đọc MODSPEC + TEST cho từng module
- Sinh code theo ngôn ngữ/framework đã định nghĩa trong PROJECT-OVERVIEW
- Tự động chạy **Verification Loop 8 bước** sau khi sinh code

**Files sinh ra:**
```
src/{sys}/{mod}/controllers/{mod}.controller.ts
src/{sys}/{mod}/services/{mod}.service.ts
src/{sys}/{mod}/repositories/{mod}.repository.ts
src/{sys}/{mod}/validators/{mod}.validator.ts
src/{sys}/{mod}/__tests__/{mod}.service.test.ts
db/migrations/V{NNN}__create_{table}.sql
.github/workflows/ci.yml
```

**Verification Loop tự động (8 bước):**

| Bước | Kiểm tra | Tự sửa? |
|------|----------|---------|
| 1 | Compile check (tsc / go build) | Có |
| 2 | Lint (ESLint / Ruff) | Có (auto-fixable) |
| 3 | Test run (Jest / pytest) | Có (max 3 retry) |
| 4 | Security scan (SQL injection, missing auth, hardcoded secrets) | Có (CRITICAL) |
| 5 | Integration check (controller ↔ service ↔ repo) | Có |
| 6 | Migration test (up + down rollback) | Có |
| 7 | Coverage (≥80% lines, ≥70% branches) | Báo cáo |
| 8 | Final report | — |

**Markers khi specs chưa đủ:**
```typescript
// REVIEW: Cần xác nhận — specs chưa rõ
// PENDING: Cần bổ sung tại Phase 5
// SECURITY-WARNING: Cần kiểm tra thủ công
```

---

### Bước 8: `/mcv3:verify` — Kiểm tra traceability

**Mục đích:** Đảm bảo mọi yêu cầu đều có code và test tương ứng.

**Cách chạy:**
```
/mcv3:verify
```

**AI kiểm tra chuỗi:**
```
PROB → BR → US → FT → API → Code → TC
```

**Output:**
```
.mc-data/projects/{slug}/_VERIFY-CROSS/traceability-matrix.md
.mc-data/projects/{slug}/_VERIFY-CROSS/verification-report.md
```

**Kết quả:**
- ✅ READY — Sẵn sàng deploy
- ⚠️ NEEDS ATTENTION — Có gaps nhỏ cần xem xét
- ❌ NOT READY — Có gaps nghiêm trọng, cần bổ sung

---

### Bước 9: `/mcv3:deploy-ops` — Kế hoạch triển khai

**Mục đích:** Tạo kế hoạch deploy chi tiết với rollback và monitoring.

**Điều kiện:** Verification Report phải ở trạng thái READY.

**Cách chạy:**
```
/mcv3:deploy-ops
```

**Output:**
```
.mc-data/projects/{slug}/_PROJECT/DEPLOY-OPS.md
.mc-data/projects/{slug}/_VERIFY-CROSS/deploy-readiness-checklist.md
```

**Bao gồm:**
- Deploy Plan (strategy, timeline, commands)
- Go-Live Checklist (T-7 → T+7 days)
- Rollback Plan (triggers, từng bước rollback)
- Monitoring Setup (metrics, alerts, dashboards)
- SLA Definitions (uptime, response time, support tiers)

---

## 5. Quy mô dự án — Scale Decision Matrix

MCV3 không yêu cầu chạy đủ 8 phases cho mọi dự án. AI tự đề xuất quy mô phù hợp khi bạn chạy `/mcv3:discovery`.

| Quy mô | Ví dụ | Phases cần chạy | Bỏ qua |
|--------|-------|----------------|--------|
| **Micro** | Landing page, tool nội bộ đơn giản, < 10 endpoints, 1 developer | 1 → 5 → 7 | Phase 2, 3, 4, 6, 8 |
| **Small** | MVP, web app nhỏ, < 30 endpoints, 1-2 devs | 1 → 4 → 5 → 7 → 8a | Phase 2, 3, 6, 8b |
| **Medium** | SaaS, B2B app, < 100 endpoints, 2-5 devs | 1 → 5 → 7 → 8a → 8b | Phase 3 optional |
| **Large** | ERP, platform phức tạp, 100+ endpoints, 5+ devs | Full 8 phases bắt buộc | — |
| **Enterprise** | Hệ thống regulated (healthcare, fintech, banking) | Full 8 phases + compliance gates | — |

**Phases được bỏ qua phải ghi rõ lý do trong PROJECT-OVERVIEW.**

---

## 6. Triển khai dự án CŨ / ĐANG DỞ

Bạn có dự án đang chạy và muốn:
- Biết dự án đang "thiếu" gì so với chuẩn
- Đồng bộ code và docs
- Onboard vào MCV3 mà không restart từ đầu

### Quy trình 5 bước

---

### Bước 1: `/mcv3:assess` — Đánh giá toàn diện

```
/mcv3:assess
```

**AI làm gì?**
1. **Phân loại dự án** — code-only / docs-only / mixed / production
2. **Scan codebase** — detect systems, modules, tech stack tự động
3. **Per-system assessment** — đánh giá từng system đang ở phase nào
4. **Gap Analysis** — phân loại gaps: CRITICAL / WARNING / INFO
5. **Code-Docs Sync** — so sánh APIs, DB tables, BRs giữa code và docs
6. **Remediation Roadmap** — action plan với skill MCV3 tương ứng

**Output:**
```
.mc-data/projects/{slug}/_mcv3-work/assessment/PROJECT-MANIFEST.md
.mc-data/projects/{slug}/_mcv3-work/assessment/ASSESSMENT-MATRIX.md
.mc-data/projects/{slug}/_mcv3-work/assessment/GAP-REPORT.md
.mc-data/projects/{slug}/_mcv3-work/assessment/REMEDIATION-PLAN.md
```

| Loại dự án | Đặc điểm | Gợi ý skill tiếp theo |
|------------|----------|----------------------|
| Có code, không có docs | Code đang chạy nhưng không có tài liệu | `/mcv3:migrate` (reverse engineering) |
| Có docs cũ, chưa có code | Docs Word/PDF/Confluence cũ | `/mcv3:migrate` → `/mcv3:requirements` |
| Có cả code + docs, chưa đồng bộ | Docs và code đã tách rời nhau | `/mcv3:change-manager` |
| Production, muốn formalize | Hệ thống đang chạy, muốn chuẩn hóa | Skills theo REMEDIATION-PLAN |

---

### Bước 2: `/mcv3:migrate` — Import tài liệu cũ (nếu cần)

```
/mcv3:migrate
```

**5 nguồn có thể import:**

| Nguồn | Cách cung cấp |
|-------|--------------|
| Word / PDF / Excel docs | Paste nội dung hoặc mô tả |
| Confluence / Notion | Export markdown → paste |
| Codebase (reverse engineering) | Cung cấp đường dẫn code |
| Emails / Stories / Chat logs | Paste nội dung |
| Mixed sources | Paste tất cả → AI tổng hợp |

**Output:**
- Documents đã convert sang MCV3 format
- `MIGRATION-REPORT.md` — báo cáo quá trình chuyển đổi
- Gap analysis — những gì còn thiếu sau khi migrate

---

### Bước 3: Thực hiện theo Remediation Plan

Đọc `REMEDIATION-PLAN.md` và chạy skills theo thứ tự ưu tiên được đề xuất.

Ví dụ plan tiêu biểu:
```
CRITICAL (làm ngay):
  1. /mcv3:requirements — Thiếu URS cho module Inventory
  2. /mcv3:tech-design  — MODSPEC chưa có API specs

HIGH (làm trong sprint này):
  3. /mcv3:qa-docs      — Chưa có Test Cases

MEDIUM (làm sau):
  4. /mcv3:deploy-ops   — Chưa có Rollback Plan
```

---

### Bước 4: `/mcv3:verify` — Kiểm tra sau khi hoàn thiện

Sau khi đã bổ sung tài liệu/code theo Remediation Plan:
```
/mcv3:verify
```

---

### Bước 5: `/mcv3:status` — Theo dõi tiến độ

```
/mcv3:status
```

Hiển thị dashboard per-system — từng system đang ở phase nào, còn thiếu gì.

---

## 7. Skills Lifecycle — Sau khi dự án chạy

Dùng sau khi dự án đã ở Phase 5+ (có MODSPEC):

---

### `/mcv3:change-manager` — Quản lý thay đổi yêu cầu

**Khi nào dùng:**
- Stakeholder yêu cầu thay đổi business rule
- Phát hiện inconsistency cần sửa
- Regulatory changes ảnh hưởng requirements

**Flow tự động:**
```
1. Nhập thay đổi: mô tả + element ID bị ảnh hưởng
2. Impact Analysis: AI tự phân tích tất cả docs bị ảnh hưởng
3. Safety Snapshot: tự động backup trước khi sửa
4. Document Updates: tự cập nhật tất cả docs liên quan
5. Changelog: ghi CHG-{NNN} record
```

---

### `/mcv3:evolve` — Mở rộng tính năng

**4 loại evolution:**

| Loại | Ví dụ | Phiên bản |
|------|-------|-----------|
| Sub-feature | Thêm export CSV vào module Report | PATCH |
| New Module | Thêm module Loyalty vào hệ thống | MINOR |
| New System | Thêm Mobile App vào dự án hiện có | MINOR/MAJOR |
| MVP → Full | Scale up từ 3 modules → 15 modules | MAJOR |

---

### `/mcv3:status` — Dashboard tiến độ

```
/mcv3:status
```

Hiển thị:
- Tất cả projects đang có
- Phase hiện tại của từng system
- Documents đã hoàn thành
- Gaps còn lại
- Gợi ý bước tiếp theo

---

### `/mcv3:onboard` — Hướng dẫn thành viên mới

**3 chế độ:**

| Chế độ | Dành cho | Nội dung |
|--------|----------|---------|
| Developer | Backend/Frontend dev | Setup, pipeline, MCP tools, Formal IDs, demo workflow |
| PM / BA | Product Manager, Business Analyst | Quy trình, stakeholder gates, phase deliverables |
| Business Owner | CEO, non-technical stakeholder | Problem/solution, 8-step process, ROI, bàn giao |

**Output:** Cheat sheet tùy chỉnh + next steps phù hợp

---

## 8. Cách MCV3 hoạt động

### Auto-Mode Protocol — 3 loại chế độ

MCV3 phân loại skills thành 3 chế độ dựa trên mức độ cần tương tác:

---

#### Type A — Full Auto (không cần input)

**Skills:** `expert-panel`, `biz-docs`, `requirements`, `qa-docs`, `code-gen`, `verify`, `navigator`

```
→ AI đọc toàn bộ context từ docs đã có
→ Chạy hoàn toàn tự động từ đầu đến cuối
→ Kết thúc bằng Completion Report
```

Bạn chỉ cần gõ lệnh, AI tự làm hết. Không cần confirm, không cần chọn module.

---

#### Type B — Smart Interview (phỏng vấn adaptive)

**Skills:** `discovery`

```
→ AI phỏng vấn theo block (không hỏi từng câu)
→ Tự điều chỉnh câu hỏi theo ngành của bạn
→ Auto-process sau mỗi block
→ Kết thúc bằng Completion Report
```

Bạn trả lời các câu hỏi theo chủ đề, AI tổng hợp thành tài liệu.

---

#### Type C — Hybrid (cần input ban đầu, sau đó auto)

**Skills:** `assess`, `change-manager`, `evolve`, `migrate`, `onboard`, `tech-design`, `deploy-ops`

```
→ AI hỏi 1 câu duy nhất nếu thiếu thông tin blocking
→ Sau khi có đủ input → tự chạy hoàn toàn đến cuối
→ Kết thúc bằng Completion Report
```

**Nguyên tắc Type C:** Nếu đã cung cấp đủ context trong message → AI bắt đầu ngay, không hỏi lại.

---

### Output Display — Lưu file trước, show tóm tắt

MCV3 **không bao giờ** dump toàn bộ nội dung tài liệu vào chat. Thay vào đó:

```
1. mc_save → lưu file vào .mc-data/
2. Show tóm tắt: tên file + metrics + decisions
3. Completion Report + user options:
   [1] Xem chi tiết file nào?
   [2] Có thay đổi gì không?
   [3] OK, tiếp tục → /mcv3:{next-skill}
```

**Ví dụ tóm tắt sau khi lưu:**
```
📄 Đã lưu: ERP/P1-REQUIREMENTS/URS-INV.md
   → 12 User Stories (US-INV-001 → US-INV-012)
   → 28 Functional Requirements (FT-INV-001 → FT-INV-028)
   → 45 Acceptance Criteria
   → 6 Non-Functional Requirements
   ⚠️ 2 quyết định cần review (xem DECISION-LOG)
```

Để xem chi tiết file bất kỳ, chỉ cần nói tên file: *"Xem URS-INV.md"*

---

### Smart Code-Gen — Sinh code thông minh

Code-gen tự điều chỉnh theo mức độ đầy đủ của specs:

| Trạng thái specs | Code được sinh | Marker |
|-----------------|----------------|--------|
| BR, API, TBL, TC đầy đủ | Code hoàn chỉnh, production-ready | Không có marker |
| Specs một phần mơ hồ | Code best-effort + câu hỏi | `// REVIEW: ...` |
| Thiếu specs hoàn toàn | Interface + placeholder | `// PENDING: Cần Phase X` |

---

### Verify & Check — 3 tầng kiểm tra

Trước khi báo "Hoàn thành", mọi skill đều tự kiểm tra:

| Tầng | Kiểm tra gì |
|------|------------|
| **Tầng 1** (Self) | Format đúng, IDs đúng, không còn placeholder TBD/TODO |
| **Tầng 2** (Cross) | IDs từ input không bị "drop" trong output; coverage đủ |
| **Tầng 3** (Gate) | mc_validate pass; không duplicate IDs; không mâu thuẫn |

Nếu fail → tự fix → retry tối đa 2 lần → báo cáo issues còn tồn tại.

---

## 9. Danh sách đầy đủ 15 Skills

### Pipeline Skills (Phase 1-8)

| Skill | Command | Phase | Mô tả | Khi nào dùng |
|-------|---------|-------|-------|--------------|
| navigator | `/mcv3:status` | — | Dashboard tiến độ dự án | Bất cứ lúc nào muốn xem tiến độ |
| discovery | `/mcv3:discovery` | 1 | Khám phá dự án, phỏng vấn scope | Đầu tiên, khi bắt đầu dự án mới |
| expert-panel | `/mcv3:expert-panel` | 2 | Phân tích 3 chuyên gia (strategy, finance, legal) | Sau Discovery |
| biz-docs | `/mcv3:biz-docs` | 3 | Tạo Business Rules, Process, Data Dictionary | Sau Expert Panel |
| requirements | `/mcv3:requirements` | 4 | Viết User Stories, Features, Acceptance Criteria | Sau Biz-Docs |
| tech-design | `/mcv3:tech-design` | 5 | Thiết kế API, Database, Architecture | Sau Requirements |
| qa-docs | `/mcv3:qa-docs` | 6 | Tạo Test Cases, User Guide, Admin Guide | Sau Tech Design |
| code-gen | `/mcv3:code-gen` | 7 | Sinh code + Verification Loop tự động | Sau QA Docs |
| verify | `/mcv3:verify` | 8a | Cross-verify traceability end-to-end | Sau Code-Gen |
| deploy-ops | `/mcv3:deploy-ops` | 8b | Kế hoạch deploy, Rollback, Monitoring, SLA | Sau Verify (status = READY) |

### Lifecycle Skills (Sprint 4 — Dùng sau Phase 5+)

| Skill | Command | Mô tả | Khi nào dùng |
|-------|---------|-------|--------------|
| change-manager | `/mcv3:change-manager` | Quản lý requirements changes với impact analysis | Khi stakeholder yêu cầu thay đổi |
| onboard | `/mcv3:onboard` | Tutorial cho user mới (Developer / PM / Business) | Khi onboard member mới |
| evolve | `/mcv3:evolve` | Thêm sub-feature / module / system mới | Khi muốn mở rộng dự án |
| migrate | `/mcv3:migrate` | Import tài liệu cũ vào MCV3 format | Khi có docs Word/Confluence/code cũ |
| assess | `/mcv3:assess` | Đánh giá dự án in-progress, tìm gaps | Khi tiếp nhận dự án đang dở |

---

## 10. Danh sách 19 MCP Tools

MCP Tools là công cụ AI dùng tự động trong quá trình chạy skills. Bạn không cần gọi trực tiếp trong hầu hết trường hợp.

### Sprint 0 — Core (5 tools)

| Tool | Mục đích |
|------|---------|
| `mc_init_project` | Khởi tạo dự án mới, tạo cấu trúc `.mc-data/` |
| `mc_save` | Lưu tài liệu Markdown vào project memory |
| `mc_load` | Đọc tài liệu (có Smart Context Layering 4 tầng) |
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

---

## 11. 12 Ngành nghề hỗ trợ

Domain Expert Agent có knowledge base chuyên biệt cho 12 ngành. AI tự detect ngành của bạn và áp dụng knowledge phù hợp.

| Ngành | Trọng tâm | Compliance đặc thù |
|-------|---------|------------------|
| **F&B** | Menu, kitchen ops, delivery, POS | VSATTP, HACCP |
| **Logistics** | WMS, TMS, last-mile, customs | C/O, HS code, Incoterms |
| **Retail** | POS, inventory, omnichannel, loyalty | — |
| **SaaS** | Subscription, onboarding, churn, billing | GDPR, SOC2 |
| **Healthcare** | EMR, HIS, KCB, BHYT, appointment | Thông tư 46/2018, BHYT law |
| **Fintech** | Core banking, AML, lending, payment gateway | PCI-DSS, Basel III, Circular 39 |
| **E-Commerce** | Cart, checkout, marketplace, review | — |
| **Real Estate** | BĐS CRM, commission, dự án, hợp đồng | Luật Đất đai 2024, Luật Kinh doanh BĐS |
| **Manufacturing** | BOM, MRP, QC, production order, C/O | ISO 9001, IATF 16949 |
| **Education** | LMS, học sinh, lịch học, điểm số | Thông tư 22/2021, Bộ GD&ĐT |
| **HR/HRM** | Payroll, BHXH, PIT, timekeeping, recruitment | Bộ Luật Lao động 2019, Nghị định 145 |
| **Embedded/IoT** | MCU platforms, firmware, IoT protocols, smart farm/home | IEC 62443, IP ratings |

---

## 12. Tech Stacks hỗ trợ

Code-Gen tự detect tech stack từ PROJECT-OVERVIEW và sinh code đúng syntax.

### Backend

| Framework | Ngôn ngữ | ORM / DB Driver |
|-----------|----------|----------------|
| Express.js / NestJS | TypeScript / Node.js | Prisma, TypeORM, Drizzle |
| FastAPI / Django | Python | SQLAlchemy, Alembic |
| Spring Boot | Java | JPA / Hibernate |
| Gin / Fiber | Go | GORM, sqlx |

### Frontend

| Framework | Language | State Management |
|-----------|----------|-----------------|
| Next.js 14+ (App Router) | TypeScript | Zustand, TanStack Query |
| React | TypeScript / JavaScript | Redux, Zustand |
| Vue 3 | TypeScript / JavaScript | Pinia |
| Angular | TypeScript | NgRx |

### Mobile

| Framework | Language | Đặc thù |
|-----------|----------|---------|
| React Native (Expo) | TypeScript | EAS Build, offline-first |
| Flutter | Dart | Riverpod, GetX |

### Database

| Loại | Sản phẩm |
|------|---------|
| Relational | PostgreSQL, MySQL, SQLite |
| NoSQL | MongoDB, Redis |
| BaaS | Firebase, Supabase |

### Embedded / IoT

| Platform | Đặc thù |
|----------|---------|
| ESP32 | FreeRTOS, WiFi/BLE, MQTT |
| STM32 | HAL, RTOS, CAN/UART |
| RP2040 | MicroPython, C SDK |
| Raspberry Pi | Linux, Python, GPIO |

---

## 13. FAQ — Câu hỏi thường gặp

**Q: Dự án nhỏ có cần chạy hết 8 phases không?**

Không. Dùng Scale Decision Matrix để chọn pipeline phù hợp. Landing page chỉ cần Phase 1 → 5 → 7. AI sẽ tự đề xuất khi bạn chạy `/mcv3:discovery`.

---

**Q: Có thể chạy song song nhiều modules không?**

Có. MCV3 dùng Multi-System Orchestration với topological sort. AI tự phân tích dependency và xác định modules nào có thể chạy song song, modules nào phải chờ nhau.

---

**Q: Code gen ra có chạy được luôn không?**

Phụ thuộc vào mức độ đầy đủ của specs. Nếu MODSPEC đầy đủ (BR, API, TBL, TC rõ ràng), code sinh ra sẽ compile và test pass. Nếu specs còn thiếu, code có markers `// REVIEW:` hoặc `// PENDING:` để bạn biết cần bổ sung gì.

---

**Q: .mc-data/ là gì và có cần backup không?**

`.mc-data/` là nơi lưu toàn bộ tài liệu dự án (URS, MODSPEC, TEST, v.v.). Đây là "source of truth" của dự án. **Nên commit vào git** để team chia sẻ, hoặc backup định kỳ. Update plugin **không bao giờ** xóa `.mc-data/`.

---

**Q: Có thể dùng MCV3 cho nhiều dự án cùng lúc không?**

Có. Mỗi dự án có `project-slug` riêng trong `.mc-data/projects/{slug}/`. Dùng `/mcv3:status` để xem tất cả projects đang có.

---

**Q: Dữ liệu dự án có lên cloud không?**

Không. Toàn bộ `.mc-data/` lưu cục bộ trong thư mục dự án của bạn. MCP Server chạy local (Node.js). Không có gì được gửi ra ngoài ngoài việc Claude gọi AI API theo yêu cầu của bạn.

---

**Q: Cập nhật lên version mới có mất dữ liệu không?**

Không. Update chỉ cập nhật thư mục `mcv3-devkit/` (plugin files). `.mc-data/` được bảo toàn hoàn toàn.

---

**Q: Team nhiều người có dùng chung được không?**

Có, nếu commit cả `.mc-data/` vào git repository. Mỗi người dùng Claude Code riêng, nhưng chia sẻ cùng project memory qua git.

---

## 14. Cập nhật & Update

### Cách update lên version mới

```bash
# Bước 1: Tải phiên bản mới (git pull hoặc tải release zip)
git pull

# Bước 2: Chạy update script
bash scripts/update.sh /đường/dẫn/đến/dự-án

# Windows PowerShell:
.\scripts\install.ps1 C:\đường\dẫn\đến\dự-án
```

### Bảo toàn dữ liệu dự án

- **`.mc-data/`** — **KHÔNG BAO GIỜ** bị xóa hoặc sửa khi update
- Skills và templates được update lên version mới
- Các tài liệu đã tạo giữ nguyên

### Kiểm tra version đang dùng

```bash
cat mcv3-devkit/.claude-plugin/plugin.json | grep version
# Hoặc
bash mcv3-devkit/scripts/verify-install.sh
```

---

## 15. Troubleshooting

### MCP Server không kết nối

**Triệu chứng:** `mc_status()` không hoạt động, AI không nhận ra MCP tools.

**Xử lý:**
```bash
# Kiểm tra .mcp.json có đúng không
cat .mcp.json

# Rebuild MCP server
cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build

# Khởi động lại Claude Code
```

---

### Skills không hiện khi gõ /mcv3

**Triệu chứng:** Gõ `/mcv3:` không thấy autocomplete.

**Xử lý:**
```bash
# Kiểm tra slash commands đã có chưa
ls .claude/commands/mcv3/

# Nếu không có, chạy install lại
bash mcv3-devkit/scripts/install.sh
```

---

### Claude không biết về MCV3

**Triệu chứng:** Claude không hiểu khi bạn nói về skills hay pipeline.

**Xử lý:**
```bash
# Kiểm tra .claude/CLAUDE.md
cat .claude/CLAUDE.md | grep MCV3

# Nếu không có, chạy install lại để tạo file
bash mcv3-devkit/scripts/install.sh
```

---

### Lỗi khi chạy code-gen

**Triệu chứng:** Code-gen báo lỗi hoặc tạo ra code với nhiều `// PENDING:` markers.

**Xử lý:**
- Kiểm tra MODSPEC cho module đó đã đầy đủ chưa (`/mcv3:tech-design` nếu chưa có)
- Chạy `/mcv3:qa-docs` để có Test Cases trước khi code-gen
- Xem `// REVIEW:` comments để biết phần nào cần bổ sung thêm vào MODSPEC

---

### Lỗi PowerShell execution policy (Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Node.js chưa cài

Tải Node.js v18+ từ [nodejs.org](https://nodejs.org). Sau khi cài xong, chạy lại installer.

---

## 16. Version History

| Version | Ngày | Thay đổi chính |
|---------|------|----------------|
| **3.11.2** | 2026-03-20 | Install & Update System — `install.sh`, `install.ps1`, `update.sh`, `verify-install.sh`. Auto-generate `.claude/CLAUDE.md` khi cài. |
| **3.11.1** | 2026-03-20 | Output Display Protocol — Skills không dump full document vào chat; chỉ show tóm tắt metrics + user options [1]/[2]/[3]. |
| **3.11.0** | 2026-03 | Auto-Mode Framework — Tất cả skills chạy tự động hoàn toàn, không dừng hỏi user giữa chừng. |
| **3.10.0** | 2026-03 | Assess Skill (Phase A) — Đánh giá dự án in-progress, scan codebase, per-system phase tracking. |
| **3.9.x** | 2026-02 | Code Quality Assurance (Batch E) — Verification Loop 8 bước tự động sau code-gen: compile → lint → test → security → integration → migration → coverage. |
| **3.8.x** | 2026-02 | Full Implementation Engine (Batch D) — Smart Code-Gen, Multi-System Orchestration (topological sort), BR-to-Code Transpiler, Real Queries, Zod Schemas. |
| **3.7.x** | 2026-01 | Scale Flexibility & Industry Expansion (Batch C) — Scale Decision Matrix, 12 ngành, Next.js 14, React Native, NoSQL guides. |
| **3.6.x** | 2026-01 | Lifecycle Management (Sprint 4) — Change Manager, Evolve, Migrate, Onboard skills. |
| **3.5.x** | 2025-12 | Multi-System support — Per-system phase tracking trong `_config.json` và `mc_status`. |
| **3.0.x** | 2025-11 | Pipeline 8 phases đầy đủ + 19 MCP Tools (Sprint 0-2). |

---

*Hướng dẫn này được duy trì cùng với phiên bản plugin. Xem [CHANGELOG.md](../CHANGELOG.md) để biết chi tiết từng thay đổi.*
