#!/bin/bash
# validate-test-coverage.sh — Kiểm tra test coverage cho Phase 6 QA-Docs
# MCV3 Script — Sprint 3
#
# Usage:
#   ./scripts/validate-test-coverage.sh <project_slug> [system_code] [module_code]
#   ./scripts/validate-test-coverage.sh my-project ERP INV
#   ./scripts/validate-test-coverage.sh my-project         # Check toàn bộ project

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────
MC_DATA_DIR="${MC_DATA_DIR:-.mc-data}"
PROJECT_SLUG="${1:-}"
SYSTEM_CODE="${2:-}"
MODULE_CODE="${3:-}"
MIN_AC_COVERAGE=100   # Phần trăm AC phải có TC

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── Helpers ───────────────────────────────────────────────────────────────
log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }

check_project() {
  if [ -z "$PROJECT_SLUG" ]; then
    log_error "Cần truyền project_slug"
    echo "Usage: $0 <project_slug> [system_code] [module_code]"
    exit 1
  fi

  PROJECT_DIR="$MC_DATA_DIR/projects/$PROJECT_SLUG"
  if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project không tồn tại: $PROJECT_DIR"
    exit 1
  fi
}

# ─── Check Test Coverage cho 1 module ─────────────────────────────────────
check_module_coverage() {
  local SYS="$1"
  local MOD="$2"
  local URS_FILE="$PROJECT_DIR/$SYS/P1-REQUIREMENTS/URS-$MOD.md"
  local TEST_FILE="$PROJECT_DIR/$SYS/P3-QA-DOCS/TEST-$MOD.md"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Module: $SYS/$MOD"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  local ISSUES=0

  # Kiểm tra TEST file tồn tại
  if [ ! -f "$TEST_FILE" ]; then
    log_error "Chưa có TEST-$MOD.md trong $SYS/P3-QA-DOCS/"
    log_warn "Hãy chạy /mcv3:qa-docs để tạo test documentation"
    ISSUES=$((ISSUES + 1))
    return $ISSUES
  fi
  log_ok "TEST-$MOD.md tồn tại"

  # Kiểm tra URS file tồn tại (để so sánh AC coverage)
  if [ ! -f "$URS_FILE" ]; then
    log_warn "URS-$MOD.md không tồn tại — không thể check AC coverage"
  else
    # Extract AC IDs từ URS
    AC_IDS=$(grep -oE "AC-[A-Z]+-[0-9]+-[0-9]+" "$URS_FILE" 2>/dev/null | sort -u || true)
    TOTAL_AC=$(echo "$AC_IDS" | grep -c "AC-" 2>/dev/null || echo "0")

    # Check mỗi AC có TC trong TEST file không
    COVERED_AC=0
    UNCOVERED_ACS=()

    if [ "$TOTAL_AC" -gt 0 ]; then
      for AC_ID in $AC_IDS; do
        if grep -q "$AC_ID" "$TEST_FILE" 2>/dev/null; then
          COVERED_AC=$((COVERED_AC + 1))
        else
          UNCOVERED_ACS+=("$AC_ID")
        fi
      done

      COVERAGE_PCT=0
      if [ "$TOTAL_AC" -gt 0 ]; then
        COVERAGE_PCT=$(( COVERED_AC * 100 / TOTAL_AC ))
      fi

      if [ "$COVERAGE_PCT" -ge "$MIN_AC_COVERAGE" ]; then
        log_ok "AC Coverage: $COVERED_AC/$TOTAL_AC ($COVERAGE_PCT%)"
      else
        log_error "AC Coverage thấp: $COVERED_AC/$TOTAL_AC ($COVERAGE_PCT%) — cần $MIN_AC_COVERAGE%"
        for AC in "${UNCOVERED_ACS[@]}"; do
          log_warn "  Chưa có TC cho: $AC"
        done
        ISSUES=$((ISSUES + 1))
      fi
    else
      log_warn "Không tìm thấy AC IDs trong URS-$MOD.md"
    fi
  fi

  # Count TCs trong TEST file
  TC_COUNT=$(grep -oE "TC-[A-Z]+-[0-9]+" "$TEST_FILE" 2>/dev/null | sort -u | wc -l || echo "0")
  log_info "Test Cases found: $TC_COUNT"

  # Count UAT scenarios
  UAT_COUNT=$(grep -oE "UAT-[A-Z]+-[0-9]+" "$TEST_FILE" 2>/dev/null | sort -u | wc -l || echo "0")
  if [ "$UAT_COUNT" -gt 0 ]; then
    log_ok "UAT Scenarios: $UAT_COUNT"
  else
    log_warn "Không có UAT scenarios trong TEST-$MOD.md"
  fi

  # Kiểm tra TC có đủ cấu trúc không (sampling)
  if ! grep -q "Pass criteria" "$TEST_FILE" 2>/dev/null; then
    log_warn "TEST-$MOD.md thiếu 'Pass criteria' trong test cases"
  fi

  return $ISSUES
}

# ─── Main Logic ────────────────────────────────────────────────────────────
main() {
  check_project

  echo ""
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  MCV3 Test Coverage Validator — Sprint 3         ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo "  Project: $PROJECT_SLUG"
  echo "  AC Coverage threshold: $MIN_AC_COVERAGE%"
  echo ""

  TOTAL_ISSUES=0

  if [ -n "$SYSTEM_CODE" ] && [ -n "$MODULE_CODE" ]; then
    # Check một module cụ thể
    check_module_coverage "$SYSTEM_CODE" "$MODULE_CODE" || TOTAL_ISSUES=$((TOTAL_ISSUES + $?))
  elif [ -n "$SYSTEM_CODE" ]; then
    # Check tất cả modules trong một system
    P3_DIR="$PROJECT_DIR/$SYSTEM_CODE/P3-QA-DOCS"
    if [ -d "$P3_DIR" ]; then
      for TEST_FILE in "$P3_DIR"/TEST-*.md; do
        if [ -f "$TEST_FILE" ]; then
          MOD=$(basename "$TEST_FILE" .md | sed 's/TEST-//')
          check_module_coverage "$SYSTEM_CODE" "$MOD" || TOTAL_ISSUES=$((TOTAL_ISSUES + $?))
        fi
      done
    else
      log_warn "Chưa có P3-QA-DOCS trong $SYSTEM_CODE"
    fi
  else
    # Check toàn bộ project
    for SYS_DIR in "$PROJECT_DIR"/*/; do
      SYS=$(basename "$SYS_DIR")
      # Skip special folders
      case "$SYS" in
        _PROJECT|_VERIFY-CROSS|_SHARED-SERVICES|_mcv3-work|_config*) continue ;;
      esac

      P3_DIR="$SYS_DIR/P3-QA-DOCS"
      if [ -d "$P3_DIR" ]; then
        for TEST_FILE in "$P3_DIR"/TEST-*.md; do
          if [ -f "$TEST_FILE" ]; then
            MOD=$(basename "$TEST_FILE" .md | sed 's/TEST-//')
            check_module_coverage "$SYS" "$MOD" || TOTAL_ISSUES=$((TOTAL_ISSUES + $?))
          fi
        done
      fi
    done
  fi

  # Summary
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  SUMMARY"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ "$TOTAL_ISSUES" -eq 0 ]; then
    log_ok "Tất cả test coverage checks PASS"
    echo ""
    exit 0
  else
    log_error "$TOTAL_ISSUES issue(s) cần fix trước khi tiếp tục"
    echo ""
    echo "  Hint: Chạy /mcv3:qa-docs để tạo/cập nhật test documentation"
    echo ""
    exit 1
  fi
}

main
