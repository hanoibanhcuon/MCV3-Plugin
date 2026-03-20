"use strict";
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
exports.mcSearch = mcSearch;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Search Logic ──────────────────────────────────────────────────────────
/**
 * Tìm kiếm trong nội dung 1 file
 * @returns Danh sách matches, hoặc null nếu không có
 */
function searchInContent(content, terms, caseSensitive, contextLines) {
    const lines = content.split('\n');
    const matches = [];
    // Chuẩn bị search terms
    const searchTerms = caseSensitive
        ? terms
        : terms.map(t => t.toLowerCase());
    for (let i = 0; i < lines.length; i++) {
        const line = caseSensitive ? lines[i] : lines[i].toLowerCase();
        // Kiểm tra tất cả terms đều có trong dòng (AND logic)
        const allMatch = searchTerms.every(term => line.includes(term));
        if (!allMatch)
            continue;
        // Lấy context
        const start = Math.max(0, i - contextLines);
        const end = Math.min(lines.length - 1, i + contextLines);
        matches.push({
            lineNumber: i + 1,
            matchLine: lines[i],
            contextBefore: lines.slice(start, i),
            contextAfter: lines.slice(i + 1, end + 1),
        });
    }
    return matches;
}
/**
 * Tính relevance score dựa trên số matches và vị trí trong file
 */
function calculateRelevance(matches, filePath) {
    let score = matches.length * 10;
    // File trong _PROJECT được ưu tiên cao hơn
    if (filePath.includes('_PROJECT'))
        score += 5;
    // Match trong tiêu đề (dòng đầu) được ưu tiên cao hơn
    if (matches.some(m => m.lineNumber <= 5))
        score += 3;
    return score;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_search
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcSearch(params, projectRoot) {
    // ── Validate ──────────────────────────────────────────────────────────
    if (!params.projectSlug || !params.query || params.query.trim() === '') {
        return {
            success: false,
            message: 'Thiếu projectSlug hoặc query',
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
    try {
        // ── Đọc config ────────────────────────────────────────────────────────
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        // ── Chuẩn bị search ───────────────────────────────────────────────────
        const maxResults = params.maxResults || 10;
        const caseSensitive = params.caseSensitive || false;
        const contextLines = params.contextLines ?? 2;
        // Tách query thành các terms (split by space, filter empty)
        const terms = params.query.trim().split(/\s+/).filter(Boolean);
        // ── Xác định thư mục tìm kiếm ─────────────────────────────────────────
        const searchRoot = params.searchIn
            ? path.join(projectPath, params.searchIn)
            : projectPath;
        if (!(await (0, file_io_js_1.exists)(searchRoot))) {
            return {
                success: false,
                message: `Thư mục tìm kiếm không tồn tại: ${params.searchIn}`,
                error: 'SEARCH_PATH_NOT_FOUND',
            };
        }
        // ── Liệt kê tất cả .md files ──────────────────────────────────────────
        const allFiles = await (0, file_io_js_1.listFiles)(searchRoot, searchRoot);
        const searchFiles = allFiles.filter(f => !f.includes('_mcv3-work') &&
            !f.startsWith('_changelog') &&
            f.endsWith('.md'));
        // ── Tìm kiếm trong từng file ──────────────────────────────────────────
        const results = [];
        for (const relativePath of searchFiles) {
            const fullPath = path.join(searchRoot, relativePath);
            const content = await (0, file_io_js_1.readFile)(fullPath);
            if (!content)
                continue;
            const matches = searchInContent(content, terms, caseSensitive, contextLines);
            if (matches.length === 0)
                continue;
            const displayPath = params.searchIn
                ? path.join(params.searchIn, relativePath).replace(/\\/g, '/')
                : relativePath;
            results.push({
                filePath: displayPath,
                matchCount: matches.length,
                relevanceScore: calculateRelevance(matches, displayPath),
                matches: matches.slice(0, 3), // Giới hạn 3 matches đầu per file để output gọn
            });
        }
        // ── Sort và limit kết quả ────────────────────────────────────────────
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        const topResults = results.slice(0, maxResults);
        // ── Format output ────────────────────────────────────────────────────
        const projectName = config?.name || params.projectSlug;
        let message = `🔍 Tìm "${params.query}" trong dự án "${projectName}": ${results.length} files có kết quả`;
        if (topResults.length === 0) {
            message = `🔍 Không tìm thấy "${params.query}" trong dự án "${projectName}"`;
        }
        else {
            // Format kết quả
            const resultLines = ['\n\n**Kết quả tìm kiếm:**\n'];
            for (const result of topResults) {
                resultLines.push(`\n### 📄 ${result.filePath} (${result.matchCount} matches)\n`);
                for (const match of result.matches) {
                    if (match.contextBefore.length > 0) {
                        resultLines.push(match.contextBefore.map(l => `  ${l}`).join('\n'));
                    }
                    resultLines.push(`→ **[Dòng ${match.lineNumber}]** ${match.matchLine}`);
                    if (match.contextAfter.length > 0) {
                        resultLines.push(match.contextAfter.map(l => `  ${l}`).join('\n'));
                    }
                    resultLines.push('');
                }
            }
            if (results.length > maxResults) {
                resultLines.push(`\n_...và ${results.length - maxResults} files khác. Dùng searchIn để lọc hẹp hơn._`);
            }
            message += resultLines.join('\n');
        }
        return {
            success: true,
            message,
            data: {
                query: params.query,
                totalFiles: results.length,
                results: topResults.map(r => ({
                    filePath: r.filePath,
                    matchCount: r.matchCount,
                    topMatch: r.matches[0]?.matchLine || '',
                })),
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi search: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-search.js.map