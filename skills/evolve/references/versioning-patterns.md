# Versioning Patterns — MCV3 Evolution

Các patterns quản lý version cho documents và code trong MCV3. Dùng bởi `/mcv3:evolve`.

---

## 1. Document Versioning Strategy

### Strategy A: In-file Versioning (Minor changes)

Dùng cho: Thêm sections, không thay đổi cấu trúc chính

```markdown
# MODSPEC-WH: Warehouse Module

> **Current version:** v1.2 | Last evolved: 2025-03-15

## 1. Business Rules
[... original content ...]

## 2. API Endpoints
[... original content ...]

## ── v1.1 ADDITIONS (2025-02-01) ─────────────────────
### API-ERP-015: POST /api/wh/barcode-scan
[... new content ...]
## ── END v1.1 ─────────────────────────────────────

## ── v1.2 ADDITIONS (2025-03-15) ─────────────────────
### API-ERP-016: GET /api/wh/receipts/export
[... new content ...]
## ── END v1.2 ─────────────────────────────────────
```

**Pros:** Xem toàn bộ lịch sử trong 1 file
**Cons:** File phình to → dùng `mc_load(layer: 2)` để skip details

### Strategy B: New File Versioning (Major changes)

Dùng cho: Thay đổi lớn, break compatibility

```
P2-DESIGN/
├── MODSPEC-WH.md           ← v1.x (legacy, still in use)
├── MODSPEC-WH-v2.md        ← v2.0 (new major version)
└── MODSPEC-WH-MIGRATION.md ← Hướng dẫn migrate từ v1 → v2
```

`MODSPEC-WH.md` giữ nguyên để reference, thêm header:
```markdown
> ⚠️ **DEPRECATED:** Hệ thống mới dùng MODSPEC-WH-v2.md
> Migration guide: MODSPEC-WH-MIGRATION.md
```

### Strategy C: Branch Snapshot (Feature Branch)

Dùng khi team song song phát triển nhiều features:

```
mc_snapshot({ label: "feature-branch-barcode" })
→ Làm MODSPEC-WH với barcode feature

mc_snapshot({ label: "feature-branch-analytics" })
→ Làm MODSPEC-WH với analytics feature

→ mc_merge hai versions về main
```

---

## 2. Semantic Versioning cho Documents

Áp dụng SemVer (MAJOR.MINOR.PATCH) cho documents:

### MAJOR version (x.0.0) — Breaking changes

Tăng MAJOR khi:
- Thay đổi tên/structure API endpoint (breaking)
- Thay đổi schema (xóa/rename column)
- Thay đổi business rules core
- Thêm required fields

```markdown
> **Version:** 2.0.0 | Breaking: Yes
> **Changelog:** v2.0.0 — Redesigned inventory schema (TBL-ERP-001-v2)
> **Migration required:** Yes — see MODSPEC-INV-MIGRATION.md
```

### MINOR version (0.x.0) — Non-breaking additions

Tăng MINOR khi:
- Thêm optional API endpoint
- Thêm nullable field vào table
- Thêm User Story/Feature
- Thêm analytics/reporting

```markdown
> **Version:** 1.3.0 | Breaking: No
> **Changelog:** v1.3.0 — Added batch import API (API-ERP-015..018)
```

### PATCH version (0.0.x) — Bug fixes & clarifications

Tăng PATCH khi:
- Sửa typo, clarify wording
- Thêm ví dụ
- Fix validation error message

```markdown
> **Version:** 1.2.1 | Breaking: No
> **Changelog:** v1.2.1 — Clarified AC-WH-003-02 edge case
```

---

## 3. Version Compatibility Matrix

Dùng để track compatibility giữa documents:

```markdown
# VERSION-COMPATIBILITY-MATRIX.md

| Document | Version | Compatible with | Status |
|----------|---------|----------------|--------|
| MODSPEC-WH.md | v1.2 | URS-WH v1.x | Active |
| MODSPEC-WH-v2.md | v2.0 | URS-WH v2.0 | Active |
| TEST-WH.md | v1.1 | MODSPEC-WH v1.x | Needs update for v2 |
| src/erp/wh/ | — | MODSPEC-WH v1.2 | Needs migration to v2 |
```

---

## 4. EVOLUTION-LOG Format

```markdown
# EVOLUTION-LOG.md — {Project Name}

## EVOL-003: v1.2 → v1.3 (2025-03-15)

**Module:** WH (Warehouse)
**Evolution type:** Minor
**Trigger:** Sprint 5 planning — batch import requirement

### New Features
- Batch import từ Excel/CSV
- Export inventory report theo date range
- Low-stock alerts

### New IDs Added
- US-WH-016, US-WH-017, US-WH-018
- FT-WH-018, FT-WH-019
- API-ERP-015, API-ERP-016, API-ERP-017
- TBL-ERP-008 (import_jobs)

### Deprecated IDs
- API-ERP-005: Thay bằng API-ERP-015 (batch version)

### Breaking Changes
- None

### Migration Scripts Needed
- V004__create_import_jobs.sql

### Code Gen Done
- Yes — controllers, services, repositories generated

---

## EVOL-002: v1.1 → v1.2 (2025-02-20)
[...]
```

---

## 5. Code Versioning Alignment

Document versions phải align với code versions:

### Tagging Strategy

```bash
# Document versions trong EVOLUTION-LOG
EVOL-001: WH module v1.0 → v1.1
EVOL-002: WH module v1.1 → v1.2

# Align với git tags:
git tag -a "docs/wh-v1.1" -m "EVOL-001: WH module v1.1"
git tag -a "docs/wh-v1.2" -m "EVOL-002: WH module v1.2"
```

### Migration Script Naming

```
db/migrations/
├── V001__create_receipts.sql          ← v1.0 initial
├── V002__create_items.sql             ← v1.0 initial
├── V003__add_receipt_notes.sql        ← v1.1 evolution
└── V004__create_import_jobs.sql       ← v1.2 evolution
```

Luôn tăng V-number, không tái sử dụng.

---

## 6. Backward Compatibility Rules

### Rule 1: Never Delete Active IDs

Khi xóa/thay thế ID, mark as deprecated thay vì xóa:

```markdown
### ~~API-ERP-005: GET /api/wh/receipts (deprecated)~~
> ⚠️ **DEPRECATED** by API-ERP-015 (v1.3.0)
> **Reason:** Không support batch — thay bằng API-ERP-015
> **Migration:** Đổi client code dùng API-ERP-015
> **Sunset date:** 2025-06-01
```

### Rule 2: Database Changes Must Be Additive

```sql
-- ✅ OK — thêm nullable column
ALTER TABLE receipts ADD COLUMN notes TEXT NULL;

-- ✅ OK — thêm index
CREATE INDEX idx_receipts_status ON receipts(status);

-- ❌ KHÔNG OK — thay đổi existing column
ALTER TABLE receipts MODIFY COLUMN status VARCHAR(50);  -- breaking!

-- ❌ KHÔNG OK — xóa column
ALTER TABLE receipts DROP COLUMN old_field;  -- breaking!
```

### Rule 3: API Changes Must Be Versioned

```
Breaking API change → tạo new endpoint, deprecate old:

v1: POST /api/wh/receipts
  { items: [{sku, qty}] }  ← Old format

v2: POST /api/wh/receipts  ← SAME path but versioned via header
  Header: X-API-Version: 2
  { items: [{skuId, quantity, unitCost}] }  ← New format

Hoặc URL versioning:
v2: POST /api/v2/wh/receipts
```

---

## 7. Evolution Decision Matrix

| Loại thay đổi | SemVer | Strategy | Snapshot? |
|---------------|--------|----------|-----------|
| Thêm optional API field | PATCH | In-file | Optional |
| Thêm optional API endpoint | MINOR | In-file | Recommended |
| Thêm required API field | MAJOR | New file | Required |
| Thêm database column (nullable) | MINOR | In-file | Recommended |
| Thêm database table | MINOR | In-file | Recommended |
| Rename database column | MAJOR | New file | Required |
| Thêm User Story | MINOR | In-file | Optional |
| Thêm System/Module | MAJOR | New files | Required |
| Redesign architecture | MAJOR | New files | Required |

---

## 8. Version Freeze Process

Khi release một version:

```
1. mc_snapshot({ label: "release-v{X.Y.Z}" })
2. Cập nhật version header trong tất cả documents
3. mc_changelog({ action: "add", changeType: "milestone", entry: "Release v{X.Y.Z}" })
4. Tag trong git: git tag -a "v{X.Y.Z}" -m "Release {description}"
5. Tạo RELEASE-NOTES-v{X.Y.Z}.md từ changelog
```

Version freeze: không thay đổi documents của frozen version, chỉ evolve trên next version.
