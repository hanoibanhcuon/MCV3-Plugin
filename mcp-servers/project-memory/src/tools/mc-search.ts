/**
 * mc-search.ts — Tool: mc_search
 *
 * Tìm kiếm trong project memory:
 *   - Full-text search qua nội dung tài liệu
 *   - Tìm theo Formal ID (BR-XXX, US-XXX, ...)
 *   - Tìm theo từ khóa nghiệp vụ
 *   - Trả về danh sách files và đoạn text liên quan (context snippet)
 *
 * Output:
 *   - Danh sách kết quả có sắp xếp theo relevance
 *   - Context snippet xung quanh match (3 dòng trước/sau)
 *   - Số lần match trong mỗi file
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 22 — Search Protocol
 */

import * as path from 'path';
import {
  readFile,
  readJson,
  listFiles,
  exists,
} from '../utils/file-io.js';
import type { ProjectConfig, ToolResult } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_search */
export interface McSearchParams {
  /** Slug dự án */
  projectSlug: string;
  /** Từ khóa tìm kiếm (hỗ trợ nhiều từ phân cách bởi khoảng trắng) */
  query: string;
  /** Giới hạn số kết quả (default: 10) */
  maxResults?: number;
  /** Chỉ tìm trong thư mục con cụ thể (VD: "_PROJECT", "ERP") */
  searchIn?: string;
  /** Có phân biệt hoa thường không (default: false) */
  caseSensitive?: boolean;
  /** Số dòng context trước/sau mỗi match (default: 2) */
  contextLines?: number;
}

/** Một kết quả tìm kiếm */
interface SearchMatch {
  /** Dòng số trong file */
  lineNumber: number;
  /** Nội dung dòng match */
  matchLine: string;
  /** Context xung quanh */
  contextBefore: string[];
  /** Context xung quanh */
  contextAfter: string[];
}

/** Kết quả tìm kiếm từ 1 file */
interface SearchResult {
  filePath: string;
  matchCount: number;
  relevanceScore: number;
  matches: SearchMatch[];
}

// ─── Search Logic ──────────────────────────────────────────────────────────

/**
 * Tìm kiếm trong nội dung 1 file
 * @returns Danh sách matches, hoặc null nếu không có
 */
function searchInContent(
  content: string,
  terms: string[],
  caseSensitive: boolean,
  contextLines: number
): SearchMatch[] {
  const lines = content.split('\n');
  const matches: SearchMatch[] = [];

  // Chuẩn bị search terms
  const searchTerms = caseSensitive
    ? terms
    : terms.map(t => t.toLowerCase());

  for (let i = 0; i < lines.length; i++) {
    const line = caseSensitive ? lines[i] : lines[i].toLowerCase();

    // Kiểm tra tất cả terms đều có trong dòng (AND logic)
    const allMatch = searchTerms.every(term => line.includes(term));
    if (!allMatch) continue;

    // Lấy context
    const start = Math.max(0, i - contextLines);
    const end = Math.min(lines.length - 1, i + contextLines);

    matches.push({
      lineNumber: i + 1,
      matchLine: lines[i],
      contextBefore: lines.slice(start, i),
      contextAfter: lines.slice(i + 1, end + 1),
    });
  }

  return matches;
}

/**
 * Tính relevance score dựa trên số matches và vị trí trong file
 */
function calculateRelevance(matches: SearchMatch[], filePath: string): number {
  let score = matches.length * 10;

  // File trong _PROJECT được ưu tiên cao hơn
  if (filePath.includes('_PROJECT')) score += 5;

  // Match trong tiêu đề (dòng đầu) được ưu tiên cao hơn
  if (matches.some(m => m.lineNumber <= 5)) score += 3;

  return score;
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_search
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export async function mcSearch(
  params: McSearchParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate ──────────────────────────────────────────────────────────
  if (!params.projectSlug || !params.query || params.query.trim() === '') {
    return {
      success: false,
      message: 'Thiếu projectSlug hoặc query',
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

  try {
    // ── Đọc config ────────────────────────────────────────────────────────
    const config = await readJson<ProjectConfig>(
      path.join(projectPath, '_config.json')
    );

    // ── Chuẩn bị search ───────────────────────────────────────────────────
    const maxResults = params.maxResults || 10;
    const caseSensitive = params.caseSensitive || false;
    const contextLines = params.contextLines ?? 2;

    // Tách query thành các terms (split by space, filter empty)
    const terms = params.query.trim().split(/\s+/).filter(Boolean);

    // ── Xác định thư mục tìm kiếm ─────────────────────────────────────────
    const searchRoot = params.searchIn
      ? path.join(projectPath, params.searchIn)
      : projectPath;

    if (!(await exists(searchRoot))) {
      return {
        success: false,
        message: `Thư mục tìm kiếm không tồn tại: ${params.searchIn}`,
        error: 'SEARCH_PATH_NOT_FOUND',
      };
    }

    // ── Liệt kê tất cả .md files ──────────────────────────────────────────
    const allFiles = await listFiles(searchRoot, searchRoot);
    const searchFiles = allFiles.filter(f =>
      !f.includes('_mcv3-work') &&
      !f.startsWith('_changelog') &&
      f.endsWith('.md')
    );

    // ── Tìm kiếm trong từng file ──────────────────────────────────────────
    const results: SearchResult[] = [];

    for (const relativePath of searchFiles) {
      const fullPath = path.join(searchRoot, relativePath);
      const content = await readFile(fullPath);
      if (!content) continue;

      const matches = searchInContent(content, terms, caseSensitive, contextLines);
      if (matches.length === 0) continue;

      const displayPath = params.searchIn
        ? path.join(params.searchIn, relativePath).replace(/\\/g, '/')
        : relativePath;

      results.push({
        filePath: displayPath,
        matchCount: matches.length,
        relevanceScore: calculateRelevance(matches, displayPath),
        matches: matches.slice(0, 3), // Giới hạn 3 matches đầu per file để output gọn
      });
    }

    // ── Sort và limit kết quả ────────────────────────────────────────────
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topResults = results.slice(0, maxResults);

    // ── Format output ────────────────────────────────────────────────────
    const projectName = config?.name || params.projectSlug;
    let message = `🔍 Tìm "${params.query}" trong dự án "${projectName}": ${results.length} files có kết quả`;

    if (topResults.length === 0) {
      message = `🔍 Không tìm thấy "${params.query}" trong dự án "${projectName}"`;
    } else {
      // Format kết quả
      const resultLines: string[] = ['\n\n**Kết quả tìm kiếm:**\n'];

      for (const result of topResults) {
        resultLines.push(`\n### 📄 ${result.filePath} (${result.matchCount} matches)\n`);

        for (const match of result.matches) {
          if (match.contextBefore.length > 0) {
            resultLines.push(match.contextBefore.map(l => `  ${l}`).join('\n'));
          }
          resultLines.push(`→ **[Dòng ${match.lineNumber}]** ${match.matchLine}`);
          if (match.contextAfter.length > 0) {
            resultLines.push(match.contextAfter.map(l => `  ${l}`).join('\n'));
          }
          resultLines.push('');
        }
      }

      if (results.length > maxResults) {
        resultLines.push(`\n_...và ${results.length - maxResults} files khác. Dùng searchIn để lọc hẹp hơn._`);
      }

      message += resultLines.join('\n');
    }

    return {
      success: true,
      message,
      data: {
        query: params.query,
        totalFiles: results.length,
        results: topResults.map(r => ({
          filePath: r.filePath,
          matchCount: r.matchCount,
          topMatch: r.matches[0]?.matchLine || '',
        })),
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi search: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
