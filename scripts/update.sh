#!/bin/bash
# ============================================================
# update.sh — MCV3-Plugin Updater
# MasterCraft DevKit v3.x
# ============================================================
#
# Cập nhật MCV3-Plugin lên phiên bản mới.
# Dữ liệu dự án (.mc-data/) KHÔNG bị ảnh hưởng.
#
# Cách dùng:
#   # Từ thư mục plugin source MỚI (sau khi tải về):
#   bash mcv3-devkit-NEW/scripts/update.sh /path/to/your-project
#
#   # Ví dụ:
#   bash ~/Downloads/mcv3-devkit-3.11.2/scripts/update.sh ~/projects/my-app
#
# Yêu cầu: Node.js v18+, plugin đã được cài đặt trước đó

set -euo pipefail

# ── Hằng số ─────────────────────────────────────────────────────────────────
PLUGIN_DIR_NAME="mcv3-devkit"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SOURCE="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Màu sắc ─────────────────────────────────────────────────────────────────
if [ -t 1 ] && command -v tput &>/dev/null && tput colors &>/dev/null; then
  RED=$(tput setaf 1); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
  BLUE=$(tput setaf 4); BOLD=$(tput bold); NC=$(tput sgr0)
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

# ── Logging ─────────────────────────────────────────────────────────────────
log()     { echo "${BLUE}[MCV3]${NC} $*"; }
ok()      { echo "${GREEN}[MCV3]${NC} ✅ $*"; }
warn()    { echo "${YELLOW}[MCV3]${NC} ⚠  $*"; }
fail()    { echo "${RED}[MCV3]${NC} ❌ $*" >&2; exit 1; }
section() { echo ""; echo "${BOLD}${BLUE}── $* ──────────────────────────────────────────${NC}"; }

# ── Đọc version từ manifest ─────────────────────────────────────────────────
get_version() {
  local manifest="$1"
  [ -f "$manifest" ] || { echo "unknown"; return; }
  if command -v node &>/dev/null; then
    node -e "try{const p=require('$manifest');console.log(p.version)}catch(e){console.log('unknown')}" 2>/dev/null || echo "unknown"
  else
    grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$manifest" 2>/dev/null \
      | head -1 | grep -o '"[^"]*"$' | tr -d '"' || echo "unknown"
  fi
}

# ── Main ────────────────────────────────────────────────────────────────────
main() {
  local target_dir="${1:-.}"
  target_dir="$(cd "$target_dir" 2>/dev/null && pwd)" \
    || fail "Không tìm thấy thư mục: $1"

  local new_version
  new_version="$(get_version "$PLUGIN_SOURCE/.claude-plugin/plugin.json")"

  echo ""
  echo "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${BLUE}║  MasterCraft DevKit — Updater                    ║${NC}"
  echo "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  log "Plugin source mới : $PLUGIN_SOURCE (v$new_version)"
  log "Dự án cần update  : $target_dir"
  echo ""

  local plugin_install_dir="$target_dir/$PLUGIN_DIR_NAME"

  # 1. Kiểm tra plugin đã cài chưa
  section "Kiểm tra installation hiện tại"
  check_installed "$plugin_install_dir" "$new_version"

  # 2. Kiểm tra prerequisites
  section "Kiểm tra prerequisites"
  check_prerequisites

  # 3. Xác nhận update
  local current_version
  current_version="$(get_version "$plugin_install_dir/.claude-plugin/plugin.json")"
  confirm_update "$current_version" "$new_version"

  # 4. Safety: ghi nhận trạng thái .mc-data/ trước khi update
  section "Kiểm tra dữ liệu dự án"
  check_mc_data "$target_dir"

  # 5. Update plugin files
  section "Update plugin files"
  update_plugin_files "$plugin_install_dir"

  # 6. Update slash commands
  section "Update slash commands"
  update_commands "$target_dir"

  # 7. Update .claude/CLAUDE.md nếu cần
  section "Update .claude/CLAUDE.md"
  update_claude_md "$target_dir" "$new_version"

  # 8. Update .claude/settings.json nếu cần
  section "Update hooks"
  update_settings_json "$target_dir"

  # 9. Rebuild MCP Server
  section "Rebuild MCP Server"
  rebuild_mcp_server "$plugin_install_dir"

  # 10. Verify
  section "Kiểm tra sau update"
  run_verify "$target_dir"

  # Hoàn thành
  echo ""
  echo "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${GREEN}║  ✅ Update thành công!                           ║${NC}"
  echo "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  v${current_version} → v${new_version}"
  echo ""
  echo "  ${BOLD}Dữ liệu dự án (.mc-data/): KHÔNG bị ảnh hưởng${NC}"
  echo ""
  echo "  Mở Claude Code và gõ: /mcv3:status"
  echo ""
}

# ── Kiểm tra đã cài chưa ────────────────────────────────────────────────────
check_installed() {
  local install_dir="$1"
  local new_ver="$2"

  if [ ! -d "$install_dir" ]; then
    warn "MCV3-Plugin chưa được cài đặt tại $install_dir"
    read -r -p "Cài mới thay vì update? (y/N) " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      bash "$SCRIPT_DIR/install.sh" "$(dirname "$install_dir")"
      exit 0
    fi
    fail "Update hủy. Cài đặt trước khi update."
  fi

  ok "Plugin directory tồn tại: $install_dir"
}

# ── Kiểm tra prerequisites ──────────────────────────────────────────────────
check_prerequisites() {
  if ! command -v node &>/dev/null; then
    fail "Node.js chưa được cài đặt (https://nodejs.org, yêu cầu v18+)"
  fi

  local node_major
  node_major=$(node --version | sed 's/v//' | cut -d. -f1)
  if [ "$node_major" -lt 18 ]; then
    fail "Node.js v18+ yêu cầu. Hiện tại: $(node --version)"
  fi
  ok "Node.js $(node --version)"
}

# ── Xác nhận update ─────────────────────────────────────────────────────────
confirm_update() {
  local from_ver="$1"
  local to_ver="$2"

  if [ "$from_ver" = "$to_ver" ]; then
    warn "Đang cài cùng version: v$from_ver → v$to_ver"
    read -r -p "Tiếp tục cài đặt lại? (y/N) " response
    [[ "$response" =~ ^[Yy]$ ]] || { log "Update hủy."; exit 0; }
  else
    log "Update: v${from_ver} → v${to_ver}"
    read -r -p "Tiếp tục? (Y/n) " response
    if [[ "$response" =~ ^[Nn]$ ]]; then
      log "Update hủy."
      exit 0
    fi
  fi
}

# ── Kiểm tra .mc-data/ ──────────────────────────────────────────────────────
check_mc_data() {
  local target_dir="$1"
  local mc_data="$target_dir/.mc-data"

  if [ -d "$mc_data" ]; then
    local project_count
    project_count=$(find "$mc_data/projects" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

    ok "Tìm thấy .mc-data/ với $project_count project(s)"
    log "Dữ liệu dự án SẼ KHÔNG bị ảnh hưởng bởi update này"
  else
    log ".mc-data/ chưa có (chưa khởi tạo dự án nào)"
  fi
}

# ── Update plugin files ──────────────────────────────────────────────────────
update_plugin_files() {
  local install_dir="$1"

  # Giống install nhưng luôn rebuild và không backup dist
  local items=(
    ".claude-plugin"
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
  )
  [ -f "$PLUGIN_SOURCE/INSTALL.md" ] && items+=("INSTALL.md")

  for item in "${items[@]}"; do
    local src="$PLUGIN_SOURCE/$item"
    [ -e "$src" ] || continue

    local dst="$install_dir/$item"
    if [ -d "$src" ]; then
      rm -rf "$dst"
      cp -r "$src" "$dst"
    else
      cp "$src" "$dst"
    fi
  done

  # Dọn sạch node_modules
  find "$install_dir" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

  ok "Plugin files đã update"
}

# ── Update slash commands ────────────────────────────────────────────────────
update_commands() {
  local target_dir="$1"
  local src_dir="$PLUGIN_SOURCE/.claude/commands/mcv3"
  local dst_dir="$target_dir/.claude/commands/mcv3"

  [ -d "$src_dir" ] || { warn "Command files không tìm thấy"; return 0; }

  mkdir -p "$dst_dir"
  local count=0
  for src_file in "$src_dir"/*.md; do
    [ -f "$src_file" ] || continue
    local fname
    fname="$(basename "$src_file")"
    sed \
      -e "s|skills/\([a-z-]*\)/SKILL\.md|${PLUGIN_DIR_NAME}/skills/\1/SKILL.md|g" \
      "$src_file" > "$dst_dir/$fname"
    ((count++)) || true
  done
  ok "$count slash commands đã update"
}

# ── Update .claude/CLAUDE.md ─────────────────────────────────────────────────
update_claude_md() {
  local target_dir="$1"
  local new_version="$2"
  local claude_md="$target_dir/.claude/CLAUDE.md"

  if [ ! -f "$claude_md" ]; then
    # Tạo mới nếu chưa có (gọi logic từ install)
    bash "$SCRIPT_DIR/install.sh" "$target_dir" 2>/dev/null || true
    return 0
  fi

  # Cập nhật version number trong CLAUDE.md nếu có
  if grep -q "MCV3-Plugin v" "$claude_md" 2>/dev/null; then
    local new_ver="$new_version"
    sed -i.bak \
      "s|MCV3-Plugin v[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*|MCV3-Plugin v${new_ver}|g" \
      "$claude_md" 2>/dev/null || true
    rm -f "${claude_md}.bak" 2>/dev/null || true
    ok ".claude/CLAUDE.md version number đã cập nhật → v${new_version}"
  else
    ok ".claude/CLAUDE.md giữ nguyên"
  fi
}

# ── Update settings.json ─────────────────────────────────────────────────────
update_settings_json() {
  local target_dir="$1"
  local settings_file="$target_dir/.claude/settings.json"

  if [ -f "$settings_file" ] && grep -q "auto-checkpoint" "$settings_file" 2>/dev/null; then
    ok ".claude/settings.json hooks đã có — giữ nguyên"
  else
    warn ".claude/settings.json chưa có MCV3 hooks — thêm vào..."
    # Gọi lại setup_settings_json từ install.sh
    local tmpjs
    tmpjs="$(mktemp /tmp/mcv3-settings-XXXX.js)"
    cat > "$tmpjs" << NODEJS
const fs = require('fs');
const settingsFile = process.argv[2];
const pluginDir = process.argv[3];
let json = {};
if (fs.existsSync(settingsFile)) {
  try { json = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); }
  catch(e) {}
}
if (!json.hooks) json.hooks = {};
if (!json.hooks.Stop) json.hooks.Stop = [];
const has = json.hooks.Stop.some(
  h => h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('auto-checkpoint'))
);
if (!has) {
  json.hooks.Stop.push({
    "matcher": "",
    "hooks": [{ "type": "command", "command": "bash " + pluginDir + "/scripts/auto-checkpoint.sh" }]
  });
}
fs.writeFileSync(settingsFile, JSON.stringify(json, null, 2) + '\n');
NODEJS
    mkdir -p "$target_dir/.claude"
    node "$tmpjs" "$settings_file" "$PLUGIN_DIR_NAME" 2>/dev/null && ok "Hooks đã thêm" || warn "Thêm hooks thất bại"
    rm -f "$tmpjs"
  fi
}

# ── Rebuild MCP Server ───────────────────────────────────────────────────────
rebuild_mcp_server() {
  local plugin_dir="$1"
  local server_dir="$plugin_dir/mcp-servers/project-memory"

  if ! command -v npm &>/dev/null; then
    if [ -f "$server_dir/dist/index.js" ]; then
      ok "MCP Server: dùng dist/ có sẵn (npm không tìm thấy)"
    else
      warn "npm không có và dist/ không tồn tại — build thủ công:"
      warn "  cd '$server_dir' && npm install && npm run build"
    fi
    return 0
  fi

  [ -f "$server_dir/package.json" ] || { warn "package.json không tìm thấy"; return 0; }

  log "Rebuild MCP Server..."
  local build_ok=true
  (cd "$server_dir" && npm install --silent 2>/dev/null) || build_ok=false
  if $build_ok; then
    (cd "$server_dir" && npm run build 2>/dev/null) || build_ok=false
  fi

  if $build_ok && [ -f "$server_dir/dist/index.js" ]; then
    ok "MCP Server rebuild thành công"
  elif [ -f "$server_dir/dist/index.js" ]; then
    warn "Rebuild có lỗi nhưng dist/ cũ vẫn dùng được"
  else
    warn "Rebuild thất bại. Thử thủ công:"
    warn "  cd '$server_dir' && npm install && npm run build"
  fi
}

# ── Verify ───────────────────────────────────────────────────────────────────
run_verify() {
  local target_dir="$1"
  local verify_script="$target_dir/$PLUGIN_DIR_NAME/scripts/verify-install.sh"
  [ -f "$verify_script" ] && bash "$verify_script" "$target_dir" || true
}

main "$@"
