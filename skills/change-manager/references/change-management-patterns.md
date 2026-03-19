# Change Management Patterns — MCV3

Tham khảo các patterns xử lý thay đổi trong dự án phần mềm. Dùng bởi `/mcv3:change-manager`.

---

## 1. Phân loại thay đổi

### Theo mức độ (Change Type)

| Loại | Mô tả | Ví dụ | Impact điển hình |
|------|-------|-------|-----------------|
| `minor` | Bổ sung nhỏ, không thay đổi logic hiện có | Thêm field bổ sung, thêm message lỗi | 1-2 docs |
| `major` | Thay đổi logic/rule quan trọng | Thay đổi công thức tính giá, thêm approval step | 3-5 docs |
| `breaking` | Thay đổi interface/contract | Đổi tên API endpoint, thay đổi DB schema | 5+ docs + code |

### Theo nguồn gốc (Change Origin)

| Nguồn | Mô tả | Ưu tiên |
|-------|-------|---------|
| Business Rule | BR-xxx thay đổi | Urgent nếu ảnh hưởng compliance |
| User Story | US-xxx thay đổi | Theo sprint planning |
| Functional | FT-xxx thay đổi | Ảnh hưởng design |
| Design | API/TBL thay đổi | Breaking — cần review kỹ |
| Test Case | TC-xxx thay đổi | Minor — ít ảnh hưởng |

---

## 2. Impact Propagation Rules

### Rule 1: Waterfall Down
Khi element ở phase trước thay đổi → tất cả elements phase sau bị ảnh hưởng:

```
BR-xxx CHANGED
  → URS: US + FT + AC liên quan cần review
    → MODSPEC: Business rule block + validation logic
      → TEST: TC liên quan
        → CODE: Implementation logic
```

### Rule 2: Scope Containment
Thay đổi trong một system không tự động ảnh hưởng system khác, TRỪ KHI có:
- Integration contracts (API-INT)
- Shared data models (TBL-SHARED)
- Cross-system business rules

### Rule 3: Cascade Detection
Khi phát hiện cascade > 3 levels hoặc > 5 documents:
- Đây có thể là `breaking` change dù ban đầu báo `minor`
- Nâng cấp classification và cảnh báo user

### Rule 4: Priority Ordering khi update documents

```
Thứ tự an toàn:
1. BIZ-POLICY (nguồn truth cho business rules)
2. URS (user stories + acceptance criteria)
3. MODSPEC (technical design)
4. TEST (test cases)
5. USER-GUIDE / ADMIN-GUIDE
6. Code (chỉ gợi ý, user tự sửa)
```

---

## 3. Change Record Template

```markdown
# CHG-{PROJECT}-{NNN}: {Tiêu đề ngắn}

**Ngày tạo:** {YYYY-MM-DD}
**Ngày hoàn thành:** {YYYY-MM-DD hoặc N/A}
**Type:** minor | major | breaking
**Priority:** urgent | planned | deferred
**Requester:** {user/stakeholder}

## Element thay đổi
- **ID:** {BR-xxx | US-xxx | FT-xxx | API-xxx}
- **Document gốc:** {tên file}
- **Section/line:** {tên section hoặc ID}

## Mô tả thay đổi

**Trước:**
{Nội dung cũ}

**Sau:**
{Nội dung mới}

## Lý do thay đổi
{Tại sao cần thay đổi — business reason}

## Impact Analysis
- Documents bị ảnh hưởng: {list}
- Code areas: {list hoặc N/A}
- Risk: Low | Medium | High

## Update Log
- [ ] BIZ-POLICY updated
- [ ] URS updated
- [ ] MODSPEC updated
- [ ] TEST updated
- [ ] Code reviewed/updated
- [ ] Changelog written
- [ ] Re-verified

## Notes
{Ghi chú bổ sung}
```

---

## 4. Patterns hay gặp

### Pattern A: Rule Tightening (Siết chặt điều kiện)

**Ví dụ:** "Tồn kho tối thiểu khi xuất kho phải > 0" → "phải ≥ 10 đơn vị"

```
Impact:
  BIZ-POLICY: Cập nhật ngưỡng trong BR-INV-003
  URS: Thêm AC: "Given tồn kho = 10, When xuất 5, Then cho phép"
       Thêm AC: "Given tồn kho = 9, When xuất 1, Then từ chối + thông báo"
  MODSPEC: Cập nhật validation constant MIN_STOCK = 10
  TEST: Thêm TC boundary: test với stock = 10, 11, 9
```

### Pattern B: Workflow Addition (Thêm bước phê duyệt)

**Ví dụ:** Đơn hàng > 50 triệu cần approval từ Manager

```
Impact:
  BIZ-POLICY: Thêm BR-SALES-015: Approval rule
  URS: Thêm US-SALES-NEW: Manager approval story
       Thêm AC cho approval flow
  MODSPEC: Thêm API endpoint approval, thêm status field
           Thêm TBL field: approval_status, approver_id
  TEST: Thêm TC cho approval flow, rejection flow
  CODE: Thêm ApprovalService, notification logic
```

### Pattern C: Field Rename (Đổi tên field)

**Ví dụ:** `customer_name` → `full_name` trong Customer module

```
Impact: BREAKING
  DATA-DICTIONARY: Cập nhật entity definition
  MODSPEC: Cập nhật TBL schema, API response shape
  TEST: Cập nhật assertions
  CODE: Migration script + refactor references
```

### Pattern D: NFR Tightening (Tăng yêu cầu hiệu năng)

**Ví dụ:** Response time < 2s → < 500ms

```
Impact:
  URS: Cập nhật NFR-003
  MODSPEC: Thêm indexing, caching strategy
  TEST: Cập nhật performance test threshold
  CODE: Optimize queries, add cache layer
```

### Pattern E: Compliance Addition (Thêm yêu cầu tuân thủ)

**Ví dụ:** Thêm audit trail cho tất cả giao dịch tài chính

```
Impact: MAJOR-to-BREAKING
  BIZ-POLICY: Thêm BR về audit requirement
  URS: Thêm NFR cho compliance
  MODSPEC: Thêm audit_log table, logging middleware
  TEST: Thêm TC kiểm tra audit trail
  CODE: Interceptor/middleware cho logging
```

---

## 5. Anti-patterns cần tránh

### Anti-pattern 1: Silent Change
❌ Thay đổi document mà không ghi changelog và không update traceability
✅ Luôn ghi CHG record và run mc_changelog

### Anti-pattern 2: Partial Update
❌ Chỉ cập nhật 1 document (VD: chỉ sửa MODSPEC) mà không propagate lên URS
✅ Follow waterfall order, update TẤT CẢ documents bị ảnh hưởng

### Anti-pattern 3: Scope Creep
❌ Khi update MODSPEC, "nhân tiện" thêm feature mới không liên quan
✅ Mỗi CHG record giải quyết đúng 1 thay đổi được xác định

### Anti-pattern 4: Retroactive Dating
❌ Ghi ngày thay đổi là trước ngày thực tế để che giấu delay
✅ Ghi ngày thực tế, ghi rõ ngày phát hiện vs ngày fix

### Anti-pattern 5: No Snapshot
❌ Thay đổi documents mà không có safety snapshot
✅ Luôn `mc_snapshot` trước khi apply bất kỳ thay đổi nào

---

## 6. Severity Scoring Guide

Tính điểm để quyết định mức độ risk:

| Tiêu chí | 1 (Low) | 2 (Medium) | 3 (High) |
|---------|---------|-----------|---------|
| Số documents bị ảnh hưởng | 1-2 | 3-5 | 6+ |
| Phase của element | QA/Deploy | URS/Design | BizDocs/Policy |
| Loại thay đổi | Add field | Change logic | Break contract |
| Systems bị ảnh hưởng | 1 | 2 | 3+ |
| Code đã deployed | No | Dev/Staging | Production |

**Score ≤ 5:** Low risk — apply trực tiếp
**Score 6-9:** Medium risk — cần user review từng bước
**Score ≥ 10:** High risk — cần stakeholder sign-off trước
