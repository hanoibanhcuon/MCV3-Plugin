# Verify Skill — `/mcv3:verify`

## Mục đích

**Cross-verification toàn bộ pipeline** — Phase 8.

Verify traceability matrix end-to-end:
```
PROB → BR → US → FT → API → TBL → Code → TC
```

Kiểm tra:
- **Completeness**: Mọi requirement đã có implementation và test
- **Consistency**: Không có mâu thuẫn giữa các documents
- **Conflicts**: Không có xung đột giữa specs và code

Tạo **Verification Report** tổng hợp và **DEPLOY-OPS readiness check**.

---

## DEPENDENCY MAP

```
Requires:
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md (Phase 4)
  - {SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md (Phase 5)
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (Phase 6)
  - src/{sys}/{mod}/ (Phase 7 — code files)
Produces:
  - _VERIFY-CROSS/VERIFY-{SYS}-P1-{MOD}.md (URS verify)
  - _VERIFY-CROSS/VERIFY-{SYS}-P2-{MOD}.md (Design verify)
  - _VERIFY-CROSS/VERIFY-{SYS}-P3-{MOD}.md (Test verify)
  - _VERIFY-CROSS/traceability-matrix.md (End-to-end matrix)
  - _VERIFY-CROSS/verification-report.md (Tổng hợp)
Enables: /mcv3:deploy-ops (Phase 8 Deploy)
Agents: verifier
MCP Tools:
  - mc_status, mc_load, mc_list, mc_save
  - mc_validate, mc_compare, mc_traceability, mc_impact_analysis
References:
  - skills/verify/references/traceability-guide.md
  - templates/p8a-verify/VERIFY-P1-TEMPLATE.md
  - templates/p8a-verify/VERIFY-P2-TEMPLATE.md
  - templates/p8a-verify/VERIFY-P3-TEMPLATE.md
  - templates/p8a-verify/VERIFY-CROSS-P1-TEMPLATE.md
  - templates/p8a-verify/VERIFY-CROSS-P2-TEMPLATE.md
  - templates/p8a-verify/VERIFY-INTEGRATION-TEMPLATE.md
  - templates/p8a-verify/VERIFY-PROJECT-TEMPLATE.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — tự verify tất cả modules, tự build traceability matrix
2. **Tự giải quyết vấn đề** — phát hiện gaps và liệt kê rõ ràng trong report
3. **Báo cáo sau khi xong** — verification-report với READY/ATTENTION/NOT READY status
4. **User review** — nếu có gaps → hướng dẫn fix cụ thể
5. **Gợi ý bước tiếp** — `/mcv3:deploy-ops` (nếu READY) hoặc fix gaps trước

---

## Khi nào dùng skill này

- Sau khi `/mcv3:code-gen` hoàn thành
- Trước khi tạo DEPLOY-OPS documentation
- Khi cần audit traceability của dự án

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**Documents từ phases trước thiếu:**
- Liệt kê cụ thể: "Thiếu [file] → Chạy [/mcv3:skill] để tạo"
- Có thể verify partial nếu user confirm (xem Partial Verify Mode bên dưới)

## Partial Verify Mode

Tự động detect scope từ message của user — không hỏi:

```
Auto-detect scope từ user message:
  "Verify chỉ system ERP"   → scope = ERP only
  "Verify module INV"       → scope = INV module across all systems
  "Verify Phase 1 vs 2"     → chỉ check URS ↔ MODSPEC consistency
  (không có chỉ định)       → mặc định verify toàn bộ project

Partial verify steps:
1. Parse scope từ user message → nếu không có → full verify
2. Nếu partial:
   - Chỉ load documents của scope đó
   - Tạo VERIFY-{SYS}-{MOD}.md thay vì full verification-report.md
   - Ghi rõ: "Partial verification — scope: {system}/{module}"
3. Vẫn check traceability đầy đủ trong scope đó
4. Output: VERIFY-CROSS/{SYS}-PARTIAL-{MOD}.md + summary
```

---

## Phase 0 — Pre-Gate

```
1. mc_status() → xác nhận project, systems đã có
2. mc_list({ subPath: "{SYSTEM}/P1-REQUIREMENTS" }) → liệt kê URS files
3. mc_list({ subPath: "{SYSTEM}/P2-DESIGN" }) → liệt kê MODSPEC files
4. mc_list({ subPath: "{SYSTEM}/P3-QA-DOCS" }) → liệt kê TEST files
5. Kiểm tra code: ls src/{sys}/ → liệt kê modules đã code

6. Tự động bắt đầu verification — không chờ confirm:
   Ghi nhận scope: {N} URS modules → cần {N} MODSPEC + {N} TEST + code
   → Chuyển ngay sang Phase 1
```

---

## Phase 1 — URS Verification (P1 Verify)

### 1a. Load và kiểm tra từng URS

Với mỗi `URS-{MOD}.md`:

```
mc_load({ filePath: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md", layer: 3 })
```

**Completeness checks:**
- [ ] File có đủ sections (User Stories, FT, AC, NFR)?
- [ ] Mỗi US có ít nhất 1 FT?
- [ ] Mỗi FT có ít nhất 1 AC?
- [ ] Mọi FT có ID format đúng `FT-{MOD}-NNN`?
- [ ] Mọi AC có ID format đúng `AC-{MOD}-NNN-XX`?

**Consistency checks:**
- [ ] BR-IDs tham chiếu trong URS có trong BIZ-POLICY không?
- [ ] ENT-IDs tham chiếu có trong DATA-DICTIONARY không?

### 1b. Tạo VERIFY-P1 document

```markdown
# VERIFY-P1: {System} — {Module}

## Completeness Check

| Check | Status | Ghi chú |
|-------|--------|---------|
| Có User Stories | ✅/❌ | {N} US tìm thấy |
| Có Functional Requirements | ✅/❌ | {N} FT tìm thấy |
| Mọi FT có AC | ✅/❌ | {X}/{N} FTs có AC |
| BR-IDs hợp lệ | ✅/❌ | {M} BRs kiểm tra |

## Issues
{Danh sách issues nếu có}
```

---

## Phase 2 — Design Verification (P2 Verify)

### 2a. Load và verify MODSPEC vs URS

```
mc_load({ filePath: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md", layer: 3 })
mc_compare({
  source: "{SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md",
  target: "{SYSTEM}/P2-DESIGN/MODSPEC-{MOD}.md"
})
```

**Coverage checks:**
- [ ] Mỗi FT-ID trong URS có tương ứng trong MODSPEC?
- [ ] Mỗi AC-ID trong URS được implement bởi ít nhất 1 API-ID hoặc COMP-ID?

**Consistency checks:**
- [ ] BR rules trong MODSPEC khớp với BIZ-POLICY?
- [ ] Data types trong TBL specs nhất quán với DATA-DICTIONARY?
- [ ] API paths không trùng nhau?

**Conflict checks:**
- [ ] Không có FT trong URS bị thiếu trong MODSPEC?
- [ ] Không có API-ID trong MODSPEC không có FT-ID origin?

---

## Phase 3 — Test Verification (P3 Verify)

### 3a. Load và verify TEST vs MODSPEC + URS

```
mc_load({ filePath: "{SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md", layer: 3 })
```

**Coverage checks:**
- [ ] Mỗi AC-ID có ít nhất 1 TC-ID tương ứng?
- [ ] Mỗi API-ID có ít nhất 1 API test case?
- [ ] Coverage matrix đủ 100% ACs?

**Quality checks:**
- [ ] Mỗi TC có đủ: Preconditions, Steps, Pass criteria?
- [ ] Có ít nhất 1 UAT scenario per User Story?

---

## Phase 4 — Code Verification

### 4a. Kiểm tra code files

Với mỗi module có code:

```
Scan src/{sys}/{mod}/ → liệt kê files
```

**REQ-ID checks:**
```bash
# Mỗi .ts/.py file phải có REQ-ID comment
grep -r "REQ-ID\|@req-ids\|# REQ:" src/{sys}/{mod}/
```

**Coverage checks:**
- [ ] Mỗi API-ID trong MODSPEC có handler trong code?
- [ ] Mỗi TBL-ID trong MODSPEC có migration file?
- [ ] Mỗi TC-ID trong TEST file có test stub trong code?

**Structure checks:**
- [ ] Code có đủ layers: controller/router, service, repository?
- [ ] TypeScript compile không có errors?

### 4b. Code Completeness Checks

Kiểm tra chất lượng code output từ `/mcv3:code-gen`:

**Marker check:**
```bash
# Kiểm tra các markers để biết phần nào cần follow-up
grep -rn "// REVIEW:" src/{sys}/{mod}/
# → Liệt kê những chỗ specs mơ hồ, cần xác nhận với BA

grep -rn "// PENDING:" src/{sys}/{mod}/
# → Liệt kê những chỗ thiếu specs, cần bổ sung Phase 4/5

grep -rn "TODO\|FIXME" src/{sys}/{mod}/
# → Expected: 0 kết quả (TODOs không được dùng trong code-gen mới)
```

**BR Implementation check:**
- [ ] Mọi BR-ID trong MODSPEC có code implementation tương ứng (`// BR-{ID}` comment)?
- [ ] BR Validation type → có `if/throw BusinessRuleError` pattern?
- [ ] BR Calculation type → có function riêng trả về kết quả?
- [ ] BR Workflow type → có state machine hoặc switch/if chain?

**Real Query check:**
- [ ] Service methods có Prisma/SQLAlchemy queries thực (không phải stub)?
- [ ] Multi-step operations được wrap trong transaction?
- [ ] List APIs có filter, sort, pagination?

**Zod Schema check:**
- [ ] Mỗi TBL column có Zod rule tương ứng trong DTO?
- [ ] Constraints từ TBL spec (min, max, regex) được reflect trong Zod?

**Real Test check:**
- [ ] Test files có assertions cụ thể (không phải `expect(true).toBe(true)`)?
- [ ] faker.js/factory được dùng để tạo test data?
- [ ] Integration tests có DB setup/teardown?

**CI Pipeline check:**
- [ ] `.github/workflows/ci.yml` tồn tại?
- [ ] CI workflow có các steps: install → typecheck → lint → test?

### 4b.7: Verification Loop Results

Kiểm tra `/mcv3:code-gen` đã chạy **Phase 9 Verification Loop** chưa:

```bash
# Kiểm tra Final Report marker trong code
grep -rn "VERIFICATION REPORT\|COMPILE-ERROR\|TEST-FAIL\|SECURITY-WARNING" src/{sys}/{mod}/
```

**Verification Loop checks:**
- [ ] Có Final Report trong output của code-gen session?
- [ ] Compile check PASS (không có `// COMPILE-ERROR:` trong code)?
- [ ] Tests PASS (không có `// TEST-FAIL:` markers)?
- [ ] Security scan: zero CRITICAL (`// SECURITY-WARNING:` không phải CRITICAL)?
- [ ] Coverage đạt threshold (≥ 80% lines, ≥ 70% branches)?
- [ ] Integration consistency verified (không có missing method stubs)?
- [ ] Migration có rollback scripts?

**Nếu thiếu Verification Loop:**
```
⚠️ CẢNH BÁO: Code module {MOD} chưa qua Phase 9 Verification Loop.
   Các rủi ro:
   - Compile errors tiềm ẩn
   - Tests chưa được chạy
   - Security vulnerabilities chưa kiểm tra

   Đề xuất: Chạy lại /mcv3:code-gen với verification loop,
   hoặc chạy thủ công: tsc --noEmit && npx jest && npm run lint
```

---

## Phase 5 — End-to-End Traceability Matrix

### 5a. Build traceability matrix

```markdown
## TRACEABILITY MATRIX — {PROJECT} — {DATE}

| PROB | BR | US | FT | API | TBL | Code | TC | Status |
|------|----|----|-----|-----|-----|------|----|--------|
| PROB-001 | BR-INV-001 | US-INV-001 | FT-INV-001 | API-ERP-001 | TBL-ERP-001 | ✅ | TC-INV-001 | ✅ FULL |
| PROB-001 | BR-INV-002 | US-INV-001 | FT-INV-002 | API-ERP-002 | - | ✅ | TC-INV-003 | ✅ FULL |
| PROB-002 | BR-INV-003 | US-INV-002 | FT-INV-003 | - | TBL-ERP-002 | ⚠️ | - | ⚠️ GAP |
```

**Status values:**
- `✅ FULL` — Traceability đầy đủ từ PROB đến TC
- `⚠️ GAP` — Thiếu một hoặc nhiều link
- `❌ MISSING` — Không tìm thấy implementation

### 5b. Tổng hợp gaps

```markdown
## GAPS FOUND

### Critical Gaps (cần fix trước deploy)
- FT-INV-003: Không có TC tương ứng
- API-ERP-005: Không có code implementation

### Warnings (cần review)
- TC-INV-010: Không link về AC nào
- BR-INV-007: Trong URS nhưng không có trong MODSPEC

### Informational
- {N} items có traceability 100%
- {M} items cần bổ sung
```

---

## Phase 6 — Verification Report

### 6a. Tổng hợp kết quả

```markdown
# VERIFICATION REPORT — {PROJECT}

**Ngày:** {DATE}
**Phiên bản:** {VERSION}
**Verifier:** /mcv3:verify skill

---

## Executive Summary

| Metric | Giá trị | Status |
|--------|---------|--------|
| Tổng requirements (FTs) | {N} | - |
| FTs fully traced | {X} | {X/N × 100}% |
| ACs covered by TCs | {Y} | {Y/total × 100}% |
| APIs with code | {Z} | {Z/total × 100}% |
| Critical gaps | {G} | {✅ 0 / ❌ G gaps} |

**Overall status:** ✅ READY / ⚠️ NEEDS ATTENTION / ❌ NOT READY

---

## System Breakdown

### {SYSTEM-CODE}: {System Name}

| Module | P1 URS | P2 Design | P3 Test | Code | Status |
|--------|--------|----------|---------|------|--------|
| {MOD} | ✅ | ✅ | ✅ | ✅ | READY |
| {MOD2} | ✅ | ✅ | ⚠️ | ⚠️ | ATTENTION |

---

## Critical Issues (blocking deploy)
{Danh sách issues P0 cần fix}

## Warnings (should fix)
{Danh sách warnings P1}

## Recommendations
{Đề xuất cải thiện}

---

## Sign-off
- [ ] Tech Lead review: _______________
- [ ] QA Lead review: _______________
- [ ] Product Owner review: _______________
```

---

## Phase 7 — Save & Update Traceability

```
1. mc_save({
     filePath: "_VERIFY-CROSS/VERIFY-{SYS}-P1-{MOD}.md",
     documentType: "verify"
   })

2. mc_save({
     filePath: "_VERIFY-CROSS/VERIFY-{SYS}-P2-{MOD}.md",
     documentType: "verify"
   })

3. mc_save({
     filePath: "_VERIFY-CROSS/VERIFY-{SYS}-P3-{MOD}.md",
     documentType: "verify"
   })

4. mc_save({
     filePath: "_VERIFY-CROSS/traceability-matrix.md",
     documentType: "verify"
   })

5. mc_save({
     filePath: "_VERIFY-CROSS/verification-report.md",
     documentType: "verify"
   })

6. mc_traceability({
     action: "validate"  // Kiểm tra toàn bộ traceability links
   })

7. mc_checkpoint({
     label: "verify-complete",
     sessionSummary: "Verification: {N} FTs traced, {M} gaps, {G} critical",
     nextActions: [
       "Fix critical gaps nếu có",
       "Chạy /mcv3:deploy-ops khi READY"
     ]
   })
```

---

## Post-Gate

```
✅ VERIFY-CROSS folder có đầy đủ verify docs
✅ Traceability matrix đã build end-to-end
✅ Verification report đã tạo
✅ Critical gaps = 0 (hoặc acknowledged + accepted)
✅ Sign-off checklist được ghi nhận

→ Nếu ✅ READY:
   "✅ Verification hoàn thành!
   Tất cả {N} FTs traced. Không có critical gaps.
   Tiếp theo: /mcv3:deploy-ops để tạo deployment docs."

→ Nếu ⚠️ NEEDS ATTENTION:
   "⚠️ Verification có {M} warnings.
   Cần fix: [danh sách issues]
   Sau khi fix, chạy lại /mcv3:verify."

→ Nếu ❌ NOT READY:
   "❌ Verification failed với {G} critical gaps.
   Bắt buộc fix trước khi deploy:
   [danh sách critical issues]"
```

---

## Quy tắc Verification

```
END-TO-END: Trace từ Problem Statement → Test Case
CRITICAL-FIRST: Fix gaps ảnh hưởng core features trước
NO-ORPHAN: Không có TC không trace về AC/BR
NO-ORPHAN-CODE: Không có code không trace về FT/API spec
EVIDENCE-BASED: Mọi "PASS" phải có bằng chứng cụ thể
BLOCK-ON-CRITICAL: Critical gaps PHẢI fix trước deploy
```
