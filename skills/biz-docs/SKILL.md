# Biz-Docs Skill — `/mcv3:biz-docs`

## Mục đích

Tạo bộ **tài liệu nghiệp vụ đầy đủ** (Phase 3):
- `BIZ-POLICY-{DOMAIN}.md` — Chính sách nghiệp vụ (Business Rules)
- `PROCESS-{DOMAIN}.md` — Quy trình AS-IS & TO-BE
- `DATA-DICTIONARY.md` — Từ điển dữ liệu

Sử dụng **Auto-Mode Protocol**: doc-writer tạo hoàn chỉnh từ industry knowledge + context — mc_save → show tóm tắt, không show toàn bộ nội dung.

---

## DEPENDENCY MAP

```
Requires:
  - _PROJECT/PROJECT-OVERVIEW.md (Phase 1)
  - _PROJECT/EXPERT-LOG.md (Phase 2 — khuyến nghị, không bắt buộc)
Produces:
  - _PROJECT/BIZ-POLICY/BIZ-POLICY-{DOMAIN}.md
  - _PROJECT/PROCESS/PROCESS-{DOMAIN}.md
  - _PROJECT/DATA-DICTIONARY.md
Enables: /mcv3:requirements (Phase 4 — URS)
Agents: doc-writer
References:
  - skills/biz-docs/references/skeleton/ (skeleton templates)
  - skills/biz-docs/references/industry/ (industry-specific KPIs, BRs, compliance)
    Available: fnb, logistics, retail, healthcare, fintech, ecommerce, saas
  - templates/p3-biz-docs/BIZ-POLICY-TEMPLATE.md
  - templates/p3-biz-docs/PROCESS-TEMPLATE.md
  - templates/p3-biz-docs/DATA-DICTIONARY-TEMPLATE.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự xác định domains từ PROJECT-OVERVIEW, tự tạo docs cho tất cả
2. **Tự giải quyết vấn đề** — load industry knowledge, tự điền nội dung, ghi DECISION khi không chắc
3. **Báo cáo sau khi xong** — list tất cả docs tạo ra + decisions + gaps để user review
4. **User review** — cập nhật BRs/content nếu user muốn điều chỉnh
5. **Gợi ý bước tiếp** — `/mcv3:requirements`

---

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0 init | mc_status → check PROJECT-OVERVIEW → check EXPERT-LOG (3 sequential) | [mc_status ∥ mc_load(PO layer:0) ∥ mc_load(EL layer:0)] — 1 round | ~2 round-trip |
| Phase 0 full load | mc_load(PO layer:2) → mc_load(EL layer:2) (sequential) | [mc_load(PO layer:2) ∥ mc_load(EL layer:2)] song song | ~1 round-trip |
| Phase 0 checkpoint | Sau load riêng, gọi mc_checkpoint | [mc_load(PO layer:2) ∥ mc_load(EL layer:2) ∥ mc_checkpoint] — 1 round | ~1 round-trip |
| Phase 2a skeleton load | Load từng skeleton riêng lẻ | Load skeleton + industry ref song song | ~1 round-trip / domain |
| Phase 5 per-domain save | mc_save(BP) → mc_validate → mc_traceability → mc_save(PROC) → mc_validate | mc_save(BP) → [mc_validate ∥ mc_traceability] → mc_save(PROC) → mc_validate | ~1 round-trip / domain |

### Cache Shared Data

```
PROJECT-OVERVIEW.md và EXPERT-LOG.md: Load 1 lần ở Phase 0 → dùng cho tất cả domains
→ KHÔNG reload cho mỗi domain riêng lẻ
→ Tiết kiệm: (N_domains − 1) × 2 mc_load calls
```

### Parallel Gen + Sequential Save (Multi-Domain)

```
Khi có ≥ 2 domains:
1. Pre-assign BR-ID ranges TRƯỚC khi generate (tránh conflict):
   Domain 1: BR-{DOM1}-001 → BR-{DOM1}-049
   Domain 2: BR-{DOM2}-001 → BR-{DOM2}-049
   Domain 3: BR-{DOM3}-001 → BR-{DOM3}-049

2. Generate content cho tất cả domains song song (không MCP → chỉ dùng context)

3. Save tuần tự — mỗi domain: mc_save(BIZ-POLICY) → [mc_validate ∥ mc_traceability] → mc_save(PROCESS) → mc_validate → mc_checkpoint
```

### Quy tắc áp dụng

```
✅ Phase 0 parallel: [mc_status ∥ mc_load(PO layer:0) ∥ mc_load(EL layer:0)] — 1 round
✅ Phase 0 full load: [mc_load(PO layer:2) ∥ mc_load(EL layer:2) ∥ mc_checkpoint] — 1 round
   → mc_checkpoint chạy song song vì không cần nội dung từ load
✅ Cache: PROJECT-OVERVIEW và EXPERT-LOG load 1 lần, dùng cho tất cả domains
✅ Pre-assign BR-ID ranges khi generate ≥ 2 domains song song
✅ Post-save parallel: mc_validate ∥ mc_traceability sau mc_save(BIZ-POLICY)
✅ No re-validation: Pre-Completion chỉ confirm "validate đã PASS tại Phase 5", không re-run
```

---

## Khi nào dùng skill này

- Sau khi `/mcv3:expert-panel` hoàn thành (hoặc ít nhất có PROJECT-OVERVIEW.md)
- Muốn có Business Rules trước khi viết URS
- Cần formalize quy trình nghiệp vụ

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**PROJECT-OVERVIEW.md chưa có:**
- Báo user: "Thiếu PROJECT-OVERVIEW.md → Chạy /mcv3:discovery trước."

**Documents input thiếu (RISK-008 — BLOCKING vs WARNING):**

| Loại file thiếu | Phân loại | Hành động bắt buộc |
|-----------------|-----------|---------------------|
| PROJECT-OVERVIEW.md | ❌ BLOCKING | DỪNG — không có context để generate BizDocs. Chạy `/mcv3:discovery` |
| EXPERT-LOG.md | ⚠️ WARNING | Tiếp tục với PROJECT-OVERVIEW, ghi DECISION "Thiếu Expert recommendations" — Confidence: LOW |

**Nguyên tắc phân loại:**
- **BLOCKING** = file bắt buộc để tạo tài liệu nghiệp vụ → DỪNG ngay, báo user skill nào để tạo
- **WARNING** = file tham khảo bổ sung → tiếp tục nhưng ghi rõ DECISION với Confidence: LOW

**Industry references không có cho ngành này:**
- Tiếp tục với `references/skeleton/` skeleton templates (general)
- Hỏi user nhiều hơn về business rules của ngành đó
- Không load references không tồn tại — chỉ load files đã có trong danh sách

**Validation gate trước khi tạo docs:**
- Kiểm tra PROJECT-OVERVIEW.md có ít nhất: 1 PROB-ID, 1 SC-IN-ID, 1 ST-ID
- Nếu thiếu → tự tiếp tục với thông tin có sẵn, đánh dấu gaps bằng DECISION với Confidence: LOW
- Ghi rõ trong Completion Report: "⚠️ PROJECT-OVERVIEW thiếu [X] — tài liệu tạo với thông tin có sẵn, user nên bổ sung"

---

## Phase 0 — Pre-Gate

```
// SPEED: Gộp mc_status + 2 file checks vào 1 round song song
1. PARALLEL (3 calls đồng thời — 1 round duy nhất):
   - mc_status()  → xác nhận project slug
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 0 })  → check tồn tại
   - mc_load({ filePath: "_PROJECT/EXPERT-LOG.md", layer: 0 })  → check tồn tại

   → PROJECT-OVERVIEW NOT FOUND → ❌ BLOCKING: "Thiếu PROJECT-OVERVIEW.md → Chạy /mcv3:discovery trước."
   → EXPERT-LOG NOT FOUND → ⚠️ WARNING — ghi DECISION "Thiếu EXPERT-LOG, tiếp tục với PROJECT-OVERVIEW only" — Confidence: LOW

2. (Nếu cả 2 tồn tại) PARALLEL full load + checkpoint:
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 })  // CACHE — dùng cho tất cả domains
   - mc_load({ filePath: "_PROJECT/EXPERT-LOG.md", layer: 2 })        // CACHE — dùng cho tất cả domains
   - mc_checkpoint({ label: "pre-biz-docs", ... })                    // Safety checkpoint song song
   (Nếu chỉ có PROJECT-OVERVIEW) → load layer:2 + mc_checkpoint song song

3. Tự xác định domain list từ SC-IN IDs trong PROJECT-OVERVIEW + EXPERT-LOG
   → Không hỏi user — tự detect tất cả domains cần làm

5. [MANDATORY] Scale Detection — Đếm số domains:
   - Nếu ≥ 5 domains → CHẾ ĐỘ LARGE PROJECT (xem Phase 0 Safety Checkpoint — Batch Mode)
     → Ghi log: "Large project: {N} domains detected — kích hoạt Batch Mode"
   - Nếu < 5 domains → Chế độ Standard, tiếp tục bình thường
```

---

## Phase 0 — Safety Checkpoint

Safety checkpoint đã được tích hợp vào Phase 0 Pre-Gate (bước 2) để chạy song song với full load.
Không cần gọi riêng — tham khảo Phase 0 Pre-Gate bước 2.

→ "✅ Safety checkpoint đã lưu. Bắt đầu tạo BizDocs..."

**Large project batch processing (RISK-006) — áp dụng khi ≥5 domains:**
```
// Phát hiện large project: đếm domains từ Phase 0 Scale Detection
// Nếu ≥5 domains → kích hoạt Batch Mode:

1. Lưu BATCH CHECKPOINT trước Phase 2:
   mc_checkpoint({
     label: "pre-biz-docs-batch",
     sessionSummary: "Large project: {N} domains cần BizDocs. Batch mode ON.",
     nextActions: ["Batch 1: {DOM1}, {DOM2}, {DOM3} — BIZ-POLICY + PROCESS"]
   })

2. Chia domains thành batches (tối đa 3 domains / batch):
   Batch 1: Core domains (Sales, Warehouse, ...)
   Batch 2: Support domains (HR, Finance, ...)
   Batch 3+: Integration/Reporting domains

3. Checkpoint sau mỗi batch (ngoài per-domain checkpoint):
   mc_checkpoint({ label: "biz-docs-batch-{N}-complete", ... })

4. KHÔNG load toàn bộ contexts cùng lúc — chỉ load docs của domain đang làm
```

---

## Phase 1 — Domain List Auto-Detection

Tự xác định domain list từ PROJECT-OVERVIEW.md (SC-IN IDs + Stakeholder roles) và EXPERT-LOG.md (CONSENSUS section).

**Tự xác định:**
```
Từ SC-IN-001...N: extract tên modules/domains chính
Từ EXPERT-LOG CONSENSUS: xem domain nào được mention
→ Domain list: ["WH" (Warehouse), "SALES", ...]
→ Sẽ tạo:
   - BIZ-POLICY-{DOM}.md cho mỗi domain
   - PROCESS-{DOM}.md cho mỗi domain
   - DATA-DICTIONARY.md (chung)
```

---

## Phase 2 — Auto-Generate (Per Domain)

Với mỗi domain, áp dụng Guided Generation Protocol:

### 2a. Load skeleton + context

```
Đọc skeleton phù hợp:
  - Logistics / XNK: references/skeleton/process-skeleton.md
  - Retail: references/skeleton/sales-skeleton.md
  - HR / HRM: references/skeleton/hr-skeleton.md
  - General / Pricing: references/skeleton/pricing-skeleton.md (nếu có pricing)

Load industry knowledge nếu có:
  - references/industry/{domain}.md
  - Available: fnb, logistics, retail, healthcare, fintech, ecommerce, saas
  - Nội dung bao gồm: KPIs, business processes, compliance requirements,
    common BRs, pain points, data dictionary suggestions
```

### 2b. Auto-generate document (internal — không show lên chat trước khi mc_save)

Doc-writer tạo BIZ-POLICY với:
- Tên và format đúng theo template
- Sections đầy đủ với BR-IDs (BR-{DOM}-XXX)
- Nội dung tự điền từ PROJECT-OVERVIEW + EXPERT-LOG + industry knowledge (không để trống)

**Ví dụ auto-filled BIZ-POLICY-WH (tạo tự động, không chờ user):**

```markdown
# BIZ-POLICY-WH — Chính sách Kho hàng
<!-- Auto-generated từ industry logistics knowledge — Confidence: MEDIUM — user nên review -->

## BR-WH-001: Kiểm soát nhập kho
**Quy tắc:** Mọi hàng nhập kho phải có Phiếu nhập kho (GRN) được phê duyệt trước khi nhận hàng vào kho
<!-- DECISION: Nội dung dựa trên logistics industry standard — Confidence: MEDIUM -->
**Áp dụng cho:** Thủ kho, Kế toán
**Ngoại lệ:** Hàng khẩn cấp — cần phê duyệt bổ sung trong vòng 24h

## BR-WH-002: FIFO xuất kho
**Quy tắc:** Hàng nhập trước xuất trước (First In First Out)
**Áp dụng cho:** Thủ kho
**Ngoại lệ:** Hàng có hạn sử dụng ngắn hơn — ưu tiên xuất trước

...
```

### 2c. Auto-fill document từ industry knowledge + context

Hoàn thành tài liệu tự động — KHÔNG trình bày hay hiển thị nội dung lên chat, chỉ mc_save → show tóm tắt:

```
1. Load industry references đã match với domain
2. Áp dụng industry best practices vào BRs
3. Điền nội dung cụ thể từ PROJECT-OVERVIEW + EXPERT-LOG
4. Nơi nào không có đủ context → điền best-practice default + ghi DECISION:
   DECISION-{N}: BR-{DOM}-{NNN} content dùng industry default:
   [mô tả default] — Confidence: MEDIUM — User nên review
5. Không để [Placeholder] hay "Chờ xác nhận" — luôn có nội dung cụ thể
```

### 2d. Enrich document

Tự enrich document dựa trên industry knowledge + PROJECT-OVERVIEW:
- Điền nội dung cụ thể từ context
- Thêm BRs từ industry standard nếu phù hợp với scope
- Ghi DECISION cho mỗi BR không có nguồn rõ ràng (Confidence: MEDIUM)

### 2e. Repeat cho PROCESS document

Tương tự, tạo PROCESS với AS-IS → TO-BE format.

---

## Phase 3 — PROCESS Documents

Với mỗi domain, tạo PROCESS document:

### Format chuẩn:

```markdown
## QUY TRÌNH: {Tên quy trình}
**ID:** PROC-{DOM}-001
**Loại:** Operational / Management

### AS-IS (Quy trình hiện tại)
{Mô tả từng bước — có thể dùng ascii flow}
**Pain points:**
- PAIN-001: {vấn đề 1}
- PAIN-002: {vấn đề 2}

### TO-BE (Quy trình mục tiêu)
{Quy trình sau khi có hệ thống mới}
**Cải tiến:**
- PAIN-001 → Giải quyết bằng [tính năng X]
- PAIN-002 → Giải quyết bằng [tính năng Y]

### Actors
| Role | Trách nhiệm |
|------|------------|
| {role 1} | {mô tả} |

### Business Rules áp dụng
- BR-{DOM}-001: [tên BR]
```

---

## Phase 4 — DATA DICTIONARY

Sau khi tạo xong BIZ-POLICY và PROCESS:

1. **Extract entities** từ tất cả documents
2. **Assign IDs:**
   - `TERM-NNN` — Thuật ngữ nghiệp vụ
   - `ENT-NNN` — Business Entity
   - `ENUM-NNN` — Enumeration (danh sách giá trị cố định)

3. **Auto-generate definitions:**

```
Tự định nghĩa dựa trên industry knowledge + BIZ-POLICY + PROCESS context:
- TERM-001: Lô hàng — [định nghĩa từ industry standard + context dự án]
- ENT-001: Khách hàng — [attributes chuẩn + những gì extract được từ BRs]
Nếu không chắc chắn → ghi DECISION với Confidence: MEDIUM
```

---

## Phase 5 — Save & Validate All

```
Với mỗi domain (KHÔNG hiển thị nội dung lên chat — chỉ show tóm tắt sau mc_save):

--- Per-domain loop ---

1. mc_save({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md", documentType: "biz-policy" })
   → 📄 Đã lưu: BIZ-POLICY-{DOM}.md — {N} Business Rules (BR-{DOM}-001 → BR-{DOM}-{NNN})

// SPEED: mc_validate ∥ mc_traceability song song sau mc_save
2. PARALLEL:
   - [BẮT BUỘC] mc_validate({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md" })
     → Nếu có ERRORs → ❌ BLOCKING: sửa ngay trước khi tiếp tục domain tiếp theo
     → Nếu chỉ có WARNINGs → ghi DECISION, tiếp tục
   - [BẮT BUỘC] mc_traceability({ projectSlug: "...", action: "register",
       sourceId: "BR-{DOM}-NNN", targetId: "BIZ-POLICY-{DOM}.md" })
     → Đăng ký tất cả BR-IDs từ BIZ-POLICY vào traceability matrix

3. mc_save({ filePath: "_PROJECT/PROCESS/PROCESS-{DOM}.md", documentType: "process" })
   → 📄 Đã lưu: PROCESS-{DOM}.md — {M} quy trình (AS-IS + TO-BE)

4. [BẮT BUỘC] mc_validate({ filePath: "_PROJECT/PROCESS/PROCESS-{DOM}.md" })
   → Nếu có ERRORs → ❌ BLOCKING: sửa ngay trước khi tiếp tục

5. [BẮT BUỘC] Per-domain checkpoint (RISK-003):
   mc_checkpoint({
     label: "biz-docs-{DOM}-complete",
     sessionSummary: "Hoàn thành BIZ-POLICY + PROCESS cho domain {DOM}",
     nextActions: ["Tiếp tục biz-docs — domain tiếp theo hoặc DATA-DICTIONARY"]
   })

--- Kết thúc per-domain loop ---

Sau tất cả domains:
7. mc_save({ filePath: "_PROJECT/DATA-DICTIONARY.md", documentType: "data-dictionary" })
   → 📄 Đã lưu: DATA-DICTIONARY.md — {K} TERM, {J} ENT, {L} ENUM

8. [BẮT BUỘC] mc_validate({ filePath: "_PROJECT/DATA-DICTIONARY.md" })
   → Nếu có ERRORs → ❌ BLOCKING: sửa ngay

9. [BẮT BUỘC] Final checkpoint:
   mc_checkpoint({
     label: "sau-biz-docs",
     sessionSummary: "Tạo {N} BIZ-POLICY + {N} PROCESS + DATA-DICTIONARY — tất cả validated",
     nextActions: ["Chạy /mcv3:requirements để viết URS cho từng module"]
   })
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

### Tầng 1 — Self-Verification

```
Format & IDs:
  ✓ BIZ-POLICY: BR IDs format đúng (BR-{DOM}-NNN), sequential, không có gaps
  ✓ PROCESS: PROC IDs format (PROC-{DOM}-NNN), có cả AS-IS và TO-BE sections
  ✓ DATA-DICTIONARY: TERM-NNN, ENT-NNN, ENUM-NNN format đúng
  ✓ Không có placeholder: "[tên công ty]", "[fill in]", "TBD" → reject
  ✓ Mỗi BR có: Quy tắc + Áp dụng cho + Ngoại lệ (hoặc "Không có ngoại lệ")

Content Quality:
  ✓ BR-IDs unique trong toàn bộ project (không trùng với modules khác)
  ✓ Mỗi BR có thể enforce/kiểm tra (không phải "làm việc chăm chỉ")
  ✓ AS-IS và TO-BE trong PROCESS không mô tả cùng 1 quy trình giống nhau
  ✓ Thuật ngữ nhất quán giữa BIZ-POLICY và PROCESS (cùng 1 tên cho cùng 1 thứ)
```

### Tầng 2 — Cross-Document

```
  ✓ PROC-IDs trong PROCESS reference đúng BR-IDs từ BIZ-POLICY cùng domain
  ✓ ENT-IDs trong DATA-DICTIONARY match với Entities được mention trong BIZ-POLICY
  ✓ Domains được identify có đủ BIZ-POLICY + PROCESS files (không thiếu cặp)
  ✓ Số domains match với SC-IN modules trong PROJECT-OVERVIEW
```

### Tầng 3 — Quality Gate

```
✅ Mỗi domain có cả BIZ-POLICY + PROCESS (không thiếu 1 trong 2)
✅ DATA-DICTIONARY đã tạo (dù project có 1 domain)
✅ BR count ≥ 3 per domain (ít hơn → có thể chưa đủ coverage)
✅ Không có BR duplicate (cùng rule, khác ID)
✅ mc_validate PASS cho tất cả files
```

---

## Post-Gate

```
[BẮT BUỘC RISK-004] Chạy Pre-Completion Verification (section ở trên) TRƯỚC khi show Completion Report.

✅ Ít nhất 1 BIZ-POLICY đã saved
✅ Ít nhất 1 PROCESS đã saved
✅ DATA-DICTIONARY đã saved
✅ Tất cả có BR-IDs
✅ PROCESS có cả AS-IS và TO-BE
✅ Validated không có ERRORs

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:biz-docs
═══════════════════════════════════════════════

✅ Đã tạo {N×3 + 1} files:
   BIZ-POLICY-{DOM1}.md — {X} BRs
   PROCESS-{DOM1}.md    — {M} quy trình
   BIZ-POLICY-{DOM2}.md — ...
   DATA-DICTIONARY.md   — {K} TERM, {J} ENT

⚠️ {D} quyết định đã tự xử lý (xem DECISION-LOG)
📋 Tất cả files trong .mc-data/_PROJECT/

🔜 Bước tiếp theo: /mcv3:requirements — Viết URS cho từng module

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:requirements
═══════════════════════════════════════════════
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification:** Section này kiểm tra nhanh GIỮA các internal phases (phòng tránh lỗi lan sang bước tiếp). Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ để chuẩn bị Completion Report.

### Sau Phase 1 → trước Phase 2 (Auto-Generate per domain):
- ✓ Domain list không thiếu domain nào từ SC-IN trong PROJECT-OVERVIEW
- ✓ Mỗi domain có skeleton/industry reference phù hợp (nếu thiếu: dùng general skeleton, ghi DECISION)
- ✓ **Large project (5+ domains):** Checkpoint sau Phase 1 trước khi bắt đầu generate — đảm bảo resume được nếu session bị interrupt

### Sau Phase 2 (per domain) → trước Phase 3 (PROCESS per domain):
- ✓ BIZ-POLICY-{DOM}.md có ≥ 3 BR-IDs (ít hơn → likely incomplete coverage)
- ✓ BR-IDs unique trong toàn bộ domain namespace (không trùng số giữa các modules cùng dự án)
- ✓ Không có BR nào chỉ có tiêu đề mà thiếu nội dung (Quy tắc + Áp dụng cho + Ngoại lệ bắt buộc)

### Sau Phase 3 (per domain) → trước Phase 4 (DATA-DICTIONARY):
- ✓ PROCESS-{DOM}.md có cả AS-IS và TO-BE sections (không phải chỉ 1 trong 2)
- ✓ TO-BE references đúng BR-IDs từ BIZ-POLICY cùng domain (không có orphan BR refs)
- ✓ Mỗi Pain point trong AS-IS đã được giải quyết trong TO-BE (không để pain point không có giải pháp)

### Sau Phase 4 → trước Phase 5 (Save):
- ✓ DATA-DICTIONARY cover tất cả Entities được mention trong BIZ-POLICY và PROCESS
- ✓ Không có entity chính (VD: "Đơn hàng", "Khách hàng") bị thiếu khỏi DATA-DICTIONARY
- ✓ ENUM-IDs định nghĩa đủ các giá trị cố định được dùng trong BRs

### Output Readiness → `/mcv3:requirements`:
- ✓ BR-IDs unique TOÀN PROJECT (không có BR-WH-001 ở domain này và BR-WH-001 ở domain khác)
- ✓ Policies và Processes nhất quán: Entities dùng cùng tên trong BIZ-POLICY và PROCESS (không vừa "đơn hàng" vừa "order")
- ✓ DATA-DICTIONARY có ENT-IDs cho tất cả entities quan trọng — requirements sẽ reference các ENT-IDs này
- ✓ **Large project (5+ systems):** Mỗi system có BIZ-POLICY riêng (không gộp chung) + có ít nhất 1 BR về shared services nếu systems dùng chung auth/notification

---

## Quy tắc Guided Generation

```
AUTO-COMPLETE: Tự điền nội dung theo industry knowledge — ghi DECISION khi không chắc chắn, không dừng hỏi user
SPECIFIC: Không để placeholder — ghi "Chưa xác định" nếu chưa biết
DOMAIN-AWARE: Load industry knowledge phù hợp
ID-CONSISTENT: Các BRs trong BIZ-POLICY và PROCESS phải cùng namespace
INCREMENTAL: Có thể tạo từng domain một, không cần làm tất cả cùng lúc
```
