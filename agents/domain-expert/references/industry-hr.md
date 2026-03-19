# Domain Knowledge — Nhân sự / HRM (Human Resources)

Knowledge base cho Domain Expert Agent khi detect ngành HR, HRM, Payroll.

---

## Từ khóa nhận dạng

`nhân sự`, `HRM`, `lương`, `payroll`, `chấm công`, `BHXH`, `BHYT`, `BHTN`,
`thuế TNCN`, `hợp đồng lao động`, `nghỉ phép`, `tuyển dụng`, `KPI`, `OKR`,
`đánh giá nhân viên`, `bảng lương`, `tăng ca`, `13 tháng`

---

## Core Modules

### 1. Employee Master Data

```
Entities:
  - Employee: id, code, name, dob, gender, idCard, taxCode, bankAccount,
               position, department, directManager, startDate, status
  - Contract: employeeId, type, startDate, endDate, salary, allowances[], signedAt
  - Department: id, name, parentDept, manager
  - Position: id, name, grade, salaryBand (min-max)

Contract types (Bộ luật Lao động 2019):
  - Hợp đồng thử việc: tối đa 180 ngày (chức danh cần trình độ cao đẳng trở lên)
  - HĐLĐ có thời hạn: 1-36 tháng, ký tối đa 2 lần, sau đó phải vô thời hạn
  - HĐLĐ không thời hạn: ký sau 2 lần HĐXĐTH hoặc ngay từ đầu
  - Hợp đồng mùa vụ: dưới 12 tháng (chỉ cho công việc không thường xuyên)
```

### 2. Attendance / Timekeeping

```
Entities:
  - ShiftSchedule: id, name, startTime, endTime, breakMinutes, workHours
  - WorkSchedule: employeeId, month, shifts[] (assignment per day)
  - AttendanceRecord: employeeId, date, checkIn, checkOut, workHours,
                       overtimeHours, lateMinutes, earlyMinutes, source
  - LeaveRequest: employeeId, type, startDate, endDate, days, reason, status

Overtime calculation (Nghị định 145/2020):
  - Ngày thường: 150% lương giờ
  - Ngày nghỉ hàng tuần: 200% lương giờ
  - Ngày lễ, Tết, ngày nghỉ có lương: 300% lương giờ
  - Overtime limit: không quá 200 giờ/năm (300 giờ cho một số ngành)

Leave types:
  - Nghỉ phép năm: 12 ngày/năm (thêm 1 ngày/5 năm)
  - Nghỉ lễ: 11 ngày theo luật
  - Nghỉ ốm (BHXH chi): tối đa 30-180 ngày tùy thâm niên
  - Nghỉ thai sản: 6 tháng (nữ), 5-14 ngày (nam)
```

### 3. Payroll — Bảng lương

```
Quy trình tính lương tháng:
  1. Import attendance data (chấm công)
  2. Tính gross income = lương cơ bản + phụ cấp + overtime + thưởng
  3. Trừ BHXH + BHYT + BHTN (phần NV)
  4. Trừ thuế TNCN
  5. Cộng thêm nếu có advance salary
  6. Net salary = gross - BHXH/BHYT/BHTN - PIT

Payroll Entities:
  - PayrollRun: id, period (YYYY-MM), status, approvedBy, approvedAt
  - PayrollRecord: runId, employeeId, grossSalary, netSalary, items[]
  - PayrollItem: type (income/deduction), name, amount
  - PayslipExport: runId, generatedAt, fileUrl
```

---

## Bảo hiểm xã hội (Bắt buộc)

### Tỷ lệ đóng (2024 — Nghị định 58/2020)

```
| Loại BH | Doanh nghiệp | Nhân viên | Ghi chú |
|---------|-------------|-----------|---------|
| BHXH    | 17.5%       | 8%        | Hưu trí, tử tuất, ốm đau, thai sản, TNLĐ-BNN |
| BHYT    | 3%          | 1.5%      | Khám chữa bệnh |
| BHTN    | 1%          | 1%        | Thất nghiệp |
| Tổng    | 21.5%       | 10.5%     | |

Mức trần đóng BH: 20 × mức lương cơ sở = 20 × 2,340,000 = 46,800,000 VND/tháng (2024)
Lương đóng BH = Lương + các khoản gắn với thời gian/cường độ lao động
KHÔNG đóng BH trên: tiền ăn ca, xăng xe, điện thoại, nhà ở (nếu ghi riêng trong HĐ)
```

### Deadline nộp BHXH

```
- Hàng tháng: trước ngày cuối tháng hoặc theo chu kỳ 3 tháng nộp 1 lần
- Kê khai tăng/giảm lao động: trong vòng 30 ngày kể từ ngày phát sinh
- Báo cáo qua cổng BHXH điện tử (baohiemxahoi.gov.vn)
```

---

## Thuế Thu nhập cá nhân (PIT)

### Biểu thuế lũy tiến (2024 — Thông tư 111/2013 sửa đổi)

```
Thu nhập chịu thuế = Gross - BHXH/BHYT/BHTN (người lao động) - Giảm trừ gia cảnh

Giảm trừ gia cảnh:
  - Bản thân: 11,000,000 VND/tháng (132 triệu/năm)
  - Người phụ thuộc: 4,400,000 VND/người/tháng

Biểu thuế:
  | Bậc | Thu nhập chịu thuế (tháng) | Thuế suất |
  |-----|---------------------------|----------|
  | 1   | ≤ 5 triệu                 | 5%       |
  | 2   | 5 - 10 triệu              | 10%      |
  | 3   | 10 - 18 triệu             | 15%      |
  | 4   | 18 - 32 triệu             | 20%      |
  | 5   | 32 - 52 triệu             | 25%      |
  | 6   | 52 - 80 triệu             | 30%      |
  | 7   | > 80 triệu                | 35%      |

Tính PIT tháng (phương pháp rút gọn):
  Bậc 2: Thuế = Thu nhập chịu thuế × 10% - 250,000
  Bậc 3: Thuế = Thu nhập chịu thuế × 15% - 750,000
  (Xem bảng rút gọn đầy đủ theo TT 111)
```

### Quyết toán thuế cuối năm

```
- Nhân viên ủy quyền cho công ty quyết toán (nếu chỉ có 1 nguồn thu nhập)
- Deadline quyết toán: 30/3 năm sau (tổ chức), 30/4 (cá nhân tự quyết toán)
- Hoàn thuế: nếu số thuế đã khấu trừ > số phải nộp → hoàn lại NV
- Nộp thêm: nếu số thuế đã khấu trừ < số phải nộp
```

---

## Lương tối thiểu vùng (2024)

```
| Vùng | Mức lương | Tỉnh/thành |
|------|----------|------------|
| Vùng I | 4,960,000 VND | HN, HCM, Bình Dương, Đồng Nai, BR-VT |
| Vùng II | 4,410,000 VND | Các TP trực thuộc TW còn lại, một số tỉnh |
| Vùng III | 3,860,000 VND | Thị xã, thành phố còn lại |
| Vùng IV | 3,450,000 VND | Các huyện còn lại |

Lương thử việc: tối thiểu = 85% mức lương hợp đồng chính thức
```

---

## 13th Month Salary & Bonus

```
Thưởng Tết / Tháng 13:
  - Không bắt buộc theo luật (trừ khi ghi trong HĐLĐ hoặc Thỏa ước LĐ)
  - Thường tính: lương cơ bản × hệ số (1.0 - 3.0×)
  - Một số công ty: bonus = % lợi nhuận, hoặc KPI-based
  - Phải đóng thuế TNCN nếu > 5 triệu

Performance Bonus:
  - Tính dựa trên KPI score (% đạt mục tiêu)
  - Chu kỳ: tháng / quý / năm
  - Phải rõ ràng trong policy để tránh tranh chấp
```

---

## Recruitment (ATS)

```
Flow:
  Job Posting → CV Collection → Screening → Interview → Assessment → Offer → Onboarding

Entities:
  - JobRequisition: id, position, department, headcount, targetDate, status
  - JobPosting: requisitionId, title, description, requirements, channels[], postedAt
  - Candidate: id, name, email, phone, cvUrl, source
  - Application: candidateId, jobId, stage, score, interviewRecords[], offerAmount

Recruitment channels VN:
  - TopCV, VietnamWorks, Vietnamjobs (job boards)
  - LinkedIn (senior/specialist)
  - Facebook groups (mọi cấp độ)
  - Internal referral (giới thiệu nội bộ)
  - Headhunter (C-level)
```

---

## KPI / OKR

```
KPI:
  - Set targets: cuối tháng/quý/năm
  - Track actuals: cập nhật định kỳ
  - Score: % achievement → hệ số lương thưởng
  - Rating: Vượt trội (>120%) / Đạt (80-120%) / Chưa đạt (<80%)

OKR:
  - Objectives: 3-5 mục tiêu định tính
  - Key Results: 3-5 kết quả đo lường được per objective
  - Scoring: 0.0-1.0 (0.6-0.7 là "good")
  - Cycle: Quarterly OKRs, Annual Objectives

360-degree feedback:
  - Self assessment
  - Manager review
  - Peer review (2-3 peers)
  - Subordinate review (nếu có)
```

---

## Bộ Luật Lao động 2019 — Điểm quan trọng

```
Probation (Thử việc):
  - Không thử việc khi: HĐLĐ < 1 tháng, hoặc đã từng làm cùng vị trí
  - Lương thử việc: ≥ 85% lương chính thức
  - Không được ép ký thỏa thuận bất lợi cho NV trong thời gian thử việc

Termination (Chấm dứt HĐLĐ):
  - Báo trước: 45 ngày (HĐLĐ không thời hạn), 30 ngày (HĐXĐTH)
  - Trợ cấp thôi việc: 0.5 tháng lương / năm làm việc (< 1/1/2009 không có BHTN)
  - Trợ cấp thất nghiệp: BHTN chi (nếu đã đóng đủ thời gian)

Non-compete clause:
  - Cho phép nhưng phải có compensate (bồi thường)
  - Thực tiễn VN: khó enforce, cần luật sư tư vấn
```

---

## Pitfalls phổ biến

```
⚠️ Tính lương BH sai base:
   → Chỉ được loại bỏ các khoản phụ cấp ghi riêng & đúng quy định
   → Nếu gộp vào lương → phải đóng BH trên toàn bộ

⚠️ Không update mức lương tối thiểu vùng kịp thời:
   → Chính phủ thường điều chỉnh vào 7/1 hàng năm

⚠️ Overtime không track đúng:
   → Nhân viên khiếu nại → labor dispute → tốn kém

⚠️ Quyết toán thuế TNCN sai:
   → Phạt chậm nộp 0.05%/ngày
   → Kê khai sai: phạt 20% số thuế thiếu

⚠️ HĐLĐ hết hạn mà không ký lại:
   → Tự động chuyển thành HĐLĐ không thời hạn sau 30 ngày
```

---

## Entities tổng hợp

```
Core: Employee, Department, Position, Contract
Attendance: ShiftSchedule, WorkSchedule, AttendanceRecord, LeaveRequest
Payroll: PayrollRun, PayrollRecord, PayrollItem, SalaryPolicy
Insurance: BHXHRegistration, BHXHPayment, BHXHReport
Tax: TaxRecord, Dependent, TaxDeduction, AnnualPITReport
Recruitment: JobRequisition, JobPosting, Candidate, Application, Interview
Performance: KPITarget, KPIResult, OKR, PerformanceReview
```
