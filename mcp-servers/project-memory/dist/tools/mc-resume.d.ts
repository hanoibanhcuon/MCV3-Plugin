/**
 * mc-resume.ts — Tool: mc_resume
 *
 * Load checkpoint và trả về context để resume session.
 * Thường được gọi khi:
 *   - Bắt đầu session mới với dự án đang làm dở
 *   - Sau khi context window bị compact
 *   - Muốn xem lại trạng thái cuối cùng
 *
 * Kết quả trả về:
 *   - Nội dung checkpoint (tóm tắt + next actions)
 *   - Key facts của dự án (layer 0)
 *   - Phase hiện tại và gợi ý bước tiếp theo
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 21 — Resume Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_resume */
export interface McResumeParams {
    /** Slug dự án cần resume */
    projectSlug: string;
    /** Tên snapshot cụ thể (nếu không truyền → dùng latest checkpoint) */
    snapshotName?: string;
    /** Có bao gồm key-facts không (default: true) */
    includeKeyFacts?: boolean;
}
/**
 * Thực thi tool mc_resume
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcResume(params: McResumeParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-resume.d.ts.map