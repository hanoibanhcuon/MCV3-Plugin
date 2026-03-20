/**
 * mc-dependency.ts — Tool: mc_dependency
 *
 * Quản lý dependencies giữa các documents trong dự án.
 * Theo dõi document nào depends on document nào (producer-consumer).
 *
 * Dùng để:
 *   - Đăng ký dependency (register)
 *   - Xem dependency tree của 1 document (query)
 *   - Kiểm tra circular dependencies (check)
 *   - Tìm tất cả documents bị ảnh hưởng khi 1 document thay đổi (impact)
 *
 * Data lưu tại: .mc-data/projects/{slug}/_mcv3-work/_dependencies.json
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_dependency */
export interface McDependencyParams {
    /** Slug dự án */
    projectSlug: string;
    /** Hành động */
    action: 'register' | 'query' | 'check' | 'impact';
    /** Document source (file ghi output) */
    source?: string;
    /** Documents mà source depends on */
    dependsOn?: string[];
    /** Document cần query dependencies */
    document?: string;
}
/**
 * Thực thi tool mc_dependency
 */
export declare function mcDependency(params: McDependencyParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-dependency.d.ts.map