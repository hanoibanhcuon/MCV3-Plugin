# USER GUIDE: {{SYSTEM_NAME}}
<!-- ============================================================
     HƯỚNG DẪN SỬ DỤNG — 1 file per SYSTEM (modules = chapters)
     Đối tượng: End-user (không phải developer).
     Ngôn ngữ đơn giản, có ví dụ cụ thể.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  MODSPEC-*.md (UI/UX sections)
       Key IDs: UI-{MOD}-XXX tham chiếu
       Update: Bởi /mcv3:qa-docs skill
     ============================================================ -->

> **Phase:** P3 — QA & Docs
> **System:** {{SYS_CODE}}
> **Đối tượng:** {{DANH_SÁCH_USER_ROLES}}
> **Phiên bản:** {{VERSION}}

---

## GIỚI THIỆU

Tài liệu này hướng dẫn sử dụng **{{SYSTEM_NAME}}**.

| Vai trò | Mô tả | Chapters liên quan |
|---------|-------|------------------|
| {{ROLE}} | {{MÔ_TẢ}} | {{CHAPTERS}} |

**Yêu cầu hệ thống:** Trình duyệt Chrome/Firefox/Safari phiên bản mới nhất

---

## CHƯƠNG 1: ĐĂNG NHẬP & TỔNG QUAN

### 1.1. Đăng nhập

1. Truy cập `{{URL}}`
2. Nhập **Email** và **Mật khẩu**
3. Nhấn **Đăng nhập**

> **Lưu ý:** Nếu quên mật khẩu, nhấn "Quên mật khẩu" → nhập email → kiểm tra hộp thư

### 1.2. Màn hình tổng quan (Dashboard)

Sau khi đăng nhập, bạn thấy:
- **Thanh menu trái:** Điều hướng đến các module
- **Khu vực chính:** Thống kê & công việc cần làm
- **Thông báo:** Icon chuông ở góc trên phải

---

## CHƯƠNG 2: {{MODULE_A_NAME}}

<!-- [REF: MODSPEC-{{MODULE_A}}.md → UI section] -->

### 2.1. Xem danh sách {{MODULE_A}}

1. Click **{{MODULE_A}}** trong menu trái
2. Danh sách hiển thị với các cột: {{COLUMNS}}
3. Lọc theo: {{FILTER_OPTIONS}}
4. Tìm kiếm: Nhập vào ô tìm kiếm góc trên phải

### 2.2. Thêm {{MODULE_A}} mới

1. Nhấn nút **"+ Thêm mới"**
2. Điền form:
   | Trường | Mô tả | Bắt buộc | Ví dụ |
   |--------|-------|---------|-------|
   | {{FIELD}} | {{MÔ_TẢ}} | Có/Không | {{VÍ_DỤ}} |
3. Nhấn **Lưu**

> ⚠️ **Lưu ý:** {{IMPORTANT_RULE — REF: BR-XXX}}

### 2.3. Sửa {{MODULE_A}}

1. Click vào dòng cần sửa
2. Click **"Chỉnh sửa"** (icon bút chì)
3. Thay đổi thông tin
4. Nhấn **Lưu**

> ⚠️ Chỉ {{ROLES}} mới được sửa sau khi {{CONDITION}}

---

## CHƯƠNG 3: {{MODULE_B_NAME}}

<!-- Thêm chapter mới cho mỗi module -->

---

## PHỤ LỤC A: CÁC LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|----------|
| "{{ERROR_MSG}}" | {{NGUYÊN_NHÂN}} | {{GIẢI_PHÁP}} |
| Không đăng nhập được | Sai mật khẩu / Tài khoản bị khóa | Liên hệ admin |

## PHỤ LỤC B: PHÍM TẮT

| Phím | Chức năng |
|------|----------|
| `Ctrl+S` | Lưu |
| `Escape` | Đóng form |
| `?` | Hiện help |
