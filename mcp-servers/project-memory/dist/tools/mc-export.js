"use strict";
/**
 * mc-export.ts — Tool: mc_export
 *
 * Export tài liệu dự án MCV3 ra các format khác nhau:
 *   - "bundle": Gộp nhiều files thành 1 file Markdown lớn
 *   - "summary": Tóm tắt dự án theo phase (overview report)
 *   - "phase": Export toàn bộ tài liệu của 1 phase cụ thể
 *   - "index": Tạo README/INDEX với links đến tất cả tài liệu
 *
 * Output lưu vào: .mc-data/projects/{slug}/_mcv3-work/_exports/
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Export Protocol
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
exports.mcExport = mcExport;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Export Functions ──────────────────────────────────────────────────────
/**
 * Export summary: tạo báo cáo tổng quan dự án theo phases
 */
async function exportSummary(projectPath, config, projectRoot) {
    const now = new Date().toISOString();
    // Đọc MASTER-INDEX
    const masterIndex = await (0, file_io_js_1.readFile)(path.join(projectPath, 'MASTER-INDEX.md')) || '';
    // Đọc checkpoint
    const checkpoint = await (0, file_io_js_1.readFile)(path.join(projectPath, '_mcv3-work', '_checkpoint.md')) || 'Chưa có checkpoint';
    // Liệt kê tài liệu theo thư mục
    const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
    const projectDocs = allFiles.filter(f => !f.includes('_mcv3-work') && !f.startsWith('_'));
    // Nhóm theo thư mục
    const docsByDir = {};
    for (const f of projectDocs) {
        const dir = path.dirname(f).replace(/\\/g, '/');
        if (!docsByDir[dir])
            docsByDir[dir] = [];
        docsByDir[dir].push(path.basename(f));
    }
    const docSections = Object.entries(docsByDir)
        .map(([dir, files]) => `### ${dir}\n${files.map(f => `- ${f}`).join('\n')}`)
        .join('\n\n');
    return `# PROJECT SUMMARY EXPORT
<!-- Tạo bởi mc_export — ${now} -->

> **Dự án:** ${config.name}
> **Slug:** ${config.slug}
> **Domain:** ${config.domain}
> **Phase:** ${config.currentPhase}
> **Export lúc:** ${now}

---

## MASTER INDEX

${masterIndex}

---

## CHECKPOINT HIỆN TẠI

${checkpoint}

---

## TÀI LIỆU ĐÃ TẠO (${projectDocs.length} files)

${docSections || '_Chưa có tài liệu nào_'}

---

_Export bởi MCV3 mc_export tool_
`;
}
/**
 * Export bundle: gộp các files trong một thư mục thành 1 file lớn
 */
async function exportBundle(projectPath, config, targetSubPath, projectRoot) {
    const now = new Date().toISOString();
    const targetFullPath = path.join(projectPath, targetSubPath);
    if (!(await (0, file_io_js_1.exists)(targetFullPath))) {
        throw new Error(`Thư mục không tồn tại: ${targetSubPath}`);
    }
    const files = await (0, file_io_js_1.listFiles)(targetFullPath, targetFullPath);
    const sections = [
        `# BUNDLE EXPORT — ${config.name} / ${targetSubPath}`,
        `<!-- Tạo bởi mc_export — ${now} -->`,
        `> Gộp ${files.length} files từ \`${targetSubPath}\``,
        '',
    ];
    for (const file of files) {
        const fullFilePath = path.join(targetFullPath, file);
        const content = await (0, file_io_js_1.readFile)(fullFilePath) || '';
        sections.push(`\n---\n\n# File: ${file}\n\n${content}`);
    }
    return sections.join('\n');
}
/**
 * Export index: tạo README với links đến tất cả tài liệu
 */
async function exportIndex(projectPath, config, projectRoot) {
    const now = new Date().toISOString();
    const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
    // Lọc và nhóm files
    const docFiles = allFiles.filter(f => !f.includes('_mcv3-work') && f.endsWith('.md'));
    const grouped = {};
    for (const f of docFiles) {
        const dir = path.dirname(f).replace(/\\/g, '/');
        if (!grouped[dir])
            grouped[dir] = [];
        grouped[dir].push({ name: path.basename(f, '.md'), path: f });
    }
    const sections = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dir, files]) => {
        const fileLinks = files
            .map(f => `| [${f.name}](${f.path}) | — | — |`)
            .join('\n');
        return `## ${dir}\n\n| Tên tài liệu | Mô tả | Trạng thái |\n|-------------|-------|----------|\n${fileLinks}`;
    })
        .join('\n\n');
    return `# DOCUMENT INDEX — ${config.name}
<!-- Tạo bởi mc_export — ${now} -->

> **Dự án:** ${config.name} | **Domain:** ${config.domain}
> **Phase:** ${config.currentPhase} | **Tổng:** ${docFiles.length} tài liệu

---

${sections}

---

_Index bởi MCV3 mc_export tool — ${now}_
`;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_export
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcExport(params, projectRoot) {
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
        // ── Đọc config ────────────────────────────────────────────────────────
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        if (!config) {
            return {
                success: false,
                message: 'Không đọc được _config.json',
                error: 'CONFIG_NOT_FOUND',
            };
        }
        // ── Thực hiện export theo loại ────────────────────────────────────────
        const exportType = params.exportType || 'summary';
        const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        let exportContent = '';
        let outputFilename = '';
        switch (exportType) {
            case 'summary':
                exportContent = await exportSummary(projectPath, config, projectRoot);
                outputFilename = params.outputName || `SUMMARY-${now}`;
                break;
            case 'bundle':
                if (!params.targetPath) {
                    return {
                        success: false,
                        message: 'exportType="bundle" cần targetPath (VD: "_PROJECT")',
                        error: 'MISSING_TARGET_PATH',
                    };
                }
                exportContent = await exportBundle(projectPath, config, params.targetPath, projectRoot);
                outputFilename = params.outputName ||
                    `BUNDLE-${params.targetPath.replace(/\//g, '-')}-${now}`;
                break;
            case 'phase':
                const targetPath = params.targetPath || '_PROJECT';
                exportContent = await exportBundle(projectPath, config, targetPath, projectRoot);
                outputFilename = params.outputName ||
                    `PHASE-${targetPath.replace(/\//g, '-')}-${now}`;
                break;
            case 'index':
                exportContent = await exportIndex(projectPath, config, projectRoot);
                outputFilename = params.outputName || `INDEX-${now}`;
                break;
            default:
                return {
                    success: false,
                    message: `exportType không hợp lệ: ${exportType}`,
                    error: 'INVALID_EXPORT_TYPE',
                };
        }
        // ── Lưu file export ──────────────────────────────────────────────────
        const exportsDir = path.join(projectPath, '_mcv3-work', '_exports');
        const outputPath = path.join(exportsDir, `${outputFilename}.md`);
        await (0, file_io_js_1.writeFile)(outputPath, exportContent);
        const relativePath = path.relative(projectRoot, outputPath);
        return {
            success: true,
            message: `✅ Đã export "${exportType}" cho dự án "${config.name}" → ${relativePath}`,
            data: {
                outputPath: relativePath.replace(/\\/g, '/'),
                exportType,
                contentLength: exportContent.length,
                // Trả về nội dung để AI có thể đọc ngay
                content: exportContent,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi export: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-export.js.map