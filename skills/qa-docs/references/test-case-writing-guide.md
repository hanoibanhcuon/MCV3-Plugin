# Test Case Writing Guide — QA Reference

## Nguyên tắc viết test case tốt

### INVEST Criteria

| Tiêu chí | Ý nghĩa |
|---------|---------|
| **I**ndependent | Không phụ thuộc TC khác |
| **N**ot Overlapping | Không test điều đã có TC khác test |
| **V**aluable | Mỗi TC tìm ra bug thực sự |
| **E**xact | Mô tả chính xác, không mơ hồ |
| **S**mall | Test 1 điều duy nhất |
| **T**raceable | Link về AC/BR rõ ràng |

---

## Cấu trúc Test Case chuẩn

```markdown
### TC-{MOD}-NNN: {Động từ + Đối tượng + Điều kiện}

Tên tốt: "Tạo phiếu nhập kho với đầy đủ thông tin hợp lệ"
Tên xấu: "Test tạo phiếu" (quá mơ hồ)

| Mục | Nội dung |
|-----|---------|
| **Mã** | TC-{MOD}-NNN |
| **Loại** | Unit / Integration / UAT / Performance |
| **Implements** | [VERIFIED-BY: AC-{MOD}-NNN-XX] |
| **Priority** | P0 / P1 / P2 |
| **Thời gian ước tính** | ~N phút |

**Preconditions:**
- {Điều kiện đã có trước khi test}
- {Ví dụ: Hệ thống đang chạy, user A đã đăng nhập}

**Setup:**
```
// Dữ liệu cần chuẩn bị
const user = createTestUser({ role: "warehouse_manager" });
const supplier = createTestSupplier({ code: "SUP001" });
```

**Steps:**
| # | Action | Input | Expected Result |
|---|--------|-------|----------------|
| 1 | Mở màn hình tạo phiếu nhập | - | Form rỗng hiển thị |
| 2 | Điền số PO | "PO-2024-001" | Field được fill |
| 3 | Chọn nhà cung cấp | "SUP001" | Dropdown hiển thị tên |
| 4 | Nhấn Lưu | - | Toast "Tạo thành công" |

**Pass criteria:**
- Response HTTP 201
- Phiếu có ID mới trong database
- Trạng thái = "draft"

**Teardown:**
```
// Xóa dữ liệu test
await db.grn.delete({ where: { code: testGrnCode } });
```

**Notes:** {Lưu ý đặc biệt nếu có}
```

---

## Patterns test theo từng loại

### Pattern 1: CRUD Happy Path

```
TC-NNN-001: Tạo {entity} thành công → HTTP 201, entity trong DB
TC-NNN-002: Đọc {entity} theo ID → HTTP 200, đúng data
TC-NNN-003: Cập nhật {entity} hợp lệ → HTTP 200, data updated
TC-NNN-004: Xóa {entity} → HTTP 200/204, soft-deleted
TC-NNN-005: Liệt kê {entity} với pagination → HTTP 200, đúng count
```

### Pattern 2: Validation Error Cases

```
TC-NNN-010: Thiếu required field → HTTP 400, "field X required"
TC-NNN-011: Format sai (email/date/number) → HTTP 400, mô tả field
TC-NNN-012: Vượt giới hạn max length → HTTP 400
TC-NNN-013: Giá trị ngoài enum → HTTP 400
TC-NNN-014: Duplicate unique field → HTTP 409
```

### Pattern 3: Authorization Cases

```
TC-NNN-020: Không có token → HTTP 401
TC-NNN-021: Token hết hạn → HTTP 401
TC-NNN-022: Role không đủ quyền → HTTP 403
TC-NNN-023: User không sở hữu resource → HTTP 403/404
```

### Pattern 4: Business Rule Violations

```
TC-NNN-030: Vi phạm BR-{DOM}-001 → HTTP 422, error code
TC-NNN-031: Transition state không hợp lệ → HTTP 422
TC-NNN-032: Tính toán vượt ngưỡng → HTTP 422, message cụ thể
```

### Pattern 5: Edge Cases

```
TC-NNN-040: Empty list → HTTP 200, data: []
TC-NNN-041: Large input (max size) → Xử lý đúng / báo lỗi
TC-NNN-042: Concurrent updates → Optimistic locking hoạt động
TC-NNN-043: Null optional fields → Xử lý gracefully
```

---

## Test Data Best Practices

### Tạo test data có ý nghĩa

```
❌ Xấu:  name: "test", code: "abc123"
✅ Tốt:  name: "Phiếu nhập kho tháng 3", code: "GRN-2024-001"

❌ Xấu:  price: 999, quantity: 5
✅ Tốt:  price: 150000, quantity: 10 // 10 kg gạo, 15.000đ/kg
```

### Boundary Values (Biên giới)

```
Trường có min/max → Test tại:
  - min - 1 (invalid)
  - min     (valid)
  - mid value (valid)
  - max     (valid)
  - max + 1 (invalid)

Ví dụ: quantity phải từ 1 đến 99999
  → Test: 0, 1, 500, 99999, 100000
```

---

## Traceability Matrix

Mỗi TC phải trả lời được: "TC này verify điều gì trong URS?"

```
TC-INV-001 → [VERIFIED-BY: AC-INV-001-01]
           ← "Khi nhập đủ thông tin phiếu, hệ thống tạo thành công"

TC-INV-005 → [VERIFIED-BY: BR-INV-002]
           ← "Số lượng nhập không được âm"
```

**Coverage check:** Mỗi AC phải có ít nhất 1 TC.
Coverage dưới 80% → KHÔNG được deploy.

---

## Ký hiệu trong Test Cases

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `→` | Dẫn đến kết quả |
| `[VERIFIED-BY: ID]` | TC này verify AC/BR nào |
| `⚠️` | Điều kiện quan trọng cần chú ý |
| `💡` | Tips hoặc ghi chú hữu ích |
| `🔴 FAIL` | TC fail |
| `🟢 PASS` | TC pass |
| `⏭ SKIP` | TC bị skip (lý do ghi chú) |
