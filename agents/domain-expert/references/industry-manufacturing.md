# Domain Knowledge — Sản xuất / Chế tạo (Manufacturing)

Knowledge base cho Domain Expert Agent khi detect ngành Sản xuất / Chế biến / Gia công.

---

## Từ khóa nhận dạng

`sản xuất`, `nhà máy`, `gia công`, `chế biến`, `BOM`, `MRP`, `công xưởng`,
`nguyên liệu`, `lệnh sản xuất`, `kiểm tra chất lượng`, `QC`, `kho thành phẩm`,
`lô hàng`, `ISO 9001`, `OEE`, `5S`, `Lean`, `khu công nghiệp`

---

## Core Modules hệ thống Manufacturing

### 1. BOM — Bill of Materials

```
Mô tả: Danh sách nguyên liệu/bán thành phẩm cần thiết để sản xuất 1 đơn vị thành phẩm.

Entities:
  - BOM: id, productId, version, effectiveDate, status (draft/active/obsolete)
  - BOMLine: bomId, componentId, quantity, unit, wasteRate%, alternativeComponentId
  - Component: id, code, name, type (raw/semi/finished), unitCost, leadTimeDays

Types of BOM:
  - Single-level BOM: thành phẩm → nguyên liệu trực tiếp
  - Multi-level BOM: thành phẩm → bán thành phẩm → nguyên liệu (dạng cây)
  - Phantom BOM: sub-assembly không lưu kho, dùng để tính toán

Lưu ý VN:
  - BOM cần match với định mức tiêu hao (Bộ Tài chính)
  - Waste rate cần track để khai báo thuế GTGT nguyên liệu
```

### 2. MRP — Material Requirements Planning

```
Mục đích: Tính toán nhu cầu nguyên liệu dựa trên đơn hàng và inventory.

Quy trình:
  1. Input: Sales Orders / Demand Forecast
  2. Explode BOM → tính nhu cầu nguyên liệu
  3. Check inventory on-hand + on-order
  4. Tạo Purchase Requests cho phần còn thiếu
  5. Schedule theo lead time

Output:
  - Purchase Requests (PR) → Purchase Orders (PO)
  - Work Orders (lệnh sản xuất) cho bán thành phẩm

Entities:
  - MRPRun: id, runDate, horizon (số ngày), status
  - PlannedOrder: mrpRunId, productId, qty, plannedStart, plannedEnd, type (purchase/manufacture)
```

### 3. Production Scheduling & Work Orders

```
Entities:
  - WorkOrder: id, productId, bomId, qty, plannedStart, plannedEnd,
               actualStart, actualEnd, status, workCenterId
  - WorkCenter: id, name, capacity (hours/day), costRate, machines[]
  - Operation: workOrderId, sequence, workCenterId, plannedHours, actualHours, status
  - ProductionStatus: draft | released | in_progress | completed | closed

Key features:
  - Gantt chart scheduling (visual)
  - Capacity planning (check workCenter overload)
  - Track actual vs planned time
  - Job card in/out cho công nhân
```

### 4. Quality Control

```
Entities:
  - InspectionPlan: productId, frequency (per lot / per N units), checkpoints[]
  - InspectionRecord: workOrderId, lotId, inspector, date, passed, failed, notes
  - NCR (Non-Conformance Report): id, productId, lotId, defectType, qty,
                                   disposition (rework/scrap/accept), rootCause
  - CAPA: ncrId, correctiveAction, preventiveAction, dueDate, status

Inspection types:
  - IQC (Incoming Quality Control): kiểm tra nguyên liệu đầu vào
  - IPQC (In-Process Quality Control): kiểm tra trong quá trình
  - FQC (Final Quality Control): kiểm tra thành phẩm trước xuất kho
  - OQC (Outgoing Quality Control): kiểm tra trước giao khách
```

### 5. Shop Floor Management

```
Entities:
  - Machine: id, name, workCenterId, type, status (running/idle/breakdown/maintenance)
  - DowntimeRecord: machineId, startTime, endTime, reason, category (planned/unplanned)
  - OEERecord: machineId, date, availability%, performance%, quality%, oee%

OEE Formula:
  OEE = Availability × Performance × Quality
  - Availability = Run Time / Planned Production Time
  - Performance = (Ideal Cycle Time × Actual Output) / Run Time
  - Quality = Good Output / Total Output
  World class OEE: > 85%

Downtime categories:
  - Planned: bảo dưỡng định kỳ, setup, cleaning
  - Unplanned: hỏng hóc, thiếu nguyên liệu, thiếu nhân công
```

---

## Standards & Compliance

### ISO 9001:2015

```
Document requirements:
  - Kiểm soát tài liệu (document control)
  - Kiểm soát hồ sơ (record control)
  - Internal audit procedure
  - Corrective action procedure
  - Risk management

Data tracking cần thiết:
  - Version control cho tài liệu kỹ thuật (BOM, drawing)
  - Lưu inspection records ít nhất 3-5 năm
  - NCR và CAPA phải có close-out date
```

### HACCP (Sản xuất thực phẩm)

```
Critical Control Points (CCP):
  - Kiểm soát nhiệt độ: nấu, làm lạnh, bảo quản
  - Kiểm soát vi sinh: vệ sinh thiết bị, nhân công
  - Kiểm soát dị vật: kim loại (metal detector), thủy tinh

VN regulations:
  - Nghị định 15/2018 về an toàn thực phẩm
  - Thông tư 24/2019 về điều kiện ATVSTP
  - Cơ sở sản xuất phải đăng ký với Cục ATVSTP hoặc Sở y tế
```

### SPC — Statistical Process Control

```
Control charts:
  - X-bar/R chart: kiểm soát trung bình và độ phân tán
  - P-chart: tỷ lệ lỗi
  - C-chart: số lỗi trên đơn vị

Capabilities:
  - Cpk > 1.33: process capable
  - 6-sigma: 3.4 defects per million opportunities
```

---

## Supply Chain & Procurement

### Vendor Management

```
Entities:
  - Vendor: id, name, code, type, rating, paymentTerms, leadTimeDays
  - VendorEvaluation: vendorId, period, qualityScore, deliveryScore, priceScore, total
  - PurchaseOrder: id, vendorId, items[], totalAmount, deliveryDate, status

Approved Vendor List (AVL):
  - Mỗi material cần ít nhất 2 approved vendors (backup)
  - Đánh giá vendor định kỳ (quarterly/yearly)
  - Rating tự động từ: on-time delivery%, quality rejection%
```

### Goods Receipt

```
Flow:
  PO → GRN (Goods Receipt Note) → IQC → Putaway to Warehouse

Entities:
  - GRN: id, poId, receivedDate, receivedBy, items[]
  - GRNItem: grnId, materialId, orderedQty, receivedQty, rejectedQty, lotNumber

Lot/Batch tracking:
  - Bắt buộc với: thực phẩm, dược phẩm, hóa chất
  - Mỗi lot có: lotNumber, expiryDate, supplierLot, receivedDate
  - Traceability: biết lot X được dùng trong work order nào
```

---

## Inventory (FIFO/LIFO/Weighted Average)

```
FIFO (First In First Out):
  - Bắt buộc với: thực phẩm, dược phẩm (FEFO — First Expire First Out)
  - Phổ biến nhất ở VN

LIFO (Last In First Out):
  - Ít dùng ở VN (không được chấp nhận theo VAS - Chuẩn mực KT VN)

Weighted Average:
  - Phổ biến nhất theo VAS
  - Giá bình quân = Tổng giá trị / Tổng số lượng

Physical vs Perpetual Inventory:
  - Perpetual: cập nhật realtime theo từng transaction
  - Physical count: kiểm kê định kỳ (tháng/quý/năm) để đối chiếu
```

---

## C/O — Certificate of Origin (Xuất khẩu)

```
Các loại C/O phổ biến:
  - Form A: xuất sang EU, Canada (GSP)
  - Form D: ASEAN (ATIGA)
  - Form E: ASEAN-China (ACFTA)
  - Form AJ: ASEAN-Japan (AJCEP)
  - Form VK: VN-Korea (VKFTA)

Điều kiện để được cấp C/O:
  - Tỷ lệ nguyên liệu nội địa (local content)
  - Hàng thực sự sản xuất tại VN
  - Đăng ký với phòng quản lý XNK Bộ Công Thương hoặc các tổ chức được ủy quyền

Impact đến software:
  - Cần track nguồn gốc nguyên liệu per-production-lot
  - Report: tỷ lệ local content per HS code
  - Lưu hồ sơ để đối chiếu khi audit
```

---

## Traceability (Recall Management)

```
Lot genealogy:
  - Biết lot thành phẩm X gồm: lot nguyên liệu nào, work order nào
  - Ngược lại: lot nguyên liệu Y đã vào thành phẩm nào → để recall

Database design:
  - Lot transaction table: lotId, transactionType, fromLotId[], toLotId[], qty, date
  - Dùng graph traversal để trace lot lineage

Recall procedure:
  - Identify affected lots → notify customers → quarantine inventory
  - System phải support: query "tất cả khách hàng nhận hàng từ lot X"
```

---

## Pitfalls phổ biến

```
⚠️ BOM không version-controlled:
   → Thay đổi BOM ảnh hưởng đến work orders đang chạy
   → Cần freeze BOM khi release work order

⚠️ Không track waste / scrap chính xác:
   → Inventory sai, cost tính sai, báo cáo thuế sai

⚠️ MRP chạy không có demand:
   → Phải có demand forecast hoặc sales order trước khi MRP

⚠️ Thiếu machine downtime tracking:
   → Không tính được OEE, không có data để cải tiến

⚠️ Không track lot cho nguyên liệu quan trọng:
   → Khi recall không biết sản phẩm nào bị ảnh hưởng
```

---

## Entities tổng hợp

```
Core: Product, Component, BOM, BOMLine, WorkCenter, Machine
Planning: SalesOrder, MRPRun, PlannedOrder, WorkOrder, Operation
Procurement: Vendor, PurchaseOrder, GRN, GRNItem
Inventory: StockLot, StockMove, Warehouse, Location
Quality: InspectionPlan, InspectionRecord, NCR, CAPA
Reporting: OEERecord, DowntimeRecord, ProductionKPI
```
