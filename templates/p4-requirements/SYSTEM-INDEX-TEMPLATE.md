# SYSTEM-INDEX: {{SYSTEM_NAME}}
<!-- ============================================================
     TỔNG QUAN HỆ THỐNG — AI đọc file này ĐẦU TIÊN khi vào system.
     File nhỏ, 1 trang — navigation map cho toàn bộ system.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md, PROJECT-ARCHITECTURE.md
       Key IDs: Modules trong system này
       Output: Định nghĩa module codes để URS, MODSPEC sử dụng
       Update: Bởi /mcv3:requirements skill
     ============================================================ -->

> **System Code:** {{SYS_CODE}}
> **Tên hệ thống:** {{SYS_NAME}}
> **Mô tả:** {{MÔ_TẢ_NGẮN}}
> **Tech Stack:** {{TECH_STACK}}
> **Trạng thái:** {{PHASE_HIỆN_TẠI}}

---

## 📎 AI QUICK GUIDE

```
Khi làm việc với system {{SYS_CODE}}:
1. Đọc file này → biết có modules nào, trạng thái từng module
2. Đọc P2-DESIGN/_key-facts.md → Layer 0 context
3. Đọc P1-REQUIREMENTS/URS-{MODULE}.md → requirements
4. Đọc P2-DESIGN/MODSPEC-{MODULE}.md → FULL SPEC để code

Conventions của system này: {{CONVENTIONS_NGẮN}}
```

---

## 1. MỤC ĐÍCH HỆ THỐNG

{{MÔ_TẢ_MỤC_ĐÍCH — 2-3 câu, system này phục vụ ai, giải quyết vấn đề gì}}

**Giải quyết vấn đề:** [REF: PROJECT-OVERVIEW → PROB-{{XXX}}]

---

## 2. MODULES

| Module Code | Tên | Mô tả | URS | MODSPEC | Ưu tiên | Trạng thái |
|------------|-----|-------|-----|---------|---------|-----------|
| {{MOD_CODE}} | {{MOD_NAME}} | {{MÔ_TẢ}} | URS-{{MOD}}.md | MODSPEC-{{MOD}}.md | P0/P1/P2 | {{STATUS}} |

---

## 3. USERS & ROLES

| Vai trò | Mô tả | Modules truy cập | Quyền |
|---------|-------|------------------|-------|
| {{ROLE}} | {{MÔ_TẢ}} | {{MODULES}} | {{PERMISSIONS}} |

---

## 4. DEPENDENCIES (Phụ thuộc)

### Systems liên quan

| System | Quan hệ | Dữ liệu trao đổi | INT ref |
|--------|---------|-----------------|---------|
| {{SYS}} | Depends on / Used by | {{DATA}} | [REF: INT-XXX] |

### Shared Services sử dụng

| Service | Mục đích |
|---------|---------|
| AUTH-SPEC | Authentication & Authorization |
| {{SERVICE}} | {{PURPOSE}} |

---

## 5. TECH STACK CHI TIẾT

| Layer | Tech | Version | Config file |
|-------|------|---------|------------|
| Framework | {{TECH}} | {{VER}} | {{FILE}} |
| Database | {{TECH}} | {{VER}} | {{FILE}} |
| Auth | JWT/OAuth2 | — | [REF: AUTH-SPEC] |

---

## 6. PHASE PROGRESS

| Phase | Documents | Status | Ngày hoàn thành |
|-------|----------|--------|----------------|
| P1-Requirements | URS-{{MOD}}.md | ⏳/✅ | {{DATE}} |
| P2-Design | ARCHITECTURE.md, DATA-MODEL.md, MODSPEC-*.md | ⏳/✅ | {{DATE}} |
| P3-QA-Docs | TEST-*.md, USER-GUIDE.md, ADMIN-GUIDE.md | ⏳/✅ | {{DATE}} |
