# Requirements Skill — `/mcv3:requirements`

## Mục đích

Chuyển **Business Docs (Phase 3)** thành **User Requirements Specification (URS)** — Phase 4.

Với mỗi module/system, tạo file `URS-{MOD}.md` gồm:
- **User Stories** với formal ID `US-{MOD}-NNN`
- **Functional Requirements** với ID `FT-{MOD}-NNN`
- **Acceptance Criteria** với ID `AC-{MOD}-NNN-XX`
- **Non-Functional Requirements** với ID `NFR-NNN`
- **Use Cases** với ID `UC-{MOD}-NNN-XX`

Sử dụng **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`): agent tạo URS hoàn chỉnh tự động — mc_save → show tóm tắt, không show toàn bộ nội dung.

---

## DEPENDENCY MAP

```
Requires:
  - _PROJECT/PROJECT-OVERVIEW.md (Phase 1)
  - _PROJECT/BIZ-POLICY/*.md (Phase 3 — BẮT BUỘC, BLOCKING nếu thiếu)
  - _PROJECT/PROCESS/*.md (Phase 3 — WARNING nếu thiếu, tiếp tục với note)
  - _PROJECT/DATA-DICTIONARY.md (Phase 3 — WARNING nếu thiếu, tiếp tục với note)
  - _PROJECT/EXPERT-LOG.md (Phase 2 — optional, load nếu có)
Produces:
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md (per module)
  - {SYSTEM}/P1-REQUIREMENTS/SYSTEM-INDEX.md (cập nhật)
Enables: /mcv3:tech-design (Phase 5 — MODSPEC)
Agents: doc-writer
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_checkpoint, mc_traceability
References:
  - skills/requirements/references/requirements-patterns.md
  - skills/requirements/references/acceptance-criteria-guide.md
  - templates/p4-requirements/URS-TEMPLATE.md
```

---

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0 init | mc_status → mc_list → mc_load (3 sequential) | 3 calls song song trong 1 round | ~2 round-trip |
| Phase 1 module detection | mc_list (gọi lại lần 2) | Dùng kết quả mc_list từ Phase 0 | 1 MCP call / run |
| Phase 2a context load | BIZ-POLICY → PROCESS → DATA-DICT (3 sequential) | 3 calls song song | ~2 round-trip / module |
| Phase 2a DATA-DICTIONARY | Load lại mỗi module | Load 1 lần duy nhất ở Phase 0, cache | N−1 calls (N = số modules) |
| Phase 5 save flow | mc_save → mc_validate → mc_traceability | mc_save → [mc_validate ∥ mc_traceability] | ~1 round-trip / module |

### Validation Redundancy Removal

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Pre-Completion Tầng 1 | Re-chạy lại toàn bộ checklist Phase 4 | Confirm "Phase 4 PASS cho tất cả modules" | Token cost re-check |
| Pre-Completion Tầng 3 | Re-run mc_validate cho mỗi module | Xác nhận mc_validate PASS đã done ở Phase 5 | N mc_validate calls |

### Quy tắc áp dụng

```
✅ Parallel calls: Gộp tất cả calls độc lập vào 1 round (dùng tool call batching)
✅ Cache DATA-DICTIONARY: Load 1 lần ở Phase 0, reference trong memory cho các modules sau
✅ Reuse mc_list result: Phase 0 → Phase 1 dùng cùng 1 kết quả
✅ Post-save parallel: mc_validate và mc_traceability chạy song song sau mc_save
✅ No re-validation: Nếu Phase X đã PASS → Pre-Completion chỉ cần confirm, không re-run
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự chọn module theo dependency order, tự tạo URS hoàn chỉnh
2. **Tự giải quyết vấn đề** — tự điền AC, NFR dựa trên BRs và industry standards
3. **Báo cáo sau khi xong** — list tất cả URS files + IDs + coverage metrics
4. **User review** — cập nhật US/AC/FT nếu user muốn điều chỉnh
5. **Gợi ý bước tiếp** — `/mcv3:tech-design`

---

## Khi nào dùng skill này

- Sau khi `/mcv3:biz-docs` hoàn thành (có BIZ-POLICY + PROCESS + DATA-DICTIONARY)
- Cần chuyển Business Rules thành User Stories có thể implement được
- Cần formal requirements với Acceptance Criteria để làm căn cứ QA

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**Phân loại khi file không tìm thấy (RISK-008):**

| File | Loại | Hành động |
|------|------|-----------|
| BIZ-POLICY-{MOD}.md | **BLOCKING** | ⛔ DỪNG — không thể tạo URS nếu thiếu BR. Yêu cầu chạy /mcv3:biz-docs trước |
| PROCESS-{MOD}.md | **WARNING** | Ghi note "Use Cases sẽ ít chi tiết hơn", tiếp tục |
| DATA-DICTIONARY.md | **WARNING** | Ghi note "Entity types dùng best-practice defaults", tiếp tục |
| PROJECT-OVERVIEW.md | **BLOCKING** | ⛔ DỪNG — thiếu bối cảnh project. Yêu cầu chạy /mcv3:discovery trước |

**BIZ-POLICY có nhưng PROCESS thiếu:**
- Tiếp tục với BIZ-POLICY, note rằng Use Cases sẽ ít chi tiết hơn
- Sau khi xong URS, nhắc user: "Nên tạo PROCESS-{MOD}.md để enrichment Use Cases."

---

## Phase 0 — Pre-Gate

```
1. PARALLEL (3 calls đồng thời — 1 round duy nhất):
   - mc_status()  → xác nhận project slug, phase hiện tại
   - mc_list({ subPath: "_PROJECT/BIZ-POLICY" })  → liệt kê domains có BIZ-POLICY
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 })  → nắm bối cảnh
   [Kết quả mc_list sẽ được tái sử dụng ở Phase 1 — KHÔNG gọi mc_list lần thứ 2]

2. Kiểm tra BIZ-POLICY đã có ít nhất 1 file (dùng kết quả mc_list từ bước 1):
   ⛔ BLOCKING — Nếu không có BIZ-POLICY → DỪNG NGAY. Không tiếp tục.
   Báo user: "Chưa tìm thấy BIZ-POLICY. Hãy chạy /mcv3:biz-docs trước."

3. Đếm số modules:
   - Nếu ≥ 5 modules → BẮT BUỘC kích hoạt LARGE PROJECT MODE (xem mục riêng bên dưới)
   - Nếu < 5 modules → STANDARD MODE
4. Tự xác định module order:
   - Domains trong BIZ-POLICY → map sang modules
   - Dependency order: Core modules (Auth, Master data) → Business modules → Integration
   - Xử lý từng module theo order, không hỏi user
   [Cache DATA-DICTIONARY: sẽ load 1 lần ở Phase 2a module đầu tiên, dùng lại cho các modules sau]
```

**⛔ BLOCKING — Nếu thiếu BIZ-POLICY:**
```
⛔ KHÔNG THỂ TIẾP TỤC.
   Chưa tìm thấy BIZ-POLICY trong _PROJECT/BIZ-POLICY/.
   Hãy chạy /mcv3:biz-docs trước để tạo Business Rules.
```

### LARGE PROJECT MODE (≥ 5 modules) — RISK-006

```
Khi phát hiện ≥ 5 modules:
1. BẮT BUỘC mc_checkpoint trước khi bắt đầu bất kỳ module nào:
   mc_checkpoint({ label: "requirements-large-project-start", ... })
2. Process TỪNG MODULE RIÊNG BIỆT — không load tất cả BIZ-POLICY cùng lúc
3. Sau mỗi module: mc_checkpoint({ label: "requirements-{MODULE}", ... })
4. Sau mỗi 3 modules: hiển thị interim report
5. Cuối cùng: Full Completion Report
```

---

## Phase 1 — System/Module Auto-Detection

Tự xác định system code và modules từ BIZ-POLICY files available.

**Tự xác định từ BIZ-POLICY:**
```
[REUSE kết quả mc_list đã lấy từ Phase 0 — KHÔNG gọi mc_list lần thứ 2]
→ BIZ-POLICY-WH.md → SYSTEM = "ERP", MOD = "WH"
→ BIZ-POLICY-SALES.md → SYSTEM = "ERP", MOD = "SALES"
→ ... (tất cả domains có BIZ-POLICY)

Nếu user đã chỉ định system/module trong message → ưu tiên theo đó
```

**Load BIZ-POLICY + PROCESS cho module đầu tiên** (xem Phase 2a — song song).

---

## Phase 2 — Context Loading & Analysis

### 2a. Load toàn bộ context liên quan

```
PARALLEL (2-3 calls đồng thời):
1. mc_load({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{MOD}.md", layer: 3 })
   → Nếu FAIL → ⛔ BLOCKING: dừng module này, báo user
2. mc_load({ filePath: "_PROJECT/PROCESS/PROCESS-{MOD}.md", layer: 3 })
   → Nếu FAIL → ⚠️ WARNING: ghi note "Use Cases ít chi tiết", tiếp tục
3. DATA-DICTIONARY [Cache Rule]:
   → Module ĐẦU TIÊN: load song song với (1) và (2):
     mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 2 })
     → Nếu FAIL → ⚠️ WARNING: ghi note "Entity types dùng best-practice defaults", tiếp tục
   → Module THỨ 2+: KHÔNG load lại — dùng kết quả đã có trong context từ module trước
4. Đọc references/requirements-patterns.md (internal)
```

### 2b. Extract Business Rules

Từ BIZ-POLICY, liệt kê tất cả BR-{MOD}-XXX → mapping sang User Stories:

```
BR-WH-001: Kiểm soát nhập kho
  → US-WH-001: Thủ kho muốn tạo phiếu nhập kho để kiểm soát hàng nhập
  → US-WH-002: Kế toán kho muốn xem lịch sử nhập kho để đối chiếu

BR-WH-002: FIFO xuất kho
  → US-WH-003: Thủ kho muốn hệ thống tự đề xuất lô hàng xuất theo FIFO
```

### 2c. Extract Use Cases từ PROCESS

Từ PROCESS, identify TO-BE flows → map sang Use Cases:

```
PROC-WH-001 TO-BE: Quy trình nhập kho tự động
  → UC-WH-001-01: Tạo phiếu nhập kho
  → UC-WH-001-02: Scan mã vạch nhập hàng
  → UC-WH-001-03: Xác nhận nhập kho
```

---

## Phase 3 — Draft URS Generation

Doc-writer tạo draft URS với cấu trúc đầy đủ:

### 3a. Cấu trúc file URS

```markdown
# URS-{MOD} — {Tên đầy đủ Module}

## DEPENDENCY MAP
Requires: BIZ-POLICY-{MOD}.md, PROCESS-{MOD}.md
Enables: MODSPEC-{MOD}.md

## 1. Scope
[Mô tả phạm vi module]

## 2. Actors (Người dùng)
| Actor | Mô tả | Quyền hạn |
|-------|-------|-----------|

## 3. User Stories

### US-{MOD}-001: {Tiêu đề}
**Role:** Là {actor}
**Want:** Tôi muốn {hành động}
**So that:** Để {mục đích/lợi ích}
**Priority:** Must/Should/Could
**Origin:** {BR-XXX hoặc PROC-XXX}

#### Acceptance Criteria
- AC-{MOD}-001-01: **Given** {điều kiện ban đầu}
  **When** {hành động xảy ra}
  **Then** {kết quả mong đợi}
- AC-{MOD}-001-02: ...

#### Use Cases
- UC-{MOD}-001-01: {Tên use case}

## 4. Functional Requirements

### FT-{MOD}-001: {Tên tính năng}
**Mô tả:** [Chi tiết]
**Origin US:** US-{MOD}-001
**Priority:** Must/Should/Could
**Input:** [Đầu vào]
**Output:** [Đầu ra]
**Business Rule:** BR-{MOD}-001

## 5. Non-Functional Requirements
### NFR-001: [Tên]
**Loại:** Performance/Security/Usability/...
**Yêu cầu:** [Mô tả định lượng]

## 6. Traceability Matrix
| BR-ID | US-ID | FT-ID | AC-IDs |
|-------|-------|-------|--------|
```

### 3b. Auto-Complete Generation Protocol

Tạo URS hoàn chỉnh ngay từ đầu, không dừng để hỏi user:

```
1. Tự điền đầy đủ từ BIZ-POLICY + PROCESS + DATA-DICTIONARY
2. Tự generate AC cho mỗi US:
   - Happy Path: từ BR positive conditions
   - Error Cases: từ BR exceptions và validation rules
   - Edge Cases: từ industry knowledge (VD: duplicate, concurrent, empty state)
3. Nơi không đủ context → điền best-practice default + ghi DECISION
4. NFR: dùng industry standard defaults nếu không specify trong docs:
   DECISION: NFR-001 performance target = <2s dựa trên web industry standard
   Confidence: MEDIUM — user nên review
5. Chạy AC Quality Validation Checklist tự động trước khi save
```

---

## Phase 4 — Auto-Completeness Validation

Tự đánh giá completeness trước khi finalize — không chờ user confirm:

**AC Quality Validation Checklist — kiểm tra trước khi finalize:**

```
COMPLETENESS:
✓ Mỗi US có ít nhất 2 AC (Happy Path + Error Case)
✓ Mỗi BR-ID có ít nhất 1 US tương ứng (traceability BR → US)
✓ Priority (Must/Should/Could) đã assign cho tất cả US và FT
✓ NFR có ít nhất 3 yêu cầu (Performance, Security, Usability)
✓ Traceability matrix: BR → US → FT → AC đầy đủ

AC QUALITY (kiểm tra từng AC):
✓ Có đủ 3 phần: Given / When / Then
✓ "Then" mô tả kết quả CỤ THỂ, có thể đo lường (không phải "hệ thống hoạt động đúng")
✓ Không có AC nào mơ hồ — ví dụ xấu: "hệ thống phản hồi nhanh" → phải thành "response < 2s"
✓ Error AC: mô tả đúng HTTP status code hoặc error message cụ thể

COVERAGE:
✓ Có AC cho Happy Path (input hợp lệ)
✓ Có AC cho Error/Validation (input không hợp lệ)
✓ Có AC cho Permission/Auth (unauthorized access)
✓ Có AC cho Edge Cases quan trọng (empty state, duplicate, concurrent)

NFR MEASURABILITY:
✓ Performance: "< Xs response time" (không phải "nhanh")
✓ Availability: "99.X% uptime" với maintenance window cụ thể
✓ Security: "JWT Bearer auth bắt buộc" / "rate limit X req/min"
✓ Data: "Backup mỗi X giờ" / "Retention X ngày"
```

---

## Phase 5 — Save & Register

```
1. mc_save({
     filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md",
     documentType: "urs"
   })
   → KHÔNG hiển thị nội dung document lên chat

2. PARALLEL (2 calls đồng thời) — SAU KHI mc_save thành công:

   a. BẮT BUỘC mc_validate. Không skip.
      mc_validate({
        filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md"
      })

      Phân loại kết quả validate (RISK-007):
      - ERROR → ⛔ BLOCKING: DỪNG. Sửa lỗi, save lại, validate + traceability lại cho đến khi PASS.
      - WARNING "format_warning" (IDs không sequential, header level) → bỏ qua nếu nội dung đúng
      - WARNING "content_warning" (thiếu BR coverage, AC mơ hồ) → BẮT BUỘC fix trước khi tiếp tục
      - ⛔ BLOCKING — Nếu bất kỳ ERROR nào còn tồn tại → DỪNG. Không tiếp tục module tiếp theo.

   b. BẮT BUỘC đăng ký TẤT CẢ IDs vào traceability. Không skip.
      mc_traceability({
        action: "register",
        source: "URS-{MOD}.md",
        ids: ["US-{MOD}-001", ..., "FT-{MOD}-001", ..., "AC-{MOD}-001-01", ..., "NFR-001", ...]
      })

      Kiểm tra sau khi đăng ký:
      ✅ US registered — tất cả US-{MOD}-NNN đã đăng ký
      ✅ FT registered — tất cả FT-{MOD}-NNN đã đăng ký
      ✅ AC registered — tất cả AC-{MOD}-NNN-XX đã đăng ký
      ✅ NFR registered — tất cả NFR-NNN đã đăng ký
      ⛔ BLOCKING — Nếu bất kỳ loại ID nào chưa đăng ký → đăng ký lại, không tiếp tục.

3. BẮT BUỘC gọi mc_checkpoint SAU MỖI module. Không gộp cuối session.
   mc_checkpoint({
     label: "requirements-{MOD}",
     sessionSummary: "Tạo URS-{MOD} với {N} US, {M} FT, {K} AC",
     nextActions: ["Chạy /mcv3:requirements cho module tiếp theo hoặc /mcv3:tech-design"]
   })

5. Show tóm tắt theo OUTPUT DISPLAY PROTOCOL:
   📄 Đã lưu: {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md
      → {N} User Stories (US-{MOD}-001 → US-{MOD}-{NNN})
      → {M} Functional Requirements (FT-{MOD}-001 → FT-{MOD}-{MMM})
      → {K} Acceptance Criteria
      → {J} Non-Functional Requirements
      ⚠️ {X} quyết định cần review (xem DECISION-LOG)
```

---

## Phase 6 — Multi-Module Auto Loop

Nếu còn modules khác cần URS, tự chuyển sang module tiếp theo theo dependency order:

```
BẮT BUỘC mc_checkpoint({ label: "requirements-{MOD}", ... }) sau mỗi module (đã làm ở Phase 5)
→ Tự load BIZ-POLICY module tiếp theo
→ Lặp lại Phase 2-5 cho module tiếp theo
→ Cho đến khi tất cả modules có URS

Sau khi hoàn thành TẤT CẢ modules:
→ PHẢI CHẠY Pre-Completion Verification (xem bên dưới)
→ Nếu Pre-Completion Verification PASS → hiển thị Completion Report
→ Nếu FAIL → sửa lỗi, chạy lại verification, không hiển thị Completion Report cho đến khi PASS
```

---

## Pre-Completion Verification (BẮT BUỘC — RISK-004)

⛔ **BẮT BUỘC chạy section này trước Completion Report. Không bỏ qua.**

Được gọi trong Phase 6 sau khi hoàn thành tất cả modules (xem auto-mode-protocol.md Phase 2.5).
Lưu ý: Phase 4 "AC Quality Validation Checklist" đã cover Tầng 1 nội bộ. Section này bổ sung Cross-Document verification.

### Tầng 1 — Self-Verification (tham chiếu Phase 4 — AC Quality Validation Checklist)

> **SPEED NOTE:** Phase 4 đã chạy AC Quality Validation Checklist cho từng module trước khi save và phải PASS trước khi được tiếp tục. Tầng 1 này **KHÔNG re-run lại từ đầu** — chỉ xác nhận nhanh.

```
Xác nhận nhanh (không re-check toàn bộ):
  ✓ Phase 4 đã PASS cho TẤT CẢ modules — không có module nào bỏ qua bước này
  ✓ Quick scan: không còn placeholder "TBD", "TODO", "[fill]" trong bất kỳ URS nào
  ✓ NFR IDs: kiểm tra không trùng NFR-NNN cross-module (shared namespace)

Nếu bất kỳ module nào đã BỎ QUA Phase 4 → chạy lại Phase 4 cho module đó trước khi tiếp tục.
```

### Tầng 2 — Cross-Document

```
  ✓ BR-IDs referenced trong URS có trong BIZ-POLICY (không có "orphan BR refs")
  ✓ Tất cả BR-IDs từ BIZ-POLICY-{MOD} đã được cover bởi ≥ 1 US
  ✓ ENT-IDs trong US/FT match với DATA-DICTIONARY
  ✓ Actors trong US match với Stakeholders từ PROJECT-OVERVIEW
```

### Tầng 3 — Quality Gate

```
✅ Tất cả BR-IDs từ BIZ-POLICY có ≥ 1 US tương ứng
✅ Tất cả US có ≥ 1 FT tương ứng
✅ AC Coverage 100%: không có US nào thiếu AC
✅ mc_validate PASS (đã confirm tại Phase 5 mỗi module — KHÔNG re-run. Nếu Phase 5 có BLOCKING error → đã sửa và re-validate trước khi đến đây)
✅ mc_traceability registered — TẤT CẢ 4 loại IDs:
   ✅ US registered
   ✅ FT registered
   ✅ AC registered
   ✅ NFR registered

⛔ BLOCKING — Nếu bất kỳ item nào FAIL → DỪNG. Sửa lỗi trước. Không hiển thị Completion Report.
```

---

## Post-Gate

```
✅ Ít nhất 1 URS đã saved
✅ Tất cả URS đã validate không có ERRORs
✅ IDs đã đăng ký trong traceability (US + FT + AC + NFR)
✅ Traceability matrix có BR → US → FT mapping
✅ Mỗi US có Acceptance Criteria
✅ Pre-Completion Verification PASS

⛔ BLOCKING — Nếu bất kỳ item nào FAIL → DỪNG. Không chuyển sang /mcv3:tech-design.

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:requirements
═══════════════════════════════════════════════

✅ Đã tạo {N} URS files:
   1. URS-{MOD1}.md — {X} US, {M} FT, {K} AC
   2. URS-{MOD2}.md — ...

⚠️ {D} quyết định đã tự xử lý (xem DECISION-LOG)
📋 Tất cả files trong .mc-data/{SYS}/P1-REQUIREMENTS/

🔜 Bước tiếp theo: /mcv3:tech-design — Thiết kế kỹ thuật MODSPEC

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:tech-design
═══════════════════════════════════════════════
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification:** Section này kiểm tra nhanh GIỮA các internal phases (phòng tránh lỗi lan sang bước tiếp). Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ để chuẩn bị Completion Report.

### Sau Phase 1 → trước Phase 2 (Context Loading):
- ✓ Module list đầy đủ: không thiếu module nào có BIZ-POLICY tương ứng
- ✓ Dependency order hợp lý: Auth/Master data trước, Business modules sau, Integration modules cuối
- ✓ **Large project (5+ modules):** BẮT BUỘC checkpoint trước Phase 2 — sau đó process từng module riêng biệt, không load tất cả BIZ-POLICY cùng lúc

### Sau Phase 2 → trước Phase 3 (Draft URS):
- ✓ Đã extract đủ BR-IDs từ BIZ-POLICY (không bỏ sót BR nào)
- ✓ Đã identify Use Cases từ TO-BE flows trong PROCESS-{MOD}.md (nếu PROCESS có)
- ✓ Không có BR nào "orphan" (không map được sang US nào) — nếu có: ghi DECISION giải thích lý do

### Sau Phase 3 → trước Phase 4 (Completeness Validation):
- ✓ Traceability matrix draft đã có: BR → US → FT mapping (dù chưa hoàn chỉnh)
- ✓ Tất cả US có ít nhất 1 AC draft (không có US không có AC)
- ✓ NFR section không rỗng (≥ 1 NFR với số liệu cụ thể, không chỉ "đáp ứng yêu cầu")

### Sau Phase 4 → trước Phase 5 (Save):
- ✓ AC Quality Validation Checklist PASS (xem Phase 4) — không có AC mơ hồ còn sót
- ✓ Tất cả BR-IDs có ≥ 1 US tương ứng (100% BR coverage)
- ✓ Tất cả US có ≥ 1 FT tương ứng (100% US → FT)
- ✓ **Large project:** Nếu module này có dependency với module khác → ghi INT-REQ note trong URS: "FT-X-001 yêu cầu dữ liệu/API từ Module Y"

### Output Readiness → `/mcv3:tech-design`:
- ✓ Mỗi BR-ID từ BIZ-POLICY có ≥ 1 US implement nó — không có BR "mồ côi" không được implement
- ✓ AC đủ cụ thể để tech-design biết cần API nào (AC phải rõ hành động: create/update/delete/query)
- ✓ NFR có số liệu cụ thể: performance target, security requirements — tech-design cần để chọn architecture phù hợp
- ✓ **Large project (5+ modules):** Traceability chain intact — kiểm tra trước khi chuyển phase: mỗi module có đủ URS, không có module nào chỉ có BIZ-POLICY mà thiếu URS

---

## Quy tắc viết Requirements

```
USER-CENTRIC: US theo format "As a {role}, I want {action}, so that {benefit}"
TESTABLE: AC phải đủ cụ thể để tester viết test case từ đó
TRACEABLE: Mọi US/FT đều có origin BR hoặc PROC
CONSISTENT: IDs nhất quán trong namespace {MOD}
COMPLETE: Không để placeholder trống — ghi DECISION với Confidence: LOW khi dùng default, không dùng "TBD" chung chung
ATOMIC: Mỗi FT một trách nhiệm duy nhất
MEASURABLE: NFR PHẢI có số liệu cụ thể (không "nhanh" mà PHẢI "<2s")
```
