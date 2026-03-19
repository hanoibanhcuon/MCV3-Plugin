# Industry Knowledge: Fintech & Financial Services

Knowledge base cho domain-expert agent khi làm dự án Fintech, Ngân hàng, Thanh toán.

---

## 1. Tổng quan ngành

### Phân loại Fintech Việt Nam

| Loại | Ví dụ | Đặc điểm |
|------|-------|----------|
| Payment/E-wallet | MoMo, ZaloPay, VNPay | Transaction volume cao, latency thấp |
| Digital Banking | Timo, CAKE, Cake by VPBank | Full banking features, mobile-first |
| P2P Lending | Tima, MCredit | Credit scoring, risk management |
| Insurtech | FWD, Manulife digital | Claim automation, underwriting |
| WealthTech | FVNDIT, Infina | Investment, robo-advisory |
| RegTech | Compliance tools | AML/KYC automation |
| Embedded Finance | BNPL, SME financing | Tích hợp vào platform khác |

### Hệ thống điển hình

```
Core Banking System (CBS)
├── Account Management (Quản lý tài khoản)
├── Deposit/Loan Management (Tiền gửi/Vay)
├── Payment Processing (Xử lý thanh toán)
├── Card Management (Thẻ)
├── Treasury (Ngân quỹ)
├── GL (General Ledger — Sổ cái)
└── Reporting (Báo cáo theo NHNN)

Digital Layer:
├── Mobile Banking App
├── Internet Banking
├── Open Banking APIs
└── Partner Integration
```

---

## 2. Business Rules đặc thù

### Quản lý tài khoản

```
BR-FIN-001: KYC (Know Your Customer) bắt buộc trước khi mở tài khoản
  - eKYC: Chụp CCCD + selfie + liveness detection
  - Level 1: < 100 triệu/ngày (chỉ cần CCCD)
  - Level 2: > 100 triệu/ngày (cần gặp trực tiếp hoặc video call)

BR-FIN-002: Mỗi CCCD chỉ được mở 1 tài khoản ví điện tử tại 1 tổ chức (theo TT 39/2014)
BR-FIN-003: Tài khoản không hoạt động > 6 tháng → chuyển "dormant", không tính phí dịch vụ
BR-FIN-004: Số dư tối thiểu theo quy định từng loại tài khoản
```

### Thanh toán

```
BR-FIN-010: Giới hạn giao dịch theo TT 39/2014:
  - Ví loại 1 (chỉ eKYC): 20 triệu/ngày, 100 triệu/tháng
  - Ví loại 2 (full KYC): 100 triệu/ngày, 500 triệu/tháng

BR-FIN-011: Giao dịch > 20 triệu phải OTP xác thực
BR-FIN-012: Hoàn tiền (refund) chỉ được về tài khoản nguồn
BR-FIN-013: T+0 settlement cho internal transfers, T+1 cho interbank
BR-FIN-014: Giao dịch failed phải có reconciliation report
```

### AML (Anti-Money Laundering)

```
BR-FIN-020: Báo cáo giao dịch đáng ngờ (STR) với AMLD trong 3 ngày làm việc
BR-FIN-021: Cash transactions > 300 triệu VNĐ → CTR (Currency Transaction Report)
BR-FIN-022: OFAC screening cho giao dịch quốc tế
BR-FIN-023: Velocity check: nhiều giao dịch nhỏ liên tiếp → trigger alert
BR-FIN-024: Politically Exposed Person (PEP) screening
```

---

## 3. Data Model đặc thù

### Core Entities

```
Customer (Khách hàng)
  customer_id (internal), cccd_number, full_name
  kyc_level: 0 | 1 | 2
  kyc_status: pending | approved | rejected | expired
  risk_score: 0-100 (ML-based)

Account (Tài khoản)
  account_id, customer_id
  account_type: savings | checking | wallet | loan
  balance (DECIMAL, không dùng FLOAT — tránh rounding errors!)
  available_balance (balance - holds)
  currency: VND | USD | EUR
  status: active | dormant | frozen | closed

Transaction (Giao dịch)
  transaction_id (UUID v7 — sortable by time)
  from_account, to_account
  amount, currency, fee
  type: transfer | payment | topup | withdrawal | refund
  channel: mobile | web | pos | atm | api
  status: pending | processing | completed | failed | reversed
  created_at, completed_at
  reference_number (external reference)
  idempotency_key (prevent duplicate transactions)

Ledger Entry (Sổ cái)
  entry_id, transaction_id
  account_id, amount, direction: DEBIT | CREDIT
  balance_after
  created_at
```

### Accounting Principles trong code

```
Mọi transaction = 2 ledger entries (double-entry bookkeeping):
  Debit FROM account
  Credit TO account

Invariant: Tổng DEBIT = Tổng CREDIT trong mọi transaction

SQL check:
  SELECT SUM(CASE WHEN direction='DEBIT' THEN amount ELSE -amount END)
  FROM ledger_entries
  WHERE transaction_id = ?
  HAVING SUM(...) = 0  -- Phải bằng 0
```

---

## 4. Compliance & Regulatory

### Quy định NHNN Việt Nam

```
Thông tư 39/2014/TT-NHNN — Dịch vụ trung gian thanh toán
  Hướng dẫn ví điện tử, payment gateway

Thông tư 16/2020/TT-NHNN — Mở và sử dụng TK thanh toán
  KYC requirements, dormant account rules

Nghị định 13/2023/NĐ-CP — Bảo vệ dữ liệu cá nhân
  → Áp dụng cho toàn bộ fintech

Luật Phòng, chống rửa tiền 2022
  AML reporting obligations

Thông tư 09/2020/TT-NHNN — An toàn thông tin TT ngân hàng
  Security requirements cho digital banking
```

### PCI-DSS (Payment Card Industry)

```
Nếu xử lý thẻ thanh toán:
  - Không lưu CVV sau authorization
  - Mã hóa PAN (card number) at rest
  - Tokenization thay vì lưu card number trực tiếp
  - Quarterly vulnerability scan
  - Annual penetration test
  - Network segmentation cho cardholder data environment
```

### Open Banking

```
Sandbox API testing bắt buộc trước production
Rate limiting: Protect từng customer endpoint
Consent management: Customer authorize data sharing
Audit: Log mọi API call với customer consent reference
```

---

## 5. Technical Patterns quan trọng

### Idempotency

```
Mọi payment API PHẢI hỗ trợ idempotency:

POST /api/transfers
Header: Idempotency-Key: {uuid-from-client}

Server:
  1. Check idempotency key đã processed chưa
  2. Nếu có: return same response (không process again)
  3. Nếu chưa: process và lưu key + response
  4. Key TTL: 24 giờ
```

### Distributed Locking

```
Prevent double-spend với distributed lock:
  - Redis: SET lock:account:{id} NX PX 5000 (5s)
  - Nếu lock thất bại: retry sau 100ms (max 3 lần)
  - Luôn giải phóng lock trong finally block
```

### Reconciliation

```
Daily reconciliation process:
  1. Sum của tất cả account balances = Total assets
  2. Mỗi settlement tự động so với external
  3. Discrepancy alert khi chênh lệch > 0
  4. Manual review required cho discrepancy
```

### Audit Trail

```
Transaction audit trail (immutable):
  - Append-only table (no UPDATE, no DELETE)
  - Hash chaining (sha256 của previous entry)
  - Signed bởi server private key
  - Store off-site backup
```

---

## 6. NFR đặc thù

```
Availability: 99.99% (downtime < 52 phút/năm)
Transaction latency: P95 < 500ms, P99 < 1000ms
Settlement: Real-time internal, T+1 interbank
Throughput: 1000 TPS peak (scale-out requirement)

Disaster recovery:
  RPO: 0 (no data loss for transactions)
  RTO: < 15 phút

Security:
  - HSM (Hardware Security Module) cho encryption keys
  - 2FA mandatory cho admin access
  - IP whitelist cho bank integrations
  - DDoS protection
  - VAPT (Vulnerability Assessment & Penetration Testing) hàng năm

Data retention:
  Transactions: 10 năm (theo quy định ngân hàng)
  KYC documents: 5 năm sau relationship end
```

---

## 7. Integration Patterns

### NAPAS (National Payment Corporation)

```
Napas24/7: Real-time interbank transfer
Format: ISO 8583 (card) / Napas proprietary (account transfer)
Settlement: T+0 (real-time gross settlement)
Test environment: Sandbox available
```

### BIDV, Vietcombank, etc.

```
Swift MT103: International transfers
Nostro/Vostro accounts cho FX
IBFT (Interbank Fund Transfer) via NAPAS
```

### eKYC Providers

```
VNPTSmartCA, CMC, VNPT AI
Dịch vụ: OCR CCCD, face matching, liveness detection
API: REST, return: verified | rejected | manual_review
SLA: < 3 seconds response time
```

---

## 8. Common Pitfalls

### Pitfall 1: Dùng FLOAT cho tiền tệ
❌ `FLOAT balance` → Rounding error sau nhiều transactions
✅ `DECIMAL(20,4) balance` → Chính xác tuyệt đối

### Pitfall 2: Thiếu idempotency
❌ Timeout → user retry → duplicate transaction
✅ Idempotency-Key header + server-side dedup

### Pitfall 3: Race condition khi check balance
❌ Check balance → wait → debit (balance changed in between)
✅ SELECT FOR UPDATE hoặc optimistic locking với version field

### Pitfall 4: Không có circuit breaker cho external calls
❌ NAPAS chậm → cascade failure toàn hệ thống
✅ Circuit breaker + fallback + retry with backoff

### Pitfall 5: Không log failed transactions
Transaction failed = vẫn phải log đầy đủ → reconciliation cần

### Pitfall 6: Hard-code limit values
BR-FIN-010 limit thay đổi theo quy định → config-driven, không hard-code
