# PROCESS: LOGISTICS (Quy trình Vận chuyển & Xuất nhập khẩu)
<!-- ============================================================
     QUY TRÌNH NGHIỆP VỤ — AS-IS & TO-BE
     Bao phủ: Import (TQ→VN), Export (VN→TQ), Sourcing (mua hàng hộ)

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md → PROB-001..005, UJ-001..003
               EXPERT-LOG.md → SESSION-001 Domain Expert (luồng chi tiết)
               BIZ-POLICY-LOGISTICS.md → BR-LOG-001..049
       Key IDs: PROC-LOG-001..003, PAIN-LOG-001..020
       Output: ERP/URS-KD, URS-DC, URS-KHO-VN, URS-KHO-TQ, URS-HQ
               CAPP/URS-CAPP, SAPP/URS-SAPP, HSC/URS-HSC
       Update: Bởi /mcv3:biz-docs skill
     ============================================================ -->

> **Phase:** P1 — Business Context
> **Loại:** Tài liệu quy trình (Process Document)
> **Lĩnh vực:** Logistics / Xuất nhập khẩu
> **Áp dụng cho systems:** ERP, CAPP, SAPP, HSC
> **Ngày tạo:** 2026-03-19
> **Phiên bản:** 1.0.0

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md → PROB-001..005, UJ-001..003]
- [REF: _PROJECT/EXPERT-LOG.md → SESSION-001 Domain Expert] — Quy trình chi tiết ngành
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-LOGISTICS.md] — BR-LOG-001..049

### Tài liệu tham chiếu file này:
- [REF: ERP/P1-REQUIREMENTS/URS-KD.md → Use Cases] — UC Kinh doanh
- [REF: ERP/P1-REQUIREMENTS/URS-DC.md → Use Cases] — UC Điều phối
- [REF: ERP/P1-REQUIREMENTS/URS-KHO-VN.md] — UC Kho VN
- [REF: ERP/P1-REQUIREMENTS/URS-KHO-TQ.md] — UC Kho TQ
- [REF: CAPP/P1-REQUIREMENTS/URS-CAPP.md → Tracking UC] — UC Customer tracking
- [REF: HSC/P1-REQUIREMENTS/URS-HSC.md → Integration UC] — UC HSC workflow

---

## PROC-LOG-001: Quy trình IMPORT (TQ → VN)

| Mục | Nội dung |
|-----|---------|
| **Tên quy trình** | Nhập khẩu hàng hóa Trung Quốc → Việt Nam |
| **Mã quy trình** | PROC-LOG-001 |
| **Mục tiêu** | Tiếp nhận hàng từ TQ, vận chuyển an toàn, thông quan, giao đến KH VN |
| **Phạm vi** | Từ khi KH yêu cầu → đến khi KH nhận hàng và thanh toán xong |
| **Actors** | KH, Nhân viên KD, Nhân viên Chứng từ/HQ, Kho TQ, Kho VN, Điều phối, Tài chính |
| **Tần suất** | Hàng ngày — ~20.000+ lô hàng/năm (hiện tại), mục tiêu 40.000+/năm |
| **SLA** | Sea: 15-25 ngày (tùy tuyến + hải quan); Air: 3-7 ngày; Road: 5-10 ngày |

---

### AS-IS — Quy trình Import hiện tại

#### Flow tổng quan (AS-IS)

```
[GĐ 0] KH liên hệ qua Zalo/ĐT → NV KD báo giá thủ công → KH xác nhận → Thu cọc
                                  (Excel + nhắn tin)

[GĐ 1] NV KD gửi thông tin kho TQ qua Zalo/WeChat → Kho TQ nhận hàng → Cân đo ghi tay
       (Không có hệ thống tracking)

[GĐ 2] NV KD book vận tải thủ công → Lấy B/L từ hãng tàu/xe → Email B/L cho nhóm
       (Không có quản lý B/L tập trung)

[GĐ 3] NV Chứng từ tra HS Code thủ công (nhiều website) → Soạn tờ khai → Submit VNACCS
       → Chờ kết quả luồng → Nộp thuế → Lấy hàng
       (Không có công cụ HS Code tích hợp)

[GĐ 4] Nhận hàng tại cảng/CK → Vận chuyển về kho VN → Kiểm đếm ghi tay
       (Không real-time với KH)

[GĐ 5] Giao hàng nội địa → KH ký nhận giấy tờ → NV gửi ảnh POD qua Zalo
       (Không có POD điện tử)

[GĐ 6] NV KD tổng hợp phí thủ công trên Excel → Gửi invoice qua email → KH chuyển khoản
       (Trùng lặp nhập liệu ERP + MISA)
```

#### Chi tiết AS-IS

| Bước | Hành động | Actor | Công cụ hiện tại | Thời gian ước tính |
|------|---------|-------|-----------------|------------------|
| 0.1 | Tiếp nhận yêu cầu KH | NV KD | Zalo cá nhân, ĐT | 15-30 phút |
| 0.2 | Kiểm tra HAZMAT/quota | NV KD | Thủ công, kinh nghiệm | 10-30 phút |
| 0.3 | Báo giá | NV KD | Excel + tính tay | 30-60 phút |
| 0.4 | Thu cọc | Tài chính | Chuyển khoản + xác nhận thủ công | 1-2 ngày |
| 1.1 | Thông báo kho TQ nhận hàng | NV KD → Kho TQ | WeChat/Zalo | 1-4 giờ |
| 1.2 | Kho TQ nhận hàng + cân đo | Kho TQ | Ghi tay, chụp ảnh | 1-2 giờ |
| 1.3 | Gửi thông tin kho TQ về VN | Kho TQ | WeChat + ảnh | Ngay sau nhận |
| 2.1 | Book vận tải (tàu/xe/máy bay) | NV Điều phối | Email, điện thoại | 1-4 giờ |
| 2.2 | Nhận B/L từ hãng tàu | NV Chứng từ | Email | Sau ETD 2-3 ngày |
| 3.1 | Tra HS Code | NV Chứng từ | Nhiều website | 30-120 phút/lô |
| 3.2 | Soạn tờ khai | NV Chứng từ | VNACCS phần mềm riêng | 30-60 phút |
| 3.3 | Submit + chờ luồng | NV Chứng từ | VNACCS | Tức thì – vài giờ |
| 3.4 | Xử lý luồng Vàng/Đỏ | NV Chứng từ | Thủ công, ra cảng | 1 giờ – 2 ngày |
| 3.5 | Nộp thuế + lấy D/O | Tài chính + NV Chứng từ | Ngân hàng + cảng | Nửa ngày – 1 ngày |
| 4.1 | Nhận hàng tại cảng/CK | NV Kho VN + Điều phối | Thủ công | 2-4 giờ |
| 4.2 | Kiểm đếm nhập kho VN | NV Kho VN | Ghi tay | 1-3 giờ |
| 5.1 | Lên lịch giao last-mile | Điều phối | ĐT + Excel | 30-60 phút |
| 5.2 | Giao hàng + lấy ký nhận | NV Giao hàng | Giấy tờ in | Theo lịch |
| 5.3 | Gửi POD | NV Giao hàng | Ảnh chụp + Zalo | Sau giao |
| 6.1 | Tổng hợp phí + lập hóa đơn | Tài chính | Excel + MISA | 1-2 giờ |
| 6.2 | Gửi hóa đơn + thu tiền | Tài chính | Email + ĐT | 1-3 ngày |

#### Pain Points (AS-IS Import)

| Mã | Pain Point | Bước | Ảnh hưởng | Mức độ |
|----|-----------|------|---------|--------|
| PAIN-LOG-001 | KH không có kênh số — phải gọi điện/Zalo để đặt hàng và hỏi trạng thái | 0.1, 5.3 | Trải nghiệm KH kém; NV CSKH tốn thời gian | High |
| PAIN-LOG-002 | Không có tracking real-time cho KH | Toàn bộ | KH không biết hàng đang ở đâu; nhiều cuộc gọi hỏi thăm | High |
| PAIN-LOG-003 | Tra HS Code thủ công từ nhiều nguồn | 3.1 | Sai mã HS → phạt + truy thu thuế | High |
| PAIN-LOG-004 | Nhập liệu trùng lặp vào ERP cũ + MISA + VNACCS | 3.2, 6.1 | Tốn thời gian, dễ sai sót | High |
| PAIN-LOG-005 | Không có cảnh báo demurrage tự động | 4.1 | Phát hiện muộn → phí demurrage phát sinh | High |
| PAIN-LOG-006 | Kho TQ là điểm mù — chỉ update qua WeChat | 1.2, 1.3 | Không biết real-time tình trạng hàng ở TQ | High |
| PAIN-LOG-007 | Không có Staff App — nhân viên phải dùng PC | Nhiều bước | Di động kém; không cập nhật được khi ngoài văn phòng | High |
| PAIN-LOG-008 | Báo giá thủ công, không có lịch sử | 0.3 | Không trace được giá đã báo; inconsistency | Medium |
| PAIN-LOG-009 | POD thủ công qua Zalo | 5.3 | Dễ thất lạc; không có chứng cứ pháp lý rõ ràng | Medium |
| PAIN-LOG-010 | Không có cảnh báo C/O hết hạn | 3.2 | Mất ưu đãi thuế ACFTA | Medium |

---

### TO-BE — Quy trình Import với hệ thống mới

#### Flow tổng quan (TO-BE)

```
[GĐ 0] KH tạo yêu cầu trên CAPP / NV KD nhập ERP
        → HAZMAT auto-check (HSC) → Báo giá 3-tier (ERP)
        → KH confirm trên CAPP → Credit check auto → Thanh toán online (CAPP) / Ghi nợ

[GĐ 1] ERP tự động gửi lệnh kho TQ qua SAPP+WeCom
        → Kho TQ nhận hàng, cập nhật SAPP → KH nhận push notification

[GĐ 2] NV Điều phối book vận tải trên ERP → Tạo TransportUnit → Gán Shipments vào container
        → Alert auto khi ETD gần đến

[GĐ 3] NV Chứng từ: HS Code gợi ý tự động (HSC) → Xác nhận → ERP tạo tờ khai
        → Submit VNACCS từ ERP → Nhận luồng real-time → Xử lý Vàng/Đỏ nếu có
        → ERP tự tính thuế (tỷ giá NHNN + HS rate) → Nộp thuế

[GĐ 4] ERP cảnh báo demurrage 2 ngày trước → Nhận hàng cảng → SAPP cập nhật vào kho VN
        → KH nhận push notification "Hàng về kho VN"

[GĐ 5] Điều phối phân công giao nội địa trên ERP → NV giao hàng dùng SAPP upload POD
        → KH ký điện tử trên CAPP → Shipment → DELIVERED

[GĐ 6] ERP tự tổng hợp tất cả charges (kể cả phí phát sinh KH đã acknowledge)
        → Phát hóa đơn điện tử tự động trong 24h → KH thanh toán qua CAPP
        → ERP đồng bộ sang MISA Gateway (khi available)
```

#### Chi tiết TO-BE

| Bước | Hành động | Actor | System | Rules áp dụng | SLA |
|------|---------|-------|--------|--------------|-----|
| 0.1 | KH tạo yêu cầu dịch vụ | KH | CAPP (form) / ERP | | 5 phút |
| 0.2 | Hệ thống auto-check HAZMAT + hàng cấm | Tự động | HSC + ERP | [REF: BR-LOG-001, BR-LOG-006] | Tức thì |
| 0.3 | ERP resolve giá 3-tier + hiển thị báo giá | Tự động | ERP | [REF: BR-LOG-012] | < 1 giây |
| 0.4 | KH xem và confirm báo giá | KH | CAPP | [REF: BR-LOG-005] | KH tự làm |
| 0.5 | Auto-check credit limit | Tự động | ERP | [REF: BR-LOG-003] | Tức thì |
| 0.6 | KH thanh toán online hoặc ghi nợ | KH / Hệ thống | CAPP + Payment GW | [REF: BR-FIN-020, BR-FIN-021] | Tức thì |
| 1.1 | ERP tự động gửi lệnh nhận hàng tới kho TQ | Tự động | ERP → SAPP/WeCom | | Tức thì |
| 1.2 | Kho TQ nhận hàng + cân đo + chụp ảnh trên SAPP | Kho TQ | SAPP | | Trong ngày |
| 1.3 | KH nhận push notification "Hàng đã về kho TQ" | Tự động | CAPP | [REF: BR-LOG-028] | Trong 5 phút |
| 2.1 | NV Điều phối book vận tải trên ERP | Điều phối | ERP | | 30 phút |
| 2.2 | Tạo TransportUnit, gán Shipments vào container | Điều phối | ERP | [REF: ENT-004] | |
| 2.3 | ETD/ETA tracking từ carrier API | Tự động | ERP + Carrier API | | Real-time |
| 3.1 | HSC gợi ý HS Code tự động theo mô tả hàng | Tự động | HSC | [REF: BR-LOG-004] | < 2 giây |
| 3.2 | NV Chứng từ xác nhận HS Code + validate C/O | NV Chứng từ | ERP + HSC | [REF: BR-LOG-002, BR-LOG-004] | 15-30 phút |
| 3.3 | ERP tự tính thuế theo tỷ giá NHNN ngày khai | Tự động | ERP | [REF: BR-LOG-010, BR-LOG-011] | Tức thì |
| 3.4 | Submit tờ khai lên VNACCS từ ERP | NV Chứng từ | ERP → VNACCS | [REF: BR-LOG-026] | 5 phút |
| 3.5 | Nhận kết quả luồng + cập nhật ERP tự động | Tự động | VNACCS → ERP | [REF: BR-LOG-027] | Tức thì |
| 3.6 | Xử lý luồng Vàng/Đỏ (nếu có) | NV Chứng từ | ERP | [REF: BR-LOG-027] | 1 giờ – 2 ngày |
| 3.7 | Nộp thuế + lấy D/O | Tài chính + NV Chứng từ | ERP | [REF: BR-FIN-020] | Nửa ngày |
| 4.0 | **Alert demurrage khi còn 2 ngày free time** | Tự động | ERP → SAPP + CAPP | [REF: BR-LOG-024] | Tức thì |
| 4.1 | Nhận hàng tại cảng/CK | Điều phối + NV Kho VN | SAPP | | 2-4 giờ |
| 4.2 | Kiểm đếm + nhập kho VN trên SAPP | NV Kho VN | SAPP | | 1-3 giờ |
| 4.3 | KH nhận push notification "Hàng về kho VN" | Tự động | CAPP | | Tức thì |
| 5.1 | Phân công giao last-mile trên ERP | Điều phối | ERP + SAPP | | 15 phút |
| 5.2 | NV giao hàng xác nhận POD qua SAPP (ảnh + GPS) | NV Giao hàng | SAPP | [REF: BR-LOG-047] | Ngay sau giao |
| 5.3 | KH xác nhận nhận hàng trên CAPP (optional) | KH | CAPP | | |
| 5.4 | Shipment → DELIVERED; KH nhận push notification | Tự động | ERP → CAPP | | Tức thì |
| 6.1 | ERP tổng hợp tất cả charges tự động | Tự động | ERP | [REF: BR-FIN-015] | Tức thì |
| 6.2 | Phát hóa đơn điện tử trong 24h | Tự động / Tài chính | ERP | [REF: BR-FIN-002, BR-FIN-024] | ≤ 24h |
| 6.3 | KH thanh toán online qua CAPP | KH | CAPP + Payment GW | | |
| 6.4 | ERP đồng bộ sang MISA Gateway | Tự động | ERP → MISA GW | [REF: BR-IT-004] | Batch daily |
| 6.5 | Shipment → COMPLETED | Tự động | ERP | [REF: BR-LOG-029] | Tức thì |

#### Cải tiến so với AS-IS (Import)

| Pain Point | Giải pháp TO-BE | Kết quả kỳ vọng |
|-----------|----------------|----------------|
| PAIN-LOG-001 | CAPP — kênh số trực tiếp cho KH | > 60% KH active dùng CAPP trong 6 tháng |
| PAIN-LOG-002 | Tracking real-time qua CAPP push notification | KH tự theo dõi, giảm 70% cuộc gọi hỏi thăm |
| PAIN-LOG-003 | HSC auto-suggest HS Code tích hợp ERP | Tỷ lệ lỗi HS Code < 1% |
| PAIN-LOG-004 | Một nguồn dữ liệu (ERP) → sync MISA qua Gateway | Loại bỏ nhập liệu trùng lặp |
| PAIN-LOG-005 | Alert demurrage tự động T-2 ngày | Giảm phí demurrage phát sinh |
| PAIN-LOG-006 | SAPP + WeCom tích hợp kho TQ | Kho TQ real-time, không còn điểm mù |
| PAIN-LOG-007 | SAPP mobile app cho toàn bộ nhân viên | 90% giao dịch xử lý qua SAPP trong 3 tháng |
| PAIN-LOG-008 | ERP quản lý báo giá + lịch sử + 3-tier pricing | Consistency + audit trail đầy đủ |
| PAIN-LOG-009 | POD điện tử qua SAPP (ảnh + GPS + timestamp) | Chứng cứ pháp lý; không thất lạc |
| PAIN-LOG-010 | HSC alert C/O hết hạn tự động | Không bao giờ mất ưu đãi ACFTA do quên gia hạn |

---

## PROC-LOG-002: Quy trình EXPORT (VN → TQ)

| Mục | Nội dung |
|-----|---------|
| **Tên quy trình** | Xuất khẩu hàng hóa Việt Nam → Trung Quốc |
| **Mã quy trình** | PROC-LOG-002 |
| **Mục tiêu** | Tiếp nhận hàng xuất từ KH VN, vận chuyển, khai báo hải quan xuất, giao kho TQ |
| **Phạm vi** | Từ KH yêu cầu xuất → đến khi hàng về kho TQ / giao KH TQ |
| **Actors** | KH, NV KD, NV Chứng từ/HQ, Kho VN, Kho TQ, Điều phối |
| **Tần suất** | Thấp hơn Import nhưng đang tăng trưởng |
| **SLA** | Road: 5-10 ngày; Sea: 10-20 ngày |

---

### AS-IS — Quy trình Export hiện tại

#### Pain Points (AS-IS Export)

| Mã | Pain Point | Ảnh hưởng | Mức độ |
|----|-----------|---------|--------|
| PAIN-LOG-011 | Quy trình Export chưa được chuẩn hóa | Mỗi nhân viên làm theo kinh nghiệm riêng | High |
| PAIN-LOG-012 | Khai báo hải quan xuất thủ công hoàn toàn | Tốn thời gian, dễ sai sót | High |
| PAIN-LOG-013 | Không có VAT hoàn 0% tự động | Cần nhân viên track thủ công hồ sơ hoàn thuế | Medium |
| PAIN-LOG-014 | Phối hợp kho TQ nhận hàng qua WeChat không có hệ thống | Dễ mất thông tin, delay | High |

---

### TO-BE — Quy trình Export với hệ thống mới

#### Flow tổng quan (TO-BE Export)

```
[GĐ 0] KH tạo yêu cầu xuất trên CAPP / NV KD nhập ERP
        → Kiểm tra hàng cấm xuất (HSC) → Báo giá → Confirm

[GĐ 1] Nhận hàng tại kho VN → Kiểm đếm trên SAPP → Đóng gói → Cân đo

[GĐ 2] Book vận tải xuất → Chuẩn bị chứng từ xuất (Invoice, Packing List)
        → ERP tạo tờ khai xuất XK01 → Submit VNACCS

[GĐ 3] Thông quan xuất → Lấy chứng từ → Bàn giao cho vận chuyển
        → Hóa đơn VAT 0% tự động

[GĐ 4] Tracking vận chuyển → Kho TQ nhận hàng qua SAPP+WeCom
        → KH nhận push notification

[GĐ 5] Tổng hợp phí → Phát hóa đơn điện tử → Thu tiền
```

#### Chi tiết TO-BE Export

| Bước | Hành động | Actor | System | Rules áp dụng |
|------|---------|-------|--------|--------------|
| 0.1 | Tiếp nhận yêu cầu xuất | KH / NV KD | CAPP / ERP | |
| 0.2 | Kiểm tra hàng cấm xuất khẩu | Tự động | HSC | [REF: BR-LOG-006] |
| 0.3 | Báo giá + confirm | NV KD | ERP | [REF: BR-LOG-012] |
| 1.1 | Nhận hàng kho VN + kiểm đếm | Kho VN | SAPP | |
| 2.1 | Chuẩn bị chứng từ xuất (Invoice, PL, CO xuất) | NV Chứng từ | ERP | |
| 2.2 | Tạo tờ khai hải quan xuất XK01 | NV Chứng từ | ERP → VNACCS | [REF: BR-LOG-026] |
| 3.1 | Thông quan xuất | NV Chứng từ | VNACCS | |
| 3.2 | Phát hóa đơn VAT 0% | Tài chính | ERP | [REF: BR-FIN-014] |
| 4.1 | Tracking vận chuyển TQ | Tự động | ERP + Carrier API | |
| 4.2 | Kho TQ xác nhận nhận hàng trên SAPP/WeCom | Kho TQ | SAPP + WeCom | |
| 5.1 | Tổng hợp phí + phát hóa đơn điện tử | Tài chính | ERP | [REF: BR-FIN-002] |

---

## PROC-LOG-003: Quy trình SOURCING (Mua hàng hộ tại TQ)

| Mục | Nội dung |
|-----|---------|
| **Tên quy trình** | Mua hàng hộ tại Trung Quốc (Sourcing Service) |
| **Mã quy trình** | PROC-LOG-003 |
| **Mục tiêu** | Tìm kiếm, đặt mua và kiểm định hàng hóa tại TQ theo yêu cầu KH VN |
| **Phạm vi** | Từ KH gửi yêu cầu sourcing → đến khi hàng vào luồng PROC-LOG-001 |
| **Actors** | KH, NV KD, Nhân viên/đối tác kho TQ |
| **Tần suất** | Theo yêu cầu |
| **SLA** | Tùy độ phức tạp: 3-14 ngày để sourcing xong |

---

### TO-BE — Quy trình Sourcing

#### Flow tổng quan

```
[GĐ 0] KH mô tả sản phẩm cần mua (tên, spec, số lượng, ngân sách)
        → NV KD nhập yêu cầu sourcing trên ERP

[GĐ 1] Nhân viên/đối tác kho TQ tìm nhà cung cấp (NCC)
        → Báo giá NCC → Gửi mẫu/ảnh qua SAPP/WeCom
        → KH approve qua CAPP

[GĐ 2] Đặt hàng NCC → Theo dõi sản xuất/chuẩn bị
        → Kiểm định chất lượng tại kho TQ (QC/QA)
        → Chụp ảnh + upload SAPP

[GĐ 3] Hàng pass QC → Chuyển sang PROC-LOG-001 (Import flow)
        → Tính phí sourcing + QC vào hóa đơn cuối
```

#### Pain Points (AS-IS Sourcing)

| Mã | Pain Point | Mức độ |
|----|-----------|--------|
| PAIN-LOG-015 | Không có tracking tiến độ sourcing cho KH | High |
| PAIN-LOG-016 | Kết quả QC chỉ qua ảnh Zalo, không có hệ thống | Medium |
| PAIN-LOG-017 | Phí sourcing tính thủ công, dễ bỏ sót | Medium |

#### Cải tiến TO-BE Sourcing

| Pain Point | Giải pháp | Kết quả kỳ vọng |
|-----------|----------|----------------|
| PAIN-LOG-015 | KH track tiến độ sourcing trên CAPP | KH chủ động, giảm hỏi thăm |
| PAIN-LOG-016 | NV TQ upload ảnh QC vào ERP qua SAPP | Hồ sơ QC có cấu trúc, lưu lâu dài |
| PAIN-LOG-017 | ERP tự động thêm phí sourcing (SOURCING_FEE) vào hóa đơn | Không bỏ sót doanh thu |

---

## 4. EXCEPTIONS & HANDLING

| Tình huống | Xảy ra khi | Xử lý | Thông báo |
|-----------|-----------|-------|-----------|
| Hàng bị giữ ở cảng (luồng Đỏ) | VNACCS phân luồng Đỏ | NV Chứng từ ra cảng kiểm hóa. Cập nhật ERP trong 24h. Alert KH qua CAPP | KH + NV KD + Manager |
| Demurrage phát sinh | Quá free_time_end | Cộng demurrage vào hóa đơn. Tạo "Phí phát sinh" notify KH [REF: BR-LOG-025] | KH qua CAPP |
| Hàng thất lạc / hư hỏng | Phát hiện tại kho VN hoặc giao hàng | Mở Claim & Dispute ticket trong ERP. Chụp ảnh bằng chứng. Theo dõi đến khi giải quyết | KH + NV KD + Manager |
| C/O Form E hết hạn trước khi thông quan | expiry_date < ngày khai | Khai theo MFN (không ưu đãi). Cập nhật benefit_claimed = false. Notify Tài chính về chênh lệch thuế | Tài chính + KH |
| KH hủy đơn sau khi hàng đã ở kho TQ | KH request cancel | Áp dụng chính sách hoàn tiền [REF: BR-FIN-025]. Tính phí phát sinh thực tế (kho TQ, handling...) | KH |
| WeCom kho TQ down | Network issues | SAPP hoạt động offline-first. Dữ liệu sync khi có mạng [REF: BR-IT-007] | NV KD (chậm update) |
| Hàng HAZMAT bị từ chối vận chuyển | Carrier từ chối | Re-book carrier khác có đủ điều kiện. Nếu không có → notify KH và hoàn tiền phần vận chuyển | KH + Manager |

---

## 5. KPIs ĐO LƯỜNG QUY TRÌNH

| KPI | Đơn vị | AS-IS ước tính | TO-BE Target | Đo bằng |
|----|--------|--------------|-------------|--------|
| Thời gian xử lý toàn bộ (Sea Import) | Ngày | 15-25 ngày | 12-22 ngày (giảm 20% thủ tục) | ERP timestamp |
| Thời gian báo giá | Giờ | 30-60 phút | < 5 phút (auto 3-tier) | ERP log |
| Tỷ lệ lỗi HS Code | % | ~5-10% ước tính | < 1% | HSC audit log |
| Tỷ lệ lô hàng có demurrage phát sinh | % | Chưa đo | < 5% | ERP surcharge log |
| % giao dịch không cần nhập liệu thủ công lần 2 | % | ~5% (ước tính) | > 95% | ERP audit |
| KH active dùng CAPP tracking | % KH active | 0% | > 60% trong 6 tháng | CAPP analytics |
| % NV giao dịch qua SAPP | % | 0% | > 90% trong 3 tháng | SAPP log |
| Thời gian phát hóa đơn sau giao hàng | Giờ | 24-72 giờ | ≤ 24 giờ (auto) | ERP invoice log |
