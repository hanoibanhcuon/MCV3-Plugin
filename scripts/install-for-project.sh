#!/usr/bin/env bash
# install-for-project.sh — Cài đặt MCV3-Plugin support cho một project
# Usage: bash scripts/install-for-project.sh <target-project-path>
# Example: bash scripts/install-for-project.sh Z:/Working/EUREKA-2026

set -euo pipefail

# ── Paths ──────────────────────────────────────────────────────────────────────
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Chuyển Unix path (/z/Working/...) sang Windows path (Z:/Working/...) nếu cần
if [[ "$PLUGIN_ROOT" =~ ^/([a-zA-Z])/ ]]; then
  DRIVE="${BASH_REMATCH[1]^^}"
  PLUGIN_ROOT="${DRIVE}:${PLUGIN_ROOT:2}"
fi
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "❌ Thiếu đường dẫn project đích."
  echo "   Dùng: bash scripts/install-for-project.sh <target-project-path>"
  exit 1
fi

if [[ ! -d "$TARGET" ]]; then
  echo "❌ Thư mục không tồn tại: $TARGET"
  exit 1
fi

echo "🔧 Cài đặt MCV3-Plugin cho: $TARGET"
echo "   Plugin root: $PLUGIN_ROOT"
echo ""

# ── 1. Tạo .mcp.json ──────────────────────────────────────────────────────────
MCP_FILE="$TARGET/.mcp.json"
cat > "$MCP_FILE" <<EOF
{
  "mcpServers": {
    "mcv3-project-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["$PLUGIN_ROOT/mcp-servers/project-memory/dist/index.js"],
      "env": {
        "MCV3_PROJECT_ROOT": "."
      },
      "description": "MCV3 Project Memory Server — Quản lý tài liệu dự án trong .mc-data/"
    }
  }
}
EOF
echo "✅ Đã tạo .mcp.json"

# ── 2. Tạo .claude/commands/mcv3/ ─────────────────────────────────────────────
COMMANDS_DIR="$TARGET/.claude/commands/mcv3"
mkdir -p "$COMMANDS_DIR"

generate_command() {
  local skill_name="$1"
  local description="$2"
  local output="$COMMANDS_DIR/${skill_name}.md"

  cat > "$output" <<EOF
$description

Đọc file \`$PLUGIN_ROOT/skills/${skill_name}/SKILL.md\` và thực thi các hướng dẫn trong đó.

\$ARGUMENTS
EOF
}

generate_command "assess"         "Đánh giá dự án đang phát triển dở — scan codebase, phân tích gaps, tạo remediation plan. Trigger khi user có dự án cũ, code + docs không đồng bộ, muốn tiếp tục phát triển dự án dang dở."
generate_command "biz-docs"       "Tạo bộ tài liệu nghiệp vụ Phase 3 — BIZ-POLICY (Business Rules với BR-IDs), PROCESS (AS-IS/TO-BE flows), DATA-DICTIONARY (thuật ngữ, entities). Trigger sau Expert Panel hoặc khi cần formalize chính sách/quy trình nghiệp vụ trước khi viết requirements."
generate_command "change-manager" "Quản lý requirements changes sau Phase 5 — impact analysis tự động, safety snapshot, cập nhật documents bị ảnh hưởng, ghi CHG-xxx record vào changelog. Trigger khi stakeholder yêu cầu thay đổi business rule, phát hiện inconsistency, hoặc có regulatory changes."
generate_command "code-gen"       "Generate source code Phase 7 — sinh code thông minh từ MODSPEC và TEST specs: controllers, services, repositories, validators, migrations, tests, CI pipeline. Tự động điều chỉnh theo mức độ chi tiết specs (đầy đủ/mơ hồ/thiếu). Trigger sau QA Docs hoặc khi sẵn sàng implement."
generate_command "deploy-ops"     "Tạo Deploy Documentation Phase 8b — Deploy Plan, Go-Live Checklist (T-7 → T+7), Rollback Plan, Monitoring Setup, SLA Definitions. Trigger sau Verify (status READY/NEEDS ATTENTION) hoặc khi cần tài liệu triển khai production."
generate_command "discovery"      "Dẫn dắt user qua Phase 1 Discovery — phỏng vấn adaptive để xác định scope dự án, phân tích vấn đề, xác định hệ thống cần build, tạo PROJECT-OVERVIEW.md. Trigger khi user muốn bắt đầu dự án mới, mô tả ý tưởng phần mềm, hoặc chưa có PROJECT-OVERVIEW."
generate_command "evolve"         "Mở rộng dự án đã hoàn thành — thêm sub-feature, module mới, system mới, hoặc scale MVP → full với evolution planning và semantic versioning (EVOL-xxx record). Trigger khi cần mở rộng dự án production mà không làm vỡ pipeline hiện có."
generate_command "expert-panel"   "Orchestrate Phase 2 Expert Panel — triệu tập 3 agent chuyên gia (Strategy, Finance, Domain) phân tích song song, tổng hợp consensus và disagreements, tạo EXPERT-LOG.md. Trigger sau Discovery hoặc khi cần deep analysis trước khi viết tài liệu nghiệp vụ."
generate_command "migrate"        "Import tài liệu cũ vào MCV3 format — chuyển đổi từ Word/Confluence/Notion/code/email thành chuẩn MCV3 với gap analysis và MIGRATION-REPORT. Trigger khi bàn giao dự án có tài liệu legacy, cần reverse engineer từ codebase, hoặc consolidate nhiều nguồn thông tin."
generate_command "onboard"        "Tutorial tùy chỉnh cho user mới — hướng dẫn theo role (Developer, PM/BA, Business Owner) với demo workflow và cheat sheet. Trigger khi lần đầu dùng MCV3, không biết bắt đầu từ đâu, hoặc muốn giới thiệu MCV3 cho team member mới."
generate_command "qa-docs"        "Tạo tài liệu QA Phase 6 — sinh Test Cases (TC-IDs), UAT scenarios từ MODSPEC + URS Acceptance Criteria, cập nhật USER-GUIDE và ADMIN-GUIDE. Trigger sau Tech Design hoặc khi cần tài liệu kiểm thử chính thức và hướng dẫn sử dụng cho end users."
generate_command "requirements"   "Chuyển Business Docs thành URS Phase 4 — viết User Stories (US), Functional Requirements (FT), Acceptance Criteria (AC), NFR, Use Cases cho từng module. Trigger sau Biz-Docs hoặc khi cần formal requirements với testable AC làm căn cứ cho QA và code-gen."
generate_command "tech-design"    "Thiết kế kỹ thuật Phase 5 — tạo MODSPEC all-in-one với API specs (API-IDs), Database schema (TBL-IDs), Component design, ADRs từ URS. Trigger sau Requirements hoặc khi cần API contract, ERD, kiến trúc chi tiết cho từng module (Web/Mobile/Embedded)."
generate_command "verify"         "Cross-verify traceability Phase 8a — kiểm tra end-to-end PROB→BR→US→FT→API→Code→TC, tạo Verification Report và Traceability Matrix. Trigger sau Code-Gen hoặc khi cần audit toàn bộ pipeline trước khi deploy. Hỗ trợ partial verify (1 system/module)."

# status command dùng navigator skill
cat > "$COMMANDS_DIR/status.md" <<EOF
Hiển thị dashboard tiến độ dự án MCV3 — phase hiện tại, documents đã có, gaps còn thiếu, bước tiếp theo được đề xuất. Trigger khi bắt đầu session mới, muốn xem tổng quan project, hoặc không biết nên chạy skill nào tiếp theo.

Đọc file \`$PLUGIN_ROOT/skills/navigator/SKILL.md\` và thực thi các hướng dẫn trong đó.

\$ARGUMENTS
EOF

echo "✅ Đã tạo 15 commands trong .claude/commands/mcv3/"

# ── 3. Tạo .claude/CLAUDE.md ──────────────────────────────────────────────────
CLAUDE_DIR="$TARGET/.claude"
CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"
mkdir -p "$CLAUDE_DIR"

if [[ -f "$CLAUDE_MD" ]] && grep -q "mcv3-devkit\|MCV3-Plugin" "$CLAUDE_MD" 2>/dev/null; then
  echo "✅ .claude/CLAUDE.md đã có MCV3 reference — giữ nguyên"
else
  MCV3_BLOCK="
---

## MCV3-Plugin v3.12.0

Plugin MasterCraft DevKit đã cài đặt tại \`$PLUGIN_ROOT/\`.

### Quy tắc bắt buộc

1. **Bắt đầu session mới**: Gọi \`mc_status()\` để xem project context
2. **Lưu tài liệu**: Dùng \`mc_save\` — KHÔNG ghi \`.mc-data/\` trực tiếp
3. **Ngôn ngữ**: Documentation và comments bằng tiếng Việt
4. **Scale-aware**: Không cần full 8 phases cho mọi dự án (Micro chỉ cần 3 phases)
5. **Auto-Mode**: Skills tự chạy hoàn toàn — KHÔNG hỏi \"confirm không?\", KHÔNG dừng giữa chừng

### MCP Tools (19 tools — mcv3-project-memory)

\`\`\`
mc_init_project   mc_save        mc_load        mc_list        mc_status
mc_checkpoint     mc_resume      mc_validate    mc_export      mc_search
mc_snapshot       mc_rollback    mc_impact_analysis            mc_traceability
mc_dependency     mc_compare     mc_merge       mc_changelog   mc_summary
\`\`\`

### Pipeline 8 Phase

| Lệnh | Phase | Output |
|------|-------|--------|
| \`/mcv3:discovery\` | 1 | PROJECT-OVERVIEW.md |
| \`/mcv3:expert-panel\` | 2 | EXPERT-LOG.md |
| \`/mcv3:biz-docs\` | 3 | BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| \`/mcv3:requirements\` | 4 | URS-{MOD}.md |
| \`/mcv3:tech-design\` | 5 | MODSPEC-{MOD}.md |
| \`/mcv3:qa-docs\` | 6 | TEST-{MOD}.md, USER-GUIDE, ADMIN-GUIDE |
| \`/mcv3:code-gen\` | 7 | Source code + Verification Loop |
| \`/mcv3:verify\` | 8a | Traceability matrix + report |
| \`/mcv3:deploy-ops\` | 8b | DEPLOY-OPS.md + checklist |

### Lifecycle Skills

| Lệnh | Khi nào dùng |
|------|-------------|
| \`/mcv3:status\` | Dashboard tiến độ dự án |
| \`/mcv3:change-manager\` | Quản lý requirement changes |
| \`/mcv3:evolve\` | Thêm sub-feature / module / system mới |
| \`/mcv3:migrate\` | Import tài liệu cũ (Word/Confluence/code) vào MCV3 |
| \`/mcv3:onboard\` | Tutorial theo role (Dev / PM / Business Owner) |
| \`/mcv3:assess\` | Đánh giá dự án in-progress, tìm gaps |

### Scale Decision Matrix

\`\`\`
Micro  (< 10 endpoints, 1 dev)     → Phase 1 → 5 → 7
Small  (< 30 endpoints, 1-2 devs)  → Phase 1 → 4 → 5 → 7 → 8a
Medium (< 100 endpoints, 2-5 devs) → Phase 1-8 (Phase 3 optional)
Large  (100+ endpoints, 5+ devs)   → Full 8 phases
Enterprise (regulated)              → Full 8 phases + compliance gates
\`\`\`

### Auto-Mode Protocol

Skills chạy **hoàn toàn tự động**:
- KHÔNG hỏi \"module nào trước?\" — tự quyết theo dependency
- KHÔNG dừng chờ confirm — tự detect tech stack, tự resolve ambiguity
- \`mc_save\` TRƯỚC khi hiển thị — chỉ show tóm tắt ngắn
- Kết thúc bằng: **[1] Xem chi tiết / [2] Thay đổi / [3] Tiếp tục**

### Quick Start

\`\`\`
/mcv3:discovery   (dự án mới)
/mcv3:assess      (dự án đang chạy)
/mcv3:status      (xem tiến độ)
\`\`\`

Tài liệu đầy đủ: \`$PLUGIN_ROOT/CLAUDE.md\`"

  if [[ -f "$CLAUDE_MD" ]]; then
    echo "$MCV3_BLOCK" >> "$CLAUDE_MD"
    echo "✅ Đã append MCV3 instructions vào .claude/CLAUDE.md"
  else
    echo "# CLAUDE.md — MCV3 Configuration$MCV3_BLOCK" > "$CLAUDE_MD"
    echo "✅ Đã tạo .claude/CLAUDE.md với MCV3 instructions"
  fi
fi

# ── 4. Cấu hình .claude/settings.json (hooks) ──────────────────────────────────
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

if [[ -f "$SETTINGS_FILE" ]] && grep -q "auto-checkpoint" "$SETTINGS_FILE" 2>/dev/null; then
  echo "✅ .claude/settings.json đã có auto-checkpoint hook — giữ nguyên"
else
  # Dùng node để merge JSON an toàn (giữ nội dung cũ nếu có)
  HOOK_CMD="bash $PLUGIN_ROOT/scripts/auto-checkpoint.sh"
  node - "$SETTINGS_FILE" "$HOOK_CMD" <<'NODEJS'
const fs = require('fs');
const settingsFile = process.argv[2];
const hookCmd = process.argv[3];
let json = {};
try { json = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch(e) {}
if (!json.hooks) json.hooks = {};
if (!json.hooks.Stop) json.hooks.Stop = [];
const hasHook = json.hooks.Stop.some(
  h => h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('auto-checkpoint'))
);
if (!hasHook) {
  json.hooks.Stop.push({
    "matcher": "",
    "hooks": [{ "type": "command", "command": hookCmd }]
  });
}
fs.writeFileSync(settingsFile, JSON.stringify(json, null, 2) + '\n');
NODEJS
  echo "✅ Đã cấu hình auto-checkpoint hook trong .claude/settings.json"
fi

# ── 5. Kiểm tra MCP server ─────────────────────────────────────────────────────
if [[ ! -f "$PLUGIN_ROOT/mcp-servers/project-memory/dist/index.js" ]]; then
  echo ""
  echo "⚠️  MCP server chưa được build!"
  echo "   Chạy: cd $PLUGIN_ROOT/mcp-servers/project-memory && npm install && npm run build"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "✅ Hoàn tất! Khởi động lại VS Code để kích hoạt."
echo ""
echo "Đã tạo:"
echo "  $TARGET/.mcp.json"
echo "  $TARGET/.claude/commands/mcv3/  (15 slash commands)"
echo "  $TARGET/.claude/CLAUDE.md"
echo "  $TARGET/.claude/settings.json   (auto-checkpoint hook)"
echo ""
echo "Tiếp theo trong VS Code:"
echo "  /mcv3:status    — xem trạng thái project"
echo "  /mcv3:assess    — đánh giá dự án hiện tại"
