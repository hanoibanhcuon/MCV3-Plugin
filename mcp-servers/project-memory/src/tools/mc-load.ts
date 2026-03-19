/**
 * mc-load.ts — Tool: mc_load
 *
 * Đọc artifact từ project memory với Smart Context Layering support.
 *
 * Layer support (theo kiến trúc MCV3 v3.1 Section 5.2):
 *   Layer 0: Đọc file _key-facts.md (~ 500 bytes)
 *   Layer 1: Chỉ đọc phần DEPENDENCY MAP trong tài liệu (~200 bytes)
 *   Layer 2: Đọc các sections liên quan (~5-10KB) — dùng headers
 *   Layer 3: Đọc toàn bộ file (default)
 */

import * as path from 'path';
import { readFile, exists } from '../utils/file-io.js';
import type { McLoadParams, ToolResult } from '../types.js';

// ─── Layer Extraction Functions ───────────────────────────────────────────

/**
 * Layer 1: Trích xuất phần DEPENDENCY MAP từ đầu tài liệu
 * Tìm block "## 📎 DEPENDENCY MAP" đến header tiếp theo
 */
function extractDependencyMap(content: string): string {
  // Tìm DEPENDENCY MAP section
  const depMapPattern = /##\s*(?:📎\s*)?DEPENDENCY MAP[\s\S]*?(?=\n##\s|\n---\s*\n|\s*$)/i;
  const match = content.match(depMapPattern);

  if (match) {
    return match[0].trim();
  }

  // Fallback: trả về frontmatter (phần trước header đầu tiên)
  const frontmatterEnd = content.indexOf('\n## ');
  if (frontmatterEnd > 0) {
    return content.substring(0, frontmatterEnd).trim();
  }

  return content.substring(0, 500); // Fallback: 500 chars đầu
}

/**
 * Layer 2: Đọc các sections "liên quan" — thực tế trả về tóm tắt theo headers
 * Heuristic: bỏ qua sections dài (ví dụ: SQL blocks, chi tiết ít cần)
 */
function extractRelevantSections(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inLongCodeBlock = false;
  let consecutiveCodeLines = 0;
  const MAX_CODE_LINES = 20; // Bỏ qua code block > 20 dòng

  for (const line of lines) {
    if (line.startsWith('```')) {
      inLongCodeBlock = !inLongCodeBlock;
      if (!inLongCodeBlock) {
        consecutiveCodeLines = 0;
      }
      result.push(line);
      continue;
    }

    if (inLongCodeBlock) {
      consecutiveCodeLines++;
      if (consecutiveCodeLines <= MAX_CODE_LINES) {
        result.push(line);
      } else if (consecutiveCodeLines === MAX_CODE_LINES + 1) {
        result.push('  ... (truncated — use layer 3 for full content)');
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_load
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 * @returns ToolResult với content đã load
 */
export async function mcLoad(
  params: McLoadParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate ──────────────────────────────────────────────────────────
  if (!params.projectSlug) {
    return { success: false, message: 'Thiếu projectSlug', error: 'INVALID_PARAMS' };
  }

  if (!params.filePath) {
    return { success: false, message: 'Thiếu filePath', error: 'INVALID_PARAMS' };
  }

  // Security: ngăn path traversal — kiểm tra sơ bộ trước khi resolve
  const normalizedPath = path.normalize(params.filePath).replace(/\\/g, '/');
  if (normalizedPath.startsWith('..') || path.isAbsolute(params.filePath)) {
    return { success: false, message: 'filePath không hợp lệ', error: 'INVALID_PATH' };
  }

  // ── Tính đường dẫn ───────────────────────────────────────────────────
  const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);

  if (!(await exists(projectPath))) {
    return {
      success: false,
      message: `Dự án "${params.projectSlug}" không tồn tại`,
      error: 'PROJECT_NOT_FOUND',
    };
  }

  // Xử lý đặc biệt: Layer 0 → tự động tìm file _key-facts.md
  let targetFilePath = params.filePath;
  if (params.layer === 0) {
    // Tìm _key-facts.md trong hệ thống của project
    // Ưu tiên: theo filePath truyền vào, hoặc tìm trong _PROJECT
    if (!params.filePath.includes('key-facts')) {
      // Thử tìm key-facts trong cùng thư mục
      const dir = path.dirname(params.filePath);
      const keyFactsPath = path.join(dir, '_key-facts.md');
      if (await exists(path.join(projectPath, keyFactsPath))) {
        targetFilePath = keyFactsPath;
      }
    }
  }

  const fullPath = path.join(projectPath, targetFilePath);

  // Security: xác minh resolved path nằm trong projectPath (chặn mọi path traversal còn lại)
  const resolvedFull = path.resolve(fullPath);
  const resolvedProject = path.resolve(projectPath);
  if (!resolvedFull.startsWith(resolvedProject + path.sep) && resolvedFull !== resolvedProject) {
    return { success: false, message: 'filePath không hợp lệ: path traversal bị chặn', error: 'INVALID_PATH' };
  }

  // ── Đọc file ─────────────────────────────────────────────────────────
  const content = await readFile(fullPath);

  if (content === null) {
    return {
      success: false,
      message: `File không tồn tại: ${targetFilePath}`,
      error: 'FILE_NOT_FOUND',
    };
  }

  // ── Apply layer filtering ─────────────────────────────────────────────
  const layer = params.layer ?? 3; // Default: full document
  let processedContent: string;

  switch (layer) {
    case 0:
      // Layer 0: Key facts only (toàn bộ file nhỏ, không cắt)
      processedContent = content;
      break;

    case 1:
      // Layer 1: Chỉ DEPENDENCY MAP
      processedContent = extractDependencyMap(content);
      break;

    case 2:
      // Layer 2: Sections (bỏ code blocks dài)
      processedContent = extractRelevantSections(content);
      break;

    case 3:
    default:
      // Layer 3: Full document
      processedContent = content;
      break;
  }

  // ── Tính metadata ─────────────────────────────────────────────────────
  const originalSize = Buffer.byteLength(content, 'utf8');
  const processedSize = Buffer.byteLength(processedContent, 'utf8');

  return {
    success: true,
    message: `✅ Đã load: ${targetFilePath} (Layer ${layer}, ${processedSize} bytes${layer < 3 ? ` / ${originalSize} full` : ''})`,
    data: {
      filePath: targetFilePath,
      content: processedContent,
      layer,
      originalSize,
      processedSize,
    },
  };
}
