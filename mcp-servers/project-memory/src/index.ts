/**
 * index.ts — MCV3 Project Memory MCP Server
 *
 * Entry point cho MCP Server. Đăng ký 19 tools (Sprint 0 + Sprint 1 + Sprint 2):
 *
 * Sprint 0 — Core Tools:
 *   1. mc_init_project  — Khởi tạo dự án mới
 *   2. mc_save          — Lưu artifact vào .mc-data/
 *   3. mc_load          — Đọc artifact (Smart Context Layering)
 *   4. mc_list          — Liệt kê documents
 *   5. mc_status        — Xem trạng thái dự án
 *
 * Sprint 1 — Extended Tools:
 *   6. mc_checkpoint    — Lưu checkpoint trạng thái session
 *   7. mc_resume        — Resume từ checkpoint (session mới)
 *   8. mc_validate      — Validate format/completeness tài liệu
 *   9. mc_export        — Export tài liệu (bundle/summary/index)
 *  10. mc_search        — Tìm kiếm trong project memory
 *
 * Sprint 2 — Advanced Tools:
 *  11. mc_snapshot        — Snapshot đầy đủ project state
 *  12. mc_rollback        — Rollback về snapshot trước
 *  13. mc_impact_analysis — Phân tích impact khi thay đổi
 *  14. mc_traceability    — Quản lý traceability matrix
 *  15. mc_dependency      — Quản lý dependencies giữa documents
 *  16. mc_compare         — So sánh 2 versions của document
 *  17. mc_merge           — Merge changes từ nhiều sources
 *  18. mc_changelog       — Quản lý changelog có cấu trúc
 *  19. mc_summary         — Tạo summary project/phase/module
 *
 * Chạy qua stdio transport (standard Claude Code MCP setup).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import các tool implementations — Sprint 0
import { mcInitProject } from './tools/mc-init.js';
import { mcSave } from './tools/mc-save.js';
import { mcLoad } from './tools/mc-load.js';
import { mcList } from './tools/mc-list.js';
import { mcStatus } from './tools/mc-status.js';

// Import các tool implementations — Sprint 1
import { mcCheckpoint } from './tools/mc-checkpoint.js';
import { mcResume } from './tools/mc-resume.js';
import { mcValidate } from './tools/mc-validate.js';
import { mcExport } from './tools/mc-export.js';
import { mcSearch } from './tools/mc-search.js';

// Import các tool implementations — Sprint 2
import { mcSnapshot } from './tools/mc-snapshot.js';
import { mcRollback } from './tools/mc-rollback.js';
import { mcImpactAnalysis } from './tools/mc-impact-analysis.js';
import { mcTraceability } from './tools/mc-traceability.js';
import { mcDependency } from './tools/mc-dependency.js';
import { mcCompare } from './tools/mc-compare.js';
import { mcMerge } from './tools/mc-merge.js';
import { mcChangelog } from './tools/mc-changelog.js';
import { mcSummary } from './tools/mc-summary.js';

import type { DocumentType } from './types.js';

// ─── Server Setup ─────────────────────────────────────────────────────────

/**
 * Xác định project root:
 * - Ưu tiên biến môi trường MCV3_PROJECT_ROOT
 * - Fallback: thư mục hiện tại khi chạy
 */
function getProjectRoot(): string {
  return process.env['MCV3_PROJECT_ROOT'] || process.cwd();
}

// Khởi tạo MCP Server
const server = new Server(
  {
    name: 'mcv3-project-memory',
    version: '3.4.0', // Sprint 4 — Lifecycle Skills
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ─── Tool Definitions ─────────────────────────────────────────────────────

/**
 * Đăng ký danh sách tools — Claude đọc schema này để biết cách gọi
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ── Tool 1: mc_init_project ────────────────────────────────────
      {
        name: 'mc_init_project',
        description: `Khởi tạo dự án MCV3 mới. Tạo cấu trúc .mc-data/ với MASTER-INDEX.md và _config.json.
Dùng khi: Bắt đầu dự án mới hoàn toàn.
Output: .mc-data/projects/{slug}/ với đầy đủ thư mục con.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Tên dự án đầy đủ (VD: "Hệ thống ERP Công ty ABC")',
            },
            domain: {
              type: 'string',
              description: 'Lĩnh vực kinh doanh (VD: "Logistics", "Retail", "SaaS")',
            },
            projectSlug: {
              type: 'string',
              description: 'Slug dùng làm tên folder (tự sinh nếu không truyền)',
            },
            projectRoot: {
              type: 'string',
              description: 'Đường dẫn thư mục gốc dự án (mặc định: thư mục hiện tại)',
            },
          },
          required: ['projectName', 'domain'],
        },
      },

      // ── Tool 2: mc_save ───────────────────────────────────────────
      {
        name: 'mc_save',
        description: `Lưu artifact (tài liệu Markdown) vào project memory.
Dùng khi: Tạo hoặc cập nhật bất kỳ tài liệu nào trong .mc-data/.
Tự động cập nhật _changelog.md khi lưu.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug của dự án' },
            filePath: { type: 'string', description: 'Đường dẫn file tương đối' },
            content: { type: 'string', description: 'Nội dung Markdown đầy đủ' },
            documentType: { type: 'string', description: 'Loại tài liệu để index' },
          },
          required: ['projectSlug', 'filePath', 'content'],
        },
      },

      // ── Tool 3: mc_load ───────────────────────────────────────────
      {
        name: 'mc_load',
        description: `Đọc artifact từ project memory với Smart Context Layering.
Layer 0: Key facts (~500B) | Layer 1: Dependency Map | Layer 2: Sections | Layer 3: Full (default)`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug của dự án' },
            filePath: { type: 'string', description: 'Đường dẫn file' },
            layer: { type: 'number', enum: [0, 1, 2, 3], description: 'Context layer (default: 3)' },
          },
          required: ['projectSlug', 'filePath'],
        },
      },

      // ── Tool 4: mc_list ───────────────────────────────────────────
      {
        name: 'mc_list',
        description: `Liệt kê tài liệu trong project memory. Hỗ trợ lọc theo subPath và documentType.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug của dự án' },
            subPath: { type: 'string', description: 'Lọc theo thư mục con' },
            documentType: { type: 'string', description: 'Lọc theo loại tài liệu' },
          },
          required: ['projectSlug'],
        },
      },

      // ── Tool 5: mc_status ─────────────────────────────────────────
      {
        name: 'mc_status',
        description: `Xem trạng thái dự án: phase, progress, systems, docs.
Không truyền projectSlug → liệt kê tất cả projects.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án (bỏ trống để xem tất cả)' },
          },
          required: [],
        },
      },

      // ── Sprint 1 Tools ─────────────────────────────────────────────

      // ── Tool 6: mc_checkpoint ──────────────────────────────────────
      {
        name: 'mc_checkpoint',
        description: `Lưu checkpoint trạng thái session. Dùng khi kết thúc session hoặc trước thay đổi lớn.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            label: { type: 'string', description: 'Nhãn checkpoint' },
            sessionSummary: { type: 'string', description: 'Tóm tắt session' },
            nextActions: { type: 'array', items: { type: 'string' }, description: 'Việc cần làm tiếp' },
            saveSnapshot: { type: 'boolean', description: 'Lưu versioned snapshot (default: true)' },
          },
          required: ['projectSlug'],
        },
      },

      // ── Tool 7: mc_resume ─────────────────────────────────────────
      {
        name: 'mc_resume',
        description: `Load checkpoint và trả về context để resume session mới.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án cần resume' },
            snapshotName: { type: 'string', description: 'Tên snapshot cụ thể' },
            includeKeyFacts: { type: 'boolean', description: 'Bao gồm key-facts (default: true)' },
          },
          required: ['projectSlug'],
        },
      },

      // ── Tool 8: mc_validate ───────────────────────────────────────
      {
        name: 'mc_validate',
        description: `Validate format và completeness của tài liệu MCV3. Kiểm tra IDs, sections, placeholders.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            filePath: { type: 'string', description: 'Đường dẫn file cần validate' },
            validationType: {
              type: 'string',
              enum: ['format', 'completeness', 'ids', 'all'],
              description: 'Loại validation (default: "all")',
            },
          },
          required: ['projectSlug', 'filePath'],
        },
      },

      // ── Tool 9: mc_export ─────────────────────────────────────────
      {
        name: 'mc_export',
        description: `Export tài liệu dự án: "summary" | "bundle" | "index" | "phase". Output vào _mcv3-work/_exports/`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            exportType: { type: 'string', enum: ['bundle', 'summary', 'phase', 'index'], description: 'Loại export' },
            targetPath: { type: 'string', description: 'Thư mục/phase cần export' },
            outputName: { type: 'string', description: 'Tên file output' },
          },
          required: ['projectSlug'],
        },
      },

      // ── Tool 10: mc_search ────────────────────────────────────────
      {
        name: 'mc_search',
        description: `Tìm kiếm trong project memory: full-text search qua tài liệu. Hỗ trợ tìm Formal ID, từ khóa.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            query: { type: 'string', description: 'Từ khóa tìm kiếm' },
            maxResults: { type: 'number', description: 'Số kết quả tối đa (default: 10)' },
            searchIn: { type: 'string', description: 'Giới hạn tìm trong thư mục con' },
            caseSensitive: { type: 'boolean', description: 'Phân biệt hoa thường (default: false)' },
            contextLines: { type: 'number', description: 'Số dòng context (default: 2)' },
          },
          required: ['projectSlug', 'query'],
        },
      },

      // ── Sprint 2 Tools ─────────────────────────────────────────────

      // ── Tool 11: mc_snapshot ──────────────────────────────────────
      {
        name: 'mc_snapshot',
        description: `Tạo snapshot đầy đủ toàn bộ project state (tất cả documents).
Khác với mc_checkpoint (chỉ metadata), mc_snapshot lưu toàn bộ nội dung.
Dùng trước các thay đổi lớn hoặc milestone quan trọng.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            label: { type: 'string', description: 'Nhãn snapshot (VD: "truoc-refactor-phase4")' },
            includeWorkFiles: { type: 'boolean', description: 'Include working files (default: false)' },
            notes: { type: 'string', description: 'Ghi chú về snapshot này' },
          },
          required: ['projectSlug'],
        },
      },

      // ── Tool 12: mc_rollback ──────────────────────────────────────
      {
        name: 'mc_rollback',
        description: `Rollback toàn bộ project về trạng thái của một snapshot trước.
CẢNH BÁO: Sẽ xóa trạng thái hiện tại! Tự động tạo safety snapshot trước khi rollback.
Lần đầu gọi mà không có force=true sẽ hiển thị warning và yêu cầu confirm.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            snapshotName: { type: 'string', description: 'Tên snapshot (VD: "2024-01-15T10-30-00-truoc-refactor.bundle.json")' },
            force: { type: 'boolean', description: 'Bỏ qua xác nhận (default: false)' },
          },
          required: ['projectSlug', 'snapshotName'],
        },
      },

      // ── Tool 13: mc_impact_analysis ───────────────────────────────
      {
        name: 'mc_impact_analysis',
        description: `Phân tích ảnh hưởng khi thay đổi một requirement/feature/design element.
Trả về: danh sách IDs bị ảnh hưởng, documents cần update, và checklist việc cần làm.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            changeId: { type: 'string', description: 'ID của element bị thay đổi (VD: BR-WH-001, API-ERP-003)' },
            changeDescription: { type: 'string', description: 'Mô tả ngắn về thay đổi' },
            changeType: {
              type: 'string',
              enum: ['minor', 'major', 'breaking'],
              description: 'Mức độ thay đổi (default: major)',
            },
          },
          required: ['projectSlug', 'changeId'],
        },
      },

      // ── Tool 14: mc_traceability ──────────────────────────────────
      {
        name: 'mc_traceability',
        description: `Quản lý traceability matrix: PROB → BR → US → FT → API/TBL → TC.
Actions: register (đăng ký IDs), link (liên kết IDs), query (xem chain), check (tìm gaps), export (xuất matrix).`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            action: {
              type: 'string',
              enum: ['register', 'link', 'query', 'check', 'export'],
              description: 'Hành động cần thực hiện',
            },
            source: { type: 'string', description: 'File source (dùng với register)' },
            ids: { type: 'array', items: { type: 'string' }, description: 'IDs cần đăng ký (dùng với register)' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: { from: { type: 'string' }, to: { type: 'string' } },
                required: ['from', 'to'],
              },
              description: 'Links cần tạo (dùng với link)',
            },
            queryId: { type: 'string', description: 'ID cần query (dùng với query)' },
            direction: { type: 'string', enum: ['forward', 'backward', 'both'], description: 'Hướng query' },
          },
          required: ['projectSlug', 'action'],
        },
      },

      // ── Tool 15: mc_dependency ────────────────────────────────────
      {
        name: 'mc_dependency',
        description: `Quản lý dependencies giữa documents (producer-consumer).
Actions: register (đăng ký), query (xem deps), check (kiểm tra circular), impact (phân tích ảnh hưởng).`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            action: {
              type: 'string',
              enum: ['register', 'query', 'check', 'impact'],
              description: 'Hành động',
            },
            source: { type: 'string', description: 'Document source' },
            dependsOn: { type: 'array', items: { type: 'string' }, description: 'Documents mà source depends on' },
            document: { type: 'string', description: 'Document cần query/impact analysis' },
          },
          required: ['projectSlug', 'action'],
        },
      },

      // ── Tool 16: mc_compare ───────────────────────────────────────
      {
        name: 'mc_compare',
        description: `So sánh 2 versions của document hoặc 2 documents khác nhau.
fileB có thể là "@snapshot:{name}" để so sánh với phiên bản trong snapshot.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            fileA: { type: 'string', description: 'File A (current)' },
            fileB: { type: 'string', description: 'File B hoặc "@snapshot:{name}"' },
            snapshotName: { type: 'string', description: 'Tên snapshot (nếu compare với snapshot)' },
            contextLines: { type: 'number', description: 'Context lines xung quanh diff (default: 3)' },
          },
          required: ['projectSlug', 'fileA', 'fileB'],
        },
      },

      // ── Tool 17: mc_merge ─────────────────────────────────────────
      {
        name: 'mc_merge',
        description: `Merge content từ nhiều sources vào document.
Modes: append (thêm cuối), section (merge vào section), replace-section (thay section), smart (tự detect).`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            targetFile: { type: 'string', description: 'File đích để merge vào' },
            content: { type: 'string', description: 'Nội dung cần merge' },
            mode: {
              type: 'string',
              enum: ['append', 'section', 'replace-section', 'smart'],
              description: 'Mode merge (default: append)',
            },
            sectionName: { type: 'string', description: 'Tên section target' },
            sourceLabel: { type: 'string', description: 'Label nguồn gốc content' },
            createIfNotExists: { type: 'boolean', description: 'Tạo file mới nếu chưa tồn tại' },
          },
          required: ['projectSlug', 'targetFile', 'content'],
        },
      },

      // ── Tool 18: mc_changelog ─────────────────────────────────────
      {
        name: 'mc_changelog',
        description: `Quản lý changelog có cấu trúc. Actions: view, add, filter, release-notes.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            action: {
              type: 'string',
              enum: ['view', 'add', 'filter', 'release-notes'],
              description: 'Hành động',
            },
            entry: { type: 'string', description: 'Nội dung entry (dùng với add)' },
            changeType: {
              type: 'string',
              enum: ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security', 'milestone'],
              description: 'Loại thay đổi',
            },
            phase: { type: 'string', description: 'Phase liên quan' },
            fromDate: { type: 'string', description: 'Filter từ ngày (YYYY-MM-DD)' },
            toDate: { type: 'string', description: 'Filter đến ngày (YYYY-MM-DD)' },
            limit: { type: 'number', description: 'Số entries tối đa (default: 20)' },
            targetPhase: { type: 'string', description: 'Phase muốn tạo release notes' },
          },
          required: ['projectSlug', 'action'],
        },
      },

      // ── Tool 19: mc_summary ───────────────────────────────────────
      {
        name: 'mc_summary',
        description: `Tạo summary của project/phase/module. Types: project, phase, module, executive.
Dùng khi bắt đầu session mới hoặc cần báo cáo tiến độ.`,
        inputSchema: {
          type: 'object',
          properties: {
            projectSlug: { type: 'string', description: 'Slug dự án' },
            summaryType: {
              type: 'string',
              enum: ['project', 'phase', 'module', 'executive'],
              description: 'Loại summary (default: project)',
            },
            phase: { type: 'string', description: 'Phase cần summarize' },
            module: { type: 'string', description: 'Module/System cần summarize' },
            save: { type: 'boolean', description: 'Lưu summary vào file (default: false)' },
          },
          required: ['projectSlug'],
        },
      },
    ],
  };
});

// ─── Tool Execution ───────────────────────────────────────────────────────

/**
 * Xử lý call tool từ Claude
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const projectRoot = getProjectRoot();

  // Đảm bảo args là object
  const safeArgs = (args || {}) as Record<string, unknown>;

  try {
    let result: {
      success: boolean;
      message: string;
      data?: unknown;
      error?: string;
    };

    switch (name) {
      // ── Sprint 0 Tools ────────────────────────────────────────────
      case 'mc_init_project':
        result = await mcInitProject(
          {
            projectName: safeArgs['projectName'] as string,
            domain: safeArgs['domain'] as string,
            projectSlug: safeArgs['projectSlug'] as string | undefined,
            projectRoot: (safeArgs['projectRoot'] as string) || projectRoot,
          },
          (safeArgs['projectRoot'] as string) || projectRoot
        );
        break;

      case 'mc_save':
        result = await mcSave(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            filePath: safeArgs['filePath'] as string,
            content: safeArgs['content'] as string,
            documentType: safeArgs['documentType'] as DocumentType | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_load':
        result = await mcLoad(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            filePath: safeArgs['filePath'] as string,
            layer: safeArgs['layer'] as 0 | 1 | 2 | 3 | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_list':
        result = await mcList(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            subPath: safeArgs['subPath'] as string | undefined,
            documentType: safeArgs['documentType'] as DocumentType | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_status':
        result = await mcStatus(
          {
            projectSlug: safeArgs['projectSlug'] as string | undefined,
          },
          projectRoot
        );
        break;

      // ── Sprint 1 Tools ────────────────────────────────────────────
      case 'mc_checkpoint':
        result = await mcCheckpoint(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            label: safeArgs['label'] as string | undefined,
            sessionSummary: safeArgs['sessionSummary'] as string | undefined,
            nextActions: safeArgs['nextActions'] as string[] | undefined,
            saveSnapshot: safeArgs['saveSnapshot'] as boolean | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_resume':
        result = await mcResume(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            snapshotName: safeArgs['snapshotName'] as string | undefined,
            includeKeyFacts: safeArgs['includeKeyFacts'] as boolean | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_validate':
        result = await mcValidate(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            filePath: safeArgs['filePath'] as string,
            validationType: safeArgs['validationType'] as 'format' | 'completeness' | 'ids' | 'all' | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_export':
        result = await mcExport(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            exportType: safeArgs['exportType'] as 'bundle' | 'summary' | 'phase' | 'index' | undefined,
            targetPath: safeArgs['targetPath'] as string | undefined,
            outputName: safeArgs['outputName'] as string | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_search':
        result = await mcSearch(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            query: safeArgs['query'] as string,
            maxResults: safeArgs['maxResults'] as number | undefined,
            searchIn: safeArgs['searchIn'] as string | undefined,
            caseSensitive: safeArgs['caseSensitive'] as boolean | undefined,
            contextLines: safeArgs['contextLines'] as number | undefined,
          },
          projectRoot
        );
        break;

      // ── Sprint 2 Tools ────────────────────────────────────────────

      case 'mc_snapshot':
        result = await mcSnapshot(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            label: safeArgs['label'] as string | undefined,
            includeWorkFiles: safeArgs['includeWorkFiles'] as boolean | undefined,
            notes: safeArgs['notes'] as string | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_rollback':
        result = await mcRollback(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            snapshotName: safeArgs['snapshotName'] as string,
            force: safeArgs['force'] as boolean | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_impact_analysis':
        result = await mcImpactAnalysis(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            changeId: safeArgs['changeId'] as string,
            changeDescription: safeArgs['changeDescription'] as string | undefined,
            changeType: safeArgs['changeType'] as 'minor' | 'major' | 'breaking' | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_traceability':
        result = await mcTraceability(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            action: safeArgs['action'] as 'register' | 'link' | 'query' | 'check' | 'export',
            source: safeArgs['source'] as string | undefined,
            ids: safeArgs['ids'] as string[] | undefined,
            items: safeArgs['items'] as Array<{ from: string; to: string }> | undefined,
            queryId: safeArgs['queryId'] as string | undefined,
            direction: safeArgs['direction'] as 'forward' | 'backward' | 'both' | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_dependency':
        result = await mcDependency(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            action: safeArgs['action'] as 'register' | 'query' | 'check' | 'impact',
            source: safeArgs['source'] as string | undefined,
            dependsOn: safeArgs['dependsOn'] as string[] | undefined,
            document: safeArgs['document'] as string | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_compare':
        result = await mcCompare(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            fileA: safeArgs['fileA'] as string,
            fileB: safeArgs['fileB'] as string,
            snapshotName: safeArgs['snapshotName'] as string | undefined,
            contextLines: safeArgs['contextLines'] as number | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_merge':
        result = await mcMerge(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            targetFile: safeArgs['targetFile'] as string,
            content: safeArgs['content'] as string,
            mode: safeArgs['mode'] as 'append' | 'section' | 'replace-section' | 'smart' | undefined,
            sectionName: safeArgs['sectionName'] as string | undefined,
            sourceLabel: safeArgs['sourceLabel'] as string | undefined,
            createIfNotExists: safeArgs['createIfNotExists'] as boolean | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_changelog':
        result = await mcChangelog(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            action: safeArgs['action'] as 'view' | 'add' | 'filter' | 'release-notes',
            entry: safeArgs['entry'] as string | undefined,
            changeType: safeArgs['changeType'] as 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security' | 'milestone' | undefined,
            phase: safeArgs['phase'] as string | undefined,
            fromDate: safeArgs['fromDate'] as string | undefined,
            toDate: safeArgs['toDate'] as string | undefined,
            limit: safeArgs['limit'] as number | undefined,
            targetPhase: safeArgs['targetPhase'] as string | undefined,
          },
          projectRoot
        );
        break;

      case 'mc_summary':
        result = await mcSummary(
          {
            projectSlug: safeArgs['projectSlug'] as string,
            summaryType: safeArgs['summaryType'] as 'project' | 'phase' | 'module' | 'executive' | undefined,
            phase: safeArgs['phase'] as string | undefined,
            module: safeArgs['module'] as string | undefined,
            save: safeArgs['save'] as boolean | undefined,
          },
          projectRoot
        );
        break;

      default:
        result = {
          success: false,
          message: `Tool không tồn tại: ${name}`,
          error: 'UNKNOWN_TOOL',
        };
    }

    // Format kết quả cho MCP response
    return {
      content: [
        {
          type: 'text',
          text: formatToolResponse(result),
        },
      ],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Lỗi không mong đợi khi chạy ${name}: ${errorMsg}`,
        },
      ],
      isError: true,
    };
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────

/**
 * Format kết quả tool thành text đẹp cho Claude đọc
 */
function formatToolResponse(result: {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}): string {
  const lines: string[] = [result.message];

  if (result.data) {
    // Nếu data có content (mc_load), hiển thị trực tiếp
    const dataObj = result.data as Record<string, unknown>;
    if (dataObj['content']) {
      lines.push('\n---\n');
      lines.push(dataObj['content'] as string);
    } else if (dataObj['documents']) {
      // mc_list result
      const docs = dataObj['documents'] as Array<{ path: string; type: string; size?: number }>;
      if (docs.length > 0) {
        lines.push('\n**Danh sách tài liệu:**');
        for (const doc of docs) {
          const sizeStr = doc.size ? ` (${Math.round(doc.size / 1024)}KB)` : '';
          lines.push(`- \`${doc.path}\` [${doc.type}]${sizeStr}`);
        }
      }
    } else if (dataObj['structureCreated']) {
      // mc_init result
      const dirs = dataObj['structureCreated'] as string[];
      lines.push(`\n**Đã tạo ${dirs.length} thư mục**`);
      lines.push(`Slug: \`${dataObj['projectSlug']}\``);
    }
  }

  return lines.join('\n');
}

// ─── Start Server ─────────────────────────────────────────────────────────

/**
 * Khởi động server với stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log ra stderr (không ảnh hưởng stdio MCP protocol)
  process.stderr.write('MCV3 Project Memory MCP Server v3.4.0 started (Sprint 4)\n');
  process.stderr.write(`Project root: ${getProjectRoot()}\n`);
  process.stderr.write('Tools registered: 19 (Sprint 0: 5, Sprint 1: 5, Sprint 2: 9)\n');
}

// Chạy main và xử lý uncaught errors
main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
