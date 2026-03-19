# Interview Framework — General (Chung)

## Ngữ cảnh áp dụng

Dùng khi ngành kinh doanh chưa rõ hoặc không thuộc các ngành chuyên biệt khác.

---

## Bộ câu hỏi Discovery (Universal)

### NHÓM 1: Bối cảnh kinh doanh

1. > "Hãy mô tả công ty/tổ chức của bạn: làm gì, quy mô ra sao, khách hàng là ai?"

2. > "Bộ phận nào sẽ sử dụng phần mềm này nhiều nhất?"

3. > "Quy trình nghiệp vụ cần phần mềm hỗ trợ là gì? Mô tả từ đầu đến cuối."

### NHÓM 2: Vấn đề & Pain Points

4. > "Điều gì đang làm bạn khó chịu nhất với cách làm việc hiện tại?"

5. > "Bao nhiêu thời gian/tuần bị 'mất' vào các tác vụ lặp đi lặp lại có thể tự động hóa?"

6. > "Có những lỗi nào thường xuyên xảy ra? Hậu quả của những lỗi đó là gì?"

7. > "Khách hàng/đối tác phàn nàn về điều gì liên quan đến quy trình của bạn?"

### NHÓM 3: Hệ thống hiện tại

8. > "Hiện tại dùng công cụ/phần mềm gì? (Kể cả Excel, Google Sheets)"

9. > "Vì sao muốn thay đổi? Hệ thống cũ có vấn đề gì?"

10. > "Dữ liệu hiện tại lưu ở đâu? Cần migrate sang hệ thống mới không?"

### NHÓM 4: Yêu cầu & Mục tiêu

11. > "Nếu có hệ thống mới hoàn hảo, điều khác biệt lớn nhất so với bây giờ là gì?"

12. > "Mục tiêu cụ thể: tiết kiệm X giờ/tuần? Giảm Y% lỗi? Phục vụ Z khách hàng/ngày?"

13. > "Ai sẽ dùng? Bao nhiêu người? Level IT của họ cao hay thấp?"

14. > "Timeline: cần có trong bao lâu? Có deadline nào không?"

15. > "Budget: có constraints gì không? Là dự án nội bộ hay cần ROI rõ ràng?"

### NHÓM 5: Scope Clarity

16. > "Liệt kê 3-5 tính năng MUST HAVE — nếu không có thì hệ thống vô nghĩa."

17. > "Liệt kê những gì KHÔNG cần trong version đầu tiên."

18. > "Cần tích hợp với hệ thống nào khác?"

---

## Mapping → IDs

| Phát hiện | ID |
|-----------|-----|
| Mỗi vấn đề riêng biệt | PROB-NNN |
| Bối cảnh kinh doanh | BG-BUS-NNN |
| Công cụ/hệ thống hiện tại | BG-TECH-NNN |
| Mục tiêu đo lường được | GL-NNN |
| Phạm vi cần làm | SC-IN-NNN |
| Phạm vi không làm | SC-OUT-NNN |
| Người dùng/stakeholder | ST-NNN |
| Ràng buộc | CON-NNN |

---

## Quy tắc khi dùng framework này

1. Không cần hỏi tất cả — chọn câu hỏi phù hợp
2. Ưu tiên hỏi về PAIN POINTS trước, features sau
3. Validate bằng cách hỏi lại: "Nếu vấn đề X được giải quyết, giá trị với công ty là gì?"
4. Tìm "quick win" — vấn đề nhỏ nhưng dễ giải quyết → build trust
