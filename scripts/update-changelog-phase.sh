#!/bin/bash
# update-changelog-phase.sh — Ghi changelog milestone khi hoàn thành phase
#
# Được gọi bởi hook PostPhaseCompletion.
# Tự động thêm milestone entry vào structured changelog khi phase xong.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT, MCV3_PROJECT_SLUG, MCV3_COMPLETED_PHASE

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"
COMPLETED_PHASE="${MCV3_COMPLETED_PHASE:-}"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}✅ $1${NC}" >&2; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}" >&2; }

# Nếu thiếu biến môi trường, bỏ qua (không block)
if [ -z "$PROJECT_SLUG" ]; then
  info "update-changelog-phase: thiếu MCV3_PROJECT_SLUG, bỏ qua"
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

if [ ! -d "$PROJECT_DIR" ]; then
  warn "Thư mục dự án không tồn tại: $PROJECT_DIR"
  exit 0
fi

NOW=$(date -u +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || date +"%Y-%m-%d")
TODAY=$(date -u +"%Y-%m-%d" 2>/dev/null || date +"%Y-%m-%d")
CHANGELOG="${PROJECT_DIR}/_changelog.md"

# Map phase code sang tên đầy đủ
phase_label() {
  case "$1" in
    phase1-discovery)    echo "Phase 1: Discovery — PROJECT-OVERVIEW.md complete" ;;
    phase2-expert)       echo "Phase 2: Expert Analysis — EXPERT-LOG.md complete" ;;
    phase3-bizdocs)      echo "Phase 3: Business Docs — BIZ-POLICY + PROCESS + DATA-DICTIONARY complete" ;;
    phase4-requirements) echo "Phase 4: Requirements — URS documents complete" ;;
    phase5-design)       echo "Phase 5: Technical Design — MODSPEC documents complete" ;;
    phase6-qa)           echo "Phase 6: QA & Docs — TEST + USER/ADMIN GUIDE complete" ;;
    phase7-codegen)      echo "Phase 7: Code Generation — Source code scaffolding complete" ;;
    phase8-verify)       echo "Phase 8: Verify & Deploy — Verification + Deploy-Ops complete" ;;
    *)                   echo "Phase completed: $1" ;;
  esac
}

PHASE_LABEL=$(phase_label "${COMPLETED_PHASE}")

# Tạo changelog entry
ENTRY="\n## ${TODAY} — MILESTONE\n- 🎉 **${PHASE_LABEL}**\n- Thời điểm: ${NOW}\n"

# Append vào _changelog.md
if [ -f "$CHANGELOG" ]; then
  printf "%b" "$ENTRY" >> "$CHANGELOG"
  info "Đã ghi milestone vào _changelog.md: ${PHASE_LABEL}"
else
  {
    echo "# CHANGELOG — ${PROJECT_SLUG}"
    printf "%b" "$ENTRY"
  } > "$CHANGELOG"
  info "Đã tạo _changelog.md với milestone: ${PHASE_LABEL}"
fi

exit 0
