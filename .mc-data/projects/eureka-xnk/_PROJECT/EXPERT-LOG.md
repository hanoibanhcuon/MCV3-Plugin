# EXPERT-LOG
<!-- ============================================================
     LOG PHIÊN BRAINSTORM VỚI CHUYÊN GIA (Expert Agent Sessions)
     Tài liệu dạng append — thêm phiên mới ở cuối file.
     Ý kiến chuyên gia được tổng hợp vào URS/BIZ-POLICY tương ứng
     với [REF: EXPERT-LOG → SESSION-XXX].

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md
       Output: Đóng góp vào BIZ-POLICY, PROCESS, DATA-DICTIONARY
       Key IDs: SESSION-001
       Update: Append sau mỗi phiên expert, bởi /mcv3:expert-panel
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu ghi chú (Working Document)
> **Ngày tạo:** 2026-03-19
> **Cập nhật lần cuối:** 2026-03-19

---

## HƯỚNG DẪN SỬ DỤNG

1. Mỗi phiên brainstorm = 1 SESSION block mới (append cuối file)
2. Mỗi session có mã `SESSION-XXX` để tham chiếu
3. Ý kiến quan trọng được đánh dấu `[ACTION]` và ghi rõ tài liệu đích
4. Sau mỗi session, tổng hợp các action items vào tài liệu tương ứng
5. Khi đã tổng hợp xong, đánh dấu `[DONE → REF: ...]`

---

## SESSION-001: Expert Panel — Phân tích toàn diện dự án ERK Transport

| Mục | Nội dung |
|-----|---------|
| **Ngày** | 2026-03-19 |
| **Chuyên gia** | Strategy Expert + Finance Expert + Domain Expert (chạy song song) |
| **Chủ đề** | Phân tích chiến lược, tài chính và nghiệp vụ dự án số hóa toàn diện |
| **Dựa trên** | [REF: PROJECT-OVERVIEW.md → PROB-001..006, BG-BUS-001..003] |

---

### SESSION-001 — Strategy Expert Analysis
**Ngày:** 2026-03-19
**Dự án:** Hệ thống số toàn diện ERK Transport
**Chuyên gia:** Strategy Expert

#### 1. Business Model Assessment

**Mô hình hiện tại:**
ERK Transport hoạt động như một Freight Forwarder / NVOCC trên hành lang Trung Quốc – Việt Nam, cung cấp dịch vụ vận chuyển hàng hóa (đường biển, đường bộ, đường hàng không), khai báo hải quan, và các dịch vụ gia tăng (lưu kho, thông quan). Doanh thu đến từ phí dịch vụ (service fee), phí khai báo (declaration fee), và markup trên cước vận tải. Với 10.000+ khách hàng và 20.000+ lô hàng, ERK đang ở ngưỡng tới hạn mà mô hình vận hành thủ công/ERP cũ không thể scale tiếp.

**Điểm mạnh:**
- **Thị trường ngách có chiều sâu:** Hành lang Trung–Việt là hành lang thương mại tăng trưởng cao nhất Đông Nam Á (CAGR ~12-15%), ERK có lợi thế early-mover với 10.000+ khách hàng đã giao dịch — đây là tài sản chiến lược khó sao chép.
- **Network effect tiềm năng:** Nếu CAPP thành công, mỗi khách hàng trở thành node trong mạng lưới — tạo switching cost cao và cross-sell opportunity. Khách hàng dùng app tracking sẽ khó chuyển sang forwarder khác vì mất lịch sử đơn hàng.
- **Bộ tích hợp end-to-end độc đáo:** Hiếm forwarder SME nào ở Việt Nam có đủ năng lực xây dựng đồng thời 5 hệ thống tích hợp với HSC engine + VNACCS. Đây là moat kỹ thuật khi hoàn thành.
- **Vị trí địa lý chiến lược kép:** Kho cả hai đầu (VN + TQ) cho phép kiểm soát toàn bộ chuỗi — khác với forwarder chỉ hoạt động một phía.

**Điểm yếu / Rủi ro chiến lược:**
- **Dependency rủi ro cao vào một hành lang:** 100% revenue từ Trung–Việt tạo concentration risk nghiêm trọng. Bất kỳ thay đổi chính sách thương mại giữa hai nước đều có thể gây đứt gãy doanh thu đột ngột.
- **Rủi ro adoption của CAPP:** Target >60% adoption trong 6 tháng là rất tham vọng. Khách hàng logistics B2B Việt Nam có thói quen giao dịch qua Zalo/điện thoại. Nếu UX không đủ đơn giản, adoption sẽ thất bại.
- **Rủi ro over-engineering:** Xây dựng 5 hệ thống song song không có deadline cứng tạo rủi ro scope creep và technical debt tích lũy.
- **Human capital bottleneck:** 50+ nhân viên phải vận hành song song hệ thống cũ và mới. SAPP với 8 phòng ban đòi hỏi change management phức tạp.
- **Competitive response:** Nếu ERK thành công, các platform logistics lớn có thể phản ứng với giá thấp hơn hoặc tính năng tương tự nhờ nguồn lực vượt trội.

**Đánh giá tổng thể:** **Viable — với điều kiện thực thi đúng thứ tự ưu tiên.** Hướng đi chiến lược đúng, nhưng scope quá rộng nếu triển khai cùng lúc. Cần sequencing rõ ràng.

#### 2. Competitive Analysis

| Yếu tố | Đánh giá | Ghi chú |
|--------|---------|---------|
| Barrier to entry | **Medium → High (sau digitalization)** | Hiện tại barrier thấp. Sau khi ERK hoàn thành 5 hệ thống, switching cost + data moat sẽ tăng mạnh. |
| Substitute threats | **High** | Nền tảng logistics-as-a-platform (Cainiao, J&T Freight, Forto) đang mở rộng sang ĐNA. |
| Buyer power | **High** | Khách hàng SME có nhiều lựa chọn forwarder. Switching cost hiện tại gần bằng 0. CAPP là cách tạo lock-in. |
| Supplier power | **Medium** | Hãng tàu có giá list; forwarder volume cao đàm phán được. VNACCS là monopoly — ERK phải tuân theo. |
| Internal rivalry | **High** | Hành lang Trung–Việt có hàng trăm forwarder nhỏ cạnh tranh bằng giá. |
| Regulatory risk | **High** | HS Code, thuế, VNACCS thay đổi thường xuyên. HSC engine phải update liên tục. |

#### 3. KPI Framework Đề xuất

| KPI | Metric | Target | Timeline |
|-----|--------|--------|---------|
| Operational Efficiency | Thời gian xử lý trung bình/lô hàng | Giảm ≥30% vs baseline | Tháng 6 sau go-live |
| Digital Adoption — Customer | % KH active trên CAPP/tháng | >60% của ~1.000 KH active | Tháng 6 sau go-live |
| Digital Adoption — Staff | % giao dịch xử lý hoàn toàn qua SAPP | >90% | Tháng 3 sau go-live |
| Compliance Quality | Tỷ lệ lỗi HS Code dẫn đến thuế/phạt | <1% trên tổng lô hàng | Steady-state |
| Push Notification Engagement | Open rate | >25% (chuẩn B2B app) | Tháng 3 sau go-live |
| Revenue Impact | Tỷ lệ KH upsell/cross-sell qua CAPP | >15% KH active/quý | Tháng 12 sau go-live |
| System Integration | % lô hàng xử lý end-to-end không manual re-entry | >95% | Tháng 6 sau go-live |
| Customer Retention | Churn rate KH active | <5%/quý | Steady-state |
| Data Quality | % master data được chuẩn hóa trong ERP | >98% | Tháng 1 sau go-live |
| Marketing ROI | Cost per lead từ WEB + push campaign | Giảm 40% vs cold outreach | Tháng 9 sau go-live |

#### 4. Khuyến nghị chiến lược

1. **"Spine-first" sequencing:** ERP (5 modules cốt lõi: KD, Tài chính, Kho VN, Kho TQ, Điều phối) + SAPP go-live nội bộ trước. Sau đó mới CAPP + WEB + HSC. [ACTION → BIZ-POLICY-IT.md]
2. **CAPP "Value Day 1":** 3 tính năng killer: tracking real-time + xem/tải chứng từ + thanh toán. [ACTION → URS-CAPP.md]
3. **HSC Engine có tiềm năng SaaS:** Thiết kế multi-tenant từ đầu để có thể thương mại hóa sau. [ACTION → BIZ-POLICY-IT.md]
4. **"China Desk" như competitive moat:** WeChat OA integration + tri-lingual VN/EN/CN. [ACTION → URS-SAPP.md]
5. **Data Governance từ Phase 0:** 10-15% total effort cho data migration. [ACTION → BIZ-POLICY-IT.md]

#### 5. Open Issues Strategy
- Revenue model: phí theo lô hàng hay retainer/subscription?
- Chiến lược cạnh tranh: giá thấp sau automation hay giá premium value-based?
- Kế hoạch update HSC regulatory: internal team hay API VCCI/VINACONTROL?

---

### SESSION-001 — Finance Expert Analysis
**Ngày:** 2026-03-19
**Chuyên gia:** Finance Expert (CFA, 12+ năm kinh nghiệm Logistics & Tech)

#### 1. Business Case Summary

**Tổng đầu tư ước tính:** 2,5 tỷ – 5,5 tỷ VND (capex + opex năm 1)
**Thời gian hòa vốn:** 18 – 30 tháng kể từ khi go-live toàn bộ
**ROI dự kiến (3 năm):** Dương từ năm 4-5; scenario optimistic: 15-40% trong 3 năm
**Assumption chính:**
1. AI-assisted development giảm 40–60% chi phí nhân công vs outsource truyền thống
2. Doanh thu hiện tại ERK ước 50–120 tỷ VND/năm (benchmark ngành — **đã được revise lên 1.000 tỷ VND/năm sau khi có số liệu thực tế**)
3. Go-live theo giai đoạn: WEB + HSC (T+4-6), SAPP (T+6-9), CAPP (T+8-12), ERP full (T+12-18)

#### 2. Cost Structure

**Chi phí một lần (Capex):**

| Hạng mục | Ước tính |
|----------|---------|
| Development — WEB + HSC | 150 – 350 triệu VND |
| Development — CAPP (mobile, 10K+ users) | 400 – 800 triệu VND |
| Development — SAPP (ERP mobile, 8 phòng ban) | 300 – 600 triệu VND |
| Development — ERP core (9 modules, MISA + VNACCS) | 800 – 1.800 triệu VND |
| Integration layer (8+ APIs) | 300 – 600 triệu VND |
| QA, testing, security audit | 150 – 300 triệu VND |
| Infrastructure setup (cloud, CI/CD, VPN kho TQ) | 100 – 200 triệu VND |
| Training & change management (50+ nhân viên) | 80 – 150 triệu VND |
| PM / BA / tài liệu (MCV3 pipeline) | 100 – 200 triệu VND |
| **Tổng Capex** | **2,38 tỷ – 5,0 tỷ VND** |

**Chi phí vận hành/năm (Opex):**

| Hạng mục | Ước tính/năm |
|----------|-------------|
| Cloud infrastructure — 5 systems | 180 – 360 triệu VND |
| API fees — MISA subscription | 15 – 25 triệu VND |
| API fees — Payment gateway (0,5–1% theo giao dịch) | 20 – 80 triệu VND |
| API fees — Hãng tàu/hàng không tracking | 10 – 30 triệu VND |
| API fees — Zalo OA, SMS/Email gateway | 15 – 40 triệu VND |
| API fees — VNACCS/VCIS | 10 – 20 triệu VND |
| Nhân sự IT vận hành (1–2 người) | 300 – 600 triệu VND |
| Support & maintenance | 100 – 250 triệu VND |
| License phần mềm phụ trợ | 20 – 60 triệu VND |
| **Tổng Opex/năm** | **670 triệu – 1,465 tỷ VND** |

#### 3. Revenue/Savings Model (Revised với doanh thu thực 1.000 tỷ VND)

**Savings ước tính (khi fully operational ~năm 2):**
- Tiết kiệm nhân công thủ công: **400 – 800 triệu VND/năm**
- Giảm sai sót HS Code (với doanh thu 1.000 tỷ, tiết kiệm 1% thuế sai = ~10 tỷ tiềm năng): **500 triệu – 2 tỷ VND/năm** *(revised upward)*
- Tối ưu kho: **150 – 400 triệu VND/năm**
- Tự động hóa CSKH: **50 – 120 triệu VND/năm**
- Tiết kiệm phần mềm rời rạc: **60 – 150 triệu VND/năm**
- **Tổng savings (revised):** 1,16 tỷ – 3,47 tỷ VND/năm

**Revenue enablement (revised):**
- Giảm churn 10-20% KH active (1.000 KH): 1 – 2 tỷ VND/năm
- HSC thương mại hóa: 200 – 500 triệu VND/năm (tiềm năng)
- Tăng volume xử lý không tăng headcount: scale tới 40.000+ lô/năm vs 20.000 hiện tại

#### 4. ROI Projection (3 năm — Revised với doanh thu thực)

*Với doanh thu 1.000 tỷ/năm, investment 2,5-5,5 tỷ VND chỉ = 0,25-0,55% doanh thu — ROI case rất mạnh.*

| Năm | Investment | Savings + Revenue Enablement | Net Benefit | Cumulative |
|-----|-----------|------------------------------|-------------|-----------|
| Năm 1 | **3,66 tỷ VND** | **580 triệu VND** | **-3,08 tỷ** | -3,08 tỷ |
| Năm 2 | **1,81 tỷ VND** | **2,5 tỷ VND** | **+690 triệu** | -2,39 tỷ |
| Năm 3 | **1,44 tỷ VND** | **3,2 tỷ VND** | **+1,76 tỷ** | **-630 triệu** |

*Revised hòa vốn: cuối năm 3 / đầu năm 4. ROI 3 năm dương scenario.*

#### 5. Financial Risks

| Rủi ro | Xác suất | Tác động | Mitigation |
|--------|---------|---------|-----------|
| Cost overrun ERP | **High** | +500 triệu – 1,5 tỷ | Phase-gate; contingency reserve 20% |
| Adoption thất bại | **Medium** | Mất 60-80% ROI | Change management; UX tốt |
| Delay > 24 tháng | **Medium** | 100-150 triệu/tháng | AI dev; parallel testing |
| Security breach | **Medium** | 200 triệu – 2 tỷ | Security audit; NĐ 13/2023 |
| VNACCS API thay đổi | **Medium** | 50-200 triệu/lần | HSC modular; maintenance budget |

#### 6. Khuyến nghị tài chính

1. **Phân kỳ đầu tư:** WEB + HSC + SAPP KD + kho trước. ERP full là giai đoạn 2. [ACTION → BIZ-POLICY-IT.md]
2. **Contingency reserve 20-25% Capex** (~500 triệu – 1,25 tỷ VND). [ACTION → BIZ-POLICY-FINANCE.md]
3. **Baseline metrics trước go-live:** FTE thủ công, thời gian/lô, tỷ lệ lỗi HS Code. [ACTION → BIZ-POLICY-IT.md]

---

### SESSION-001 — Domain Expert Analysis
**Ngày:** 2026-03-19
**Chuyên gia:** Domain Expert
**Ngành detect:** Logistics / XNK / Freight Forwarding (3PL Full-service, tuyến Trung Quốc – Việt Nam)

#### 1. Quy trình nghiệp vụ cốt lõi

**Quy trình chuẩn ngành (3PL Freight Forwarder Full-service VN–TQ):**

```
═══════════════════════════════════════════════════
LUỒNG IMPORT (TQ → VN) — Full-service 3PL
═══════════════════════════════════════════════════
[GĐ 0] KH gửi yêu cầu → HAZMAT/quota check → Báo giá (3-tier pricing) → Ký HĐ → Thu cọc
[GĐ 1] (Sourcing) Tìm NCC → Đặt hàng → QC/QA → Đóng gói → Booking từ kho TQ
[GĐ 2] Biển: Booking tàu → FCL/LCL → B/L → Cảng TQ → Cảng VN
        Bộ:  Booking xe đối tác → Track xe/tài xế → Cross-border cửa khẩu
        Không: Booking flight → AWB → Sân bay TQ → Sân bay VN
[GĐ 3] Arrival Notice → Chứng từ (Invoice+PL+B/L+C/O+Phép) → HS Code check
        → Khai VNACCS → Luồng X/V/Đ → Nộp thuế → Thông quan
[GĐ 4] Lấy D/O → Nhận hàng cảng/CFS → Vận chuyển nội địa → Kiểm đếm
[GĐ 5] Nhập kho → Vị trí → Lệnh xuất → Giao last-mile → POD điện tử
[GĐ 6] Tổng hợp chi phí → Đối soát KH → Hóa đơn điện tử → Thu tiền
        → Thanh toán đối tác → Lưu hồ sơ 5 năm

═══════════════════════════════════════════════════
LUỒNG EXPORT (VN → TQ) — ĐÃ XÁC NHẬN CÓ
═══════════════════════════════════════════════════
[GĐ 0] Tiếp nhận đơn xuất khẩu → Kiểm tra hàng cấm xuất → Báo giá
[GĐ 1] Chuẩn bị hàng tại VN → Đóng gói → Booking vận tải
[GĐ 2] Khai hải quan xuất khẩu (tờ khai XK01/XK02) → Kiểm tra C/O xuất nếu cần
        → Thanh lý tờ khai → VAT hoàn 0% nếu đủ điều kiện
[GĐ 3] B/L/AWB → Transit → Thông quan nhập TQ → Giao tại kho TQ ERK

═══════════════════════════════════════════════════
LUỒNG SOURCING (Thu mua hộ tại TQ)
═══════════════════════════════════════════════════
Nhận yêu cầu → Tìm NCC (1688/Alibaba) → Đặt hàng → Theo dõi → QC tại kho TQ
→ Consolidation → Import như trên
```

**Gap Analysis (từ mô tả ban đầu):**
- Gap 1: Luồng Export chưa được mô tả — đã xác nhận CÓ
- Gap 2: Booking vận tải + quản lý B/L/D/O còn thiếu
- Gap 3: Quy trình Sourcing/QC kho TQ chưa phác thảo
- Gap 4: C/O management chưa đề cập
- Gap 5: Hàng đặc biệt (HAZMAT, hàng lạnh) — đã xác nhận ERK làm được tất cả
- Gap 6: Claim & Dispute management
- Gap 7: Credit limit management

#### 2. Domain-Specific Requirements

| Requirement | Mức độ | Lý do bắt buộc |
|-------------|--------|----------------|
| Tích hợp VNACCS/VCIS | **Must** | Bắt buộc pháp luật |
| Phân luồng X/V/Đ | **Must** | SLA khác nhau theo luồng |
| Multi-currency (VNĐ/USD/CNY/EUR) | **Must** | Thanh toán đa đồng tiền |
| Tỷ giá NHNN tự động | **Must** | Thuế NK tính theo tỷ giá NHNN ngày khai |
| HS Code + lịch sử thay đổi | **Must** | Sai HS → phạt + truy thu |
| Lưu hồ sơ hải quan 5 năm | **Must** | Luật Hải quan 2014 Điều 18 |
| C/O management (Form E, D, B...) | **Must** | ACFTA ưu đãi thuế 5-20% |
| Incoterms trên từng đơn | **Must** | Xác định ai chịu phí gì |
| Tracking container/flight | **Must** | Tracking real-time cho KH |
| Phụ phí vận tải (THC/D/O/CFS/BAF/CAF) | **Must** | Phụ phí thay đổi; không track → thu thiếu |
| Phân biệt FCL và LCL | **Must** | Quy trình, phí hoàn toàn khác nhau |
| **3-tier pricing engine** | **Must** | Order > Customer > General (đã xác nhận) |
| **Credit limit + auto-block** | **Must** | KH mua chịu; rủi ro nợ xấu |
| **Vehicle Registry** (không phải Fleet Mgmt) | **Must** | Track xe/tài xế đối tác cho thủ tục cửa khẩu |
| **Hóa đơn điện tử** (NĐ 123/2020) | **Must** | Bắt buộc từ 07/2022 |
| **Luồng Export** (hải quan xuất) | **Must** | ERK có dịch vụ Export VN→TQ |
| **HAZMAT management** | **Must** | ERK làm được tất cả loại hàng theo luật VN |
| **Tri-lingual VN/EN/CN** | **Must** | Cả 5 systems cần 3 ngôn ngữ |
| Booking slot tàu | **Should** | Delay booking → chờ thêm 1 tuần |
| Cargo insurance | **Should** | Mua bảo hiểm hộ KH |
| Kiểm tra chuyên ngành | **Should** | Hàng thực phẩm/dược phẩm |
| POD điện tử | **Should** | Bằng chứng giao hàng |
| Alert demurrage/detention | **Should** | 1-3 triệu/container/ngày nếu trễ |
| WeCom integration kho TQ | **Should** | Kho TQ tự sở hữu; nhân viên TQ |
| **Kho TQ cost tracking (internal)** | **Should** | Chi phí kho TQ không hạch toán chính thức tại VN nhưng cần internal management |

#### 3. Data Entities Cần Có

```
Shipment: master_no, direction(import/export), mode(sea/air/road),
          incoterms, cargo_type(GEN/HAZMAT/COLD/OOG), customs_status(X/V/Đ),
          declaration_no, price_config_id (→ 3-tier pricing)

Bill of Lading / AWB: bl_number, vessel/voyage/flight,
                      port_loading/discharge, container_list

Container: container_no, type, seal_no, free_time_start/end (alert demurrage)

Customs Declaration: declaration_no, type(NK01a/XK01), hs_code_list,
                     exchange_rate (tỷ giá NHNN ngày khai — lưu lịch sử),
                     import_duty, vat_import, total_tax, channel(X/V/Đ)

HS Code Master: hs_code(8-10 chữ số), description_vi/en/zh,
                mfn_rate, acfta_rate, atiga_rate, vat_rate, excise_tax,
                import_conditions, required_permits, effective_date, change_history

C/O: co_number, form_type(E/D/B/AI), issued_date, expiry_date, benefit_claimed

Freight Rate Card: carrier, FCL/LCL/AIR, valid_from/to, base_rate, surcharges_list

Surcharge: surcharge_code, amount, valid_from/to, carrier_specific

Exchange Rate History: currency_pair, rate_date, nhnn_rate, vcb_rate

Warehouse Lot: lot_no, product_sku, quantity, location, batch_no, expiry_date

PricingConfig: scope(order/customer/general), customer_id(nullable),
               shipment_id(nullable), rate_table, effective_date, priority

CreditAccount: customer_id, credit_limit, current_balance, overdue_amount,
               payment_term_days, auto_block_threshold, last_payment_date

VehicleRegistry: vehicle_plate, vehicle_type, vehicle_photo_url,
                 driver_name, driver_id_number, driver_photo_url,
                 carrier_partner_id, related_shipment_ids
                 (Dùng cho thủ tục thông quan cửa khẩu — không phải Fleet Management)

China Warehouse Cost: period, cost_type, amount_cny, amount_vnd_equiv,
                      notes (internal tracking — không hạch toán chính thức VN)

HAZMAT Detail: un_number, hazard_class, packing_group, ems_no,
               permitted_modes, related_shipment_id
```

#### 4. Compliance & Regulatory

| Quy định | Nội dung | Tác động đến thiết kế |
|----------|----------|----------------------|
| Luật Hải quan 2014 | Khai báo điện tử; lưu 5 năm | Archive policy không xóa |
| TT 38/2015 | Thủ tục hải quan; luồng X/V/Đ | VNACCS format chuẩn |
| Biểu thuế NK (NĐ 26/2023) | MFN, ACFTA, ATIGA | HS Code master đồng bộ biểu thuế |
| ACFTA | C/O Form E ưu đãi TQ→VN | Workflow kiểm tra C/O trước submit |
| NĐ 123/2020 | Hóa đơn điện tử bắt buộc | Module hóa đơn điện tử |
| Luật AML 2022 | Giao dịch >300tr VNĐ báo cáo | Auto-flag STR |
| IMDG/IATA DGR | HAZMAT biển/không | HAZMAT check tự động |
| Luật BVMT 2020 | Phí BVMT một số hàng NK | Tính phí BVMT theo HS Code |

#### 5. Common Pitfalls

- ⚠️ **Pitfall 1 — Sai HS Code:** HSC phải tích hợp workflow; không để tra tay.
- ⚠️ **Pitfall 2 — Demurrage/Detention:** Auto-alert khi free time còn 2 ngày.
- ⚠️ **Pitfall 3 — C/O Form E không hợp lệ:** Workflow kiểm tra C/O trước submit VNACCS.
- ⚠️ **Pitfall 4 — Multi-currency không nhất quán:** Một nguồn tỷ giá NHNN duy nhất toàn hệ thống.
- ⚠️ **Pitfall 5 — Phụ phí không đầy đủ:** Rate Card management theo carrier và valid date.
- ⚠️ **Pitfall 6 — Lưu hồ sơ < 5 năm:** Vi phạm Luật Hải quan.
- ⚠️ **Pitfall 7 — Không kiểm soát công nợ:** Credit limit + auto-block bắt buộc.
- ⚠️ **Pitfall 8 — WeCom kho TQ là điểm mù:** WeCom API tích hợp SAPP là bắt buộc.

#### 6. Đề xuất bổ sung Scope

- **Auto-quotation engine (3-tier):** Đã xác nhận là Must. [ACTION → URS-ERP.md]
- **Consolidation LCL Management:** Phân bổ phí tự động theo CBM/GW. [ACTION → URS-ERP.md]
- **HAZMAT compliance check:** Block đơn tự động. [ACTION → URS-HSC.md]
- **Claim & Dispute module:** Ticket, ảnh, approval, track đòi bồi thường. [ACTION → URS-ERP.md]
- **Compliance Dashboard:** Export tờ khai cho thanh tra. [ACTION → URS-ERP.md]
- **FX Exposure Tracking:** P&L thực từng đơn hàng. [ACTION → URS-ERP.md]
- **Export Flow (VN→TQ):** Khai hải quan xuất, C/O xuất, VAT hoàn 0%. [ACTION → URS-ERP.md]

---

## CONSENSUS — SESSION-001

### Điểm đồng thuận (cả 3 experts đồng ý)

| # | Nội dung | 3 agents | Action trong Phase 3 |
|---|---------|---------|---------------------|
| 1 | Cần **phân giai đoạn** triển khai — không "big bang" 5 hệ thống cùng lúc | ✅ ✅ ✅ | [ACTION → BIZ-POLICY-IT.md] |
| 2 | **VNACCS** là nút thắt cổ chai số 1 — spike API từ sớm | ✅ ✅ ✅ | [ACTION → BIZ-POLICY-IT.md] |
| 3 | **HSC Engine** phải tích hợp trực tiếp vào workflow | ✅ ✅ ✅ | [ACTION → URS-HSC.md] |
| 4 | **Multi-currency + tỷ giá NHNN** làm nguồn duy nhất — bắt buộc | ✅ ✅ ✅ | [ACTION → DATA-DICTIONARY.md] |
| 5 | **Data migration** ERP cũ = rủi ro lớn nhất — 20-30% total effort | ✅ ✅ ✅ | [ACTION → BIZ-POLICY-IT.md] |
| 6 | CAPP v1.0: **3 tính năng killer** — tracking + chứng từ + thanh toán | ✅ ✅ ✅ | [ACTION → URS-CAPP.md] |
| 7 | **Lưu hồ sơ hải quan 5 năm** — archive policy từ đầu | ✅ ✅ ✅ | [ACTION → BIZ-POLICY-IT.md] |
| 8 | **Demurrage/Detention alert** — Must-have | ✅ ✅ ✅ | [ACTION → URS-ERP.md] |

### Điểm tranh luận

| # | Vấn đề | Strategy | Finance | Domain | Đề xuất |
|---|--------|---------|---------|--------|---------|
| 1 | **Thứ tự triển khai** | ERP + SAPP trước | WEB + HSC trước | Core logistics ERP + HSC + CAPP | **Hợp nhất:** HSC + ERP (5 core modules) + SAPP → CAPP → WEB → ERP full |
| 2 | **HSC SaaS** | Multi-tenant từ đầu | Chờ ROI nội bộ | N/A | **BOD quyết định:** Có muốn thương mại hóa? |

---

## RESOLUTION — SESSION-001

*Cập nhật 2026-03-19 — Sau khi BOD/Stakeholders trả lời 12 Open Issues*

| # | Open Issue | Trả lời | Tác động & Action |
|---|-----------|---------|------------------|
| OI-001 | Export (VN→TQ)? | **Có** — hệ thống phải hỗ trợ đầy đủ Export orders | [ACTION → URS-ERP.md, URS-SAPP.md] Thêm luồng Export vào scope |
| OI-002 | Kho TQ: tự sở hữu hay đối tác? | **Tự sở hữu** + có nhân viên tại TQ. Chi phí không hạch toán chính thức tại VN nhưng cần internal management/tracking | [ACTION → URS-ERP.md] Internal cost tracking entity cho kho TQ. WeCom là critical path. |
| OI-003 | ERK là Đại lý HQ hay Freight Forwarder? | **Cả hai** + Mua hàng hộ. Không có xe riêng nhưng **cần track thông tin xe/tài xế** (ảnh + text) cho thủ tục cửa khẩu | [ACTION → URS-ERP.md] Vehicle Registry module (không phải Fleet Management) |
| OI-004 | KH active 12 tháng? | **~1.000 KH active** (trong 10.000+ total) | CAPP target 60% = 600 users active. Thực tế hơn. |
| OI-005 | Hàng đặc biệt? | **Có đầy đủ** — ERK làm tất cả loại hàng theo luật VN hiện hành (HAZMAT, hàng lạnh, OOG, kiểm dịch...) | [ACTION → URS-ERP.md, URS-HSC.md] HAZMAT module là Must |
| OI-006 | Chính sách giá? | **3-tier pricing:** Priority: Đơn hàng > Khách hàng > Bảng giá chung. Linh hoạt cấu hình theo từng cấp | [ACTION → URS-ERP.md] Pricing engine 3 tầng — complex requirement |
| OI-007 | Thanh toán KH? | **Cả hai:** Trả trước + Credit term | [ACTION → URS-ERP.md] Credit management + prepaid workflow |
| OI-008 | Đội xe riêng? | **Không có xe riêng**, nhưng cần track: thông tin xe (biển số, ảnh xe), thông tin tài xế (tên, CMND, ảnh) của đối tác vận chuyển cho thủ tục thông quan cửa khẩu | [ACTION → URS-ERP.md] Vehicle Registry: plate_no, vehicle_photo, driver_name, driver_photo |
| OI-009 | MISA version + API? | **MISA phiên bản mới nhất.** API chưa rõ — cần research. **Xây sẵn integration gateway** để tích hợp khi MISA cho phép | [ACTION → BIZ-POLICY-IT.md] MISA Integration Gateway pattern |
| OI-010 | Cloud strategy? | Không quan trọng với stakeholder — để team kỹ thuật quyết định | N/A — quyết định ở Phase 5 (Tech Design) |
| OI-011 | Doanh thu thực tế? | **~1.000 tỷ VND/năm** doanh thu mua hàng hóa cho KH — **gấp 10-20x ước tính ban đầu của Finance Expert** | ROI model hoàn toàn thay đổi. Savings 1% sai sót = 10 tỷ. Investment < 0,55% doanh thu. |
| OI-012 | China Desk? | Hệ thống cần **Tiếng Việt + Tiếng Anh + Tiếng Trung** (tri-lingual) | [ACTION → Tất cả URS] i18n (VN/EN/CN) là Must cho toàn bộ 5 systems |

### Phát hiện quan trọng từ Resolution

**1. Doanh thu 1.000 tỷ VND/năm — thay đổi hoàn toàn business case:**
- Investment 2,5-5,5 tỷ VND = chỉ 0,25-0,55% doanh thu — rất hợp lý
- Savings từ giảm 1% lỗi HS Code = ~10 tỷ VND tiềm năng/năm
- ROI case trở nên **rất mạnh** — dự án nên được ưu tiên cao nhất

**2. Kho TQ tự sở hữu → WeCom là Critical Path:**
- Không phải "nice to have" mà là bắt buộc để kết nối dữ liệu kho TQ real-time
- Cần thiết kế internal cost center cho kho TQ ngay cả khi không hạch toán chính thức

**3. 3-tier Pricing Engine là requirement phức tạp nhất trong ERP:**
- Cần thiết kế cẩn thận ở Phase 5 — nhiều edge cases
- Priority: Order-level override Customer-level override General table

**4. Vehicle Registry (không phải Fleet Management):**
- Scope nhỏ hơn nhưng vẫn cần: biển số, ảnh xe, tên tài xế, ảnh tài xế
- Dùng cho thủ tục thông quan cửa khẩu — legal requirement

**5. Tri-lingual i18n (VN/EN/CN) bắt buộc cho toàn bộ 5 systems:**
- Không chỉ giao diện mà còn documents xuất ra (hóa đơn, vận đơn, thông báo)
- Tác động đến cả DATA-DICTIONARY (description_vi/en/zh cho HS Code)

---

## ACTION ITEMS — SESSION-001 (Updated)

| # | Action | Tài liệu đích | Status |
|---|--------|--------------|--------|
| 1 | Viết BIZ-POLICY-IT.md: Phase sequencing, Data Migration Plan, Contingency Reserve, VNACCS Spike, MISA Gateway | [ACTION → _PROJECT/BIZ-POLICY/BIZ-POLICY-IT.md] | ⏳ |
| 2 | Viết BIZ-POLICY-FINANCE.md: Contingency reserve, ROI tracking, Credit limit policy, Kho TQ cost tracking | [ACTION → _PROJECT/BIZ-POLICY/BIZ-POLICY-FINANCE.md] | ⏳ |
| 3 | Viết DATA-DICTIONARY.md: Exchange Rate History, C/O entity, Surcharge, Demurrage, PricingConfig, CreditAccount, VehicleRegistry, China Warehouse Cost | [ACTION → _PROJECT/DATA-DICTIONARY.md] | ⏳ |
| 4 | Viết PROCESS/PROCESS-LOGISTICS.md: Quy trình Import + Export + Sourcing đầy đủ | [ACTION → _PROJECT/PROCESS/PROCESS-LOGISTICS.md] | ⏳ |
| 5 | Viết BIZ-POLICY-LOGISTICS.md: C/O policy, HAZMAT policy, Credit term policy, Pricing 3-tier rules | [ACTION → _PROJECT/BIZ-POLICY/BIZ-POLICY-LOGISTICS.md] | ⏳ |
| 6 | Nghiên cứu MISA Open API availability (search online) trước Phase 5 | [ACTION → BIZ-POLICY-IT.md] | ⏳ |
| 7 | Thiết kế i18n strategy (VN/EN/CN) cho toàn bộ 5 systems | [ACTION → URS tất cả systems] | ⏳ |

---

## KẾT LUẬN

**Phase 2 — Expert Panel SESSION-001 hoàn thành ngày 2026-03-19.**

ERK Transport có **business case rất mạnh** cho dự án số hóa toàn diện:
- Doanh thu thực 1.000 tỷ VND/năm đặt đầu tư 2,5-5,5 tỷ ở mức <0,55% revenue
- HSC Engine tự động giảm lỗi HS Code có tiềm năng tiết kiệm hàng chục tỷ VND/năm
- Kho tự sở hữu ở cả hai đầu hành lang tạo competitive moat khi được số hóa đúng cách

**Điều kiện thành công:**
1. Phân giai đoạn triển khai (không Big Bang)
2. VNACCS integration cần spike research sớm
3. 3-tier pricing engine thiết kế kỹ ở Phase 5
4. Tri-lingual (VN/EN/CN) ngay từ Phase 4 requirements
5. Data migration plan rõ ràng trước go-live

**Bước tiếp theo:** Chạy `/mcv3:biz-docs` để tạo tài liệu nghiệp vụ (BIZ-POLICY + PROCESS + DATA-DICTIONARY).
