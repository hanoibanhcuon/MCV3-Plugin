#!/bin/bash
# validate-phase-transition.sh — Kiểm tra tài liệu trước khi chuyển phase
#
# Được gọi bởi hook PrePhaseTransition khi Claude chuẩn bị chuyển phase.
# Script này kiểm tra prereqs của phase tiếp theo.
#
# Biến môi trường cần có:
#   MCV3_PROJECT_ROOT — thư mục gốc dự án
#   MCV3_PROJECT_SLUG — slug của dự án hiện tại
#   MCV3_CURRENT_PHASE — phase hiện tại
#   MCV3_NEXT_PHASE — phase sắp chuyển sang

set -euo pipefail

PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"
CURRENT_PHASE="${MCV3_CURRENT_PHASE:-}"
NEXT_PHASE="${MCV3_NEXT_PHASE:-}"

# Thư mục project
PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

# Màu sắc output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Hàm in warning
warn() { echo -e "${YELLOW}⚠️  WARNING: $1${NC}" >&2; }
error() { echo -e "${RED}❌ ERROR: $1${NC}" >&2; }
info() { echo -e "${GREEN}✅ $1${NC}" >&2; }

# Nếu không có đủ biến môi trường, skip (không block)
if [ -z "$PROJECT_SLUG" ] || [ -z "$CURRENT_PHASE" ] || [ -z "$NEXT_PHASE" ]; then
  info "Validate phase transition: thiếu biến môi trường, bỏ qua"
  exit 0
fi

# Nếu thư mục project không tồn tại, skip
if [ ! -d "$PROJECT_DIR" ]; then
  warn "Thư mục dự án không tồn tại: $PROJECT_DIR"
  exit 0
fi

echo "🔍 Kiểm tra prereqs: ${CURRENT_PHASE} → ${NEXT_PHASE}" >&2

# Kiểm tra theo phase transition
ERRORS=0
WARNINGS=0

case "${NEXT_PHASE}" in
  "phase2-expert")
    # Cần PROJECT-OVERVIEW.md
    if [ ! -f "${PROJECT_DIR}/_PROJECT/PROJECT-OVERVIEW.md" ]; then
      error "Thiếu PROJECT-OVERVIEW.md — chạy /mcv3:discovery trước"
      ERRORS=$((ERRORS + 1))
    else
      info "PROJECT-OVERVIEW.md ✓"
    fi
    ;;

  "phase3-bizdocs")
    # Cần EXPERT-LOG.md (khuyến nghị)
    if [ ! -f "${PROJECT_DIR}/_PROJECT/EXPERT-LOG.md" ]; then
      warn "Thiếu EXPERT-LOG.md — khuyến nghị chạy /mcv3:expert-panel trước"
      WARNINGS=$((WARNINGS + 1))
    else
      info "EXPERT-LOG.md ✓"
    fi
    ;;

  "phase4-requirements")
    # Cần ít nhất 1 BIZ-POLICY
    BIZ_POLICY_COUNT=$(find "${PROJECT_DIR}/_PROJECT/BIZ-POLICY" -name "*.md" 2>/dev/null | wc -l)
    if [ "$BIZ_POLICY_COUNT" -eq 0 ]; then
      error "Thiếu BIZ-POLICY — chạy /mcv3:biz-docs trước"
      ERRORS=$((ERRORS + 1))
    else
      info "BIZ-POLICY: ${BIZ_POLICY_COUNT} files ✓"
    fi

    # DATA-DICTIONARY (khuyến nghị)
    if [ ! -f "${PROJECT_DIR}/_PROJECT/DATA-DICTIONARY.md" ]; then
      warn "Thiếu DATA-DICTIONARY.md — nên tạo trước khi viết URS"
      WARNINGS=$((WARNINGS + 1))
    fi
    ;;

  "phase5-design")
    # Cần ít nhất 1 URS
    URS_COUNT=$(find "${PROJECT_DIR}" -name "URS-*.md" 2>/dev/null | grep "P1-REQUIREMENTS" | wc -l)
    if [ "$URS_COUNT" -eq 0 ]; then
      error "Thiếu URS — chạy /mcv3:requirements trước"
      ERRORS=$((ERRORS + 1))
    else
      info "URS files: ${URS_COUNT} ✓"
    fi
    ;;

  "phase6-qa")
    # Cần ít nhất 1 MODSPEC
    MODSPEC_COUNT=$(find "${PROJECT_DIR}" -name "MODSPEC-*.md" 2>/dev/null | grep "P2-DESIGN" | wc -l)
    if [ "$MODSPEC_COUNT" -eq 0 ]; then
      error "Thiếu MODSPEC — chạy /mcv3:tech-design trước"
      ERRORS=$((ERRORS + 1))
    else
      info "MODSPEC files: ${MODSPEC_COUNT} ✓"
    fi
    ;;

  "phase7-codegen")
    # Cần ít nhất 1 TEST-*.md trong P3-QA-DOCS/
    TEST_COUNT=$(find "${PROJECT_DIR}" -name "TEST-*.md" 2>/dev/null | grep "P3-QA-DOCS" | wc -l)
    if [ "$TEST_COUNT" -eq 0 ]; then
      error "Thiếu TEST-*.md trong P3-QA-DOCS/ — chạy /mcv3:qa-docs trước"
      ERRORS=$((ERRORS + 1))
    else
      info "TEST docs: ${TEST_COUNT} ✓"
    fi
    ;;

  "phase8-verify")
    # Cần src/ có source files với REQ-ID comments
    SRC_DIR="${PROJECT_ROOT}/src"
    if [ ! -d "$SRC_DIR" ]; then
      error "Không tìm thấy thư mục src/ — chạy /mcv3:code-gen trước"
      ERRORS=$((ERRORS + 1))
    else
      SOURCE_FILES=$(find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" \) 2>/dev/null | wc -l)
      if [ "$SOURCE_FILES" -eq 0 ]; then
        error "src/ không có source files — chạy /mcv3:code-gen trước"
        ERRORS=$((ERRORS + 1))
      else
        info "Source files: ${SOURCE_FILES} ✓"
        REQ_ID_FILES=$(grep -rl "@req-ids\|REQ-ID:" "$SRC_DIR" 2>/dev/null | wc -l || echo 0)
        if [ "$REQ_ID_FILES" -eq 0 ]; then
          warn "Không tìm thấy REQ-ID comments trong source files — traceability không đầy đủ"
          WARNINGS=$((WARNINGS + 1))
        else
          info "Files có REQ-ID: ${REQ_ID_FILES} ✓"
        fi
      fi
    fi
    ;;
esac

# Summary
echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}Phase transition bị block: ${ERRORS} lỗi cần sửa${NC}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}Phase transition có ${WARNINGS} warnings — có thể tiếp tục${NC}" >&2
  exit 0
else
  echo -e "${GREEN}Phase transition OK — sẵn sàng chuyển sang ${NEXT_PHASE}${NC}" >&2
  exit 0
fi
