# URS: {{SYSTEM_NAME}} — {{MODULE_NAME}}
<!-- ============================================================
     ĐẶC TẢ YÊU CẦU NGƯỜI DÙNG (User Requirements Specification)
     1 file per module. Chứa: User Stories + Use Cases + Acceptance Criteria.
     Module Spec (P2) sẽ kỹ thuật hóa từ tài liệu này.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  BIZ-POLICY, PROCESS, PROJECT-OVERVIEW
       Key IDs: US-{MOD}-XXX, UC-{MOD}-XXX-XX, AC-{MOD}-XXX-XX, NFR-XXX
       Output: MODSPEC-{MODULE}.md, TEST-{MODULE}.md
       Update: Bởi /mcv3:requirements skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Yêu cầu người dùng
> **System:** {{SYS_CODE}}
> **Module:** {{MODULE_CODE}}
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Bối cảnh dự án
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-{{DOMAIN}}.md] — Chính sách nghiệp vụ

### Tham khảo:
- [REF: _PROJECT/PROCESS/PROCESS-{{DOMAIN}}.md] — Quy trình nghiệp vụ
- [REF: _PROJECT/DATA-DICTIONARY.md] — Thuật ngữ & entities
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-{{N}}] — Phiên brainstorm liên quan

### Tài liệu được sinh từ URS này:
- [OUTPUT → {{SYS_CODE}}/P2-DESIGN/MODSPEC-{{MODULE}}.md] — Module Spec
- [OUTPUT → {{SYS_CODE}}/P3-QA-DOCS/TEST-{{MODULE}}.md] — Test Spec

---

## 1. TỔNG QUAN MODULE

| Mục | Nội dung |
|-----|---------|
| **Tên module** | {{MODULE_NAME}} |
| **Mã module** | {{MODULE_CODE}} |
| **Mục tiêu** | {{MỤC_TIÊU_MODULE}} |
| **Users chính** | {{DANH_SÁCH_USERS}} |
| **Giải quyết vấn đề** | [REF: PROJECT-OVERVIEW → PROB-{{XXX}}] |

---

## 2. USER STORIES

<!-- Format: "Là [vai trò], tôi muốn [hành động], để [lợi ích]"
     Priority: Must (MVP) / Should (Important) / Could (Nice) / Won't (Out of scope)
     Ref business rules: [DERIVED-FROM: BR-{DOM}-XXX] -->

### US-{{MOD}}-001: {{TÊN_STORY}}

> **Là** {{VAI_TRÒ}}, **tôi muốn** {{HÀNH_ĐỘNG}}, **để** {{LỢI_ÍCH}}

| Mục | Nội dung |
|-----|---------|
| **Mã** | US-{{MOD}}-001 |
| **Priority** | Must / Should / Could |
| **Business Rule** | [DERIVED-FROM: BR-{{DOM}}-XXX] |
| **Estimated complexity** | S / M / L / XL |

#### Use Cases của US-{{MOD}}-001:

##### UC-{{MOD}}-001-01: {{TÊN_USE_CASE}} (Happy Path)

**Preconditions:** {{ĐIỀU_KIỆN_TRƯỚC}}

| Bước | Actor | Hành động | System phản hồi |
|------|-------|---------|----------------|
| 1 | {{ROLE}} | {{ACTION}} | {{RESPONSE}} |
| 2 | System | Auto | {{RESPONSE}} |

**Postconditions:** {{TRẠNG_THÁI_SAU}}

**Acceptance Criteria:**

| Mã | Tiêu chí | Test type |
|----|---------|----------|
| AC-{{MOD}}-001-01 | Given {{CONTEXT}}, When {{ACTION}}, Then {{RESULT}} | Unit/Integration/E2E |

##### UC-{{MOD}}-001-02: {{TÊN_USE_CASE}} (Exception Flow)

**Trigger:** {{ĐIỀU_KIỆN_NÀY_XẢY_RA}}

| Bước | Hành động | System phản hồi |
|------|---------|----------------|
| 1 | {{ACTION}} | Error: {{ERROR_MESSAGE}} |

**Acceptance Criteria:**
| Mã | Tiêu chí |
|----|---------|
| AC-{{MOD}}-001-02 | Given {{CONTEXT}}, When {{ERROR_CASE}}, Then {{ERROR_RESPONSE}} |

---

## 3. NON-FUNCTIONAL REQUIREMENTS

| Mã | Loại | Yêu cầu | Đo lường |
|----|------|---------|---------|
| NFR-001 | Performance | {{REQUIREMENT}} | {{MEASURE}} |
| NFR-002 | Security | {{REQUIREMENT}} | {{MEASURE}} |

---

## 4. CONSTRAINTS (Ràng buộc)

| # | Ràng buộc | Lý do |
|---|----------|-------|
| 1 | {{RÀNG_BUỘC}} | {{LÝ_DO}} |
