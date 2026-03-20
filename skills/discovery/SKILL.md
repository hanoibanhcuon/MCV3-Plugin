# Discovery Skill — `/mcv3:discovery`

## Mục đích

Dẫn dắt user qua **Phase 1: Discovery** — thu thập ý tưởng, phân tích vấn đề, xác định scope dự án.

**Output:** `_PROJECT/PROJECT-OVERVIEW.md` với đầy đủ PROB-XXX, BG-XXX, SC-XXX IDs.

---

## DEPENDENCY MAP

```
Requires: mc_init_project đã chạy (project slug sẵn sàng)
Produces: _PROJECT/PROJECT-OVERVIEW.md
Enables:  /mcv3:expert-panel (Phase 2)
Templates: templates/p1-discovery/PROJECT-OVERVIEW-TEMPLATE.md
References:
  - skills/discovery/references/interview-frameworks/{domain}.md
  - skills/discovery/references/project-overview-schema.md
  - skills/discovery/references/scale-decision-matrix.md
```

---

## CHẾ ĐỘ VẬN HÀNH — Smart Interview Mode

Discovery là skill đặc biệt — phải thu thập ý tưởng từ user vì không có sẵn trong `.mc-data`.
Khác với Auto-Mode thuần túy, Discovery dùng **Smart Interview** kết hợp tương tác và tự động:

### Phases TỰ ĐỘNG (không hỏi user):
- Phase 0a: Pre-Gate Check — kiểm tra status, load refs, detect ngành
- Phase 0b: Safety Checkpoint — lưu checkpoint trước phỏng vấn
- Phase 2: Phân tích & Assign IDs — tự tổng hợp từ câu trả lời
- Phase 3: Generate PROJECT-OVERVIEW — tự tạo tài liệu đầy đủ
- Phase 4: Save & Validate — save + validate + checkpoint

### Phase PHỎNG VẤN (tương tác theo blocks):
Phase 1 dùng **Block-based interview** — hỏi theo nhóm, không hỏi từng câu riêng lẻ:

- **Block 1** (Bắt buộc): Ý tưởng cơ bản
  → 3-5 câu cùng lúc: vấn đề cần giải quyết, giải pháp hình dung, người dùng chính, ngành nghề

- **Block 2** (Hỏi nếu Block 1 chưa đủ): Scope & Scale
  → Số hệ thống, quy mô team, timeline, budget, ràng buộc chính

- **Block 3** (Optional — chỉ hỏi khi cần thiết): Chi tiết kỹ thuật
  → Tech stack mong muốn, platforms (web/mobile/embedded), integrations

### Quy tắc Smart Interview:
- Tối đa 3 blocks — KHÔNG loop thêm sau đó
- Nếu user đã cung cấp đủ thông tin ngay từ đầu → bỏ qua blocks không cần thiết
- KHÔNG hỏi confirm chung chung ("Đúng không?", "Có gì thêm không?")
- Chỉ hỏi clarify khi phát hiện mâu thuẫn cụ thể trong câu trả lời
- Sau phỏng vấn → chạy tự động hoàn toàn → Completion Report

---

## SPEED OPTIMIZATION GUIDELINES

> Áp dụng các kỹ thuật dưới đây để giảm latency mà **không hy sinh quality**.

### Parallel MCP Calls

| Điểm tối ưu | Trước | Sau | Tiết kiệm |
|-------------|-------|-----|-----------|
| Phase 0a init | mc_status → mc_load(PROJECT-OVERVIEW) (2 sequential) | [mc_status ∥ mc_load(PROJECT-OVERVIEW layer:0)] — 1 round | ~1 round-trip |
| Phase 0b + 0a | mc_status → mc_load → mc_checkpoint (3 sequential) | [mc_status ∥ mc_load layer:0] → mc_checkpoint | ~1 round-trip |
| Phase 3 → Phase 4 | Đọc template → generate → mc_save (sequential) | Không thay đổi — discovery là linear, 1 file output | — |

### Quy tắc áp dụng

```
✅ Phase 0a parallel: Gộp mc_status + mc_load(PROJECT-OVERVIEW layer:0) vào 1 round
   → Dùng layer:0 để check xem file tồn tại không (nhanh)
   → Nếu tồn tại → load layer:3 riêng ở Phase 0a bước 2 (update mode)
   → Nếu chưa có → bỏ qua load, tiến hành phỏng vấn ngay
✅ Safety checkpoint (Phase 0b) chạy SAU Phase 0a (cần project slug từ mc_status)
✅ Phase 4 save: mc_save → mc_validate → mc_checkpoint (tuần tự bắt buộc)
   → mc_checkpoint cần kết quả validate để ghi sessionSummary chính xác
   → KHÔNG chạy parallel validate + checkpoint
✅ Discovery là skill 1-file-output → ít MCP calls → focus vào Phase 0a parallel
```

---

## Khi nào dùng skill này

- User vừa tạo dự án mới (`mc_init_project`)
- Muốn cập nhật/bổ sung thông tin Discovery
- Chưa có `_PROJECT/PROJECT-OVERVIEW.md`

---

## Error Recovery

**mc_save / mc_load thất bại:**
- Retry 1 lần với cùng parameters
- Nếu vẫn fail → báo user: "⚠️ Không thể lưu/đọc [file]. Kiểm tra MCP server còn chạy không."
- Lưu draft tạm vào checkpoint, tiếp tục session — lưu lại sau

**User input không rõ trong phỏng vấn:**
- Hỏi thêm bằng câu hỏi cụ thể hơn trong cùng block: "Bạn có thể cho ví dụ cụ thể không?"
- Nếu user liên tục trả lời ngắn/mơ hồ → đánh dấu `[CẦN XÁC NHẬN]`, tiếp tục với thông tin đã có
- KHÔNG tóm tắt và hỏi confirm chung: "Tôi hiểu như thế này, đúng không?" — vi phạm NO-CONFIRM rule

**mc_init_project chưa chạy:**
- Báo user: "Cần khởi tạo project trước. Hãy cho tôi biết tên và slug của dự án để tôi gọi mc_init_project."

**Prerequisites thiếu (RISK-008 — BLOCKING vs WARNING):**

| Prerequisite thiếu | Phân loại | Hành động bắt buộc |
|---------------------|-----------|---------------------|
| mc_init_project chưa chạy (project chưa tồn tại) | ❌ BLOCKING | DỪNG — không có `.mc-data/` để lưu. Gọi `mc_init_project` trước |
| Project slug không hợp lệ / mc_status lỗi | ❌ BLOCKING | DỪNG — xác nhận project slug với user |
| PROJECT-OVERVIEW.md đã tồn tại (chạy lại) | ⚠️ WARNING | Chuyển sang chế độ update — bổ sung thông tin vào docs hiện tại |

**Nguyên tắc phân loại:**
- **BLOCKING** = project chưa khởi tạo → không thể lưu bất kỳ output nào → DỪNG ngay
- **WARNING** = trạng thái cần chú ý nhưng có thể tiếp tục với điều chỉnh

---

## Phase 0a — Pre-Gate Check

```
TRƯỚC KHI BẮT ĐẦU:
// SPEED: Gộp mc_status + mc_load vào 1 round song song
1. PARALLEL (2 calls đồng thời — 1 round duy nhất):
   - mc_status()  → xác nhận project slug; nếu lỗi → ❌ BLOCKING: gọi mc_init_project trước
   - mc_load({ filePath: "_PROJECT/PROJECT-OVERVIEW.md", layer: 0 })  → check file tồn tại không

   → Nếu PROJECT-OVERVIEW.md NOT FOUND → chế độ tạo mới (tiến hành phỏng vấn)
   → Nếu tồn tại → chế độ update: load layer:3 để đọc nội dung hiện tại
2. Đọc references/project-overview-schema.md để nắm output format
4. Sau bước phỏng vấn Block 1, đọc references/scale-decision-matrix.md
   → Tự recommend pipeline variant phù hợp (Micro/Small/Medium/Large/Enterprise)
   → Ghi vào PROJECT-OVERVIEW: "Pipeline variant: [X], skip phases: [Y, Z]"

5. [MANDATORY] Scale Detection — Đếm số systems/modules từ user input:
   - Nếu user đề cập ≥ 3 systems rõ ràng → CHẾ ĐỘ LARGE PROJECT
     → Ghi log: "Large project detected: {N} systems — áp dụng per-system stakeholder analysis"
   - Nếu < 3 systems → Chế độ Standard, tiếp tục bình thường
```

---

## Phase 0b — Safety Checkpoint

Trước khi bắt đầu phỏng vấn, tự động lưu checkpoint để có thể resume nếu bị interrupt:

```
mc_checkpoint({
  projectSlug: "<slug>",
  label: "pre-discovery",
  sessionSummary: "Chuẩn bị chạy /mcv3:discovery — bắt đầu phỏng vấn khám phá dự án",
  nextActions: ["Tiếp tục /mcv3:discovery — Phase 1: Phỏng vấn Adaptive"]
})
```

→ "✅ Safety checkpoint đã lưu. Bắt đầu phỏng vấn..."

---

## Phase 1 — Phỏng vấn Adaptive

### Bước 1: Khởi động conversation

Bắt đầu bằng câu hỏi mở:

> "Hãy kể tôi nghe về ý tưởng/vấn đề bạn muốn giải quyết với phần mềm này. Đừng lo ngại chi tiết kỹ thuật — cứ mô tả như đang giải thích cho người không phải IT."

### Bước 2: Detect ngành kinh doanh

Dựa vào câu trả lời của user, detect ngành để load interview framework phù hợp:

| Từ khóa nhận dạng | Ngành | Framework |
|------------------|-------|----------|
| vận chuyển, hải quan, logistics, xuất nhập khẩu | Logistics/XNK | `interview-frameworks/logistics.md` |
| cửa hàng, bán lẻ, POS, inventory | Retail | `interview-frameworks/retail.md` |
| nhà hàng, quán, F&B, food | F&B | `interview-frameworks/fnb.md` |
| SaaS, subscription, cloud, API | SaaS | `interview-frameworks/saas.md` |
| bệnh viện, phòng khám, bác sĩ, BHYT, y tế | Healthcare | `interview-frameworks/healthcare.md` |
| fintech, ví điện tử, thanh toán, KYC, AML | Fintech | `interview-frameworks/fintech.md` |
| bán hàng online, TMĐT, marketplace, giỏ hàng | E-Commerce | `interview-frameworks/ecommerce.md` |
| bất động sản, BĐS, môi giới, căn hộ, sổ đỏ | Real Estate | `interview-frameworks/realestate.md` |
| IoT, embedded, ESP32, STM32, firmware, MCU, sensor, vi điều khiển, thiết bị nhúng | Embedded/IoT | `interview-frameworks/embedded.md` |
| app mobile, ứng dụng điện thoại, React Native, Flutter, iOS, Android, ứng dụng di động | Mobile App | `interview-frameworks/mobile.md` |
| _(không rõ)_ | General | `interview-frameworks/general.md` |

**Đọc framework tương ứng** từ `references/interview-frameworks/` trước khi đặt câu hỏi.

### Bước 3: Phỏng vấn theo blocks

Đặt câu hỏi theo BLOCK dựa vào framework đã load. Quy tắc:

```
HỎI THEO BLOCK — 3-5 câu hỏi liên quan gộp thành 1 lượt hỏi
SKIP BLOCK — nếu user đã cung cấp đủ thông tin cho block đó
TỐI ĐA 3 BLOCKS — không hỏi thêm sau block 3
GHI CHÚ nội tâm: "Đây là PROB-001 hay BG-001?" → assign ID ngay khi tổng hợp
```

Mẫu câu hỏi Block 1:
> "Để tôi có thể hiểu đúng dự án của bạn, xin hãy chia sẻ:
> - Vấn đề / pain point cụ thể bạn muốn giải quyết là gì?
> - Giải pháp bạn đang hình dung?
> - Ai sẽ là người dùng chính của hệ thống?
> - Ngành nghề / lĩnh vực hoạt động của công ty?"

### Bước 4: Tổng hợp & Clarify khi cần

Sau phỏng vấn, **tự tổng hợp** thông tin — KHÔNG hỏi confirm chung chung.

Chỉ hỏi clarify nếu phát hiện mâu thuẫn cụ thể trong câu trả lời:

> "Bạn đề cập đến [X] ở câu trả lời đầu nhưng sau đó nói [Y]. Bạn muốn ưu tiên hướng nào?"

Những điểm chưa rõ nhưng không mâu thuẫn → đánh dấu `[CẦN XÁC NHẬN]` và tiếp tục.

---

## Phase 2 — Phân tích & Assign IDs

Sau khi có đủ thông tin, phân tích và assign Formal IDs:

### ID Assignments

| ID | Loại | Ý nghĩa |
|----|------|---------|
| `PROB-001`, `PROB-002`, ... | Problem Statement | Vấn đề cụ thể cần giải quyết |
| `BG-BUS-001`, ... | Business Background | Bối cảnh kinh doanh |
| `BG-TECH-001`, ... | Tech Background | Bối cảnh kỹ thuật hiện tại |
| `SC-IN-001`, ... | Scope In | Phạm vi nằm trong dự án |
| `SC-OUT-001`, ... | Scope Out | Phạm vi nằm ngoài dự án |
| `GL-001`, ... | Goal | Mục tiêu cần đạt |
| `ST-001`, ... | Stakeholder | Bên liên quan |
| `CON-001`, ... | Constraint | Ràng buộc |

### Quy tắc assign

```
PROB: Mỗi vấn đề RIÊNG BIỆT = 1 ID (không gộp)
GL: Mỗi mục tiêu CÓ THỂ ĐO LƯỜNG = 1 ID
SC-IN: Mỗi tính năng/module lớn = 1 ID
SC-OUT: Explicitly exclude những gì user nói "không cần"
ST: Mỗi vai trò user khác nhau = 1 ID
```

---

## Phase 3 — Generate PROJECT-OVERVIEW.md

Tạo tài liệu dựa trên template `PROJECT-OVERVIEW-TEMPLATE.md`:

```
1. Đọc template: templates/p1-discovery/PROJECT-OVERVIEW-TEMPLATE.md
2. Điền đầy đủ thông tin từ phỏng vấn
3. Đảm bảo có đủ sections: Bối cảnh, Vấn đề, Mục tiêu, Phạm vi, Stakeholders, Ràng buộc
4. Mỗi item có Formal ID (PROB-XXX, BG-XXX, ...)
5. Thêm DEPENDENCY MAP section ở đầu
```

**Format mẫu cho mỗi section:**

```markdown
## VẤN ĐỀ CẦN GIẢI QUYẾT

### PROB-001: [Tên vấn đề ngắn gọn]
**Hiện trạng:** [Mô tả tình trạng hiện tại]
**Tác động:** [Hậu quả nếu không giải quyết]
**Mức độ:** Critical / High / Medium

### PROB-002: [Tên vấn đề khác]
...
```

---

## Phase 4 — Save & Validate

```
1. Lưu tài liệu:
   mc_save({
     projectSlug: "...",
     filePath: "_PROJECT/PROJECT-OVERVIEW.md",
     content: "...",
     documentType: "project-overview"
   })

2. [BẮT BUỘC] Validate:
   mc_validate({
     projectSlug: "...",
     filePath: "_PROJECT/PROJECT-OVERVIEW.md"
   })
   → Nếu có ERRORs → ❌ BLOCKING: sửa ngay trước khi tiếp tục
   → Nếu chỉ có WARNINGs → ghi vào DECISION-LOG, tiếp tục

3. [BẮT BUỘC] Kiểm tra Post-Gate required sections (RISK-001):
   → Nếu thiếu PROB-ID hoặc GL-ID hoặc SC-IN-ID → ❌ BLOCKING:
     "PROJECT-OVERVIEW thiếu [X] — không thể chuyển sang Expert Panel.
     Bổ sung thông tin và lưu lại."

4. [BẮT BUỘC] Lưu checkpoint:
   mc_checkpoint({
     projectSlug: "...",
     label: "sau-discovery",
     sessionSummary: "Hoàn thành Discovery — PROJECT-OVERVIEW.md với [X] PROB-IDs",
     nextActions: ["Chạy /mcv3:expert-panel để phân tích chuyên sâu"]
   })
```

---

## Pre-Completion Verification

Chạy TRƯỚC Completion Report (xem auto-mode-protocol.md Phase 2.5):

### Tầng 1 — Self-Verification

```
Format & IDs:
  ✓ Sections bắt buộc: Bối cảnh, Vấn đề, Mục tiêu, Phạm vi, Stakeholders, Ràng buộc, DEPENDENCY MAP
  ✓ ID format: PROB-NNN, GL-NNN, SC-IN-NNN, SC-OUT-NNN, ST-NNN, CON-NNN, BG-BUS-NNN, BG-TECH-NNN
  ✓ Không có placeholder: [CẦN XÁC NHẬN] phải có nội dung cụ thể thay thế
  ✓ Mỗi PROB-ID có: Hiện trạng + Tác động + Mức độ (Critical/High/Medium)

Content Quality:
  ✓ PROB-IDs mô tả vấn đề cụ thể, không chung chung ("vấn đề quản lý" → reject)
  ✓ GL-IDs có thể đo lường (có số liệu cụ thể, không phải "nhanh hơn")
  ✓ SC-IN và SC-OUT không overlap (cùng 1 feature không vừa IN vừa OUT)
  ✓ Pipeline variant đã ghi với lý do chọn
```

### Tầng 2 — Cross-Document

```
Discovery là skill đầu tiên — không có input docs để cross-verify.

Kiểm tra bổ sung:
  ✓ Project slug trong document khớp với slug trong mc_status
  ✓ Ngành nghề detect đúng (nếu có keyword rõ ràng trong user input)
```

### Tầng 3 — Quality Gate

```
✅ PROB ≥ 1, GL ≥ 1, SC-IN ≥ 1, ST ≥ 1
✅ Không có PROB-ID mô tả giải pháp thay vì vấn đề
   (ví dụ xấu: "PROB-001: Cần phần mềm quản lý" — đây là giải pháp, không phải vấn đề)
✅ mc_validate PASS (không có ERRORs)
✅ Pipeline variant đã ghi trong PROJECT-OVERVIEW
```

---

## Phase 5 — Post-Gate

```
[BẮT BUỘC RISK-004] Chạy Pre-Completion Verification (section ở trên) TRƯỚC khi show Completion Report.

Kiểm tra trước khi thông báo hoàn thành:
✅ PROJECT-OVERVIEW.md đã saved
✅ Có ít nhất 1 PROB-ID
✅ Có ít nhất 1 GL-ID (mục tiêu)
✅ Có SC-IN (phạm vi trong)
✅ Validated không có ERRORs
✅ Checkpoint đã lưu

→ Nếu tất cả pass — Dùng Completion Report format (auto-mode-protocol.md Phase 3):

═══════════════════════════════════════════════
📋 BÁO CÁO HOÀN THÀNH: /mcv3:discovery
═══════════════════════════════════════════════

✅ ĐÃ HOÀN THÀNH:
- _PROJECT/PROJECT-OVERVIEW.md:
   → {N} PROB-IDs (vấn đề cốt lõi)
   → {M} GL-IDs (mục tiêu)
   → {K} SC-IN-IDs (phạm vi dự án)
   → {J} ST-IDs (stakeholders)
   → Pipeline variant: {Micro/Small/Medium/Large/Enterprise}

⚠️ VẤN ĐỀ ĐÃ XỬ LÝ ({D} quyết định tự động):
(Nếu không có: "Không có quyết định tự động cần review")

📋 CẦN USER REVIEW:
(Nếu không có: "Không có mục cần review thêm")

📊 METRICS:
- IDs tạo mới: PROB: {N}, GL: {M}, SC-IN: {K}, ST: {J}
- Pipeline variant được chọn: {X}

🔜 BƯỚC TIẾP THEO:
→ /mcv3:expert-panel — Phân tích chuyên gia sâu về dự án

═══════════════════════════════════════════════
💬 BẠN MUỐN:
   [1] Xem chi tiết file nào? (cho biết tên file)
   [2] Có thay đổi gì không? (mô tả thay đổi)
   [3] OK, tiếp tục → /mcv3:expert-panel
═══════════════════════════════════════════════

→ Nếu thiếu:
   "⚠️ Discovery chưa hoàn chỉnh: [liệt kê những gì còn thiếu]"
```

---

## Inter-Phase Verification — Per-Transition Pre-Checks

> **Phân biệt với Pre-Completion Verification:** Section này kiểm tra nhanh GIỮA các internal phases (phòng tránh lỗi lan sang bước tiếp). Pre-Completion Verification chạy SAU KHI hoàn thành toàn bộ để chuẩn bị Completion Report.

### Sau Block Interview → trước Phase 2 (Phân tích):
- ✓ Có đủ thông tin để assign ít nhất 1 PROB-ID (không phải thông tin quá mơ hồ)
- ✓ Ngành nghề đã detect rõ (nếu mơ hồ: ghi DECISION, chọn "General", tiếp tục)
- ✓ Nếu Block 1 chưa đủ → chạy Block 2 trước khi chuyển Phase 2

### Sau Phase 2 → trước Phase 3 (Generate):
- ✓ PROB-IDs mô tả **vấn đề** thực tế (không phải giải pháp — ví dụ xấu: "Cần phần mềm X")
- ✓ GL-IDs có thể đo lường: số liệu hoặc trạng thái cụ thể (không phải "nhanh hơn", "tốt hơn")
- ✓ SC-IN và SC-OUT không overlap (cùng 1 feature không vừa IN vừa OUT)
- ✓ Nếu có mâu thuẫn trong user input → đã clarify hoặc ghi [CẦN XÁC NHẬN] với context cụ thể

### Sau Phase 3 → trước Phase 4 (Save):
- ✓ Tất cả sections bắt buộc có nội dung (Bối cảnh, Vấn đề, Mục tiêu, Phạm vi, Stakeholders, Ràng buộc)
- ✓ Pipeline variant đã ghi với lý do cụ thể (Micro/Small/Medium/Large/Enterprise)
- ✓ **Large project (3+ systems):** Systems list trong SC-IN có đủ tất cả systems user đề cập — không thiếu system nào, mỗi system có mô tả riêng (không gộp chung)
- ✓ **Large project:** Ít nhất 1 ST-ID per key stakeholder group — không chỉ 1 ST-ID chung cho dự án nhiều bên liên quan

### Output Readiness → `/mcv3:expert-panel`:
- ✓ Đủ thông tin để 3 expert agents phân tích (PROB + GL + SC-IN + ST đã có, không rỗng)
- ✓ Ngành nghề ghi rõ trong document (expert agents cần để load đúng industry knowledge)
- ✓ Không có mâu thuẫn chưa được giải quyết giữa PROB-IDs và SC-IN-IDs
- ✓ **Large project:** Mỗi system được mô tả đủ để expert agents có thể assess từng system độc lập

---

## Quy tắc phỏng vấn

```
ADAPTIVE:    Điều chỉnh block câu hỏi theo câu trả lời trước
SIMPLE:      Dùng ngôn ngữ đơn giản, tránh jargon kỹ thuật
BLOCK-BASED: Hỏi 3-5 câu liên quan cùng lúc thành 1 block
EFFICIENT:   Skip block nếu user đã cung cấp đủ thông tin
NO-CONFIRM:  KHÔNG hỏi "Đúng không?", "Có gì thêm không?" sau mỗi block
STRUCTURED:  Ghi chú nội tâm → assign IDs khi tổng hợp Phase 2
BILINGUAL:   User có thể trả lời tiếng Việt hoặc tiếng Anh
MAX-3-ROUNDS: Tối đa 3 blocks — không thêm vòng hỏi nào sau đó
```

---

## Ví dụ output tốt

```markdown
### PROB-001: Quản lý đơn hàng XNK thủ công, dễ sai sót

**Hiện trạng:** Nhân viên xuất nhập khẩu phải nhập liệu thủ công vào Excel,
dẫn đến sai số liệu và mất thời gian đối chiếu hàng ngày.

**Tác động:** Trung bình 2-3 giờ/ngày mất vào đối chiếu, và 5-10% đơn hàng
có lỗi số liệu cần sửa lại.

**Mức độ:** High
```
