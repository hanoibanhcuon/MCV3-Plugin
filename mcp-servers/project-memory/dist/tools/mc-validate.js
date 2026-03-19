"use strict";
/**
 * mc-validate.ts — Tool: mc_validate
 *
 * Validate format và completeness của tài liệu MCV3:
 *   - Kiểm tra Formal ID format (BR-XXX, US-XXX, ...)
 *   - Kiểm tra sections bắt buộc có đầy đủ không
 *   - Kiểm tra placeholder chưa được điền
 *   - Validate cross-references giữa các IDs
 *
 * Trả về danh sách issues (errors + warnings) theo mức độ:
 *   - ERROR: Bắt buộc phải sửa trước khi sang phase tiếp
 *   - WARNING: Nên sửa, không block
 *   - INFO: Gợi ý cải thiện
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 5 — Formal ID System
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcValidate = mcValidate;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Formal ID Patterns ────────────────────────────────────────────────────
/** Các patterns Formal ID hợp lệ trong MCV3 */
const VALID_ID_PATTERNS = [
    /\bBR-[A-Z]+-\d{3}\b/g, // Business Rule: BR-INV-001
    /\bUS-[A-Z]+-\d{3}\b/g, // User Story: US-INV-001
    /\bUC-[A-Z]+-\d{3}-\d{2}\b/g, // Use Case: UC-INV-001-01
    /\bAC-[A-Z]+-\d{3}-\d{2}\b/g, // Acceptance Criteria: AC-INV-001-01
    /\bFT-[A-Z]+-\d{3}\b/g, // Feature: FT-INV-001
    /\bTC-[A-Z]+-\d{3}\b/g, // Test Case: TC-INV-001
    /\bTBL-[A-Z]+-\d{3}\b/g, // DB Table: TBL-ERP-001
    /\bAPI-[A-Z]+-\d{3}\b/g, // API: API-ERP-001
    /\bINT-[A-Z]+-\d{3}\b/g, // Integration: INT-ERP-001
    /\bNFR-\d{3}\b/g, // Non-Functional: NFR-001
    /\bPROB-\d{3}\b/g, // Problem: PROB-001
    /\bBG-[A-Z]+-\d{3}\b/g, // Background: BG-BUS-001
];
/** Placeholder patterns cần được điền */
const PLACEHOLDER_PATTERNS = [
    /\[TÊN\s/gi,
    /\[NGÀY\]/gi,
    /\[XXX\]/g,
    /TODO:/gi,
    /PLACEHOLDER/gi,
    /\{{\s*[\w_]+\s*}}/g, // Template variables chưa điền: {{variable}}
];
/** Sections bắt buộc theo loại tài liệu */
const REQUIRED_SECTIONS = {
    'PROJECT-OVERVIEW': [
        'BỐI CẢNH', 'VẤN ĐỀ', 'MỤC TIÊU', 'PHẠM VI',
    ],
    'EXPERT-LOG': [
        'SESSION', 'PHÂN TÍCH', 'KẾT LUẬN',
    ],
    'BIZ-POLICY': [
        'BUSINESS RULES', 'BR-',
    ],
    'PROCESS': [
        'AS-IS', 'TO-BE',
    ],
    'URS': [
        'USER STORIES', 'US-', 'ACCEPTANCE CRITERIA',
    ],
    'MODSPEC': [
        'DEPENDENCY MAP', 'BUSINESS RULES', 'FEATURES', 'API CONTRACTS',
    ],
    'TEST': [
        'TEST CASES', 'TC-',
    ],
};
// ─── Validate Functions ────────────────────────────────────────────────────
/**
 * Validate format cơ bản của tài liệu Markdown
 */
function validateFormat(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    // Kiểm tra tiêu đề cấp 1 tồn tại
    const hasH1 = lines.some(l => l.startsWith('# '));
    if (!hasH1) {
        issues.push({
            severity: 'ERROR',
            type: 'FORMAT_NO_H1',
            message: 'Tài liệu thiếu tiêu đề cấp 1 (# Title)',
            suggestion: 'Thêm dòng đầu tiên: # [Tên tài liệu]',
        });
    }
    // Kiểm tra AI NAVIGATION GUIDE hoặc DEPENDENCY MAP
    const hasNavGuide = content.includes('DEPENDENCY MAP') ||
        content.includes('AI NAVIGATION') ||
        content.includes('## DEPENDENCIES');
    if (!hasNavGuide && !filePath.includes('_PROJECT/PROJECT-OVERVIEW')) {
        issues.push({
            severity: 'WARNING',
            type: 'FORMAT_NO_NAV_GUIDE',
            message: 'Thiếu DEPENDENCY MAP section giúp AI hiểu ngữ cảnh',
            suggestion: 'Thêm section "## DEPENDENCY MAP" ở đầu tài liệu',
        });
    }
    // Kiểm tra placeholder chưa điền
    for (let i = 0; i < lines.length; i++) {
        for (const pattern of PLACEHOLDER_PATTERNS) {
            if (pattern.test(lines[i])) {
                issues.push({
                    severity: 'WARNING',
                    type: 'FORMAT_PLACEHOLDER',
                    message: `Dòng ${i + 1}: Có placeholder chưa được điền`,
                    line: i + 1,
                    suggestion: 'Điền thông tin thực tế thay cho placeholder',
                });
                break; // Chỉ báo 1 issue per line
            }
        }
    }
    return issues;
}
/**
 * Validate Formal IDs trong tài liệu
 */
function validateIds(content) {
    const issues = [];
    // Kiểm tra có IDs nào không (tài liệu nghiệp vụ nên có ít nhất vài IDs)
    let totalIds = 0;
    for (const pattern of VALID_ID_PATTERNS) {
        const matches = content.match(pattern);
        if (matches)
            totalIds += matches.length;
    }
    // Tài liệu dài mà không có ID nào → warning
    if (totalIds === 0 && content.length > 500) {
        issues.push({
            severity: 'WARNING',
            type: 'IDS_NONE_FOUND',
            message: 'Tài liệu không có Formal IDs nào (BR-XXX, US-XXX, ...)',
            suggestion: 'Thêm Formal IDs để traceability. VD: BR-INV-001: Tên quy tắc',
        });
    }
    // Kiểm tra format IDs không hợp lệ (có dạng BR- nhưng không đúng format)
    const invalidBRPattern = /\bBR-[^A-Z\s]/g;
    const invalidMatches = content.match(invalidBRPattern);
    if (invalidMatches) {
        issues.push({
            severity: 'WARNING',
            type: 'IDS_INVALID_FORMAT',
            message: `Có ${invalidMatches.length} ID có thể không đúng format`,
            suggestion: 'Format đúng: BR-[DOMAIN]-[NNN] (VD: BR-INV-001)',
        });
    }
    return issues;
}
/**
 * Validate completeness: kiểm tra sections bắt buộc
 */
function validateCompleteness(content, filePath) {
    const issues = [];
    const filename = path.basename(filePath, '.md').toUpperCase();
    // Tìm loại template dựa trên tên file
    let templateType = null;
    for (const key of Object.keys(REQUIRED_SECTIONS)) {
        if (filename.includes(key)) {
            templateType = key;
            break;
        }
    }
    if (!templateType)
        return issues;
    // Kiểm tra từng section bắt buộc
    const requiredSecs = REQUIRED_SECTIONS[templateType] || [];
    for (const section of requiredSecs) {
        if (!content.toUpperCase().includes(section.toUpperCase())) {
            issues.push({
                severity: 'WARNING',
                type: 'COMPLETENESS_MISSING_SECTION',
                message: `Thiếu section bắt buộc: "${section}"`,
                suggestion: `Thêm section "## ${section}" vào tài liệu`,
            });
        }
    }
    return issues;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_validate
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcValidate(params, projectRoot) {
    // ── Validate params ───────────────────────────────────────────────────
    if (!params.projectSlug || !params.filePath) {
        return {
            success: false,
            message: 'Thiếu projectSlug hoặc filePath',
            error: 'INVALID_PARAMS',
        };
    }
    const fullPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug, params.filePath);
    // Kiểm tra file tồn tại
    if (!(await (0, file_io_js_1.exists)(fullPath))) {
        return {
            success: false,
            message: `File không tồn tại: ${params.filePath}`,
            error: 'FILE_NOT_FOUND',
        };
    }
    try {
        // ── Đọc nội dung file ────────────────────────────────────────────────
        const content = await (0, file_io_js_1.readFile)(fullPath);
        if (!content) {
            return {
                success: false,
                message: 'File trống',
                error: 'EMPTY_FILE',
            };
        }
        // ── Chạy validations ─────────────────────────────────────────────────
        const validationType = params.validationType || 'all';
        const allIssues = [];
        if (validationType === 'format' || validationType === 'all') {
            allIssues.push(...validateFormat(content, params.filePath));
        }
        if (validationType === 'ids' || validationType === 'all') {
            allIssues.push(...validateIds(content));
        }
        if (validationType === 'completeness' || validationType === 'all') {
            allIssues.push(...validateCompleteness(content, params.filePath));
        }
        // ── Tổng hợp kết quả ─────────────────────────────────────────────────
        const result = {
            filePath: params.filePath,
            isValid: allIssues.filter(i => i.severity === 'ERROR').length === 0,
            errorCount: allIssues.filter(i => i.severity === 'ERROR').length,
            warningCount: allIssues.filter(i => i.severity === 'WARNING').length,
            infoCount: allIssues.filter(i => i.severity === 'INFO').length,
            issues: allIssues,
        };
        // ── Format message ────────────────────────────────────────────────────
        const statusIcon = result.isValid ? '✅' : '❌';
        let message = `${statusIcon} Validate "${params.filePath}": `;
        message += `${result.errorCount} errors, ${result.warningCount} warnings`;
        if (allIssues.length > 0) {
            const issueLines = allIssues.map(i => `  [${i.severity}] ${i.type}: ${i.message}${i.suggestion ? ` → ${i.suggestion}` : ''}`);
            message += '\n\n' + issueLines.join('\n');
        }
        else {
            message += '\n\n✨ Tài liệu hợp lệ!';
        }
        return {
            success: result.isValid,
            message,
            data: result,
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi validate: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-validate.js.map