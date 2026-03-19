# Project Type Guides — Hướng dẫn theo loại dự án

## Loại A: Có codebase, ít/không có docs

### Đặc điểm
- Code đang chạy (production hoặc staging)
- Không có hoặc rất ít documentation
- Team biết "cái gì" nhưng không document "tại sao"
- Thường: startup, legacy system, solo developer project

### Focus của Assessment
1. **Reverse-engineer** cấu trúc từ code
2. **Extract** implicit business rules từ service logic
3. **Map** APIs và DB tables sang formal IDs
4. **Estimate** coverage và quality

### Workflow đặc biệt cho Loại A

**Phase 1 — Scan Code:**
```
1. Chạy scan-codebase.sh để lấy manifest.json
2. Từ manifest, xác định:
   - Systems (= top-level packages/apps)
   - Modules (= subdirectories với controllers)
   - Tech stack (để biết dùng framework nào)
3. Tạo PROJECT-MANIFEST từ manifest.json
```

**Phase 2 — Per-system Assessment:**
```
Với mỗi module trong code:
  - List tất cả API endpoints (từ route files)
  - List tất cả DB tables (từ migrations/models)
  - Detect business logic (từ service files)
  - Check test coverage (từ spec files)
```

**Phase 5 — Remediation Plan:**
```
Priority cho Loại A:
  1. CRITICAL: Viết URS từ service logic (Phase 4)
     → /mcv3:migrate (option 3: reverse-engineer từ code)
  2. HIGH: Tạo MODSPEC từ existing APIs/schema (Phase 5)
     → /mcv3:tech-design (dùng code làm input)
  3. MEDIUM: Tạo TEST spec từ existing tests (Phase 6)
     → /mcv3:qa-docs
  4. LOW: Add REQ-ID comments vào code (Phase 7)
     → Manual + /mcv3:code-gen (annotate mode)
```

**Ưu tiên hàng đầu cho Loại A:**
```
Phase 4 (URS) → Phase 5 (MODSPEC) → Phase 6 (TEST) → Phase 8 (Verify)
```
*(Skip Phase 1-3 hoặc làm nhanh sau vì code đã có)*

---

## Loại B: Có docs cũ, ít/không có code

### Đặc điểm
- Có tài liệu dạng Word/PDF/Confluence/Excel
- Code chưa có hoặc đang bắt đầu
- Docs thường không có formal IDs
- Thường: project planning phase, RFP docs, legacy system replacing

### Focus của Assessment
1. **Classify** từng doc thuộc phase nào
2. **Evaluate quality** của từng doc
3. **Identify gaps** trước khi bắt đầu code
4. **Migrate** docs sang MCV3 format

### Workflow đặc biệt cho Loại B

**Phase 1 — Classify Docs:**
```
User paste/upload danh sách docs → tôi classify:

Doc → Phase mapping:
  "Yêu cầu hệ thống.docx" → Phase 4 (Requirements) — URS candidate
  "Sơ đồ nghiệp vụ.pdf"  → Phase 3 (BizDocs) — PROCESS candidate
  "API Design v2.xlsx"    → Phase 5 (Tech Design) — MODSPEC candidate
  "Test Plan Q1.xlsx"     → Phase 6 (QA) — TEST candidate
  "Hướng dẫn sử dụng.pdf" → Phase 6 (QA) — USER-GUIDE candidate
  "System Architecture.pptx" → Phase 2 (Expert) — context
```

**Phase 2 — Quality Assessment:**
```
Đánh giá từng doc:

"Yêu cầu hệ thống.docx" — Phase 4 (URS candidate):
  ✅ Có user stories rõ ràng (dù không có formal IDs)
  ⚠️ Không có Acceptance Criteria
  ⚠️ Actors chưa được define rõ
  ❌ Không có NFRs
  → Chất lượng: PARTIAL — cần bổ sung AC và NFR sau migrate

"API Design v2.xlsx" — Phase 5 (MODSPEC candidate):
  ✅ Có đầy đủ endpoints với method/path
  ✅ Có request/response examples
  ⚠️ Auth chưa được specify
  ⚠️ Error responses chưa đầy đủ
  → Chất lượng: GOOD — cần bổ sung error handling
```

**Phase 5 — Remediation Plan:**
```
Priority cho Loại B:
  1. CRITICAL: Migrate docs sang MCV3 format với formal IDs
     → /mcv3:migrate (option 1: Documents)
  2. HIGH: Bổ sung gaps phát hiện (ACs, NFRs, etc.)
     → /mcv3:requirements (enrich mode)
  3. MEDIUM: Tạo MODSPEC từ API docs
     → /mcv3:tech-design (từ existing spec)
  4. LOW: Bắt đầu code từ MODSPEC
     → /mcv3:code-gen (sau khi có MODSPEC)
```

**Ưu tiên hàng đầu cho Loại B:**
```
Phase 3 (migrate BizDocs) → Phase 4 (migrate/complete URS) →
Phase 5 (migrate/create MODSPEC) → Phase 7 (Code Gen)
```

---

## Loại C: Có cả code lẫn docs nhưng chưa đồng bộ

### Đặc điểm
- Code và docs cùng tồn tại
- Chúng không match nhau (drift xảy ra theo thời gian)
- Thường: dự án agile có docs nhưng không cập nhật khi code thay đổi
- Thường: dự án dùng Scrum với docs từ discovery nhưng code evolve nhanh

### Focus của Assessment
1. **Phát hiện drift** giữa code và docs
2. **Phân loại** drift: code đúng hay docs đúng?
3. **Sync plan** để đưa về đồng bộ

### Workflow đặc biệt cho Loại C

**Phase 1 — Inventory:**
```
Liệt kê:
  - Docs hiện có (type, last modified, version)
  - Code structure (modules, APIs, tables)

Phát hiện timeline drift:
  - Docs created: {date}
  - Last code commit: {date}
  - Gap: {N} months
  → Càng lâu không update docs → càng nhiều drift
```

**Phase 4 — Sync Check (quan trọng nhất cho Loại C):**
```
Chạy đầy đủ sync check theo sync-check-rules.md:
  - API sync: code endpoints vs MODSPEC
  - DB sync: migrations vs DATA-MODEL
  - Business rules: service logic vs BIZ-POLICY
  - Traceability: code @req-ids vs formal IDs

Output: SYNC-REPORT với chi tiết drift
```

**Phân loại drift - "Code hay Docs đúng?"**
```
Hỏi user về mỗi drift:

"DRIFT-001: API path đổi từ /v1/orders sang /v2/orders
  Code: /v2/orders (updated 3 months ago)
  Docs: /v1/orders (last updated 8 months ago)

  Đây là: [A] Code đúng, cần update docs
         [B] Docs đúng, code cần rollback
         [C] Cả hai sai, cần clarify"
```

**Phase 5 — Remediation Plan:**
```
Priority cho Loại C:
  1. CRITICAL: Sync ERRORs (value drifts, method changes)
     → /mcv3:change-manager (cho từng drift)
  2. HIGH: Sync WARNINGs (missing APIs in docs, undocumented tables)
     → /mcv3:tech-design (update mode)
  3. MEDIUM: Hoàn thiện missing docs
     → Skills tùy theo phase thiếu
  4. LOW: Add formal IDs vào code
     → /mcv3:code-gen (annotate existing)
```

---

## Loại D: Dự án production, muốn formalize

### Đặc điểm
- Hệ thống đang chạy production
- Muốn có documentation đầy đủ để:
  - Onboard developers mới
  - Maintain và extend system
  - Compliance requirements
  - Due diligence (M&A, audit)
- Không có nhiều gaps về code, nhiều gaps về docs

### Focus của Assessment
1. **Full audit** từ Phase 1 đến Phase 8
2. **Risk assess** về gaps hiện tại
3. **Compliance check** nếu có regulatory requirements
4. **Prioritize** documentation effort

### Workflow đặc biệt cho Loại D

**Phase 0 — Context Gathering:**
```
"Mục tiêu formalize documentation là gì?
[A] Onboard developers mới → Focus: MODSPEC, Code annotation
[B] Compliance/Audit → Focus: BizDocs, Requirements, Traceability
[C] Due diligence (M&A) → Focus: Full documentation
[D] Maintenance/extend → Focus: MODSPEC, Verify
[E] Tất cả → Comprehensive assessment"
```

**Phase 2 — Risk Assessment:**
```
Với dự án production, mỗi gap có risk:

GAP | Risk Level | Impact
----|-----------|-------
Thiếu URS | HIGH | Không biết expected behavior → bugs khó diagnose
Thiếu MODSPEC | HIGH | Developer mới không hiểu API → implementation mistakes
Thiếu Test specs | MEDIUM | Regression bugs không được catch
Thiếu REQ-ID comments | LOW | Khó trace code về requirements
Thiếu Traceability | HIGH | Change impact không thể assess
```

**Phase 5 — Priority theo Mục tiêu:**

*Nếu Onboard developers:*
```
1. Tạo MODSPEC từ code (Phase 5) — Developer reference
2. Tạo USER/ADMIN GUIDE (Phase 6) — Operations guide
3. Add REQ-ID comments (Phase 7) — Code navigation
```

*Nếu Compliance/Audit:*
```
1. Tạo BIZ-POLICY với BR-IDs (Phase 3) — Policy documentation
2. Migrate informal requirements → formal URS (Phase 4)
3. Tạo Traceability matrix (Phase 8)
```

*Nếu Full:*
```
Theo thứ tự: Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 8
```

**Ưu tiên hàng đầu cho Loại D:**
```
Dựa theo mục tiêu → xem mapping trên
Nếu không chắc: Phase 5 (MODSPEC) trước — highest ROI cho developer productivity
```

---

## Quick Decision Guide

```
Nhận dự án mới → Loại nào?

Has code?
  YES → Has docs?
    YES → Loại C (code + docs, check sync)
    NO  → Loại A (code only, reverse engineer)
  NO  → Has docs?
    YES → Loại B (docs only, migrate)
    NO  → Đây là dự án mới → dùng /mcv3:discovery (không phải /mcv3:assess)

Is production?
  YES → Loại D overlay (add risk assessment)
  NO  → Standard A/B/C
```

---

## Assessment Duration Estimate

| Loại | Phase 1 | Phase 2 | Phase 3-4 | Phase 5-6 | Total |
|------|---------|---------|-----------|-----------|-------|
| A (code only) | ~30min | ~1h/system | ~30min | ~1h | ~3-4h |
| B (docs only) | ~20min | ~45min/doc | ~20min | ~45min | ~2-3h |
| C (code+docs) | ~45min | ~1h/system | ~45min | ~1h | ~4-5h |
| D (production) | ~1h | ~1.5h/system | ~1h | ~2h | ~6-8h |

*Với dự án có nhiều systems/modules, nhân tương ứng*
