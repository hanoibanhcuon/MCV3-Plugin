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

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0 init | mc_status → mc_load(OVERVIEW) → mc_load(INDEX) → mc_list (4 sequential) | 4 calls song song trong 1 round | ~3 round-trips |
| Phase 2c + Phase 3 | mc_dependency → mc_snapshot (sequential) | mc_dependency ∥ mc_snapshot song song | ~1 round-trip |
| Phase 4c-d per-module | mc_save → mc_checkpoint (sequential) | mc_save → [mc_validate ∥ mc_checkpoint] | ~1 round-trip / module |
| Phase 8 post-gate | mc_changelog → mc_checkpoint (sequential) | mc_changelog ∥ mc_checkpoint song song | ~1 round-trip |

### Quy tắc áp dụng

```
✅ Phase 0: Tất cả 4 init calls độc lập nhau → 1 round duy nhất
✅ Phase 2c+3: mc_dependency check và mc_snapshot đều chỉ cần project slug → parallel an toàn
✅ Post-save: mc_validate và mc_checkpoint sau mc_save → chạy song song
✅ Phase 8: mc_changelog và mc_checkpoint độc lập → chạy song song
✅ No re-validation: Pre-Completion Tầng 3 chỉ confirm PASS đã done, không re-run mc_validate
```

---

## CHẾ ĐỘ VẬN HÀNH — Type C (Hybrid)

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`) — **Type C: Hybrid**:
1. **Nhận input ban đầu** — cần mô tả features/modules/systems muốn thêm từ user; nếu đã có trong message → bắt đầu ngay
2. **Tự động sau khi có input** — tự parse scope, tự xác định versioning strategy; không hỏi thêm về tech stack hoặc approach
3. **Tự giải quyết vấn đề** — tự quyết định Minor/Major, backward-compat approach, ghi DECISION
4. **Báo cáo sau khi xong** — EVOL-xxx record + updated documents + sprint plan
5. **User review** — user review plan, điều chỉnh nếu cần
6. **Gợi ý bước tiếp** — `/mcv3:qa-docs` → `/mcv3:code-gen`

**Input bắt buộc từ user:** Mô tả features/modules/systems muốn thêm
**Exception duy nhất:** mc_compare/mc_merge conflict → hỏi user chọn version (không thể auto-resolve)

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**Dự án chưa đạt Phase 5 (chưa có MODSPEC):**
- Báo user: "⚠️ Evolve yêu cầu dự án đã có ít nhất MODSPEC (Phase 5+). Chạy /mcv3:tech-design trước."
- Nếu dự án mới chỉ có URS → gợi ý `/mcv3:tech-design` để tạo MODSPEC

**mc_snapshot thất bại (trước khi evolve):**
- Không tiếp tục — báo user: "❌ Không thể tạo safety snapshot. Kiểm tra MCP server và thử lại."
- Lý do: SNAPSHOT-FIRST là quy tắc bắt buộc, evolve mà không có snapshot rất nguy hiểm

**mc_compare / mc_merge conflict:**
- Hiển thị diff rõ ràng cho user
- Hỏi user: "Giữ version nào? [cũ / mới / merge thủ công]"
- KHÔNG tự quyết định khi có conflict cấu trúc

**Version conflict (document đã ở v{N+1} nhưng config vẫn v{N}):**
- Dùng mc_compare để xem diff trước khi ghi đè
- Cập nhật _config.json sau khi confirm với user

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
1. PARALLEL (4 calls đồng thời — tất cả độc lập nhau):
   - mc_status()                                               → project slug + phase hiện tại
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 2 }) → bối cảnh
   - mc_load({ filePath: "MASTER-INDEX.md", layer: 2 })        → systems/modules hiện có
   - mc_list({ documentType: "modspec" })                      → liệt kê MODSPEC hiện có
   [Kết quả mc_list tái dùng để detect scope — KHÔNG gọi lại]

2. Auto-detect evolution scope từ user message:
   - "thêm feature/tính năng vào {module}" → Scope 1
   - "thêm module {name}" → Scope 2
   - "thêm system {name}" → Scope 3
   - "nâng cấp MVP / mở rộng" → Scope 4
   - Không rõ → ghi DECISION + chọn Scope phù hợp nhất từ context
   → Tự chuyển sang Phase 1 ngay
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-evolve-{scope}",
  sessionSummary: "Chuẩn bị chạy /mcv3:evolve — mở rộng dự án",
  nextActions: ["Tiếp tục /mcv3:evolve — Phase 1: Evolution Scope Definition"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu evolution planning..."

> **Lưu ý:** Checkpoint này phục vụ **session resume**. Safety snapshot (Phase 3) phục vụ **rollback data** — SNAPSHOT-FIRST vẫn bắt buộc, không bỏ qua ngay cả khi đã có checkpoint.

---

## Phase 1 — Evolution Scope Definition

### 1a. Feature Addition (Scope 1)

Detect từ message của user — không hỏi lại:

```
Auto-detect features muốn thêm từ message:
  - "thêm barcode scanning, batch export cho WH" → parse từng feature
  - Nếu không rõ module → tự chọn module phù hợp nhất từ mc_list(), ghi DECISION

Thực hiện:
1. mc_load({ filePath: "MODSPEC-{MOD}.md", layer: 2 }) → đọc current state
2. Identify điểm tích hợp cho từng feature
3. Đề xuất cách extend (không break current)
→ Chuyển sang Phase 2 ngay, không hỏi confirm
```

### 1b. New Module Addition (Scope 2)

```
Auto-detect từ message:
  - Tên module: extract từ message (VD: "thêm module HR - quản lý nhân sự")
  - Hệ thống chứa: detect từ context hoặc default system, ghi DECISION
  - Dependencies: mc_dependency({ action: "list" }) → xác định tự động
  - Integrations: đọc MASTER-INDEX, phân tích từ architecture hiện có

→ Tạo luồng URS → MODSPEC mới cho module này, không hỏi lại
```

### 1c. New System Addition (Scope 3)

```
Auto-detect từ message:
  - Tên/code system: extract từ message (VD: "MOB - Mobile App")
  - Tech stack: detect từ message hoặc PROJECT-OVERVIEW, ghi DECISION nếu infer
  - Integrations: xem MASTER-INDEX → biết APIs cần consume từ system nào
  - Target users: infer từ context (mobile → end-user / warehouse staff)

→ Extend architecture với system mới, không hỏi lại
```

### 1d. MVP → Full Product (Scope 4)

```
Review toàn bộ scope hiện tại:
  mc_list({ documentType: "all" }) → inventory đầy đủ
  mc_load({ filePath: "MASTER-INDEX.md", layer: 2 }) → gaps hiện tại
→ Đề xuất evolution roadmap: Must-have còn thiếu → Nice-to-have → Future backlog
→ Chuyển sang Phase 2 ngay
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

### 2c. Dependency Check + Snapshot — PARALLEL

Chạy đồng thời dependency check và safety snapshot (cả hai chỉ cần project slug, độc lập nhau):

```
PARALLEL (2 calls đồng thời):
  // Tìm ai đang depend vào module này
  mc_dependency({
    action: "dependents",
    projectSlug: "<slug>",
    source: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md"
  })
  // Safety snapshot trước khi evolve
  mc_snapshot({
    projectSlug: "<slug>",
    label: "before-evolve-{MOD}-v{N+1}",
    notes: "Snapshot before evolution: {description}"
  })
→ Chờ CẢ HAI hoàn thành
→ Nếu snapshot fail → DỪNG (không evolve khi không có safety net)
→ Phân tích dependency result → nếu có dependents bị ảnh hưởng → hiển thị warning
```

Nếu có dependents:
```
"🔍 Dependency Check — {MODULE}

Các systems/modules sau đang phụ thuộc vào {MODULE}:

| Dependent | Loại phụ thuộc | Ảnh hưởng khi evolve |
|-----------|---------------|---------------------|
| {SYS2}/{MOD2} | API consumer | Cần verify API backward compat |
| {SYS3}/MODSPEC | DB shared table | Migration phải backward compat |

⚠️ Evolution scope 'Major' hoặc có breaking changes → cần coordinate với teams trên."
```

### 2d. Tóm tắt evolution plan

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

Downstream impact: {N} systems cần notify (nếu có breaking)

Effort estimate: {S/M/L}

→ Tự động chuyển sang Phase 3 (Snapshot) rồi Phase 4 (Document Evolution)"
```

### 2e. Breaking Change Protocol

Khi evolution tạo ra breaking changes (thay đổi API contract, xóa field, đổi auth scheme):

```
🚨 BREAKING CHANGE trong Evolution v{N+1}

Breaking items phát hiện:
  - API-{SYS}-{NNN}: Response shape thay đổi (field X bị xóa)
  - TBL-{SYS}-{NNN}: Column Y NOT NULL thêm vào (migration cần backfill)

Downstream systems bị ảnh hưởng:
  - {SYS2}: consumer của API-{SYS}-{NNN}
  - {SYS3}: shared table TBL-{SYS}-{NNN}

Tự động áp dụng chiến lược an toàn nhất:
  → Versioned API: Giữ v1, thêm v2 endpoint mới (default — safest)
  → Ghi DECISION: "Breaking change → Versioned API strategy. Sunset date: {date+90d}"
  → Nếu user đã chỉ định strategy trong message → dùng theo đó
```

Với tùy chọn 1 hoặc 2, thêm vào MODSPEC:
```markdown
### API-{SYS}-{NNN}-v2: {Endpoint} (Breaking Evolution)
> ⚠️ v1 deprecated as of {date}. Sunset: {date+90d}
> v1 endpoint giữ nguyên cho đến sunset date.
```

---

## Phase 3 — Snapshot Before Evolution

> ✅ **Đã được gộp vào Phase 2c PARALLEL** — mc_snapshot chạy song song với mc_dependency, tiết kiệm 1 round-trip. Nếu Phase 2c snapshot đã thành công → tiếp tục Phase 4. Nếu fail → DỪNG.

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

### 4c-d. Save + Validate + Checkpoint — PARALLEL

```
mc_save({
  filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md",   // hoặc MODSPEC-{MOD}-v{N+1}.md cho major
  documentType: "modspec"
})
mc_save({
  filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md",  // nếu URS cũng được update
  documentType: "urs"
})

// RISK-002 + RISK-003: Sau khi save → PARALLEL [mc_validate ∥ mc_checkpoint]
PARALLEL (2 calls đồng thời — lặp lại per module):
  mc_validate({ projectSlug: "<slug>", filePath: "<path-of-saved-doc>" })
  mc_checkpoint({
    projectSlug: "<slug>",
    label: "evolve-module-{MOD}-done",
    sessionSummary: "EVOL-{ID}: Đã evolve module {MOD} (v{N} → v{N+1}). URS + MODSPEC updated.",
    nextActions: ["Tiếp tục /mcv3:evolve — evolve module tiếp theo: {next-module} hoặc sang Phase 5"]
  })
→ Nếu mc_validate FAIL → tự fix format trước khi sang module tiếp theo
```

> **Lưu ý:** Checkpoint per-module quan trọng khi evolve nhiều modules cùng lúc. Cho phép resume đúng module tiếp theo nếu session bị gián đoạn.

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

// RISK-005: Verify traceability chain intact — new IDs đã registered và linked
mc_traceability({
  action: "validate",
  projectSlug: "<slug>",
  scope: "new-ids"   // Chỉ validate IDs mới trong evolution này
})
→ Nếu new IDs chưa link về requirements origin → tự fix links trước khi sang Phase 6
→ Existing IDs không bị break — nếu phát hiện → ghi WARNING trong completion report
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

SAU KHI EVOLUTION DOCUMENTS ĐÃ TẠO/UPDATE:
╔══════════════════════════════════════════════════════════╗
║  [BẮT BUỘC] Chạy Pre-Completion Verification            ║
║  Xem section "Pre-Completion Verification" bên dưới      ║
║  TRƯỚC KHI viết Completion Report                         ║
║                                                            ║
║  Tầng 1 PASS + Tầng 2 PASS + Tầng 3 PASS                ║
║  → mới được viết Completion Report                        ║
║  Nếu FAIL → tự fix → re-verify (max 2 lần)               ║
╚══════════════════════════════════════════════════════════╝

---

## Phase 8 — Post-Gate

```
// PARALLEL (2 calls đồng thời — changelog và checkpoint độc lập nhau):
PARALLEL:
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

**Pre-Completion Verification (BẮT BUỘC — RISK-004):**

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

```
Tầng 1 — Self-Verification:
  ✓ IDs mới không conflict với existing IDs (check namespace — dùng mc_traceability)
  ✓ Version increment đúng semantic versioning (MAJOR.MINOR.PATCH)
  ✓ "v{N+1} ADDITIONS" sections được mark rõ ràng trong updated docs
  ✓ Không có placeholder trong features mới
  ✓ EVOL-ID format: EVOL-NNN, scope classify đúng (Sub-feature/Module/System/MVP→Full)

Tầng 2 — Cross-Document:
  ✓ Features mới không vi phạm existing business rules (BR check)
  ✓ New APIs không conflict với existing API paths
  ✓ New TBL columns không conflict với existing schema
  ✓ Backward compatibility: existing IDs không bị remove hoặc break
  ✓ Dependencies của features mới đã được identify và document

Tầng 3 — Quality Gate [🚫 BLOCKING GATE]:

> **BẮT BUỘC:** Toàn bộ checklist phải PASS trước khi viết Completion Report.
> Nếu FAIL → tự fix → re-verify (max 2 lần). KHÔNG viết Completion Report khi còn lỗi.

  ✅ Snapshot trước evolution đã tạo (trước khi evolve)
  ✅ Không có ID conflicts
  ✅ Existing traceability links không bị broken bởi evolution
  ✅ EVOLUTION-LOG.md đã cập nhật với EVOL-{ID}
  ✅ [MANDATORY] mc_validate PASS cho tất cả updated/new documents
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

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:evolve — EVOL-{ID}
═══════════════════════════════════════════════

✅ Đã cập nhật documents (v{N} → v{N+1}):
   URS-{MOD}.md    — +{X} User Stories mới
   MODSPEC-{MOD}.md — +{M} APIs mới, +{K} tables
   EVOLUTION-LOG.md — ghi nhận EVOL-{ID}

📊 Scope: {Minor/Major}
   Features mới: {N} | APIs mới: {M}
   Backward compat: ✅ / ⚠️ breaking: {list}

🔜 Bước tiếp theo:
   → /mcv3:qa-docs — Tạo test cases cho features mới
   → /mcv3:code-gen — Generate code cho features mới

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết documents đã update?
   [2] Điều chỉnh features/scope?
   [3] OK, tiếp tục → /mcv3:qa-docs
═══════════════════════════════════════════════
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

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification (Tầng 1-3):** Section này là checklist nhanh GIỮA các phases. Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ, trước Completion Report.

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển phase:

### Sau Phase 0 → trước Phase 1:
- ✓ **BLOCKING:** Dự án phải có ít nhất 1 MODSPEC (Phase 5+) — nếu chưa có MODSPEC → **DỪNG ngay**, báo user: `"❌ /mcv3:evolve yêu cầu dự án đã có MODSPEC (Phase 5+). Chạy /mcv3:tech-design trước để tạo MODSPEC."` Không tiếp tục evolve khi chưa có baseline design.
- ✓ `mc_status` trả về project hợp lệ (không phantom project)
- ✓ MASTER-INDEX đã đọc: danh sách systems/modules hiện có đã rõ ràng

### Sau Phase 1 → trước Phase 2:
- ✓ Evolution scope đã classify rõ (Scope 1/2/3/4) — ghi DECISION nếu tự infer
- ✓ Features muốn thêm đã list cụ thể (không vague như "improve performance")
- ✓ Target module/system đã identify — không còn ambiguous

### Sau Phase 2 → trước Phase 3:
- ✓ **BLOCKING:** ID conflicts phải được clear hoàn toàn qua `mc_traceability` — nếu phát hiện ID mới trùng với ID cũ → **DỪNG ngay**, báo user: `"❌ ID conflict phát hiện: {conflicting-IDs}. Đặt lại ID mới trước khi tiếp tục — không thể evolve khi có ID conflict."` Không tạo snapshot hay update docs khi còn conflict.
- ✓ Backward compatibility đã đánh giá: biết rõ breaking items (hoặc xác nhận không có)
- ✓ Downstream dependents đã check qua `mc_dependency`
- ✓ Dự án lớn (5+ systems): cross-system impact từ evolution đã identify cho TẤT CẢ dependent systems

### Sau Phase 3 → trước Phase 4:
- ✓ `mc_snapshot` đã trả về success
- ✓ Snapshot label chứa EVOL-ID
- ✓ Nếu snapshot fail → DỪNG (theo Error Recovery protocol — không tiếp tục khi không có safety net)

### Sau Phase 4 → trước Phase 5:
- ✓ New docs có "v{N+1} ADDITIONS" section được mark rõ ràng
- ✓ Không có placeholder `{...}` còn sót trong features mới
- ✓ New API paths không conflict với existing paths
- ✓ New TBL columns đều nullable (hoặc có migration backfill documented)
- ✓ Dự án lớn: mỗi system có evolution document riêng — không gộp chung

### Sau Phase 5 → trước Phase 6:
- ✓ New IDs đã register trong traceability
- ✓ Existing IDs không bị modify hay remove (backward compat)
- ✓ Links từ new IDs về requirements origin đã tạo
