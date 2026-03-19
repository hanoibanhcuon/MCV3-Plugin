# Biz-Docs Industry Reference — Retail

## Business Rules thường gặp trong Retail

### Nhóm Bán hàng

| BR | Nội dung điển hình |
|----|------------------|
| BR-SALES-001 | Không bán âm tồn kho (negative stock) |
| BR-SALES-002 | Hóa đơn điện tử phải xuất khi giao dịch > X đồng |
| BR-SALES-003 | Đổi trả trong 7 ngày, còn tem mác |
| BR-SALES-004 | Giảm giá > 30% cần trưởng ca approve |
| BR-SALES-005 | Hàng khuyến mãi không áp dụng cùng coupon khác |

### Nhóm Kho bãi

| BR | Nội dung điển hình |
|----|------------------|
| BR-INV-001 | Nhập hàng phải có GRN trước khi update stock |
| BR-INV-002 | Kiểm kê mỗi tuần cho category A (ABC analysis) |
| BR-INV-003 | Hàng cận date phải mark và giảm giá |
| BR-INV-004 | Reorder tự động khi tồn kho ≤ reorder point |

---

## Documents cần tạo cho Retail

1. **BIZ-POLICY-SALES.md** — Pricing, discount, returns
2. **BIZ-POLICY-INV.md** — Inventory control
3. **PROCESS-RECEIVING.md** — Nhận hàng từ NCC
4. **PROCESS-POS.md** — Quy trình bán hàng tại quầy
5. **PROCESS-STOCK-COUNT.md** — Kiểm kê
6. **DATA-DICTIONARY.md** — SKU, barcode, category, etc.

---

## Câu hỏi hỏi user cho Retail Biz-Docs

```
1. "Chính sách đổi trả: bao nhiêu ngày? Điều kiện?"
2. "Có chương trình khách hàng thân thiết không? Điểm tích lũy?"
3. "Ai có quyền giảm giá? Tới bao nhiêu %?"
4. "Kiểm kê định kỳ: ngày nào? Ai làm?"
5. "Hàng hết hạn: xử lý thế nào? Destroy hay return NCC?"
```
