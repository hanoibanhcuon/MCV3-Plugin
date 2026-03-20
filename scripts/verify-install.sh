#!/bin/bash
# ============================================================
# verify-install.sh — MCV3-Plugin Installation Verifier
# MasterCraft DevKit v3.x
# ============================================================
#
# Kiểm tra MCV3-Plugin đã được cài đặt đúng chưa.
#
# Cách dùng:
#   bash mcv3-devkit/scripts/verify-install.sh              # Verify tại project hiện tại
#   bash mcv3-devkit/scripts/verify-install.sh /path/to/project

set -euo pipefail

# ── Hằng số ─────────────────────────────────────────────────────────────────
PLUGIN_DIR_NAME="mcv3-devkit"

# ── Màu sắc ─────────────────────────────────────────────────────────────────
if [ -t 1 ] && command -v tput &>/dev/null && tput colors &>/dev/null; then
  RED=$(tput setaf 1); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
  BLUE=$(tput setaf 4); BOLD=$(tput bold); NC=$(tput sgr0)
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

# ── Counters ────────────────────────────────────────────────────────────────
PASS=0; FAIL=0; WARN=0

pass() { echo "  ${GREEN}✅${NC} $*"; ((PASS++)) || true; }
fail() { echo "  ${RED}❌${NC} $*"; ((FAIL++)) || true; }
warn() { echo "  ${YELLOW}⚠ ${NC} $*"; ((WARN++)) || true; }
section() { echo ""; echo "${BOLD}${BLUE}$*${NC}"; }

# ── Main ────────────────────────────────────────────────────────────────────
main() {
  local project_dir="${1:-.}"
  project_dir="$(cd "$project_dir" 2>/dev/null && pwd)" \
    || { echo "Không tìm thấy thư mục: $1"; exit 1; }

  local plugin_dir="$project_dir/$PLUGIN_DIR_NAME"

  echo ""
  echo "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
  echo "${BOLD}${BLUE}║  MCV3-Plugin — Verify Installation               ║${NC}"
  echo "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  Project: $project_dir"
  echo ""

  # ── Kiểm tra Node.js ────────────────────────────────────────────────────
  section "1. Runtime Prerequisites"

  if command -v node &>/dev/null; then
    local node_major
    node_major=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$node_major" -ge 18 ]; then
      pass "Node.js $(node --version)"
    else
      fail "Node.js v18+ yêu cầu — hiện tại: $(node --version)"
    fi
  else
    fail "Node.js chưa cài đặt (https://nodejs.org)"
  fi

  # ── Kiểm tra Plugin Directory ───────────────────────────────────────────
  section "2. Plugin Directory ($PLUGIN_DIR_NAME/)"

  if [ -d "$plugin_dir" ]; then
    pass "Thư mục $PLUGIN_DIR_NAME/ tồn tại"
  else
    fail "Thư mục $PLUGIN_DIR_NAME/ không tìm thấy"
    echo ""
    echo "  Chạy install script:"
    echo "  bash /path/to/plugin-source/scripts/install.sh '$project_dir'"
    echo ""
    print_summary; exit 1
  fi

  # Plugin version
  local manifest="$plugin_dir/.claude-plugin/plugin.json"
  if [ -f "$manifest" ]; then
    local version
    version=$(node -e "const p=require('$manifest');console.log(p.version)" 2>/dev/null || echo "?")
    pass "Plugin version: v$version"
  else
    fail ".claude-plugin/plugin.json không tìm thấy"
  fi

  # ── Kiểm tra cấu trúc thư mục ──────────────────────────────────────────
  section "3. Plugin Structure"

  local required_dirs=(
    "skills"
    "agents"
    "templates"
    "scripts"
    "hooks"
    "knowledge"
    "mcp-servers/project-memory"
  )

  for dir in "${required_dirs[@]}"; do
    if [ -d "$plugin_dir/$dir" ]; then
      pass "$dir/"
    else
      fail "$dir/ không tìm thấy"
    fi
  done

  # Kiểm tra CLAUDE.md plugin
  if [ -f "$plugin_dir/CLAUDE.md" ]; then
    pass "CLAUDE.md (plugin docs)"
  else
    warn "CLAUDE.md không tìm thấy trong $PLUGIN_DIR_NAME/"
  fi

  # ── Kiểm tra MCP Server ─────────────────────────────────────────────────
  section "4. MCP Server"

  local dist_index="$plugin_dir/mcp-servers/project-memory/dist/index.js"
  if [ -f "$dist_index" ]; then
    pass "dist/index.js (build artifact)"
  else
    fail "dist/index.js không tìm thấy — cần build:"
    echo "    cd '$plugin_dir/mcp-servers/project-memory'"
    echo "    npm install && npm run build"
  fi

  # Kiểm tra có thể chạy được không
  if [ -f "$dist_index" ] && command -v node &>/dev/null; then
    if node -e "require('$dist_index')" 2>/dev/null; then
      pass "MCP Server có thể load được"
    else
      warn "MCP Server có thể có lỗi — thử rebuild"
    fi
  fi

  # ── Kiểm tra .mcp.json ──────────────────────────────────────────────────
  section "5. MCP Configuration (.mcp.json)"

  local mcp_file="$project_dir/.mcp.json"
  if [ -f "$mcp_file" ]; then
    if grep -q "mcv3-project-memory" "$mcp_file" 2>/dev/null; then
      pass ".mcp.json có mcv3-project-memory"

      # Kiểm tra path trong .mcp.json
      if grep -q "$PLUGIN_DIR_NAME/mcp-servers" "$mcp_file" 2>/dev/null; then
        pass ".mcp.json path trỏ đúng"
      else
        warn ".mcp.json có thể trỏ sai đường dẫn"
        warn "Kiểm tra: args phải là \"./${PLUGIN_DIR_NAME}/mcp-servers/project-memory/dist/index.js\""
      fi
    else
      fail ".mcp.json không có mcv3-project-memory entry"
      echo "    Thêm vào .mcp.json:"
      echo "    {"
      echo "      \"mcpServers\": {"
      echo "        \"mcv3-project-memory\": {"
      echo "          \"type\": \"stdio\","
      echo "          \"command\": \"node\","
      echo "          \"args\": [\"./${PLUGIN_DIR_NAME}/mcp-servers/project-memory/dist/index.js\"],"
      echo "          \"env\": { \"MCV3_PROJECT_ROOT\": \".\" }"
      echo "        }"
      echo "      }"
      echo "    }"
    fi
  else
    fail ".mcp.json không tìm thấy"
  fi

  # ── Kiểm tra Slash Commands ─────────────────────────────────────────────
  section "6. Slash Commands (.claude/commands/mcv3/)"

  local cmd_dir="$project_dir/.claude/commands/mcv3"
  if [ -d "$cmd_dir" ]; then
    local cmd_count
    cmd_count=$(find "$cmd_dir" -name "*.md" | wc -l | tr -d ' ')
    if [ "$cmd_count" -gt 0 ]; then
      pass "$cmd_count slash commands (e.g. /mcv3:discovery)"

      # Kiểm tra path trong command files
      local sample_cmd="$cmd_dir/discovery.md"
      if [ -f "$sample_cmd" ]; then
        if grep -q "mcv3-devkit/skills" "$sample_cmd" 2>/dev/null; then
          pass "Command paths đã cập nhật (mcv3-devkit/skills/...)"
        else
          warn "Command paths có thể chưa đúng — chạy install lại để fix"
        fi
      fi
    else
      fail "Không có command files trong $cmd_dir"
    fi
  else
    fail ".claude/commands/mcv3/ không tìm thấy"
  fi

  # ── Kiểm tra .claude/CLAUDE.md ─────────────────────────────────────────
  section "7. Claude Configuration (.claude/CLAUDE.md)"

  local claude_md="$project_dir/.claude/CLAUDE.md"
  if [ -f "$claude_md" ]; then
    if grep -q "mcv3-devkit" "$claude_md" 2>/dev/null; then
      pass ".claude/CLAUDE.md có MCV3 instructions"
    else
      warn ".claude/CLAUDE.md tồn tại nhưng chưa có MCV3 reference"
      warn "Chạy install lại để thêm MCV3 instructions vào CLAUDE.md"
    fi
  else
    warn ".claude/CLAUDE.md không tìm thấy"
    warn "Claude sẽ không biết MCV3 đã cài — chạy install để tạo file này"
  fi

  # ── Kiểm tra hooks ──────────────────────────────────────────────────────
  section "8. Hooks (.claude/settings.json)"

  local settings_file="$project_dir/.claude/settings.json"
  if [ -f "$settings_file" ]; then
    if grep -q "auto-checkpoint" "$settings_file" 2>/dev/null; then
      pass ".claude/settings.json có auto-checkpoint hook"
    else
      warn ".claude/settings.json chưa có MCV3 hooks"
      warn "Chạy install lại để cấu hình hooks"
    fi
  else
    warn ".claude/settings.json không tìm thấy — hooks chưa được cấu hình"
  fi

  # ── Summary ─────────────────────────────────────────────────────────────
  print_summary
}

print_summary() {
  local total=$((PASS + FAIL + WARN))
  echo ""
  echo "${BOLD}══════════════════════════════════════════════════${NC}"
  echo "${BOLD}  Kết quả: ${GREEN}✅ ${PASS}${NC} ${BOLD}|${NC} ${RED}❌ ${FAIL}${NC} ${BOLD}|${NC} ${YELLOW}⚠  ${WARN}${NC}  (total: $total)"
  echo "${BOLD}══════════════════════════════════════════════════${NC}"

  if [ "$FAIL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
    echo ""
    echo "  ${GREEN}${BOLD}✅ Cài đặt hoàn hảo! Sẵn sàng sử dụng.${NC}"
    echo ""
    echo "  Mở dự án bằng Claude Code và gõ: /mcv3:onboard"
  elif [ "$FAIL" -eq 0 ]; then
    echo ""
    echo "  ${YELLOW}${BOLD}⚠  Cài đặt OK với một số cảnh báo.${NC}"
    echo "  Kiểm tra các ⚠ ở trên để tối ưu."
  else
    echo ""
    echo "  ${RED}${BOLD}❌ Cài đặt có lỗi — xem chi tiết ở trên.${NC}"
    echo "  Chạy install lại:"
    echo "  bash /path/to/plugin-source/scripts/install.sh [target-dir]"
    echo ""
    exit 1
  fi
  echo ""
}

main "$@"
