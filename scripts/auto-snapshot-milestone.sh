#!/bin/bash
# auto-snapshot-milestone.sh — Tạo snapshot khi hoàn thành phase milestone
#
# Được gọi bởi hook PostPhaseCompletion.
# Tự động tạo mc_snapshot đầy đủ để có thể rollback nếu cần.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT — thư mục gốc dự án
#   MCV3_PROJECT_SLUG — slug dự án
#   MCV3_COMPLETED_PHASE — phase vừa hoàn thành

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"
COMPLETED_PHASE="${MCV3_COMPLETED_PHASE:-}"

if [ -z "$PROJECT_SLUG" ]; then
  echo "Bỏ qua auto-snapshot: thiếu MCV3_PROJECT_SLUG" >&2
  exit 0
fi

LABEL="milestone-${COMPLETED_PHASE:-phase}-$(date +%Y%m%d)"

echo "📸 Tạo milestone snapshot: ${LABEL}" >&2

# Gọi MCP server thông qua CLI nếu có
# Trong thực tế, Claude sẽ gọi mc_snapshot trực tiếp thông qua MCP
# Script này chỉ là placeholder — Claude đọc instruction từ đây

cat <<EOF
# Auto-Snapshot Instruction

Khi hook này được trigger, Claude cần thực hiện:

mc_snapshot({
  projectSlug: "${PROJECT_SLUG}",
  label: "${LABEL}",
  notes: "Auto-snapshot sau khi hoàn thành ${COMPLETED_PHASE}"
})

EOF

echo "✅ Milestone snapshot instruction created" >&2
exit 0
