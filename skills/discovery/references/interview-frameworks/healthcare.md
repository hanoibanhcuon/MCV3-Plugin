# Interview Framework — Healthcare / Y tế

Dùng khi user mô tả dự án thuộc lĩnh vực y tế, bệnh viện, phòng khám, dược, thiết bị y tế.

---

## Từ khóa trigger

`bệnh viện`, `phòng khám`, `bệnh nhân`, `bác sĩ`, `điều dưỡng`, `EMR`, `HIS`,
`BHYT`, `kê đơn`, `xét nghiệm`, `chẩn đoán`, `dược`, `phòng mổ`, `telemedicine`

---

## Câu hỏi phỏng vấn theo thứ tự

### Block 1 — Loại cơ sở y tế

```
1. Cơ sở của bạn là bệnh viện, phòng khám đa khoa, hay phòng khám chuyên khoa?
   → Xác định scope và compliance level

2. Quy mô: bao nhiêu bác sĩ, bao nhiêu giường bệnh (nếu có nội trú)?
   → Ảnh hưởng đến performance requirements

3. Có ký hợp đồng khám chữa bệnh BHYT không?
   → Nếu có: cần tích hợp với phần mềm giám định BHYT
```

### Block 2 — Quy trình khám chữa bệnh

```
4. Quy trình từ khi bệnh nhân đến đến khi ra về?
   Gợi ý: Đăng ký tiếp nhận → Triage → Khám → Chỉ định XN/CĐHA → Kết quả →
          Chẩn đoán → Kê đơn → Thanh toán → Ra về

5. Bệnh nhân đặt lịch trước hay đến trực tiếp?
   → Scheduling module, hàng đợi

6. Có khoa nào đặc biệt không? (Cấp cứu, ICU, phẫu thuật, sản khoa...)
   → Các workflow đặc thù
```

### Block 3 — Hồ sơ bệnh nhân

```
7. Hiện tại hồ sơ bệnh nhân được lưu như thế nào? (giấy / Excel / phần mềm cũ)
   → Migration scope

8. Thông tin nào cần lưu cho mỗi bệnh nhân?
   Gợi ý: Nhân thân, BHYT, tiền sử bệnh, dị ứng thuốc, kết quả XN lịch sử

9. Có cần chia sẻ hồ sơ giữa các bác sĩ / khoa không?
   → Phân quyền, consent management
```

### Block 4 — Dược & Vật tư

```
10. Có phòng thuốc / dược bệnh viện không?
    → Pharmacy module, kê đơn điện tử, xuất thuốc

11. Quản lý tồn kho thuốc và vật tư y tế như thế nào hiện tại?
    → Inventory, expiry tracking, lot tracking

12. Có kiểm soát tương tác thuốc không (drug interaction)?
    → Drug database integration (MIMS, PharmaCity API...)
```

### Block 5 — Thanh toán & BHYT

```
13. Hình thức thanh toán: tiền mặt, chuyển khoản, BHYT, bảo hiểm tư nhân?

14. Nếu có BHYT: đang dùng phần mềm gì để kết nối HIS với cổng BHXH?
    → Tích hợp hoặc thay thế phần mềm hiện tại

15. Có khám dịch vụ (tự nguyện, fee-for-service) song song BHYT không?
    → Dual billing logic
```

### Block 6 — Compliance & Security

```
16. Có yêu cầu lưu trữ hồ sơ bao lâu? (Thông tư 46/2018: ít nhất 10 năm)

17. Ai được phép xem hồ sơ bệnh nhân nào?
    → RBAC per patient record, audit log bắt buộc

18. Có lo ngại về bảo mật dữ liệu y tế không? (PHI/PII)
    → Encryption, access log, consent management
```

---

## IDs để assign

```
PROB: Vấn đề hiện tại (hồ sơ giấy, BHYT thủ công, sai thuốc...)
BG-BUS: Loại cơ sở, quy mô, chuyên khoa
SC-IN: Modules cần làm (EMR, appointment, pharmacy, billing, BHYT)
SC-OUT: Modules không làm (equipment maintenance, research, teaching hospital features)
GL: Mục tiêu cụ thể (rút ngắn thời gian chờ, giảm lỗi kê đơn...)
CON: Ngân sách, tích hợp với BHXH, hạn chế phần cứng
```

---

## Quy định VN cần hỏi thêm (nếu relevant)

```
- Thông tư 46/2018: Quy chế bệnh viện — lưu trữ hồ sơ bệnh án
- Thông tư 48/2018: Kê đơn thuốc điện tử
- Nghị định 87/2011: Khám chữa bệnh từ xa (telemedicine)
- Cổng HIS-BHXH: tích hợp qua API cổng thông tin BHXH
- Dữ liệu y tế: theo Nghị định 13/2023 về BVDL cá nhân
```

---

## Red flags cần warn user

```
⚠️ Yêu cầu tích hợp BHXH ngay từ đầu:
   → Đây là tích hợp phức tạp, cần thời gian test và phê duyệt từ BHXH

⚠️ Không có kế hoạch migrate hồ sơ giấy:
   → Data entry backlog lớn, cần nhân lực hoặc OCR

⚠️ Bỏ qua audit log:
   → Pháp lý bắt buộc — mọi truy cập hồ sơ phải được ghi lại
```
