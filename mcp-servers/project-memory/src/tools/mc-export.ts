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

import * as path from 'path';
import {
  writeFile,
  readFile,
  readJson,
  listFiles,
  exists,
  getFileStat,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_export */
export interface McExportParams {
  /** Slug dự án */
  projectSlug: string;
  /** Loại export: "bundle" | "summary" | "phase" | "index" (default: "summary") */
  exportType?: 'bundle' | 'summary' | 'phase' | 'index';
  /** Phase cần export (dùng cho exportType="phase", VD: "_PROJECT", "ERP/P1-REQUIREMENTS") */
  targetPath?: string;
  /** Tên file output (không có extension, default: auto-generated) */
  outputName?: string;
}

// ─── Export Functions ──────────────────────────────────────────────────────

/**
 * Export summary: tạo báo cáo tổng quan dự án theo phases
 */
async function exportSummary(
  projectPath: string,
  config: ProjectConfig,
  projectRoot: string
): Promise<string> {
  const now = new Date().toISOString();

  // Đọc MASTER-INDEX
  const masterIndex = await readFile(path.join(projectPath, 'MASTER-INDEX.md')) || '';

  // Đọc checkpoint
  const checkpoint = await readFile(
    path.join(projectPath, '_mcv3-work', '_checkpoint.md')
  ) || 'Chưa có checkpoint';

  // Liệt kê tài liệu theo thư mục
  const allFiles = await listFiles(projectPath, projectPath);
  const projectDocs = allFiles.filter(f => !f.includes('_mcv3-work') && !f.startsWith('_'));

  // Nhóm theo thư mục
  const docsByDir: Record<string, string[]> = {};
  for (const f of projectDocs) {
    const dir = path.dirname(f).replace(/\\/g, '/');
    if (!docsByDir[dir]) docsByDir[dir] = [];
    docsByDir[dir].push(path.basename(f));
  }

  const docSections = Object.entries(docsByDir)
    .map(([dir, files]) =>
      `### ${dir}\n${files.map(f => `- ${f}`).join('\n')}`
    )
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
async function exportBundle(
  projectPath: string,
  config: ProjectConfig,
  targetSubPath: string,
  projectRoot: string
): Promise<string> {
  const now = new Date().toISOString();
  const targetFullPath = path.join(projectPath, targetSubPath);

  if (!(await exists(targetFullPath))) {
    throw new Error(`Thư mục không tồn tại: ${targetSubPath}`);
  }

  const files = await listFiles(targetFullPath, targetFullPath);
  const sections: string[] = [
    `# BUNDLE EXPORT — ${config.name} / ${targetSubPath}`,
    `<!-- Tạo bởi mc_export — ${now} -->`,
    `> Gộp ${files.length} files từ \`${targetSubPath}\``,
    '',
  ];

  for (const file of files) {
    const fullFilePath = path.join(targetFullPath, file);
    const content = await readFile(fullFilePath) || '';
    sections.push(
      `\n---\n\n# File: ${file}\n\n${content}`
    );
  }

  return sections.join('\n');
}

/**
 * Export index: tạo README với links đến tất cả tài liệu
 */
async function exportIndex(
  projectPath: string,
  config: ProjectConfig,
  projectRoot: string
): Promise<string> {
  const now = new Date().toISOString();
  const allFiles = await listFiles(projectPath, projectPath);

  // Lọc và nhóm files
  const docFiles = allFiles.filter(
    f => !f.includes('_mcv3-work') && f.endsWith('.md')
  );

  const grouped: Record<string, Array<{ name: string; path: string }>> = {};
  for (const f of docFiles) {
    const dir = path.dirname(f).replace(/\\/g, '/');
    if (!grouped[dir]) grouped[dir] = [];
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
export async function mcExport(
  params: McExportParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate ──────────────────────────────────────────────────────────
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
    // ── Đọc config ────────────────────────────────────────────────────────
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
        exportContent = await exportBundle(
          projectPath, config, params.targetPath, projectRoot
        );
        outputFilename = params.outputName ||
          `BUNDLE-${params.targetPath.replace(/\//g, '-')}-${now}`;
        break;

      case 'phase':
        const targetPath = params.targetPath || '_PROJECT';
        exportContent = await exportBundle(
          projectPath, config, targetPath, projectRoot
        );
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
    await writeFile(outputPath, exportContent);

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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi export: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
