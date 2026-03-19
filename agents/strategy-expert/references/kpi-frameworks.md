# KPI Frameworks — Strategy Expert Reference

## North Star Metric

**Định nghĩa:** Một metric duy nhất phản ánh giá trị cốt lõi mà sản phẩm deliver cho khách hàng.

| Loại sản phẩm | North Star Metric phổ biến |
|--------------|--------------------------|
| Marketplace | GMV (Gross Merchandise Value) |
| SaaS B2B | Active seats × Feature adoption |
| Logistics platform | Successful deliveries/month |
| ERP | Active modules × Daily transactions |
| E-commerce | Revenue × Repeat rate |

---

## OKR Framework (Objectives & Key Results)

### Cấu trúc

```
Objective: [Định tính, inspiring, time-bound]
  KR-1: [Định lượng, có số cụ thể]
  KR-2: [Định lượng, có số cụ thể]
  KR-3: [Định lượng, có số cụ thể]
```

### Ví dụ cho dự án logistics

```
Objective: Trở thành platform logistics số 1 cho SME xuất nhập khẩu VN
  KR-1: Đạt 500 công ty đang active (giao dịch ≥1/tuần) vào Q4
  KR-2: Giảm thời gian xử lý đơn hàng từ 4h → 30 phút
  KR-3: NPS ≥ 50 từ khách hàng active
```

---

## KPI Tree (Cây KPIs)

### Cách xây dựng

```
Business Goal
├── Leading Indicator 1 (có thể ảnh hưởng)
│   ├── Activity KPI 1a (team kiểm soát được)
│   └── Activity KPI 1b
└── Leading Indicator 2
    ├── Activity KPI 2a
    └── Activity KPI 2b
```

### Ví dụ KPI Tree — Logistics SaaS

```
Revenue Growth (Lagging)
├── MRR
│   ├── New MRR (tháng)
│   │   ├── Leads qualified/tháng
│   │   └── Demo → close rate
│   ├── Expansion MRR
│   │   └── Upsell: số công ty upgrade plan
│   └── Churn MRR
│       └── Churn rate (<3%/tháng target)
└── Usage Depth
    ├── DAU/MAU ratio (engagement)
    └── Features adopted per company
```

---

## Balanced Scorecard cho Enterprise Projects

| Perspective | KPI Examples |
|------------|-------------|
| **Financial** | ROI, NPV, Payback period |
| **Customer** | CSAT, NPS, Retention rate |
| **Internal Process** | Cycle time, Error rate, Automation % |
| **Learning & Growth** | Employee adoption rate, Training hours |

---

## Thresholds phổ biến (Benchmarks VN/ASEAN)

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| Monthly Churn (SaaS) | >5% | 3-5% | 1-3% | <1% |
| CAC Payback | >24m | 12-24m | 6-12m | <6m |
| NPS | <0 | 0-30 | 30-50 | >50 |
| Ticket resolution (hrs) | >48h | 24-48h | 4-24h | <4h |
| System uptime | <99% | 99-99.5% | 99.5-99.9% | >99.9% |
