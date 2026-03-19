# Biz-Docs Skill — `/mcv3:biz-docs`

## Mục đích

Tạo bộ **tài liệu nghiệp vụ đầy đủ** (Phase 3):
- `BIZ-POLICY-{DOMAIN}.md` — Chính sách nghiệp vụ (Business Rules)
- `PROCESS-{DOMAIN}.md` — Quy trình AS-IS & TO-BE
- `DATA-DICTIONARY.md` — Từ điển dữ liệu

Sử dụng **Guided Generation protocol**: doc-writer tạo skeleton → user review & enrich → hoàn chỉnh.

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

## Khi nào dùng skill này

- Sau khi `/mcv3:expert-panel` hoàn thành (hoặc ít nhất có PROJECT-OVERVIEW.md)
- Muốn có Business Rules trước khi viết URS
- Cần formalize quy trình nghiệp vụ

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project
2. Kiểm tra PROJECT-OVERVIEW.md đã có
3. Kiểm tra EXPERT-LOG.md — nếu có: load để lấy recommendations
4. Hỏi user: "Bạn muốn tạo tài liệu cho domain nào trước?
   (VD: Bán hàng, Kho, HR, Tài chính, Vận chuyển...)"
```

---

## Phase 1 — Domain Selection & Scope

User chọn domain(s) cần tạo tài liệu.

**Ví dụ:**
```
User: "Làm cho bộ phận Kho và Bán hàng trước"
→ Domain list: ["WH" (Warehouse), "SALES"]
→ Sẽ tạo:
   - BIZ-POLICY-WH.md + BIZ-POLICY-SALES.md
   - PROCESS-WH.md + PROCESS-SALES.md
   - DATA-DICTIONARY.md (chung cho tất cả)
```

---

## Phase 2 — Guided Generation (Per Domain)

Với mỗi domain, áp dụng Guided Generation Protocol:

### 2a. Load skeleton + context

```
Đọc skeleton phù hợp:
  - Logistics: references/skeleton/process-skeleton.md
  - Retail: references/skeleton/sales-skeleton.md
  - General: references/skeleton/pricing-skeleton.md (nếu có pricing)

Load industry knowledge nếu có:
  - references/industry/{domain}.md
  - Available: fnb, logistics, retail, healthcare, fintech, ecommerce, saas
  - Nội dung bao gồm: KPIs, business processes, compliance requirements,
    common BRs, pain points, data dictionary suggestions
```

### 2b. Generate skeleton document

Doc-writer tạo skeleton BIZ-POLICY với:
- Tên và format đúng
- Sections đầy đủ
- BR-IDs placeholder (BR-{DOM}-XXX)
- Gợi ý nội dung dựa trên PROJECT-OVERVIEW + EXPERT-LOG

**Ví dụ skeleton BIZ-POLICY-WH:**

```markdown
# BIZ-POLICY-WH — Chính sách Kho hàng
<!-- Draft skeleton — cần user review và bổ sung -->

## BR-WH-001: Kiểm soát nhập kho
**Quy tắc:** [Chờ xác nhận từ user — VD: Mọi hàng nhập kho phải có GRN trước]
**Áp dụng cho:** Thủ kho, Kế toán
**Ngoại lệ:** [?]

## BR-WH-002: FIFO xuất kho
**Quy tắc:** Hàng nhập trước xuất trước
**Áp dụng cho:** Thủ kho
**Ngoại lệ:** [?]

...
```

### 2c. Present to user — Review conversation

Trình bày skeleton và hỏi:

```
"📄 Tôi đã tạo draft BIZ-POLICY-WH với {N} business rules.
Hãy review và cho tôi biết:

1. BR-WH-001: Kiểm soát nhập kho — Quy tắc cụ thể của bạn là gì?
2. BR-WH-002: FIFO — Có ngoại lệ nào không? (VD: hàng urgent)
3. Có Business Rules quan trọng nào tôi chưa đề cập không?"
```

### 2d. Enrich document

Dựa vào câu trả lời của user → update document:
- Điền nội dung cụ thể
- Thêm BR mới nếu user mention
- Cập nhật ngoại lệ / điều kiện

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

3. **Guided generation:**

```
"Tôi đã nhận dạng {N} thuật ngữ/entities cần định nghĩa:
- TERM-001: Lô hàng — [Bạn muốn định nghĩa như thế nào?]
- ENT-001: Khách hàng — [Attributes quan trọng là gì?]
..."
```

---

## Phase 5 — Save & Validate All

```
Với mỗi document:
1. mc_save({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md", documentType: "biz-policy" })
2. mc_save({ filePath: "_PROJECT/PROCESS/PROCESS-{DOM}.md", documentType: "process" })

Cuối cùng:
3. mc_save({ filePath: "_PROJECT/DATA-DICTIONARY.md", documentType: "data-dictionary" })
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

→ "✅ Phase 3 Business Docs hoàn thành!
   Tiếp theo: /mcv3:requirements để viết URS."
```

---

## Quy tắc Guided Generation

```
COLLABORATIVE: Luôn hỏi user trước khi điền nội dung quan trọng
SPECIFIC: Không để placeholder — ghi "Chưa xác định" nếu chưa biết
DOMAIN-AWARE: Load industry knowledge phù hợp
ID-CONSISTENT: Các BRs trong BIZ-POLICY và PROCESS phải cùng namespace
INCREMENTAL: Có thể tạo từng domain một, không cần làm tất cả cùng lúc
```
