"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcDependency = mcDependency;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helpers ───────────────────────────────────────────────────────────────
async function loadDependencyDB(dbPath) {
    const existing = await (0, file_io_js_1.readJson)(dbPath);
    if (existing)
        return existing;
    return {
        updatedAt: new Date().toISOString(),
        dependencies: {},
        consumers: {},
    };
}
async function saveDependencyDB(dbPath, db) {
    db.updatedAt = new Date().toISOString();
    await (0, file_io_js_1.writeJson)(dbPath, db);
}
/** Phát hiện circular dependency bằng DFS */
function detectCycle(db, start, visited = new Set(), path_ = []) {
    if (path_.includes(start)) {
        const cycleStart = path_.indexOf(start);
        return path_.slice(cycleStart).concat(start);
    }
    if (visited.has(start))
        return null;
    visited.add(start);
    for (const dep of (db.dependencies[start] || [])) {
        const cycle = detectCycle(db, dep, visited, [...path_, start]);
        if (cycle)
            return cycle;
    }
    return null;
}
/** Collect tất cả consumers đệ quy */
function collectAllConsumers(db, docPath, visited = new Set()) {
    if (visited.has(docPath))
        return [];
    visited.add(docPath);
    const result = [];
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
async function mcDependency(params, projectRoot) {
    if (!params.projectSlug || !params.action) {
        return {
            success: false,
            message: 'Thiếu projectSlug hoặc action',
            error: 'INVALID_PARAMS',
        };
    }
    const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);
    if (!(await (0, file_io_js_1.exists)(projectPath))) {
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
                    if (!db.consumers[dep])
                        db.consumers[dep] = [];
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
                const cycles = [];
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
                    ...cycles.map((cycle, i) => `${i + 1}. ${cycle.join(' → ')}`),
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
                }
                else {
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
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi dependency ${params.action}: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-dependency.js.map