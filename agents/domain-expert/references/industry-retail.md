# Industry Knowledge — Retail / Bán lẻ

## Quy trình chuẩn Bán lẻ

### Vòng đời sản phẩm trong cửa hàng

```
Mua hàng từ NCC (Purchase Order)
  → Nhận hàng + Kiểm tra (GRN)
  → Nhập kho (với barcode/SKU)
  → Phân bổ hàng cho cửa hàng
  → Trưng bày + Gán giá
  → Bán hàng (POS transaction)
  → Kiểm kê định kỳ (Stock count)
  → Đặt hàng bổ sung (Reorder point triggered)
  → Xử lý hàng hết hạn / lỗi (Write-off)
```

---

## Data Entities Cốt lõi

```
Product (Sản phẩm)
  ├── sku, barcode, name
  ├── category_id, brand_id
  ├── purchase_price, selling_price
  ├── unit (cái, kg, lít, ...)
  ├── reorder_point, reorder_quantity
  └── is_expirable, shelf_life_days

StoreInventory (Tồn kho theo cửa hàng)
  ├── product_id, store_id
  ├── quantity_on_hand
  ├── quantity_reserved
  └── last_counted_at

PosTransaction (Giao dịch bán hàng)
  ├── transaction_id, store_id, cashier_id
  ├── customer_id (nullable)
  ├── payment_method (cash, card, ewallet, mixed)
  ├── items[] → TransactionItem
  ├── subtotal, discount, tax, total
  └── created_at

Promotion (Khuyến mãi)
  ├── name, type (discount%, BOGO, gift, combo)
  ├── applicable_to (product, category, all)
  ├── conditions (min_amount, day_of_week, ...)
  ├── start_date, end_date
  └── max_uses_per_customer

LoyaltyAccount (Khách hàng thân thiết)
  ├── customer_id, phone, email
  ├── points_balance
  ├── tier (standard, silver, gold)
  └── transactions[]
```

---

## Compliance & Regulatory

| Quy định | Tác động |
|---------|---------|
| Nghị định 52/2013 + 85/2021 | Hóa đơn điện tử bắt buộc |
| Quyết định 1450/QĐ-BKHCN | Mã vạch hàng hóa VN |
| Nghị định 21/2012 | Ghi nhãn hàng hóa |
| Luật BVNTD | Đổi trả, bảo hành |
| PCCC | Requirement cho kho hàng |

---

## Common Pitfalls

- ⚠️ **Không có negative stock protection** → Bán âm tồn kho
- ⚠️ **Promotion conflict** → Nhiều khuyến mãi overlap không handle
- ⚠️ **Thiếu split tender** → Khách muốn trả cả tiền mặt lẫn thẻ
- ⚠️ **Không có offline mode** cho POS → Internet drop → không bán được
- ⚠️ **FIFO không enforce** → Hàng cũ không ra trước → expired goods
- ⚠️ **Không có stock transfer** giữa cửa hàng → Không tận dụng hàng tồn

---

## Tính năng thường bị quên

- **Offline POS mode** với sync khi online lại
- **Multi-price list** (giá bán lẻ vs giá VIP vs giá sỉ)
- **Bundle / Combo pricing** (mua 3 tặng 1)
- **Stock aging report** (hàng tồn bao nhiêu ngày)
- **Supplier returns** (trả hàng lỗi về NCC)
- **Cash drawer management** (đếm tiền đầu/cuối ca)
- **Employee discount** (chiết khấu nhân viên)
