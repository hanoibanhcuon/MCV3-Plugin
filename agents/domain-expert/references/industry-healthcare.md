# Industry Knowledge: Healthcare & Hospital Management

Knowledge base cho domain-expert agent khi làm dự án Y tế, Bệnh viện, Phòng khám.

---

## 1. Tổng quan ngành

### Các loại tổ chức y tế

| Loại | Mô tả | Đặc điểm MCV3 |
|------|-------|--------------|
| Bệnh viện công | Nhà nước sở hữu, nhiều phòng ban | Phức tạp cao, compliance nghiêm ngặt |
| Bệnh viện tư | Private, profit-oriented | KPI theo doanh thu + chất lượng |
| Phòng khám đa khoa | Outpatient chính | Workflow nhanh, patient flow |
| Phòng khám chuyên khoa | Specialization focus | Domain-specific protocols |
| Chuỗi phòng khám | Multi-location | Standardization + local adaptation |
| Telemedicine | Online consultation | Real-time, low-latency critical |
| Pharma/Drug store | Medication retail | Inventory + prescription control |

### Hệ thống điển hình

```
HIS (Hospital Information System)
├── OPD — Outpatient Department (Khám ngoại trú)
├── IPD — Inpatient Department (Nội trú)
├── EMR — Electronic Medical Records (Hồ sơ bệnh án điện tử)
├── LIS — Laboratory Information System (Xét nghiệm)
├── RIS — Radiology Information System (Chẩn đoán hình ảnh)
├── PMS — Pharmacy Management System (Dược)
├── Billing — Thanh toán + Bảo hiểm
└── Admin — Nhân sự, Vật tư, Tài chính
```

---

## 2. Business Rules đặc thù

### Quy tắc bệnh nhân

```
BR-HC-001: Mỗi bệnh nhân có MRN (Medical Record Number) duy nhất
BR-HC-002: Hồ sơ bệnh án phải lưu trữ tối thiểu 10 năm (Luật Khám chữa bệnh)
BR-HC-003: Thông tin bệnh nhân là bảo mật y tế — không chia sẻ không có consent
BR-HC-004: Bệnh nhân có quyền xem và copy hồ sơ bệnh án của mình
BR-HC-005: Bệnh nhân dưới 18 tuổi cần có người giám hộ ký consent
```

### Quy tắc khám chữa bệnh

```
BR-HC-010: Đơn thuốc phải có chữ ký/mã số bác sĩ có chứng chỉ hành nghề
BR-HC-011: Thuốc kê đơn loại đặc biệt (ma túy, hướng thần) phải có sổ quản lý riêng
BR-HC-012: Chẩn đoán phải mã hóa theo ICD-10 (hoặc ICD-11 nếu mới)
BR-HC-013: Quy trình khẩn cấp — bệnh nhân được điều trị trước, thanh toán sau
BR-HC-014: Bác sĩ không được kê đơn cho người thân trực tiếp
```

### Quy tắc dược phẩm

```
BR-HC-020: Xuất dược phải có toa thuốc hợp lệ (trừ OTC)
BR-HC-021: Thuốc hết hạn không được xuất bán — phải hủy đúng quy trình
BR-HC-022: FEFO (First Expired First Out) cho quản lý tồn kho dược
BR-HC-023: Kiểm tra tương tác thuốc trước khi cấp phát
BR-HC-024: Cold chain: nhiệt độ theo dõi 24/7 cho vaccine và sinh phẩm
```

### Quy tắc bảo hiểm y tế

```
BR-HC-030: BHYT chi trả theo tuyến điều trị (đúng tuyến vs vượt tuyến)
BR-HC-031: Bệnh nhân BHYT phải xuất trình thẻ và CCCD
BR-HC-032: Danh mục thuốc BHYT thanh toán theo Thông tư 20/2022
BR-HC-033: Thanh toán BHYT online qua cổng giám định AVK
BR-HC-034: Limit: Một số dịch vụ có giới hạn số lần thanh toán BHYT/năm
```

---

## 3. Data Model đặc thù

### Core Entities

```
Patient (Bệnh nhân)
  mrn: string PK (Medical Record Number)
  full_name, dob, gender
  national_id (CCCD/CMND)
  insurance_number (số thẻ BHYT)
  blood_type, allergies[]
  emergency_contact

Visit (Lượt khám)
  visit_id, patient_mrn, visit_date
  visit_type: OPD | IPD | Emergency
  chief_complaint (lý do khám)
  assigned_doctor_id
  department_id
  status: registered | in_progress | completed | cancelled

Diagnosis (Chẩn đoán)
  visit_id, doctor_id
  icd10_code, description
  diagnosis_type: primary | secondary

Prescription (Đơn thuốc)
  rx_id, visit_id, prescribing_doctor_id
  created_at
  items[]: { drug_id, dosage, frequency, duration }
  status: pending | dispensed | cancelled

MedicalRecord (Hồ sơ bệnh án)
  record_id, patient_mrn
  visit history[]
  vital signs history[]
  lab results[]
  imaging results[]
  allergies[], current medications[]
```

### ICD-10 và Clinical Coding

```
Luôn dùng ICD-10 codes khi thiết kế diagnosis fields:
  J18.9: Pneumonia, unspecified
  E11: Type 2 diabetes mellitus
  I10: Essential (primary) hypertension

In Vietnam: Bộ Y tế yêu cầu ICD-10 từ 2015
Tương lai: ICD-11 đang trong lộ trình adoption
```

---

## 4. Compliance & Regulatory

### Luật và Quy định Việt Nam

```
Luật Khám bệnh, chữa bệnh 2023 (Số 15/2023/QH15)
  - Điều kiện hành nghề bác sĩ (chứng chỉ hành nghề)
  - Quyền và nghĩa vụ bệnh nhân
  - Hồ sơ bệnh án điện tử (EMR) được pháp lý công nhận

Nghị định 96/2023/NĐ-CP — Hướng dẫn Luật KCB 2023
  - Quản lý hành nghề y dược
  - Điều kiện cơ sở KCB

Thông tư 20/2022/TT-BYT — Danh mục thuốc BHYT
  - Cập nhật mỗi năm — code cần handle versioning

Quyết định số 5904/QĐ-BYT — SNOMED CT và ICD-10 tiếng Việt
```

### Data Privacy

```
Thông tin sức khỏe là sensitive personal data (PDPA equivalent)
→ Mã hóa at-rest và in-transit (AES-256)
→ Audit log mọi access
→ Consent required trước khi share với bên thứ ba
→ Pseudonymization cho nghiên cứu/analytics
→ DSAR rights (Data Subject Access Request)
```

### Audit Trail Requirements

```
Mọi thay đổi EMR phải có:
  - Timestamp (UTC)
  - User ID (doctor/nurse/admin)
  - Action type (create/update/delete/view)
  - IP address
  - Previous value (for updates)
  - Reason for change (for corrections)

Correction policy: Không xóa — chỉ "amend" với explanation
```

---

## 5. Workflow Patterns

### OPD (Outpatient) Flow

```
Registration → Triage → Waiting → Consultation →
Diagnosis → Prescription → Pharmacy → Payment → Exit

Key touchpoints:
  - Queue management (số thứ tự, estimated wait time)
  - Vital signs capture (BP, HR, Temp, SpO2, Weight)
  - Doctor SOAP note (Subjective, Objective, Assessment, Plan)
  - E-prescription → Pharmacy dispensing
```

### Emergency Flow

```
Arrival → Triage (ESI score 1-5) → Treatment →
[Admit to IPD | Discharge | Transfer]

Triage ESI:
  1 = Life threatening → Immediate (0 min)
  2 = Emergency → < 15 min
  3 = Urgent → < 30 min
  4 = Semi-urgent → < 1 hour
  5 = Non-urgent → < 2 hours
```

### Laboratory Flow

```
Order → Collection → Processing → Result →
Validation → Release → Notification

Critical values (panic values) → Auto-alert bác sĩ
Normal ranges vary by: age, gender, pregnancy status
```

---

## 6. Integration Points

### Hệ thống bên ngoài

```
BHXH (Social Insurance):
  API: Giám định BHYT online
  Format: XML theo chuẩn BHXH
  Endpoint: https://gdbhyt.baohiemxahoi.gov.vn/

Bộ Y tế:
  Hệ thống Hồ sơ sức khỏe điện tử toàn dân (HSSK)
  Nền tảng tích hợp và chia sẻ dữ liệu y tế (EMC)

Laboratory Equipment:
  HL7 FHIR hoặc ASTM interface
  LIS middleware (Mirth Connect phổ biến)

Medical Devices:
  Ventilators, monitors → real-time vital signs
  PACS server → DICOM images
```

---

## 7. NFR đặc thù

```
Availability: 99.9% uptime (downtime = patient safety risk)
Response time: < 2s for all critical workflows
Data backup: Real-time replication, RPO < 15 minutes
Disaster recovery: RTO < 4 hours

Security:
  - Role-based access: Doctor, Nurse, Pharmacist, Admin, Patient
  - Two-factor authentication for EMR access
  - Session timeout: 15 minutes idle
  - Encrypt all PHI (Protected Health Information)

Scalability: Peak load = morning rush 7-9 AM (3-5x normal)
```

---

## 8. Common Pitfalls

### Pitfall 1: Không handle ICD-10 versioning
ICD codes thay đổi theo năm — thiết kế code_date/version field

### Pitfall 2: Quên audit trail
Bác sĩ/y tá sửa record → phải log. Không đủ audit log = không pass compliance audit

### Pitfall 3: Bỏ qua patient merge
Bệnh nhân duplicate records rất phổ biến — cần patient deduplication + merge workflow

### Pitfall 4: Không có offline mode cho khu vực không có mạng
Phòng khám vùng sâu → cần offline capability + sync khi có mạng

### Pitfall 5: Quên consent management
Mọi thủ thuật/xét nghiệm cần signed consent — digital consent với timestamp
