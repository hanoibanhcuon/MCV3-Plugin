# Impact Assessment Guide — MCV3 Change Manager

Hướng dẫn đánh giá impact khi thay đổi element trong MCV3. Dùng kết hợp với `mc_impact_analysis`.

---

## 1. Mô hình Dependency

MCV3 documents có dependency dạng DAG (Directed Acyclic Graph):

```
PROJECT-OVERVIEW
      │
      ▼
EXPERT-LOG ──────► DATA-DICTIONARY
      │                   │
      ▼                   ▼
BIZ-POLICY ──────► PROCESS
      │
      ▼
   URS-{MOD}
      │
      ▼
MODSPEC-{MOD}
      │
      ├────► TEST-{MOD}
      │             │
      ├────► CODE   │
      │       │     │
      └───────┴─────▼
           VERIFY-CROSS
                │
                ▼
           DEPLOY-OPS
```

**Nguyên tắc:** Thay đổi element A sẽ invalidate tất cả elements phụ thuộc trực tiếp hoặc gián tiếp vào A.

---

## 2. Document Dependency Matrix

| Document | Phụ thuộc vào | Bị phụ thuộc bởi |
|----------|--------------|-----------------|
| PROJECT-OVERVIEW | — | EXPERT-LOG, tất cả |
| EXPERT-LOG | PROJECT-OVERVIEW | BIZ-POLICY, URS |
| DATA-DICTIONARY | — | MODSPEC, BIZ-POLICY |
| BIZ-POLICY | PROJECT-OVERVIEW | URS |
| PROCESS | BIZ-POLICY | URS |
| URS-{MOD} | BIZ-POLICY, PROCESS | MODSPEC-{MOD} |
| MODSPEC-{MOD} | URS-{MOD}, DATA-DICT | TEST-{MOD}, CODE |
| TEST-{MOD} | MODSPEC-{MOD}, URS-{MOD} | VERIFY-CROSS |
| CODE/{mod} | MODSPEC-{MOD} | VERIFY-CROSS |
| VERIFY-CROSS | URS, MODSPEC, TEST, CODE | DEPLOY-OPS |
| DEPLOY-OPS | VERIFY-CROSS | — |

---

## 3. ID Cross-Reference Map

Khi một ID thay đổi, tra theo bảng:

| ID thay đổi | Documents cần kiểm tra |
|-------------|----------------------|
| BR-{DOM}-xxx | BIZ-POLICY, URS (origin field), MODSPEC (BR block) |
| US-{MOD}-xxx | URS file tương ứng, MODSPEC (FT block) |
| FT-{MOD}-xxx | URS file, MODSPEC, TEST (coverage), CODE (@req-ids) |
| AC-{MOD}-xxx | URS file, TEST (TC coverage) |
| API-{SYS}-xxx | MODSPEC, TEST (API test), CODE (handler) |
| TBL-{SYS}-xxx | MODSPEC, DATA-DICT, CODE (migration + repository) |
| TC-{MOD}-xxx | TEST file, CODE (__tests__) |
| NFR-xxx | URS file, MODSPEC (constraints), TEST (NFR tests) |

---

## 4. Impact Assessment Checklist

### Khi BR thay đổi

```
□ BIZ-POLICY-{DOM}.md: Tìm BR-xxx, cập nhật description/conditions
□ URS-{MOD}.md: Tìm US/FT có "Origin: BR-xxx"
  □ AC của các US đó có cần cập nhật?
  □ FT description có cần cập nhật?
□ MODSPEC-{MOD}.md: Tìm "Business Rule: BR-xxx"
  □ Validation logic có cần cập nhật?
  □ Error messages có cần cập nhật?
□ TEST-{MOD}.md: Tìm TC liên quan đến FT của BR đó
  □ Test conditions có cần cập nhật?
  □ Expected outcomes có cần cập nhật?
□ CODE: Grep "@req-ids" cho FT-ids liên quan
  □ Validation methods cần update?
```

### Khi API thay đổi

```
□ MODSPEC-{MOD}.md: Cập nhật API endpoint definition
□ SERVICE-SPEC.md (nếu có): Cập nhật contract
□ TEST-{MOD}.md: Cập nhật API test cases
□ USER-GUIDE.md: Cập nhật nếu API expose ra UI
□ CODE:
  □ Controller/Router file
  □ DTO types
  □ Service method signature
  □ Test files
□ VERIFY-CROSS: Re-run verification
```

### Khi DB Schema thay đổi

```
□ DATA-DICTIONARY.md: Cập nhật entity/field definitions
□ MODSPEC-{MOD}.md: Cập nhật TBL-xxx section
□ CODE:
  □ Migration script (V{NNN+1}__alter_{table}.sql)
  □ Repository queries
  □ DTO/Model types
  □ Tests
□ Kiểm tra xem field đó có dùng trong nhiều modules?
  → Cross-system impact analysis cần thiết
```

### Khi Workflow thay đổi

```
□ PROCESS-{DOM}.md: Cập nhật TO-BE flow
□ URS-{MOD}.md:
  □ Thêm/sửa User Stories liên quan
  □ Thêm/sửa Use Cases
  □ Cập nhật AC cho flow mới
□ MODSPEC-{MOD}.md:
  □ Thêm API endpoints mới (nếu cần)
  □ Cập nhật State Machine (nếu có)
  □ Cập nhật Business Rule blocks
□ TEST-{MOD}.md:
  □ Thêm test scenarios cho flow mới
  □ Happy path, error path, edge cases
□ USER-GUIDE.md: Cập nhật user instructions
□ CODE: Implement workflow changes
```

---

## 5. Cross-System Impact Detection

### Khi nào cần cross-system analysis?

Phân tích cross-system khi element thay đổi là:
- `INT-{SYS}-xxx` (integration point)
- `TBL-SHARED-xxx` (shared database tables)
- Authentication/Authorization logic
- Pricing/Calculation engines
- Notification/Event bus

### Cách phát hiện cross-system impact

```
1. Search toàn project cho {ID}:
   mc_search({ query: "{ID}", maxResults: 50 })

2. Kiểm tra tất cả files có reference đến ID
3. Group by system code

4. Với mỗi system bị ảnh hưởng:
   → Repeat impact checklist cho system đó
```

---

## 6. Impact Scoring Matrix (chi tiết)

### Tính điểm mức độ ảnh hưởng

**A. Breadth Score (Bề rộng)**
```
Số documents phải update:
  1-2 docs = 1 point
  3-4 docs = 2 points
  5-7 docs = 3 points
  8+ docs  = 4 points

Số systems bị ảnh hưởng:
  1 system = 0 points
  2 systems = 2 points
  3+ systems = 4 points
```

**B. Depth Score (Độ sâu)**
```
Phase của element bị thay đổi:
  Phase 8 (Deploy/Test) = 1 point
  Phase 6-7 (Design/QA) = 2 points
  Phase 4-5 (Req/BizDocs) = 3 points
  Phase 1-3 (Overview/Expert/BizPolicy) = 4 points
```

**C. Risk Score (Rủi ro)**
```
Loại thay đổi:
  Thêm optional field = 1 point
  Thêm required field = 2 points
  Đổi tên/type field = 3 points
  Xóa field/endpoint = 4 points

Code đã deployed:
  Chưa deploy = 0 points
  Dev/Staging = 1 point
  Production = 3 points
```

**Tổng điểm:**
```
≤ 6 points: Low Impact — tiến hành trực tiếp
7-12 points: Medium Impact — cần review từng bước
13-18 points: High Impact — cần approval + change freeze
≥ 19 points: Critical — escalate lên tech lead/product owner
```

---

## 7. Change Frequency Analysis

Khi một element bị thay đổi nhiều lần → đây là "hot spot" cần review thiết kế:

```
Ngưỡng cảnh báo:
  Cùng element thay đổi ≥ 3 lần trong 1 sprint = Design issue
  Cùng system có ≥ 5 changes trong 2 sprint = Architecture review needed
  Breaking changes > 30% tổng changes = Cần ADR (Architecture Decision Record)
```

Khi phát hiện hot spot:
```
⚠️ PHÁT HIỆN HOT SPOT:
{ID} đã thay đổi {N} lần. Đây có thể là dấu hiệu:
1. Requirement chưa rõ ràng từ đầu
2. Design cần refactor
3. Stakeholder chưa align

Đề xuất: Họp review lại thiết kế tổng thể của {module}
trước khi tiếp tục implement.
```

---

## 8. Rollback Decision Tree

```
Thay đổi gây vấn đề?
  ↓ Yes
Có safety snapshot không?
  ↓ Yes → mc_rollback({ snapshotName: "before-change-{ID}" })
  ↓ No
Thay đổi nhiều files?
  ↓ Yes → Manual revert từng file (mc_compare để xem diff)
  ↓ No → Manual edit lại file đó

Sau rollback:
  → Phân tích lại impact
  → Chia nhỏ thay đổi hơn
  → Thực hiện từng phần nhỏ
```

---

## 9. Communication Templates

### Thông báo cho team khi có Breaking Change

```
🔴 BREAKING CHANGE NOTICE — CHG-{ID}

Dự án: {project}
Ngày: {date}
Thay đổi: {element} — {mô tả}

Ảnh hưởng:
- {list documents}
- {list code areas}

Action cần thiết của từng role:
□ Developer: Cập nhật {files}
□ QA: Re-run tests sau update
□ PM: Confirm acceptance criteria mới

Deadline: {date}
Contact: {person}
```

### Thông báo khi change hoàn thành

```
✅ CHANGE COMPLETE — CHG-{ID}

Đã cập nhật:
- {N} documents
- {M} code areas flagged

Trạng thái mới:
- Traceability: ✅ / ⚠️
- Tests: Pass / Updated / Pending
- Verification: Cần re-run

Xem chi tiết: _mcv3-work/change-log/CHG-{ID}.md
```
