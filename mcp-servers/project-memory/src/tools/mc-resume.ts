/**
 * mc-resume.ts — Tool: mc_resume
 *
 * Load checkpoint và trả về context để resume session.
 * Thường được gọi khi:
 *   - Bắt đầu session mới với dự án đang làm dở
 *   - Sau khi context window bị compact
 *   - Muốn xem lại trạng thái cuối cùng
 *
 * Kết quả trả về:
 *   - Nội dung checkpoint (tóm tắt + next actions)
 *   - Key facts của dự án (layer 0)
 *   - Phase hiện tại và gợi ý bước tiếp theo
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 21 — Resume Protocol
 */

import * as path from 'path';
import {
  readFile,
  readJson,
  exists,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_resume */
export interface McResumeParams {
  /** Slug dự án cần resume */
  projectSlug: string;
  /** Tên snapshot cụ thể (nếu không truyền → dùng latest checkpoint) */
  snapshotName?: string;
  /** Có bao gồm key-facts không (default: true) */
  includeKeyFacts?: boolean;
}

// ─── Mapping phase → lệnh tiếp theo ──────────────────────────────────────

/** Gợi ý lệnh tiếp theo theo phase hiện tại */
const PHASE_NEXT_COMMAND: Record<string, string> = {
  'phase0-init':          'Chạy `/mcv3:discovery` để bắt đầu phỏng vấn dự án',
  'phase1-discovery':     'Tiếp tục `/mcv3:discovery` hoặc chạy `/mcv3:expert-panel`',
  'phase2-expert':        'Chạy `/mcv3:biz-docs` để tạo tài liệu nghiệp vụ',
  'phase3-bizdocs':       'Chạy `/mcv3:requirements` để viết URS cho từng module',
  'phase4-requirements':  'Chạy `/mcv3:tech-design` để thiết kế kỹ thuật (MODSPEC)',
  'phase5-design':        'Chạy `/mcv3:qa-docs` để tạo TEST + USER-GUIDE',
  'phase6-qa':            'Chạy `/mcv3:code-gen` để sinh code scaffold',
  'phase7-codegen':       'Chạy `/mcv3:verify` để kiểm tra và chuẩn bị deploy',
  'phase8-verify':        'Dự án hoàn thành! Xem `/mcv3:status` để review tiến độ',
};

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_resume
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export async function mcResume(
  params: McResumeParams,
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

  // Kiểm tra dự án tồn tại
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

    // ── Đọc checkpoint ────────────────────────────────────────────────────
    let checkpointContent: string | null = null;

    if (params.snapshotName) {
      // Load snapshot cụ thể
      const snapshotPath = path.join(
        projectPath, '_mcv3-work', '_snapshots', params.snapshotName
      );
      checkpointContent = await readFile(snapshotPath);
      if (!checkpointContent) {
        return {
          success: false,
          message: `Snapshot "${params.snapshotName}" không tồn tại`,
          error: 'SNAPSHOT_NOT_FOUND',
        };
      }
    } else {
      // Load latest checkpoint
      const checkpointPath = path.join(projectPath, '_mcv3-work', '_checkpoint.md');
      checkpointContent = await readFile(checkpointPath);

      if (!checkpointContent) {
        // Không có checkpoint → tạo thông báo mặc định
        checkpointContent = `# Chưa có checkpoint\n\nDự án "${config.name}" chưa có checkpoint nào.\nPhase hiện tại: ${config.currentPhase}`;
      }
    }

    // ── Đọc key-facts nếu cần ─────────────────────────────────────────────
    let keyFactsContent = '';
    if (params.includeKeyFacts !== false) {
      const keyFactsPath = path.join(projectPath, '_PROJECT', '_key-facts.md');
      const keyFacts = await readFile(keyFactsPath);
      if (keyFacts) {
        keyFactsContent = '\n---\n## KEY FACTS (Layer 0)\n\n' + keyFacts;
      }
    }

    // ── Tạo resume context ────────────────────────────────────────────────
    const nextCommand = PHASE_NEXT_COMMAND[config.currentPhase] || 'Xem `/mcv3:status`';

    const resumeHeader = `# RESUME — ${config.name}

> **Dự án:** ${config.name} (\`${config.slug}\`)
> **Phase:** ${config.currentPhase}
> **Domain:** ${config.domain}
> **Resume lúc:** ${new Date().toISOString()}

## ⚡ Tiếp tục ngay

${nextCommand}

---
`;

    const fullContent = resumeHeader + checkpointContent + keyFactsContent;

    return {
      success: true,
      message: `✅ Đã load context cho dự án "${config.name}" (${config.currentPhase})`,
      data: {
        content: fullContent,
        projectSlug: params.projectSlug,
        projectName: config.name,
        currentPhase: config.currentPhase,
        nextCommand,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi resume: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
