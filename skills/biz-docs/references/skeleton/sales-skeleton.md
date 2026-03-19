# Sales Skeleton — Bán hàng / CRM

## Skeleton BIZ-POLICY-SALES

```markdown
## BR-SALES-001: Phê duyệt giảm giá
**Quy tắc:** [Giảm giá trên X% cần phê duyệt của ai?]
**Áp dụng cho:** Nhân viên bán hàng
**Ngưỡng:** [?% → cần xác nhận từ user]

## BR-SALES-002: Quy trình báo giá
**Quy tắc:** Báo giá có hiệu lực trong [?] ngày
**Áp dụng cho:** Sales team

## BR-SALES-003: Chính sách công nợ
**Quy tắc:** Hạn mức công nợ tối đa cho khách hàng là [?]
**Điều kiện:**
  - Khách hàng mới: không cho nợ / nợ max [?]
  - Khách hàng lâu năm: [?]

## BR-SALES-004: Phân loại khách hàng
**Hạng:** [Bronze / Silver / Gold hoặc A/B/C — xác nhận]
**Tiêu chí:** [Doanh thu/năm? Số đơn hàng?]
**Quyền lợi per hạng:** [Chiết khấu? Ưu tiên giao hàng?]
```

## Skeleton PROCESS-SALES

### PROC-SALES-001: Quy trình bán hàng B2B

```
AS-IS điển hình:
Lead → Gặp gỡ → Gửi báo giá (Word/Excel) → Thương lượng
  → Ký hợp đồng (giấy) → Lên đơn hàng → Giao hàng → Thu tiền

Pain points thường gặp:
- PAIN-S01: Báo giá mất nhiều thời gian làm lại
- PAIN-S02: Không track được deal đang ở bước nào
- PAIN-S03: Không biết lịch sử giao dịch khách hàng
- PAIN-S04: Không alert khi khách đến hạn thanh toán
```

### PROC-SALES-002: Xử lý đơn hàng

```
TO-BE:
Tạo đơn hàng trên hệ thống (từ báo giá confirm)
  → Kiểm tra tồn kho / khả năng sản xuất
  → Confirm với khách → Tạo hợp đồng điện tử
  → Dispatch đến kho / sản xuất
  → Giao hàng + cập nhật status
  → Tạo hóa đơn điện tử → Gửi email
  → Track thanh toán
```
