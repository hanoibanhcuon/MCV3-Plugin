"use strict";
/**
 * mc-merge.ts — Tool: mc_merge
 *
 * Merge nội dung từ nhiều sources vào một document.
 * Dùng khi nhiều agents cùng tạo output cho cùng một document
 * (VD: Domain Expert + Finance Expert → EXPERT-LOG.md).
 *
 * Modes:
 *   - append: Thêm content vào cuối document hiện có
 *   - section: Merge vào một section cụ thể (tìm theo heading)
 *   - replace-section: Thay thế nội dung một section
 *   - smart: Tự phát hiện section và merge thông minh
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
exports.mcMerge = mcMerge;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Section Helpers ──────────────────────────────────────────────────────
/**
 * Tìm vị trí section trong document
 * Trả về { start, end } — indexes của lines
 */
function findSectionBounds(lines, sectionName) {
    // Tìm heading chứa sectionName
    const pattern = new RegExp(`^#+\\s+.*${escapeRegex(sectionName)}`, 'i');
    let startIndex = -1;
    let headingLevel = 0;
    for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
            startIndex = i;
            // Tính level của heading (#, ##, ###, ...)
            const match = lines[i].match(/^(#+)/);
            headingLevel = match ? match[1].length : 1;
            break;
        }
    }
    if (startIndex === -1)
        return null;
    // Tìm end: đến heading cùng level hoặc cao hơn
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
        const match = lines[i].match(/^(#+)\s/);
        if (match && match[1].length <= headingLevel) {
            endIndex = i;
            break;
        }
    }
    return { start: startIndex, end: endIndex };
}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Smart merge: Phát hiện sections trong content mới và merge từng section
 */
function smartMerge(existingContent, newContent) {
    const existingLines = existingContent.split('\n');
    let result = [...existingLines];
    // Tìm tất cả headings trong new content
    const newLines = newContent.split('\n');
    let currentSectionStart = -1;
    let currentSectionName = '';
    let currentSectionLevel = 0;
    const sections = [];
    for (let i = 0; i < newLines.length; i++) {
        const match = newLines[i].match(/^(#+)\s+(.+)/);
        if (match) {
            // Lưu section trước nếu có
            if (currentSectionStart >= 0) {
                sections.push({
                    name: currentSectionName,
                    level: currentSectionLevel,
                    lines: newLines.slice(currentSectionStart, i),
                });
            }
            currentSectionStart = i;
            currentSectionLevel = match[1].length;
            currentSectionName = match[2];
        }
    }
    // Lưu section cuối
    if (currentSectionStart >= 0) {
        sections.push({
            name: currentSectionName,
            level: currentSectionLevel,
            lines: newLines.slice(currentSectionStart),
        });
    }
    // Nếu không có sections (plain content), append
    if (sections.length === 0) {
        return existingContent + '\n\n' + newContent;
    }
    // Merge từng section
    for (const section of sections) {
        const bounds = findSectionBounds(result, section.name);
        if (bounds) {
            // Section đã tồn tại → append vào cuối section
            const beforeSection = result.slice(0, bounds.end);
            const afterSection = result.slice(bounds.end);
            result = [
                ...beforeSection,
                '',
                ...section.lines.slice(1), // Bỏ heading của new section
                ...afterSection,
            ];
        }
        else {
            // Section chưa tồn tại → append vào cuối document
            result = [...result, '', ...section.lines];
        }
    }
    return result.join('\n');
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_merge
 */
async function mcMerge(params, projectRoot) {
    if (!params.projectSlug || !params.targetFile || !params.content) {
        return {
            success: false,
            message: 'Thiếu projectSlug, targetFile hoặc content',
            error: 'INVALID_PARAMS',
        };
    }
    const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);
    if (!(await (0, file_io_js_1.exists)(projectPath))) {
        return {
            success: false,
            message: `Dự án "${params.projectSlug}" không tồn tại`,
            error: 'PROJECT_NOT_FOUND',
        };
    }
    const targetPath = path.join(projectPath, params.targetFile);
    const mode = params.mode || 'append';
    try {
        // ── Đọc hoặc tạo document target ────────────────────────────────
        let existingContent;
        if (await (0, file_io_js_1.exists)(targetPath)) {
            existingContent = await (0, file_io_js_1.readFile)(targetPath) || '';
        }
        else if (params.createIfNotExists) {
            existingContent = '';
        }
        else {
            return {
                success: false,
                message: `File "${params.targetFile}" không tồn tại. Dùng createIfNotExists: true để tạo mới.`,
                error: 'FILE_NOT_FOUND',
            };
        }
        // ── Thêm source label nếu có ─────────────────────────────────────
        const contentToMerge = params.sourceLabel
            ? `\n<!-- Merged from: ${params.sourceLabel} on ${new Date().toISOString()} -->\n${params.content}`
            : params.content;
        // ── Thực hiện merge theo mode ─────────────────────────────────────
        let mergedContent;
        switch (mode) {
            case 'append':
                mergedContent = existingContent
                    ? existingContent.trimEnd() + '\n\n---\n\n' + contentToMerge.trimStart()
                    : contentToMerge;
                break;
            case 'section': {
                if (!params.sectionName) {
                    return {
                        success: false,
                        message: 'Cần truyền sectionName khi mode=section',
                        error: 'INVALID_PARAMS',
                    };
                }
                const lines = existingContent.split('\n');
                const bounds = findSectionBounds(lines, params.sectionName);
                if (!bounds) {
                    // Section không tồn tại → append
                    mergedContent = existingContent + '\n\n' + contentToMerge;
                }
                else {
                    // Insert content vào cuối section
                    const before = lines.slice(0, bounds.end);
                    const after = lines.slice(bounds.end);
                    mergedContent = [...before, '', contentToMerge, ...after].join('\n');
                }
                break;
            }
            case 'replace-section': {
                if (!params.sectionName) {
                    return {
                        success: false,
                        message: 'Cần truyền sectionName khi mode=replace-section',
                        error: 'INVALID_PARAMS',
                    };
                }
                const lines = existingContent.split('\n');
                const bounds = findSectionBounds(lines, params.sectionName);
                if (!bounds) {
                    // Section không tồn tại → append
                    mergedContent = existingContent + '\n\n' + contentToMerge;
                }
                else {
                    // Thay thế toàn bộ section
                    const before = lines.slice(0, bounds.start);
                    const after = lines.slice(bounds.end);
                    mergedContent = [...before, contentToMerge, ...after].join('\n');
                }
                break;
            }
            case 'smart':
                mergedContent = smartMerge(existingContent, contentToMerge);
                break;
            default:
                mergedContent = existingContent + '\n\n' + contentToMerge;
        }
        // ── Lưu kết quả ──────────────────────────────────────────────────
        await (0, file_io_js_1.writeFile)(targetPath, mergedContent);
        return {
            success: true,
            message: `✅ Merge thành công vào "${params.targetFile}" (mode: ${mode})`,
            data: {
                targetFile: params.targetFile,
                mode,
                originalSize: existingContent.length,
                mergedSize: mergedContent.length,
                sectionName: params.sectionName,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi merge: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-merge.js.map