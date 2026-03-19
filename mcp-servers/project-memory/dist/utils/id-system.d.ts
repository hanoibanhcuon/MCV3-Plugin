/**
 * id-system.ts — Hệ thống quản lý Formal IDs (BR-XXX, US-XXX, ...)
 *
 * Chức năng:
 * - Validate format của các ID (BR-SALES-001, US-INV-001, ...)
 * - Generate ID tiếp theo trong sequence
 * - Parse ID thành các thành phần
 *
 * Quy ước ID:
 *   [PREFIX]-[MODULE_CODE]-[SEQ]
 *   VD: BR-SALES-001, US-INV-001, TC-CRM-001
 *   Hoặc: PROB-001, BG-001 (không có module code)
 */
/** Tất cả prefix hợp lệ trong Formal ID System */
export declare const VALID_PREFIXES: readonly ["PROB", "PAIN", "BG", "PG", "BR", "UJ", "TERM", "ENT", "ENUM", "US", "UC", "AC", "AP", "ADR", "FT", "API", "UI", "TBL", "INT", "NFR", "TC", "UAT", "CHG", "EVOL", "RISK", "MC"];
export type IdPrefix = typeof VALID_PREFIXES[number];
/** Kết quả parse một ID */
export interface ParsedId {
    /** Prefix (BR, US, FT, ...) */
    prefix: IdPrefix;
    /** Module code (SALES, INV, CRM, ...) — có thể không có */
    moduleCode?: string;
    /** Số thứ tự (001, 002, ...) */
    sequence: number;
    /** ID đầy đủ ban đầu */
    raw: string;
}
/**
 * Kiểm tra xem một chuỗi có phải Formal ID hợp lệ không
 *
 * Format hợp lệ:
 *   PROB-001          (không có module code)
 *   BR-SALES-001      (có module code)
 *   UC-INV-001-01     (có sub-sequence)
 *   UI-INV-STOCK-LIST (UI với tên màn hình)
 */
export declare function isValidId(id: string): boolean;
/**
 * Parse Formal ID thành các thành phần
 * @returns ParsedId hoặc null nếu format không hợp lệ
 */
export declare function parseId(id: string): ParsedId | null;
/**
 * Generate ID tiếp theo trong sequence
 *
 * Ví dụ:
 *   generateNextId('BR', 'SALES', 3)  → 'BR-SALES-003'
 *   generateNextId('PROB', undefined, 5) → 'PROB-005'
 */
export declare function generateNextId(prefix: IdPrefix, moduleCode: string | undefined, sequence: number): string;
/**
 * Trích xuất tất cả Formal IDs trong một đoạn văn bản
 * Hữu ích để scan document tìm ID đã dùng
 */
export declare function extractIdsFromText(text: string): string[];
/**
 * Validate xem sequence number có nằm trong range đúng cho BR không
 * BR-{DOM}-001..009: Validation
 * BR-{DOM}-010..019: Calculation
 * BR-{DOM}-020..029: Workflow
 * BR-{DOM}-030..039: Authorization
 * BR-{DOM}-040..049: Constraints
 */
export declare function getBrCategory(sequence: number): string;
//# sourceMappingURL=id-system.d.ts.map