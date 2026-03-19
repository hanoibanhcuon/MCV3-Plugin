# PROJECT-OVERVIEW
<!-- ============================================================
     TỔNG QUAN DỰ ÁN — Gộp: Charter + Scope + Stakeholders + User Journey
     Đây là tài liệu đầu tiên cần hoàn thành.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  Discovery session (Phase 1)
       Output: Tất cả tài liệu khác đều tham chiếu đến đây
       Key IDs: PROB-XXX, BG-XXX, PG-XXX, UJ-XXX
       Update: Bởi /mcv3:discovery skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu cấp dự án (Project-level)
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}
> **Người tạo:** {{AUTHOR}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước: (không có — đây là tài liệu gốc)

### Tài liệu được sinh từ file này:
- [OUTPUT → PROJECT-ARCHITECTURE.md] — Kiến trúc dự án
- [OUTPUT → DATA-DICTIONARY.md] — Thuật ngữ & entities
- [OUTPUT → _PROJECT/BIZ-POLICY/*.md] — Chính sách nghiệp vụ
- [OUTPUT → {SYSTEM}/P1-REQUIREMENTS/URS-*.md] — User requirements

### Key Facts (cho Layer 0 Cache):
- **Project slug:** {{PROJECT_SLUG}}
- **Main domain:** {{DOMAIN}}
- **Systems:** {{SYSTEM_LIST}}
- **Primary problem:** [REF: PROB-001]

---

## 1. THÔNG TIN DỰ ÁN

| Mục | Nội dung |
|-----|---------|
| **Tên dự án** | {{PROJECT_NAME}} |
| **Mã dự án** | {{PROJECT_CODE}} |
| **Khách hàng / Doanh nghiệp** | {{CLIENT_NAME}} |
| **Lĩnh vực kinh doanh** | {{BUSINESS_DOMAIN}} |
| **Ngày bắt đầu** | {{START_DATE}} |
| **Ngày dự kiến hoàn thành** | {{TARGET_END_DATE}} |
| **Ngân sách dự kiến** | {{BUDGET}} |

---

## 2. BỐI CẢNH & VẤN ĐỀ

### 2.1. Bối cảnh doanh nghiệp

{{MÔ_TẢ_BỐI_CẢNH}}

### 2.2. Vấn đề cần giải quyết

| Mã | Vấn đề | Ảnh hưởng đến | Mức độ ưu tiên |
|----|--------|---------------|----------------|
| PROB-001 | {{VẤN_ĐỀ}} | {{BỘ_PHẬN/QUY_TRÌNH}} | Critical / High / Medium |
| PROB-002 | {{VẤN_ĐỀ}} | {{BỘ_PHẬN/QUY_TRÌNH}} | Critical / High / Medium |

---

## 3. MỤC TIÊU DỰ ÁN

### 3.1. Mục tiêu kinh doanh (Business Goals)

| Mã | Mục tiêu | Chỉ số đo lường (KPI) | Giá trị mục tiêu |
|----|---------|----------------------|-------------------|
| BG-001 | {{MỤC_TIÊU}} | {{KPI}} | {{TARGET}} |

### 3.2. Mục tiêu dự án (Project Goals)

| Mã | Mục tiêu | Tiêu chí thành công | Deadline |
|----|---------|---------------------|---------|
| PG-001 | {{MỤC_TIÊU}} | {{TIÊU_CHÍ}} | {{DATE}} |

---

## 4. PHẠM VI DỰ ÁN

### 4.1. Trong phạm vi (In Scope)

- {{MỤC_1}}
- {{MỤC_2}}

### 4.2. Ngoài phạm vi (Out of Scope)

- {{MỤC_1}}
- {{MỤC_2}}

---

## 5. STAKEHOLDERS

| Vai trò | Tên/Bộ phận | Trách nhiệm | Mức độ ảnh hưởng |
|---------|------------|------------|-----------------|
| Project Sponsor | {{TÊN}} | Phê duyệt ngân sách, định hướng | High |
| Product Owner | {{TÊN}} | Ưu tiên requirements | High |
| {{ROLE}} | {{TÊN}} | {{TRÁCH_NHIỆM}} | High/Medium/Low |

---

## 6. USER JOURNEY MAP (Hành trình người dùng)

### Journey {{UJ-001}}: {{TÊN_HÀNH_TRÌNH}}

```
[Bước 1] → [Bước 2] → [Bước 3] → [Kết quả mong muốn]
({{ACTOR}})   ({{TOOL}})   ({{RESULT}})
```

**Pain points hiện tại:**
- PAIN-{{DOM}}-001: {{PAIN_POINT}}

---

## 7. PHÂN TÍCH HỆ THỐNG (SYSTEMS)

| System | Mô tả | Người dùng chính | Tech Stack | Ưu tiên |
|--------|-------|-----------------|-----------|---------|
| {{SYS_CODE}} | {{MÔ_TẢ}} | {{USERS}} | {{TECH}} | P0/P1 |

---

## 8. TIMELINE & MILESTONES

| Milestone | Ngày dự kiến | Mô tả |
|-----------|-------------|-------|
| Kick-off | {{DATE}} | Bắt đầu dự án |
| Phase 1-3 Done | {{DATE}} | Hoàn thành tài liệu nghiệp vụ |
| Phase 4-5 Done | {{DATE}} | Hoàn thành thiết kế |
| UAT | {{DATE}} | Kiểm thử người dùng |
| Go-Live | {{DATE}} | Triển khai chính thức |
