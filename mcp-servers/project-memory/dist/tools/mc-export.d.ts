/**
 * mc-export.ts — Tool: mc_export
 *
 * Export tài liệu dự án MCV3 ra các format khác nhau:
 *   - "bundle": Gộp nhiều files thành 1 file Markdown lớn
 *   - "summary": Tóm tắt dự án theo phase (overview report)
 *   - "phase": Export toàn bộ tài liệu của 1 phase cụ thể
 *   - "index": Tạo README/INDEX với links đến tất cả tài liệu
 *
 * Output lưu vào: .mc-data/projects/{slug}/_mcv3-work/_exports/
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Export Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_export */
export interface McExportParams {
    /** Slug dự án */
    projectSlug: string;
    /** Loại export: "bundle" | "summary" | "phase" | "index" (default: "summary") */
    exportType?: 'bundle' | 'summary' | 'phase' | 'index';
    /** Phase cần export (dùng cho exportType="phase", VD: "_PROJECT", "ERP/P1-REQUIREMENTS") */
    targetPath?: string;
    /** Tên file output (không có extension, default: auto-generated) */
    outputName?: string;
}
/**
 * Thực thi tool mc_export
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcExport(params: McExportParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-export.d.ts.map