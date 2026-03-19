"use strict";
/**
 * mc-snapshot.ts — Tool: mc_snapshot
 *
 * Tạo snapshot đầy đủ toàn bộ project state tại một thời điểm.
 * Khác với mc_checkpoint (chỉ lưu metadata), mc_snapshot lưu
 * TOÀN BỘ nội dung tất cả documents vào 1 bundle file.
 *
 * Dùng để:
 *   - Tạo backup point trước khi thay đổi lớn
 *   - Rollback về trạng thái cụ thể (kết hợp mc_rollback)
 *   - Archive milestone của dự án
 *
 * Output: .mc-data/projects/{slug}/_mcv3-work/_snapshots/{timestamp}-{label}.bundle.json
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Snapshot Protocol
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
exports.mcSnapshot = mcSnapshot;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_snapshot
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcSnapshot(params, projectRoot) {
    // ── Validate ──────────────────────────────────────────────────────────
    if (!params.projectSlug) {
        return {
            success: false,
            message: 'Thiếu projectSlug',
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
        // ── Đọc config ─────────────────────────────────────────────────────
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        if (!config) {
            return {
                success: false,
                message: 'Không đọc được _config.json',
                error: 'CONFIG_NOT_FOUND',
            };
        }
        // ── Collect tất cả documents ────────────────────────────────────────
        const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
        const documents = [];
        let totalBytes = 0;
        for (const relativePath of allFiles) {
            // Bỏ qua working files nếu không được yêu cầu
            if (!params.includeWorkFiles && relativePath.includes('_mcv3-work')) {
                continue;
            }
            // Bỏ qua _changelog.md (tự regenerate được)
            if (relativePath === '_changelog.md') {
                continue;
            }
            const fullPath = path.join(projectPath, relativePath);
            const content = await (0, file_io_js_1.readFile)(fullPath);
            if (content === null)
                continue;
            const stat = await (0, file_io_js_1.getFileStat)(fullPath);
            const size = Buffer.byteLength(content, 'utf-8');
            totalBytes += size;
            documents.push({
                path: relativePath,
                content,
                size,
                updatedAt: stat?.updatedAt || null,
            });
        }
        // ── Tạo snapshot bundle ────────────────────────────────────────────
        const now = new Date().toISOString();
        const timestamp = now.replace(/[:.]/g, '-').slice(0, 19);
        const label = params.label || `snapshot-${timestamp}`;
        const safeLabel = label.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
        const bundle = {
            meta: {
                projectSlug: params.projectSlug,
                projectName: config.name,
                label,
                createdAt: now,
                phase: config.currentPhase,
                mcv3Version: config.mcv3Version,
                notes: params.notes || '',
                totalFiles: documents.length,
                totalBytes,
            },
            config,
            documents,
        };
        // ── Lưu snapshot ─────────────────────────────────────────────────
        const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
        await (0, file_io_js_1.ensureDir)(snapshotsDir);
        const snapshotFilename = `${timestamp}-${safeLabel}.bundle.json`;
        const snapshotPath = path.join(snapshotsDir, snapshotFilename);
        await (0, file_io_js_1.writeJson)(snapshotPath, bundle);
        const snapshotSize = Buffer.byteLength(JSON.stringify(bundle), 'utf-8');
        return {
            success: true,
            message: `✅ Snapshot "${label}" đã được tạo cho dự án "${config.name}"`,
            data: {
                snapshotPath: path.relative(projectRoot, snapshotPath).replace(/\\/g, '/'),
                label,
                phase: config.currentPhase,
                documentCount: documents.length,
                totalBytes,
                snapshotSizeKB: Math.round(snapshotSize / 1024),
                timestamp: now,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi tạo snapshot: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-snapshot.js.map