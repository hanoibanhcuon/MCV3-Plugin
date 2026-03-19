# CLAUDE.md — Dự án Hệ thống phần mềm Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka
<!-- Auto-generated bởi MCV3 mc_init_project — 2026-03-19T09:25:08.607Z -->
<!-- Cập nhật tự động khi phase thay đổi -->

## Thông tin dự án

| Thuộc tính | Giá trị |
|-----------|---------|
| **Tên dự án** | Hệ thống phần mềm Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka |
| **Slug** | `eureka-xnk` |
| **Ngành** | Logistics / Xuất nhập khẩu |
| **Phase hiện tại** | phase0-init |
| **MCV3 Version** | 3.10.0 |

---

## MCP Tools có sẵn

Plugin `mcv3-project-memory` cung cấp 19 tools:

| Tool | Mục đích |
|------|---------|
| `mc_init_project` | Khởi tạo dự án mới |
| `mc_save` | Lưu tài liệu Markdown |
| `mc_load` | Đọc tài liệu (Smart Context Layering) |
| `mc_list` | Liệt kê tài liệu |
| `mc_status` | Xem trạng thái dự án |
| `mc_checkpoint` | Lưu checkpoint session |
| `mc_resume` | Resume từ checkpoint |
| `mc_validate` | Validate tài liệu |
| `mc_export` | Export tài liệu |
| `mc_search` | Tìm kiếm trong project memory |
| `mc_snapshot` | Snapshot đầy đủ project state |
| `mc_rollback` | Rollback về snapshot trước |
| `mc_impact_analysis` | Phân tích impact khi thay đổi |
| `mc_traceability` | Quản lý traceability matrix |
| `mc_dependency` | Quản lý dependencies giữa documents |
| `mc_compare` | So sánh 2 versions document |
| `mc_merge` | Merge content từ nhiều sources |
| `mc_changelog` | Quản lý changelog có cấu trúc |
| `mc_summary` | Tạo summary project/phase/module |

---

## Quy trình làm việc (MCV3 Pipeline)

```
Bắt đầu session mới:
  1. mc_resume({ projectSlug: "eureka-xnk" })  ← Load context
  2. Đọc MASTER-INDEX nếu cần chi tiết
  3. Tiếp tục công việc theo nextActions trong checkpoint

Kết thúc session:
  1. mc_checkpoint({
       projectSlug: "eureka-xnk",
       sessionSummary: "...",
       nextActions: ["..."]
     })
```

---

## Quy tắc làm việc

1. **Đọc trước** — Luôn gọi `mc_resume` khi bắt đầu session mới
2. **Không skip phase** — Phase trước phải complete trước khi sang phase sau
3. **Dùng Formal IDs** — BR-XXX, US-XXX, FT-XXX, ... cho mọi tài liệu
4. **Lưu qua mc_save** — KHÔNG ghi file .mc-data/ trực tiếp
5. **Tiếng Việt** — Comments và documentation bằng tiếng Việt
6. **Validate** — Gọi mc_validate trước khi sang phase tiếp theo

---

## Cấu trúc thư mục project

```
.mc-data/projects/eureka-xnk/
├── _config.json              ← Cấu hình dự án
├── MASTER-INDEX.md           ← Bản đồ tài liệu
├── _changelog.md             ← Lịch sử thay đổi
├── _PROJECT/                 ← Tài liệu cấp dự án
│   ├── PROJECT-OVERVIEW.md
│   ├── EXPERT-LOG.md
│   ├── DATA-DICTIONARY.md
│   ├── BIZ-POLICY/
│   └── PROCESS/
├── {SYSTEM}/                 ← Tài liệu từng system
│   ├── P1-REQUIREMENTS/      ← URS files
│   └── P2-DESIGN/            ← MODSPEC files
└── _mcv3-work/               ← Working files (checkpoint, snapshots)
```

---

## Formal ID System

| Prefix | Loại | Ví dụ |
|--------|------|-------|
| `BR-{DOM}-NNN` | Business Rule | BR-INV-001 |
| `US-{MOD}-NNN` | User Story | US-INV-001 |
| `UC-{MOD}-NNN-XX` | Use Case | UC-INV-001-01 |
| `FT-{MOD}-NNN` | Feature | FT-INV-001 |
| `TC-{MOD}-NNN` | Test Case | TC-INV-001 |
| `TBL-{SYS}-NNN` | Database Table | TBL-ERP-001 |
| `API-{SYS}-NNN` | API Endpoint | API-ERP-001 |
| `NFR-NNN` | Non-Functional Req | NFR-001 |
