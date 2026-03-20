# Onboard Skill — `/mcv3:onboard`

## Mục đích

Hướng dẫn **user mới** sử dụng MCV3 plugin lần đầu. Skill này:
1. Xác định loại user (Developer, PM, Business Owner)
2. Hướng dẫn **interactive tutorial** tailored theo user type
3. Demo workflow với ví dụ cụ thể
4. Giúp user tạo **project đầu tiên** thành công

---

## DEPENDENCY MAP

```
Requires: (không cần prerequisites — đây là entry point)
Produces:
  - User hiểu cách dùng MCV3
  - (Tùy chọn) Dự án đầu tiên được khởi tạo
Enables: /mcv3:discovery (Phase 1)
Agents: orchestrator
MCP Tools:
  - mc_status, mc_init_project (tùy chọn)
References:
  - skills/onboard/references/quick-start-developer.md
  - skills/onboard/references/quick-start-pm.md
  - skills/onboard/references/quick-start-business.md
```

---

## Khi nào dùng skill này

- Lần đầu tiên dùng MCV3 plugin
- Muốn giới thiệu MCV3 cho teammate mới
- Cần refresh lại kiến thức về workflow
- Muốn xem demo trước khi bắt đầu dự án thật

---

## Phase 0 — Welcome & User Type Detection

```
"👋 Xin chào! Tôi là MCV3 — MasterCraft DevKit.

Tôi giúp bạn biến ý tưởng phần mềm thành bộ tài liệu kỹ thuật hoàn chỉnh:
từ Business Requirements → Architecture Design → Code Scaffolding.

Để hướng dẫn phù hợp nhất, bạn là:

[1] Developer / Tech Lead
    → Muốn tìm hiểu code gen, tech design, MCP tools
    → 15 phút tutorial

[2] Product Manager / Business Analyst
    → Muốn tìm hiểu requirements, biz docs, workflows
    → 10 phút tutorial

[3] Business Owner / Stakeholder
    → Muốn hiểu MCV3 làm gì, kết quả nhận được
    → 5 phút overview

[4] Tôi đã quen — muốn tạo dự án ngay
    → Chuyển thẳng đến /mcv3:discovery

[5] Tôi có dự án đang chạy — muốn tích hợp MCV3
    → Tutorial cho dự án in-progress / ongoing project
    → 10 phút hướng dẫn onboard dự án cũ"
```

---

## Phase 1A — Developer Tutorial

Đọc `references/quick-start-developer.md` và hướng dẫn:

### 1A.1 — Pipeline Overview

```
"🏗️ MCV3 Pipeline — 8 Phases

Phase 1: Discovery     → PROJECT-OVERVIEW.md
Phase 2: Expert Panel  → EXPERT-LOG.md (AI chuyên gia phân tích)
Phase 3: Biz Docs      → BIZ-POLICY + PROCESS + DATA-DICTIONARY
Phase 4: Requirements  → URS-{MOD}.md (US, FT, AC, NFR với formal IDs)
Phase 5: Tech Design   → MODSPEC-{MOD}.md (API, DB, Components, ADR)
Phase 6: QA Docs       → TEST + USER-GUIDE + ADMIN-GUIDE
Phase 7: Code Gen      → src/ scaffolding với REQ-ID comments
Phase 8: Verify        → Traceability matrix + DEPLOY-OPS

Mỗi phase tạo tài liệu chuẩn → phase sau dùng làm input.
MODSPEC là 'all-in-one spec': AI đọc 1 file → code được cả module."
```

### 1A.2 — MCP Tools Overview

```
"🛠️ MCP Server: mcv3-project-memory

19 tools chia thành 3 nhóm:

Core (5): mc_init_project, mc_save, mc_load, mc_list, mc_status
Session (5): mc_checkpoint, mc_resume, mc_validate, mc_export, mc_search
Advanced (9): mc_snapshot, mc_rollback, mc_impact_analysis,
              mc_traceability, mc_dependency, mc_compare,
              mc_merge, mc_changelog, mc_summary

Smart Context Layering:
  mc_load(layer: 0) → ~500B key-facts (orientation)
  mc_load(layer: 1) → dependency map (planning)
  mc_load(layer: 2) → sections (review)
  mc_load(layer: 3) → full content (coding)"
```

### 1A.3 — Formal ID System

```
"🔖 Formal ID System — traceability từ đầu đến cuối:

BR-WH-001    Business Rule   → BIZ-POLICY
US-WH-001    User Story      → URS
FT-WH-001    Feature         → URS
AC-WH-001-01 Acceptance Crit → URS
API-ERP-001  API Endpoint    → MODSPEC
TBL-ERP-001  Database Table  → MODSPEC
TC-WH-001    Test Case       → TEST
NFR-001      Non-Func Req    → URS

Tracing: BR → US → FT → AC → API → TC (end-to-end verify)

Trong code:
/**
 * @req-ids US-WH-001, FT-WH-001
 * @api-ids API-ERP-001
 */
export class WarehouseService {...}"
```

### 1A.4 — Demo Project

```
"💡 Demo: Tạo project ERP Quản lý Kho

Muốn xem demo thực tế?
[Y] Tạo demo project → tôi sẽ walk through từng bước
[N] Tôi tự thử — hướng dẫn lệnh đầu tiên"
```

Nếu Y: Chạy demo với `mc_init_project({ projectName: "Demo ERP", domain: "Logistics" })`
và walk through Phase 1 Discovery với ví dụ.

---

## Phase 1B — PM/BA Tutorial

Đọc `references/quick-start-pm.md` và hướng dẫn:

### 1B.1 — Value Proposition

```
"📋 MCV3 giúp PM/BA:

TRƯỚC MCV3:
  → Viết requirements tản mạn, thiếu format
  → Khó trace từ business need → technical spec
  → Họp nhiều lần để clarify
  → Dev hiểu sai → re-work

VỚI MCV3:
  → Formal ID system: mọi requirement có ID, dễ track
  → Structured templates: URS chuẩn IIBA/BABOK
  → Traceability matrix: biết ngay FT nào chưa có test
  → AI chuyên gia phân tích giúp tìm gaps và blind spots"
```

### 1B.2 — Workflow cho PM

```
"📊 Workflow PM/BA:

Bước 1: Discovery Interview (/mcv3:discovery)
  → Phỏng vấn về dự án: vấn đề, người dùng, goals
  → Output: PROJECT-OVERVIEW.md

Bước 2: Expert Panel (/mcv3:expert-panel)
  → Chuyên gia AI phân tích: Domain Expert, Finance, Legal...
  → Output: EXPERT-LOG.md với insights + risks

Bước 3: Biz Docs (/mcv3:biz-docs)
  → Business Policies (BR), Processes, Data Dictionary
  → Output: BIZ-POLICY-{MOD}.md per domain

Bước 4: Requirements (/mcv3:requirements)
  → User Stories + Acceptance Criteria + NFR
  → Output: URS-{MOD}.md — chuẩn để dev implement"
```

### 1B.3 — Acceptance Criteria Demo

```
"✅ Ví dụ Acceptance Criteria chuẩn:

US-WH-001: Thủ kho muốn tạo phiếu nhập kho
AC-WH-001-01:
  Given: Thủ kho đã login, có danh sách hàng nhập
  When: Nhập đủ thông tin và submit
  Then: Phiếu nhập được tạo, tồn kho cập nhật, email xác nhận gửi

AC-WH-001-02 (Error case):
  Given: Thủ kho nhập số lượng = 0
  When: Submit form
  Then: Hiện lỗi 'Số lượng phải > 0', form không submit

Mỗi AC đủ cụ thể để QA viết test case từ đó."
```

---

## Phase 1C — Business Owner Overview

Đọc `references/quick-start-business.md` và hướng dẫn:

### 1C.1 — What You Get

```
"🎯 Bạn nhận được gì từ MCV3?

Sau khi hoàn thành pipeline, bạn có:

📁 Bộ tài liệu hoàn chỉnh:
  ├── Business Policy & Rules (PDF-ready)
  ├── Process Flows (AS-IS → TO-BE)
  ├── User Requirements Spec (chuẩn để dev implement)
  ├── Technical Architecture (cho CTO review)
  ├── Test Plan (cho QA thực hiện)
  ├── User Guide & Admin Guide
  └── Deployment Checklist

🔍 Traceability:
  Mỗi dòng code trace về requirement → trace về business need
  Biết ngay feature nào đang phát triển, feature nào chưa

⏱️ Tiết kiệm thời gian:
  Phase 1-4: ~1-2 ngày thay vì 2-4 tuần
  Giảm re-work do misunderstanding requirement"
```

### 1C.2 — Quick Start

```
"🚀 Bắt đầu chỉ cần:

1. Chạy lệnh: /mcv3:discovery
2. Trả lời ~10 câu hỏi về dự án của bạn
3. AI tự tạo PROJECT-OVERVIEW.md

Không cần technical knowledge. Chỉ cần biết:
- Bạn đang giải quyết vấn đề gì?
- Ai là người dùng?
- Kết quả mong đợi là gì?"
```

---

## Phase 1D — Ongoing Project Tutorial

Đọc `references/quick-start-developer.md` (phần ongoing) và hướng dẫn:

### 1D.1 — Dự án của bạn đang ở đâu?

```
"🔄 Ongoing Project Onboarding

Dự án của bạn đang ở trạng thái nào?

[A] Có codebase nhưng ít/không có tài liệu
    → Tôi hướng dẫn tạo docs từ code

[B] Có tài liệu cũ (Word, PDF, Confluence) nhưng chưa dùng MCV3
    → Tôi hướng dẫn migrate sang MCV3 format

[C] Có cả code lẫn docs nhưng chưa đồng bộ
    → Tôi hướng dẫn assess + sync

[D] Đang dùng MCV3, muốn thêm features mới
    → Tôi hướng dẫn evolve workflow

Chọn [A/B/C/D]:"
```

### 1D.2 — Recommended Workflow cho Ongoing Projects

```
"🗺️ Workflow cho dự án in-progress:

Bước 1: ĐÁNH GIÁ (bắt buộc)
  /mcv3:assess → Scan dự án, xác định gaps, tạo remediation plan
  → Output: REMEDIATION-PLAN.md với thứ tự ưu tiên rõ ràng

Bước 2: IMPORT TÀI LIỆU CŨ (nếu có)
  /mcv3:migrate → Convert Word/PDF/Confluence sang MCV3 format
  → Hỗ trợ: Documents, Swagger/API specs, database schema, code

Bước 3: BỔ SUNG TÀI LIỆU THIẾU (theo remediation plan)
  /mcv3:requirements → Viết URS cho modules chưa có
  /mcv3:tech-design  → Tạo MODSPEC từ existing code
  /mcv3:qa-docs      → Tạo test cases cho existing features

Bước 4: SYNC & VERIFY (khi đã đủ docs)
  /mcv3:change-manager → Sync docs với code hiện tại
  /mcv3:verify         → Kiểm tra traceability end-to-end

Bước 5: TIẾP TỤC PHÁT TRIỂN
  /mcv3:evolve → Thêm features mới với full documentation
  /mcv3:status → Dashboard tiến độ bất kỳ lúc nào

💡 Tip: Không cần hoàn thiện docs từ Phase 1 → 8 tuần tự.
   MCV3 cho phép mỗi system ở phase khác nhau — rất bình thường
   với dự án in-progress."
```

### 1D.3 — Ví dụ thực tế

```
"📖 Case study: Dự án có code, không có docs

Tình huống: ERP system đã chạy 6 tháng, có 3 developers,
  src/ có ~50 files, không có tài liệu formal.

Làm với MCV3:
  1. /mcv3:assess → phát hiện: 8 modules, thiếu toàn bộ Phase 1-6 docs
  2. /mcv3:migrate (Scope 3) → reverse-engineer từ code:
     - Extract 25 API endpoints → MODSPEC
     - Extract business logic từ services → BIZ-POLICY, URS
     - Extract DB schema → DATA-DICTIONARY
  3. /mcv3:requirements → bổ sung AC, NFR còn thiếu
  4. /mcv3:verify → build traceability matrix
  5. /mcv3:evolve → thêm Sprint 3 features với docs đầy đủ

Kết quả: Dự án từ 'chaos' → có full traceability trong 2-3 sessions."
```

---

## Phase 2 — Setup Verification

Sau tutorial, kiểm tra setup:

```
"🔧 Kiểm tra cài đặt MCV3:

Kiểm tra MCP Server:"
mc_status()

Nếu MCP server không connect:
```
"⚠️ MCP Server chưa chạy. Cần build trước:

cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build

Rồi thêm vào .mcp.json:
{
  'mcpServers': {
    'mcv3-project-memory': {
      'command': 'node',
      'args': ['mcv3-devkit/mcp-servers/project-memory/dist/index.js'],
      'env': { 'MCV3_PROJECT_ROOT': '.' }
    }
  }
}"
```

Nếu MCP server kết nối OK:
```
"✅ MCP Server đang chạy.
19 tools available (mc_init, mc_save, mc_load, ...)"
```

---

## Phase 3 — First Project (Optional)

```
"🎉 Tutorial hoàn thành!

Bạn đã sẵn sàng bắt đầu dự án đầu tiên chưa?

[Y] Tạo dự án ngay — hỏi tên và domain, rồi chuyển đến /mcv3:discovery
[N] Tôi cần nghiên cứu thêm — gợi ý tài liệu đọc thêm"
```

Nếu Y:
```
"Tên dự án là gì? (VD: 'Hệ thống ERP Công ty ABC')
Lĩnh vực kinh doanh? (VD: Logistics, Retail, SaaS, Healthcare)"
```

→ `mc_init_project({ projectName, domain })` → "✅ Project đã tạo! Chạy /mcv3:discovery để bắt đầu."

---

## Phase 4 — Cheat Sheet

Kết thúc luôn cung cấp cheat sheet:

```
"📌 MCV3 CHEAT SHEET:

Pipeline lệnh:
  /mcv3:discovery      → Thu thập yêu cầu
  /mcv3:expert-panel   → Phân tích chuyên gia
  /mcv3:biz-docs       → Tạo tài liệu nghiệp vụ
  /mcv3:requirements   → Viết URS
  /mcv3:tech-design    → Thiết kế kỹ thuật
  /mcv3:qa-docs        → Tạo Test + Guides
  /mcv3:code-gen       → Generate code
  /mcv3:verify         → Kiểm tra traceability
  /mcv3:deploy-ops     → Tài liệu triển khai

Lifecycle lệnh:
  /mcv3:status         → Xem tiến độ
  /mcv3:change-manager → Quản lý thay đổi
  /mcv3:evolve         → Thêm features mới
  /mcv3:migrate        → Migrate từ format cũ

MCP Tools thường dùng:
  mc_status()          → Xem project hiện tại
  mc_load(layer: 0)    → Đọc key facts nhanh
  mc_checkpoint()      → Lưu progress
  mc_impact_analysis() → Phân tích impact thay đổi"
```

---

## Quy tắc Onboarding

```
TAILORED: Nội dung theo user type — không dump all info
INTERACTIVE: Luôn có câu hỏi/lựa chọn sau mỗi section
PRACTICAL: Ví dụ cụ thể hơn lý thuyết abstract
NO-OVERWHELM: Tối đa 3 concepts per section
ACTIONABLE: Kết thúc tutorial = user biết phải làm gì tiếp
```
