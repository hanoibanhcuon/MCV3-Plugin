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
/** Map các placeholder → giá trị thay thế */
export type TemplateVars = Record<string, string | number | undefined>;
/**
 * Thay thế tất cả placeholder {{KEY}} trong template
 * - Placeholder không tìm thấy giá trị sẽ giữ nguyên {{KEY}}
 * - Hỗ trợ nested không cần thiết → giữ đơn giản
 */
export declare function renderTemplate(template: string, vars: TemplateVars): string;
/**
 * Thay thế một số placeholder phổ biến với giá trị mặc định
 * Dùng khi tạo tài liệu mới từ template
 */
export declare function renderWithDefaults(template: string, vars: TemplateVars, projectName?: string): string;
/**
 * Đọc template file và trả về nội dung
 * Template files nằm trong templates/{phase-folder}/ (p0-init, p1-discovery, ...)
 */
export declare function getTemplateContent(templateName: string, templatesDir: string): string;
/**
 * Trích xuất danh sách placeholder còn chưa được thay thế trong nội dung
 * Hữu ích để validate template đã điền đầy đủ chưa
 */
export declare function extractMissingPlaceholders(content: string): string[];
/**
 * Kiểm tra nội dung còn placeholder chưa điền không
 */
export declare function hasMissingPlaceholders(content: string): boolean;
//# sourceMappingURL=template-engine.d.ts.map