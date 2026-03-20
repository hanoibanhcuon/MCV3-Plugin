/**
 * mc-summary.ts — Tool: mc_summary
 *
 * Tạo summary (tóm tắt) của project hoặc một phase/module cụ thể.
 * Dùng để:
 *   - Xem tổng quan nhanh khi bắt đầu session mới
 *   - Tạo báo cáo tiến độ cho stakeholders
 *   - Summarize một phase trước khi chuyển sang phase tiếp theo
 *   - Tạo executive summary toàn bộ project
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_summary */
export interface McSummaryParams {
    /** Slug dự án */
    projectSlug: string;
    /** Loại summary */
    summaryType?: 'project' | 'phase' | 'module' | 'executive';
    /** Phase cần summarize (dùng với summaryType=phase) */
    phase?: string;
    /** Module/System cần summarize (dùng với summaryType=module) */
    module?: string;
    /** Có lưu summary vào file không (default: false) */
    save?: boolean;
}
/**
 * Thực thi tool mc_summary
 */
export declare function mcSummary(params: McSummaryParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-summary.d.ts.map