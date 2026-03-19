# Migration Checklist — MCV3

Checklist đầy đủ cho quá trình migrate dự án vào MCV3 format.

---

## Pre-Migration Checklist

### Chuẩn bị nguồn

```
□ Liệt kê tất cả tài liệu hiện có (Word, PDF, Confluence, emails)
□ Xác định stakeholder có thể answer gaps (PM, BA, Tech Lead)
□ Xác định scope migration: toàn bộ project hay 1 phase?
□ Backup tài liệu gốc trước khi bắt đầu
□ Estimate effort: ~1-2 giờ per 10 pages document
```

### Chuẩn bị MCV3

```
□ Plugin đã cài đặt và MCP Server đang chạy
□ mc_status() trả về thành công
□ Quyết định project slug và domain
□ Backup existing MCV3 project nếu import vào project có sẵn
```

---

## Phase 1: Discovery Documents → PROJECT-OVERVIEW

### Từ BRD (Business Requirements Document)

```
□ Extract: Executive Summary → PROJECT-OVERVIEW Section 1 (Background)
□ Extract: Business Objectives → PROJECT-OVERVIEW Section 2 (Goals)
□ Extract: Stakeholders list → PROJECT-OVERVIEW Section 3 (Actors)
□ Extract: Scope/Out-of-scope → PROJECT-OVERVIEW Section 4 (Scope)
□ Extract: Constraints → PROJECT-OVERVIEW Section 5 (Constraints)
□ Extract: Timeline → PROJECT-OVERVIEW Section 6 (Timeline)
□ Review: Điền gaps trong PROJECT-OVERVIEW template
□ Save: mc_save({ filePath: "_PROJECT/PROJECT-OVERVIEW.md" })
```

### Từ Meeting Minutes / Email threads

```
□ Identify: Problem statements (convert → PROB-IDs trong EXPERT-LOG)
□ Identify: Key decisions made
□ Identify: Open items / risks
□ Convert: Summary → PROJECT-OVERVIEW hoặc EXPERT-LOG
```

---

## Phase 2: Business Analysis → BIZ-POLICY + PROCESS

### Từ Policy Documents / SOP / Procedures

```
□ Đọc toàn bộ, highlight business rules (câu "phải", "không được", "khi... thì...")
□ Assign BR-IDs theo domain:
  □ WH (Warehouse): BR-WH-001...
  □ SALES: BR-SALES-001...
  □ FINANCE: BR-FIN-001...
□ Verify: Mỗi BR có đủ: Mô tả, Effective date, Exceptions
□ Identify: Rules implicitly stated nhưng chưa documented
□ Save: mc_save({ filePath: "_PROJECT/BIZ-POLICY/BIZ-POLICY-{DOM}.md" })
```

### Từ Process Maps / Flowcharts

```
□ Extract: AS-IS process steps
□ Identify: TO-BE process improvements (từ goals)
□ Map: Process steps → Use Cases (UC-IDs)
□ Identify: Decision points → business rules
□ Save: mc_save({ filePath: "_PROJECT/PROCESS/PROCESS-{DOM}.md" })
```

### Từ Data Models / ERD

```
□ Extract: Entities → DATA-DICTIONARY entries
□ Extract: Attributes → Entity fields với data types
□ Extract: Relationships → Entity relationships
□ Assign: ENT-IDs cho mỗi entity
□ Save: mc_save({ filePath: "_PROJECT/DATA-DICTIONARY.md" })
```

---

## Phase 3: Requirements → URS

### Từ FRD / Use Case Specifications

```
□ Identify: Actors/Roles (chuyển thành URS Actors section)
□ Convert: Use Cases → User Stories (US-IDs)
  □ UC Title → US "I want to..." format
  □ Main flow → Happy path AC
  □ Alternate flows → Additional ACs
  □ Exception flows → Error case ACs
□ Verify: Mỗi US có ít nhất 2 ACs
□ Extract: Non-Functional requirements → NFR-IDs
□ Save: mc_save({ filePath: "{SYS}/P1-REQUIREMENTS/URS-{MOD}.md" })
```

### Từ User Stories (informal)

```
□ Check format: "As a {role}, I want {action}, so that {benefit}"
□ Nếu thiếu: Infer từ context, mark as "Generated - needs verify"
□ Assign US-IDs theo module
□ Generate ACs: Dùng INVEST criteria để viết ACs
  □ Independent, Negotiable, Valuable, Estimable, Small, Testable
□ Add FT-IDs từ User Stories
□ Save
```

### Từ Excel Specs

```
□ Map columns:
  □ Feature ID → US-ID hoặc FT-ID
  □ Feature Name → US title
  □ Description → US body + AC
  □ Priority (High/Med/Low) → Must/Should/Could
  □ Notes → TBD / Deferred sections
□ Group by Module → separate URS files
□ Save mỗi module riêng
```

---

## Phase 4: Technical → MODSPEC

### Từ Technical Spec / Design Doc

```
□ Extract: Architecture diagram → PROJECT-ARCHITECTURE.md
□ Extract: API list → MODSPEC API section
  □ Map: Endpoint → API-ID (API-{SYS}-NNN)
  □ Fill: Input/Output schema từ spec
  □ Fill: Auth requirements
  □ Fill: Error codes
□ Extract: DB schema → MODSPEC DB section
  □ Map: Tables → TBL-IDs (TBL-{SYS}-NNN)
  □ Fill: Columns, types, constraints
  □ Note: Indexes, foreign keys
□ Extract: Business logic → Business Rules section
□ Save: mc_save({ filePath: "{SYS}/P2-DESIGN/MODSPEC-{MOD}.md" })
```

### Từ Swagger/OpenAPI

```
□ Parse: Endpoints → API-IDs
□ Extract: Request/Response schemas → MODSPEC
□ Extract: Security schemes → Auth section
□ Map: Tags → Modules
□ Generate: API-IDs sequentially
□ Note: "Migrated from Swagger {version}"
```

### Từ Source Code

```
□ Controllers → API endpoints
  □ Method + path → API-ID + API details
  □ Auth decorators → Auth requirements
□ Services → Business logic
  □ Methods → Functional Requirements (FT-IDs)
  □ Conditions/validations → Business Rules (BR-IDs)
□ DB Models/Migrations → Tables
  □ Schema → TBL-IDs + column definitions
□ Test files → Use Cases / AC hints
```

---

## Phase 5: Test Documentation → TEST

### Từ Excel Test Cases

```
□ Map:
  □ Test Case ID → TC-ID (TC-{MOD}-NNN)
  □ Test Description → TC title + steps
  □ Preconditions → Given
  □ Steps → When
  □ Expected Result → Then/Pass criteria
  □ Test type → TC type (functional/edge/negative)
□ Link: TC → AC coverage
□ Check: AC Coverage ≥ 80%
□ Save: mc_save({ filePath: "{SYS}/P3-QA-DOCS/TEST-{MOD}.md" })
```

---

## Validation Checklist

### Document completeness

```
□ BIZ-POLICY: Mỗi domain ít nhất 3 BRs
□ URS: Mỗi module ít nhất 3 USs
□ URS: Mỗi US ít nhất 2 ACs
□ URS: Ít nhất 3 NFRs (Performance, Security, Usability)
□ MODSPEC: Mỗi module ít nhất 1 API
□ Traceability: BR → US → FT mapping tồn tại
```

### ID consistency

```
□ Không có ID duplicate trong cùng project
□ ID format đúng: BR-{DOM}-NNN, US-{MOD}-NNN, ...
□ IDs sequential, không gap
□ Tất cả IDs đã register trong traceability
```

### Quality flags

```
□ Không còn placeholder "[TBD]" quan trọng (chỉ minor ones OK)
□ "Generated - needs verify" items đã được confirmed
□ Priority đã set cho tất cả items
□ Actor/Role đã identify cho tất cả User Stories
```

---

## Post-Migration Checklist

```
□ MIGRATION-REPORT.md đã tạo và complete
□ Tất cả "Review needed" items đã được addressed hoặc documented
□ mc_validate đã chạy và không có ERRORs (chỉ warnings OK)
□ Traceability matrix đã check (mc_traceability action: check)
□ Team đã review key documents (BIZ-POLICY, URS)
□ Checkpoint đã save
□ User biết next step: /mcv3:requirements hoặc /mcv3:tech-design
```

---

## Common Migration Issues & Solutions

### Issue 1: "Không biết priority của requirements"

```
Solution: Dùng MoSCoW method:
  Must have: Core business functions, compliance requirements
  Should have: Major efficiency improvements
  Could have: Nice to have, ease of use
  Won't have (this time): Out of scope

Default: Must (nếu requirement rõ ràng là core business)
```

### Issue 2: "Actor/Role không được mention trong source"

```
Solution: Infer từ context:
  - "Hệ thống cần" → System Actor
  - "Nhân viên sẽ" → Staff/Employee actor
  - "Khách hàng muốn" → Customer actor
  - Mark: "Actor: [inferred - needs confirm]"
```

### Issue 3: "Acceptance Criteria quá vague trong source"

```
Source: "Hệ thống phải validate dữ liệu đầu vào"
Solution: Generate specific ACs:
  AC: Given nhập số âm vào quantity field
      When submit form
      Then hiện lỗi "Số lượng phải > 0"
  Mark: "[Generated from: 'validate input' — needs verify]"
```

### Issue 4: "Requirements overlap/duplicate"

```
Solution:
  1. Merge overlapping requirements thành 1 US
  2. Ghi note: "Merged from: US-WH-003 + US-WH-007"
  3. Giữ cả hai ACs
```

### Issue 5: "Source có screenshots/diagrams không migrate được"

```
Solution:
  1. Mô tả diagram bằng text trong document
  2. Reference: "See original: {filename}"
  3. Recreate as text-based diagram (ASCII hoặc Mermaid)
```
