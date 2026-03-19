# Quick Start — Product Manager / Business Analyst

Hướng dẫn nhanh cho PM và BA sử dụng MCV3.

---

## Tổng quan

MCV3 hỗ trợ PM/BA trong việc:
- **Elicitation**: Phỏng vấn có structure, không bỏ sót requirements
- **Documentation**: Tạo BRD/URS chuẩn với formal IDs
- **Traceability**: Track từng requirement qua design đến code
- **Change Management**: Manage scope changes với impact analysis

---

## Pipeline từ góc nhìn PM

### Phase 1 — Discovery (1-2 buổi, ~2-4 giờ)

```
/mcv3:discovery
```

Claude hỏi bạn:
- Vấn đề hiện tại là gì? (Problem Statement)
- Ai là người dùng? (Stakeholders, Actors)
- Kết quả mong đợi sau 6-12 tháng?
- Constraints: budget, timeline, tech stack
- Out-of-scope: gì KHÔNG cần làm

Output: `PROJECT-OVERVIEW.md` — tài liệu baseline cho cả team.

### Phase 2 — Expert Analysis (tự động, 30 phút)

```
/mcv3:expert-panel
```

AI đóng vai chuyên gia:
- Domain Expert: phân tích nghiệp vụ
- Finance Expert: chi phí/ROI, pricing logic
- Legal Expert: compliance, GDPR, contracts
- Strategy Expert: go-to-market, competitive positioning

Output: `EXPERT-LOG.md` — insights và risks cần xem xét.
PM review và confirm những điểm quan trọng.

### Phase 3 — Business Docs (1-3 buổi)

```
/mcv3:biz-docs
```

Tạo 3 loại tài liệu chính:

**BIZ-POLICY** — Business Rules:
```
BR-WH-001: Nhập kho phải có Purchase Order xác nhận
  Effective: Bắt đầu từ ngày 1/1/2025
  Applies to: Mọi nhập kho > 10 triệu VNĐ
  Exception: Emergency imports có approval từ Director
```

**PROCESS** — Quy trình AS-IS và TO-BE:
```
AS-IS: Nhập kho thủ công → nhân viên ghi sổ tay → kế toán đối chiếu cuối tuần
TO-BE: Nhập kho qua app → hệ thống cập nhật tức thì → cảnh báo chênh lệch tự động
```

**DATA-DICTIONARY** — Danh mục dữ liệu:
```
ENT-001: Phiếu Nhập Kho (Receipt)
  - Mã phiếu (required)
  - Nhà cung cấp (required, lookup)
  - Danh sách hàng hóa (required, 1..n)
  - Trạng thái: draft/confirmed/cancelled
```

### Phase 4 — Requirements (1-2 buổi per module)

```
/mcv3:requirements
```

**Quy trình Guided Generation:**

1. AI extract Business Rules từ BIZ-POLICY
2. Map sang User Stories:
   ```
   BR-WH-001 → US-WH-001: Thủ kho muốn tạo phiếu nhập kho
   ```
3. Hỏi bạn: "AC này đủ chưa? Còn edge case nào?"
4. Bổ sung → Finalize

**Acceptance Criteria chuẩn (Gherkin):**
```
AC-WH-001-01:
  Given: Thủ kho đã đăng nhập, có PO đã duyệt
  When: Điền đầy đủ thông tin và nhấn Xác nhận
  Then: Phiếu nhập được tạo, tồn kho cập nhật, log được ghi

AC-WH-001-02: (Error case)
  Given: Thủ kho nhập số lượng vượt PO 10%
  When: Submit form
  Then: Hiện cảnh báo, yêu cầu Manager approval
```

---

## Formal ID System cho PM

| Prefix | Loại | Ví dụ | Tạo ở đâu |
|--------|------|-------|-----------|
| `BR-{DOM}-NNN` | Business Rule | BR-INV-001 | /mcv3:biz-docs |
| `US-{MOD}-NNN` | User Story | US-WH-001 | /mcv3:requirements |
| `FT-{MOD}-NNN` | Feature | FT-WH-001 | /mcv3:requirements |
| `AC-{MOD}-NNN-XX` | Acceptance Criteria | AC-WH-001-01 | /mcv3:requirements |
| `NFR-NNN` | Non-Functional Req | NFR-001 | /mcv3:requirements |
| `UC-{MOD}-NNN-XX` | Use Case | UC-WH-001-01 | /mcv3:requirements |

**Tại sao dùng formal IDs?**
- Meetings: "US-WH-003 đã estimate chưa?" — ai cũng biết đang nói về gì
- Traceability: Track từ business need → code → test
- Change management: Impact analysis dựa trên IDs

---

## Review Gate — Stakeholder Sign-off

Sau mỗi phase quan trọng, MCV3 tạo `stakeholder-review.md`:

```markdown
## STAKEHOLDER REVIEW REQUEST — Phase 4 Requirements

### Cần phê duyệt:
- [ ] URS-WH.md (15 User Stories, 45 ACs)
- [ ] URS-SALES.md (12 User Stories, 36 ACs)
- [ ] URS-HR.md (8 User Stories, 24 ACs)

### Câu hỏi cần xác nhận:
1. US-WH-007 (Quản lý nhà cung cấp): Approval threshold là bao nhiêu?
2. US-SALES-011 (Discount policy): Áp dụng cho đơn lẻ hay tất cả?

### Deadline: {Date}

### Sign-off:
- [ ] Product Owner: _______________
- [ ] Business Lead: _______________
- [ ] Tech Lead: _______________
```

---

## Change Management cho PM

Khi stakeholder request thay đổi:

```
/mcv3:change-manager
```

Nhập: "US-SALES-003: Thêm approval cho đơn hàng > 50 triệu"

MCV3 tự động:
1. Phân tích: thay đổi này ảnh hưởng đến BIZ-POLICY, URS, MODSPEC, TEST
2. Tính điểm risk: Low/Medium/High
3. Đề xuất cập nhật từng document
4. Ghi changelog có cấu trúc
5. Thông báo developer về code cần update

---

## Tips cho PM/BA

### Tip 1: Discovery phải kỹ — không skip
Nếu PROJECT-OVERVIEW.md không rõ ràng, tất cả phases sau sẽ bị ảnh hưởng.
Dành thời gian đầy đủ cho Phase 1.

### Tip 2: Mỗi BR phải có ít nhất 1 US
Đây là quy tắc completeness. Nếu có BR nhưng không có US → business rule đó sẽ không được implement.

### Tip 3: AC phải TESTABLE
Tránh AC mơ hồ như "hệ thống phải nhanh" hay "giao diện phải đẹp".
→ "Trang dashboard load < 3 giây với 1000 records"
→ "Font size tối thiểu 14px, contrast ratio ≥ 4.5:1"

### Tip 4: NFR cần số liệu cụ thể
```
❌ NFR-001: Hệ thống phải có hiệu năng cao
✅ NFR-001: Response time API < 500ms at 95th percentile (load: 100 concurrent users)
```

### Tip 5: Dùng mc_export cho stakeholder reports
```
mc_export({ exportType: "summary" })     → Executive summary
mc_export({ exportType: "phase", targetPath: "P1-REQUIREMENTS" }) → All URS files bundled
```

---

## Tài liệu output theo phase

| Phase | Output chính | Stakeholder |
|-------|-------------|-------------|
| 1. Discovery | PROJECT-OVERVIEW.md | CEO, Sponsor |
| 2. Expert | EXPERT-LOG.md | CTO, CFO, Legal |
| 3. BizDocs | BIZ-POLICY + PROCESS + DATA-DICT | Business Lead |
| 4. Requirements | URS-{MOD}.md | Dev team, QA |
| 5. Tech Design | MODSPEC-{MOD}.md | Tech Lead, Architect |
| 6. QA Docs | TEST + USER-GUIDE | QA Lead, End users |
| 7. Deploy | DEPLOY-OPS.md | DevOps, Project Sponsor |
