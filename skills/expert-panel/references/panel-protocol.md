# Expert Panel Protocol — Reference

## Mô tả

Giao thức chi tiết cho việc orchestrate Expert Panel — đảm bảo phân tích đa chiều và consensus building hiệu quả.

---

## Parallel Execution Pattern

### Cách spawn agents song song

```
Tốt: Spawn cả 3 agents cùng một lúc trong 1 message
Xấu: Spawn agent 1 → chờ → spawn agent 2 → chờ → spawn agent 3

Khi spawn parallel, mỗi agent nhận đầy đủ context:
  - PROJECT-OVERVIEW.md content (tóm tắt)
  - Nhiệm vụ cụ thể của agent đó
  - Output format mong muốn
  - Deadline/constraints nếu có
```

---

## Conflict Resolution Protocol

### Khi experts có ý kiến khác nhau

**Ví dụ:** Strategy nói "Cần build mobile app ngay", Finance nói "Mobile app tốn kém, ưu tiên web trước"

**Cách xử lý:**
```
1. Ghi lại cả 2 góc nhìn trong OPEN DEBATES
2. Trình bày trade-offs cho user: "Strategy nói X vì... Finance nói Y vì..."
3. Đề xuất framework quyết định, KHÔNG tự quyết định
4. User quyết định → ghi vào RESOLUTION section
```

**Không nên:**
- Chọn một bên và bỏ quan điểm kia
- Trung hòa hóa thành ý kiến mơ hồ
- Tự quyết định thay user

---

## Consensus Building Template

```markdown
## CONSENSUS — SESSION-{NNN}

### Điểm đồng thuận

| # | Nội dung | 3 agents đồng ý | Action trong Phase 3 |
|---|---------|----------------|---------------------|
| 1 | {đồng thuận 1} | ✅ ✅ ✅ | {cần làm gì} |
| 2 | {đồng thuận 2} | ✅ ✅ ✅ | {cần làm gì} |

### Điểm tranh luận

| # | Vấn đề | Strategy | Finance | Domain | Đề xuất giải quyết |
|---|--------|---------|---------|--------|-------------------|
| 1 | {vấn đề} | {quan điểm} | {quan điểm} | {quan điểm} | {cách quyết định} |

### Open Issues (Cần thêm thông tin)

| # | Câu hỏi | Ai cần trả lời | Ảnh hưởng đến |
|---|---------|--------------|--------------|
| 1 | {câu hỏi} | User / Stakeholder | {quyết định nào} |
```

---

## Session Numbering

```
SESSION-001: Expert Panel lần đầu (sau Discovery)
SESSION-002: Follow-up sau khi có thêm thông tin
SESSION-003: Update khi có thay đổi scope lớn

Mỗi session = 1 tập phân tích mới từ experts
Các sessions cộng dồn trong EXPERT-LOG.md
```

---

## Quality Gates cho EXPERT-LOG

Trước khi kết thúc Expert Panel, kiểm tra:

```
✅ Có đủ 3 expert analyses (strategy, finance, domain)
✅ Mỗi analysis có ít nhất 3 actionable insights
✅ Có CONSENSUS section với ít nhất 2 điểm đồng thuận
✅ Có OPEN ISSUES với câu hỏi cụ thể (không phải chung chung)
✅ Có clear recommendation cho Phase 3 (biz-docs)
```

---

## Expert Prompt Templates

### Strategy Expert Prompt

```
Bạn là Strategy Expert phân tích dự án [tên] trong ngành [ngành].

Dựa vào PROJECT-OVERVIEW.md sau đây:
[content]

Phân tích:
1. Business model viability
2. Competitive position
3. KPI framework phù hợp
4. Top 3 strategic recommendations

Format: Theo spec trong strategy-expert.md
```

### Finance Expert Prompt

```
Bạn là Finance Expert phân tích dự án [tên].

Dựa vào PROJECT-OVERVIEW.md:
[content]

Phân tích:
1. Cost estimate (development + operations)
2. Revenue model recommendation
3. ROI projection (3 năm)
4. Top financial risks

Format: Theo spec trong finance-expert.md
```

### Domain Expert Prompt

```
Bạn là Domain Expert ngành [ngành detect từ PROJECT-OVERVIEW].

Dựa vào PROJECT-OVERVIEW.md:
[content]

Phân tích:
1. Quy trình nghiệp vụ chuẩn ngành vs mô tả của user
2. Data entities cần có
3. Compliance requirements
4. Common pitfalls cần tránh
5. Features thường bị quên

Format: Theo spec trong domain-expert.md
```
