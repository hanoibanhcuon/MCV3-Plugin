# Biz-Docs Reference — Fintech / Tài chính số

Dùng trong Phase 3 (Biz-Docs) khi project thuộc lĩnh vực fintech, payment, lending.

---

## KPIs ngành Fintech

```
Transaction KPIs:
  - Total Payment Volume (TPV) / Gross Transaction Value (GTV)
  - Transaction success rate: target > 99.5%
  - Transaction latency (P99): < 3 giây cho payment
  - Failed transaction rate + reason breakdown
  - Settlement rate (T+1, T+2)

User KPIs:
  - Monthly Active Users (MAU) / Daily Active Users (DAU)
  - KYC pass rate: target > 80% (first attempt)
  - Onboarding completion rate
  - Churn rate / Dormant account rate (> 90 ngày không giao dịch)

Risk KPIs:
  - Fraud rate: target < 0.1% of TPV
  - Chargeback rate: target < 0.5%
  - False positive rate (legitimate transactions flagged): < 1%
  - AML suspicious transaction report (STR) count
  - NPL ratio (nếu có lending)

Revenue KPIs:
  - Take rate (% fee / transaction)
  - Revenue per MAU
  - Net Interest Margin (NIM) cho lending
  - Cost per transaction
```

---

## Quy trình nghiệp vụ cốt lõi

### PROC-FIN-001: Quy trình KYC (eKYC)

```
AS-IS (nhiều fintech nhỏ):
  User điền form online → Upload CCCD ảnh chụp → Staff review thủ công (1-3 ngày)

TO-BE:
  User chụp CCCD (front/back) → OCR extract → Face matching → AML screening →
  Auto-approve nếu pass hoặc manual review nếu cần → Activated < 5 phút

Steps chi tiết:
  1. User upload ảnh CCCD 2 mặt
  2. OCR đọc: họ tên, ngày sinh, địa chỉ, số CCCD
  3. Face liveness check (để chống giả mạo)
  4. Face matching: ảnh selfie vs. ảnh CCCD
  5. Sanction list screening (UN, OFAC, nội địa)
  6. PEP screening (Politically Exposed Person)
  7. KYC result: approved / rejected / manual_review

Business Rules:
  - BR-KYC-001: Match confidence ≥ 85% thì auto-approve
  - BR-KYC-002: Match 70-85%: escalate to manual review
  - BR-KYC-003: Match < 70%: auto-reject, user phải thử lại
  - BR-KYC-004: KYC hết hạn sau 2 năm → phải re-verify
  - BR-KYC-005: CCCD hết hạn → không accept
```

### PROC-FIN-002: Quy trình thanh toán

```
1. Initiate: User/merchant khởi tạo payment request
2. Validate: Check balance, limits, fraud score
3. Authorize: Bank/scheme authorization (real-time)
4. Capture: Debit user account
5. Settle: Transfer to merchant account (T+1 or T+2)
6. Notify: Webhook/push notification cho merchant + user
7. Reconcile: Daily settlement reconciliation

States:
  pending → authorized → captured → settled
  pending → declined
  captured → refunded (khi hoàn tiền)

Business Rules:
  - BR-PAY-001: Idempotency key bắt buộc để tránh duplicate payment
  - BR-PAY-002: Giao dịch > 20 triệu VND phải xác thực 2 lớp (NHNN yêu cầu)
  - BR-PAY-003: Rollback tự động nếu settlement không hoàn thành trong 24h
  - BR-PAY-004: Lưu transaction log ≥ 5 năm (Nghị định 52/2013)
```

---

## Business Rules Cốt lõi

### Transaction Limits

```
BR-LIM-001: Daily transaction limit per user tier:
  - Unverified: 1,000,000 VND / ngày, 5,000,000 VND / tháng
  - Basic KYC: 10,000,000 VND / ngày, 100,000,000 VND / tháng
  - Full KYC: không giới hạn (theo Thông tư 23/2019 NHNN)

BR-LIM-002: Single transaction limit: theo tier + loại giao dịch

BR-LIM-003: Velocity check: quá 5 giao dịch/5 phút → tạm block, yêu cầu xác thực
```

### AML Rules

```
BR-AML-001: Giao dịch đáng ngờ phải tạo STR report trong vòng 48h (Nghị định 19/2023)
BR-AML-002: Khách hàng PEP (Politically Exposed Person) → Enhanced Due Diligence
BR-AML-003: Giao dịch tiền mặt > 300 triệu VND/ngày → báo cáo NHNN
BR-AML-004: Blacklist screening mỗi giao dịch (OFAC, UN Sanctions, danh sách VN)
BR-AML-005: Transaction pattern monitoring: split transactions (structuring)
```

### Fraud Detection

```
BR-FRAUD-001: Giao dịch từ thiết bị/IP mới + địa lý bất thường → OTP bắt buộc
BR-FRAUD-002: 3 lần fail OTP trong 5 phút → lock account, require re-auth
BR-FRAUD-003: Real-time fraud score > 80 → block + manual review
BR-FRAUD-004: Card-not-present transaction → 3DS2 required
```

---

## Compliance Requirements

```
| Quy định | Nội dung | Tác động |
|---------|---------|---------|
| TT 23/2019 (NHNN) | Hoạt động trung gian thanh toán | KYC tiers, transaction limits |
| TT 09/2020 (NHNN) | An toàn thông tin trong TT | Encryption, pen test, ISMS |
| Nghị định 19/2023 | Phòng chống rửa tiền AML | STR reporting, CDD/EDD |
| TT 06/2023 (NHNN) | P2P Lending | Interest rate caps, borrower protection |
| Nghị định 13/2023 | Bảo vệ dữ liệu cá nhân | Data processing consent |
| PCI-DSS (nếu card) | Card data security | Tokenization, SAQ/ROC |
| ISO 27001 | ISMS | Mandatory for NHNN license |
```

---

## Pain Points phổ biến

```
- Onboarding chậm: KYC thủ công → user drop off cao
- Duplicate transaction: thiếu idempotency → double-charge
- Settlement không reconcile: manual reconciliation tốn nhiều giờ mỗi ngày
- Fraud không phát hiện realtime: chỉ biết khi khách hàng khiếu nại
- Downtime payment gây mất doanh thu: SLA 99.95% uptime cần thiết
- Báo cáo AML thủ công: late submission → phạt từ NHNN
```

---

## Entities Data Dictionary gợi ý

```
User: user_id, kyc_tier, kyc_status, kyc_verified_at, risk_score
KYCRecord: user_id, document_type, document_number, verification_method, result
Wallet: wallet_id, user_id, currency, balance, available_balance, hold_balance
Transaction: txn_id, idempotency_key, from_wallet, to_wallet, amount, fee,
             status, created_at, settled_at, metadata
TransactionLimit: user_id, tier, daily_limit, monthly_limit, single_limit
FraudAlert: txn_id, score, rules_triggered[], action, reviewed_by
AMLReport: txn_id, type (STR/CTR), submitted_at, reference_number, status
```
