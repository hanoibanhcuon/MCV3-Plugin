/**
 * mc-checkpoint.ts — Tool: mc_checkpoint
 *
 * Lưu checkpoint trạng thái hiện tại của dự án vào .mc-data/_mcv3-work/
 * Dùng để:
 *   - Lưu tiến độ giữa các session
 *   - Tạo restore point trước khi thực hiện thay đổi lớn
 *   - Auto-save khi kết thúc session (gọi từ hook)
 *
 * File checkpoint: _mcv3-work/_checkpoint.md (latest)
 *                  _mcv3-work/_snapshots/{timestamp}-{label}.md (versioned)
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 21 — Checkpoint Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_checkpoint */
export interface McCheckpointParams {
    /** Slug dự án */
    projectSlug: string;
    /** Nhãn mô tả checkpoint (VD: "sau-discovery", "truoc-expert-panel") */
    label?: string;
    /** Tóm tắt những gì đã làm trong session này */
    sessionSummary?: string;
    /** Danh sách việc cần làm tiếp theo */
    nextActions?: string[];
    /** Có lưu versioned snapshot không (default: true) */
    saveSnapshot?: boolean;
    /** Tiến độ code-gen theo module (Phase 7 IMPLEMENT/SCAFFOLD mode) */
    implementationProgress?: import('../types.js').ModuleProgress[];
}
/**
 * Thực thi tool mc_checkpoint
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcCheckpoint(params: McCheckpointParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-checkpoint.d.ts.map