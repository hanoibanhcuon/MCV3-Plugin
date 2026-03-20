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
  - _PROJECT/BIZ-POLICY/*.md (Phase 3 — bắt buộc)
  - _PROJECT/PROCESS/*.md (Phase 3 — khuyến nghị)
  - _PROJECT/DATA-DICTIONARY.md (Phase 3 — khuyến nghị)
  - _PROJECT/EXPERT-LOG.md (Phase 2 — optional, nếu có)
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

**BIZ-POLICY chưa có:**
- Báo user: "Chưa tìm thấy BIZ-POLICY trong _PROJECT/BIZ-POLICY/. Chạy /mcv3:biz-docs trước để tạo Business Rules."
- Exception: Nếu user confirm "bỏ qua biz-docs" → tiếp tục nhưng US/FT sẽ không có BR origin

**BIZ-POLICY có nhưng PROCESS thiếu:**
- Tiếp tục với BIZ-POLICY, note rằng Use Cases sẽ ít chi tiết hơn
- Sau khi xong URS, nhắc user: "Nên tạo PROCESS-{MOD}.md để enrichment Use Cases."

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project và phase hiện tại
2. Kiểm tra BIZ-POLICY đã có ít nhất 1 file
3. Tải PROJECT-OVERVIEW.md (layer: 2) → nắm bối cảnh
4. mc_list({ subPath: "_PROJECT/BIZ-POLICY" }) → liệt kê domains có BIZ-POLICY
5. Tự xác định module order:
   - Domains trong BIZ-POLICY → map sang modules
   - Dependency order: Core modules (Auth, Master data) → Business modules → Integration
   - Xử lý từng module theo order, không hỏi user
```

**Nếu thiếu BIZ-POLICY:**
```
⚠️ Chưa tìm thấy BIZ-POLICY trong _PROJECT/BIZ-POLICY/.
   Hãy chạy /mcv3:biz-docs trước để tạo Business Rules.
```

---

## Phase 1 — System/Module Auto-Detection

Tự xác định system code và modules từ BIZ-POLICY files available.

**Tự xác định từ BIZ-POLICY:**
```
mc_list({ subPath: "_PROJECT/BIZ-POLICY" })
→ BIZ-POLICY-WH.md → SYSTEM = "ERP", MOD = "WH"
→ BIZ-POLICY-SALES.md → SYSTEM = "ERP", MOD = "SALES"
→ ... (tất cả domains có BIZ-POLICY)

Nếu user đã chỉ định system/module trong message → ưu tiên theo đó
```

**Kiểm tra BIZ-POLICY tương ứng:**
```
mc_load({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-WH.md", layer: 3 })
mc_load({ filePath: "_PROJECT/PROCESS/PROCESS-WH.md", layer: 3 })
```

---

## Phase 2 — Context Loading & Analysis

### 2a. Load toàn bộ context liên quan

```
1. mc_load({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{MOD}.md", layer: 3 })
2. mc_load({ filePath: "_PROJECT/PROCESS/PROCESS-{MOD}.md", layer: 3 })
3. mc_load({ filePath: "_PROJECT/DATA-DICTIONARY.md", layer: 2 })
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

2. mc_validate({
     filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md"
   })
   → Xử lý WARNING/ERROR nếu có

3. mc_traceability({
     action: "register",
     source: "URS-{MOD}.md",
     ids: ["US-{MOD}-001", "FT-{MOD}-001", "AC-{MOD}-001-01", "NFR-001", ...]
   })
   → Đăng ký tất cả IDs (US, FT, AC, NFR) vào traceability matrix

4. mc_checkpoint({
     label: "sau-urs-{mod}",
     sessionSummary: "Tạo URS-{MOD} với {N} US, {M} FT",
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
mc_checkpoint({ label: "sau-urs-{mod}", ... })
→ Tự load BIZ-POLICY module tiếp theo
→ Lặp lại Phase 2-5 cho module tiếp theo
→ Cho đến khi tất cả modules có URS
→ Báo cáo tổng hợp sau khi xong tất cả
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5).
Lưu ý: Phase 4 "AC Quality Validation Checklist" đã cover Tầng 1 nội bộ. Section này bổ sung Cross-Document verification.

### Tầng 1 — Self-Verification (tham chiếu Phase 4 — AC Quality Validation Checklist)

```
Format & IDs:
  ✓ US IDs: US-{MOD}-NNN format, sequential
  ✓ FT IDs: FT-{MOD}-NNN format
  ✓ AC IDs: AC-{MOD}-NNN-XX format (XX = 01, 02, ...)
  ✓ NFR IDs: NFR-NNN format (shared namespace cross-modules)
  ✓ Không có placeholder: "TBD", "TODO", "[fill]" → reject

Content (chi tiết tại Phase 4 AC Quality Validation Checklist):
  ✓ Mỗi US có ≥ 2 ACs (Happy Path + Error Case tối thiểu)
  ✓ Mỗi AC có đủ Given/When/Then với kết quả đo lường được
  ✓ NFR có số liệu cụ thể (<Xs, 99.X% uptime)
  ✓ Traceability Matrix đầy đủ (BR → US → FT → AC)
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
✅ mc_validate PASS
✅ mc_traceability registered (US, FT, AC, NFR đã đăng ký)
```

---

## Post-Gate

```
✅ Ít nhất 1 URS đã saved
✅ Tất cả URS đã validate không có ERRORs
✅ IDs đã đăng ký trong traceability
✅ Traceability matrix có BR → US → FT mapping
✅ Mỗi US có Acceptance Criteria

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

## Quy tắc viết Requirements

```
USER-CENTRIC: US theo format "As a {role}, I want {action}, so that {benefit}"
TESTABLE: AC phải đủ cụ thể để tester viết test case từ đó
TRACEABLE: Mọi US/FT đều có origin BR hoặc PROC
CONSISTENT: IDs nhất quán trong namespace {MOD}
COMPLETE: Không để placeholder trống — ghi DECISION với Confidence: LOW khi dùng default, không dùng "TBD" chung chung
ATOMIC: Mỗi FT một trách nhiệm duy nhất
MEASURABLE: NFR phải có số liệu cụ thể (không "nhanh" mà phải "<2s")
```
