# Industry Knowledge: E-Commerce & Marketplace

Knowledge base cho domain-expert agent khi làm dự án Thương mại điện tử, Marketplace.

---

## 1. Tổng quan ngành

### Phân loại E-Commerce

| Loại | Ví dụ | Đặc điểm |
|------|-------|----------|
| B2C marketplace | Shopee, Lazada | Seller onboarding, product catalog |
| B2B marketplace | Sendo B2B, TradeIndia | Bulk orders, invoice management |
| Direct-to-consumer | Thương hiệu riêng | Product + brand focused |
| Social Commerce | TikTok Shop, Facebook Shop | Live streaming, influencer |
| Headless Commerce | API-first platform | Omnichannel |
| Quick Commerce | Baemin, Now | Delivery < 30 phút |

### Hệ thống điển hình

```
E-Commerce Platform
├── Storefront (Giao diện mua hàng)
│   ├── Product Catalog
│   ├── Search & Discovery
│   └── Cart & Checkout
├── Order Management System (OMS)
├── Inventory Management
├── Seller Center (Marketplace)
├── Warehouse Management (WMS)
├── Delivery/Logistics
├── Payment Gateway
├── Customer Service
└── Analytics & Reporting
```

---

## 2. Business Rules đặc thù

### Catalog & Pricing

```
BR-EC-001: Mỗi sản phẩm có SKU unique trong hệ thống
BR-EC-002: Giá hiển thị = Giá gốc - Discount + Tax (nếu B2B)
BR-EC-003: Flash sale: giá flash > giá gốc sẽ bị từ chối
BR-EC-004: Combo pricing: giá combo không được > tổng giá lẻ
BR-EC-005: Giá phải được lưu lại tại thời điểm đặt hàng (snapshot pricing)
  → Không dùng lookup price khi fulfill — giá có thể thay đổi
```

### Inventory

```
BR-EC-010: Không cho đặt khi tồn kho = 0 (trừ pre-order)
BR-EC-011: Hold inventory ngay khi add to cart (configurable: 15-30 phút)
BR-EC-012: Khi đặt hàng thành công → decrement available_stock
BR-EC-013: Khi cancel/return → increment available_stock
BR-EC-014: Safety stock: alert khi stock < reorder_point
BR-EC-015: Backorder option: cho đặt khi stock = 0, fulfilled khi về hàng
```

### Order Management

```
BR-EC-020: Order state machine:
  pending → confirmed → processing → shipped → delivered → completed
  pending → cancelled (user cancel)
  confirmed → cancelled (timeout payment)
  delivered → return_requested → refunded

BR-EC-021: Thời gian cancel: < 30 phút sau đặt hoặc chưa đổi sang "processing"
BR-EC-022: Return window: 7-30 ngày (tùy policy), tính từ delivered_at
BR-EC-023: Partial fulfillment: có thể ship một phần đơn hàng
BR-EC-024: Split order: 1 order có nhiều sellers → tách thành sub-orders
```

### Payment

```
BR-EC-030: Capture payment sau khi confirm tồn kho (authorize first, capture after)
BR-EC-031: Refund chỉ về payment method gốc
BR-EC-032: COD (Cash on Delivery): confirm khi giao thành công
BR-EC-033: BNPL (Buy Now Pay Later): kiểm tra credit limit trước
BR-EC-034: Escrow (Marketplace): giữ tiền cho đến khi buyer confirm received
```

### Promotion & Voucher

```
BR-EC-040: Voucher có thể stack (cộng dồn) hay exclusive — config per voucher
BR-EC-041: Voucher per-user limit: check trước khi apply
BR-EC-042: Minimum order value cho voucher
BR-EC-043: Voucher blackout: không áp dụng cho products bị exclude
BR-EC-044: Loyalty points: không dùng kết hợp với voucher (business decision)
BR-EC-045: Referral code: credit chỉ khi referred user complete first purchase
```

---

## 3. Data Model đặc thù

### Product Catalog

```
Product (Sản phẩm — parent)
  product_id, name, description
  brand_id, category_ids[]
  status: draft | active | inactive | archived

ProductVariant (SKU — actual sellable unit)
  sku_id, product_id
  attributes: { color: 'Red', size: 'L', ... }
  price (DECIMAL), compare_at_price
  weight, dimensions
  barcode

Inventory
  sku_id, warehouse_id
  on_hand: int    — Tổng trong kho
  reserved: int   — Đã hold bởi orders
  available: int  — on_hand - reserved (có thể mua)
```

### Order

```
Order
  order_id, customer_id, order_number (human-readable)
  status, created_at, expires_at (payment deadline)
  subtotal, discount_total, shipping_fee, tax_total, grand_total

OrderLine
  line_id, order_id, sku_id
  quantity, unit_price (SNAPSHOT — không reference live price!)
  discount_amount
  fulfillment_status

Payment
  payment_id, order_id
  amount, currency
  method: credit_card | e-wallet | COD | bank_transfer
  gateway: vnpay | momo | stripe
  status: authorized | captured | refunded | failed
  gateway_reference

Shipment
  shipment_id, order_id
  carrier: GHN | GHTK | SPX | J&T | DHL
  tracking_number
  status: pending | picked_up | in_transit | out_for_delivery | delivered | failed
```

### Marketplace Extensions

```
Seller (Người bán)
  seller_id, shop_name
  verification_status: pending | verified | suspended
  tier: basic | premium | official
  commission_rate (per category)

SellerProduct (mapping)
  seller_id, sku_id
  seller_price, seller_stock
  fulfillment_type: seller | platform_warehouse

Commission
  order_line_id, seller_id
  gross_amount, commission_rate, commission_amount, net_payout
  status: pending | settled | disputed
```

---

## 4. Cart & Checkout Flow

### Add to Cart

```
1. Check product active, in stock
2. Reserve inventory (soft lock, TTL: 30 phút)
3. Add to cart với snapshot price
4. Calculate cart totals

Race condition prevention:
  Redis INCR/DECR cho inventory
  Atomic: check-and-decrement
```

### Checkout Funnel

```
Cart → Address → Shipping → Payment → Review → Confirm

Optimization (reduce drop-off):
  - One-page checkout option
  - Guest checkout (no login required)
  - Save card for returning users
  - Auto-fill address from history
  - Show estimated delivery date early
```

### Payment Flow

```
1. Create order (status: pending)
2. Request payment → redirect/QR/deeplink to gateway
3. Gateway callback → update order
   Success → status: confirmed, capture payment, reduce inventory
   Failed → status: payment_failed, release inventory hold
4. Timeout (15 phút) → auto-cancel, release inventory hold
```

---

## 5. Search & Discovery

### Search Architecture

```
Product search engine: Elasticsearch / OpenSearch
  - Full-text search (vi analyzer for Vietnamese)
  - Faceted filtering (price range, brand, category)
  - Sort: relevance, price, newest, bestseller, rating

Personalization:
  - User behavior tracking (views, clicks, purchases)
  - Recommendation engine (collaborative filtering or ML)
  - "Frequently bought together"
  - "Customers also viewed"
```

### SEO for E-Commerce

```
URL structure: /category/{slug}/{product-slug}
Product schema markup (JSON-LD): offers, reviews, availability
Canonical URLs for variant pages
Sitemap auto-generation
Page speed: Core Web Vitals (LCP < 2.5s, CLS < 0.1)
```

---

## 6. Integration Patterns

### Logistics (Giao vận)

```
GHN (Giao Hàng Nhanh): API tạo đơn, tracking
GHTK (Giao Hàng Tiết Kiệm): API phổ biến cho SME
SPX Express (Shopee): Integrated logistics
J&T Express, Ninja Van, DHL: APIs khác nhau

Unified shipping abstraction:
  → Abstract các carriers → 1 interface cho OMS
  → Rate shopping: so sánh giá + ETA
  → Webhook cho tracking updates
```

### Payment Gateways Việt Nam

```
VNPay: Phổ biến nhất, QR + card
MoMo: E-wallet, user base lớn
ZaloPay: Tích hợp Zalo ecosystem
OnePay: International cards
Stripe: Cho global payment
PayOS (Kết nối ngân hàng): FPT/MB Bank

Integration pattern:
  → Webhook cho async payment confirmation
  → Signature verification bắt buộc
  → Idempotency key cho retry-safe calls
```

### Tax (Thuế)

```
VAT: 8% hoặc 10% tùy loại hàng (sau tháng 12/2023)
Import duty: Cho cross-border orders
Electronic invoice: Bắt buộc khi doanh thu > threshold
  → Tích hợp với HTKK, FAST, MISA
```

---

## 7. Analytics & Metrics

### Key Metrics

```
GMV (Gross Merchandise Value) — Tổng giá trị hàng bán
Net Revenue — GMV - returns - discounts
Conversion Rate — Visitors → Orders
AOV (Average Order Value)
CAC (Customer Acquisition Cost)
LTV (Customer Lifetime Value)
NPS (Net Promoter Score)
CSAT (Customer Satisfaction)
Seller OTDR (On-Time Delivery Rate)
Seller Return Rate
```

### Dashboard requirements

```
Real-time: Orders, revenue, inventory alerts
Daily: Conversion funnel, top products, sales by category
Weekly: Cohort retention, GMV trends
Monthly: P&L, seller performance, logistics efficiency
```

---

## 8. NFR đặc thù

```
Peak traffic handling: 10x normal (Flash sales, 11.11, Black Friday)
  → Auto-scaling, circuit breakers, rate limiting
  → Queue purchases khi overload

Inventory accuracy: Real-time sync < 1 second
  → Eventual consistency with immediate UX feedback
  → Compensating transactions cho race conditions

Image CDN: < 500ms image load time globally
Page performance: LCP < 2.5s

Availability: 99.9% (3 nines)
  → Planned maintenance: off-peak hours + rollback plan
```

---

## 9. Common Pitfalls

### Pitfall 1: Race condition trên inventory
❌ Read stock → check > 0 → decrement (không atomic)
✅ UPDATE inventory SET available = available - 1 WHERE available >= 1 (atomic)
✅ Redis: DECRBY atomic operation

### Pitfall 2: Price drift
❌ Fulfill với giá hiện tại (có thể khác lúc đặt)
✅ Snapshot giá vào OrderLine tại thời điểm đặt hàng

### Pitfall 3: Cart abandonment không recover inventory
❌ Hold inventory mãi → stock thực tế thấp hơn available
✅ TTL trên cart item, background job release expired holds

### Pitfall 4: Thiếu idempotency trên payment
❌ Payment timeout → retry → double charge
✅ Idempotency key = order_id + attempt_number

### Pitfall 5: N+1 queries trên product listing
❌ Load 100 products + 100 queries cho inventory
✅ JOIN hoặc batch load inventory cho listing

### Pitfall 6: Không có rate limiting cho add to cart
Flash sale → bot grab all stock → real user cannot buy
✅ Rate limit per user, CAPTCHA cho high-demand products
