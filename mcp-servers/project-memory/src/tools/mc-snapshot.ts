/**
 * mc-snapshot.ts — Tool: mc_snapshot
 *
 * Tạo snapshot đầy đủ toàn bộ project state tại một thời điểm.
 * Khác với mc_checkpoint (chỉ lưu metadata), mc_snapshot lưu
 * TOÀN BỘ nội dung tất cả documents vào 1 bundle file.
 *
 * Dùng để:
 *   - Tạo backup point trước khi thay đổi lớn
 *   - Rollback về trạng thái cụ thể (kết hợp mc_rollback)
 *   - Archive milestone của dự án
 *
 * Output: .mc-data/projects/{slug}/_mcv3-work/_snapshots/{timestamp}-{label}.bundle.json
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Snapshot Protocol
 */

import * as path from 'path';
import {
  readFile,
  readJson,
  writeJson,
  exists,
  listFiles,
  getFileStat,
  ensureDir,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_snapshot */
export interface McSnapshotParams {
  /** Slug dự án */
  projectSlug: string;
  /** Nhãn mô tả snapshot (VD: "truoc-refactor-urs", "milestone-phase4") */
  label?: string;
  /** Có include working files không (default: false — chỉ lưu docs) */
  includeWorkFiles?: boolean;
  /** Ghi chú về snapshot này */
  notes?: string;
}

/** Cấu trúc snapshot bundle */
interface SnapshotBundle {
  /** Metadata của snapshot */
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
  /** Config dự án tại thời điểm snapshot */
  config: ProjectConfig;
  /** Nội dung tất cả documents */
  documents: Array<{
    path: string;
    content: string;
    size: number;
    updatedAt: string | null;
  }>;
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_snapshot
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export async function mcSnapshot(
  params: McSnapshotParams,
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
    // ── Đọc config ─────────────────────────────────────────────────────
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

    // ── Collect tất cả documents ────────────────────────────────────────
    const allFiles = await listFiles(projectPath, projectPath);
    const documents: SnapshotBundle['documents'] = [];
    let totalBytes = 0;

    for (const relativePath of allFiles) {
      // Bỏ qua working files nếu không được yêu cầu
      if (!params.includeWorkFiles && relativePath.includes('_mcv3-work')) {
        continue;
      }
      // Bỏ qua _changelog.md (tự regenerate được)
      if (relativePath === '_changelog.md') {
        continue;
      }

      const fullPath = path.join(projectPath, relativePath);
      const content = await readFile(fullPath);
      if (content === null) continue;

      const stat = await getFileStat(fullPath);
      const size = Buffer.byteLength(content, 'utf-8');
      totalBytes += size;

      documents.push({
        path: relativePath,
        content,
        size,
        updatedAt: stat?.updatedAt || null,
      });
    }

    // ── Tạo snapshot bundle ────────────────────────────────────────────
    const now = new Date().toISOString();
    const timestamp = now.replace(/[:.]/g, '-').slice(0, 19);
    const label = params.label || `snapshot-${timestamp}`;
    const safeLabel = label.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();

    const bundle: SnapshotBundle = {
      meta: {
        projectSlug: params.projectSlug,
        projectName: config.name,
        label,
        createdAt: now,
        phase: config.currentPhase,
        mcv3Version: config.mcv3Version,
        notes: params.notes || '',
        totalFiles: documents.length,
        totalBytes,
      },
      config,
      documents,
    };

    // ── Lưu snapshot ─────────────────────────────────────────────────
    const snapshotsDir = path.join(projectPath, '_mcv3-work', '_snapshots');
    await ensureDir(snapshotsDir);

    const snapshotFilename = `${timestamp}-${safeLabel}.bundle.json`;
    const snapshotPath = path.join(snapshotsDir, snapshotFilename);
    await writeJson(snapshotPath, bundle);

    const snapshotSize = Buffer.byteLength(JSON.stringify(bundle), 'utf-8');

    return {
      success: true,
      message: `✅ Snapshot "${label}" đã được tạo cho dự án "${config.name}"`,
      data: {
        snapshotPath: path.relative(projectRoot, snapshotPath).replace(/\\/g, '/'),
        label,
        phase: config.currentPhase,
        documentCount: documents.length,
        totalBytes,
        snapshotSizeKB: Math.round(snapshotSize / 1024),
        timestamp: now,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi tạo snapshot: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
