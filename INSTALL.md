# Cài đặt MCV3-Plugin (MasterCraft DevKit)

Hướng dẫn cài đặt, cập nhật và gỡ lỗi MCV3-Plugin.

---

## Yêu cầu

| Yêu cầu | Phiên bản |
|---------|----------|
| **Node.js** | v18 trở lên |
| **Claude Code** | Phiên bản mới nhất |
| **npm** | v8+ (tùy chọn — chỉ cần nếu dist/ không có sẵn) |

---

## Cài đặt mới (Lần đầu)

### Mac / Linux / Git Bash (Windows)

**Bước 1:** Tải plugin về

```bash
# Option A — Clone repository
git clone https://github.com/YOUR_ORG/mcv3-plugin.git
cd mcv3-plugin

# Option B — Tải release zip (không cần git)
# Tải file mcv3-devkit-X.Y.Z.plugin từ GitHub Releases
# Đổi đuôi .plugin → .zip rồi giải nén, hoặc:
unzip mcv3-devkit-3.11.2.zip
cd mcv3-devkit-3.11.2
```

**Bước 2:** Chạy installer

```bash
# Cài vào thư mục dự án của bạn
bash scripts/install.sh /path/to/your-project

# Hoặc cài vào thư mục hiện tại
bash scripts/install.sh
```

**Bước 3:** Mở dự án và verify

```bash
cd /path/to/your-project
code .    # Mở Claude Code (hoặc dùng lệnh tương tự)
```

Trong Claude Code: `/mcv3:onboard` để bắt đầu.

---

### Windows (PowerShell)

**Bước 1:** Tải và giải nén plugin

```powershell
# Giải nén file .plugin (đổi tên thành .zip rồi giải nén)
Expand-Archive .\mcv3-devkit-3.11.2.zip -DestinationPath .
cd mcv3-devkit-3.11.2
```

**Bước 2:** Chạy installer

```powershell
# Cài vào thư mục dự án
.\scripts\install.ps1 C:\path\to\your-project

# Hoặc cài vào thư mục hiện tại
.\scripts\install.ps1
```

> **Lưu ý:** Nếu PowerShell báo lỗi execution policy:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## Những gì được cài đặt

Sau khi install, dự án của bạn có cấu trúc:

```
your-project/
├── mcv3-devkit/          ← Plugin files (skills, agents, templates, ...)
│   ├── .claude-plugin/   ← Plugin manifest
│   ├── skills/           ← 15 skill definitions
│   ├── agents/           ← 10 agent definitions
│   ├── templates/        ← 25+ document templates
│   ├── mcp-servers/      ← MCP Server (Node.js, pre-built)
│   ├── scripts/          ← Automation scripts
│   └── CLAUDE.md         ← Plugin documentation
│
├── .claude/
│   ├── CLAUDE.md         ← ⭐ Claude đọc file này → biết MCV3 đã cài
│   ├── commands/mcv3/    ← Slash commands (/mcv3:discovery, v.v.)
│   └── settings.json     ← Hooks (auto-checkpoint khi session kết thúc)
│
├── .mcp.json             ← MCP server config (Claude Code đọc)
└── .mc-data/             ← Dữ liệu dự án (tạo khi dùng)
```

---

## Cập nhật (Update)

Khi có phiên bản mới:

```bash
# 1. Tải phiên bản mới về
git pull   # hoặc tải release mới

# 2. Chạy update (từ thư mục plugin source mới)
bash scripts/update.sh /path/to/your-project

# Windows PowerShell:
# .\scripts\update.sh không có — dùng install.ps1 thay:
.\scripts\install.ps1 C:\path\to\your-project
```

> **An toàn dữ liệu:** Update KHÔNG bao giờ xóa hoặc sửa `.mc-data/` — dữ liệu dự án của bạn luôn được bảo toàn.

---

## Verify cài đặt

Kiểm tra mọi thứ đã đúng chưa:

```bash
bash mcv3-devkit/scripts/verify-install.sh
# hoặc
bash mcv3-devkit/scripts/verify-install.sh /path/to/project
```

Output mẫu (thành công):
```
── 1. Runtime Prerequisites ──
  ✅ Node.js v20.11.0
  ✅ npm 10.2.4

── 2. Plugin Directory (mcv3-devkit/) ──
  ✅ Thư mục mcv3-devkit/ tồn tại
  ✅ Plugin version: v3.11.2

── 3. Plugin Structure ──
  ✅ skills/
  ✅ agents/
  ...

── 4. MCP Server ──
  ✅ dist/index.js (build artifact)
  ✅ MCP Server có thể load được

── 5. MCP Configuration (.mcp.json) ──
  ✅ .mcp.json có mcv3-project-memory
  ✅ .mcp.json path trỏ đúng

── 6. Slash Commands (.claude/commands/mcv3/) ──
  ✅ 17 slash commands
  ✅ Command paths đã cập nhật

── 7. Claude Configuration (.claude/CLAUDE.md) ──
  ✅ .claude/CLAUDE.md có MCV3 instructions

── 8. Hooks (.claude/settings.json) ──
  ✅ .claude/settings.json có auto-checkpoint hook

══════════════════════════════
  Kết quả: ✅ 15 | ❌ 0 | ⚠  0

✅ Cài đặt hoàn hảo! Sẵn sàng sử dụng.
```

---

## Cài đặt thủ công (nếu script không chạy được)

### Bước 1: Copy plugin files

```bash
cp -r /path/to/plugin-source/. /path/to/project/mcv3-devkit/
# Xóa các file không cần thiết
rm -rf mcv3-devkit/.git mcv3-devkit/.mc-data mcv3-devkit/docs
rm -rf mcv3-devkit/mcp-servers/project-memory/node_modules
```

### Bước 2: Copy và cập nhật slash commands

```bash
mkdir -p .claude/commands/mcv3
for f in mcv3-devkit/.claude/commands/mcv3/*.md; do
  # Cập nhật path từ skills/ → mcv3-devkit/skills/
  sed 's|skills/\([a-z-]*\)/SKILL\.md|mcv3-devkit/skills/\1/SKILL.md|g' \
    "$f" > ".claude/commands/mcv3/$(basename $f)"
done
```

### Bước 3: Thêm vào .mcp.json

Tạo hoặc cập nhật `.mcp.json` tại root dự án:

```json
{
  "mcpServers": {
    "mcv3-project-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcv3-devkit/mcp-servers/project-memory/dist/index.js"],
      "env": {
        "MCV3_PROJECT_ROOT": "."
      },
      "description": "MCV3 Project Memory Server"
    }
  }
}
```

### Bước 4: Tạo .claude/settings.json

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash mcv3-devkit/scripts/auto-checkpoint.sh"
      }]
    }]
  }
}
```

### Bước 5: Build MCP Server

```bash
cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build
```

> **Lưu ý:** Nếu `dist/index.js` đã có sẵn trong package, bước này không cần thiết.

### Bước 6: Tạo .claude/CLAUDE.md

Tạo file `.claude/CLAUDE.md` với nội dung tham chiếu đến plugin:

```markdown
# CLAUDE.md

## MCV3-Plugin

Plugin MasterCraft DevKit đã cài đặt tại `mcv3-devkit/`.
Xem hướng dẫn đầy đủ: `mcv3-devkit/CLAUDE.md`

Quick Start: `/mcv3:discovery` (dự án mới) | `/mcv3:assess` (dự án đang chạy)
```

---

## Xử lý lỗi thường gặp

### ❌ "Node.js chưa được cài"

Tải Node.js v18+ từ [nodejs.org](https://nodejs.org).

### ❌ "MCP Server dist/ không tìm thấy"

Build thủ công:
```bash
cd mcv3-devkit/mcp-servers/project-memory
npm install
npm run build
```

### ❌ "/mcv3:discovery không nhận ra"

Kiểm tra `.claude/commands/mcv3/` có tồn tại và có các file `.md` không.
Nếu không, chạy install lại.

### ❌ "mc_status() không hoạt động"

Kiểm tra `.mcp.json` có entry `mcv3-project-memory` không.
Khởi động lại Claude Code sau khi cập nhật `.mcp.json`.

### ⚠ "Claude không biết về MCV3"

Kiểm tra `.claude/CLAUDE.md` có reference đến `mcv3-devkit` không.
Chạy install lại để tạo/cập nhật file này.

### ⚠ "Slash commands path sai"

Nếu command file nói `skills/discovery/SKILL.md` thay vì `mcv3-devkit/skills/discovery/SKILL.md`:

```bash
# Fix thủ công
for f in .claude/commands/mcv3/*.md; do
  sed -i 's|^skills/|mcv3-devkit/skills/|g' "$f"
done
```

---

## Gỡ cài đặt

```bash
# Xóa plugin (GIỮ LẠI .mc-data/ — dữ liệu dự án)
rm -rf mcv3-devkit/
rm -rf .claude/commands/mcv3/
# Xóa mcv3-project-memory khỏi .mcp.json (thủ công)
# Xóa MCV3 section khỏi .claude/CLAUDE.md (thủ công)
# Xóa MCV3 hooks khỏi .claude/settings.json (thủ công)
```

---

## Cấu trúc Plugin (cho developers)

```
mcv3-devkit/
├── .claude-plugin/plugin.json     # Plugin manifest
├── skills/                        # 15 skill SKILL.md files
├── agents/                        # 10 agent definitions + industry refs
├── templates/                     # 25+ document templates (by phase)
├── mcp-servers/project-memory/    # TypeScript MCP Server (19 tools)
│   ├── src/                       # TypeScript source
│   ├── dist/                      # Compiled JS (pre-built)
│   └── package.json
├── scripts/                       # Automation scripts
│   ├── install.sh                 # Installer (Mac/Linux)
│   ├── install.ps1                # Installer (Windows)
│   ├── update.sh                  # Updater
│   ├── package.sh                 # Release packager
│   └── verify-install.sh          # Verify
├── hooks/hooks.json               # Hook definitions
├── knowledge/auto-mode-protocol.md
├── CLAUDE.md                      # Plugin docs (cho Claude)
├── INSTALL.md                     # File này
├── README.md                      # Overview
└── CHANGELOG.md                   # Lịch sử thay đổi
```

---

## Quick Reference

```bash
# Cài đặt mới
bash scripts/install.sh /path/to/project

# Cập nhật
bash scripts/update.sh /path/to/project

# Verify
bash mcv3-devkit/scripts/verify-install.sh

# Đóng gói release (developers)
bash scripts/package.sh
```
