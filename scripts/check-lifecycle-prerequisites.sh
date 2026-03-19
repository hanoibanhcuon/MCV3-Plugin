#!/bin/bash
# check-lifecycle-prerequisites.sh — Kiểm tra prerequisites cho Lifecycle Skills
#
# Được gọi bởi hooks: PreChangeManager, PreEvolve, PreMigrate.
# Kiểm tra project đã ở đúng trạng thái cho lifecycle skill được yêu cầu.
#
# Cách dùng: ./scripts/check-lifecycle-prerequisites.sh <skill>
#   skill: change-manager | evolve | migrate | onboard
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT, MCV3_PROJECT_SLUG

set -euo pipefail

SKILL="${1:-}"
PROJECT_ROOT="${MCV3_PROJECT_ROOT:-.}"
PROJECT_SLUG="${MCV3_PROJECT_SLUG:-}"

if [ -z "$SKILL" ]; then
  echo "Cách dùng: $0 <skill>" >&2
  echo "  skill: change-manager | evolve | migrate | onboard" >&2
  exit 1
fi

if [ -z "$PROJECT_SLUG" ]; then
  echo "ℹ️  Bỏ qua prerequisites check: thiếu MCV3_PROJECT_SLUG" >&2
  exit 0
fi

PROJECT_DIR="${PROJECT_ROOT}/.mc-data/projects/${PROJECT_SLUG}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ Project '${PROJECT_SLUG}' chưa được khởi tạo." >&2
  echo "   → Chạy mc_init_project trước" >&2
  exit 1
fi

echo "🔍 Kiểm tra prerequisites cho /${SKILL}..." >&2

ERRORS=0
WARNINGS=0

# ================================================================
# CHECK THEO TỪNG SKILL
# ================================================================

case "$SKILL" in

  "change-manager")
    # Cần: Ít nhất Phase 4 (có URS) với BR-IDs hoặc BIZ-POLICY

    CONFIG_FILE="${PROJECT_DIR}/_config.json"
    if [ ! -f "$CONFIG_FILE" ]; then
      echo "❌ Thiếu _config.json — project chưa khởi tạo đúng" >&2
      ERRORS=$((ERRORS + 1))
    fi

    # Kiểm tra có URS không
    URS_COUNT=$(find "${PROJECT_DIR}" -name "URS-*.md" -path "*/P1-REQUIREMENTS/*" 2>/dev/null | wc -l)
    if [ "$URS_COUNT" -lt 1 ]; then
      echo "⚠️  Chưa có URS files — Change Manager hoạt động tốt hơn với Phase 4+ complete" >&2
      WARNINGS=$((WARNINGS + 1))
    else
      echo "✅ Tìm thấy ${URS_COUNT} URS file(s)" >&2
    fi

    # Kiểm tra có BIZ-POLICY không
    POLICY_COUNT=$(find "${PROJECT_DIR}" -name "BIZ-POLICY-*.md" 2>/dev/null | wc -l)
    if [ "$POLICY_COUNT" -lt 1 ]; then
      echo "ℹ️  Chưa có BIZ-POLICY files (không bắt buộc)" >&2
    else
      echo "✅ Tìm thấy ${POLICY_COUNT} BIZ-POLICY file(s)" >&2
    fi

    # Kiểm tra snapshot capability
    SNAPSHOTS_DIR="${PROJECT_DIR}/_mcv3-work/_snapshots"
    if [ ! -d "$SNAPSHOTS_DIR" ]; then
      echo "ℹ️  Thư mục snapshots chưa tồn tại — sẽ được tạo tự động" >&2
    fi
    ;;

  "evolve")
    # Cần: Phase 5+ (có MODSPEC) và MASTER-INDEX.md

    # Kiểm tra MASTER-INDEX
    MASTER_INDEX="${PROJECT_DIR}/MASTER-INDEX.md"
    if [ ! -f "$MASTER_INDEX" ]; then
      echo "⚠️  MASTER-INDEX.md chưa tồn tại — nên có trước khi evolve" >&2
      WARNINGS=$((WARNINGS + 1))
    else
      echo "✅ MASTER-INDEX.md tồn tại" >&2
    fi

    # Kiểm tra có MODSPEC không (Phase 5+)
    MODSPEC_COUNT=$(find "${PROJECT_DIR}" -name "MODSPEC-*.md" -path "*/P2-DESIGN/*" 2>/dev/null | wc -l)
    if [ "$MODSPEC_COUNT" -lt 1 ]; then
      echo "⚠️  Chưa có MODSPEC files — Evolve hoạt động tốt nhất với Phase 5+ complete" >&2
      WARNINGS=$((WARNINGS + 1))
    else
      echo "✅ Tìm thấy ${MODSPEC_COUNT} MODSPEC file(s)" >&2
    fi

    # Kiểm tra EVOLUTION-LOG (Sprint 4)
    EVOLUTION_LOG="${PROJECT_DIR}/_PROJECT/EVOLUTION-LOG.md"
    if [ ! -f "$EVOLUTION_LOG" ]; then
      echo "ℹ️  EVOLUTION-LOG.md chưa tồn tại — sẽ được tạo trong quá trình evolve" >&2
    else
      echo "✅ EVOLUTION-LOG.md tồn tại" >&2
    fi

    # Cảnh báo nếu có pending changes chưa apply
    CHANGE_LOG_DIR="${PROJECT_DIR}/_mcv3-work/change-log"
    if [ -d "$CHANGE_LOG_DIR" ]; then
      PENDING_CHANGES=$(find "$CHANGE_LOG_DIR" -name "CHG-*.md" -newer "$MASTER_INDEX" 2>/dev/null | wc -l || echo 0)
      if [ "$PENDING_CHANGES" -gt 0 ]; then
        echo "⚠️  Phát hiện ${PENDING_CHANGES} change record(s) gần đây — nên review trước khi evolve" >&2
        WARNINGS=$((WARNINGS + 1))
      fi
    fi
    ;;

  "migrate")
    # Cần: Project đã khởi tạo (lỏng hơn — migrate có thể là bước đầu tiên)

    CONFIG_FILE="${PROJECT_DIR}/_config.json"
    if [ ! -f "$CONFIG_FILE" ]; then
      echo "❌ Thiếu _config.json — chạy mc_init_project trước" >&2
      ERRORS=$((ERRORS + 1))
    else
      echo "✅ Project đã khởi tạo" >&2
    fi

    # Thư mục migration
    MIGRATION_DIR="${PROJECT_DIR}/_mcv3-work/migration"
    if [ ! -d "$MIGRATION_DIR" ]; then
      echo "ℹ️  Thư mục migration sẽ được tạo tự động" >&2
    fi

    # Kiểm tra có documents cũ nào được chỉ định không (warning nếu project đã có nhiều content)
    EXISTING_URS=$(find "${PROJECT_DIR}" -name "URS-*.md" 2>/dev/null | wc -l)
    if [ "$EXISTING_URS" -gt 0 ]; then
      echo "⚠️  Project đã có ${EXISTING_URS} URS file(s) — migrate sẽ thêm vào, không ghi đè" >&2
      WARNINGS=$((WARNINGS + 1))
    fi
    ;;

  "onboard")
    # Onboard không cần prerequisites — dùng được bất cứ lúc nào
    echo "✅ Onboard skill không cần prerequisites" >&2
    echo "ℹ️  Chạy /mcv3:onboard để bắt đầu tutorial" >&2
    ;;

  "assess")
    # Assess — dùng cho dự án in-progress, yêu cầu ít prerequisites
    # Đây thường là skill đầu tiên → không nên block

    echo "ℹ️  Assess skill: đánh giá dự án đang phát triển dở" >&2

    # Cảnh báo nếu không có codebase cũng không có docs rõ ràng
    # (nhưng không block — user có thể describe bằng lời)
    if [ ! -d "${PROJECT_ROOT}/src" ] && \
       [ ! -d "${PROJECT_ROOT}/app" ] && \
       [ ! -f "${PROJECT_ROOT}/package.json" ] && \
       [ ! -f "${PROJECT_ROOT}/requirements.txt" ] && \
       [ ! -f "${PROJECT_ROOT}/pom.xml" ] && \
       [ ! -f "${PROJECT_ROOT}/go.mod" ]; then
      echo "ℹ️  Không phát hiện codebase tiêu chuẩn trong ${PROJECT_ROOT}" >&2
      echo "   → Có thể mô tả cấu trúc bằng lời hoặc paste nội dung tài liệu" >&2
    else
      echo "✅ Phát hiện codebase/project files" >&2
    fi

    # Nếu đã có .mc-data → thông báo sẽ tạo snapshot
    if [ -d "${PROJECT_ROOT}/.mc-data" ]; then
      echo "ℹ️  Project .mc-data đã tồn tại — sẽ tạo safety snapshot trước khi assess" >&2
    else
      echo "ℹ️  Chưa có .mc-data — assess sẽ tạo mới sau khi phân tích xong" >&2
    fi
    ;;

  *)
    echo "⚠️  Skill không được nhận diện: ${SKILL}" >&2
    echo "   Skills hợp lệ: change-manager | evolve | migrate | onboard | assess" >&2
    WARNINGS=$((WARNINGS + 1))
    ;;

esac

# ================================================================
# KẾT QUẢ
# ================================================================

echo "" >&2
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ Prerequisites check FAILED: ${ERRORS} lỗi cần xử lý trước khi chạy /${SKILL}" >&2
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "⚠️  Prerequisites check: ${WARNINGS} warning(s) — có thể tiếp tục nhưng nên review" >&2
  exit 0
else
  echo "✅ Prerequisites OK — sẵn sàng chạy /${SKILL}" >&2
  exit 0
fi
