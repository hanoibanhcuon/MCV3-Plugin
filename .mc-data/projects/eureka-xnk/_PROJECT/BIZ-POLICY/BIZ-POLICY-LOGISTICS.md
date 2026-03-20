# BIZ-POLICY: LOGISTICS (Nghiệp vụ Logistics & Xuất nhập khẩu)
<!-- ============================================================
     CHÍNH SÁCH NGHIỆP VỤ — Lĩnh vực Logistics / XNK
     Áp dụng cho toàn bộ quy trình: Báo giá → Vận chuyển → Hải quan
     → Kho → Giao hàng → Thanh toán

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  EXPERT-LOG.md → SESSION-001 (Domain Expert)
               PROJECT-OVERVIEW.md → SC-IN-021..029
               DATA-DICTIONARY.md → ENT-003..015, ENUM-001..015
       Key IDs: BR-LOG-001..049
         001-009: Validation   010-019: Calculation
         020-029: Workflow     030-039: Authorization
         040-049: Constraints
       Output: URS-ERP, URS-CAPP, URS-SAPP, URS-HSC tham chiếu đến đây
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu đầu bài (Business Input)
> **Lĩnh vực:** Logistics / Xuất nhập khẩu / Freight Forwarding
> **Áp dụng cho systems:** ERP, CAPP, SAPP, HSC
> **Nguồn thông tin:** EXPERT-LOG → SESSION-001 (Domain Expert) + BOD Resolution
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md → SC-IN-021..029] — ERP scope
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-001] — Domain expert analysis + Resolution
- [REF: _PROJECT/DATA-DICTIONARY.md] — TERM-001..020, ENT-003..015, ENUM-001..015

### Tài liệu tham chiếu file này:
- [REF: ERP/P1-REQUIREMENTS/URS-KD.md] — Kinh doanh & CSKH
- [REF: ERP/P1-REQUIREMENTS/URS-DC.md] — Điều phối & vận chuyển
- [REF: ERP/P1-REQUIREMENTS/URS-KHO-VN.md] — Kho Việt Nam
- [REF: ERP/P1-REQUIREMENTS/URS-KHO-TQ.md] — Kho Trung Quốc
- [REF: HSC/P1-REQUIREMENTS/URS-HSC.md] — HS Code & compliance engine
- [REF: CAPP/P1-REQUIREMENTS/URS-CAPP.md] — Tracking & phí phát sinh KH

---

## 1. TỔNG QUAN LĨNH VỰC

**Mô tả:** ERK Transport là Full-service 3PL trên hành lang Trung Quốc – Việt Nam. Chính sách này bao phủ toàn bộ vòng đời nghiệp vụ logistics: từ tiếp nhận yêu cầu, báo giá, vận chuyển (biển/không/bộ), khai báo hải quan, quản lý kho, đến giao hàng last-mile và thanh toán. ERK hoạt động với cả **Import (TQ→VN)** và **Export (VN→TQ)**, xử lý mọi loại hàng hóa theo luật Việt Nam hiện hành bao gồm HAZMAT.

**Bộ phận liên quan:**
- Phòng Kinh doanh & CSKH — báo giá, hợp đồng, đơn hàng
- Phòng Chứng từ & Hải quan — tờ khai, C/O, VNACCS
- Bộ phận Kho VN & Kho TQ — nhận/xuất hàng, kiểm kê
- Bộ phận Điều phối — vận chuyển, Vehicle Registry
- Phòng Tài chính — công nợ, credit limit, thu phí phát sinh

**Người chịu trách nhiệm chính sách:** Trưởng phòng Kinh doanh (chính sách giá, báo giá), Trưởng phòng Tài chính (credit limit), Trưởng phòng Hải quan (compliance)

---

## 2. BUSINESS RULES

---

### 2.1. Quy tắc xác thực — Validation Rules (BR-LOG-001..009)

| Mã | Quy tắc | Điều kiện | Logic | Ưu tiên |
|----|---------|----------|-------|---------|
| BR-LOG-001 | **Kiểm tra HAZMAT trước khi xác nhận Shipment** | Khi cargo_type = HAZMAT | Hệ thống tự động kiểm tra: (1) HS Code có trong danh sách hàng nguy hiểm (ENT-007.is_hazmat); (2) Chế độ vận chuyển phù hợp với IMDG/IATA DGR; (3) HAZMAT Declaration đã được tạo. Nếu thiếu → **block xác nhận, hiển thị cảnh báo** | Must |
| BR-LOG-002 | **Kiểm tra C/O trước khi submit tờ khai hải quan** | Khi benefit_claimed = true trên tờ khai | Kiểm tra: (1) C/O đúng form_type theo xuất xứ hàng; (2) issued_date ≤ ngày khai; (3) expiry_date ≥ ngày khai; (4) origin_country khớp với hàng hóa. Nếu không hợp lệ → **cảnh báo, yêu cầu xác nhận** trước khi submit | Must |
| BR-LOG-003 | **Kiểm tra credit limit trước khi xác nhận đơn** | Khi KH có CreditAccount và trả chịu | Kiểm tra: (1) current_balance + giá trị đơn mới ≤ credit_limit_amount; (2) oldest_due_date không vượt credit_days. Nếu vi phạm một trong hai → **block xác nhận, thông báo KD + Tài chính** | Must |
| BR-LOG-004 | **HS Code bắt buộc trước khi tạo tờ khai** | Trước khi tạo CustomsDeclaration | Mỗi dòng hàng trong tờ khai phải có HS Code hợp lệ (tồn tại trong ENT-007 và không is_prohibited). HSC engine tự động gợi ý — nhân viên phải xác nhận | Must |
| BR-LOG-005 | **Kiểm tra báo giá còn hiệu lực trước khi confirm** | Khi KH confirm đơn hàng | Báo giá phải ở trạng thái ACTIVE (chưa expired hoặc đã reactivated). Nếu expired → nhân viên KD phải reactivate hoặc cập nhật giá trước khi confirm | Must |
| BR-LOG-006 | **Kiểm tra hàng cấm nhập/xuất** | Tại thời điểm tạo Shipment | HSC engine kiểm tra HS Code theo ENT-007.is_prohibited và điều kiện xuất/nhập khẩu. Hàng cấm → **block tạo Shipment, hiển thị lý do cụ thể** | Must |
| BR-LOG-007 | **Tỷ giá NHNN phải có trước khi tính thuế** | Khi tạo CustomsDeclaration | exchange_rate_id phải trỏ về ENT-013 có rate_date = ngày khai báo. Nếu chưa có (NHNN chưa công bố) → nhân viên nhập tay và đánh dấu "MANUAL" | Must |

---

### 2.2. Quy tắc tính toán — Calculation Rules (BR-LOG-010..019)

| Mã | Quy tắc | Công thức | Ví dụ | Ưu tiên |
|----|---------|----------|-------|---------|
| BR-LOG-010 | **Tính thuế nhập khẩu theo tỷ giá NHNN ngày khai** | `import_duty = dutiable_value_usd × nhnn_transfer_rate × tax_rate` | Hàng trị giá 10.000 USD, tỷ giá NHNN 25.000 VNĐ/USD, thuế MFN 10% → Thuế NK = 10.000 × 25.000 × 10% = 25.000.000 VNĐ | Must |
| BR-LOG-011 | **Ưu đãi ACFTA khi có C/O Form E hợp lệ** | Thay MFN rate bằng ACFTA rate trong BR-LOG-010 | Cùng ví dụ trên, nếu có C/O Form E và acfta_rate = 0% → Thuế NK = 0. Tiết kiệm 25 triệu VNĐ | Must |
| BR-LOG-012 | **Resolve giá 3 cấp theo priority** | Priority: ORDER(1) > CUSTOMER(2) > GENERAL(3). Hệ thống tìm giá theo thứ tự: tìm giá ORDER của Shipment này → nếu không có, tìm giá CUSTOMER của KH này cho tuyến/mode → nếu không có, dùng giá GENERAL | KH "ABC" có giá riêng theo Customer tier (500.000/CBM). Đơn hàng cụ thể này có giá Order tier (450.000/CBM). → Áp dụng 450.000/CBM | Must |
| BR-LOG-013 | **Tính chargeable weight cho hàng không (LCL)** | `chargeable_weight = max(actual_weight_kg, volumetric_weight_kg)` với `volumetric_weight = (L×W×H cm³) / 6000` | Kiện hàng 5kg, kích thước 60×50×40cm → vol = 120.000/6000 = 20kg → chargeable = 20kg | Must |
| BR-LOG-014 | **Tính demurrage từ ngày kết thúc free time** | `demurrage = (pickup_date - free_time_end) × daily_rate` | Free time kết thúc 15/03, KH lấy hàng 18/03 → 3 ngày × 1.500.000 VNĐ = 4.500.000 VNĐ | Must |
| BR-LOG-015 | **Phân bổ phí LCL theo chargeable weight** | `allocated_cost = (shipment_cbm / total_cbm_on_bl) × total_freight_cost` | Total LCL 10 CBM, tổng cước 2.000 USD. Shipment A có 2 CBM → phân bổ 400 USD | Must |
| BR-LOG-016 | **Tính VAT nhập khẩu** | `vat_import = (dutiable_value + import_duty) × vat_rate` | Trị giá 250 triệu + thuế NK 25 triệu, VAT 10% → VAT = 27,5 triệu VNĐ | Must |

---

### 2.3. Quy tắc luồng xử lý — Workflow Rules (BR-LOG-020..029)

| Mã | Quy tắc | Trạng thái từ | Trạng thái đến | Điều kiện | Actor |
|----|---------|-------------|--------------|----------|-------|
| BR-LOG-020 | **Vòng đời báo giá — tạo và gửi** | — (tạo mới) | DRAFT → SENT | Nhân viên KD điền đầy đủ thông tin và gửi cho KH | Nhân viên KD |
| BR-LOG-021 | **Vòng đời báo giá — KH chấp nhận** | SENT | ACCEPTED | KH confirm trong vòng 3 ngày làm việc kể từ ngày tạo | KH (qua CAPP) hoặc Nhân viên KD ghi nhận |
| BR-LOG-022 | **Vòng đời báo giá — tự động hết hạn** | SENT | EXPIRED | Đã qua 3 ngày làm việc mà chưa có phản hồi | Hệ thống (tự động) |
| BR-LOG-023 | **Vòng đời báo giá — tái kích hoạt** | EXPIRED | ACTIVE | Nhân viên KD chỉnh sửa ngày hiệu lực mới (hoặc cập nhật giá) và reactivate. **Không cần tạo lại từ đầu.** | Nhân viên KD |
| BR-LOG-024 | **Alert demurrage trước 2 ngày** | — | Thông báo | free_time_end - today ≤ 2 ngày → **Push notification SAPP (nhân viên điều phối + KH)** | Hệ thống (tự động, chạy hàng ngày) |
| BR-LOG-025 | **Quy trình phí phát sinh (TO-BE)** | Phát hiện phí ngoài báo giá | Phê duyệt + ghi vào hóa đơn | (1) Nhân viên phát hiện phí phát sinh → tạo "Yêu cầu phí phát sinh" trong ERP; (2) Hệ thống gửi thông báo CAPP cho KH (mô tả + số tiền + lý do); (3) KH acknowledge trên CAPP; (4) Phí tự động cộng vào hóa đơn cuối. **Nếu KH không phản hồi trong 48h → tự động coi là đồng ý** | Nhân viên (tạo) → Hệ thống (thông báo) → KH (acknowledge) |
| BR-LOG-026 | **Quy trình submit tờ khai hải quan** | DRAFT | SUBMITTED | Bắt buộc: HS Code confirmed + C/O validated (nếu áp dụng) + tỷ giá NHNN có → Submit lên VNACCS | Nhân viên Hải quan |
| BR-LOG-027 | **Xử lý luồng Đỏ** | CUSTOMS_PROCESSING (Đỏ) | CUSTOMS_CLEARED | Nhân viên Hải quan có mặt tại kiểm tra thực tế. Cập nhật kết quả kiểm tra vào ERP. | Nhân viên Hải quan |
| BR-LOG-028 | **Cập nhật trạng thái Shipment khi hàng về kho TQ** | CONFIRMED | CARGO_RECEIVED_CN | Nhân viên kho TQ xác nhận qua SAPP (hoặc WeCom tích hợp). Push notification cho nhân viên KD và KH | Nhân viên Kho TQ |
| BR-LOG-029 | **Hoàn thành Shipment sau POD** | DELIVERED | COMPLETED | POD đã upload + invoice đã thanh toán đủ → Shipment chuyển COMPLETED và lưu hồ sơ | Hệ thống (tự động sau khi check) |

---

### 2.4. Quy tắc phân quyền — Authorization Rules (BR-LOG-030..039)

| Mã | Quy tắc | Vai trò được phép | Hành động | Phạm vi |
|----|---------|-----------------|---------|--------|
| BR-LOG-030 | **Nhân viên KD tự quyết định giá** | Nhân viên Kinh doanh | Tạo, sửa, approve báo giá ở mọi mức (ORDER/CUSTOMER/GENERAL) | Không cần duyệt Manager |
| BR-LOG-031 | **Manager theo dõi và giám sát giá** | Manager Kinh doanh | Xem toàn bộ báo giá, lịch sử giá, báo cáo biên độ lợi nhuận. Không thể block nhân viên KD | Read-only + analytics |
| BR-LOG-032 | **Chỉ Finance quản lý credit limit** | Nhân viên Tài chính, Finance Manager | Tạo/sửa/block CreditAccount (ENT-011) | Nhân viên KD chỉ xem trạng thái |
| BR-LOG-033 | **Tờ khai hải quan — nhân viên chứng từ** | Nhân viên Chứng từ & Hải quan | Tạo, sửa, submit tờ khai lên VNACCS | Nhân viên KD không submit trực tiếp |
| BR-LOG-034 | **Kho TQ — chỉ nhân viên kho TQ** | Nhân viên Kho TQ (qua SAPP/WeCom) | Cập nhật CARGO_RECEIVED_CN, nhập/xuất kho TQ | Nhân viên VN không sửa kho TQ |
| BR-LOG-035 | **Xóa Shipment — chỉ trước khi confirm** | Nhân viên KD | Chỉ xóa được khi status = DRAFT | Sau CONFIRMED → chỉ CANCELLED với lý do |
| BR-LOG-036 | **Reactivate báo giá expired** | Nhân viên KD (người tạo hoặc team leader) | Chỉnh sửa và reactivate báo giá đã hết hạn | Phải cập nhật ít nhất 1 trường (ngày hoặc giá) |

---

### 2.5. Ràng buộc dữ liệu — Constraints (BR-LOG-040..049)

| Mã | Ràng buộc | Loại | Chi tiết |
|----|----------|------|---------|
| BR-LOG-040 | **Lưu hồ sơ hải quan 5 năm** | Required | CustomsDeclaration (ENT-006) phải có archived = true sau khi completed. **Không được xóa** — chỉ đánh dấu archived. Bảo lưu 5 năm theo Luật Hải quan 2014 |
| BR-LOG-041 | **Hiệu lực báo giá = 3 ngày làm việc** | Range | valid_to = valid_from + 3 business days (bỏ qua Thứ 7, CN, ngày lễ Việt Nam). Hệ thống tự tính. |
| BR-LOG-042 | **Tỷ giá NHNN — nguồn duy nhất** | Required | Mọi tính toán liên quan đến thuế NK và quy đổi tiền tệ trong tờ khai phải dùng ENT-013.transfer_rate. Không dùng tỷ giá khác (ngân hàng thương mại, Vietcombank...) |
| BR-LOG-043 | **C/O Form E — hết hạn tối đa 12 tháng** | Range | expiry_date ≤ issued_date + 365 ngày. Hệ thống cảnh báo khi C/O còn ≤ 30 ngày hết hạn và lô hàng chưa thông quan |
| BR-LOG-044 | **Số lô hàng ERK — unique toàn hệ thống** | Unique | master_no format: ERK-{YYYY}-{NNNNN} — không trùng lặp. Tự động tăng dần theo năm |
| BR-LOG-045 | **Credit limit tối thiểu** | Range | Nếu có CreditAccount: credit_days ≥ 1; credit_limit_amount ≥ 100.000 VNĐ |
| BR-LOG-046 | **Hàng cấm xuất khẩu — block tuyệt đối** | Required | Nếu ENT-007.is_prohibited = true → Không cho phép tạo Shipment dù ở status nào. Log audit trail |
| BR-LOG-047 | **POD bắt buộc trước khi COMPLETED** | Required | Shipment chỉ được chuyển COMPLETED khi có ít nhất 1 POD record (ảnh + timestamp + GPS) |
| BR-LOG-048 | **Multi-currency — quy về VNĐ cho báo cáo** | Required | Mọi giao dịch gốc lưu bằng currency gốc (USD/CNY/EUR). Khi hiển thị báo cáo tài chính → quy đổi VNĐ theo ENT-013 ngày giao dịch |

---

## 3. EXCEPTIONS & SPECIAL CASES

| # | Tình huống đặc biệt | Xử lý | Quy tắc áp dụng |
|---|-------------------|-------|----------------|
| 1 | KH yêu cầu thông quan hàng HAZMAT khẩn cấp | Vẫn phải qua đầy đủ quy trình HAZMAT. Không có ngoại lệ về compliance. Ưu tiên xử lý nhanh nhất trong khung pháp lý. | [REF: BR-LOG-001] |
| 2 | C/O Form E bị hỏng/sai — không thể dùng ưu đãi | Khai báo theo mức MFN (không ưu đãi). Cập nhật benefit_claimed = false. Ghi chú lý do. | [REF: BR-LOG-002], [REF: BR-LOG-011] |
| 3 | KH vượt credit limit nhưng hàng đã ở kho TQ | Finance + Manager quyết định: (a) KH thanh toán một phần trước → unblock; (b) Giữ hàng kho TQ; (c) Special approval một lần. Ghi log approval vào CreditAccount. | [REF: BR-LOG-003] |
| 4 | Tờ khai bị phân luồng Đỏ | Nhân viên hải quan đến kiểm tra thực tế. Cập nhật kết quả vào ERP trong vòng 24h sau khi có kết quả kiểm. | [REF: BR-LOG-027] |
| 5 | Báo giá expired nhưng KH muốn confirm | Nhân viên KD reactivate báo giá (cập nhật ngày hoặc giá nếu cần), sau đó KH confirm. Không cần tạo mới. | [REF: BR-LOG-023] |
| 6 | KH không acknowledge phí phát sinh trong 48h | Hệ thống tự động ghi nhận "Đồng ý mặc nhiên" (implied consent) sau 48h. Ghi log timestamp vào ERP. | [REF: BR-LOG-025] |
| 7 | Hàng xuất khẩu (VN→TQ) — quy trình khác nhập | Dùng tờ khai mẫu XK01, không áp dụng C/O Form E (hướng xuất). VAT 0% cho hàng xuất. Áp dụng đầy đủ BR-LOG khác. | [REF: BR-LOG-026] |
| 8 | Demurrage do lỗi từ phía ERK (delay làm chứng từ) | ERK chịu toàn bộ phí demurrage. Không charge KH. Ghi nhận vào chi phí vận hành. Finance báo cáo root cause. | [REF: BR-LOG-014] |
| 9 | Hàng LCL — 1 Master B/L nhiều KH | Phân bổ phí theo CBM từng Shipment. Nếu 1 Shipment có vấn đề hải quan (luồng Đỏ) → giữ toàn bộ container cho đến khi clear. Thông báo ngay cho tất cả KH bị ảnh hưởng. | [REF: BR-LOG-015] |

---

## 4. COMPLIANCE & REGULATORY

| Quy định | Nội dung liên quan | Áp dụng cho | Penalty nếu vi phạm |
|---------|-------------------|-----------|---------------------|
| Luật Hải quan 2014, Điều 18 | Lưu trữ tờ khai và chứng từ tối thiểu **5 năm** | CustomsDeclaration, B/L, C/O | Phạt hành chính theo NĐ 128/2020; không thể đối chiếu khi thanh tra |
| TT 38/2015/TT-BTC | Thủ tục hải quan; format VNACCS; luồng X/V/Đ | Nhân viên chứng từ, module hải quan ERP | Tờ khai bị từ chối; chậm thông quan |
| Biểu thuế NK (NĐ 26/2023) | Thuế suất MFN, ACFTA, ATIGA | HSC Engine, tính thuế | Truy thu thuế + phạt 20-100% số thuế thiếu |
| ACFTA (Hiệp định TQ-ASEAN) | C/O Form E — điều kiện xuất xứ để hưởng 0-5% | C/O validation workflow | Mất ưu đãi thuế; bị truy thu theo MFN |
| NĐ 123/2020/NĐ-CP | Hóa đơn điện tử bắt buộc từ 07/2022 | Tất cả giao dịch có thu tiền | Phạt từ 4-8 triệu VNĐ/lần vi phạm |
| IMDG Code (biển) / IATA DGR (không) | Khai báo và vận chuyển hàng nguy hiểm | HAZMAT shipments | Từ chối vận chuyển; phạt nặng; rủi ro pháp lý |
| Luật AML 2022 | Giao dịch ≥ 300 triệu VNĐ/lần cần báo cáo | Finance module | Phạt + rủi ro pháp lý hình sự |
| NĐ 13/2023/NĐ-CP (PDPA VN) | Bảo vệ dữ liệu cá nhân khách hàng | CAPP, CRM trong ERP | Phạt đến 100 triệu VNĐ |

---

## 5. POLICY NOTES — Ghi chú định hướng thiết kế

> Những điểm này ảnh hưởng trực tiếp đến thiết kế URS và MODSPEC:

1. **Hệ thống giá linh hoạt tối đa:** Không có quy tắc cứng về giá — nhân viên KD được toàn quyền. Hệ thống phải cung cấp công cụ để Manager **giám sát** (không phải kiểm soát). [REF: BR-LOG-030, BR-LOG-031]

2. **Credit limit = cả tiền VÀ ngày:** Mặc định net-15 nhưng hoàn toàn cấu hình được per customer. Hệ thống phải block tự động khi vi phạm **một trong hai** điều kiện. [REF: BR-LOG-003, ENT-011]

3. **Phí phát sinh cần quy trình số hóa:** Hiện tại đang thủ công → TO-BE là workflow trong ERP + notification qua CAPP. Đây là cải tiến quan trọng giảm tranh chấp với KH. [REF: BR-LOG-025]

4. **Báo giá reactivate, không tạo lại:** Thiết kế để nhân viên KD có thể dễ dàng reactivate báo giá expired thay vì tạo mới từ đầu. [REF: BR-LOG-023]

5. **HAZMAT và hàng cấm = zero tolerance:** Không có ngoại lệ — hệ thống block cứng. [REF: BR-LOG-001, BR-LOG-046]

---

## 6. CHANGELOG

| Phiên bản | Ngày | Thay đổi |
|-----------|------|---------|
| 1.0.0 | 2026-03-19 | Tạo mới từ EXPERT-LOG SESSION-001 + BOD Resolution 12 Open Issues |
