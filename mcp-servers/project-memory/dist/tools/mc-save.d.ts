/**
 * mc-save.ts — Tool: mc_save
 *
 * Lưu artifact (tài liệu Markdown) vào project memory (.mc-data/).
 * Tự động:
 * - Tạo thư mục nếu chưa tồn tại
 * - Cập nhật _changelog.md
 * - Cập nhật timestamp trong _config.json
 *
 * Đường dẫn file: .mc-data/projects/{slug}/{filePath}
 * VD: filePath = "_PROJECT/PROJECT-OVERVIEW.md"
 *     → .mc-data/projects/abc-xyz/_PROJECT/PROJECT-OVERVIEW.md
 */
import type { McSaveParams, ToolResult } from '../types.js';
/**
 * Thực thi tool mc_save
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 * @returns ToolResult
 */
export declare function mcSave(params: McSaveParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-save.d.ts.map