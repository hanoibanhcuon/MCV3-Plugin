# Tech Stack Guide — Mobile (React Native & Flutter)

Reference cho `/mcv3:code-gen` khi tech stack là mobile app.

---

## React Native

### Expo vs Bare Workflow

| Tiêu chí | Expo Managed | Bare Workflow |
|----------|-------------|---------------|
| Setup | Nhanh, zero config | Cần Xcode/Android Studio |
| Native modules | Chỉ dùng Expo modules | Tự do thêm bất kỳ native module |
| Over-the-air updates | ✅ EAS Update | ✅ EAS Update |
| Custom native code | ❌ | ✅ |
| Build size | Lớn hơn | Nhỏ hơn (tree-shaking) |
| Khi nào chọn | 80% use cases, MVP, prototype | Cần Bluetooth, NFC, custom camera, SDK vendor |

**Khuyến nghị:** Bắt đầu với Expo Managed → Eject khi cần.

### Cấu trúc dự án (Expo + TypeScript)

```
src/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout + navigation container
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab navigator
│   │   ├── index.tsx       # Home tab
│   │   └── profile.tsx     # Profile tab
│   └── [id].tsx            # Dynamic route
│
├── components/
│   ├── ui/                 # Primitive components (Button, Input, Card...)
│   └── {feature}/          # Feature components
│
├── hooks/
│   ├── useAuth.ts
│   └── use{Feature}.ts
│
├── services/
│   └── api/
│       ├── client.ts       # Axios/fetch base client
│       └── {resource}.api.ts
│
├── stores/                 # Zustand stores
│   ├── auth.store.ts
│   └── {feature}.store.ts
│
├── types/
│   └── index.ts
│
└── utils/
    └── index.ts
```

### Navigation (Expo Router / React Navigation)

```typescript
// Expo Router — file-based, tương tự Next.js App Router
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home, User, ShoppingBag } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Home color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn hàng', tabBarIcon: ({ color }) => <ShoppingBag color={color} /> }}
      />
    </Tabs>
  )
}
```

### State Management — Zustand

```typescript
// stores/cart.store.ts
// REQ-ID: FT-CART-001
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

### API Integration — TanStack Query

```typescript
// hooks/useProducts.ts
// REQ-ID: FT-PROD-001
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/services/api/products.api'

export function useProducts(params?: { page?: number; category?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

### Offline-First Patterns

```typescript
// Dùng MMKV cho local storage nhanh (thay AsyncStorage)
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

// WatermelonDB cho offline-first database phức tạp
// Dùng khi: cần sync bidirectional, queries phức tạp, data lớn
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

// NetInfo để detect connectivity
import NetInfo from '@react-native-community/netinfo'

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Sync pending mutations khi có kết nối
        syncPendingOperations()
      }
    })
    return unsubscribe
  }, [])
}
```

### Push Notifications

```typescript
// Expo Notifications
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  })).data

  // Lưu token lên server
  await savePushToken(token)
  return token
}
```

### Build & Deploy (EAS)

```bash
# eas.json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "./google-service-account.json" }
    }
  }
}
```

```bash
# Build cho production
eas build --platform all --profile production

# Submit lên stores
eas submit --platform all

# OTA update (không cần submit lại store)
eas update --branch production --message "Hotfix v1.2.1"
```

---

## Flutter

### Cấu trúc dự án (Feature-First Clean Architecture)

```
lib/
├── main.dart
├── app/
│   ├── app.dart              # MaterialApp config
│   └── router.dart           # go_router config
│
├── core/
│   ├── constants/
│   ├── errors/               # Failure classes
│   ├── network/              # Dio client
│   └── utils/
│
├── features/
│   └── {feature}/
│       ├── data/
│       │   ├── datasources/  # Remote & Local datasources
│       │   ├── models/       # Data models (JSON serializable)
│       │   └── repositories/ # Repository implementations
│       ├── domain/
│       │   ├── entities/     # Business entities
│       │   ├── repositories/ # Repository interfaces
│       │   └── usecases/     # Use cases
│       └── presentation/
│           ├── bloc/         # BLoC / Cubit
│           ├── pages/
│           └── widgets/
│
└── shared/
    ├── widgets/
    └── theme/
```

### State Management — Riverpod

```dart
// features/products/presentation/providers/products_provider.dart
// REQ-ID: FT-PROD-001
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'products_provider.g.dart';

@riverpod
Future<List<Product>> products(ProductsRef ref, {int page = 1}) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProducts(page: page);
}

@riverpod
class CartNotifier extends _$CartNotifier {
  @override
  List<CartItem> build() => [];

  void addItem(Product product) {
    state = [...state, CartItem(product: product, quantity: 1)];
  }
}
```

### Navigation — go_router

```dart
// app/router.dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = ref.read(authProvider).isLoggedIn;
    if (!isLoggedIn && !state.matchedLocation.startsWith('/auth')) {
      return '/auth/login';
    }
    return null;
  },
  routes: [
    ShellRoute(
      builder: (context, state, child) => ScaffoldWithNav(child: child),
      routes: [
        GoRoute(path: '/', builder: (context, state) => const HomePage()),
        GoRoute(
          path: '/products/:id',
          builder: (context, state) =>
              ProductDetailPage(id: state.pathParameters['id']!),
        ),
      ],
    ),
    GoRoute(path: '/auth/login', builder: (context, state) => const LoginPage()),
  ],
);
```

### HTTP + Dio

```dart
// core/network/dio_client.dart
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

@riverpod
Dio dio(DioRef ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL'),
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
  ));

  dio.interceptors.addAll([
    // Auth interceptor
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = ref.read(authProvider).token;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
    // Logging (dev only)
    if (kDebugMode) LogInterceptor(responseBody: true),
  ]);

  return dio;
}
```

---

## Mobile-Specific Considerations

### Deep Linking / Universal Links

```typescript
// React Native — Expo Router tự handle deep links
// app.json
{
  "expo": {
    "scheme": "myapp",       // myapp://path
    "web": { "bundler": "metro" },
    "ios": {
      "associatedDomains": ["applinks:yourdomain.com"] // Universal links
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{ "scheme": "https", "host": "yourdomain.com" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Performance: Image Optimization

```typescript
// React Native — Expo Image (thay Image của RN)
import { Image } from 'expo-image'

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  placeholder={blurhash}     // Blur hash trong khi load
  transition={200}
  style={{ width: 200, height: 200 }}
/>
```

### App Store Requirements

**iOS App Store:**
- Screenshots: 6.5" (iPhone 14 Pro Max), 12.9" (iPad Pro)
- Privacy Nutrition Labels: declare all data usage
- App Review: thường 1-3 ngày
- TestFlight: internal (100 testers) + external (10,000 testers)

**Google Play:**
- Screenshots: phone + tablet (7" + 10")
- Data safety form: declare collection/sharing
- Review: thường 1-7 ngày
- Internal testing → Closed testing → Open testing → Production

### FPS Monitoring & Memory

```typescript
// Tránh re-render không cần thiết
import { memo, useCallback } from 'react'

// ✅ Dùng memo cho list items
const ProductItem = memo(({ product, onPress }: ProductItemProps) => {
  return <Pressable onPress={() => onPress(product.id)}>...</Pressable>
})

// ✅ useCallback cho callbacks truyền vào children
const handlePress = useCallback((id: string) => {
  navigation.navigate('ProductDetail', { id })
}, [navigation])

// ✅ FlashList thay FlatList cho danh sách dài
import { FlashList } from '@shopify/flash-list'

<FlashList
  data={products}
  renderItem={({ item }) => <ProductItem product={item} />}
  estimatedItemSize={80}
/>
```

---

## Code Gen Scaffolding cho Mobile

Khi MODSPEC chọn React Native/Flutter, tạo:

```
src/
├── app/
│   └── {module}/
│       ├── index.tsx          # COMP-{SYS}-NNN: List screen
│       ├── [id].tsx           # COMP-{SYS}-NNN: Detail screen
│       └── create.tsx         # COMP-{SYS}-NNN: Create screen
├── components/
│   └── {module}/
│       ├── {Module}Card.tsx
│       └── {Module}Form.tsx
├── hooks/
│   └── use{Module}.ts         # FT-{SYS}-NNN: query hooks
├── services/api/
│   └── {module}.api.ts        # API-{SYS}-NNN: API calls
└── stores/
    └── {module}.store.ts      # FT-{SYS}-NNN: local state
```
