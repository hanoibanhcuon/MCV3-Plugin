/**
 * mc-status.ts — Tool: mc_status
 *
 * Hiển thị trạng thái dự án MCV3:
 * - Phase hiện tại
 * - Số lượng tài liệu theo từng phase
 * - Danh sách systems
 * - Phase progress (% hoàn thành)
 *
 * Nếu không truyền projectSlug → liệt kê tất cả projects
 */
import type { McStatusParams, StatusResult } from '../types.js';
/**
 * Thực thi tool mc_status
 */
export declare function mcStatus(params: McStatusParams, projectRoot: string): Promise<StatusResult>;
//# sourceMappingURL=mc-status.d.ts.map