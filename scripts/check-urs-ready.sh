#!/bin/bash
# check-urs-ready.sh — Kiểm tra URS sẵn sàng cho Tech Design
#
# Được gọi bởi hook PreTechDesign.
# Kiểm tra URS của module cụ thể đã đủ chất lượng chưa.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT, MCV3_PROJECT_SLUG, MCV3_TARGET_MODULE

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"
TARGET_MODULE="${MCV3_TARGET_MODULE:-}"

if [ -z "$PROJECT_SLUG" ]; then
  echo "Bỏ qua URS check: thiếu biến môi trường" >&2
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

echo "🔍 Kiểm tra URS readiness cho module: ${TARGET_MODULE:-any}" >&2

ERRORS=0
WARNINGS=0

# Tìm URS files
if [ -n "$TARGET_MODULE" ]; then
  URS_PATTERN="${PROJECT_DIR}/*/P1-REQUIREMENTS/URS-${TARGET_MODULE}.md"
else
  URS_PATTERN="${PROJECT_DIR}/*/P1-REQUIREMENTS/URS-*.md"
fi

URS_FILES=$(find "${PROJECT_DIR}" -name "URS-*.md" -path "*/P1-REQUIREMENTS/*" 2>/dev/null)

if [ -z "$URS_FILES" ]; then
  echo "❌ ERROR: Không tìm thấy URS files trong P1-REQUIREMENTS/" >&2
  echo "   → Chạy /mcv3:requirements trước" >&2
  exit 1
fi

# Kiểm tra chất lượng cơ bản từng URS
while IFS= read -r urs_file; do
  echo "📄 Checking: $(basename $urs_file)" >&2

  # Kiểm tra có User Stories không
  US_COUNT=$(grep -c "^### US-" "$urs_file" 2>/dev/null || echo 0)
  if [ "$US_COUNT" -lt 1 ]; then
    echo "  ⚠️  Ít hơn 1 User Story" >&2
    WARNINGS=$((WARNINGS + 1))
  else
    echo "  ✅ User Stories: ${US_COUNT}" >&2
  fi

  # Kiểm tra có Acceptance Criteria không
  AC_COUNT=$(grep -c "^- AC-" "$urs_file" 2>/dev/null || echo 0)
  if [ "$AC_COUNT" -lt 1 ]; then
    echo "  ⚠️  Thiếu Acceptance Criteria" >&2
    WARNINGS=$((WARNINGS + 1))
  fi

  # Kiểm tra Traceability section
  if ! grep -q "Traceability" "$urs_file" 2>/dev/null; then
    echo "  ℹ️  Chưa có Traceability section" >&2
  fi

done <<< "$URS_FILES"

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ URS check failed: ${ERRORS} lỗi" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "⚠️  URS check: ${WARNINGS} warnings — có thể tiếp tục Tech Design" >&2
  exit 0
else
  echo "✅ URS sẵn sàng cho Tech Design" >&2
  exit 0
fi
