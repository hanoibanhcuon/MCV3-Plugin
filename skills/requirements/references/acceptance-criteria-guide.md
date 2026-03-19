# Acceptance Criteria Guide — Hướng dẫn viết AC chất lượng cao

## Tổng quan

Acceptance Criteria (AC) là tiêu chí xác định khi nào một User Story được coi là "Done".
AC tốt = cầu nối giữa Business Requirements và Test Cases.

---

## Nguyên tắc SMART cho AC

| Nguyên tắc | Mô tả | Ví dụ |
|-----------|-------|-------|
| **S**pecific | Rõ ràng, không mơ hồ | "hiển thị trong < 2 giây" không phải "hiển thị nhanh" |
| **M**easurable | Đo được, có con số cụ thể | "error message chứa mã lỗi" không phải "hiển thị lỗi" |
| **A**chievable | Có thể implement được | Tránh AC không thực tế với tech constraints |
| **R**elevant | Liên quan đến US | Không thêm AC ngoài scope của US |
| **T**estable | QA có thể verify độc lập | Test case viết được từ AC |

---

## Template Given-When-Then chi tiết

### Cấu trúc đầy đủ

```
AC-{MOD}-{US_NUM}-{AC_NUM}: {Tên ngắn mô tả scenario}

Context:
  Given {trạng thái ban đầu của hệ thống}
    And {điều kiện thêm nếu có}

Action:
  When {hành động user hoặc event}
    And {điều kiện thêm nếu có}

Expected Result:
  Then {kết quả chính}
    And {kết quả phụ 1}
    And {kết quả phụ 2}

Notes: {Ghi chú kỹ thuật hoặc business nếu cần}
```

---

## Các loại AC và templates

### 1. Happy Path AC

Luồng chính khi mọi thứ diễn ra đúng như kế hoạch.

```
AC-INV-001-01: Nhập kho thành công

Given thủ kho đã đăng nhập và ở màn hình "Nhập kho mới"
  And phiếu mua hàng PO-2024-001 tồn tại trong hệ thống
When thủ kho nhập số lô: "LOT-001", số lượng: 100, chọn PO: PO-2024-001
  And nhấn nút "Xác nhận nhập kho"
Then hệ thống tạo phiếu GRN-2024-001 với status "Completed"
  And số lượng tồn kho của sản phẩm tăng thêm 100 đơn vị
  And lịch sử kho ghi nhận bản ghi nhập kho với timestamp hiện tại
  And thông báo "Nhập kho thành công: 100 đơn vị" hiển thị
```

### 2. Validation AC

Kiểm tra input validation và business rules.

```
AC-INV-001-02: Validation — Số lượng âm

Given thủ kho đang ở màn hình "Nhập kho mới"
When thủ kho nhập số lượng: -10
  And nhấn "Xác nhận nhập kho"
Then hệ thống KHÔNG tạo phiếu GRN
  And hiển thị lỗi: "Số lượng phải lớn hơn 0"
  And highlight field "Số lượng" màu đỏ
  And focus cursor về field "Số lượng"

AC-INV-001-03: Validation — PO không tồn tại

Given thủ kho đang ở màn hình "Nhập kho mới"
When thủ kho nhập mã PO: "PO-NOTEXIST"
Then hệ thống hiển thị: "Không tìm thấy PO: PO-NOTEXIST"
  And nút "Xác nhận" bị disabled
```

### 3. Authorization AC

Kiểm tra phân quyền người dùng.

```
AC-INV-001-04: Phân quyền — Chỉ thủ kho được nhập kho

Given user đã đăng nhập với role "Kế toán"
When user truy cập màn hình "Nhập kho mới"
Then hệ thống redirect về trang 403 Forbidden
  And hiển thị: "Bạn không có quyền thực hiện thao tác này"
  And ghi log "Unauthorized access attempt: Kế toán → /inventory/receive"

AC-INV-001-05: Phân quyền — Manager xem nhưng không sửa

Given manager đăng nhập và xem phiếu GRN đã approved
When manager click vào bất kỳ field nào
Then fields ở trạng thái read-only, không editable
  And không hiển thị nút "Sửa" hoặc "Xóa"
```

### 4. Error Handling AC

Xử lý lỗi hệ thống và network.

```
AC-INV-001-06: Lỗi network khi submit

Given thủ kho đã điền đầy đủ thông tin nhập kho
  And network connection bị ngắt
When thủ kho nhấn "Xác nhận nhập kho"
Then hệ thống hiển thị: "Lỗi kết nối. Vui lòng thử lại sau."
  And dữ liệu đã nhập KHÔNG bị mất (preserve form state)
  And nút "Thử lại" xuất hiện

AC-INV-001-07: Timeout sau 30 giây

Given request đang xử lý
When server không trả về response sau 30 giây
Then hệ thống hủy request
  And hiển thị: "Hệ thống đang bận. Vui lòng thử lại."
  And log timeout event vào system log
```

### 5. Audit & Logging AC

Đảm bảo hệ thống ghi nhận đúng.

```
AC-INV-001-08: Audit trail đầy đủ

Given thủ kho vừa tạo GRN thành công
Then audit log ghi nhận:
  - user_id của người tạo
  - timestamp (UTC)
  - IP address
  - action: "CREATE_GRN"
  - before_state: null
  - after_state: {grn_id, quantity, lot_number, ...}
And log accessible bởi admin trong 7 năm
```

### 6. Edge Cases AC

Các trường hợp biên cần xử lý đặc biệt.

```
AC-INV-001-09: Nhập kho vượt số lượng PO

Given PO-2024-001 có số lượng đặt: 100 đơn vị
When thủ kho nhập số lượng nhập: 150
Then hệ thống hiển thị warning: "Số lượng nhập (150) vượt PO (100)"
  And hỏi user: "Bạn có chắc muốn tiếp tục không?"
  And nếu user confirm → tạo GRN với status "Over-receipt"
  And nếu user cancel → giữ nguyên form

AC-INV-001-10: Concurrent nhập kho cùng lô

Given thủ kho A đang nhập lot LOT-001
When thủ kho B cũng bắt đầu nhập lot LOT-001 cùng lúc
Then hệ thống dùng optimistic locking
  And bên nào submit trước thành công trước
  And bên sau nhận conflict error: "Lot này vừa được cập nhật. Vui lòng reload."
```

---

## Checklist AC Quality Review

Trước khi finalize mỗi US, kiểm tra:

```
□ Happy path AC có không?
□ Validation AC cho mỗi required field?
□ Authorization AC (nếu có phân quyền)?
□ Error handling AC cho lỗi phổ biến?
□ Audit/logging AC (nếu action quan trọng)?
□ Ít nhất 1 edge case AC?
□ Tất cả AC dùng Given-When-Then?
□ Kết quả (Then) đủ cụ thể để test được?
□ Không có AC trùng lặp?
□ IDs theo đúng format AC-{MOD}-{US}-{NUM}?
```

---

## Liên kết AC → Test Case

AC chất lượng cao nên map 1:1 với Test Case:

```
AC-INV-001-01 (Happy path)
  → TC-INV-001: Test_CreateGRN_HappyPath

AC-INV-001-02 (Negative quantity)
  → TC-INV-002: Test_CreateGRN_NegativeQuantity

AC-INV-001-04 (Authorization)
  → TC-INV-003: Test_CreateGRN_Unauthorized_Accountant
```

QA engineer đọc AC → tự viết test case mà không cần hỏi thêm.

---

## Ví dụ hoàn chỉnh — US "Tìm kiếm sản phẩm"

```markdown
### US-CAT-001: Tìm kiếm sản phẩm theo tên/SKU

As a sales staff,
I want to search for products by name or SKU,
So that I can quickly find products when creating orders.

**Priority:** Must Have

**Acceptance Criteria:**

AC-CAT-001-01: Tìm kiếm theo tên — Có kết quả
Given user đang ở màn hình "Tìm kiếm sản phẩm"
When user gõ "Áo thun" vào search box
  And nhấn Enter hoặc click "Tìm kiếm"
Then hiển thị tất cả sản phẩm có tên chứa "Áo thun" (case-insensitive)
  And kết quả hiển thị: tên, SKU, giá, tồn kho
  And số lượng kết quả hiển thị ở trên: "Tìm thấy 12 sản phẩm"
  And kết quả load trong < 1 giây

AC-CAT-001-02: Tìm kiếm — Không có kết quả
Given user search "xyz-không-tồn-tại"
Then hiển thị: "Không tìm thấy sản phẩm nào cho 'xyz-không-tồn-tại'"
  And gợi ý: "Thử tìm với từ khóa khác"

AC-CAT-001-03: Tìm kiếm theo SKU chính xác
Given sản phẩm với SKU "AT-001-RED-L" tồn tại
When user nhập "AT-001-RED-L"
Then kết quả đầu tiên là sản phẩm với SKU chính xác đó
  And highlight SKU match trong kết quả

AC-CAT-001-04: Minimum search length
When user nhập ít hơn 2 ký tự
Then KHÔNG trigger search
  And hiển thị hint: "Nhập ít nhất 2 ký tự để tìm kiếm"

AC-CAT-001-05: Pagination
Given có hơn 20 kết quả
Then hiển thị 20 kết quả đầu với pagination
  And có nút "Trang sau" để load thêm
```
