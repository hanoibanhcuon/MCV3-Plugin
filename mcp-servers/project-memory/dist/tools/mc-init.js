"use strict";
/**
 * mc-init.ts — Tool: mc_init_project
 *
 * Khởi tạo dự án MCV3 mới:
 * 1. Tạo cấu trúc thư mục .mc-data/ theo spec kiến trúc v3.1
 * 2. Tạo MASTER-INDEX.md từ template
 * 3. Lưu _config.json
 * 4. Tạo _mcv3-work/_checkpoint.md ban đầu
 *
 * Output: .mc-data/projects/{slug}/ với đầy đủ cấu trúc folder
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
exports.mcInitProject = mcInitProject;
const path = __importStar(require("path"));
const file_io_js_1 = require("../utils/file-io.js");
// ─── Cấu trúc thư mục .mc-data/ theo kiến trúc MCV3 v3.1 ────────────────
/**
 * Danh sách thư mục cần tạo khi init project mới
 * Theo spec trong MCV3_Architecture_v3.1.md Section 3.2
 */
const PROJECT_DIRECTORIES = [
    // Tài liệu cấp dự án
    '_PROJECT',
    '_PROJECT/BIZ-POLICY',
    '_PROJECT/PROCESS',
    // Shared Services
    '_SHARED-SERVICES',
    // Verify Cross-System
    '_VERIFY-CROSS',
    // Working data của MCV3 (internal)
    '_mcv3-work',
    '_mcv3-work/_snapshots',
    '_mcv3-work/_temp',
    // Sprint 4 — Lifecycle Skills working dirs
    '_mcv3-work/change-log', // CHG-xxx records (change-manager skill)
    '_mcv3-work/evolution', // EVOL-xxx plans (evolve skill)
    '_mcv3-work/migration', // Migration reports (migrate skill)
];
/**
 * Nội dung MASTER-INDEX ban đầu cho dự án mới
 */
function generateMasterIndex(config) {
    return `# MASTER-INDEX
<!-- ============================================================
     BẢN ĐỒ TOÀN BỘ DỰ ÁN — Tài liệu sống (Living Document)
     Auto-generated bởi MCV3 mc_init_project
     ============================================================ -->

> **Dự án:** ${config.name}
> **Mã dự án:** ${config.slug.toUpperCase()}
> **Ngành:** ${config.domain}
> **Ngày tạo:** ${config.createdAt}
> **MCV3 Version:** ${config.mcv3Version}

---

## 📎 AI NAVIGATION GUIDE

\`\`\`
AI mới vào dự án — đọc theo thứ tự:
1. File này (MASTER-INDEX) → biết dự án có gì, systems nào
2. _mcv3-work/_checkpoint.md → biết đang ở phase nào, tiếp tục gì
3. _PROJECT/PROJECT-OVERVIEW.md → bối cảnh nghiệp vụ
\`\`\`

---

## 1. TỔNG QUAN DỰ ÁN

**Tên:** ${config.name}
**Ngành:** ${config.domain}
**Trạng thái:** ${config.currentPhase} — Mới khởi tạo

---

## 2. SYSTEMS REGISTRY

| System Code | Tên hệ thống | Mô tả | Tech Stack | Trạng thái |
|-------------|-------------|-------|-----------|-----------|
| _(chưa có system nào — bắt đầu bằng /mcv3:discovery)_ | | | | |

---

## 3. PHASE PROGRESS

| Phase | Mô tả | Trạng thái |
|-------|-------|-----------|
| Phase 1 | Discovery | ⏳ Chưa bắt đầu |
| Phase 2 | Expert Analysis | ⏳ |
| Phase 3 | Business Docs | ⏳ |
| Phase 4 | Requirements (URS) | ⏳ |
| Phase 5 | Technical Design (MODSPEC) | ⏳ |
| Phase 6 | QA & Docs | ⏳ |
| Phase 7 | Code Generation | ⏳ |
| Phase 8 | Verify & Deploy | ⏳ |

---

## 4. DOCUMENT INDEX

_Chưa có tài liệu nào — bắt đầu với /mcv3:discovery_

---

## 5. CHANGELOG

| Ngày | Thay đổi | Bởi |
|------|---------|-----|
| ${config.createdAt} | Khởi tạo dự án | mc_init_project |
`;
}
/**
 * Nội dung _checkpoint.md ban đầu
 */
function generateInitialCheckpoint(config) {
    return `# CHECKPOINT — ${config.name}
<!-- MCV3 working state — auto-managed, không cần sửa thủ công -->

> **Dự án:** ${config.name}
> **Phase hiện tại:** ${config.currentPhase}
> **Cập nhật:** ${config.createdAt}

## Trạng thái

Dự án vừa được khởi tạo. Chưa có phase nào được thực hiện.

## Bước tiếp theo

1. Chạy \`/mcv3:navigator\` để xem hướng dẫn
2. Bắt đầu với \`/mcv3:discovery\` để phỏng vấn & thu thập yêu cầu

## Working Context

\`\`\`json
{
  "projectSlug": "${config.slug}",
  "currentPhase": "${config.currentPhase}",
  "lastAction": "init",
  "lastActionTime": "${config.createdAt}",
  "pendingActions": []
}
\`\`\`
`;
}
// ─── CLAUDE.md & Rules Generator ─────────────────────────────────────────
/**
 * Tạo nội dung CLAUDE.md cho project root
 * Cung cấp context cho Claude Code khi làm việc với dự án này
 */
function generateProjectClaudeMd(config, slug) {
    return `# CLAUDE.md — Dự án ${config.name}
<!-- Auto-generated bởi MCV3 mc_init_project — ${new Date().toISOString()} -->
<!-- Cập nhật tự động khi phase thay đổi -->

## Thông tin dự án

| Thuộc tính | Giá trị |
|-----------|---------|
| **Tên dự án** | ${config.name} |
| **Slug** | \`${slug}\` |
| **Ngành** | ${config.domain} |
| **Phase hiện tại** | ${config.currentPhase} |
| **MCV3 Version** | ${config.mcv3Version} |

---

## MCP Tools có sẵn

Plugin \`mcv3-project-memory\` cung cấp 19 tools:

| Tool | Mục đích |
|------|---------|
| \`mc_init_project\` | Khởi tạo dự án mới |
| \`mc_save\` | Lưu tài liệu Markdown |
| \`mc_load\` | Đọc tài liệu (Smart Context Layering) |
| \`mc_list\` | Liệt kê tài liệu |
| \`mc_status\` | Xem trạng thái dự án |
| \`mc_checkpoint\` | Lưu checkpoint session |
| \`mc_resume\` | Resume từ checkpoint |
| \`mc_validate\` | Validate tài liệu |
| \`mc_export\` | Export tài liệu |
| \`mc_search\` | Tìm kiếm trong project memory |
| \`mc_snapshot\` | Snapshot đầy đủ project state |
| \`mc_rollback\` | Rollback về snapshot trước |
| \`mc_impact_analysis\` | Phân tích impact khi thay đổi |
| \`mc_traceability\` | Quản lý traceability matrix |
| \`mc_dependency\` | Quản lý dependencies giữa documents |
| \`mc_compare\` | So sánh 2 versions document |
| \`mc_merge\` | Merge content từ nhiều sources |
| \`mc_changelog\` | Quản lý changelog có cấu trúc |
| \`mc_summary\` | Tạo summary project/phase/module |

---

## Quy trình làm việc (MCV3 Pipeline)

\`\`\`
Bắt đầu session mới:
  1. mc_resume({ projectSlug: "${slug}" })  ← Load context
  2. Đọc MASTER-INDEX nếu cần chi tiết
  3. Tiếp tục công việc theo nextActions trong checkpoint

Kết thúc session:
  1. mc_checkpoint({
       projectSlug: "${slug}",
       sessionSummary: "...",
       nextActions: ["..."]
     })
\`\`\`

---

## Quy tắc làm việc

1. **Đọc trước** — Luôn gọi \`mc_resume\` khi bắt đầu session mới
2. **Không skip phase** — Phase trước phải complete trước khi sang phase sau
3. **Dùng Formal IDs** — BR-XXX, US-XXX, FT-XXX, ... cho mọi tài liệu
4. **Lưu qua mc_save** — KHÔNG ghi file .mc-data/ trực tiếp
5. **Tiếng Việt** — Comments và documentation bằng tiếng Việt
6. **Validate** — Gọi mc_validate trước khi sang phase tiếp theo

---

## Cấu trúc thư mục project

\`\`\`
.mc-data/projects/${slug}/
├── _config.json              ← Cấu hình dự án
├── MASTER-INDEX.md           ← Bản đồ tài liệu
├── _changelog.md             ← Lịch sử thay đổi
├── _PROJECT/                 ← Tài liệu cấp dự án
│   ├── PROJECT-OVERVIEW.md
│   ├── EXPERT-LOG.md
│   ├── DATA-DICTIONARY.md
│   ├── BIZ-POLICY/
│   └── PROCESS/
├── {SYSTEM}/                 ← Tài liệu từng system
│   ├── P1-REQUIREMENTS/      ← URS files
│   └── P2-DESIGN/            ← MODSPEC files
└── _mcv3-work/               ← Working files (checkpoint, snapshots)
\`\`\`

---

## Formal ID System

| Prefix | Loại | Ví dụ |
|--------|------|-------|
| \`BR-{DOM}-NNN\` | Business Rule | BR-INV-001 |
| \`US-{MOD}-NNN\` | User Story | US-INV-001 |
| \`UC-{MOD}-NNN-XX\` | Use Case | UC-INV-001-01 |
| \`FT-{MOD}-NNN\` | Feature | FT-INV-001 |
| \`TC-{MOD}-NNN\` | Test Case | TC-INV-001 |
| \`TBL-{SYS}-NNN\` | Database Table | TBL-ERP-001 |
| \`API-{SYS}-NNN\` | API Endpoint | API-ERP-001 |
| \`NFR-NNN\` | Non-Functional Req | NFR-001 |
`;
}
/**
 * Tạo nội dung .claude/rules/mc-data.md
 * Quy tắc làm việc với .mc-data/ directory
 */
function generateMcDataRules(config, slug) {
    return `# mc-data Rules — Dự án ${config.name}
<!-- Auto-generated bởi MCV3 mc_init_project -->

## Quy tắc bắt buộc

### 1. Không ghi .mc-data/ trực tiếp
- LUÔN dùng \`mc_save\` để lưu tài liệu
- KHÔNG dùng Write/Edit tool với đường dẫn \`.mc-data/\`
- Exception: Sửa lỗi typo nhỏ được phép nhưng phải log vào _changelog.md

### 2. Naming Conventions

| Loại file | Convention | Ví dụ |
|-----------|------------|-------|
| URS | \`URS-{MODULE}.md\` | URS-INV.md |
| MODSPEC | \`MODSPEC-{MODULE}.md\` | MODSPEC-INV.md |
| BIZ-POLICY | \`BIZ-POLICY-{DOMAIN}.md\` | BIZ-POLICY-SALES.md |
| PROCESS | \`PROCESS-{DOMAIN}.md\` | PROCESS-WAREHOUSE.md |
| TEST | \`TEST-{MODULE}.md\` | TEST-INV.md |

### 3. Formal ID Ranges (tránh conflict)

> Cập nhật khi có thêm modules mới

| System | Module | ID Range |
|--------|--------|---------|
| _(chưa định nghĩa)_ | | |

### 4. Smart Context Layering

Khi đọc tài liệu lớn, dùng layer nhỏ để tiết kiệm context:
\`\`\`
Layer 0: mc_load({ layer: 0 })  ← Key facts ~500B — dùng để check phase
Layer 1: mc_load({ layer: 1 })  ← Dependency map — dùng để biết đọc gì tiếp
Layer 2: mc_load({ layer: 2 })  ← Sections chính ~10KB — dùng để review
Layer 3: mc_load({ layer: 3 })  ← Full doc — dùng khi cần full detail
\`\`\`

### 5. Phase Gate

| Phase | Điều kiện để sang phase tiếp |
|-------|---------------------------|
| phase1-discovery → phase2-expert | PROJECT-OVERVIEW.md đã có và validated |
| phase2-expert → phase3-bizdocs | EXPERT-LOG.md đã có SESSION-001 |
| phase3-bizdocs → phase4-requirements | BIZ-POLICY + PROCESS + DATA-DICTIONARY đã complete |
| phase4-requirements → phase5-design | URS cho tất cả modules đã validated |
| phase5-design → phase6-qa | MODSPEC cho tất cả modules đã validated |
`;
}
// ─── Main Tool Function ───────────────────────────────────────────────────
/**
 * Thực thi tool mc_init_project
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án (thư mục người dùng đang làm việc)
 * @returns InitResult với thông tin dự án đã tạo
 */
async function mcInitProject(params, projectRoot) {
    // ── Validate input ────────────────────────────────────────────────────
    if (!params.projectName || params.projectName.trim() === '') {
        return {
            success: false,
            message: 'Thiếu tên dự án (projectName)',
            error: 'INVALID_PARAMS',
        };
    }
    if (!params.domain || params.domain.trim() === '') {
        return {
            success: false,
            message: 'Thiếu lĩnh vực kinh doanh (domain)',
            error: 'INVALID_PARAMS',
        };
    }
    // ── Tính toán đường dẫn ───────────────────────────────────────────────
    const slug = params.projectSlug || (0, file_io_js_1.createSlug)(params.projectName);
    const mcDataRoot = path.join(projectRoot, '.mc-data');
    const projectPath = path.join(mcDataRoot, 'projects', slug);
    const templatesRoot = path.join(mcDataRoot, 'templates'); // Link đến templates plugin
    // Kiểm tra project đã tồn tại chưa
    if (await (0, file_io_js_1.exists)(projectPath)) {
        return {
            success: false,
            message: `Dự án "${slug}" đã tồn tại tại ${projectPath}`,
            error: 'PROJECT_EXISTS',
        };
    }
    // ── Tạo cấu hình dự án ────────────────────────────────────────────────
    const now = new Date().toISOString();
    const config = {
        name: params.projectName.trim(),
        slug,
        domain: params.domain.trim(),
        createdAt: now,
        updatedAt: now,
        mcv3Version: '3.4.0',
        currentPhase: 'phase0-init',
        systems: [],
    };
    // ── Tạo cấu trúc thư mục ─────────────────────────────────────────────
    const createdDirs = [];
    try {
        // Tạo thư mục gốc .mc-data/
        await (0, file_io_js_1.ensureDir)(mcDataRoot);
        // Tạo tất cả thư mục con trong project
        for (const dir of PROJECT_DIRECTORIES) {
            const fullPath = path.join(projectPath, dir);
            await (0, file_io_js_1.ensureDir)(fullPath);
            createdDirs.push(path.relative(projectRoot, fullPath));
        }
        // ── Ghi các files khởi tạo ──────────────────────────────────────────
        // 1. _config.json — cấu hình dự án
        await (0, file_io_js_1.writeJson)(path.join(projectPath, '_config.json'), config);
        // 2. MASTER-INDEX.md — bản đồ dự án
        await (0, file_io_js_1.writeFile)(path.join(projectPath, 'MASTER-INDEX.md'), generateMasterIndex(config));
        // 3. _changelog.md — lịch sử thay đổi
        await (0, file_io_js_1.writeFile)(path.join(projectPath, '_changelog.md'), `# CHANGELOG — ${config.name}\n\n## ${now.split('T')[0]}\n- Khởi tạo dự án "${config.name}" bởi mc_init_project\n`);
        // 4. _dependency-graph.md — đồ thị phụ thuộc (ban đầu trống)
        await (0, file_io_js_1.writeFile)(path.join(projectPath, '_dependency-graph.md'), `# DEPENDENCY GRAPH — ${config.name}\n\n_Chưa có tài liệu nào. Cập nhật tự động khi tạo tài liệu._\n`);
        // 5. _mcv3-work/_checkpoint.md
        await (0, file_io_js_1.writeFile)(path.join(projectPath, '_mcv3-work', '_checkpoint.md'), generateInitialCheckpoint(config));
        // 6. Tạo README ngắn trong .mc-data/
        const mcDataReadme = await (0, file_io_js_1.exists)(path.join(mcDataRoot, 'README.md'));
        if (!mcDataReadme) {
            await (0, file_io_js_1.writeFile)(path.join(mcDataRoot, 'README.md'), `# .mc-data — MasterCraft DevKit v3.1\n\nThư mục này được quản lý bởi MCV3 Plugin. Không xóa hoặc sửa trực tiếp.\n\n## Projects\n\n- [${config.name}](projects/${slug}/MASTER-INDEX.md)\n`);
        }
        // 7. Auto-generate CLAUDE.md tại project root (Sprint 1 - CLAUDE.md Generator)
        const claudeMdPath = path.join(projectRoot, '.claude', 'CLAUDE.md');
        const claudeMdExists = await (0, file_io_js_1.exists)(claudeMdPath);
        if (!claudeMdExists) {
            await (0, file_io_js_1.writeFile)(claudeMdPath, generateProjectClaudeMd(config, slug));
        }
        // 8. Auto-generate .claude/rules/mc-data.md với naming conventions
        const mcDataRulePath = path.join(projectRoot, '.claude', 'rules', 'mc-data.md');
        const mcDataRuleExists = await (0, file_io_js_1.exists)(mcDataRulePath);
        if (!mcDataRuleExists) {
            await (0, file_io_js_1.writeFile)(mcDataRulePath, generateMcDataRules(config, slug));
        }
        return {
            success: true,
            message: `✅ Đã khởi tạo dự án "${config.name}" tại .mc-data/projects/${slug}/`,
            data: {
                projectSlug: slug,
                projectPath: path.relative(projectRoot, projectPath),
                structureCreated: createdDirs,
            },
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Lỗi khi khởi tạo dự án: ${errorMsg}`,
            error: errorMsg,
        };
    }
}
//# sourceMappingURL=mc-init.js.map