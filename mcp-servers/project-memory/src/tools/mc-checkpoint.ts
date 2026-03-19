/**
 * mc-checkpoint.ts — Tool: mc_checkpoint
 *
 * Lưu checkpoint trạng thái hiện tại của dự án vào .mc-data/_mcv3-work/
 * Dùng để:
 *   - Lưu tiến độ giữa các session
 *   - Tạo restore point trước khi thực hiện thay đổi lớn
 *   - Auto-save khi kết thúc session (gọi từ hook)
 *
 * File checkpoint: _mcv3-work/_checkpoint.md (latest)
 *                  _mcv3-work/_snapshots/{timestamp}-{label}.md (versioned)
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 21 — Checkpoint Protocol
 */

import * as path from 'path';
import {
  writeFile,
  readFile,
  readJson,
  exists,
} from '../utils/file-io.js';
import type { ProjectConfig, ProjectPhase, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_checkpoint */
export interface McCheckpointParams {
  /** Slug dự án */
  projectSlug: string;
  /** Nhãn mô tả checkpoint (VD: "sau-discovery", "truoc-expert-panel") */
  label?: string;
  /** Tóm tắt những gì đã làm trong session này */
  sessionSummary?: string;
  /** Danh sách việc cần làm tiếp theo */
  nextActions?: string[];
  /** Có lưu versioned snapshot không (default: true) */
  saveSnapshot?: boolean;
  /** Tiến độ code-gen theo module (Phase 7 IMPLEMENT/SCAFFOLD mode) */
  implementationProgress?: import('../types.js').ModuleProgress[];
}

/** Dữ liệu checkpoint */
interface CheckpointData {
  projectSlug: string;
  projectName: string;
  currentPhase: ProjectPhase;
  label: string;
  savedAt: string;
  sessionSummary: string;
  nextActions: string[];
  documentsSaved: string[];
  implementationProgress?: import('../types.js').ModuleProgress[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Đọc danh sách files tài liệu đã có trong dự án (để log vào checkpoint)
 */
async function getDocumentList(projectPath: string): Promise<string[]> {
  const docs: string[] = [];

  // Tìm tất cả .md files (không kể _mcv3-work)
  const { listFiles } = await import('../utils/file-io.js');
  const allFiles = await listFiles(projectPath, projectPath);

  for (const f of allFiles) {
    // Bỏ qua internal files
    if (!f.includes('_mcv3-work') && !f.startsWith('_changelog') && !f.startsWith('_dependency')) {
      docs.push(f);
    }
  }

  return docs;
}

/**
 * Sinh nội dung Markdown cho checkpoint
 */
function generateCheckpointContent(data: CheckpointData): string {
  const nextActionsList = data.nextActions.length > 0
    ? data.nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n')
    : '_(chưa có — xác định trong session tiếp theo)_';

  const docsList = data.documentsSaved.length > 0
    ? data.documentsSaved.map(d => `- \`${d}\``).join('\n')
    : '_(chưa có tài liệu nào)_';

  const implSection = data.implementationProgress && data.implementationProgress.length > 0
    ? `\n---\n\n## Code-Gen Progress (Phase 7)\n\n| System | Module | Mode | Status | TODOs | Files |\n|--------|--------|------|--------|-------|-------|\n${
        data.implementationProgress.map(m =>
          `| ${m.systemCode} | ${m.moduleCode} | ${m.mode} | ${m.status === 'done' ? '✅ done' : m.status === 'in-progress' ? '🔄 in-progress' : '⏳ pending'} | ${m.todoCount} | ${m.filesGenerated.length} |`
        ).join('\n')
      }\n`
    : '';

  return `# CHECKPOINT — ${data.projectName}
<!-- MCV3 working state — auto-managed, không cần sửa thủ công -->

> **Dự án:** ${data.projectName} (\`${data.projectSlug}\`)
> **Phase hiện tại:** ${data.currentPhase}
> **Checkpoint:** ${data.label}
> **Lưu lúc:** ${data.savedAt}

---

## Tóm tắt Session

${data.sessionSummary || '_(chưa có tóm tắt)_'}

---

## Bước tiếp theo

${nextActionsList}

---

## Tài liệu đã có

${docsList}
${implSection}
---

## Working Context (AI Resume Point)

\`\`\`json
{
  "projectSlug": "${data.projectSlug}",
  "currentPhase": "${data.currentPhase}",
  "checkpointLabel": "${data.label}",
  "savedAt": "${data.savedAt}",
  "resumeInstruction": "Đọc MASTER-INDEX.md → Đọc file này → Tiếp tục nextActions[0]"
}
\`\`\`

---

## Hướng dẫn Resume

Khi bắt đầu session mới:
1. Gọi \`mc_resume({ projectSlug: "${data.projectSlug}" })\` để load lại context
2. Hoặc đọc file này → hiểu trạng thái → tiếp tục công việc
`;
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_checkpoint
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export async function mcCheckpoint(
  params: McCheckpointParams,
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
    // ── Đọc config dự án ────────────────────────────────────────────────
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

    // ── Chuẩn bị dữ liệu checkpoint ─────────────────────────────────────
    const now = new Date().toISOString();
    const label = params.label || `checkpoint-${now.replace(/[:.]/g, '-').slice(0, 19)}`;
    const docs = await getDocumentList(projectPath);

    const checkpointData: CheckpointData = {
      projectSlug: params.projectSlug,
      projectName: config.name,
      currentPhase: config.currentPhase,
      label,
      savedAt: now,
      sessionSummary: params.sessionSummary || '',
      nextActions: params.nextActions || [],
      documentsSaved: docs,
      implementationProgress: params.implementationProgress,
    };

    const content = generateCheckpointContent(checkpointData);

    // ── Lưu latest checkpoint ────────────────────────────────────────────
    const checkpointPath = path.join(projectPath, '_mcv3-work', '_checkpoint.md');
    await writeFile(checkpointPath, content);

    // ── Lưu versioned snapshot (nếu cần) ────────────────────────────────
    let snapshotPath: string | null = null;
    if (params.saveSnapshot !== false) {
      const timestamp = now.replace(/[:.]/g, '-').slice(0, 19);
      const snapshotFilename = `${timestamp}-${label}.md`;
      snapshotPath = path.join(projectPath, '_mcv3-work', '_snapshots', snapshotFilename);
      await writeFile(snapshotPath, content);
    }

    // ── Ghi changelog ────────────────────────────────────────────────────
    const changelogPath = path.join(projectPath, '_changelog.md');
    const changelog = await readFile(changelogPath) || '';
    const entry = `\n- [${now.split('T')[0]}] Checkpoint "${label}" — Phase: ${config.currentPhase}`;
    await writeFile(changelogPath, changelog + entry);

    return {
      success: true,
      message: `✅ Đã lưu checkpoint "${label}" cho dự án "${config.name}"`,
      data: {
        checkpointPath: path.relative(projectRoot, checkpointPath),
        snapshotPath: snapshotPath ? path.relative(projectRoot, snapshotPath) : null,
        phase: config.currentPhase,
        documentCount: docs.length,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi lưu checkpoint: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
