#!/bin/bash
# generate-traceability-report.sh — Sinh báo cáo traceability end-to-end
# MCV3 Script — Sprint 3
#
# Scan toàn bộ project và tạo traceability report:
#   FT-IDs → API-IDs → TBL-IDs → Code files → TC-IDs
#
# Usage:
#   ./scripts/generate-traceability-report.sh <project_slug> [output_file]
#   ./scripts/generate-traceability-report.sh my-project
#   ./scripts/generate-traceability-report.sh my-project report.md

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────
MC_DATA_DIR="${MC_DATA_DIR:-.mc-data}"
PROJECT_SLUG="${1:-}"
OUTPUT_FILE="${2:-}"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Helpers ───────────────────────────────────────────────────────────────
log_info() { echo -e "${BLUE}[INFO]${NC}  $*" >&2; }
log_ok()   { echo -e "${GREEN}[OK]${NC}    $*" >&2; }
log_warn() { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }

# ─── Validation ────────────────────────────────────────────────────────────
if [ -z "$PROJECT_SLUG" ]; then
  echo "Usage: $0 <project_slug> [output_file]" >&2
  exit 1
fi

PROJECT_DIR="$MC_DATA_DIR/projects/$PROJECT_SLUG"
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project không tồn tại: $PROJECT_DIR" >&2
  exit 1
fi

# ─── Output setup ──────────────────────────────────────────────────────────
if [ -n "$OUTPUT_FILE" ]; then
  exec > "$OUTPUT_FILE"
fi

# ─── Main Report Generation ────────────────────────────────────────────────
cat << EOF
# TRACEABILITY REPORT — $PROJECT_SLUG
**Ngày tạo:** $DATE
**Tool:** generate-traceability-report.sh (MCV3 Sprint 3)

---

## 1. EXECUTIVE SUMMARY

EOF

# Đếm totals
TOTAL_FT=0
TOTAL_AC=0
TOTAL_TC=0
TOTAL_API=0
TOTAL_TBL=0

# Scan URS files cho FT và AC
for URS_FILE in "$PROJECT_DIR"/*/*/URS-*.md 2>/dev/null; do
  [ -f "$URS_FILE" ] || continue
  FT_COUNT=$(grep -oE "FT-[A-Z]+-[0-9]+" "$URS_FILE" 2>/dev/null | sort -u | wc -l || echo 0)
  AC_COUNT=$(grep -oE "AC-[A-Z]+-[0-9]+-[0-9]+" "$URS_FILE" 2>/dev/null | sort -u | wc -l || echo 0)
  TOTAL_FT=$((TOTAL_FT + FT_COUNT))
  TOTAL_AC=$((TOTAL_AC + AC_COUNT))
done

# Scan TEST files cho TC
for TEST_FILE in "$PROJECT_DIR"/*/*/TEST-*.md 2>/dev/null; do
  [ -f "$TEST_FILE" ] || continue
  TC_COUNT=$(grep -oE "TC-[A-Z]+-[0-9]+" "$TEST_FILE" 2>/dev/null | sort -u | wc -l || echo 0)
  TOTAL_TC=$((TOTAL_TC + TC_COUNT))
done

# Scan MODSPEC files cho API và TBL
for MODSPEC_FILE in "$PROJECT_DIR"/*/*/MODSPEC-*.md 2>/dev/null; do
  [ -f "$MODSPEC_FILE" ] || continue
  API_COUNT=$(grep -oE "API-[A-Z]+-[0-9]+" "$MODSPEC_FILE" 2>/dev/null | sort -u | wc -l || echo 0)
  TBL_COUNT=$(grep -oE "TBL-[A-Z]+-[0-9]+" "$MODSPEC_FILE" 2>/dev/null | sort -u | wc -l || echo 0)
  TOTAL_API=$((TOTAL_API + API_COUNT))
  TOTAL_TBL=$((TOTAL_TBL + TBL_COUNT))
done

cat << EOF
| Metric | Count |
|--------|-------|
| Features (FT-IDs) | $TOTAL_FT |
| Acceptance Criteria (AC-IDs) | $TOTAL_AC |
| Test Cases (TC-IDs) | $TOTAL_TC |
| API Endpoints (API-IDs) | $TOTAL_API |
| Database Tables (TBL-IDs) | $TOTAL_TBL |

EOF

# ─── Section 2: FT Coverage ──────────────────────────────────────────────
cat << EOF
---

## 2. FEATURE COVERAGE (FT → API/TBL)

EOF

for SYS_DIR in "$PROJECT_DIR"/*/; do
  SYS=$(basename "$SYS_DIR")
  case "$SYS" in
    _PROJECT|_VERIFY-CROSS|_SHARED-SERVICES|_mcv3-work|_config*) continue ;;
  esac

  P1_DIR="$SYS_DIR/P1-REQUIREMENTS"
  P2_DIR="$SYS_DIR/P2-DESIGN"

  [ -d "$P1_DIR" ] || continue

  echo "### System: $SYS"
  echo ""
  echo "| FT-ID | Feature Name | Has API? | Has TBL? | Has TC? | Status |"
  echo "|-------|-------------|---------|---------|--------|--------|"

  for URS_FILE in "$P1_DIR"/URS-*.md; do
    [ -f "$URS_FILE" ] || continue
    MOD=$(basename "$URS_FILE" .md | sed 's/URS-//')

    MODSPEC_FILE="$P2_DIR/MODSPEC-$MOD.md"
    TEST_FILE="$SYS_DIR/P3-QA-DOCS/TEST-$MOD.md"

    # Extract FT IDs từ URS
    FT_IDS=$(grep -oE "FT-$MOD-[0-9]+" "$URS_FILE" 2>/dev/null | sort -u || true)

    for FT_ID in $FT_IDS; do
      # Check API coverage
      HAS_API="❌"
      if [ -f "$MODSPEC_FILE" ] && grep -q "$FT_ID" "$MODSPEC_FILE" 2>/dev/null; then
        API_REFS=$(grep -oE "API-[A-Z]+-[0-9]+" "$MODSPEC_FILE" 2>/dev/null | head -1 || echo "")
        if [ -n "$API_REFS" ]; then
          HAS_API="✅"
        fi
      fi

      # Check TBL coverage
      HAS_TBL="❌"
      if [ -f "$MODSPEC_FILE" ] && grep -q "TBL-" "$MODSPEC_FILE" 2>/dev/null; then
        HAS_TBL="✅"
      fi

      # Check TC coverage
      HAS_TC="❌"
      if [ -f "$TEST_FILE" ] && grep -q "$FT_ID" "$TEST_FILE" 2>/dev/null; then
        HAS_TC="✅"
      fi

      # Determine status
      if [ "$HAS_API" = "✅" ] && [ "$HAS_TC" = "✅" ]; then
        STATUS="✅ FULL"
      elif [ "$HAS_API" = "✅" ] || [ "$HAS_TC" = "✅" ]; then
        STATUS="⚠️ PARTIAL"
      else
        STATUS="❌ MISSING"
      fi

      echo "| $FT_ID | — | $HAS_API | $HAS_TBL | $HAS_TC | $STATUS |"
    done
  done
  echo ""
done

# ─── Section 3: AC → TC Matrix ──────────────────────────────────────────
cat << EOF
---

## 3. AC → TC COVERAGE MATRIX

EOF

for SYS_DIR in "$PROJECT_DIR"/*/; do
  SYS=$(basename "$SYS_DIR")
  case "$SYS" in
    _PROJECT|_VERIFY-CROSS|_SHARED-SERVICES|_mcv3-work|_config*) continue ;;
  esac

  P1_DIR="$SYS_DIR/P1-REQUIREMENTS"
  [ -d "$P1_DIR" ] || continue

  for URS_FILE in "$P1_DIR"/URS-*.md; do
    [ -f "$URS_FILE" ] || continue
    MOD=$(basename "$URS_FILE" .md | sed 's/URS-//')
    TEST_FILE="$SYS_DIR/P3-QA-DOCS/TEST-$MOD.md"

    echo "### $SYS / $MOD"
    echo ""

    AC_IDS=$(grep -oE "AC-[A-Z]+-[0-9]+-[0-9]+" "$URS_FILE" 2>/dev/null | sort -u || true)

    if [ -z "$AC_IDS" ]; then
      echo "_Không tìm thấy AC IDs_"
      echo ""
      continue
    fi

    COVERED=0
    TOTAL=0
    echo "| AC-ID | Covered by TC | Status |"
    echo "|-------|--------------|--------|"

    for AC_ID in $AC_IDS; do
      TOTAL=$((TOTAL + 1))
      TC_REF="—"
      STATUS="❌"

      if [ -f "$TEST_FILE" ] && grep -q "$AC_ID" "$TEST_FILE" 2>/dev/null; then
        TC_REF=$(grep -oE "TC-[A-Z]+-[0-9]+" "$TEST_FILE" 2>/dev/null | head -3 | tr '\n' ', ' | sed 's/,$//')
        STATUS="✅"
        COVERED=$((COVERED + 1))
      fi

      echo "| $AC_ID | $TC_REF | $STATUS |"
    done

    PCT=0
    if [ "$TOTAL" -gt 0 ]; then
      PCT=$((COVERED * 100 / TOTAL))
    fi
    echo ""
    echo "**Coverage: $COVERED/$TOTAL ($PCT%)**"
    echo ""
  done
done

# ─── Section 4: Code REQ-ID Scan ─────────────────────────────────────────
cat << EOF
---

## 4. CODE REQ-ID COVERAGE

EOF

SRC_DIR="src"
if [ -d "$SRC_DIR" ]; then
  echo "| File | REQ-IDs | Status |"
  echo "|------|---------|--------|"

  HAS_REQID=0
  MISSING_REQID=0

  while IFS= read -r -d '' FILE; do
    REQ_IDS=$(grep -oE "(REQ-ID:|@req-ids|# REQ:)[^\n]+" "$FILE" 2>/dev/null | head -1 || echo "")
    if [ -n "$REQ_IDS" ]; then
      echo "| \`$FILE\` | $REQ_IDS | ✅ |"
      HAS_REQID=$((HAS_REQID + 1))
    else
      echo "| \`$FILE\` | — | ❌ MISSING |"
      MISSING_REQID=$((MISSING_REQID + 1))
    fi
  done < <(find "$SRC_DIR" -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.go" -print0 2>/dev/null)

  TOTAL_CODE=$((HAS_REQID + MISSING_REQID))
  echo ""
  if [ "$TOTAL_CODE" -gt 0 ]; then
    PCT=$((HAS_REQID * 100 / TOTAL_CODE))
    echo "**Code REQ-ID Coverage: $HAS_REQID/$TOTAL_CODE ($PCT%)**"
  fi
else
  echo "_Thư mục src/ chưa tồn tại — Phase 7 Code Gen chưa chạy_"
fi

# ─── Section 5: Gaps Summary ─────────────────────────────────────────────
cat << EOF

---

## 5. GAPS & RECOMMENDATIONS

EOF

echo "### Gaps cần xử lý trước deploy"
echo ""
echo "_Chạy /mcv3:verify để có danh sách gaps chi tiết và chính xác hơn._"
echo ""

# ─── Footer ───────────────────────────────────────────────────────────────
cat << EOF
---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tech Lead | ___________ | ___________ | ⏳ Pending |
| QA Lead | ___________ | ___________ | ⏳ Pending |
| Product Owner | ___________ | ___________ | ⏳ Pending |

---
_Generated by MCV3 generate-traceability-report.sh — $DATE
EOF

log_info "Report generated successfully" >&2
