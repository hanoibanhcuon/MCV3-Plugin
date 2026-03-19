# mc-data Rules — Dự án Hệ thống phần mềm Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka
<!-- Auto-generated bởi MCV3 mc_init_project -->

## Quy tắc bắt buộc

### 1. Không ghi .mc-data/ trực tiếp
- LUÔN dùng `mc_save` để lưu tài liệu
- KHÔNG dùng Write/Edit tool với đường dẫn `.mc-data/`
- Exception: Sửa lỗi typo nhỏ được phép nhưng phải log vào _changelog.md

### 2. Naming Conventions

| Loại file | Convention | Ví dụ |
|-----------|------------|-------|
| URS | `URS-{MODULE}.md` | URS-INV.md |
| MODSPEC | `MODSPEC-{MODULE}.md` | MODSPEC-INV.md |
| BIZ-POLICY | `BIZ-POLICY-{DOMAIN}.md` | BIZ-POLICY-SALES.md |
| PROCESS | `PROCESS-{DOMAIN}.md` | PROCESS-WAREHOUSE.md |
| TEST | `TEST-{MODULE}.md` | TEST-INV.md |

### 3. Formal ID Ranges (tránh conflict)

> Cập nhật khi có thêm modules mới

| System | Module | ID Range |
|--------|--------|---------|
| _(chưa định nghĩa)_ | | |

### 4. Smart Context Layering

Khi đọc tài liệu lớn, dùng layer nhỏ để tiết kiệm context:
```
Layer 0: mc_load({ layer: 0 })  ← Key facts ~500B — dùng để check phase
Layer 1: mc_load({ layer: 1 })  ← Dependency map — dùng để biết đọc gì tiếp
Layer 2: mc_load({ layer: 2 })  ← Sections chính ~10KB — dùng để review
Layer 3: mc_load({ layer: 3 })  ← Full doc — dùng khi cần full detail
```

### 5. Phase Gate

| Phase | Điều kiện để sang phase tiếp |
|-------|---------------------------|
| phase1-discovery → phase2-expert | PROJECT-OVERVIEW.md đã có và validated |
| phase2-expert → phase3-bizdocs | EXPERT-LOG.md đã có SESSION-001 |
| phase3-bizdocs → phase4-requirements | BIZ-POLICY + PROCESS + DATA-DICTIONARY đã complete |
| phase4-requirements → phase5-design | URS cho tất cả modules đã validated |
| phase5-design → phase6-qa | MODSPEC cho tất cả modules đã validated |
