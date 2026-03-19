# Domain Knowledge — Bất động sản (Real Estate)

Knowledge base cho Domain Expert Agent khi detect ngành Bất động sản / Real Estate.

---

## Từ khóa nhận dạng

`bất động sản`, `BĐS`, `căn hộ`, `nhà phố`, `đất nền`, `chung cư`, `môi giới`,
`sổ đỏ`, `sổ hồng`, `cho thuê`, `mua bán nhà`, `dự án`, `chủ đầu tư`, `CRM bất động sản`

---

## Phân loại sản phẩm BĐS

| Loại | Đặc điểm | Pháp lý |
|------|---------|---------|
| Căn hộ chung cư | Sở hữu 50 năm hoặc lâu dài | Giấy chứng nhận quyền sở hữu nhà ở |
| Nhà phố / biệt thự | Sở hữu lâu dài + đất | Sổ đỏ (GCN QSDĐ) |
| Đất nền | Quyền sử dụng đất | Sổ đỏ / Sổ hồng |
| Shophouse | Thương mại tầng 1 + nhà ở | Sổ đỏ hoặc sổ hồng theo loại |
| Văn phòng / Office | Thương mại | Giấy chứng nhận quyền sở hữu |
| BĐS công nghiệp | Khu công nghiệp, kho bãi | Hợp đồng thuê đất KCN |

---

## Core Modules hệ thống BĐS

### 1. Property Listing Management

```
Entities:
  - Property: id, projectId, code, type, floor, area, bedroom, bathroom,
               direction, view, price, status, legalStatus, images[], virtualTourUrl
  - Project: id, name, developer, location, totalUnits, amenities[], status
  - PropertyStatus: available | reserved | deposited | sold | rented

Key features:
  - Quản lý tồn kho căn hộ / lô đất theo trạng thái
  - Upload nhiều ảnh + virtual tour (360°)
  - Cập nhật giá theo đợt mở bán (price list)
  - Phân tầng/phân khu trực quan (floor plan view)
```

### 2. CRM / Lead Management

```
Entities:
  - Lead: id, name, phone, email, source, budget, propertyType,
           status, agentId, createdAt
  - LeadStatus: new | contacted | interested | viewing | negotiating | closed_won | closed_lost
  - Activity: leadId, type (call/email/meeting/viewing), note, nextFollowUp

Key features:
  - Capture leads từ website, Batdongsan.com.vn, Chotot, Facebook
  - Assign lead cho agent, track follow-up
  - Pipeline view (kanban board)
  - Nhắc nhở follow-up tự động
```

### 3. Transaction Pipeline

```
Stages:
  1. Đặt cọc (Deposit) — ký hợp đồng đặt cọc, thu tiền cọc
  2. Ký HĐMB (SPA signing) — hợp đồng mua bán chính thức
  3. Vay ngân hàng (nếu có) — bank approval, giải ngân
  4. Công chứng — công chứng hợp đồng
  5. Nộp thuế — thuế TNCN 2%, lệ phí trước bạ
  6. Sang tên sổ — đăng bộ tại Văn phòng đăng ký đất đai
  7. Bàn giao nhà — handover với biên bản

Entities:
  - Transaction: id, propertyId, leadId, agentId, stage, depositAmount,
                 totalPrice, commissionRate, documents[], timeline
```

### 4. Commission Calculation

```
Quy tắc phổ biến:
  - Commission % trên giá bán (thường 1.5% - 3%)
  - Chia commission: listing agent vs buyer agent (50/50 hoặc theo thỏa thuận)
  - Hoa hồng giới thiệu (referral fee)
  - Commission chỉ tính khi giao dịch hoàn thành (sang tên xong)

Entities:
  - CommissionRule: id, projectId, type, rate, splitRatio
  - CommissionRecord: transactionId, agentId, amount, status, paidAt
```

---

## Pháp lý Việt Nam (BẮT BUỘC)

### Luật Đất đai 2024 (hiệu lực 01/08/2024)

```
- Quy định mới về bảng giá đất theo thị trường (thay bảng giá hàng năm)
- Sở hữu nhà ở của người nước ngoài: 30% tổng số căn trong dự án
- Thời hạn sở hữu: người nước ngoài 50 năm, gia hạn 1 lần
- Đất nông nghiệp: không được mua bán trực tiếp, phải chuyển mục đích
- Hệ thống thông tin đất đai quốc gia: tra cứu online
```

### Thuế khi chuyển nhượng BĐS

```
- Thuế TNCN từ chuyển nhượng BĐS: 2% giá bán (không phụ thuộc lãi/lỗ)
- Lệ phí trước bạ: 0.5% (nhà, đất) hoặc 2% (ô tô)
- Miễn thuế: chuyển nhượng cho người thân ruột (theo TT 111/2013)
- Nộp thuế: trong vòng 10 ngày từ khi ký HĐ công chứng
```

### Thủ tục công chứng

```
- Bắt buộc công chứng: HĐMB bất động sản, hợp đồng tặng cho, ủy quyền
- Phòng công chứng nhà nước hoặc Văn phòng công chứng tư nhân
- Phí công chứng: theo giá trị hợp đồng (0.1% - max 70 triệu/HĐ)
- Thời gian: 1-3 ngày làm việc
```

### Sổ đỏ / Sổ hồng

```
Sổ đỏ (GCN QSDĐ): quyền sử dụng đất
Sổ hồng (GCN QSDĐ + QSHNƠ): đất + công trình trên đất
→ Cần lưu: số sổ, ngày cấp, thửa đất, diện tích, mục đích sử dụng, thời hạn
→ Tra cứu qua: iland.gov.vn hoặc cổng thông tin đất đai tỉnh
```

---

## Tích hợp kênh Marketing

```
Kênh phổ biến ở VN:
  - Batdongsan.com.vn — portal lớn nhất, API tích hợp
  - Homedy.com — portal thứ 2
  - Chotot.com — B2C, giá thấp hơn
  - Facebook/Zalo — lead gen chính của môi giới
  - Website dự án — SEO, Google Ads
  - Zalo OA — CSKH sau bán

API integration:
  - Push listing lên các portal qua API/webhook
  - Import leads về từ portal vào CRM
  - Tracking UTM source của leads
```

---

## Search & Filtering

```
Bộ lọc cần thiết:
  - Geo-search: tỉnh/thành, quận/huyện, phường/xã, bán kính km
  - Loại BĐS, khoảng giá, diện tích, số phòng ngủ, hướng
  - Dự án cụ thể, chủ đầu tư
  - Tình trạng pháp lý (có sổ, chưa có sổ, đang thế chấp)

Virtual tour:
  - Tích hợp Matterport, YouTube 360, hoặc custom viewer
  - Ảnh 360° từ điện thoại (Google Photo Sphere)
```

---

## Financial Tools

```
Mortgage calculator:
  - Input: giá bán, % vay, lãi suất, kỳ hạn (5/10/15/20 năm)
  - Output: số tiền vay, monthly payment, tổng lãi
  - Tham chiếu lãi suất ngân hàng VN (BIDV, Vietcombank, ...)

ROI Projection:
  - Cho thuê: giá thuê / giá mua → rental yield %
  - Tăng giá: appreciation rate theo khu vực lịch sử
  - Break-even: thời gian hoàn vốn khi mua để cho thuê
```

---

## Pitfalls phổ biến

```
⚠️ Không check pháp lý trước khi đặt cọc:
   → Cần verify sổ thật (không phải photocopy), kiểm tra quy hoạch, tranh chấp

⚠️ Quản lý tồn kho không realtime:
   → 2 agent bán cùng 1 căn → conflict
   → Cần locking mechanism khi reserve căn

⚠️ Commission tính sai khi nhiều agent tham gia:
   → Phải có deal-split rules rõ ràng từ đầu

⚠️ Không track deal expiry:
   → Đặt cọc có hạn, hết hạn phải giải phóng inventory

⚠️ Thiếu audit trail cho giao dịch:
   → BĐS high-value, mọi thay đổi giá/trạng thái phải log đầy đủ
```

---

## Entities cần có (Data Model)

```
Core entities:
  - Project (dự án): name, developer, location, type, launchDate, completionDate
  - Property (sản phẩm): projectId, code, floor, area, price, status, legalDoc
  - Customer: name, phone, email, idCard, taxCode (pháp nhân)
  - Lead: customerId, source, budget, propertyType, assignedAgent, status
  - Transaction: propertyId, customerId, agentId, stage, price, commission
  - Document: transactionId, type, fileUrl, uploadedAt, verifiedBy
  - Agent: userId, code, licenseNumber, team, commissionRate
  - CommissionRecord: transactionId, agentId, role, amount, paidAt
```
