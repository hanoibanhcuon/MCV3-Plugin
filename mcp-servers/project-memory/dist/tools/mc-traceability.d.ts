/**
 * mc-traceability.ts — Tool: mc_traceability
 *
 * Quản lý traceability matrix cho dự án MCV3.
 * Traceability chain: PROB → BR → US → FT → API/TBL → TC
 *
 * Dùng để:
 *   - Đăng ký IDs mới (register)
 *   - Link IDs với nhau (link)
 *   - Query traceability chain (query)
 *   - Kiểm tra gaps trong traceability (check)
 *   - Xuất traceability matrix (export)
 *
 * Data lưu tại: .mc-data/projects/{slug}/_mcv3-work/_traceability.json
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 23 — Traceability
 */
import type { ToolResult } from '../types.js';
/** Tham số cho mc_traceability */
export interface McTraceabilityParams {
    /** Slug dự án */
    projectSlug: string;
    /** Hành động: register (đăng ký IDs), link (liên kết), query (hỏi), check (kiểm tra gaps), export (xuất matrix) */
    action: 'register' | 'link' | 'query' | 'check' | 'export';
    /** File source (dùng với register) */
    source?: string;
    /** Danh sách IDs cần đăng ký (dùng với register) */
    ids?: string[];
    /** Các link cần tạo (dùng với link) */
    items?: Array<{
        from: string;
        to: string;
    }>;
    /** ID cần query (dùng với query) */
    queryId?: string;
    /** Hướng query: forward (từ BR xuống) hoặc backward (từ TC lên) */
    direction?: 'forward' | 'backward' | 'both';
}
/**
 * Thực thi tool mc_traceability
 */
export declare function mcTraceability(params: McTraceabilityParams, projectRoot: string): Promise<ToolResult>;
//# sourceMappingURL=mc-traceability.d.ts.map