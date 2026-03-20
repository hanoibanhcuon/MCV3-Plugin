# MCV3-DevKit — MasterCraft DevKit v3

[![GitHub release](https://img.shields.io/github/v/release/hanoibanhcuon/MCV3-Plugin)](https://github.com/hanoibanhcuon/MCV3-Plugin/releases)
[![GitHub stars](https://img.shields.io/github/stars/hanoibanhcuon/MCV3-Plugin?style=social)](https://github.com/hanoibanhcuon/MCV3-Plugin)
[![GitHub license](https://img.shields.io/github/license/hanoibanhcuon/MCV3-Plugin)](LICENSE)

> **Phiên bản:** 3.12.0 | **Cập nhật:** 2026-03-20

---

## MCV3-DevKit là gì?

**MasterCraft DevKit v3 (MCV3)** là plugin cho Claude Code giúp bạn biến ý tưởng thành phần mềm hoàn chỉnh — từ tài liệu nghiệp vụ, thiết kế kỹ thuật, đến code và kế hoạch triển khai — theo một quy trình chuẩn hóa, tự động.

Thay vì tự mình soạn tài liệu rời rạc, MCV3 dẫn bạn qua **8 bước** có logic rõ ràng: từ vấn đề kinh doanh → yêu cầu phần mềm → thiết kế → code → kiểm tra → triển khai. Mọi thứ đều có thể truy ngược nguồn gốc để kiểm tra tính nhất quán.

---

## Dành cho ai?

| Bạn là | MCV3 giúp gì |
|--------|--------------|
| **Developer / Tech Lead** | Sinh code, test, API specs từ tài liệu — không tốn thời gian viết boilerplate |
| **PM / BA** | Tạo User Stories, Business Rules có cấu trúc — dễ trình bày với stakeholder |
| **Business Owner** | Mô tả ý tưởng bằng ngôn ngữ tự nhiên → nhận bộ tài liệu hoàn chỉnh để bàn giao team |
| **Thành viên mới** | Dùng `/mcv3:onboard` để hiểu nhanh dự án và quy trình làm việc |

---

## Cách MCV3 làm việc

- **Chạy tự động** — MCV3 tự chọn thứ tự xử lý, tự quyết định khi gặp tình huống không rõ ràng, không dừng hỏi giữa chừng (ngoại trừ giai đoạn khám phá dự án cần input từ bạn)
- **Tự tư vấn** — Khi gặp vấn đề phức tạp, MCV3 tham vấn "hội đồng chuyên gia ảo" (domain expert, tech expert, finance expert...) rồi chọn phương án tốt nhất
- **Báo cáo tóm tắt** — Sau mỗi bước, MCV3 chỉ hiển thị tóm tắt ngắn (tên file đã tạo, quyết định quan trọng). Bạn có thể yêu cầu xem chi tiết bất kỳ file nào
- **Bạn review** — Đọc tóm tắt → đồng ý tiếp tục, hoặc mô tả thay đổi → MCV3 tự cập nhật
- **Gợi ý bước tiếp** — Sau mỗi bước MCV3 luôn gợi ý lệnh tiếp theo

---

## Workflow tổng quan

```mermaid
graph TD
    START{Bạn có dự án nào?} -->|Dự án MỚI| NEW_START
    START -->|Dự án CŨ| OLD_START

    subgraph WF1[DỰ ÁN MỚI]
    NEW_START[Mô tả ý tưởng] --> N1[discovery]
    N1 --> N2[expert-panel]
    N2 --> N3[biz-docs]
    N3 --> N4[requirements]
    N4 --> N5[tech-design]
    N5 --> N6[qa-docs]
    N6 --> N7[code-gen]
    N7 --> N8[verify]
    N8 --> N9[deploy-ops]
    N9 --> DONE1[Sẵn sàng triển khai]
    end

    subgraph WF2[DỰ ÁN ĐANG LÀM DỞ]
    OLD_START[Mô tả dự án hiện tại] --> O1[assess]
    O1 --> O2{Cần import docs cũ?}
    O2 -->|Có| O3[migrate]
    O2 -->|Không| O4[Remediation Plan]
    O3 --> O4
    O4 --> O5{Thiếu gì?}
    O5 -->|Thiếu docs| O6[Chạy skill tương ứng]
    O5 -->|Code lệch docs| O7[change-manager]
    O5 -->|Thiếu code| O8[code-gen]
    O6 --> O9[verify]
    O7 --> O9
    O8 --> O9
    O9 --> O10{Đạt mục tiêu?}
    O10 -->|Chưa| O4
    O10 -->|Rồi| DONE2[Tiếp tục phát triển]
    end

    style DONE1 fill:#4CAF50,color:#fff
    style DONE2 fill:#4CAF50,color:#fff
```

**Dự án MỚI** — mô tả ý tưởng → MCV3 tự động đi qua 8 bước → sẵn sàng triển khai (dự án nhỏ tự bỏ bước không cần thiết). **Dự án CŨ** — assess hiện trạng → tìm gaps → chạy theo Remediation Plan → verify → lặp đến khi đạt mục tiêu.

---

## 12 Ngành nghề hỗ trợ chuyên sâu

MCV3 hiểu đặc thù từng ngành (quy trình, quy định pháp lý, thuật ngữ chuyên môn):

| Ngành | Đặc thù nổi bật |
|-------|----------------|
| F&B | Menu, bếp, giao hàng, POS |
| Retail / Bán lẻ | POS, kho, omnichannel |
| Logistics / Xuất nhập khẩu | WMS, TMS, vận tải |
| E-Commerce | Giỏ hàng, thanh toán, marketplace |
| Healthcare / Y tế | EMR, BHYT, quy định KCB |
| Fintech | Core banking, AML, PCI-DSS |
| SaaS | Subscription, onboarding, churn |
| Manufacturing | BOM, MRP, ISO 9001 |
| Real Estate | Quản lý BĐS, Luật Đất đai 2024 |
| HR / HRM | Bảng lương, BHXH, Bộ Luật LĐ 2019 |
| Education | LMS, quản lý học sinh, Bộ GD&ĐT |
| Embedded / IoT | Firmware, MCU, giao thức IoT, smart home/farm |

---

## Yêu cầu

| Yêu cầu | Phiên bản |
|---------|----------|
| **Node.js** | v18 trở lên |
| **Claude Code** | Phiên bản mới nhất |
| **npm** | v8+ *(tự động có khi cài Node.js)* |

---

## Cài đặt

MCV3 cung cấp 3 cách cài đặt. Chọn cách phù hợp nhất với bạn.

### Cách 1: Clone repository (khuyến nghị)

Phù hợp khi bạn muốn cập nhật dễ dàng bằng `git pull`.

```bash
# 1. Clone plugin về máy
git clone https://github.com/hanoibanhcuon/MCV3-Plugin.git

# 2. Chạy installer — trỏ vào thư mục dự án của bạn
cd MCV3-Plugin
bash scripts/install.sh /đường/dẫn/đến/dự-án

# Windows (PowerShell):
.\scripts\install.ps1 -ProjectPath "C:\đường\dẫn\đến\dự-án"
```

### Cách 2: Tải file Release

Phù hợp khi bạn không cần git.

**Bước 1:** Tải file `mcv3-devkit-3.12.0.zip` từ trang [Releases](https://github.com/hanoibanhcuon/MCV3-Plugin/releases)

**Bước 2:** Giải nén và chạy installer:

```bash
# Mac / Linux / Git Bash:
unzip mcv3-devkit-3.12.0.zip
cd mcv3-devkit-3.12.0
bash scripts/install.sh /đường/dẫn/đến/dự-án
```

```powershell
# Windows (PowerShell):
Expand-Archive .\mcv3-devkit-3.12.0.zip -DestinationPath .
cd mcv3-devkit-3.12.0
.\scripts\install.ps1 -ProjectPath "C:\đường\dẫn\đến\dự-án"
```

### Cách 3: Cài thủ công (Plugin Mode)

Phù hợp khi bạn muốn kiểm soát hoàn toàn cấu hình.

**Bước 1:** Tải hoặc clone plugin về máy (như Cách 1 hoặc 2)

**Bước 2:** Copy thư mục plugin vào dự án:

```bash
# Copy toàn bộ plugin vào dự án, đặt tên mcv3-devkit/
cp -r MCV3-Plugin /đường/dẫn/đến/dự-án/mcv3-devkit
```

**Bước 3:** Tạo file `.mcp.json` tại root dự án:

```json
{
  "mcpServers": {
    "mcv3-project-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["mcv3-devkit/mcp-servers/project-memory/dist/index.js"],
      "env": {
        "MCV3_PROJECT_ROOT": "."
      }
    }
  }
}
```

**Bước 4:** Copy slash commands:

```bash
# Tạo thư mục commands
mkdir -p /đường/dẫn/đến/dự-án/.claude/commands/mcv3

# Copy command files
cp mcv3-devkit/.claude/commands/mcv3/*.md /đường/dẫn/đến/dự-án/.claude/commands/mcv3/
```

**Bước 5:** Build MCP Server:

```bash
cd /đường/dẫn/đến/dự-án/mcv3-devkit/mcp-servers/project-memory
npm install
npm run build
```

**Bước 6:** Mở dự án trong Claude Code và verify:

```
/mcv3:status
```

### Kiểm tra cài đặt

Sau khi cài bằng bất kỳ cách nào, mở thư mục dự án trong Claude Code và chạy:

```
/mcv3:status
```

Nếu hiển thị thông tin dự án hoặc "No projects found" → cài đặt thành công.

### Cấu trúc sau khi cài

```
dự-án-của-bạn/
├── .mcp.json                         ← Cấu hình MCP Server
├── .claude/
│   ├── CLAUDE.md                     ← Hướng dẫn Claude hiểu MCV3
│   ├── settings.json                 ← Hooks configuration
│   └── commands/mcv3/                ← Slash commands (/mcv3:*)
├── mcv3-devkit/                      ← Plugin (không cần sửa)
│   ├── .claude-plugin/plugin.json
│   ├── skills/
│   ├── agents/
│   ├── templates/
│   ├── scripts/
│   ├── hooks/
│   ├── knowledge/
│   └── mcp-servers/
└── .mc-data/                         ← Dữ liệu dự án (tự tạo khi chạy)
```

---

## Cập nhật

Khi có phiên bản mới:

```bash
# Nếu cài bằng git clone — pull rồi chạy lại installer:
cd MCV3-Plugin
git pull
bash scripts/install.sh /đường/dẫn/đến/dự-án --update

# Nếu cài bằng zip — tải bản mới rồi chạy lại installer:
bash scripts/install.sh /đường/dẫn/đến/dự-án --update
```

Dữ liệu dự án trong `.mc-data/` **giữ nguyên**, không bị ảnh hưởng khi update.

---

## Sử dụng MCV3 cho dự án MỚI

Bạn mô tả ý tưởng → MCV3 tự động phỏng vấn, tạo tài liệu, thiết kế, sinh code, kiểm tra, và lập kế hoạch triển khai. Bạn chỉ cần review kết quả và xác nhận hoặc yêu cầu thay đổi.

**Lệnh bắt đầu:** `/mcv3:discovery`

---

### Dự án nhỏ (tool nội bộ, landing page, CRUD đơn giản)

MCV3 tự nhận ra dự án nhỏ và **bỏ qua các bước không cần thiết** — chỉ làm: khám phá → thiết kế → code.

**Ví dụ 1 — Tool quản lý nội bộ:**
```
/mcv3:discovery

Làm tool quản lý công việc nội bộ cho nhóm 5 người. Cần: tạo task,
giao task cho thành viên, đặt deadline, theo dõi trạng thái (todo/doing/done).
Dùng web, không cần app mobile. Tech stack: Next.js + PostgreSQL.
```

**Ví dụ 2 — Landing page:**
```
/mcv3:discovery

Cần landing page giới thiệu sản phẩm SaaS mới. Có: hero section, tính năng,
pricing, FAQ, form đăng ký dùng thử. Kết nối Google Analytics và gửi email
xác nhận qua Resend. Design hiện đại, mobile-friendly.
```

---

### Dự án vừa (app mobile, web app, SaaS)

MCV3 chạy đủ các bước cần thiết, tự điều chỉnh theo quy mô.

**Ví dụ 1 — App quản lý nhà hàng:**
```
/mcv3:discovery

Làm app quản lý nhà hàng. Cần:
- Quản lý order: gọi món, thêm/sửa/hủy, tách/gộp bill
- Quản lý bàn: sơ đồ bàn, trạng thái bàn theo thời gian thực
- Quản lý kho nguyên liệu: nhập/xuất kho, cảnh báo tồn kho thấp
- Báo cáo doanh thu: theo ngày/tháng/món ăn
Có app iOS/Android cho nhân viên phục vụ và web dashboard cho quản lý.
Quy mô: 1 chi nhánh, ~50 bàn, 20 nhân viên.
```

**Ví dụ 2 — SaaS quản lý phòng khám:**
```
/mcv3:discovery

Xây dựng phần mềm SaaS quản lý phòng khám tư, cho nhiều phòng khám cùng dùng
(multi-tenant). Cần: đặt lịch khám online, hồ sơ bệnh nhân, kê đơn, thanh toán,
báo cáo. Tích hợp cổng BHYT. Có web cho bác sĩ và app mobile cho bệnh nhân.
```

---

### Dự án lớn (ERP, nhiều hệ thống, nhiều người dùng)

MCV3 chạy đầy đủ 8 bước, xử lý từng hệ thống theo đúng thứ tự dependency.

**Ví dụ 1 — ERP Logistics:**
```
/mcv3:discovery

Dự án ERP cho công ty logistics 200 nhân viên. Cần các hệ thống:
- WMS: quản lý kho, nhập/xuất, kiểm kê, barcode
- TMS: quản lý đơn vận chuyển, điều phối xe, tracking
- CRM: quản lý khách hàng, hợp đồng, báo giá
- Kế toán: doanh thu, chi phí, công nợ
Có web admin, app mobile cho tài xế và nhân viên kho. Tích hợp e-invoice.
```

**Ví dụ 2 — Hệ thống xuất nhập khẩu:**
```
/mcv3:discovery

Hệ thống quản lý xuất nhập khẩu cho công ty thương mại. Cần:
- Quản lý đơn hàng XNK: PO, SO, LC, bill of lading
- Theo dõi lô hàng: trạng thái thông quan, vận chuyển
- Quản lý nhà cung cấp và khách hàng nước ngoài
- Tính toán giá thành: thuế nhập khẩu, phí cảng, phí vận chuyển
- Báo cáo XNK theo tháng/quý cho ban lãnh đạo
```

---

## Sử dụng MCV3 cho dự án ĐANG LÀM DỞ

Nhận bàn giao code/docs cũ, hoặc dự án đã code một phần nhưng tài liệu chưa đồng bộ? MCV3 đánh giá hiện trạng, tìm ra thiếu sót, và đề xuất kế hoạch bổ sung.

**Lệnh bắt đầu:** `/mcv3:assess`

MCV3 sẽ: scan code + docs hiện có → phân tích gap → đề xuất bổ sung theo thứ tự ưu tiên → tự bổ sung khi bạn đồng ý.

---

### Trường hợp 1 — Có code, không có (hoặc thiếu) tài liệu

```
/mcv3:assess

Dự án backend API cho app thương mại điện tử, viết bằng NestJS + PostgreSQL.
Đã code được ~70% các module chính (auth, product, order, payment), nhưng
hầu như không có tài liệu. Cần đánh giá và tạo tài liệu để bàn giao team mới.
```

---

### Trường hợp 2 — Có docs cũ, code và docs chưa đồng bộ

```
/mcv3:assess

Dự án ERP logistics đang phát triển 8 tháng. Backend NestJS xong ~60%,
có docs Word từ năm ngoái nhưng code đã thay đổi nhiều so với specs ban đầu.
Cần đánh giá hiện trạng và lên kế hoạch hoàn thiện trong 3 tháng tới.
```

---

### Trường hợp 3 — Nhận bàn giao dự án từ team khác

```
/mcv3:assess

Vừa nhận bàn giao dự án quản lý trường học từ vendor cũ. Có: source code PHP
(Laravel), database MySQL, và file Excel mô tả chức năng. Cần hiểu hệ thống
và tiếp tục phát triển thêm module tuyển sinh và học phí online.
```

---

### Trường hợp 4 — Hệ thống production, muốn chuẩn hóa

```
/mcv3:assess

Hệ thống POS bán lẻ đang chạy production 2 năm, viết bằng Python/Django.
Không có tài liệu kỹ thuật, chỉ có wiki nội bộ rất sơ sài. Cần chuẩn hóa
tài liệu để scale team từ 2 lên 6 developer và thêm module loyalty/membership.
```

---

## Các lệnh chính

### Dự án MỚI — Pipeline 8 bước

| Lệnh | Giai đoạn | Khi nào dùng |
|------|-----------|--------------|
| `/mcv3:discovery` | Phase 1 | Bắt đầu dự án — mô tả ý tưởng, MCV3 phỏng vấn và tạo PROJECT-OVERVIEW |
| `/mcv3:expert-panel` | Phase 2 | Phân tích chuyên gia *(chạy tự động sau discovery)* |
| `/mcv3:biz-docs` | Phase 3 | Tạo tài liệu nghiệp vụ — Business Rules, quy trình, data dictionary *(tự động)* |
| `/mcv3:requirements` | Phase 4 | Viết User Stories, Functional Requirements, Acceptance Criteria *(tự động)* |
| `/mcv3:tech-design` | Phase 5 | Thiết kế API, database schema, kiến trúc hệ thống *(tự động)* |
| `/mcv3:qa-docs` | Phase 6 | Tạo test cases, UAT scenarios, User Guide, Admin Guide *(tự động)* |
| `/mcv3:code-gen` | Phase 7 | Sinh code từ tài liệu thiết kế — controller, service, repository, migration, CI |
| `/mcv3:verify` | Phase 8a | Kiểm tra traceability end-to-end: requirement → code → test |
| `/mcv3:deploy-ops` | Phase 8b | Tạo Deploy Plan, Go-Live Checklist, Rollback Plan, Monitoring |

### Dự án CŨ — Đánh giá & Lifecycle

| Lệnh | Khi nào dùng | Ví dụ prompt |
|------|-------------|--------------|
| `/mcv3:assess` | Dự án đang code dở, nhận bàn giao, hoặc muốn chuẩn hóa | "Dự án đang code 60%, cần đánh giá gap và lên kế hoạch" |
| `/mcv3:migrate` | Có docs cũ (Word/Confluence/code) cần convert vào MCV3 | "Có file Word đặc tả từ 2023, cần chuyển sang MCV3" |
| `/mcv3:change-manager` | Stakeholder yêu cầu thay đổi sau khi đã có tài liệu | "Muốn thay đổi quy trình tính giá vận chuyển" |
| `/mcv3:evolve` | Thêm tính năng/module/system mới vào dự án đang chạy | "Thêm module HR vào hệ thống ERP" |
| `/mcv3:onboard` | Thành viên mới cần hiểu dự án và quy trình | "Tôi mới vào team, cần hiểu dự án và cách làm việc" |

### Tiện ích — Dùng bất kỳ lúc nào

| Lệnh | Mục đích |
|------|---------|
| `/mcv3:status` | Xem tiến độ tổng quan — phase hiện tại, documents đã có, bước tiếp theo |

---

## Ví dụ prompt — Lệnh khác

### Thêm tính năng mới vào dự án đang chạy
```
/mcv3:evolve

Thêm module quản lý nhân sự (HR) vào hệ thống ERP hiện tại.
Cần: chấm công (máy chấm công + app), tính lương, đóng BHXH,
quản lý nghỉ phép. Kết nối với module kế toán đã có.
```

### Import tài liệu cũ
```
/mcv3:migrate

Có file Word "Đặc tả yêu cầu phần mềm v2.3.docx" và "Thiết kế DB.xlsx"
từ dự án cũ năm 2023. Cần convert vào MCV3 để tiếp tục phát triển.
```

### Kiểm tra tính nhất quán toàn dự án
```
/mcv3:verify

Kiểm tra toàn bộ dự án xem có thiếu sót gì không, đặc biệt giữa
tài liệu yêu cầu và code đã sinh.
```

### Quản lý thay đổi yêu cầu
```
/mcv3:change-manager

Stakeholder muốn thay đổi quy trình tính giá vận chuyển:
Trước đây tính theo km, nay muốn tính theo vùng (4 vùng địa lý).
Cần phân tích tác động và cập nhật tài liệu liên quan.
```

---

## Lưu ý quan trọng khi sử dụng

1. **Mô tả càng chi tiết → kết quả càng chính xác** — Đừng ngại viết dài, hãy mô tả đầy đủ nghiệp vụ, đối tượng người dùng, và các quy trình hiện tại
2. **Dự án nhỏ không cần chạy hết tất cả bước** — MCV3 tự điều chỉnh theo quy mô, bạn không cần lo
3. **MCV3 tự lưu file, bạn chỉ cần review tóm tắt** — Không cần copy-paste nội dung tài liệu
4. **Khi muốn thay đổi** — Dùng `/mcv3:change-manager` mô tả thay đổi, MCV3 tự cập nhật tất cả tài liệu liên quan và phân tích tác động
5. **Kiểm tra bất kỳ lúc nào** — `/mcv3:verify` để kiểm tra toàn bộ tính nhất quán của dự án
6. **Xem tiến độ bất kỳ lúc nào** — `/mcv3:status` để biết dự án đang ở bước nào

---

## Hỗ trợ

- **GitHub:** [github.com/hanoibanhcuon/MCV3-Plugin](https://github.com/hanoibanhcuon/MCV3-Plugin)
- **Issues:** [Báo lỗi / đề xuất](https://github.com/hanoibanhcuon/MCV3-Plugin/issues) — Mô tả lệnh đã chạy, tên dự án (slug), và lỗi gặp phải
- **Đóng góp:** Xem [CONTRIBUTING.md](CONTRIBUTING.md)
- **License:** [MIT](LICENSE)
