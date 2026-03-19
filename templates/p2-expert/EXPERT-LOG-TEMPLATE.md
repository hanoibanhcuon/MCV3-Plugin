# EXPERT-LOG
<!-- ============================================================
     LOG PHIÊN BRAINSTORM VỚI CHUYÊN GIA (Expert Agent Sessions)
     Tài liệu dạng append — thêm phiên mới ở cuối file.
     Ý kiến chuyên gia được tổng hợp vào URS/BIZ-POLICY tương ứng
     với [REF: EXPERT-LOG → SESSION-XXX].

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md
       Output: Đóng góp vào BIZ-POLICY, PROCESS, DATA-DICTIONARY
       Key IDs: SESSION-XXX
       Update: Append sau mỗi phiên expert, bởi /mcv3:expert-panel
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu ghi chú (Working Document)
> **Ngày tạo:** {{CREATED_DATE}}
> **Cập nhật lần cuối:** {{LAST_UPDATED}}

---

## HƯỚNG DẪN SỬ DỤNG

1. Mỗi phiên brainstorm = 1 SESSION block mới (append cuối file)
2. Mỗi session có mã `SESSION-XXX` để tham chiếu
3. Ý kiến quan trọng được đánh dấu `[ACTION]` và ghi rõ tài liệu đích
4. Sau mỗi session, tổng hợp các action items vào tài liệu tương ứng
5. Khi đã tổng hợp xong, đánh dấu `[DONE → REF: ...]`

---

## SESSION-001: {{TÊN_PHIÊN}}

| Mục | Nội dung |
|-----|---------|
| **Ngày** | {{DATE}} |
| **Chuyên gia** | {{AGENT_NAME}} (Strategy / Finance / Domain Expert) |
| **Chủ đề** | {{CHỦ_ĐỀ_CHÍNH}} |
| **Dựa trên** | [REF: PROJECT-OVERVIEW.md → PROB-XXX] |

### 1. Phân tích bối cảnh

{{NỘI_DUNG_PHÂN_TÍCH}}

### 2. Khuyến nghị chính

| # | Khuyến nghị | Mức độ ưu tiên | Tài liệu đích |
|---|------------|---------------|--------------|
| 1 | {{KHUYẾN_NGHỊ}} | High/Medium/Low | [ACTION → BIZ-POLICY-{{DOM}}.md] |

### 3. Business Rules được xác định

| Mã tạm | Quy tắc | Áp dụng cho | Status |
|--------|---------|-----------|--------|
| BR-{{DOM}}-001 | {{QUY_TẮC}} | {{MODULE}} | [ACTION → BIZ-POLICY-{{DOM}}.md] |

### 4. Rủi ro và lưu ý

| Rủi ro | Mức độ | Giải pháp đề xuất |
|--------|--------|-----------------|
| RISK-001 | High/Medium/Low | {{GIẢI_PHÁP}} |

### 5. Action Items

| # | Action | Tài liệu đích | Người thực hiện | Status |
|---|--------|--------------|----------------|--------|
| 1 | {{ACTION}} | [ACTION → {{FILE}}] | MCV3 Auto | ⏳ / [DONE → REF: {{FILE}} → {{SECTION}}] |

---

<!-- THÊM SESSION MỚI Ở ĐÂY (append) -->
