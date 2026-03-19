# DATA-MODEL: {{SYSTEM_NAME}}
<!-- ============================================================
     MÔ HÌNH DỮ LIỆU — Schema, ERD, Relationships cho 1 system.
     Tham chiếu DATA-DICTIONARY cho entities dùng chung.
     Module Spec trích subset tables liên quan.

     [MCV3-v3.1] DEPENDENCY MAP:
       Input:  DATA-DICTIONARY.md, ARCHITECTURE.md, URS-*.md
       Key IDs: TBL-{SYS}-XXX
       Output: MODSPEC-*.md trích các tables liên quan
       Update: Bởi /mcv3:tech-design skill
     ============================================================ -->

> **Phase:** P2 — System Design
> **System:** {{SYS_CODE}}
> **Input từ:** P1-REQUIREMENTS/*.md, _PROJECT/DATA-DICTIONARY.md
> **Ngày tạo:** {{CREATED_DATE}}
> **Phiên bản:** {{VERSION}}

---

## 📎 DEPENDENCY MAP

### Bắt buộc đọc trước:
- [REF: _PROJECT/DATA-DICTIONARY.md] — Entities & thuật ngữ chung
- [REF: ARCHITECTURE.md] — Kiến trúc system

### Output cho:
- [OUTPUT → MODSPEC-*.md] — Trích relevant tables

---

## 1. ERD OVERVIEW

```
┌──────────────┐     1:N     ┌─────────────────┐
│  {{TABLE_A}} │──────────→  │  {{TABLE_B}}    │
│  TBL-{{SYS}}-001 │         │  TBL-{{SYS}}-002│
└──────────────┘             └─────────────────┘
       │ N:N                           │
       ▼                               ▼
┌──────────────────────┐   ┌──────────────────┐
│  {{JUNCTION_TABLE}}  │   │  {{TABLE_C}}     │
│  TBL-{{SYS}}-003     │   │  TBL-{{SYS}}-004 │
└──────────────────────┘   └──────────────────┘
```

---

## 2. TABLE DEFINITIONS (TBL-XXX)

### TBL-{{SYS}}-001: {{table_name}}

**Mô tả:** {{MÔ_TẢ_TABLE}}
**Module sở hữu:** {{MODULE_CODE}}
**ENUM dùng:** [REF: ENUM-{{XXX}}]

```sql
CREATE TABLE {{table_name}} (
    -- Primary Key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Business fields
    {{field_name}}  {{DATA_TYPE}} NOT NULL,      -- {{DESCRIPTION}}
    {{field_name}}  {{DATA_TYPE}},               -- {{DESCRIPTION}}, nullable
    status          VARCHAR(50) NOT NULL,        -- [REF: ENUM-XXX] — xem DATA-DICTIONARY

    -- Audit fields
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE,    -- Soft delete

    -- Constraints
    CONSTRAINT uq_{{table}}_{{field}} UNIQUE ({{fields}}),
    CONSTRAINT fk_{{table}}_{{parent}} FOREIGN KEY ({{fk_field}})
        REFERENCES {{parent_table}}(id) ON DELETE {{CASCADE/RESTRICT}}
);

-- Performance indexes
CREATE INDEX idx_{{table}}_{{field}} ON {{table_name}}({{field}});
CREATE INDEX idx_{{table}}_status ON {{table_name}}(status) WHERE deleted_at IS NULL;
```

**Field notes:**
| Field | Ghi chú quan trọng |
|-------|-------------------|
| status | Values: {{LIST_FROM_ENUM}} — [REF: ENUM-{{XXX}}] |
| {{field}} | [REF: ENT-{{XXX}}.{{field}}] — shared entity field |

---

## 3. RELATIONSHIPS SUMMARY

| From | To | Type | Via | Cascade |
|------|-----|------|-----|---------|
| TBL-{{SYS}}-001 | TBL-{{SYS}}-002 | 1:N | {{fk_field}} | {{rule}} |
| TBL-{{SYS}}-002 | TBL-{{SYS}}-003 | N:N | {{junction}} | — |

---

## 4. DATA MIGRATION NOTES

| Version | Migration | Lý do |
|---------|----------|-------|
| 1.0.0 | Initial schema | Tạo mới |
| {{VER}} | {{MIGRATION}} | {{LÝ_DO}} |

---

## 5. SEED DATA

```sql
-- Seed dữ liệu mẫu/hệ thống (chạy khi deploy mới)
INSERT INTO {{table_name}} (id, {{fields}}) VALUES
  ('{{uuid}}', {{values}}),
  ('{{uuid}}', {{values}});
```
