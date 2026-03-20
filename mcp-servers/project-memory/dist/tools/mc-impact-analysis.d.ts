/**
 * mc-impact-analysis.ts — Tool: mc_impact_analysis
 *
 * Phân tích ảnh hưởng khi thay đổi một requirement, feature, hoặc design element.
 * Giúp team hiểu "nếu thay đổi X thì cần update những gì?"
 *
 * Dùng để:
 *   - Phân tích impact khi BR thay đổi (ripple effect lên US, FT, API, TC)
 *   - Phân tích impact khi DB schema thay đổi (ảnh hưởng API, code)
 *   - Tạo checklist những gì cần update
 *
 * Output: Structured impact report với checklist
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_impact_analysis */
export interface McImpactAnalysisParams {
    /** Slug dự án */
    projectSlug: string;
    /** ID của element bị thay đổi (VD: BR-WH-001, TBL-ERP-001, API-ERP-003) */
    changeId: string;
    /** Mô tả ngắn về thay đổi đề xuất */
    changeDescription?: string;
    /** Mức độ thay đổi: minor (thêm field), major (đổi logic), breaking (xóa/rename) */
    changeType?: 'minor' | 'major' | 'breaking';
}
/**
 * Thực thi tool mc_impact_analysis
 */
export declare function mcImpactAnalysis(params: McImpactAnalysisParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-impact-analysis.d.ts.map