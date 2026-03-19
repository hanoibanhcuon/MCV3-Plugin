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

import * as path from 'path';
import {
  readFile,
  readJson,
  writeFile,
  exists,
  listFiles,
  getFileStat,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_summary */
export interface McSummaryParams {
  /** Slug dự án */
  projectSlug: string;
  /** Loại summary */
  summaryType?: 'project' | 'phase' | 'module' | 'executive';
  /** Phase cần summarize (dùng với summaryType=phase) */
  phase?: string;
  /** Module/System cần summarize (dùng với summaryType=module) */
  module?: string;
  /** Có lưu summary vào file không (default: false) */
  save?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Phân loại document theo folder/type */
function categorizeDocuments(
  files: string[]
): Record<string, string[]> {
  const categories: Record<string, string[]> = {
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
    } else if (file.includes('_PROJECT')) {
      categories['project'].push(file);
    } else if (file.includes('P1-REQUIREMENTS')) {
      categories['requirements'].push(file);
    } else if (file.includes('P2-DESIGN')) {
      categories['design'].push(file);
    } else if (file.includes('TEST') || file.includes('QA')) {
      categories['test'].push(file);
    } else if (file.includes('DEPLOY') || file.includes('VERIFY')) {
      categories['deployment'].push(file);
    } else {
      categories['other'].push(file);
    }
  }

  return categories;
}

/** Extract IDs từ file content */
function extractIDs(content: string): {
  brIds: string[];
  usIds: string[];
  ftIds: string[];
  apiIds: string[];
  tblIds: string[];
} {
  const extract = (pattern: RegExp) => {
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
async function collectAllIDs(
  files: string[],
  projectPath: string
): Promise<{ brIds: string[]; usIds: string[]; ftIds: string[]; apiIds: string[]; tblIds: string[] }> {
  const all = { brIds: [] as string[], usIds: [] as string[], ftIds: [] as string[], apiIds: [] as string[], tblIds: [] as string[] };

  for (const file of files.slice(0, 100)) { // Giới hạn 100 files để tránh chậm quá mức
    const content = await readFile(path.join(projectPath, file)) || '';
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
async function readFileSummary(filePath: string, maxLines = 15): Promise<string> {
  const content = await readFile(filePath) || '';
  const lines = content.split('\n');
  return lines.slice(0, maxLines).join('\n');
}

// ─── Summary Generators ────────────────────────────────────────────────────

/** Tạo Project Summary */
async function generateProjectSummary(
  projectPath: string,
  config: ProjectConfig,
  projectRoot: string
): Promise<string> {
  const allFiles = await listFiles(projectPath, projectPath);
  const categories = categorizeDocuments(allFiles);
  const ids = await collectAllIDs(
    allFiles.filter(f => !f.includes('_mcv3-work')),
    projectPath
  );

  // Đọc PROJECT-OVERVIEW nếu có
  const overviewPath = path.join(projectPath, '_PROJECT', 'PROJECT-OVERVIEW.md');
  const hasOverview = await exists(overviewPath);
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
async function generateExecutiveSummary(
  projectPath: string,
  config: ProjectConfig
): Promise<string> {
  // Đọc các tài liệu quan trọng
  const overviewContent = await readFile(
    path.join(projectPath, '_PROJECT', 'PROJECT-OVERVIEW.md')
  ) || '';

  // Extract project name, domain, key problems từ overview
  const probMatch = overviewContent.match(/PROB-\d+[^\n]*/g) || [];
  const bgMatch = overviewContent.match(/BG-BUS-\d+[^\n]*/g) || [];

  const allFiles = await listFiles(projectPath, projectPath);
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
export async function mcSummary(
  params: McSummaryParams,
  projectRoot: string
): Promise<ToolResult> {
  if (!params.projectSlug) {
    return {
      success: false,
      message: 'Thiếu projectSlug',
      error: 'INVALID_PARAMS',
    };
  }

  const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);

  if (!(await exists(projectPath))) {
    return {
      success: false,
      message: `Dự án "${params.projectSlug}" không tồn tại`,
      error: 'PROJECT_NOT_FOUND',
    };
  }

  try {
    const config = await readJson<ProjectConfig>(
      path.join(projectPath, '_config.json')
    );

    if (!config) {
      return {
        success: false,
        message: 'Không đọc được _config.json',
        error: 'CONFIG_NOT_FOUND',
      };
    }

    const summaryType = params.summaryType || 'project';
    let summaryContent: string;

    switch (summaryType) {
      case 'project':
        summaryContent = await generateProjectSummary(projectPath, config, projectRoot);
        break;

      case 'executive':
        summaryContent = await generateExecutiveSummary(projectPath, config);
        break;

      case 'phase': {
        const phase = params.phase || config.currentPhase;
        const allFiles = await listFiles(projectPath, projectPath);
        const phaseFiles = allFiles.filter(f =>
          !f.includes('_mcv3-work') &&
          (f.includes(phase) || f.toLowerCase().includes(phase.toLowerCase()))
        );

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

        const allFiles = await listFiles(projectPath, projectPath);
        const moduleFiles = allFiles.filter(f =>
          !f.includes('_mcv3-work') &&
          f.includes(module.toUpperCase())
        );

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
    let savedPath: string | null = null;
    if (params.save) {
      const filename = `summary-${summaryType}-${new Date().toISOString().slice(0, 10)}.md`;
      const savePath = path.join(projectPath, '_mcv3-work', filename);
      await writeFile(savePath, summaryContent);
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi tạo summary: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
