/**
 * mc-snapshot.ts — Tool: mc_snapshot
 *
 * Tạo snapshot đầy đủ toàn bộ project state tại một thời điểm.
 * Khác với mc_checkpoint (chỉ lưu metadata), mc_snapshot lưu
 * TOÀN BỘ nội dung tất cả documents vào 1 bundle file.
 *
 * Dùng để:
 *   - Tạo backup point trước khi thay đổi lớn
 *   - Rollback về trạng thái cụ thể (kết hợp mc_rollback)
 *   - Archive milestone của dự án
 *
 * Output: .mc-data/projects/{slug}/_mcv3-work/_snapshots/{timestamp}-{label}.bundle.json
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Snapshot Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_snapshot */
export interface McSnapshotParams {
    /** Slug dự án */
    projectSlug: string;
    /** Nhãn mô tả snapshot (VD: "truoc-refactor-urs", "milestone-phase4") */
    label?: string;
    /** Có include working files không (default: false — chỉ lưu docs) */
    includeWorkFiles?: boolean;
    /** Ghi chú về snapshot này */
    notes?: string;
}
/**
 * Thực thi tool mc_snapshot
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcSnapshot(params: McSnapshotParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-snapshot.d.ts.map