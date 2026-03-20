"use strict";
/**
 * mc-impact-analysis.ts — Tool: mc_impact_analysis
 *
 * Phân tích ảnh hưởng khi thay đổi một requirement, feature, hoặc design element.
 * Giúp team hiểu "nếu thay đổi X thì cần update những gì?"
 *
 * Dùng để:
 *   - Phân tích impact khi BR thay đổi (ripple effect lên US, FT, API, TC)
 *   - Phân tích impact khi DB schema thay đổi (ảnh hưởng API, code)
 *   - Tạo checklist những gì cần update
 *
 * Output: Structured impact report với checklist
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
exports.mcImpactAnalysis = mcImpactAnalysis;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Helpers ───────────────────────────────────────────────────────────────
/**
 * Thu thập tất cả IDs bị ảnh hưởng từ traceability DB
 * Đi cả 2 chiều: forward và backward
 */
function collectImpactedIDs(db, changeId) {
    const collectForward = (id, visited = new Set()) => {
        if (visited.has(id))
            return [];
        visited.add(id);
        const result = [];
        for (const next of (db.links[id] || [])) {
            result.push(next);
            result.push(...collectForward(next, visited));
        }
        return result;
    };
    const collectBackward = (id, visited = new Set()) => {
        if (visited.has(id))
            return [];
        visited.add(id);
        const result = [];
        for (const prev of (db.reverseLinks[id] || [])) {
            result.push(prev);
            result.push(...collectBackward(prev, visited));
        }
        return result;
    };
    return {
        downstream: collectForward(changeId),
        upstream: collectBackward(changeId),
    };
}
/**
 * Tạo checklist việc cần làm dựa trên impacted IDs
 */
function generateUpdateChecklist(changeId, downstream, upstream, changeType) {
    const checklist = [];
    // Phân loại IDs theo type
    const brIds = [...downstream, ...upstream].filter(id => id.startsWith('BR-'));
    const usIds = downstream.filter(id => id.startsWith('US-'));
    const ftIds = downstream.filter(id => id.startsWith('FT-'));
    const apiIds = downstream.filter(id => id.startsWith('API-'));
    const tblIds = downstream.filter(id => id.startsWith('TBL-'));
    const tcIds = downstream.filter(id => id.startsWith('TC-'));
    // Checklist theo loại thay đổi
    if (changeId.startsWith('BR-')) {
        checklist.push(`[ ] Cập nhật BIZ-POLICY: nội dung ${changeId}`);
        if (usIds.length > 0) {
            checklist.push(`[ ] Review ${usIds.length} User Stories: ${usIds.join(', ')}`);
            checklist.push(`[ ] Cập nhật Acceptance Criteria liên quan`);
        }
        if (ftIds.length > 0)
            checklist.push(`[ ] Review ${ftIds.length} Functional Requirements: ${ftIds.join(', ')}`);
        if (apiIds.length > 0)
            checklist.push(`[ ] Review ${apiIds.length} API endpoints: ${apiIds.join(', ')}`);
        if (tcIds.length > 0)
            checklist.push(`[ ] Cập nhật ${tcIds.length} Test Cases: ${tcIds.join(', ')}`);
    }
    if (changeId.startsWith('TBL-') || changeId.startsWith('API-')) {
        checklist.push(`[ ] Cập nhật MODSPEC liên quan`);
        if (changeType === 'breaking') {
            checklist.push(`[ ] Tạo database migration script`);
            checklist.push(`[ ] Cập nhật tất cả API consumers`);
            checklist.push(`[ ] Version bump API endpoint`);
        }
        if (apiIds.length > 0)
            checklist.push(`[ ] Review API specs: ${apiIds.join(', ')}`);
        if (tcIds.length > 0)
            checklist.push(`[ ] Cập nhật integration tests: ${tcIds.join(', ')}`);
    }
    if (changeId.startsWith('US-') || changeId.startsWith('FT-')) {
        checklist.push(`[ ] Review và update URS document`);
        if (ftIds.length > 0)
            checklist.push(`[ ] Update Functional Requirements: ${ftIds.join(', ')}`);
        if (apiIds.length > 0)
            checklist.push(`[ ] Update API specs: ${apiIds.join(', ')}`);
        if (tcIds.length > 0)
            checklist.push(`[ ] Update Test Cases: ${tcIds.join(', ')}`);
    }
    // Luôn check traceability
    checklist.push(`[ ] Chạy mc_validate sau khi update xong`);
    checklist.push(`[ ] Chạy mc_traceability check để verify gaps`);
    if (changeType === 'breaking') {
        checklist.push(`[ ] Thông báo team về breaking change`);
        checklist.push(`[ ] Tạo snapshot trước khi áp dụng: mc_snapshot`);
    }
    return checklist;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_impact_analysis
 */
async function mcImpactAnalysis(params, projectRoot) {
    if (!params.projectSlug || !params.changeId) {
        return {
            success: false,
            message: 'Thiếu projectSlug hoặc changeId',
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
    try {
        // ── Load traceability data ────────────────────────────────────────
        const traceabilityPath = path.join(projectPath, '_mcv3-work', '_traceability.json');
        const traceability = await (0, file_io_js_1.readJson)(traceabilityPath);
        // ── Load dependency data ─────────────────────────────────────────
        const dependencyPath = path.join(projectPath, '_mcv3-work', '_dependencies.json');
        const dependencies = await (0, file_io_js_1.readJson)(dependencyPath);
        const changeType = params.changeType || 'major';
        const { changeId, changeDescription } = params;
        // ── Collect impacted IDs từ traceability ─────────────────────────
        const { upstream, downstream } = traceability
            ? collectImpactedIDs(traceability, changeId)
            : { upstream: [], downstream: [] };
        // ── Collect impacted documents từ dependency ─────────────────────
        // Tìm document nào chứa changeId
        const affectedDocuments = [];
        if (dependencies) {
            // Documents mà depend on changeId's document
            for (const [doc, consumers] of Object.entries(dependencies.consumers)) {
                if (doc.toLowerCase().includes(changeId.toLowerCase())) {
                    affectedDocuments.push(...consumers);
                }
            }
        }
        // ── Generate checklist ───────────────────────────────────────────
        const checklist = generateUpdateChecklist(changeId, downstream, upstream, changeType);
        // ── Tạo report ──────────────────────────────────────────────────
        const severity = changeType === 'breaking' ? '🔴 BREAKING'
            : changeType === 'major' ? '🟡 MAJOR'
                : '🟢 MINOR';
        const lines = [
            `# Impact Analysis Report`,
            ``,
            `**Thay đổi:** ${changeId} (${severity})`,
            changeDescription ? `**Mô tả:** ${changeDescription}` : '',
            ``,
            `---`,
            ``,
            `## 1. IDs Bị Ảnh Hưởng`,
            ``,
            `### Downstream (${downstream.length} — cần review/update)`,
            downstream.length > 0
                ? downstream.map(id => `- ${id}`).join('\n')
                : '_(không có)_',
            ``,
            `### Upstream (${upstream.length} — context/source)`,
            upstream.length > 0
                ? upstream.map(id => `- ${id}`).join('\n')
                : '_(không có)_',
            ``,
            `---`,
            ``,
            `## 2. Documents Bị Ảnh Hưởng`,
            ``,
            affectedDocuments.length > 0
                ? affectedDocuments.map(d => `- \`${d}\``).join('\n')
                : '_(không đủ dependency data hoặc không có document nào phụ thuộc)_',
            ``,
            `---`,
            ``,
            `## 3. Checklist Việc Cần Làm`,
            ``,
            ...checklist,
            ``,
            `---`,
            ``,
            `**Tổng impact:** ${downstream.length} IDs downstream, ${affectedDocuments.length} documents.`,
            changeType === 'breaking'
                ? `\n⚠️ Breaking change — cần team review và communication plan.` : '',
        ].filter(l => l !== '');
        return {
            success: true,
            message: lines.join('\n'),
            data: {
                changeId,
                changeType,
                upstream,
                downstream,
                affectedDocuments,
                checklistItems: checklist.length,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi impact analysis: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-impact-analysis.js.map