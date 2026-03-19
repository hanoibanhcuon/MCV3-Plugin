/**
 * mc-merge.ts — Tool: mc_merge
 *
 * Merge nội dung từ nhiều sources vào một document.
 * Dùng khi nhiều agents cùng tạo output cho cùng một document
 * (VD: Domain Expert + Finance Expert → EXPERT-LOG.md).
 *
 * Modes:
 *   - append: Thêm content vào cuối document hiện có
 *   - section: Merge vào một section cụ thể (tìm theo heading)
 *   - replace-section: Thay thế nội dung một section
 *   - smart: Tự phát hiện section và merge thông minh
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_merge */
export interface McMergeParams {
    /** Slug dự án */
    projectSlug: string;
    /** File đích để merge vào */
    targetFile: string;
    /** Nội dung cần merge */
    content: string;
    /** Mode merge */
    mode?: 'append' | 'section' | 'replace-section' | 'smart';
    /** Tên section target (dùng với mode=section/replace-section) */
    sectionName?: string;
    /** Label mô tả nguồn gốc content (VD: "Domain Expert Session") */
    sourceLabel?: string;
    /** Tạo document mới nếu chưa tồn tại */
    createIfNotExists?: boolean;
}
/**
 * Thực thi tool mc_merge
 */
export declare function mcMerge(params: McMergeParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-merge.d.ts.map