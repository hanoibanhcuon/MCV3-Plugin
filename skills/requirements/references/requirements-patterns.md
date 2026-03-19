# Requirements Patterns — Hướng dẫn viết User Stories & Requirements

## 1. User Story Patterns

### Pattern chuẩn (Connextra Format)

```
As a {role/persona},
I want {some goal or desire},
So that {some reason/benefit}.
```

**Ví dụ tốt:**
```
As a warehouse manager,
I want to receive automatic alerts when inventory falls below minimum level,
So that I can reorder before stockouts occur.
```

**Ví dụ tệ (anti-pattern):**
```
As a user,
I want inventory management,
So that inventory is managed.
```
→ Quá chung chung, không đủ cụ thể

---

### INVEST Criteria cho User Stories

| Tiêu chí | Giải thích |
|----------|-----------|
| **I**ndependent | US không phụ thuộc lẫn nhau (có thể implement riêng) |
| **N**egotiable | Có thể thảo luận, không phải hợp đồng cứng |
| **V**aluable | Đem lại giá trị cho user/business |
| **E**stimable | Có thể ước lượng effort |
| **S**mall | Vừa đủ nhỏ để làm trong 1 sprint |
| **T**estable | Có thể viết test để verify |

---

### Splitting User Stories (Chia nhỏ US lớn)

**Khi nào cần split:** US quá lớn, không thể làm trong 1 sprint.

**Cách split:**

1. **Split by workflow steps:**
   ```
   US lớn: Quản lý đơn hàng
   → US-ORD-001: Tạo đơn hàng mới
   → US-ORD-002: Sửa đơn hàng chưa xử lý
   → US-ORD-003: Hủy đơn hàng
   → US-ORD-004: Theo dõi trạng thái đơn hàng
   ```

2. **Split by role:**
   ```
   US lớn: Xem báo cáo doanh thu
   → US-RPT-001: Sales rep xem doanh thu của mình
   → US-RPT-002: Manager xem doanh thu theo team
   → US-RPT-003: Director xem toàn công ty
   ```

3. **Split by data variation:**
   ```
   US lớn: Import dữ liệu
   → US-IMP-001: Import từ Excel
   → US-IMP-002: Import từ CSV
   → US-IMP-003: Import từ API
   ```

---

## 2. Acceptance Criteria Patterns

### Gherkin Format (Given-When-Then)

```
Given {một điều kiện ban đầu hoặc context}
When {một hành động hoặc event xảy ra}
Then {kết quả mong đợi}
```

**Ví dụ tốt:**
```
Given thủ kho đang ở màn hình nhập kho
  And số lượng nhập là 100 đơn vị
When thủ kho nhấn "Xác nhận nhập kho"
Then hệ thống cập nhật tồn kho tăng thêm 100 đơn vị
  And tạo bản ghi GRN với timestamp hiện tại
  And gửi notification cho kế toán kho
```

**Ví dụ tệ:**
```
AC: Hệ thống hoạt động đúng khi nhập kho
```
→ Quá mơ hồ, không testable

---

### AC Coverage Checklist

Mỗi User Story cần có AC cho:

| Loại AC | Mô tả |
|---------|-------|
| **Happy path** | Luồng chính khi mọi thứ đúng |
| **Validation** | Input validation rules |
| **Error cases** | Khi có lỗi xảy ra |
| **Edge cases** | Biên giới dữ liệu |
| **Authorization** | Ai được làm gì |
| **Audit/logging** | Ghi log những gì |

**Template per US:**
```
AC-{MOD}-NNN-01: Happy path — [mô tả]
AC-{MOD}-NNN-02: Validation — [input rules]
AC-{MOD}-NNN-03: Error case — [khi lỗi]
AC-{MOD}-NNN-04: Authorization — [chỉ {role} mới được]
AC-{MOD}-NNN-05: Audit — [ghi log khi...]
```

---

## 3. Functional Requirements Patterns

### Cấu trúc FT chuẩn

```markdown
### FT-{MOD}-NNN: {Tên ngắn gọn, dạng action}

**Mô tả:** {Mô tả chi tiết tính năng}

**Origin US:** US-{MOD}-NNN _(User Story tương ứng)_
**Priority:** Must Have / Should Have / Could Have / Won't Have
**Complexity:** Low / Medium / High _(ước lượng độ phức tạp)_

**Input:**
- {field 1}: {type, required/optional, validation}
- {field 2}: ...

**Output:**
- {Kết quả/Response/Effect}

**Business Rule:** BR-{DOM}-NNN _(quy tắc nghiệp vụ liên quan)_

**Constraints:**
- {Ràng buộc 1}
- {Ràng buộc 2}
```

### MoSCoW Prioritization

| Priority | Ý nghĩa | Khi nào dùng |
|----------|---------|--------------|
| **Must Have** | Thiết yếu, không có = fail | Core business process |
| **Should Have** | Quan trọng, nên có | Cải thiện UX đáng kể |
| **Could Have** | Tốt nếu có | Nice-to-have features |
| **Won't Have** | Không làm lần này | Scope loại bỏ rõ ràng |

---

## 4. Non-Functional Requirements Patterns

### Các loại NFR phổ biến

```markdown
### NFR-001: Performance — Hiệu năng tải trang
**Loại:** Performance
**Yêu cầu:** 95% requests phải hoàn thành trong < 2 giây
**Đo lường:** Thời gian từ khi nhấn button đến khi render xong
**Tools:** Load testing với 500 concurrent users

### NFR-002: Security — Xác thực người dùng
**Loại:** Security
**Yêu cầu:** JWT token hết hạn sau 8 giờ; Refresh token 30 ngày
**Đo lường:** Penetration test quarterly
**Compliance:** OWASP Top 10

### NFR-003: Availability — Uptime
**Loại:** Availability
**Yêu cầu:** 99.5% uptime (không quá 43.8 giờ downtime/năm)
**Đo lường:** Monthly uptime monitoring
**Exclusion:** Scheduled maintenance không tính

### NFR-004: Data Integrity — Toàn vẹn dữ liệu
**Loại:** Reliability
**Yêu cầu:** Zero data loss trong mọi transaction
**Đo lường:** Không có orphan records sau cascade operations
**Backup:** Daily backup, RPO < 24h, RTO < 4h

### NFR-005: Usability — Dễ sử dụng
**Loại:** Usability
**Yêu cầu:** User mới hoàn thành workflow chính sau < 30 phút training
**Đo lường:** User testing với 5 người dùng mới
```

---

## 5. Traceability Matrix

### Format chuẩn

```markdown
| BR-ID | BR Name | US-ID | FT-ID | AC Count | TC-ID |
|-------|---------|-------|-------|----------|-------|
| BR-WH-001 | Kiểm soát nhập kho | US-WH-001, US-WH-002 | FT-WH-001, FT-WH-002 | 5 | TC-WH-001 |
| BR-WH-002 | FIFO xuất kho | US-WH-003 | FT-WH-003 | 3 | TC-WH-002 |
```

### Kiểm tra completeness

```
✓ Mọi BR đều có ít nhất 1 US
✓ Mọi US đều có ít nhất 1 FT
✓ Mọi US đều có ít nhất 2 AC
✓ Mọi FT đều có Origin US
✓ Không có US "mồ côi" (không trace về BR nào)
```

---

## 6. Patterns cho từng ngành

### Logistics/Kho bãi
```
Core US patterns:
- "As a warehouse staff, I want to scan barcodes..."
- "As a manager, I want to see real-time inventory..."
- "As a driver, I want to confirm delivery..."

Common FT:
- FT: Tạo GRN (Goods Receipt Note)
- FT: FIFO lot selection
- FT: Reorder point alert
- FT: Barcode scanning integration
```

### Bán hàng/CRM
```
Core US patterns:
- "As a sales rep, I want to track my pipeline..."
- "As a customer, I want to track my order..."

Common FT:
- FT: Tạo/sửa/xóa đơn hàng
- FT: Tính giá tự động (discount, tax)
- FT: Inventory check khi đặt hàng
- FT: Invoice generation
```

### HR/Nhân sự
```
Core US patterns:
- "As an employee, I want to submit leave requests..."
- "As HR, I want to run monthly payroll..."

Common FT:
- FT: Leave request workflow
- FT: Payroll calculation
- FT: Attendance tracking
- FT: Performance review
```

---

## 7. Các lỗi phổ biến cần tránh

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Vague US | "User muốn quản lý" | Specify role, action, benefit |
| Missing AC | US không có AC | Thêm ít nhất happy path + 1 error |
| Technical US | "Hệ thống lưu vào DB" | Viết từ góc nhìn user, không tech |
| Duplicate FT | FT-001 và FT-002 giống nhau | Merge hoặc differentiate rõ |
| Unmeasurable NFR | "Hệ thống phải nhanh" | Định lượng: "<2s at p95" |
| Missing priority | Tất cả đều Must Have | Dùng MoSCoW, max 60% Must Have |
