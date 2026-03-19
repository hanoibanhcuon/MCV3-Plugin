# Biz-Docs Industry Reference — Logistics / XNK

## Business Rules thường gặp trong Logistics

### Nhóm Vận chuyển

| BR | Nội dung điển hình | Notes |
|----|-------------------|-------|
| BR-OPS-001 | Booking phải được confirm trong 24h | Timeline có thể khác |
| BR-OPS-002 | Hàng HAZMAT phải khai báo riêng | Bắt buộc theo IATA/IMDG |
| BR-OPS-003 | Hàng lạnh phải có temperature log | Best practice |
| BR-OPS-004 | Không nhận booking khi CY CUT qua | Operational rule |

### Nhóm Hải quan

| BR | Nội dung điển hình |
|----|------------------|
| BR-CUS-001 | HS Code phải được kiểm tra bởi khai quan viên có chứng chỉ |
| BR-CUS-002 | Khai báo hải quan phải submit trước X giờ so với CY CUT |
| BR-CUS-003 | Lưu trữ tờ khai và chứng từ tối thiểu 5 năm |
| BR-CUS-004 | Hàng phân luồng đỏ phải có mặt tại kiểm tra |

### Nhóm Tài chính / Phí

| BR | Nội dung điển hình |
|----|------------------|
| BR-FIN-001 | Báo giá có hiệu lực trong 3 ngày làm việc |
| BR-FIN-002 | Phí phát sinh phải được approval của khách trước khi thực hiện |
| BR-FIN-003 | Invoice gửi trong 24h sau khi hoàn tất lô hàng |

---

## Quy trình chuẩn cho BIZ-DOCS Logistics

### Documents cần tạo (tối thiểu)

1. **BIZ-POLICY-OPS.md** — Operations, booking, cargo handling
2. **BIZ-POLICY-CUS.md** — Customs clearance rules
3. **PROCESS-EXPORT.md** — Quy trình xuất khẩu AS-IS → TO-BE
4. **PROCESS-IMPORT.md** — Quy trình nhập khẩu
5. **DATA-DICTIONARY.md** — Thuật ngữ hải quan, logistics

### DATA DICTIONARY entries thường cần

| Term | Định nghĩa cần hỏi user |
|------|------------------------|
| Lô hàng (Shipment) | Đơn vị tracking: 1 container? 1 B/L? |
| Cước biển (Ocean Freight) | Các loại phí bao gồm không? |
| CY CUT | Ngày cutoff cụ thể theo từng hãng tàu |
| Luồng xanh/vàng/đỏ | Định nghĩa theo VNACCS của công ty |

---

## Câu hỏi hỏi user cho Logistics Biz-Docs

```
1. "Công ty làm Forwarder, Shipper, hay Broker? Hay kết hợp?"
2. "Có làm Customs Broker không? Hay chỉ vận tải?"
3. "Có kho CFS/ICD riêng không?"
4. "Quy trình phê duyệt báo giá: ai có quyền confirm price?"
5. "Hàng HAZMAT có làm không? Nếu có, quy trình riêng thế nào?"
6. "Credit limit cho khách: có policy không?"
```
