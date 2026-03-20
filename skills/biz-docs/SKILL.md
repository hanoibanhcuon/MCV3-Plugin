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
1. mc_status() → xác nhận project
2. Kiểm tra PROJECT-OVERVIEW.md đã có
3. Kiểm tra EXPERT-LOG.md — nếu có: load để lấy recommendations
4. Tự xác định domain list từ SC-IN IDs trong PROJECT-OVERVIEW + EXPERT-LOG
   → Không hỏi user — tự detect tất cả domains cần làm
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
Với mỗi document (KHÔNG hiển thị nội dung lên chat — chỉ show tóm tắt sau mc_save):

1. mc_save({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md", documentType: "biz-policy" })
   → 📄 Đã lưu: BIZ-POLICY-{DOM}.md — {N} Business Rules (BR-{DOM}-001 → BR-{DOM}-{NNN})

2. mc_save({ filePath: "_PROJECT/PROCESS/PROCESS-{DOM}.md", documentType: "process" })
   → 📄 Đã lưu: PROCESS-{DOM}.md — {M} quy trình (AS-IS + TO-BE)

Cuối cùng:
3. mc_save({ filePath: "_PROJECT/DATA-DICTIONARY.md", documentType: "data-dictionary" })
   → 📄 Đã lưu: DATA-DICTIONARY.md — {K} TERM, {J} ENT, {L} ENUM

4. mc_validate({ filePath: ... }) cho mỗi file

5. mc_checkpoint({
     label: "sau-biz-docs",
     sessionSummary: "Tạo {N} BIZ-POLICY + {N} PROCESS + DATA-DICTIONARY",
     nextActions: ["Chạy /mcv3:requirements để viết URS cho từng module"]
   })
```

---

## Post-Gate

```
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

## Quy tắc Guided Generation

```
AUTO-COMPLETE: Tự điền nội dung theo industry knowledge — ghi DECISION khi không chắc chắn, không dừng hỏi user
SPECIFIC: Không để placeholder — ghi "Chưa xác định" nếu chưa biết
DOMAIN-AWARE: Load industry knowledge phù hợp
ID-CONSISTENT: Các BRs trong BIZ-POLICY và PROCESS phải cùng namespace
INCREMENTAL: Có thể tạo từng domain một, không cần làm tất cả cùng lúc
```
