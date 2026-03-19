# MODULE SPEC: {{SYSTEM_CODE}} — {{MODULE_NAME}}
<!-- ============================================================
     ⭐ ĐẶC TẢ MODULE — FILE QUAN TRỌNG NHẤT TRONG BỘ TEMPLATE
     Chứa MỌI THỨ AI cần để code 1 module:
       Business Rules, Features, Data Schema, API, UI, Integration.
     AI chỉ cần đọc file này + Dependency Map → code được.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  URS-{MODULE}.md, ARCHITECTURE.md, DATA-MODEL.md, BIZ-POLICY
       Key IDs: FT-{MOD}-XXX, API-{MOD}-XXX, UI-{MOD}-XXX, TBL-{SYS}-XXX
       Output: TEST-{MODULE}.md, USER-GUIDE.md, source code
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Phase:** P2 — System Design
> **System:** {{SYS_CODE}}
> **Module:** {{MODULE_CODE}}
> **Input từ:** [REF: P1-REQUIREMENTS/URS-{{MODULE}}.md]
> **Output cho:** P3-QA-DOCS/TEST-{{MODULE}}.md, P3-QA-DOCS/USER-GUIDE.md
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP (AI: ĐỌC PHẦN NÀY TRƯỚC)

### Bắt buộc đọc:
- [REF: {{SYS_CODE}}/P2-DESIGN/ARCHITECTURE.md] — Kiến trúc, conventions, navigation
- [REF: {{SYS_CODE}}/P2-DESIGN/DATA-MODEL.md] — Schema toàn system
- [REF: _PROJECT/BIZ-POLICY/BIZ-POLICY-{{DOMAIN}}.md] — Business rules
- [REF: _PROJECT/DATA-DICTIONARY.md] — Terms & entities

### Nên đọc (khi có tích hợp):
- [REF: _PROJECT/PROJECT-ARCHITECTURE.md → INT-XXX] — Integration specs
- [REF: _SHARED-SERVICES/AUTH-SPEC.md] — Auth flow
- [REF: {{OTHER_SYS}}/P2-DESIGN/MODSPEC-{{OTHER_MODULE}}.md] — Module tích hợp

### Tài liệu sinh từ MODSPEC này:
- [OUTPUT → {{SYS_CODE}}/P3-QA-DOCS/TEST-{{MODULE}}.md] — Test spec
- [OUTPUT → {{SYS_CODE}}/P3-QA-DOCS/USER-GUIDE.md → Chapter {{MODULE}}] — User guide
- [OUTPUT → src/{{sys_code}}/{{module}}/] — Source code

---

## 1. MỤC TIÊU MODULE

**Mô tả:** {{MÔ_TẢ_MODULE — 2-3 câu}}

**Users chính:** {{DANH_SÁCH_USERS/ROLES}}

**Giải quyết:** [REF: PROJECT-OVERVIEW → PROB-{{XXX}}]

---

## 2. BUSINESS RULES (Trích từ BIZ-POLICY)

### 2.1. Validation Rules

| Mã | Quy tắc | Logic (pseudo-code) | Nguồn |
|----|---------|---------------------|-------|
| BR-{{DOM}}-001 | {{QUY_TẮC}} | `if (!condition) throw ValidationError("msg")` | [REF: BIZ-POLICY-{{DOM}} → BR-{{DOM}}-001] |

### 2.2. Calculation Rules

| Mã | Quy tắc | Công thức | Ví dụ |
|----|---------|----------|-------|
| BR-{{DOM}}-010 | {{QUY_TẮC}} | `result = a * b / 100` | {{VÍ_DỤ}} |

### 2.3. Workflow Rules

| Mã | Trạng thái | Transition | Actor | Condition |
|----|-----------|-----------|-------|----------|
| BR-{{DOM}}-020 | {{FROM}} → {{TO}} | {{ACTION}} | {{ROLE}} | {{CONDITION}} |

---

## 3. FEATURES (FT-XXX)

| Mã | Tên Feature | User Story | Mô tả | Priority |
|----|------------|-----------|-------|---------|
| FT-{{MOD}}-001 | {{TÊN}} | [REF: US-{{MOD}}-001] | {{MÔ_TẢ}} | Must |

---

## 4. DATA SCHEMA

### 4.1. Tables / Collections

```sql
-- TBL-{{SYS}}-001: {{TABLE_NAME}}
CREATE TABLE {{table_name}} (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    {{field}}   {{TYPE}} NOT NULL,  -- [REF: ENT-XXX.field]
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),

    CONSTRAINT {{constraint_name}} UNIQUE ({{fields}}),
    CONSTRAINT {{fk_name}} FOREIGN KEY ({{field}}) REFERENCES {{table}}(id)
);
-- Index:
CREATE INDEX idx_{{table}}_{{field}} ON {{table_name}}({{field}});
```

### 4.2. Data Relationships

```
{{TABLE_A}} 1:N {{TABLE_B}} (via {{FK_FIELD}})
{{TABLE_B}} N:N {{TABLE_C}} (via {{JUNCTION_TABLE}})
```

---

## 5. API ENDPOINTS (API-XXX)

### API-{{MOD}}-001: {{TÊN_ENDPOINT}}

| Mục | Giá trị |
|-----|--------|
| **Method** | GET / POST / PUT / DELETE / PATCH |
| **Path** | `/api/v1/{{resource}}/{id}` |
| **Auth** | Bearer JWT (Roles: {{ROLES}}) |
| **Feature** | [IMPLEMENTS: FT-{{MOD}}-001] |
| **Use Case** | [REF: UC-{{MOD}}-001-01] |

**Request:**
```json
{
  "{{field}}": "{{type}} — {{description}}"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "{{field}}": "{{value}}"
  }
}
```

**Error Responses:**
| Code | Khi nào | Response body |
|------|---------|--------------|
| 400 | Validation fail | `{"error": "{{BR-XXX}} violation", "field": "..."}` |
| 403 | Unauthorized role | `{"error": "Insufficient permissions"}` |
| 404 | Not found | `{"error": "{{RESOURCE}} not found"}` |

---

## 6. UI/UX (UI-XXX)

### UI-{{MOD}}-{{SCREEN}}: {{TÊN_MÀN_HÌNH}}

**Mô tả:** {{MÔ_TẢ_MÀN_HÌNH}}

**Components:**
- `{{Component}}`: {{MỤC_ĐÍCH}}

**User Flow:**
```
[{{SCREEN_A}}] → [{{ACTION}}] → [{{SCREEN_B}}]
```

**Validations hiển thị:**
- `{{field}}`: {{VALIDATION_MESSAGE}} ([REF: BR-{{DOM}}-001])

---

## 7. ROUTES & NAVIGATION

```
GET  /{{path}}              → {{Component}} (roles: {{ROLES}})
POST /{{path}}              → Create action
GET  /{{path}}/{id}         → Detail view
PUT  /{{path}}/{id}         → Edit action
DELETE /{{path}}/{id}       → Delete (roles: {{ADMIN_ROLES}})
```

---

## 8. INTEGRATION POINTS

| Mã | Tích hợp với | Phương thức | Dữ liệu | Timing |
|----|------------|------------|--------|--------|
| INT-{{SYS1}}-{{SYS2}}-001 | {{SYSTEM}} | REST / Event | {{DATA}} | Sync / Async |

---

## 9. ERROR HANDLING

| Error Code | Nguyên nhân | Xử lý | User message |
|-----------|------------|-------|-------------|
| ERR-{{MOD}}-001 | {{NGUYÊN_NHÂN}} | {{XỬ_LÝ}} | "{{USER_MSG}}" |
