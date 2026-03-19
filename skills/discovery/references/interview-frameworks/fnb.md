# Interview Framework — F&B (Food & Beverage)

## Ngữ cảnh áp dụng

Dùng khi dự án liên quan đến: nhà hàng, quán cà phê, chuỗi F&B, bếp trung tâm, delivery, quản lý nguyên liệu.

---

## Bộ câu hỏi Discovery

### NHÓM 1: Mô hình vận hành

1. > "Mô tả quy trình từ lúc khách đặt món đến khi nhận được món — hiện tại như thế nào?"

2. > "Dine-in, takeaway hay delivery (hoặc cả ba)? Dùng app giao hàng nào (GrabFood, ShopeeFood...)?"

3. > "Có bao nhiêu outlet? Dùng chung bếp hay bếp độc lập?"

4. > "Giờ cao điểm trong ngày: giao dịch peak là bao nhiêu order/giờ?"

### NHÓM 2: Vấn đề nghiệp vụ

5. > "Vấn đề lớn nhất với quản lý nguyên liệu/tồn kho hiện tại là gì?"

6. > "Có tình trạng hết nguyên liệu giữa ca, dẫn đến hết món không?"

7. > "Recipe/công thức được lưu ở đâu? Có tính định mức nguyên liệu không?"

8. > "Thất thoát nguyên liệu: ước tính bao nhiêu %/tháng? Kiểm soát bằng cách nào?"

9. > "Ca làm việc: chấm công, đổi ca — đang quản lý thế nào?"

### NHÓM 3: Vận hành đặc thù F&B

10. > "Có nhận đặt bàn/đặt tiệc trước không? Đang dùng hệ thống gì?"

11. > "Kitchen display system (KDS) — hiện tại dùng giấy in hay màn hình?"

12. > "Bếp trung tâm (central kitchen): có hoặc có kế hoạch không?"

13. > "Nhà cung cấp thực phẩm: mua theo định kỳ hay theo demand? Có hệ thống PO không?"

14. > "Báo cáo kinh doanh: lấy từ đâu, frequency? Muốn biết chi tiêu nguyên liệu/outlet?"

### NHÓM 4: Scope

15. > "Ưu tiên: order management, kitchen ops, nguyên liệu, hay tất cả?"

16. > "Kế hoạch expand: mở thêm outlet? Timeline?"

17. > "Ai dùng hệ thống: thu ngân, bếp, quản lý, hay cả app khách hàng?"

---

## Mapping → IDs

| Phát hiện | ID |
|-----------|-----|
| Mất đồng bộ đơn hàng bếp-phục vụ | PROB-001 |
| Thất thoát/sai định mức nguyên liệu | PROB-002 |
| Không biết món nào lãi nhất | PROB-003 |
| Hết nguyên liệu giữa ca | PROB-004 |
| Quản lý đặt bàn thủ công | PROB-005 |
| Không có real-time sales dashboard | PROB-006 |
