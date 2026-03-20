# Expert Panel Skill — `/mcv3:expert-panel`

## Mục đích

Orchestrate **Phase 2: Expert Analysis** — tập hợp ý kiến từ nhiều expert agents, tổng hợp consensus, và tạo `EXPERT-LOG.md`.

**Output:** `_PROJECT/EXPERT-LOG.md` với đầy đủ phân tích từ 3 góc nhìn: Strategy, Finance, Domain.

---

## DEPENDENCY MAP

```
Requires: _PROJECT/PROJECT-OVERVIEW.md (từ /mcv3:discovery)
Produces: _PROJECT/EXPERT-LOG.md
Enables:  /mcv3:biz-docs (Phase 3)
Agents:   strategy-expert, finance-expert, domain-expert, doc-writer
References:
  - skills/expert-panel/references/panel-protocol.md
  - agents/strategy-expert.md
  - agents/finance-expert.md
  - agents/domain-expert.md
  - agents/doc-writer.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — spawn 3 expert agents song song, synthesize, tạo EXPERT-LOG
2. **Tự giải quyết vấn đề** — ghi Open Issues vào EXPERT-LOG để Phase 3 giải quyết
3. **Báo cáo sau khi xong** — tổng hợp consensus + risks + open issues
4. **User review** — nếu user cung cấp thêm thông tin → tự update SESSION
5. **Gợi ý bước tiếp** — `/mcv3:biz-docs`

---

## Khi nào dùng skill này

- Sau khi `/mcv3:discovery` hoàn thành
- `_PROJECT/PROJECT-OVERVIEW.md` đã có và validated
- Muốn có deep analysis trước khi viết tài liệu nghiệp vụ

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**PROJECT-OVERVIEW.md chưa có:**
- Báo user: "Thiếu PROJECT-OVERVIEW.md → Chạy /mcv3:discovery trước để tạo."

**Agent không spawn được (subagent bị lỗi hoặc timeout):**
- Đóng vai expert đó trực tiếp thay vì spawn agent riêng
- Báo user: "Agent [strategy-expert / finance-expert / domain-expert] không spawn được — tôi sẽ đóng vai expert đó."
- Tiếp tục với available experts, không bỏ qua phân tích
- Sau khi hoàn thành, ghi rõ trong EXPERT-LOG: "Note: [Expert X] analysis được thực hiện trực tiếp do agent spawn failed."

**Timeout chờ agent:**
- Nếu agent chạy quá lâu (>2 phút không có kết quả) → tiếp tục với các agents khác, đặt placeholder cho agent đó
- Sau khi agents khác xong → retry agent bị timeout 1 lần

---

## Phase 0 — Pre-Gate

```
KIỂM TRA TRƯỚC KHI BẮT ĐẦU:
1. mc_status() → xác nhận project slug
2. mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 0 })
   → Nếu không có → "Cần chạy /mcv3:discovery trước"
   → Nếu có → tiếp tục
3. Đọc panel-protocol.md để nắm workflow
4. Thông báo cho user: "Sẽ gọi 3 expert agents phân tích song song..."
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-expert-panel",
  sessionSummary: "Chuẩn bị chạy /mcv3:expert-panel — triệu tập 3 expert agents phân tích",
  nextActions: ["Tiếp tục /mcv3:expert-panel — Phase 1: Load Context"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu phân tích chuyên gia..."

---

## Phase 1 — Load Context

```
Đọc full PROJECT-OVERVIEW.md để có context cho tất cả agents:
mc_load({
  projectSlug: "...",
  filePath: "_PROJECT/PROJECT-OVERVIEW.md",
  layer: 3
})
```

Ghi nhớ:
- Tên dự án, ngành
- Các PROB-IDs (vấn đề)
- Các GL-IDs (mục tiêu)
- Các SC-IN-IDs (scope)

---

## Phase 2 — Expert Analysis (Parallel)

Gọi 3 expert agents **song song** (không cần chờ nhau):

### Agent 1: Strategy Expert

```
Spawn: subagent_type="strategy-expert"
Task: Phân tích business model, competitive position, KPI framework
Input: PROJECT-OVERVIEW.md content + agent references
Output format: Theo spec trong strategy-expert.md
```

### Agent 2: Finance Expert

```
Spawn: subagent_type="finance-expert"
Task: Phân tích ROI, cost structure, pricing recommendation
Input: PROJECT-OVERVIEW.md content + agent references
Output format: Theo spec trong finance-expert.md
```

### Agent 3: Domain Expert

```
Spawn: subagent_type="domain-expert"
Task: Phân tích quy trình nghiệp vụ, compliance, pitfalls
Input: PROJECT-OVERVIEW.md content + industry references
Output format: Theo spec trong domain-expert.md
```

**Sau khi cả 3 agents hoàn thành** → merge outputs.

---

## Phase 3 — Synthesis & Consensus

Sau khi nhận outputs từ 3 agents:

### 3a. Identify Agreements

```
Tìm những điểm tất cả 3 experts đồng ý:
- Vấn đề cốt lõi là gì?
- Rủi ro lớn nhất là gì?
- Ưu tiên cao nhất là gì?
→ Ghi vào section "CONSENSUS" trong EXPERT-LOG
```

### 3b. Identify Disagreements

```
Tìm những điểm experts có ý kiến khác nhau:
- Strategy nói X, Finance nói Y → Ghi rõ cả 2 góc nhìn
- Không tự quyết định ai đúng — để user/stakeholder quyết
→ Ghi vào section "OPEN DEBATES"
```

### 3c. Identify Gaps

```
Thông tin nào cần làm rõ thêm:
- Experts nào nói "Cần biết thêm..."
- Thông tin chưa có để phân tích chính xác
→ Ghi vào section "OPEN ISSUES" + list câu hỏi cần hỏi user
```

---

## Phase 4 — Generate EXPERT-LOG.md

Gọi doc-writer agent để viết EXPERT-LOG.md:

```
Input:
  - Outputs từ 3 expert agents
  - Consensus analysis
  - Template: templates/p2-expert/EXPERT-LOG-TEMPLATE.md

Output:
  - _PROJECT/EXPERT-LOG.md với full analysis
  - SESSION-001 label (ngày hiện tại)
```

---

## Phase 5 — Summary & Save Checkpoint

Sau khi tạo EXPERT-LOG.md, báo cáo theo Auto-Mode format:

### 5a. Báo cáo hoàn thành

```
✅ ĐÃ HOÀN THÀNH: _PROJECT/EXPERT-LOG.md
   SESSION-001 với 3 expert analyses (Strategy + Finance + Domain)

CONSENSUS: [danh sách điểm đồng thuận]
RISKS: [danh sách rủi ro chính]
OPEN ISSUES: [ghi vào EXPERT-LOG để Phase 3 giải quyết — KHÔNG hỏi user ngay]
```

### 5b. Open Issues → ghi vào EXPERT-LOG

Thay vì hỏi user về Open Issues, ghi rõ vào EXPERT-LOG section "OPEN ISSUES":
- Câu hỏi nào cần clarify
- Thông tin nào chưa đủ để phân tích chính xác
- Phase nào sẽ giải quyết issue đó (VD: "Sẽ làm rõ tại Phase 3 — biz-docs")

### 5c. Update EXPERT-LOG nếu user cung cấp thêm thông tin

Nếu sau khi nhận báo cáo, user cung cấp thêm thông tin → tự update SESSION-001 trong EXPERT-LOG.md.

---

## Phase 6 — Save & Checkpoint

```
1. mc_save({
     projectSlug: "...",
     filePath: "_PROJECT/EXPERT-LOG.md",
     documentType: "expert-log"
   })

2. mc_validate({
     projectSlug: "...",
     filePath: "_PROJECT/EXPERT-LOG.md"
   })

3. mc_checkpoint({
     projectSlug: "...",
     label: "sau-expert-panel",
     sessionSummary: "Expert Panel SESSION-001 hoàn thành",
     nextActions: ["Chạy /mcv3:biz-docs để tạo chính sách và quy trình"]
   })
```

---

## Post-Gate

```
✅ EXPERT-LOG.md đã saved
✅ Có SESSION-001 với đủ 3 expert analyses
✅ Có CONSENSUS section
✅ Validated không có ERRORs
✅ Checkpoint saved

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:expert-panel
═══════════════════════════════════════════════

✅ Đã tạo: _PROJECT/EXPERT-LOG.md
   → SESSION-001 với 3 expert analyses (Strategy + Finance + Domain)
   → {N} điểm CONSENSUS
   → {M} RISKS đã phát hiện
   → {K} OPEN ISSUES ghi nhận (sẽ giải quyết tại Phase 3)

⚠️ {D} quyết định đã tự xử lý (xem DECISION-LOG)

🔜 Bước tiếp theo: /mcv3:biz-docs — Tạo tài liệu nghiệp vụ

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:biz-docs
═══════════════════════════════════════════════
```

---

## Quy tắc orchestration

```
PARALLEL: Spawn 3 agents cùng lúc — không chờ từng agent
NO FILTER: Không filter hoặc sửa output của experts
BALANCED: Trình bày mọi góc nhìn, kể cả mâu thuẫn
ACTIONABLE: Mỗi consensus item → 1 action trong biz-docs
TRANSPARENT: User có thể yêu cầu xem raw analysis của từng expert (show theo output display protocol — không tự động hiển thị)
```
