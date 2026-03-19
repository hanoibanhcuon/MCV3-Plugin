#!/bin/bash
# check-bizdocs-ready.sh — Kiểm tra BizDocs trước khi chạy /mcv3:requirements
#
# Được gọi bởi hook PreRequirementsGeneration.
# Kiểm tra BIZ-POLICY, PROCESS và DATA-DICTIONARY đã có trước khi viết URS.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT — thư mục gốc dự án
#   MCV3_PROJECT_SLUG — slug của dự án hiện tại

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

# Nếu không có PROJECT_SLUG, bỏ qua
if [ -z "$PROJECT_SLUG" ]; then
  info "check-bizdocs-ready: thiếu MCV3_PROJECT_SLUG, bỏ qua"
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

if [ ! -d "$PROJECT_DIR" ]; then
  warn "Thư mục dự án không tồn tại: $PROJECT_DIR"
  exit 0
fi

echo "🔍 Kiểm tra BizDocs prerequisites trước khi viết URS..." >&2

ERRORS=0
WARNINGS=0

# Kiểm tra BIZ-POLICY
BIZ_POLICY_COUNT=$(find "${PROJECT_DIR}/_PROJECT/BIZ-POLICY" -name "BIZ-POLICY-*.md" 2>/dev/null | wc -l)
if [ "$BIZ_POLICY_COUNT" -eq 0 ]; then
  error "Thiếu BIZ-POLICY — chạy /mcv3:biz-docs để tạo Business Policy documents"
  ERRORS=$((ERRORS + 1))
else
  info "BIZ-POLICY: ${BIZ_POLICY_COUNT} file(s) ✓"
fi

# Kiểm tra PROCESS
PROCESS_COUNT=$(find "${PROJECT_DIR}/_PROJECT/PROCESS" -name "PROCESS-*.md" 2>/dev/null | wc -l)
if [ "$PROCESS_COUNT" -eq 0 ]; then
  error "Thiếu PROCESS — chạy /mcv3:biz-docs để tạo Business Process documents"
  ERRORS=$((ERRORS + 1))
else
  info "PROCESS: ${PROCESS_COUNT} file(s) ✓"
fi

# Kiểm tra DATA-DICTIONARY (warning nếu thiếu)
if [ ! -f "${PROJECT_DIR}/_PROJECT/DATA-DICTIONARY.md" ]; then
  warn "Thiếu DATA-DICTIONARY.md — nên tạo để đồng bộ thuật ngữ nghiệp vụ"
  WARNINGS=$((WARNINGS + 1))
else
  info "DATA-DICTIONARY.md ✓"
fi

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ BizDocs check FAILED: ${ERRORS} lỗi — chạy /mcv3:biz-docs trước khi viết Requirements${NC}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  BizDocs check: ${WARNINGS} warning(s) — có thể tiếp tục${NC}" >&2
  exit 0
else
  echo -e "${GREEN}✅ BizDocs sẵn sàng — có thể bắt đầu /mcv3:requirements${NC}" >&2
  exit 0
fi
