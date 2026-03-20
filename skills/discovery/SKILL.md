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

## CHẾ ĐỘ VẬN HÀNH — Auto-Mode

Skill này chạy theo **Auto-Mode Protocol** (`knowledge/auto-mode-protocol.md`):
1. **Tự động hoàn toàn** — không dừng hỏi user giữa chừng
2. **Tự giải quyết vấn đề** — tham vấn docs + expert agents khi gặp thông tin mơ hồ
3. **Báo cáo sau khi xong** — tổng hợp outputs + decisions + metrics
4. **User review** — cập nhật nếu user có thay đổi, auto-apply với impact analysis
5. **Gợi ý bước tiếp** — `/mcv3:expert-panel`

**Lưu ý:** Discovery là skill có phỏng vấn adaptive — user cung cấp ý tưởng/vấn đề ban đầu, skill tự xử lý phân tích và tạo tài liệu mà không cần user confirm từng bước.

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
- Hỏi thêm bằng câu hỏi cụ thể hơn: "Bạn có thể cho ví dụ cụ thể không?"
- Nếu user liên tục trả lời ngắn/mơ hồ → tóm tắt những gì đã hiểu và xác nhận: "Tôi hiểu như thế này, có đúng không?"
- Đánh dấu phần chưa rõ là `[CẦN XÁC NHẬN]` và tiếp tục

**mc_init_project chưa chạy:**
- Báo user: "Cần khởi tạo project trước. Hãy cho tôi biết tên và slug của dự án để tôi gọi mc_init_project."

---

## Phase 0 — Pre-Gate

```
TRƯỚC KHI BẮT ĐẦU:
1. Gọi mc_status() để xác nhận project slug
2. Kiểm tra _PROJECT/PROJECT-OVERVIEW.md đã có chưa
   → Nếu có: tự chọn chế độ update (bổ sung thông tin vào docs hiện tại)
   → Nếu chưa: tiến hành phỏng vấn
3. Đọc references/project-overview-schema.md để nắm output format
4. Sau bước phỏng vấn Block 1, đọc references/scale-decision-matrix.md
   → Tự recommend pipeline variant phù hợp (Micro/Small/Medium/Large/Enterprise)
   → Ghi vào PROJECT-OVERVIEW: "Pipeline variant: [X], skip phases: [Y, Z]"
```

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
| app mobile, ứng dụng điện thoại, React Native, Flutter, iOS, Android | Mobile App | `interview-frameworks/mobile.md` |
| _(không rõ)_ | General | `interview-frameworks/general.md` |

**Đọc framework tương ứng** từ `references/interview-frameworks/` trước khi đặt câu hỏi.

### Bước 3: Phỏng vấn theo framework

Đặt câu hỏi theo thứ tự trong framework đã load. Quy tắc:

```
KHÔNG đặt nhiều câu hỏi cùng lúc — 1 câu/lần
KHÔNG dừng nếu user trả lời ngắn — hỏi sâu thêm
GHI CHÚ nội tâm: "Đây là PROB-001 hay BG-001?"
KHI USER NÓI "đủ rồi" hoặc im lặng → chuyển sang Phase 2
```

### Bước 4: Clarification

Sau khi phỏng vấn xong, tóm tắt lại và xác nhận:

> "Tôi đã hiểu được những điểm sau về dự án của bạn: [tóm tắt]. Có điểm nào tôi hiểu sai hoặc còn thiếu không?"

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

2. Validate:
   mc_validate({
     projectSlug: "...",
     filePath: "_PROJECT/PROJECT-OVERVIEW.md"
   })

3. Nếu có ERRORs → sửa ngay
4. Nếu chỉ có WARNINGs → tự quyết tiếp tục, ghi vào DECISION-LOG để user review sau

5. Lưu checkpoint:
   mc_checkpoint({
     projectSlug: "...",
     label: "sau-discovery",
     sessionSummary: "Hoàn thành Discovery — PROJECT-OVERVIEW.md với [X] PROB-IDs",
     nextActions: ["Chạy /mcv3:expert-panel để phân tích chuyên sâu"]
   })
```

---

## Phase 5 — Post-Gate

```
Kiểm tra trước khi thông báo hoàn thành:
✅ PROJECT-OVERVIEW.md đã saved
✅ Có ít nhất 1 PROB-ID
✅ Có ít nhất 1 GL-ID (mục tiêu)
✅ Có SC-IN (phạm vi trong)
✅ Validated không có ERRORs
✅ Checkpoint đã lưu

→ Nếu tất cả pass:
   Báo cáo hoàn thành theo Auto-Mode format (xem knowledge/auto-mode-protocol.md Phase 3)
→ Nếu thiếu:
   "⚠️ Discovery chưa hoàn chỉnh: [liệt kê những gì còn thiếu]"
```

---

## Quy tắc phỏng vấn

```
ADAPTIVE: Điều chỉnh câu hỏi theo câu trả lời trước
SIMPLE: Dùng ngôn ngữ đơn giản, tránh jargon kỹ thuật
FOCUSED: 1 câu hỏi/lần, không hỏi list dài
PATIENT: Cho user thời gian suy nghĩ
STRUCTURED: Ghi chú nội tâm → assign IDs
BILINGUAL: User có thể trả lời tiếng Việt hoặc tiếng Anh
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
