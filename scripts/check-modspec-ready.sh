#!/bin/bash
# check-modspec-ready.sh — Kiểm tra MODSPEC trước khi chạy /mcv3:qa-docs
#
# Được gọi bởi hook PreQADocs.
# Kiểm tra MODSPEC và URS đã có cho module cần QA.
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT, MCV3_PROJECT_SLUG, MCV3_MODULE (optional)

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"
MODULE="${MCV3_MODULE:-}"

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

warn()  { echo -e "${YELLOW}⚠️  WARNING: $1${NC}" >&2; }
error() { echo -e "${RED}❌ ERROR: $1${NC}" >&2; }
info()  { echo -e "${GREEN}✅ $1${NC}" >&2; }

if [ -z "$PROJECT_SLUG" ]; then
  info "check-modspec-ready: thiếu MCV3_PROJECT_SLUG, bỏ qua"
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

if [ ! -d "$PROJECT_DIR" ]; then
  warn "Thư mục dự án không tồn tại: $PROJECT_DIR"
  exit 0
fi

echo "🔍 Kiểm tra MODSPEC prerequisites trước khi tạo QA Docs..." >&2

ERRORS=0
WARNINGS=0

# Kiểm tra MODSPEC files
if [ -n "$MODULE" ]; then
  # Kiểm tra module cụ thể
  MODSPEC_FILE=$(find "${PROJECT_DIR}" -name "MODSPEC-${MODULE}.md" -path "*/P2-DESIGN/*" 2>/dev/null | head -1)
  if [ -z "$MODSPEC_FILE" ]; then
    error "Thiếu MODSPEC-${MODULE}.md — chạy /mcv3:tech-design trước"
    ERRORS=$((ERRORS + 1))
  else
    info "MODSPEC-${MODULE}.md ✓"
    # Kiểm tra có API-ID không
    API_COUNT=$(grep -c "API-[A-Z]*-[0-9]" "$MODSPEC_FILE" 2>/dev/null || echo 0)
    if [ "$API_COUNT" -eq 0 ]; then
      warn "MODSPEC-${MODULE}.md không có API-ID — QA Docs sẽ thiếu API test cases"
      WARNINGS=$((WARNINGS + 1))
    else
      info "API endpoints: ${API_COUNT} ✓"
    fi
  fi

  # Kiểm tra URS tương ứng
  URS_FILE=$(find "${PROJECT_DIR}" -name "URS-${MODULE}.md" -path "*/P1-REQUIREMENTS/*" 2>/dev/null | head -1)
  if [ -z "$URS_FILE" ]; then
    warn "Thiếu URS-${MODULE}.md — QA Docs sẽ không có AC để trace"
    WARNINGS=$((WARNINGS + 1))
  else
    info "URS-${MODULE}.md ✓"
    # Kiểm tra có AC-ID không
    AC_COUNT=$(grep -c "AC-[A-Z]*-[0-9]" "$URS_FILE" 2>/dev/null || echo 0)
    if [ "$AC_COUNT" -eq 0 ]; then
      warn "URS-${MODULE}.md không có AC-ID — Test Cases sẽ không có traceability"
      WARNINGS=$((WARNINGS + 1))
    else
      info "Acceptance Criteria: ${AC_COUNT} ✓"
    fi
  fi
else
  # Kiểm tra tổng quát: có ít nhất 1 MODSPEC
  MODSPEC_COUNT=$(find "${PROJECT_DIR}" -name "MODSPEC-*.md" -path "*/P2-DESIGN/*" 2>/dev/null | wc -l)
  if [ "$MODSPEC_COUNT" -eq 0 ]; then
    error "Không có MODSPEC files — chạy /mcv3:tech-design trước"
    ERRORS=$((ERRORS + 1))
  else
    info "MODSPEC files: ${MODSPEC_COUNT} ✓"
  fi
fi

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ MODSPEC check FAILED: ${ERRORS} lỗi — cần /mcv3:tech-design trước${NC}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  MODSPEC check: ${WARNINGS} warning(s) — có thể tiếp tục${NC}" >&2
  exit 0
else
  echo -e "${GREEN}✅ MODSPEC sẵn sàng — có thể bắt đầu /mcv3:qa-docs${NC}" >&2
  exit 0
fi
