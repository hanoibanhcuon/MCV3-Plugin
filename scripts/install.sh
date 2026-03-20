#!/bin/bash
# ============================================================
# install.sh — MCV3-Plugin Installer
# MasterCraft DevKit v3.x
# ============================================================
#
# Cài đặt MCV3-Plugin vào dự án của bạn.
#
# Cách dùng:
#   bash scripts/install.sh                    # Cài vào thư mục hiện tại
#   bash scripts/install.sh /path/to/project   # Cài vào thư mục chỉ định
#
# Ví dụ (sau khi tải và giải nén plugin):
#   bash mcv3-devkit-3.11.2/scripts/install.sh ~/projects/my-app
#
# Yêu cầu: Node.js v18+

set -euo pipefail

# ── Hằng số ─────────────────────────────────────────────────────────────────
PLUGIN_DIR_NAME="mcv3-devkit"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SOURCE="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Màu sắc terminal ────────────────────────────────────────────────────────
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

# ── Đọc version plugin ──────────────────────────────────────────────────────
get_plugin_version() {
  local manifest="$PLUGIN_SOURCE/.claude-plugin/plugin.json"
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

  local plugin_version
  plugin_version="$(get_plugin_version)"

  echo ""
  echo "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${BLUE}║  MasterCraft DevKit v${plugin_version} — Installer          ║${NC}"
  echo "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  log "Plugin source : $PLUGIN_SOURCE"
  log "Cài đặt vào  : $target_dir"
  echo ""

  # 1. Kiểm tra prerequisites
  section "Kiểm tra prerequisites"
  check_prerequisites

  # 2. Kiểm tra existing installation
  local plugin_install_dir="$target_dir/$PLUGIN_DIR_NAME"
  local is_reinstall="false"
  check_existing "$plugin_install_dir" "$plugin_version" is_reinstall

  # 3. Copy plugin files
  section "Copy plugin files"
  copy_plugin_files "$plugin_install_dir"

  # 4. Cài đặt slash commands
  section "Cài đặt slash commands"
  install_commands "$target_dir"

  # 5. Cấu hình .mcp.json
  section "Cấu hình MCP Server (.mcp.json)"
  setup_mcp_json "$target_dir"

  # 6. Tạo .claude/CLAUDE.md — hướng dẫn Claude về MCV3
  section "Tạo .claude/CLAUDE.md"
  setup_claude_md "$target_dir" "$plugin_version"

  # 7. Cấu hình .claude/settings.json (hooks)
  section "Cấu hình hooks (.claude/settings.json)"
  setup_settings_json "$target_dir"

  # 8. Build MCP Server
  section "Build MCP Server"
  build_mcp_server "$plugin_install_dir" "$is_reinstall"

  # 9. Verify
  section "Kiểm tra cài đặt"
  run_verify "$target_dir"

  # Hoàn thành
  echo ""
  echo "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${GREEN}║  ✅ Cài đặt thành công!                          ║${NC}"
  echo "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  Plugin  : MasterCraft DevKit v${plugin_version}"
  echo "  Vị trí  : ${plugin_install_dir}"
  echo ""
  echo "  ${BOLD}Bước tiếp theo:${NC}"
  echo "  1. Mở dự án bằng Claude Code"
  echo "  2. Gõ: /mcv3:onboard     — xem hướng dẫn theo loại user"
  echo ""
  echo "  ${BOLD}Bắt đầu ngay:${NC}"
  echo "  > /mcv3:discovery        — dự án mới"
  echo "  > /mcv3:assess           — dự án đang chạy"
  echo "  > /mcv3:status           — xem tiến độ"
  echo ""
}

# ── Kiểm tra prerequisites ──────────────────────────────────────────────────
check_prerequisites() {
  # Kiểm tra Node.js
  if ! command -v node &>/dev/null; then
    fail "Node.js chưa được cài đặt.\n  Tải tại: https://nodejs.org (yêu cầu v18+)"
  fi

  local node_major
  node_major=$(node --version | sed 's/v//' | cut -d. -f1)
  if [ "$node_major" -lt 18 ]; then
    fail "Node.js v18+ yêu cầu. Hiện tại: $(node --version)\n  Tải: https://nodejs.org"
  fi
  ok "Node.js $(node --version)"

  # Kiểm tra npm (không bắt buộc nếu dist/ có sẵn)
  if command -v npm &>/dev/null; then
    ok "npm $(npm --version)"
  else
    warn "npm không tìm thấy — sẽ dùng dist/ được đóng gói sẵn"
  fi
}

# ── Kiểm tra existing installation ─────────────────────────────────────────
check_existing() {
  local install_dir="$1"
  local new_version="$2"
  # is_reinstall là tên biến sẽ được gán (pass by name)
  local result_var="$3"

  if [ ! -d "$install_dir" ]; then
    return 0  # Fresh install
  fi

  # Đọc version đã cài
  local current_version="không xác định"
  local manifest="$install_dir/.claude-plugin/plugin.json"
  if [ -f "$manifest" ] && command -v node &>/dev/null; then
    current_version=$(node -e \
      "try{const p=require('$manifest');console.log(p.version)}catch(e){console.log('không xác định')}" \
      2>/dev/null || echo "không xác định")
  fi

  if [ "$current_version" = "$new_version" ]; then
    warn "MCV3-Plugin v${current_version} đã được cài đặt (cùng version)."
  else
    warn "Tìm thấy v${current_version} → sẽ update lên v${new_version}"
  fi
  log "Tiếp tục cài đặt..."

  # Gán biến kết quả
  eval "$result_var=true"
}

# ── Copy plugin files ────────────────────────────────────────────────────────
copy_plugin_files() {
  local install_dir="$1"

  # Danh sách items cần copy
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

  # Thêm INSTALL.md nếu có
  [ -f "$PLUGIN_SOURCE/INSTALL.md" ] && items+=("INSTALL.md")

  mkdir -p "$install_dir"

  for item in "${items[@]}"; do
    local src="$PLUGIN_SOURCE/$item"
    [ -e "$src" ] || continue  # Bỏ qua nếu không tồn tại

    local dst="$install_dir/$item"

    if [ -d "$src" ]; then
      # Backup dist/ trước khi xóa mcp-servers (tránh mất build cũ khi update)
      local dist_backup=""
      if [ "$item" = "mcp-servers" ] && [ -d "$dst/project-memory/dist" ]; then
        dist_backup="$(mktemp -d)"
        cp -r "$dst/project-memory/dist" "$dist_backup/"
      fi

      # Xóa và copy lại
      rm -rf "$dst"
      cp -r "$src" "$dst"

      # Khôi phục dist/ nếu source mới không có dist
      if [ -n "$dist_backup" ] && [ ! -d "$dst/project-memory/dist" ]; then
        mkdir -p "$dst/project-memory/"
        cp -r "$dist_backup/dist" "$dst/project-memory/"
      fi
      [ -n "$dist_backup" ] && rm -rf "$dist_backup"
    else
      cp "$src" "$dst"
    fi
  done

  # Dọn sạch node_modules nếu vô tình copy vào
  find "$install_dir" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

  ok "Plugin files → ${install_dir##*/}/"
}

# ── Cài đặt slash commands ──────────────────────────────────────────────────
install_commands() {
  local target_dir="$1"
  local src_dir="$PLUGIN_SOURCE/.claude/commands/mcv3"
  local dst_dir="$target_dir/.claude/commands/mcv3"

  if [ ! -d "$src_dir" ]; then
    warn "Không tìm thấy command files — bỏ qua bước này"
    return 0
  fi

  mkdir -p "$dst_dir"

  local count=0
  for src_file in "$src_dir"/*.md; do
    [ -f "$src_file" ] || continue
    local fname
    fname="$(basename "$src_file")"
    local dst_file="$dst_dir/$fname"

    # Cập nhật đường dẫn: "skills/{name}/SKILL.md" → "mcv3-devkit/skills/{name}/SKILL.md"
    # Dùng pattern cụ thể để tránh double-replace
    sed \
      -e "s|skills/\([a-z-]*\)/SKILL\.md|${PLUGIN_DIR_NAME}/skills/\1/SKILL.md|g" \
      "$src_file" > "$dst_file"

    ((count++)) || true
  done

  ok "$count slash commands → .claude/commands/mcv3/"
}

# ── Cấu hình .mcp.json ──────────────────────────────────────────────────────
setup_mcp_json() {
  local target_dir="$1"
  local mcp_file="$target_dir/.mcp.json"

  # Kiểm tra đã có chưa
  if [ -f "$mcp_file" ] && grep -q "mcv3-project-memory" "$mcp_file" 2>/dev/null; then
    ok ".mcp.json đã có mcv3-project-memory — giữ nguyên"
    return 0
  fi

  # Dùng node script tạm để merge JSON an toàn
  local tmpjs
  tmpjs="$(mktemp /tmp/mcv3-mcp-XXXX.js)"

  cat > "$tmpjs" << NODEJS
const fs = require('fs');
const mcpFile = process.argv[2];
const pluginDir = process.argv[3];

let json = { mcpServers: {} };
if (fs.existsSync(mcpFile)) {
  try { json = JSON.parse(fs.readFileSync(mcpFile, 'utf8')); }
  catch(e) { console.error('Parse error:', e.message); process.exit(1); }
}
if (!json.mcpServers) json.mcpServers = {};

json.mcpServers['mcv3-project-memory'] = {
  "type": "stdio",
  "command": "node",
  "args": ["./" + pluginDir + "/mcp-servers/project-memory/dist/index.js"],
  "env": { "MCV3_PROJECT_ROOT": "." },
  "description": "MCV3 Project Memory Server — Quản lý tài liệu dự án trong .mc-data/"
};

fs.writeFileSync(mcpFile, JSON.stringify(json, null, 2) + '\n');
NODEJS

  if node "$tmpjs" "$mcp_file" "$PLUGIN_DIR_NAME" 2>/dev/null; then
    ok ".mcp.json → mcv3-project-memory đã cấu hình"
  else
    warn "Không thể tự động cập nhật .mcp.json. Thêm thủ công:"
    echo '  {'
    echo '    "mcpServers": {'
    echo '      "mcv3-project-memory": {'
    echo '        "type": "stdio",'
    echo '        "command": "node",'
    echo "        \"args\": [\"./${PLUGIN_DIR_NAME}/mcp-servers/project-memory/dist/index.js\"],"
    echo '        "env": { "MCV3_PROJECT_ROOT": "." }'
    echo '      }'
    echo '    }'
    echo '  }'
  fi

  rm -f "$tmpjs"
}

# ── Tạo .claude/CLAUDE.md ───────────────────────────────────────────────────
# Claude tự động đọc file này khi mở dự án → biết ngay MCV3 đã cài + cách dùng
setup_claude_md() {
  local target_dir="$1"
  local plugin_version="$2"
  local claude_dir="$target_dir/.claude"
  local claude_md="$claude_dir/CLAUDE.md"

  mkdir -p "$claude_dir"

  if [ -f "$claude_md" ] && grep -q "mcv3-devkit" "$claude_md" 2>/dev/null; then
    ok ".claude/CLAUDE.md đã có MCV3 reference — giữ nguyên"
    return 0
  fi

  if [ -f "$claude_md" ]; then
    # Append vào CLAUDE.md có sẵn
    cat >> "$claude_md" << EOF

---

## MCV3-Plugin v${plugin_version}

Plugin MasterCraft DevKit đã cài đặt tại \`${PLUGIN_DIR_NAME}/\`.

### Quy tắc bắt buộc

1. **Bắt đầu session mới**: Gọi \`mc_status()\` để xem project context
2. **Lưu tài liệu**: Dùng \`mc_save\` — KHÔNG ghi \`.mc-data/\` trực tiếp
3. **Ngôn ngữ**: Documentation và comments bằng tiếng Việt
4. **Scale-aware**: Không cần full 8 phases cho mọi dự án (Micro chỉ cần 3 phases)
5. **Auto-Mode**: Skills tự chạy hoàn toàn — KHÔNG hỏi "confirm không?", KHÔNG dừng giữa chừng

### MCP Tools (19 tools — mcv3-project-memory)

\`\`\`
mc_init_project   mc_save        mc_load        mc_list        mc_status
mc_checkpoint     mc_resume      mc_validate    mc_export      mc_search
mc_snapshot       mc_rollback    mc_impact_analysis            mc_traceability
mc_dependency     mc_compare     mc_merge       mc_changelog   mc_summary
\`\`\`

Ví dụ: \`mc_status()\`, \`mc_load({ projectSlug: "...", filePath: "..." })\`

### Pipeline 8 Phase

| Lệnh | Phase | Output |
|------|-------|--------|
| \`/mcv3:discovery\` | 1 | PROJECT-OVERVIEW.md |
| \`/mcv3:expert-panel\` | 2 | EXPERT-LOG.md |
| \`/mcv3:biz-docs\` | 3 | BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| \`/mcv3:requirements\` | 4 | URS-{MOD}.md |
| \`/mcv3:tech-design\` | 5 | MODSPEC-{MOD}.md |
| \`/mcv3:qa-docs\` | 6 | TEST-{MOD}.md, USER-GUIDE, ADMIN-GUIDE |
| \`/mcv3:code-gen\` | 7 | Source code + Verification Loop |
| \`/mcv3:verify\` | 8a | Traceability matrix + report |
| \`/mcv3:deploy-ops\` | 8b | DEPLOY-OPS.md + checklist |

### Lifecycle Skills

| Lệnh | Khi nào dùng |
|------|-------------|
| \`/mcv3:status\` | Dashboard tiến độ dự án |
| \`/mcv3:change-manager\` | Quản lý requirement changes |
| \`/mcv3:evolve\` | Thêm sub-feature / module / system mới |
| \`/mcv3:migrate\` | Import tài liệu cũ (Word/Confluence/code) vào MCV3 |
| \`/mcv3:onboard\` | Tutorial theo role (Dev / PM / Business Owner) |
| \`/mcv3:assess\` | Đánh giá dự án in-progress, tìm gaps |

### Scale Decision Matrix

\`\`\`
Micro  (< 10 endpoints, 1 dev)     → Phase 1 → 5 → 7
Small  (< 30 endpoints, 1-2 devs)  → Phase 1 → 4 → 5 → 7 → 8a
Medium (< 100 endpoints, 2-5 devs) → Phase 1-8 (Phase 3 optional)
Large  (100+ endpoints, 5+ devs)   → Full 8 phases
Enterprise (regulated)              → Full 8 phases + compliance gates
\`\`\`

### Auto-Mode Protocol

Skills chạy **hoàn toàn tự động**:
- KHÔNG hỏi "module nào trước?" — tự quyết theo dependency
- KHÔNG dừng chờ confirm — tự detect tech stack, tự resolve ambiguity
- \`mc_save\` TRƯỚC khi hiển thị — chỉ show tóm tắt ngắn
- Kết thúc bằng: **[1] Xem chi tiết / [2] Thay đổi / [3] Tiếp tục**

Chi tiết: \`${PLUGIN_DIR_NAME}/knowledge/auto-mode-protocol.md\`

### Quick Start

\`\`\`
# Dự án mới:
/mcv3:discovery

# Dự án đang chạy (có code/docs cũ):
/mcv3:assess

# Xem tiến độ:
/mcv3:status

# Hướng dẫn chi tiết theo role:
/mcv3:onboard
\`\`\`

Tài liệu đầy đủ: \`${PLUGIN_DIR_NAME}/CLAUDE.md\`
EOF
    ok ".claude/CLAUDE.md đã cập nhật với MCV3 instructions"
  else
    # Tạo mới hoàn toàn
    cat > "$claude_md" << EOF
# CLAUDE.md — Project Configuration

## MCV3-Plugin v${plugin_version}

Plugin MasterCraft DevKit đã cài đặt tại \`${PLUGIN_DIR_NAME}/\`.

### Quy tắc bắt buộc

1. **Bắt đầu session mới**: Gọi \`mc_status()\` để xem project context
2. **Lưu tài liệu**: Dùng \`mc_save\` — KHÔNG ghi \`.mc-data/\` trực tiếp
3. **Ngôn ngữ**: Documentation và comments bằng tiếng Việt
4. **Scale-aware**: Không cần full 8 phases cho mọi dự án (Micro chỉ cần 3 phases)
5. **Auto-Mode**: Skills tự chạy hoàn toàn — KHÔNG hỏi "confirm không?", KHÔNG dừng giữa chừng

### MCP Tools (19 tools — mcv3-project-memory)

\`\`\`
mc_init_project   mc_save        mc_load        mc_list        mc_status
mc_checkpoint     mc_resume      mc_validate    mc_export      mc_search
mc_snapshot       mc_rollback    mc_impact_analysis            mc_traceability
mc_dependency     mc_compare     mc_merge       mc_changelog   mc_summary
\`\`\`

Ví dụ: \`mc_status()\`, \`mc_load({ projectSlug: "...", filePath: "..." })\`

### Pipeline 8 Phase

| Lệnh | Phase | Output |
|------|-------|--------|
| \`/mcv3:discovery\` | 1 | PROJECT-OVERVIEW.md |
| \`/mcv3:expert-panel\` | 2 | EXPERT-LOG.md |
| \`/mcv3:biz-docs\` | 3 | BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| \`/mcv3:requirements\` | 4 | URS-{MOD}.md |
| \`/mcv3:tech-design\` | 5 | MODSPEC-{MOD}.md |
| \`/mcv3:qa-docs\` | 6 | TEST-{MOD}.md, USER-GUIDE, ADMIN-GUIDE |
| \`/mcv3:code-gen\` | 7 | Source code + Verification Loop |
| \`/mcv3:verify\` | 8a | Traceability matrix + report |
| \`/mcv3:deploy-ops\` | 8b | DEPLOY-OPS.md + checklist |

### Lifecycle Skills

| Lệnh | Khi nào dùng |
|------|-------------|
| \`/mcv3:status\` | Dashboard tiến độ dự án |
| \`/mcv3:change-manager\` | Quản lý requirement changes |
| \`/mcv3:evolve\` | Thêm sub-feature / module / system mới |
| \`/mcv3:migrate\` | Import tài liệu cũ (Word/Confluence/code) vào MCV3 |
| \`/mcv3:onboard\` | Tutorial theo role (Dev / PM / Business Owner) |
| \`/mcv3:assess\` | Đánh giá dự án in-progress, tìm gaps |

### Scale Decision Matrix

\`\`\`
Micro  (< 10 endpoints, 1 dev)     → Phase 1 → 5 → 7
Small  (< 30 endpoints, 1-2 devs)  → Phase 1 → 4 → 5 → 7 → 8a
Medium (< 100 endpoints, 2-5 devs) → Phase 1-8 (Phase 3 optional)
Large  (100+ endpoints, 5+ devs)   → Full 8 phases
Enterprise (regulated)              → Full 8 phases + compliance gates
\`\`\`

### Auto-Mode Protocol

Skills chạy **hoàn toàn tự động**:
- KHÔNG hỏi "module nào trước?" — tự quyết theo dependency
- KHÔNG dừng chờ confirm — tự detect tech stack, tự resolve ambiguity
- \`mc_save\` TRƯỚC khi hiển thị — chỉ show tóm tắt ngắn
- Kết thúc bằng: **[1] Xem chi tiết / [2] Thay đổi / [3] Tiếp tục**

Chi tiết: \`${PLUGIN_DIR_NAME}/knowledge/auto-mode-protocol.md\`

### Quick Start

\`\`\`
# Dự án mới:
/mcv3:discovery

# Dự án đang chạy (có code/docs cũ):
/mcv3:assess

# Xem tiến độ:
/mcv3:status

# Hướng dẫn chi tiết theo role:
/mcv3:onboard
\`\`\`

Tài liệu đầy đủ: \`${PLUGIN_DIR_NAME}/CLAUDE.md\`
EOF
    ok ".claude/CLAUDE.md đã tạo với đầy đủ MCV3 instructions"
  fi
}

# ── Cấu hình .claude/settings.json (hooks) ──────────────────────────────────
# Claude Code đọc file này để biết hooks nào cần chạy
setup_settings_json() {
  local target_dir="$1"
  local claude_dir="$target_dir/.claude"
  local settings_file="$claude_dir/settings.json"

  mkdir -p "$claude_dir"

  # Kiểm tra đã có hook chưa
  if [ -f "$settings_file" ] && grep -q "auto-checkpoint" "$settings_file" 2>/dev/null; then
    ok ".claude/settings.json đã có MCV3 hooks — giữ nguyên"
    return 0
  fi

  # Dùng node để merge JSON (nếu file đã tồn tại)
  local tmpjs
  tmpjs="$(mktemp /tmp/mcv3-settings-XXXX.js)"

  cat > "$tmpjs" << NODEJS
const fs = require('fs');
const settingsFile = process.argv[2];
const pluginDir = process.argv[3];

let json = {};
if (fs.existsSync(settingsFile)) {
  try { json = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); }
  catch(e) { console.error('Parse error:', e.message); process.exit(1); }
}

// Khởi tạo cấu trúc hooks nếu chưa có
if (!json.hooks) json.hooks = {};

// Hook: Auto-checkpoint khi kết thúc session
if (!json.hooks.Stop) json.hooks.Stop = [];
const hasAutoCheckpoint = json.hooks.Stop.some(
  h => h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('auto-checkpoint'))
);
if (!hasAutoCheckpoint) {
  json.hooks.Stop.push({
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": "bash " + pluginDir + "/scripts/auto-checkpoint.sh"
    }]
  });
}

fs.writeFileSync(settingsFile, JSON.stringify(json, null, 2) + '\n');
NODEJS

  if node "$tmpjs" "$settings_file" "$PLUGIN_DIR_NAME" 2>/dev/null; then
    ok ".claude/settings.json → hooks đã cấu hình (auto-checkpoint)"
  else
    warn "Không thể tự động cập nhật settings.json. Thêm thủ công:"
    echo '  {'
    echo '    "hooks": {'
    echo '      "Stop": [{'
    echo '        "matcher": "",'
    echo '        "hooks": [{'
    echo '          "type": "command",'
    echo "          \"command\": \"bash ${PLUGIN_DIR_NAME}/scripts/auto-checkpoint.sh\""
    echo '        }]'
    echo '      }]'
    echo '    }'
    echo '  }'
  fi

  rm -f "$tmpjs"
}

# ── Build MCP Server ─────────────────────────────────────────────────────────
build_mcp_server() {
  local plugin_dir="$1"
  local is_reinstall="$2"
  local server_dir="$plugin_dir/mcp-servers/project-memory"

  # Nếu dist/ đã có và là fresh install → dùng dist đóng gói sẵn
  if [ -d "$server_dir/dist" ] && [ -f "$server_dir/dist/index.js" ] && \
     [ "$is_reinstall" = "false" ]; then
    ok "MCP Server: sử dụng dist/ được đóng gói sẵn"
    log "(Để rebuild thủ công: cd '$server_dir' && npm install && npm run build)"
    return 0
  fi

  # Không có npm → dùng dist có sẵn nếu tồn tại
  if ! command -v npm &>/dev/null; then
    if [ -f "$server_dir/dist/index.js" ]; then
      ok "MCP Server: sử dụng dist/ có sẵn (npm không tìm thấy)"
    else
      warn "MCP Server chưa được build. Build thủ công:"
      warn "  cd '$server_dir' && npm install && npm run build"
    fi
    return 0
  fi

  if [ ! -f "$server_dir/package.json" ]; then
    warn "package.json không tìm thấy tại $server_dir"
    return 0
  fi

  log "Đang build MCP Server..."
  local build_ok=true

  (cd "$server_dir" && npm install --silent 2>/dev/null) || build_ok=false
  if $build_ok; then
    (cd "$server_dir" && npm run build 2>/dev/null) || build_ok=false
  fi

  if $build_ok && [ -f "$server_dir/dist/index.js" ]; then
    ok "MCP Server đã build thành công"
  elif [ -f "$server_dir/dist/index.js" ]; then
    warn "Build có lỗi nhưng dist/ cũ vẫn dùng được"
  else
    warn "Build thất bại. Thử thủ công:"
    warn "  cd '$server_dir' && npm install && npm run build"
  fi
}

# ── Chạy verify ─────────────────────────────────────────────────────────────
run_verify() {
  local target_dir="$1"
  local verify_script="$target_dir/$PLUGIN_DIR_NAME/scripts/verify-install.sh"

  if [ -f "$verify_script" ]; then
    bash "$verify_script" "$target_dir" || true
  else
    log "verify-install.sh chưa có — bỏ qua bước verify"
  fi
}

main "$@"
