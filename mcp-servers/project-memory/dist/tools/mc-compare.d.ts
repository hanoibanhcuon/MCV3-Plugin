/**
 * mc-compare.ts — Tool: mc_compare
 *
 * So sánh 2 versions của một document hoặc 2 documents khác nhau.
 * Hỗ trợ diff theo line và theo section.
 *
 * Dùng để:
 *   - So sánh document hiện tại với snapshot trước
 *   - So sánh 2 modules khác nhau để phát hiện inconsistencies
 *   - Review thay đổi trước khi commit
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_compare */
export interface McCompareParams {
    /** Slug dự án */
    projectSlug: string;
    /** File A (current hoặc snapshot A) */
    fileA: string;
    /** File B — nếu bắt đầu bằng "@snapshot:" thì đọc từ snapshot bundle */
    fileB: string;
    /** Tên snapshot (nếu fileB là từ snapshot) */
    snapshotName?: string;
    /** Hiển thị context lines xung quanh mỗi diff (default: 3) */
    contextLines?: number;
}
/**
 * Thực thi tool mc_compare
 */
export declare function mcCompare(params: McCompareParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-compare.d.ts.map