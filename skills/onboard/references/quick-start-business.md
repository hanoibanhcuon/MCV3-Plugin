# Quick Start — Business Owner / Stakeholder

Tổng quan MCV3 dành cho Business Owner và Stakeholder không cần background kỹ thuật.

---

## MCV3 là gì?

**MCV3 — MasterCraft DevKit** là công cụ AI giúp:

> Biến ý tưởng kinh doanh → Bộ tài liệu kỹ thuật hoàn chỉnh → Code sẵn sàng phát triển

Thay vì mất hàng tuần họp và viết tài liệu thủ công, MCV3 dùng AI để:
- **Phỏng vấn** và nắm bắt yêu cầu của bạn
- **Tạo tài liệu** theo chuẩn quốc tế
- **Kết nối** business requirements với kỹ thuật

---

## Bạn giải quyết vấn đề gì?

Những thách thức phổ biến MCV3 giải quyết:

### Vấn đề 1: "Dev làm xong nhưng không đúng ý"
**Nguyên nhân:** Requirements không rõ ràng, thiếu Acceptance Criteria
**Giải pháp MCV3:** Structured URS với Gherkin scenarios — dev biết chính xác kết quả mong đợi

### Vấn đề 2: "Không biết project đang đến đâu"
**Nguyên nhân:** Không có tracking system cho requirements
**Giải pháp MCV3:** Formal ID system + Dashboard — biết ngay feature nào đang làm, đã test chưa

### Vấn đề 3: "Mỗi lần họp lại phải giải thích lại từ đầu"
**Nguyên nhân:** Không có document làm baseline
**Giải pháp MCV3:** PROJECT-OVERVIEW.md + EXPERT-LOG.md — mọi người đọc xong là hiểu ngay

### Vấn đề 4: "Thay đổi requirements làm trễ cả project"
**Nguyên nhân:** Không biết thay đổi ảnh hưởng đến đâu
**Giải pháp MCV3:** Change Manager với Impact Analysis — biết ngay cần update gì trước khi thay đổi

---

## Kết quả bạn nhận được

### Bộ tài liệu kinh doanh

```
📋 Business Policy Document
   Mô tả đầy đủ các quy tắc kinh doanh, điều kiện, ngoại lệ
   → Dùng để train nhân viên mới, audit compliance

📊 Process Maps (AS-IS → TO-BE)
   Quy trình hiện tại vs quy trình tối ưu sau khi có hệ thống
   → Quản lý thay đổi tổ chức dễ hơn

📖 Data Dictionary
   Danh mục tất cả dữ liệu trong hệ thống + ý nghĩa
   → Tránh hiểu nhầm giữa business và technical
```

### Bộ tài liệu kỹ thuật

```
📱 User Requirements Specification (URS)
   Danh sách đầy đủ tính năng theo format chuẩn
   → Dev implement đúng, QA test đúng

🏗️ Technical Architecture
   Thiết kế hệ thống, API, database
   → CTO/Architect review và phê duyệt

✅ Test Plan
   Danh sách test cases cho từng tính năng
   → QA biết cần test gì, bạn verify dễ hơn

📚 User Guide & Admin Guide
   Hướng dẫn sử dụng cho end-user và admin
   → Tiết kiệm thời gian training
```

### Deployment Package

```
🚀 Deployment Plan
   Kế hoạch triển khai chi tiết: từng bước, timeline, rollback plan
   → Giảm rủi ro khi go-live

📈 SLA Definitions
   Cam kết hiệu năng, uptime, support response time
   → Cơ sở để đàm phán với vendor/dev team
```

---

## Quy trình 8 bước

Mỗi bước tương tác qua Claude — không cần viết gì thủ công:

| Bước | Bạn cần làm | AI làm | Thời gian |
|------|------------|--------|----------|
| 1. Discovery | Trả lời câu hỏi về dự án | Tạo PROJECT-OVERVIEW.md | 1-2 giờ |
| 2. Expert Panel | Review và confirm insights | Phân tích rủi ro, cơ hội | 30 phút |
| 3. Business Docs | Review và điều chỉnh | Tạo policy, process, data dict | 2-4 giờ |
| 4. Requirements | Review và phê duyệt URS | Chuyển business rules → user stories | 2-4 giờ |
| 5. Tech Design | Không cần làm (tech team) | Thiết kế kỹ thuật | Dev job |
| 6. QA Docs | Không cần làm (QA team) | Tạo test plan | QA job |
| 7. Code | Không cần làm (dev team) | Generate code scaffold | Dev job |
| 8. Verify | Review deployment plan | Kiểm tra traceability | 1 giờ |

**Tổng thời gian bạn cần:** ~6-10 giờ (cho dự án trung bình)
**Thay vì:** 2-4 tuần viết tài liệu thủ công

---

## Ví dụ thực tế

### Ví dụ: Hệ thống Quản lý Kho

**Bạn nói:** "Tôi cần hệ thống giúp kiểm soát nhập xuất kho, hiện tại nhân viên đang ghi sổ tay"

**MCV3 tạo ra:**

```
PROJECT-OVERVIEW.md:
  Vấn đề: Quản lý kho thủ công → sai số liệu, không real-time
  Giải pháp: Hệ thống ERP Kho với barcode scanning
  Người dùng: Thủ kho, Kế toán kho, Director
  Kết quả mong đợi: Giảm sai số tồn kho < 1%, báo cáo real-time

BIZ-POLICY-WH.md:
  BR-WH-001: Nhập kho phải có PO được duyệt
  BR-WH-002: Xuất kho theo nguyên tắc FIFO
  BR-WH-003: Tồn kho tối thiểu = 30 ngày coverage
  ...20 business rules khác

URS-WH.md:
  US-WH-001: Thủ kho muốn tạo phiếu nhập kho nhanh
    AC: Nhập xong trong < 3 phút, có validation tự động
  US-WH-002: Kế toán muốn xem báo cáo tồn kho real-time
    AC: Dashboard cập nhật trong 30 giây, export Excel
  ...15 User Stories khác
```

---

## Câu hỏi thường gặp

**Q: Tôi không biết tech có dùng được không?**
A: Hoàn toàn không cần. Bạn chỉ cần trả lời câu hỏi bằng tiếng Việt thông thường. AI hiểu và convert thành tài liệu kỹ thuật.

**Q: AI có thể thay thế Business Analyst không?**
A: Không hoàn toàn. AI giúp structure và document, nhưng bạn vẫn cần domain knowledge và business judgment. Nghĩ như AI là "smart intern" cần guidance của bạn.

**Q: Tài liệu tạo ra có dùng được không hay chỉ là template?**
A: Tài liệu customized theo thông tin bạn cung cấp. Chất lượng tỷ lệ thuận với mức độ chi tiết bạn chia sẻ trong buổi Discovery.

**Q: Nếu requirements thay đổi thì sao?**
A: Dùng `/mcv3:change-manager`. AI sẽ phân tích impact và cập nhật tất cả documents liên quan.

**Q: Team của tôi có cần dùng MCV3 không?**
A: PM/BA cần dùng cho Phases 1-4. Developer dùng Phases 5-8. Bạn chỉ cần review và sign-off tại các gates.

---

## Cam kết ROI

Dựa trên dự án trung bình (~3-6 months, team 5-10 người):

| Hạng mục | Không dùng MCV3 | Dùng MCV3 | Tiết kiệm |
|---------|----------------|----------|---------|
| Documentation time | 3-4 tuần | 3-5 ngày | ~75% |
| Re-work do misunderstanding | 15-20% effort | < 5% effort | ~70% |
| Onboarding team member mới | 1-2 tuần | 2-3 ngày | ~60% |
| Audit/compliance preparation | 1 tuần | 1-2 ngày | ~70% |

*Ước tính dựa trên user feedback — kết quả thực tế tùy dự án.*

---

## Bắt đầu ngay

Hỏi Claude: **"Tôi muốn xây dựng hệ thống [tên hệ thống] cho ngành [lĩnh vực]"**

Hoặc chạy: `/mcv3:onboard` → Claude sẽ hướng dẫn từng bước.
