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

**Documents input thiếu (RISK-008 — BLOCKING vs WARNING):**

| Loại file thiếu | Phân loại | Hành động bắt buộc |
|-----------------|-----------|---------------------|
| PROJECT-OVERVIEW.md | ❌ BLOCKING | DỪNG — experts không có input để phân tích. Chạy `/mcv3:discovery` |
| PROJECT-OVERVIEW thiếu PROB-IDs hoặc GL-IDs | ❌ BLOCKING | DỪNG — PROJECT-OVERVIEW không đủ để phân tích. Bổ sung qua `/mcv3:discovery` |
| EXPERT-LOG.md đã tồn tại (chạy lại) | ⚠️ WARNING | Tạo SESSION-002 thay vì SESSION-001, ghi chú trong EXPERT-LOG |

**Nguyên tắc phân loại:**
- **BLOCKING** = file bắt buộc để expert agents có thể phân tích → DỪNG ngay, báo user skill nào để tạo
- **WARNING** = trạng thái cần chú ý nhưng có thể tiếp tục với điều chỉnh

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
   → Nếu KHÔNG CÓ → ❌ BLOCKING: "Thiếu PROJECT-OVERVIEW.md → Chạy /mcv3:discovery trước."
   → Nếu có nhưng không có PROB-IDs hoặc GL-IDs → ❌ BLOCKING: "PROJECT-OVERVIEW thiếu nội dung cốt lõi → Bổ sung qua /mcv3:discovery"
   → Nếu có và đầy đủ → tiếp tục
3. Đọc panel-protocol.md để nắm workflow
4. Thông báo cho user: "Sẽ gọi 3 expert agents phân tích song song..."

5. [MANDATORY] Scale Detection — Đếm số SC-IN systems từ PROJECT-OVERVIEW:
   - Nếu ≥ 3 systems trong SC-IN → CHẾ ĐỘ LARGE PROJECT
     → Ghi log: "Large project: {N} systems — domain expert sẽ cover tất cả systems"
   - Nếu < 3 systems → Chế độ Standard, tiếp tục bình thường
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

### 3d. Consensus Validation Gate (RISK-001)

```
[BẮT BUỘC] Kiểm tra CONSENSUS trước khi tiếp tục Phase 4:

✓ CONSENSUS có ≥ 1 điểm được tất cả experts đồng thuận
  → Nếu CONSENSUS rỗng → ❌ BLOCKING:
    "3 expert agents cho kết quả hoàn toàn mâu thuẫn — không có consensus.
    Lý do có thể: PROJECT-OVERVIEW thiếu context quan trọng.
    Hành động: Load full PROJECT-OVERVIEW (layer: 3) và retry synthesis."

✓ CONSENSUS không có 2 điểm contradicts nhau
  → Nếu có mâu thuẫn nội tại → sửa: ghi điểm mâu thuẫn vào OPEN DEBATES, không giữ trong CONSENSUS

✓ OPEN DEBATES ghi rõ (không tự chọn 1 bên bỏ 1 bên)
  → Nếu chỉ có 1 expert có analysis → ghi rõ "Chỉ có 1/3 expert đề cập vấn đề này" — Confidence: LOW
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

2. [BẮT BUỘC] mc_validate({
     projectSlug: "...",
     filePath: "_PROJECT/EXPERT-LOG.md"
   })
   → Nếu có ERRORs → ❌ BLOCKING: sửa ngay (thiếu CONSENSUS, thiếu expert analysis, ...)
   → Nếu chỉ có WARNINGs → ghi DECISION, tiếp tục

3. [BẮT BUỘC] mc_checkpoint({
     projectSlug: "...",
     label: "sau-expert-panel",
     sessionSummary: "Expert Panel SESSION-001 hoàn thành — {N} consensus, {M} risks, {K} open issues",
     nextActions: ["Chạy /mcv3:biz-docs để tạo chính sách và quy trình"]
   })
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

### Tầng 1 — Self-Verification

```
Format & Structure:
  ✓ Có SESSION-001 với ngày tháng rõ ràng
  ✓ Đủ 3 expert analyses: Strategy + Finance + Domain
  ✓ Có sections: CONSENSUS (không rỗng), RISKS, OPEN ISSUES
  ✓ Không có placeholder trong expert analysis output

Content Quality:
  ✓ Mỗi expert analysis có ≥ 3 điểm cụ thể (không generic)
  ✓ CONSENSUS chứa điểm được tất cả experts đồng ý (không phải 1 expert)
  ✓ RISKS được phân loại theo mức độ (Critical/High/Medium/Low)
  ✓ OPEN ISSUES mỗi item chỉ rõ "Sẽ giải quyết tại Phase X"
```

### Tầng 2 — Cross-Document

```
  ✓ Recommendations không contradicts với PROB/GL/SC từ PROJECT-OVERVIEW
  ✓ Domain analysis consistent với ngành được xác định trong Phase 1 (discovery)
  ✓ OPEN ISSUES routing đúng Phase (Phase 3 = biz-docs, Phase 4 = requirements, ...)
```

### Tầng 3 — Quality Gate

```
✅ Đủ 3 expert analyses (không thiếu expert nào)
✅ CONSENSUS ≥ 3 điểm đồng thuận
✅ Không có mâu thuẫn nội tại trong CONSENSUS (2 điểm contradicts nhau)
✅ mc_validate PASS
```

---

## Post-Gate

```
[BẮT BUỘC RISK-004] Chạy Pre-Completion Verification (section ở trên) TRƯỚC khi show Completion Report.

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

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification:** Section này kiểm tra nhanh GIỮA các internal phases (phòng tránh lỗi lan sang bước tiếp). Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ để chuẩn bị Completion Report.

### Sau Phase 1 → trước Phase 2 (Expert Analysis):
- ✓ PROJECT-OVERVIEW.md đã load đủ context: PROB-IDs, GL-IDs, SC-IN-IDs, ngành nghề
- ✓ Nếu PROJECT-OVERVIEW thiếu thông tin → ghi nhận gaps, tiếp tục với những gì có (không block)
- ✓ **Large project (3+ systems):** Đã lập danh sách tất cả systems từ SC-IN để domain expert phân tích theo từng system

### Sau Phase 2 → trước Phase 3 (Synthesis):
- ✓ Đã nhận output từ ≥ 2/3 expert agents (nếu 1 agent fail → đã áp dụng fallback trực tiếp)
- ✓ Không có expert output nào hoàn toàn rỗng hoặc chỉ có placeholder
- ✓ Mỗi expert output có ít nhất 3 điểm cụ thể (không phải generic như "cần tối ưu hóa quy trình")
- ✓ **Large project:** Domain expert đã cover tất cả systems/domains được liệt kê — không bỏ sót system nào

### Sau Phase 3 → trước Phase 4 (Generate EXPERT-LOG):
- ✓ CONSENSUS section không rỗng (≥ 1 điểm được tất cả experts đồng thuận)
- ✓ OPEN DEBATES ghi rõ điểm bất đồng giữa experts — không tự chọn bên mà bỏ bên kia
- ✓ Không có mâu thuẫn nội tại trong CONSENSUS (2 điểm consensus không contradicts nhau)
- ✓ OPEN ISSUES mỗi item có "Sẽ giải quyết tại Phase X" cụ thể (không để floating)

### Sau Phase 4 → trước Phase 6 (Save):
- ✓ EXPERT-LOG có SESSION-001 với đủ 3 expert analyses (hoặc note về fallback nếu agent fail)
- ✓ Tất cả RISKS được phân loại mức độ: Critical/High/Medium/Low (không có risk thiếu mức độ)
- ✓ Recommendations không contradicts với PROB-IDs/GL-IDs từ PROJECT-OVERVIEW

### Output Readiness → `/mcv3:biz-docs`:
- ✓ CONSENSUS recommendations actionable: mỗi điểm có thể translate thành business rule hoặc quy trình
- ✓ Risks identified có mitigation direction — biz-docs cần để biết cần BR phòng ngừa gì
- ✓ Domain analysis đã identify đủ domains — biz-docs biết cần tạo BIZ-POLICY cho domain nào
- ✓ **Large project:** CONSENSUS coverage đủ cho tất cả systems (không phải chỉ system chính) — Phase 3 cần BIZ-POLICY cho tất cả systems

---

## Quy tắc orchestration

```
PARALLEL: Spawn 3 agents cùng lúc — không chờ từng agent
NO FILTER: Không filter hoặc sửa output của experts
BALANCED: Trình bày mọi góc nhìn, kể cả mâu thuẫn
ACTIONABLE: Mỗi consensus item → 1 action trong biz-docs
TRANSPARENT: User có thể yêu cầu xem raw analysis của từng expert (show theo output display protocol — không tự động hiển thị)
```
