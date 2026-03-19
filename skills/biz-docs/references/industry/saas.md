# Biz-Docs Reference — SaaS / Software as a Service

Dùng trong Phase 3 (Biz-Docs) khi project là SaaS platform, subscription-based software.

---

## KPIs ngành SaaS

```
Growth Metrics:
  - Monthly Recurring Revenue (MRR) / Annual Recurring Revenue (ARR)
  - MRR Growth Rate: target > 10-20% / tháng (early stage)
  - New MRR, Expansion MRR, Churned MRR, Net New MRR
  - Number of paying customers / seats

Retention & Churn:
  - Customer Churn Rate: target < 5% / tháng (B2C), < 2% / tháng (B2B)
  - Revenue Churn Rate (Net): Net Negative Churn là lý tưởng
  - Customer Lifetime Value (LTV)
  - LTV/CAC ratio: target > 3x
  - Net Revenue Retention (NRR): > 100% = growth từ existing customers

Engagement:
  - Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
  - Feature adoption rate
  - Time-to-value (thời gian đến lúc user nhận được giá trị đầu tiên)
  - Product Qualified Lead (PQL) conversion rate

Support:
  - Average Resolution Time (ART)
  - First Response Time (FRT)
  - Customer Satisfaction Score (CSAT)
  - Net Promoter Score (NPS)
```

---

## Quy trình nghiệp vụ cốt lõi

### PROC-SAAS-001: Quy trình Onboarding khách hàng mới

```
AS-IS (SaaS không có onboarding tốt):
  Đăng ký → Vào app → Không biết làm gì → Bỏ (churn trong 14 ngày đầu)

TO-BE:
  Đăng ký → Welcome email + activation link → Email verified →
  Onboarding checklist (setup wizard) → Import dữ liệu mẫu →
  Aha moment (lần đầu thấy giá trị) → Invite team members →
  Chuyển từ trial sang paid

Business Rules:
  - BR-ONB-001: Trial 14 ngày (free, không cần thẻ)
  - BR-ONB-002: Reminder emails: ngày 7 (halfway), ngày 12 (2 ngày nữa hết), ngày 14 (expired)
  - BR-ONB-003: Data không mất khi trial hết hạn (giữ 30 ngày để upgrade)
  - BR-ONB-004: Mỗi user chỉ 1 trial per email/domain
  - BR-ONB-005: Onboarding progress tracking: nếu < 50% sau 7 ngày → trigger in-app guide
```

### PROC-SAAS-002: Quy trình Billing & Subscription

```
Trial expires → Upgrade prompt → Select plan → Enter payment info →
Charge (first payment) → Subscription active → Monthly/Annual renewal →
Failed payment → Dunning process → Grace period → Suspend → Cancellation

Subscription states:
  trialing → active → past_due → suspended → cancelled → paused

Business Rules:
  - BR-BILL-001: Charge vào ngày đầu chu kỳ (không pro-rate trừ khi upgrade)
  - BR-BILL-002: Upgrade mid-cycle: charge chênh lệch pro-rate ngay
  - BR-BILL-003: Downgrade: áp dụng cuối chu kỳ hiện tại
  - BR-BILL-004: Failed payment: retry sau 3 ngày, 5 ngày, 7 ngày (dunning)
  - BR-BILL-005: Grace period 7 ngày sau payment failure trước khi suspend
  - BR-BILL-006: Annual plan: refund prorated nếu cancel trong 30 ngày đầu
  - BR-BILL-007: Invoice phải được gửi email trong vòng 24h sau mỗi charge
```

### PROC-SAAS-003: Quy trình Churn Prevention

```
Risk signals (triggers):
  - Login frequency giảm > 50% so với 30 ngày trước
  - Feature adoption < 3 features sau 30 ngày
  - Support tickets nhiều, sentiment negative
  - Upcoming renewal, chưa confirm

Actions:
  - Auto: in-app notification, educational emails, feature tips
  - Human: Customer Success Manager (CSM) outreach cho high-value accounts
  - Offer: discount để retain (thường 10-20% cho 1 năm)

Business Rules:
  - BR-CHR-001: Account health score tính weekly, alert CSM khi < 40
  - BR-CHR-002: Không giảm giá proactively — chỉ khi user request cancel
  - BR-CHR-003: Exit survey bắt buộc khi user cancel (giúp cải thiện product)
```

---

## Business Rules: Pricing & Plans

```
BR-PRICE-001: Plan limits enforced realtime (không cho vượt, hoặc upsell prompt)
  - Starter: 1 user, 100 records
  - Professional: 5 users, unlimited records
  - Enterprise: unlimited users, custom limits

BR-PRICE-002: Per-seat pricing: billing tự động khi thêm user
BR-PRICE-003: Usage-based billing: track daily, charge cuối tháng
BR-PRICE-004: Coupon codes: one-time discount hoặc recurring discount
BR-PRICE-005: Non-profit/startup discount: manual apply, cần verify
BR-PRICE-006: Price lock cho annual customers: giá không tăng trong năm đầu
```

---

## Compliance Requirements

```
| Quy định | Áp dụng khi | Nội dung |
|---------|------------|---------|
| GDPR (EU) | Có khách EU | Right to erasure, data portability, DPA |
| Nghị định 13/2023 (VN) | Khách VN | Consent management, data localization |
| SOC 2 Type II | Enterprise customers | Security, availability, confidentiality |
| PDPA (Thailand) | Có khách Thai | Tương tự GDPR |
| Hóa đơn điện tử (VN) | Khách hàng VN | Xuất HĐĐT cho giao dịch |
| Thuế nhà thầu nước ngoài | Thu tiền từ nước ngoài vào VN | 5% VAT + 5% TNDN cho dịch vụ |
```

---

## Pain Points phổ biến SaaS

```
- High churn trong 30-60 ngày đầu: time-to-value quá dài
- Feature bloat: thêm quá nhiều tính năng, user không biết dùng gì
- Pricing không aligned với value: user feel ripped off khi vượt limit
- Billing fails không được xử lý: user bị suspend surprise
- Không có usage analytics: không biết feature nào được dùng nhiều
- Manual dunning: tốn thời gian finance team
- No self-service: user phải ticket support cho mọi thứ nhỏ
- Thiếu data export: users sợ vendor lock-in → không dám commit
```

---

## Multi-tenancy Architecture Decisions

```
Tenant isolation models:
  1. Silo model: mỗi tenant có database riêng
     ✅ Isolation hoàn toàn, compliance dễ
     ❌ Tốn tài nguyên, khó scale
     → Dùng cho Enterprise, healthcare, fintech

  2. Pool model: tất cả tenant share database, row-level isolation
     ✅ Hiệu quả tài nguyên, dễ scale
     ❌ Risk data leak nếu bug, phức tạp hơn
     → Dùng cho SMB SaaS

  3. Bridge model: kết hợp (metadata chung, data riêng per tenant)
     → Middle ground

Business Rule về tenant:
  - BR-TENANT-001: Mọi query phải include tenant_id filter
  - BR-TENANT-002: Cross-tenant data access chỉ cho super admin role
  - BR-TENANT-003: Tenant data export phải available theo yêu cầu (GDPR)
  - BR-TENANT-004: Deleted tenant: soft delete, giữ data 90 ngày
```

---

## Entities Data Dictionary gợi ý

```
Tenant (Organization): id, name, slug, plan_id, status, trial_ends_at, mrr
User: id, tenant_id, email, role, last_login, onboarding_completed
Plan: id, name, price_monthly, price_annual, limits{} (seats, storage, api_calls)
Subscription: tenant_id, plan_id, status, current_period_start, current_period_end
Invoice: id, tenant_id, amount, status, paid_at, line_items[]
UsageRecord: tenant_id, metric (api_calls/storage/seats), date, value
AccountHealthScore: tenant_id, score, signals[], computed_at
ChurnEvent: tenant_id, reason, feedback, mrr_lost, churned_at
```
