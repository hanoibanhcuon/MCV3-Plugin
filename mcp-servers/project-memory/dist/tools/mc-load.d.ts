/**
 * mc-load.ts — Tool: mc_load
 *
 * Đọc artifact từ project memory với Smart Context Layering support.
 *
 * Layer support (theo kiến trúc MCV3 v3.1 Section 5.2):
 *   Layer 0: Đọc file _key-facts.md (~ 500 bytes)
 *   Layer 1: Chỉ đọc phần DEPENDENCY MAP trong tài liệu (~200 bytes)
 *   Layer 2: Đọc các sections liên quan (~5-10KB) — dùng headers
 *   Layer 3: Đọc toàn bộ file (default)
 */
import type { McLoadParams, ToolResult } from '../types.js';
/**
 * Thực thi tool mc_load
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 * @returns ToolResult với content đã load
 */
export declare function mcLoad(params: McLoadParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-load.d.ts.map