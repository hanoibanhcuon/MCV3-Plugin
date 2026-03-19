# Interview Framework — Mobile App (React Native / Flutter)

Reference cho `/mcv3:discovery` khi user muốn xây dựng ứng dụng di động.

---

## Nhận dạng ngành

**Từ khóa trigger:**
- "app mobile", "ứng dụng mobile", "app điện thoại", "app iOS", "app Android"
- "React Native", "Flutter", "Expo"
- "smartphone app", "mobile app", "cross-platform app"

---

## Block 1 — Business Context

### 1.1. Mục tiêu ứng dụng

> "Ứng dụng mobile này sẽ phục vụ mục đích gì? Ai là người dùng chính?"

**Gợi ý nếu không rõ:**
- Phục vụ khách hàng (B2C) hay nhân viên nội bộ (B2B)?
- Thay thế nghiệp vụ đang làm thủ công hay qua web?
- Companion app cho hệ thống backend đã có, hay standalone?

### 1.2. Vấn đề hiện tại

> "Hiện tại người dùng đang làm việc đó bằng cách nào? Điều gì không hiệu quả?"

### 1.3. Thành công trông như thế nào?

> "Sau khi có app, bạn muốn thấy người dùng làm được gì mà trước đây không làm được hoặc làm khó hơn?"

---

## Block 2 — Platform & Audience

### 2.1. Platform target

> "App cần chạy trên iOS, Android, hay cả hai?"

| Câu trả lời | Ghi chú |
|------------|---------|
| iOS only | Khách hàng chủ yếu dùng iPhone, hoặc doanh nghiệp MDM |
| Android only | Thị trường VN phổ biến Android, app nội bộ cho thiết bị cụ thể |
| Cả hai | Cross-platform → React Native hoặc Flutter |

### 2.2. Đối tượng người dùng

> "Người dùng app là ai? Độ tuổi, tech-savvy mức nào?"

**Gợi ý nếu không rõ:**
- Khách hàng B2C (rộng, nhiều loại thiết bị)
- Nhân viên bán hàng/giao vận (có training, thiết bị chuẩn)
- Quản lý/admin (ít người dùng, UI phức tạp chấp nhận được)

### 2.3. Quy mô người dùng

> "Bạn dự kiến bao nhiêu người dùng trong 6 tháng đầu? 1 năm?"

### 2.4. Thiết bị & OS version

> "Bạn có biết người dùng thường dùng thiết bị gì không? iOS tối thiểu bao nhiêu? Android tối thiểu?"

**Defaults nếu không có thông tin:**
- iOS: >= 15 (cover ~95% iOS devices 2024)
- Android: >= 8.0 Oreo (cover ~95% Android devices 2024)

---

## Block 3 — Core Features

### 3.1. Tính năng chính

> "Kể 3-5 tính năng quan trọng nhất người dùng cần làm với app."

**Hỏi từng tính năng:**
- Tính năng này dùng thường xuyên (hàng ngày) hay thỉnh thoảng?
- Cần online hay offline cũng dùng được?

### 3.2. Màn hình chính

> "Khi mở app, người dùng thấy gì đầu tiên? Họ hay làm gì nhất?"

### 3.3. Authentication

> "Người dùng đăng nhập bằng gì? Email/password, Google, Facebook, hay số điện thoại?"

**Hỏi thêm:**
- Có hỗ trợ đăng nhập Face ID / Touch ID (biometric) không?
- Session timeout: bao lâu thì cần đăng nhập lại?
- Multi-device: user có thể đăng nhập trên nhiều điện thoại cùng lúc không?

---

## Block 4 — Connectivity & Data

### 4.1. Offline requirements

> "Khi không có mạng (trong thang máy, vùng sâu...), app có cần dùng được không?"

| Trường hợp | Pattern |
|-----------|---------|
| Không cần offline | Online-only, đơn giản hơn |
| Đọc được offline | Cache data, read-only offline |
| Làm việc được offline | Offline-first + sync khi có mạng |

**Nếu cần offline:** Hỏi thêm:
- Dữ liệu nào cần offline? (Tất cả, hay chỉ những gì đã xem gần đây?)
- Khi offline có thể tạo/sửa data không? Sync lên server sau khi có mạng?
- Conflict resolution: nếu offline-edit và server cũng update cùng record, xử lý thế nào?

### 4.2. Real-time data

> "App có cần cập nhật data real-time không? Ví dụ: chat, tracking đơn hàng, giá cổ phiếu?"

**Nếu có real-time:** WebSocket hay push notifications?

### 4.3. Data sync

> "Người dùng có dữ liệu cá nhân trên app không? Khi đổi điện thoại, data có sync được không?"

---

## Block 5 — Notifications & Communication

### 5.1. Push notifications

> "App có cần gửi thông báo đến người dùng không? Ví dụ: đơn hàng cập nhật, tin nhắn mới, nhắc nhở?"

**Nếu có:** Hỏi thêm:
- Loại notification: transactional (theo event) hay promotional (marketing)?
- Có scheduled notifications không (nhắc nhở theo giờ)?
- Người dùng có thể tắt/bật loại notification nào?

### 5.2. In-app messaging / Chat

> "App có tính năng chat hoặc messaging giữa users không?"

---

## Block 6 — Device Features

### 6.1. Camera & Media

> "App có cần dùng camera không? Chụp ảnh, quét QR code, scan document?"

**Gợi ý nếu không rõ:** Chụp ảnh sản phẩm, chụp hóa đơn, chụp CMND/CCCD KYC, QR checkin...

### 6.2. Location / GPS

> "App có cần biết vị trí của người dùng không?"

**Nếu có:**
- Background location (theo dõi liên tục khi app đóng) hay foreground only?
- Độ chính xác cần thiết?

### 6.3. File & Storage

> "Người dùng có cần tải file lên (upload) hoặc tải xuống (download) không? Loại file gì?"

### 6.4. Tính năng hardware khác

> "App có cần NFC, Bluetooth, cảm biến gyroscope, hay fingerprint sensor không?"

---

## Block 7 — Backend & Integration

### 7.1. Backend hiện có

> "Đã có backend API rồi hay cần build từ đầu?"

**Nếu có sẵn:** Hỏi thêm:
- Dùng REST API hay GraphQL?
- Đã có auth (JWT, OAuth) chưa?
- API docs có sẵn không?

**Nếu chưa có:** Mobile app và backend sẽ build cùng nhau → MCV3 sẽ design cả hai.

### 7.2. Third-party integrations

> "App có cần tích hợp với dịch vụ bên thứ 3 không?"

**Gợi ý:**
- Thanh toán: VNPay, MoMo, ZaloPay, Stripe?
- Maps: Google Maps, Mapbox?
- Analytics: Firebase Analytics, Mixpanel?
- Customer support: Zalo OA, intercom?
- Social login: Google, Facebook, Apple Sign In?

### 7.3. Apple Sign In requirement

> "Nếu app có đăng nhập qua bất kỳ third-party nào (Google, Facebook), App Store yêu cầu phải có Apple Sign In. Bạn có biết điều này chưa?"

---

## Block 8 — UX & Design

### 8.1. Design có sẵn

> "Đã có UI design (Figma, sketch) chưa? Hay cần AI/team design từ đầu?"

### 8.2. Brand & Theme

> "App cần theo brand guidelines của công ty không? Màu chủ đạo, font chữ?"

### 8.3. Navigation style

> "Bạn hình dung app có bottom tabs (như Facebook), side drawer (như Gmail), hay navigation khác?"

### 8.4. Dark mode

> "App có cần hỗ trợ dark mode không?"

### 8.5. Tablet support

> "App có cần layout đặc biệt cho tablet/iPad không?"

---

## Block 9 — App Store & Distribution

### 9.1. Distribution

> "App sẽ phát hành lên App Store và Google Play công khai, hay chỉ dùng nội bộ (enterprise distribution)?"

| Distribution | Method |
|-------------|--------|
| Công khai | App Store + Google Play |
| Nội bộ iOS | Apple Developer Enterprise Program / TestFlight |
| Nội bộ Android | APK sideload / MDM |
| Hybrid | Vừa store vừa nội bộ |

### 9.2. App Review timeline

> "Bạn có biết App Store review thường mất 1-3 ngày, Google Play 1-7 ngày không? Điều này có ảnh hưởng đến timeline không?"

### 9.3. App Store metadata

> "Ai sẽ viết app description, keywords, chuẩn bị screenshots cho store listing?"

---

## Block 10 — Technical Constraints & Preferences

### 10.1. Framework preference

> "Bạn có ưu tiên framework nào không? React Native (Expo), Flutter, hay để AI đề xuất?"

**Gợi ý nếu user không có ý kiến:**

| Tiêu chí | React Native (Expo) | Flutter |
|---------|--------------------|---------|
| Team có JS/TypeScript | ✅ | ❌ |
| Team có Dart/mobile native | ❌ | ✅ |
| Tốc độ iteration | ✅ (Metro, Fast Refresh) | ✅ (Hot Reload) |
| Native-like UI | ✅ (native components) | ⚠️ (custom paint) |
| Performance | ✅ | ✅✅ |
| Ecosystem/libraries | ✅✅ (JS ecosystem) | ✅ (growing) |
| OTA updates | ✅ EAS Updates | ⚠️ (limited) |

### 10.2. Team background

> "Team mobile có kinh nghiệm chưa? Với React Native hay Flutter?"

### 10.3. Budget & timeline

> "Deadline sơ bộ? Budget có ảnh hưởng đến lựa chọn cross-platform vs native không?"

### 10.4. OTA updates

> "Bạn có muốn update app mà không cần submit store lại không? React Native (EAS Updates) hỗ trợ điều này cho JS changes."

---

## Block 11 — Performance & Scale

### 11.1. Performance requirements

> "Có yêu cầu cụ thể về tốc độ không? Ví dụ: app mở trong 2 giây, list scroll mượt?"

**NFR mobile thường gặp:**
- App cold start: < 3 giây
- Screen transition: < 300ms
- API timeout: 10-30 giây
- App size: < 50MB (ảnh hưởng conversion rate trên store)
- Offline cache: bao nhiêu MB?

### 11.2. Battery & network

> "App có chạy background process không? (Background sync, location tracking...) Yêu cầu về pin không?"

### 11.3. Accessibility

> "App có cần hỗ trợ accessibility (cho người khiếm thị, khiếm thính) không?"

---

## Block 12 — Security & Compliance

### 12.1. Data sensitivity

> "App xử lý dữ liệu nhạy cảm không? Thông tin tài chính, y tế, thông tin cá nhân?"

**Nếu có:** Hỏi về:
- Certificate pinning (chống man-in-the-middle)
- Root/jailbreak detection
- Screenshot prevention (banking apps)
- Data encryption at rest

### 12.2. Privacy regulations

> "App target thị trường nào? Việt Nam, EU (GDPR), hay US?"

**Nếu EU hoặc US:** Cần Privacy Policy, Cookie consent, data deletion flow.

### 12.3. App Store Privacy Labels

> "Apple và Google yêu cầu khai báo dữ liệu thu thập. Bạn có biết app sẽ thu thập những dữ liệu gì?"

---

## Tóm tắt thông tin cần capture

Sau phỏng vấn, đảm bảo có đủ:

```
✅ Platform: iOS / Android / Both
✅ Framework: React Native (Expo/Bare) / Flutter
✅ Offline: Online-only / Cache / Offline-first
✅ Push notifications: Yes/No
✅ Device features cần: Camera / GPS / NFC / ...
✅ Backend: Có sẵn (URL?) / Cần build mới
✅ Distribution: App Store / Internal / Both
✅ Min OS: iOS >= X, Android >= Y
✅ Users: B2C/B2B, estimated number
✅ Auth method: Email / Social / Phone OTP / Biometric
✅ OTA updates: Yes/No (chỉ React Native)
```

---

## Ghi chú cho Discovery

- **Scope**: Mobile project thường là Medium trở lên nếu có offline-first + push notifications + backend riêng
- **Multi-system**: Mobile app thường là 1 system (MOB) tích hợp với backend (ERP/API)
- **Template**: Dùng `MOBILE-MODSPEC-TEMPLATE.md` thay MODSPEC-TEMPLATE.md cho Phase 5
- **Phases có thể skip**: Phase 3 (BizDocs) nếu app đơn giản (Small scale)
