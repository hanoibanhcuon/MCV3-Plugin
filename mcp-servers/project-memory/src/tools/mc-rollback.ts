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

import * as path from 'path';
import * as fs from 'fs/promises';
import {
  readJson,
  writeFile,
  writeJson,
  exists,
  listFiles,
  ensureDir,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_rollback */
export interface McRollbackParams {
  /** Slug dự án */
  projectSlug: string;
  /** Tên snapshot để rollback về (VD: "2024-01-15T10-30-00-truoc-refactor.bundle.json") */
  snapshotName: string;
  /** Bỏ qua xác nhận (mặc định false — cần confirm) */
  force?: boolean;
}

/** Cấu trúc snapshot bundle (import từ mc-snapshot nếu cần) */
interface SnapshotBundle {
  meta: {
    projectSlug: string;
    projectName: string;
    label: string;
    createdAt: string;
    phase: string;
    mcv3Version: string;
    notes: string;
    totalFiles: number;
    totalBytes: number;
  };
  config: ProjectConfig;
  documents: Array<{
    path: string;
    content: string;
    size: number;
    updatedAt: string | null;
  }>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Liệt kê các snapshots có sẵn trong project
 */
async function listSnapshots(projectPath: string): Promise<string[]> {
  const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
  if (!(await exists(snapshotsDir))) return [];

  const entries = await fs.readdir(snapshotsDir);
  return entries
    .filter(f => f.endsWith('.bundle.json'))
    .sort()
    .reverse(); // Mới nhất trước
}

/**
 * Tạo safety snapshot trước khi rollback
 */
async function createSafetySnapshot(
  projectPath: string,
  config: ProjectConfig,
  projectRoot: string
): Promise<string> {
  const { mcSnapshot } = await import('./mc-snapshot.js');
  const result = await mcSnapshot(
    {
      projectSlug: config.slug,
      label: `pre-rollback-${new Date().toISOString().slice(0, 10)}`,
      notes: 'Auto-created safety snapshot trước khi rollback',
    },
    projectRoot
  );

  return result.success
    ? (result.data as { snapshotPath: string }).snapshotPath
    : 'FAILED';
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_rollback
 */
export async function mcRollback(
  params: McRollbackParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate ──────────────────────────────────────────────────────────
  if (!params.projectSlug || !params.snapshotName) {
    return {
      success: false,
      message: 'Thiếu projectSlug hoặc snapshotName',
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

  // ── Tìm snapshot ──────────────────────────────────────────────────────
  const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
  const snapshotPath = path.join(snapshotsDir, params.snapshotName);

  if (!(await exists(snapshotPath))) {
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
    const bundle = await readJson<SnapshotBundle>(snapshotPath);
    if (!bundle) {
      return {
        success: false,
        message: `Không đọc được snapshot "${params.snapshotName}"`,
        error: 'SNAPSHOT_CORRUPT',
      };
    }

    // ── Đọc config hiện tại ──────────────────────────────────────────────
    const currentConfig = await readJson<ProjectConfig>(
      path.join(projectPath, '_config.json')
    );

    // ── Kiểm tra nếu không force — warning ────────────────────────────────
    if (!params.force) {
      const currentFiles = await listFiles(projectPath, projectPath);
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
    const currentFiles = await listFiles(projectPath, projectPath);
    for (const relativePath of currentFiles) {
      if (!relativePath.includes('_mcv3-work')) {
        const fullPath = path.join(projectPath, relativePath);
        // Chỉ bỏ qua ENOENT (file đã bị xóa trước đó), throw các lỗi khác
        await fs.unlink(fullPath).catch((err: NodeJS.ErrnoException) => {
          if (err.code !== 'ENOENT') throw err;
        });
      }
    }

    // ── Restore documents từ snapshot ─────────────────────────────────
    let restoredCount = 0;
    for (const doc of bundle.documents) {
      const targetPath = path.join(projectPath, doc.path);
      await ensureDir(path.dirname(targetPath));
      await writeFile(targetPath, doc.content);
      restoredCount++;
    }

    // ── Restore config ─────────────────────────────────────────────────
    await writeJson(path.join(projectPath, '_config.json'), bundle.config);

    // ── Ghi changelog ─────────────────────────────────────────────────
    const changelogPath = path.join(projectPath, '_changelog.md');
    const now = new Date().toISOString();
    const changelogEntry = `\n## ${now.split('T')[0]} — ROLLBACK\n` +
      `- Rollback về snapshot: "${bundle.meta.label}" (${bundle.meta.createdAt})\n` +
      `- Safety snapshot: ${safetyPath}\n` +
      `- Files restored: ${restoredCount}\n`;

    const existingChangelog = await import('../utils/file-io.js')
      .then(m => m.readFile(changelogPath))
      .catch(() => '# CHANGELOG\n');

    await writeFile(changelogPath, (existingChangelog || '# CHANGELOG\n') + changelogEntry);

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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi rollback: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
