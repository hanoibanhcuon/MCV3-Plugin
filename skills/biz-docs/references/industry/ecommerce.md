# Biz-Docs Reference — E-Commerce / Thương mại điện tử

Dùng trong Phase 3 (Biz-Docs) khi project thuộc lĩnh vực TMĐT, bán hàng online.

---

## KPIs ngành E-Commerce

```
Traffic & Conversion:
  - Sessions, Unique Visitors
  - Conversion Rate (CVR): target 2-5% (VN thấp hơn, ~1-3%)
  - Add-to-Cart Rate: target 10-15%
  - Checkout Abandonment Rate: average 70% (cần giảm)
  - Bounce Rate: < 40% là tốt

Revenue Metrics:
  - Gross Merchandise Value (GMV)
  - Average Order Value (AOV): target tùy ngành
  - Revenue per Visitor (RPV)
  - Customer Lifetime Value (CLV)
  - Customer Acquisition Cost (CAC)
  - CLV/CAC ratio: > 3 là healthy

Operations:
  - Order fulfillment rate: target > 98%
  - On-time delivery rate: target > 95%
  - Return rate: < 10% (tùy ngành)
  - Cancel rate: < 5%
  - Inventory turnover ratio: tùy category

Customer:
  - Net Promoter Score (NPS)
  - Repeat purchase rate: target > 30%
  - Customer satisfaction (CSAT) reviews
```

---

## Quy trình nghiệp vụ cốt lõi

### PROC-ECOM-001: Quy trình đặt hàng

```
AS-IS (shop nhỏ trên Shopee/FB):
  Khách inbox → báo giá → nhận chuyển khoản → đóng gói → gửi qua bưu điện →
  gửi tracking qua Zalo

TO-BE:
  Tìm kiếm → Xem sản phẩm → Thêm giỏ → Checkout (nhập địa chỉ + chọn ship) →
  Chọn thanh toán (VNPAY/COD) → Xác nhận → Tự động tạo vận đơn GHN/GHTK →
  Email/SMS xác nhận → Track realtime → Giao hàng → Đánh giá

States of Order:
  pending_payment → payment_confirmed → processing → packed → shipped →
  in_transit → delivered → completed
  (bất kỳ stage nào) → cancelled → refunded

Business Rules:
  - BR-ORD-001: Reserve tồn kho ngay khi payment_confirmed
  - BR-ORD-002: Order pending_payment timeout sau 30 phút → auto-cancel, release stock
  - BR-ORD-003: Đơn COD chỉ accept địa chỉ thuộc vùng ship của đối tác
  - BR-ORD-004: Không thể cancel sau khi đã picked up bởi shipper
  - BR-ORD-005: Gửi email/SMS xác nhận ngay khi trạng thái thay đổi
```

### PROC-ECOM-002: Quy trình quản lý tồn kho

```
Nhập hàng → Kiểm tra chất lượng (QC) → Nhập kho (nhập số lượng, lot, expiry) →
Cập nhật stock → Khi có đơn hàng → Reserve stock → Đóng gói → Xuất kho

Business Rules:
  - BR-INV-001: Stock không được âm (strict mode) hoặc cho phép backorder (soft mode)
  - BR-INV-002: FEFO (First Expire First Out) cho hàng có hạn sử dụng
  - BR-INV-003: Cảnh báo khi stock < reorder point (tự động tạo purchase request)
  - BR-INV-004: Kiểm kê định kỳ: system lock transactions trong giờ kiểm kê
  - BR-INV-005: Tồn kho được tính: on_hand - reserved - damaged
```

### PROC-ECOM-003: Quy trình hoàn trả (Returns)

```
Khách gửi yêu cầu đổi/trả → Ops review (hình ảnh, lý do) → Duyệt/từ chối →
Khách gửi hàng về → Kiểm tra hàng → Hoàn tiền (refund) hoặc đổi hàng mới →
Hàng trả về: re-stock hoặc damaged

Business Rules:
  - BR-RET-001: Thời hạn đổi trả: 7 ngày từ ngày nhận hàng (mặc định VN)
  - BR-RET-002: Điều kiện: hàng còn nguyên seal, chưa qua sử dụng
  - BR-RET-003: Lỗi do shop → shop chịu phí vận chuyển 2 chiều
  - BR-RET-004: Refund trong vòng 3-7 ngày làm việc tùy payment method
  - BR-RET-005: Flash sale items: không hoàn trả (hoặc hoàn trả store credit)
```

---

## Business Rules: Promotions

```
BR-PROMO-001: Voucher chỉ apply 1 lần per user per campaign
BR-PROMO-002: Minimum order value để dùng voucher
BR-PROMO-003: Flash sale: limit số lượng sản phẩm + thời gian chặt chẽ
BR-PROMO-004: Buy X get Y: tính discount theo sản phẩm có giá thấp hơn (hoặc theo rule)
BR-PROMO-005: Loyalty points: 1,000 VND = 1 point; 100 points = 1,000 VND discount
BR-PROMO-006: Không stack nhiều voucher cùng lúc (hoặc có rule stack cụ thể)
BR-PROMO-007: Voucher hết hạn: tự động deactivate
```

---

## Compliance Requirements (VN)

```
| Quy định | Nội dung | Tác động |
|---------|---------|---------|
| Nghị định 52/2013 (TMĐT) | Đăng ký website TMĐT với Bộ CT | Logo xác nhận, thông tin bắt buộc |
| Nghị định 85/2021 sửa đổi | Sàn TMĐT: quản lý seller, trách nhiệm | Marketplace compliance |
| Luật Bảo vệ NTD 2023 | Quyền đổi trả, thông tin sản phẩm | Return policy, product info |
| Nghị định 13/2023 (BVDL) | Bảo vệ dữ liệu cá nhân | Consent, data processing |
| Thuế GTGT TMĐT (Thông tư 40/2021) | Cá nhân kinh doanh online đóng thuế | Tax reporting |
| Hóa đơn điện tử (NĐ 123/2020) | Bắt buộc xuất HĐĐT từ 1/7/2022 | Invoice integration |
```

---

## Pain Points phổ biến

```
- Không có realtime inventory: oversell → khách đặt hàng nhưng hết hàng
- Cart abandonment cao: checkout quá nhiều bước
- Không tích hợp logistics: in vận đơn thủ công tốn nhiều giờ
- Đồng bộ multi-channel chậm: bán trên cả website + Shopee + offline → lệch tồn kho
- Fraud COD: địa chỉ fake, không nhận hàng → ship phí mà không bán được
- Không có báo cáo bán hàng realtime: không biết sản phẩm nào đang bán chạy
- Returns thủ công: mất thời gian ops team
```

---

## Entities Data Dictionary gợi ý

```
Product: id, sku, name, category_id, price, compare_at_price, weight, images[]
ProductVariant: product_id, sku, attributes (color/size), price, stock_qty
Inventory: variant_id, warehouse_id, on_hand, reserved, available
Order: id, customer_id, status, items[], subtotal, discount, shipping_fee, total
OrderItem: order_id, variant_id, qty, unit_price, discount
Shipment: order_id, carrier, tracking_number, status, estimated_delivery
Promotion: id, type, value, conditions, start_at, end_at, usage_limit
VoucherUsage: voucher_id, customer_id, order_id, applied_at
Return: order_id, reason, items[], status, refund_amount, resolution
Review: order_id, product_id, rating, body, images[], created_at
```
