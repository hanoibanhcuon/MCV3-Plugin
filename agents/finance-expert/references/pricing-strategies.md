# Pricing Strategies — Finance Expert Reference

## VN Market Context

### Thực tế thị trường phần mềm B2B tại Việt Nam

| Phân khúc | Budget điển hình/năm | Pricing expectation |
|-----------|--------------------|--------------------|
| SME (< 50 nhân viên) | 20-100 triệu VND | < 2 triệu/tháng |
| Mid-market (50-200) | 100-500 triệu | 5-20 triệu/tháng |
| Enterprise (> 200) | 500 triệu - 2 tỷ+ | Custom contract |

**Quan trọng:** Doanh nghiệp VN thường kỳ vọng:
- Trial miễn phí 30 ngày
- Không tăng giá sau khi ký hợp đồng
- Hỗ trợ tiếng Việt
- Triển khai local (data tại VN)

---

## Pricing Models

### 1. Per-Seat / Per-User

```
Ưu điểm: Dễ hiểu, scale tự nhiên theo tổ chức lớn lên
Nhược: Khách hàng hạn chế users để tiết kiệm → low adoption
Dùng khi: Collaboration tools, CRM, project management

VN Benchmark:
- Basic user: 200-500k VND/user/tháng
- Power user: 500k-2 triệu/user/tháng
```

### 2. Per-Transaction / Per-Usage

```
Ưu điểm: Khách hàng chỉ trả theo giá trị nhận được
Nhược: Revenue unpredictable; khách hàng lo ngại bill cao
Dùng khi: Logistics platform, payment gateway, SMS/email API

VN Benchmark:
- Logistics: 1-5k VND/đơn hàng processed
- SMS: 500-800 VND/tin
- Transaction: 0.3-2% per transaction
```

### 3. Flat Monthly/Annual

```
Ưu điểm: Predictable, simple
Nhược: Risk mismatch (low usage = overpaying)
Dùng khi: Simple tools, low-complexity features

VN SME pricing:
- Starter: 500k-2 triệu/tháng
- Professional: 2-5 triệu/tháng
- Business: 5-15 triệu/tháng
```

### 4. Tiered (Feature-based)

```
Ưu điểm: Land-and-expand, upsell path rõ ràng
Nhược: Complexity, "good-enough" syndrome ở tier thấp
Dùng khi: SaaS với nhiều segment khác nhau

Thiết kế tier VN:
- Tier 1: Core features (giá thấp/free để acquire)
- Tier 2: Analytics + Integrations (chuyển đổi tier)
- Tier 3: Enterprise features (customization, SLA, dedicated support)
```

### 5. Implementation + Annual License

```
Dùng khi: ERP, bespoke software, complex deployments
Cấu trúc điển hình:
- Phí triển khai: 50-500 triệu (một lần)
- License hàng năm: 20-50% phí triển khai
- Maintenance: 15-20% phí triển khai/năm
```

---

## Định giá dựa trên Value

**Công thức cơ bản:**
```
Max Price ≤ (Value delivered to customer) × 10-30%

Ví dụ:
- Hệ thống tiết kiệm 2 nhân sự × 15 triệu/tháng = 30 triệu/tháng value
- Mức giá có thể tính: 3-9 triệu/tháng (10-30% of value)
```

**Value đo bằng:**
- Cost saved (labor, errors, wastage)
- Revenue enabled (upsell, faster processing)
- Risk reduced (compliance, errors)
- Time saved × hourly rate

---

## Discount Guidelines

| Tình huống | Discount hợp lý |
|-----------|----------------|
| Annual vs monthly | 15-20% |
| Startup / NGO | 20-40% |
| Reference customer | 15-25% |
| Multi-year contract | 10-20% per year |
| Volume (nhiều users) | 10-15% |

**Red flags:** Nếu cần discount >50% để close deal → customer không phải ICP.
