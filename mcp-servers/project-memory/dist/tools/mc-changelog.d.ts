/**
 * mc-changelog.ts — Tool: mc_changelog
 *
 * Quản lý và query changelog của dự án.
 * Hỗ trợ: xem lịch sử, filter theo ngày/loại, tạo release notes.
 *
 * Khác với _changelog.md (raw log), tool này:
 *   - Structured changelog với categories
 *   - Filter và search trong history
 *   - Generate release notes cho từng phase
 *   - Thêm custom entries có meaning
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_changelog */
export interface McChangelogParams {
    /** Slug dự án */
    projectSlug: string;
    /** Hành động */
    action: 'view' | 'add' | 'filter' | 'release-notes';
    /** Nội dung entry cần thêm (dùng với add) */
    entry?: string;
    /** Loại thay đổi (dùng với add) */
    changeType?: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security' | 'milestone';
    /** Phase liên quan (dùng với add) */
    phase?: string;
    /** Filter từ ngày (dùng với filter) */
    fromDate?: string;
    /** Filter đến ngày (dùng với filter) */
    toDate?: string;
    /** Số entries tối đa (dùng với view/filter, default: 20) */
    limit?: number;
    /** Phase muốn tạo release notes (dùng với release-notes) */
    targetPhase?: string;
}
/**
 * Thực thi tool mc_changelog
 */
export declare function mcChangelog(params: McChangelogParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-changelog.d.ts.map