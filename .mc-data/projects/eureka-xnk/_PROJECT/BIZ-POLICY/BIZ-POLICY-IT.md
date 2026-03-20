# BIZ-POLICY: IT (Chính sách Công nghệ thông tin & Triển khai)
<!-- ============================================================
     CHÍNH SÁCH NGHIỆP VỤ — Lĩnh vực IT / Kiến trúc / Triển khai
     Bao phủ: Phase sequencing, Tích hợp VNACCS/MISA, Data migration,
     Security, Data governance, Archive policy

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  EXPERT-LOG.md → SESSION-001 (Strategy + Finance + Domain)
               PROJECT-OVERVIEW.md → CON-001..006
       Key IDs: BR-IT-001..049
         001-009: Validation   010-019: Calculation/Architecture
         020-029: Workflow     030-039: Authorization
         040-049: Constraints
       Output: URS tất cả systems, MODSPEC tất cả systems
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu đầu bài (Business Input)
> **Lĩnh vực:** IT / Kiến trúc hệ thống / Triển khai
> **Áp dụng cho systems:** ERP, CAPP, SAPP, HSC, WEB (toàn bộ 5 systems)
> **Nguồn thông tin:** EXPERT-LOG → SESSION-001 (Strategy Expert + Finance Expert + Domain Expert + BOD Resolution)
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md → CON-001..006] — Constraints & risks
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-001] — Consensus + Resolution
- [REF: _PROJECT/DATA-DICTIONARY.md] — ENT-013 (tỷ giá), ENT-007 (HS Code)

### Tài liệu tham chiếu file này:
- [REF: ERP/P2-DESIGN/MODSPEC-*.md → Section ADR] — Architecture Decision Records
- [REF: HSC/P2-DESIGN/MODSPEC-HSC.md] — HSC architecture decisions
- Tất cả MODSPEC (NFR sections): performance, security, integrations

---

## 1. TỔNG QUAN LĨNH VỰC

**Mô tả:** Chính sách IT định hướng kiến trúc, thứ tự triển khai, tích hợp hệ thống bên ngoài (MISA, VNACCS, WeCom), quản trị dữ liệu, bảo mật và vận hành cho toàn bộ 5 systems của ERK. Đây là "luật cơ bản" mà mọi quyết định kỹ thuật phải tham chiếu.

**Bộ phận liên quan:** Phòng IT (triển khai + vận hành), BOD (phê duyệt chiến lược), tất cả phòng ban (end-users)

**Người chịu trách nhiệm:** Trưởng phòng IT / CTO

---

## 2. BUSINESS RULES

---

### 2.1. Quy tắc kiến trúc & tích hợp — Architecture Rules (BR-IT-001..009)

| Mã | Quy tắc | Điều kiện | Chi tiết | Ưu tiên |
|----|---------|----------|---------|---------|
| BR-IT-001 | **API-first, shared data model từ đầu** | Toàn bộ 5 systems | Mọi giao tiếp giữa systems phải qua API (REST hoặc event). Không cho phép truy cập trực tiếp database của system khác. Shared data model định nghĩa trong DATA-DICTIONARY [REF: ENT-XXX] | Must |
| BR-IT-002 | **Tri-lingual i18n bắt buộc** | Toàn bộ 5 systems | Giao diện và documents xuất ra phải hỗ trợ VN/EN/ZH [REF: ENUM-015]. Không hardcode chuỗi text — dùng i18n keys. Documents: Hóa đơn (VN+EN), Vận đơn (EN), Thông báo kho TQ (ZH+EN), Báo giá (VN/EN/ZH tùy KH) | Must |
| BR-IT-003 | **VNACCS Integration — spike research trước Phase 5** | ERP module Hải quan | VNACCS API/SDK phải được research và spike test trước khi viết MODSPEC. Nếu API không đủ → thiết kế fallback manual workflow. Kết quả spike ghi vào ADR | Must |
| BR-IT-004 | **MISA Integration Gateway pattern** | ERP module Tài chính | Không tích hợp trực tiếp MISA trong lần đầu nếu API chưa sẵn sàng. Xây dựng **Integration Gateway** (adapter layer) để tích hợp sau mà không cần refactor core. Gateway phải có: retry logic, error queue, sync status tracking | Must |
| BR-IT-005 | **WeCom Integration — bắt buộc cho Kho TQ** | SAPP module Kho TQ | WeCom API là **Critical Path** để kết nối nhân viên kho TQ. Không có WeCom → kho TQ trở thành điểm mù. Spike WeCom API song song với VNACCS | Must |
| BR-IT-006 | **HSC Engine — thiết kế multi-tenant từ đầu** | HSC system | HS Code engine thiết kế để có thể phục vụ nhiều tenants (thương mại hóa sau). Tuy nhiên, giai đoạn 1 chỉ cần single-tenant. Architecture phải hỗ trợ mở rộng. | Should |
| BR-IT-007 | **Offline-first cho kho TQ** | SAPP module Kho TQ | Do latency network TQ–VN, SAPP kho TQ phải hoạt động offline và sync khi có kết nối. Thiết kế conflict resolution rõ ràng (last-write-wins hoặc manual merge) | Must |
| BR-IT-008 | **Tỷ giá NHNN — một nguồn duy nhất** | ERP Tài chính | Chỉ ERP fetch và lưu tỷ giá NHNN [REF: ENT-013]. Các system khác (SAPP, CAPP, HSC) chỉ đọc từ ERP API — không tự fetch NHNN. Cron job daily 08:00 AM | Must |
| BR-IT-009 | **HS Code Master — HSC là owner, ERP là consumer** | HSC → ERP | HSC là master data owner của ENT-007. ERP đọc qua API. Daily batch sync + manual trigger khi có cập nhật từ Tổng cục Hải quan | Must |

---

### 2.2. Quy tắc triển khai theo giai đoạn — Sequencing Rules (BR-IT-010..019)

| Mã | Quy tắc | Nội dung | Lý do | Ưu tiên |
|----|---------|---------|-------|---------|
| BR-IT-010 | **"Spine-first" deployment — không Big Bang** | Thứ tự go-live: **Giai đoạn 1:** HSC + ERP (5 modules cốt lõi: KD, Tài chính, Kho VN, Kho TQ, Điều phối) + SAPP. **Giai đoạn 2:** CAPP. **Giai đoạn 3:** WEB + ERP full (Marketing, HR, BOD) | ERP + SAPP đảm bảo internal operations trước. CAPP cần data đủ trưởng thành. WEB là marketing. | Must |
| BR-IT-011 | **ERP giai đoạn 1 — 5 modules cốt lõi** | Go-live Giai đoạn 1 chỉ gồm: Kinh doanh & CSKH + Tài chính + Kho VN + Kho TQ + Điều phối. Marketing, HR, BOD dashboard là Giai đoạn 3. | Giảm scope ban đầu, đảm bảo core operations hoạt động trước | Must |
| BR-IT-012 | **Parallel operation — chạy song song ERP cũ và mới** | Trong 3 tháng đầu sau go-live Giai đoạn 1 | Nhân viên có thể dùng cả ERP cũ và ERP mới. Sau 3 tháng: cutover hoàn toàn. Dữ liệu lịch sử từ ERP cũ được migrate theo BR-IT-015 | Should |
| BR-IT-013 | **CAPP v1.0 — 3 tính năng killer** | Go-live CAPP | CAPP v1.0 **phải có**: (1) Tracking lô hàng real-time, (2) Xem/tải chứng từ (B/L, C/O, hóa đơn), (3) Thanh toán online (VNPay/MoMo). Các tính năng khác là v1.1+ | Must |
| BR-IT-014 | **HSC go-live sớm** | Giai đoạn 1 | HSC phải live trước hoặc song song ERP Giai đoạn 1 để tích hợp HS Code validation vào workflow ngay từ đầu | Must |
| BR-IT-015 | **Data migration — 10-15% total effort** | Trước go-live ERP | Allocate 10-15% tổng effort cho data migration từ ERP cũ. Quy trình: (1) Audit dữ liệu cũ; (2) Mapping schema; (3) Clean/transform; (4) Load test; (5) Validation; (6) Cutover. | Must |
| BR-IT-016 | **Baseline metrics trước go-live** | Trước Giai đoạn 1 | Đo baseline: FTE thủ công/lô hàng, thời gian xử lý trung bình, tỷ lệ lỗi HS Code hiện tại. Dùng để đo ROI sau go-live. | Should |
| BR-IT-017 | **Contingency reserve 20% Capex** | Budget planning | Giữ 20% tổng Capex (~500 triệu–1,25 tỷ VNĐ) làm contingency. Giải ngân khi có scope creep hoặc sự cố kỹ thuật được phê duyệt bởi BOD | Must |

---

### 2.3. Quy tắc bảo mật & tuân thủ — Security Rules (BR-IT-020..029)

| Mã | Quy tắc | Nội dung | Ưu tiên |
|----|---------|---------|---------|
| BR-IT-020 | **Authentication — MFA bắt buộc cho admin** | Tài khoản admin ERP/SAPP phải dùng MFA (TOTP hoặc SMS OTP). Nhân viên thường: username/password đủ mạnh (≥8 ký tự, chữ hoa/thường/số/ký tự đặc biệt) | Must |
| BR-IT-021 | **RBAC — Role-Based Access Control** | Mỗi phòng ban có role riêng với quyền tối thiểu cần thiết (Principle of Least Privilege). Danh sách roles được định nghĩa trong MODSPEC-ERP module IT. | Must |
| BR-IT-022 | **Dữ liệu cá nhân KH — tuân thủ NĐ 13/2023** | CAPP, ERP CRM | Không lưu thông tin nhạy cảm quá mức. Có cơ chế xóa dữ liệu KH theo yêu cầu (right to erasure). Log mọi truy cập vào dữ liệu cá nhân | Must |
| BR-IT-023 | **AML Auto-flag giao dịch lớn** | ERP Tài chính | Giao dịch đơn lẻ ≥ 300 triệu VNĐ → tự động tạo STR (Suspicious Transaction Report) flag để Tài chính review theo Luật AML 2022 | Must |
| BR-IT-024 | **Audit trail toàn bộ thao tác quan trọng** | ERP, SAPP | Log: ai làm gì, khi nào, IP nào — cho: thay đổi giá, thay đổi credit limit, tạo/hủy tờ khai, xóa dữ liệu. Lưu 2 năm. | Must |
| BR-IT-025 | **Security audit trước go-live** | Tất cả systems | Penetration testing bởi bên thứ 3 trước khi go-live production. Tối thiểu: OWASP Top 10 checklist | Must |
| BR-IT-026 | **VPN bắt buộc cho truy cập kho TQ** | SAPP kho TQ | Nhân viên kho TQ kết nối SAPP qua VPN. WeCom integration endpoint chỉ whitelist IP VPN | Must |
| BR-IT-027 | **Backup daily, retention 30 ngày** | Tất cả databases | Automated daily backup. Point-in-time recovery tối thiểu 7 ngày. Backup lưu ở region khác (DR). | Must |

---

### 2.4. Quy tắc phân quyền IT — Authorization Rules (BR-IT-030..039)

| Mã | Quy tắc | Vai trò | Hành động | Phạm vi |
|----|---------|---------|---------|--------|
| BR-IT-030 | **IT Admin — quản trị users và roles** | Phòng IT | Tạo/sửa/vô hiệu hóa tài khoản, assign roles, reset MFA | Toàn bộ systems |
| BR-IT-031 | **Chỉ IT xử lý tích hợp bên ngoài** | Phòng IT | Cấu hình MISA Gateway, VNACCS endpoint, WeCom API keys, Payment gateway credentials | API credentials không lưu trong code |
| BR-IT-032 | **Deploy production — cần 2-person rule** | IT + BOD approval | Mọi deploy lên production phải có: IT deploy + BOD/Manager acknowledge. Không solo deploy | Chỉ production |
| BR-IT-033 | **Database production — không truy cập trực tiếp** | Phòng IT | Production database chỉ truy cập qua ứng dụng hoặc migration scripts có review. Không dùng direct SQL trên production nếu không có incident | Production DB |
| BR-IT-034 | **HS Code updates — IT + Hải quan phối hợp** | Phòng IT + Nhân viên Hải quan | Cập nhật HS Code master data: Nhân viên Hải quan xác nhận nội dung, IT trigger sync từ nguồn chính thức | HSC |

---

### 2.5. Ràng buộc kỹ thuật — Technical Constraints (BR-IT-040..049)

| Mã | Ràng buộc | Loại | Chi tiết |
|----|----------|------|---------|
| BR-IT-040 | **Không hardcode API credentials** | Required | Mọi API keys (MISA, VNACCS, WeCom, VNPay, MoMo...) phải lưu trong environment variables hoặc secrets manager. Không commit credentials vào code repository. | 
| BR-IT-041 | **REQ-ID comments bắt buộc trong code** | Required | Mọi function/class quan trọng trong code phải có comment `// REQ-ID: US-XXX` hoặc `// FEAT-ID: FT-XXX` để traceability [REF: CLAUDE.md] |
| BR-IT-042 | **Code coverage tối thiểu 80%** | Range | Trước go-live: unit test + integration test coverage ≥ 80% cho core business logic (pricing engine, customs validation, credit check). |
| BR-IT-043 | **Uptime SLA ≥ 99.9%** | Range | Production uptime: ≥ 99.9% (downtime tối đa ~8.7 giờ/năm). Maintenance window: 02:00–04:00 sáng, thông báo trước 48h. |
| BR-IT-044 | **API response time ≤ 2s** | Range | 95th percentile của mọi API endpoint ≤ 2 giây dưới tải bình thường. HSC HS Code lookup ≤ 500ms. |
| BR-IT-045 | **Dữ liệu hải quan không bao giờ bị xóa** | Required | CustomsDeclaration records có `archived = true` — readonly sau khi archive. Không có DELETE endpoint cho records này. [REF: BR-LOG-040] |
| BR-IT-046 | **Mobile-first cho CAPP và SAPP** | Required | CAPP và SAPP phải hoạt động mượt trên smartphone từ 4 năm trở lại (iOS 15+, Android 10+). PWA hoặc native app — quyết định ở Phase 5. |
| BR-IT-047 | **Graceful degradation khi VNACCS down** | Required | Nếu VNACCS không phản hồi: ERP lưu tờ khai ở trạng thái QUEUED, tự động retry sau 5 phút. Nhân viên được cảnh báo real-time. |
| BR-IT-048 | **Idempotency cho mọi payment API call** | Required | Mọi gọi API thanh toán (VNPay, MoMo) phải có idempotency key để tránh charge kép khi retry. |
| BR-IT-049 | **Cloud strategy — IT team quyết định ở Phase 5** | Decision-deferred | BOD không có yêu cầu cụ thể về cloud provider. IT team quyết định và document trong MODSPEC-ERP ADR section. Ưu tiên: tiết kiệm chi phí vận hành, độ trễ thấp với VN và TQ. |

---

## 3. EXCEPTIONS & SPECIAL CASES

| # | Tình huống đặc biệt | Xử lý | Quy tắc áp dụng |
|---|-------------------|-------|----------------|
| 1 | MISA API không có hoặc hạn chế | Giai đoạn 1: ERP quản lý tài chính độc lập. Integration Gateway sẵn sàng để plug-in khi MISA mở API. Finance export manual đến MISA qua file CSV | [REF: BR-IT-004] |
| 2 | VNACCS thay đổi API format | Integration layer có version abstraction. Khi VNACCS cập nhật → chỉ cần update adapter, không ảnh hưởng core ERP | [REF: BR-IT-003] |
| 3 | WeCom không khả dụng tại TQ (do network) | SAPP kho TQ hoạt động offline-first. Khi WeCom không available: nhân viên nhập liệu trực tiếp SAPP, sync khi có mạng | [REF: BR-IT-007] |
| 4 | Data migration phát sinh lỗi dữ liệu | Dừng migration, báo cáo chi tiết. Không go-live nếu dữ liệu core (KH, lịch sử đơn hàng active) bị lỗi. "Quality-first" — không rush | [REF: BR-IT-015] |
| 5 | Security breach phát hiện sau go-live | Incident response plan: (1) Isolate affected system; (2) Notify BOD trong 1h; (3) Notify Authorities nếu PDPA breach (NĐ 13/2023 — 72h); (4) Forensics; (5) Post-mortem | [REF: BR-IT-022] |
| 6 | Contingency budget không đủ | Báo cáo BOD với scope options: (a) reduce scope, (b) delay timeline, (c) approve thêm budget. Không tự ý scope creep. | [REF: BR-IT-017] |

---

## 4. COMPLIANCE & REGULATORY

| Quy định | Nội dung | Áp dụng cho | Penalty |
|---------|---------|-----------|---------|
| NĐ 13/2023/NĐ-CP | Bảo vệ dữ liệu cá nhân — lưu trữ, xử lý, xóa | CAPP, ERP CRM | Phạt đến 100 triệu VNĐ; bắt buộc thông báo 72h nếu breach |
| Luật AML 2022 | Báo cáo giao dịch đáng ngờ ≥ 300 triệu VNĐ | ERP Tài chính | Phạt hành chính; rủi ro hình sự |
| Luật An toàn thông tin mạng 2015 | Bảo vệ hệ thống thông tin cấp độ 2+ | Tất cả systems | Phạt + có thể bị đình chỉ hoạt động |
| NĐ 123/2020 | Hóa đơn điện tử — lưu trữ 10 năm | ERP Tài chính | Phạt 4-8 triệu VNĐ/lần |
| Luật Kế toán 2015 | Dữ liệu kế toán lưu 10 năm | ERP Tài chính | Vi phạm lưu trữ |

---

## 5. INTEGRATION MATRIX — Bản đồ tích hợp

| Hệ thống ngoài | Loại tích hợp | Protocol | Ghi chú |
|---------------|-------------|---------|---------|
| VNACCS/VCIS | Khai báo hải quan | REST API / EDI | Spike required trước Phase 5 [REF: BR-IT-003] |
| MISA | Kế toán & tài chính | Integration Gateway | API availability TBD [REF: BR-IT-004] |
| WeCom | Kho TQ communication | WeChat Work API | Critical Path [REF: BR-IT-005] |
| VNPay | Cổng thanh toán VN | REST API | Idempotency required [REF: BR-IT-048] |
| MoMo | Cổng thanh toán VN | REST API | Idempotency required |
| Internet Banking | Thanh toán chuyển khoản | Webhook / manual confirm | |
| Zalo OA | Thông báo & chat KH | Zalo API | Cho CAPP notifications |
| Carrier APIs | Tracking tàu/flight | REST API | COSCO, Evergreen, OOCL... |
| NHNN | Tỷ giá hàng ngày | REST API | Daily cron 08:00 AM [REF: BR-IT-008] |
| Tổng cục Hải quan | HS Code master data | API / Web scraping | Daily sync [REF: BR-IT-009] |
| Email / SMS | Thông báo tự động | SMTP / SMS Gateway | Fallback khi Zalo fail |

---

## 6. CHANGELOG

| Phiên bản | Ngày | Thay đổi |
|-----------|------|---------|
| 1.0.0 | 2026-03-19 | Tạo mới từ EXPERT-LOG SESSION-001 Consensus + Resolution OI-009, OI-010 |
