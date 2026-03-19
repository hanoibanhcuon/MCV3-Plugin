/**
 * mc-search.ts — Tool: mc_search
 *
 * Tìm kiếm trong project memory:
 *   - Full-text search qua nội dung tài liệu
 *   - Tìm theo Formal ID (BR-XXX, US-XXX, ...)
 *   - Tìm theo từ khóa nghiệp vụ
 *   - Trả về danh sách files và đoạn text liên quan (context snippet)
 *
 * Output:
 *   - Danh sách kết quả có sắp xếp theo relevance
 *   - Context snippet xung quanh match (3 dòng trước/sau)
 *   - Số lần match trong mỗi file
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Search Protocol
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_search */
export interface McSearchParams {
    /** Slug dự án */
    projectSlug: string;
    /** Từ khóa tìm kiếm (hỗ trợ nhiều từ phân cách bởi khoảng trắng) */
    query: string;
    /** Giới hạn số kết quả (default: 10) */
    maxResults?: number;
    /** Chỉ tìm trong thư mục con cụ thể (VD: "_PROJECT", "ERP") */
    searchIn?: string;
    /** Có phân biệt hoa thường không (default: false) */
    caseSensitive?: boolean;
    /** Số dòng context trước/sau mỗi match (default: 2) */
    contextLines?: number;
}
/**
 * Thực thi tool mc_search
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export declare function mcSearch(params: McSearchParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-search.d.ts.map