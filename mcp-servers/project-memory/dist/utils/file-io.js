"use strict";
/**
 * file-io.ts — Tiện ích đọc/ghi file cho MCP Server
 *
 * Tất cả thao tác I/O với .mc-data/ đều đi qua module này.
 * Hỗ trợ: đọc, ghi, kiểm tra tồn tại, tạo thư mục đệ quy.
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
exports.readFile = readFile;
exports.readJson = readJson;
exports.writeFile = writeFile;
exports.writeJson = writeJson;
exports.ensureDir = ensureDir;
exports.exists = exists;
exports.listFiles = listFiles;
exports.getFileStat = getFileStat;
exports.createSlug = createSlug;
exports.findProjectRoot = findProjectRoot;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
// ─── Đọc file ────────────────────────────────────────────────────────────
/**
 * Đọc file text (UTF-8)
 * @returns Nội dung file, hoặc null nếu file không tồn tại
 */
async function readFile(filePath) {
    try {
        return await fs.readFile(filePath, 'utf-8');
    }
    catch (err) {
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
async function readJson(filePath) {
    const content = await readFile(filePath);
    if (content === null)
        return null;
    try {
        return JSON.parse(content);
    }
    catch {
        throw new Error(`File ${filePath} không phải JSON hợp lệ`);
    }
}
// ─── Ghi file ────────────────────────────────────────────────────────────
/**
 * Ghi nội dung vào file
 * Tự động tạo thư mục cha nếu chưa tồn tại.
 */
async function writeFile(filePath, content) {
    // Đảm bảo thư mục cha tồn tại
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
}
/**
 * Ghi JSON vào file (pretty-print với 2 spaces)
 */
async function writeJson(filePath, data) {
    await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}
// ─── Quản lý thư mục ─────────────────────────────────────────────────────
/**
 * Tạo thư mục đệ quy (tương đương mkdir -p)
 */
async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
/**
 * Kiểm tra file/thư mục có tồn tại không
 */
async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Liệt kê tất cả files trong thư mục (đệ quy)
 * @returns Mảng đường dẫn tương đối
 */
async function listFiles(dirPath, baseDir) {
    const results = [];
    // Nếu thư mục không tồn tại → trả về mảng rỗng
    if (!(await exists(dirPath)))
        return results;
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
        }
        else if (entry.isFile() && entry.name.endsWith('.md')) {
            results.push(relativePath.replace(/\\/g, '/'));
        }
    }
    return results.sort();
}
/**
 * Lấy thông tin file (size, timestamps)
 */
async function getFileStat(filePath) {
    try {
        const stat = await fs.stat(filePath);
        return {
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
            updatedAt: stat.mtime.toISOString(),
        };
    }
    catch {
        return null;
    }
}
// ─── Helper ──────────────────────────────────────────────────────────────
/**
 * Kiểm tra xem error có phải NodeJS Error không
 */
function isNodeError(err) {
    return err instanceof Error && 'code' in err;
}
/**
 * Tạo slug từ tên: chữ thường, thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
 */
function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
        .replace(/[^a-z0-9]+/g, '-') // Thay ký tự không hợp lệ bằng -
        .replace(/^-+|-+$/g, '') // Bỏ - ở đầu/cuối
        .substring(0, 50); // Giới hạn 50 ký tự
}
/**
 * Lấy đường dẫn thư mục gốc dự án (thư mục chứa .mc-data)
 * Tìm kiếm từ thư mục hiện tại lên trên
 */
async function findProjectRoot(startDir) {
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
//# sourceMappingURL=file-io.js.map