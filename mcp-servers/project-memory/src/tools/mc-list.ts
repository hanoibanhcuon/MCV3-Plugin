/**
 * mc-list.ts — Tool: mc_list
 *
 * Liệt kê tài liệu trong project memory.
 * Hỗ trợ lọc theo:
 * - Thư mục con (subPath): "_PROJECT", "ERP/P2-DESIGN", ...
 * - Loại tài liệu (documentType): "modspec", "urs", ...
 *
 * Output: Danh sách DocumentMeta với path, type, size, timestamps
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { exists, getFileStat } from '../utils/file-io.js';
import type {
  McListParams,
  ListResult,
  DocumentMeta,
  DocumentType,
} from '../types.js';

// ─── Document Type Detection ──────────────────────────────────────────────

/**
 * Nhận diện loại tài liệu từ tên file/đường dẫn
 * Dùng heuristic dựa trên tên file theo convention MCV3
 */
function detectDocumentType(filePath: string): DocumentType {
  const filename = path.basename(filePath).toUpperCase();
  const dir = filePath.toUpperCase();

  // Theo thứ tự ưu tiên (specific → general)
  if (filename === 'MASTER-INDEX.MD') return 'master-index';
  if (filename === 'PROJECT-OVERVIEW.MD') return 'project-overview';
  if (filename === 'PROJECT-ARCHITECTURE.MD') return 'project-architecture';
  if (filename === 'DATA-DICTIONARY.MD') return 'data-dictionary';
  if (filename === 'EXPERT-LOG.MD') return 'expert-log';
  if (filename.startsWith('BIZ-POLICY')) return 'biz-policy';
  if (filename.startsWith('PROCESS-')) return 'process';
  if (filename === 'SYSTEM-INDEX.MD') return 'system-index';
  if (filename.startsWith('URS-')) return 'urs';
  if (filename.startsWith('MODSPEC-')) return 'modspec';
  if (filename === 'ARCHITECTURE.MD' && dir.includes('P2-DESIGN')) return 'architecture';
  if (filename === 'DATA-MODEL.MD') return 'data-model';
  if (filename.startsWith('TEST-')) return 'test';
  if (filename === 'USER-GUIDE.MD') return 'user-guide';
  if (filename === 'ADMIN-GUIDE.MD') return 'admin-guide';
  if (filename.includes('SERVICE-SPEC') || dir.includes('SHARED-SERVICES')) return 'service-spec';
  if (filename === 'DEPLOY-OPS.MD') return 'deploy-ops';
  if (filename.startsWith('_VERIFY') || filename.startsWith('VERIFY-')) return 'verify';
  if (filename.includes('KEY-FACTS') || filename === '_KEY-FACTS.MD') return 'key-facts';
  if (filename === '_CHANGELOG.MD') return 'changelog';
  if (filename === '_CHECKPOINT.MD') return 'checkpoint';

  return 'custom';
}

/**
 * Nhận diện system code và module code từ đường dẫn
 * VD: "ERP/P1-REQUIREMENTS/URS-INV.md" → system="ERP", module="INV"
 */
function extractSystemModule(
  filePath: string,
  projectPath: string
): { systemCode?: string; moduleCode?: string } {
  const relative = path.relative(projectPath, filePath).replace(/\\/g, '/');
  const parts = relative.split('/');

  // Bỏ qua _PROJECT, _SHARED-SERVICES, _VERIFY-CROSS (bắt đầu bằng _)
  if (parts[0].startsWith('_')) {
    return {};
  }

  // Parts[0] là system code (VD: ERP, WEB, MOB-STAFF)
  if (parts.length >= 1 && /^[A-Z]/.test(parts[0])) {
    const systemCode = parts[0];

    // Tìm module code từ tên file
    const filename = parts[parts.length - 1];
    const moduleMatch = filename.match(/^(?:URS|MODSPEC|TEST)-([A-Z]+)\.MD$/i);
    if (moduleMatch) {
      return { systemCode, moduleCode: moduleMatch[1] };
    }

    return { systemCode };
  }

  return {};
}

// ─── Directory Traversal ──────────────────────────────────────────────────

/**
 * Liệt kê đệ quy tất cả .md files trong thư mục
 * Bỏ qua: _mcv3-work/, node_modules/
 */
async function walkMarkdownFiles(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  if (!(await exists(dirPath))) return results;

  let entries: { name: string; isDirectory: () => boolean; isFile: () => boolean }[];
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Bỏ qua _mcv3-work và thư mục ẩn
      if (entry.name === '_mcv3-work' || entry.name.startsWith('.')) {
        continue;
      }
      const subFiles = await walkMarkdownFiles(fullPath);
      results.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_list
 */
export async function mcList(
  params: McListParams,
  projectRoot: string
): Promise<ListResult> {
  // ── Validate ──────────────────────────────────────────────────────────
  if (!params.projectSlug) {
    return {
      success: false,
      message: 'Thiếu projectSlug',
      error: 'INVALID_PARAMS',
      data: { documents: [], totalCount: 0 },
    };
  }

  const projectPath = path.join(projectRoot, '.mc-data', 'projects', params.projectSlug);

  if (!(await exists(projectPath))) {
    return {
      success: false,
      message: `Dự án "${params.projectSlug}" không tồn tại`,
      error: 'PROJECT_NOT_FOUND',
      data: { documents: [], totalCount: 0 },
    };
  }

  // ── Xác định thư mục cần liệt kê ─────────────────────────────────────
  const searchPath = params.subPath
    ? path.join(projectPath, params.subPath)
    : projectPath;

  // ── Liệt kê files ─────────────────────────────────────────────────────
  const allFiles = await walkMarkdownFiles(searchPath);

  // ── Build DocumentMeta ────────────────────────────────────────────────
  const documents: DocumentMeta[] = [];

  for (const filePath of allFiles) {
    const docType = detectDocumentType(filePath);

    // Lọc theo documentType nếu có
    if (params.documentType && docType !== params.documentType) {
      continue;
    }

    const relativePath = path.relative(projectPath, filePath).replace(/\\/g, '/');
    const stat = await getFileStat(filePath);
    const { systemCode, moduleCode } = extractSystemModule(filePath, projectPath);

    documents.push({
      type: docType,
      path: relativePath,
      filename: path.basename(filePath),
      systemCode,
      moduleCode,
      size: stat?.size,
      createdAt: stat?.createdAt,
      updatedAt: stat?.updatedAt,
    });
  }

  // ── Format output message ─────────────────────────────────────────────
  const filterDesc = [
    params.subPath ? `thư mục: ${params.subPath}` : null,
    params.documentType ? `loại: ${params.documentType}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const message = documents.length === 0
    ? `Không có tài liệu nào${filterDesc ? ` (${filterDesc})` : ''}`
    : `✅ Tìm thấy ${documents.length} tài liệu${filterDesc ? ` (${filterDesc})` : ''}`;

  return {
    success: true,
    message,
    data: {
      documents,
      totalCount: documents.length,
    },
  };
}
