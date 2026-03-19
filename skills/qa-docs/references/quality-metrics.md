# Quality Metrics — QA Reference

## Định nghĩa Done (Definition of Done)

### Module Level
```
✅ Test Coverage: ≥ 80% branch coverage (unit tests)
✅ AC Coverage: 100% Acceptance Criteria có Test Case
✅ P0 Tests: 100% PASS
✅ P1 Tests: ≥ 95% PASS
✅ P2 Tests: ≥ 80% PASS
✅ UAT Sign-off: Product Owner đã approve
✅ No P0/P1 bugs open
```

### Phase Level (Phase 6 hoàn thành)
```
✅ Tất cả modules có TEST-{MOD}.md
✅ USER-GUIDE.md đã có chapter cho mỗi module
✅ ADMIN-GUIDE.md đã có section cho mỗi module
✅ Traceability matrix đã update AC → TC
```

---

## Key Quality Metrics

### 1. Test Coverage Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| AC Coverage | (AC có TC / Tổng AC) × 100 | 100% |
| Branch Coverage | (Branches tested / Tổng branches) × 100 | ≥ 80% |
| API Coverage | (APIs có test / Tổng APIs) × 100 | 100% |
| Feature Coverage | (FTs có ≥1 TC / Tổng FTs) × 100 | 100% |

### 2. Test Execution Metrics

| Metric | Formula | Ngưỡng |
|--------|---------|--------|
| Pass Rate | (Pass / Tổng) × 100 | ≥ 95% |
| Defect Density | Bugs / Story Points | < 2 bugs/SP |
| Reopen Rate | Reopened bugs / Tổng closed | < 5% |
| Mean Time to Detect | Thời gian avg tìm bug | Giảm dần |

### 3. Performance Benchmarks

| Metric | Ngưỡng tốt | Ngưỡng chấp nhận | Ngưỡng fail |
|--------|-----------|-----------------|------------|
| API p50 response | < 50ms | < 100ms | > 200ms |
| API p95 response | < 100ms | < 200ms | > 500ms |
| API p99 response | < 200ms | < 500ms | > 1000ms |
| Page load (FCP) | < 1s | < 2s | > 3s |
| Database query | < 10ms | < 50ms | > 100ms |

---

## Bug Severity Classification

| Severity | Định nghĩa | SLA Fix |
|----------|-----------|---------|
| **P0 — Critical** | System down / Data loss / Security breach | < 4 giờ |
| **P1 — Major** | Core feature broken, no workaround | < 24 giờ |
| **P2 — Moderate** | Feature partially broken, workaround exists | < 3 ngày |
| **P3 — Minor** | UI issues, nice-to-have | Next sprint |
| **P4 — Trivial** | Typos, cosmetic | Backlog |

---

## Quality Gates (Phase Transitions)

### Phase 5 → Phase 6 (Tech Design → QA Docs)
```
✅ Tất cả MODSPEC đã mc_validate PASS
✅ Tất cả APIs có đủ request/response spec
✅ Database schema có index đầy đủ
```

### Phase 6 → Phase 7 (QA Docs → Code Gen)
```
✅ Tất cả modules có TEST-{MOD}.md
✅ AC Coverage = 100%
✅ UAT scenarios viết xong (pending sign-off là OK)
```

### Phase 7 → Phase 8 (Code Gen → Verify)
```
✅ Generated code có REQ-ID comments
✅ Project structure khớp MODSPEC
✅ Không có compile errors
```

### Phase 8 — Deploy Gate
```
✅ P0 tests 100% PASS
✅ P1 tests ≥ 95% PASS
✅ UAT sign-off hoàn thành
✅ Performance tests meet NFR targets
✅ Security scan clean
✅ DEPLOY-OPS.md đã hoàn chỉnh
```

---

## Traceability Coverage Report

Format báo cáo traceability:

```markdown
## Traceability Coverage — {MODULE} — {DATE}

### Feature → Test Coverage
| FT-ID | Tên Feature | TC Count | Pass | Status |
|-------|------------|---------|------|--------|
| FT-INV-001 | Tạo phiếu nhập | 5 | 5 | ✅ |
| FT-INV-002 | Duyệt phiếu | 3 | 2 | ⚠️ 1 FAIL |

### AC → TC Mapping
| AC-ID | TC-ID(s) | Covered? |
|-------|---------|---------|
| AC-INV-001-01 | TC-INV-001, TC-INV-002 | ✅ |
| AC-INV-001-02 | TC-INV-003 | ✅ |
| AC-INV-002-01 | TC-INV-010 | ✅ |

### Summary
- Total ACs: {N}
- ACs with TCs: {M}
- Coverage: {M/N × 100}%
- Status: {PASS / FAIL (if < 100%)}
```

---

## Reporting Cadence

| Report | Tần suất | Audience |
|--------|---------|---------|
| Daily Test Run | Mỗi ngày (CI/CD) | Dev Team |
| Sprint QA Report | Cuối sprint | PM, Dev Lead |
| Phase Completion Report | Khi phase xong | Stakeholders |
| Pre-release Sign-off | Trước go-live | Product Owner, CTO |
