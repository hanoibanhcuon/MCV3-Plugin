/**
 * mc-status.ts — Tool: mc_status
 *
 * Hiển thị trạng thái dự án MCV3:
 * - Phase hiện tại
 * - Số lượng tài liệu theo từng phase
 * - Danh sách systems
 * - Phase progress (% hoàn thành)
 *
 * Nếu không truyền projectSlug → liệt kê tất cả projects
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { exists, readJson } from '../utils/file-io.js';
import type {
  McStatusParams,
  StatusResult,
  ProjectConfig,
  ProjectStatusSummary,
  PhaseProgressItem,
  ProjectPhase,
} from '../types.js';

// ─── Phase Configuration ──────────────────────────────────────────────────

/**
 * Cấu hình từng phase: thư mục, files cần có để coi là "done"
 */
const PHASE_CONFIG: Array<{
  phase: ProjectPhase | string;
  label: string;
  requiredDirs: string[];
  requiredFiles: string[];
}> = [
  {
    phase: 'phase0-init',
    label: 'Phase 0: Init',
    requiredDirs: [],
    requiredFiles: ['MASTER-INDEX.md', '_config.json'],
  },
  {
    phase: 'phase1-discovery',
    label: 'Phase 1: Discovery',
    requiredDirs: ['_PROJECT'],
    requiredFiles: ['_PROJECT/PROJECT-OVERVIEW.md'],
  },
  {
    phase: 'phase2-expert',
    label: 'Phase 2: Expert Analysis',
    requiredDirs: [],
    requiredFiles: ['_PROJECT/EXPERT-LOG.md'],
  },
  {
    phase: 'phase3-bizdocs',
    label: 'Phase 3: Business Docs',
    requiredDirs: ['_PROJECT/BIZ-POLICY', '_PROJECT/PROCESS'],
    requiredFiles: ['_PROJECT/DATA-DICTIONARY.md'],
  },
  {
    phase: 'phase4-requirements',
    label: 'Phase 4: Requirements (URS)',
    requiredDirs: [], // Dynamic: kiểm tra có {SYS}/P1-REQUIREMENTS/URS-*.md không
    requiredFiles: [],
  },
  {
    phase: 'phase5-design',
    label: 'Phase 5: Technical Design (MODSPEC)',
    requiredDirs: [],
    requiredFiles: [],
  },
  {
    phase: 'phase6-qa',
    label: 'Phase 6: QA & Docs',
    requiredDirs: [],
    requiredFiles: [],
  },
  {
    phase: 'phase7-codegen',
    label: 'Phase 7: Code Gen',
    requiredDirs: [],
    requiredFiles: [],
  },
  {
    phase: 'phase8-verify',
    label: 'Phase 8: Verify & Deploy',
    requiredDirs: [],
    requiredFiles: ['_PROJECT/DEPLOY-OPS.md', '_VERIFY-CROSS/verification-report.md'],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────

/**
 * Đếm số file .md trong thư mục (đệ quy, bỏ _mcv3-work)
 */
async function countMarkdownFiles(dirPath: string): Promise<number> {
  if (!(await exists(dirPath))) return 0;

  let count = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '_mcv3-work' || entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += await countMarkdownFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        count++;
      }
    }
  } catch {
    // Ignore read errors
  }
  return count;
}

/**
 * Kiểm tra phase có "done" không dựa trên files tồn tại
 */
async function checkPhaseStatus(
  projectPath: string,
  phaseConfig: typeof PHASE_CONFIG[0]
): Promise<'not-started' | 'in-progress' | 'done'> {
  // Kiểm tra required files
  let completedFiles = 0;
  for (const file of phaseConfig.requiredFiles) {
    if (await exists(path.join(projectPath, file))) {
      completedFiles++;
    }
  }

  // Kiểm tra required dirs
  let completedDirs = 0;
  for (const dir of phaseConfig.requiredDirs) {
    if (await exists(path.join(projectPath, dir))) {
      completedDirs++;
    }
  }

  const totalRequired = phaseConfig.requiredFiles.length + phaseConfig.requiredDirs.length;

  if (totalRequired === 0) {
    // Phase không có required files → check by document count
    return 'not-started';
  }

  const totalCompleted = completedFiles + completedDirs;

  if (totalCompleted === 0) return 'not-started';
  if (totalCompleted === totalRequired) return 'done';
  return 'in-progress';
}

/**
 * Build status summary cho một project
 */
async function buildProjectStatus(
  projectPath: string,
  slug: string
): Promise<ProjectStatusSummary | null> {
  // Đọc config
  const config = await readJson<ProjectConfig>(path.join(projectPath, '_config.json'));
  if (!config) return null;

  // Đếm tổng số tài liệu
  const documentCount = await countMarkdownFiles(projectPath);

  // Kiểm tra phase progress
  const phaseProgress: PhaseProgressItem[] = [];
  for (const phaseConf of PHASE_CONFIG) {
    const status = await checkPhaseStatus(projectPath, phaseConf);
    phaseProgress.push({
      phase: phaseConf.phase,
      label: phaseConf.label,
      status,
      documentCount: 0, // Simplified — không count per phase
    });
  }

  return {
    slug: config.slug || slug,
    name: config.name,
    domain: config.domain,
    currentPhase: config.currentPhase,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
    documentCount,
    systems: config.systems || [],
    phaseProgress,
  };
}

/**
 * Format status thành text dễ đọc để hiển thị cho user
 */
function formatStatusText(summary: ProjectStatusSummary): string {
  const lines: string[] = [];

  lines.push(`## 📊 Dự án: ${summary.name}`);
  lines.push(`- **Slug:** ${summary.slug}`);
  lines.push(`- **Ngành:** ${summary.domain}`);
  lines.push(`- **Phase hiện tại:** ${summary.currentPhase}`);
  lines.push(`- **Tổng tài liệu:** ${summary.documentCount} files`);
  lines.push(`- **Tạo lúc:** ${summary.createdAt.split('T')[0]}`);
  lines.push(`- **Cập nhật:** ${summary.updatedAt.split('T')[0]}`);

  if (summary.systems.length > 0) {
    lines.push('\n### Systems:');
    for (const sys of summary.systems) {
      lines.push(`- **${sys.code}**: ${sys.name} (${sys.status})`);
    }
  } else {
    lines.push('\n### Systems: _(chưa có — bắt đầu với /mcv3:discovery)_');
  }

  lines.push('\n### Phase Progress:');
  for (const phase of summary.phaseProgress) {
    const icon = phase.status === 'done' ? '✅'
      : phase.status === 'in-progress' ? '🔄'
      : '⏳';
    lines.push(`${icon} ${phase.label}`);
  }

  lines.push('\n### Bước tiếp theo:');
  const nextPhase = summary.phaseProgress.find(p => p.status !== 'done');
  if (nextPhase) {
    const phaseToSkill: Record<string, string> = {
      'phase0-init': '/mcv3:discovery (Bắt đầu Discovery)',
      'phase1-discovery': '/mcv3:expert-panel (Phân tích chuyên gia)',
      'phase2-expert': '/mcv3:biz-docs (Tạo tài liệu nghiệp vụ)',
      'phase3-bizdocs': '/mcv3:requirements (Viết URS)',
      'phase4-requirements': '/mcv3:tech-design (Thiết kế kỹ thuật)',
      'phase5-design': '/mcv3:qa-docs (Tạo test & docs)',
      'phase6-qa': '/mcv3:code-gen (Generate code)',
      'phase7-codegen': '/mcv3:verify (Verify & Deploy)',
    };
    const skill = phaseToSkill[nextPhase.phase] || nextPhase.phase;
    lines.push(`→ Chạy \`${skill}\``);
  } else {
    lines.push('🎉 Tất cả phases hoàn thành!');
  }

  return lines.join('\n');
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_status
 */
export async function mcStatus(
  params: McStatusParams,
  projectRoot: string
): Promise<StatusResult> {
  const mcDataRoot = path.join(projectRoot, '.mc-data', 'projects');

  // ── Case 1: Không có projectSlug → liệt kê tất cả projects ───────────
  if (!params.projectSlug) {
    if (!(await exists(mcDataRoot))) {
      return {
        success: true,
        message: 'Chưa có dự án nào. Chạy mc_init_project để tạo dự án mới.',
        data: { projects: [] },
      };
    }

    const entries = await fs.readdir(mcDataRoot, { withFileTypes: true });
    const projectSlugs = entries
      .filter(e => e.isDirectory())
      .map(e => e.name);

    if (projectSlugs.length === 0) {
      return {
        success: true,
        message: 'Chưa có dự án nào. Chạy mc_init_project để tạo dự án mới.',
        data: { projects: [] },
      };
    }

    const projects: ProjectStatusSummary[] = [];
    for (const slug of projectSlugs) {
      const projectPath = path.join(mcDataRoot, slug);
      const summary = await buildProjectStatus(projectPath, slug);
      if (summary) projects.push(summary);
    }

    const summaryLines = projects.map(p =>
      `- **${p.name}** (${p.slug}): ${p.currentPhase}, ${p.documentCount} tài liệu`
    );

    return {
      success: true,
      message: `✅ Tìm thấy ${projects.length} dự án:\n${summaryLines.join('\n')}`,
      data: { projects },
    };
  }

  // ── Case 2: Có projectSlug → hiển thị status 1 project ───────────────
  const projectPath = path.join(mcDataRoot, params.projectSlug);

  if (!(await exists(projectPath))) {
    return {
      success: false,
      message: `Dự án "${params.projectSlug}" không tồn tại`,
      error: 'PROJECT_NOT_FOUND',
      data: { projects: [] },
    };
  }

  const summary = await buildProjectStatus(projectPath, params.projectSlug);

  if (!summary) {
    return {
      success: false,
      message: `Không đọc được _config.json của dự án "${params.projectSlug}"`,
      error: 'CONFIG_READ_ERROR',
      data: { projects: [] },
    };
  }

  return {
    success: true,
    message: formatStatusText(summary),
    data: { projects: [summary] },
  };
}
