# Domain Knowledge — Giáo dục / Đào tạo (Education)

Knowledge base cho Domain Expert Agent khi detect ngành Giáo dục, LMS, EdTech.

---

## Từ khóa nhận dạng

`trường học`, `học sinh`, `sinh viên`, `khóa học`, `lớp học`, `giáo viên`,
`LMS`, `e-learning`, `học trực tuyến`, `tuyển sinh`, `học phí`, `điểm số`,
`chứng chỉ`, `trung tâm ngoại ngữ`, `đào tạo doanh nghiệp`, `quiz`, `bài tập`

---

## Phân loại hệ thống giáo dục

| Loại | Ví dụ | Đặc điểm chính |
|------|-------|---------------|
| K-12 School | Trường tiểu học, THCS, THPT | Quản lý học sinh, điểm, phụ huynh portal |
| Higher Education | Đại học, Cao đẳng | Tín chỉ, đăng ký học phần |
| Language Center | Anh ngữ, tiếng Nhật | Placement test, level-based courses |
| Corporate Training | Đào tạo nhân sự | Compliance training, skill assessment |
| Online Learning Platform | Udemy-like, Coursera-like | Video content, self-paced, certificates |
| Tutoring / Gia sư | 1-on-1, small group | Scheduling, session tracking |

---

## Core Modules

### 1. Student / Learner Management

```
Entities:
  - Student: id, code, name, dob, gender, phone, email, parentInfo,
              enrollmentDate, status (active/inactive/graduated)
  - Class: id, name, courseId, teacherId, schedule, maxStudents, startDate, endDate
  - Enrollment: studentId, classId, enrollDate, status, paymentStatus

Key features:
  - Quản lý hồ sơ học sinh (ảnh, giấy tờ)
  - Chuyển lớp / chuyển khóa
  - Lịch sử học tập (toàn bộ khóa đã học)
  - Tìm kiếm nhanh theo tên/mã/SĐT
```

### 2. Course & Curriculum Management

```
Entities:
  - Course: id, code, name, level, duration, format (online/offline/blended),
             price, syllabus, prerequisites[]
  - Module: courseId, sequence, title, description, estimatedHours
  - Lesson: moduleId, sequence, title, type (video/text/quiz/assignment), content
  - LearningPath: name, courses[], targetAudience

Key features:
  - Thêm/sửa nội dung khóa học theo cấu trúc phân cấp
  - Version control cho curriculum (năm học, tháng, semester)
  - Prerequisites validation (phải hoàn thành khóa A trước khi học khóa B)
```

### 3. Attendance / Timekeeping

```
Entities:
  - AttendanceRecord: classId, date, period, teacher, records[]
  - AttendanceDetail: studentId, status (present/absent/late/excused), note
  - LeaveRequest: studentId, dates[], reason, approvedBy

Key features:
  - Điểm danh nhanh (batch check-in theo danh sách lớp)
  - QR Code điểm danh (học sinh quét mã)
  - Thông báo tự động cho phụ huynh khi học sinh vắng mặt
  - Báo cáo: số buổi vắng, tỷ lệ chuyên cần per student/class
```

### 4. Grade Management

```
Entities:
  - GradeComponent: courseId, name (midterm/final/assignment/quiz), weight%
  - GradeRecord: enrollmentId, componentId, score, gradedBy, gradedAt, feedback
  - FinalGrade: enrollmentId, score, letterGrade (A/B/C/D/F), passed, gpa

VN Grade Scale:
  - Thang điểm 10: 0-10 (phổ biến K-12)
  - Thang điểm 4 (GPA): A=4.0, B=3.0, C=2.0, D=1.0 (đại học)
  - Học lực: Giỏi (8-10), Khá (6.5-8), Trung bình (5-6.5), Yếu (<5)
```

### 5. Tuition / Billing

```
Entities:
  - Invoice: studentId, period, items[], totalAmount, dueDate, status
  - Payment: invoiceId, amount, method, paidAt, reference
  - TuitionPolicy: courseId, price, paymentSchedule, lateFee, refundPolicy

Key features:
  - Tạo hóa đơn tự động theo kỳ/tháng
  - Nhiều phương thức thanh toán: tiền mặt, chuyển khoản, VNPAY, MoMo
  - Nhắc nhở học phí tự động (SMS/Zalo)
  - Báo cáo doanh thu, công nợ học phí
  - Miễn giảm học phí (voucher, học bổng)
```

### 6. LMS Features (Online Learning)

```
Content delivery:
  - Video streaming: HLS cho adaptive bitrate, signed URLs
  - PDF viewer, interactive content (H5P)
  - Quiz engine: multiple choice, true/false, fill-in, essay
  - Assignment submission: file upload, text entry, peer review

Progress tracking:
  - Lesson completion (% watched, quiz score)
  - Module completion (tất cả lessons trong module)
  - Course completion (tất cả modules)
  - Time-on-platform tracking

Certificates:
  - Auto-generate khi hoàn thành khóa học
  - Verify certificate qua unique code / QR
  - Custom template theo tổ chức
```

---

## Quy định VN

### Thông tư 17/2012 (BGDĐT) — Quản lý cơ sở GD

```
- Trường ngoại ngữ/tin học phải đăng ký với Sở GD&ĐT tỉnh
- Phải có cơ sở vật chất đạt chuẩn (diện tích, thiết bị)
- Giáo viên phải có bằng cấp phù hợp
- Chương trình đào tạo phải được thẩm định
- Báo cáo định kỳ về số lượng học viên, giáo viên
```

### Chứng chỉ Bộ GD&ĐT

```
- Chứng chỉ ngoại ngữ: theo khung năng lực 6 bậc (tương đương CEFR A1-C2)
- Chứng chỉ tin học: theo chuẩn kỹ năng sử dụng CNTT (Thông tư 03/2014)
- Bằng trung cấp/cao đẳng/đại học: phải được BGDĐT phê duyệt ngành đào tạo
- Văn bằng, chứng chỉ phải có số, ngày cấp, mã trường, có thể tra cứu online
```

### Thông tư 26/2020 — Đánh giá học sinh (K-12)

```
- Đánh giá TX (thường xuyên): không lấy điểm số, nhận xét bằng lời
- Đánh giá ĐK (định kỳ): có điểm số (giữa kỳ + cuối kỳ)
- Hạnh kiểm: Tốt / Khá / TB / Yếu
- Xếp loại học lực: hệ thống phần mềm phải tính đúng theo thông tư
```

---

## Parent Portal

```
Features:
  - Xem điểm số, học lực của con
  - Nhận thông báo điểm danh
  - Nhắn tin với giáo viên
  - Xem lịch học, thời khóa biểu
  - Thanh toán học phí online
  - Đăng ký nghỉ phép cho con

Notifications:
  - Zalo OA: kênh phổ biến nhất ở VN
  - SMS: backup khi không dùng Zalo
  - Email: optional
  - Push notifications (nếu có mobile app)
```

---

## Gamification

```
Engagement features:
  - Points: tích điểm khi hoàn thành bài học, quiz
  - Badges: huy hiệu thành tích (học liên tục 7 ngày, điểm tuyệt đối...)
  - Leaderboard: xếp hạng trong lớp/khóa (cần cẩn thận về cạnh tranh tiêu cực)
  - Learning streaks: chuỗi ngày học liên tiếp
  - Progress bars: % hoàn thành module/khóa
  - Level system: beginner/intermediate/advanced

VN context:
  - Gamification đặc biệt hiệu quả cho K-12 và corporate training
  - Tránh public leaderboard cho học sinh nhỏ (tâm lý)
```

---

## Pitfalls phổ biến

```
⚠️ Không handle timezone khi học online (học sinh VN ở nước ngoài):
   → Lịch học, deadline phải store UTC, display theo timezone học sinh

⚠️ Video upload không có transcoding:
   → Video gốc quá lớn, không stream được trên mobile
   → Cần S3 + CloudFront + MediaConvert hoặc Cloudflare Stream

⚠️ Quiz có thể copy/paste từ tab khác:
   → Cần lockdown browser hoặc randomize câu hỏi

⚠️ Tính điểm GPA sai khi có môn thi lại:
   → Cần rõ policy: lấy điểm cao hơn hay điểm thi lại?

⚠️ Không backup dữ liệu điểm:
   → Điểm số = pháp lý → cần immutable audit trail
```

---

## Entities tổng hợp

```
Core: Student, Teacher, Course, Module, Lesson, Class, Enrollment
Academic: GradeComponent, GradeRecord, FinalGrade, AttendanceRecord
Finance: Invoice, Payment, TuitionPolicy, Scholarship
LMS: VideoLesson, Quiz, QuizQuestion, Submission, Certificate, LearningProgress
Communication: Notification, Message, AnnouncementBoard
```
