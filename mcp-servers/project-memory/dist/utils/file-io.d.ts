/**
 * file-io.ts — Tiện ích đọc/ghi file cho MCP Server
 *
 * Tất cả thao tác I/O với .mc-data/ đều đi qua module này.
 * Hỗ trợ: đọc, ghi, kiểm tra tồn tại, tạo thư mục đệ quy.
 */
/**
 * Đọc file text (UTF-8)
 * @returns Nội dung file, hoặc null nếu file không tồn tại
 */
export declare function readFile(filePath: string): Promise<string | null>;
/**
 * Đọc file JSON
 * @returns Object đã parse, hoặc null nếu file không tồn tại
 */
export declare function readJson<T = unknown>(filePath: string): Promise<T | null>;
/**
 * Ghi nội dung vào file
 * Tự động tạo thư mục cha nếu chưa tồn tại.
 */
export declare function writeFile(filePath: string, content: string): Promise<void>;
/**
 * Ghi JSON vào file (pretty-print với 2 spaces)
 */
export declare function writeJson(filePath: string, data: unknown): Promise<void>;
/**
 * Tạo thư mục đệ quy (tương đương mkdir -p)
 */
export declare function ensureDir(dirPath: string): Promise<void>;
/**
 * Kiểm tra file/thư mục có tồn tại không
 */
export declare function exists(filePath: string): Promise<boolean>;
/**
 * Liệt kê tất cả files trong thư mục (đệ quy)
 * @returns Mảng đường dẫn tương đối
 */
export declare function listFiles(dirPath: string, baseDir?: string): Promise<string[]>;
/**
 * Lấy thông tin file (size, timestamps)
 */
export declare function getFileStat(filePath: string): Promise<{
    size: number;
    createdAt: string;
    updatedAt: string;
} | null>;
/**
 * Tạo slug từ tên: chữ thường, thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
 */
export declare function createSlug(name: string): string;
/**
 * Lấy đường dẫn thư mục gốc dự án (thư mục chứa .mc-data)
 * Tìm kiếm từ thư mục hiện tại lên trên
 */
export declare function findProjectRoot(startDir?: string): Promise<string | null>;
//# sourceMappingURL=file-io.d.ts.map