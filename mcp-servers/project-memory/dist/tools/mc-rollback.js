"use strict";
/**
 * mc-rollback.ts — Tool: mc_rollback
 *
 * Rollback toàn bộ project về trạng thái của một snapshot trước đó.
 * Trước khi rollback, tự động tạo safety snapshot của trạng thái hiện tại.
 *
 * Quy trình:
 *   1. Đọc snapshot bundle target
 *   2. Tạo safety snapshot của state hiện tại
 *   3. Restore tất cả documents từ bundle
 *   4. Cập nhật _config.json
 *   5. Ghi changelog
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Rollback Protocol
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
exports.mcRollback = mcRollback;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helpers ───────────────────────────────────────────────────────────────
/**
 * Liệt kê các snapshots có sẵn trong project
 */
async function listSnapshots(projectPath) {
    const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
    if (!(await (0, file_io_js_1.exists)(snapshotsDir)))
        return [];
    const entries = await fs.readdir(snapshotsDir);
    return entries
        .filter(f => f.endsWith('.bundle.json'))
        .sort()
        .reverse(); // Mới nhất trước
}
/**
 * Tạo safety snapshot trước khi rollback
 */
async function createSafetySnapshot(projectPath, config, projectRoot) {
    const { mcSnapshot } = await Promise.resolve().then(() => __importStar(require('./mc-snapshot.js')));
    const result = await mcSnapshot({
        projectSlug: config.slug,
        label: `pre-rollback-${new Date().toISOString().slice(0, 10)}`,
        notes: 'Auto-created safety snapshot trước khi rollback',
    }, projectRoot);
    return result.success
        ? result.data.snapshotPath
        : 'FAILED';
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_rollback
 */
async function mcRollback(params, projectRoot) {
    // ── Validate ──────────────────────────────────────────────────────────
    if (!params.projectSlug || !params.snapshotName) {
        return {
            success: false,
            message: 'Thiếu projectSlug hoặc snapshotName',
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
    // ── Tìm snapshot ──────────────────────────────────────────────────────
    const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
    const snapshotPath = path.join(snapshotsDir, params.snapshotName);
    if (!(await (0, file_io_js_1.exists)(snapshotPath))) {
        // Liệt kê các snapshots có sẵn để giúp user
        const available = await listSnapshots(projectPath);
        const availableList = available.length > 0
            ? `\n\nSnapshots có sẵn:\n${available.map(s => `  - ${s}`).join('\n')}`
            : '\n\nChưa có snapshot nào.';
        return {
            success: false,
            message: `Snapshot "${params.snapshotName}" không tồn tại.${availableList}`,
            error: 'SNAPSHOT_NOT_FOUND',
        };
    }
    try {
        // ── Đọc snapshot bundle ──────────────────────────────────────────────
        const bundle = await (0, file_io_js_1.readJson)(snapshotPath);
        if (!bundle) {
            return {
                success: false,
                message: `Không đọc được snapshot "${params.snapshotName}"`,
                error: 'SNAPSHOT_CORRUPT',
            };
        }
        // ── Đọc config hiện tại ──────────────────────────────────────────────
        const currentConfig = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        // ── Kiểm tra nếu không force — warning ────────────────────────────────
        if (!params.force) {
            const currentFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
            return {
                success: false,
                message: [
                    `⚠️ CẢNH BÁO: Rollback sẽ XÓA trạng thái hiện tại và restore về "${bundle.meta.label}"`,
                    ``,
                    `Snapshot info:`,
                    `  - Label: ${bundle.meta.label}`,
                    `  - Thời điểm: ${bundle.meta.createdAt}`,
                    `  - Phase: ${bundle.meta.phase}`,
                    `  - Số files: ${bundle.meta.totalFiles}`,
                    `  - Notes: ${bundle.meta.notes || '(không có)'}`,
                    ``,
                    `Trạng thái hiện tại sẽ MẤT: ${currentFiles.length} files`,
                    ``,
                    `Để xác nhận, gọi lại với force: true`,
                ].join('\n'),
                error: 'CONFIRMATION_REQUIRED',
            };
        }
        // ── Tạo safety snapshot ────────────────────────────────────────────
        const safetyPath = currentConfig
            ? await createSafetySnapshot(projectPath, currentConfig, projectRoot)
            : 'SKIPPED';
        // ── Xóa documents hiện tại (trừ _mcv3-work) ────────────────────────
        const currentFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
        for (const relativePath of currentFiles) {
            if (!relativePath.includes('_mcv3-work')) {
                const fullPath = path.join(projectPath, relativePath);
                // Chỉ bỏ qua ENOENT (file đã bị xóa trước đó), throw các lỗi khác
                await fs.unlink(fullPath).catch((err) => {
                    if (err.code !== 'ENOENT')
                        throw err;
                });
            }
        }
        // ── Restore documents từ snapshot ─────────────────────────────────
        let restoredCount = 0;
        for (const doc of bundle.documents) {
            const targetPath = path.join(projectPath, doc.path);
            await (0, file_io_js_1.ensureDir)(path.dirname(targetPath));
            await (0, file_io_js_1.writeFile)(targetPath, doc.content);
            restoredCount++;
        }
        // ── Restore config ─────────────────────────────────────────────────
        await (0, file_io_js_1.writeJson)(path.join(projectPath, '_config.json'), bundle.config);
        // ── Ghi changelog ─────────────────────────────────────────────────
        const changelogPath = path.join(projectPath, '_changelog.md');
        const now = new Date().toISOString();
        const changelogEntry = `\n## ${now.split('T')[0]} — ROLLBACK\n` +
            `- Rollback về snapshot: "${bundle.meta.label}" (${bundle.meta.createdAt})\n` +
            `- Safety snapshot: ${safetyPath}\n` +
            `- Files restored: ${restoredCount}\n`;
        const existingChangelog = await Promise.resolve().then(() => __importStar(require('../utils/file-io.js'))).then(m => m.readFile(changelogPath))
            .catch(() => '# CHANGELOG\n');
        await (0, file_io_js_1.writeFile)(changelogPath, (existingChangelog || '# CHANGELOG\n') + changelogEntry);
        return {
            success: true,
            message: [
                `✅ Rollback thành công về "${bundle.meta.label}"`,
                ``,
                `- Files restored: ${restoredCount}`,
                `- Phase restored: ${bundle.meta.phase}`,
                `- Safety snapshot: ${safetyPath}`,
            ].join('\n'),
            data: {
                restoredFromLabel: bundle.meta.label,
                restoredFromDate: bundle.meta.createdAt,
                restoredPhase: bundle.meta.phase,
                filesRestored: restoredCount,
                safetySnapshotPath: safetyPath,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi rollback: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-rollback.js.map