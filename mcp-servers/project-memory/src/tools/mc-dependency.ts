/**
 * mc-dependency.ts — Tool: mc_dependency
 *
 * Quản lý dependencies giữa các documents trong dự án.
 * Theo dõi document nào depends on document nào (producer-consumer).
 *
 * Dùng để:
 *   - Đăng ký dependency (register)
 *   - Xem dependency tree của 1 document (query)
 *   - Kiểm tra circular dependencies (check)
 *   - Tìm tất cả documents bị ảnh hưởng khi 1 document thay đổi (impact)
 *
 * Data lưu tại: .mc-data/projects/{slug}/_mcv3-work/_dependencies.json
 */

import * as path from 'path';
import {
  readJson,
  writeJson,
  exists,
} from '../utils/file-io.js';
import type { ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_dependency */
export interface McDependencyParams {
  /** Slug dự án */
  projectSlug: string;
  /** Hành động */
  action: 'register' | 'query' | 'check' | 'impact';
  /** Document source (file ghi output) */
  source?: string;
  /** Documents mà source depends on */
  dependsOn?: string[];
  /** Document cần query dependencies */
  document?: string;
}

/** Cấu trúc dependency database */
interface DependencyDB {
  updatedAt: string;
  /** source → list of dependencies */
  dependencies: Record<string, string[]>;
  /** dependency → list of consumers (reverse index) */
  consumers: Record<string, string[]>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function loadDependencyDB(dbPath: string): Promise<DependencyDB> {
  const existing = await readJson<DependencyDB>(dbPath);
  if (existing) return existing;
  return {
    updatedAt: new Date().toISOString(),
    dependencies: {},
    consumers: {},
  };
}

async function saveDependencyDB(dbPath: string, db: DependencyDB): Promise<void> {
  db.updatedAt = new Date().toISOString();
  await writeJson(dbPath, db);
}

/** Phát hiện circular dependency bằng DFS */
function detectCycle(
  db: DependencyDB,
  start: string,
  visited = new Set<string>(),
  path_: string[] = []
): string[] | null {
  if (path_.includes(start)) {
    const cycleStart = path_.indexOf(start);
    return path_.slice(cycleStart).concat(start);
  }
  if (visited.has(start)) return null;
  visited.add(start);

  for (const dep of (db.dependencies[start] || [])) {
    const cycle = detectCycle(db, dep, visited, [...path_, start]);
    if (cycle) return cycle;
  }

  return null;
}

/** Collect tất cả consumers đệ quy */
function collectAllConsumers(
  db: DependencyDB,
  docPath: string,
  visited = new Set<string>()
): string[] {
  if (visited.has(docPath)) return [];
  visited.add(docPath);

  const result: string[] = [];
  for (const consumer of (db.consumers[docPath] || [])) {
    result.push(consumer);
    result.push(...collectAllConsumers(db, consumer, visited));
  }
  return [...new Set(result)];
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_dependency
 */
export async function mcDependency(
  params: McDependencyParams,
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

  const dbPath = path.join(projectPath, '_mcv3-work', '_dependencies.json');

  try {
    const db = await loadDependencyDB(dbPath);

    switch (params.action) {
      // ── Register ──────────────────────────────────────────────────────
      case 'register': {
        if (!params.source || !params.dependsOn || params.dependsOn.length === 0) {
          return {
            success: false,
            message: 'Cần truyền source và dependsOn khi action=register',
            error: 'INVALID_PARAMS',
          };
        }

        // Cập nhật forward dependencies
        db.dependencies[params.source] = [
          ...new Set([...(db.dependencies[params.source] || []), ...params.dependsOn])
        ];

        // Cập nhật reverse index
        for (const dep of params.dependsOn) {
          if (!db.consumers[dep]) db.consumers[dep] = [];
          if (!db.consumers[dep].includes(params.source)) {
            db.consumers[dep].push(params.source);
          }
        }

        await saveDependencyDB(dbPath, db);

        return {
          success: true,
          message: `✅ Đã đăng ký ${params.dependsOn.length} dependencies cho "${params.source}"`,
          data: {
            source: params.source,
            dependsOn: params.dependsOn,
          },
        };
      }

      // ── Query ─────────────────────────────────────────────────────────
      case 'query': {
        if (!params.document) {
          return {
            success: false,
            message: 'Cần truyền document khi action=query',
            error: 'INVALID_PARAMS',
          };
        }

        const deps = db.dependencies[params.document] || [];
        const cons = db.consumers[params.document] || [];

        const lines = [
          `**Document:** ${params.document}`,
          ``,
          `**Depends on (${deps.length}):**`,
          ...deps.map(d => `  - ${d}`),
          ``,
          `**Used by (consumers) (${cons.length}):**`,
          ...cons.map(c => `  - ${c}`),
        ];

        return {
          success: true,
          message: lines.join('\n'),
          data: { document: params.document, dependencies: deps, consumers: cons },
        };
      }

      // ── Check circular ────────────────────────────────────────────────
      case 'check': {
        const cycles: string[][] = [];
        const allDocs = Object.keys(db.dependencies);

        for (const doc of allDocs) {
          const cycle = detectCycle(db, doc);
          if (cycle) {
            // Chỉ add nếu chưa có cycle này
            const cycleKey = cycle.slice().sort().join('-');
            const alreadyFound = cycles.some(c => c.slice().sort().join('-') === cycleKey);
            if (!alreadyFound) {
              cycles.push(cycle);
            }
          }
        }

        if (cycles.length === 0) {
          return {
            success: true,
            message: '✅ Không phát hiện circular dependencies',
            data: { cycles: [] },
          };
        }

        const lines = [
          `⚠️ Phát hiện ${cycles.length} circular dependency:`,
          '',
          ...cycles.map((cycle, i) =>
            `${i + 1}. ${cycle.join(' → ')}`
          ),
        ];

        return {
          success: false,
          message: lines.join('\n'),
          data: { cycles },
        };
      }

      // ── Impact Analysis ───────────────────────────────────────────────
      case 'impact': {
        if (!params.document) {
          return {
            success: false,
            message: 'Cần truyền document khi action=impact',
            error: 'INVALID_PARAMS',
          };
        }

        const affected = collectAllConsumers(db, params.document);

        const lines = [
          `## Impact Analysis: "${params.document}"`,
          '',
          `Khi document này thay đổi, ${affected.length} document(s) bị ảnh hưởng:`,
        ];

        if (affected.length === 0) {
          lines.push('  _(không có document nào phụ thuộc vào document này)_');
        } else {
          affected.forEach(a => lines.push(`  - ${a}`));
        }

        return {
          success: true,
          message: lines.join('\n'),
          data: { document: params.document, affectedDocuments: affected, count: affected.length },
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
      message: `Lỗi dependency ${params.action}: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
