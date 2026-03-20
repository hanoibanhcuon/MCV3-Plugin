# Contributing to MCV3-Plugin

Cảm ơn bạn đã quan tâm đến việc đóng góp cho MCV3-Plugin!

---

## Mục lục

- [Báo cáo Bug](#báo-cáo-bug)
- [Đề xuất tính năng](#đề-xuất-tính-năng)
- [Contribute Code](#contribute-code)
- [Code Style Guide](#code-style-guide)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

---

## Báo cáo Bug

Trước khi mở issue mới, hãy kiểm tra [Issues](https://github.com/hanoibanhcuon/MCV3-Plugin/issues) để tránh trùng lặp.

**Khi mở bug report, hãy bao gồm:**

1. **Version**: Plugin version (xem `.claude-plugin/plugin.json`)
2. **Môi trường**: OS, Claude Code version
3. **Mô tả vấn đề**: Bạn đang làm gì? Điều gì xảy ra? Điều gì nên xảy ra?
4. **Bước tái hiện**: Các bước cụ thể để reproduce bug
5. **Logs**: Paste relevant error messages nếu có
6. **Screenshots**: Nếu liên quan đến UI output

**Template:**

```markdown
## Bug Report

**Version:** 3.11.x
**OS:** macOS / Windows / Linux
**Claude Code:** vX.Y.Z

### Mô tả
Mô tả ngắn gọn vấn đề.

### Bước tái hiện
1. Mở Claude Code trong project...
2. Gõ `/mcv3:discovery`...
3. Thấy lỗi...

### Expected behavior
Điều gì nên xảy ra.

### Actual behavior
Điều gì thực sự xảy ra.

### Logs / Screenshots
(paste ở đây nếu có)
```

---

## Đề xuất tính năng

Mở [Feature Request issue](https://github.com/hanoibanhcuon/MCV3-Plugin/issues/new) với:

1. **Tóm tắt**: Mô tả ngắn về tính năng
2. **Motivation**: Tại sao tính năng này cần thiết? Nó giải quyết vấn đề gì?
3. **Design proposal**: Bạn hình dung nó hoạt động như thế nào?
4. **Alternatives**: Có giải pháp nào khác bạn đã cân nhắc không?

---

## Contribute Code

### Setup môi trường

```bash
# 1. Fork repo trên GitHub
# 2. Clone fork của bạn
git clone https://github.com/hanoibanhcuon/MCV3-Plugin.git
cd mcv3-devkit

# 3. Build MCP Server
cd mcp-servers/project-memory
npm install
npm run build
cd ../..

# 4. Verify installation
bash scripts/verify-install.sh
```

### Workflow

```bash
# 1. Tạo feature branch
git checkout -b feat/ten-tinh-nang

# 2. Làm việc...

# 3. Test thủ công (chạy skill liên quan trong Claude Code)

# 4. Commit
git commit -m "feat(skill): mô tả ngắn gọn"

# 5. Push và mở Pull Request
git push origin feat/ten-tinh-nang
```

### Commit Message Convention

Dùng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, refactor, test, chore
Scopes: skill, agent, template, mcp, scripts, install
```

**Ví dụ:**

```
feat(skill): add retail industry support to biz-docs
fix(mcp): handle empty project list in mc_status
docs(install): update Windows PowerShell instructions
chore(templates): update MODSPEC-TEMPLATE version header
```

### Pull Request Guidelines

- **Một PR = một tính năng/fix**
- Title theo convention: `feat(scope): description`
- Body mô tả:
  - Tóm tắt thay đổi
  - Lý do thay đổi
  - Cách test
  - Breaking changes (nếu có)
- Link đến issue liên quan: `Closes #123`

---

## Code Style Guide

### Markdown files (skills, agents, templates)

- **Tiêu đề**: Dùng `##` cho sections chính, `###` cho sub-sections
- **Formal IDs**: Luôn dùng đúng format `BR-{DOM}-NNN`, `US-{MOD}-NNN`, etc.
- **Ngôn ngữ**: Tiêu đề và comments bằng **tiếng Việt**; IDs và technical terms bằng tiếng Anh
- **Tables**: Dùng bảng Markdown cho danh sách có cấu trúc
- **Code blocks**: Dùng triple-backtick với language identifier

### TypeScript (MCP Server)

- TypeScript strict mode
- File names: `kebab-case.ts`
- Exports: Named exports preferred
- Comments: tiếng Việt cho business logic, tiếng Anh cho technical implementation
- No `any` types nếu có thể tránh

### Shell scripts

- `#!/bin/bash` + `set -euo pipefail`
- Màu sắc: dùng tput hoặc fallback về empty string
- Log functions: `log()`, `ok()`, `warn()`, `fail()`
- Luôn kiểm tra dependencies trước khi dùng (`command -v tool`)

---

## Cấu trúc dự án

```
mcv3-devkit/
├── .claude-plugin/         # Plugin metadata
│   └── plugin.json
├── .claude/
│   └── commands/mcv3/      # Slash command definitions
├── agents/                 # AI agent definitions
├── knowledge/              # Plugin-level knowledge bases
├── mcp-servers/
│   └── project-memory/     # MCP server (TypeScript)
│       ├── src/            # Source code
│       └── dist/           # Build output (gitignored)
├── scripts/                # Shell scripts (install, package, hooks)
├── skills/                 # Skill definitions (per phase)
├── templates/              # Document templates (per phase)
├── CLAUDE.md               # Main plugin instructions
├── CHANGELOG.md            # Version history
├── INSTALL.md              # Detailed install guide
└── README.md               # This file
```

### Thêm skill mới

1. Tạo file `skills/{skill-name}/{skill-name}.md`
2. Tạo slash command `{skill-name}.md` trong `.claude/commands/mcv3/`
3. Thêm references nếu cần: `skills/{skill-name}/references/`
4. Cập nhật `CLAUDE.md` → Skills table
5. Cập nhật `README.md` → Skills section
6. Thêm vào `CHANGELOG.md`

### Thêm industry knowledge base

1. Tạo file `agents/domain-expert/references/industry-{name}.md`
2. Cập nhật `agents/domain-expert.md` → knowledge base list
3. Cập nhật `CLAUDE.md` → Domain Expert table
4. Cập nhật `README.md` → Industry Support table

---

## Questions?

Mở [Discussion](https://github.com/hanoibanhcuon/MCV3-Plugin/discussions) hoặc [Issue](https://github.com/hanoibanhcuon/MCV3-Plugin/issues) để đặt câu hỏi.
