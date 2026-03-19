/**
 * mc-changelog.ts — Tool: mc_changelog
 *
 * Quản lý và query changelog của dự án.
 * Hỗ trợ: xem lịch sử, filter theo ngày/loại, tạo release notes.
 *
 * Khác với _changelog.md (raw log), tool này:
 *   - Structured changelog với categories
 *   - Filter và search trong history
 *   - Generate release notes cho từng phase
 *   - Thêm custom entries có meaning
 */

import * as path from 'path';
import {
  readFile,
  readJson,
  writeFile,
  writeJson,
  exists,
} from '../utils/file-io.js';
import type { ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_changelog */
export interface McChangelogParams {
  /** Slug dự án */
  projectSlug: string;
  /** Hành động */
  action: 'view' | 'add' | 'filter' | 'release-notes';
  /** Nội dung entry cần thêm (dùng với add) */
  entry?: string;
  /** Loại thay đổi (dùng với add) */
  changeType?: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security' | 'milestone';
  /** Phase liên quan (dùng với add) */
  phase?: string;
  /** Filter từ ngày (dùng với filter) */
  fromDate?: string;
  /** Filter đến ngày (dùng với filter) */
  toDate?: string;
  /** Số entries tối đa (dùng với view/filter, default: 20) */
  limit?: number;
  /** Phase muốn tạo release notes (dùng với release-notes) */
  targetPhase?: string;
}

/** Entry changelog có cấu trúc */
interface ChangelogEntry {
  id: string;
  timestamp: string;
  date: string;
  changeType: string;
  phase: string;
  description: string;
}

/** Structured changelog database */
interface ChangelogDB {
  updatedAt: string;
  entries: ChangelogEntry[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function loadChangelogDB(dbPath: string): Promise<ChangelogDB> {
  const existing = await readJson<ChangelogDB>(dbPath);
  if (existing) return existing;
  return {
    updatedAt: new Date().toISOString(),
    entries: [],
  };
}

/** Icon theo changeType */
function getTypeIcon(changeType: string): string {
  const icons: Record<string, string> = {
    added: '✅',
    changed: '🔄',
    deprecated: '⚠️',
    removed: '❌',
    fixed: '🔧',
    security: '🔒',
    milestone: '🎯',
  };
  return icons[changeType] || '📝';
}

/** Parse raw _changelog.md sang entries cơ bản */
function parseRawChangelog(raw: string): string {
  // Chỉ trả về formatted version của raw log
  const lines = raw.split('\n');
  const formatted = lines
    .filter(l => l.trim())
    .slice(0, 30); // Giới hạn 30 dòng
  return formatted.join('\n');
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_changelog
 */
export async function mcChangelog(
  params: McChangelogParams,
  projectRoot: string
): Promise<ToolResult> {
  if (!params.projectSlug || !params.action) {
    return {
      success: false,
      message: 'Thiếu projectSlug hoặc action',
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

  const dbPath = path.join(projectPath, '_mcv3-work', '_changelog-structured.json');
  const rawChangelogPath = path.join(projectPath, '_changelog.md');

  try {
    switch (params.action) {
      // ── View ──────────────────────────────────────────────────────────
      case 'view': {
        const db = await loadChangelogDB(dbPath);
        const limit = params.limit || 20;

        // Combine structured entries với raw changelog
        const structuredEntries = db.entries
          .slice(-limit)
          .reverse()
          .map(e =>
            `${e.date} ${getTypeIcon(e.changeType)} [${e.changeType.toUpperCase()}]` +
            (e.phase ? ` [${e.phase}]` : '') +
            `: ${e.description}`
          );

        let output = '';
        if (structuredEntries.length > 0) {
          output = `## Changelog (${structuredEntries.length} entries)\n\n` +
            structuredEntries.join('\n');
        } else {
          // Fallback sang raw changelog
          const raw = await readFile(rawChangelogPath) || 'Chưa có changelog';
          output = `## Raw Changelog\n\n${parseRawChangelog(raw)}`;
        }

        return {
          success: true,
          message: output,
          data: { totalEntries: db.entries.length, displayed: structuredEntries.length },
        };
      }

      // ── Add ───────────────────────────────────────────────────────────
      case 'add': {
        if (!params.entry) {
          return {
            success: false,
            message: 'Cần truyền entry khi action=add',
            error: 'INVALID_PARAMS',
          };
        }

        const db = await loadChangelogDB(dbPath);
        const now = new Date().toISOString();
        const entry: ChangelogEntry = {
          id: `CHG-${Date.now()}`,
          timestamp: now,
          date: now.split('T')[0],
          changeType: params.changeType || 'changed',
          phase: params.phase || '',
          description: params.entry,
        };

        db.entries.push(entry);
        await writeJson(dbPath, db);

        // Cũng ghi vào raw changelog
        const rawContent = await readFile(rawChangelogPath) || '# CHANGELOG\n';
        const rawEntry = `\n## ${entry.date}\n` +
          `- ${getTypeIcon(entry.changeType)} [${entry.changeType}]` +
          (entry.phase ? ` [${entry.phase}]` : '') +
          `: ${entry.description}\n`;
        await writeFile(rawChangelogPath, rawContent + rawEntry);

        return {
          success: true,
          message: `✅ Đã thêm changelog entry: ${entry.description}`,
          data: { entryId: entry.id, entry },
        };
      }

      // ── Filter ────────────────────────────────────────────────────────
      case 'filter': {
        const db = await loadChangelogDB(dbPath);
        let filtered = db.entries;

        if (params.fromDate) {
          filtered = filtered.filter(e => e.date >= params.fromDate!);
        }
        if (params.toDate) {
          filtered = filtered.filter(e => e.date <= params.toDate!);
        }
        if (params.changeType) {
          filtered = filtered.filter(e => e.changeType === params.changeType);
        }
        if (params.targetPhase) {
          filtered = filtered.filter(e => e.phase === params.targetPhase);
        }

        const limit = params.limit || 20;
        const displayEntries = filtered.slice(-limit).reverse();

        const lines = [
          `## Changelog Filter Results (${displayEntries.length}/${filtered.length})`,
          '',
          ...displayEntries.map(e =>
            `${e.date} ${getTypeIcon(e.changeType)} [${e.changeType}]` +
            (e.phase ? ` [${e.phase}]` : '') +
            `: ${e.description}`
          ),
        ];

        return {
          success: true,
          message: lines.join('\n'),
          data: { totalMatched: filtered.length, displayed: displayEntries.length },
        };
      }

      // ── Release Notes ─────────────────────────────────────────────────
      case 'release-notes': {
        const db = await loadChangelogDB(dbPath);
        const targetPhase = params.targetPhase || 'all';

        let relevant = targetPhase === 'all'
          ? db.entries
          : db.entries.filter(e => e.phase === targetPhase);

        // Group by changeType
        const groups: Record<string, ChangelogEntry[]> = {};
        for (const entry of relevant) {
          if (!groups[entry.changeType]) groups[entry.changeType] = [];
          groups[entry.changeType].push(entry);
        }

        const lines = [
          `# Release Notes${targetPhase !== 'all' ? ` — ${targetPhase}` : ''}`,
          ``,
          `**Ngày tạo:** ${new Date().toISOString().split('T')[0]}`,
          `**Tổng thay đổi:** ${relevant.length}`,
          '',
        ];

        const order = ['milestone', 'added', 'changed', 'fixed', 'security', 'deprecated', 'removed'];
        for (const type of order) {
          if (!groups[type] || groups[type].length === 0) continue;
          lines.push(`### ${getTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`);
          lines.push('');
          groups[type].forEach(e => lines.push(`- ${e.description}`));
          lines.push('');
        }

        // Nếu không có structured entries, dùng raw
        if (relevant.length === 0) {
          const raw = await readFile(rawChangelogPath) || 'Chưa có changelog';
          lines.push('> _Chưa có structured changelog. Raw log:_');
          lines.push('');
          lines.push(parseRawChangelog(raw));
        }

        const releaseNotes = lines.join('\n');

        // Lưu release notes
        const releaseNotesPath = path.join(
          projectPath,
          '_mcv3-work',
          `release-notes-${targetPhase !== 'all' ? targetPhase + '-' : ''}${new Date().toISOString().slice(0, 10)}.md`
        );
        await writeFile(releaseNotesPath, releaseNotes);

        return {
          success: true,
          message: releaseNotes,
          data: {
            savedTo: path.relative(projectRoot, releaseNotesPath).replace(/\\/g, '/'),
            totalEntries: relevant.length,
          },
        };
      }

      default:
        return {
          success: false,
          message: `Action không hợp lệ: ${params.action}`,
          error: 'INVALID_ACTION',
        };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi changelog ${params.action}: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
