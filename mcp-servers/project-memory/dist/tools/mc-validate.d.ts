/**
 * mc-validate.ts — Tool: mc_validate
 *
 * Validate format và completeness của tài liệu MCV3:
 *   - Kiểm tra Formal ID format (BR-XXX, US-XXX, ...)
 *   - Kiểm tra sections bắt buộc có đầy đủ không
 *   - Kiểm tra placeholder chưa được điền
 *   - Validate cross-references giữa các IDs
 *
 * Trả về danh sách issues (errors + warnings) theo mức độ:
 *   - ERROR: Bắt buộc phải sửa trước khi sang phase tiếp
 *   - WARNING: Nên sửa, không block
 *   - INFO: Gợi ý cải thiện
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 5 — Formal ID System
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_validate */
export interface McValidateParams {
    /** Slug dự án */
    projectSlug: string;
    /** Đường dẫn file cần validate (tương đối từ project root) */
    filePath: string;
    /** Loại validation: "format" | "completeness" | "ids" | "all" (default: "all") */
    validationType?: 'format' | 'completeness' | 'ids' | 'all';
}
/**
 * Thực thi tool mc_validate
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcValidate(params: McValidateParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-validate.d.ts.map