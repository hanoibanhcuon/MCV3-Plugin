# Interview Framework — Embedded / IoT / MCU Projects

## Khi nào dùng framework này

Load framework này khi user mô tả dự án có các dấu hiệu:
- Vi điều khiển, MCU, ESP32, STM32, Arduino, Raspberry Pi
- Firmware, embedded software
- IoT, cảm biến, sensor, thiết bị giám sát
- Smart home, smart farm, wearable
- Industrial automation, thiết bị công nghiệp
- Thiết bị y tế cầm tay, máy đo

---

## Nhóm 1: Hardware Platform

**H-01. MCU / Board đã chọn chưa?**
> "Bạn đã có phần cứng cụ thể chưa? Ví dụ ESP32, STM32, Arduino, hay đang ở giai đoạn chọn?"

*Nếu chưa chọn → hỏi thêm để gợi ý phù hợp:*

**H-02. Yêu cầu kết nối là gì?**
> "Thiết bị cần kết nối WiFi, Bluetooth, LoRa, hay chỉ kết nối dây (UART/RS485/CAN)?"

**H-03. Custom PCB hay dùng dev board có sẵn?**
> "Bạn sẽ thiết kế mạch riêng (custom PCB) hay dùng board dev có sẵn như ESP32 DevKit, Arduino Mega?"

*Dev board = prototype nhanh hơn, custom PCB = production, gọn hơn*

**H-04. Nguồn điện là gì?**
> "Thiết bị chạy bằng pin hay nguồn lưới điện? Nếu pin — loại pin gì, dung lượng bao nhiêu mAh?"

**H-05. Môi trường lắp đặt thế nào?**
> "Thiết bị đặt trong nhà hay ngoài trời? Có yêu cầu chống nước (IP rating), chịu nhiệt, chịu rung không?"

---

## Nhóm 2: Sensors & Actuators

**S-01. Cần đo/giám sát những gì?**
> "Những thông số nào bạn cần đo? (Nhiệt độ, độ ẩm, áp suất, ánh sáng, khí gas, vị trí GPS, ...?)"

*Ghi chú mỗi sensor: loại giao tiếp (I2C/SPI/UART/ADC), precision required*

**S-02. Cần điều khiển thiết bị nào?**
> "Bạn cần bật/tắt hay điều chỉnh thiết bị nào không? (Relay, motor, bơm, đèn, servo, van?)"

**S-03. Tần suất đọc dữ liệu?**
> "Cần đọc sensor bao lâu một lần? (Mỗi giây, mỗi phút, mỗi giờ?)"

*Tần suất ảnh hưởng lớn đến pin life và data volume*

**S-04. Có yêu cầu real-time không?**
> "Có tác vụ nào cần phản hồi ngay trong microsecond/millisecond không? Ví dụ điều khiển motor, đọc encoder?"

---

## Nhóm 3: Connectivity & Data Flow

**C-01. Data đi đâu sau khi đo?**
> "Sau khi đo được dữ liệu, bạn muốn làm gì với nó? Gửi lên server, lưu local, hiển thị màn hình, hay cả ba?"

**C-02. Cloud platform hay local server?**
> "Bạn có cloud platform ưa thích không? (AWS IoT, Google IoT Core, Azure, ThingsBoard, hay tự host?)"

**C-03. Giao thức truyền data?**
> "Bạn đã quyết định protocol chưa? MQTT, HTTP REST, WebSocket, hay chưa biết?"

**C-04. Kết nối liên tục hay periodic?**
> "Device cần kết nối 24/7 hay chỉ gửi data định kỳ rồi sleep?"

**C-05. Offline handling?**
> "Nếu mất internet, device nên làm gì với data đo được? Bỏ qua, lưu local rồi sync sau, hay continue operation?"

---

## Nhóm 4: Power & Battery

*(Hỏi nếu dùng pin)*

**P-01. Target battery life?**
> "Bạn mong muốn pin dùng được bao lâu mà không cần sạc? (1 ngày, 1 tuần, 1 tháng, 1 năm?)"

**P-02. Khả năng sạc?**
> "Sạc pin có khó không? (Thiết bị ở vùng sâu, cần năng lượng mặt trời, hay cắm điện thường xuyên?)"

**P-03. Nguồn năng lượng bổ sung?**
> "Có dùng solar panel, harvesting energy, hay nguồn dự phòng không?"

---

## Nhóm 5: Safety & Reliability

**R-01. Hậu quả khi thiết bị hỏng?**
> "Nếu thiết bị bị treo hoặc mất kết nối, hậu quả là gì? (Chỉ mất data, hay có nguy hiểm vật lý như máy bơm không tắt, lò không ngắt?)"

*Nếu có nguy hiểm vật lý → cần safety interlock design*

**R-02. Yêu cầu uptime?**
> "Thiết bị cần hoạt động liên tục không? Hay downtime 5-10 phút để reboot/update là chấp nhận được?"

**R-03. Remote update (OTA)?**
> "Sau khi deploy, bạn có thể vật lý tiếp cận thiết bị để cập nhật firmware không? Hay cần OTA qua mạng?"

**R-04. Chứng nhận/Tiêu chuẩn?**
> "Sản phẩm có cần đạt chứng nhận CE, FCC, hay tiêu chuẩn y tế (ISO 13485) không?"

---

## Nhóm 6: Scale & Production

**SC-01. Số lượng thiết bị?**
> "Bạn dự kiến làm bao nhiêu thiết bị? (1-10 prototype, 100 pilot, 1000+ production?)"

*Số lượng ảnh hưởng đến quyết định custom PCB vs dev board, batch flash process*

**SC-02. Ai setup thiết bị lần đầu?**
> "Ai sẽ cài đặt và cấu hình thiết bị? Kỹ thuật viên của bạn, hay end user tự làm?"

*End user setup → cần provisioning flow đơn giản (BLE app, AP mode)*

**SC-03. Timeline?**
> "Bạn cần prototype hoạt động trong bao lâu? Và bao giờ production?"

---

## Nhóm 7: UI & User Interaction

**U-01. Có màn hình không?**
> "Thiết bị có màn hình không? (OLED, LCD, e-ink, hay không có?)"

**U-02. User tương tác thế nào?**
> "User tương tác với thiết bị qua: nút bấm vật lý, app mobile, web dashboard, hay không cần tương tác (headless)?"

**U-03. Thông báo/alert?**
> "Cần thông báo khi có sự kiện không? (Buzzer, LED, push notification lên app, SMS, email?)"

---

## Gợi ý MCU theo use case

| Use Case | Gợi ý MCU | Lý do |
|----------|-----------|-------|
| WiFi IoT prototype | ESP32 | WiFi+BLE built-in, rẻ, community lớn |
| WiFi IoT production (power ok) | ESP32-S3 | Nhanh hơn, USB native, AI acceleration |
| Low power WiFi | ESP32-C3 | RISC-V, cheaper, lower power |
| BLE only, ultra low power | nRF52840 | Best-in-class BLE, Zephyr RTOS |
| LoRa, very long range | ESP32 + RA-02/SX1276 | WiFi+LoRa combo |
| Industrial, motor control | STM32F4/F7 | FPU, CAN, robust |
| Simple sensors, hobby | Arduino Mega/Nano | Dễ học, community rộng |
| Educational, USB HID | RP2040 | PIO, CircuitPython, cheap |
| Cellular IoT (LTE-M/NB-IoT) | ESP32 + SIM7080G | No WiFi needed, cellular |

---

## Red Flags cần explore thêm

- ⚠️ **"Cần real-time"** → Hỏi cụ thể: microsecond hay millisecond? Bare metal hay RTOS?
- ⚠️ **"Pin cần dùng 1 năm"** → Deep sleep architecture, nghiêm túc về power budget
- ⚠️ **"Ngoài trời, chống nước"** → IP67+, UV-resistant enclosure, wide temp range IC
- ⚠️ **"Thiết bị y tế"** → Compliance yêu cầu, risk classification, documentation nặng
- ⚠️ **"1000+ devices"** → OTA infrastructure, monitoring platform, batch provisioning
- ⚠️ **"Cần điều khiển motor công suất cao"** → Hardware safety interlock, không chỉ software

---

## Scope thường bị bỏ quên

Sau phỏng vấn, nhắc user về:

- **Factory reset**: Nút hold 5 giây → xóa config — bắt buộc cho sản phẩm
- **Diagnostic mode**: Cách debug khi thiết bị field gặp sự cố
- **Data export**: Cách lấy historical data ra (CSV download, USB mass storage)
- **Calibration**: Quy trình calibrate sensor field — đặc biệt với sensor đo lường
- **OTA infrastructure**: Backend server để push updates — thường bị bỏ qua
- **Mobile provisioning app**: Nếu end user setup — cần app iOS/Android hoặc web BLE
- **Timestamping**: RTC module cho accurate timestamp — không chỉ dùng millis()
