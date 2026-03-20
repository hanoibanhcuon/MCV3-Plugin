# AUTO-MODE PROTOCOL — Quy trình vận hành chung cho tất cả MCV3 Skills

## Nguyên tắc cốt lõi

- **Tự động hoàn toàn** — Skill chạy tự động từ đầu đến cuối, KHÔNG dừng giữa chừng hỏi user
- **Tự giải quyết vấn đề** — Khi gặp thông tin mơ hồ → tham vấn docs + expert agents → tự quyết → ghi lại
- **Báo cáo sau khi xong** — Tổng hợp outputs + decisions + metrics cho user review
- **Cập nhật theo feedback** — User review → auto-apply changes với impact analysis
- **Gợi ý bước tiếp** — Luôn kết thúc bằng `/mcv3:{next-skill}` recommendation

---

## Phase 1 — Auto Execute

### Cách chạy tự động

```
1. mc_status() → xác định project slug, phase hiện tại
2. mc_load tất cả docs liên quan (dùng Smart Context Layering phù hợp)
3. Xác định scope:
   - Multi-system → build order theo topological sort (orchestrator protocol)
   - Multi-module → dependency order (module nào phụ thuộc module nào)
4. Xử lý từng item theo order, mc_checkpoint sau mỗi unit lớn
5. mc_save + mc_validate sau mỗi output
```

### KHÔNG HỎI user giữa chừng về

- Lựa chọn module/domain/system → **tự chọn theo dependency order**
- Xác nhận trước khi tiếp tục → **tự tiếp tục**
- Tech stack confirm → **đọc từ PROJECT-OVERVIEW/PROJECT-ARCHITECTURE**
- Deployment info → **dùng defaults reasonable, ghi DECISION**
- Review trước khi save → **tự save, ghi DECISION nếu có uncertain items**
- Module tiếp theo → **tự chuyển theo order**

---

## Phase 2 — Self-Consult khi gặp vấn đề

### Khi nào tự tham vấn

- BR mơ hồ → load BIZ-POLICY + PROCESS + DATA-DICTIONARY → suy luận
- Technical ambiguity → tham vấn tech-expert perspective
- Domain question → tham vấn domain-expert với industry knowledge
- Conflict giữa requirements → tham vấn strategy-expert → chọn ưu tiên business value

### DECISION-LOG format

Ghi lại mọi quyết định không hiển nhiên:

```
DECISION-{NNN}:
Vấn đề: [mô tả vấn đề]
Context: [docs/sections đã tham khảo]
Experts tham vấn: [ai — tech-expert / domain-expert / strategy-expert]
Phương án chọn: [mô tả]
Lý do: [giải thích ngắn gọn]
Alternatives: [phương án khác đã reject + lý do]
Impact: [ảnh hưởng đến modules/docs nào]
Confidence: HIGH / MEDIUM / LOW
```

DECISION-LOG được ghi vào checkpoint sau mỗi phase lớn.

### Xử lý khi thiếu thông tin quan trọng

```
Nếu thiếu thông tin BLOCKING (không thể proceed):
  → Đánh dấu rõ phần đó với [CẦN XÁC NHẬN]
  → Tiếp tục với những phần có đủ thông tin
  → List trong báo cáo cuối: "📋 CẦN USER REVIEW: ..."

Nếu thiếu thông tin NON-BLOCKING:
  → Tự chọn giải pháp hợp lý nhất dựa trên context
  → Ghi DECISION với Confidence: MEDIUM
  → User có thể review và điều chỉnh sau
```

---

## Phase 3 — Completion Report

Format báo cáo chuẩn sau khi hoàn thành toàn bộ công việc:

```
═══════════════════════════════════════════════
📋 BÁO CÁO HOÀN THÀNH: /mcv3:{skill-name}
═══════════════════════════════════════════════

✅ ĐÃ HOÀN THÀNH:
- [output 1]: [path + mô tả ngắn]
- [output 2]: [path + mô tả ngắn]
...

⚠️ VẤN ĐỀ ĐÃ XỬ LÝ ({N} quyết định tự động):
1. DECISION-001: [tóm tắt vấn đề → giải pháp chọn]
   Confidence: HIGH | Expert: tech-expert
2. DECISION-002: [...]
   (Nếu không có: "Không có quyết định tự động cần review")

📋 CẦN USER REVIEW:
- [item 1]: [tại sao cần review — thường là Confidence: LOW]
- [item 2]: ...
(Nếu không có: "Không có mục cần review thêm")

📊 METRICS:
- Modules/domains xử lý: X
- IDs tạo mới: Y (BR: a, US: b, FT: c, API: d, TC: e, ...)
- Traceability coverage: Z%

🔜 BƯỚC TIẾP THEO:
→ /mcv3:{next-skill} — [mô tả ngắn gọn lý do]
[Nếu multi-system]: → {system tiếp theo}

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:{next-skill}
═══════════════════════════════════════════════
```

---

## OUTPUT DISPLAY PROTOCOL

**Quy tắc hiển thị output bắt buộc cho tất cả MCV3 Skills (trừ navigator):**

### Rule 1 — Save trước, tóm tắt sau

```
KHÔNG BAO GIỜ: Paste / hiển thị nội dung đầy đủ document lên chat
LUÔN LUÔN:    mc_save trước → chỉ show tóm tắt ngắn gọn sau
```

Ngay cả khi vừa tạo xong nội dung → `mc_save` ngay → **KHÔNG** dán toàn bộ markdown vào chat.

### Rule 2 — Format tóm tắt per document

Sau mỗi document được save thành công, show 1 block tóm tắt ngắn:

```
📄 Đã lưu: {SYS}/P1-REQUIREMENTS/URS-{MOD}.md
   → {N} User Stories (US-{MOD}-001 → US-{MOD}-{NNN})
   → {M} Functional Requirements (FT-{MOD}-001 → FT-{MOD}-{MMM})
   → {K} Acceptance Criteria
   → {J} Non-Functional Requirements
   ⚠️ {X} quyết định cần review (xem DECISION-LOG)
```

Điều chỉnh metrics theo loại document (API count, TC count, table count, ...).

### Rule 3 — Completion Report + User Options

Completion Report (Phase 3 format) LUÔN kết thúc bằng user options:

```
═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:{next-skill}
═══════════════════════════════════════════════
```

### Rule 4 — Khi user request xem chi tiết

```
User: "Xem URS-WH.md" / "Cho tôi xem phần API"
→ mc_load({ filePath: "...", layer: 2 })  ← Chỉ load sections chính, không full
→ Show phần user quan tâm: danh sách IDs, quyết định, metrics
→ KHÔNG dump toàn bộ file ra chat
→ Hỏi thêm nếu cần: "Bạn muốn xem section nào cụ thể?"
```

### Rule 5 — Khi user muốn thay đổi

```
User: "Thêm NFR về performance" / "Sửa BR-WH-003"
→ mc_impact_analysis nếu thay đổi ảnh hưởng nhiều docs
→ Cập nhật document, mc_save
→ Show diff tóm tắt: "Đã cập nhật: [list thay đổi ngắn gọn]"
→ KHÔNG show toàn bộ document sau khi sửa
```

### Rule 6 — Navigator exception

`/mcv3:status` (navigator skill) được phép hiển thị dashboard đầy đủ — đây là mục đích chính của skill này. Tất cả skills khác áp dụng Rules 1-5 đầy đủ.

---

## Phase 4 — User Review & Update

### Xử lý khi user phản hồi

**User đồng ý tất cả → tiếp tục bước tiếp theo.**

**User muốn thay đổi:**
```
1. Phân tích: thay đổi gì, scope ảnh hưởng
2. mc_impact_analysis({ elementId: "<ID thay đổi>" })
3. Tự cập nhật tất cả docs bị ảnh hưởng (không hỏi confirm từng doc)
4. mc_changelog ghi nhận thay đổi với CHG-ID
5. mc_validate sau khi update
6. Báo cáo lại: "Đã cập nhật {N} docs theo yêu cầu"
```

**User có câu hỏi → giải thích chi tiết + reference DECISION-LOG nếu liên quan.**

---

## Phase 5 — Next Step Suggestion

```
Sau khi hoàn thành, luôn gợi ý bước tiếp:
- Dựa vào mc_status → xác định phase tiếp theo trong pipeline
- Nếu multi-system: hệ thống nào cần làm tiếp (theo build order)
- Format: "/mcv3:{skill}" + 1 câu giải thích

Nếu project đã xong toàn bộ phases:
  → "🎉 Dự án đã hoàn thành pipeline MCV3!"
  → Gợi ý: /mcv3:evolve (thêm features) hoặc /mcv3:verify (re-verify)
```

---

## Quy tắc đặc biệt per skill

### Skills cần initial user input (nhận input 1 lần, chạy tự động sau đó)

| Skill | Input cần từ user | Sau khi nhận: |
|-------|------------------|---------------|
| `change-manager` | Mô tả thay đổi (what/why/scope) | Tự phân tích impact + cập nhật tất cả docs |
| `evolve` | Features mới muốn thêm | Tự phân tích dependencies + tạo evolution plan |
| `migrate` | Nội dung/source cần migrate | Tự convert + assign IDs + detect gaps |
| `discovery` | Ý tưởng dự án (mô tả vấn đề, goals) | Tự phỏng vấn adaptive + tạo PROJECT-OVERVIEW |
| `onboard` | User type (Developer/PM/Business) | Tự run tutorial phù hợp + gợi ý bước tiếp |

### Skills cần context detection (không hỏi — tự detect)

| Skill | Tự detect từ |
|-------|-------------|
| Module/domain nào → làm | BIZ-POLICY, URS, MODSPEC files available |
| Tech stack | PROJECT-OVERVIEW.md, _config.json |
| Project type (web/mobile/embedded) | MODSPEC, PROJECT-OVERVIEW |
| Deployment strategy | PROJECT-ARCHITECTURE.md, nếu không có → dùng defaults |
| Evolution scope | User message context + mc_list |
| Migration source type | Content paste/description từ user |

### Skills read-only (không tạo/sửa docs)

| Skill | Behavior |
|-------|---------|
| `navigator` | Chỉ hiển thị dashboard + gợi ý bước tiếp |

---

## Tóm tắt nhanh

```
LUÔN LUÔN:
  ✅ Tự chọn module/domain/order → dependency-based
  ✅ Tự detect tech stack, project type → từ docs có sẵn
  ✅ Tự quyết khi ambiguous → ghi DECISION-LOG
  ✅ mc_checkpoint sau mỗi unit lớn
  ✅ Báo cáo đầy đủ sau khi xong toàn bộ
  ✅ mc_save TRƯỚC khi show bất cứ thứ gì
  ✅ Chỉ show tóm tắt — tên file, metrics, decisions
  ✅ Kết thúc bằng user options [1]/[2]/[3]

KHÔNG BAO GIỜ:
  ❌ Hỏi "Bạn muốn làm module nào trước?"
  ❌ Hỏi "Confirm trước khi tiếp tục?"
  ❌ Hỏi "Bạn muốn thêm gì không?"
  ❌ Hỏi "Module tiếp theo?"
  ❌ Hỏi "Bắt đầu?"
  ❌ Hỏi "Tech stack đúng không?"
  ❌ Paste / dump toàn bộ nội dung document vào chat
  ❌ Show full markdown của document vừa tạo
```
