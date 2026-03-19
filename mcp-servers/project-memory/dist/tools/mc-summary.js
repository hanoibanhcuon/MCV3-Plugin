"use strict";
/**
 * mc-summary.ts — Tool: mc_summary
 *
 * Tạo summary (tóm tắt) của project hoặc một phase/module cụ thể.
 * Dùng để:
 *   - Xem tổng quan nhanh khi bắt đầu session mới
 *   - Tạo báo cáo tiến độ cho stakeholders
 *   - Summarize một phase trước khi chuyển sang phase tiếp theo
 *   - Tạo executive summary toàn bộ project
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
exports.mcSummary = mcSummary;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helpers ───────────────────────────────────────────────────────────────
/** Phân loại document theo folder/type */
function categorizeDocuments(files) {
    const categories = {
        project: [],
        requirements: [],
        design: [],
        test: [],
        deployment: [],
        working: [],
        other: [],
    };
    for (const file of files) {
        if (file.includes('_mcv3-work')) {
            categories['working'].push(file);
        }
        else if (file.includes('_PROJECT')) {
            categories['project'].push(file);
        }
        else if (file.includes('P1-REQUIREMENTS')) {
            categories['requirements'].push(file);
        }
        else if (file.includes('P2-DESIGN')) {
            categories['design'].push(file);
        }
        else if (file.includes('TEST') || file.includes('QA')) {
            categories['test'].push(file);
        }
        else if (file.includes('DEPLOY') || file.includes('VERIFY')) {
            categories['deployment'].push(file);
        }
        else {
            categories['other'].push(file);
        }
    }
    return categories;
}
/** Extract IDs từ file content */
function extractIDs(content) {
    const extract = (pattern) => {
        const matches = content.match(new RegExp(pattern.source, 'g')) || [];
        return [...new Set(matches)];
    };
    return {
        brIds: extract(/BR-[A-Z]+-\d+/),
        usIds: extract(/US-[A-Z]+-\d+/),
        ftIds: extract(/FT-[A-Z]+-\d+/),
        apiIds: extract(/API-[A-Z]+-\d+/),
        tblIds: extract(/TBL-[A-Z]+-\d+/),
    };
}
/** Đọc tất cả IDs từ files */
async function collectAllIDs(files, projectPath) {
    const all = { brIds: [], usIds: [], ftIds: [], apiIds: [], tblIds: [] };
    for (const file of files.slice(0, 100)) { // Giới hạn 100 files để tránh chậm quá mức
        const content = await (0, file_io_js_1.readFile)(path.join(projectPath, file)) || '';
        const ids = extractIDs(content);
        all.brIds.push(...ids.brIds);
        all.usIds.push(...ids.usIds);
        all.ftIds.push(...ids.ftIds);
        all.apiIds.push(...ids.apiIds);
        all.tblIds.push(...ids.tblIds);
    }
    return {
        brIds: [...new Set(all.brIds)],
        usIds: [...new Set(all.usIds)],
        ftIds: [...new Set(all.ftIds)],
        apiIds: [...new Set(all.apiIds)],
        tblIds: [...new Set(all.tblIds)],
    };
}
/** Đọc phần đầu của file (summary) */
async function readFileSummary(filePath, maxLines = 15) {
    const content = await (0, file_io_js_1.readFile)(filePath) || '';
    const lines = content.split('\n');
    return lines.slice(0, maxLines).join('\n');
}
// ─── Summary Generators ────────────────────────────────────────────────────
/** Tạo Project Summary */
async function generateProjectSummary(projectPath, config, projectRoot) {
    const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
    const categories = categorizeDocuments(allFiles);
    const ids = await collectAllIDs(allFiles.filter(f => !f.includes('_mcv3-work')), projectPath);
    // Đọc PROJECT-OVERVIEW nếu có
    const overviewPath = path.join(projectPath, '_PROJECT', 'PROJECT-OVERVIEW.md');
    const hasOverview = await (0, file_io_js_1.exists)(overviewPath);
    const overviewSummary = hasOverview
        ? await readFileSummary(overviewPath, 20)
        : '_(chưa có PROJECT-OVERVIEW.md)_';
    const lines = [
        `# Tóm tắt Dự án: ${config.name}`,
        ``,
        `**Slug:** \`${config.slug}\``,
        `**Domain:** ${config.domain}`,
        `**Phase hiện tại:** ${config.currentPhase}`,
        `**Tạo ngày:** ${config.createdAt.split('T')[0]}`,
        `**Cập nhật:** ${config.updatedAt.split('T')[0]}`,
        ``,
        `## Systems`,
        config.systems.length > 0
            ? config.systems.map(s => `- **${s.code}** (${s.name}): ${s.status}`).join('\n')
            : '_(chưa có systems)_',
        ``,
        `## Thống kê Documents`,
        ``,
        `| Loại | Số files |`,
        `|------|---------|`,
        `| Project docs (_PROJECT/) | ${categories['project'].length} |`,
        `| Requirements (URS) | ${categories['requirements'].length} |`,
        `| Design (MODSPEC) | ${categories['design'].length} |`,
        `| Test & QA | ${categories['test'].length} |`,
        `| Deployment | ${categories['deployment'].length} |`,
        `| **Tổng** | **${allFiles.filter(f => !f.includes('_mcv3-work')).length}** |`,
        ``,
        `## Thống kê IDs`,
        ``,
        `| ID Type | Count |`,
        `|---------|-------|`,
        `| Business Rules (BR-) | ${ids.brIds.length} |`,
        `| User Stories (US-) | ${ids.usIds.length} |`,
        `| Features (FT-) | ${ids.ftIds.length} |`,
        `| API Endpoints (API-) | ${ids.apiIds.length} |`,
        `| DB Tables (TBL-) | ${ids.tblIds.length} |`,
        ``,
        `## Project Overview (trích đoạn)`,
        ``,
        overviewSummary,
    ];
    return lines.join('\n');
}
/** Tạo Executive Summary */
async function generateExecutiveSummary(projectPath, config) {
    // Đọc các tài liệu quan trọng
    const overviewContent = await (0, file_io_js_1.readFile)(path.join(projectPath, '_PROJECT', 'PROJECT-OVERVIEW.md')) || '';
    // Extract project name, domain, key problems từ overview
    const probMatch = overviewContent.match(/PROB-\d+[^\n]*/g) || [];
    const bgMatch = overviewContent.match(/BG-BUS-\d+[^\n]*/g) || [];
    const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
    const docFiles = allFiles.filter(f => !f.includes('_mcv3-work'));
    const lines = [
        `# Executive Summary — ${config.name}`,
        ``,
        `**Ngày tạo:** ${new Date().toISOString().split('T')[0]}`,
        `**Phase:** ${config.currentPhase}`,
        ``,
        `## Tổng quan Dự án`,
        ``,
        `${config.name} là dự án ${config.domain} được phân tích và thiết kế`,
        `theo phương pháp MCV3 (MasterCraft DevKit v3.1).`,
        ``,
        `## Vấn đề Cần Giải Quyết`,
        ``,
        probMatch.length > 0
            ? probMatch.slice(0, 5).map(p => `- ${p.trim()}`).join('\n')
            : '_(Xem PROJECT-OVERVIEW.md để biết chi tiết)_',
        ``,
        `## Bối Cảnh Nghiệp Vụ`,
        ``,
        bgMatch.length > 0
            ? bgMatch.slice(0, 3).map(b => `- ${b.trim()}`).join('\n')
            : '_(Xem PROJECT-OVERVIEW.md để biết chi tiết)_',
        ``,
        `## Tiến Độ`,
        ``,
        `| Phase | Status |`,
        `|-------|--------|`,
        `| Phase 1: Discovery | ${docFiles.some(f => f.includes('PROJECT-OVERVIEW')) ? '✅ Done' : '⬜ Chưa'} |`,
        `| Phase 2: Expert Analysis | ${docFiles.some(f => f.includes('EXPERT-LOG')) ? '✅ Done' : '⬜ Chưa'} |`,
        `| Phase 3: Business Docs | ${docFiles.some(f => f.includes('BIZ-POLICY')) ? '✅ Done' : '⬜ Chưa'} |`,
        `| Phase 4: Requirements | ${docFiles.some(f => f.includes('URS-')) ? '🔄 In Progress' : '⬜ Chưa'} |`,
        `| Phase 5: Tech Design | ${docFiles.some(f => f.includes('MODSPEC-')) ? '🔄 In Progress' : '⬜ Chưa'} |`,
        `| Phase 6: QA & Docs | ${docFiles.some(f => f.includes('TEST-')) ? '🔄 In Progress' : '⬜ Chưa'} |`,
        `| Phase 7: Code Gen | ⬜ Chưa |`,
        `| Phase 8: Verify & Deploy | ⬜ Chưa |`,
        ``,
        `**Tổng tài liệu đã tạo:** ${docFiles.length} files`,
        ``,
        `---`,
        `_Được tạo bởi MCV3 Summary Tool_`,
    ];
    return lines.join('\n');
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_summary
 */
async function mcSummary(params, projectRoot) {
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
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        if (!config) {
            return {
                success: false,
                message: 'Không đọc được _config.json',
                error: 'CONFIG_NOT_FOUND',
            };
        }
        const summaryType = params.summaryType || 'project';
        let summaryContent;
        switch (summaryType) {
            case 'project':
                summaryContent = await generateProjectSummary(projectPath, config, projectRoot);
                break;
            case 'executive':
                summaryContent = await generateExecutiveSummary(projectPath, config);
                break;
            case 'phase': {
                const phase = params.phase || config.currentPhase;
                const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
                const phaseFiles = allFiles.filter(f => !f.includes('_mcv3-work') &&
                    (f.includes(phase) || f.toLowerCase().includes(phase.toLowerCase())));
                summaryContent = [
                    `# Tóm tắt Phase: ${phase}`,
                    ``,
                    `**Dự án:** ${config.name}`,
                    `**Số files:** ${phaseFiles.length}`,
                    ``,
                    `## Documents`,
                    phaseFiles.map(f => `- \`${f}\``).join('\n') || '_(không có)_',
                ].join('\n');
                break;
            }
            case 'module': {
                const module = params.module || '';
                if (!module) {
                    return {
                        success: false,
                        message: 'Cần truyền module khi summaryType=module',
                        error: 'INVALID_PARAMS',
                    };
                }
                const allFiles = await (0, file_io_js_1.listFiles)(projectPath, projectPath);
                const moduleFiles = allFiles.filter(f => !f.includes('_mcv3-work') &&
                    f.includes(module.toUpperCase()));
                const ids = await collectAllIDs(moduleFiles, projectPath);
                summaryContent = [
                    `# Tóm tắt Module: ${module.toUpperCase()}`,
                    ``,
                    `**Dự án:** ${config.name}`,
                    ``,
                    `## Documents (${moduleFiles.length})`,
                    moduleFiles.map(f => `- \`${f}\``).join('\n') || '_(không có)_',
                    ``,
                    `## IDs Thống Kê`,
                    `- Business Rules: ${ids.brIds.length} (${ids.brIds.slice(0, 5).join(', ')}${ids.brIds.length > 5 ? '...' : ''})`,
                    `- User Stories: ${ids.usIds.length} (${ids.usIds.slice(0, 5).join(', ')}${ids.usIds.length > 5 ? '...' : ''})`,
                    `- Features: ${ids.ftIds.length}`,
                    `- APIs: ${ids.apiIds.length}`,
                    `- DB Tables: ${ids.tblIds.length}`,
                ].join('\n');
                break;
            }
            default:
                summaryContent = await generateProjectSummary(projectPath, config, projectRoot);
        }
        // Lưu nếu được yêu cầu
        let savedPath = null;
        if (params.save) {
            const filename = `summary-${summaryType}-${new Date().toISOString().slice(0, 10)}.md`;
            const savePath = path.join(projectPath, '_mcv3-work', filename);
            await (0, file_io_js_1.writeFile)(savePath, summaryContent);
            savedPath = path.relative(projectRoot, savePath).replace(/\\/g, '/');
        }
        return {
            success: true,
            message: summaryContent,
            data: {
                summaryType,
                savedPath,
                projectSlug: params.projectSlug,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi tạo summary: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-summary.js.map