/**
 * file-io.ts — Tiện ích đọc/ghi file cho MCP Server
 *
 * Tất cả thao tác I/O với .mc-data/ đều đi qua module này.
 * Hỗ trợ: đọc, ghi, kiểm tra tồn tại, tạo thư mục đệ quy.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ─── Đọc file ────────────────────────────────────────────────────────────

/**
 * Đọc file text (UTF-8)
 * @returns Nội dung file, hoặc null nếu file không tồn tại
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err: unknown) {
    // File không tồn tại → trả về null thay vì throw
    if (isNodeError(err) && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Đọc file JSON
 * @returns Object đã parse, hoặc null nếu file không tồn tại
 */
export async function readJson<T = unknown>(filePath: string): Promise<T | null> {
  const content = await readFile(filePath);
  if (content === null) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`File ${filePath} không phải JSON hợp lệ`);
  }
}

// ─── Ghi file ────────────────────────────────────────────────────────────

/**
 * Ghi nội dung vào file
 * Tự động tạo thư mục cha nếu chưa tồn tại.
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  // Đảm bảo thư mục cha tồn tại
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Ghi JSON vào file (pretty-print với 2 spaces)
 */
export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// ─── Quản lý thư mục ─────────────────────────────────────────────────────

/**
 * Tạo thư mục đệ quy (tương đương mkdir -p)
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Kiểm tra file/thư mục có tồn tại không
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Liệt kê tất cả files trong thư mục (đệ quy)
 * @returns Mảng đường dẫn tương đối
 */
export async function listFiles(
  dirPath: string,
  baseDir?: string
): Promise<string[]> {
  const results: string[] = [];

  // Nếu thư mục không tồn tại → trả về mảng rỗng
  if (!(await exists(dirPath))) return results;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = baseDir
      ? path.relative(baseDir, fullPath)
      : fullPath;

    if (entry.isDirectory()) {
      // Bỏ qua thư mục ẩn (bắt đầu bằng '.') — _mcv3-work được lọc bởi callers nếu cần
      if (!entry.name.startsWith('.')) {
        const subFiles = await listFiles(fullPath, baseDir || dirPath);
        results.push(...subFiles);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(relativePath.replace(/\\/g, '/'));
    }
  }

  return results.sort();
}

/**
 * Lấy thông tin file (size, timestamps)
 */
export async function getFileStat(
  filePath: string
): Promise<{ size: number; createdAt: string; updatedAt: string } | null> {
  try {
    const stat = await fs.stat(filePath);
    return {
      size: stat.size,
      createdAt: stat.birthtime.toISOString(),
      updatedAt: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────

/**
 * Kiểm tra xem error có phải NodeJS Error không
 */
function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

/**
 * Tạo slug từ tên: chữ thường, thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/[^a-z0-9]+/g, '-')     // Thay ký tự không hợp lệ bằng -
    .replace(/^-+|-+$/g, '')          // Bỏ - ở đầu/cuối
    .substring(0, 50);                // Giới hạn 50 ký tự
}

/**
 * Lấy đường dẫn thư mục gốc dự án (thư mục chứa .mc-data)
 * Tìm kiếm từ thư mục hiện tại lên trên
 */
export async function findProjectRoot(startDir?: string): Promise<string | null> {
  let currentDir = startDir || process.cwd();

  // Giới hạn tìm kiếm lên tối đa 10 cấp
  for (let i = 0; i < 10; i++) {
    const mcDataPath = path.join(currentDir, '.mc-data');
    if (await exists(mcDataPath)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Đã đến root filesystem
      break;
    }
    currentDir = parentDir;
  }

  return null;
}
