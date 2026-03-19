# Interview Framework — E-Commerce / Thương mại điện tử

Dùng khi user mô tả dự án thuộc lĩnh vực bán hàng online, marketplace, D2C, sàn TMĐT.

---

## Từ khóa trigger

`bán hàng online`, `shop online`, `thương mại điện tử`, `TMĐT`, `marketplace`,
`giỏ hàng`, `checkout`, `đặt hàng`, `giao hàng`, `sản phẩm`, `SKU`, `flash sale`,
`voucher`, `affiliate`, `dropshipping`, `D2C`, `Shopify-like`, `Tiki`, `Shopee`

---

## Câu hỏi phỏng vấn theo thứ tự

### Block 1 — Mô hình kinh doanh

```
1. Mô hình bán hàng của bạn là gì?
   - B2C: brand trực tiếp bán cho người tiêu dùng (D2C)
   - B2B: bán sỉ / cung cấp cho doanh nghiệp
   - Marketplace: nhiều seller bán trên 1 platform
   - Dropshipping: không giữ hàng tồn kho
   - Subscription: sản phẩm theo tháng

2. Có shop trên Shopee/Lazada/Tiki không, hay muốn có website riêng?
   → Sync inventory với các sàn (multi-channel)

3. Sản phẩm là vật lý (physical) hay kỹ thuật số (digital — ebook, software, voucher)?
   → Digital: không cần logistics, cần delivery mechanism khác
```

### Block 2 — Product Catalog

```
4. Bao nhiêu sản phẩm hiện tại và dự kiến trong 1-2 năm?
   → Ảnh hưởng đến search indexing, pagination

5. Sản phẩm có variants không? (màu sắc, kích thước, v.v.)
   → SKU management, variant matrix

6. Có sản phẩm theo bundle hoặc kit không?
   → Bundle pricing, inventory deduction

7. Sản phẩm có ngày hết hạn không? (thực phẩm, mỹ phẩm)
   → Expiry tracking, FEFO warehouse
```

### Block 3 — Order Pipeline

```
8. Luồng đặt hàng từ đầu đến cuối:
   Gợi ý: Tìm sản phẩm → Thêm giỏ → Checkout → Thanh toán → Xử lý đơn →
          Đóng gói → Giao hàng → Nhận hàng → Đánh giá

9. Có cho phép đặt hàng khi chưa đăng nhập (guest checkout) không?

10. Xử lý đơn hàng thủ công hay tự động?
    → Workflow automation: confirm → print label → ship

11. Có cho phép đặt trước (preorder) hoặc backorder không?
```

### Block 4 — Inventory & Warehouse

```
12. Hàng tồn kho ở mấy kho? Có multi-warehouse không?
    → Inventory allocation per warehouse

13. Đơn hàng được fulfill từ kho nào? (gần nhất? nhiều hàng nhất?)
    → Fulfillment rule engine

14. Có tự giao hàng không, hay dùng 3PL (GHN, GHTK, Viettel Post)?
    → Shipping integration, tracking sync
```

### Block 5 — Payments & Promotions

```
15. Phương thức thanh toán cần hỗ trợ?
    VN phổ biến: VNPAY, MoMo, ZaloPay, chuyển khoản, COD, Visa/Mastercard

16. Có plan về promotions: voucher, flash sale, mua X tặng Y, loyal points?
    → Promotion engine complexity

17. Có affiliate program (tiếp thị liên kết) không?
    → Tracking code, commission calculation
```

### Block 6 — Returns & Customer Service

```
18. Chính sách đổi trả như thế nào? Thời hạn, điều kiện?
    → Returns management workflow

19. CSKH qua kênh nào? (Zalo, Facebook, hotline, live chat)
    → Helpdesk integration hoặc tích hợp chat

20. Có cần dashboard analytics (doanh thu, tồn kho, tỷ lệ chuyển đổi) không?
    → Reporting module scope
```

---

## IDs để assign

```
PROB: Vấn đề (đơn hàng thủ công, không có inventory tracking, không đồng bộ sàn...)
BG-BUS: Mô hình, ngành hàng, kênh bán, volume giao dịch
SC-IN: Catalog, cart, checkout, orders, inventory, payments, shipping, reviews
SC-OUT: Warehouse management detail, marketplace integration (nếu phase 2)
GL: GMV target, số đơn/ngày, conversion rate
CON: Tích hợp logistics cụ thể, payment gateway đã có account
```

---

## Tích hợp VN quan trọng

```
Logistics (Shipping):
  - GHN (Giao Hàng Nhanh): API tạo đơn, tracking, cod
  - GHTK (Giao Hàng Tiết Kiệm): tương tự GHN
  - Viettel Post: rộng khắp vùng sâu
  - J&T Express, Ninja Van: giá rẻ, nhanh

Payment:
  - VNPAY: QR + card + internet banking (tích hợp phổ biến nhất)
  - MoMo: ví điện tử + QR
  - ZaloPay: ví + QR + bank transfer
  - COD: vẫn chiếm ~40-50% ở tỉnh lẻ

Multi-channel sync:
  - Shopee Open Platform API
  - Lazada Open Platform
  - Tiki Open API
  - Haravan (mid-size brand platform)
```

---

## Red flags cần warn user

```
⚠️ Thiếu inventory reservation khi checkout:
   → 2 khách đặt cùng 1 sản phẩm cuối → oversell
   → Cần optimistic lock hoặc reservation timer

⚠️ Flash sale không có rate limiting:
   → Server down khi traffic spike → cần queue + cache

⚠️ COD fraud:
   → Khách đặt hàng nhiều nhưng không nhận → cần fraud scoring cho địa chỉ mới

⚠️ Không có return/refund workflow:
   → Ops team xử lý thủ công → không scale

⚠️ Ảnh sản phẩm không được optimize:
   → Load chậm → conversion thấp → cần CDN + image resize
```
