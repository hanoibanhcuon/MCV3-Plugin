# Change Manager Skill — `/mcv3:change-manager`

## Mục đích

Quản lý thay đổi trong dự án **sau khi đã có tài liệu**. Khi requirements thay đổi, skill này:
1. Phân tích **impact**: thay đổi 1 element → ảnh hưởng đến tài liệu nào
2. **Cập nhật tự động** các documents bị ảnh hưởng
3. Ghi **changelog** có cấu trúc
4. Duy trì **traceability** nhất quán

---

## DEPENDENCY MAP

```
Requires:
  - .mc-data/projects/{slug}/ (project đã khởi tạo, có ít nhất 1 document)
  - mc_impact_analysis, mc_traceability, mc_changelog (MCP tools)
Produces:
  - Cập nhật documents bị ảnh hưởng
  - _changelog.md (structured changelog entries)
  - _mcv3-work/change-log/CHANGE-{ID}.md (chi tiết từng thay đổi)
Enables: /mcv3:verify (re-verify sau khi thay đổi)
Agents: doc-writer, verifier
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_impact_analysis, mc_traceability, mc_changelog
  - mc_snapshot, mc_compare, mc_merge
References:
  - skills/change-manager/references/change-management-patterns.md
  - skills/change-manager/references/impact-assessment-guide.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Type C (Hybrid)

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`) — **Type C: Hybrid**:
1. **Nhận input ban đầu** — cần mô tả thay đổi (element ID + nội dung thay đổi) từ user; nếu đã có trong message → bắt đầu ngay
2. **Tự động sau khi có input** — tự parse change, tự phân tích impact, tự apply updates; không hỏi confirm từng document
3. **Tự giải quyết vấn đề** — tự quyết định thứ tự update documents, ghi DECISION khi ambiguous
4. **Báo cáo sau khi xong** — CHG-xxx record + danh sách documents đã update (với diff) + code notice
5. **User review** — user review diffs trong Completion Report; nếu muốn rollback → dùng mc_rollback
6. **Gợi ý bước tiếp** — `/mcv3:verify` để re-verify sau thay đổi

**Input bắt buộc từ user:** Mô tả thay đổi (element ID + nội dung thay đổi)
**Exception duy nhất:** Breaking change ảnh hưởng downstream systems → hỏi confirm trước khi apply (rủi ro cao)

---

## Khi nào dùng skill này

- Khi requirements thay đổi sau khi đã có URS/MODSPEC/TEST
- Khi business rules cần điều chỉnh giữa dự án
- Khi cần audit xem một thay đổi ảnh hưởng đến gì
- Khi cần merge feedback từ stakeholder vào tài liệu đã có

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project tồn tại
2. mc_list({ projectSlug }) → liệt kê documents hiện có
3. Parse change description từ user message:
   - Element ID + mô tả thay đổi đã có trong message
   - Nếu user chưa cung cấp ID cụ thể → hỏi: "Element nào cần thay đổi? (VD: BR-WH-001)"
   - Sau khi có đủ thông tin → tự động chuyển Phase 1
```

---

## Phase 0 — Pre-Skill Safety Checkpoint

Trước khi bắt đầu, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-change-manager",
  sessionSummary: "Chuẩn bị chạy /mcv3:change-manager — quản lý requirements change",
  nextActions: ["Tiếp tục /mcv3:change-manager — Phase 1: Change Intake"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu change intake..."

> **Lưu ý:** Checkpoint này phục vụ **session resume**. Safety snapshot (Phase 3) phục vụ **rollback data** — cả hai cần thiết, SNAPSHOT-FIRST vẫn bắt buộc trước khi sửa documents.

---

## Phase 1 — Change Intake

### 1a. Thu thập thông tin thay đổi

Hỏi user (hoặc parse từ input):
```
- Change ID nguồn gốc: VD BR-WH-001, US-SALES-003, FT-INV-002
- Mô tả thay đổi: điều gì thay đổi
- Lý do thay đổi: tại sao cần thay đổi
- Mức độ: minor (bổ sung nhỏ) | major (thay đổi logic) | breaking (thay đổi interface)
- Yêu cầu: urgent (cần update ngay) | planned (lên kế hoạch)
```

### 1b. Tạo Change Record

```markdown
# CHANGE-{TIMESTAMP}: {Mô tả ngắn}

**Change ID:** CHG-{PROJECT-SLUG}-{NNN}
**Ngày:** {DATE}
**Type:** minor | major | breaking
**Status:** analyzing → planned → implementing → done

**Element thay đổi:** {ID nguồn gốc}
**Mô tả thay đổi:**
{Chi tiết thay đổi}

**Lý do:**
{Tại sao cần thay đổi}
```

---

## Phase 2 — Impact Analysis

### 2a. Gọi mc_impact_analysis

```
mc_impact_analysis({
  projectSlug: "<slug>",
  elementId: "<ID>",                     // VD: BR-WH-001 — ID của element đang thay đổi
  changeDescription: "<mô tả thay đổi>",
  changeType: "minor" | "major" | "breaking"
})
```

### 2b. Phân tích kết quả impact

Từ kết quả `mc_impact_analysis`, xác định:

```
Affected Documents:
  - BIZ-POLICY-WH.md        → cần cập nhật BR-WH-001 description
  - URS-WH.md               → cần cập nhật AC của US-WH-001 liên quan
  - MODSPEC-WH.md           → cần cập nhật business rule validation
  - TEST-WH.md              → cần thêm/sửa TC liên quan đến BR-WH-001
  - src/erp/wh/             → cần update validation logic

Impact Score: HIGH (4 docs + 1 code area bị ảnh hưởng)
```

### 2c. Hiển thị Impact Report cho user

```
📊 IMPACT ANALYSIS — CHG-{ID}

Thay đổi: {mô tả}

Tài liệu bị ảnh hưởng:
| Document | Loại ảnh hưởng | Mức độ | Action cần thiết |
|----------|----------------|--------|-----------------|
| BIZ-POLICY-WH.md | Cập nhật rule | Minor | Edit section BR-WH-001 |
| URS-WH.md | Cập nhật AC | Major | Re-write AC-WH-001-02 |
| MODSPEC-WH.md | Cập nhật validation | Major | Update business rule block |
| TEST-WH.md | Thêm test case | Minor | Add TC cho new condition |
| src/erp/wh/ | Update code | Breaking | Sửa validation method |

Tổng: 4 documents + 1 code area

→ Tự động chuyển sang Phase 3 (Snapshot) rồi Phase 4 (Document Updates)
```

### 2d. Breaking Change — Downstream System Warning

Khi `changeType = "breaking"`, kiểm tra thêm các systems phụ thuộc:

```
// Tìm downstream dependents
mc_dependency({
  action: "dependents",
  projectSlug: "<slug>",
  source: "<ID thay đổi>"   // VD: API-ERP-001, TBL-ERP-003
})
```

Nếu có downstream systems bị ảnh hưởng, hiển thị cảnh báo TRƯỚC KHI tiếp tục:

```
🚨 BREAKING CHANGE — Ảnh hưởng downstream systems!

Thay đổi {ID} sẽ phá vỡ contract với các systems sau:

| System | Module | Dependency | Tác động cụ thể |
|--------|--------|-----------|----------------|
| WEB    | CART   | API-ERP-001 (response shape) | Frontend cần update payload parsing |
| MOB    | ORDER  | API-ERP-001 (auth header)    | Mobile app cần update SDK |
| RPT    | REPORT | TBL-ERP-003 (column removed) | Report query sẽ fail |

⚠️ Khuyến nghị: Coordinate với teams phụ trách các systems trên trước khi apply.

Bạn muốn:
1. Tiếp tục (tôi sẽ thêm downstream notice vào CHANGE record)
2. Hủy — cần coordinate trước
```

Thêm vào CHANGE-{ID} record phần downstream notice:

```markdown
## Breaking Change — Downstream Impact

**Systems bị ảnh hưởng:**
| System | Module | Contract bị phá vỡ | Action cần thiết |
|--------|--------|-------------------|-----------------|
| {SYS1} | {MOD1} | {API/schema/event} | {action} |
| {SYS2} | {MOD2} | {API/schema/event} | {action} |

**Developer action items:**
- [ ] Notify team {SYS1} về breaking change tại {ID}
- [ ] Update integration test tại {SYS2}
- [ ] Version bump API (nếu public API): v{N} → v{N+1}
- [ ] Update API changelog + deprecation notice
```

---

## Phase 3 — Snapshot (Safety)

Trước khi thay đổi bất kỳ document nào:

```
mc_snapshot({
  projectSlug: "<slug>",
  label: "before-change-{CHG-ID}",
  notes: "Snapshot trước khi apply CHG-{ID}: {mô tả}"
})
```

```
✅ Đã tạo safety snapshot. Có thể rollback nếu cần.
```

---

## Phase 4 — Document Updates

### 4a. Với mỗi document bị ảnh hưởng

Theo thứ tự: BIZ-POLICY → PROCESS → URS → MODSPEC → TEST → (Code: chỉ gợi ý, không tự sửa)

```
mc_load({
  filePath: "<path>",
  layer: 3
})
```

Đọc document → xác định section cần cập nhật → tạo updated content.

### 4b. Auto-Apply Update Protocol

```
Tự động apply thay đổi theo thứ tự: BIZ-POLICY → PROCESS → URS → MODSPEC → TEST

Với mỗi document:
  Hiển thị diff (before/after) trong completion report
  → Apply ngay mà không hỏi confirm
  → Nếu user muốn rollback → dùng mc_rollback (snapshot đã tạo ở Phase 3)
```

### 4c. Apply thay đổi

Khi user confirm:
```
mc_merge({
  projectSlug: "<slug>",
  targetFile: "<path>",
  content: "<nội dung đã cập nhật>",
  mode: "replace-section",
  sectionName: "<tên section thay đổi>",
  sourceLabel: "CHG-{ID}"
})
```

---

## Phase 5 — Traceability Update

Cập nhật traceability matrix:

```
mc_traceability({
  action: "link",
  items: [
    { from: "<ID cũ>", to: "<ID mới>" }
  ]
})
```

Với breaking changes, mark old IDs là deprecated:
```
// Ghi chú trong document:
// ⚠️ DEPRECATED by CHG-{ID} on {DATE}: {lý do}
```

---

## Phase 6 — Changelog Entry

```
mc_changelog({
  action: "add",
  projectSlug: "<slug>",
  entry: "CHG-{ID}: {Mô tả thay đổi}. Documents cập nhật: {list}. Lý do: {reason}",
  changeType: "changed" | "added" | "fixed",
  phase: "<phase bị ảnh hưởng>"
})
```

---

## Phase 7 — Code Impact Notice

Nếu có code files bị ảnh hưởng:

```
⚠️ CẦU LƯU Ý — THAY ĐỔI CODE CẦN THIẾT:

Các file code cần cập nhật thủ công:

1. src/{sys}/{mod}/services/{mod}.service.ts
   Thay đổi: Cập nhật validation logic cho BR-WH-001
   Dòng gợi ý: validateMinimumQuantity() method

2. src/{sys}/{mod}/__tests__/{mod}.service.test.ts
   Thay đổi: Thêm test case cho new condition
   Template:
   ```typescript
   it('should reject when quantity below minimum', async () => {
     // TC-WH-NEW-001
     // ...
   });
   ```

Lưu ý: Change Manager không tự sửa code để tránh lỗi.
Sau khi sửa code, chạy /mcv3:verify để kiểm tra lại.
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

### Tầng 1 — Self-Verification

```
CHG Record:
  ✓ CHG-ID format: CHG-NNN (sequential)
  ✓ Changed element ID tồn tại trong project (không reference phantom IDs)
  ✓ Before/After content rõ ràng trong changelog entry
  ✓ Impact scope đã liệt kê đầy đủ documents bị ảnh hưởng

Updated Documents:
  ✓ Mỗi document đã update không bị broken format
  ✓ Không còn stale references đến old content (tên cũ, IDs cũ đã bị remove)
  ✓ Updated IDs vẫn valid format sau thay đổi
```

### Tầng 2 — Cross-Document

```
  ✓ Traceability chain sau thay đổi vẫn intact (không bị đứt giữa các phases)
  ✓ Không có circular dependencies trong impact chain
  ✓ Tất cả documents trong impact list đã được update (không skip)
  ✓ IDs được reference trong updated docs vẫn tồn tại (không orphan refs)
```

### Tầng 3 — Quality Gate

```
✅ Safety snapshot đã tạo (mc_snapshot trước thay đổi)
✅ Tất cả documents trong impact list đã update hoặc có lý do skip ghi rõ
✅ Changelog entry CHG-{ID} đã ghi đầy đủ
✅ Traceability vẫn valid sau thay đổi
✅ mc_validate PASS cho tất cả updated documents
```

---

## Phase 8 — Post-Gate & Summary

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "after-change-{CHG-ID}",
  sessionSummary: "Applied CHG-{ID}: {N} documents cập nhật",
  nextActions: [
    "Review code changes (xem Phase 7 above)",
    "Chạy /mcv3:verify để xác nhận traceability sau thay đổi",
    "Update MASTER-INDEX nếu cần"
  ]
})
```

**Post-Gate checklist:**
```
✅ Safety snapshot đã tạo
✅ Tất cả documents bị ảnh hưởng đã được update (hoặc skipped có lý do)
✅ Traceability matrix đã cập nhật
✅ Changelog entry đã ghi
✅ Code impact notice đã thông báo cho developer
✅ Checkpoint đã lưu

→ Dùng Completion Report format (xem auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 HOÀN THÀNH: /mcv3:change-manager — CHG-{ID}
═══════════════════════════════════════════════

✅ Đã cập nhật {N} documents:
   BIZ-POLICY-{DOM}.md — sửa BR-{DOM}-{NNN}
   URS-{MOD}.md        — cập nhật AC liên quan
   MODSPEC-{MOD}.md    — cập nhật validation
   TEST-{MOD}.md       — thêm/sửa TCs

⚠️ Code impact (cần developer thực hiện thủ công):
   src/{sys}/{mod}/... — xem hướng dẫn trong Phase 7

📋 Changelog: CHG-{ID} đã ghi trong _changelog.md

🔜 Bước tiếp theo:
   → Sửa code theo hướng dẫn trên
   → /mcv3:verify — Xác nhận traceability sau thay đổi

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem diff của document nào? (cho biết tên file)
   [2] Có thêm thay đổi nào không?
   [3] OK, tiến hành sửa code rồi → /mcv3:verify
═══════════════════════════════════════════════
```

---

## Multi-Change Mode

Khi có nhiều thay đổi cùng lúc:

```
Tự động xử lý theo thứ tự dependency (an toàn nhất):
1. Sort changes theo dependency order: BR → US → FT → API
2. Xử lý từng change tuần tự, mỗi change tạo 1 snapshot riêng
3. Báo cáo tổng hợp sau khi xong tất cả
```

---

## Quy tắc Change Management

```
SNAPSHOT-FIRST: Luôn snapshot trước khi thay đổi
AUTO-APPLY-WITH-DIFF: Tự apply thay đổi tất cả docs — hiển thị diff trong Completion Report (không hỏi confirm từng doc)
BREAKING-EXCEPTION: Chỉ dừng hỏi confirm khi breaking change ảnh hưởng downstream systems (rủi ro cao)
CODE-MANUAL: Không tự sửa code files (quá rủi ro) — chỉ gợi ý + notice
CHANGELOG-ALWAYS: Mọi thay đổi phải có changelog entry
TRACE-MAINTAIN: Sau thay đổi, traceability phải vẫn valid
VERIFY-AFTER: Khuyến nghị chạy /mcv3:verify sau major/breaking changes
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification (Tầng 1-3):** Section này là checklist nhanh GIỮA các phases trong quá trình xử lý. Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ, trước Completion Report.

Mỗi phase output là input cho phase sau. Verify TRƯỚC KHI chuyển phase:

### Sau Phase 1 → trước Phase 2:
- ✓ Change element ID tồn tại trong project (không reference phantom ID)
- ✓ Mô tả thay đổi đủ rõ để phân tích impact (không quá vague)
- ✓ Change type (minor/major/breaking) đã xác định — ghi DECISION nếu tự infer

### Sau Phase 2 → trước Phase 3:
- ✓ Impact list đầy đủ: không bỏ sót document nào trong chain BR → US → FT → API → TC
- ✓ Với breaking change: downstream systems đã identify qua `mc_dependency`
- ✓ Dự án lớn (5+ systems): cascade qua TẤT CẢ systems đã check — không chỉ system nguồn
- ✓ Nếu impact = HIGH (≥4 docs): note vào checkpoint trước khi snapshot

### Sau Phase 3 → trước Phase 4:
- ✓ `mc_snapshot` đã trả về success (không giả định thành công)
- ✓ Snapshot label chứa CHG-ID để dễ rollback sau này
- ✓ Nếu snapshot fail → DỪNG, báo user — không tiếp tục khi không có safety net

### Sau Phase 4 → trước Phase 5:
- ✓ Tất cả documents trong impact list đã update (hoặc skip với lý do ghi rõ)
- ✓ Updated documents không bị broken format (headings, IDs còn nguyên)
- ✓ Không còn stale references đến old content trong bất kỳ updated doc nào
- ✓ Dự án lớn: mỗi system affected có entry update riêng — không gộp chung

### Sau Phase 5 → trước Phase 6:
- ✓ Traceability chain sau thay đổi intact: không có orphan IDs mới tạo ra
- ✓ Deprecated IDs đã mark rõ ràng (không im lặng remove)
- ✓ Cross-system traceability links (nếu có) vẫn valid sau thay đổi
