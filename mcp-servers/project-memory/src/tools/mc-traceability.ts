/**
 * mc-traceability.ts — Tool: mc_traceability
 *
 * Quản lý traceability matrix cho dự án MCV3.
 * Traceability chain: PROB → BR → US → FT → API/TBL → TC
 *
 * Dùng để:
 *   - Đăng ký IDs mới (register)
 *   - Link IDs với nhau (link)
 *   - Query traceability chain (query)
 *   - Kiểm tra gaps trong traceability (check)
 *   - Xuất traceability matrix (export)
 *
 * Data lưu tại: .mc-data/projects/{slug}/_mcv3-work/_traceability.json
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 23 — Traceability
 */

import * as path from 'path';
import {
  readJson,
  writeJson,
  exists,
} from '../utils/file-io.js';
import type { ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_traceability */
export interface McTraceabilityParams {
  /** Slug dự án */
  projectSlug: string;
  /** Hành động: register (đăng ký IDs), link (liên kết), query (hỏi), check (kiểm tra gaps), export (xuất matrix) */
  action: 'register' | 'link' | 'query' | 'check' | 'export';
  /** File source (dùng với register) */
  source?: string;
  /** Danh sách IDs cần đăng ký (dùng với register) */
  ids?: string[];
  /** Các link cần tạo (dùng với link) */
  items?: Array<{ from: string; to: string }>;
  /** ID cần query (dùng với query) */
  queryId?: string;
  /** Hướng query: forward (từ BR xuống) hoặc backward (từ TC lên) */
  direction?: 'forward' | 'backward' | 'both';
}

/** Prefix phân loại ID */
const ID_TYPE_MAP: Record<string, string> = {
  'PROB-': 'problem',
  'BR-': 'business-rule',
  'US-': 'user-story',
  'UC-': 'use-case',
  'AC-': 'acceptance-criteria',
  'FT-': 'feature',
  'NFR-': 'non-functional-req',
  'API-': 'api-endpoint',
  'TBL-': 'db-table',
  'COMP-': 'component',
  'INT-': 'integration',
  'TC-': 'test-case',
  'ADR-': 'architecture-decision',
  'TERM-': 'term',
  'ENT-': 'entity',
};

/** Cấu trúc traceability database */
interface TraceabilityDB {
  /** Ngày cập nhật */
  updatedAt: string;
  /** Map ID → thông tin */
  nodes: Record<string, {
    id: string;
    type: string;
    source: string;
    registeredAt: string;
  }>;
  /** Map ID → các IDs nó liên kết đến */
  links: Record<string, string[]>;
  /** Map ID → các IDs liên kết đến nó (reverse index) */
  reverseLinks: Record<string, string[]>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Phân loại ID theo prefix */
function getIdType(id: string): string {
  for (const [prefix, type] of Object.entries(ID_TYPE_MAP)) {
    if (id.startsWith(prefix)) return type;
  }
  return 'unknown';
}

/** Đọc hoặc tạo mới traceability DB */
async function loadTraceabilityDB(dbPath: string): Promise<TraceabilityDB> {
  const existing = await readJson<TraceabilityDB>(dbPath);
  if (existing) return existing;

  return {
    updatedAt: new Date().toISOString(),
    nodes: {},
    links: {},
    reverseLinks: {},
  };
}

/** Lưu traceability DB */
async function saveTraceabilityDB(dbPath: string, db: TraceabilityDB): Promise<void> {
  db.updatedAt = new Date().toISOString();
  await writeJson(dbPath, db);
}

// ─── Action Handlers ──────────────────────────────────────────────────────

/** Đăng ký IDs mới vào database */
function registerIds(
  db: TraceabilityDB,
  ids: string[],
  source: string
): { registered: number; skipped: number } {
  let registered = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const id of ids) {
    if (db.nodes[id]) {
      skipped++;
      continue;
    }

    db.nodes[id] = {
      id,
      type: getIdType(id),
      source,
      registeredAt: now,
    };
    registered++;
  }

  return { registered, skipped };
}

/** Tạo link giữa các IDs */
function createLinks(
  db: TraceabilityDB,
  items: Array<{ from: string; to: string }>
): { created: number; failed: string[] } {
  let created = 0;
  const failed: string[] = [];

  for (const { from, to } of items) {
    // Auto-register nếu chưa có
    if (!db.nodes[from]) {
      db.nodes[from] = {
        id: from,
        type: getIdType(from),
        source: 'auto-registered',
        registeredAt: new Date().toISOString(),
      };
    }
    if (!db.nodes[to]) {
      db.nodes[to] = {
        id: to,
        type: getIdType(to),
        source: 'auto-registered',
        registeredAt: new Date().toISOString(),
      };
    }

    // Tạo forward link
    if (!db.links[from]) db.links[from] = [];
    if (!db.links[from].includes(to)) {
      db.links[from].push(to);
    }

    // Tạo reverse link
    if (!db.reverseLinks[to]) db.reverseLinks[to] = [];
    if (!db.reverseLinks[to].includes(from)) {
      db.reverseLinks[to].push(from);
    }

    created++;
  }

  return { created, failed };
}

/** Query traceability chain cho một ID */
function queryChain(
  db: TraceabilityDB,
  queryId: string,
  direction: 'forward' | 'backward' | 'both'
): { forward: string[]; backward: string[]; node: TraceabilityDB['nodes'][string] | null } {
  const node = db.nodes[queryId] || null;

  const collectForward = (id: string, visited = new Set<string>()): string[] => {
    if (visited.has(id)) return [];
    visited.add(id);
    const result: string[] = [];
    for (const next of (db.links[id] || [])) {
      result.push(next);
      result.push(...collectForward(next, visited));
    }
    return result;
  };

  const collectBackward = (id: string, visited = new Set<string>()): string[] => {
    if (visited.has(id)) return [];
    visited.add(id);
    const result: string[] = [];
    for (const prev of (db.reverseLinks[id] || [])) {
      result.push(prev);
      result.push(...collectBackward(prev, visited));
    }
    return result;
  };

  return {
    forward: direction !== 'backward' ? collectForward(queryId) : [],
    backward: direction !== 'forward' ? collectBackward(queryId) : [],
    node,
  };
}

/** Kiểm tra gaps trong traceability */
function checkGaps(db: TraceabilityDB): {
  orphans: string[];
  partialChains: string[];
  fullChains: string[];
  summary: string;
} {
  const orphans: string[] = [];
  const partialChains: string[] = [];
  const fullChains: string[] = [];

  // Kiểm tra từng BR có chain đến TC không
  for (const [id, node] of Object.entries(db.nodes)) {
    if (node.type !== 'business-rule') continue;

    const forward = queryChain(db, id, 'forward').forward;
    const hasUS = forward.some(f => f.startsWith('US-'));
    const hasFT = forward.some(f => f.startsWith('FT-'));
    const hasTC = forward.some(f => f.startsWith('TC-'));

    if (!hasUS && !hasFT && !hasTC) {
      orphans.push(id);
    } else if (!hasTC) {
      partialChains.push(id);
    } else {
      fullChains.push(id);
    }
  }

  const total = orphans.length + partialChains.length + fullChains.length;
  const summary = total === 0
    ? 'Không có Business Rules nào được đăng ký'
    : [
        `Tổng BRs: ${total}`,
        `✅ Full chains: ${fullChains.length}`,
        `⚠️ Partial chains (chưa có TC): ${partialChains.length}`,
        `❌ Orphan (không có US/FT/TC): ${orphans.length}`,
      ].join('\n');

  return { orphans, partialChains, fullChains, summary };
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_traceability
 */
export async function mcTraceability(
  params: McTraceabilityParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate ──────────────────────────────────────────────────────────
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

  const dbPath = path.join(projectPath, '_mcv3-work', '_traceability.json');

  try {
    const db = await loadTraceabilityDB(dbPath);

    switch (params.action) {
      // ── Register ──────────────────────────────────────────────────────
      case 'register': {
        if (!params.ids || params.ids.length === 0) {
          return {
            success: false,
            message: 'Cần truyền ids khi action=register',
            error: 'INVALID_PARAMS',
          };
        }

        const { registered, skipped } = registerIds(
          db,
          params.ids,
          params.source || 'unknown'
        );

        await saveTraceabilityDB(dbPath, db);

        return {
          success: true,
          message: `✅ Đăng ký ${registered} IDs (bỏ qua ${skipped} đã có)`,
          data: { registered, skipped, source: params.source },
        };
      }

      // ── Link ──────────────────────────────────────────────────────────
      case 'link': {
        if (!params.items || params.items.length === 0) {
          return {
            success: false,
            message: 'Cần truyền items khi action=link',
            error: 'INVALID_PARAMS',
          };
        }

        const { created, failed } = createLinks(db, params.items);
        await saveTraceabilityDB(dbPath, db);

        return {
          success: true,
          message: `✅ Tạo ${created} links${failed.length > 0 ? ` (${failed.length} thất bại)` : ''}`,
          data: { created, failed },
        };
      }

      // ── Query ─────────────────────────────────────────────────────────
      case 'query': {
        if (!params.queryId) {
          return {
            success: false,
            message: 'Cần truyền queryId khi action=query',
            error: 'INVALID_PARAMS',
          };
        }

        const direction = params.direction || 'both';
        const result = queryChain(db, params.queryId, direction);

        const lines = [
          `**ID:** ${params.queryId}`,
          `**Type:** ${result.node?.type || 'unknown'}`,
          `**Source:** ${result.node?.source || 'unknown'}`,
        ];

        if (direction !== 'backward' && result.forward.length > 0) {
          lines.push(`\n**Forward chain (→):**`);
          lines.push(...result.forward.map(id => `  - ${id} (${getIdType(id)})`));
        }

        if (direction !== 'forward' && result.backward.length > 0) {
          lines.push(`\n**Backward chain (←):**`);
          lines.push(...result.backward.map(id => `  - ${id} (${getIdType(id)})`));
        }

        return {
          success: true,
          message: lines.join('\n'),
          data: result,
        };
      }

      // ── Check ─────────────────────────────────────────────────────────
      case 'check': {
        const gaps = checkGaps(db);

        const lines = [
          `## Traceability Gap Report`,
          ``,
          gaps.summary,
        ];

        if (gaps.orphans.length > 0) {
          lines.push(`\n❌ Orphan BRs (không có US/FT/TC):`);
          gaps.orphans.forEach(id => lines.push(`  - ${id}`));
        }

        if (gaps.partialChains.length > 0) {
          lines.push(`\n⚠️ Partial chains (chưa có TC):`);
          gaps.partialChains.forEach(id => lines.push(`  - ${id}`));
        }

        return {
          success: true,
          message: lines.join('\n'),
          data: gaps,
        };
      }

      // ── Export ────────────────────────────────────────────────────────
      case 'export': {
        const brs = Object.values(db.nodes).filter(n => n.type === 'business-rule');
        const rows = brs.map(br => {
          const fwd = queryChain(db, br.id, 'forward').forward;
          return {
            brId: br.id,
            usIds: fwd.filter(id => id.startsWith('US-')).join(', ') || '—',
            ftIds: fwd.filter(id => id.startsWith('FT-')).join(', ') || '—',
            apiIds: fwd.filter(id => id.startsWith('API-')).join(', ') || '—',
            tcIds: fwd.filter(id => id.startsWith('TC-')).join(', ') || '—',
          };
        });

        const header = '| BR-ID | US-IDs | FT-IDs | API-IDs | TC-IDs |';
        const sep = '|-------|--------|--------|---------|--------|';
        const tableRows = rows.map(r =>
          `| ${r.brId} | ${r.usIds} | ${r.ftIds} | ${r.apiIds} | ${r.tcIds} |`
        );

        const matrix = [header, sep, ...tableRows].join('\n');

        return {
          success: true,
          message: `## Traceability Matrix\n\n${matrix}\n\nTổng: ${brs.length} BRs`,
          data: { matrix, rows, totalBRs: brs.length },
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
      message: `Lỗi khi thực hiện traceability ${params.action}: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
