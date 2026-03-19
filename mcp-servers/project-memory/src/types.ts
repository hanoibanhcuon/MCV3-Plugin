/**
 * types.ts — Định nghĩa các TypeScript types dùng chung trong MCP Server
 *
 * Cấu trúc dữ liệu chính:
 * - ProjectConfig: Cấu hình dự án được lưu trong _config.md
 * - McDataStructure: Cấu trúc thư mục .mc-data/
 * - ToolResult: Kết quả trả về của mỗi MCP tool
 */

// ─── Cấu hình dự án ───────────────────────────────────────────────────────

/** Cấu hình dự án MCV3 — lưu trong .mc-data/_config.json */
export interface ProjectConfig {
  /** Tên dự án */
  name: string;
  /** Slug dùng làm tên folder: chữ thường, dấu gạch ngang */
  slug: string;
  /** Ngành kinh doanh */
  domain: string;
  /** Ngày tạo (ISO 8601) */
  createdAt: string;
  /** Ngày cập nhật lần cuối */
  updatedAt: string;
  /** Phiên bản MCV3 tạo ra dự án này */
  mcv3Version: string;
  /** Phase hiện tại của dự án */
  currentPhase: ProjectPhase;
  /** Danh sách systems trong dự án */
  systems: SystemInfo[];
}

/** Thông tin về một hệ thống trong dự án */
export interface SystemInfo {
  /** Mã hệ thống: viết hoa, không dấu (VD: ERP, WEB, MOB-STAFF) */
  code: string;
  /** Tên đầy đủ của hệ thống */
  name: string;
  /** Mô tả ngắn */
  description: string;
  /** Tech stack chính */
  techStack: string;
  /** Trạng thái: planned, in-progress, done */
  status: 'planned' | 'in-progress' | 'done';
  /**
   * Phase hiện tại của system này (per-system phase tracking).
   * Dùng cho dự án in-progress: mỗi system có thể đang ở phase khác nhau.
   * VD: ERP đang ở phase5-design, WEB đang ở phase3-bizdocs.
   * Nếu không set → hiển thị theo projectConfig.currentPhase (project-level).
   */
  currentPhase?: ProjectPhase;
}

/** Các phase của workflow MCV3 */
export type ProjectPhase =
  | 'phase0-init'       // Mới khởi tạo
  | 'phase1-discovery'  // Đang Discovery
  | 'phase2-expert'     // Đang Expert Analysis
  | 'phase3-bizdocs'    // Đang tạo Business Docs
  | 'phase4-requirements' // Đang viết URS
  | 'phase5-design'     // Đang thiết kế kỹ thuật
  | 'phase6-qa'         // Đang QA & Docs
  | 'phase7-codegen'    // Đang Code Gen
  | 'phase8-verify';    // Đang Verify & Deploy

// ─── Document Management ──────────────────────────────────────────────────

/** Loại tài liệu trong hệ thống MCV3 */
export type DocumentType =
  | 'master-index'
  | 'project-overview'
  | 'project-architecture'
  | 'data-dictionary'
  | 'expert-log'
  | 'biz-policy'
  | 'process'
  | 'system-index'
  | 'urs'
  | 'modspec'
  | 'architecture'
  | 'data-model'
  | 'test'
  | 'user-guide'
  | 'admin-guide'
  | 'service-spec'
  | 'deploy-ops'
  | 'verify'
  | 'key-facts'
  | 'changelog'
  | 'checkpoint'
  | 'custom';

/** Metadata của một tài liệu */
export interface DocumentMeta {
  /** Loại tài liệu */
  type: DocumentType;
  /** Đường dẫn tương đối từ project root */
  path: string;
  /** Tên file */
  filename: string;
  /** System liên quan (nếu có) */
  systemCode?: string;
  /** Module liên quan (nếu có) */
  moduleCode?: string;
  /** Kích thước file (bytes) */
  size?: number;
  /** Ngày tạo */
  createdAt?: string;
  /** Ngày cập nhật */
  updatedAt?: string;
}

// ─── MCP Tool Parameters ─────────────────────────────────────────────────

/** Tham số cho mc_init_project */
export interface McInitParams {
  /** Tên dự án */
  projectName: string;
  /** Slug (tự sinh nếu không truyền) */
  projectSlug?: string;
  /** Ngành kinh doanh */
  domain: string;
  /** Đường dẫn gốc dự án (mặc định: thư mục hiện tại) */
  projectRoot?: string;
  /**
   * Danh sách systems với per-system phase (tùy chọn).
   * Dùng khi init dự án in-progress: mỗi system đang ở phase khác nhau.
   * Nếu không truyền → tất cả systems bắt đầu từ phase0-init.
   */
  systems?: Array<Partial<SystemInfo> & { code: string; name: string }>;
}

/** Tham số cho mc_save */
export interface McSaveParams {
  /** Slug dự án */
  projectSlug: string;
  /** Đường dẫn file (tương đối từ .mc-data/projects/{slug}/) */
  filePath: string;
  /** Nội dung Markdown */
  content: string;
  /** Loại tài liệu (để index) */
  documentType?: DocumentType;
}

/** Tham số cho mc_load */
export interface McLoadParams {
  /** Slug dự án */
  projectSlug: string;
  /** Đường dẫn file (tương đối từ .mc-data/projects/{slug}/) */
  filePath: string;
  /** Layer loading: 0=key-facts, 1=dep-map only, 2=sections, 3=full */
  layer?: 0 | 1 | 2 | 3;
}

/** Tham số cho mc_list */
export interface McListParams {
  /** Slug dự án */
  projectSlug: string;
  /** Lọc theo thư mục con (ví dụ: "_PROJECT", "ERP/P2-DESIGN") */
  subPath?: string;
  /** Lọc theo loại tài liệu */
  documentType?: DocumentType;
}

/** Tham số cho mc_status */
export interface McStatusParams {
  /** Slug dự án (nếu không truyền, liệt kê tất cả projects) */
  projectSlug?: string;
}

// ─── Kết quả trả về ───────────────────────────────────────────────────────

/** Kết quả chung cho mọi MCP tool */
export interface ToolResult {
  /** Thành công hay thất bại */
  success: boolean;
  /** Thông báo */
  message: string;
  /** Dữ liệu trả về (nếu có) */
  data?: unknown;
  /** Thông tin lỗi (nếu có) */
  error?: string;
}

/** Kết quả mc_init_project */
export interface InitResult extends ToolResult {
  data?: {
    projectSlug: string;
    projectPath: string;
    structureCreated: string[];
  };
}

/** Kết quả mc_list */
export interface ListResult extends ToolResult {
  data?: {
    documents: DocumentMeta[];
    totalCount: number;
  };
}

/** Kết quả mc_status */
export interface StatusResult extends ToolResult {
  data?: {
    projects: ProjectStatusSummary[];
  };
}

/** Tóm tắt trạng thái một dự án */
export interface ProjectStatusSummary {
  slug: string;
  name: string;
  domain: string;
  currentPhase: ProjectPhase;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  systems: SystemInfo[];
  phaseProgress: PhaseProgressItem[];
}

/** Tiến độ từng phase */
export interface PhaseProgressItem {
  phase: string;
  label: string;
  status: 'not-started' | 'in-progress' | 'done';
  documentCount: number;
}
