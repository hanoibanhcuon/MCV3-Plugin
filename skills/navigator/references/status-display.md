# Status Display Format — MCV3 Navigator

Tài liệu tham khảo format hiển thị dashboard trạng thái dự án MCV3.

---

## Format Dashboard Đầy Đủ

```
╔══════════════════════════════════════════════════════════════╗
║  MCV3 PROJECT STATUS                                         ║
╚══════════════════════════════════════════════════════════════╝

📋 Dự án: {PROJECT_NAME}
   Slug  : {PROJECT_SLUG}
   Ngành : {DOMAIN}
   Phase : {CURRENT_PHASE}
   Docs  : {DOCUMENT_COUNT} tài liệu

══════════════════════════════════════════════
📊 PIPELINE PROGRESS
══════════════════════════════════════════════

✅ Phase 0: Init              ← Hoàn thành
✅ Phase 1: Discovery         ← Hoàn thành
🔄 Phase 2: Expert Analysis   ← Đang làm
⏳ Phase 3: Business Docs     ← Chưa bắt đầu
⏳ Phase 4: Requirements (URS)
⏳ Phase 5: Technical Design (MODSPEC)
⏳ Phase 6: QA & Docs
⏳ Phase 7: Code Gen
⏳ Phase 8: Verify & Deploy

══════════════════════════════════════════════
🏗️ SYSTEMS
══════════════════════════════════════════════

• ERP   : Hệ thống ERP (active)
• WEB   : Web Portal (planning)
• MOB   : Mobile App (not-started)

══════════════════════════════════════════════
➡️  BƯỚC TIẾP THEO
══════════════════════════════════════════════

Chạy: `/mcv3:biz-docs`
→ Tạo tài liệu nghiệp vụ: BIZ-POLICY, PROCESS, DATA-DICTIONARY
```

---

## Icons

| Icon | Ý nghĩa |
|------|---------|
| ✅ | Phase hoàn thành (done) |
| 🔄 | Phase đang thực hiện (in-progress) |
| ⏳ | Phase chưa bắt đầu (not-started) |
| 📋 | Thông tin dự án |
| 🏗️ | Systems |
| ➡️ | Bước tiếp theo |

---

## Format Rút Gọn (khi liệt kê nhiều projects)

```
📋 Projects:
• erp-cong-ty-abc     : "Hệ thống ERP Công ty ABC" — phase2-expert, 12 tài liệu
• portal-khach-hang   : "Portal Khách Hàng"         — phase0-init,  2 tài liệu
• mobile-staff        : "App Nhân Viên"              — phase4-requirements, 28 tài liệu
```

---

## Format Danh Sách Tài Liệu

Khi hiển thị kết quả `mc_list`:

```
📁 Tài liệu trong _PROJECT (12 files):

  [project-overview]  _PROJECT/PROJECT-OVERVIEW.md           (4.2KB)
  [expert-log]        _PROJECT/EXPERT-LOG.md                 (8.1KB)
  [data-dictionary]   _PROJECT/DATA-DICTIONARY.md            (12.3KB)
  [biz-policy]        _PROJECT/BIZ-POLICY/BIZ-POLICY-INV.md (6.5KB)
  [biz-policy]        _PROJECT/BIZ-POLICY/BIZ-POLICY-PO.md  (5.8KB)
  [process]           _PROJECT/PROCESS/PROCESS-INV.md        (4.1KB)

📁 Tài liệu trong ERP (15 files):

  [urs]               ERP/P1-REQUIREMENTS/URS-INV.md         (9.2KB)
  [urs]               ERP/P1-REQUIREMENTS/URS-PO.md          (7.4KB)
  [modspec]           ERP/P2-DESIGN/MODSPEC-INV.md           (18.5KB)
```

---

## Màu sắc / Emphasis (dùng markdown)

Trong Claude responses, dùng **bold** để nhấn mạnh:

- **Phase hiện tại** — bold
- **Bước tiếp theo** — bold + code block cho lệnh
- `slug` — code format
- Tên file — code format

---

## Tips cho Navigator

1. **Luôn hiển thị bước tiếp theo** — đây là thông tin quan trọng nhất
2. **Nếu phase đang `in-progress`** — giải thích còn thiếu gì (files nào chưa có)
3. **Nếu user hỏi về specific system** — dùng `mc_list` với `subPath="{SYSTEM_CODE}"`
4. **Nếu dự án có nhiều systems** — tóm tắt từng system một dòng
