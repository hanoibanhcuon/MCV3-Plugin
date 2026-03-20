# DATA-DICTIONARY
<!-- ============================================================
     TỪ ĐIỂN DỮ LIỆU CHUNG TOÀN DỰ ÁN
     Định nghĩa entities, thuật ngữ dùng chung giữa TẤT CẢ systems.
     Mỗi system có DATA-MODEL riêng → tham chiếu đến file này.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md, EXPERT-LOG.md → SESSION-001
       Key IDs: TERM-XXX, ENT-XXX, ENUM-XXX
       Update: Cập nhật xuyên suốt Phase 1-5
     ============================================================ -->

> **Phase:** Cấp dự án (cập nhật xuyên suốt)
> **Loại:** Tài liệu tham chiếu (Reference Document)
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0
> **Người tạo:** MCV3 Biz-Docs Agent

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Context & scope
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-001] — Domain expert analysis & entities

### Tài liệu tham chiếu file này:
- Tất cả URS files (ERP/P1-REQUIREMENTS/, CAPP/P1-REQUIREMENTS/, SAPP/P1-REQUIREMENTS/, HSC/P1-REQUIREMENTS/, WEB/P1-REQUIREMENTS/)
- Tất cả MODSPEC files (*/P2-DESIGN/)
- Code files: `[REF: TERM-XXX]` cho type names, `[REF: ENUM-XXX]` cho enum values

---

## 1. THUẬT NGỮ NGHIỆP VỤ (Business Glossary)

<!-- AI và team phải dùng đúng từ này trong mọi tài liệu và code.
     Format tham chiếu: [REF: TERM-XXX] -->

| Mã | Thuật ngữ (VI) | Thuật ngữ (EN) | Thuật ngữ (ZH) | Định nghĩa | Ví dụ / Ghi chú |
|----|--------------|--------------|--------------|------------|-----------------|
| TERM-001 | Lô hàng | Shipment | 货物批次 | Đơn vị nghiệp vụ theo dõi hàng hóa của **1 khách hàng** trên 1 chuyến vận chuyển. Nhiều lô hàng (từ nhiều KH) có thể được gom chung trên 1 xe/container/chuyến bay (LCL/shared truck). | UI tiếng Việt hiển thị: "Lô hàng / Shipment". 1 Master B/L có thể chứa nhiều Lô hàng của nhiều KH khác nhau. |
| TERM-002 | Vận đơn | Bill of Lading (B/L) / Air Waybill (AWB) | 提单 / 空运单 | Chứng từ vận chuyển do hãng tàu/hãng bay phát hành. Master B/L do hãng tàu cấp; House B/L do Forwarder cấp cho từng KH. 1 Master B/L có thể chứa nhiều House B/L (LCL). | FCL: 1 container = 1 B/L; LCL: 1 Master B/L → nhiều House B/L |
| TERM-003 | Đơn vị vận chuyển | Transport Unit | 运输单元 | Phương tiện/đơn vị vật lý chứa hàng: Container (biển), Xe tải (đường bộ), Chuyến bay (hàng không). Nhiều Lô hàng (từ nhiều KH) có thể nằm trên 1 Đơn vị vận chuyển (LCL/shared truck). | Container 40HC; Xe đầu kéo biển số 51C-999.99; Chuyến bay VN987 |
| TERM-004 | Luồng hải quan | Customs Channel | 海关通道 | Phân loại tờ khai do VNACCS chỉ định sau khi submit: Xanh (thông quan tự động), Vàng (kiểm tra chứng từ), Đỏ (kiểm tra thực tế hàng). Ký hiệu VNACCS: X / V / Đ. | [REF: ENUM-004] |
| TERM-005 | Mã HS | HS Code | 海关编码 / HS编码 | Mã phân loại hàng hóa theo Hệ thống Phối hợp Mô tả và Mã hóa (Harmonized System) của WCO. Việt Nam dùng 8 chữ số. Sai mã HS → phạt hải quan + truy thu thuế. | VD: 8471.30.10 — Máy tính xách tay |
| TERM-006 | Giấy C/O | Certificate of Origin (C/O) | 原产地证明 | Chứng nhận xuất xứ hàng hóa dùng để hưởng ưu đãi thuế theo FTA. Form E (ACFTA) phổ biến nhất tuyến TQ→VN: giảm thuế NK 0-5%. Phải kiểm tra hợp lệ trước khi submit VNACCS. | [REF: ENT-008], [REF: ENUM-005] |
| TERM-007 | Tỷ giá NHNN | NHNN Exchange Rate | 国家银行汇率 | Tỷ giá do Ngân hàng Nhà nước VN công bố hàng ngày. **Nguồn duy nhất** toàn hệ thống để tính thuế NK và quy đổi tiền tệ. Không dùng tỷ giá nguồn khác. | [REF: ENT-013] — Đồng bộ tự động từ API NHNN lúc 8:00 sáng |
| TERM-008 | Giá 3 cấp | 3-Tier Pricing | 三级定价 | Cơ chế định giá với 3 cấp ưu tiên: (1) Giá riêng theo Đơn hàng > (2) Giá riêng theo Khách hàng > (3) Bảng giá chung theo Tuyến. Cấp cao hơn luôn override cấp thấp hơn. | [REF: ENT-009], [REF: ENUM-011] |
| TERM-009 | Hạn mức tín dụng | Credit Limit | 信用额度 | Mức tối đa KH được nợ, kiểm soát theo **cả hai chiều**: (a) số tiền tối đa còn nợ (VNĐ) VÀ (b) số ngày thanh toán tối đa. Hệ thống tự động block khi vượt một trong hai. | [REF: ENT-011], [REF: ENUM-012] |
| TERM-010 | Phụ phí | Surcharge | 附加费 | Các loại phí bổ sung ngoài cước vận chuyển cơ bản, phát sinh theo điều kiện cụ thể của từng lô hàng, tuyến hoặc carrier. Cấu hình linh hoạt — admin có thể thêm loại mới. | THC, BAF, D/O Fee, CFS... [REF: ENUM-013], [REF: ENT-015] |
| TERM-011 | Phí lưu container tại cảng | Demurrage | 港口滞留费 | Phí phát sinh khi container không được lấy ra khỏi cảng trong thời gian miễn phí (free time) sau khi tàu cập bến. Tính theo ngày × đơn giá carrier. | Free time thường 3-7 ngày; sau đó ~1-3 triệu VNĐ/container/ngày |
| TERM-012 | Phí lưu container ngoài cảng | Detention | 集装箱延留费 | Phí phát sinh khi container đã lấy ra khỏi cảng nhưng chưa trả về depot của hãng tàu trong thời gian miễn phí. Khác Demurrage: container đã ra ngoài cảng. | [REF: TERM-011] để phân biệt |
| TERM-013 | Điều kiện giao hàng | Incoterms | 贸易术语 | Bộ quy tắc ICC xác định trách nhiệm rủi ro và chi phí giữa người mua/bán trong thương mại quốc tế. Phiên bản hiện tại: Incoterms 2020. | FOB, CIF, DAP, DDP... [REF: ENUM-009] |
| TERM-014 | Hàng nguy hiểm | HAZMAT (Hazardous Materials) | 危险品 | Hàng có tính chất nguy hiểm: dễ cháy, nổ, độc, ăn mòn, phóng xạ... Bắt buộc khai báo riêng, tuân thủ IMDG (biển)/IATA DGR (không). ERK làm được tất cả loại hàng HAZMAT theo luật VN. | Cần HAZMAT Declaration riêng; hệ thống tự động cảnh báo và check khi tạo Shipment |
| TERM-015 | Hàng nguyên cont / Hàng lẻ | FCL / LCL | 整箱 / 拼箱 | FCL (Full Container Load): 1 KH thuê nguyên container. LCL (Less than Container Load): hàng của nhiều KH gom chung 1 container. LCL: phân bổ phí theo CBM/GW. | FCL quản lý theo container; LCL quản lý theo Shipment với trọng lượng/thể tích |
| TERM-016 | Tờ khai hải quan | Customs Declaration | 海关报关单 | Văn bản khai báo hàng với hải quan qua VNACCS/VCIS. Mỗi tờ khai có số tờ khai duy nhất. NK: mẫu NK01a; XK: mẫu XK01. **Lưu trữ bắt buộc 5 năm** theo Luật Hải quan 2014. | [REF: ENT-006] |
| TERM-017 | Bằng chứng giao hàng | POD (Proof of Delivery) | 签收证明 | Xác nhận KH đã nhận hàng — gồm chữ ký điện tử, ảnh hàng, GPS timestamp. Upload qua CAPP (KH) hoặc SAPP (nhân viên giao hàng). | Lưu trữ để đối chiếu khi có khiếu nại |
| TERM-018 | Sổ xe | Vehicle Registry | 车辆登记册 | Danh sách xe/tài xế của đối tác vận chuyển — dùng điền thông tin thủ tục cửa khẩu đường bộ. ERK **không có xe riêng**. Không phải Fleet Management. | [REF: ENT-012] — Biển số, ảnh xe, tên/CMND/ảnh tài xế |
| TERM-019 | Chi phí kho Trung Quốc | China Warehouse Cost | 中国仓库成本 | Chi phí vận hành kho ERK tại TQ: lương nhân sự TQ + tiền thuê kho (chi phí cố định) + có thể tính thêm theo CBM/ngày (chi phí biến đổi). Không hạch toán chính thức vào sổ VN nhưng cần theo dõi nội bộ. | [REF: ENT-014] |
| TERM-020 | Hóa đơn điện tử | E-Invoice | 电子发票 | Hóa đơn điện tử bắt buộc theo NĐ 123/2020, áp dụng từ 07/2022. Lưu trữ 10 năm theo Luật Kế toán. ERK cần tích hợp hoặc phát hành qua phần mềm được cấp phép. | Bắt buộc cho mọi giao dịch có thu tiền |

---

## 2. MASTER ENTITIES (ENT-XXX — Entities dùng chung)

<!-- Entity được nhiều systems dùng.
     Format tham chiếu: [REF: ENT-XXX] hoặc [REF: ENT-XXX.field] -->

---

### ENT-001: Customer (Khách hàng)

**Mô tả:** Doanh nghiệp hoặc cá nhân sử dụng dịch vụ logistics của ERK. Master data do ERP quản lý, read-only ở CAPP/SAPP.
**Owner system:** ERP
**Read-only systems:** CAPP, SAPP, WEB

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-001.id | customer_id | UUID | ✅ | ID duy nhất | ALL |
| ENT-001.code | customer_code | VARCHAR(20) | ✅ | Mã KH nội bộ (VD: KH-00123) | ERP, SAPP |
| ENT-001.name_vi | name_vi | VARCHAR(255) | ✅ | Tên KH tiếng Việt | ERP, CAPP, SAPP |
| ENT-001.name_en | name_en | VARCHAR(255) | ❌ | Tên KH tiếng Anh | ERP |
| ENT-001.name_zh | name_zh | VARCHAR(255) | ❌ | Tên KH tiếng Trung | ERP |
| ENT-001.tax_code | tax_code | VARCHAR(20) | ❌ | Mã số thuế (nếu là doanh nghiệp) | ERP |
| ENT-001.phone | phone | VARCHAR(20) | ✅ | Số điện thoại chính | ERP, CAPP |
| ENT-001.email | email | VARCHAR(255) | ❌ | Email | ERP, CAPP |
| ENT-001.address | address | TEXT | ❌ | Địa chỉ giao hàng mặc định | ERP |
| ENT-001.credit_account_id | credit_account_id | UUID | ❌ | FK → ENT-011 (null nếu trả trước) | ERP |
| ENT-001.preferred_language | preferred_language | ENUM | ❌ | Ngôn ngữ ưu tiên | CAPP [REF: ENUM-015] |
| ENT-001.status | status | ENUM | ✅ | ACTIVE / INACTIVE / BLACKLISTED | ERP |
| ENT-001.created_at | created_at | TIMESTAMP | ✅ | Ngày tạo | ALL |

---

### ENT-002: Employee (Nhân viên)

**Mô tả:** Nhân viên nội bộ ERK, gồm cả nhân viên tại Việt Nam và nhân viên tại kho Trung Quốc.
**Owner system:** ERP (HR module)
**Read-only systems:** SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-002.id | employee_id | UUID | ✅ | ID duy nhất | ERP, SAPP |
| ENT-002.code | employee_code | VARCHAR(20) | ✅ | Mã nhân viên | ERP |
| ENT-002.name_vi | name_vi | VARCHAR(100) | ✅ | Tên tiếng Việt | ERP, SAPP |
| ENT-002.name_zh | name_zh | VARCHAR(100) | ❌ | Tên tiếng Trung (nhân viên kho TQ) | ERP |
| ENT-002.department | department | VARCHAR(50) | ✅ | Phòng ban | ERP |
| ENT-002.role | role | VARCHAR(50) | ✅ | Chức danh | ERP |
| ENT-002.location | location | ENUM | ✅ | VN / CN — vị trí làm việc | ERP |
| ENT-002.wecom_id | wecom_id | VARCHAR(100) | ❌ | WeCom user ID (nhân viên kho TQ — bắt buộc nếu location=CN) | SAPP |
| ENT-002.status | status | ENUM | ✅ | ACTIVE / INACTIVE | ERP |

---

### ENT-003: Shipment (Lô hàng)

**Mô tả:** Đơn vị nghiệp vụ cốt lõi — theo dõi hàng hóa của **1 Khách hàng** trong 1 chuyến vận chuyển. Nhiều Shipment có thể được gom trên 1 Đơn vị vận chuyển (LCL/shared truck). Xem [REF: TERM-001] để hiểu mối quan hệ với B/L.
**Owner system:** ERP
**Read-only systems:** CAPP (tracking), SAPP (xem + cập nhật trạng thái), HSC (kiểm tra HS Code)

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-003.id | shipment_id | UUID | ✅ | ID duy nhất | ALL |
| ENT-003.master_no | master_no | VARCHAR(30) | ✅ | Số lô hàng nội bộ ERK (VD: ERK-2026-00123) | ALL |
| ENT-003.customer_id | customer_id | UUID | ✅ | FK → ENT-001 | ALL |
| ENT-003.direction | direction | ENUM | ✅ | IMPORT / EXPORT | ALL [REF: ENUM-001] |
| ENT-003.mode | mode | ENUM | ✅ | SEA / AIR / ROAD / MULTIMODAL | ALL [REF: ENUM-002] |
| ENT-003.cargo_type | cargo_type | ENUM | ✅ | GEN / HAZMAT / COLD / OOG / PERISHABLE / VALUABLE | ALL [REF: ENUM-003] |
| ENT-003.transport_unit_id | transport_unit_id | UUID | ❌ | FK → ENT-004 (Container/Xe/Chuyến bay) — null khi chưa assign | ERP |
| ENT-003.bl_id | bl_id | UUID | ❌ | FK → ENT-005 (House B/L hoặc B/L chính) | ERP |
| ENT-003.declaration_id | declaration_id | UUID | ❌ | FK → ENT-006 (Tờ khai hải quan) | ERP |
| ENT-003.incoterms | incoterms | ENUM | ✅ | Điều kiện giao hàng | ERP [REF: ENUM-009] |
| ENT-003.hs_code_primary | hs_code_primary | VARCHAR(10) | ❌ | Mã HS chính (FK → ENT-007) | ERP, HSC |
| ENT-003.pricing_config_id | pricing_config_id | UUID | ❌ | FK → ENT-009 (giá đã resolve từ 3-tier) | ERP |
| ENT-003.status | status | ENUM | ✅ | Trạng thái lô hàng | ALL [REF: ENUM-007] |
| ENT-003.origin_country | origin_country | VARCHAR(3) | ✅ | ISO 3166-1 alpha-3 | ERP |
| ENT-003.dest_country | dest_country | VARCHAR(3) | ✅ | ISO 3166-1 alpha-3 | ERP |
| ENT-003.weight_kg | weight_kg | DECIMAL(10,2) | ❌ | Trọng lượng thực (kg) | ERP |
| ENT-003.cbm | cbm | DECIMAL(10,3) | ❌ | Thể tích (CBM) | ERP |
| ENT-003.is_hazmat | is_hazmat | BOOLEAN | ✅ | Cờ hàng nguy hiểm — tự động set khi cargo_type=HAZMAT | ALL |
| ENT-003.notes_internal | notes_internal | TEXT | ❌ | Ghi chú nội bộ (không hiển thị cho KH) | ERP, SAPP |
| ENT-003.created_at | created_at | TIMESTAMP | ✅ | Ngày tạo | ALL |
| ENT-003.created_by | created_by | UUID | ✅ | FK → ENT-002 (nhân viên KD tạo đơn) | ERP |

---

### ENT-004: TransportUnit (Đơn vị vận chuyển)

**Mô tả:** Phương tiện/đơn vị vật lý chứa hàng. Với biển FCL: Container. Với đường bộ: Xe tải. Với hàng không: AWB Master + Flight. Một TransportUnit chứa nhiều Shipment (LCL/shared).
**Owner system:** ERP
**Read-only systems:** SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-004.id | transport_unit_id | UUID | ✅ | ID duy nhất | ERP, SAPP |
| ENT-004.mode | mode | ENUM | ✅ | SEA / AIR / ROAD | ERP [REF: ENUM-002] |
| ENT-004.unit_ref | unit_ref | VARCHAR(50) | ✅ | Container No / Biển số xe / Flight No | ERP |
| ENT-004.container_type | container_type | ENUM | ❌ | Loại container (chỉ khi mode=SEA, FCL) | ERP [REF: ENUM-006] |
| ENT-004.seal_no | seal_no | VARCHAR(30) | ❌ | Số seal (SEA/ROAD) | ERP |
| ENT-004.vehicle_registry_id | vehicle_registry_id | UUID | ❌ | FK → ENT-012 (chỉ khi mode=ROAD) | ERP |
| ENT-004.free_time_start | free_time_start | DATE | ❌ | Ngày bắt đầu free time demurrage (SEA) | ERP |
| ENT-004.free_time_end | free_time_end | DATE | ❌ | Ngày kết thúc free time → trigger alert | ERP |
| ENT-004.bl_master_no | bl_master_no | VARCHAR(50) | ❌ | Số Master B/L (FK → ENT-005) | ERP |
| ENT-004.vessel_voyage | vessel_voyage | VARCHAR(100) | ❌ | Tàu/chuyến (SEA): "EVER GIVEN / 123W" | ERP |

---

### ENT-005: BillOfLading (Vận đơn)

**Mô tả:** Chứng từ vận chuyển. Master B/L do hãng tàu/hãng bay phát hành; House B/L do ERK phát hành cho từng KH (LCL). 1 Master B/L chứa nhiều House B/L.
**Owner system:** ERP
**Read-only systems:** CAPP (xem/tải chứng từ), SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-005.id | bl_id | UUID | ✅ | ID duy nhất | ERP, CAPP |
| ENT-005.bl_number | bl_number | VARCHAR(50) | ✅ | Số B/L / AWB | ERP, CAPP |
| ENT-005.bl_sub_type | bl_sub_type | ENUM | ✅ | FCL / LCL / MASTER_BL / HOUSE_BL / AWB / ROAD_BL | ERP [REF: ENUM-008] |
| ENT-005.parent_bl_id | parent_bl_id | UUID | ❌ | FK → ENT-005 (nếu là House B/L → trỏ về Master B/L) | ERP |
| ENT-005.carrier | carrier | VARCHAR(100) | ✅ | Hãng tàu/hãng bay/đối tác bộ | ERP |
| ENT-005.mode | mode | ENUM | ✅ | SEA / AIR / ROAD | ERP [REF: ENUM-002] |
| ENT-005.port_loading | port_loading | VARCHAR(100) | ✅ | Cảng/sân bay/điểm xếp hàng | ERP |
| ENT-005.port_discharge | port_discharge | VARCHAR(100) | ✅ | Cảng/sân bay/điểm dỡ hàng | ERP |
| ENT-005.etd | etd | DATE | ❌ | Ngày khởi hành dự kiến | ERP, CAPP |
| ENT-005.eta | eta | DATE | ❌ | Ngày đến dự kiến | ERP, CAPP |
| ENT-005.atd | atd | DATE | ❌ | Ngày khởi hành thực tế | ERP |
| ENT-005.ata | ata | DATE | ❌ | Ngày đến thực tế | ERP |
| ENT-005.is_telex_released | is_telex_released | BOOLEAN | ❌ | Đã điện giao hàng (Telex Release) | ERP |
| ENT-005.do_issued | do_issued | BOOLEAN | ❌ | Đã phát D/O (Delivery Order) | ERP |

---

### ENT-006: CustomsDeclaration (Tờ khai hải quan)

**Mô tả:** Tờ khai điện tử khai báo hàng hóa với hải quan qua VNACCS/VCIS. **Lưu trữ bắt buộc 5 năm** theo Luật Hải quan 2014 — không được xóa, chỉ archive.
**Owner system:** ERP
**Read-only systems:** SAPP, HSC

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-006.id | declaration_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-006.declaration_no | declaration_no | VARCHAR(30) | ✅ | Số tờ khai VNACCS | ERP, SAPP |
| ENT-006.declaration_type | declaration_type | VARCHAR(10) | ✅ | NK01a (nhập khẩu) / XK01 (xuất khẩu) | ERP |
| ENT-006.shipment_id | shipment_id | UUID | ✅ | FK → ENT-003 | ERP |
| ENT-006.submitted_at | submitted_at | TIMESTAMP | ❌ | Thời điểm nộp tờ khai | ERP |
| ENT-006.channel | channel | ENUM | ❌ | Luồng VNACCS sau khi submit | ERP [REF: ENUM-004] |
| ENT-006.exchange_rate_id | exchange_rate_id | UUID | ✅ | FK → ENT-013 (tỷ giá NHNN ngày khai — bắt buộc) | ERP |
| ENT-006.hs_code_list | hs_code_list | JSONB | ✅ | [{hs_code, description, quantity, value_usd, ...}] | ERP, HSC |
| ENT-006.co_id | co_id | UUID | ❌ | FK → ENT-008 (C/O nếu áp dụng ưu đãi) | ERP |
| ENT-006.import_duty | import_duty | DECIMAL(15,2) | ❌ | Thuế nhập khẩu (VNĐ) | ERP |
| ENT-006.vat_import | vat_import | DECIMAL(15,2) | ❌ | VAT hàng nhập khẩu (VNĐ) | ERP |
| ENT-006.excise_tax | excise_tax | DECIMAL(15,2) | ❌ | Thuế TTĐB (VNĐ) — nếu có | ERP |
| ENT-006.env_fee | env_fee | DECIMAL(15,2) | ❌ | Phí BVMT (VNĐ) — nếu có | ERP |
| ENT-006.total_tax | total_tax | DECIMAL(15,2) | ❌ | Tổng thuế + phí phải nộp (VNĐ) | ERP |
| ENT-006.status | status | ENUM | ✅ | DRAFT / SUBMITTED / CHANNEL_ASSIGNED / CLEARED / REJECTED | ERP |
| ENT-006.archived | archived | BOOLEAN | ✅ | Đã archive (không xóa — lưu 5 năm) | ERP |

---

### ENT-007: HSCodeMaster (Danh mục mã HS)

**Mô tả:** Danh mục HS Code quốc gia Việt Nam (8 chữ số), đồng bộ từ Tổng cục Hải quan. Gồm thuế suất MFN, ACFTA, điều kiện NK và lịch sử thay đổi. **Tri-lingual** VN/EN/ZH.
**Owner system:** HSC (master data), đồng bộ sang ERP
**Read-only systems:** ERP, CAPP (tra cứu công khai)

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-007.id | hs_code_id | UUID | ✅ | ID duy nhất | HSC, ERP |
| ENT-007.hs_code | hs_code | VARCHAR(10) | ✅ | Mã HS 8-10 chữ số | ALL |
| ENT-007.description_vi | description_vi | TEXT | ✅ | Mô tả tiếng Việt (theo biểu thuế chính thức) | HSC, ERP |
| ENT-007.description_en | description_en | TEXT | ✅ | Mô tả tiếng Anh | HSC, ERP |
| ENT-007.description_zh | description_zh | TEXT | ❌ | Mô tả tiếng Trung | HSC |
| ENT-007.mfn_rate | mfn_rate | DECIMAL(5,2) | ✅ | Thuế suất MFN (%) — áp dụng mặc định | HSC, ERP |
| ENT-007.acfta_rate | acfta_rate | DECIMAL(5,2) | ❌ | Thuế suất ACFTA (%) — TQ→VN, cần C/O Form E | HSC, ERP |
| ENT-007.atiga_rate | atiga_rate | DECIMAL(5,2) | ❌ | Thuế suất ATIGA (%) — Nội khối ASEAN | HSC |
| ENT-007.vat_rate | vat_rate | DECIMAL(5,2) | ✅ | Thuế VAT (%) — 0% / 5% / 10% | HSC, ERP |
| ENT-007.excise_rate | excise_rate | DECIMAL(5,2) | ❌ | Thuế TTĐB (%) nếu có | HSC |
| ENT-007.env_fee_rate | env_fee_rate | DECIMAL(10,2) | ❌ | Phí BVMT (VNĐ/đơn vị) nếu có | HSC |
| ENT-007.import_conditions | import_conditions | TEXT | ❌ | Điều kiện NK (giấy phép, kiểm dịch...) | HSC |
| ENT-007.required_permits | required_permits | JSONB | ❌ | Danh sách giấy phép bắt buộc | HSC |
| ENT-007.is_hazmat | is_hazmat | BOOLEAN | ✅ | Có phải hàng nguy hiểm không | HSC, ERP |
| ENT-007.is_restricted | is_restricted | BOOLEAN | ✅ | Hàng hạn chế nhập khẩu | HSC |
| ENT-007.is_prohibited | is_prohibited | BOOLEAN | ✅ | Hàng cấm nhập khẩu — block đơn tự động | HSC |
| ENT-007.effective_date | effective_date | DATE | ✅ | Ngày hiệu lực của phiên bản này | HSC |
| ENT-007.change_history | change_history | JSONB | ✅ | [{date, changed_field, old_value, new_value}] | HSC |

---

### ENT-008: CertificateOfOrigin (Giấy C/O)

**Mô tả:** Chứng nhận xuất xứ hàng hóa. C/O Form E (ACFTA) phổ biến nhất tuyến TQ→VN: giảm thuế NK 0-5%. **Workflow kiểm tra C/O hợp lệ bắt buộc** trước khi submit tờ khai VNACCS.
**Owner system:** ERP
**Read-only systems:** SAPP, HSC

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-008.id | co_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-008.co_number | co_number | VARCHAR(50) | ✅ | Số C/O | ERP, SAPP |
| ENT-008.form_type | form_type | ENUM | ✅ | Loại C/O | ERP [REF: ENUM-005] |
| ENT-008.shipment_id | shipment_id | UUID | ✅ | FK → ENT-003 | ERP |
| ENT-008.issued_by | issued_by | VARCHAR(200) | ✅ | Cơ quan cấp (VD: China Council for the Promotion of International Trade) | ERP |
| ENT-008.issued_date | issued_date | DATE | ✅ | Ngày cấp | ERP |
| ENT-008.expiry_date | expiry_date | DATE | ✅ | Ngày hết hạn — thường 12 tháng từ ngày cấp | ERP |
| ENT-008.origin_country | origin_country | VARCHAR(3) | ✅ | Nước xuất xứ (ISO 3166-1 alpha-3) | ERP |
| ENT-008.benefit_claimed | benefit_claimed | BOOLEAN | ✅ | Có áp dụng ưu đãi thuế không | ERP |
| ENT-008.is_valid | is_valid | BOOLEAN | ✅ | Tự động tính: issued_date ≤ hôm nay ≤ expiry_date | ERP |

---

### ENT-009: PricingConfig (Cấu hình giá 3 cấp)

**Mô tả:** Cơ chế định giá 3 cấp ưu tiên. Priority: **ORDER (1) > CUSTOMER (2) > GENERAL (3)**. Hệ thống tự động resolve giá đúng nhất cho mỗi Shipment. Bảng giá General phân theo Tuyến + Mode.
**Owner system:** ERP (Kinh doanh module)
**Read-only systems:** CAPP (hiển thị báo giá), SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-009.id | pricing_config_id | UUID | ✅ | ID duy nhất | ERP, CAPP |
| ENT-009.tier | tier | ENUM | ✅ | ORDER / CUSTOMER / GENERAL | ERP [REF: ENUM-011] |
| ENT-009.customer_id | customer_id | UUID | ❌ | FK → ENT-001 (null nếu tier=GENERAL) | ERP |
| ENT-009.shipment_id | shipment_id | UUID | ❌ | FK → ENT-003 (chỉ khi tier=ORDER) | ERP |
| ENT-009.route_code | route_code | VARCHAR(50) | ❌ | Mã tuyến (VD: CN-VN-SEA, CN-VN-ROAD, VN-CN-AIR) | ERP |
| ENT-009.mode | mode | ENUM | ❌ | SEA / AIR / ROAD | ERP [REF: ENUM-002] |
| ENT-009.cargo_type | cargo_type | ENUM | ❌ | Loại hàng (null = áp dụng tất cả) | ERP [REF: ENUM-003] |
| ENT-009.base_price | base_price | DECIMAL(15,2) | ✅ | Cước cơ bản | ERP |
| ENT-009.currency | currency | ENUM | ✅ | Đơn vị tiền tệ | ERP [REF: ENUM-010] |
| ENT-009.price_unit | price_unit | ENUM | ✅ | Đơn vị tính giá | ERP [REF: ENUM-014] |
| ENT-009.valid_from | valid_from | DATE | ✅ | Ngày hiệu lực | ERP |
| ENT-009.valid_to | valid_to | DATE | ❌ | Ngày hết hạn (null = không hết hạn) | ERP |
| ENT-009.surcharges | surcharges | JSONB | ❌ | [{surcharge_code, amount, currency}] | ERP |
| ENT-009.notes | notes | TEXT | ❌ | Ghi chú điều kiện áp dụng | ERP |
| ENT-009.created_by | created_by | UUID | ✅ | FK → ENT-002 (nhân viên KD tạo giá) | ERP |

---

### ENT-010: FreightRateCard (Bảng cước vận tải)

**Mô tả:** Bảng giá cước vận tải theo tuyến, carrier và thời gian hiệu lực. Là nền tảng cho General tier trong PricingConfig (ENT-009).
**Owner system:** ERP (Kinh doanh)
**Read-only systems:** SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-010.id | rate_card_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-010.carrier | carrier | VARCHAR(100) | ✅ | Hãng tàu/hãng bay/đối tác đường bộ | ERP |
| ENT-010.mode | mode | ENUM | ✅ | SEA / AIR / ROAD | ERP [REF: ENUM-002] |
| ENT-010.route_code | route_code | VARCHAR(50) | ✅ | Mã tuyến | ERP |
| ENT-010.port_origin | port_origin | VARCHAR(100) | ✅ | Cảng/sân bay/điểm đi | ERP |
| ENT-010.port_dest | port_dest | VARCHAR(100) | ✅ | Cảng/sân bay/điểm đến | ERP |
| ENT-010.bl_sub_type | bl_sub_type | ENUM | ❌ | FCL / LCL / AWB | ERP [REF: ENUM-008] |
| ENT-010.container_type | container_type | ENUM | ❌ | Loại container (nếu FCL) | ERP [REF: ENUM-006] |
| ENT-010.base_rate | base_rate | DECIMAL(15,2) | ✅ | Cước cơ bản | ERP |
| ENT-010.currency | currency | ENUM | ✅ | USD / VND / CNY | ERP [REF: ENUM-010] |
| ENT-010.surcharges_list | surcharges_list | JSONB | ❌ | Danh sách phụ phí carrier kèm theo | ERP |
| ENT-010.valid_from | valid_from | DATE | ✅ | Ngày hiệu lực | ERP |
| ENT-010.valid_to | valid_to | DATE | ✅ | Ngày hết hạn | ERP |

---

### ENT-011: CreditAccount (Tài khoản tín dụng)

**Mô tả:** Quản lý hạn mức tín dụng cho KH mua chịu. Kiểm soát **cả hai chiều**: (a) số tiền tối đa còn nợ (VNĐ) VÀ (b) số ngày thanh toán tối đa. Hệ thống tự động block khi vượt một trong hai giới hạn.
**Owner system:** ERP (Tài chính)
**Read-only systems:** CAPP (hiển thị công nợ của chính KH), SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-011.id | credit_account_id | UUID | ✅ | ID duy nhất | ERP, CAPP |
| ENT-011.customer_id | customer_id | UUID | ✅ | FK → ENT-001 | ERP, CAPP |
| ENT-011.credit_limit_amount | credit_limit_amount | DECIMAL(15,2) | ✅ | Hạn mức tiền tối đa (VNĐ) | ERP |
| ENT-011.credit_days | credit_days | INT | ✅ | Số ngày thanh toán tối đa (VD: 30) | ERP |
| ENT-011.current_balance | current_balance | DECIMAL(15,2) | ✅ | Số dư nợ hiện tại (VNĐ) — tự động cập nhật | ERP, CAPP |
| ENT-011.oldest_due_date | oldest_due_date | DATE | ❌ | Ngày đến hạn lâu nhất của invoice chưa thanh toán | ERP |
| ENT-011.status | status | ENUM | ✅ | ACTIVE / BLOCKED / SUSPENDED / CLOSED | ERP [REF: ENUM-012] |
| ENT-011.block_reason | block_reason | TEXT | ❌ | Lý do block (tự động: "Vượt hạn mức X" / thủ công) | ERP |
| ENT-011.approved_by | approved_by | UUID | ✅ | FK → ENT-002 (nhân viên Tài chính phê duyệt) | ERP |
| ENT-011.last_updated | last_updated | TIMESTAMP | ✅ | Cập nhật lần cuối | ERP |

---

### ENT-012: VehicleRegistry (Sổ theo dõi xe/tài xế đối tác)

**Mô tả:** Lưu thông tin xe và tài xế của **đối tác vận chuyển** (ERK không có xe riêng). Dùng để điền vào thủ tục cửa khẩu và khai hải quan đường bộ. Đây là **Vehicle Registry, không phải Fleet Management**.
**Owner system:** ERP (Điều phối)
**Read-only systems:** SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-012.id | vehicle_registry_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-012.plate_no | plate_no | VARCHAR(20) | ✅ | Biển số xe | ERP, SAPP |
| ENT-012.vehicle_type | vehicle_type | VARCHAR(50) | ✅ | Loại xe (VD: Đầu kéo, Xe tải 5T, Xe tải 15T) | ERP |
| ENT-012.vehicle_photo_url | vehicle_photo_url | VARCHAR(500) | ❌ | URL ảnh xe (lưu trên cloud storage) | ERP, SAPP |
| ENT-012.driver_name | driver_name | VARCHAR(100) | ✅ | Tên tài xế | ERP, SAPP |
| ENT-012.driver_id_no | driver_id_no | VARCHAR(20) | ✅ | CMND/CCCD tài xế | ERP |
| ENT-012.driver_photo_url | driver_photo_url | VARCHAR(500) | ❌ | URL ảnh tài xế | ERP, SAPP |
| ENT-012.driver_phone | driver_phone | VARCHAR(20) | ❌ | Số điện thoại tài xế | ERP, SAPP |
| ENT-012.partner_name | partner_name | VARCHAR(200) | ❌ | Tên công ty đối tác vận chuyển | ERP |
| ENT-012.is_active | is_active | BOOLEAN | ✅ | Đang hợp tác | ERP |
| ENT-012.notes | notes | TEXT | ❌ | Ghi chú | ERP |

---

### ENT-013: ExchangeRateHistory (Lịch sử tỷ giá NHNN)

**Mô tả:** Lưu lịch sử tỷ giá ngoại tệ do NHNN công bố mỗi ngày. **Nguồn duy nhất** cho toàn hệ thống khi tính thuế NK hoặc quy đổi tiền tệ. Đồng bộ tự động từ API NHNN lúc 8:00 AM.
**Owner system:** ERP (Tài chính — tự động sync)
**Read-only systems:** SAPP, CAPP, HSC

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-013.id | rate_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-013.rate_date | rate_date | DATE | ✅ | Ngày công bố | ALL |
| ENT-013.currency | currency | ENUM | ✅ | USD / CNY / EUR... | ALL [REF: ENUM-010] |
| ENT-013.buy_rate | buy_rate | DECIMAL(12,2) | ✅ | Tỷ giá mua vào (VNĐ) | ERP |
| ENT-013.sell_rate | sell_rate | DECIMAL(12,2) | ✅ | Tỷ giá bán ra (VNĐ) | ERP |
| ENT-013.transfer_rate | transfer_rate | DECIMAL(12,2) | ✅ | **Tỷ giá chuyển khoản — dùng để tính thuế NK** | ERP, HSC |
| ENT-013.source | source | VARCHAR(100) | ✅ | Nguồn: "NHNN_API" / "MANUAL" | ERP |

---

### ENT-014: ChinaWarehouseCost (Chi phí kho Trung Quốc)

**Mô tả:** Theo dõi nội bộ chi phí kho ERK tại TQ. **Không hạch toán chính thức** vào sổ VN. Hai thành phần: (1) Chi phí cố định = nhân sự TQ + thuê kho; (2) Chi phí biến đổi = CBM/ngày (linh hoạt khi cần tính phân bổ theo Shipment).
**Owner system:** ERP (Kho TQ / Tài chính)
**Read-only systems:** SAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-014.id | cost_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-014.cost_month | cost_month | DATE | ✅ | Tháng phát sinh (ngày đầu tháng — VD: 2026-03-01) | ERP |
| ENT-014.staff_cost_cny | staff_cost_cny | DECIMAL(12,2) | ❌ | Lương nhân sự kho TQ (CNY) | ERP |
| ENT-014.warehouse_rent_cny | warehouse_rent_cny | DECIMAL(12,2) | ❌ | Tiền thuê kho TQ (CNY) | ERP |
| ENT-014.other_cost_cny | other_cost_cny | DECIMAL(12,2) | ❌ | Chi phí phát sinh khác tại TQ (CNY) | ERP |
| ENT-014.cbm_rate_cny | cbm_rate_cny | DECIMAL(10,4) | ❌ | Đơn giá CBM/ngày (CNY) — dùng khi tính phân bổ | ERP |
| ENT-014.total_cbm_days | total_cbm_days | DECIMAL(12,3) | ❌ | Tổng CBM·ngày tích lũy trong tháng | ERP |
| ENT-014.total_cost_cny | total_cost_cny | DECIMAL(12,2) | ✅ | Tổng chi phí tháng (CNY) | ERP |
| ENT-014.exchange_rate_id | exchange_rate_id | UUID | ✅ | FK → ENT-013 (tỷ giá tháng để quy đổi) | ERP |
| ENT-014.total_cost_vnd | total_cost_vnd | DECIMAL(15,2) | ✅ | Quy đổi VNĐ để theo dõi nội bộ | ERP |
| ENT-014.notes | notes | TEXT | ❌ | Ghi chú | ERP |

---

### ENT-015: SurchargeConfig (Cấu hình phụ phí)

**Mô tả:** Định nghĩa các loại phụ phí hệ thống hỗ trợ. **Cấu hình linh hoạt** — admin có thể bật/tắt và thêm loại phụ phí mới mà không cần sửa code. Không hardcode danh sách phụ phí trong code.
**Owner system:** ERP (Admin / Tài chính)
**Read-only systems:** SAPP, CAPP

| Field code | Tên field | Type | Bắt buộc | Mô tả | Dùng bởi |
|-----------|---------|------|---------|-------|---------|
| ENT-015.id | surcharge_config_id | UUID | ✅ | ID duy nhất | ERP |
| ENT-015.surcharge_code | surcharge_code | VARCHAR(30) | ✅ | Mã phụ phí (VD: THC, BAF, DO_FEE) | ERP |
| ENT-015.name_vi | name_vi | VARCHAR(100) | ✅ | Tên tiếng Việt | ERP, SAPP, CAPP |
| ENT-015.name_en | name_en | VARCHAR(100) | ✅ | Tên tiếng Anh | ERP, SAPP, CAPP |
| ENT-015.name_zh | name_zh | VARCHAR(100) | ❌ | Tên tiếng Trung | ERP |
| ENT-015.category | category | ENUM | ✅ | Nhóm phụ phí (SEA/AIR/ROAD/CUSTOMS/SERVICE) | ERP [REF: ENUM-013] |
| ENT-015.applicable_modes | applicable_modes | JSONB | ✅ | Danh sách mode áp dụng: ["SEA", "AIR"...] | ERP |
| ENT-015.default_amount | default_amount | DECIMAL(12,2) | ❌ | Đơn giá mặc định | ERP |
| ENT-015.currency | currency | ENUM | ❌ | Đơn vị tiền (VD: USD, VND) | ERP [REF: ENUM-010] |
| ENT-015.amount_unit | amount_unit | ENUM | ❌ | Đơn vị tính (PER_CONT / PER_CBM / PER_SHIPMENT...) | ERP [REF: ENUM-014] |
| ENT-015.is_mandatory | is_mandatory | BOOLEAN | ✅ | Phụ phí bắt buộc (không thể bỏ) | ERP |
| ENT-015.is_active | is_active | BOOLEAN | ✅ | Đang kích hoạt | ERP |
| ENT-015.notes | notes | TEXT | ❌ | Hướng dẫn điều kiện áp dụng | ERP |

---

## 3. MASTER ENUMS (ENUM-XXX — Danh mục dùng chung)

<!-- Enum values được nhiều systems dùng chung.
     Code phải dùng đúng value này, không hardcode string.
     Format tham chiếu: [REF: ENUM-XXX] -->

---

### ENUM-001: ShipmentDirection (Chiều vận chuyển)

**Mô tả:** Chiều vận chuyển của Lô hàng
**Dùng bởi:** ERP, CAPP, SAPP, HSC

| Value | Nhãn (VI) | Nhãn (EN) | Nhãn (ZH) | Ghi chú |
|-------|----------|----------|----------|---------|
| IMPORT | Nhập khẩu | Import | 进口 | TQ → VN (chiều chính) |
| EXPORT | Xuất khẩu | Export | 出口 | VN → TQ (đã xác nhận có scope) |

---

### ENUM-002: TransportMode (Phương thức vận chuyển)

**Mô tả:** Phương thức vận chuyển chính của Lô hàng
**Dùng bởi:** ERP, CAPP, SAPP, HSC

| Value | Nhãn (VI) | Nhãn (EN) | Nhãn (ZH) | Ghi chú |
|-------|----------|----------|----------|---------|
| SEA | Đường biển | Sea Freight | 海运 | FCL hoặc LCL |
| AIR | Đường hàng không | Air Freight | 空运 | |
| ROAD | Đường bộ | Road Freight | 公路运输 | Xe tải qua cửa khẩu |
| MULTIMODAL | Đa phương thức | Multimodal | 多式联运 | Kết hợp 2+ modes |

---

### ENUM-003: CargoType (Loại hàng hóa)

**Mô tả:** Phân loại hàng theo tính chất. Ảnh hưởng quy trình xử lý, phụ phí và cảnh báo hệ thống.
**Dùng bởi:** ERP, SAPP, HSC (tự động cảnh báo)

| Value | Nhãn (VI) | Nhãn (EN) | Nhãn (ZH) | Ghi chú |
|-------|----------|----------|----------|---------|
| GEN | Hàng thường | General Cargo | 普通货物 | Không có yêu cầu đặc biệt |
| HAZMAT | Hàng nguy hiểm | Hazardous Materials | 危险品 | Tuân thủ IMDG/IATA DGR — cần HAZMAT Declaration |
| COLD | Hàng lạnh | Refrigerated Cargo | 冷藏货物 | Cần container/xe lạnh, temperature log |
| OOG | Hàng quá khổ | Out of Gauge | 超规格货物 | Quá kích thước container tiêu chuẩn, cần FR/OT |
| PERISHABLE | Hàng tươi sống | Perishable | 易腐货物 | Thực phẩm tươi, hoa tươi — SLA giao nhanh |
| VALUABLE | Hàng giá trị cao | Valuable Cargo | 贵重货物 | Cần bảo hiểm đặc biệt, quy trình xử lý riêng |

---

### ENUM-004: CustomsChannel (Luồng hải quan VNACCS)

**Mô tả:** Kết quả phân luồng của VNACCS sau khi submit tờ khai. Ký hiệu trong VNACCS: X / V / Đ.
**Dùng bởi:** ERP, SAPP

| Value | Ký hiệu VNACCS | Nhãn (VI) | Nhãn (EN) | Nhãn (ZH) | Ý nghĩa & SLA |
|-------|----------------|----------|----------|----------|--------------|
| GREEN | X | Luồng Xanh | Green Channel | 绿色通道 | Thông quan tự động — nhanh nhất |
| YELLOW | V | Luồng Vàng | Yellow Channel | 黄色通道 | Kiểm tra chứng từ — không kiểm thực tế |
| RED | Đ | Luồng Đỏ | Red Channel | 红色通道 | Kiểm tra thực tế hàng hóa — chậm nhất |
| PENDING | — | Chờ phân luồng | Pending | 等待分流 | Chưa có kết quả từ VNACCS |

---

### ENUM-005: COFormType (Loại C/O)

**Mô tả:** Loại Giấy chứng nhận xuất xứ theo FTA
**Dùng bởi:** ERP, SAPP

| Value | Nhãn | Hiệp định | Tuyến áp dụng chính | Lợi ích |
|-------|------|-----------|--------------------|---------| 
| FORM_E | Form E | ACFTA | TQ → ASEAN (chính yếu ERK) | Thuế NK 0-5% |
| FORM_D | Form D | ATIGA | Nội khối ASEAN | Thuế NK 0% |
| FORM_B | Form B | GSP | → Nước phát triển | Tùy nước |
| FORM_AI | Form AI | AIFTA | ASEAN ↔ Ấn Độ | Tùy |
| FORM_AK | Form AK | AKFTA | ASEAN ↔ Hàn Quốc | Tùy |
| FORM_AJ | Form AJ | AJCEP | ASEAN ↔ Nhật Bản | Tùy |
| FORM_S | Form S | VKFTA | VN ↔ Hàn Quốc | Tùy |
| FORM_VJ | Form VJ | VJEPA | VN ↔ Nhật Bản | Tùy |
| FORM_EUR1 | EUR.1 | EVFTA | VN ↔ EU | Tùy |
| NON_PREF | Non-Preferential | — | Chứng nhận xuất xứ không ưu đãi | Không có ưu đãi thuế |

---

### ENUM-006: ContainerType (Loại container)

**Mô tả:** Loại container vận chuyển đường biển
**Dùng bởi:** ERP, SAPP

| Value | Nhãn | Kích thước | Ghi chú |
|-------|------|-----------|---------|
| 20GP | 20' General Purpose | 20 feet dry | |
| 40GP | 40' General Purpose | 40 feet dry | |
| 40HC | 40' High Cube | 40 feet, cao hơn 30cm | Phổ biến nhất |
| 45HC | 45' High Cube | 45 feet cao | |
| 20RF | 20' Reefer | 20 feet lạnh | Hàng lạnh |
| 40RF | 40' Reefer | 40 feet lạnh | Hàng lạnh |
| 20OT | 20' Open Top | 20 feet không nóc | Hàng cao |
| 40OT | 40' Open Top | 40 feet không nóc | |
| 20FR | 20' Flat Rack | 20 feet sàn phẳng | Hàng quá khổ |
| 40FR | 40' Flat Rack | 40 feet sàn phẳng | |
| TANK | Tank Container | Đặc chủng | Hàng lỏng |

---

### ENUM-007: ShipmentStatus (Trạng thái lô hàng)

**Mô tả:** Vòng đời trạng thái từ khi tạo Lô hàng đến hoàn thành. Hiển thị trên CAPP (tracking) và SAPP.
**Dùng bởi:** ERP, CAPP, SAPP

| Value | Nhãn (VI) | Nhãn (EN) | Nhãn (ZH) | Giai đoạn |
|-------|----------|----------|----------|-----------|
| DRAFT | Nháp | Draft | 草稿 | Nhập thông tin |
| CONFIRMED | Đã xác nhận | Confirmed | 已确认 | KD xác nhận đơn, chờ hàng |
| CARGO_RECEIVED_CN | Hàng về kho TQ | Cargo at CN Warehouse | 货到中国仓库 | Kho TQ nhận hàng |
| IN_TRANSIT | Đang vận chuyển | In Transit | 运输中 | Trên đường về VN |
| ARRIVED | Đã cập cảng / biên giới | Arrived | 已到达 | Hàng đến cảng/CK VN |
| CUSTOMS_PROCESSING | Đang làm hải quan | Customs in Progress | 海关处理中 | VNACCS đang xử lý |
| CUSTOMS_CLEARED | Đã thông quan | Customs Cleared | 已清关 | Luồng Xanh/Vàng/Đỏ done |
| CARGO_RECEIVED_VN | Hàng về kho VN | Cargo at VN Warehouse | 货到越南仓库 | |
| OUT_FOR_DELIVERY | Đang giao | Out for Delivery | 配送中 | Đang giao last-mile |
| DELIVERED | Đã giao hàng | Delivered | 已交付 | Có POD |
| COMPLETED | Hoàn thành | Completed | 完成 | Đã thanh toán, lưu hồ sơ |
| ON_HOLD | Tạm giữ | On Hold | 暂停 | Sự cố / tranh chấp / công nợ |
| CANCELLED | Đã hủy | Cancelled | 已取消 | |

---

### ENUM-008: BLSubType (Phân loại vận đơn)

**Mô tả:** Phân loại vận đơn
**Dùng bởi:** ERP

| Value | Nhãn | Ghi chú |
|-------|------|---------|
| FCL | Full Container Load | Nguyên container — 1 B/L = 1 KH |
| LCL | Less than Container Load | Hàng lẻ, gom chung — 1 Master B/L → nhiều House B/L |
| MASTER_BL | Master B/L | Hãng tàu phát hành cho LCL |
| HOUSE_BL | House B/L | ERK (Forwarder) phát hành cho từng KH |
| AWB | Air Waybill | Vận đơn hàng không |
| ROAD_BL | Vận tải đơn đường bộ | |

---

### ENUM-009: Incoterms (Điều kiện thương mại)

**Mô tả:** Incoterms 2020 — ICC. Xác định điểm chuyển giao rủi ro và trách nhiệm chi phí.
**Dùng bởi:** ERP, SAPP

| Value | Tên đầy đủ | Nhãn (VI) | Phổ biến tuyến TQ-VN |
|-------|-----------|----------|---------------------|
| EXW | Ex Works | Giao tại kho người bán | ✅ Thường gặp (KH tự lo toàn bộ) |
| FCA | Free Carrier | Giao cho người chuyên chở | |
| FAS | Free Alongside Ship | Giao dọc mạn tàu | |
| FOB | Free On Board | Giao lên tàu | ✅ Phổ biến nhất |
| CFR | Cost and Freight | Tiền hàng + cước đến cảng đến | ✅ Thường gặp |
| CIF | Cost, Insurance, Freight | Tiền hàng + BH + cước | ✅ Phổ biến |
| CPT | Carriage Paid To | Cước trả đến điểm chỉ định | |
| CIP | Carriage and Insurance Paid | Cước + BH trả đến điểm | |
| DAP | Delivered at Place | Giao tại địa điểm đến | |
| DPU | Delivered at Place Unloaded | Giao tại nơi đến, đã dỡ | |
| DDP | Delivered Duty Paid | Giao tận nơi, người bán chịu thuế | ✅ Khách VIP, mua hàng hộ |

---

### ENUM-010: Currency (Đơn vị tiền tệ)

**Mô tả:** Các loại tiền tệ sử dụng trong ERK
**Dùng bởi:** ALL systems

| Value | Tên | Symbol | Ghi chú |
|-------|-----|--------|---------|
| VND | Việt Nam Đồng | ₫ | Tiền tệ chính, hiển thị mặc định |
| USD | US Dollar | $ | Cước biển, hàng không — phổ biến nhất |
| CNY | Renminbi (Nhân dân tệ) | ¥ | Chi phí kho TQ, nhà cung cấp TQ |
| EUR | Euro | € | Một số tuyến, hàng EU |

---

### ENUM-011: PricingTier (Cấp độ giá)

**Mô tả:** Cấp độ trong hệ thống Giá 3 cấp. Priority: ORDER > CUSTOMER > GENERAL.
**Dùng bởi:** ERP

| Value | Nhãn (VI) | Nhãn (EN) | Priority | Ghi chú |
|-------|----------|----------|----------|---------|
| ORDER | Giá riêng theo đơn | Order-specific | 1 (cao nhất) | Override tất cả — áp cho 1 Shipment cụ thể |
| CUSTOMER | Giá riêng theo khách | Customer-specific | 2 | Override General — áp cho 1 KH cụ thể |
| GENERAL | Bảng giá chung | General Rate | 3 (thấp nhất) | Theo Tuyến + Mode — áp cho tất cả KH |

---

### ENUM-012: CreditStatus (Trạng thái tín dụng)

**Mô tả:** Trạng thái tài khoản tín dụng của khách hàng
**Dùng bởi:** ERP, CAPP

| Value | Nhãn (VI) | Điều kiện tự động | Hành động hệ thống |
|-------|----------|------------------|------------------|
| ACTIVE | Đang hoạt động | current_balance < limit AND oldest_due < credit_days | Cho phép tạo đơn mới |
| BLOCKED | Bị block | current_balance ≥ limit OR oldest_due ≥ credit_days | Tự động block mọi đơn mới, cảnh báo KD |
| SUSPENDED | Tạm đình chỉ | Thủ công bởi Tài chính | Cần Tài chính phê duyệt để mở lại |
| CLOSED | Đóng | KH chuyển sang trả trước | |

---

### ENUM-013: SurchargeCategory (Nhóm phụ phí)

**Mô tả:** Phân nhóm phụ phí để cấu hình và lọc trong admin. Danh sách phụ phí phổ biến — không giới hạn, admin có thể thêm.
**Dùng bởi:** ERP, SAPP, CAPP

#### Nhóm SEA (Đường biển)

| Code | Tên (VI) | Tên (EN) | Đơn vị thường dùng |
|------|---------|---------|------------------|
| THC | Phí xếp dỡ cảng | Terminal Handling Charge | per CONT |
| BAF | Phụ phí nhiên liệu biển | Bunker Adjustment Factor | per CONT |
| CAF | Phụ phí tiền tệ | Currency Adjustment Factor | per CONT |
| PSS | Phụ phí mùa cao điểm | Peak Season Surcharge | per CONT |
| GRI | Tăng phí chung | General Rate Increase | per CONT |
| PCS | Phụ phí tắc nghẽn cảng | Port Congestion Surcharge | per CONT |
| WRS | Phụ phí rủi ro chiến tranh | War Risk Surcharge | per CONT |
| OWS | Phụ phí quá tải biển | Overweight Surcharge (Sea) | per CONT |
| OOS_SUR | Phụ phí hàng quá khổ | Out of Gauge Surcharge | per CONT |
| RFS | Phụ phí hàng lạnh | Reefer Surcharge | per CONT |
| HMS | Phụ phí hàng nguy hiểm | Hazmat Surcharge | per CONT |
| ISPS | Phụ phí an ninh cảng | ISPS Surcharge | per CONT |
| EIS | Phụ phí mất cân bằng thiết bị | Equipment Imbalance Surcharge | per CONT |
| DO_FEE | Phí lệnh giao hàng | Delivery Order Fee | per B/L |
| CFS_CHG | Phí kho CFS | CFS Charges | per CBM |
| VGM_FEE | Phí cân container | VGM Fee | per CONT |
| SEAL_FEE | Phí seal | Seal Fee | per CONT |
| BL_FEE | Phí vận đơn | Bill of Lading Fee | per B/L |
| TELEX | Phí điện giao hàng | Telex Release Fee | per B/L |
| BL_CORR | Phí sửa vận đơn | B/L Correction Fee | per lần |
| ORC | Phí nhận hàng đầu đi | Origin Receiving Charge | per CONT |
| DRC | Phí nhận hàng đầu đến | Destination Receiving Charge | per CONT |
| DEMURRAGE | Phí lưu container tại cảng | Demurrage | per CONT/ngày |
| DETENTION | Phí lưu container ngoài cảng | Detention | per CONT/ngày |

#### Nhóm AIR (Hàng không)

| Code | Tên (VI) | Tên (EN) | Đơn vị thường dùng |
|------|---------|---------|------------------|
| FSC_AIR | Phụ phí nhiên liệu HK | Fuel Surcharge (Air) | per KG |
| SSC_AIR | Phụ phí an ninh HK | Security Surcharge (Air) | per KG |
| AWB_FEE | Phí vận đơn HK | Air Waybill Fee | per AWB |
| XRAY | Phí soi chiếu | X-Ray Fee | per SHIPMENT |
| AIRPORT_HDL | Phí xử lý sân bay | Airport Handling Fee | per KG |

#### Nhóm ROAD (Đường bộ)

| Code | Tên (VI) | Tên (EN) | Đơn vị thường dùng |
|------|---------|---------|------------------|
| BORDER_FEE | Phí cửa khẩu | Border Crossing Fee | per xe/CONT |
| TRANSIT_FEE | Phí hành trình | Transit Fee | per xe |
| OW_ROAD | Phí quá tải đường bộ | Overweight Road Permit | per lần |
| ESCORT_FEE | Phí áp tải | Escort Fee | per chuyến |

#### Nhóm CUSTOMS (Hải quan)

| Code | Tên (VI) | Tên (EN) | Đơn vị thường dùng |
|------|---------|---------|------------------|
| CUSTOMS_DECL | Phí khai báo hải quan | Customs Declaration Fee | per tờ khai |
| CUSTOMS_EXAM | Phí kiểm hóa | Customs Examination Fee | per lần |
| PORT_STORAGE | Phí lưu bãi cảng | Port Storage Fee | per CONT/ngày |
| PHYTO | Phí kiểm dịch thực vật | Phytosanitary Fee | per lần |
| QUARANTINE | Phí kiểm dịch | Quarantine Fee | per lần |
| FUMIGATION | Phí hun trùng | Fumigation Fee | per lần |

#### Nhóm SERVICE (Dịch vụ ERK)

| Code | Tên (VI) | Tên (EN) | Đơn vị thường dùng |
|------|---------|---------|------------------|
| SERVICE_FEE | Phí dịch vụ | Service Fee | per SHIPMENT |
| CUSTOMS_AGENT | Phí đại lý hải quan | Customs Agent Fee | per tờ khai |
| DOC_FEE | Phí chứng từ | Document Fee | per B/L |
| WH_STORAGE | Phí lưu kho ERK | ERK Warehouse Storage | per CBM/ngày |
| INSURANCE | Phí bảo hiểm hàng hóa | Cargo Insurance | % trị giá |
| SOURCING | Phí mua hàng hộ | Sourcing Fee | % trị giá |
| QC_INSPECT | Phí kiểm định chất lượng | QC/Inspection Fee | per lần |
| LAST_MILE | Phí giao hàng nội địa | Last Mile Delivery | per điểm giao |
| COD | Phí thu hộ | Cash on Delivery Fee | % giá trị thu |

---

### ENUM-014: PriceUnit (Đơn vị tính giá)

**Mô tả:** Đơn vị áp dụng khi tính cước hoặc phụ phí
**Dùng bởi:** ERP

| Value | Nhãn (VI) | Nhãn (EN) | Ghi chú |
|-------|----------|----------|---------|
| PER_CONT | Per Container | Per Container | FCL |
| PER_CBM | Per CBM | Per CBM | LCL, kho |
| PER_KG | Per KG | Per KG | Hàng không |
| PER_SHIPMENT | Per Shipment | Per Shipment | Flat fee theo lô |
| PER_BL | Per B/L | Per B/L | Phí chứng từ |
| PER_DAY | Per Day | Per Day | Demurrage, detention, lưu kho |
| PER_DECLARATION | Per Declaration | Per Declaration | Phí hải quan |
| PERCENT | % Giá trị | % of Value | Bảo hiểm, sourcing, COD |

---

### ENUM-015: Language (Ngôn ngữ)

**Mô tả:** Ngôn ngữ hỗ trợ — **i18n bắt buộc cho toàn bộ 5 systems** (VN/EN/ZH)
**Dùng bởi:** ALL systems

| Value | Tên | Code ISO | Ghi chú |
|-------|-----|----------|---------|
| VI | Tiếng Việt | vi | Ngôn ngữ mặc định — giao diện và documents |
| EN | English | en | Giao tiếp quốc tế, chứng từ xuất khẩu, B/L |
| ZH | 中文 (Tiếng Trung) | zh | Kho TQ, nhân viên TQ, KH Trung Quốc |

> **Lưu ý i18n:** Không chỉ giao diện mà còn cả documents xuất ra: Hóa đơn (VN/EN), Vận đơn (EN), Thông báo kho TQ (ZH/EN), Báo giá (VN/EN/ZH tùy KH).

---

## 4. DATA OWNERSHIP (Nguồn dữ liệu chính)

| Entity | Owner System | Read-only Systems | Sync Method | Tần suất |
|--------|------------|------------------|------------|---------|
| Customer (ENT-001) | ERP | CAPP, SAPP, WEB | API realtime | On change |
| Employee (ENT-002) | ERP (HR) | SAPP | API | On change |
| Shipment (ENT-003) | ERP | CAPP (tracking), SAPP | API realtime | On change |
| TransportUnit (ENT-004) | ERP | SAPP | API | On change |
| BillOfLading (ENT-005) | ERP | CAPP (chứng từ), SAPP | API | On change |
| CustomsDeclaration (ENT-006) | ERP | SAPP, HSC | API | On change |
| HSCodeMaster (ENT-007) | HSC | ERP | API + Batch | Daily + Manual trigger |
| CertificateOfOrigin (ENT-008) | ERP | SAPP | API | On change |
| PricingConfig (ENT-009) | ERP | CAPP (báo giá), SAPP | API | On change |
| FreightRateCard (ENT-010) | ERP | SAPP | API | On change |
| CreditAccount (ENT-011) | ERP (Finance) | CAPP (công nợ KH) | API realtime | On transaction |
| VehicleRegistry (ENT-012) | ERP (Điều phối) | SAPP | API | On change |
| ExchangeRateHistory (ENT-013) | ERP (auto sync NHNN) | ALL | Auto NHNN API | Daily 08:00 AM |
| ChinaWarehouseCost (ENT-014) | ERP (Kho TQ) | — | Manual entry | Monthly |
| SurchargeConfig (ENT-015) | ERP (Admin) | SAPP, CAPP | API | On change |

---

## 5. NAMING CONVENTIONS

<!-- AI phải tuân thủ convention này khi tạo code -->

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Database table | snake_case, plural | `shipments`, `hs_code_masters`, `credit_accounts` |
| API endpoint | kebab-case, REST | `/api/v1/shipments/{id}`, `/api/v1/hs-codes/{code}` |
| Variable/field | camelCase | `shipmentId`, `hsCode`, `creditLimitAmount` |
| Enum value | UPPER_SNAKE_CASE | `CARGO_TYPE_HAZMAT`, `CUSTOMS_CHANNEL_GREEN` |
| File/folder | kebab-case | `shipment.service.ts`, `hs-code.repository.ts` |
| i18n key | dot.notation | `shipment.status.in_transit`, `surcharge.THC.name_vi` |
| MCV3 ID tham chiếu | [REF: ENT-XXX.field] | `[REF: ENT-003.master_no]`, `[REF: ENUM-004]` |
| Số lô hàng ERK | ERK-YYYY-NNNNN | `ERK-2026-00123` |
| Mã khách hàng | KH-NNNNN | `KH-00001` |
| Mã nhân viên | NV-NNNNN | `NV-00001` |

---

## 6. ARCHIVAL POLICY (Chính sách lưu trữ)

| Loại dữ liệu | Thời gian lưu | Căn cứ pháp lý | Ghi chú |
|-------------|--------------|----------------|---------|
| Tờ khai hải quan (ENT-006) | **5 năm** | Luật Hải quan 2014, Điều 18 | Không xóa — chỉ archive flag |
| Chứng từ vận chuyển (B/L, AWB, C/O) | **5 năm** | Luật Thương mại 2005 | |
| Hóa đơn điện tử | **10 năm** | NĐ 123/2020 | |
| Lịch sử tỷ giá (ENT-013) | **5 năm** | Phục vụ kiểm tra thuế hồi tố | |
| Giao dịch tài chính | **10 năm** | Luật Kế toán 2015 | |
| Dữ liệu cá nhân KH | **5 năm** sau kết thúc HĐ | NĐ 13/2023 (PDPA VN) | Có thể xóa theo yêu cầu KH |
| Lịch sử HS Code (ENT-007) | **Vĩnh viễn** | Tra cứu lịch sử compliance | Append-only, không sửa |
