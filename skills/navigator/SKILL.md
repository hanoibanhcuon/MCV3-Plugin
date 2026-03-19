# Navigator Skill — MCV3 Project Status Dashboard

Skill này đọc trạng thái dự án từ MCP Server và hiển thị dashboard tiến độ cho user.

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
- Hướng dẫn: "Chạy `mc_init_project` hoặc `/mcv3:start` để bắt đầu"

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

## Tools sử dụng

- `mc_status` — đọc trạng thái project
- `mc_list` — liệt kê tài liệu (nếu cần)

## Không làm

- KHÔNG tự động chạy skills khác (chỉ gợi ý)
- KHÔNG sửa đổi bất kỳ file nào trong `.mc-data/`
- KHÔNG tự tạo projects — hướng dẫn user chạy `mc_init_project`
