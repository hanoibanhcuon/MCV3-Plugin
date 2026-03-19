# Mobile Deploy Guide — Deploy-Ops cho React Native & Flutter

## Tổng quan

Deployment mobile app khác hoàn toàn với web/backend:
- **App Store review**: iOS 1-3 ngày, Android 1-7 ngày review bởi con người
- **Code signing**: Certificates, provisioning profiles (iOS) và keystore (Android) bắt buộc
- **OTA updates**: React Native hỗ trợ JS update mà không cần submit store
- **Multi-environment**: Dev → Preview/TestFlight → Production tracks
- **Version management**: Semantic version + build number/version code

---

## Cấu trúc Environments

```
Development  → Local simulator/emulator, mock APIs, debug logging
Preview      → TestFlight (iOS) + Internal Testing (Android), staging APIs
Production   → App Store + Google Play, production APIs, crash reporting
```

---

## React Native (Expo) — EAS Build & Submit

### Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login vào Expo account
eas login

# Khởi tạo EAS trong project
eas build:configure

# Cấu hình submit (App Store + Google Play)
eas submit:configure
```

### eas.json — Full Configuration

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "resourceClass": "m-medium" },
      "android": { "buildType": "apk" },
      "env": {
        "APP_ENV": "development",
        "API_BASE_URL": "https://api-dev.{{domain}}.com"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium",
        "simulator": false
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "env": {
        "APP_ENV": "staging",
        "API_BASE_URL": "https://api-staging.{{domain}}.com"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium",
        "image": "latest"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "APP_ENV": "production",
        "API_BASE_URL": "https://api.{{domain}}.com"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "{{APPLE_ID_EMAIL}}",
        "ascAppId": "{{APP_STORE_CONNECT_APP_ID}}",
        "appleTeamId": "{{TEAM_ID}}"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Workflow Build & Deploy

```bash
# ------- DEVELOPMENT BUILD -------
# Build development client (có thể hot-reload)
eas build --profile development --platform all

# Scan QR code cài lên device

# ------- PREVIEW BUILD (TestFlight / Internal Track) -------
# Build preview
eas build --profile preview --platform all --non-interactive

# Distribute via TestFlight / Internal Track
eas submit --profile preview --platform ios
eas submit --profile preview --platform android

# ------- PRODUCTION BUILD -------
# Build production
eas build --profile production --platform all --non-interactive --auto-submit

# Nếu không dùng auto-submit, submit thủ công sau khi build xong
eas submit --profile production --platform all

# ------- OTA UPDATE (không cần submit store) -------
# Chỉ update JS/assets, không thay đổi native code
eas update --branch production --message "Fix: {{description}}" --auto

# OTA channels
eas update --branch staging   # → TestFlight / Internal testers
eas update --branch production  # → All users
```

---

## iOS Code Signing

### Certificate & Provisioning Profile

```bash
# Cách 1: EAS Managed (khuyến nghị — EAS tự quản lý)
eas credentials

# Cách 2: Tự quản lý — tải về từ Apple Developer
# 1. Vào developer.apple.com → Certificates, IDs & Profiles
# 2. Tạo App ID: com.{{company}}.{{appname}}
# 3. Tạo Distribution Certificate (iOS Distribution)
# 4. Tạo Provisioning Profile (App Store Distribution)
# 5. Download và cài vào Keychain
```

### Thông tin cần chuẩn bị

```
Apple Developer Account:
  - Apple ID: {{email}}
  - Team ID: {{10_CHAR_TEAM_ID}} (tìm ở developer.apple.com → Membership)
  - App Store Connect App ID: {{APP_ID}} (tìm ở App Store Connect → App Information)

Certificates (quản lý ở developer.apple.com):
  - Development Certificate: com.{{company}}.{{appname}} (dev)
  - Distribution Certificate: com.{{company}}.{{appname}} (production)

Provisioning Profiles:
  - Development: {{appname}} Development
  - App Store: {{appname}} Distribution

Push Notifications (nếu cần):
  - APNs Key: p8 file từ Apple Developer → Keys
  - Key ID: {{KEY_ID}}
```

### Privacy Nutrition Labels (App Store Required)

```
Khai báo Data Usage trong App Store Connect:
  □ Contact Info (nếu thu thập name, email, phone)
  □ Identifiers (User ID, Device ID)
  □ Location (nếu có GPS)
  □ Health & Fitness (nếu có)
  □ Financial Info (nếu có payment)
  □ Usage Data (analytics, crash data)

Liên kết Privacy Policy: https://{{domain}}.com/privacy
```

---

## Android Code Signing

### Keystore Management

```bash
# Tạo keystore MỘT LẦN DUY NHẤT — lưu cẩn thận, không bao giờ commit vào git
keytool -genkey -v \
  -keystore {{appname}}-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias {{appname}}-key \
  -dname "CN={{FULL_NAME}}, O={{COMPANY}}, L={{CITY}}, S={{STATE}}, C=VN"

# Backup keystore ngay sau khi tạo:
# 1. Upload lên password manager (1Password, Bitwarden)
# 2. Lưu offline (USB drive hoặc safe)
# 3. LƯU PASSWORD — không có cách khôi phục nếu mất

# Sử dụng với EAS — upload keystore lên EAS
eas credentials --platform android
# → chọn "Set up a new keystore" hoặc "Upload existing keystore"
```

### gradle.properties (CI/CD)

```properties
# android/gradle.properties — KHÔNG commit thông tin này
MYAPP_UPLOAD_STORE_FILE={{appname}}-release-key.jks
MYAPP_UPLOAD_KEY_ALIAS={{appname}}-key
MYAPP_UPLOAD_STORE_PASSWORD=***  # Dùng env variable trong CI
MYAPP_UPLOAD_KEY_PASSWORD=***
```

### Data Safety Form (Google Play Required)

```
Khai báo Data Collection tại Google Play Console → App Content → Data Safety:
  □ Data collected: name, email, device ID, usage data, crash logs
  □ Data shared: với analytics providers (Firebase, Sentry)
  □ Encryption in transit: Yes (HTTPS/TLS)
  □ User data deletion: link to account deletion flow

Privacy Policy URL: https://{{domain}}.com/privacy
```

---

## Flutter — Fastlane

### Setup Fastlane

```bash
# Install Fastlane
gem install fastlane

# Init trong project
cd ios && fastlane init
cd ../android && fastlane init
```

### iOS Fastfile

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do

  before_all do
    setup_ci if ENV['CI']
  end

  # Tải certificates + provisioning profiles
  lane :sync_certificates do
    match(type: 'appstore', app_identifier: '{{BUNDLE_ID}}')
  end

  # Build cho TestFlight
  lane :beta do
    sync_certificates
    increment_build_number(xcodeproj: '{{AppName}}.xcodeproj')

    build_app(
      scheme: '{{AppName}}',
      workspace: '{{AppName}}.xcworkspace',
      configuration: 'Release',
      export_method: 'app-store'
    )

    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      groups: ['Beta Testers']
    )
  end

  # Submit lên App Store
  lane :release do
    sync_certificates
    increment_build_number(xcodeproj: '{{AppName}}.xcodeproj')

    build_app(
      scheme: '{{AppName}}',
      workspace: '{{AppName}}.xcworkspace',
      configuration: 'Release',
      export_method: 'app-store'
    )

    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: true,
      automatic_release: false,  # Phát hành thủ công sau review
      phased_release: true       # Phased rollout
    )
  end
end
```

### Android Fastfile

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do

  # Build và upload lên Internal Testing
  lane :internal do
    gradle(
      task: 'bundle',
      build_type: 'Release',
      project_dir: 'android/'
    )

    upload_to_play_store(
      track: 'internal',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab',
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  # Promote từ internal → beta → production
  lane :promote_to_beta do
    upload_to_play_store(
      track: 'internal',
      track_promote_to: 'beta',
      rollout: '0.5'  # 50% users
    )
  end

  lane :promote_to_production do
    upload_to_play_store(
      track: 'beta',
      track_promote_to: 'production',
      rollout: '0.1'  # Bắt đầu với 10% users
    )
  end
end
```

---

## App Store Connect Checklist

### Thông tin cần chuẩn bị

```
App Information:
  □ App Name: {{APP_NAME}} (max 30 chars)
  □ Subtitle: {{SUBTITLE}} (max 30 chars)
  □ Bundle ID: com.{{company}}.{{appname}}
  □ SKU: {{UNIQUE_SKU}}
  □ Primary Language: Vietnamese
  □ Primary Category: {{CATEGORY}}
  □ Secondary Category: {{OPTIONAL}}

Version Information:
  □ Version: {{1.0.0}}
  □ What's New: {{RELEASE_NOTES_VN}} (max 4000 chars)
  □ Build: {{BUILD_NUMBER}}

App Review Information:
  □ Demo account: username + password để Apple reviewer test
  □ Review Notes: hướng dẫn review nếu có flows phức tạp
  □ Contact: phone + email của reviewer contact

Screenshots (Required):
  □ iPhone 6.9" (iPhone 16 Pro Max): 1290 × 2796 — ít nhất 3 ảnh
  □ iPad 13" (optional nhưng recommended): 2064 × 2752
  Note: Screenshots có thể localize theo ngôn ngữ

App Preview Videos (optional nhưng tăng conversion):
  □ 6.9" format: 886 × 1920, tối đa 30 giây, .mov/.mp4

Pricing:
  □ Free (recommend nếu không có subscription)
  □ Paid: set price tier
  □ In-App Purchases: set up nếu có IAP/subscription

Age Rating:
  □ Fill in Content Rights questionnaire
```

---

## Google Play Console Checklist

### Thông tin cần chuẩn bị

```
Store Listing:
  □ App Name: {{APP_NAME}} (max 50 chars)
  □ Short Description: {{SHORT_DESC}} (max 80 chars)
  □ Full Description: {{FULL_DESC}} (max 4000 chars)
  □ App Icon: 512 × 512 PNG
  □ Feature Graphic: 1024 × 500 PNG/JPEG

Screenshots:
  □ Phone: ít nhất 2, tối đa 8, min 320px, max 3840px
  □ Tablet 7": optional
  □ Tablet 10": optional

Content Rating:
  □ Fill in content rating questionnaire
  □ Target age group: All ages / Teen / Mature

App Content:
  □ Privacy Policy URL
  □ Data Safety form (xem phần Android Code Signing)
  □ Ads: app có quảng cáo không?
  □ Target audience & content

App Signing:
  □ Enroll in Google Play App Signing (recommended)
  □ Upload signing key nếu tự manage

Pricing:
  □ Free / Paid / Free with IAP

Review Distribution:
  Internal Testing (up to 100 testers) → Closed Testing → Open Testing → Production
```

---

## TestFlight Setup

```bash
# Upload build xong → TestFlight tự xử lý
# Trên App Store Connect:
# 1. Vào TestFlight tab → Builds
# 2. Chờ processing (~30-60 phút)
# 3. Add testing groups:
#    - Internal Testers (max 100): team members
#    - External Testers (max 10,000): beta users

# Invite testers
# Internal: dùng Apple ID của team
# External: gửi link hoặc email invitation, cần review từ Apple (1-2 ngày cho lần đầu)

# TestFlight release notes (hiển thị cho testers)
# App Store Connect → TestFlight → Build → Test Information
```

---

## OTA Updates — EAS Update (React Native)

```bash
# EAS Update chỉ update JS bundle + assets, KHÔNG update native code
# Dùng cho: bug fixes, text changes, UI tweaks, non-native features

# Setup trong app.config.js
export default {
  // ...
  updates: {
    enabled: true,
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/{{PROJECT_ID}}'
  },
  runtimeVersion: {
    policy: 'sdkVersion'  // Hoặc 'appVersion' nếu cần kiểm soát hơn
  }
}

# Deploy OTA update
eas update --branch production --message "Fix: login button không hoạt động"

# OTA theo branch
eas update --branch staging --message "Feature: thêm dark mode"

# Rollback OTA (set lại về update trước đó)
eas update --branch production --republish --group {{UPDATE_GROUP_ID}}

# Xem update history
eas update:list --branch production
```

### OTA Update Strategy

```
Nên dùng OTA khi:
  ✅ Bug fix không liên quan native code
  ✅ Text/copy changes
  ✅ UI layout (không dùng native modules mới)
  ✅ Business logic changes (JS only)
  ✅ Hot fix khẩn cấp

KHÔNG dùng OTA khi:
  ❌ Thêm/xóa native modules
  ❌ Thay đổi app permissions
  ❌ Thay đổi Info.plist / AndroidManifest.xml
  ❌ Thêm native dependencies
  ❌ Expo SDK upgrade
  → Những trường hợp này cần build mới và submit store
```

---

## CI/CD Pipeline — Mobile

### GitHub Actions

```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile Deploy

on:
  push:
    tags:
      - 'v*'   # Trigger khi push tag: git tag v1.2.0 && git push --tags

jobs:
  # ------- Tests trước khi build -------
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -- --passWithNoTests --forceExit
      - run: npx tsc --noEmit  # TypeScript check

  # ------- EAS Build iOS -------
  build-ios:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: |
          eas build \
            --profile production \
            --platform ios \
            --non-interactive \
            --auto-submit

  # ------- EAS Build Android -------
  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: |
          eas build \
            --profile production \
            --platform android \
            --non-interactive \
            --auto-submit

  # ------- OTA Hotfix (fast lane) -------
  ota-update:
    if: startsWith(github.ref, 'refs/tags/hotfix-')
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: |
          eas update \
            --branch production \
            --message "${{ github.ref_name }}" \
            --auto
```

---

## Monitoring Mobile App

### Crash Reporting

```typescript
// Sentry setup cho React Native
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.APP_ENV,
  // Bật tracing để đo performance
  tracesSampleRate: process.env.APP_ENV === 'production' ? 0.1 : 1.0,
  // Capture Expo updates version
  dist: Updates.updateId ?? 'development',
})

// Capture user context
Sentry.setUser({
  id: userId,
  email: userEmail,
})
```

### Analytics

```typescript
// Firebase Analytics
import analytics from '@react-native-firebase/analytics'

// Track screen views tự động (Expo Router)
// Manual tracking
await analytics().logEvent('{{module}}_created', {
  module_type: '{{type}}',
  user_role: userRole,
})

// Track feature usage
await analytics().logEvent('feature_used', {
  feature_name: '{{feature}}',
  screen: '{{screen}}',
})
```

### Key Metrics để Monitor

| Metric | Tool | Target | Alert khi |
|--------|------|--------|----------|
| Crash-free users | Firebase Crashlytics / Sentry | ≥ 99.5% | < 99% |
| App Start Time | Firebase Performance | < 3s cold, < 1s warm | > 5s |
| API error rate | Sentry | < 1% | > 3% |
| OTA update success rate | EAS Dashboard | ≥ 99% | < 95% |
| App Store rating | App Store Connect | ≥ 4.0 | < 3.5 |
| Play Store rating | Google Play Console | ≥ 4.0 | < 3.5 |
| ANR rate (Android) | Play Console | < 0.47% | > 0.47% (Google threshold) |
| Crash rate (Android) | Play Console | < 1.09% | > 1.09% (Google threshold) |

---

## Go-Live Checklist — Mobile

### Pre-Release (T-7 ngày)

```
Development:
  [ ] Tất cả P0 test cases PASS (xem TEST-*.md)
  [ ] TypeScript không có errors (npx tsc --noEmit)
  [ ] Bundle size kiểm tra: iOS < 150MB, Android < 100MB (APK)
  [ ] No console.log() calls trong production code
  [ ] API endpoints trỏ đúng production

iOS:
  [ ] Build thành công trên Xcode (Release scheme)
  [ ] Code signing valid (certificate + provisioning profile)
  [ ] Info.plist: Privacy usage descriptions đầy đủ (camera, location, contacts...)
  [ ] App icons đủ sizes (dùng expo-image-asset-generator)
  [ ] Launch screen (splash screen) configured
  [ ] Deep links tested (universal links)
  [ ] Apple Sign In implemented (nếu có social login)
  [ ] Privacy Nutrition Labels declared
  [ ] TestFlight internal test → ít nhất 5 người test

Android:
  [ ] Build thành công với release keystore
  [ ] targetSdkVersion >= 34 (yêu cầu 2024)
  [ ] Permissions tối giản (chỉ những gì cần thiết)
  [ ] App Bundle (.aab) không phải APK cho production
  [ ] Data Safety form completed
  [ ] Proguard rules kiểm tra (không obfuscate quá mức)
  [ ] Internal testing → ít nhất 5 người test

App Store Listing:
  [ ] Screenshots chụp xong (điện thoại + tablet nếu support)
  [ ] App description viết bằng tiếng Việt (và English nếu cần)
  [ ] Keywords research done (App Store Optimization)
  [ ] App preview video (optional nhưng tăng conversion)
  [ ] What's New text cho version này

Push Notifications:
  [ ] APNs certificate/key configured (iOS)
  [ ] FCM server key configured (Android)
  [ ] Test notification nhận được trên cả 2 platforms

Performance:
  [ ] Cold start < 3s trên mid-range device (Realme/Xiaomi tầm trung)
  [ ] List scroll 60fps khi có 50+ items
  [ ] Memory usage ổn định (không leak khi navigate nhiều)
  [ ] Offline mode hoạt động đúng (nếu có)

Security:
  [ ] Certificate pinning (nếu app tài chính/y tế)
  [ ] API keys không hardcode trong code
  [ ] Secrets trong .env.* không commit vào git
  [ ] Token storage: Expo SecureStore (không dùng AsyncStorage cho tokens)

### App Submission (T-0)
  [ ] Bump version number (Semantic Versioning)
  [ ] Build production với đúng config
  [ ] Submit iOS → App Store Connect
  [ ] Submit Android → Google Play Console → Production track
  [ ] Set release date (manual release sau review)

### Post-Release (T+24h đến T+7 ngày)
  [ ] Monitor Crashlytics: crash-free rate ≥ 99.5%
  [ ] Monitor ANR rate (Android) < 0.47%
  [ ] Đọc review mới trên App Store và Play Store
  [ ] Kiểm tra metrics trong Firebase / analytics
  [ ] Chuẩn bị hotfix nếu cần (OTA nếu được, hoặc build mới)
```

---

## Rollback Plan cho Mobile

### Scenario 1: OTA Rollback (Nhanh — < 5 phút)

```bash
# Rollback về update trước đó
eas update:list --branch production --limit 5
# → Tìm GROUP_ID của update muốn rollback về

eas update --branch production \
  --republish \
  --group {{PREVIOUS_GROUP_ID}} \
  --message "Rollback: revert to previous stable version"
```

### Scenario 2: Store Version Rollback (Chậm — cần submit)

```
Khi nào cần:
  - Bug nghiêm trọng liên quan native code
  - OTA không đủ để fix

Cách thực hiện:
  1. Không thể xóa version đã published khỏi store
  2. Fix bug → Build mới → Submit review (1-3 ngày iOS, 1-7 ngày Android)
  3. Tạm thời: Push OTA update để giảm thiệt hại trong khi chờ review

iOS App Store:
  → Không có official rollback. Phải submit version mới.
  → Có thể dừng phát hành (Pause/Remove from sale) nhưng không rollback.

Google Play:
  → Có thể rollback về version cũ trong vòng 1 giờ sau khi phát hành
  → Google Play Console → Release → Production → xem Version history → Rollback

Phòng tránh:
  → Phased rollout: bắt đầu 5% → 25% → 100% theo từng ngày
  → Halt rollout khi phát hiện issue, fix và resume
```

### Phased Rollout Strategy

```
App Store (iOS):
  Manual release → Phased Release (7 ngày):
  Day 1: 1% → Day 2: 2% → Day 3: 5% → Day 4: 10%
  → Day 5: 20% → Day 6: 50% → Day 7: 100%

Google Play (Android):
  Internal (100 users) → Closed Beta → Open Beta → Production
  Production rollout: start 5% → 25% → 50% → 100%

Khi nào halt rollout:
  - Crash rate tăng > 2x so với previous version
  - ANR rate > 0.47% (Android auto-warn)
  - Rating giảm đột ngột
  - P0 bug được report
```
