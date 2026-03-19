# Industry Knowledge — SaaS / B2B Software

## Quy trình chuẩn SaaS Operations

### Customer Lifecycle

```
Lead acquired
  → Demo / Trial signup
  → Onboarding (activation)
  → Regular usage (adoption)
  → Expansion (upsell/cross-sell)
  → Renewal
  OR
  → Churn (exit)
```

### Onboarding Flow (Best Practice)

```
Day 0: Account created → Welcome email → Setup wizard
Day 1: First core action completed (activation event)
Day 3-7: Check-in email / call (CSM triggered)
Day 14: Usage review + advanced features intro
Day 30: First value delivered confirmation
Day 45: Case study / reference request nếu NPS cao
```

---

## Data Entities Cốt lõi

```
Organization (Tenant)
  ├── id, name, slug
  ├── plan_id → Plan
  ├── status (trialing, active, past_due, churned)
  ├── trial_ends_at
  └── billing_email

User
  ├── org_id
  ├── email, name, role
  ├── last_active_at
  └── permissions[]

Subscription
  ├── org_id, plan_id
  ├── billing_cycle (monthly/annual)
  ├── current_period_start/end
  ├── status (active, past_due, canceled)
  └── payment_method_id

UsageEvent (Cho usage-based pricing)
  ├── org_id, feature_key
  ├── quantity, unit
  └── recorded_at

AuditLog
  ├── org_id, user_id
  ├── action, resource_type, resource_id
  ├── ip_address
  └── created_at
```

---

## Multi-tenancy Patterns

| Pattern | Mô tả | Khi dùng |
|---------|-------|---------|
| Shared schema | Tất cả tenants chung DB, tách bằng `org_id` | Startup, < 1000 tenants |
| Schema-per-tenant | PostgreSQL schema riêng mỗi tenant | Mid-scale, data isolation |
| DB-per-tenant | Database riêng mỗi tenant | Enterprise, compliance strict |

**VN market:** Shared schema đủ cho hầu hết trường hợp. Data isolation requirements ít nghiêm ngặt hơn Mỹ/EU trừ healthcare/finance.

---

## Compliance SaaS

| Yêu cầu | Khi áp dụng |
|---------|-----------|
| PDPA (Personal Data Protection) | Xử lý data khách hàng cá nhân |
| SOC 2 Type II | Khi enterprise khách hàng yêu cầu |
| ISO 27001 | Government / large enterprise |
| HTTPS everywhere | Luôn luôn |
| MFA support | Should have cho enterprise |
| Data residency VN | Khi khách hàng là cơ quan nhà nước |

---

## Common Pitfalls

- ⚠️ **Không có billing grace period** → User bị lock out ngay khi quá hạn
- ⚠️ **Không có usage limits + alerts** → Abuse hoặc unexpected costs
- ⚠️ **Email deliverability thấp** → Transactional emails vào spam
- ⚠️ **Hard delete user data** → Vi phạm compliance, không audit được
- ⚠️ **Không có impersonate** → Support không thể debug customer issues
- ⚠️ **API rate limiting thiếu** → DDoS từ một tenant ảnh hưởng tất cả

---

## Tính năng thường bị quên

- **Billing portal** (khách tự update thẻ, download invoice)
- **Usage dashboard** (khách tự xem mình dùng bao nhiêu)
- **Announcement/changelog** trong app
- **Feature flags** (rollout dần, A/B test)
- **Admin impersonation** (support team login as customer)
- **API key management** (generate, revoke, permissions)
- **Webhook system** (cho khách integrate với tools khác)
