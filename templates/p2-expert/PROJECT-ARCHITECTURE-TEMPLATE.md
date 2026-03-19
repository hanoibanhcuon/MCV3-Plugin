# PROJECT-ARCHITECTURE
<!-- ============================================================
     KIẾN TRÚC TỔNG THỂ DỰ ÁN
     Gộp: Master Architecture + Integration Spec + Global Tech Stack
     Đây là tài liệu cấp dự án — chi tiết từng system nằm trong
     {SYSTEM}/P2-DESIGN/ARCHITECTURE.md

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  PROJECT-OVERVIEW.md
       Key IDs: AP-XXX, ADR-XXX, INT-XXX, NFR-XXX
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Phase:** Cấp dự án (cập nhật xuyên suốt P1→P2)
> **Loại:** Tài liệu kiến trúc tổng thể
> **Input:** [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md)
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/PROJECT-OVERVIEW.md] — Bối cảnh & mục tiêu dự án

### Tài liệu được sinh từ file này:
- [OUTPUT → {SYSTEM}/P2-DESIGN/ARCHITECTURE.md] — System-level architecture
- [OUTPUT → _SHARED-SERVICES/AUTH-SPEC.md] — Auth service spec
- [OUTPUT → _VERIFY-CROSS/VERIFY-INTEGRATION.md] — Integration verification

### Key Facts:
- **Architecture style:** {{MONOLITH/MICROSERVICE/HYBRID}}
- **Primary integration:** {{INT patterns}}
- **Auth mechanism:** {{JWT/OAuth2/etc}}

---

## 1. KIẾN TRÚC TỔNG THỂ (High-Level Architecture)

### 1.1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│   [End Customer]    [Staff/Employee]    [Admin/Manager]     │
└──────┬──────────────────┬───────────────────┬───────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
  [{{SYS_WEB}}]    [{{SYS_MOBILE}}]    [{{SYS_ERP}}]
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
                  [_SHARED-SERVICES]
                  Auth | Notification | Storage
                          │
                   [External Systems]
                  Payment | Email | 3rd-party
```

### 1.2. Architecture Principles (AP-XXX)

| Mã | Nguyên tắc | Mô tả | Tham chiếu |
|----|-----------|-------|-----------|
| AP-001 | {{TÊN}} | {{MÔ_TẢ}} | [ADR-001] |

### 1.3. Architecture Decisions (ADR-XXX)

| Mã | Quyết định | Lý do | Trade-off | Ngày |
|----|-----------|-------|----------|------|
| ADR-001 | {{QUYẾT_ĐỊNH}} | {{LÝ_DO}} | {{TRADE_OFF}} | {{DATE}} |

---

## 2. TECH STACK

| Layer | Technology | Version | Lý do chọn |
|-------|-----------|---------|-----------|
| Backend | {{TECH}} | {{VER}} | {{LÝ_DO}} |
| Frontend | {{TECH}} | {{VER}} | {{LÝ_DO}} |
| Database | {{TECH}} | {{VER}} | {{LÝ_DO}} |
| Infrastructure | {{TECH}} | {{VER}} | {{LÝ_DO}} |

---

## 3. INTEGRATION MAP (INT-XXX)

### 3.1. Internal Integrations (giữa các systems)

| Mã | Source System | Target System | Phương thức | Dữ liệu | Tần suất |
|----|-------------|--------------|------------|--------|---------|
| INT-001 | {{SYS_A}} | {{SYS_B}} | REST API / Event / Webhook | {{DATA}} | Realtime / Batch |

### 3.2. External Integrations

| Mã | External System | Phương thức | Mục đích | Auth |
|----|----------------|------------|---------|------|
| INT-EXT-001 | {{SYS}} | REST / Webhook | {{MỤC_ĐÍCH}} | {{AUTH}} |

---

## 4. SECURITY ARCHITECTURE

### 4.1. Authentication & Authorization

```
User → Login → Auth Service → JWT Token → API Gateway → Backend
```

| Cơ chế | Áp dụng cho | Chi tiết |
|--------|-----------|---------|
| JWT | API requests | Expires {{N}} hours |
| RBAC | Permission control | Roles: {{ROLES}} |
| {{MECHANISM}} | {{SCOPE}} | {{DETAIL}} |

### 4.2. Security Policies

| Mã | Policy | Áp dụng |
|----|--------|--------|
| NFR-SEC-001 | {{POLICY}} | All systems |

---

## 5. NON-FUNCTIONAL REQUIREMENTS (NFR-XXX)

| Mã | Loại | Yêu cầu | Đo lường |
|----|------|---------|---------|
| NFR-ERP-PERF-001 | Performance | API response < {{N}}ms | 95th percentile |
| NFR-ERP-AVAIL-001 | Availability | Uptime > {{N}}% | Monthly |
| NFR-ERP-SCALE-001 | Scalability | Support {{N}} concurrent users | Load test |

---

## 6. ENVIRONMENTS

| Environment | URL/Host | Mục đích | Deploy khi nào |
|------------|---------|---------|---------------|
| Development | {{URL}} | Dev & unit test | Commit to dev branch |
| Staging | {{URL}} | Integration & UAT | Release candidate |
| Production | {{URL}} | Live | After UAT sign-off |
