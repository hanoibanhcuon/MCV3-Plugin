# Project Overview Schema — OUTPUT FORMAT

## Mô tả

Schema này định nghĩa cấu trúc và format của `PROJECT-OVERVIEW.md`.

---

## Cấu trúc bắt buộc

```markdown
# PROJECT OVERVIEW — {Tên dự án}
<!-- ID: PO-{SLUG}-001 | Phase: phase1-discovery | Version: 1.0 -->

> **Dự án:** {tên đầy đủ}
> **Ngành:** {domain}
> **Ngày tạo:** {ISO date}
> **Status:** Draft / Reviewed / Approved

---

## 📎 DEPENDENCY MAP
<!-- AI đọc file này: section này đọc TRƯỚC -->

```
File này là: PROJECT-OVERVIEW.md
Không phụ thuộc vào file nào khác
Được đọc bởi: mọi phase sau
Bước tiếp theo: /mcv3:expert-panel
```

---

## 1. BỐI CẢNH

### BG-BUS-001: {Tên bối cảnh nghiệp vụ}
{Mô tả bối cảnh kinh doanh hiện tại — tại sao dự án này tồn tại}

### BG-TECH-001: {Hệ thống hiện tại}
{Mô tả công cụ/phần mềm đang dùng, điểm mạnh/yếu}

---

## 2. VẤN ĐỀ CẦN GIẢI QUYẾT

### PROB-001: {Tên vấn đề ngắn gọn}
**Hiện trạng:** {Mô tả tình trạng hiện tại bằng dữ liệu cụ thể nếu có}
**Tác động:** {Hậu quả — thời gian mất, tiền mất, rủi ro...}
**Mức độ:** Critical / High / Medium / Low

### PROB-002: {Tên vấn đề 2}
...

---

## 3. MỤC TIÊU DỰ ÁN

### GL-001: {Mục tiêu 1 — đo lường được}
**KPI:** {Metric cụ thể — VD: giảm 50% thời gian nhập liệu}
**Deadline:** {Khi nào cần đạt}

### GL-002: {Mục tiêu 2}
...

---

## 4. PHẠM VI

### 4.1 Trong phạm vi (Scope In)

| ID | Mô tả | Ưu tiên |
|----|-------|--------|
| SC-IN-001 | {Tính năng/module lớn 1} | Must Have |
| SC-IN-002 | {Tính năng/module lớn 2} | Should Have |
| SC-IN-003 | {Tính năng/module lớn 3} | Nice to Have |

### 4.2 Ngoài phạm vi (Scope Out)

| ID | Mô tả | Lý do loại trừ |
|----|-------|---------------|
| SC-OUT-001 | {Cái không làm} | {Vì sao} |

---

## 5. STAKEHOLDERS

| ID | Vai trò | Mô tả | Level ảnh hưởng |
|----|---------|-------|----------------|
| ST-001 | {Tên role} | {Ai, làm gì, quyền lợi gì} | High / Medium / Low |
| ST-002 | ... | | |

---

## 6. RÀNG BUỘC

| ID | Loại | Mô tả |
|----|------|-------|
| CON-001 | Thời gian | {Deadline cứng} |
| CON-002 | Ngân sách | {Budget constraint} |
| CON-003 | Kỹ thuật | {Tech constraint} |
| CON-004 | Pháp lý | {Compliance requirement} |

---

## 7. GIẢ ĐỊNH & RỦI RO

### Giả định
- {Assumption 1 — điều kiện cần đúng để dự án thành công}

### Rủi ro
| ID | Rủi ro | Xác suất | Tác động | Biện pháp |
|----|--------|---------|---------|----------|
| RISK-001 | {Tên rủi ro} | High/Med/Low | High/Med/Low | {Mitigation} |

---

## 8. TỔNG KẾT

**Vấn đề cốt lõi:** {1-2 câu tóm tắt vấn đề quan trọng nhất}

**Giải pháp đề xuất:** {1-2 câu mô tả hướng giải quyết}

**Next Phase:** Expert Panel analysis → `/mcv3:expert-panel`
```

---

## Quy tắc điền

### IDs
- PROB phải có ít nhất 1
- GL phải có ít nhất 1 và phải đo lường được (có KPI)
- SC-IN phải map được với GL (mục tiêu ↔ tính năng)
- ST phải bao gồm end users và decision makers

### Ngôn ngữ
- Mô tả bằng tiếng Việt
- Technical terms có thể giữ tiếng Anh
- Tránh jargon không cần thiết — viết như giải thích cho người không phải IT

### Chất lượng
- Mỗi PROB phải có "Tác động" cụ thể (số liệu càng tốt)
- Mỗi GL phải có KPI đo lường được
- SC-IN phải đủ cụ thể để có thể tạo URS sau
