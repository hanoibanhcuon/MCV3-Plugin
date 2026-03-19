# Industry Knowledge — Logistics / XNK

## Quy trình chuẩn XNK Việt Nam

### Xuất khẩu (Export Flow)

```
Nhận đơn đặt hàng (PO từ buyer nước ngoài)
  → Xác nhận giá / Booking với hãng tàu/máy bay
  → Chuẩn bị hàng + đóng gói
  → Kiểm tra hàng hóa (nếu cần)
  → Khai báo hải quan xuất khẩu (qua VNACCS)
  → Lấy C/O (Certificate of Origin) nếu cần ưu đãi thuế
  → Giao hàng tại cảng / sân bay
  → Phát hành B/L (Bill of Lading) hoặc AWB
  → Gửi chứng từ cho buyer (Invoice, Packing List, B/L, C/O, ...)
  → Thanh toán (L/C / TT / D/P)
  → Kết thúc lô hàng
```

### Nhập khẩu (Import Flow)

```
Nhận thông báo hàng về (Notice of Arrival)
  → Chuẩn bị chứng từ nhập khẩu
  → Khai báo hải quan nhập khẩu (VNACCS)
  → Nộp thuế (Thuế NK + VAT + TTĐB nếu có)
  → Thông quan (phân luồng xanh/vàng/đỏ)
  → Nhận hàng tại cảng / kho CFS
  → Vận chuyển về kho
  → Kiểm tra chất lượng / số lượng
  → Nhập kho
```

---

## Data Entities Cốt lõi

### Chứng từ bắt buộc

| Chứng từ | Mô tả | Bắt buộc |
|---------|-------|---------|
| Commercial Invoice | Hóa đơn thương mại | Luôn luôn |
| Packing List | Danh sách đóng gói | Luôn luôn |
| B/L hoặc AWB | Vận đơn | Luôn luôn |
| C/O (Form AK, D, E...) | Chứng nhận xuất xứ | Khi cần ưu đãi |
| Inspection Certificate | Kiểm tra chất lượng | Theo yêu cầu buyer |
| Phytosanitary Certificate | Kiểm dịch thực vật | Hàng nông sản |
| Import License | Giấy phép NK | Hàng quản lý |

### Core Data Model

```
Shipment (Lô hàng)
  ├── shipper_id, consignee_id
  ├── origin_country, destination_country
  ├── incoterms (EXW, FOB, CIF, DDP...)
  ├── transport_mode (SEA, AIR, ROAD, MULTIMODAL)
  ├── cargo_type (GEN, HAZMAT, REEFER, OOG)
  ├── status (booking → clearance → delivered)
  └── documents[] → Document entity

Document
  ├── doc_type (invoice, bl, packing_list, co, ...)
  ├── doc_number
  ├── issue_date, expiry_date
  └── file_attachment

CustomsDeclaration (Tờ khai hải quan)
  ├── declaration_number
  ├── declaration_type (NK01a, XK01...)
  ├── hs_code_items[]
  ├── total_taxable_value
  ├── channel (green/yellow/red)
  └── status (pending → approved → released)

HSCodeItem
  ├── hs_code (8 chữ số)
  ├── description
  ├── quantity, unit
  ├── unit_price, total_value
  ├── import_tax_rate, vat_rate
  └── excise_tax_rate (nếu có)
```

---

## Compliance & Regulatory

| Quy định | Nội dung | Tác động |
|---------|---------|---------|
| VNACCS | Hệ thống khai báo hải quan điện tử | Phải tích hợp API VNACCS |
| Nghị định 08/2015 | Thủ tục hải quan | Quy trình thông quan |
| Thông tư 38/2015 | Kiểm tra thực tế hàng hóa | Phân luồng xanh/vàng/đỏ |
| Luật Hải quan 2014 | Khung pháp lý | Lưu trữ hồ sơ 5 năm |
| Nghị định 15/2018 | An toàn thực phẩm NK | Hàng thực phẩm |

---

## Common Pitfalls

- ⚠️ **HS Code sai** → Sai thuế suất → Phạt vi phạm hải quan
- ⚠️ **Không lưu trữ chứng từ đủ 5 năm** → Vi phạm luật hải quan
- ⚠️ **Quên tính phụ phí** (THC, D/O fee, CFS...) → Báo giá sai
- ⚠️ **Không track hàng nguy hiểm (HAZMAT)** riêng → An toàn + legal risk
- ⚠️ **Đồng tiền xuất hóa đơn ≠ đồng tiền khai hải quan** → Khai báo sai
- ⚠️ **Không có multi-currency** → Không tính được P&L thực

---

## Tính năng thường bị quên

- **Quản lý C/O** (chứng nhận xuất xứ): form type, validity period
- **Tra cứu HS Code** + tự động gợi ý thuế suất
- **Alert hạn chứng từ** (AWB, B/L, C/O đến hạn)
- **Track phụ phí** (nhiều loại: THC, CFS, BAF, CAF, ...)
- **Phân quyền theo công ty** (forwarder, shipper, buyer)
- **Integration ECUS** (phần mềm khai hải quan phổ biến ở VN)
