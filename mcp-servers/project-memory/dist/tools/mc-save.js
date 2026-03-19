"use strict";
/**
 * mc-save.ts — Tool: mc_save
 *
 * Lưu artifact (tài liệu Markdown) vào project memory (.mc-data/).
 * Tự động:
 * - Tạo thư mục nếu chưa tồn tại
 * - Cập nhật _changelog.md
 * - Cập nhật timestamp trong _config.json
 *
 * Đường dẫn file: .mc-data/projects/{slug}/{filePath}
 * VD: filePath = "_PROJECT/PROJECT-OVERVIEW.md"
 *     → .mc-data/projects/abc-xyz/_PROJECT/PROJECT-OVERVIEW.md
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
exports.mcSave = mcSave;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helper ──────────────────────────────────────────────────────────────
/**
 * Append entry vào _changelog.md
 */
async function appendChangelog(changelogPath, filePath, action) {
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];
    const timeStr = now.split('T')[1].split('.')[0];
    const entry = `\n## ${dateStr} ${timeStr}\n- ${action === 'created' ? '➕ Tạo mới' : '✏️ Cập nhật'}: \`${filePath}\`\n`;
    try {
        // Đọc nội dung hiện tại
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        let current = '';
        try {
            current = await fs.readFile(changelogPath, 'utf-8');
        }
        catch {
            current = `# CHANGELOG\n`;
        }
        await fs.writeFile(changelogPath, current + entry, 'utf-8');
    }
    catch {
        // Lỗi khi ghi changelog không critical — bỏ qua
    }
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_save
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 * @returns ToolResult
 */
async function mcSave(params, projectRoot) {
    // ── Validate input ────────────────────────────────────────────────────
    if (!params.projectSlug) {
        return {
            success: false,
            message: 'Thiếu projectSlug',
            error: 'INVALID_PARAMS',
        };
    }
    if (!params.filePath) {
        return {
            success: false,
            message: 'Thiếu filePath',
            error: 'INVALID_PARAMS',
        };
    }
    if (params.content === undefined || params.content === null) {
        return {
            success: false,
            message: 'Thiếu content',
            error: 'INVALID_PARAMS',
        };
    }
    // Security: ngăn chặn path traversal
    const normalizedPath = path.normalize(params.filePath).replace(/\\/g, '/');
    if (normalizedPath.startsWith('..') || normalizedPath.includes('/../')) {
        return {
            success: false,
            message: 'filePath không hợp lệ: không được chứa ".."',
            error: 'INVALID_PATH',
        };
    }
    // ── Tính toán đường dẫn ───────────────────────────────────────────────
    const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);
    // Kiểm tra project tồn tại
    if (!(await (0, file_io_js_1.exists)(projectPath))) {
        return {
            success: false,
            message: `Dự án "${params.projectSlug}" không tồn tại. Chạy mc_init_project trước.`,
            error: 'PROJECT_NOT_FOUND',
        };
    }
    const targetPath = path.join(projectPath, params.filePath);
    const isUpdate = await (0, file_io_js_1.exists)(targetPath);
    // ── Ghi file ─────────────────────────────────────────────────────────
    try {
        await (0, file_io_js_1.writeFile)(targetPath, params.content);
        // ── Cập nhật metadata ────────────────────────────────────────────
        // 1. Cập nhật updatedAt trong _config.json
        const configPath = path.join(projectPath, '_config.json');
        const config = await (0, file_io_js_1.readJson)(configPath);
        if (config) {
            config.updatedAt = new Date().toISOString();
            await (0, file_io_js_1.writeJson)(configPath, config);
        }
        // 2. Append vào changelog
        const changelogPath = path.join(projectPath, '_changelog.md');
        await appendChangelog(changelogPath, params.filePath, isUpdate ? 'updated' : 'created');
        const action = isUpdate ? 'Cập nhật' : 'Tạo mới';
        const relativePath = path.relative(projectRoot, targetPath).replace(/\\/g, '/');
        return {
            success: true,
            message: `✅ ${action} tài liệu: ${relativePath}`,
            data: {
                filePath: relativePath,
                action: isUpdate ? 'updated' : 'created',
                size: Buffer.byteLength(params.content, 'utf8'),
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi lưu tài liệu: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-save.js.map