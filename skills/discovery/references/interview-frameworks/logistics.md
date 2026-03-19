# Interview Framework — Logistics / Xuất nhập khẩu

## Ngữ cảnh áp dụng

Dùng khi dự án liên quan đến: vận chuyển, logistics, XNK, hải quan, kho bãi, freight forwarding, chuỗi cung ứng.

---

## Bộ câu hỏi Discovery

### NHÓM 1: Hiểu nghiệp vụ hiện tại

1. **Mở đầu:**
   > "Hãy mô tả quy trình làm việc hàng ngày của công ty bạn — từ khi nhận đơn hàng đến khi giao hàng cho khách?"

2. **Khai thác vấn đề:**
   > "Bước nào trong quy trình đó tốn nhiều thời gian nhất hoặc hay xảy ra lỗi nhất?"

3. **Lượng hóa:**
   > "Công ty xử lý bao nhiêu lô hàng/tháng? Bao nhiêu nhân viên phụ trách?"

4. **Tìm hiểu hệ thống hiện tại:**
   > "Hiện tại công ty dùng phần mềm/công cụ gì để quản lý? Excel? Phần mềm riêng? ERP nào?"

### NHÓM 2: Khai thác nghiệp vụ đặc thù

5. **Loại hàng hóa:**
   > "Công ty chủ yếu vận chuyển hàng gì? Có hàng nguy hiểm, lạnh, hoặc đặc biệt không?"

6. **Tuyến đường:**
   > "Xuất khẩu sang những thị trường nào? Nhập khẩu từ đâu? Sea / Air / Land / Multimodal?"

7. **Hải quan:**
   > "Hiện tại quy trình khai báo hải quan như thế nào? Tự làm hay dùng broker? Dùng hệ thống VNACCS không?"

8. **Incoterms và chứng từ:**
   > "Điều kiện giao hàng thường dùng là gì (FOB, CIF, ...)? Những chứng từ nào hay bị thiếu hoặc sai?"

9. **Tracking:**
   > "Khách hàng hỏi tình trạng lô hàng như thế nào hiện tại? Có hệ thống tracking không?"

10. **Kho bãi:**
    > "Công ty có kho không? Quản lý xuất nhập kho như thế nào?"

### NHÓM 3: Xác định scope

11. **Ưu tiên:**
    > "Nếu chỉ giải quyết được 1-2 vấn đề lớn nhất trước, bạn muốn giải quyết vấn đề nào?"

12. **Người dùng:**
    > "Ai sẽ dùng hệ thống? Nhân viên ops, kế toán, quản lý, hay cả khách hàng?"

13. **Tích hợp:**
    > "Cần tích hợp với hệ thống nào? (Ngân hàng, hải quan VNACCS, đối tác vận tải...)"

14. **Timeline:**
    > "Bao giờ cần có hệ thống? Có deadline nào không (mùa cao điểm, hợp đồng mới...)?"

---

## Mapping câu trả lời → IDs

| Nội dung phát hiện | Assign ID |
|-------------------|-----------|
| Nhập liệu thủ công → sai sót | PROB-001 |
| Thiếu visibility lô hàng | PROB-002 |
| Khai báo hải quan mất thời gian | PROB-003 |
| Khó quản lý chứng từ | PROB-004 |
| Không có tracking cho khách | PROB-005 |
| Kho bãi quản lý rời rạc | PROB-006 |
| Ngành vận tải quốc tế | BG-BUS-001 |
| Quy định hải quan VN (VNACCS) | BG-TECH-001 |
| ERP/phần mềm hiện tại | BG-TECH-002 |

---

## Hỏi sâu khi cần

Nếu user đề cập đến một trong các chủ đề sau, hỏi thêm:

- **HS Code:** "HS Code cho hàng của bạn là gì? Có hay bị sai mã không?"
- **Thuế:** "Có vấn đề gì về tính thuế nhập khẩu/VAT không?"
- **Phí logistics:** "Cách tính và báo giá cho khách như thế nào hiện tại?"
- **Credit management:** "Có vấn đề gì về công nợ với đại lý/khách hàng không?"
- **Cảng:** "Hay làm việc với cảng nào? Cát Lái, Cái Mép, Tiên Sa...?"

---

## Red flags cần chú ý

- User nói "chỉ cần đơn giản thôi" → thường scope lớn hơn nhiều → hỏi sâu
- User muốn "thay thế ERP cũ" → cần hiểu tại sao ERP cũ thất bại
- User đề cập nhiều hệ thống khác nhau → cần mapping integration rõ ràng
- Ngành logistics có compliance cao → hỏi về Nghị định hải quan hiện hành
