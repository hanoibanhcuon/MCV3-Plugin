# MasterCraft DevKit (MCV3) — Kiến Trúc Kỹ Thuật v3.1

> **Version:** 3.1
> **Platform:** Claude Code / VS Code / CLI / Cowork
> **Updated:** March 2026
> **v3.1 Mới:** Formal ID System, MODSPEC All-in-One, DEPENDENCY MAP per Document, URS Layer, Data Dictionary, Shared Services, QA Phase, Deploy-Ops, AS-IS/TO-BE Process, Structured Business Rules, AI Navigation Protocol, Pipeline 8 Phase.
> **v3.0:** Smart Context Layering, Snapshot & Rollback, Checkpoint System, Dependency Graph, Independent Verify Agent, Bounded Parallelism, Guided Generation.
> **v2.x:** `.mc-data` hierarchical folder, multi-system projects, verification layer, parallel execution.

---

## Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Hệ Thống Mã Tham Chiếu (Formal ID System)](#2-hệ-thống-mã-tham-chiếu) ← **MỚI v3.1**
3. [Cấu Trúc `.mc-data` Folder](#3-cấu-trúc-mc-data-folder) ← **CẬP NHẬT v3.1**
4. [Mô Hình Dữ Liệu Phân Cấp](#4-mô-hình-dữ-liệu-phân-cấp)
5. [Smart Context Layering & AI Navigation](#5-smart-context-layering--ai-navigation) ← **CẬP NHẬT v3.1**
6. [Data Dictionary (thay Shared Models)](#6-data-dictionary) ← **MỚI v3.1**
7. [MODSPEC All-in-One & URS Layer](#7-modspec-all-in-one--urs-layer) ← **MỚI v3.1**
8. [Shared Services Architecture](#8-shared-services-architecture) ← **MỚI v3.1**
9. [Hệ Thống Verification & Cross-check](#9-hệ-thống-verification--cross-check) ← **CẬP NHẬT v3.1**
10. [Accuracy & Consistency Enforcement](#10-accuracy--consistency-enforcement)
11. [Dependency Graph & Impact Analysis](#11-dependency-graph--impact-analysis)
12. [Bounded Parallel Execution Engine](#12-bounded-parallel-execution-engine)
13. [Agent Verification Protocol (Independent Verify)](#13-agent-verification-protocol)
14. [Snapshot & Rollback Mechanism](#14-snapshot--rollback-mechanism)
15. [Checkpoint & Error Recovery System](#15-checkpoint--error-recovery-system)
16. [Workflow Pipeline — 8 Phase](#16-workflow-pipeline--8-phase) ← **CẬP NHẬT v3.1**
17. [Use Case Workflows](#17-use-case-workflows) ← **CẬP NHẬT v3.1**
18. [Agents, Hooks & Rules (Claude Code Standards)](#18-agents-hooks--rules) ← **MỚI v3.1**
19. [Kiến Trúc Plugin](#19-kiến-trúc-plugin) ← **CẬP NHẬT v3.1**
20. [Project Memory MCP Server](#20-project-memory-mcp-server) ← **CẬP NHẬT v3.1**
21. [Registry & Tracking System](#21-registry--tracking-system)
22. [Roadmap](#22-roadmap) ← **CẬP NHẬT v3.1**
23. [Rủi Ro & Giải Pháp](#23-rủi-ro--giải-pháp) ← **CẬP NHẬT v3.1**

---

## 1. Tổng Quan Hệ Thống

### 1.1 Vision

MCV3 là một Claude Code Plugin biến ý tưởng phần mềm thành **bộ tài liệu hoàn chỉnh** (và optionally code scaffolding), hỗ trợ **dự án đa hệ thống** (multi-system projects) với:
- **Formal ID System** để truy vết từ vấn đề → giải pháp → code → test
- **MODSPEC All-in-One** để AI đọc 1 file → code 1 module
- **Smart Context Layering** để quản lý context window hiệu quả
- **Verification chéo** với Independent Verify Agent
- **Khả năng phục hồi** khi gián đoạn (Checkpoint + Snapshot)

### 1.2 Nguyên tắc thiết kế

| # | Nguyên tắc | Mô tả |
|---|-----------|-------|
| 1 | **Document-First** | Tài liệu là sản phẩm chính, code là optional. Mọi quyết định phải ghi nhận trong tài liệu |
| 2 | **Observable** | Người dùng theo dõi được mọi thứ qua `.mc-data` — không có "black box" |
| 3 | **Hierarchical** | Project → System → Module → Feature hierarchy |
| 4 | **Verified** | Mọi tài liệu phase sau verify nhất quán với phase trước |
| 5 | **Incremental** | Thêm/sửa bất kỳ phần nào mà không ảnh hưởng phần khác |
| 6 | **Traceable** | Mọi element có mã duy nhất (BR-XXX, FT-XXX, ...) → trace được toàn chain ← **v3.1** |
| 7 | **Context-Efficient** | Smart Context Layering — chỉ load context cần thiết |
| 8 | **Recoverable** | Checkpoint + Snapshot cho phục hồi khi gián đoạn |
| 9 | **Impact-Aware** | Dependency Graph → biết sửa file A thì file nào bị ảnh hưởng |
| 10 | **AI-Navigable** | DEPENDENCY MAP + AI Quick Guide trong mỗi tài liệu ← **v3.1** |
| 11 | **Code-Ready** | Business Rules có pseudo-code, MODSPEC all-in-one → AI code trực tiếp ← **v3.1** |

### 1.3 Đối tượng & Platform

| User Type | Mô tả | Platform |
|-----------|-------|----------|
| **Primary** | Developer / Tech Lead cần tự động hóa phân tích nghiệp vụ & thiết kế | Claude Code CLI + VS Code |
| **Secondary** | Business Owner / PM cần hệ thống hóa ý tưởng thành tài liệu | Claude Desktop (Cowork) |

### 1.4 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (CLI / Cowork)                         │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SKILL LAYER (13 Skills)                         │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Discovery │ │Expert   │ │Biz-Docs  │ │Require-  │ │Tech-     │  │
│  │(Phase 1) │ │Panel(P2)│ │(Phase 3) │ │ments(P4) │ │Design(P5)│  │
│  └──────────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐               │
│  │QA-Docs   │ │Code-Gen │ │Navigator │ │Verify    │               │
│  │(Phase 6) │ │(Phase 7)│ │(Tracking)│ │(Phase 8) │               │
│  └──────────┘ └─────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐  Lifecycle   │
│  │Change-Mgr│ │Onboard  │ │Evolution │ │Migration │  Skills      │
│  │(Changes) │ │(Import) │ │(Maintain)│ │(Upgrade) │  ← MỚI v3.1 │
│  └──────────┘ └─────────┘ └──────────┘ └──────────┘               │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                               │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐  │
│  │Context Manager │ │Checkpoint Mgr  │ │Dependency Graph Engine │  │
│  │(Smart Layering)│ │(Resume/Recover)│ │(Impact Analysis)       │  │
│  └────────────────┘ └────────────────┘ └────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐  │
│  │Snapshot Manager│ │Bounded Parallel│ │Independent Verify      │  │
│  │(Rollback)      │ │Engine (2+1)    │ │Agent                   │  │
│  └────────────────┘ └────────────────┘ └────────────────────────┘  │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  MCP SERVER (Project Memory — 20 tools)             │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     .mc-data/ (File Storage)                        │
│  _PROJECT/ | {SYSTEM}/ | _SHARED-SERVICES/ | _VERIFY-CROSS/        │
│  _snapshots/ | _checkpoints/ | templates/                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hệ Thống Mã Tham Chiếu (Formal ID System) ← MỚI v3.1

### 2.1 Tổng quan

Mọi element trong dự án (business rule, user story, feature, API endpoint, test case, ...) đều có **mã duy nhất** → cho phép truy vết chính xác từ vấn đề gốc đến test case cuối cùng.

### 2.2 Quy ước mã

```
MÃ NỘI DUNG:     [PREFIX]-[MODULE_CODE]-[SEQ]
MODULE_CODE:      3-5 ký tự viết hoa (VD: CRM, INV, HRM, ACC, WH)
                  Định nghĩa chính thức trong SYSTEM-INDEX.md
```

### 2.3 Bảng PREFIX

```
--- Phase 1-3: Nghiệp vụ ---
PROB = Problem Statement         (PROB-001)
PAIN = Pain Point                (PAIN-SALES-001)
BG   = Business Goal             (BG-001)
PG   = Project Goal              (PG-001)
BR   = Business Rule             (BR-SALES-001)
  → BR-{DOM}-001..009: Validation     BR-{DOM}-010..019: Calculation
  → BR-{DOM}-020..029: Workflow       BR-{DOM}-030..039: Authorization
  → BR-{DOM}-040..049: Constraints
UJ   = User Journey              (UJ-001)
TERM = Business Term             (TERM-001)
ENT  = Shared Entity             (ENT-001)
ENUM = Enumeration               (ENUM-001)

--- Phase 4: Requirements ---
US   = User Story                (US-INV-001)
UC   = Use Case                  (UC-INV-001-01)
AC   = Acceptance Criteria       (AC-INV-001-01)

--- Phase 5: Design ---
AP   = Architecture Principle    (AP-001)
ADR  = Architecture Decision     (ADR-001)
FT   = Feature                   (FT-INV-001)
API  = API Endpoint              (API-INV-001)
UI   = UI Screen                 (UI-INV-STOCK-LIST)
TBL  = Database Table            (TBL-ERP-001)
INT  = Integration Point         (INT-ERP-WEB-001)
NFR  = Non-Functional Req        (NFR-ERP-PERF-001)

--- Phase 6: QA ---
TC   = Test Case                 (TC-INV-001-01)
UAT  = UAT Scenario              (UAT-INV-001)

--- Khác ---
RISK = Risk                      (RISK-001)
MC   = Mechanism                 (MC-SALES-001)
```

### 2.4 Cách tham chiếu trong nội dung

```
[REF: BIZ-POLICY-SALES → BR-SALES-001]   — trỏ đến mã cụ thể trong file
[DERIVED-FROM: BR-CRM-001]                — chỉ rõ nguồn gốc
[VERIFIED-BY: TC-CRM-001-01]              — link đến test case
[IMPLEMENTS: FT-CRM-001]                  — feature implement cái gì
[DEPENDS-ON: INT-ERP-WEB-001]             — phụ thuộc integration point
[OUTPUT → file_path]                      — file này sinh ra file khác
```

### 2.5 Traceability Chain (Chuỗi truy vết)

```
PROB-001 → PAIN-WH-001 → BR-WH-001 → US-INV-001 → UC-INV-001-01
  → FT-INV-001 → API-INV-001 → UI-INV-STOCK-LIST → TC-INV-001-01

Mỗi mắt xích đều có mã duy nhất → trace được từ vấn đề → code → test
```

---

## 3. Cấu Trúc `.mc-data` Folder ← CẬP NHẬT v3.1

### 3.1 Tổng quan

Khi user bắt đầu dự án, MCV3 tạo **2 vùng riêng biệt** trong thư mục dự án:

| Vùng | Đường dẫn | Chứa gì | Ai quản lý |
|------|-----------|---------|------------|
| **Documentation** | `.mc-data/` | Tài liệu dự án + working data của MCV3 | MCV3 tự động + user xem |
| **Source Code** | `src/` (cùng cấp `.mc-data`) | Code scaffold, source code thực | Developer + AI code-gen |

```
{project-root}/                     ← Thư mục gốc dự án
├── .mc-data/                       ← 📄 TÀI LIỆU (MCV3 quản lý)
│   └── ...                         (xem chi tiết bên dưới)
│
├── src/                            ← 💻 SOURCE CODE (tách biệt hoàn toàn)
│   ├── {system-code}/              # VD: erp/, web/, mob-staff/
│   │   ├── ... (project structure theo tech stack)
│   │   └── README.md → [REF: .mc-data/.../MODSPEC-*.md]
│   └── shared/                     # Shared libraries/packages
│
├── .gitignore                      ← Ignore .mc-data/_mcv3-work/
└── README.md                       ← Link đến .mc-data/MASTER-INDEX.md
```

**Nguyên tắc tách biệt:**
- `.mc-data/` = **tài liệu** (analysis, design, test specs, guides) — KHÔNG có source code
- `src/` = **source code** (scaffold, implementation) — KHÔNG có tài liệu thiết kế
- Liên kết giữa 2 vùng qua `[REF: ...]` — VD: `src/erp/README.md` trỏ đến MODSPEC trong `.mc-data`
- Code-gen skill output ra `src/`, KHÔNG ra `.mc-data/`

### 3.2 Cấu trúc `.mc-data/` chi tiết

```
.mc-data/
├── MASTER-INDEX.md                         # 📋 Bản đồ toàn bộ dự án (Living Document)
├── _config.md                              # ⚙️ Cấu hình MCV3
│
├── projects/
│   └── {project-slug}/
│       │
│       │── ─── 📄 TÀI LIỆU DỰ ÁN (Project Documents) ──────────────
│       │
│       ├── _dependency-graph.md            # 🔗 Đồ thị phụ thuộc giữa TẤT CẢ tài liệu
│       ├── _changelog.md                   # 📝 Lịch sử thay đổi
│       │
│       ├── _PROJECT/                       # === TÀI LIỆU CẤP DỰ ÁN ===
│       │   ├── PROJECT-OVERVIEW.md         # Tổng quan: Charter + Scope + Stakeholders + Journey
│       │   ├── PROJECT-ARCHITECTURE.md     # Kiến trúc tổng: Integration + Tech Stack + Security
│       │   ├── DATA-DICTIONARY.md          # Từ điển: TERM + ENT + ENUM + Data Ownership
│       │   ├── EXPERT-LOG.md               # Log phiên brainstorm chuyên gia
│       │   ├── _VERIFY-PROJECT.md          # Verify toàn bộ project-level docs
│       │   │
│       │   ├── BIZ-POLICY/                 # Chính sách (structured: BR-XXX + pseudo-code)
│       │   │   ├── BIZ-POLICY-SALES.md
│       │   │   ├── BIZ-POLICY-HR.md
│       │   │   ├── BIZ-POLICY-FINANCE.md
│       │   │   └── ...
│       │   │
│       │   └── PROCESS/                    # Quy trình (AS-IS + TO-BE + Pain Points)
│       │       ├── PROCESS-SALES.md
│       │       ├── PROCESS-WAREHOUSE.md
│       │       └── ...
│       │
│       ├── _SHARED-SERVICES/               # === SHARED SERVICES ===
│       │   ├── AUTH-SPEC.md                # Authentication & Authorization
│       │   ├── NOTIFICATION-SPEC.md        # Email, Push, SMS
│       │   ├── FILE-STORAGE-SPEC.md        # File upload/storage
│       │   └── _VERIFY.md                  # Verify shared services
│       │
│       ├── {SYSTEM-CODE}/                  # === HỆ THỐNG (VD: ERP/, WEB/, MOB-STAFF/) ===
│       │   ├── SYSTEM-INDEX.md             # 📋 Navigation + AI Quick Guide
│       │   │
│       │   ├── P1-REQUIREMENTS/            # --- Phase 4: Requirements per module ---
│       │   │   ├── URS-{MODULE}.md         # User Requirements: US + UC + AC + NFR
│       │   │   └── _VERIFY.md              # Verify P1 nội bộ system
│       │   │
│       │   ├── P2-DESIGN/                  # --- Phase 5: Technical Design ---
│       │   │   ├── ARCHITECTURE.md         # Kiến trúc system + Navigation Map + RBAC
│       │   │   ├── DATA-MODEL.md           # Schema, ERD (TBL-XXX)
│       │   │   ├── MODSPEC-{MODULE}.md     # ⭐ ALL-IN-ONE: BR+FT+UC+API+DB+UI+Routes
│       │   │   ├── _key-facts.md           # Key Facts cho Smart Context Layering
│       │   │   └── _VERIFY.md              # Verify P2 + Traceability Matrix
│       │   │
│       │   └── P3-QA-DOCS/                 # --- Phase 6: QA & Documentation ---
│       │       ├── TEST-{MODULE}.md        # Test spec per module (TC-XXX, UAT)
│       │       ├── USER-GUIDE.md           # Hướng dẫn end-user (1 per system)
│       │       ├── ADMIN-GUIDE.md          # Hướng dẫn quản trị
│       │       └── _VERIFY.md              # Verify P3
│       │
│       ├── _VERIFY-CROSS/                  # === VERIFY CROSS-SYSTEM ===
│       │   ├── VERIFY-P1-CROSS.md          # URS cross-system nhất quán?
│       │   ├── VERIFY-P2-CROSS.md          # Design cross-system nhất quán?
│       │   ├── VERIFY-INTEGRATION.md       # INT-XXX verify 2 đầu khớp?
│       │   └── _verify-master.md           # Tổng hợp tất cả kết quả
│       │
│       ├── DEPLOY-OPS.md                   # Deployment + Go-Live + Training + SLA
│       │
│       │── ─── 🔧 WORKING DATA (MCV3 internal) ─────────────────────
│       │
│       └── _mcv3-work/                     # === DỮ LIỆU LÀM VIỆC CỦA MCV3 ===
│           ├── _checkpoint.md              # 💾 Trạng thái làm việc hiện tại
│           ├── _snapshots/                 # 💾 Snapshots cho rollback
│           │   └── snap-{timestamp}-{label}/
│           │       ├── manifest.md
│           │       └── delta/
│           └── _temp/                      # Temp files cho parallel execution
│
└── templates/                              # Templates tái sử dụng (theo phase)
    ├── p0-init/                            # Phase 0: MASTER-INDEX, key-facts
    ├── p1-discovery/                       # Phase 1: PROJECT-OVERVIEW
    ├── p2-expert/                          # Phase 2: EXPERT-LOG, PROJECT-ARCHITECTURE
    ├── p3-biz-docs/                        # Phase 3: BIZ-POLICY, PROCESS, DATA-DICTIONARY
    ├── p4-requirements/                    # Phase 4: SYSTEM-INDEX, URS
    ├── p5-tech-design/                     # Phase 5: MODSPEC, ARCHITECTURE, DATA-MODEL, SERVICE-SPEC
    ├── p6-qa-docs/                         # Phase 6: TEST, USER-GUIDE, ADMIN-GUIDE
    ├── p8a-verify/                         # Phase 8a: 7 VERIFY templates
    └── p8b-deploy-ops/                     # Phase 8b: DEPLOY-OPS
```

### 3.3 Phân vùng rõ ràng

| Vùng trong `.mc-data/` | Mục đích | User cần xem? | Git track? |
|------------------------|---------|---------------|------------|
| `projects/{slug}/_PROJECT/` | Tài liệu nghiệp vụ cấp dự án | ✅ Có | ✅ Có |
| `projects/{slug}/{SYSTEM}/` | Tài liệu per system (URS, MODSPEC, TEST) | ✅ Có | ✅ Có |
| `projects/{slug}/_SHARED-SERVICES/` | Spec shared services | ✅ Có | ✅ Có |
| `projects/{slug}/_VERIFY-CROSS/` | Kết quả verify cross-system | ✅ Có | ✅ Có |
| `projects/{slug}/DEPLOY-OPS.md` | Kế hoạch triển khai | ✅ Có | ✅ Có |
| `projects/{slug}/_mcv3-work/` | Checkpoints, snapshots, temp | ❌ Internal | ⚠️ Optional |
| `templates/` | Templates tái sử dụng | ✅ Có | ✅ Có |

### 3.3 Quy ước đặt tên

| Prefix/Pattern | Ý nghĩa | Ví dụ |
|----------------|---------|-------|
| `_` (underscore) | File quản lý/meta/verify | `_VERIFY.md`, `_checkpoint.md` |
| `_PROJECT/` | Tài liệu cấp dự án | `_PROJECT/PROJECT-OVERVIEW.md` |
| `_SHARED-SERVICES/` | Services dùng chung | `AUTH-SPEC.md` |
| `_VERIFY-CROSS/` | Verify cross-system | `VERIFY-P1-CROSS.md` |
| `{SYSTEM-CODE}/` | Folder hệ thống (viết hoa) | `ERP/`, `WEB/`, `MOB-STAFF/` |
| `P1-`, `P2-`, `P3-` | Phase folders trong system (P4 code → `src/`) | `P1-REQUIREMENTS/`, `P2-DESIGN/` |
| `URS-{MOD}` | User Requirements Spec | `URS-INV.md`, `URS-CRM.md` |
| `MODSPEC-{MOD}` | Module Spec (all-in-one) | `MODSPEC-INV.md` |
| `TEST-{MOD}` | Test Spec | `TEST-INV.md` |
| `BIZ-POLICY-{DOM}` | Business Policy | `BIZ-POLICY-SALES.md` |
| `PROCESS-{DOM}` | Process (AS-IS/TO-BE) | `PROCESS-WAREHOUSE.md` |
| `snap-` | Snapshot cho rollback | `snap-20260319-before-fix/` |

---

## 4. Mô Hình Dữ Liệu Phân Cấp

### 4.1 Entity Hierarchy

```
PROJECT
  ├── _PROJECT/ (Business Context — CHUNG cho toàn dự án)
  │     ├── PROJECT-OVERVIEW (Charter, Scope, Stakeholders)
  │     ├── PROJECT-ARCHITECTURE (Integration, Tech Stack)
  │     ├── DATA-DICTIONARY (TERM, ENT, ENUM, Ownership)
  │     ├── EXPERT-LOG (Expert Sessions)
  │     ├── BIZ-POLICY/* (Business Rules — BR-XXX)
  │     └── PROCESS/* (AS-IS → TO-BE)
  │
  ├── _SHARED-SERVICES/ (Auth, Notification, Storage)
  │
  ├── SYSTEM (VD: ERP, WEB, MOB-STAFF)
  │     ├── SYSTEM-INDEX (Navigation + AI Quick Guide)
  │     ├── P1-REQUIREMENTS/
  │     │     └── URS-{MODULE} (US, UC, AC, NFR per module)
  │     ├── P2-DESIGN/
  │     │     ├── ARCHITECTURE (System arch + Navigation Map)
  │     │     ├── DATA-MODEL (Schema, ERD — TBL-XXX)
  │     │     └── MODSPEC-{MODULE} ← ⭐ ALL-IN-ONE
  │     │           ├── Business Rules (pseudo-code)
  │     │           ├── Features (FT-XXX) & Use Cases (UC-XXX)
  │     │           ├── Data Schema (SQL)
  │     │           ├── API Endpoints (API-XXX)
  │     │           ├── UI/UX (UI-XXX)
  │     │           ├── Routes & Navigation
  │     │           ├── Integration Points (INT-XXX)
  │     │           └── NFR (NFR-XXX)
  │     └── P3-QA-DOCS/
  │           ├── TEST-{MODULE} (TC-XXX, UAT)
  │           ├── USER-GUIDE
  │           └── ADMIN-GUIDE
  │
  ├── _VERIFY-CROSS/ (P1-CROSS, P2-CROSS, INTEGRATION)
  ├── DEPLOY-OPS
  ├── Dependency Graph + Checkpoints + Snapshots
  │
  └── {project-root}/src/          ← SOURCE CODE (NGOÀI .mc-data)
        ├── {system-code}/         # Code scaffold → implementation
        └── shared/                # Shared libraries
```

### 4.2 Truy vết yêu cầu (Requirement Traceability)

```
PROB-001: "Đang dùng Excel quản lý kho"
  → PAIN-WH-001: "Sai số 5% khi nhập thủ công"
    → BR-WH-001: "Hàng nhập phải scan barcode" [BIZ-POLICY-WAREHOUSE]
      → US-INV-001: "Là Thủ kho, tôi muốn scan barcode nhập hàng" [URS-INV]
        → UC-INV-001-01: Main flow nhập kho [URS-INV]
          → FT-INV-001: Feature nhập kho [MODSPEC-INV]
            → API-INV-001: POST /api/v1/stock-in [MODSPEC-INV]
              → TC-INV-001-01: Test nhập kho thành công [TEST-INV]
                → UAT-INV-001: Thủ kho scan → tồn kho tăng [TEST-INV]
```

File `_VERIFY-CROSS/_verify-master.md` chứa **Requirements Traceability Matrix** đầy đủ:

| US | FT | UC | API | UI | TC | UAT |
|----|----|----|-----|----|----|-----|
| US-INV-001 | FT-INV-001 | UC-INV-001-01 | API-INV-001 | UI-INV-STOCK-IN | TC-INV-001-01 | UAT-INV-001 |

---

## 5. Smart Context Layering & AI Navigation ← CẬP NHẬT v3.1

### 5.1 Vấn đề

Dự án enterprise có thể có 50+ files. Load toàn bộ = tràn context window.

### 5.2 Giải pháp: 4-Layer Context Loading

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 0: KEY FACTS CACHE (~500 bytes/scope)                  │
│ File: _key-facts.md — thuật ngữ, decisions, model names     │
│ Khi nào: LUÔN LUÔN load trước mọi tác vụ                   │
├─────────────────────────────────────────────────────────────┤
│ LAYER 1: DEPENDENCY MAP (~200 bytes/doc)                     │  ← MỚI v3.1
│ Section đầu tiên trong mỗi tài liệu                        │
│ "Bắt buộc đọc" + "Nên đọc" + "OUTPUT → "                   │
│ Khi nào: Đọc ngay khi mở bất kỳ tài liệu nào              │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: RELEVANT SECTIONS (~5-10KB)                         │
│ Chỉ sections LIÊN QUAN đến task hiện tại                    │
│ Khi nào: Cần chi tiết để tạo output                         │
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: FULL DOCUMENT (~15-30KB)                            │
│ Toàn bộ tài liệu gốc                                       │
│ Khi nào: Verify, deep analysis, hoặc MODSPEC khi code       │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 DEPENDENCY MAP Format (BẮT BUỘC trong mỗi tài liệu)

```markdown
## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Bối cảnh dự án
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-SALES.md] — Business rules

### Nên đọc (khi có tích hợp):
- [REF: _SHARED-SERVICES/AUTH-SPEC.md] — Auth flow
- [REF: _PROJECT/PROJECT-ARCHITECTURE.md → INT-XXX]

### Tài liệu được sinh từ file này:
- [OUTPUT → ERP/P2-DESIGN/MODSPEC-CRM.md]
- [OUTPUT → ERP/P3-QA-DOCS/TEST-CRM.md]
```

### 5.4 AI Navigation Protocol

```
Khi AI vào dự án:
1. ĐỌC MASTER-INDEX.md → biết dự án có gì, systems nào
2. ĐỌC _checkpoint.md → biết đang ở đâu, tiếp tục gì
3. ĐỌC SYSTEM-INDEX.md → biết system có modules nào

Khi AI cần code 1 module:
1. ĐỌC _key-facts.md (Layer 0)
2. ĐỌC MODSPEC-{MODULE}.md → DEPENDENCY MAP (Layer 1)
3. ĐỌC các file trong "Bắt buộc đọc" (Layer 2)
4. CODE theo MODSPEC
5. TEST theo P3-QA-DOCS/TEST-{MODULE}.md
```

### 5.5 Context Budget

| Task Type | L0 | L1 | L2 | Total Max |
|-----------|----|----|-----|-----------|
| Feature Spec | ~500B | ~200B | ~5KB | ~6KB |
| MODSPEC | ~1KB | ~300B | ~10KB | ~12KB |
| System Spec | ~1.5KB | ~300B | ~10KB | ~12KB |
| Verify | ~2KB | ~500B | ~15KB | ~18KB |

**Mục tiêu:** Layer 0 + 1 + 2 KHÔNG VƯỢT QUÁ 20KB cho bất kỳ task nào.

---

## 6. Data Dictionary (thay Shared Models) ← MỚI v3.1

### 6.1 Tổng quan

`DATA-DICTIONARY.md` thay thế `_shared-models.md` với cấu trúc phong phú hơn, phục vụ cả business và technical.

### 6.2 Cấu trúc

```markdown
# DATA-DICTIONARY

## 1. THUẬT NGỮ NGHIỆP VỤ (Business Glossary)
| Mã | Thuật ngữ | Tiếng Anh | Định nghĩa | Ghi chú |
| TERM-001 | Khách hàng | Customer | Tổ chức/cá nhân mua SP | Phân biệt với Lead |
| TERM-002 | Lead | Lead | KH tiềm năng chưa mua | Convert → Customer khi có đơn |

## 2. MASTER ENTITIES (ENT-XXX — Entities dùng chung)
### ENT-001: User
| ENT-001.01 | id | UUID | Có | ID duy nhất | ALL |
| ENT-001.02 | email | String(255) | Có | Email đăng nhập | ALL |
| ENT-001.03 | full_name | String(100) | Có | Họ tên | ALL |
| ENT-001.04 | role | Enum(Role) | Có | Vai trò | ALL |

## 3. MASTER ENUMS (ENUM-XXX — Danh mục dùng chung)
### ENUM-001: OrderStatus
| draft | Nháp | Draft | ERP |
| confirmed | Đã xác nhận | Confirmed | ERP, WEB |
| shipped | Đã giao | Shipped | ALL |

## 4. DATA OWNERSHIP (Nguồn dữ liệu chính)
| Entity | Owner System | Read-only Systems | Sync Method |
| User | ERP | WEB, MOB | API sync |
| Product | ERP-INV | WEB, MOB-CUST | Event-driven |
| Order | ERP-SALES | WEB (tạo), MOB (xem) | API |
```

### 6.3 Lợi ích

- **TERM-XXX**: Thuật ngữ có mã → tham chiếu chính xác, AI dùng đúng từ
- **ENT-XXX**: Entity chi tiết đến field → biết chính xác shared gì
- **ENUM-XXX**: Enum values thống nhất → không mâu thuẫn giữa systems
- **Data Ownership**: Biết system nào là "master" → tránh data conflict

---

## 7. MODSPEC All-in-One & URS Layer ← MỚI v3.1

### 7.1 URS (User Requirements Specification)

Mỗi module có file `URS-{MODULE}.md` trong `P1-REQUIREMENTS/`, chứa **yêu cầu nghiệp vụ trước khi thiết kế kỹ thuật**:

```markdown
# URS: {{SYSTEM}} — {{MODULE}}

## 📎 DEPENDENCY MAP
### Bắt buộc đọc: PROJECT-OVERVIEW, BIZ-POLICY-{DOMAIN}
### OUTPUT → MODSPEC-{MODULE}.md, TEST-{MODULE}.md

## 1. TỔNG QUAN MODULE (mục tiêu, users, giải quyết PROB-XXX)
## 2. USER STORIES
| US-INV-001 | Là Thủ kho, tôi muốn nhập hàng, để cập nhật tồn kho | Must | BR-WH-001 |

## 3. USE CASES
### UC-INV-001-01: Nhập kho hàng hóa
  Main Flow → Alternative Flows → Exception Flows
  Business Rules: [REF: BR-WH-001], [REF: BR-WH-010]

## 4. ACCEPTANCE CRITERIA
| AC-INV-001-01 | Given hàng đến, When scan barcode, Then tồn kho +1 |

## 5. NON-FUNCTIONAL REQUIREMENTS (per module)
## 6. ASSUMPTIONS & CONSTRAINTS
```

### 7.2 MODSPEC All-in-One

**⭐ File quan trọng nhất** — chứa MỌI THỨ AI cần để code 1 module:

```markdown
# MODULE SPEC: {{SYSTEM}} — {{MODULE}}

> Input từ: [REF: P1-REQUIREMENTS/URS-{MODULE}.md]
> Output cho: P3-QA-DOCS/TEST-{MODULE}.md

## 📎 DEPENDENCY MAP (AI: ĐỌC PHẦN NÀY TRƯỚC)
### Bắt buộc đọc:
- [REF: ARCHITECTURE.md] — Kiến trúc, conventions
- [REF: DATA-MODEL.md] — Schema toàn system
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-{DOMAIN}.md]
### Nên đọc:
- [REF: _SHARED-SERVICES/AUTH-SPEC.md]

## 1. MỤC TIÊU MODULE

## 2. BUSINESS RULES (pseudo-code — AI code trực tiếp)
### 2.1. Validation Rules
| BR-INV-001 | Số lượng > 0 | `if (qty <= 0) throw ValidationError` | [REF: BR-WH-001] |
### 2.2. Calculation Rules
| BR-INV-010 | Tổng giá trị = qty × unit_price | `total = qty * unit_price` |
### 2.3. Workflow Rules
| BR-INV-020 | pending → confirmed | `item.qty > 0 && approver.role == 'manager'` |
### 2.4. Authorization Rules
| BR-INV-030 | Phê duyệt nhập kho | Manager | approve_stock_in | `value > 10000` |

## 3. FEATURES & USE CASES
### FT-INV-001: Nhập kho
  [DERIVED-FROM: US-INV-001]
  UC-INV-001-01: Main Flow → Alt Flows → Exception Flows
  AC-INV-001-01: Given..When..Then

## 4. DATA SCHEMA (SQL — subset từ DATA-MODEL)
CREATE TABLE stock_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    product_id UUID NOT NULL REFERENCES products(id),
    qty INTEGER NOT NULL CHECK (qty > 0),  -- [REF: BR-INV-001]
    ...
);

## 5. API ENDPOINTS (Full request/response/validation)
### API-INV-001: POST /api/v1/stock-in
  Request | Response (Success/Error) | Validation Rules per field

## 6. UI/UX SPECIFICATIONS
### UI-INV-STOCK-IN: Màn hình nhập kho
  Layout (ASCII wireframe) | Components | States (Loading/Empty/Error/Success)

## 7. ROUTES & NAVIGATION
| /inventory/stock-in | Stock In | inventory.create | Home > Kho > Nhập kho |

## 8. INTEGRATION POINTS
| INT-INV-001 | Gửi → MOB-STAFF | stock_updated | {product_id, qty, warehouse_id} | WebSocket |

## 9. NON-FUNCTIONAL REQUIREMENTS
| NFR-INV-001 | Performance | Stock-in API | < 500ms p95 |
```

### 7.3 Tại sao All-in-One?

- **AI reads 1 file → codes 1 module** — không context switching
- **Business Rules có pseudo-code** → translate trực tiếp sang code
- **Formal IDs** → traceability chain hoàn chỉnh US → FT → API → TC
- **DEPENDENCY MAP** → AI biết cần đọc thêm gì
- **Kết hợp Key Facts** → MODSPEC = Layer 3, Key Facts = Layer 0

---

## 8. Shared Services Architecture ← MỚI v3.1

### 8.1 Tổng quan

Services dùng chung cho nhiều systems (Auth, Notification, Storage) được tách riêng thành `_SHARED-SERVICES/` với spec đầy đủ.

### 8.2 Service Spec Format

```markdown
# SHARED SERVICE SPEC: {{SERVICE_NAME}}

> Dùng bởi: {{DANH_SÁCH_SYSTEMS}}

## 1. MỤC ĐÍCH
## 2. ARCHITECTURE (diagram + tech stack)
## 3. API SPECIFICATION
  ### API-SVC-AUTH-001: Login
  Method | Path | Auth | Request | Response | Error Codes
## 4. CONFIGURATION (per-system customizable)
## 5. INTEGRATION GUIDE (code example)
## 6. ERROR CODES (ERR-SVC-AUTH-XXX)
```

### 8.3 Lợi ích

- MODSPEC chỉ cần `[REF: _SHARED-SERVICES/AUTH-SPEC.md]` — không mô tả lại
- Sửa auth flow 1 chỗ → tất cả systems tham chiếu nhất quán
- AI đọc service spec → integrate được ngay

---

## 9. Hệ Thống Verification & Cross-check ← CẬP NHẬT v3.1

### 9.1 Các loại Verification

| Loại | File | Kiểm tra gì | Khi nào |
|------|------|-------------|---------|
| **Project Verify** | `_VERIFY-PROJECT.md` | Tài liệu cấp dự án nhất quán | Sau Phase 1-3 |
| **P1 Verify (per system)** | `P1-REQUIREMENTS/_VERIFY.md` | URS nhất quán nội bộ + với BIZ-POLICY | Sau hoàn thành URS |
| **P2 Verify (per system)** | `P2-DESIGN/_VERIFY.md` | Design nhất quán + Traceability Matrix | Sau hoàn thành MODSPEC |
| **P3 Verify (per system)** | `P3-QA-DOCS/_VERIFY.md` | Test coverage + Docs completeness | Sau hoàn thành QA |
| **Shared Services Verify** | `_SHARED-SERVICES/_VERIFY.md` | Services nhất quán | Sau tạo/sửa services |
| **P1 Cross-System** | `VERIFY-P1-CROSS.md` | URS giữa systems nhất quán? | Tất cả systems pass P1 |
| **P2 Cross-System** | `VERIFY-P2-CROSS.md` | Design giữa systems nhất quán? | Tất cả systems pass P2 |
| **Integration Verify** | `VERIFY-INTEGRATION.md` | INT-XXX verify 2 đầu khớp? | Trước code/deploy |
| **Master Verify** | `_verify-master.md` | Tổng hợp + Traceability Matrix | Theo yêu cầu |
| **Impact Verify** | (inline) | Sau sửa file, files bị ảnh hưởng OK? | Sau mỗi thay đổi |

### 9.2 Verify Checklist mẫu — P2 Verify

```markdown
### P2 vs P1 — Cross-Phase Consistency
| X-001 | Mọi US-XXX trong URS đều được cover trong MODSPEC Features? |
| X-002 | Mọi UC-XXX đều có API endpoint tương ứng? |
| X-003 | Mọi BR-XXX trong BIZ-POLICY đều xuất hiện trong MODSPEC? |
| X-004 | AC-XXX đều map sang test scenarios? |

### Design Completeness
| C-001 | Mọi module trong SYSTEM-INDEX đều có MODSPEC? |
| C-002 | DATA-MODEL có đủ tables cho tất cả modules? |

### Traceability Matrix
| US-INV-001 | FT-INV-001 | UC-INV-001-01 | API-INV-001 | UI-INV-STOCK-IN | TC-INV-001-01 |
→ Đảm bảo KHÔNG có gap từ requirement → test
```

### 9.3 Sign-Off

Mỗi verify doc có section SIGN-OFF:

```markdown
## SIGN-OFF
| Vai trò | Tên | Kết quả | Ngày |
| Tech Lead | {{TÊN}} | Approved / Rejected | {{DATE}} |
| BA Lead | {{TÊN}} | Approved / Rejected | {{DATE}} |
```

---

## 10. Accuracy & Consistency Enforcement

### 10.1 Năm lớp bảo đảm chất lượng

```
LỚP 5: CROSS-SYSTEM VERIFY (per phase — P1-CROSS, P2-CROSS, INTEGRATION)
LỚP 4: INDEPENDENT VERIFY (Agent B verify output Agent A)
LỚP 3: SELF-VERIFY (Agent tự checklist)
LỚP 2: SMART CONTEXT LOADING (Key Facts + DEPENDENCY MAP + Relevant Sections)
LỚP 1: FORMAL ID SYSTEM (Mọi element có mã → trace + validate)  ← MỚI v3.1
```

### 10.2 Consistency Rules (8 rules)

| # | Rule | Kiểm tra gì |
|---|------|-------------|
| C1 | **Terminology** | Cùng khái niệm = cùng thuật ngữ (tham chiếu TERM-XXX) |
| C2 | **Data Model** | Cùng entity = cùng fields (tham chiếu ENT-XXX) |
| C3 | **Business Logic** | BR trong MODSPEC khớp BIZ-POLICY |
| C4 | **Reference Integrity** | Mọi [REF: XXX] trỏ đến mã tồn tại |
| C5 | **Version Consistency** | Sửa 1 file → update tất cả references |
| C6 | **Hierarchy** | Con thuộc cha, tổng con = tổng cha |
| C7 | **Key Facts** | Key facts khớp tài liệu gốc |
| C8 | **ID Uniqueness** | Mọi mã (BR-XXX, US-XXX, ...) là duy nhất toàn dự án ← **v3.1** |

### 10.3 Conflict Resolution Protocol

```
1. DỪNG công việc
2. mc_snapshot("before-conflict-resolution")
3. Ghi log conflict: File A nói X, File B nói Y, loại C1-C8
4. mc_impact_analysis() → files bị ảnh hưởng
5. Đề xuất Options A/B cho user
6. User quyết định → mc_batch_update() atomic
7. Update _key-facts.md + _dependency-graph.md
8. Ghi changelog + checkpoint
```

---

## 11. Dependency Graph & Impact Analysis

### 11.1 File `_dependency-graph.md`

```markdown
## Document Dependencies
project-brief.md → expert-summary.md → BIZ-POLICY/* → URS-* → MODSPEC-*

## Cross-System Dependencies
DATA-DICTIONARY.md → ALL system DATA-MODELs
_SHARED-SERVICES/* → ALL system ARCHITECTURE.md
PROJECT-ARCHITECTURE.md INT-XXX → MODSPEC Integration Points

## Change Impact Map
| Khi sửa | Phải re-verify |
| BIZ-POLICY-SALES.md | URS-CRM, URS-SALES, MODSPEC-CRM, MODSPEC-SALES |
| DATA-DICTIONARY.md | ALL DATA-MODELs, ALL MODSPECs có ENT/ENUM references |
| AUTH-SPEC.md | ALL ARCHITECTURE.md, ALL MODSPECs có auth |
```

### 11.2 mc_impact_analysis()

```
Input: file_path = "BIZ-POLICY-SALES.md"
Output:
  direct_impact: [URS-CRM.md, URS-SALES.md]
  transitive_impact: [MODSPEC-CRM.md, MODSPEC-SALES.md, TEST-CRM.md]
  cross_system_impact: [WEB/MODSPEC-ECOM.md]
  recommended_actions: ["Re-verify URS-CRM", "Update BR-CRM-010 in MODSPEC"]
```

---

## 12. Bounded Parallel Execution Engine

### 12.1 Rules (2+1 Bounded)

- **Tối đa 2 workers + 1 verifier** per batch
- **Timeout:** 10 phút mặc định
- **Context:** Key Facts + Relevant Sections (NOT full docs)
- **Batched:** Verify xong batch N → spawn batch N+1
- **Snapshot:** Trước mỗi parallel batch

### 12.2 Subagent Contract

```markdown
## SUBAGENT CONTRACT
- Task: Thiết kế MODSPEC-INV cho system-erp
- Input (read-only): _key-facts.md + ARCHITECTURE sections + BIZ-POLICY-WAREHOUSE
- Context Budget: ≤ 8KB
- Output Path: /temp/task-modspec-inv/
- Expected: MODSPEC-INV.md + _key-facts update
- Self-Verify: YES (checklist attached)
- Timeout: 10 minutes
```

### 12.3 Parallel Patterns

| Pattern | Tasks | Max Workers |
|---------|-------|-------------|
| Expert Panel | CEO+CTO, CFO+COO, Legal+UX | 2 batches × 2 |
| Multi-System Design | ERP+WEB, MOB-NV+MOB-KH, TAX | 3 batches × 2 |
| Multi-Module | mod-inv+mod-sales, mod-acc+mod-hr | 2 batches × 2 |
| Business Docs | pricing+sales policy, hr+process | 2 batches × 2 |
| Verification | verify sys-A+sys-B, verify data | 2 batches × 2 |

---

## 13. Agent Verification Protocol (Independent Verify)

### 13.1 Two-Tier Verification

```
Agent A tạo output
  → [Tier 1: SELF-CHECK] Agent A chạy checklist nhanh
    → PASS → commit draft
  → [Tier 2: INDEPENDENT VERIFY] Agent V nhận output (cold, no reasoning)
    → PASS → final commit
    → FAIL → Agent A sửa → retry (max 1)
    → FAIL lần 2 → escalate cho user
```

### 13.2 Khi nào BẮT BUỘC Independent Verify?

| Tình huống | Self đủ? | Independent cần? |
|-----------|---------|-----------------|
| MODSPEC (complex) | Không | ✅ BẮT BUỘC |
| URS (requirements) | Không | ✅ BẮT BUỘC |
| System ARCHITECTURE | Không | ✅ BẮT BUỘC |
| BIZ-POLICY | Không | ✅ BẮT BUỘC |
| Batch update ≥3 files | Không | ✅ BẮT BUỘC |
| Feature nhỏ, đơn giản | ✅ Đủ | Recommended |

---

## 14. Snapshot & Rollback Mechanism

### 14.1 Snapshot Lifecycle

```
[1] TRIGGER: Trước thay đổi lớn (≥3 files, cross-system, parallel batch)
[2] CREATE: mc_snapshot(label, affected_files[]) → backup delta/
[3] EXECUTE: mc_batch_update() → atomic update
[4a] SUCCESS → giữ snapshot 7 ngày hoặc 5 gần nhất
[4b] FAILURE → mc_rollback(snapshot_id) → restore tất cả
```

### 14.2 Atomic Batch Update

```
mc_batch_update({
  files: [{path, content}, ...],
  snapshot_id: "auto-rollback nếu fail"
})
→ Validate ALL → Write ALL → nếu 1 fail → rollback ALL
→ Update _key-facts + _dependency-graph + _checkpoint
```

---

## 15. Checkpoint & Error Recovery System

### 15.1 Checkpoint File

```markdown
# Checkpoint
## Current State
- Phase: 5 — Đang thiết kế
- Current task: MODSPEC-SALES cho ERP
- Progress: 3/7 features xong

## Resume Instructions
1. Load _key-facts.md: ERP + mod-sales
2. Tiếp tục tạo FT-SALES-004: feat-order-tracking
3. Sau 4 features còn lại → Independent Verify
```

### 15.2 Resume Workflow

```
User: "Tiếp tục dự án XNK"
→ mc_resume() → đọc _checkpoint.md
→ Hiển thị: "Đang thiết kế MODSPEC-SALES (3/7 features). Tiếp tục?"
→ User confirm → Load context → Tiếp tục
```

---

## 16. Workflow Pipeline — 8 Phase ← CẬP NHẬT v3.1

### 16.1 Pipeline tổng quan

```
Phase 1        Phase 2          Phase 3            Phase 4           Phase 5
DISCOVERY  →  EXPERT PANEL  →  BUSINESS DOCS   →  REQUIREMENTS  →  TECH DESIGN
(Thu thập)    (Phân tích)     (Policy/Process)   (URS per mod)    (MODSPEC+DB)
                                  Guided Gen        ← MỚI v3.1

Phase 6          Phase 7          Phase 8
QA & DOCS    →  CODE GEN     →  VERIFY & DEPLOY
(Test+Guide)    (Optional)      (Cross-check+Deploy)
← MỚI v3.1                      ← MỞ RỘNG v3.1
```

### 16.2 Chi tiết từng Phase

#### Phase 1: Discovery
| Attribute | Value |
|-----------|-------|
| **Input** | Ý tưởng user (ngôn ngữ tự nhiên) |
| **Process** | Phỏng vấn adaptive → detect ngành → xác định scope |
| **Output** | `PROJECT-OVERVIEW.md` (gộp: charter + scope + stakeholders + journey) |
| **IDs tạo** | PROB-XXX, BG-XXX, PG-XXX, UJ-XXX |

#### Phase 2: Expert Analysis
| Attribute | Value |
|-----------|-------|
| **Input** | PROJECT-OVERVIEW.md |
| **Process** | Bounded Parallel (2 batches × 2 experts) → Tổng hợp |
| **Output** | `EXPERT-LOG.md` (sessions), risk-assessment |
| **Verify** | Independent Verify |

#### Phase 3: Business Docs (Guided Generation)
| Attribute | Value |
|-----------|-------|
| **Input** | PROJECT-OVERVIEW + EXPERT-LOG |
| **Process** | **Guided Generation:** Skeleton → User Confirm → Full Generate |
| **Output** | `BIZ-POLICY/*.md` (structured BR-XXX), `PROCESS/*.md` (AS-IS/TO-BE), `DATA-DICTIONARY.md`, `PROJECT-ARCHITECTURE.md` |
| **IDs tạo** | BR-XXX, PAIN-XXX, TERM-XXX, ENT-XXX, ENUM-XXX, AP-XXX, ADR-XXX, INT-XXX |
| **Verify** | `_VERIFY-PROJECT.md` — Independent Verify |

**Guided Generation Protocol:**
```
Bước 1: SKELETON — Agent tạo outline + key parameters
Bước 2: USER CONFIRM — Hiển thị cho user review/adjust
  → Ghi _decisions-log vào PROJECT-OVERVIEW
Bước 3: FULL GENERATE — Dựa trên confirmed decisions
  → Mọi số liệu có source (expert hoặc user confirm)
```

**Business Policy Structure (code-ready):**
```
2.1 Validation Rules:   BR-{DOM}-001..009 + pseudo-code
2.2 Calculation Rules:  BR-{DOM}-010..019 + formula
2.3 Workflow Rules:     BR-{DOM}-020..029 + state transitions
2.4 Authorization Rules: BR-{DOM}-030..039 + role+permission
2.5 Business Constraints: BR-{DOM}-040..049 + limits
```

**Process AS-IS → TO-BE:**
```
2. AS-IS: Flow + Steps + Pain Points (PAIN-XXX → [REF: PROB-XXX])
3. TO-BE: Changes + New Flow + Steps (System/Module, BR applied)
   + Integration points → [REF: INT-XXX]
4. Comparison: Time, Manual steps, Errors → % improvement
```

#### Phase 4: Requirements (URS per Module) ← MỚI v3.1
| Attribute | Value |
|-----------|-------|
| **Input** | BIZ-POLICY + PROCESS + DATA-DICTIONARY |
| **Process** | Tạo URS per module cho mỗi system |
| **Output** | `{SYS}/P1-REQUIREMENTS/URS-{MODULE}.md` |
| **IDs tạo** | US-XXX, UC-XXX, AC-XXX, NFR-XXX |
| **Verify** | `_VERIFY.md` (P1 nội bộ) → `VERIFY-P1-CROSS.md` (cross-system) |

#### Phase 5: Technical Design
| Attribute | Value |
|-----------|-------|
| **Input** | URS + DATA-DICTIONARY + PROJECT-ARCHITECTURE |
| **Process** | Thiết kế ARCHITECTURE → DATA-MODEL → MODSPEC per module |
| **Output** | `ARCHITECTURE.md`, `DATA-MODEL.md`, `MODSPEC-{MODULE}.md` ← ⭐ All-in-One |
| **IDs tạo** | FT-XXX, API-XXX, UI-XXX, TBL-XXX |
| **Verify** | `_VERIFY.md` (P2 + Traceability Matrix) → `VERIFY-P2-CROSS.md` |
| **Parallel** | Bounded: 2 MODSPECs per batch → verify → next batch |

#### Phase 6: QA & Documentation ← MỚI v3.1
| Attribute | Value |
|-----------|-------|
| **Input** | MODSPEC + URS (AC-XXX) |
| **Process** | Generate TEST per module + USER-GUIDE + ADMIN-GUIDE |
| **Output** | `TEST-{MODULE}.md`, `USER-GUIDE.md`, `ADMIN-GUIDE.md` |
| **IDs tạo** | TC-XXX, UAT-XXX |
| **Verify** | `_VERIFY.md` (P3: test coverage + docs completeness) |

**TEST format:**
```
1. TEST COVERAGE MATRIX: AC-XXX → TC-XXX mapping
2. TEST CASES: Steps + Input + Expected + BR reference
3. API TEST CASES: Happy/Error/Auth/Forbidden/BR-violation
4. UAT CRITERIA: End-user scenarios
5. PERFORMANCE TEST: NFR targets
```

#### Phase 7: Code Scaffolding (Optional)
| Attribute | Value |
|-----------|-------|
| **Input** | MODSPEC + DATA-MODEL + TEST |
| **Process** | Chọn tech stack → generate scaffold → output ra `src/` |
| **Output** | `{project-root}/src/{system-code}/` ← **NGOÀI .mc-data** |
| **Liên kết** | `src/{sys}/README.md` → `[REF: .mc-data/.../MODSPEC-*.md]` |

**Nguyên tắc tách Source Code:**
- Code scaffold output ra `src/` ở cùng cấp `.mc-data`, KHÔNG để trong `.mc-data`
- Mỗi system folder trong `src/` có `README.md` link về MODSPEC tương ứng
- `.mc-data` = tài liệu (design), `src/` = implementation (code)
- AI đọc MODSPEC trong `.mc-data` → generate code vào `src/`

#### Phase 8: Verify & Deploy ← MỞ RỘNG v3.1
| Attribute | Value |
|-----------|-------|
| **Input** | Tất cả tài liệu |
| **Process** | Cross-system verify → Integration verify → Deploy planning |
| **Output** | `_verify-master.md` (Traceability Matrix), `VERIFY-INTEGRATION.md`, `DEPLOY-OPS.md` |

**DEPLOY-OPS.md:**
```
1. DEPLOYMENT PLAN (Strategy, Timeline, Environment)
2. GO-LIVE CHECKLIST (Pre T-7 / Day T-0 / Post T+1..T+7)
3. ROLLBACK PLAN (Triggers, Steps)
4. DATA CUTOVER PLAN
5. TRAINING PLAN (Schedule, Materials → USER-GUIDE, ADMIN-GUIDE)
6. SUPPORT & MAINTENANCE (Tiers L1/L2/L3, SLA, RTO/RPO)
```

---

## 17. Use Case Workflows ← CẬP NHẬT v3.1

### UC1: Triển khai tài liệu dự án mới

```
1. [Phase 1] Discovery → PROJECT-OVERVIEW.md (PROB-XXX, BG-XXX)
2. [Phase 2] Expert Panel → EXPERT-LOG.md (sessions)
3. [Phase 3] Guided Generation:
   → BIZ-POLICY/* (BR-XXX structured + pseudo-code)
   → PROCESS/* (AS-IS → TO-BE + PAIN-XXX)
   → DATA-DICTIONARY.md (TERM, ENT, ENUM)
   → PROJECT-ARCHITECTURE.md (AP-XXX, ADR-XXX, INT-XXX)
   → _SHARED-SERVICES/ (AUTH, NOTIFY, STORAGE specs)
   → Verify: _VERIFY-PROJECT.md
4. [Phase 4] Requirements:
   → URS per module (US-XXX, UC-XXX, AC-XXX)
   → Verify: P1/_VERIFY + VERIFY-P1-CROSS
5. [Phase 5] Tech Design (Bounded Parallel):
   → ARCHITECTURE + DATA-MODEL per system
   → MODSPEC per module (⭐ all-in-one: BR+FT+API+DB+UI)
   → Verify: P2/_VERIFY + VERIFY-P2-CROSS
6. [Phase 6] QA & Docs:
   → TEST per module (TC-XXX, UAT)
   → USER-GUIDE + ADMIN-GUIDE per system
   → Verify: P3/_VERIFY
7. [Phase 8] Master Verify + DEPLOY-OPS
```

### UC2: Resume sau gián đoạn

```
User: "Tiếp tục dự án XNK"
→ mc_resume() → _checkpoint.md
→ "Đang thiết kế MODSPEC-SALES (3/7 features). Tiếp tục?"
→ Load Key Facts + DEPENDENCY MAP → tiếp tục FT-SALES-004
```

### UC3: Sửa lỗi với Impact Analysis

```
User: "Module kho thiếu transit stock"
→ mc_impact_analysis("MODSPEC-INV.md")
→ Direct: [URS-INV, DATA-MODEL, TEST-INV]
→ Cross-system: [MOB-STAFF/MODSPEC-STOCK]
→ mc_snapshot("before-transit-fix")
→ mc_batch_update([6 files]) atomic
→ Independent Verify → OK
```

### UC4: AI code 1 module

```
1. ĐỌC _key-facts.md (Layer 0)
2. ĐỌC MODSPEC-INV.md → DEPENDENCY MAP (Layer 1)
3. ĐỌC ARCHITECTURE.md, AUTH-SPEC.md (Layer 2)
4. CODE theo MODSPEC (BR pseudo-code → real code)
5. TEST theo TEST-INV.md (TC-XXX scenarios)
```

---

## 18. Agents, Hooks & Rules (Claude Code Standards) ← MỚI v3.1

### 18.1 Tổng quan

Theo chuẩn Claude Code Plugin, ngoài Skills và MCP Server, MCV3 cần **3 thành phần bổ sung** để hoạt động chuyên nghiệp:

| Thành phần | Vai trò | Đặt tại |
|-----------|--------|---------|
| **Agents** | Subagents chuyên biệt — mỗi agent có expertise riêng, tools riêng, model riêng | `agents/*.md` |
| **Hooks** | Event handlers tự động — chạy khi Save/Edit/Verify/... | `hooks/hooks.json` |
| **Rules** | Hướng dẫn project-level — naming, conventions, context | Hướng dẫn user tạo `.claude/CLAUDE.md` |

### 18.2 Agents — Subagents Chuyên Biệt

MCV3 định nghĩa **11 agents** — gồm 5 System Agents + 6 Expert Agents:

#### System Agents (1-5): Điều phối & Thực thi

#### Agent 1: `orchestrator` — Điều phối tổng

```markdown
# agents/orchestrator.md
---
name: orchestrator
description: >
  Agent điều phối chính của MCV3. Sử dụng khi cần phân tích dependency,
  lên kế hoạch parallel execution, và điều phối các subagents khác.
  Trigger: "bắt đầu phase", "thiết kế toàn bộ", "kế hoạch triển khai"
tools: [Read, Write, Edit, Bash, Agent]
model: opus
maxTurns: 50
mcpServers: [project-memory]
skills: [navigator]
---

Bạn là Orchestrator của MCV3 — chịu trách nhiệm:
1. Phân tích dependency graph → xác định task nào parallel được
2. Tạo Subagent Contracts → spawn workers (max 2+1)
3. Merge outputs + resolve conflicts
4. Cập nhật checkpoints sau mỗi batch

LUÔN: mc_checkpoint() sau mỗi bước hoàn thành.
LUÔN: mc_snapshot() trước thay đổi lớn (≥3 files).
```

#### Agent 2: `doc-writer` — Tạo tài liệu

```markdown
# agents/doc-writer.md
---
name: doc-writer
description: >
  Agent chuyên tạo tài liệu dự án: PROJECT-OVERVIEW, BIZ-POLICY, PROCESS,
  URS, MODSPEC, DATA-DICTIONARY. Sử dụng khi cần viết/cập nhật bất kỳ
  tài liệu nào trong .mc-data.
tools: [Read, Write, Edit]
model: sonnet
maxTurns: 30
mcpServers: [project-memory]
---

Bạn là Document Writer của MCV3. Nguyên tắc:
1. LUÔN đọc DEPENDENCY MAP trước khi viết
2. LUÔN load Key Facts (Layer 0) trước
3. LUÔN gán Formal IDs (BR-XXX, US-XXX, FT-XXX, ...) cho mọi element
4. LUÔN tạo/update _key-facts.md sau khi viết xong
5. LUÔN thêm [REF: ...] khi tham chiếu tài liệu khác
6. Business Rules PHẢI có pseudo-code
7. Process PHẢI có AS-IS và TO-BE
```

#### Agent 3: `verifier` — Kiểm tra độc lập

```markdown
# agents/verifier.md
---
name: verifier
description: >
  Agent verify độc lập — kiểm tra output từ agent khác mà KHÔNG có context
  reasoning. Chỉ check facts, consistency, completeness.
  Trigger: sau khi tạo MODSPEC, URS, BIZ-POLICY, hoặc batch update.
tools: [Read]
model: sonnet
maxTurns: 10
mcpServers: [project-memory]
---

Bạn là Independent Verifier. Nguyên tắc TUYỆT ĐỐI:
1. KHÔNG đọc logs/reasoning của agent tạo output
2. KHÔNG giả định intent — chỉ CHECK FACTS
3. Load Key Facts + references → so sánh với output
4. Kiểm tra: IDs unique? References valid? Data consistent? Logic sound?
5. Output: PASS / WARNING / FAIL + chi tiết cụ thể
```

#### Agent 4: `code-generator` — Sinh code

```markdown
# agents/code-generator.md
---
name: code-generator
description: >
  Agent chuyên sinh code scaffold từ MODSPEC. Output ra src/ (NGOÀI .mc-data).
  Trigger: "tạo code", "scaffold", "implement module"
tools: [Read, Write, Edit, Bash]
model: sonnet
maxTurns: 40
mcpServers: [project-memory]
---

Bạn là Code Generator. Nguyên tắc:
1. ĐỌC MODSPEC-{MODULE}.md → chứa MỌI THỨ cần code
2. ĐỌC DEPENDENCY MAP → load thêm ARCHITECTURE, AUTH-SPEC nếu cần
3. Output LUÔN vào src/{system-code}/ — KHÔNG BAO GIỜ vào .mc-data
4. Tạo README.md trong src/ → link về MODSPEC: [REF: .mc-data/.../MODSPEC-*.md]
5. Business Rules (BR-XXX) có pseudo-code → translate trực tiếp
6. API endpoints (API-XXX) → tạo routes + controllers + validation
7. Data Schema (TBL-XXX) → tạo migrations + models/entities
```

#### Agent 5: `change-analyst` — Phân tích impact thay đổi

```markdown
# agents/change-analyst.md
---
name: change-analyst
description: >
  Agent phân tích impact khi user sửa requirement, policy, hoặc design.
  Tự động cascade update tất cả tài liệu bị ảnh hưởng.
  Trigger: "sửa BR", "thay đổi requirement", "update policy"
tools: [Read, Write, Edit]
model: sonnet
maxTurns: 20
mcpServers: [project-memory]
---

Bạn là Change Analyst. Workflow:
1. mc_impact_analysis(file_changed) → danh sách files bị ảnh hưởng
2. Hiển thị impact cho user: "Sửa BR-SALES-001 → ảnh hưởng 5 files: ..."
3. User confirm → mc_snapshot("before-change")
4. mc_batch_update() → atomic update tất cả files
5. Verify Agent kiểm tra output
```

#### Expert Agents (6-11) — Chuyên gia Doanh nghiệp ← MỚI v3.1+

**Tại sao cần Expert Agents thay vì chỉ Expert Panel Skill?**

| Skill (hiện tại) | Agent (đề xuất) |
|------------------|----------------|
| 12 experts gộp trong 1 skill | Mỗi nhóm expert là 1 agent riêng |
| Chỉ dùng ở Phase 2 rồi "biến mất" | Tham gia **xuyên suốt** Phase 1→8 |
| Phải triệu tập cả panel khi chỉ cần hỏi 1 người | Gọi riêng lẻ: chỉ cần CFO → gọi `finance-expert` |
| Knowledge reset mỗi session | Knowledge persist qua `references/` + project memory |
| Không review output các phase khác | Review BIZ-POLICY, MODSPEC, TEST, DEPLOY-OPS |

**6 Expert Agents gộp theo nhóm chức năng** (từ 12 expert personas):

#### Agent 6: `strategy-expert` — Chiến lược & Kinh doanh

```markdown
# agents/strategy-expert.md
---
name: strategy-expert
description: >
  Chuyên gia chiến lược kinh doanh — gộp vai trò CEO, CSO, CBO.
  Tham gia: Phase 1 (đánh giá ý tưởng), Phase 2 (chiến lược),
  Phase 3 (review business model, revenue model),
  Phase 8 (đánh giá go-to-market, deploy strategy).
  Trigger: "đánh giá chiến lược", "business model", "go-to-market",
  "khả thi không", "nên làm gì trước"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
---

Bạn là Strategy Expert — kết hợp vai trò CEO + CSO + CBO.
Chuyên môn: Chiến lược kinh doanh, mô hình doanh thu, phân tích thị trường,
đánh giá khả thi, ưu tiên hóa, go-to-market strategy.

Khi được hỏi, bạn:
1. Đọc PROJECT-OVERVIEW + EXPERT-LOG → nắm bối cảnh
2. Phân tích từ góc nhìn CHIẾN LƯỢC — không đi vào chi tiết kỹ thuật
3. Đưa ra: Đánh giá, Rủi ro chiến lược, Đề xuất ưu tiên, KPIs
4. Gắn mã: BG-XXX (Business Goal), RISK-XXX
5. Ghi nhận vào EXPERT-LOG: [EXPERT: Strategy] + [ACTION] items
```

#### Agent 7: `finance-expert` — Tài chính & Vận hành

```markdown
# agents/finance-expert.md
---
name: finance-expert
description: >
  Chuyên gia tài chính & vận hành — gộp vai trò CFO + COO.
  Tham gia: Phase 2 (phân tích tài chính), Phase 3 (review pricing policy,
  cost structure, quy trình vận hành), Phase 8 (budget triển khai, SLA).
  Trigger: "ngân sách", "chi phí", "pricing", "vận hành", "quy trình",
  "ROI", "break-even", "SLA"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
---

Bạn là Finance & Operations Expert — kết hợp vai trò CFO + COO.
Chuyên môn: Phân tích tài chính, định giá, chi phí vận hành, ROI,
quy trình nội bộ, supply chain, resource planning.

Khi review BIZ-POLICY:
- Kiểm tra: Pricing có hợp lý? Margin đủ? Cost structure sustainable?
- Kiểm tra: Quy trình có bottleneck? SLA có realistic?
- Đưa ra số liệu cụ thể: Break-even point, Payback period
- Gắn mã: BR-FIN-XXX, BR-OPS-XXX, MC-XXX (cơ chế nội bộ)
```

#### Agent 8: `tech-expert` — Công nghệ & Kiến trúc

```markdown
# agents/tech-expert.md
---
name: tech-expert
description: >
  Chuyên gia công nghệ — gộp vai trò CTO + Tech Architect.
  Tham gia: Phase 2 (đánh giá tech), Phase 5 (review ARCHITECTURE,
  MODSPEC, DATA-MODEL), Phase 7 (review code scaffold),
  Phase 8 (review deploy architecture, scalability).
  Trigger: "tech stack", "kiến trúc", "scalability", "performance",
  "review MODSPEC", "review architecture", "nên dùng công nghệ gì"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
---

Bạn là Tech Expert — kết hợp vai trò CTO + Tech Architect.
Chuyên môn: Kiến trúc phần mềm, tech stack selection, scalability,
security, API design, database design, DevOps.

Khi review MODSPEC/ARCHITECTURE:
- Kiểm tra: ADR decisions có hợp lý? Trade-offs rõ ràng?
- Kiểm tra: API design RESTful? Naming consistent? Auth đúng?
- Kiểm tra: DB schema có indexes? N+1 query risk? Scalability?
- Kiểm tra: NFR realistic? Monitoring plan?
- Gắn mã: AP-XXX (Architecture Principle), ADR-XXX, NFR-XXX
```

#### Agent 9: `legal-compliance-expert` — Pháp lý & Tuân thủ

```markdown
# agents/legal-compliance-expert.md
---
name: legal-compliance-expert
description: >
  Chuyên gia pháp lý & tuân thủ — gộp vai trò Legal + Compliance.
  Tham gia: Phase 2 (rủi ro pháp lý), Phase 3 (review chính sách tuân thủ
  luật pháp, bảo mật dữ liệu, GDPR, điều khoản hợp đồng),
  Phase 5 (review security architecture, data handling),
  Phase 8 (compliance checklist trước deploy).
  Trigger: "pháp lý", "legal", "compliance", "GDPR", "bảo mật",
  "hợp đồng", "điều khoản", "quy định", "license"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
---

Bạn là Legal & Compliance Expert.
Chuyên môn: Luật thương mại, bảo vệ dữ liệu cá nhân (GDPR/PDPA),
compliance ngành (y tế, tài chính, XNK), hợp đồng, IP/license.

Khi review tài liệu:
- Kiểm tra: Data handling policy có compliant? PII protection?
- Kiểm tra: Terms of service, privacy policy đầy đủ?
- Kiểm tra: Licensing dependencies? Open-source compliance?
- Cảnh báo: Rủi ro pháp lý cụ thể theo ngành + quốc gia
- Gắn mã: RISK-LEGAL-XXX, BR-LEGAL-XXX
```

#### Agent 10: `domain-expert` — Chuyên gia Ngành

```markdown
# agents/domain-expert.md
---
name: domain-expert
description: >
  Chuyên gia ngành — tự động adapt theo industry của dự án
  (XNK/Logistics, Retail, F&B, SaaS, Healthcare, Manufacturing, ...).
  Tham gia: Phase 1 (hỏi đúng câu hỏi ngành), Phase 2 (phân tích ngành),
  Phase 3 (chính sách/quy trình đặc thù ngành),
  Phase 4 (URS phản ánh đúng nghiệp vụ ngành).
  Trigger: "đặc thù ngành", "quy định ngành", "nghiệp vụ", "domain",
  "thông quan", "inventory", "POS", "HACCP", "SaaS metrics"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
skills: [biz-docs]
---

Bạn là Domain Expert — tự động adapt theo ngành dự án.
ĐỌC PROJECT-OVERVIEW → xác định ngành → load knowledge tương ứng.

Ngành XNK/Logistics: Thông quan, HS Code, Incoterms, vận chuyển quốc tế
Ngành Retail: POS, inventory, omnichannel, loyalty, promotions
Ngành F&B: Menu management, HACCP, cost-of-goods, table management
Ngành SaaS: Subscription, churn, MRR/ARR, onboarding, usage analytics
Ngành Healthcare: HL7/FHIR, patient data, FDA compliance, medical devices
Ngành Manufacturing: BOM, MRP, quality control, production planning

Khi review BIZ-POLICY/PROCESS:
- Kiểm tra: Có bao phủ đủ nghiệp vụ đặc thù ngành?
- Kiểm tra: Thuật ngữ ngành có đúng? (đối chiếu TERM-XXX)
- Bổ sung: Quy trình ngành mà team có thể chưa biết
- Cảnh báo: Compliance ngành bị thiếu
```

#### Agent 11: `ux-market-expert` — UX & Marketing

```markdown
# agents/ux-market-expert.md
---
name: ux-market-expert
description: >
  Chuyên gia UX & Marketing — gộp vai trò UX Designer + CMO.
  Tham gia: Phase 2 (phân tích user), Phase 4 (review User Stories,
  User Journeys), Phase 5 (review UI/UX trong MODSPEC),
  Phase 6 (review USER-GUIDE), Phase 8 (training plan).
  Trigger: "UX", "trải nghiệm người dùng", "UI", "user journey",
  "marketing", "thương hiệu", "onboarding", "user guide"
tools: [Read]
model: sonnet
maxTurns: 15
mcpServers: [project-memory]
---

Bạn là UX & Market Expert — kết hợp UX Designer + CMO.
Chuyên môn: UX research, usability, information architecture,
user journey mapping, marketing strategy, brand positioning.

Khi review URS/MODSPEC:
- Kiểm tra: User Stories có đúng persona? Pain points rõ?
- Kiểm tra: User Journey mượt? Có friction points?
- Kiểm tra: UI wireframes có usable? Accessibility?
- Kiểm tra: Onboarding flow có smooth? Learning curve?
- Đề xuất: Cải thiện UX, A/B test ideas, user feedback loops
```

### 18.2.1 Expert Agents tham gia ở đâu trong Pipeline?

```
Phase 1 DISCOVERY
  ├── domain-expert: Hỏi đúng câu hỏi đặc thù ngành
  └── strategy-expert: Đánh giá sơ bộ ý tưởng

Phase 2 EXPERT ANALYSIS
  ├── strategy-expert: Chiến lược, business model
  ├── finance-expert: Tài chính, pricing, ROI
  ├── tech-expert: Đánh giá tech, khả thi kỹ thuật
  ├── legal-compliance-expert: Rủi ro pháp lý
  ├── domain-expert: Nghiệp vụ đặc thù ngành
  └── ux-market-expert: Phân tích user, thị trường

Phase 3 BUSINESS DOCS
  ├── finance-expert: Review pricing policy, cost structure
  ├── legal-compliance-expert: Review compliance policies
  ├── domain-expert: Review quy trình ngành
  └── strategy-expert: Review business model

Phase 4 REQUIREMENTS (URS)
  ├── domain-expert: Validate nghiệp vụ trong User Stories
  └── ux-market-expert: Review User Journey, personas

Phase 5 TECH DESIGN (MODSPEC)
  ├── tech-expert: Review ARCHITECTURE, DATA-MODEL, API design
  ├── legal-compliance-expert: Review data security, privacy
  └── ux-market-expert: Review UI/UX specs

Phase 6 QA & DOCS
  ├── ux-market-expert: Review USER-GUIDE (ngôn ngữ end-user)
  └── domain-expert: Validate test scenarios đúng nghiệp vụ

Phase 7 CODE GEN
  └── tech-expert: Review code scaffold, best practices

Phase 8 VERIFY & DEPLOY
  ├── finance-expert: Review budget triển khai, SLA
  ├── legal-compliance-expert: Compliance checklist
  ├── tech-expert: Review deploy architecture, monitoring
  └── strategy-expert: Go-to-market readiness
```

### 18.2.2 Expert Knowledge Base

Mỗi Expert Agent có **knowledge base** trong `references/`:

```
agents/
├── orchestrator.md
├── doc-writer.md
├── verifier.md
├── code-generator.md
├── change-analyst.md
│
├── strategy-expert.md
│   └── references/
│       ├── business-model-patterns.md      # Canvas, Lean, subscription models
│       ├── go-to-market-frameworks.md       # GTM strategies
│       └── kpi-frameworks.md                # OKR, balanced scorecard
│
├── finance-expert.md
│   └── references/
│       ├── pricing-strategies.md            # Cost-plus, value-based, tiered
│       ├── financial-modeling.md            # ROI, NPV, break-even
│       └── operations-frameworks.md         # Lean, Six Sigma, supply chain
│
├── tech-expert.md
│   └── references/
│       ├── architecture-patterns.md         # Microservices, monolith, event-driven
│       ├── tech-stack-comparisons.md        # Node vs Java vs Go, DB choices
│       ├── security-checklist.md            # OWASP, auth patterns
│       └── scalability-patterns.md          # Caching, CDN, load balancing
│
├── legal-compliance-expert.md
│   └── references/
│       ├── data-privacy-regulations.md      # GDPR, PDPA, CCPA
│       ├── industry-compliance.md           # Healthcare, Finance, XNK
│       └── licensing-guide.md               # Open-source, SaaS terms
│
├── domain-expert.md
│   └── references/
│       ├── industry-logistics.md            # XNK, HS Code, Incoterms
│       ├── industry-retail.md               # POS, omnichannel, loyalty
│       ├── industry-fnb.md                  # HACCP, menu, F&B operations
│       ├── industry-saas.md                 # Subscription, churn, metrics
│       ├── industry-healthcare.md           # HL7/FHIR, patient data
│       └── industry-manufacturing.md        # BOM, MRP, QC
│
└── ux-market-expert.md
    └── references/
        ├── ux-research-methods.md           # Interview, usability test, survey
        ├── ui-patterns.md                   # Navigation, forms, dashboards
        ├── accessibility-guide.md           # WCAG 2.1, screen reader
        └── marketing-frameworks.md          # AIDA, content strategy, SEO
```

### 18.2.3 Tổng hợp: 11 Agents

| # | Agent | Loại | Vai trò | Tham gia Phases |
|---|-------|------|--------|----------------|
| 1 | `orchestrator` | System | Điều phối tổng, parallel, merge | Tất cả |
| 2 | `doc-writer` | System | Tạo tài liệu, enforce IDs + DEPENDENCY MAP | 1-6 |
| 3 | `verifier` | System | Independent Verify (cold check) | 2-8 |
| 4 | `code-generator` | System | Sinh code → src/ | 7 |
| 5 | `change-analyst` | System | Impact analysis + cascade update | Khi thay đổi |
| 6 | `strategy-expert` | Expert | CEO + CSO + CBO | 1, 2, 3, 8 |
| 7 | `finance-expert` | Expert | CFO + COO | 2, 3, 8 |
| 8 | `tech-expert` | Expert | CTO + Architect | 2, 5, 7, 8 |
| 9 | `legal-compliance-expert` | Expert | Legal + Compliance | 2, 3, 5, 8 |
| 10 | `domain-expert` | Expert | Chuyên gia ngành (adaptive) | 1, 2, 3, 4, 6 |
| 11 | `ux-market-expert` | Expert | UX + CMO | 2, 4, 5, 6, 8 |

### 18.3 Hooks — Tự Động Hóa Lifecycle

```json
// hooks/hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate-ids.sh",
            "description": "Kiểm tra Formal IDs unique sau khi Save/Edit"
          },
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/update-dependency-map.sh",
            "description": "Auto-update _dependency-graph.md khi file thay đổi"
          }
        ]
      },
      {
        "matcher": "mc_save|mc_batch_update",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/update-key-facts.sh",
            "description": "Auto-update _key-facts.md khi tài liệu thay đổi"
          },
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/update-master-index.sh",
            "description": "Auto-update MASTER-INDEX.md"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/auto-checkpoint.sh",
            "description": "Tự động lưu checkpoint khi Claude dừng"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/load-project-context.sh",
            "description": "Auto-load project context + checkpoint khi bắt đầu session"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/merge-subagent-output.sh",
            "description": "Auto-merge output khi subagent hoàn thành"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/save-context-before-compact.sh",
            "description": "Lưu context quan trọng trước khi Claude compact"
          }
        ]
      }
    ]
  }
}
```

### 18.4 Hooks giải quyết vấn đề gì?

| Hook Event | Script | Giải quyết |
|-----------|--------|-----------|
| `PostToolUse` (Write/Edit) | `validate-ids.sh` | Đảm bảo mọi ID (BR-XXX, FT-XXX) là unique — phát hiện trùng ngay |
| `PostToolUse` (Write/Edit) | `update-dependency-map.sh` | Auto-update `_dependency-graph.md` — không cần agent làm thủ công |
| `PostToolUse` (mc_save) | `update-key-facts.sh` | Auto-update `_key-facts.md` — Key Facts luôn đồng bộ |
| `PostToolUse` (mc_save) | `update-master-index.sh` | Auto-update `MASTER-INDEX.md` — registry luôn chính xác |
| `Stop` | `auto-checkpoint.sh` | **Tự động checkpoint** khi session kết thúc — không bao giờ mất progress |
| `SessionStart` | `load-project-context.sh` | Auto-load context + resume từ checkpoint — bắt đầu ngay, không cần hỏi |
| `SubagentStop` | `merge-subagent-output.sh` | Auto-merge khi parallel batch xong — giảm overhead orchestrator |
| `PreCompact` | `save-context-before-compact.sh` | Lưu Key Facts + checkpoint trước khi Claude compact context — không mất thông tin quan trọng |

### 18.5 Rules — Hướng Dẫn Project-Level

Plugins **không thể ship CLAUDE.md trực tiếp** (theo chuẩn Claude Code). Thay vào đó, MCV3 sẽ:

**1. Tự động tạo `.claude/CLAUDE.md` khi `mc_init_project`:**

```markdown
# MCV3 Project Rules — Auto-generated by MCV3

## Naming Conventions
- Formal IDs: BR-{DOM}-{SEQ}, US-{MOD}-{SEQ}, FT-{MOD}-{SEQ}, API-{MOD}-{SEQ}
- Module codes: 3-5 ký tự viết hoa (INV, CRM, HRM, ACC, WH)
- Files: MODSPEC-{MOD}.md, URS-{MOD}.md, TEST-{MOD}.md, BIZ-POLICY-{DOM}.md

## Architecture Rules
- .mc-data/ = tài liệu ONLY — KHÔNG để source code
- src/ = source code ONLY — KHÔNG để tài liệu thiết kế
- Mọi tài liệu PHẢI có DEPENDENCY MAP ở đầu file
- Business Rules PHẢI có pseudo-code

## Context Loading
- LUÔN đọc _key-facts.md (Layer 0) trước mọi tác vụ
- LUÔN đọc DEPENDENCY MAP (Layer 1) khi mở file
- Context budget: ≤ 20KB per task

## Quality Gates
- Mọi MODSPEC, URS, BIZ-POLICY phải qua Independent Verify
- Mọi ID (BR-XXX, US-XXX, ...) phải unique toàn dự án
- mc_snapshot() BẮT BUỘC trước batch update ≥ 3 files
- mc_checkpoint() BẮT BUỘC sau mỗi bước hoàn thành

## Project Context
@.mc-data/MASTER-INDEX.md
@.mc-data/projects/{slug}/_PROJECT/DATA-DICTIONARY.md
```

**2. Tạo path-specific rules `.claude/rules/`:**

```markdown
# .claude/rules/mc-data.md
---
paths:
  - ".mc-data/**/*.md"
---
# Rules cho tài liệu trong .mc-data
- Mọi file PHẢI có DEPENDENCY MAP section
- Mọi element PHẢI gán Formal ID
- KHÔNG viết source code trong .mc-data
- Update _key-facts.md sau mỗi thay đổi
```

```markdown
# .claude/rules/src.md
---
paths:
  - "src/**/*"
---
# Rules cho source code
- ĐỌC MODSPEC trước khi code — [REF: .mc-data/.../MODSPEC-*.md]
- Business Rules (BR-XXX) translate từ pseudo-code trong MODSPEC
- API endpoints follow conventions trong ARCHITECTURE.md
- KHÔNG tạo tài liệu thiết kế trong src/ — chỉ README.md link về .mc-data
```

### 18.6 Tổng hợp: Chuẩn Claude Code Plugin Compliance

| Thành phần Claude Code | MCV3 v3.0 | MCV3 v3.1 | Trạng thái |
|------------------------|-----------|-----------|-----------|
| `plugin.json` | ✅ Có | ✅ Có | OK |
| `skills/` | ✅ 7 skills | ✅ 13 skills | OK |
| `agents/` | ❌ Không có | ✅ 11 agents (5 system + 6 expert) | **MỚI** |
| `hooks/hooks.json` | ❌ Không có | ✅ 8 hooks | **MỚI** |
| `mcp-servers/` | ✅ 1 server (18 tools) | ✅ 1 server (20 tools) | CẬP NHẬT |
| `.claude/CLAUDE.md` | ❌ Không có | ✅ Auto-generated khi init | **MỚI** |
| `.claude/rules/` | ❌ Không có | ✅ Path-specific rules | **MỚI** |
| `scripts/` | ❌ Không có | ✅ 8 hook scripts | **MỚI** |
| `settings.json` | ❌ Không có | ✅ Default agent config | **MỚI** |

---

## 19. Kiến Trúc Plugin (Full Structure) ← CẬP NHẬT v3.1

### 19.1 Plugin Structure (11 Agents + 13 Skills + 8 Hooks + 20 MCP Tools)

```
mcv3-devkit/
├── .claude-plugin/plugin.json
│
├── agents/                                   # ⭐ AGENTS (11 agents) ← MỚI v3.1
│   ├── orchestrator.md                       # System: Điều phối tổng
│   ├── doc-writer.md                         # System: Tạo tài liệu
│   ├── verifier.md                           # System: Independent Verify
│   ├── code-generator.md                     # System: Sinh code → src/
│   ├── change-analyst.md                     # System: Impact analysis
│   ├── strategy-expert.md                    # Expert: CEO + CSO + CBO
│   │   └── references/                       # Knowledge base chiến lược
│   ├── finance-expert.md                     # Expert: CFO + COO
│   │   └── references/                       # Knowledge base tài chính
│   ├── tech-expert.md                        # Expert: CTO + Architect
│   │   └── references/                       # Knowledge base công nghệ
│   ├── legal-compliance-expert.md            # Expert: Legal + Compliance
│   │   └── references/                       # Knowledge base pháp lý
│   ├── domain-expert.md                      # Expert: Chuyên gia ngành (adaptive)
│   │   └── references/industry-*.md          # Knowledge base per ngành
│   └── ux-market-expert.md                   # Expert: UX + CMO
│       └── references/                       # Knowledge base UX/Marketing
│
├── hooks/                                    # ⭐ HOOKS ← MỚI v3.1
│   └── hooks.json                            # 8 hook configs
│
├── scripts/                                  # ⭐ SCRIPTS cho hooks ← MỚI v3.1
│   ├── validate-ids.sh                       # Kiểm tra Formal IDs unique
│   ├── update-dependency-map.sh              # Auto-update _dependency-graph.md
│   ├── update-key-facts.sh                   # Auto-update _key-facts.md
│   ├── update-master-index.sh                # Auto-update MASTER-INDEX.md
│   ├── auto-checkpoint.sh                    # Auto checkpoint khi session end
│   ├── load-project-context.sh               # Auto-load context khi session start
│   ├── merge-subagent-output.sh              # Auto-merge khi subagent done
│   └── save-context-before-compact.sh        # Lưu context trước compact
│
├── settings.json                             # ⭐ Default settings ← MỚI v3.1
│
├── skills/
│   │
│   │── ─── PIPELINE SKILLS (9 skills — cover 8 phases) ──────────
│   │
│   ├── discovery/SKILL.md                    # Phase 1: Thu thập & Phỏng vấn
│   │   └── references/
│   │       ├── interview-frameworks/{industry}.md
│   │       └── project-overview-schema.md
│   │
│   ├── expert-panel/SKILL.md                 # Phase 2: Phân tích Chuyên gia
│   │   └── references/experts/{role}.md      # 12 expert personas
│   │
│   ├── biz-docs/SKILL.md                     # Phase 3: Tài liệu Nghiệp vụ
│   │   └── references/
│   │       ├── skeleton/                     # Skeleton templates (Guided Gen)
│   │       ├── templates/policies/           # BIZ-POLICY templates (structured BR)
│   │       ├── templates/processes/          # PROCESS templates (AS-IS/TO-BE)
│   │       └── industry/                     # Per-industry templates
│   │
│   ├── requirements/SKILL.md                 # Phase 4: URS per Module ← MỚI v3.1
│   │   └── references/URS-TEMPLATE.md
│   │
│   ├── tech-design/SKILL.md                  # Phase 5: MODSPEC All-in-One
│   │   └── references/
│   │       ├── MODSPEC-TEMPLATE.md           # ⭐ Template all-in-one
│   │       ├── SYSTEM-INDEX-TEMPLATE.md
│   │       ├── architecture-patterns.md
│   │       └── database-patterns.md
│   │
│   ├── qa-docs/SKILL.md                      # Phase 6: QA & Documentation ← MỚI v3.1
│   │   └── references/
│   │       ├── TEST-TEMPLATE.md
│   │       ├── USER-GUIDE-TEMPLATE.md
│   │       └── ADMIN-GUIDE-TEMPLATE.md
│   │
│   ├── code-gen/SKILL.md                     # Phase 7: Code Scaffolding
│   │   └── references/stack-templates/       # Output → src/ (NGOÀI .mc-data)
│   │
│   ├── verify/SKILL.md                       # Phase 8: Verify & Deploy
│   │   └── references/
│   │       ├── VERIFY-P1-TEMPLATE.md
│   │       ├── VERIFY-P2-TEMPLATE.md
│   │       ├── VERIFY-INTEGRATION-TEMPLATE.md
│   │       └── DEPLOY-OPS-TEMPLATE.md
│   │
│   ├── navigator/SKILL.md                    # Navigation + Resume + Status
│   │
│   │── ─── LIFECYCLE SKILLS (4 skills — cover post-pipeline) ── MỚI v3.1 ──
│   │
│   ├── change-manager/SKILL.md               # 🔄 Change Management ← MỚI v3.1
│   │   └── references/
│   │       ├── impact-cascade-rules.md       # Quy tắc cascade khi sửa BR/requirement
│   │       └── change-request-template.md    # Template change request
│   │
│   ├── onboarding/SKILL.md                   # 📥 Project Onboarding ← MỚI v3.1
│   │   └── references/
│   │       ├── import-wizard.md              # Wizard import dự án có sẵn vào MCV3
│   │       └── reverse-engineer-guide.md     # Reverse-engineer code → tài liệu
│   │
│   ├── evolution/SKILL.md                    # 🔧 Maintenance & Evolution ← MỚI v3.1
│   │   └── references/
│   │       ├── version-management.md         # Quản lý phiên bản tài liệu
│   │       ├── feature-request-template.md   # Template feature request mới
│   │       └── bug-tracking-template.md      # Template bug report → trace về MODSPEC
│   │
│   └── migration/SKILL.md                    # 🔀 System Migration/Upgrade ← MỚI v3.1
│       └── references/
│           ├── migration-plan-template.md    # Template kế hoạch migration
│           └── as-is-analysis-guide.md       # Hướng dẫn phân tích hệ thống cũ
│
├── mcp-servers/project-memory/
│   ├── src/index.ts                          # 20 tools
│   └── package.json
└── LICENSE
```

### 19.2 Phân loại Skills

#### A. Pipeline Skills (9 skills — cover 8 phases)

| Skill | Phase | Trigger keywords | Output chính |
|-------|-------|-----------------|-------------|
| `discovery` | 1 | "bắt đầu dự án", "ý tưởng mới" | PROJECT-OVERVIEW.md |
| `expert-panel` | 2 | "hỏi chuyên gia", "brainstorm" | EXPERT-LOG.md |
| `biz-docs` | 3 | "tạo chính sách", "quy trình" | BIZ-POLICY/*, PROCESS/* |
| `requirements` | 4 | "viết URS", "user stories", "requirements" | URS-{MODULE}.md |
| `tech-design` | 5 | "thiết kế module", "MODSPEC", "architecture" | MODSPEC-{MODULE}.md |
| `qa-docs` | 6 | "tạo test", "viết hướng dẫn", "test spec" | TEST-*, USER-GUIDE, ADMIN-GUIDE |
| `code-gen` | 7 | "tạo code", "scaffold" | `src/{system}/` (NGOÀI .mc-data) |
| `verify` | 8 | "verify", "kiểm tra", "deploy" | _VERIFY-*, DEPLOY-OPS |
| `navigator` | — | "tổng quan", "tiếp tục", "status" | Hiển thị trạng thái + resume |

#### B. Lifecycle Skills (4 skills — cover post-pipeline) ← MỚI v3.1

| Skill | Mục đích | Trigger keywords | Khi nào cần |
|-------|---------|-----------------|------------|
| `change-manager` | Quản lý thay đổi requirement/policy → cascade update | "sửa requirement", "thay đổi policy", "update BR" | User sửa BIZ-POLICY hoặc URS → cần update cascade MODSPEC, TEST, ... |
| `onboarding` | Import dự án có sẵn vào MCV3 | "import dự án", "onboard project", "dự án có sẵn" | Dự án đã tồn tại (có code, có tài liệu rời) → cần cấu trúc hóa vào .mc-data |
| `evolution` | Maintenance sau go-live: bug, feature request, versioning | "bug report", "feature request", "version mới", "maintain" | Sau go-live: tracking bugs, thêm feature mới, quản lý phiên bản |
| `migration` | Migration/Upgrade hệ thống cũ | "migrate hệ thống", "nâng cấp", "replace system" | Thay thế hệ thống legacy → phân tích AS-IS → plan migration |

### 19.3 Skills Coverage Map (SDLC đầy đủ)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SOFTWARE DEVELOPMENT LIFECYCLE                     │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Ideation │→│ Analysis │→│  Design  │→│   Build  │→ ...        │
│  │discovery │  │expert    │  │biz-docs  │  │code-gen  │            │
│  │          │  │panel     │  │requirem. │  │          │            │
│  │          │  │          │  │tech-design│  │          │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Test    │→│  Deploy  │→│ Maintain │→│ Evolve   │            │
│  │qa-docs   │  │verify    │  │evolution │  │change-mgr│            │
│  │          │  │          │  │          │  │migration │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐            │
│  │  Cross-cutting: navigator (tracking) + onboarding    │            │
│  └──────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘

Total: 13 Skills → cover toàn bộ SDLC
```

---

## 20. Project Memory MCP Server ← CẬP NHẬT v3.1

### 20.1 Tools — Core (9 tools — giữ từ v3.0)

| Tool | Mô tả |
|------|-------|
| `mc_init_project` | Khởi tạo dự án → tạo folder structure v3.1 |
| `mc_save` | Lưu artifact + auto-update _key-facts nếu cần |
| `mc_load` | Đọc artifact — hỗ trợ Layer filtering (0/1/2/3) |
| `mc_search` | Tìm kiếm nội dung across project |
| `mc_list` | Liệt kê contents folder |
| `mc_status` | Trạng thái dự án + checkpoint info |
| `mc_update_index` | Cập nhật MASTER-INDEX + SYSTEM-INDEX |
| `mc_verify` | Chạy verification cho scope |
| `mc_changelog` | Ghi log thay đổi |

### 20.2 Tools — v3.0 (9 tools)

| Tool | Mô tả |
|------|-------|
| `mc_summary` | Key Facts của 1 file (Layer 0) |
| `mc_snapshot` | Tạo snapshot trước thay đổi lớn |
| `mc_rollback` | Quay lại snapshot |
| `mc_batch_update` | Update nhiều files atomic |
| `mc_checkpoint` | Lưu trạng thái làm việc |
| `mc_resume` | Load checkpoint + resume instructions |
| `mc_impact_analysis` | Files bị ảnh hưởng khi sửa 1 file |
| `mc_dependency_graph` | Query/update dependency graph |
| `mc_validate_schema` | Validate file theo template |

### 20.3 Tools — MỚI v3.1 (2 tools)

| Tool | Mô tả |
|------|-------|
| `mc_resolve_id` | Tìm file + vị trí chứa mã ID (VD: `mc_resolve_id("BR-SALES-001")` → `BIZ-POLICY-SALES.md:line 45`) |
| `mc_traceability` | Trả về chain truy vết cho 1 ID (VD: `mc_traceability("FT-INV-001")` → `{derives_from: "US-INV-001", implements: "BR-WH-001", tested_by: "TC-INV-001-01"}`) |

**Tổng: 20 tools**

---

## 21. Registry & Tracking System

### 20.1 MASTER-INDEX.md

```markdown
# MASTER-INDEX
> Dự án: {{PROJECT_NAME}} | Mã: {{PROJECT_CODE}}

## SYSTEMS REGISTRY
| Code | Tên | Modules | Tech Stack | Phase | Verify |
| ERP | NIRA ERP | 5 | NestJS+PostgreSQL | P2-Design | ✅ P1, 🔄 P2 |
| WEB | Web Portal | 2 | Next.js+Strapi | P1-Req | ✅ P1 |

## DEPENDENCY MATRIX (giữa systems)
| ERP-CRM | → | WEB-ECOM | Khách hàng | REST API | [REF: INT-ERP-WEB-001] |

## DOCUMENT MAP (bản đồ tài liệu — links đến mọi file)
## AI NAVIGATION GUIDE (đọc gì, thứ tự nào)
```

---

## 22. Roadmap ← CẬP NHẬT v3.1

### Phase 1: MVP (Tuần 1-14)

| # | Task | Tuần | Priority |
|---|------|------|----------|
| 1 | Formal ID System + naming convention | 1-2 | P0 |
| 2 | Discovery Skill + PROJECT-OVERVIEW template | 2-3 | P0 |
| 3 | Expert Panel Skill (Bounded Parallel) | 3-4 | P0 |
| 4 | MCP Server (20 tools incl. mc_resolve_id, mc_traceability) | 2-6 | P0 |
| 5 | Smart Context Layering + DEPENDENCY MAP | 3-5 | P0 |
| 6 | Biz-Docs Skill (Guided Gen + Structured BR + AS-IS/TO-BE) | 5-7 | P0 |
| 7 | Data Dictionary + Shared Services templates | 5-6 | P1 |
| 8 | Requirements Skill (URS per module) | 6-8 | P0 |
| 9 | Tech-Design Skill (MODSPEC all-in-one) | 7-10 | P0 |
| 10 | QA-Docs Skill (TEST + USER-GUIDE + ADMIN-GUIDE) | 9-11 | P1 |
| 11 | Verify Skill (per-phase cross + integration + traceability) | 10-12 | P0 |
| 12 | Snapshot + Checkpoint + Navigator | 4-6 | P0 |
| 13 | DEPLOY-OPS template | 12-13 | P1 |
| 14 | Plugin packaging + testing + buffer | 13-14 | P0 |

### Phase 2: Enhanced (Tuần 15-24)

| # | Task | Tuần | Priority |
|---|------|------|----------|
| 15 | Code Scaffold Skill (output → src/, 4 stacks) | 15-17 | P1 |
| 16 | Change Manager Skill (cascade update khi sửa BR/URS) | 16-18 | P0 |
| 17 | Onboarding Skill (import dự án có sẵn vào MCV3) | 17-19 | P1 |
| 18 | Evolution Skill (bug tracking, feature request, versioning) | 19-21 | P1 |
| 19 | Migration Skill (upgrade hệ thống legacy) | 20-22 | P2 |
| 20 | Industry templates mở rộng (+4 ngành) | 18-21 | P1 |
| 21 | User testing + feedback | 22-24 | P0 |
| 22 | Performance optimization (context budget tuning) | 23-24 | P1 |

---

## 23. Rủi Ro & Giải Pháp ← CẬP NHẬT v3.1

| Rủi ro | Mức | Giải pháp |
|--------|-----|----------|
| **Context Limitation** | **Thấp** | Smart Context Layering (4 layers) + Context Budget + DEPENDENCY MAP |
| **Output Quality** | **Thấp** | Guided Gen + Structured BR + Independent Verify + Formal IDs |
| **Multi-system Complexity** | **Thấp** | Dependency Graph + Impact Analysis + per-phase Cross Verify |
| **Verify False Positives** | **Thấp** | Independent Verify + Traceability Matrix (gap detection) |
| **Session Interruption** | **Thấp** | Checkpoint + Resume + Snapshot |
| **Data Corruption** | **Thấp** | Atomic Batch Update + Rollback |
| **Traceability Gaps** | **Thấp** | Formal ID chain PROB→BR→US→FT→API→TC + mc_traceability |
| **AI Navigation Lost** | **Thấp** | DEPENDENCY MAP per doc + AI Quick Guide + MASTER-INDEX |
| **Platform Risk** | Cao | Moat = domain knowledge + Vietnamese context + Formal ID system |
| **Liability** | TB | Disclaimer + Guided Generation (user confirms key decisions) |

---

## Phụ Lục A: So sánh v1 → v2 → v3.0 → v3.1

| Tiêu chí | v1 | v2.x | v3.0 | v3.1 |
|----------|----|----|------|------|
| Folder | Flat | Hierarchical | + snapshots, checkpoints | + _PROJECT, _SHARED-SERVICES, P1/P2/P3 per system |
| ID System | Không | Không | Không | **Formal IDs** (BR, US, FT, API, TC, ...) |
| Module Design | Single file | Multi-file | Multi-file + Key Facts | **MODSPEC All-in-One** |
| Requirements | Không | Không | Không | **URS Layer** (US, UC, AC per module) |
| Shared Data | Không | Cơ bản | _shared-models | **DATA-DICTIONARY** (TERM+ENT+ENUM+Ownership) |
| Shared Services | Không | Không | Không | **_SHARED-SERVICES/** (AUTH, NOTIFY, STORAGE) |
| Business Policy | Không | Prose | Prose + Guided Gen | **Structured** (5 categories + pseudo-code) |
| Process | Không | One-way | One-way | **AS-IS + TO-BE** + Pain Points + Comparison |
| QA Phase | Không | Không | Không | **P3-QA-DOCS** (TEST, USER-GUIDE, ADMIN-GUIDE) |
| Deploy | Không | Basic | Basic | **DEPLOY-OPS** (Go-Live, Rollback, Training, SLA) |
| Context Mgmt | Không | Không | Smart Layering 3L | **4-Layer** (+ DEPENDENCY MAP per doc) |
| Verification | Không | 5 loại | + Independent Verify | + **per-phase Cross** + Traceability Matrix + Sign-Off |
| Parallel | Không | Không | Bounded 2+1 | Giữ nguyên |
| Recovery | Không | Không | Checkpoint + Snapshot | Giữ nguyên |
| Pipeline | 5 phases | 6 phases | 6 phases | **8 phases** (+Requirements, +QA&Docs) |
| AI Navigation | Không | Không | Không | **DEPENDENCY MAP + AI Quick Guide** |
| Traceability | File-based | File-based | File-based | **PROB→BR→US→FT→API→TC chain** |
| MCP Tools | — | 9 | 18 | **20** (+mc_resolve_id, +mc_traceability) |
| Skills | 5 | 7 | 7 | **13** (9 pipeline + 4 lifecycle) |
| Agents | Không | Không | Không | **11 agents** (5 system + 6 expert: strategy, finance, tech, legal, domain, UX) |
| Hooks | Không | Không | Không | **8 hooks** (PostToolUse, Stop, SessionStart, SubagentStop, PreCompact) |
| Rules | Không | Không | Không | **Auto-generated CLAUDE.md** + path-specific rules |
| Total sections | — | — | 22 | **23** (+Agents/Hooks/Rules section) |

---

## Phụ Lục B: Glossary

| Term | Định nghĩa |
|------|-----------|
| **Project** | Dự án tổng — tất cả systems |
| **System** | Hệ thống phần mềm độc lập (ERP, Web, Mobile) |
| **Module** | Phần chức năng trong system (Kho, Bán hàng, CRM) |
| **Feature** | Tính năng cụ thể (FT-XXX) |
| **Phase** | Giai đoạn pipeline (Discovery → ... → Deploy) |
| **Formal ID** | Mã duy nhất cho mọi element (BR-XXX, US-XXX, FT-XXX, ...) |
| **MODSPEC** | Module Specification — file all-in-one chứa mọi thứ để code 1 module |
| **URS** | User Requirements Specification — yêu cầu nghiệp vụ per module |
| **Key Facts** | Tóm tắt ngắn gọn (~500 bytes) của 1 scope, dùng cho context loading |
| **DEPENDENCY MAP** | Section đầu mỗi tài liệu, khai báo "đọc gì trước, sinh ra gì" |
| **Context Layer** | Mức chi tiết khi load (0=Key Facts, 1=Dep Map, 2=Sections, 3=Full) |
| **Context Budget** | Giới hạn KB context mỗi task (≤20KB) |
| **Snapshot** | Backup files trước thay đổi lớn, cho rollback |
| **Checkpoint** | Trạng thái làm việc, cho resume sau gián đoạn |
| **Dependency Graph** | Đồ thị phụ thuộc giữa tài liệu, cho impact analysis |
| **Independent Verify** | Verify bởi agent KHÁC (cold, no reasoning bias) |
| **Bounded Parallelism** | Max 2 workers + 1 verifier per batch |
| **Guided Generation** | Skeleton → User confirm → Full generate (Phase 3) |
| **Atomic Batch Update** | Update nhiều files all-or-nothing |
| **Traceability Chain** | Chuỗi PROB→BR→US→UC→FT→API→TC — mỗi mắt có mã duy nhất |
| **Shared Service** | Service dùng chung (Auth, Notification, Storage) có spec riêng |
| **Data Dictionary** | Từ điển chung: TERM, ENT, ENUM, Data Ownership |
| **AS-IS / TO-BE** | Quy trình hiện tại vs quy trình mới (với pain points + metrics) |
| **Sign-Off** | Phê duyệt chính thức trong verify reports |
