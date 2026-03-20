# Navigator Skill — MCV3 Project Status Dashboard

---

## Mục đích

Hiển thị dashboard tiến độ dự án MCV3 — user nhìn vào và biết ngay dự án đang ở đâu, đã xong những gì, và bước tiếp theo phải làm gì.

---

## Khi nào dùng skill này

- Bắt đầu session mới, muốn xem tổng quan dự án
- Hỏi "tiến độ hiện tại thế nào?", "đang ở phase mấy?"
- Cần biết bước tiếp theo trong pipeline
- Kiểm tra có bao nhiêu tài liệu đã tạo
- Dự án có nhiều systems, muốn xem phase của từng system

---

## Trigger

Khi user chạy lệnh `/mcv3:status` hoặc hỏi về tiến độ dự án.

---

## Logic

### Bước 1 — Đọc trạng thái dự án

Gọi `mc_status` để lấy thông tin dự án:

```
mc_status()                          # Liệt kê tất cả projects
mc_status(projectSlug: "<slug>")     # Chi tiết 1 project
```

**Nếu chưa có project nào:**
- Thông báo chưa khởi tạo dự án
- Hướng dẫn: "Chạy `mc_init_project` để khởi tạo, hoặc `/mcv3:onboard` để xem hướng dẫn"

**Nếu có nhiều projects:** hiển thị danh sách, hỏi user muốn xem chi tiết project nào.

**Nếu có 1 project:** hiển thị chi tiết ngay.

---

### Bước 2 — Hiển thị dashboard

Khi đã có `ProjectStatusSummary`, format và hiển thị theo template trong `references/status-display.md`.

Thông tin cần hiển thị:
- Tên dự án, domain, slug
- Phase hiện tại
- Phase progress (9 phases với icons ✅/🔄/⏳)
- Danh sách systems và trạng thái
- Tổng số tài liệu
- **Bước tiếp theo** — nổi bật để user biết phải làm gì

---

### Bước 3 — Tư vấn bước tiếp theo

Dựa vào `currentPhase` trong config và phase progress, đề xuất skill cần chạy:

| Phase hiện tại | Skill tiếp theo | Mô tả |
|----------------|----------------|-------|
| `phase0-init` | `/mcv3:discovery` | Bắt đầu Discovery — tìm hiểu dự án |
| `phase1-discovery` | `/mcv3:expert-panel` | Phân tích chuyên gia |
| `phase2-expert` | `/mcv3:biz-docs` | Tạo tài liệu nghiệp vụ |
| `phase3-bizdocs` | `/mcv3:requirements` | Viết URS cho từng module |
| `phase4-requirements` | `/mcv3:tech-design` | Thiết kế kỹ thuật |
| `phase5-design` | `/mcv3:qa-docs` | Tạo Test Cases, UAT scenarios, User/Admin Guide |
| `phase6-qa` | `/mcv3:code-gen` | Generate code scaffolding từ MODSPEC |
| `phase7-codegen` | `/mcv3:verify` | Cross-verify traceability matrix end-to-end |
| `phase8-verify` (verify xong) | `/mcv3:deploy-ops` | Tạo Deploy Plan, Rollback, Monitoring, SLA |
| `phase8-verify` (deploy xong) | 🎉 Done | Tất cả 8 phases hoàn thành |

**Chi tiết bổ sung cho Phase 6-8:**

```
Phase 6 — QA & Docs (/mcv3:qa-docs):
  Output: TEST-{MOD}.md, USER-GUIDE.md, ADMIN-GUIDE.md
  IDs tạo: TC-xxx, UAT-xxx
  Prereq: MODSPEC đã xong

Phase 7 — Code Gen (/mcv3:code-gen):
  Output: src/{sys}/{mod}/ (controller, service, repo, tests)
  Output: db/migrations/ (SQL migration files)
  REQ-ID: Mọi file có comment header truy về MODSPEC
  Prereq: TEST-{MOD}.md đã có

Phase 8 — Verify (/mcv3:verify):
  Output: _VERIFY-CROSS/verification-report.md
  Output: _VERIFY-CROSS/traceability-matrix.md
  Check: PROB → BR → US → FT → API → Code → TC (end-to-end)
  Prereq: Code files đã có REQ-ID

Phase 8 — Deploy-Ops (/mcv3:deploy-ops):
  Output: _PROJECT/DEPLOY-OPS.md
  Output: _VERIFY-CROSS/deploy-readiness-checklist.md
  Prereq: verification-report.md status = READY
```

---

### Bước 4 — Liệt kê tài liệu gần đây (tùy chọn)

Nếu user hỏi "tài liệu nào vừa tạo" hoặc "xem chi tiết":

```
mc_list(projectSlug: "<slug>")                          # Tất cả tài liệu
mc_list(projectSlug: "<slug>", subPath: "_PROJECT")     # Chỉ project-level docs
mc_list(projectSlug: "<slug>", documentType: "urs")     # Chỉ URS files
```

---

## Kết quả mong đợi

User nhìn vào dashboard và biết ngay:
1. Dự án đang ở đâu trong pipeline
2. Phases nào đã xong, đang làm, chưa bắt đầu
3. Bước tiếp theo cụ thể cần làm
4. Có bao nhiêu tài liệu đã được tạo

---

## Ví dụ output

Xem `references/status-display.md` để biết format hiển thị chi tiết.

---

### Bước 5 — Routing cho dự án in-progress

Nếu `mc_status` trả về systems có `currentPhase` khác nhau:

```
"⚠️ Phát hiện dự án in-progress với per-system phases!

Systems:
  - ERP: phase5-design
  - WEB: phase3-bizdocs

→ Chạy /mcv3:assess để:
  1. Xem full assessment per system
  2. Tìm gaps CRITICAL/WARNING/INFO
  3. Nhận REMEDIATION-PLAN với thứ tự ưu tiên"
```

Nếu user hỏi về dự án cũ hoặc có code nhưng chưa có docs:
```
→ Gợi ý /mcv3:assess ngay
→ Sau assess → làm theo REMEDIATION-PLAN
```

Nếu user hỏi "dự án nhỏ cần làm hết 8 phases không?" hoặc tương tự:
```
→ Gợi ý đọc scale-decision-matrix: "Dùng /mcv3:discovery để được recommend pipeline phù hợp"
→ Hint: Micro/Small project có thể skip một số phases an toàn
→ Tham khảo: skills/discovery/references/scale-decision-matrix.md
```

---

---

### Bước 6 — Error State Routing

Khi `mc_status` trả về lỗi hoặc phát hiện trạng thái bất thường:

**Lỗi: Project config bị hỏng / thiếu _config.json**
```
"⚠️ Không đọc được cấu hình dự án.

Nguyên nhân có thể:
  - File _config.json bị corrupt hoặc thiếu
  - Project chưa được khởi tạo đúng cách

Giải pháp:
  [1] Thử rollback về snapshot gần nhất: mc_rollback({ projectSlug, snapshotLabel: 'latest' })
  [2] Khởi tạo lại project: mc_init_project({ projectName, domain })
  [3] Xem chi tiết lỗi: mc_status({ projectSlug, verbose: true })"
```

**Lỗi: Validation failures trong documents**
```
"⚠️ Phát hiện {N} documents có validation errors:

| Document | Lỗi |
|----------|-----|
| URS-WH.md | Thiếu section DEPENDENCY MAP |
| MODSPEC-WH.md | IDs không sequential (gap ở NNN-007 → NNN-009) |

Giải pháp:
  → Chạy mc_validate({ filePath: '<doc>' }) để xem chi tiết
  → Fix từng document hoặc dùng /mcv3:change-manager để update"
```

**Lỗi: Snapshot bị hỏng hoặc rollback thất bại**
```
"❌ Rollback thất bại — snapshot '{label}' không còn hợp lệ.

Snapshot hiện có:
  {mc_list({ subPath: '_mcv3-work/_snapshots' })}

Chọn snapshot khác để rollback, hoặc tiếp tục với state hiện tại."
```

**Trạng thái: Phase inconsistency (per-system phases bất hợp lý)**
```
"⚠️ Phase inconsistency phát hiện:

| System | currentPhase | Documents có | Vấn đề |
|--------|-------------|-------------|--------|
| ERP    | phase7-codegen | Chỉ có URS, thiếu MODSPEC | Không thể code-gen khi chưa có MODSPEC |

→ Chạy /mcv3:assess để đánh giá lại và reset phases về đúng trạng thái."
```

---

## Tools sử dụng

- `mc_status` — đọc trạng thái project
- `mc_list` — liệt kê tài liệu (nếu cần)

## Không làm

- KHÔNG tự động chạy skills khác (chỉ gợi ý)
- KHÔNG sửa đổi bất kỳ file nào trong `.mc-data/`
- KHÔNG tự tạo projects — hướng dẫn user chạy `mc_init_project`
