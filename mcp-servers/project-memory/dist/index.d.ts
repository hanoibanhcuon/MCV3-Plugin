/**
 * index.ts — MCV3 Project Memory MCP Server
 *
 * Entry point cho MCP Server. Đăng ký 19 tools (Sprint 0 + Sprint 1 + Sprint 2):
 *
 * Sprint 0 — Core Tools:
 *   1. mc_init_project  — Khởi tạo dự án mới
 *   2. mc_save          — Lưu artifact vào .mc-data/
 *   3. mc_load          — Đọc artifact (Smart Context Layering)
 *   4. mc_list          — Liệt kê documents
 *   5. mc_status        — Xem trạng thái dự án
 *
 * Sprint 1 — Extended Tools:
 *   6. mc_checkpoint    — Lưu checkpoint trạng thái session
 *   7. mc_resume        — Resume từ checkpoint (session mới)
 *   8. mc_validate      — Validate format/completeness tài liệu
 *   9. mc_export        — Export tài liệu (bundle/summary/index)
 *  10. mc_search        — Tìm kiếm trong project memory
 *
 * Sprint 2 — Advanced Tools:
 *  11. mc_snapshot        — Snapshot đầy đủ project state
 *  12. mc_rollback        — Rollback về snapshot trước
 *  13. mc_impact_analysis — Phân tích impact khi thay đổi
 *  14. mc_traceability    — Quản lý traceability matrix
 *  15. mc_dependency      — Quản lý dependencies giữa documents
 *  16. mc_compare         — So sánh 2 versions của document
 *  17. mc_merge           — Merge changes từ nhiều sources
 *  18. mc_changelog       — Quản lý changelog có cấu trúc
 *  19. mc_summary         — Tạo summary project/phase/module
 *
 * Chạy qua stdio transport (standard Claude Code MCP setup).
 */
export {};
//# sourceMappingURL=index.d.ts.map