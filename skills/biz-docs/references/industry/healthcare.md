# Biz-Docs Reference — Healthcare / Y tế

Dùng trong Phase 3 (Biz-Docs) khi project thuộc lĩnh vực y tế.

---

## KPIs ngành Y tế

```
Operational KPIs:
  - Thời gian chờ khám (wait time): target < 30 phút
  - Thời gian khám bình quân (consultation time): 10-20 phút
  - Tỷ lệ lấp đầy giường bệnh (bed occupancy): 80-90% là tối ưu
  - Tỷ lệ tái nhập viện trong 30 ngày: mục tiêu < 10%
  - Tỷ lệ hủy/trễ lịch hẹn: target < 5%

Financial KPIs:
  - Doanh thu theo khoa / bác sĩ / dịch vụ
  - Average Revenue Per Visit (ARPV)
  - Tỷ lệ thu hồi công nợ bảo hiểm
  - Cost per patient visit
  - Tỷ lệ dịch vụ BHYT vs. dịch vụ tự nguyện (fee ratio)

Quality KPIs:
  - Patient satisfaction score (NPS)
  - Tỷ lệ sai sót kê đơn (prescription error rate): target 0
  - Tỷ lệ nhiễm khuẩn bệnh viện (HAI rate)
  - Tỷ lệ lấy kết quả xét nghiệm đúng thời hạn (TAT compliance)
```

---

## Quy trình nghiệp vụ cốt lõi

### PROC-HIS-001: Quy trình khám ngoại trú

```
AS-IS (phổ biến ở phòng khám nhỏ):
  Bệnh nhân đến → Lấy số → Đăng ký thủ công → Chờ → Bác sĩ khám → Viết đơn tay →
  Ra quầy thuốc → Thanh toán tiền mặt

TO-BE:
  Đặt lịch online/app/Zalo → Check-in QR → Điều dưỡng triage → Bác sĩ khám trên tablet →
  Kê đơn điện tử → Dược sĩ chuẩn bị thuốc → Thanh toán đa kênh (VNPAY/cash)

Pain points giải quyết:
  - PAIN-001: Bệnh nhân chờ lâu → Booking + queue management
  - PAIN-002: Hồ sơ giấy thất lạc → EMR số hóa
  - PAIN-003: Kê đơn sai thuốc → Drug interaction check + barcode
  - PAIN-004: Thanh toán BHYT chậm → Auto-claim generation
```

### PROC-HIS-002: Quy trình kê đơn thuốc

```
Actors: Bác sĩ, Dược sĩ, Bệnh nhân

Bước 1 — Bác sĩ kê đơn:
  - Chọn thuốc từ danh mục (thuốc BHYT + ngoài danh mục)
  - Hệ thống check: dị ứng, tương tác thuốc, liều lượng hợp lý
  - Ký số điện tử (theo TT 48/2018)
  - Đơn tự động gửi sang quầy thuốc

Bước 2 — Dược sĩ chuẩn bị:
  - Nhận đơn điện tử, kiểm tra tồn kho
  - Xuất thuốc theo đơn, scan barcode xác nhận
  - Tư vấn hướng dẫn sử dụng

Business Rules:
  - BR-MED-001: Đơn thuốc phải có chữ ký điện tử bác sĩ có chứng chỉ hành nghề
  - BR-MED-002: Kháng sinh nhóm betalactam phải có test da trước khi dùng
  - BR-MED-003: Thuốc gây nghiện (opiate) → báo cáo Bộ Y tế theo quy định
  - BR-MED-004: Kiểm tra hạn dùng: không xuất thuốc hết hạn trong 3 tháng
```

---

## Business Rules Cốt lõi

### Khám chữa bệnh

```
BR-HIS-001: Mỗi lần khám phải tạo Visit Record với timestamp đầy đủ (audit)
BR-HIS-002: Hồ sơ bệnh nhân phải lưu tối thiểu 10 năm (TT 46/2018)
BR-HIS-003: Chẩn đoán phải theo mã ICD-10 để tương thích BHYT
BR-HIS-004: Phụ nữ có thai không được chỉ định một số xét nghiệm/thuốc
BR-HIS-005: Bệnh nhân < 18 tuổi cần có người giám hộ ký đồng ý
```

### BHYT

```
BR-BHYT-001: Bệnh nhân BHYT phải khám đúng tuyến (trừ cấp cứu)
BR-BHYT-002: Dịch vụ kỹ thuật phải nằm trong danh mục Bộ Y tế quy định
BR-BHYT-003: Giới hạn ngày điều trị nội trú per admission theo bệnh
BR-BHYT-004: Xuất toán BHYT phải đúng format XML theo quy định BHXH
BR-BHYT-005: Bệnh nhân trái tuyến được hưởng 40% (nội trú) / 30% (ngoại trú)
```

---

## Compliance Requirements

```
| Quy định | Nội dung | Tác động đến thiết kế |
|---------|---------|---------------------|
| TT 46/2018 (Bộ YT) | Lưu trữ hồ sơ bệnh án 10 năm | Audit trail, no-delete policy, archival |
| TT 48/2018 (Bộ YT) | Kê đơn thuốc điện tử | Digital signature integration |
| Nghị định 13/2023 (BVDL) | Bảo vệ dữ liệu cá nhân | Patient consent management, encryption |
| Nghị định 87/2011 | Telemedicine requirements | Video consult compliance |
| Thông tư BHXH về HIS | Kết nối HIS với cổng BHXH | API/XML integration với BHXH |
| ISO 27001 (khuyến khích) | Bảo mật thông tin | Security controls |
```

---

## Pain Points phổ biến

```
- Hồ sơ bệnh án giấy: tốn chỗ, khó tra cứu, dễ mất
- Đặt lịch qua điện thoại: tốn nhân lực, dễ nhầm lịch
- Kê đơn thủ công: nguy cơ sai chữ, sai liều
- Thanh toán BHYT thủ công: chậm, sai sót, chậm thu hồi tiền
- Không có thông báo kết quả xét nghiệm: bệnh nhân gọi điện hỏi nhiều
- Quản lý thuốc thủ công: hết hàng không biết, xuất thuốc hết hạn
```

---

## Entities Data Dictionary gợi ý

```
Patient: patient_id, mrn (Medical Record Number), name, dob, gender,
         id_card, bhyt_code, bhyt_expiry, blood_type, allergies[]
Visit: visit_id, patient_id, doctor_id, visit_date, chief_complaint,
       diagnosis (ICD-10), visit_type (outpatient/inpatient/emergency)
Prescription: prescription_id, visit_id, doctor_id, issued_at, signed_digitally
PrescriptionItem: drug_id, dosage, frequency, duration, quantity, instruction
LabOrder: order_id, visit_id, tests[], ordered_at, status, results[]
BHYTClaim: claim_id, visit_id, amount, services[], status, submitted_at
```
