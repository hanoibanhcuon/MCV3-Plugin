# BIZ-POLICY: FINANCE (Chính sách Tài chính & Kế toán)
<!-- ============================================================
     CHÍNH SÁCH NGHIỆP VỤ — Lĩnh vực Tài chính / Kế toán / Kiểm soát
     Bao phủ: Multi-currency, Credit management, Chi phí kho TQ,
     ROI tracking, Contingency reserve, Hóa đơn điện tử, AML

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  EXPERT-LOG.md → SESSION-001 (Finance Expert + Resolution OI-011)
               PROJECT-OVERVIEW.md → BG-001..005, CON-001
       Key IDs: BR-FIN-001..049
         001-009: Validation   010-019: Calculation
         020-029: Workflow     030-039: Authorization
         040-049: Constraints
       Output: ERP/P1-REQUIREMENTS/URS-FINANCE.md, URS-KHO-TQ.md
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu đầu bài (Business Input)
> **Lĩnh vực:** Tài chính & Kế toán
> **Áp dụng cho systems:** ERP (Finance, Kho TQ modules), CAPP (công nợ KH)
> **Nguồn thông tin:** EXPERT-LOG → SESSION-001 Finance Expert + BOD Resolution OI-011
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md → BG-001..005] — Business goals & ROI
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-001 Finance Expert] — Cost model & ROI
- [REF: _PROJECT/DATA-DICTIONARY.md → ENT-011, ENT-013, ENT-014] — CreditAccount, ExchangeRateHistory, ChinaWarehouseCost

### Tài liệu tham chiếu file này:
- [REF: ERP/P1-REQUIREMENTS/URS-FINANCE.md] — Tài chính & Kế toán
- [REF: ERP/P1-REQUIREMENTS/URS-KHO-TQ.md → Section chi phí] — Chi phí kho TQ
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-LOGISTICS.md → BR-LOG-003] — Credit limit validation

---

## 1. TỔNG QUAN LĨNH VỰC

**Mô tả:** Chính sách tài chính điều hành quản lý dòng tiền, công nợ khách hàng, đa tiền tệ, chi phí vận hành kho TQ, báo cáo ROI dự án và tuân thủ pháp lý về tài chính. Với doanh thu ~1.000 tỷ VNĐ/năm, kiểm soát tài chính chặt chẽ là yêu cầu hàng đầu.

**Bộ phận liên quan:** Phòng Tài chính & Kế toán (chính), BOD (báo cáo ROI), tất cả phòng ban (submit chi phí phát sinh)

**Người chịu trách nhiệm:** Kế toán trưởng / CFO

---

## 2. BUSINESS RULES

---

### 2.1. Quy tắc xác thực tài chính — Validation Rules (BR-FIN-001..009)

| Mã | Quy tắc | Điều kiện | Logic | Ưu tiên |
|----|---------|----------|-------|---------|
| BR-FIN-001 | **Kiểm tra credit limit hai chiều trước khi xác nhận đơn** | Khi KH mua chịu (có CreditAccount) | Kiểm tra đồng thời: (a) `current_balance + new_order_value ≤ credit_limit_amount`; (b) `oldest_due_date - today ≤ credit_days`. Vi phạm **một trong hai** → block. Thông báo ngay cho nhân viên KD và Tài chính | Must |
| BR-FIN-002 | **Hóa đơn điện tử bắt buộc cho mọi giao dịch** | Tất cả giao dịch thu tiền | Mọi khoản thu từ KH (cước vận chuyển, phụ phí, phí phát sinh) phải phát hành hóa đơn điện tử theo NĐ 123/2020. Không cho phép thu tiền mặt không có hóa đơn. | Must |
| BR-FIN-003 | **Tỷ giá NHNN là nguồn duy nhất** | Mọi quy đổi tiền tệ | Xem [REF: BR-IT-008]. Mọi giao dịch ghi nhận bằng tiền gốc (USD/CNY/EUR) VÀ quy đổi VNĐ theo ENT-013.transfer_rate ngày giao dịch | Must |
| BR-FIN-004 | **AML — tự động flag giao dịch lớn** | Giao dịch ≥ 300 triệu VNĐ | Xem [REF: BR-IT-023]. Tài chính có 48h để review flag. Nếu legitimate → dismiss với ghi chú. Nếu suspicious → follow STR procedure theo Luật AML 2022 | Must |
| BR-FIN-005 | **Phí phát sinh phải có chứng từ** | Khi nhập phí phát sinh | Mọi phí phát sinh ngoài báo giá (demurrage, phí phạt, chi phí extra...) phải đính kèm chứng từ (scan bill, ảnh...) trước khi ghi vào hệ thống | Must |

---

### 2.2. Quy tắc tính toán — Calculation Rules (BR-FIN-010..019)

| Mã | Quy tắc | Công thức | Ví dụ | Ưu tiên |
|----|---------|----------|-------|---------|
| BR-FIN-010 | **Ghi nhận doanh thu theo dịch vụ hoàn thành** | Khi Shipment = COMPLETED | Doanh thu ghi nhận khi lô hàng hoàn thành (COMPLETED) theo nguyên tắc accrual. Không ghi nhận khi nhận tiền trước (prepaid → Unearned Revenue) | Must |
| BR-FIN-011 | **Tính P&L thực từng lô hàng** | Sau khi Shipment COMPLETED | `PnL_per_shipment = total_revenue - total_cost`. Total cost = cước vận tải + phụ phí carrier + chi phí kho + hải quan + phân bổ kho TQ (ENT-014) | Should |
| BR-FIN-012 | **Phân bổ chi phí kho TQ theo 2 phương pháp** | Cuối tháng | **Phương pháp 1 (Fixed):** Total monthly cost / số Shipments tháng đó. **Phương pháp 2 (CBM/ngày):** `cost = shipment_cbm × days_in_warehouse × cbm_rate_cny × exchange_rate`. Hệ thống hỗ trợ cả hai, admin chọn phương pháp áp dụng. | Must |
| BR-FIN-013 | **Tính lãi vay tiền tệ (FX Exposure)** | Khi có giao dịch ngoại tệ lớn | Track exposure CNY và USD. Báo cáo FX P&L hàng tháng = (tỷ giá thực thu - tỷ giá ghi nhận) × số tiền. Dùng cho quản trị rủi ro | Should |
| BR-FIN-014 | **VAT hàng xuất khẩu = 0%** | Shipment direction = EXPORT | Hóa đơn xuất khẩu VN→TQ áp dụng VAT 0% theo quy định. Cần chứng từ xuất khẩu (tờ khai hải quan xuất, B/L). | Must |
| BR-FIN-015 | **Tính công nợ thực = dư nợ - tiền cọc** | Khi KH đặt cọc trước | `actual_receivable = total_invoiced - deposits_paid - payments_received`. current_balance trong ENT-011 phải phản ánh công nợ thực | Must |

---

### 2.3. Quy tắc luồng xử lý — Workflow Rules (BR-FIN-020..029)

| Mã | Quy tắc | Luồng | Điều kiện | Actor |
|----|---------|-------|----------|-------|
| BR-FIN-020 | **Luồng thanh toán trả trước (Prepaid)** | Tạo đơn → KH thanh toán → Xác nhận thanh toán → Tiến hành dịch vụ | Nếu KH trả trước: chỉ tiến hành sau khi tiền về tài khoản ERK và Tài chính xác nhận | Tài chính xác nhận |
| BR-FIN-021 | **Luồng thanh toán mua chịu (Credit)** | Tạo đơn → Check credit [REF: BR-FIN-001] → Tiến hành dịch vụ → Phát hóa đơn → Theo dõi công nợ | Credit check phải pass trước khi tiến hành | Tự động + Tài chính giám sát |
| BR-FIN-022 | **Luồng thu hồi công nợ quá hạn** | oldest_due_date vượt credit_days → (1) Auto-block CreditAccount; (2) Thông báo KD + KH qua CAPP; (3) Nhân viên KD liên hệ KH; (4) Nếu không giải quyết 7 ngày → Tài chính escalate | Credit status → BLOCKED | Hệ thống (auto) + KD + Tài chính |
| BR-FIN-023 | **Luồng ghi nhận chi phí kho TQ hàng tháng** | Cuối tháng: nhân viên kho TQ (qua SAPP) submit: staff_cost + warehouse_rent → Tài chính VN review → Approve → Ghi vào ENT-014 | Trước ngày 5 tháng sau | Kho TQ submit → Tài chính approve |
| BR-FIN-024 | **Luồng phát hóa đơn sau dịch vụ hoàn thành** | Shipment DELIVERED → Tài chính tổng hợp tất cả charges (cước + phụ phí + phí phát sinh đã KH acknowledge) → Phát hóa đơn điện tử trong 24h | Trong 24h sau DELIVERED | Tài chính |
| BR-FIN-025 | **Luồng hoàn tiền khi hủy đơn** | Nếu ERK hủy sau khi KH đã thanh toán → Hoàn 100% trong 3-5 ngày làm việc. Nếu KH hủy sau khi hàng về kho TQ → Khấu trừ chi phí phát sinh thực tế | Theo điều khoản hợp đồng | Tài chính |
| BR-FIN-026 | **ROI tracking hàng quý** | Sau go-live: Tài chính đo hàng quý: (a) savings từ automation; (b) giảm lỗi HS Code; (c) tăng volume. So sánh với baseline [REF: BR-IT-016] và report cho BOD | Quý đầu tiên sau go-live | Tài chính + IT |

---

### 2.4. Quy tắc phân quyền — Authorization Rules (BR-FIN-030..039)

| Mã | Quy tắc | Vai trò | Hành động | Phạm vi |
|----|---------|---------|---------|--------|
| BR-FIN-030 | **Chỉ Tài chính quản lý CreditAccount** | Nhân viên Tài chính, Kế toán trưởng | Tạo/sửa credit_limit_amount, credit_days, status. Nhân viên KD chỉ xem | ENT-011 |
| BR-FIN-031 | **Kế toán trưởng approve credit > ngưỡng** | Kế toán trưởng | Approve CreditAccount có credit_limit_amount > 50 triệu VNĐ hoặc credit_days > 30 ngày | Ngưỡng có thể cấu hình |
| BR-FIN-032 | **Chỉ Tài chính phát hóa đơn điện tử** | Nhân viên Tài chính | Phát hành, hủy, điều chỉnh hóa đơn điện tử | ERP Finance module |
| BR-FIN-033 | **Ghi nhận chi phí kho TQ — dual approval** | Nhân viên Kho TQ (submit) + Tài chính VN (approve) | Chi phí kho TQ cần cả hai bên confirm [REF: BR-FIN-023] | ENT-014 |
| BR-FIN-034 | **Xem báo cáo tài chính tổng hợp** | Kế toán trưởng, BOD | Dashboard tài chính đầy đủ: P&L, cash flow, FX exposure, KPI | ERP BOD dashboard |
| BR-FIN-035 | **Nhân viên KD chỉ xem công nợ KH của mình** | Nhân viên Kinh doanh | Xem current_balance, trạng thái credit của KH mình phụ trách | Scoped to own customers |

---

### 2.5. Ràng buộc tài chính — Constraints (BR-FIN-040..049)

| Mã | Ràng buộc | Loại | Chi tiết |
|----|----------|------|---------|
| BR-FIN-040 | **Dữ liệu tài chính lưu 10 năm** | Required | Giao dịch, hóa đơn, sổ cái lưu tối thiểu 10 năm theo Luật Kế toán 2015. Không xóa — chỉ archive. |
| BR-FIN-041 | **Contingency reserve 20% Capex** | Required | Xem [REF: BR-IT-017]. ~500 triệu–1,25 tỷ VNĐ. Chỉ giải ngân khi BOD approve. Báo cáo tình trạng reserve hàng quý. |
| BR-FIN-042 | **Credit limit mặc định net-15** | Default | Khi tạo CreditAccount mới mà không chỉ định: credit_days = 15. credit_limit_amount phải nhập bắt buộc (không có giá trị mặc định vì tùy từng KH). |
| BR-FIN-043 | **Multi-currency — không làm tròn trung gian** | Required | Tính toán giữ nguyên độ chính xác (DECIMAL 15,4 cho intermediate), chỉ làm tròn 2 chữ số thập phân khi hiển thị và in hóa đơn. |
| BR-FIN-044 | **Không xóa giao dịch — chỉ reverse** | Required | Mọi điều chỉnh tài chính phải là reverse entry (credit/debit entry đối nghịch), không phép xóa transaction gốc. Audit trail bắt buộc. |
| BR-FIN-045 | **Chi phí kho TQ — báo cáo nội bộ** | Required | Chi phí kho TQ (ENT-014) không export sang MISA. Chỉ dùng cho internal P&L và management reporting. |
| BR-FIN-046 | **Cảnh báo công nợ tự động** | Required | Hệ thống tự động cảnh báo khi: KH còn 3 ngày đến credit_days hết hạn (yellow alert) VÀ khi current_balance đạt 80% credit_limit_amount (yellow alert). |

---

## 3. EXCEPTIONS & SPECIAL CASES

| # | Tình huống đặc biệt | Xử lý | Quy tắc |
|---|-------------------|-------|---------|
| 1 | KH lớn xin nâng credit limit khẩn cấp | Kế toán trưởng xem xét + approve one-time exception với thời hạn cụ thể. Ghi log approval vào ENT-011. | [REF: BR-FIN-031] |
| 2 | Tỷ giá NHNN chưa công bố (ngày lễ) | Dùng tỷ giá ngày giao dịch gần nhất có trong ENT-013. Đánh dấu "CARRIED_OVER". Cập nhật lại khi NHNN công bố. | [REF: BR-IT-008] |
| 3 | KH tranh chấp hóa đơn | Tạo credit note cho phần tranh chấp. Giữ nguyên hóa đơn gốc. Finance + KD review và giải quyết trong 5 ngày làm việc. | [REF: BR-FIN-044] |
| 4 | Chi phí kho TQ tháng có bất thường lớn | Nếu total_cost_cny tháng mới > 150% tháng trước → trigger cảnh báo Finance Manager để review trước khi approve | [REF: BR-FIN-023] |
| 5 | Giao dịch USD khi tỷ giá biến động mạnh (>3% trong ngày) | Tài chính được thông báo tự động. Có thể yêu cầu KH re-confirm giá nếu báo giá chưa lock tỷ giá. | [REF: BR-FIN-013] |
| 6 | Doanh thu 1.000 tỷ VNĐ — lỗi HS Code 1% = 10 tỷ rủi ro | Xem [REF: EXPERT-LOG → OI-011]. Đây là justification chính cho HSC engine. KPI: tỷ lệ lỗi HS Code < 1% sau go-live. | [REF: BR-IT-014] |

---

## 4. COMPLIANCE & REGULATORY

| Quy định | Nội dung | Áp dụng | Penalty |
|---------|---------|---------|---------|
| Luật Kế toán 2015 | Lưu trữ sổ sách kế toán 10 năm | ERP Finance | Phạt + không thể đối chiếu thuế |
| NĐ 123/2020 | Hóa đơn điện tử bắt buộc + lưu 10 năm | ERP Finance | 4-8 triệu VNĐ/lần vi phạm |
| Luật Thuế GTGT | VAT 0% hàng xuất khẩu, 10% dịch vụ nội địa | Hóa đơn | Truy thu thuế + phạt 20% |
| Luật AML 2022 | Báo cáo giao dịch đáng ngờ ≥ 300 triệu VNĐ | ERP Finance | Phạt + rủi ro hình sự |
| Biểu thuế NK (NĐ 26/2023) | Thuế nhập khẩu theo HS Code + tỷ giá NHNN | ERP + HSC | Truy thu thuế + phạt 20-100% |
| ACFTA | Ưu đãi thuế khi có C/O Form E hợp lệ | ERP + HSC | Mất ưu đãi, truy thu theo MFN |

---

## 5. KPI THEO DÕI SAU GO-LIVE

| KPI | Metric | Target | Timeline |
|-----|--------|--------|---------|
| Tỷ lệ lỗi HS Code | % lô hàng có sai mã HS dẫn đến phạt/truy thu | < 1% | Steady-state |
| Thu hồi công nợ | % công nợ thu đúng hạn (≤ credit_days) | > 90% | Tháng 3 sau go-live |
| Tiết kiệm từ automation | Triệu VNĐ/năm tiết kiệm nhân công thủ công | ≥ 400 triệu VNĐ/năm | Năm 2 |
| FX exposure | Triệu VNĐ FX loss/tháng | Giảm 30% vs baseline | Tháng 6 sau go-live |
| ROI dự án | Cumulative net benefit | Dương từ Năm 3-4 | Hàng năm |

---

## 6. CHANGELOG

| Phiên bản | Ngày | Thay đổi |
|-----------|------|---------|
| 1.0.0 | 2026-03-19 | Tạo mới từ EXPERT-LOG SESSION-001 Finance Expert + Resolution OI-011 (doanh thu 1.000 tỷ VNĐ) |
