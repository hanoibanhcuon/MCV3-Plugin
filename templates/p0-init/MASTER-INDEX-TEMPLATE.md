# MASTER-INDEX
<!-- ============================================================
     BẢN ĐỒ TOÀN BỘ DỰ ÁN — Tài liệu sống (Living Document)
     Cập nhật mỗi khi thêm/sửa/xóa tài liệu trong dự án.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  Không có (tài liệu gốc)
       Output: Tất cả tài liệu trong dự án tham chiếu đến đây
       Update: Tự động cập nhật bởi mc_update_index tool
     ============================================================ -->

> **Dự án:** {{PROJECT_NAME}}
> **Mã dự án:** {{PROJECT_CODE}}
> **Ngày tạo:** {{CREATED_DATE}}
> **Cập nhật lần cuối:** {{LAST_UPDATED}}
> **Phiên bản:** {{VERSION}}

---

## 📎 AI NAVIGATION GUIDE

```
AI mới vào dự án — đọc theo thứ tự:
1. File này (MASTER-INDEX) → biết dự án có gì, systems nào
2. _mcv3-work/_checkpoint.md → biết đang ở phase nào, tiếp tục gì
3. _PROJECT/PROJECT-OVERVIEW.md → bối cảnh nghiệp vụ
4. {SYSTEM}/SYSTEM-INDEX.md → khi cần làm việc với 1 system cụ thể
```

---

## 1. TỔNG QUAN DỰ ÁN

**Mục tiêu:** {{MÔ_TẢ_NGẮN_MỤC_TIÊU_DỰ_ÁN}}

**Phạm vi:** {{SỐ_LƯỢNG_SYSTEMS}} hệ thống, {{SỐ_LƯỢNG_MODULES}} modules

**Trạng thái hiện tại:** {{PHASE_HIỆN_TẠI}} — {{MÔ_TẢ_TIẾN_ĐỘ}}

---

## 2. SYSTEMS REGISTRY

| System Code | Tên hệ thống | Mô tả ngắn | Số modules | Tech Stack chính | Trạng thái |
|-------------|-------------|-------------|------------|-----------------|-----------|
| {{SYS_CODE}} | {{SYS_NAME}} | {{SYS_DESC}} | {{N}} | {{TECH}} | {{STATUS}} |

---

## 3. PHASE PROGRESS

| Phase | Mô tả | Trạng thái | Ngày hoàn thành |
|-------|-------|-----------|----------------|
| Phase 1 | Discovery | {{STATUS}} | {{DATE}} |
| Phase 2 | Expert Analysis | {{STATUS}} | {{DATE}} |
| Phase 3 | Business Docs | {{STATUS}} | {{DATE}} |
| Phase 4 | Requirements (URS) | {{STATUS}} | {{DATE}} |
| Phase 5 | Technical Design (MODSPEC) | {{STATUS}} | {{DATE}} |
| Phase 6 | QA & Docs | {{STATUS}} | {{DATE}} |
| Phase 7 | Code Generation | {{STATUS}} | {{DATE}} |
| Phase 8 | Verify & Deploy | {{STATUS}} | {{DATE}} |

---

## 4. DOCUMENT INDEX

### 4.1. Project Documents (_PROJECT/)

| File | Phiên bản | Trạng thái | Ghi chú |
|------|-----------|-----------|---------|
| PROJECT-OVERVIEW.md | {{VER}} | {{STATUS}} | |
| PROJECT-ARCHITECTURE.md | {{VER}} | {{STATUS}} | |
| DATA-DICTIONARY.md | {{VER}} | {{STATUS}} | |
| EXPERT-LOG.md | {{VER}} | {{STATUS}} | |

### 4.2. Systems

<!-- Thêm mỗi system khi tạo mới -->

### 4.3. Verify Documents

| File | Phạm vi | Kết quả |
|------|---------|--------|
| _PROJECT/_VERIFY-PROJECT.md | Project-level docs | {{RESULT}} |
| _VERIFY-CROSS/VERIFY-P1-CROSS.md | URS cross-system | {{RESULT}} |
| _VERIFY-CROSS/VERIFY-P2-CROSS.md | Design cross-system | {{RESULT}} |
| _VERIFY-CROSS/VERIFY-INTEGRATION.md | Integration points | {{RESULT}} |

---

## 5. FORMAL ID REGISTRY (Quick Reference)

<!-- Bảng tóm tắt ID ranges đã dùng — chi tiết trong req-registry.json -->

| Prefix | Range hiện tại | Ghi chú |
|--------|---------------|---------|
| PROB | PROB-001 → PROB-{{N}} | Problem statements |
| BG | BG-001 → BG-{{N}} | Business goals |
| BR | BR-*-001 → BR-*-{{N}} | Business rules per domain |
| US | US-*-001 → US-*-{{N}} | User stories per module |
| UC | UC-*-001-01 → UC-*-{{N}} | Use cases per module |
| AC | AC-*-001-01 → AC-*-{{N}} | Acceptance criteria |
| FT | FT-*-001 → FT-*-{{N}} | Features per module |
| API | API-*-001 → API-*-{{N}} | API endpoints per system |
| TBL | TBL-*-001 → TBL-*-{{N}} | Database tables per system |
| INT | INT-*-001 → INT-*-{{N}} | Integration points per system |
| NFR | NFR-001 → NFR-{{N}} | Non-functional requirements |
| TC | TC-*-001 → TC-*-{{N}} | Test cases per module |
| CHG | CHG-001 → CHG-{{N}} | Change records (Change Manager) |
| EVOL | EVOL-001 → EVOL-{{N}} | Evolution plans (Evolve skill) |

---

## 6. CHANGELOG (tóm tắt)

| Ngày | Thay đổi | Bởi |
|------|---------|-----|
| {{DATE}} | Khởi tạo dự án | MCV3 auto |
