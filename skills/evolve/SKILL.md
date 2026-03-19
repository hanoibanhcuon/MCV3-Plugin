# Evolve Skill — `/mcv3:evolve`

## Mục đích

Hỗ trợ **phát triển và mở rộng** dự án đã hoàn thành Phase 8. Khi cần thêm features mới vào hệ thống đã có:
1. **Version management** cho documents
2. Tích hợp features mới với **architecture hiện tại**
3. Đảm bảo **backward compatibility** và không phá vỡ traceability cũ
4. Tạo **evolution plan** theo sprint

---

## DEPENDENCY MAP

```
Requires:
  - Dự án đã hoàn thành ít nhất Phase 5 (có MODSPEC)
  - mc_status, mc_load, mc_list (để đọc current state)
Produces:
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}-v{N+1}.md (new version)
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}-v{N+1}.md (nếu cần)
  - _PROJECT/EVOLUTION-LOG.md (lịch sử evolution)
  - _mcv3-work/evolution/EVOL-{ID}.md (evolution plan)
Enables: /mcv3:code-gen (cho features mới)
Agents: doc-writer, tech-expert
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_snapshot, mc_compare, mc_changelog, mc_traceability
  - mc_merge, mc_dependency
References:
  - skills/evolve/references/versioning-patterns.md
  - skills/evolve/references/feature-extension-guide.md
```

---

## Khi nào dùng skill này

- Dự án đang chạy production, cần thêm tính năng mới
- Sprint mới sau khi đã launch v1.0
- Mở rộng module hiện tại (thêm sub-features)
- Thêm system/module hoàn toàn mới vào architecture hiện tại
- Upgrade từ MVP → Full product

---

## Phase 0 — Pre-Gate & Context Loading

```
1. mc_status() → xác nhận project và phase hiện tại
2. mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 }) → bối cảnh
3. mc_load({ filePath: "MASTER-INDEX.md", layer: 2 }) → danh sách systems/modules hiện có
4. mc_list({ documentType: "modspec" }) → liệt kê MODSPEC hiện có

5. Hỏi user:
   "🚀 Evolution Mode — {project}

   Dự án hiện có:
   - Systems: {list}
   - Modules: {list}
   - Phase hiện tại: {phase}

   Bạn muốn:
   [1] Thêm features mới vào module đã có (VD: thêm tính năng cho WH module)
   [2] Thêm module mới vào system đã có (VD: thêm module HR vào ERP)
   [3] Thêm system hoàn toàn mới (VD: thêm Mobile App)
   [4] Nâng cấp MVP → Full product (mở rộng toàn diện)"
```

---

## Phase 1 — Evolution Scope Definition

### 1a. Feature Addition (Scope 1)

User muốn thêm features vào module WH chẳng hạn:

```
"Features mới bạn muốn thêm vào {MODULE}:

Mô tả: (VD: 'Thêm barcode scanning cho nhập kho, thêm batch export')

Tôi sẽ:
1. Đọc MODSPEC-{MOD} hiện tại
2. Identify điểm tích hợp
3. Đề xuất cách extend (không break current)'
```

### 1b. New Module Addition (Scope 2)

```
"Module mới:
  - Tên module: (VD: 'HR - Quản lý nhân sự')
  - Hệ thống chứa: {list systems}
  - Phụ thuộc vào module nào?
  - Tích hợp với module nào?

Tôi sẽ tạo luồng URS → MODSPEC mới cho module này."
```

### 1c. New System Addition (Scope 3)

```
"System mới:
  - Tên: (VD: 'MOB - Mobile App cho thủ kho')
  - Tech stack: React Native / Flutter / other
  - Tích hợp với system nào? (APIs từ ERP?)
  - Target users?

Tôi sẽ extend architecture hiện tại với system mới."
```

### 1d. MVP → Full Product (Scope 4)

```
"Tôi sẽ review toàn bộ scope hiện tại và đề xuất evolution roadmap.
Ưu tiên: Must-have features còn thiếu, Nice-to-have, Future backlog."
```

---

## Phase 2 — Version Analysis

### 2a. Check current versions

```
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 1 })
→ Đọc DEPENDENCY MAP để biết version hiện tại

mc_compare({
  fileA: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md",
  fileB: "@snapshot:latest"
})
→ Xem thay đổi nào đã có từ version trước
```

### 2b. Determine evolution type

| Loại evolution | Ví dụ | Versioning |
|----------------|-------|------------|
| Patch (0.0.x) | Fix bug, typo, minor clarification | Overwrite file cũ |
| Minor (0.x.0) | Thêm optional feature, không break existing | New section trong file |
| Major (x.0.0) | Thêm required feature, thay đổi contract | New file v{N+1} |

### 2c. Hiển thị evolution plan

```
"📋 EVOLUTION PLAN — {MODULE} v{N} → v{N+1}

Current state:
  - MODSPEC-{MOD}.md v{N} (created: {date})
  - {X} API endpoints, {Y} tables, {Z} features

New features:
  - {List new features từ user input}

Evolution type: Minor | Major
Versioning strategy: {append | new-file}

Backward compatibility:
  ✅ Existing APIs: Không thay đổi
  ✅ Existing tables: Chỉ thêm columns (nullable)
  ⚠️ Breaking: {list nếu có}

Effort estimate: {S/M/L}

Bắt đầu evolution?"
```

---

## Phase 3 — Snapshot Before Evolution

```
mc_snapshot({
  projectSlug: "<slug>",
  label: "before-evolve-{MOD}-v{N+1}",
  notes: "Snapshot before evolution: {description}"
})
```

---

## Phase 4 — Document Evolution

### 4a. URS Evolution (nếu cần)

Với features mới, tạo/extend URS:

```
"📝 Thêm vào URS-{MOD}.md:

## New User Stories (v{N+1})

### US-{MOD}-{NEW}: {Tiêu đề}
**Role:** Là {actor}
**Want:** Tôi muốn {new feature}
**So that:** Để {benefit}
**Version added:** v{N+1}
**Dependencies:** US-{MOD}-{existing} (extends)

#### Acceptance Criteria
- AC-{MOD}-{NEW}-01: Given... When... Then...

#### Traceability
- Origin: {evolution request CHG-ID hoặc business need}
- Extends: US-{MOD}-{existing} (if applicable)
```

### 4b. MODSPEC Evolution

```markdown
## ── v{N+1} ADDITIONS ──────────────────────────────
> Added: {date} | Evolution: EVOL-{ID}

### API-{SYS}-{NEW}: {New Endpoint}
**Method:** POST/GET/PUT/DELETE
**Path:** /api/{sys}/{mod}/{endpoint}
**Version added:** v{N+1}
**Backward compatible:** Yes

### TBL-{SYS}-{NEW} Migration: ALTER TABLE {existing}
**Changes:**
  ADD COLUMN {field} {type} NULL DEFAULT NULL;  -- nullable for backward compat
  -- Version: v{N+1}

### ADR-{MOD}-{NEW}: {Architecture Decision for this evolution}
**Context:** {Tại sao cần thay đổi}
**Decision:** {Quyết định}
**Consequences:** {Hậu quả + trade-offs}
## ── END v{N+1} ADDITIONS ────────────────────────
```

### 4c. Save updates

```
mc_save({
  filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md",
  documentType: "modspec"
})

// Hoặc nếu major change, tạo file mới:
mc_save({
  filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}-v{N+1}.md",
  documentType: "modspec"
})
```

---

## Phase 5 — Traceability Update

```
// Đăng ký IDs mới
mc_traceability({
  action: "register",
  source: "MODSPEC-{MOD}.md",
  ids: ["US-{MOD}-NEW", "FT-{MOD}-NEW", "API-{SYS}-NEW"]
})

// Link IDs mới với IDs cũ (extends/depends)
mc_traceability({
  action: "link",
  items: [
    { from: "US-{MOD}-NEW", to: "US-{MOD}-EXISTING" },
    { from: "FT-{MOD}-NEW", to: "BR-{DOM}-EXISTING" }
  ]
})
```

---

## Phase 6 — EVOLUTION-LOG

Ghi lại evolution history:

```
mc_merge({
  targetFile: "_PROJECT/EVOLUTION-LOG.md",
  content: `
## EVOL-{ID}: v{N} → v{N+1}
**Ngày:** {date}
**Module:** {MOD}
**Type:** Minor | Major
**New features:** {list}
**New IDs:** {list}
**Breaking changes:** {list hoặc None}
**Code gen needed:** Yes/No
**Migration scripts:** {list hoặc None}
  `,
  mode: "append",
  createIfNotExists: true
})
```

---

## Phase 7 — Evolution Sprint Planning

Với major evolution, tạo sprint plan:

```
"📅 EVOLUTION SPRINT PLAN — {MODULE} v{N+1}

Week 1:
  □ Update URS-{MOD}.md với {N} new User Stories
  □ Update MODSPEC-{MOD}.md với {M} new APIs
  □ Database migration script

Week 2:
  □ /mcv3:qa-docs cho features mới (test cases)
  □ /mcv3:code-gen cho endpoints mới

Week 3:
  □ Developer implement features
  □ Integration testing

Week 4:
  □ /mcv3:verify (re-run với features mới)
  □ Deploy to staging

Gợi ý: Giữ scope nhỏ — tốt hơn 3-4 small evolutions hơn 1 big bang"
```

---

## Phase 8 — Post-Gate

```
mc_changelog({
  action: "add",
  entry: "EVOL-{ID}: {Module} v{N+1} — {description}",
  changeType: "added",
  phase: "evolution"
})

mc_checkpoint({
  label: "evolution-{MOD}-v{N+1}",
  sessionSummary: "Evolution: {N} new features added to {MOD}",
  nextActions: [
    "Chạy /mcv3:qa-docs cho features mới",
    "Chạy /mcv3:code-gen",
    "Update database migration scripts"
  ]
})
```

**Post-Gate checklist:**
```
✅ Snapshot trước evolution đã tạo
✅ URS updated với User Stories mới
✅ MODSPEC updated với APIs/Tables mới
✅ Backward compatibility đã verify
✅ Traceability matrix updated
✅ EVOLUTION-LOG ghi nhận
✅ Sprint plan tạo (nếu major)

→ "✅ Evolution v{N+1} kế hoạch xong!
   {N} features mới, {M} APIs mới.
   Tiếp theo: /mcv3:qa-docs → /mcv3:code-gen"
```

---

## Quy tắc Evolution

```
BACKWARD-COMPAT: Features mới không break features cũ
VERSION-CLEARLY: Đánh dấu rõ ràng "v{N+1} ADDITIONS" trong documents
SNAPSHOT-FIRST: Luôn snapshot trước khi evolve
SMALL-BATCHES: Nhiều small evolutions tốt hơn 1 big bang
TRACE-FORWARD: IDs mới phải link về requirements origin
ADR-ALWAYS: Mỗi architectural decision phải có ADR entry
```
