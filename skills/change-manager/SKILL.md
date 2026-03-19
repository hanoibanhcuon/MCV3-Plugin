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
3. Hỏi user:
   "📋 Change Manager sẵn sàng.

   Bạn muốn thay đổi gì?
   Mô tả thay đổi: VD:
   - BR-WH-001: Thêm điều kiện kiểm tra số lượng tối thiểu khi nhập kho
   - US-SALES-003: Thêm flow approval cho đơn hàng > 50 triệu
   - FT-INV-002: Thay đổi logic tính giá trị tồn kho từ FIFO → Weighted Average"
```

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
  changeId: "<ID>",                      // VD: BR-WH-001
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

Bạn muốn:
1. Xem chi tiết từng document cần cập nhật
2. Bắt đầu cập nhật tự động
3. Chỉ ghi changelog (update thủ công sau)
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

Theo thứ tự: BIZ-POLICY → URS → MODSPEC → TEST → (Code: chỉ gợi ý, không tự sửa)

```
mc_load({
  filePath: "<path>",
  layer: 3
})
```

Đọc document → xác định section cần cập nhật → tạo updated content.

### 4b. Guided Update Protocol

```
"📝 Cập nhật {Document}:

Nội dung HIỆN TẠI:
---
{Phần cần thay đổi - current}
---

Nội dung MỚI ĐỀ XUẤT:
---
{Phần đề xuất updated}
---

Lý do: {Giải thích tại sao cần thay đổi}

Bạn có muốn áp dụng thay đổi này không?
[Y] Áp dụng  [E] Chỉnh sửa thêm  [S] Bỏ qua document này"
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

→ "✅ Change CHG-{ID} đã apply!
   {N} documents cập nhật, {M} items deprecated.
   Tiếp theo: sửa code theo hướng dẫn trên, rồi chạy /mcv3:verify."
```

---

## Multi-Change Mode

Khi có nhiều thay đổi cùng lúc:

```
"Bạn có {N} thay đổi:
1. BR-WH-001: {mô tả}
2. US-SALES-003: {mô tả}
3. FT-INV-002: {mô tả}

Xử lý theo thứ tự nào?
[A] Tự động — theo thứ tự dependency (an toàn nhất)
[S] Theo sequence user chỉ định
[P] Preview tất cả impacts trước"
```

Khi xử lý nhiều changes: mỗi change tạo một snapshot riêng.

---

## Quy tắc Change Management

```
SNAPSHOT-FIRST: Luôn snapshot trước khi thay đổi
GUIDED: Không tự ý thay đổi nội dung — luôn hiển thị cho user review
CODE-MANUAL: Không tự sửa code files (quá rủi ro)
CHANGELOG-ALWAYS: Mọi thay đổi phải có changelog entry
TRACE-MAINTAIN: Sau thay đổi, traceability phải vẫn valid
VERIFY-AFTER: Khuyến nghị chạy /mcv3:verify sau major/breaking changes
```
