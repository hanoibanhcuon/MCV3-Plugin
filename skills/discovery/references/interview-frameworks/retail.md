# Interview Framework — Retail / Bán lẻ

## Ngữ cảnh áp dụng

Dùng khi dự án liên quan đến: chuỗi cửa hàng, POS, quản lý kho bán lẻ, omni-channel, franchise, F&B chain.

---

## Bộ câu hỏi Discovery

### NHÓM 1: Hiểu mô hình kinh doanh

1. > "Công ty kinh doanh loại sản phẩm gì? Và bán qua kênh nào — cửa hàng vật lý, online, hay cả hai?"

2. > "Hiện có bao nhiêu cửa hàng/chi nhánh? Tập trung hay phân tán toàn quốc?"

3. > "Mỗi ngày xử lý bao nhiêu giao dịch bán hàng? Giờ cao điểm là khi nào?"

4. > "Hệ thống POS hiện tại là gì? Có kết nối về central server không?"

### NHÓM 2: Vấn đề tồn tại

5. > "Vấn đề lớn nhất với quản lý kho hàng hiện tại là gì?"

6. > "Có tình trạng hàng hết tại cửa hàng A nhưng còn nhiều ở cửa hàng B không?"

7. > "Việc nhập hàng và nhận hàng từ nhà cung cấp diễn ra như thế nào? Hay có sai lệch không?"

8. > "Báo cáo doanh thu: lấy từ đâu? Theo thời gian thực hay cuối ngày/tháng?"

9. > "Chương trình khuyến mãi/loyalty: đang quản lý thế nào?"

### NHÓM 3: Omni-channel (nếu có online)

10. > "Bán online qua kênh nào: website riêng, Shopee, TikTok Shop, hay nhiều kênh?"

11. > "Tồn kho giữa online và offline có sync không? Hay thường xuyên oversell?"

12. > "Đơn online: ai xử lý? Lấy hàng từ kho nào? Giao qua đơn vị vận chuyển nào?"

### NHÓM 4: Xác định scope

13. > "Nếu có hệ thống mới, điều quan trọng nhất là gì — tốc độ POS, quản lý kho, hay báo cáo?"

14. > "Ai là người dùng chính: thu ngân, quản lý cửa hàng, kế toán trung tâm, hay tất cả?"

15. > "Có kế hoạch mở thêm cửa hàng không? Trong bao lâu?"

---

## Mapping → IDs

| Phát hiện | ID |
|-----------|-----|
| Mất đồng bộ kho giữa các cửa hàng | PROB-001 |
| POS chậm, hay đứng giờ cao điểm | PROB-002 |
| Không có báo cáo thời gian thực | PROB-003 |
| Quản lý khuyến mãi phức tạp/thủ công | PROB-004 |
| Oversell giữa kênh online và offline | PROB-005 |
| Không quản lý được FIFO/hết hạn sử dụng | PROB-006 |

---

## Hỏi sâu khi cần

- **Thanh toán:** "Nhận những hình thức thanh toán nào? VNPAY, MoMo, thẻ...?"
- **Đổi trả:** "Chính sách đổi trả: đang quản lý thế nào?"
- **Nhân sự:** "Ca làm việc, chấm công — có tích hợp với bán hàng không?"
- **Franchise:** "Nếu nhượng quyền: franchisor muốn kiểm soát những gì từ trung tâm?"
