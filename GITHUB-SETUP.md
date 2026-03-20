# GITHUB-SETUP.md — Hướng dẫn đẩy MCV3-Plugin lên GitHub

Hướng dẫn từng bước để publish MCV3-Plugin lên GitHub và tạo release.

---

## Bước 1: Tạo repository trên GitHub

1. Truy cập [github.com/new](https://github.com/new)
2. Điền thông tin:
   - **Repository name**: `mcv3-devkit`
   - **Description**: `MasterCraft DevKit v3 — Claude Code Plugin for Software Development Pipeline`
   - **Visibility**: Public *(hoặc Private nếu muốn)*
   - **KHÔNG** tick "Add a README file", "Add .gitignore", "Choose a license" — vì repo đã có sẵn
3. Nhấn **Create repository**
4. Copy URL của repo (dạng: `https://github.com/username/mcv3-devkit.git`)

---

## Bước 2: Kết nối local repo với GitHub

```bash
# Vào thư mục plugin
cd /path/to/mcv3-devkit

# Thêm remote (thay username bằng GitHub username của bạn)
git remote add origin https://github.com/username/mcv3-devkit.git

# Verify
git remote -v
```

---

## Bước 3: Push code và tags

```bash
# Push branch main
git push -u origin main

# Push tag version
git push origin v3.12.0

# Hoặc push tất cả tags cùng lúc
git push origin --tags
```

---

## Bước 4: Tạo Release trên GitHub

### Cách 1: Qua GitHub Web UI

1. Vào repo trên GitHub → **Releases** (bên phải) → **Create a new release**
2. **Tag**: Chọn `v3.12.0` (tag đã push)
3. **Release title**: `MCV3-Plugin v3.12.0`
4. **Description**: Copy từ CHANGELOG.md phần `[3.12.0]`
5. **Upload assets**:
   - Kéo thả file `dist/mcv3-devkit-3.12.0.plugin` vào ô upload
   - Kéo thả file `dist/mcv3-devkit-3.12.0.zip` vào ô upload
6. Nhấn **Publish release**

### Cách 2: Qua GitHub CLI (gh)

```bash
# Cài gh nếu chưa có: https://cli.github.com/
gh auth login

# Tạo release
gh release create v3.12.0 \
  dist/mcv3-devkit-3.12.0.plugin \
  dist/mcv3-devkit-3.12.0.zip \
  --title "MCV3-Plugin v3.12.0" \
  --notes-file <(sed -n '/## \[3.12.0\]/,/## \[3.11/{ /## \[3.11.1\]/q; p }' CHANGELOG.md)
```

---

## Bước 5: Cập nhật install link trong README

Sau khi release, cập nhật README.md để user có thể download trực tiếp:

```markdown
## Cài đặt nhanh

```bash
# Download và giải nén
curl -L https://github.com/username/mcv3-devkit/releases/latest/download/mcv3-devkit-3.12.0.zip \
  -o mcv3-devkit.zip
unzip mcv3-devkit.zip

# Cài vào dự án của bạn
bash mcv3-devkit-3.12.0/scripts/install.sh /path/to/your-project
```

---

## Lần release tiếp theo

Quy trình tạo release mới:

```bash
# 1. Cập nhật version trong .claude-plugin/plugin.json và settings.json
# 2. Thêm entry vào CHANGELOG.md
# 3. Commit
git add -A
git commit -m "chore(release): bump version to X.Y.Z"

# 4. Tạo tag
git tag -a vX.Y.Z -m "MCV3-Plugin vX.Y.Z"

# 5. Build package
bash scripts/package.sh

# 6. Push + release
git push origin main --tags
gh release create vX.Y.Z dist/mcv3-devkit-X.Y.Z.plugin dist/mcv3-devkit-X.Y.Z.zip \
  --title "MCV3-Plugin vX.Y.Z" \
  --generate-notes
```

---

## GitHub Actions (Tùy chọn — Auto Release)

Thêm file `.github/workflows/release.yml` để tự động build và release khi push tag:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build MCP Server
        run: |
          cd mcp-servers/project-memory
          npm ci
          npm run build

      - name: Package plugin
        run: bash scripts/package.sh

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.plugin
            dist/*.zip
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Topics đề xuất cho GitHub repo

Thêm topics để dễ tìm kiếm (Settings → Topics):

```
claude-code  claude-ai  anthropic  plugin  software-development
documentation  requirements-engineering  ai-tools  devkit  mcp
```

---

## Badges cho README

Sau khi có repo public, bạn có thể thêm badges:

```markdown
[![GitHub release](https://img.shields.io/github/v/release/username/mcv3-devkit)](https://github.com/username/mcv3-devkit/releases)
[![GitHub stars](https://img.shields.io/github/stars/username/mcv3-devkit?style=social)](https://github.com/username/mcv3-devkit)
[![GitHub license](https://img.shields.io/github/license/username/mcv3-devkit)](LICENSE)
```
