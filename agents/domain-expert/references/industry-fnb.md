# Industry Knowledge — F&B (Food & Beverage)

## Quy trình chuẩn F&B

### Order Flow (Restaurant)

```
Khách đến / Đặt bàn
  → Gọi món (qua waiter hoặc QR self-order)
  → Order truyền xuống bếp (KDS hoặc in ticket)
  → Bếp chuẩn bị theo thứ tự
  → Phục vụ món
  → Khách gọi thêm / yêu cầu bill
  → Tính tiền (POS)
  → Khách rời
  → Reset bàn
```

### Nguyên liệu Flow

```
Đặt hàng NCC (theo forecast hoặc reorder point)
  → Nhận hàng + kiểm tra chất lượng
  → Nhập kho nguyên liệu
  → Sơ chế / prep (nếu có central kitchen)
  → Xuất nguyên liệu cho bếp theo recipe
  → Sử dụng trong chế biến
  → Kiểm kê nguyên liệu (daily/weekly)
  → Phân tích variance (lý thuyết vs thực tế)
```

---

## Data Entities Cốt lõi

```
MenuItem (Món ăn)
  ├── code, name, category
  ├── selling_price
  ├── is_available, preparation_time_min
  └── recipe_id → Recipe

Recipe (Công thức/Định mức)
  ├── menu_item_id
  ├── yield_qty (số lượng xuất ra)
  └── ingredients[] → RecipeIngredient
      ├── ingredient_id
      ├── quantity
      └── unit

Ingredient (Nguyên liệu)
  ├── code, name, category
  ├── unit (kg, lít, cái, ...)
  ├── cost_per_unit
  ├── reorder_point
  └── is_perishable

Order (Đơn hàng)
  ├── order_type (dine_in, takeaway, delivery)
  ├── table_id (for dine_in)
  ├── items[] → OrderItem
  ├── status (new → preparing → ready → served)
  └── created_at, served_at

Table (Bàn)
  ├── code, area, capacity
  └── status (available, occupied, reserved, cleaning)
```

---

## Compliance F&B

| Quy định | Tác động |
|---------|---------|
| Nghị định 15/2018 | ATTP — an toàn thực phẩm |
| Luật PCCC | Kho lạnh, bếp gas |
| HACCP (tùy) | Kiểm soát chất lượng |
| Hóa đơn điện tử | Nghị định 123/2020 |

---

## Common Pitfalls

- ⚠️ **Không có modifier/customization** → Khách không order được "ít đường, không đá"
- ⚠️ **Course management thiếu** → Không serve đúng thứ tự khai vị → món chính
- ⚠️ **Không tính food cost %** → Không biết món nào lãi
- ⚠️ **Void/refund log yếu** → Nhân viên lợi dụng void để lấy tiền
- ⚠️ **KDS không có priority** → Đơn rush không được ưu tiên
- ⚠️ **Thiếu allergy flags** → Risk sức khỏe khách hàng

---

## Tính năng thường bị quên

- **Table merge / split** (ghép/tách bàn giữa chừng)
- **Course ordering** (khai vị → canh → món chính → tráng miệng)
- **Modifier** (ít cay, không hành, thêm phô mai)
- **Staff meal tracking** (suất ăn nhân viên)
- **Waste tracking** (ghi nhận đồ bị đổ, thiu)
- **EOD (End of Day) Z-report** cho kế toán
- **Reservation + waitlist** management
