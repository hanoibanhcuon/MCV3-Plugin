#!/bin/bash
# ============================================================
# package.sh — MCV3-Plugin Release Packager
# MasterCraft DevKit v3.x — Dành cho plugin developers
# ============================================================
#
# Đóng gói plugin thành file .plugin (zip archive) để phân phối.
#
# Cách dùng:
#   bash scripts/package.sh              # Dùng version từ plugin.json
#   bash scripts/package.sh 3.11.2       # Override version
#   bash scripts/package.sh --no-build   # Bỏ qua bước build MCP server
#
# Output:
#   dist/mcv3-devkit-{version}.plugin    (file zip)
#   dist/mcv3-devkit-{version}.zip       (alias, cùng nội dung)

set -euo pipefail

# ── Hằng số ─────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PLUGIN_ROOT/dist"

# ── Màu sắc ─────────────────────────────────────────────────────────────────
if [ -t 1 ] && command -v tput &>/dev/null && tput colors &>/dev/null; then
  RED=$(tput setaf 1); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
  BLUE=$(tput setaf 4); BOLD=$(tput bold); NC=$(tput sgr0)
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

log()     { echo "${BLUE}[PACKAGE]${NC} $*"; }
ok()      { echo "${GREEN}[PACKAGE]${NC} ✅ $*"; }
warn()    { echo "${YELLOW}[PACKAGE]${NC} ⚠  $*"; }
fail()    { echo "${RED}[PACKAGE]${NC} ❌ $*" >&2; exit 1; }
section() { echo ""; echo "${BOLD}${BLUE}── $* ──────────────────────────────────────────${NC}"; }

# ── Đọc version ─────────────────────────────────────────────────────────────
get_version() {
  local manifest="$PLUGIN_ROOT/.claude-plugin/plugin.json"
  [ -f "$manifest" ] || fail "Không tìm thấy .claude-plugin/plugin.json"
  if command -v node &>/dev/null; then
    node -e "const p=require('$manifest');console.log(p.version)" 2>/dev/null || echo "unknown"
  else
    grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$manifest" \
      | head -1 | grep -o '"[^"]*"$' | tr -d '"' || echo "unknown"
  fi
}

# ── Đọc .pluginignore ───────────────────────────────────────────────────────
read_ignore_patterns() {
  local ignore_file="$PLUGIN_ROOT/.pluginignore"
  if [ -f "$ignore_file" ]; then
    grep -v '^#' "$ignore_file" | grep -v '^[[:space:]]*$' || true
  fi
}

# ── Main ────────────────────────────────────────────────────────────────────
main() {
  local custom_version=""
  local skip_build=false

  # Parse args
  for arg in "$@"; do
    case "$arg" in
      --no-build) skip_build=true ;;
      --help|-h)
        echo "Dùng: bash scripts/package.sh [version] [--no-build]"
        exit 0 ;;
      *) custom_version="$arg" ;;
    esac
  done

  local version="${custom_version:-$(get_version)}"
  [ "$version" != "unknown" ] || fail "Không đọc được version từ plugin.json"

  local package_name="mcv3-devkit-${version}"
  local output_plugin="$DIST_DIR/${package_name}.plugin"
  local output_zip="$DIST_DIR/${package_name}.zip"
  local temp_dir

  echo ""
  echo "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${BLUE}║  MCV3-Plugin Packager                            ║${NC}"
  echo "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  log "Version: $version"
  log "Output : $output_plugin"
  echo ""

  # Kiểm tra zip availability
  if ! command -v zip &>/dev/null; then
    fail "zip command chưa được cài đặt.\n  Mac: brew install zip\n  Ubuntu: sudo apt install zip"
  fi

  # Kiểm tra prerequisites
  section "Kiểm tra trước khi đóng gói"
  check_pre_package "$skip_build"

  # Tạo thư mục dist
  mkdir -p "$DIST_DIR"
  # Tạo temp directory
  temp_dir="$(mktemp -d)"
  trap "rm -rf '$temp_dir'" EXIT

  # Staging
  section "Staging files"
  local stage_dir="$temp_dir/$package_name"
  mkdir -p "$stage_dir"
  stage_files "$stage_dir"

  # Tạo archive
  section "Tạo archive"
  create_archive "$temp_dir" "$package_name" "$output_plugin" "$output_zip"

  # Summary
  section "Hoàn thành"
  print_package_summary "$output_plugin" "$output_zip" "$version"
}

# ── Kiểm tra trước đóng gói ─────────────────────────────────────────────────
check_pre_package() {
  local skip_build="$1"

  # Kiểm tra dist/index.js
  local dist_js="$PLUGIN_ROOT/mcp-servers/project-memory/dist/index.js"
  if [ ! -f "$dist_js" ]; then
    if $skip_build; then
      warn "dist/index.js không tồn tại và --no-build được dùng"
      warn "Package sẽ KHÔNG có pre-built MCP server"
      read -r -p "Tiếp tục? (y/N) " r
      [[ "$r" =~ ^[Yy]$ ]] || { log "Hủy"; exit 0; }
    else
      log "Build MCP Server trước khi đóng gói..."
      local server_dir="$PLUGIN_ROOT/mcp-servers/project-memory"
      if command -v npm &>/dev/null && [ -f "$server_dir/package.json" ]; then
        (cd "$server_dir" && npm install --silent && npm run build) \
          && ok "MCP Server đã build" \
          || fail "Build MCP Server thất bại. Dùng --no-build để bỏ qua."
      else
        fail "npm không có hoặc package.json thiếu. Dùng --no-build để bỏ qua."
      fi
    fi
  else
    ok "MCP Server dist/ đã có sẵn"
  fi

  # Kiểm tra CHANGELOG.md
  [ -f "$PLUGIN_ROOT/CHANGELOG.md" ] && ok "CHANGELOG.md tồn tại" || warn "CHANGELOG.md không tìm thấy"

  # Kiểm tra .pluginignore
  [ -f "$PLUGIN_ROOT/.pluginignore" ] && ok ".pluginignore tồn tại" || warn ".pluginignore không tìm thấy — dùng defaults"
}

# ── Stage files vào temp dir ─────────────────────────────────────────────────
stage_files() {
  local stage_dir="$1"

  # Đọc ignore patterns
  local ignore_patterns
  mapfile -t ignore_patterns < <(read_ignore_patterns)

  # Files/dirs luôn exclude (hard-coded)
  local always_exclude=(
    ".git"
    ".gitignore"
    ".mc-data"
    "docs"
    "dist"
    "node_modules"
    ".claude/settings.local.json"
    ".claude/worktrees"
    "mcp-servers/project-memory/node_modules"
    "*.plugin"
    "*.zip"
  )

  # Files/dirs cần include
  local include_items=(
    ".claude-plugin"
    ".claude/commands"          # Slash commands để install script dùng
    "skills"
    "agents"
    "templates"
    "scripts"
    "hooks"
    "knowledge"
    "mcp-servers"
    "CLAUDE.md"
    "CHANGELOG.md"
    "LICENSE"
    "README.md"
    "INSTALL.md"
    ".pluginignore"
  )

  local copied=0
  local skipped=0

  for item in "${include_items[@]}"; do
    local src="$PLUGIN_ROOT/$item"
    [ -e "$src" ] || continue

    local dst_parent="$stage_dir/$(dirname "$item")"
    mkdir -p "$dst_parent"

    if [ -d "$src" ]; then
      cp -r "$src" "$dst_parent/"
    else
      cp "$src" "$dst_parent/"
    fi
    ((copied++)) || true
  done

  # Xóa exclude items từ staged
  for exclude in "${always_exclude[@]}" "${ignore_patterns[@]}"; do
    [ -n "$exclude" ] || continue
    # Xóa trực tiếp
    find "$stage_dir" -name "$exclude" -exec rm -rf {} + 2>/dev/null || true
    # Xóa theo path
    local staged_path="$stage_dir/$exclude"
    [ -e "$staged_path" ] && rm -rf "$staged_path" || true
  done

  # Dọn sạch node_modules
  find "$stage_dir" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
  # Dọn .DS_Store, Thumbs.db
  find "$stage_dir" -name ".DS_Store" -o -name "Thumbs.db" | xargs rm -f 2>/dev/null || true

  # Đếm files
  local file_count
  file_count=$(find "$stage_dir" -type f | wc -l | tr -d ' ')
  ok "Staged $file_count files vào package"

  # Hiển thị cấu trúc package
  log "Package structure:"
  ls -1 "$stage_dir" | while read -r item; do
    if [ -d "$stage_dir/$item" ]; then
      local sub_count
      sub_count=$(find "$stage_dir/$item" -type f | wc -l | tr -d ' ')
      echo "    $item/ ($sub_count files)"
    else
      echo "    $item"
    fi
  done
}

# ── Tạo archive ─────────────────────────────────────────────────────────────
create_archive() {
  local temp_dir="$1"
  local package_name="$2"
  local output_plugin="$3"
  local output_zip="$4"

  log "Nén thành .plugin file..."
  (
    cd "$temp_dir"
    zip -r "$output_plugin" "$package_name/" -x "*.DS_Store" "*.gitkeep" 2>/dev/null
  )

  # Tạo alias .zip
  cp "$output_plugin" "$output_zip"

  ok "Archive đã tạo"
}

# ── In summary ──────────────────────────────────────────────────────────────
print_package_summary() {
  local plugin_file="$1"
  local zip_file="$2"
  local version="$3"

  local size_plugin size_zip
  if command -v du &>/dev/null; then
    size_plugin=$(du -sh "$plugin_file" 2>/dev/null | cut -f1 || echo "?")
    size_zip=$(du -sh "$zip_file" 2>/dev/null | cut -f1 || echo "?")
  fi

  echo ""
  echo "${BOLD}${GREEN}Package đã sẵn sàng phân phối:${NC}"
  echo ""
  echo "  📦 ${plugin_file}"
  [ -n "${size_plugin:-}" ] && echo "     Size: $size_plugin"
  echo ""
  echo "  📦 ${zip_file}"
  [ -n "${size_zip:-}" ] && echo "     Size: $size_zip"
  echo ""
  echo "${BOLD}Hướng dẫn phân phối:${NC}"
  echo ""
  echo "  1. Upload lên GitHub Releases hoặc share file .plugin"
  echo "  2. User tải về và giải nén:"
  echo "       unzip mcv3-devkit-${version}.zip"
  echo "       # hoặc đổi đuôi .plugin → .zip rồi giải nén"
  echo ""
  echo "  3. User chạy installer:"
  echo "       bash mcv3-devkit-${version}/scripts/install.sh /path/to/project"
  echo ""
  echo "  4. Windows users:"
  echo "       PowerShell: .\\mcv3-devkit-${version}\\scripts\\install.ps1 /path/to/project"
  echo ""
}

main "$@"
