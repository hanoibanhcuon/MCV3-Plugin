/**
 * mc-list.ts — Tool: mc_list
 *
 * Liệt kê tài liệu trong project memory.
 * Hỗ trợ lọc theo:
 * - Thư mục con (subPath): "_PROJECT", "ERP/P2-DESIGN", ...
 * - Loại tài liệu (documentType): "modspec", "urs", ...
 *
 * Output: Danh sách DocumentMeta với path, type, size, timestamps
 */
import type { McListParams, ListResult } from '../types.js';
/**
 * Thực thi tool mc_list
 */
export declare function mcList(params: McListParams, projectRoot: string): Promise<ListResult>;
//# sourceMappingURL=mc-list.d.ts.map