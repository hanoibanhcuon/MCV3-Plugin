"use strict";
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
exports.mcResume = mcResume;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Mapping phase → lệnh tiếp theo ──────────────────────────────────────
/** Gợi ý lệnh tiếp theo theo phase hiện tại */
const PHASE_NEXT_COMMAND = {
    'phase0-init': 'Chạy `/mcv3:discovery` để bắt đầu phỏng vấn dự án',
    'phase1-discovery': 'Tiếp tục `/mcv3:discovery` hoặc chạy `/mcv3:expert-panel`',
    'phase2-expert': 'Chạy `/mcv3:biz-docs` để tạo tài liệu nghiệp vụ',
    'phase3-bizdocs': 'Chạy `/mcv3:requirements` để viết URS cho từng module',
    'phase4-requirements': 'Chạy `/mcv3:tech-design` để thiết kế kỹ thuật (MODSPEC)',
    'phase5-design': 'Chạy `/mcv3:qa-docs` để tạo TEST + USER-GUIDE',
    'phase6-qa': 'Chạy `/mcv3:code-gen` để sinh code scaffold',
    'phase7-codegen': 'Chạy `/mcv3:verify` để kiểm tra và chuẩn bị deploy',
    'phase8-verify': 'Dự án hoàn thành! Xem `/mcv3:status` để review tiến độ',
};
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_resume
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
async function mcResume(params, projectRoot) {
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
    if (!(await (0, file_io_js_1.exists)(projectPath))) {
        return {
            success: false,
            message: `Dự án "${params.projectSlug}" không tồn tại`,
            error: 'PROJECT_NOT_FOUND',
        };
    }
    try {
        // ── Đọc config ────────────────────────────────────────────────────────
        const config = await (0, file_io_js_1.readJson)(path.join(projectPath, '_config.json'));
        if (!config) {
            return {
                success: false,
                message: 'Không đọc được _config.json',
                error: 'CONFIG_NOT_FOUND',
            };
        }
        // ── Đọc checkpoint ────────────────────────────────────────────────────
        let checkpointContent = null;
        if (params.snapshotName) {
            // Load snapshot cụ thể
            const snapshotPath = path.join(projectPath, '_mcv3-work', '_snapshots', params.snapshotName);
            checkpointContent = await (0, file_io_js_1.readFile)(snapshotPath);
            if (!checkpointContent) {
                return {
                    success: false,
                    message: `Snapshot "${params.snapshotName}" không tồn tại`,
                    error: 'SNAPSHOT_NOT_FOUND',
                };
            }
        }
        else {
            // Load latest checkpoint
            const checkpointPath = path.join(projectPath, '_mcv3-work', '_checkpoint.md');
            checkpointContent = await (0, file_io_js_1.readFile)(checkpointPath);
            if (!checkpointContent) {
                // Không có checkpoint → tạo thông báo mặc định
                checkpointContent = `# Chưa có checkpoint\n\nDự án "${config.name}" chưa có checkpoint nào.\nPhase hiện tại: ${config.currentPhase}`;
            }
        }
        // ── Đọc key-facts nếu cần ─────────────────────────────────────────────
        let keyFactsContent = '';
        if (params.includeKeyFacts !== false) {
            const keyFactsPath = path.join(projectPath, '_PROJECT', '_key-facts.md');
            const keyFacts = await (0, file_io_js_1.readFile)(keyFactsPath);
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
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi resume: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-resume.js.map