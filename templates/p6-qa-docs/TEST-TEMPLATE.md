# TEST SPEC: {{SYSTEM_CODE}} — {{MODULE_NAME}}
<!-- ============================================================
     ĐẶC TẢ KIỂM THỬ — Derived từ Module Spec.
     1 file per module. Chứa: Test Cases + UAT Criteria.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  MODSPEC-{MODULE}.md, URS-{MODULE}.md
       Key IDs: TC-{MOD}-XXX, UAT-{MOD}-XXX
       Traceability: AC-XXX → TC-XXX
       Update: Bởi /mcv3:qa-docs skill
     ============================================================ -->

> **Phase:** P3 — QA & Docs
> **System:** {{SYS_CODE}}
> **Module:** {{MODULE_CODE}}
> **Derived from:** [REF: P2-DESIGN/MODSPEC-{{MODULE}}.md]
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Input:
- [REF: {{SYS_CODE}}/P2-DESIGN/MODSPEC-{{MODULE}}.md] — Features, API, Business Rules
- [REF: {{SYS_CODE}}/P1-REQUIREMENTS/URS-{{MODULE}}.md] — Acceptance Criteria

---

## 1. TEST COVERAGE MATRIX

| Acceptance Criteria | Test Case(s) | Loại test | Trạng thái |
|--------------------|-------------|----------|-----------|
| [REF: AC-{{MOD}}-001-01] | TC-{{MOD}}-001 | Unit | Pending |
| [REF: AC-{{MOD}}-001-02] | TC-{{MOD}}-002 | Integration | Pending |
| [REF: BR-{{DOM}}-001] | TC-{{MOD}}-003 | Unit | Pending |

---

## 2. TEST CASES

### TC-{{MOD}}-001: {{TÊN TEST CASE}}

| Mục | Nội dung |
|-----|---------|
| **Mã** | TC-{{MOD}}-001 |
| **Loại** | Unit / Integration / E2E |
| **Implements** | [VERIFIED-BY: AC-{{MOD}}-001-01] |
| **Priority** | P0 / P1 / P2 |

**Setup:**
```
// Dữ liệu test cần chuẩn bị
{{SETUP_STEPS}}
```

**Steps:**
| # | Action | Input | Expected Result |
|---|--------|-------|----------------|
| 1 | {{ACTION}} | `{{INPUT}}` | `{{EXPECTED}}` |
| 2 | {{ACTION}} | `{{INPUT}}` | `{{EXPECTED}}` |

**Teardown:** {{CLEANUP}}

**Pass criteria:** {{CRITERIA}}

---

### TC-{{MOD}}-002: {{TÊN TEST CASE}} — Error Case

**Trigger:** {{ĐIỀU_KIỆN_LỖI}}

| # | Action | Input | Expected Error |
|---|--------|-------|---------------|
| 1 | {{ACTION}} | `{{INVALID_INPUT}}` | HTTP 400: `"{{ERROR_MSG}}"` |

---

## 3. API TEST CASES

### API Test: {{ENDPOINT}}

```
POST /api/v1/{{resource}}
Authorization: Bearer {{test_token}}

# Happy path
Body: { "{{field}}": "{{valid_value}}" }
→ Expected: 201 { "success": true, "data": {...} }

# Validation fail
Body: { "{{field}}": null }
→ Expected: 400 { "error": "{{BR-XXX}}: {{MESSAGE}}" }

# Unauthorized
Header: (no token)
→ Expected: 401 { "error": "Unauthorized" }
```

---

## 4. UAT SCENARIOS (User Acceptance Test)

### UAT-{{MOD}}-001: {{TÊN_SCENARIO}}

| Mục | Nội dung |
|-----|---------|
| **Actor** | {{ROLE}} |
| **Precondition** | {{ĐIỀU_KIỆN}} |
| **Scenario** | {{MÔ_TẢ}} |
| **Expected outcome** | {{KẾT_QUẢ_MONG_MUỐN}} |
| **Sign-off by** | {{STAKEHOLDER}} |

---

## 5. PERFORMANCE TEST CRITERIA

| NFR ref | Scenario | Tool | Threshold | Pass? |
|---------|---------|------|----------|-------|
| [REF: NFR-001] | {{SCENARIO}} | k6 / JMeter | < {{N}}ms p95 | — |

---

## 6. TEST RESULTS LOG

| Run # | Ngày | Tổng | Pass | Fail | Ghi chú |
|-------|------|------|------|------|---------|
| 1 | {{DATE}} | {{N}} | {{N}} | {{N}} | {{NOTE}} |
