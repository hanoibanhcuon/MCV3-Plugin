# Database Guide — NoSQL & BaaS

Reference cho `/mcv3:code-gen` khi tech stack dùng NoSQL hoặc BaaS.

---

## Decision Matrix: SQL vs NoSQL vs BaaS

| Tiêu chí | SQL (PostgreSQL) | NoSQL (MongoDB) | BaaS (Firebase/Supabase) |
|----------|-----------------|-----------------|--------------------------|
| Data structure | Có schema rõ ràng | Schema linh hoạt | Phụ thuộc platform |
| Relationships | Complex joins OK | Embed hoặc reference | Hạn chế |
| Transactions | ACID đầy đủ | Multi-doc transactions | Hạn chế |
| Scale | Vertical chủ yếu | Horizontal (sharding) | Auto-scale (managed) |
| Real-time | Cần thêm (Supabase) | Change streams | Built-in |
| Offline sync | Cần tự làm | Cần tự làm | Built-in (Firestore) |
| Cost nhỏ | Rẻ (self-host) | Rẻ (self-host) | Miễn phí tier |
| Team expertise | Phổ biến nhất | Phổ biến | Ít config nhất |

### Khi nào chọn gì

```
→ SQL (PostgreSQL):
  - Data có relationships phức tạp (nhiều foreign keys, joins)
  - Cần ACID transactions (tài chính, inventory)
  - Team quen với SQL
  - Long-term project cần migration track rõ ràng

→ MongoDB:
  - Document-centric data (catalogue, CMS, user profiles)
  - Schema thay đổi nhiều (early-stage startup)
  - Cần horizontal scaling tự nhiên
  - Nested/hierarchical data

→ Firebase/Firestore:
  - Mobile app cần offline sync
  - Real-time features (chat, live dashboard, collaborative)
  - Team nhỏ, cần deploy nhanh
  - Không muốn quản lý infrastructure

→ Supabase:
  - Muốn PostgreSQL + Auth + Storage + Realtime trong 1 platform
  - Cần Row Level Security
  - Quen với SQL nhưng muốn BaaS convenience

→ Redis (primary):
  - Session storage
  - Leaderboards (sorted sets)
  - Message queues (streams)
  - Rate limiting counters
  - Pub/Sub cho real-time events

→ SQLite:
  - Mobile/embedded (local database trên device)
  - Single-user desktop app
  - Edge computing / serverless edge
```

---

## MongoDB

### Document Modeling Best Practices

```javascript
// ✅ Embed khi: dữ liệu luôn đọc cùng nhau, không quá 100 items
// Order với embedded items
{
  _id: ObjectId("..."),
  orderNumber: "ORD-2024-001",
  customerId: ObjectId("..."),   // Reference đến customer
  items: [                        // Embedded — luôn đọc cùng order
    {
      productId: ObjectId("..."),
      productName: "iPhone 15",   // Denormalize để tránh join
      quantity: 2,
      price: 22990000
    }
  ],
  total: 45980000,
  status: "pending",
  createdAt: ISODate("2024-01-15")
}

// ✅ Reference khi: dữ liệu lớn, cần query độc lập, N-to-N
// Product → Categories (many-to-many)
{
  _id: ObjectId("..."),
  name: "iPhone 15",
  categoryIds: [ObjectId("..."), ObjectId("...")],  // Reference
  // KHÔNG embed toàn bộ category vì category có thể thay đổi
}
```

### Indexes

```javascript
// Tạo indexes cho các queries phổ biến
db.orders.createIndex({ customerId: 1, createdAt: -1 })  // Compound
db.products.createIndex({ name: "text", description: "text" })  // Full-text search
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })  // TTL index
db.orders.createIndex({ status: 1 })                     // Filter by status

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })
```

### Aggregation Pipeline

```javascript
// REQ-ID: FT-RPT-001 — Báo cáo doanh thu theo tháng
db.orders.aggregate([
  {
    $match: {
      status: "completed",
      createdAt: { $gte: new Date("2024-01-01") }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$total" }
    }
  },
  { $sort: { _id: 1 } }
])
```

### Schema Validation (MongoDB 5.0+)

```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerId", "items", "total", "status"],
      properties: {
        status: {
          bsonType: "string",
          enum: ["pending", "confirmed", "shipped", "completed", "cancelled"]
        },
        total: { bsonType: "decimal", minimum: 0 },
        items: {
          bsonType: "array",
          minItems: 1
        }
      }
    }
  }
})
```

### Mongoose (Node.js ODM)

```typescript
// REQ-ID: TBL-ERP-001
import mongoose, { Schema, Document } from 'mongoose'

interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId
  items: Array<{ productId: mongoose.Types.ObjectId; quantity: number; price: number }>
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
  createdAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

// Indexes
OrderSchema.index({ customerId: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
```

---

## Firebase / Firestore

### Collection Structure

```
// ✅ Flat structure (khuyến nghị cho Firestore)
/users/{userId}
/orders/{orderId}          { userId, items[], total, status }
/products/{productId}
/chats/{chatId}
/chats/{chatId}/messages/{messageId}   // Sub-collection
```

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: chỉ đọc/ghi profile của mình
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Orders: user chỉ đọc orders của mình, admin đọc tất cả
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId
                  || request.auth.token.role == 'admin';
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth.token.role == 'admin';
    }

    // Helper function
    function isAdmin() {
      return request.auth.token.role == 'admin';
    }
  }
}
```

### Real-time Listeners

```typescript
// REQ-ID: FT-CHAT-001
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(msgs)
    })

    return unsubscribe // Cleanup khi unmount
  }, [chatId])

  return messages
}
```

---

## Supabase

### PostgreSQL + Row Level Security

```sql
-- Tạo table với RLS
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: users chỉ thấy orders của mình
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: users tạo orders cho chính mình
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: admin xem tất cả
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Realtime Subscriptions

```typescript
// REQ-ID: FT-DASH-001 — Live dashboard
import { supabase } from '@/lib/supabase'

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return orders
}
```

---

## Redis (Primary Database Use Cases)

### Sorted Sets — Leaderboard

```typescript
// REQ-ID: FT-GAME-001
const redis = new Redis(process.env.REDIS_URL)

// Thêm điểm
await redis.zadd('leaderboard:2024-01', score, userId)

// Top 10
const top10 = await redis.zrevrange('leaderboard:2024-01', 0, 9, 'WITHSCORES')

// Rank của user
const rank = await redis.zrevrank('leaderboard:2024-01', userId)
```

### Streams — Event Queue

```typescript
// Producer
await redis.xadd('orders:stream', '*', {
  orderId: order.id,
  event: 'order.created',
  payload: JSON.stringify(order)
})

// Consumer group
await redis.xgroup('CREATE', 'orders:stream', 'order-processor', '$', 'MKSTREAM')

const messages = await redis.xreadgroup(
  'GROUP', 'order-processor', 'worker-1',
  'COUNT', 10, 'BLOCK', 5000,
  'STREAMS', 'orders:stream', '>'
)
```

---

## SQLite (Mobile / Embedded)

```typescript
// React Native — Expo SQLite
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync('myapp.db')

// Tạo schema
db.execSync(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    synced INTEGER DEFAULT 0,    -- 0: chưa sync, 1: đã sync
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_orders_synced ON orders(synced);
  PRAGMA journal_mode=WAL;       -- WAL mode cho performance tốt hơn
`)

// WAL mode: multiple readers + 1 writer concurrent
// Tốt hơn default journal mode cho mobile app
```
