# BIZ-POLICY: {{TÊN_LĨNH_VỰC}}
<!-- ============================================================
     CHÍNH SÁCH NGHIỆP VỤ — 1 file per lĩnh vực (domain)
     Ví dụ: BIZ-POLICY-SALES.md, BIZ-POLICY-HR.md
     Đây là "đầu bài" mà code PHẢI tuân thủ.
     Module Spec sẽ tham chiếu [REF: BIZ-POLICY-{DOMAIN} → BR-XXX]

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  EXPERT-LOG.md, PROJECT-OVERVIEW.md
       Key IDs: BR-{DOMAIN}-XXX (phân loại theo số range)
         001-009: Validation  010-019: Calculation
         020-029: Workflow    030-039: Authorization
         040-049: Constraints
       Output: MODSPEC, URS tham chiếu đến đây
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu đầu bài (Business Input)
> **Lĩnh vực:** {{DOMAIN_NAME}}
> **Áp dụng cho systems:** {{DANH_SÁCH_SYSTEMS}}
> **Nguồn thông tin:** {{STAKEHOLDER / EXPERT SESSION}}
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Business context
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-{{N}}] — Expert session nguồn gốc

### Tài liệu tham chiếu file này:
- [REF: {SYSTEM}/P1-REQUIREMENTS/URS-{{MODULE}}.md] — User stories dựa trên rules này
- [REF: {SYSTEM}/P2-DESIGN/MODSPEC-{{MODULE}}.md → Section 2] — Implementation

---

## 1. TỔNG QUAN LĨNH VỰC

**Mô tả:** {{MÔ_TẢ_NGẮN_VỀ_LĨNH_VỰC_NGHIỆP_VỤ_NÀY}}

**Bộ phận liên quan:** {{CÁC_BỘ_PHẬN}}

**Người chịu trách nhiệm chính sách:** {{TÊN/VAI_TRÒ}}

---

## 2. BUSINESS RULES (Quy tắc nghiệp vụ)

### 2.1. Quy tắc xác thực (Validation Rules — BR-{DOM}-001..009)

| Mã | Quy tắc | Điều kiện | Logic (pseudo-code) | Ưu tiên |
|----|---------|----------|---------------------|---------|
| BR-{{DOM}}-001 | {{QUY_TẮC}} | {{ĐIỀU_KIỆN}} | `if (!condition) throw Error("msg")` | Must |

### 2.2. Quy tắc tính toán (Calculation Rules — BR-{DOM}-010..019)

| Mã | Quy tắc | Công thức | Ví dụ | Ưu tiên |
|----|---------|----------|-------|---------|
| BR-{{DOM}}-010 | {{QUY_TẮC}} | `result = formula` | {{VÍ_DỤ}} | Must |

### 2.3. Quy tắc luồng xử lý (Workflow Rules — BR-{DOM}-020..029)

| Mã | Quy tắc | Trạng thái từ | Trạng thái đến | Điều kiện | Actor |
|----|---------|-------------|--------------|----------|-------|
| BR-{{DOM}}-020 | {{QUY_TẮC}} | {{FROM}} | {{TO}} | {{CONDITION}} | {{ROLE}} |

### 2.4. Quy tắc phân quyền (Authorization Rules — BR-{DOM}-030..039)

| Mã | Quy tắc | Vai trò được phép | Hành động | Phạm vi |
|----|---------|-----------------|---------|--------|
| BR-{{DOM}}-030 | {{QUY_TẮC}} | {{ROLES}} | {{ACTION}} | {{SCOPE}} |

### 2.5. Ràng buộc dữ liệu (Constraints — BR-{DOM}-040..049)

| Mã | Ràng buộc | Loại | Chi tiết |
|----|----------|------|---------|
| BR-{{DOM}}-040 | {{RÀNG_BUỘC}} | Unique/Range/Format/Required | {{CHI_TIẾT}} |

---

## 3. EXCEPTIONS & SPECIAL CASES

| # | Tình huống đặc biệt | Xử lý | Quy tắc áp dụng |
|---|-------------------|-------|----------------|
| 1 | {{TÌNH_HUỐNG}} | {{XỬ_LÝ}} | [REF: BR-{{DOM}}-XXX] |

---

## 4. COMPLIANCE & REGULATORY

<!-- Các quy định pháp lý/ngành phải tuân thủ liên quan đến domain này -->

| Quy định | Nội dung | Áp dụng cho | Penality nếu vi phạm |
|---------|---------|-----------|---------------------|
| {{REGULATION}} | {{CONTENT}} | {{SCOPE}} | {{PENALTY}} |

---

## 5. CHANGELOG

| Phiên bản | Ngày | Thay đổi |
|-----------|------|---------|
| 1.0 | {{DATE}} | Tạo mới |
