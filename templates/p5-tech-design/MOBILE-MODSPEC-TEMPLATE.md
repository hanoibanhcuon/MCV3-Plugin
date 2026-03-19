# MOBILE MODULE SPEC: {{SYSTEM_CODE}} — {{MODULE_NAME}}
<!-- ============================================================
     ⭐ ĐẶC TẢ MODULE MOBILE — Template chuyên cho React Native / Flutter
     Chứa MỌI THỨ AI cần để code 1 module mobile:
       Business Rules, Screens, Navigation, State, API, Offline, Notifications.
     AI chỉ cần đọc file này + Dependency Map → code được.

     [MCV3-v3.10] DEPENDENCY MAP:
       Input:  URS-{MODULE}.md, ARCHITECTURE.md, BIZ-POLICY
       Key IDs: FT-{MOD}-XXX, SCR-{MOD}-XXX, API-{SYS}-XXX
       Output: TEST-{MODULE}.md, USER-GUIDE.md, source code
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Phase:** P2 — System Design
> **System:** {{SYS_CODE}} (Mobile)
> **Module:** {{MODULE_CODE}}
> **Framework:** React Native (Expo) / Flutter ← _xóa cái không dùng_
> **Input từ:** [REF: P1-REQUIREMENTS/URS-{{MODULE}}.md]
> **Output cho:** P3-QA-DOCS/TEST-{{MODULE}}.md, source code
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP (AI: ĐỌC PHẦN NÀY TRƯỚC)

### Bắt buộc đọc:
- [REF: {{SYS_CODE}}/P2-DESIGN/ARCHITECTURE.md] — Tech stack, state management, navigation pattern
- [REF: _PROJECT/DATA-DICTIONARY.md] — Terms & entities
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-{{DOMAIN}}.md] — Business rules

### Nên đọc (khi có tích hợp):
- [REF: _SHARED-SERVICES/AUTH-SPEC.md] — Auth flow (JWT + biometric)
- [REF: {{BACKEND_SYS}}/P2-DESIGN/MODSPEC-{{BACKEND_MOD}}.md] — Backend API spec

### Tài liệu sinh từ MODSPEC này:
- [OUTPUT → {{SYS_CODE}}/P3-QA-DOCS/TEST-{{MODULE}}.md]
- [OUTPUT → src/{{sys_code}}/{{module}}/] — React Native hoặc lib/features/{{module}}/

---

## 1. MỤC TIÊU MODULE

**Mô tả:** {{MÔ_TẢ_MODULE — 2-3 câu}}

**Users chính:** {{DANH_SÁCH_ROLES}} (thường: end-user, admin-user)

**Giải quyết:** [REF: PROJECT-OVERVIEW → PROB-{{XXX}}]

---

## 2. BUSINESS RULES

### 2.1. Validation Rules

| Mã | Quy tắc | Logic | Nguồn |
|----|---------|-------|-------|
| BR-{{DOM}}-001 | {{QUY_TẮC}} | `if (!condition) showError("msg")` | [REF: BIZ-POLICY-{{DOM}}] |

### 2.2. Calculation Rules

| Mã | Quy tắc | Công thức | Ví dụ |
|----|---------|----------|-------|
| BR-{{DOM}}-010 | {{QUY_TẮC}} | `result = a * b / 100` | {{VÍ_DỤ}} |

### 2.3. Workflow Rules

| Mã | Trạng thái | Transition | Actor | Condition |
|----|-----------|-----------|-------|----------|
| BR-{{DOM}}-020 | {{FROM}} → {{TO}} | {{ACTION}} | {{ROLE}} | {{CONDITION}} |

---

## 3. FEATURES (FT-XXX)

| Mã | Tên Feature | User Story | Mô tả | Priority |
|----|------------|-----------|-------|---------|
| FT-{{MOD}}-001 | {{TÊN}} | [REF: US-{{MOD}}-001] | {{MÔ_TẢ}} | Must |

---

## 4. SCREEN FLOWS & NAVIGATION

### 4.1. Màn hình (SCR-XXX)

| Mã | Tên màn hình | Route/Path | Role | Feature |
|----|------------|-----------|------|---------|
| SCR-{{MOD}}-001 | {{TÊN}} | `/(tabs)/{{module}}` | {{ROLE}} | [FT-{{MOD}}-001] |
| SCR-{{MOD}}-002 | {{TÊN}} Detail | `/(tabs)/{{module}}/[id]` | {{ROLE}} | [FT-{{MOD}}-002] |
| SCR-{{MOD}}-003 | Create {{TÊN}} | `/{{module}}/create` | {{ROLE}} | [FT-{{MOD}}-003] |

### 4.2. Navigation Flow

```
SCR-{{MOD}}-001 (List)
  ├── [Tap item] → SCR-{{MOD}}-002 (Detail)
  │     └── [Edit button] → SCR-{{MOD}}-003 (Edit)
  └── [FAB/Button] → SCR-{{MOD}}-003 (Create)
        └── [Save] → SCR-{{MOD}}-001 (List, refresh)

SCR-AUTH-001 (Login) → [Success] → SCR-{{MOD}}-001 (home/tab)
```

### 4.3. Tab Navigation (nếu có)

```
Bottom Tabs:
  Tab 1: Home (SCR-HOME-001)
  Tab 2: {{MODULE}} (SCR-{{MOD}}-001)  ← module này
  Tab 3: Profile (SCR-PROFILE-001)
```

---

## 5. DATA SCHEMA

### 5.1. API Data Models (TypeScript / Dart)

```typescript
// React Native / TypeScript
// REQ-ID: FT-{{MOD}}-001
export interface {{Module}} {
  id: string;
  {{field}}: {{type}};  // Mô tả field
  createdAt: string;    // ISO 8601
  updatedAt: string;
}

export interface Create{{Module}}Dto {
  {{field}}: {{type}};
}
```

```dart
// Flutter / Dart — nếu dùng Flutter
// REQ-ID: FT-{{MOD}}-001
class {{Module}} {
  final String id;
  final {{DartType}} {{field}};
  final DateTime createdAt;

  const {{Module}}({
    required this.id,
    required this.{{field}},
    required this.createdAt,
  });

  factory {{Module}}.fromJson(Map<String, dynamic> json) => {{Module}}(
    id: json['id'] as String,
    {{field}}: json['{{field}}'] as {{DartType}},
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    '{{field}}': {{field}},
    'createdAt': createdAt.toIso8601String(),
  };
}
```

### 5.2. Local Storage Schema (Offline)

Chỉ điền nếu có offline-first requirement:

```typescript
// MMKV key schema
const STORAGE_KEYS = {
  {{MODULE}}_LIST: '@{{module}}/list',        // Cache list data
  {{MODULE}}_DRAFT: '@{{module}}/draft',      // Unsaved draft
  {{MODULE}}_LAST_SYNC: '@{{module}}/lastSync',  // Timestamp
} as const;

// WatermelonDB schema (nếu cần offline mutations)
tableSchema({
  name: '{{module}}s',
  columns: [
    { name: 'remote_id', type: 'string', isOptional: true },
    { name: '{{field}}', type: 'string' },
    { name: 'sync_status', type: 'string' },  // 'synced' | 'pending' | 'conflict'
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})
```

---

## 6. API ENDPOINTS (API-XXX)

### API-{{SYS}}-001: List {{Module}}s

| Mục | Giá trị |
|-----|--------|
| **Method** | GET |
| **Path** | `/api/v1/{{resource}}` |
| **Auth** | Bearer JWT |
| **Feature** | [IMPLEMENTS: FT-{{MOD}}-001] |

**Query Params:** `?page=1&limit=20&sort=created_at:desc&search={{keyword}}`

**Response 200:**
```json
{
  "success": true,
  "data": [{ "id": "uuid", "{{field}}": "{{value}}" }],
  "meta": { "page": 1, "total": 100, "limit": 20 }
}
```

### API-{{SYS}}-002: Get {{Module}} Detail

| Mục | Giá trị |
|-----|--------|
| **Method** | GET |
| **Path** | `/api/v1/{{resource}}/{id}` |
| **Auth** | Bearer JWT |
| **Feature** | [IMPLEMENTS: FT-{{MOD}}-002] |

**Response 200:**
```json
{ "success": true, "data": { "id": "uuid", "{{field}}": "{{value}}" } }
```

**Error Responses:**
| Code | Khi nào |
|------|---------|
| 401 | Token hết hạn → refresh token, redirect Login |
| 403 | Không có quyền → hiện thông báo |
| 404 | Không tìm thấy → hiện empty state |

### API-{{SYS}}-003: Create {{Module}}

| Mục | Giá trị |
|-----|--------|
| **Method** | POST |
| **Path** | `/api/v1/{{resource}}` |
| **Auth** | Bearer JWT |
| **Feature** | [IMPLEMENTS: FT-{{MOD}}-003] |

**Request Body:**
```json
{ "{{field}}": "{{type}} — required", "{{field2}}": "{{type}} — optional" }
```

**Response 201:**
```json
{ "success": true, "data": { "id": "uuid", "{{field}}": "{{value}}" } }
```

---

## 7. STATE MANAGEMENT

### 7.1. React Native — Zustand Store

```typescript
// stores/{{module}}.store.ts
// REQ-ID: FT-{{MOD}}-001

interface {{Module}}State {
  // Data
  items: {{Module}}[];
  selectedItem: {{Module}} | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setItems: (items: {{Module}}[]) => void;
  selectItem: (item: {{Module}} | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Dùng persist nếu cần offline cache
export const use{{Module}}Store = create<{{Module}}State>()(
  persist(
    (set) => ({
      items: [],
      selectedItem: null,
      isLoading: false,
      error: null,
      setItems: (items) => set({ items }),
      selectItem: (item) => set({ selectedItem: item }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set({ items: [], selectedItem: null, error: null }),
    }),
    {
      name: '{{module}}-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist những gì cần thiết
      partialize: (state) => ({ items: state.items }),
    }
  )
)
```

### 7.2. Flutter — Riverpod Provider

```dart
// features/{{module}}/presentation/providers/{{module}}_provider.dart
// REQ-ID: FT-{{MOD}}-001

// State class
class {{Module}}State {
  final List<{{Module}}> items;
  final {{Module}}? selectedItem;
  final bool isLoading;
  final String? error;

  const {{Module}}State({
    this.items = const [],
    this.selectedItem,
    this.isLoading = false,
    this.error,
  });

  {{Module}}State copyWith({...}) => {{Module}}State(...);
}

// Notifier
@riverpod
class {{Module}}Notifier extends _${{Module}}Notifier {
  @override
  {{Module}}State build() => const {{Module}}State();

  Future<void> loadItems() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final items = await ref.read({{module}}RepositoryProvider).getAll();
      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
```

---

## 8. SCREEN SPECIFICATIONS

### SCR-{{MOD}}-001: {{TÊN}} List Screen

**Route:** `/(tabs)/{{module}}` _(Expo Router)_ / `/{{module}}` _(go_router)_

**Layout:**
```
┌─────────────────────────────┐
│ Header: "{{Module}}"  [+FAB]│
│ Search bar (nếu cần)        │
├─────────────────────────────┤
│ {{Module}}Card              │
│   {{field1}} | {{field2}}   │
│   Status badge              │
├─────────────────────────────┤
│ {{Module}}Card              │
│ ...                         │
├─────────────────────────────┤
│ ← Empty State nếu không có  │
└─────────────────────────────┘
```

**Components:**
- `{{Module}}Card` — Hiện 1 item trong list
- `{{Module}}Empty` — Empty state khi list rỗng
- `{{Module}}Skeleton` — Loading skeleton (thay spinner)

**Behaviors:**
- Pull to refresh → refetch data
- Infinite scroll / Load more khi scroll đến cuối
- Swipe left để xóa (nếu có delete)
- Tap item → navigate đến Detail

**Edge Cases:**
- Network error → retry button + cached data nếu có
- Empty list → Empty state với CTA button
- Loading → Skeleton hoặc ActivityIndicator

---

### SCR-{{MOD}}-002: {{TÊN}} Detail Screen

**Route:** `/(tabs)/{{module}}/[id]` / `/{{module}}/:id`

**Layout:**
```
┌─────────────────────────────┐
│ ← Back | "{{Module}} Detail"│
├─────────────────────────────┤
│ {{Module}} info sections    │
│   {{field1}}: {{value}}     │
│   {{field2}}: {{value}}     │
├─────────────────────────────┤
│ [Edit] [Delete] buttons     │
└─────────────────────────────┘
```

**Behaviors:**
- Share button (nếu cần)
- Edit → navigate SCR-{{MOD}}-003
- Delete → confirmation dialog → navigate back

---

### SCR-{{MOD}}-003: Create / Edit {{TÊN}} Screen

**Route:** `/{{module}}/create` hoặc `/{{module}}/[id]/edit`

**Form Fields:**
| Field | Type | Validation | Error message |
|-------|------|-----------|--------------|
| {{field}} | TextInput / Picker | {{RULE}} | "{{ERR_MSG}}" |

**Behaviors:**
- Disable submit button khi form invalid
- Loading indicator khi đang submit
- Success → navigate back + refresh list
- Error → hiện inline hoặc toast error

**Offline Draft:**
- Tự động lưu draft khi user nhập (nếu có offline requirement)
- Khi có mạng, draft tự động sync

---

## 9. PUSH NOTIFICATIONS

_Xóa section này nếu không có push notifications_

### 9.1. Notification Types

| Loại | Trigger | Deep link | Nội dung |
|------|---------|----------|---------|
| `{{MODULE}}_CREATED` | Khi tạo mới | `/{{module}}/[id]` | "{{Module}} mới: {{title}}" |
| `{{MODULE}}_UPDATED` | Khi cập nhật | `/{{module}}/[id]` | "{{Module}} đã cập nhật" |

### 9.2. Permission Request

```typescript
// Hỏi quyền notifications sau khi user hoàn thành onboarding
// KHÔNG hỏi ngay khi mở app lần đầu
async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  // Lưu token lên server nếu granted
  if (status === 'granted') await syncPushToken()
  return status === 'granted'
}
```

### 9.3. Deep Link Handling

```typescript
// Khi nhấn notification → mở đúng màn hình
Notifications.addNotificationResponseReceivedListener((response) => {
  const { screen, id } = response.notification.request.content.data
  if (screen === '{{module}}') {
    router.push(`/(tabs)/{{module}}/${id}`)
  }
})
```

---

## 10. OFFLINE BEHAVIOR

_Xóa section này nếu không có offline requirement_

### 10.1. Offline Strategy

| Action | Offline behavior |
|--------|----------------|
| Xem list | Hiện cached data + offline badge |
| Xem detail | Hiện cached detail nếu đã xem trước đó |
| Tạo mới | Queue mutation, sync khi online |
| Sửa | Queue mutation, sync khi online |
| Xóa | Queue mutation, sync khi online |

### 10.2. Sync Strategy

```typescript
// Khi có mạng trở lại → flush pending queue
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      syncPendingMutations()  // Flush queue theo thứ tự
    }
  })
  return unsubscribe
}, [])
```

### 10.3. Conflict Resolution

| Scenario | Resolution |
|----------|-----------|
| Offline edit + server cũng edit | Server wins (hiện warning cho user) |
| Offline create + duplicate | {{RESOLUTION_RULE}} |

---

## 11. AUTH INTEGRATION

### 11.1. Token Management

```typescript
// Tự động refresh token trước khi hết hạn
// REQ-ID: FT-AUTH-001
const apiClient = axios.create({ baseURL: API_URL })

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`
        return apiClient(error.config)  // Retry request
      }
      // Refresh thất bại → logout
      await logout()
      router.replace('/(auth)/login')
    }
    return Promise.reject(error)
  }
)
```

### 11.2. Biometric Auth (nếu có)

```typescript
// REQ-ID: FT-AUTH-005
import * as LocalAuthentication from 'expo-local-authentication'

async function authenticateWithBiometric(): Promise<boolean> {
  const available = await LocalAuthentication.hasHardwareAsync()
  if (!available) return false

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Xác thực để tiếp tục',
    fallbackLabel: 'Dùng mật khẩu',
  })
  return result.success
}
```

---

## 12. INTEGRATION POINTS

| Mã | Tích hợp với | Phương thức | Dữ liệu | Timing |
|----|------------|------------|--------|--------|
| INT-MOB-001 | {{BACKEND_SYS}} API | REST/JWT | {{DATA}} | Sync / Async |
| INT-MOB-002 | Push Notification Service | FCM / APNs | Token | Background |

---

## 13. PERFORMANCE & UX GUIDELINES

### 13.1. List Performance

```typescript
// LUÔN dùng FlashList thay FlatList cho list > 20 items
import { FlashList } from '@shopify/flash-list'

<FlashList
  data={items}
  renderItem={({ item }) => <{{Module}}Card item={item} />}
  estimatedItemSize={80}         // Đo thực tế
  keyExtractor={(item) => item.id}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### 13.2. Image Loading

```typescript
// Dùng expo-image thay React Native Image
import { Image } from 'expo-image'

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  placeholder={blurhash}        // Blurhash trong khi load
  transition={200}
/>
```

### 13.3. Loading States

```
Chiến lược loading state:
  First load    → Skeleton (KHÔNG dùng spinner cho list)
  Refresh       → Pull-to-refresh indicator ở top
  Load more     → Spinner nhỏ ở bottom list
  Submit action → Button loading + disable
  Navigation    → Instant navigate, load content sau
```

---

## 14. ERROR HANDLING

| Error Code | Nguyên nhân | Xử lý UI | User message |
|-----------|------------|---------|-------------|
| ERR-NET-001 | Mất kết nối | Banner + retry | "Không có mạng. Vui lòng kiểm tra kết nối." |
| ERR-AUTH-001 | Token hết hạn | Auto refresh | _(transparent to user)_ |
| ERR-AUTH-002 | Refresh thất bại | Redirect login | "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." |
| ERR-{{MOD}}-001 | {{NGUYÊN_NHÂN}} | {{XỬ_LÝ}} | "{{USER_MSG}}" |

---

## 15. PLATFORM-SPECIFIC NOTES

### iOS

- Hỏi quyền notifications, camera, location bằng `NSUsage` description rõ ràng trong Info.plist
- Submit button nên ở bottom (thumb-friendly zone)
- Dùng SF Symbols cho icons (native look)

### Android

- Handle back button: `BackHandler` trong React Native
- Permissions runtime (Android 6+): camera, location, contacts
- Safe area: tránh notch, navigation bar

### Universal Links / Deep Links

```
URL scheme: {{app_scheme}}://
Universal link: https://{{domain}}/{{module}}/[id]

iOS: Associated Domains (apple-app-site-association)
Android: Digital Asset Links (assetlinks.json)
```
