# Traceability Guide — Verify Reference

## Traceability Framework của MCV3

### End-to-End Chain

```
[Problem Statement]
    ↓ (Business Rule)
[BR-{DOM}-NNN] — Business Rule
    ↓ (implements)
[US-{MOD}-NNN] — User Story
    ↓ (breaks down into)
[FT-{MOD}-NNN] — Feature
    ↓ (verified by)
[AC-{MOD}-NNN-XX] — Acceptance Criteria
    ↙              ↘
[API-{SYS}-NNN]  [TBL-{SYS}-NNN]  — Technical Design
    ↓                    ↓
[src code files]  [migrations]     — Implementation
    ↓
[TC-{MOD}-NNN] — Test Case
    ↓
[UAT-{MOD}-NNN] — User Acceptance
```

### Traceability Thước đo

| Level | Từ | Đến | Coverage target |
|-------|-----|-----|----------------|
| Req → Design | FT-ID | API-ID hoặc TBL-ID | 100% |
| Design → Code | API-ID | Handler method | 100% |
| Req → Test | AC-ID | TC-ID | 100% |
| Test → Code | TC-ID | Test stub | 100% |
| Code → Req | Source file | REQ-ID comment | 100% |

---

## Verify Checklist per Document Type

### URS Verification Checklist

```
✅ File tồn tại trong {SYSTEM}/P1-REQUIREMENTS/
✅ Header có: Phase, System, Module, Created date
✅ Có DEPENDENCY MAP section
✅ Có ít nhất 1 User Story (US-{MOD}-NNN)
✅ Mỗi US có ít nhất 1 Functional Requirement (FT-{MOD}-NNN)
✅ Mỗi FT có ít nhất 1 Acceptance Criteria (AC-{MOD}-NNN-XX)
✅ Có NFR section (dù là "N/A")
✅ ID format đúng: US-[A-Z]+-[0-9]+, FT-[A-Z]+-[0-9]+
✅ BR-IDs tham chiếu tồn tại trong BIZ-POLICY
```

### MODSPEC Verification Checklist

```
✅ File tồn tại trong {SYSTEM}/P2-DESIGN/
✅ Mỗi FT-ID trong URS có entry trong MODSPEC
✅ Mỗi API-{SYS}-NNN có: Method, Path, Auth, Request, Response, Error codes
✅ Mỗi TBL-{SYS}-NNN có: Columns, FK, Indexes, Constraints
✅ Mỗi COMP-{SYS}-NNN có: Responsibilities, Interface
✅ API paths không trùng nhau
✅ API-ID → FT-ID link tồn tại
✅ Có ít nhất 1 ADR cho major decision
```

### TEST Verification Checklist

```
✅ File tồn tại trong {SYSTEM}/P3-QA-DOCS/
✅ Coverage Matrix đầy đủ (AC → TC mapping)
✅ Mỗi AC-ID có ít nhất 1 TC-ID
✅ Mỗi TC có: Preconditions, Steps, Pass criteria
✅ Có cả Happy path và Error case tests
✅ Có API test cases cho mỗi API-ID
✅ Có UAT scenarios (ít nhất 1 per US)
✅ TC IDs format đúng: TC-[A-Z]+-[0-9]+
```

### Code Verification Checklist

```
✅ Thư mục src/{sys}/{mod}/ tồn tại
✅ Mọi .ts/.py files có REQ-ID header comment
✅ Mỗi API-ID có route handler tương ứng
✅ Mỗi TBL-ID có migration file tương ứng
✅ Có đủ layers (controller/service/repository hoặc tương đương)
✅ TypeScript compile không có errors (tsc --noEmit)
✅ Test stubs tồn tại cho mỗi module
```

---

## Cách xử lý Gaps

### Critical Gap (phải fix)

```
Kịch bản: FT-INV-001 trong URS nhưng không có trong MODSPEC

Cách xử lý:
1. Báo user: "FT-INV-001 chưa được thiết kế trong MODSPEC"
2. Hỏi: "Cần bổ sung vào MODSPEC hay xóa khỏi URS?"
3. Nếu bổ sung MODSPEC → chạy /mcv3:tech-design bổ sung
4. Nếu xóa URS → cập nhật URS + verify lại
```

### Warning Gap (nên fix)

```
Kịch bản: TC-INV-010 không link về AC nào

Cách xử lý:
1. Báo user: "TC-INV-010 thiếu [VERIFIED-BY] link"
2. Tìm AC phù hợp nhất → đề xuất link
3. Cập nhật TEST-INV.md
```

### False Positive (không phải gap)

```
Kịch bản: INT-ERP-WEB-001 không có code tương ứng trực tiếp

Lý do không phải gap: Integration points thường là contracts,
implement qua API calls, không phải local code.

Cách xử lý: Document lý do skip, không flag là gap.
```

---

## Traceability Reporting Format

### Summary Dashboard

```
📊 Traceability Summary — {PROJECT} — {DATE}

FT Coverage:     [████████████░░] 87% (13/15 FTs)
AC → TC:         [████████████████] 100% (24/24 ACs)
API → Code:      [█████████████░░] 90% (9/10 APIs)
Code → REQ-ID:   [████████████░░░] 80% (12/15 files)

🔴 Critical: 2 gaps cần fix
🟡 Warning: 3 issues cần review
🟢 OK: 24/29 items fully traced
```

### Impact Analysis

Khi tìm thấy gap, báo cáo impact:

```
Gap: FT-INV-003 không có implementation

Impact Analysis:
- US-INV-002 (User Story): AFFECTED — feature chưa hoàn thành
- TC-INV-005, TC-INV-006: AFFECTED — sẽ fail
- Sprint 2 Demo: RISK — core feature missing

Recommended action: Implement FT-INV-003 trước demo
Estimated effort: ~4h (từ MODSPEC có sẵn)
```

---

## Automated Verification Scripts

### Script: Scan REQ-IDs trong code

```bash
#!/bin/bash
# Scan tất cả source files và extract REQ-IDs
# Dùng bởi /mcv3:verify Phase 4

SOURCE_DIR="${1:-src}"
OUTPUT="verify-req-id-scan.txt"

echo "# REQ-ID Scan — $(date)" > "$OUTPUT"
echo "" >> "$OUTPUT"

# Tìm files có REQ-ID comment
find "$SOURCE_DIR" -name "*.ts" -o -name "*.py" | while read file; do
  REQ_IDS=$(grep -E "@req-ids|REQ-ID:|# REQ:" "$file" | head -5)
  if [ -n "$REQ_IDS" ]; then
    echo "✅ $file" >> "$OUTPUT"
    echo "   $REQ_IDS" >> "$OUTPUT"
  else
    echo "❌ $file — MISSING REQ-ID" >> "$OUTPUT"
  fi
done

# Summary
TOTAL=$(find "$SOURCE_DIR" -name "*.ts" -o -name "*.py" | wc -l)
OK=$(grep "^✅" "$OUTPUT" | wc -l)
MISSING=$(grep "^❌" "$OUTPUT" | wc -l)

echo "" >> "$OUTPUT"
echo "Summary: $OK/$TOTAL files have REQ-IDs ($MISSING missing)" >> "$OUTPUT"
```

### Script: Validate test coverage

```bash
#!/bin/bash
# Kiểm tra mỗi AC trong URS có TC tương ứng không
# Input: URS file và TEST file

URS_FILE="$1"
TEST_FILE="$2"

# Extract AC IDs từ URS
AC_IDS=$(grep -E "AC-[A-Z]+-[0-9]+-[0-9]+" "$URS_FILE" | grep -oE "AC-[A-Z]+-[0-9]+-[0-9]+" | sort -u)

echo "AC Coverage Check:"
COVERED=0
TOTAL=0

for AC_ID in $AC_IDS; do
  TOTAL=$((TOTAL + 1))
  if grep -q "$AC_ID" "$TEST_FILE" 2>/dev/null; then
    echo "  ✅ $AC_ID — covered"
    COVERED=$((COVERED + 1))
  else
    echo "  ❌ $AC_ID — NOT covered (no TC found)"
  fi
done

echo ""
echo "Coverage: $COVERED/$TOTAL ($(( COVERED * 100 / TOTAL ))%)"
```
