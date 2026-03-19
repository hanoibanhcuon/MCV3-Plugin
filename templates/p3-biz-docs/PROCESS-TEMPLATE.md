# PROCESS: {{TÊN_QUY_TRÌNH}}
<!-- ============================================================
     QUY TRÌNH NGHIỆP VỤ — AS-IS & TO-BE gộp chung 1 file
     Ví dụ: PROCESS-SALES.md, PROCESS-WAREHOUSE.md
     Giúp AI hiểu flow nghiệp vụ trước khi code.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md (PROB-XXX), Expert sessions
       Key IDs: PROC-XXX, PAIN-{DOM}-XXX
       Output: URS User Stories phản ánh TO-BE flow
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu quy trình (Process Document)
> **Lĩnh vực:** {{DOMAIN_NAME}}
> **Áp dụng cho systems:** {{DANH_SÁCH_SYSTEMS}}
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md → PROB-{{XXX}}] — Vấn đề quy trình này giải quyết
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-{{DOM}}.md] — Rules áp dụng trong quy trình

### Tài liệu tham chiếu file này:
- [REF: {SYSTEM}/P1-REQUIREMENTS/URS-{{MODULE}}.md → Use Cases] — TO-BE flow → UC

---

## 1. TỔNG QUAN QUY TRÌNH

| Mục | Nội dung |
|-----|---------|
| **Tên quy trình** | {{TÊN}} |
| **Mã quy trình** | PROC-{{DOMAIN}}-{{SEQ}} |
| **Mục tiêu** | {{MỤC_TIÊU}} |
| **Phạm vi** | {{BẮT_ĐẦU_TỪ}} → {{KẾT_THÚC_KHI}} |
| **Actors** | {{DANH_SÁCH_VAI_TRÒ}} |
| **Tần suất** | {{TẦN_SUẤT}} |
| **SLA** | {{THỜI_GIAN_XỬ_LÝ_TỐI_ĐA}} |

---

## 2. QUY TRÌNH HIỆN TẠI (AS-IS)

### 2.1. Flow tổng quan

```
[Bước 1: {{ACTION}}] → [Bước 2: {{ACTION}}] → ... → [Kết thúc]
     ({{ACTOR}})            ({{ACTOR}})
```

### 2.2. Chi tiết từng bước

| Bước | Hành động | Actor | Công cụ hiện tại | Thời gian |
|------|---------|-------|-----------------|---------|
| 1 | {{ACTION}} | {{ROLE}} | Excel / Email / Manual | {{TIME}} |

### 2.3. Pain Points (Điểm đau)

| Mã | Pain Point | Bước liên quan | Ảnh hưởng | Mức độ |
|----|-----------|---------------|---------|--------|
| PAIN-{{DOM}}-001 | {{PAIN}} | Bước {{N}} | {{IMPACT}} | High/Med/Low |

---

## 3. QUY TRÌNH MỚI (TO-BE)

### 3.1. Flow tổng quan

```
[Bước 1: {{ACTION}}] → [Bước 2: {{ACTION}}] → ... → [Kết thúc]
     ({{ACTOR}})     ({{SYSTEM + ACTOR}})          (Automated)
```

### 3.2. Chi tiết từng bước

| Bước | Hành động | Actor | System xử lý | Rules áp dụng | SLA |
|------|---------|-------|-------------|--------------|-----|
| 1 | {{ACTION}} | {{ROLE}} | {{SYSTEM}} | [REF: BR-{{DOM}}-XXX] | {{TIME}} |

### 3.3. Cải tiến so với AS-IS

| Pain Point | Giải pháp TO-BE | Kết quả kỳ vọng |
|-----------|----------------|----------------|
| [REF: PAIN-{{DOM}}-001] | {{GIẢI_PHÁP}} | {{KẾT_QUẢ}} |

---

## 4. EXCEPTIONS & HANDLING

| Tình huống | Xảy ra khi | Xử lý | Thông báo cho |
|-----------|-----------|-------|--------------|
| {{EXCEPTION}} | {{CONDITION}} | {{HANDLING}} | {{NOTIFY}} |

---

## 5. KPIs ĐO LƯỜNG QUY TRÌNH

| KPI | Đơn vị | Mục tiêu | Đo bằng |
|----|--------|---------|--------|
| Thời gian xử lý | Phút/Giờ | < {{N}} | System log |
| Tỷ lệ lỗi | % | < {{N}}% | Error log |
| {{KPI}} | {{UNIT}} | {{TARGET}} | {{MEASURE}} |
