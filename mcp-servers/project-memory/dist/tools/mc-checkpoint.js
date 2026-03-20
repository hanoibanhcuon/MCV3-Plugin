"use strict";
/**
 * mc-checkpoint.ts — Tool: mc_checkpoint
 *
 * Lưu checkpoint trạng thái hiện tại của dự án vào .mc-data/_mcv3-work/
 * Dùng để:
 *   - Lưu tiến độ giữa các session
 *   - Tạo restore point trước khi thực hiện thay đổi lớn
 *   - Auto-save khi kết thúc session (gọi từ hook)
 *
 * File checkpoint: _mcv3-work/_checkpoint.md (latest)
 *                  _mcv3-work/_snapshots/{timestamp}-{label}.md (versioned)
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 21 — Checkpoint Protocol
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
exports.mcCheckpoint = mcCheckpoint;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helpers ───────────────────────────────────────────────────────────────
/**
 * Đọc danh sách files tài liệu đã có trong dự án (để log vào checkpoint)
 */
async function getDocumentList(projectPath) {
    const docs = [];
    // Tìm tất cả .md files (không kể _mcv3-work)
    const { listFiles } = await Promise.resolve().then(() => __importStar(require('../utils/file-io.js')));
    const allFiles = await listFiles(projectPath, projectPath);
    for (const f of allFiles) {
        // Bỏ qua internal files
        if (!f.includes('_mcv3-work') && !f.startsWith('_changelog') && !f.startsWith('_dependency')) {
            docs.push(f);
        }
    }
    return docs;
}
// ─── Implementation Progress Scanner ────────────────────────────────────
/**
 * Kiểm tra trạng thái của một layer file (controller/service/repository/tests).
 * - done: file tồn tại, không còn TODO/FIXME/placeholder
 * - partial: file tồn tại nhưng còn TODO/FIXME hoặc expect(true).toBe(true)
 * - todo: file chưa được tạo
 */
async function checkLayerStatus(modPath, modName, layer) {
    // Map layer → đường dẫn file tương đối trong module
    const fileMap = {
        controller: `controllers/${modName}.controller.ts`,
        service: `services/${modName}.service.ts`,
        repository: `repositories/${modName}.repository.ts`,
        tests: `__tests__/${modName}.service.test.ts`,
    };
    const filePath = path.join(modPath, fileMap[layer]);
    if (!(await (0, file_io_js_1.exists)(filePath)))
        return 'todo';
    // Đọc nội dung và kiểm tra placeholder patterns
    const content = await (0, file_io_js_1.readFile)(filePath) || '';
    const hasPlaceholders = /\bTODO\b|\bFIXME\b|expect\(true\)\.toBe\(true\)/.test(content);
    return hasPlaceholders ? 'partial' : 'done';
}
/**
 * Kiểm tra trạng thái migration cho module.
 * Tìm file trong db/migrations/ có tên chứa modName.
 */
async function checkMigrationStatus(migrationsPath, modName) {
    if (!(await (0, file_io_js_1.exists)(migrationsPath)))
        return 'todo';
    try {
        const files = await fs.promises.readdir(migrationsPath);
        const modNameLower = modName.toLowerCase();
        const hasFile = files.some(f => f.toLowerCase().includes(modNameLower));
        return hasFile ? 'done' : 'todo';
    }
    catch {
        return 'todo';
    }
}
/**
 * Quét thư mục src/{system}/{module}/ để build implementation progress map.
 * Chỉ quét khi includeProgress = true. Graceful nếu src/ không tồn tại.
 *
 * @param projectRoot - Thư mục gốc dự án (chứa src/ và db/)
 * @returns ImplementationProgress với key format "{SYSTEM}/{module}"
 */
async function scanImplementationProgress(projectRoot) {
    const progress = {};
    const srcPath = path.join(projectRoot, 'src');
    // Nếu không có thư mục src/, trả về map rỗng
    if (!(await (0, file_io_js_1.exists)(srcPath)))
        return progress;
    const migrationsPath = path.join(projectRoot, 'db', 'migrations');
    try {
        // Lấy danh sách systems (sub-dirs của src/)
        const systemDirs = await fs.promises.readdir(srcPath);
        for (const sysDir of systemDirs) {
            const sysPath = path.join(srcPath, sysDir);
            // Bỏ qua files, chỉ xử lý directories
            let sysStat;
            try {
                sysStat = await fs.promises.stat(sysPath);
            }
            catch {
                continue;
            }
            if (!sysStat.isDirectory())
                continue;
            // Lấy danh sách modules (sub-dirs của src/{system}/)
            const moduleDirs = await fs.promises.readdir(sysPath);
            for (const modDir of moduleDirs) {
                const modPath = path.join(sysPath, modDir);
                let modStat;
                try {
                    modStat = await fs.promises.stat(modPath);
                }
                catch {
                    continue;
                }
                if (!modStat.isDirectory())
                    continue;
                // Key format: "ERP/inventory" — system uppercase, module lowercase
                const key = `${sysDir.toUpperCase()}/${modDir}`;
                // Kiểm tra từng layer song song
                const [controller, service, repository, tests, migration] = await Promise.all([
                    checkLayerStatus(modPath, modDir, 'controller'),
                    checkLayerStatus(modPath, modDir, 'service'),
                    checkLayerStatus(modPath, modDir, 'repository'),
                    checkLayerStatus(modPath, modDir, 'tests'),
                    checkMigrationStatus(migrationsPath, modDir),
                ]);
                // Tính percentage: done=1.0, partial=0.5, todo=0
                const layers = [controller, service, repository, tests, migration];
                const score = layers.reduce((sum, s) => {
                    if (s === 'done')
                        return sum + 1;
                    if (s === 'partial')
                        return sum + 0.5;
                    return sum;
                }, 0);
                const percentage = Math.round((score / 5) * 100);
                progress[key] = { controller, service, repository, tests, migration, percentage };
            }
        }
    }
    catch {
        // Lỗi không mong đợi → trả về progress đã scan được (có thể rỗng)
    }
    return progress;
}
/**
 * Render trạng thái layer thành emoji dễ đọc
 */
function renderLayerStatus(status) {
    if (status === 'done')
        return '✅';
    if (status === 'partial')
        return '🔶';
    return '⬜';
}
/**
 * Sinh bảng progress Markdown từ ImplementationProgress
 */
function renderProgressSection(progress) {
    const entries = Object.entries(progress).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0)
        return '';
    const rows = entries
        .map(([key, p]) => `| \`${key}\` | ${renderLayerStatus(p.controller)} | ${renderLayerStatus(p.service)} | ${renderLayerStatus(p.repository)} | ${renderLayerStatus(p.tests)} | ${renderLayerStatus(p.migration)} | **${p.percentage}%** |`)
        .join('\n');
    return `---

## Tiến độ Implementation

| Module | Controller | Service | Repository | Tests | Migration | % |
|--------|-----------|---------|-----------|-------|----------|---|
${rows}

_✅ done · 🔶 partial (còn TODO) · ⬜ todo (chưa tạo file)_
`;
}
// ─── Checkpoint Content Generator ────────────────────────────────────────
/**
 * Sinh nội dung Markdown cho checkpoint
 */
function generateCheckpointContent(data) {
    const nextActionsList = data.nextActions.length > 0
        ? data.nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : '_(chưa có — xác định trong session tiếp theo)_';
    const docsList = data.documentsSaved.length > 0
        ? data.documentsSaved.map(d => `- \`${d}\``).join('\n')
        : '_(chưa có tài liệu nào)_';
    // Tính tổng progress nếu có
    const progressSection = data.implementationProgress
        ? renderProgressSection(data.implementationProgress)
        : '';
    // Tổng % implementation (trung bình tất cả modules)
    const progressEntries = data.implementationProgress
        ? Object.values(data.implementationProgress)
        : [];
    const avgProgress = progressEntries.length > 0
        ? Math.round(progressEntries.reduce((s, p) => s + p.percentage, 0) / progressEntries.length)
        : null;
    // Working Context JSON với optional implementationProgress
    const workingContext = {
        projectSlug: data.projectSlug,
        currentPhase: data.currentPhase,
        checkpointLabel: data.label,
        savedAt: data.savedAt,
        resumeInstruction: 'Đọc MASTER-INDEX.md → Đọc file này → Tiếp tục nextActions[0]',
        ...(data.implementationProgress && Object.keys(data.implementationProgress).length > 0
            ? { implementationProgress: data.implementationProgress }
            : {}),
    };
    return `# CHECKPOINT — ${data.projectName}
<!-- MCV3 working state — auto-managed, không cần sửa thủ công -->

> **Dự án:** ${data.projectName} (\`${data.projectSlug}\`)
> **Phase hiện tại:** ${data.currentPhase}
> **Checkpoint:** ${data.label}
> **Lưu lúc:** ${data.savedAt}${avgProgress !== null ? `\n> **Implementation:** ${avgProgress}% hoàn thành (${progressEntries.length} modules)` : ''}

---

## Tóm tắt Session

${data.sessionSummary || '_(chưa có tóm tắt)_'}

---

## Bước tiếp theo

${nextActionsList}

---

## Tài liệu đã có

${docsList}

${progressSection}---

## Working Context (AI Resume Point)

\`\`\`json
${JSON.stringify(workingContext, null, 2)}
\`\`\`

---

## Hướng dẫn Resume

Khi bắt đầu session mới:
1. Gọi \`mc_resume({ projectSlug: "${data.projectSlug}" })\` để load lại context
2. Hoặc đọc file này → hiểu trạng thái → tiếp tục công việc
`;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_checkpoint
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcCheckpoint(params, projectRoot) {
    // ── Validate ──────────────────────────────────────────────────────────
    if (!params.projectSlug) {
        return {
            success: false,
            message: 'Thiếu projectSlug',
            error: 'INVALID_PARAMS',
        };
    }
    const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);
    // Kiểm tra dự án tồn tại
    if (!(await (0, file_io_js_1.exists)(projectPath))) {
        return {
            success: false,
            message: `Dự án "${params.projectSlug}" không tồn tại`,
            error: 'PROJECT_NOT_FOUND',
        };
    }
    try {
        // ── Đọc config dự án ────────────────────────────────────────────────
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        if (!config) {
            return {
                success: false,
                message: 'Không đọc được _config.json',
                error: 'CONFIG_NOT_FOUND',
            };
        }
        // ── Chuẩn bị dữ liệu checkpoint ─────────────────────────────────────
        const now = new Date().toISOString();
        const label = params.label || `checkpoint-${now.replace(/[:.]/g, '-').slice(0, 19)}`;
        const docs = await getDocumentList(projectPath);
        // Scan implementation progress nếu user yêu cầu
        let implProgress;
        if (params.includeProgress === true) {
            implProgress = await scanImplementationProgress(projectRoot);
        }
        const checkpointData = {
            projectSlug: params.projectSlug,
            projectName: config.name,
            currentPhase: config.currentPhase,
            label,
            savedAt: now,
            sessionSummary: params.sessionSummary || '',
            nextActions: params.nextActions || [],
            documentsSaved: docs,
            implementationProgress: implProgress,
        };
        const content = generateCheckpointContent(checkpointData);
        // ── Lưu latest checkpoint ────────────────────────────────────────────
        const checkpointPath = path.join(projectPath, '_mcv3-work', '_checkpoint.md');
        await (0, file_io_js_1.writeFile)(checkpointPath, content);
        // ── Lưu versioned snapshot (nếu cần) ────────────────────────────────
        let snapshotPath = null;
        if (params.saveSnapshot !== false) {
            const timestamp = now.replace(/[:.]/g, '-').slice(0, 19);
            const snapshotFilename = `${timestamp}-${label}.md`;
            snapshotPath = path.join(projectPath, '_mcv3-work', '_snapshots', snapshotFilename);
            await (0, file_io_js_1.writeFile)(snapshotPath, content);
        }
        // ── Ghi changelog ────────────────────────────────────────────────────
        const changelogPath = path.join(projectPath, '_changelog.md');
        const changelog = await (0, file_io_js_1.readFile)(changelogPath) || '';
        const entry = `\n- [${now.split('T')[0]}] Checkpoint "${label}" — Phase: ${config.currentPhase}`;
        await (0, file_io_js_1.writeFile)(changelogPath, changelog + entry);
        // Tóm tắt progress để trả về (nếu có scan)
        const progressSummary = implProgress && Object.keys(implProgress).length > 0
            ? {
                moduleCount: Object.keys(implProgress).length,
                avgPercentage: Math.round(Object.values(implProgress).reduce((s, p) => s + p.percentage, 0) /
                    Object.keys(implProgress).length),
            }
            : null;
        return {
            success: true,
            message: `✅ Đã lưu checkpoint "${label}" cho dự án "${config.name}"`,
            data: {
                checkpointPath: path.relative(projectRoot, checkpointPath),
                snapshotPath: snapshotPath ? path.relative(projectRoot, snapshotPath) : null,
                phase: config.currentPhase,
                documentCount: docs.length,
                ...(progressSummary ? { implementationProgress: progressSummary } : {}),
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi lưu checkpoint: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-checkpoint.js.map