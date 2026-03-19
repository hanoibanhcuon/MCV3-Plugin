# Notification Service Spec — {PROJECT_NAME}

> **Hướng dẫn:** Điền thông tin vào các `{PLACEHOLDER}`. Notification Service là Layer 3 — lắng nghe events từ các systems khác.

---

## DEPENDENCY MAP

```
Requires:
  - Events từ: {LIST_SOURCE_SYSTEMS}
  - Auth Service (để validate token nếu có management API)
Provides to:
  - End users (email, SMS, push, in-app)
```

---

## 1. Overview

| Thuộc tính | Giá trị |
|-----------|---------|
| **Service name** | notification-service |
| **Base URL** | /api/v1/notifications |
| **Channels** | {EMAIL / SMS / PUSH / IN_APP} |
| **Queue** | Bull/BullMQ (Redis) |

---

## 2. Supported Channels

| Channel | Provider | Khi nào dùng |
|---------|----------|-------------|
| Email | {SMTP_PROVIDER / SendGrid / SES} | Xác nhận đặt hàng, reset password, báo cáo |
| SMS | {Twilio / ESMS VN / Viettel} | OTP, thông báo khẩn |
| Push | {Firebase FCM / OneSignal} | Mobile app notifications |
| In-app | WebSocket / Long polling | Thông báo realtime trong dashboard |

---

## 3. Notification Templates

### Ví dụ templates:

| Template ID | Kênh | Tiêu đề | Khi nào trigger |
|-------------|------|---------|----------------|
| ORDER_CONFIRMED | Email | Xác nhận đơn hàng #{ORDER_NUMBER} | order.confirmed event |
| ORDER_SHIPPED | Email + SMS | Đơn hàng #{ORDER_NUMBER} đã được giao | order.shipped event |
| LOW_STOCK_ALERT | Email | Cảnh báo tồn kho thấp | inventory.stock.low_alert event |
| PASSWORD_RESET | Email | Reset mật khẩu | user request |
| {TEMPLATE_ID} | {CHANNEL} | {SUBJECT} | {TRIGGER} |

---

## 4. API Endpoints

### NOTIF-001: Gửi thông báo (Internal API)

```
POST /api/v1/notifications/send
Authorization: Bearer {service_token}   ← Service-to-service token

Request:
{
  channel: 'email' | 'sms' | 'push' | 'in_app';
  recipient: {
    userId?: string;        // Hoặc
    email?: string;         // Hoặc
    phone?: string;         // Hoặc
    deviceTokens?: string[]; // Cho push
  };
  templateId: string;       // Template ID
  variables: {              // Dynamic variables
    [key: string]: string | number;
  };
  priority?: 'high' | 'normal' | 'low';  // default: normal
  scheduledAt?: string;     // ISO 8601 — gửi ngay nếu không có
}

Response 202 Accepted:
{
  success: true,
  data: {
    notificationId: string;  // UUID để track
    status: 'queued';
  }
}
```

### NOTIF-002: Lấy lịch sử thông báo của user

```
GET /api/v1/notifications/history
Authorization: Bearer {user_token}

Query:
  ?page=1&limit=20&isRead=false&channel=email

Response 200:
{
  success: true,
  data: [{
    id: string;
    channel: string;
    subject: string;
    preview: string;     // 100 chars đầu
    isRead: boolean;
    sentAt: string;
    readAt?: string;
  }],
  meta: { total, page, limit, totalPages }
}
```

### NOTIF-003: Đánh dấu đã đọc (in-app)

```
PATCH /api/v1/notifications/{id}/read
Authorization: Bearer {user_token}

Response 200:
{ success: true, data: { id, isRead: true, readAt: string } }
```

---

## 5. Event Listeners

Notification Service lắng nghe các events và trigger thông báo:

```typescript
// Đăng ký event handlers khi khởi động
onEvent('order.confirmed', async (event) => {
  await notificationService.send({
    channel: 'email',
    recipient: { userId: event.data.customerId },
    templateId: 'ORDER_CONFIRMED',
    variables: {
      orderNumber: event.data.orderNumber,
      totalAmount: formatCurrency(event.data.totalAmount),
      itemCount: event.data.itemCount,
    },
  });
});

onEvent('inventory.stock.low_alert', async (event) => {
  await notificationService.send({
    channel: 'email',
    recipient: { email: process.env.PURCHASING_EMAIL },
    templateId: 'LOW_STOCK_ALERT',
    variables: {
      productName: event.data.productName,
      currentStock: event.data.currentStock,
      minStock: event.data.minStock,
    },
    priority: 'high',
  });
});

// {MORE_EVENTS}
```

---

## 6. Delivery Tracking

```
Notification lifecycle:
  queued → processing → sent → delivered | failed

Retry policy:
  - Email: 3 attempts, exponential backoff (1min, 5min, 30min)
  - SMS: 3 attempts, backoff (30s, 2min, 10min)
  - Push: 2 attempts, backoff (1min, 5min)
  - In-app: 1 attempt (WebSocket direct)
```

---

## 7. Database Schema (minimal)

### TBL-NOTIF-001: notifications

| Column | Type | Nullable | Mô tả |
|--------|------|----------|-------|
| id | UUID | NOT NULL | PK |
| user_id | UUID | NULL | Recipient user (nếu có) |
| channel | VARCHAR(20) | NOT NULL | email/sms/push/in_app |
| template_id | VARCHAR(100) | NOT NULL | |
| subject | VARCHAR(500) | NOT NULL | |
| body | TEXT | NOT NULL | Rendered content |
| status | VARCHAR(20) | NOT NULL | queued/sent/failed |
| is_read | BOOLEAN | NOT NULL | false — chỉ cho in_app |
| sent_at | TIMESTAMPTZ | NULL | |
| read_at | TIMESTAMPTZ | NULL | |
| error | TEXT | NULL | Lý do fail |
| created_at | TIMESTAMPTZ | NOT NULL | |
