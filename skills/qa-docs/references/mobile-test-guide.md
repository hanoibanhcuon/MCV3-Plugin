# Mobile Test Guide — QA Docs cho React Native & Flutter

## Tổng quan

Testing mobile khác với testing web/backend vì:
- **Platform duality**: Phải test trên cả iOS và Android
- **Device fragmentation**: Nhiều màn hình, OS versions, hardware
- **UI rendering**: Component tests thay vì DOM tests
- **Native features**: Camera, GPS, push notifications, biometric
- **Offline behavior**: Data sync, conflict resolution
- **Performance**: FPS, memory, battery drain

---

## Chiến lược Testing 3 Tầng

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: Unit Tests (fast, CI/CD)                        │
│  ├── Store/state logic tests (Zustand, Riverpod)         │
│  ├── Business rule tests (validation, calculation)       │
│  ├── API client tests (mock axios/dio)                   │
│  └── Utility function tests                              │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Component / Widget Tests (medium speed)         │
│  ├── React Native Testing Library (RNTL) — RN            │
│  ├── Flutter Widget Test — Flutter                       │
│  ├── Screen rendering tests                              │
│  └── User interaction tests (tap, input, scroll)        │
├─────────────────────────────────────────────────────────┤
│  Tier 3: E2E Tests (slowest, most realistic)             │
│  ├── Detox — React Native                                │
│  ├── Flutter integration_test — Flutter                  │
│  ├── Full user flows trên simulator/emulator             │
│  └── Real device cloud (BrowserStack / Firebase TestLab) │
└─────────────────────────────────────────────────────────┘
```

---

## React Native Testing

### Setup

```json
// package.json dependencies
{
  "devDependencies": {
    "@testing-library/react-native": "^12.x",
    "@testing-library/jest-native": "^5.x",
    "jest": "^29.x",
    "jest-expo": "^51.x",
    "detox": "^20.x",
    "@faker-js/faker": "^8.x"
  }
}
```

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Exclude E2E từ unit test run
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
}
```

---

### Tier 1 — Unit Tests (React Native)

#### Store/State Logic Tests

```typescript
// stores/__tests__/{{module}}.store.test.ts
// REQ-ID: TC-{{MOD}}-001 — Store state management
import { act, renderHook } from '@testing-library/react-native'
import { use{{Module}}Store } from '../{{module}}.store'

describe('{{Module}}Store', () => {

  beforeEach(() => {
    use{{Module}}Store.getState().reset()
  })

  // TC-{{MOD}}-001: Happy path — set items
  it('should set items correctly', () => {
    const { result } = renderHook(() => use{{Module}}Store())
    const mockItems = [{ id: '1', name: 'Test {{Module}}' }]

    act(() => {
      result.current.setItems(mockItems)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('1')
  })

  // TC-{{MOD}}-002: Loading state
  it('should set loading state', () => {
    const { result } = renderHook(() => use{{Module}}Store())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)
  })

  // TC-{{MOD}}-003: Error state
  it('should set error and clear on reset', () => {
    const { result } = renderHook(() => use{{Module}}Store())

    act(() => {
      result.current.setError('Network error')
    })
    expect(result.current.error).toBe('Network error')

    act(() => {
      result.current.reset()
    })
    expect(result.current.error).toBeNull()
  })
})
```

#### API Client Tests

```typescript
// services/api/__tests__/{{module}}.api.test.ts
// REQ-ID: TC-{{MOD}}-010 — API calls
import axios from 'axios'
import { {{module}}Api } from '../{{module}}.api'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('{{Module}}Api', () => {

  // TC-{{MOD}}-010: Successful list fetch
  it('should fetch list successfully', async () => {
    const mockData = [{ id: '1', name: '{{Module}} 1' }]
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: mockData, meta: { page: 1, total: 1 } }
    })

    const result = await {{module}}Api.list()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/{{resource}}', {
      params: expect.any(Object)
    })
    expect(result.data).toHaveLength(1)
  })

  // TC-{{MOD}}-011: Network error handling
  it('should throw on network error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'))

    await expect({{module}}Api.list()).rejects.toThrow('Network Error')
  })

  // TC-{{MOD}}-012: Create {{module}}
  it('should create {{module}} with correct payload', async () => {
    const dto = { name: 'New {{Module}}', {{field}}: '{{value}}' }
    const created = { id: 'new-id', ...dto }
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, data: created }
    })

    const result = await {{module}}Api.create(dto)

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/{{resource}}', dto)
    expect(result.id).toBe('new-id')
  })
})
```

#### Business Rule Tests

```typescript
// utils/__tests__/{{module}}.validators.test.ts
// REQ-ID: TC-{{MOD}}-020 — Business rule validation
import { validate{{Module}} } from '../{{module}}.validators'

describe('{{Module}} Validators', () => {

  // TC-{{MOD}}-020: Valid input
  it('should pass validation for valid {{module}}', () => {
    const validInput = {
      {{field}}: '{{valid_value}}',
    }
    const result = validate{{Module}}.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  // TC-{{MOD}}-021: BR-{{DOM}}-001 — {{RULE_NAME}}
  it('should reject {{field}} that violates BR-{{DOM}}-001', () => {
    const invalidInput = {
      {{field}}: '{{invalid_value}}',
    }
    const result = validate{{Module}}.safeParse(invalidInput)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('{{ERROR_MESSAGE}}')
  })
})
```

---

### Tier 2 — Component Tests (RNTL)

#### Screen Render Tests

```typescript
// app/(tabs)/{{module}}/__tests__/{{Module}}ListScreen.test.tsx
// REQ-ID: TC-{{MOD}}-030 — Screen rendering
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { {{Module}}ListScreen } from '../{{module}}'

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  Link: ({ children }: any) => children,
}))

// Mock store
jest.mock('@/stores/{{module}}.store', () => ({
  use{{Module}}Store: () => ({
    items: [
      { id: '1', name: '{{Module}} 1', status: 'active' },
      { id: '2', name: '{{Module}} 2', status: 'inactive' },
    ],
    isLoading: false,
    error: null,
    setItems: jest.fn(),
  }),
}))

describe('{{Module}}ListScreen', () => {

  // TC-{{MOD}}-030: Render với data
  it('renders list of {{module}}s', () => {
    render(<{{Module}}ListScreen />)

    expect(screen.getByText('{{Module}} 1')).toBeTruthy()
    expect(screen.getByText('{{Module}} 2')).toBeTruthy()
  })

  // TC-{{MOD}}-031: Empty state
  it('renders empty state when no items', () => {
    jest.spyOn(require('@/stores/{{module}}.store'), 'use{{Module}}Store')
      .mockReturnValue({ items: [], isLoading: false, error: null })

    render(<{{Module}}ListScreen />)

    expect(screen.getByText(/chưa có/i)).toBeTruthy()  // Adjust text
  })

  // TC-{{MOD}}-032: Loading state
  it('renders skeleton when loading', () => {
    jest.spyOn(require('@/stores/{{module}}.store'), 'use{{Module}}Store')
      .mockReturnValue({ items: [], isLoading: true, error: null })

    render(<{{Module}}ListScreen />)

    expect(screen.getByTestId('{{module}}-skeleton')).toBeTruthy()
  })

  // TC-{{MOD}}-033: Navigation on tap
  it('navigates to detail when item tapped', async () => {
    const mockPush = jest.fn()
    jest.spyOn(require('expo-router'), 'useRouter')
      .mockReturnValue({ push: mockPush })

    render(<{{Module}}ListScreen />)

    fireEvent.press(screen.getByText('{{Module}} 1'))

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/{{module}}/1')
  })
})
```

#### Form Interaction Tests

```typescript
// app/{{module}}/create/__tests__/Create{{Module}}Screen.test.tsx
// REQ-ID: TC-{{MOD}}-040 — Form interaction
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { Create{{Module}}Screen } from '../create'

describe('Create{{Module}}Screen', () => {

  // TC-{{MOD}}-040: Submit valid form
  it('submits form with valid data', async () => {
    const mockCreate = jest.fn().mockResolvedValue({ id: 'new-id' })
    jest.mock('@/services/api/{{module}}.api', () => ({
      {{module}}Api: { create: mockCreate }
    }))

    render(<Create{{Module}}Screen />)

    fireEvent.changeText(
      screen.getByPlaceholderText('{{PLACEHOLDER}}'),
      '{{VALID_VALUE}}'
    )
    fireEvent.press(screen.getByText('Lưu'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        {{field}}: '{{VALID_VALUE}}'
      })
    })
  })

  // TC-{{MOD}}-041: Validation error display
  it('shows validation error for empty required field', async () => {
    render(<Create{{Module}}Screen />)

    fireEvent.press(screen.getByText('Lưu'))

    await waitFor(() => {
      expect(screen.getByText('{{REQUIRED_ERROR_MSG}}')).toBeTruthy()
    })
  })

  // TC-{{MOD}}-042: Disable submit when loading
  it('disables submit button while submitting', async () => {
    render(<Create{{Module}}Screen />)

    // Fill valid data
    fireEvent.changeText(
      screen.getByPlaceholderText('{{PLACEHOLDER}}'),
      '{{VALID_VALUE}}'
    )
    fireEvent.press(screen.getByText('Lưu'))

    // Button should be disabled during submit
    expect(screen.getByText('Lưu').parent?.props.disabled).toBe(true)
  })
})
```

---

### Tier 3 — E2E Tests với Detox (React Native)

#### Setup Detox

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: { '$0': 'jest', config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 120000 }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/{{AppName}}.app',
      build: 'xcodebuild -workspace ios/{{AppName}}.xcworkspace -scheme {{AppName}} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' }
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_6_API_34' }
    }
  },
  configurations: {
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator', app: 'android.debug' }
  }
}
```

#### E2E Test Files

```typescript
// e2e/{{module}}.e2e.ts
// REQ-ID: TC-{{MOD}}-E01 — E2E {{module}} flow
import { device, element, by, expect as detoxExpect } from 'detox'

describe('{{Module}} E2E Flow', () => {

  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    // Login first
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('login-button')).tap()
    await detoxExpect(element(by.id('home-screen'))).toBeVisible()
  })

  // TC-{{MOD}}-E01: Navigate to {{module}} tab
  it('should navigate to {{module}} tab', async () => {
    await element(by.id('tab-{{module}}')).tap()
    await detoxExpect(element(by.id('{{module}}-list-screen'))).toBeVisible()
  })

  // TC-{{MOD}}-E02: Create new {{module}}
  it('should create a new {{module}}', async () => {
    await element(by.id('create-{{module}}-fab')).tap()
    await detoxExpect(element(by.id('create-{{module}}-screen'))).toBeVisible()

    await element(by.id('{{field}}-input')).typeText('{{TEST_VALUE}}')
    await element(by.id('submit-button')).tap()

    // Verify created item appears in list
    await detoxExpect(element(by.text('{{TEST_VALUE}}'))).toBeVisible()
  })

  // TC-{{MOD}}-E03: View {{module}} detail
  it('should open {{module}} detail', async () => {
    await element(by.text('{{TEST_VALUE}}')).tap()
    await detoxExpect(element(by.id('{{module}}-detail-screen'))).toBeVisible()
    await detoxExpect(element(by.text('{{TEST_VALUE}}'))).toBeVisible()
  })

  // TC-{{MOD}}-E04: Pull to refresh
  it('should refresh list on pull', async () => {
    await element(by.id('tab-{{module}}')).tap()
    await element(by.id('{{module}}-list')).scroll(300, 'down')
    await element(by.id('{{module}}-list')).scroll(300, 'up', NaN, 0.1)

    // List should still show content after refresh
    await detoxExpect(element(by.id('{{module}}-list'))).toBeVisible()
  })
})
```

---

## Flutter Testing

### Setup

```yaml
# pubspec.yaml dev_dependencies
dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  mocktail: ^1.0.3
  bloc_test: ^9.x
  fake_async: ^1.x
```

---

### Tier 1 — Unit Tests (Flutter)

#### Provider / BLoC Tests

```dart
// features/{{module}}/presentation/providers/{{module}}_notifier_test.dart
// REQ-ID: TC-{{MOD}}-001
import 'package:flutter_test/flutter_test.dart';
import 'package:riverpod/riverpod.dart';
import 'package:mocktail/mocktail.dart';

class Mock{{Module}}Repository extends Mock implements {{Module}}Repository {}

void main() {
  late Mock{{Module}}Repository mockRepository;
  late ProviderContainer container;

  setUp(() {
    mockRepository = Mock{{Module}}Repository();
    container = ProviderContainer(
      overrides: [
        {{module}}RepositoryProvider.overrideWithValue(mockRepository),
      ],
    );
    addTearDown(container.dispose);
  });

  group('{{Module}}Notifier', () {

    // TC-{{MOD}}-001: Load items thành công
    test('loadItems() sets items when repository returns data', () async {
      final mockItems = [
        {{Module}}(id: '1', name: 'Test', createdAt: DateTime.now()),
      ];
      when(() => mockRepository.getAll()).thenAnswer((_) async => mockItems);

      await container.read({{module}}NotifierProvider.notifier).loadItems();

      final state = container.read({{module}}NotifierProvider);
      expect(state.items, equals(mockItems));
      expect(state.isLoading, isFalse);
      expect(state.error, isNull);
    });

    // TC-{{MOD}}-002: Error khi repository throw
    test('loadItems() sets error when repository throws', () async {
      when(() => mockRepository.getAll())
          .thenThrow(Exception('Network error'));

      await container.read({{module}}NotifierProvider.notifier).loadItems();

      final state = container.read({{module}}NotifierProvider);
      expect(state.isLoading, isFalse);
      expect(state.error, isNotNull);
    });
  });
}
```

---

### Tier 2 — Widget Tests (Flutter)

```dart
// features/{{module}}/presentation/pages/{{module}}_list_page_test.dart
// REQ-ID: TC-{{MOD}}-030
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  group('{{Module}}ListPage Widget Tests', () {

    // TC-{{MOD}}-030: Hiện list items
    testWidgets('renders list when data is available', (tester) async {
      final mockItems = [
        {{Module}}(id: '1', name: '{{Module}} Test', createdAt: DateTime.now()),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            {{module}}NotifierProvider.overrideWith(() => Mock{{Module}}Notifier(
              initialState: {{Module}}State(items: mockItems),
            )),
          ],
          child: const MaterialApp(home: {{Module}}ListPage()),
        ),
      );

      await tester.pump();

      expect(find.text('{{Module}} Test'), findsOneWidget);
    });

    // TC-{{MOD}}-031: Empty state
    testWidgets('shows empty state when no items', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            {{module}}NotifierProvider.overrideWith(() => Mock{{Module}}Notifier(
              initialState: const {{Module}}State(items: []),
            )),
          ],
          child: const MaterialApp(home: {{Module}}ListPage()),
        ),
      );

      await tester.pump();

      expect(find.byType({{Module}}EmptyWidget), findsOneWidget);
    });

    // TC-{{MOD}}-032: Tap item navigates to detail
    testWidgets('tapping item navigates to detail', (tester) async {
      final mockRouter = MockGoRouter();
      // ... setup mockRouter, pump widget, tap, verify navigation
    });

    // TC-{{MOD}}-033: Pull to refresh
    testWidgets('pull to refresh triggers reload', (tester) async {
      final notifier = Mock{{Module}}Notifier(
        initialState: {{Module}}State(items: [
          {{Module}}(id: '1', name: 'Item 1', createdAt: DateTime.now()),
        ]),
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            {{module}}NotifierProvider.overrideWith(() => notifier),
          ],
          child: const MaterialApp(home: {{Module}}ListPage()),
        ),
      );

      await tester.fling(find.byType(ListView), const Offset(0, 300), 1000);
      await tester.pumpAndSettle();

      verify(() => notifier.loadItems()).called(greaterThanOrEqualTo(1));
    });
  });
}
```

### Tier 3 — Integration Tests (Flutter)

```dart
// integration_test/{{module}}_flow_test.dart
// REQ-ID: TC-{{MOD}}-E01
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:{{app_name}}/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('{{Module}} Integration Flow', () {

    // TC-{{MOD}}-E01: Complete create flow
    testWidgets('user can create a {{module}}', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Navigate to {{module}} tab
      await tester.tap(find.byIcon(Icons.{{icon}}));
      await tester.pumpAndSettle();

      // Tap create button
      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      // Fill form
      await tester.enterText(find.byKey(const Key('{{field}}-field')), '{{TEST_VALUE}}');
      await tester.tap(find.byKey(const Key('submit-button')));
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify success
      expect(find.text('{{TEST_VALUE}}'), findsOneWidget);
    });
  });
}
```

```bash
# Chạy integration tests
# iOS simulator
flutter test integration_test/ --device-id "iPhone 15"

# Android emulator
flutter test integration_test/ --device-id "emulator-5554"

# Firebase Test Lab (CI/CD)
gcloud firebase test android run \
  --type=instrumentation \
  --app=build/app/outputs/apk/debug/app-debug.apk \
  --test=build/app/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
  --device model=Pixel6,version=33
```

---

## iOS/Android Platform-Specific Test Cases

### Permissions Tests

```typescript
// e2e/permissions.e2e.ts — Detox
describe('Permissions', () => {

  // TC-PERM-001: Camera permission request
  it('should request camera permission', async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'unset' }
    })

    await element(by.id('upload-photo-button')).tap()

    // iOS: System alert sẽ xuất hiện
    await element(by.label('Allow')).tap()  // iOS
    // Android: Permission dialog
    await element(by.text('Allow only while using the app')).tap()
  })

  // TC-PERM-002: App vẫn hoạt động khi từ chối permission
  it('should handle denied camera permission gracefully', async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'denied' }
    })

    await element(by.id('upload-photo-button')).tap()

    // Phải hiện thông báo hướng dẫn bật trong Settings
    await detoxExpect(element(by.id('camera-denied-message'))).toBeVisible()
  })
})
```

### Offline / Network Tests

```typescript
// e2e/offline.e2e.ts — Detox
describe('Offline Behavior', () => {

  // TC-OFFLINE-001: Xem cached content khi offline
  it('should show cached data when offline', async () => {
    // Load data khi online
    await element(by.id('tab-{{module}}')).tap()
    await detoxExpect(element(by.id('{{module}}-list'))).toBeVisible()

    // Disable network
    await device.setURLBlacklist(['.*'])

    // Refresh
    await element(by.id('{{module}}-list')).scroll(300, 'up', NaN, 0.1)

    // Cached data phải vẫn hiện
    await detoxExpect(element(by.id('{{module}}-list'))).toBeVisible()
    await detoxExpect(element(by.id('offline-banner'))).toBeVisible()

    // Restore network
    await device.setURLBlacklist([])
  })
})
```

---

## CI/CD Pipeline cho Mobile Tests

### GitHub Actions

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  # --- Tier 1: Unit Tests (nhanh, chạy mọi PR) ---
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -- --coverage --passWithNoTests
      - uses: codecov/codecov-action@v4

  # --- Tier 2: Component Tests ---
  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test:components

  # --- Tier 3: E2E Tests (chỉ trên main/release branches) ---
  e2e-ios:
    runs-on: macos-14
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: brew install applesimutils
      - run: npx detox build --configuration ios.sim.debug
      - run: npx detox test --configuration ios.sim.debug --cleanup

  e2e-android:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          script: |
            npm ci
            npx detox build --configuration android.emu.debug
            npx detox test --configuration android.emu.debug --cleanup
```

---

## EAS Build Integration (React Native)

```yaml
# eas.json — build profiles cho testing
{
  "build": {
    "test": {
      "android": {
        "buildType": "apk",
        "env": { "NODE_ENV": "test" }
      },
      "ios": {
        "simulator": true,
        "env": { "NODE_ENV": "test" }
      }
    }
  }
}
```

```bash
# Build test binary
eas build --profile test --platform android --non-interactive

# Download và chạy Detox
npx detox test --configuration android.emu.debug \
  --device-name "Pixel 6" \
  --app-path "path/to/downloaded.apk"
```

---

## Test Coverage Targets

| Tier | Metric | Target |
|------|--------|--------|
| Unit Tests | Line coverage | ≥ 80% |
| Unit Tests | Branch coverage | ≥ 70% |
| Component Tests | AC coverage | 100% (mỗi AC có ≥ 1 test) |
| E2E Tests | Critical user flows | 100% (login, main CRUD, payment nếu có) |

---

## Mobile-Specific Test Categories

| Loại Test | Tools (RN) | Tools (Flutter) | Chạy khi |
|-----------|-----------|-----------------|----------|
| Unit (store/logic) | Jest | flutter_test | Mỗi commit |
| Component/Widget | RNTL | Widget Test | Mỗi commit |
| Snapshot | Jest snapshots | Golden files | Mỗi commit |
| E2E iOS | Detox | integration_test | Trước merge |
| E2E Android | Detox | integration_test | Trước merge |
| Performance | Flipper, Profiler | Flutter DevTools | Trước release |
| Accessibility | RNTL a11y queries | Accessibility checker | Sprint review |
| Real device cloud | BrowserStack / Firebase TestLab | Firebase TestLab | Pre-release |
