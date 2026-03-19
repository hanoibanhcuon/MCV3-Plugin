/**
 * mc-validate.ts — Tool: mc_validate
 *
 * Validate format và completeness của tài liệu MCV3:
 *   - Kiểm tra Formal ID format (BR-XXX, US-XXX, ...)
 *   - Kiểm tra sections bắt buộc có đầy đủ không
 *   - Kiểm tra placeholder chưa được điền
 *   - Validate cross-references giữa các IDs
 *
 * Trả về danh sách issues (errors + warnings) theo mức độ:
 *   - ERROR: Bắt buộc phải sửa trước khi sang phase tiếp
 *   - WARNING: Nên sửa, không block
 *   - INFO: Gợi ý cải thiện
 *
 * Tham chiếu: MCV3_Architecture_v3.1.md Section 5 — Formal ID System
 */

import * as path from 'path';
import {
  readFile,
  exists,
  readJson,
} from '../utils/file-io.js';
import type { ToolResult, ProjectConfig, ProjectPhase } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Tham số cho mc_validate */
export interface McValidateParams {
  /** Slug dự án */
  projectSlug: string;
  /** Đường dẫn file cần validate (tương đối từ project root) */
  filePath: string;
  /** Loại validation: "format" | "completeness" | "ids" | "all" (default: "all") */
  validationType?: 'format' | 'completeness' | 'ids' | 'all';
}

/** Một vấn đề phát hiện khi validate */
interface ValidationIssue {
  /** Mức độ nghiêm trọng */
  severity: 'ERROR' | 'WARNING' | 'INFO';
  /** Loại vấn đề */
  type: string;
  /** Mô tả */
  message: string;
  /** Dòng liên quan (nếu có) */
  line?: number;
  /** Gợi ý sửa */
  suggestion?: string;
}

/** Kết quả validate */
interface ValidationResult {
  filePath: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
}

// ─── Formal ID Patterns ────────────────────────────────────────────────────

/** Các patterns Formal ID hợp lệ trong MCV3 */
const VALID_ID_PATTERNS = [
  /\bBR-[A-Z]+-\d{3}\b/g,        // Business Rule: BR-INV-001
  /\bUS-[A-Z]+-\d{3}\b/g,        // User Story: US-INV-001
  /\bUC-[A-Z]+-\d{3}-\d{2}\b/g,  // Use Case: UC-INV-001-01
  /\bAC-[A-Z]+-\d{3}-\d{2}\b/g,  // Acceptance Criteria: AC-INV-001-01
  /\bFT-[A-Z]+-\d{3}\b/g,        // Feature: FT-INV-001
  /\bTC-[A-Z]+-\d{3}\b/g,        // Test Case: TC-INV-001
  /\bTBL-[A-Z]+-\d{3}\b/g,       // DB Table: TBL-ERP-001
  /\bAPI-[A-Z]+-\d{3}\b/g,       // API: API-ERP-001
  /\bINT-[A-Z]+-\d{3}\b/g,       // Integration: INT-ERP-001
  /\bNFR-\d{3}\b/g,              // Non-Functional: NFR-001
  /\bPROB-\d{3}\b/g,             // Problem: PROB-001
  /\bBG-[A-Z]+-\d{3}\b/g,        // Background: BG-BUS-001
];

/** Placeholder patterns cần được điền */
const PLACEHOLDER_PATTERNS = [
  /\[TÊN\s/gi,
  /\[NGÀY\]/gi,
  /\[XXX\]/g,
  /TODO:/gi,
  /PLACEHOLDER/gi,
  /\{{\s*[\w_]+\s*}}/g,  // Template variables chưa điền: {{variable}}
];

/** Sections bắt buộc theo loại tài liệu */
const REQUIRED_SECTIONS: Record<string, string[]> = {
  'PROJECT-OVERVIEW': [
    'BỐI CẢNH', 'VẤN ĐỀ', 'MỤC TIÊU', 'PHẠM VI',
  ],
  'EXPERT-LOG': [
    'SESSION', 'PHÂN TÍCH', 'KẾT LUẬN',
  ],
  'BIZ-POLICY': [
    'BUSINESS RULES', 'BR-',
  ],
  'PROCESS': [
    'AS-IS', 'TO-BE',
  ],
  'URS': [
    'USER STORIES', 'US-', 'ACCEPTANCE CRITERIA',
  ],
  'MODSPEC': [
    'DEPENDENCY MAP', 'BUSINESS RULES', 'FEATURES', 'API CONTRACTS',
  ],
  'TEST': [
    'TEST CASES', 'TC-',
  ],
};

// ─── Validate Functions ────────────────────────────────────────────────────

/**
 * Validate format cơ bản của tài liệu Markdown
 */
function validateFormat(content: string, filePath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  // Kiểm tra tiêu đề cấp 1 tồn tại
  const hasH1 = lines.some(l => l.startsWith('# '));
  if (!hasH1) {
    issues.push({
      severity: 'ERROR',
      type: 'FORMAT_NO_H1',
      message: 'Tài liệu thiếu tiêu đề cấp 1 (# Title)',
      suggestion: 'Thêm dòng đầu tiên: # [Tên tài liệu]',
    });
  }

  // Kiểm tra AI NAVIGATION GUIDE hoặc DEPENDENCY MAP
  const hasNavGuide =
    content.includes('DEPENDENCY MAP') ||
    content.includes('AI NAVIGATION') ||
    content.includes('## DEPENDENCIES');

  if (!hasNavGuide && !filePath.includes('_PROJECT/PROJECT-OVERVIEW')) {
    issues.push({
      severity: 'WARNING',
      type: 'FORMAT_NO_NAV_GUIDE',
      message: 'Thiếu DEPENDENCY MAP section giúp AI hiểu ngữ cảnh',
      suggestion: 'Thêm section "## DEPENDENCY MAP" ở đầu tài liệu',
    });
  }

  // Kiểm tra placeholder chưa điền
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(lines[i])) {
        issues.push({
          severity: 'WARNING',
          type: 'FORMAT_PLACEHOLDER',
          message: `Dòng ${i + 1}: Có placeholder chưa được điền`,
          line: i + 1,
          suggestion: 'Điền thông tin thực tế thay cho placeholder',
        });
        break; // Chỉ báo 1 issue per line
      }
    }
  }

  return issues;
}

/**
 * Validate Formal IDs trong tài liệu
 */
function validateIds(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Kiểm tra có IDs nào không (tài liệu nghiệp vụ nên có ít nhất vài IDs)
  let totalIds = 0;
  for (const pattern of VALID_ID_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) totalIds += matches.length;
  }

  // Tài liệu dài mà không có ID nào → warning
  if (totalIds === 0 && content.length > 500) {
    issues.push({
      severity: 'WARNING',
      type: 'IDS_NONE_FOUND',
      message: 'Tài liệu không có Formal IDs nào (BR-XXX, US-XXX, ...)',
      suggestion: 'Thêm Formal IDs để traceability. VD: BR-INV-001: Tên quy tắc',
    });
  }

  // Kiểm tra format IDs không hợp lệ (có dạng BR- nhưng không đúng format)
  const invalidBRPattern = /\bBR-[^A-Z\s]/g;
  const invalidMatches = content.match(invalidBRPattern);
  if (invalidMatches) {
    issues.push({
      severity: 'WARNING',
      type: 'IDS_INVALID_FORMAT',
      message: `Có ${invalidMatches.length} ID có thể không đúng format`,
      suggestion: 'Format đúng: BR-[DOMAIN]-[NNN] (VD: BR-INV-001)',
    });
  }

  return issues;
}

/**
 * Validate completeness: kiểm tra sections bắt buộc
 */
function validateCompleteness(content: string, filePath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const filename = path.basename(filePath, '.md').toUpperCase();

  // Tìm loại template dựa trên tên file
  let templateType: string | null = null;
  for (const key of Object.keys(REQUIRED_SECTIONS)) {
    if (filename.includes(key)) {
      templateType = key;
      break;
    }
  }

  if (!templateType) return issues;

  // Kiểm tra từng section bắt buộc
  const requiredSecs = REQUIRED_SECTIONS[templateType] || [];
  for (const section of requiredSecs) {
    if (!content.toUpperCase().includes(section.toUpperCase())) {
      issues.push({
        severity: 'WARNING',
        type: 'COMPLETENESS_MISSING_SECTION',
        message: `Thiếu section bắt buộc: "${section}"`,
        suggestion: `Thêm section "## ${section}" vào tài liệu`,
      });
    }
  }

  return issues;
}

// ─── Per-System Phase Validation ──────────────────────────────────────────

/**
 * Các phases hợp lệ trong MCV3 pipeline (theo thứ tự)
 */
const VALID_PHASES: ProjectPhase[] = [
  'phase0-init',
  'phase1-discovery',
  'phase2-expert',
  'phase3-bizdocs',
  'phase4-requirements',
  'phase5-design',
  'phase6-qa',
  'phase7-codegen',
  'phase8-verify',
];

/**
 * Validate tính nhất quán của per-system phases trong _config.json.
 * Kiểm tra:
 * - Mỗi system.currentPhase là phase hợp lệ
 * - Không có system nào có phase cao hơn project-level phase quá nhiều
 *   (cảnh báo nếu system đang ở phase8 nhưng project-level chỉ phase0)
 *
 * @param projectPath - Đường dẫn thư mục project trong .mc-data/
 * @returns Danh sách validation issues liên quan đến per-system phases
 */
async function validatePerSystemPhases(projectPath: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  const config = await readJson<ProjectConfig>(path.join(projectPath, '_config.json'));
  if (!config) return issues;

  const systems = config.systems || [];
  const projectPhaseIndex = VALID_PHASES.indexOf(config.currentPhase);

  for (const sys of systems) {
    if (!sys.currentPhase) continue; // Không có per-system phase → bỏ qua

    // Kiểm tra phase hợp lệ
    if (!VALID_PHASES.includes(sys.currentPhase)) {
      issues.push({
        severity: 'ERROR',
        type: 'PER_SYSTEM_PHASE_INVALID',
        message: `System ${sys.code}: currentPhase "${sys.currentPhase}" không hợp lệ`,
        suggestion: `Dùng một trong: ${VALID_PHASES.join(', ')}`,
      });
      continue;
    }

    // Kiểm tra per-system phase không vượt quá project phase quá nhiều
    const sysPhaseIndex = VALID_PHASES.indexOf(sys.currentPhase);
    const phaseDiff = sysPhaseIndex - projectPhaseIndex;

    if (phaseDiff > 3) {
      issues.push({
        severity: 'WARNING',
        type: 'PER_SYSTEM_PHASE_INCONSISTENT',
        message: `System ${sys.code} đang ở ${sys.currentPhase} nhưng project-level chỉ ở ${config.currentPhase}`,
        suggestion: 'Cân nhắc cập nhật project-level currentPhase để phản ánh đúng tiến độ',
      });
    }
  }

  // Cảnh báo nếu có systems với per-system phase nhưng project phase vẫn là phase0-init
  const systemsWithPhase = systems.filter(s => s.currentPhase && s.currentPhase !== 'phase0-init');
  if (systemsWithPhase.length > 0 && config.currentPhase === 'phase0-init') {
    issues.push({
      severity: 'INFO',
      type: 'PER_SYSTEM_PHASE_RECOMMEND_UPDATE',
      message: `${systemsWithPhase.length} systems có per-system phase nhưng project-level vẫn là phase0-init`,
      suggestion: 'Cân nhắc cập nhật project currentPhase sang phase cao nhất trong systems',
    });
  }

  return issues;
}

// ─── Main Tool Function ───────────────────────────────────────────────────

/**
 * Thực thi tool mc_validate
 *
 * @param params - Tham số từ MCP call
 * @param projectRoot - Thư mục gốc dự án
 */
export async function mcValidate(
  params: McValidateParams,
  projectRoot: string
): Promise<ToolResult> {
  // ── Validate params ───────────────────────────────────────────────────
  if (!params.projectSlug || !params.filePath) {
    return {
      success: false,
      message: 'Thiếu projectSlug hoặc filePath',
      error: 'INVALID_PARAMS',
    };
  }

  const fullPath = path.join(
    projectRoot, '.mc-data', 'projects', params.projectSlug, params.filePath
  );

  // Kiểm tra file tồn tại
  if (!(await exists(fullPath))) {
    return {
      success: false,
      message: `File không tồn tại: ${params.filePath}`,
      error: 'FILE_NOT_FOUND',
    };
  }

  try {
    // ── Đọc nội dung file ────────────────────────────────────────────────
    const content = await readFile(fullPath);
    if (!content) {
      return {
        success: false,
        message: 'File trống',
        error: 'EMPTY_FILE',
      };
    }

    // ── Chạy validations ─────────────────────────────────────────────────
    const validationType = params.validationType || 'all';
    const allIssues: ValidationIssue[] = [];

    if (validationType === 'format' || validationType === 'all') {
      allIssues.push(...validateFormat(content, params.filePath));
    }

    if (validationType === 'ids' || validationType === 'all') {
      allIssues.push(...validateIds(content));
    }

    if (validationType === 'completeness' || validationType === 'all') {
      allIssues.push(...validateCompleteness(content, params.filePath));
    }

    // Validate per-system phases nếu đang validate _config.json
    if (params.filePath === '_config.json' || validationType === 'all') {
      const projectPath = path.join(
        projectRoot, '.mc-data', 'projects', params.projectSlug
      );
      allIssues.push(...await validatePerSystemPhases(projectPath));
    }

    // ── Tổng hợp kết quả ─────────────────────────────────────────────────
    const result: ValidationResult = {
      filePath: params.filePath,
      isValid: allIssues.filter(i => i.severity === 'ERROR').length === 0,
      errorCount: allIssues.filter(i => i.severity === 'ERROR').length,
      warningCount: allIssues.filter(i => i.severity === 'WARNING').length,
      infoCount: allIssues.filter(i => i.severity === 'INFO').length,
      issues: allIssues,
    };

    // ── Format message ────────────────────────────────────────────────────
    const statusIcon = result.isValid ? '✅' : '❌';
    let message = `${statusIcon} Validate "${params.filePath}": `;
    message += `${result.errorCount} errors, ${result.warningCount} warnings`;

    if (allIssues.length > 0) {
      const issueLines = allIssues.map(i =>
        `  [${i.severity}] ${i.type}: ${i.message}${i.suggestion ? ` → ${i.suggestion}` : ''}`
      );
      message += '\n\n' + issueLines.join('\n');
    } else {
      message += '\n\n✨ Tài liệu hợp lệ!';
    }

    return {
      success: result.isValid,
      message,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Lỗi khi validate: ${errorMsg}`,
      error: errorMsg,
    };
  }
}
