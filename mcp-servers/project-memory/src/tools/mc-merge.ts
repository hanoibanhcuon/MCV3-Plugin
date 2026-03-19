/**
 * mc-merge.ts — Tool: mc_merge
 *
 * Merge nội dung từ nhiều sources vào một document.
 * Dùng khi nhiều agents cùng tạo output cho cùng một document
 * (VD: Domain Expert + Finance Expert → EXPERT-LOG.md).
 *
 * Modes:
 *   - append: Thêm content vào cuối document hiện có
 *   - section: Merge vào một section cụ thể (tìm theo heading)
 *   - replace-section: Thay thế nội dung một section
 *   - smart: Tự phát hiện section và merge thông minh
 */

import * as path from 'path';
import {
  readFile,
  writeFile,
  exists,
} from '../utils/file-io.js';
import type { ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_merge */
export interface McMergeParams {
  /** Slug dự án */
  projectSlug: string;
  /** File đích để merge vào */
  targetFile: string;
  /** Nội dung cần merge */
  content: string;
  /** Mode merge */
  mode?: 'append' | 'section' | 'replace-section' | 'smart';
  /** Tên section target (dùng với mode=section/replace-section) */
  sectionName?: string;
  /** Label mô tả nguồn gốc content (VD: "Domain Expert Session") */
  sourceLabel?: string;
  /** Tạo document mới nếu chưa tồn tại */
  createIfNotExists?: boolean;
}

// ─── Section Helpers ──────────────────────────────────────────────────────

/**
 * Tìm vị trí section trong document
 * Trả về { start, end } — indexes của lines
 */
function findSectionBounds(
  lines: string[],
  sectionName: string
): { start: number; end: number } | null {
  // Tìm heading chứa sectionName
  const pattern = new RegExp(`^#+\\s+.*${escapeRegex(sectionName)}`, 'i');
  let startIndex = -1;
  let headingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      startIndex = i;
      // Tính level của heading (#, ##, ###, ...)
      const match = lines[i].match(/^(#+)/);
      headingLevel = match ? match[1].length : 1;
      break;
    }
  }

  if (startIndex === -1) return null;

  // Tìm end: đến heading cùng level hoặc cao hơn
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const match = lines[i].match(/^(#+)\s/);
    if (match && match[1].length <= headingLevel) {
      endIndex = i;
      break;
    }
  }

  return { start: startIndex, end: endIndex };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Smart merge: Phát hiện sections trong content mới và merge từng section
 */
function smartMerge(existingContent: string, newContent: string): string {
  const existingLines = existingContent.split('\n');
  let result = [...existingLines];

  // Tìm tất cả headings trong new content
  const newLines = newContent.split('\n');
  let currentSectionStart = -1;
  let currentSectionName = '';
  let currentSectionLevel = 0;

  const sections: Array<{ name: string; level: number; lines: string[] }> = [];

  for (let i = 0; i < newLines.length; i++) {
    const match = newLines[i].match(/^(#+)\s+(.+)/);
    if (match) {
      // Lưu section trước nếu có
      if (currentSectionStart >= 0) {
        sections.push({
          name: currentSectionName,
          level: currentSectionLevel,
          lines: newLines.slice(currentSectionStart, i),
        });
      }
      currentSectionStart = i;
      currentSectionLevel = match[1].length;
      currentSectionName = match[2];
    }
  }
  // Lưu section cuối
  if (currentSectionStart >= 0) {
    sections.push({
      name: currentSectionName,
      level: currentSectionLevel,
      lines: newLines.slice(currentSectionStart),
    });
  }

  // Nếu không có sections (plain content), append
  if (sections.length === 0) {
    return existingContent + '\n\n' + newContent;
  }

  // Merge từng section
  for (const section of sections) {
    const bounds = findSectionBounds(result, section.name);
    if (bounds) {
      // Section đã tồn tại → append vào cuối section
      const beforeSection = result.slice(0, bounds.end);
      const afterSection = result.slice(bounds.end);
      result = [
        ...beforeSection,
        '',
        ...section.lines.slice(1), // Bỏ heading của new section
        ...afterSection,
      ];
    } else {
      // Section chưa tồn tại → append vào cuối document
      result = [...result, '', ...section.lines];
    }
  }

  return result.join('\n');
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_merge
 */
export async function mcMerge(
  params: McMergeParams,
  projectRoot: string
): Promise<ToolResult> {
  if (!params.projectSlug || !params.targetFile || !params.content) {
    return {
      success: false,
      message: 'Thiếu projectSlug, targetFile hoặc content',
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

  const targetPath = path.join(projectPath, params.targetFile);
  const mode = params.mode || 'append';

  try {
    // ── Đọc hoặc tạo document target ────────────────────────────────
    let existingContent: string;

    if (await exists(targetPath)) {
      existingContent = await readFile(targetPath) || '';
    } else if (params.createIfNotExists) {
      existingContent = '';
    } else {
      return {
        success: false,
        message: `File "${params.targetFile}" không tồn tại. Dùng createIfNotExists: true để tạo mới.`,
        error: 'FILE_NOT_FOUND',
      };
    }

    // ── Thêm source label nếu có ─────────────────────────────────────
    const contentToMerge = params.sourceLabel
      ? `\n<!-- Merged from: ${params.sourceLabel} on ${new Date().toISOString()} -->\n${params.content}`
      : params.content;

    // ── Thực hiện merge theo mode ─────────────────────────────────────
    let mergedContent: string;

    switch (mode) {
      case 'append':
        mergedContent = existingContent
          ? existingContent.trimEnd() + '\n\n---\n\n' + contentToMerge.trimStart()
          : contentToMerge;
        break;

      case 'section': {
        if (!params.sectionName) {
          return {
            success: false,
            message: 'Cần truyền sectionName khi mode=section',
            error: 'INVALID_PARAMS',
          };
        }

        const lines = existingContent.split('\n');
        const bounds = findSectionBounds(lines, params.sectionName);

        if (!bounds) {
          // Section không tồn tại → append
          mergedContent = existingContent + '\n\n' + contentToMerge;
        } else {
          // Insert content vào cuối section
          const before = lines.slice(0, bounds.end);
          const after = lines.slice(bounds.end);
          mergedContent = [...before, '', contentToMerge, ...after].join('\n');
        }
        break;
      }

      case 'replace-section': {
        if (!params.sectionName) {
          return {
            success: false,
            message: 'Cần truyền sectionName khi mode=replace-section',
            error: 'INVALID_PARAMS',
          };
        }

        const lines = existingContent.split('\n');
        const bounds = findSectionBounds(lines, params.sectionName);

        if (!bounds) {
          // Section không tồn tại → append
          mergedContent = existingContent + '\n\n' + contentToMerge;
        } else {
          // Thay thế toàn bộ section
          const before = lines.slice(0, bounds.start);
          const after = lines.slice(bounds.end);
          mergedContent = [...before, contentToMerge, ...after].join('\n');
        }
        break;
      }

      case 'smart':
        mergedContent = smartMerge(existingContent, contentToMerge);
        break;

      default:
        mergedContent = existingContent + '\n\n' + contentToMerge;
    }

    // ── Lưu kết quả ──────────────────────────────────────────────────
    await writeFile(targetPath, mergedContent);

    return {
      success: true,
      message: `✅ Merge thành công vào "${params.targetFile}" (mode: ${mode})`,
      data: {
        targetFile: params.targetFile,
        mode,
        originalSize: existingContent.length,
        mergedSize: mergedContent.length,
        sectionName: params.sectionName,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi merge: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
