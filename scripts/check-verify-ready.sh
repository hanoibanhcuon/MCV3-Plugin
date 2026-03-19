#!/bin/bash
# check-verify-ready.sh — Kiểm tra verification report trước khi /mcv3:deploy-ops
#
# Được gọi bởi hook PreDeployOps (failBehavior: block).
# Kiểm tra verification-report.md tồn tại và status READY.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT, MCV3_PROJECT_SLUG

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

warn()  { echo -e "${YELLOW}⚠️  WARNING: $1${NC}" >&2; }
error() { echo -e "${RED}❌ ERROR: $1${NC}" >&2; }
info()  { echo -e "${GREEN}✅ $1${NC}" >&2; }

if [ -z "$PROJECT_SLUG" ]; then
  info "check-verify-ready: thiếu MCV3_PROJECT_SLUG, bỏ qua"
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

if [ ! -d "$PROJECT_DIR" ]; then
  error "Thư mục dự án không tồn tại: $PROJECT_DIR"
  exit 1
fi

echo "🔍 Kiểm tra verification prerequisites trước khi Deploy-Ops..." >&2

ERRORS=0
WARNINGS=0

# Kiểm tra verification-report.md
VERIFY_REPORT="${PROJECT_DIR}/_VERIFY-CROSS/verification-report.md"
if [ ! -f "$VERIFY_REPORT" ]; then
  error "Thiếu _VERIFY-CROSS/verification-report.md — chạy /mcv3:verify trước"
  ERRORS=$((ERRORS + 1))
else
  info "verification-report.md tồn tại ✓"

  # Kiểm tra status trong report
  READY_STATUS=$(grep -i "overall.*status.*READY\|status.*✅.*READY\|OVERALL.*READY" "$VERIFY_REPORT" 2>/dev/null | wc -l || echo 0)
  ATTENTION_STATUS=$(grep -i "NEEDS ATTENTION\|⚠️" "$VERIFY_REPORT" 2>/dev/null | wc -l || echo 0)
  NOT_READY_STATUS=$(grep -i "NOT READY\|❌" "$VERIFY_REPORT" 2>/dev/null | wc -l || echo 0)

  if [ "$NOT_READY_STATUS" -gt 0 ] && [ "$READY_STATUS" -eq 0 ]; then
    error "verification-report.md có status NOT READY — cần sửa issues trước khi deploy"
    ERRORS=$((ERRORS + 1))
  elif [ "$ATTENTION_STATUS" -gt 0 ] && [ "$READY_STATUS" -eq 0 ]; then
    warn "verification-report.md có NEEDS ATTENTION items — review trước khi deploy"
    WARNINGS=$((WARNINGS + 1))
  elif [ "$READY_STATUS" -gt 0 ]; then
    info "Verification status: READY ✓"
  else
    warn "Không xác định được status của verification-report.md — review thủ công"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# Kiểm tra traceability-matrix.md
TRACE_MATRIX="${PROJECT_DIR}/_VERIFY-CROSS/traceability-matrix.md"
if [ ! -f "$TRACE_MATRIX" ]; then
  warn "Thiếu traceability-matrix.md — chạy /mcv3:verify để tạo"
  WARNINGS=$((WARNINGS + 1))
else
  info "traceability-matrix.md tồn tại ✓"
fi

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ Verify check FAILED: ${ERRORS} lỗi — KHÔNG thể deploy khi chưa verify xong${NC}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Verify check: ${WARNINGS} warning(s) — xác nhận với team trước khi deploy${NC}" >&2
  exit 0
else
  echo -e "${GREEN}✅ Verification READY — có thể bắt đầu /mcv3:deploy-ops${NC}" >&2
  exit 0
fi
