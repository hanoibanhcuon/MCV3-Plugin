/**
 * mc-init.ts — Tool: mc_init_project
 *
 * Khởi tạo dự án MCV3 mới:
 * 1. Tạo cấu trúc thư mục .mc-data/ theo spec kiến trúc v3.1
 * 2. Tạo MASTER-INDEX.md từ template
 * 3. Lưu _config.json
 * 4. Tạo _mcv3-work/_checkpoint.md ban đầu
 *
 * Output: .mc-data/projects/{slug}/ với đầy đủ cấu trúc folder
 */
import type { McInitParams, InitResult } from '../types.js';
/**
 * Thực thi tool mc_init_project
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án (thư mục người dùng đang làm việc)
 * @returns InitResult với thông tin dự án đã tạo
 */
export declare function mcInitProject(params: McInitParams, projectRoot: string): Promise<InitResult>;
//# sourceMappingURL=mc-init.d.ts.map