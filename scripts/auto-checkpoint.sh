#!/bin/bash
# auto-checkpoint.sh — MCV3 Sprint 1
#
# Tự động lưu checkpoint khi kết thúc session.
# Hook này được gọi bởi SessionStop event.
#
# Chức năng:
#   1. Tìm project đang active
#   2. Gọi mc_checkpoint để lưu trạng thái
#   3. Log thông tin checkpoint đã lưu
#
# Sử dụng: ./scripts/auto-checkpoint.sh [project-slug]
# Hoặc: MCV3_PROJECT_SLUG=my-project ./scripts/auto-checkpoint.sh

set -euo pipefail

# ── Cấu hình ──────────────────────────────────────────────────────────────

MC_DATA_DIR="${MCV3_DATA_DIR:-.mc-data}"
PROJECTS_DIR="$MC_DATA_DIR/projects"
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S")
LABEL="auto-session-end-$TIMESTAMP"

# ── Helper functions ───────────────────────────────────────────────────────

log() {
  echo "[MCV3 AutoCheckpoint] $1" >&2
}

# ── Main ───────────────────────────────────────────────────────────────────

main() {
  local target_slug="${1:-${MCV3_PROJECT_SLUG:-}}"

  # Nếu không có slug → tìm project active
  if [ -z "$target_slug" ]; then
    latest_checkpoint=$(find "$PROJECTS_DIR" -name "_checkpoint.md" \
      -exec stat -c '%Y %n' {} \; 2>/dev/null | \
      sort -rn | head -1 | awk '{print $2}')

    if [ -z "$latest_checkpoint" ]; then
      log "Không có project active để lưu checkpoint"
      exit 0
    fi

    target_slug=$(echo "$latest_checkpoint" | awk -F'/' '{print $3}')
  fi

  local project_dir="$PROJECTS_DIR/$target_slug"

  if [ ! -d "$project_dir" ]; then
    log "Project '$target_slug' không tồn tại"
    exit 0
  fi

  # ── Tạo checkpoint content ────────────────────────────────────────────

  # Đọc phase hiện tại
  local phase="unknown"
  local project_name="$target_slug"
  if command -v node &>/dev/null && [ -f "$project_dir/_config.json" ]; then
    phase=$(node -e "const c=require('$(pwd)/$project_dir/_config.json'); console.log(c.currentPhase)" 2>/dev/null || echo "unknown")
    project_name=$(node -e "const c=require('$(pwd)/$project_dir/_config.json'); console.log(c.name)" 2>/dev/null || echo "$target_slug")
  fi

  # Đếm số documents
  local doc_count
  doc_count=$(find "$project_dir" -name "*.md" \
    -not -path "*/_mcv3-work/*" \
    -not -name "_changelog.md" \
    -not -name "_dependency-graph.md" \
    2>/dev/null | wc -l | tr -d ' ')

  # ── Ghi checkpoint ───────────────────────────────────────────────────
  local checkpoint_file="$project_dir/_mcv3-work/_checkpoint.md"
  local snapshot_dir="$project_dir/_mcv3-work/_snapshots"

  mkdir -p "$snapshot_dir"

  # Nội dung checkpoint auto-save
  cat > "$checkpoint_file" << EOF
# CHECKPOINT — $project_name
<!-- Auto-saved bởi auto-checkpoint.sh — $TIMESTAMP -->

> **Dự án:** $project_name (\`$target_slug\`)
> **Phase hiện tại:** $phase
> **Auto-saved lúc:** $TIMESTAMP

## Trạng thái

Session kết thúc. Auto-checkpoint được tạo tự động.

**Số tài liệu:** $doc_count files

## Bước tiếp theo

_(Chưa xác định — xác định trong session tiếp theo)_

## Working Context

\`\`\`json
{
  "projectSlug": "$target_slug",
  "currentPhase": "$phase",
  "checkpointLabel": "$LABEL",
  "savedAt": "$TIMESTAMP",
  "autoSaved": true,
  "documentCount": $doc_count,
  "resumeInstruction": "Gọi mc_resume({ projectSlug: \"$target_slug\" }) để resume"
}
\`\`\`
EOF

  # Lưu snapshot versioned
  local snapshot_file="$snapshot_dir/${LABEL}.md"
  cp "$checkpoint_file" "$snapshot_file"

  # Ghi vào changelog
  local changelog_file="$project_dir/_changelog.md"
  if [ -f "$changelog_file" ]; then
    echo "" >> "$changelog_file"
    echo "- [$TIMESTAMP] Auto-checkpoint: $LABEL (phase: $phase, docs: $doc_count)" >> "$changelog_file"
  fi

  log "✅ Auto-checkpoint saved: $LABEL"
  log "   Project: $project_name ($phase)"
  log "   Documents: $doc_count"
  log "   Snapshot: $snapshot_file"
}

main "$@"
