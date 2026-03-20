"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_PREFIXES = void 0;
exports.isValidId = isValidId;
exports.parseId = parseId;
exports.generateNextId = generateNextId;
exports.extractIdsFromText = extractIdsFromText;
exports.getBrCategory = getBrCategory;
// ─── Bảng PREFIX hợp lệ ───────────────────────────────────────────────────
/** Tất cả prefix hợp lệ trong Formal ID System */
exports.VALID_PREFIXES = [
    // Phase 1-3: Nghiệp vụ
    'PROB', 'PAIN', 'BG', 'PG', 'BR', 'UJ', 'TERM', 'ENT', 'ENUM',
    // Phase 4: Requirements
    'US', 'UC', 'AC',
    // Phase 5: Design
    'AP', 'ADR', 'FT', 'API', 'UI', 'TBL', 'INT', 'NFR',
    // Phase 6: QA
    'TC', 'TP', 'UAT',
    // Sprint 4 — Lifecycle
    'CHG', 'EVOL',
    // Embedded/Firmware (Batch B)
    'PIN', 'PERIPH', 'TASK', 'SM', 'MSG',
    // Khác
    'RISK', 'MC',
];
// ─── Validation ──────────────────────────────────────────────────────────
/**
 * Kiểm tra xem một chuỗi có phải Formal ID hợp lệ không
 *
 * Format hợp lệ:
 *   PROB-001          (không có module code)
 *   BR-SALES-001      (có module code)
 *   UC-INV-001-01     (có sub-sequence)
 *   UI-INV-STOCK-LIST (UI với tên màn hình)
 */
function isValidId(id) {
    if (!id || typeof id !== 'string')
        return false;
    // Pattern: PREFIX-[MODULECODE-]NNN[NNN...] — dùng VALID_PREFIXES để tránh lệch nhau
    const prefixList = exports.VALID_PREFIXES.join('|');
    const pattern = new RegExp(`^(${prefixList})-[A-Z0-9][A-Z0-9-]*$`);
    return pattern.test(id);
}
/**
 * Parse Formal ID thành các thành phần
 * @returns ParsedId hoặc null nếu format không hợp lệ
 */
function parseId(id) {
    if (!isValidId(id))
        return null;
    const parts = id.split('-');
    const prefix = parts[0];
    // ID không có module code: PROB-001, BG-001, NFR-001, CHG-001, EVOL-001
    const prefixesWithoutModule = ['PROB', 'BG', 'PG', 'AP', 'ADR', 'UJ', 'RISK', 'NFR', 'CHG', 'EVOL', 'MC'];
    if (prefixesWithoutModule.includes(prefix)) {
        const seq = parseInt(parts[1], 10);
        return {
            prefix,
            sequence: isNaN(seq) ? 0 : seq,
            raw: id,
        };
    }
    // ID có module code: BR-SALES-001
    if (parts.length >= 3) {
        const moduleCode = parts[1];
        const seq = parseInt(parts[2], 10);
        return {
            prefix,
            moduleCode,
            sequence: isNaN(seq) ? 0 : seq,
            raw: id,
        };
    }
    return null;
}
/**
 * Generate ID tiếp theo trong sequence
 *
 * Ví dụ:
 *   generateNextId('BR', 'SALES', 3)  → 'BR-SALES-003'
 *   generateNextId('PROB', undefined, 5) → 'PROB-005'
 */
function generateNextId(prefix, moduleCode, sequence) {
    // Số thứ tự luôn 3 chữ số: 001, 010, 100
    const seqStr = String(sequence).padStart(3, '0');
    if (moduleCode) {
        return `${prefix}-${moduleCode.toUpperCase()}-${seqStr}`;
    }
    return `${prefix}-${seqStr}`;
}
/**
 * Trích xuất tất cả Formal IDs trong một đoạn văn bản
 * Hữu ích để scan document tìm ID đã dùng
 */
function extractIdsFromText(text) {
    // Dùng VALID_PREFIXES để đảm bảo luôn đồng bộ với bảng prefix
    const prefixList = exports.VALID_PREFIXES.join('|');
    const pattern = new RegExp(`\\b(${prefixList})-[A-Z0-9][A-Z0-9-]*\\b`, 'g');
    const matches = text.match(pattern) || [];
    return [...new Set(matches)]; // Unique
}
/**
 * Validate xem sequence number có nằm trong range đúng cho BR không
 * BR-{DOM}-001..009: Validation
 * BR-{DOM}-010..019: Calculation
 * BR-{DOM}-020..029: Workflow
 * BR-{DOM}-030..039: Authorization
 * BR-{DOM}-040..049: Constraints
 */
function getBrCategory(sequence) {
    if (sequence >= 1 && sequence <= 9)
        return 'Validation';
    if (sequence >= 10 && sequence <= 19)
        return 'Calculation';
    if (sequence >= 20 && sequence <= 29)
        return 'Workflow';
    if (sequence >= 30 && sequence <= 39)
        return 'Authorization';
    if (sequence >= 40 && sequence <= 49)
        return 'Constraints';
    if (sequence >= 50 && sequence <= 99)
        return 'Custom';
    // Sequence vượt quá range chuẩn (001-049) — vẫn hợp lệ nhưng không thuộc category tiêu chuẩn
    return 'Unknown/Extended';
}
//# sourceMappingURL=id-system.js.map