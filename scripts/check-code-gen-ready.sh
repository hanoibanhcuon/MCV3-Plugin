#!/bin/bash
# check-code-gen-ready.sh — Kiểm tra code đã được generate trước khi /mcv3:verify
#
# Được gọi bởi hook PreVerify.
# Kiểm tra src/ có files với REQ-ID comments trước khi chạy verification.
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
  info "check-code-gen-ready: thiếu MCV3_PROJECT_SLUG, bỏ qua"
  exit 0
fi

# src/ tìm từ PROJECT_ROOT (thư mục dự án thực, không phải .mc-data)
SRC_DIR="${PROJECT_ROOT}/src"

echo "🔍 Kiểm tra code generation prerequisites trước khi Verify..." >&2

ERRORS=0
WARNINGS=0

# Kiểm tra src/ tồn tại
if [ ! -d "$SRC_DIR" ]; then
  error "Không tìm thấy thư mục src/ — chạy /mcv3:code-gen trước"
  ERRORS=$((ERRORS + 1))
else
  info "src/ tồn tại ✓"

  # Đếm source files
  SOURCE_FILES=$(find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" \) 2>/dev/null | wc -l)
  if [ "$SOURCE_FILES" -eq 0 ]; then
    error "src/ không có source files — chạy /mcv3:code-gen trước"
    ERRORS=$((ERRORS + 1))
  else
    info "Source files: ${SOURCE_FILES} ✓"
  fi

  # Kiểm tra REQ-ID comments trong source files
  if [ "$SOURCE_FILES" -gt 0 ]; then
    REQ_ID_FILES=$(grep -rl "@req-ids\|REQ-ID:\|US-[A-Z]*-[0-9]\{3\}\|FT-[A-Z]*-[0-9]\{3\}" "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
    if [ "$REQ_ID_FILES" -eq 0 ]; then
      warn "Không tìm thấy REQ-ID comments trong source files — traceability không đầy đủ"
      warn "Format chuẩn: /** @req-ids US-XXX-001, FT-XXX-001 */"
      WARNINGS=$((WARNINGS + 1))
    else
      info "Files có REQ-ID: ${REQ_ID_FILES} ✓"
    fi
  fi
fi

# Kiểm tra TEST files có trong P3-QA-DOCS
PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"
if [ -d "$PROJECT_DIR" ]; then
  TEST_COUNT=$(find "${PROJECT_DIR}" -name "TEST-*.md" -path "*/P3-QA-DOCS/*" 2>/dev/null | wc -l)
  if [ "$TEST_COUNT" -eq 0 ]; then
    warn "Không có TEST-*.md files — verification không thể check AC coverage"
    WARNINGS=$((WARNINGS + 1))
  else
    info "TEST docs: ${TEST_COUNT} ✓"
  fi
fi

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ Code Gen check FAILED: ${ERRORS} lỗi — chạy /mcv3:code-gen trước${NC}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Code Gen check: ${WARNINGS} warning(s) — có thể verify nhưng nên bổ sung REQ-ID${NC}" >&2
  exit 0
else
  echo -e "${GREEN}✅ Code Gen sẵn sàng — có thể bắt đầu /mcv3:verify${NC}" >&2
  exit 0
fi
