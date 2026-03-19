# Interview Framework — SaaS / B2B Software

## Ngữ cảnh áp dụng

Dùng khi dự án là sản phẩm SaaS, B2B platform, internal tool, hoặc bất kỳ phần mềm dạng subscription/service.

---

## Bộ câu hỏi Discovery

### NHÓM 1: Product & Market

1. > "Hãy mô tả sản phẩm bạn muốn xây dựng trong 2-3 câu, như đang pitch cho nhà đầu tư."

2. > "Khách hàng mục tiêu là ai? Công ty quy mô nào? Ngành nào?"

3. > "Vấn đề cụ thể nào của họ mà sản phẩm bạn giải quyết tốt hơn giải pháp hiện tại?"

4. > "Hiện tại khách hàng mục tiêu đang dùng gì để giải quyết vấn đề đó? (Excel, phần mềm khác, làm thủ công...)"

### NHÓM 2: Business Model

5. > "Mô hình pricing: per seat, per usage, flat fee, hay freemium?"

6. > "Kênh bán hàng: direct sales, partner, self-serve, hay kết hợp?"

7. > "MRR mục tiêu sau 12 tháng là bao nhiêu? Cần bao nhiêu khách hàng?"

8. > "Có khách hàng mẫu (design partner) nào sẵn sàng dùng thử không?"

### NHÓM 3: Product Scope

9. > "Core feature quan trọng nhất — nếu chỉ build được 1 thứ, đó là gì?"

10. > "Sản phẩm cần tích hợp với tools gì khách hàng đang dùng? (Slack, CRM, ERP, ...)"

11. > "Mobile app cần thiết không? Hay web app là đủ?"

12. > "Multi-tenant (nhiều công ty trên cùng 1 hệ thống) hay single-tenant (deploy riêng cho từng khách)?"

13. > "Compliance: có requirements về data residency, SOC2, ISO 27001 không?"

### NHÓM 4: Technical Context

14. > "Team tech hiện tại: AI sẽ code hay có developers? Stack ưa thích?"

15. > "MVP cần launch trong bao lâu? Milestone quan trọng nhất là gì?"

16. > "Budget: có constraints gì về chi phí infrastructure không?"

---

## Mapping → IDs

| Phát hiện | ID |
|-----------|-----|
| Giải pháp hiện tại quá phức tạp/đắt | PROB-001 |
| Không có tính năng cụ thể A | PROB-002 |
| Tích hợp với tools khác khó | PROB-003 |
| Thiếu analytics/reporting | PROB-004 |
| Onboarding mất thời gian | PROB-005 |
| Kinh doanh SaaS B2B | BG-BUS-001 |
| Market size / TAM | BG-BUS-002 |
| Tech stack đã chọn | BG-TECH-001 |
