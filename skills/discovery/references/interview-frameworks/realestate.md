# Interview Framework — Bất động sản (Real Estate)

Dùng khi user mô tả dự án thuộc lĩnh vực BĐS, môi giới, quản lý dự án địa ốc.

---

## Từ khóa trigger

`bất động sản`, `BĐS`, `môi giới`, `căn hộ`, `đất nền`, `nhà phố`, `sổ đỏ`,
`chủ đầu tư`, `dự án BĐS`, `cho thuê nhà`, `quản lý tòa nhà`, `CRM BĐS`,
`property management`, `landlord`, `tenant`, `building management`

---

## Câu hỏi phỏng vấn theo thứ tự

### Block 1 — Loại hệ thống BĐS

```
1. Hệ thống của bạn phục vụ cho ai?
   - Sàn giao dịch BĐS / công ty môi giới
   - Chủ đầu tư quản lý dự án của mình
   - Quản lý tòa nhà / property management
   - Portal đăng tin BĐS (như Batdongsan.com.vn)

2. Loại BĐS chủ yếu xử lý: nhà ở hay thương mại?
   Nhà ở: căn hộ, nhà phố, biệt thự, đất nền
   Thương mại: văn phòng, mặt bằng cho thuê, shophouse

3. Có tập trung vào mua bán hay cho thuê hay cả hai?
```

### Block 2 — Quy trình giao dịch

```
4. Một giao dịch BĐS diễn ra qua những bước nào?
   Gợi ý: Lead → Xem nhà → Đàm phán → Đặt cọc → Ký HĐMB → Công chứng →
          Sang tên → Bàn giao

5. Agent có làm việc độc lập hay theo team/nhóm?
   → Commission split rules

6. Thời gian trung bình từ khi có lead đến khi đóng deal là bao lâu?
   → Pipeline visibility, follow-up reminders
```

### Block 3 — Quản lý bất động sản

```
7. Thông tin nào cần lưu cho mỗi property?
   Gợi ý: Vị trí, diện tích, pháp lý (sổ đỏ/hồng), giá, ảnh, tình trạng

8. Có nhiều dự án / tòa nhà không? Hay chỉ 1 dự án?
   → Single vs. multi-project architecture

9. Cần quản lý tồn kho căn hộ không? (tracking trạng thái: available/reserved/sold)
   → Inventory management với reservation

10. Có cần hiển thị sơ đồ tầng / layout (floor plan view) không?
    → Visual floor plan component
```

### Block 4 — Lead & CRM

```
11. Khách hàng tiềm năng (leads) đến từ đâu?
    Gợi ý: Website, Batdongsan.com.vn, Facebook, Zalo, walk-in, referral

12. Có bao nhiêu agent/nhân viên kinh doanh sẽ dùng hệ thống?
    → Multi-user với phân quyền

13. Ai là người được assign lead? Có rule nào không?
    → Lead routing logic (round-robin, by area, by tier)

14. Có theo dõi lịch sử liên hệ với khách không?
    → Activity log (calls, meetings, messages)
```

### Block 5 — Hoa hồng

```
15. Hoa hồng được tính theo % giá bán hay cố định?
    → Commission calculation engine

16. Nếu có nhiều agent cùng deal, chia hoa hồng như thế nào?
    → Deal splitting: listing agent vs. buying agent

17. Khi nào hoa hồng được ghi nhận và thanh toán?
    → Commission timing: khi ký cọc, ký HĐMB, hay hoàn thành sang tên?
```

### Block 6 — Pháp lý & Tài liệu

```
18. Cần lưu những giấy tờ pháp lý nào? (Sổ đỏ scan, HĐMB, biên bản bàn giao...)
    → Document management

19. Có cần generate hợp đồng tự động không?
    → Contract template + merge fields

20. Có cần tính thuế TNCN chuyển nhượng (2% giá bán) không?
    → Tax calculator
```

---

## IDs để assign

```
PROB: Vấn đề (mất lead, conflict inventory, tính hoa hồng sai, không track deal...)
BG-BUS: Loại công ty BĐS, quy mô, loại property
SC-IN: Property listing, CRM, pipeline, commission, documents
SC-OUT: Tích hợp sàn (Batdongsan) — nếu phase 2, mortgage calculator
GL: Giảm thời gian close deal, tăng số deal/agent/tháng
CON: Số agent, số property, tích hợp portal nào
```

---

## VN Context quan trọng

```
Pháp lý cần hỏi:
  - Dự án đã có sổ chưa, hay đang bán hình thành trong tương lai?
  - Có áp dụng Luật Nhà ở 2023 (hiệu lực 01/08/2024) không?
  - Bán cho người nước ngoài không? (quota 30% căn hộ/tòa nhà)

Marketing:
  - Portal chính: Batdongsan.com.vn, Homedy, Chotot
  - Social: Facebook BĐS groups, Zalo
  - Google Ads → landing page → lead form
```

---

## Red flags cần warn user

```
⚠️ Không có race condition handling khi 2 agent cùng reserve 1 căn:
   → Cần database-level locking + reservation timer

⚠️ Thiếu audit trail cho price changes:
   → BĐS high-value, mọi thay đổi giá phải có timestamp + user log

⚠️ Commission không có approval workflow:
   → Finance team không kiểm soát được khi agent tự claim

⚠️ Không có data backup cho hợp đồng scan:
   → Tài liệu pháp lý mất = thảm họa → cần cloud storage + backup policy
```
