# Requirements Skill — `/mcv3:requirements`

## Mục đích

Chuyển **Business Docs (Phase 3)** thành **User Requirements Specification (URS)** — Phase 4.

Với mỗi module/system, tạo file `URS-{MOD}.md` gồm:
- **User Stories** với formal ID `US-{MOD}-NNN`
- **Functional Requirements** với ID `FT-{MOD}-NNN`
- **Acceptance Criteria** với ID `AC-{MOD}-NNN-XX`
- **Non-Functional Requirements** với ID `NFR-NNN`
- **Use Cases** với ID `UC-{MOD}-NNN-XX`

Sử dụng **Guided Generation Protocol**: agent tạo draft → user review → hoàn chỉnh.

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

## Khi nào dùng skill này

- Sau khi `/mcv3:biz-docs` hoàn thành (có BIZ-POLICY + PROCESS + DATA-DICTIONARY)
- Cần chuyển Business Rules thành User Stories có thể implement được
- Cần formal requirements với Acceptance Criteria để làm căn cứ QA

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project và phase hiện tại
2. Kiểm tra BIZ-POLICY đã có ít nhất 1 file
3. Tải PROJECT-OVERVIEW.md (layer: 2) → nắm bối cảnh
4. mc_list({ subPath: "_PROJECT/BIZ-POLICY" }) → liệt kê domains có BIZ-POLICY
5. Hỏi user: "Bạn muốn viết URS cho system/module nào trước?
   Ví dụ: ERP/Kho hàng, WEB/Bán hàng, MOB/Giao hàng..."
```

**Nếu thiếu BIZ-POLICY:**
```
⚠️ Chưa tìm thấy BIZ-POLICY trong _PROJECT/BIZ-POLICY/.
   Hãy chạy /mcv3:biz-docs trước để tạo Business Rules.
```

---

## Phase 1 — System/Module Selection

User xác nhận system code và module cần làm URS.

**Xác định:**
- `{SYSTEM}` — mã hệ thống (VD: ERP, WEB, MOB-STAFF)
- `{MOD}` — mã module (VD: INV, SALES, WH, HR)
- Tên đầy đủ của module

**Ví dụ:**
```
User: "Làm ERP, module Kho hàng (WH) trước"
→ SYSTEM = "ERP"
→ MOD = "WH"
→ Tên: "Warehouse — Quản lý kho hàng"
→ Output: ERP/P1-REQUIREMENTS/URS-WH.md
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

### 3b. Guided Generation Protocol

Tạo draft với placeholder rõ ràng, sau đó hỏi user từng phần:

```
"📋 Draft URS-WH có {N} User Stories và {M} Functional Requirements.

Hãy review và bổ sung:

1. US-WH-001 (Tạo phiếu nhập kho):
   - Acceptance Criteria có đủ chưa? Còn edge cases nào?
   - VD: Điều gì xảy ra khi số lượng nhập > PO?

2. US-WH-003 (FIFO xuất kho):
   - System có cần alert khi hết hàng không?
   - Batch export hay từng item?

3. NFR: Hệ thống cần xử lý bao nhiêu giao dịch/ngày?
   - Hiệu năng cụ thể? (VD: <2s response time)"
```

---

## Phase 4 — Enrichment Loop

Lặp lại cho đến khi user hài lòng:

```
WHILE user muốn bổ sung:
  1. Nhận input từ user
  2. Cập nhật URS draft:
     - Thêm AC mới
     - Refine FT descriptions
     - Thêm NFR nếu user mention
     - Cập nhật priority
  3. Re-present phần đã thay đổi

UNTIL user confirm "OK, tiếp tục"
```

**Kiểm tra completeness trước khi finalize:**
```
✓ Mỗi US có ít nhất 2 AC
✓ Mỗi BR có ít nhất 1 US tương ứng
✓ Priority đã assign cho tất cả
✓ NFR có ít nhất 3 requirements (Performance, Security, Usability)
✓ Traceability matrix đầy đủ
```

---

## Phase 5 — Save & Register

```
1. mc_save({
     filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md",
     documentType: "urs"
   })

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
```

---

## Phase 6 — Multi-Module Loop

Nếu còn modules khác cần URS:

```
"✅ URS-{MOD} hoàn thành! ({N} User Stories, {M} Functional Requirements)

Bạn muốn tiếp tục với module nào?
□ [List các modules từ BIZ-POLICY chưa có URS]
□ Đã xong — chuyển sang /mcv3:tech-design"
```

---

## Post-Gate

```
✅ Ít nhất 1 URS đã saved
✅ Tất cả URS đã validate không có ERRORs
✅ IDs đã đăng ký trong traceability
✅ Traceability matrix có BR → US → FT mapping
✅ Mỗi US có Acceptance Criteria

→ "✅ Phase 4 Requirements hoàn thành!
   Đã tạo {N} URS files với tổng {X} User Stories và {Y} Functional Requirements.
   Tiếp theo: /mcv3:tech-design để thiết kế kỹ thuật."
```

---

## Quy tắc viết Requirements

```
USER-CENTRIC: US theo format "As a {role}, I want {action}, so that {benefit}"
TESTABLE: AC phải đủ cụ thể để tester viết test case từ đó
TRACEABLE: Mọi US/FT đều có origin BR hoặc PROC
CONSISTENT: IDs nhất quán trong namespace {MOD}
COMPLETE: Không để placeholder — ghi "TBD" nếu chưa biết + note lý do
ATOMIC: Mỗi FT một trách nhiệm duy nhất
MEASURABLE: NFR phải có số liệu cụ thể (không "nhanh" mà phải "<2s")
```
