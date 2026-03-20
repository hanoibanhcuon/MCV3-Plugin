/**
 * mc-rollback.ts — Tool: mc_rollback
 *
 * Rollback toàn bộ project về trạng thái của một snapshot trước đó.
 * Trước khi rollback, tự động tạo safety snapshot của trạng thái hiện tại.
 *
 * Quy trình:
 *   1. Đọc snapshot bundle target
 *   2. Tạo safety snapshot của state hiện tại
 *   3. Restore tất cả documents từ bundle
 *   4. Cập nhật _config.json
 *   5. Ghi changelog
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Rollback Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_rollback */
export interface McRollbackParams {
    /** Slug dự án */
    projectSlug: string;
    /** Tên snapshot để rollback về (VD: "2024-01-15T10-30-00-truoc-refactor.bundle.json") */
    snapshotName: string;
    /** Bỏ qua xác nhận (mặc định false — cần confirm) */
    force?: boolean;
}
/**
 * Thực thi tool mc_rollback
 */
export declare function mcRollback(params: McRollbackParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-rollback.d.ts.map