# Interview Framework — Fintech / Tài chính số

Dùng khi user mô tả dự án thuộc lĩnh vực fintech, thanh toán, ví điện tử, vay vốn, đầu tư.

---

## Từ khóa trigger

`fintech`, `ví điện tử`, `thanh toán`, `chuyển tiền`, `vay`, `lending`,
`tín dụng`, `đầu tư`, `chứng khoán`, `ngân hàng`, `AML`, `KYC`, `NHNN`,
`payment gateway`, `QR code`, `nạp tiền`, `rút tiền`, `ví`, `VNPAY`, `MoMo`

---

## Câu hỏi phỏng vấn theo thứ tự

### Block 1 — Loại sản phẩm tài chính

```
1. Bạn đang xây dựng loại sản phẩm fintech nào?
   - Ví điện tử / payment wallet
   - Payment gateway (cổng thanh toán cho merchant)
   - P2P lending (vay ngang hàng)
   - Đầu tư / robo-advisor
   - BNPL (mua trước trả sau)
   - Quản lý tài chính cá nhân (PFM)
   - Core banking / neo-bank

2. Đối tượng khách hàng: B2C (người dùng cá nhân) hay B2B (doanh nghiệp)?
```

### Block 2 — Quy định & Giấy phép

```
3. Đã có giấy phép hoạt động từ NHNN chưa? Nếu có, loại giấy phép gì?
   → Giấy phép cung ứng dịch vụ trung gian thanh toán (Thông tư 39/2014)
   → Giấy phép hoạt động ngân hàng (Luật Tổ chức tín dụng)
   → Nếu chưa: scope phải tính đến compliance roadmap

4. Có phải báo cáo giao dịch đáng ngờ (STR) theo AML không?
   → Nghị định 19/2023: ngưỡng báo cáo, quy trình STR

5. Bạn có xử lý tiền của khách hàng trực tiếp không?
   → Nếu có: cần escrow/custodian arrangement, vốn pháp định
```

### Block 3 — Luồng tiền & Giao dịch

```
6. Mô tả một giao dịch từ đầu đến cuối. Ví dụ: khách chuyển tiền sẽ xảy ra điều gì?
   → Giúp map transaction lifecycle

7. Có bao nhiêu loại giao dịch khác nhau?
   (Nạp tiền, rút tiền, chuyển tiền, thanh toán, hoàn tiền, phí, lãi...)

8. Tiền nằm ở đâu khi đang giao dịch? Ai là custodian?
   → Settlement architecture, float management
```

### Block 4 — KYC / Định danh khách hàng

```
9. Quy trình xác minh danh tính khách hàng (KYC) như thế nào?
   Gợi ý: eKYC online (CCCD chip, face matching) hay in-person

10. Có dùng xác thực sinh trắc học không? (Face ID, vân tay)
    → Tích hợp eKYC vendor (VinCSS, VNPay eKYC, Fidentity...)

11. Mức độ xác thực: Basic (giới hạn giao dịch nhỏ) vs. Full (không giới hạn)?
    → Tiered KYC theo Thông tư 23/2019 NHNN
```

### Block 5 — Tích hợp bên ngoài

```
12. Cần tích hợp với những hệ thống nào?
    - Ngân hàng (NAPAS, BIDV, VCB, Techcombank...)
    - Payment gateways (VNPay, MoMo, ZaloPay, OnePay)
    - NAPAS (hạ tầng thanh toán quốc gia)
    - Cơ sở dữ liệu dân cư (VNeID, CCCD)

13. Có cần tích hợp với NAPAS 24/7 (Chuyển tiền nhanh liên ngân hàng) không?
```

### Block 6 — Security & Fraud

```
14. Làm thế nào để phát hiện giao dịch gian lận (fraud detection)?
    → Rule-based, ML model, or third-party (Seon, Sardine...)

15. Xác thực giao dịch: OTP SMS, app OTP, biometric, hardware token?
    → NHNN yêu cầu xác thực 2 lớp cho giao dịch > ngưỡng nhất định

16. Có yêu cầu về lưu trữ dữ liệu (data residency)?
    → Thông tư 09/2020 NHNN: dữ liệu giao dịch lưu tại VN
```

---

## IDs để assign

```
PROB: Vấn đề đang giải quyết (thanh toán chậm, thiếu KYC digital, fraud cao...)
BG-BUS: Loại sản phẩm, target market, competitive landscape
SC-IN: Core features (wallet, payment, KYC, reporting)
SC-OUT: Giao dịch quốc tế, đổi ngoại tệ (nếu không có license)
GL: Transaction volume target, compliance milestone, go-live date
CON: Giấy phép, vốn pháp định, timeline regulatory approval
```

---

## Quy định NHNN quan trọng

```
- Thông tư 23/2019: Hoạt động cung ứng dịch vụ trung gian thanh toán
- Thông tư 09/2020: An toàn hệ thống thông tin trong thanh toán
- Nghị định 19/2023: Phòng chống rửa tiền (AML)
- Circular 06/2023: Cho vay online, P2P lending framework
- Yêu cầu vốn: Ví điện tử ≥ 50 tỷ VND; Chuyển tiền điện tử ≥ 300 tỷ VND
```

---

## Red flags cần warn user

```
⚠️ Xử lý tiền mà không có giấy phép NHNN:
   → Vi phạm pháp luật nghiêm trọng → phải tư vấn pháp lý trước

⚠️ Bỏ qua audit trail cho giao dịch tài chính:
   → Pháp lý bắt buộc, cần immutable transaction log

⚠️ KYC không đủ → fraud risk cao:
   → Tối thiểu: xác thực CCCD + số điện thoại (OTP)

⚠️ Không có transaction rollback mechanism:
   → Giao dịch tài chính cần idempotency + saga pattern

⚠️ PCI-DSS nếu lưu thông tin thẻ tín dụng:
   → Cần đánh giá và certification (QSA)
```
