# Process Skeleton — Logistics / Kho bãi

## Hướng dẫn sử dụng

Skeleton này là điểm khởi đầu cho PROCESS documents trong ngành Logistics.
Doc-writer đọc skeleton này, adapt cho dự án cụ thể, rồi present cho user review.

---

## PROC-WH-001: Quy trình Nhập kho

### AS-IS (Điển hình)
```
Xe hàng đến → Thủ kho kiểm tra số lượng bằng mắt
  → Ghi vào sổ tay hoặc Excel
  → Đưa vào kho
  → Báo kế toán cuối ngày
```

**Pain points thường gặp:**
- PAIN-001: Không có GRN (Goods Receipt Note) → sai số lượng
- PAIN-002: Không biết hàng đang ở vị trí nào trong kho
- PAIN-003: Không cảnh báo khi nhận hàng không đúng PO

### TO-BE (Sau khi có hệ thống)
```
Xe hàng đến → Hệ thống hiện PO đang chờ nhận
  → Thủ kho scan barcode / nhập số lượng
  → Hệ thống tạo GRN tự động
  → Gán vị trí kho (tự động hoặc manual)
  → Cập nhật tồn kho real-time
  → Notify kế toán qua system
```

---

## PROC-WH-002: Quy trình Xuất kho

### AS-IS
```
Nhận yêu cầu xuất (điện thoại / email)
  → Tìm hàng trong kho (có thể mất thời gian)
  → Lấy hàng → Ghi sổ
  → Bàn giao cho bộ phận nhận
```

**Pain points:**
- PAIN-004: Không xuất theo FIFO → hàng cũ bị để lại
- PAIN-005: Không có picking list → lấy sai hàng
- PAIN-006: Tồn kho không khớp thực tế

### TO-BE
```
Yêu cầu xuất tạo trên hệ thống
  → Hệ thống tạo picking list theo FIFO/FEFO
  → Thủ kho lấy theo picking list
  → Confirm số lượng → Hệ thống trừ tồn kho
  → Tạo phiếu xuất kho tự động
```

---

## PROC-WH-003: Kiểm kê định kỳ

### TO-BE (Best practice)
```
Tạo phiếu kiểm kê trên hệ thống
  → Thủ kho count thực tế → nhập vào app
  → Hệ thống so sánh thực tế vs sổ sách
  → Highlight variances
  → Approve / Adjust sau khi xác nhận nguyên nhân
```

---

## Hỏi user để customize

```
Với mỗi quy trình, hỏi:
1. "Quy trình hiện tại của bạn như thế nào? Giống hay khác mô tả trên?"
2. "Pain points nào là đau nhất? (đánh số 1-5)"
3. "Có quy định nội bộ nào đặc biệt không?"
```
