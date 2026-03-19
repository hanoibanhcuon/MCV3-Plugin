# Scale Decision Matrix — Khi nào Skip Phase nào an toàn

Hướng dẫn chọn pipeline phù hợp theo quy mô dự án.
Đọc file này tại Phase 0 của Discovery để recommend pipeline cho user.

---

## Ma trận quyết định

| Tiêu chí | Micro | Small | Medium | Large | Enterprise |
|----------|-------|-------|--------|-------|-----------|
| Màn hình / endpoints | 1–10 | 10–30 | 30–100 | 100–300 | 300+ |
| Số systems | 1 | 1 | 1–2 | 3–5 | 5+ |
| Số developers | 1 | 1–2 | 2–5 | 5–15 | 15+ |
| Số stakeholders | 1–2 | 2–4 | 4–10 | 10–30 | 30+ |
| Compliance requirements | None | None | Low | Medium | High |
| Duration estimate | 1–2 sessions | 3–5 sessions | 10–20 sessions | 20–30 sessions | 30+ sessions |

---

## Micro Project

**Ví dụ:** Landing page, Portfolio, Brochure site, Static tool, Chrome Extension

**Scope:**
- 1–5 trang hoặc endpoints, static hoặc near-static
- 1 developer, 1–2 stakeholders
- Không có backend phức tạp, không có auth nghiêm ngặt
- Không có compliance requirements

**Pipeline rút gọn:**
```
Phase 1 (Discovery rút gọn — 15 phút) → Phase 5 (Component list) → Phase 7 (Scaffold)
```

**Phases SKIP an toàn:**
- ❌ Phase 2 (Expert Panel) — không cần phân tích chuyên gia cho scope nhỏ
- ❌ Phase 3 (Biz-Docs) — không có business rules phức tạp
- ❌ Phase 4 (URS formal) — scope rõ ràng, không cần formal URS
- ❌ Phase 6 (QA formal) — không có TC/UAT formal
- ❌ Phase 8 (Verify cross) — không có cross-system traceability

**Discovery rút gọn cho Micro:**
```
Hỏi 5 câu: mục đích, target user, trang/features cần, tech stack ưa thích, deadline
→ Tạo PROJECT-OVERVIEW 1 trang
→ Tạo MODSPEC component list (không cần full schema)
→ Scaffold ngay
```

---

## Small Project

**Ví dụ:** MVP, CRUD app đơn giản, Internal tool, Landing page với backend, Blog platform

**Scope:**
- < 10 màn hình hoặc endpoints chính, 1 system
- 1–2 developers, 2–4 stakeholders
- Auth cơ bản, 1–3 modules
- Không có regulatory compliance

**Pipeline rút gọn:**
```
Phase 1 → Phase 4 (lite URS) → Phase 5 → Phase 7 → Phase 8a (lite verify)
```

**Phases SKIP an toàn:**
- ❌ Phase 2 (Expert Panel) — optional: có thể dùng 1 expert duy nhất nếu domain phức tạp
- ❌ Phase 3 (Biz-Docs) — optional: bỏ qua nếu không có stakeholder approval cần thiết
- ⚠️ Phase 6 (QA formal) — optional: tạo test plan đơn giản, không cần TC formal

**URS lite cho Small:**
```
Chỉ cần: User Stories + Acceptance Criteria chính
Bỏ qua: Use Cases chi tiết, NFR formal (dùng defaults)
Target: 1–2 trang URS per module
```

**Verify lite cho Small:**
```
Kiểm tra: US → Code (2 layers, không full 7 layers)
Output: checklist đơn giản, không cần verification-report.md
```

---

## Medium Project

**Ví dụ:** SaaS MVP, Internal tool 3–10 modules, E-commerce platform, Mobile app B2C

**Scope:**
- 10–50 màn hình hoặc endpoints, 1–2 systems
- 2–5 developers, 4–10 stakeholders
- Multi-role auth, database schema phức tạp
- Compliance thấp (GDPR cơ bản, PCI-DSS nếu thanh toán)

**Pipeline đầy đủ (Phase 3 optional):**
```
Phase 1 → Phase 2 → [Phase 3] → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
```

**Phase 3 — Optional khi:**
- Cần stakeholder sign-off trước khi code
- Business rules phức tạp (pricing, workflows)
- Có PMO hoặc Business Analyst trong team

**Phase 3 — Có thể skip khi:**
- Team nhỏ, founder-led, không cần formal approval
- Business logic đơn giản, rõ ràng trong URS

---

## Large Project

**Ví dụ:** ERP, Enterprise portal, Multi-tenant SaaS, Healthcare system, Logistics platform

**Scope:**
- 50–300 endpoints, 3–5 systems
- 5–15 developers, 10–30 stakeholders
- Complex auth/authorization (RBAC/ABAC)
- Compliance trung bình (SOC 2, ISO 27001 cơ bản)

**Pipeline đầy đủ:**
```
Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8a → 8b
```

**Bắt buộc:**
- ✅ Tất cả 8 phases
- ✅ Cross-system verification
- ✅ Traceability matrix đầy đủ
- ✅ Lifecycle skills (Change Manager, Evolve) khi dự án evolve

---

## Enterprise Project

**Ví dụ:** Core banking, HIS/EMR, ERP regulated, Government system, Fintech compliance-heavy

**Scope:**
- 300+ endpoints, 5+ systems
- 15+ developers, 30+ stakeholders
- Phân quyền phức tạp, audit trail bắt buộc
- Compliance cao (PCI-DSS level 1, HIPAA, Nghị định 13/2023, Thông tư NHNN)

**Pipeline với audit gates:**
```
Phase 1 → 2 → 3 (với legal review) → 4 → 5 → 6 (formal QA) → 7 → 8a → 8b (deployment approval)
```

**Thêm bắt buộc:**
- ✅ Phase 3 BizDocs phải có legal compliance review
- ✅ NFR spec đầy đủ: security, availability, data retention
- ✅ Formal QA với TC/UAT sign-off
- ✅ Deployment phải qua approval gate (pre-prod → prod)
- ✅ Audit trail trong code (log mọi data mutation)

---

## Tiêu chí chọn Pipeline

### Câu hỏi quyết định (hỏi user trong Discovery)

```
1. Có bao nhiêu màn hình / API endpoints chính?
   < 10 → Micro/Small
   10–50 → Small/Medium
   50+ → Large/Enterprise

2. Có bao nhiêu hệ thống (systems) cần xây dựng?
   1 → Micro/Small/Medium
   2–3 → Medium/Large
   4+ → Large/Enterprise

3. Team size?
   1 người → Micro
   2–5 người → Small/Medium
   6+ người → Large/Enterprise

4. Có compliance requirements không? (y/n)
   Không → Micro/Small/Medium
   Có nhẹ → Medium
   Có nghiêm ngặt → Enterprise

5. Có stakeholder approval gates không?
   Không → Micro/Small
   Có → Medium+

6. Dự án có evolve nhiều sau khi launch không?
   Không → Pipeline rút gọn OK
   Có → Cần full pipeline để dễ change management
```

### Quick decision tree

```
Endpoint < 10 + 1 system + 1-2 devs → MICRO
Endpoint < 30 + 1 system + no compliance → SMALL
Endpoint < 100 + 1-2 systems → MEDIUM (Phase 3 optional)
Endpoint 100+ hoặc 3+ systems → LARGE
Compliance cao (fintech/healthcare/gov) → ENTERPRISE
```

---

## Ghi chú quan trọng

```
KHÔNG SKIP phase vì "nhanh hơn" — chỉ skip khi scope thực sự không cần
LUÔN giải thích cho user tại sao skip phase nào
DOCUMENT việc skip: ghi vào PROJECT-OVERVIEW section "Pipeline variant"
NẾU NGHI NGỜ → đi full pipeline, có thể làm nhanh mỗi phase
```

---

## Liên kết

- `skills/discovery/SKILL.md` — quy trình phỏng vấn
- `skills/discovery/references/project-overview-schema.md` — format output
- `skills/navigator/SKILL.md` — hiển thị pipeline recommendation
