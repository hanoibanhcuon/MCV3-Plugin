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

import * as path from 'path';
import {
  writeFile,
  readJson,
  writeJson,
  exists,
} from '../utils/file-io.js';
import type { McSaveParams, ToolResult, ProjectConfig } from '../types.js';

// ─── Helper ──────────────────────────────────────────────────────────────

/**
 * Append entry vào _changelog.md
 */
async function appendChangelog(
  changelogPath: string,
  filePath: string,
  action: 'created' | 'updated'
): Promise<void> {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];
  const timeStr = now.split('T')[1].split('.')[0];

  const entry = `\n## ${dateStr} ${timeStr}\n- ${action === 'created' ? '➕ Tạo mới' : '✏️ Cập nhật'}: \`${filePath}\`\n`;

  try {
    // Đọc nội dung hiện tại
    const fs = await import('fs/promises');
    let current = '';
    try {
      current = await fs.readFile(changelogPath, 'utf-8');
    } catch {
      current = `# CHANGELOG\n`;
    }
    await fs.writeFile(changelogPath, current + entry, 'utf-8');
  } catch {
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
export async function mcSave(
  params: McSaveParams,
  projectRoot: string
): Promise<ToolResult> {
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
  const projectPath = path.join(
    projectRoot,
    '.mc-data',
    'projects',
    params.projectSlug
  );

  // Kiểm tra project tồn tại
  if (!(await exists(projectPath))) {
    return {
      success: false,
      message: `Dự án "${params.projectSlug}" không tồn tại. Chạy mc_init_project trước.`,
      error: 'PROJECT_NOT_FOUND',
    };
  }

  const targetPath = path.join(projectPath, params.filePath);
  const isUpdate = await exists(targetPath);

  // ── Ghi file ─────────────────────────────────────────────────────────
  try {
    await writeFile(targetPath, params.content);

    // ── Cập nhật metadata ────────────────────────────────────────────
    // 1. Cập nhật updatedAt trong _config.json
    const configPath = path.join(projectPath, '_config.json');
    const config = await readJson<ProjectConfig>(configPath);
    if (config) {
      config.updatedAt = new Date().toISOString();
      await writeJson(configPath, config);
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi lưu tài liệu: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
