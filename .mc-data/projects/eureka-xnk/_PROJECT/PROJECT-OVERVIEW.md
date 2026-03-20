# PROJECT-OVERVIEW
<!-- ============================================================
     TỔNG QUAN DỰ ÁN — Gộp: Charter + Scope + Stakeholders + User Journey
     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  Discovery session (Phase 1)
       Output: Tất cả tài liệu khác đều tham chiếu đến đây
       Key IDs: PROB-XXX, BG-XXX, PG-XXX, SC-XXX, ST-XXX, CON-XXX
       Update: Bởi /mcv3:discovery skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu cấp dự án (Project-level)
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0
> **Người tạo:** MCV3 Discovery Agent

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước: (không có — đây là tài liệu gốc)

### Tài liệu được sinh từ file này:
- [OUTPUT → _PROJECT/EXPERT-LOG.md] — Phân tích chuyên gia
- [OUTPUT → _PROJECT/DATA-DICTIONARY.md] — Thuật ngữ & entities
- [OUTPUT → _PROJECT/BIZ-POLICY/*.md] — Chính sách nghiệp vụ
- [OUTPUT → ERP/P1-REQUIREMENTS/URS-*.md] — ERP Requirements
- [OUTPUT → WEB/P1-REQUIREMENTS/URS-*.md] — Website Requirements
- [OUTPUT → CAPP/P1-REQUIREMENTS/URS-*.md] — Customer App Requirements
- [OUTPUT → SAPP/P1-REQUIREMENTS/URS-*.md] — Staff App Requirements
- [OUTPUT → HSC/P1-REQUIREMENTS/URS-*.md] — HS Code Web App Requirements

### Key Facts (cho Layer 0 Cache):
- **Project slug:** eureka-xnk
- **Main domain:** Logistics / Xuất nhập khẩu
- **Systems:** WEB, CAPP, SAPP, HSC, ERP
- **Primary problem:** [REF: PROB-001] ERP cũ cồng kềnh, chắp vá, khó bảo trì và mở rộng
- **Tổng stakeholders:** 9 nhóm (8 phòng ban nội bộ + khách hàng)

---

## 1. THÔNG TIN DỰ ÁN

| Mục | Nội dung |
|-----|---------|
| **Tên dự án** | Hệ thống số toàn diện Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka |
| **Mã dự án** | EUREKA-XNK |
| **Khách hàng / Doanh nghiệp** | Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka (ERK Transport) |
| **Website hiện tại** | https://erktransport.com |
| **Lĩnh vực kinh doanh** | Logistics / Xuất nhập khẩu / Freight Forwarding |
| **Thị trường trọng tâm** | Hành lang thương mại Trung Quốc – Việt Nam |
| **Ngày bắt đầu** | 2026-03-19 |
| **Ngày dự kiến hoàn thành** | Không có deadline cứng — Quality-first |
| **Phương thức phát triển** | AI-driven development (song song 5 hệ thống) |
| **Ngân sách dự kiến** | TBD |

---

## 2. BỐI CẢNH DOANH NGHIỆP

### 2.1. Bối cảnh kinh doanh

**BG-BUS-001: Công ty vận tải và logistics quốc tế chuyên tuyến Trung Quốc – Việt Nam**

Công ty TNHH Xuất nhập khẩu và Thương Mại Eureka (thương hiệu ERK Transport) là doanh nghiệp logistics đầy đủ dịch vụ (Full-service 3PL) hoạt động 6 năm trên tuyến thương mại Trung Quốc – Việt Nam với quy mô:
- **50+ nhân viên** chuyên nghiệp
- **10.000+ khách hàng** toàn quốc
- **20.000+ lô hàng** đã xử lý thành công
- **Hệ thống kho** tại cả Trung Quốc và Việt Nam

**Dịch vụ cốt lõi:** Vận tải biển, hàng không, đường bộ xuyên biên giới; khai báo hải quan; quản lý chuỗi cung ứng; kho bãi; thu mua & sourcing tại Trung Quốc; kiểm định hàng hóa; tra cứu HS Code.

**BG-BUS-002: Kho hoạt động xuyên quốc gia**

Công ty vận hành kho tại cả **Trung Quốc** (tiếp nhận hàng từ nhà cung cấp) và **Việt Nam** (phân phối đến khách hàng nội địa), tạo ra yêu cầu quản lý kho đa quốc gia, đa múi giờ.

### 2.2. Bối cảnh kỹ thuật hiện tại

**BG-TECH-001: VNACCS/VCIS — Hệ thống khai báo hải quan**

Công ty đang sử dụng VNACCS (Vietnam Automated Cargo Clearance System) để khai báo hải quan. Hệ thống này là bắt buộc theo quy định pháp luật và cần được tích hợp vào ERP mới.

**BG-TECH-002: MISA — Phần mềm kế toán**

Công ty đang sử dụng MISA cho kế toán và quản lý tài chính. ERP mới cần tích hợp hoặc thay thế dần dần, không phá vỡ quy trình kế toán hiện tại.

**BG-TECH-003: ERP cũ — Hệ thống legacy cần thay thế**

ERP hiện tại được phát triển nội bộ từ trước, có các vấn đề nghiêm trọng về kỹ thuật: cồng kềnh, chắp vá, thiếu kiến trúc bài bản, khó bảo trì, khó mở rộng. Quyết định rebuild hoàn toàn thay vì nâng cấp.

---

## 3. VẤN ĐỀ CẦN GIẢI QUYẾT

### PROB-001: ERP cũ cồng kềnh, không mở rộng được

**Hiện trạng:** ERP nội bộ hiện tại được xây dựng chắp vá qua nhiều năm, thiếu kiến trúc bài bản. Codebase khó đọc, khó maintain, không có khả năng scale.

**Tác động:** Mỗi khi cần thêm tính năng phải tốn nhiều thời gian và dễ gây lỗi cascade. Không thể hỗ trợ tăng trưởng nghiệp vụ.

**Mức độ:** Critical

---

### PROB-002: Thiếu kênh số trực tiếp với khách hàng

**Hiện trạng:** Không có Mobile App cho khách hàng. Khách hàng phải liên lạc qua điện thoại/Zalo cá nhân để đặt hàng, hỏi tình trạng lô hàng, kiểm tra công nợ.

**Tác động:** Trải nghiệm khách hàng kém, nhân viên CSKH tốn nhiều thời gian xử lý thủ công, không có kênh marketing trực tiếp đến 10.000+ khách hàng.

**Mức độ:** High

---

### PROB-003: Nhân viên không có công cụ di động

**Hiện trạng:** Toàn bộ 8 phòng ban phải dùng máy tính để thao tác ERP. Không có Staff App mobile. Nhân viên kho, điều phối, kinh doanh di chuyển nhiều không thể cập nhật dữ liệu real-time.

**Tác động:** Dữ liệu chậm trễ, thiếu chính xác, giảm hiệu suất nhân viên.

**Mức độ:** High

---

### PROB-004: Thiếu hệ thống tra cứu HS Code & cảnh báo compliance tích hợp

**Hiện trạng:** Nhân viên phải tra cứu HS Code thủ công từ nhiều nguồn khác nhau. Không có công cụ tích hợp cảnh báo chính sách, thuế suất, quy định cho từng mã hàng trong quá trình xử lý đơn.

**Tác động:** Sai HS Code dẫn đến chậm thông quan, phạt hải quan, bồi thường khách hàng.

**Mức độ:** High

---

### PROB-005: Các hệ thống rời rạc, dữ liệu không đồng bộ

**Hiện trạng:** ERP cũ, MISA, VNACCS, tracking hãng tàu chạy độc lập. Nhân viên phải nhập liệu trùng lặp nhiều lần vào các hệ thống khác nhau.

**Tác động:** Dữ liệu không nhất quán, tốn thời gian đối chiếu, dễ sai sót.

**Mức độ:** High

---

### PROB-006: Không có nền tảng marketing số trực tiếp đến khách hàng

**Hiện trạng:** Công ty không có kênh push notification/broadcast trực tiếp để thông báo chính sách mới, chương trình khuyến mãi, cảnh báo cước phí đến khách hàng.

**Tác động:** Thông tin không đến kịp thời, khách hàng thiếu cập nhật, giảm tương tác và retention.

**Mức độ:** Medium

---

## 4. MỤC TIÊU DỰ ÁN

### 4.1. Mục tiêu kinh doanh (Business Goals)

| Mã | Mục tiêu | Chỉ số đo lường | Giá trị mục tiêu |
|----|---------|-----------------|-----------------|
| BG-001 | Xây dựng nền tảng số đồng bộ toàn diện | 5 hệ thống hoạt động tích hợp | 100% modules live |
| BG-002 | Tăng trải nghiệm và self-service cho khách hàng | % khách hàng dùng app | > 60% trong 6 tháng sau go-live |
| BG-003 | Nâng cao hiệu suất vận hành nội bộ | Thời gian xử lý đơn hàng | Giảm ≥ 30% so với hiện tại |
| BG-004 | Đảm bảo compliance hải quan tự động | % lỗi HS Code | < 1% sau khi tích hợp |
| BG-005 | Tạo kênh marketing trực tiếp đến 10.000+ khách hàng | Reach rate thông báo | > 80% qua push notification |

### 4.2. Mục tiêu dự án (Project Goals)

| Mã | Mục tiêu | Tiêu chí thành công | Deadline |
|----|---------|---------------------|---------|
| PG-001 | Xây dựng và triển khai 5 hệ thống song song | Cả 5 hệ thống go-live | Quality-first, không deadline cứng |
| PG-002 | Hệ thống hoạt động chính xác và ổn định | Zero critical bugs, 99.9% uptime | Trước go-live |
| PG-003 | Tích hợp đầy đủ MISA, VNACCS và các hệ thống liên quan | Dữ liệu đồng bộ 2 chiều | Trước go-live |
| PG-004 | Kiến trúc bài bản, dễ bảo trì và mở rộng | Code coverage ≥ 80%, docs đầy đủ | Ongoing |

---

## 5. PHẠM VI DỰ ÁN

### 5.1. Trong phạm vi (In Scope)

**Hệ thống 1 — WEB: Website trang chủ**
- SC-IN-001: Trang giới thiệu công ty, dịch vụ, đội ngũ
- SC-IN-002: Landing pages cho từng dịch vụ (sea/air/road/kho/hải quan/sourcing)
- SC-IN-003: Form liên hệ, yêu cầu báo giá
- SC-IN-004: Tích hợp SEO, Analytics

**Hệ thống 2 — CAPP: Customer Mobile App**
- SC-IN-005: Đặt đơn / yêu cầu dịch vụ
- SC-IN-006: Tra cứu & theo dõi lô hàng (tracking real-time)
- SC-IN-007: Thanh toán online (VNPay, MoMo, chuyển khoản)
- SC-IN-008: Xem lịch sử giao dịch, tài chính, công nợ
- SC-IN-009: Chat trực tiếp với nhân viên hỗ trợ
- SC-IN-010: Nhận thông báo push (chính sách mới, trạng thái lô hàng, khuyến mãi)

**Hệ thống 3 — SAPP: Staff Mobile App (ERP Mobile)**
- SC-IN-011: Toàn bộ tính năng ERP trên giao diện mobile
- SC-IN-012: Phục vụ tất cả 8 phòng ban
- SC-IN-013: Thông báo real-time cho nhân viên
- SC-IN-014: Chat nội bộ giữa các phòng ban

**Hệ thống 4 — HSC: Web App tra cứu HS Code & chính sách hàng hóa**
- SC-IN-015: Tra cứu HS Code theo tên/mô tả hàng hóa
- SC-IN-016: Tra cứu thuế nhập khẩu, VAT, phí theo mã HS (Việt Nam)
- SC-IN-017: Lịch sử thay đổi chính sách theo mã HS
- SC-IN-018: Tích hợp vào ERP — tự động gợi ý HS Code khi khai báo
- SC-IN-019: Tự động cảnh báo compliance trong workflow (Kinh doanh → Chứng từ → Hải quan)
- SC-IN-020: Trang tra cứu công khai cho nhân viên và khách hàng

**Hệ thống 5 — ERP: Hệ thống quản trị doanh nghiệp**
- SC-IN-021: Module Kinh doanh & CSKH (CRM, báo giá, hợp đồng, đơn hàng)
- SC-IN-022: Module Marketing (chiến dịch, nội dung, phân tích)
- SC-IN-023: Module Tài chính & Kế toán (thu chi, công nợ, báo cáo tài chính)
- SC-IN-024: Module Nhân sự (hồ sơ, chấm công, lương, KPI)
- SC-IN-025: Module IT (quản trị user, phân quyền, hệ thống)
- SC-IN-026: Module Kho Việt Nam (nhập/xuất kho, kiểm kê, vị trí)
- SC-IN-027: Module Kho Trung Quốc (nhập/xuất kho, đồng bộ xuyên biên giới)
- SC-IN-028: Module Điều phối (lên lịch vận chuyển, phân công tài xế/nhân viên)
- SC-IN-029: Module BOD (dashboard tổng hợp, báo cáo cấp cao, KPI công ty)

**Tích hợp**
- SC-IN-030: Tích hợp MISA (kế toán — đồng bộ 2 chiều)
- SC-IN-031: Tích hợp VNACCS/VCIS (khai báo hải quan)
- SC-IN-032: Tích hợp cổng thanh toán (VNPay, MoMo, Internet Banking)
- SC-IN-033: Tích hợp API tracking hãng tàu (COSCO, Evergreen, OOCL và các hãng tàu khác)
- SC-IN-034: Tích hợp API tracking hàng không
- SC-IN-035: Tích hợp Zalo OA (thông báo, chat)
- SC-IN-036: Tích hợp Email & SMS gateway
- SC-IN-037: Tích hợp WeChat/WeCom (giao tiếp với kho Trung Quốc)
- SC-IN-038: Tích hợp dữ liệu HS Code từ Tổng cục Hải quan Việt Nam

### 5.2. Ngoài phạm vi (Out of Scope)

- SC-OUT-001: Phát triển mới phần mềm kế toán độc lập (dùng MISA hiện có, chỉ tích hợp)
- SC-OUT-002: Phát triển hệ thống hải quan mới (dùng VNACCS hiện có, chỉ tích hợp)
- SC-OUT-003: Ứng dụng dành cho tài xế/đối tác vận chuyển bên ngoài (nếu có sẽ là Phase 2 evolution)
- SC-OUT-004: Marketplace mua bán hàng hóa (chỉ là logistics platform)

---

## 6. STAKEHOLDERS

| Mã | Vai trò | Bộ phận/Đối tượng | Trách nhiệm | Mức độ ảnh hưởng |
|----|---------|-------------------|------------|-----------------|
| ST-001 | Project Sponsor / BOD | Ban Giám đốc | Phê duyệt định hướng, quyết định chiến lược | Critical |
| ST-002 | Nhân viên Kinh doanh & CSKH | Phòng Kinh doanh & CSKH | Dùng ERP/SAPP hàng ngày, tiếp nhận & xử lý đơn hàng | High |
| ST-003 | Nhân viên Marketing | Phòng Marketing | Quản lý chiến dịch, nội dung, push notification qua CAPP | High |
| ST-004 | Nhân viên Tài chính & Kế toán | Phòng Tài chính & Kế toán | Quản lý thu chi, đối soát MISA, báo cáo tài chính | High |
| ST-005 | Nhân viên Nhân sự | Phòng Nhân sự | Quản lý hồ sơ, chấm công, lương | Medium |
| ST-006 | Nhân viên IT | Phòng IT | Quản trị hệ thống, phân quyền, giám sát | High |
| ST-007 | Nhân viên Kho | Kho VN & Kho TQ | Nhập/xuất kho, kiểm kê, đồng bộ xuyên biên giới | High |
| ST-008 | Nhân viên Điều phối | Bộ phận Điều phối | Lên lịch, phân công vận chuyển, theo dõi lộ trình | High |
| ST-009 | Khách hàng | 10.000+ khách hàng toàn quốc | Đặt hàng, tracking, thanh toán, trao đổi qua CAPP | High |

---

## 7. USER JOURNEY MAP

### UJ-001: Khách hàng đặt lô hàng và theo dõi (qua Customer App)

```
[Mở App] → [Tạo yêu cầu vận chuyển] → [Nhận báo giá] → [Xác nhận & thanh toán]
(ST-009)     (CAPP — form thông tin)    (Nhân viên KD)   (CAPP — cổng thanh toán)
     ↓
[Nhân viên KD xử lý đơn] → [Kho TQ tiếp nhận hàng] → [Vận chuyển + khai báo HQ]
(ERP — Module KD)           (ERP — Module Kho TQ)      (ERP + VNACCS)
     ↓
[Tracking real-time trên App] → [Hàng về kho VN] → [Giao hàng] → [Xác nhận hoàn thành]
(CAPP — tracking)               (ERP — Kho VN)    (Điều phối)   (CAPP — notification)
```

**Pain points hiện tại:**
- PAIN-CAPP-001: Khách hàng không có kênh số — phải gọi điện/nhắn Zalo cá nhân
- PAIN-CAPP-002: Không có tracking real-time cho khách hàng
- PAIN-CAPP-003: Không có kênh thanh toán online

---

### UJ-002: Nhân viên xử lý đơn hàng nội bộ

```
[Nhận yêu cầu KH] → [Báo giá] → [Tạo đơn hàng trên ERP] → [Kiểm tra HS Code]
(ERP — KD/CSKH)    (ERP)        (ERP)                       (HSC — cảnh báo tự động)
     ↓
[Điều phối kho TQ nhận hàng] → [Làm chứng từ] → [Khai báo hải quan]
(ERP — Điều phối + Kho TQ)     (ERP — Chứng từ) (ERP → VNACCS tích hợp)
     ↓
[Theo dõi lộ trình] → [Kho VN nhận hàng] → [Giao cuối dặm] → [Cập nhật tài chính]
(ERP + API hãng tàu)  (ERP — Kho VN)        (ERP — Điều phối)  (ERP → MISA)
```

**Pain points hiện tại:**
- PAIN-ERP-001: Nhập liệu trùng lặp vào ERP, MISA, VNACCS
- PAIN-ERP-002: Nhân viên không có Staff App — phải dùng PC
- PAIN-ERP-003: Không có cảnh báo HS Code tự động

---

### UJ-003: Nhân viên tra cứu & khai báo HS Code

```
[Nhận thông tin hàng hóa] → [Tra cứu HS Code] → [Kiểm tra thuế suất & chính sách]
(Nhân viên chứng từ)         (HSC — tra cứu)     (HSC — thuế NK, VAT, hạn chế)
     ↓
[Cảnh báo tự động nếu có vấn đề] → [Xác nhận mã HS] → [Khai báo VNACCS]
(HSC — compliance engine)           (Nhân viên)         (ERP → VNACCS)
```

**Pain points hiện tại:**
- PAIN-HSC-001: Tra cứu HS Code thủ công từ nhiều nguồn
- PAIN-HSC-002: Không biết chính sách/thuế thay đổi kịp thời

---

## 8. PHÂN TÍCH HỆ THỐNG (SYSTEMS)

| System | Mã | Mô tả | Người dùng chính | Tech Stack | Ưu tiên |
|--------|-----|-------|-----------------|-----------|---------|
| Website trang chủ | WEB | Giới thiệu dịch vụ, SEO, lead generation | Khách hàng tiềm năng, công chúng | TBD (Phase 5) | P1 |
| Customer Mobile App | CAPP | Super-app cho khách hàng: đặt hàng, tracking, tài chính, chat, marketing | ST-009 (10.000+ khách hàng) | TBD (Phase 5) | P0 |
| Staff Mobile App | SAPP | ERP mobile — toàn bộ chức năng ERP trên điện thoại | ST-002 đến ST-008 (50+ nhân viên) | TBD (Phase 5) | P0 |
| HS Code Web App | HSC | Tra cứu HS Code + compliance engine tích hợp ERP | Nhân viên + Khách hàng | TBD (Phase 5) | P1 |
| ERP | ERP | Quản trị toàn diện: KD, Marketing, Tài chính, HR, Kho, Điều phối, BOD | Toàn bộ 8 phòng ban | TBD (Phase 5) | P0 |

---

## 9. RÀNG BUỘC & RỦI RO

### 9.1. Ràng buộc (Constraints)

| Mã | Ràng buộc | Tác động |
|----|----------|---------|
| CON-001 | Quality-first — không có deadline cứng | Có thể take time để làm đúng, không rush |
| CON-002 | Phát triển do AI đảm nhận | Cần specs chi tiết, rõ ràng để AI generate chính xác |
| CON-003 | Phát triển song song 5 hệ thống | Yêu cầu kiến trúc API-first, shared data model ngay từ đầu |
| CON-004 | Phải tích hợp MISA và VNACCS hiện có | Cần nghiên cứu API/SDK của MISA và VNACCS |
| CON-005 | Kho hoạt động ở 2 quốc gia (VN & TQ) | Multi-timezone, có thể cần multi-language (VN/CN) |
| CON-006 | Compliance hải quan Việt Nam (Nghị định về VNACCS, HS Code) | Cần legal review cho HSC system |

### 9.2. Rủi ro nhận diện ban đầu

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|--------|---------|---------|-----------|
| API MISA/VNACCS hạn chế hoặc không đầy đủ | Medium | High | Nghiên cứu sớm ở Phase 2, có fallback manual |
| Scope ERP quá lớn — mỗi phòng ban cần phân tích sâu | High | High | Phân tích từng module riêng ở Phase 4 |
| Dữ liệu kho Trung Quốc — latency, connectivity | Medium | Medium | Thiết kế offline-first + sync mechanism |
| HS Code database cần cập nhật liên tục theo Tổng cục Hải quan | High | High | Xây dựng cơ chế sync tự động với nguồn chính thức |

---

## 10. TIMELINE & MILESTONES

| Milestone | Ngày dự kiến | Mô tả |
|-----------|-------------|-------|
| Kick-off / Discovery Done | 2026-03-19 | PROJECT-OVERVIEW.md hoàn thành |
| Expert Panel (Phase 2) | TBD | Phân tích chuyên sâu từng nghiệp vụ |
| Business Docs (Phase 3) | TBD | BIZ-POLICY, PROCESS, DATA-DICTIONARY |
| Requirements (Phase 4) | TBD | URS đầy đủ cho 5 systems |
| Tech Design (Phase 5) | TBD | MODSPEC, API, DB Schema |
| QA & Docs (Phase 6) | TBD | Test cases, User Guide |
| Code Gen (Phase 7) | TBD | Code scaffolding |
| Verify & Deploy (Phase 8) | TBD | Go-Live — Quality-first |

> **Lưu ý:** Toàn bộ timeline do AI điều phối. Không có deadline cứng. Ưu tiên chất lượng và tính chính xác của hệ thống.
