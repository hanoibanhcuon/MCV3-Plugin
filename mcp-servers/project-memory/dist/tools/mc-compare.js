"use strict";
/**
 * mc-compare.ts — Tool: mc_compare
 *
 * So sánh 2 versions của một document hoặc 2 documents khác nhau.
 * Hỗ trợ diff theo line và theo section.
 *
 * Dùng để:
 *   - So sánh document hiện tại với snapshot trước
 *   - So sánh 2 modules khác nhau để phát hiện inconsistencies
 *   - Review thay đổi trước khi commit
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
exports.mcCompare = mcCompare;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Diff Algorithm ────────────────────────────────────────────────────────
/**
 * Simple line-based diff (Longest Common Subsequence approach)
 * Trả về array of diff hunks
 */
function lineDiff(contentA, contentB, contextLines) {
    const linesA = contentA.split('\n');
    const linesB = contentB.split('\n');
    // LCS để tìm common lines
    const n = linesA.length;
    const m = linesB.length;
    // Build LCS table (chỉ dùng cho diff nhỏ, giới hạn 500 lines mỗi file)
    const maxLines = 500;
    if (n > maxLines || m > maxLines) {
        // Fallback: simple block diff
        return simpleBlockDiff(linesA, linesB, contextLines);
    }
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (linesA[i - 1] === linesB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    // Backtrack để tạo diff
    const hunks = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
            hunks.unshift({ type: 'same', line: linesA[i - 1], lineA: i, lineB: j });
            i--;
            j--;
        }
        else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            hunks.unshift({ type: 'added', line: linesB[j - 1], lineB: j });
            j--;
        }
        else {
            hunks.unshift({ type: 'removed', line: linesA[i - 1], lineA: i });
            i--;
        }
    }
    // Format hunks với context
    const output = [];
    let lastDiffIndex = -1;
    const diffIndices = hunks
        .map((h, idx) => h.type !== 'same' ? idx : -1)
        .filter(idx => idx >= 0);
    if (diffIndices.length === 0) {
        return '✅ Hai documents giống hệt nhau (không có sự khác biệt)';
    }
    // Group hunks thành chunks với context
    const displayedIndices = new Set();
    for (const diffIdx of diffIndices) {
        const start = Math.max(0, diffIdx - contextLines);
        const end = Math.min(hunks.length - 1, diffIdx + contextLines);
        for (let k = start; k <= end; k++)
            displayedIndices.add(k);
    }
    let inGap = false;
    for (let k = 0; k < hunks.length; k++) {
        if (!displayedIndices.has(k)) {
            if (!inGap) {
                output.push('...');
                inGap = true;
            }
            continue;
        }
        inGap = false;
        const hunk = hunks[k];
        const lineRef = hunk.lineA !== undefined
            ? `L${hunk.lineA}`
            : `L${hunk.lineB}`;
        if (hunk.type === 'same') {
            output.push(`  ${lineRef.padEnd(5)} ${hunk.line}`);
        }
        else if (hunk.type === 'removed') {
            output.push(`- ${lineRef.padEnd(5)} ${hunk.line}`);
        }
        else {
            output.push(`+ ${lineRef.padEnd(5)} ${hunk.line}`);
        }
    }
    const addedCount = hunks.filter(h => h.type === 'added').length;
    const removedCount = hunks.filter(h => h.type === 'removed').length;
    return [
        `@@ +${addedCount} lines, -${removedCount} lines @@`,
        '',
        ...output,
    ].join('\n');
}
/**
 * Fallback diff cho files lớn — so sánh theo blocks 10 lines
 */
function simpleBlockDiff(linesA, linesB, contextLines) {
    const added = linesB.length - linesA.length;
    return [
        `⚠️ File lớn (>${500} lines) — hiển thị summary diff`,
        ``,
        `File A: ${linesA.length} lines`,
        `File B: ${linesB.length} lines`,
        `Thay đổi: ${added >= 0 ? '+' : ''}${added} lines`,
        ``,
        `Để diff chi tiết, hãy compare từng section cụ thể.`,
    ].join('\n');
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_compare
 */
async function mcCompare(params, projectRoot) {
    if (!params.projectSlug || !params.fileA || !params.fileB) {
        return {
            success: false,
            message: 'Thiếu projectSlug, fileA hoặc fileB',
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
        // ── Đọc content A ────────────────────────────────────────────────
        const pathA = path.join(projectPath, params.fileA);
        if (!(await (0, file_io_js_1.exists)(pathA))) {
            return {
                success: false,
                message: `File A không tồn tại: ${params.fileA}`,
                error: 'FILE_NOT_FOUND',
            };
        }
        const contentA = await (0, file_io_js_1.readFile)(pathA) || '';
        // ── Đọc content B ────────────────────────────────────────────────
        let contentB;
        let labelB;
        if (params.fileB.startsWith('@snapshot:') || params.snapshotName) {
            // Đọc từ snapshot bundle
            const snapshotName = params.snapshotName
                || params.fileB.replace('@snapshot:', '');
            const snapshotPath = path.join(projectPath, '_mcv3-work', '_snapshots', snapshotName);
            if (!(await (0, file_io_js_1.exists)(snapshotPath))) {
                return {
                    success: false,
                    message: `Snapshot không tồn tại: ${snapshotName}`,
                    error: 'SNAPSHOT_NOT_FOUND',
                };
            }
            const bundle = await (0, file_io_js_1.readJson)(snapshotPath);
            if (!bundle) {
                return {
                    success: false,
                    message: `Không đọc được snapshot: ${snapshotName}`,
                    error: 'SNAPSHOT_CORRUPT',
                };
            }
            const docInSnapshot = bundle.documents.find(d => d.path === params.fileA || d.path === params.fileB.replace('@snapshot:', ''));
            if (!docInSnapshot) {
                return {
                    success: false,
                    message: `File "${params.fileA}" không có trong snapshot "${snapshotName}"`,
                    error: 'FILE_NOT_IN_SNAPSHOT',
                };
            }
            contentB = docInSnapshot.content;
            labelB = `${snapshotName} [${bundle.meta.createdAt.split('T')[0]}]`;
        }
        else {
            // Đọc từ file thông thường
            const pathB = path.join(projectPath, params.fileB);
            if (!(await (0, file_io_js_1.exists)(pathB))) {
                return {
                    success: false,
                    message: `File B không tồn tại: ${params.fileB}`,
                    error: 'FILE_NOT_FOUND',
                };
            }
            contentB = await (0, file_io_js_1.readFile)(pathB) || '';
            labelB = params.fileB;
        }
        // ── Thực hiện diff ────────────────────────────────────────────────
        const contextLines = params.contextLines ?? 3;
        const diffResult = lineDiff(contentA, contentB, contextLines);
        const output = [
            `## Compare: "${params.fileA}"`,
            ``,
            `**A (current):** ${params.fileA}`,
            `**B (reference):** ${labelB}`,
            ``,
            '```diff',
            diffResult,
            '```',
        ].join('\n');
        return {
            success: true,
            message: output,
            data: {
                fileA: params.fileA,
                fileB: labelB,
                linesA: contentA.split('\n').length,
                linesB: contentB.split('\n').length,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi compare: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-compare.js.map