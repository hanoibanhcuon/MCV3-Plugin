/**
 * template-engine.ts — Engine thay thế placeholder trong Markdown templates
 *
 * Cơ chế đơn giản: thay thế {{PLACEHOLDER}} bằng giá trị thực.
 * Không dùng thư viện ngoài — chỉ string interpolation thuần.
 *
 * Ví dụ:
 *   input:  "Dự án: {{PROJECT_NAME}}, ngày: {{DATE}}"
 *   vars:   { PROJECT_NAME: "ERP ABC", DATE: "2026-03-19" }
 *   output: "Dự án: ERP ABC, ngày: 2026-03-19"
 */

// ─── Types ────────────────────────────────────────────────────────────────

/** Map các placeholder → giá trị thay thế */
export type TemplateVars = Record<string, string | number | undefined>;

// ─── Core Function ────────────────────────────────────────────────────────

/**
 * Thay thế tất cả placeholder {{KEY}} trong template
 * - Placeholder không tìm thấy giá trị sẽ giữ nguyên {{KEY}}
 * - Hỗ trợ nested không cần thiết → giữ đơn giản
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null) {
      return match; // Giữ nguyên nếu không có giá trị
    }
    return String(value);
  });
}

/**
 * Thay thế một số placeholder phổ biến với giá trị mặc định
 * Dùng khi tạo tài liệu mới từ template
 */
export function renderWithDefaults(
  template: string,
  vars: TemplateVars,
  projectName?: string
): string {
  const now = new Date();
  const defaults: TemplateVars = {
    // Thời gian
    CREATED_DATE: now.toISOString().split('T')[0],  // YYYY-MM-DD
    LAST_UPDATED: now.toISOString().split('T')[0],
    DATE: now.toISOString().split('T')[0],
    VERSION: '1.0',

    // Dự án
    PROJECT_NAME: projectName || '{{PROJECT_NAME}}',

    // Merge với vars được truyền vào (vars ghi đè defaults)
    ...vars,
  };

  return renderTemplate(template, defaults);
}

// ─── Template Loading ─────────────────────────────────────────────────────

/**
 * Đọc template file và trả về nội dung
 * Template files nằm trong templates/{phase-folder}/ (p0-init, p1-discovery, ...)
 */
export function getTemplateContent(templateName: string, templatesDir: string): string {
  // Hàm này được gọi sync từ tool — templates đã được load trước
  // Thực tế sẽ dùng fs.readFileSync vì templates là static
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');

  const templatePath = path.join(templatesDir, templateName);
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch {
    throw new Error(`Template không tồn tại: ${templateName}`);
  }
}

// ─── Placeholder Extraction ───────────────────────────────────────────────

/**
 * Trích xuất danh sách placeholder còn chưa được thay thế trong nội dung
 * Hữu ích để validate template đã điền đầy đủ chưa
 */
export function extractMissingPlaceholders(content: string): string[] {
  const matches = content.match(/\{\{([A-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches)]; // Unique
}

/**
 * Kiểm tra nội dung còn placeholder chưa điền không
 */
export function hasMissingPlaceholders(content: string): boolean {
  return /\{\{[A-Z0-9_]+\}\}/.test(content);
}
