# Financial Modeling — Finance Expert Reference

## ROI Calculation Template

### Công thức cơ bản

```
ROI = (Net Benefit / Total Investment) × 100%

Net Benefit = Total Benefits - Total Costs
Payback Period = Investment / Annual Net Benefit
```

### Template 3-Year ROI

```
INVESTMENT (Year 0):
  - Development cost: [A]
  - Infrastructure setup: [B]
  - Training: [C]
  - Project management: [D]
  Total Investment = A + B + C + D

ANNUAL BENEFITS:
  - Labor savings: [E per year]
  - Error reduction savings: [F per year]
  - Revenue increase: [G per year]
  - Compliance savings: [H per year]

ANNUAL OPERATING COSTS:
  - Cloud/hosting: [I per year]
  - Maintenance/support: [J per year]
  - License renewal: [K per year]

NET BENEFIT/YEAR = E+F+G+H - I-J-K

PAYBACK PERIOD = (A+B+C+D) / NET BENEFIT/YEAR
ROI (3yr) = ((NET BENEFIT × 3) - (A+B+C+D)) / (A+B+C+D) × 100%
```

---

## Development Cost Estimates (VN Market 2026)

### In-house Development

| Team Size | Rate (VND/tháng) |
|-----------|-----------------|
| Senior Full-stack | 30-50 triệu |
| Mid-level Full-stack | 15-25 triệu |
| Frontend specialist | 15-20 triệu |
| Backend specialist | 20-35 triệu |
| Mobile developer | 20-30 triệu |
| QA Engineer | 10-18 triệu |
| Product Manager | 20-40 triệu |
| DevOps | 25-40 triệu |

**Timeline estimate:**
- MVP (core features only): 3-6 tháng, 3-5 person team
- Full product: 9-18 tháng, 5-10 person team
- Enterprise grade: 18-36 tháng, 10+ person team

### Outsource to Agency (VN)

| Agency tier | Rate/month (team of 5) |
|------------|----------------------|
| Top tier | 100-200 triệu |
| Mid tier | 50-100 triệu |
| Freelancers | 30-60 triệu |

---

## Infrastructure Cost (Cloud VN 2026)

| Scale | AWS/GCP/Azure/month | VNG Cloud/month |
|-------|--------------------|--------------:|
| MVP (< 100 users) | $100-300 | 2-5 triệu |
| Small (< 1,000 users) | $500-1,500 | 5-15 triệu |
| Medium (< 10,000 users) | $2,000-5,000 | 20-50 triệu |
| Large (> 10,000 users) | $10,000+ | Custom |

---

## SaaS Unit Economics Formulas

```
LTV (Lifetime Value) = ARPU × (1 / Monthly Churn Rate)
  hoặc
LTV = ARPU × Average Customer Lifetime (months)

CAC (Customer Acquisition Cost) =
  (Sales + Marketing Costs in Period) / New Customers in Period

LTV:CAC Ratio = LTV / CAC
  Target: > 3:1 (healthy SaaS)

CAC Payback = CAC / (ARPU × Gross Margin %)
  Target: < 12 months

Magic Number = New ARR / Previous Quarter S&M Spend
  Target: > 0.75

NRR (Net Revenue Retention) =
  (Start MRR + Expansion - Contraction - Churn) / Start MRR
  Target: > 100% (expansion > churn)
```

---

## Sensitivity Analysis Template

| Scenario | Revenue -20% | Base Case | Revenue +20% |
|---------|-------------|----------|-------------|
| Payback period | | | |
| 3-year ROI | | | |
| Break-even month | | | |

Luôn chạy 3 scenarios: pessimistic, base, optimistic.
