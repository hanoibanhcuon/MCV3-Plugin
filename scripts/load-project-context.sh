#!/bin/bash
# load-project-context.sh — MCV3 Sprint 1
#
# Tự động load project context khi bắt đầu session mới.
# Hook này được gọi bởi SessionStart event.
#
# Chức năng:
#   1. Tìm project đang active trong .mc-data/
#   2. Load key-facts (Layer 0) + checkpoint
#   3. In ra context cho Claude để resume
#
# Sử dụng: ./scripts/load-project-context.sh [project-slug]

set -euo pipefail

# ── Cấu hình ──────────────────────────────────────────────────────────────

MC_DATA_DIR="${MCV3_DATA_DIR:-.mc-data}"
PROJECTS_DIR="$MC_DATA_DIR/projects"

# ── Helper functions ───────────────────────────────────────────────────────

log() {
  echo "[MCV3] $1" >&2
}

print_separator() {
  echo "════════════════════════════════════════" >&2
}

# ── Main ───────────────────────────────────────────────────────────────────

main() {
  local target_slug="${1:-}"

  # Kiểm tra .mc-data/ tồn tại
  if [ ! -d "$PROJECTS_DIR" ]; then
    log "Chưa có project nào. Dùng mc_init_project để tạo dự án mới."
    exit 0
  fi

  # Nếu không truyền slug → tìm project active (có checkpoint mới nhất)
  if [ -z "$target_slug" ]; then
    # Tìm project có _checkpoint.md được sửa gần đây nhất
    latest_checkpoint=$(find "$PROJECTS_DIR" -name "_checkpoint.md" \
      -exec stat -c '%Y %n' {} \; 2>/dev/null | \
      sort -rn | head -1 | awk '{print $2}')

    if [ -z "$latest_checkpoint" ]; then
      log "Không tìm thấy checkpoint. Dùng /mcv3:status để xem projects."
      exit 0
    fi

    # Extract slug từ path: .mc-data/projects/{slug}/_mcv3-work/_checkpoint.md
    target_slug=$(echo "$latest_checkpoint" | awk -F'/' '{print $3}')
  fi

  local project_dir="$PROJECTS_DIR/$target_slug"

  # Kiểm tra project tồn tại
  if [ ! -d "$project_dir" ]; then
    log "Project '$target_slug' không tồn tại trong $PROJECTS_DIR"
    exit 1
  fi

  # ── Load config ────────────────────────────────────────────────────────
  local config_file="$project_dir/_config.json"
  if [ ! -f "$config_file" ]; then
    log "Không tìm thấy _config.json cho project '$target_slug'"
    exit 1
  fi

  # Parse JSON bằng node (available trong Claude Code environment)
  local project_name phase domain
  if command -v node &>/dev/null; then
    project_name=$(node -e "const c=require('$config_file'); console.log(c.name)" 2>/dev/null || echo "$target_slug")
    phase=$(node -e "const c=require('$config_file'); console.log(c.currentPhase)" 2>/dev/null || echo "unknown")
    domain=$(node -e "const c=require('$config_file'); console.log(c.domain)" 2>/dev/null || echo "unknown")
  else
    project_name="$target_slug"
    phase="unknown"
    domain="unknown"
  fi

  # ── Print context ──────────────────────────────────────────────────────
  print_separator
  echo "🚀 MCV3 PROJECT CONTEXT LOADED" >&2
  print_separator
  echo "📂 Project: $project_name" >&2
  echo "🏷  Slug: $target_slug" >&2
  echo "🏭 Domain: $domain" >&2
  echo "📍 Phase: $phase" >&2
  echo "" >&2

  # ── Load key-facts nếu có ─────────────────────────────────────────────
  local key_facts_file="$project_dir/_PROJECT/_key-facts.md"
  if [ -f "$key_facts_file" ]; then
    echo "📌 KEY FACTS:" >&2
    cat "$key_facts_file" >&2
    echo "" >&2
  fi

  # ── Load checkpoint ───────────────────────────────────────────────────
  local checkpoint_file="$project_dir/_mcv3-work/_checkpoint.md"
  if [ -f "$checkpoint_file" ]; then
    echo "📋 CHECKPOINT:" >&2
    # Chỉ hiện 30 dòng đầu để không spam
    head -30 "$checkpoint_file" >&2
    echo "" >&2
    echo "_[Đọc thêm: mc_resume({ projectSlug: \"$target_slug\" })]_" >&2
  fi

  print_separator
  echo "💡 Dùng mc_resume({ projectSlug: \"$target_slug\" }) để load đầy đủ context" >&2
  print_separator

  # ── Return machine-readable output cho MCP tools ─────────────────────
  echo "{\"projectSlug\":\"$target_slug\",\"phase\":\"$phase\",\"domain\":\"$domain\"}"
}

main "$@"
