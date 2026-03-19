# KEY FACTS — {{SYSTEM_NAME}} (Layer 0 Cache)
<!-- ============================================================
     SMART CONTEXT LAYERING — LAYER 0
     File này luôn được load trước mọi tác vụ với system này.
     Giữ NHỎ — tối đa 500 bytes. Chỉ chứa facts thay đổi ít.

     MCV3 auto-update file này khi có thay đổi quan trọng.
     ============================================================ -->

## Dự án
- **Project:** {{PROJECT_NAME}} ({{PROJECT_CODE}})
- **Domain:** {{BUSINESS_DOMAIN}}
- **Phase hiện tại:** {{CURRENT_PHASE}}

## System {{SYS_CODE}}
- **Tech:** {{PRIMARY_TECH}} ({{VER}})
- **DB:** {{DB_TECH}} — {{DB_NAME}}
- **Auth:** JWT, roles: {{ROLES_LIST}}
- **Base URL:** `/api/v1/{{sys_code}}`

## Modules
| Code | Tên | Status |
|------|-----|--------|
| {{MOD}} | {{NAME}} | {{STATUS}} |

## Key Decisions (ADR)
- ADR-001: {{DECISION_SUMMARY}}

## Naming Conventions
- Tables: `snake_case` plural (vd: `sales_orders`)
- API: `kebab-case` REST (vd: `/sales-orders/{id}`)
- Enums: `UPPER_SNAKE_CASE`

## ID Ranges (tránh conflict)
- BR-{{DOM}}: hiện tại đến {{N}}
- US-{{MOD}}: hiện tại đến {{N}}
- FT-{{MOD}}: hiện tại đến {{N}}

## Last Updated
{{LAST_UPDATED}} bởi {{SKILL/AGENT}}
