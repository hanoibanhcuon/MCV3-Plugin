# Industry Knowledge — Embedded / MCU / IoT

## Tổng quan ngành

Hệ thống nhúng (Embedded Systems) là phần mềm chạy trực tiếp trên vi điều khiển (MCU) hoặc vi xử lý nhúng, thường với tài nguyên giới hạn (RAM KB-MB, Flash KB-MB). Điểm khác biệt so với phần mềm thông thường:

- **Không có OS đầy đủ** (hoặc dùng RTOS nhẹ như FreeRTOS, Zephyr)
- **Tài nguyên cực hạn**: RAM từ 2KB (Arduino Uno) đến 520KB (ESP32)
- **Real-time requirements**: Phản ứng trong microsecond đến millisecond
- **Hardware-software co-design**: Software phải biết phần cứng cụ thể
- **Safety-critical potential**: Thiết bị y tế, ô tô, công nghiệp — lỗi = nguy hiểm

---

## Platform Profiles

### ESP32 (Espressif)
- **Core:** Dual-core Xtensa LX6 @ 240MHz (hoặc LX7 trên ESP32-S3)
- **RAM:** 520KB SRAM + 4MB PSRAM (tùy variant)
- **Flash:** 4-16MB (thường 4MB)
- **Connectivity:** WiFi 802.11 b/g/n + BLE 4.2/5.0 (dual-mode)
- **Peripherals:** 18x ADC, 2x DAC, 2x I2C, 4x SPI, 3x UART, 16x PWM, Touch sensors
- **Frameworks:** ESP-IDF (native), Arduino (wrapper), MicroPython
- **Use cases:** IoT gateway, smart home, industrial monitoring, wearables
- **Power:** Active ~240mA, Light Sleep ~0.8mA, Deep Sleep ~10µA

### ESP8266 (Espressif — cũ hơn)
- **Core:** Single-core Tensilica L106 @ 80/160MHz
- **RAM:** 80KB DRAM + 32KB IRAM (thực tế ~50KB usable)
- **Connectivity:** WiFi only (không có BLE)
- **Lưu ý:** Bộ nhớ rất hạn chế, khó debug, nên prefer ESP32 cho dự án mới

### STM32F4 Series (ST Microelectronics)
- **Core:** ARM Cortex-M4 @ 168MHz + FPU
- **RAM:** 192KB SRAM (STM32F407)
- **Flash:** 1MB
- **Peripherals:** 3x 12-bit ADC (24 channels), 2x DAC, I2C, SPI, UART, CAN, USB OTG
- **Frameworks:** STM32 HAL/LL, STM32CubeMX, Arduino (hạn chế), Zephyr RTOS
- **Use cases:** Motor control, industrial automation, robotics, medical devices

### STM32F7 Series (ST Microelectronics — hiệu năng cao)
- **Core:** ARM Cortex-M7 @ 216MHz + FPU double precision
- **RAM:** 320KB SRAM + 16MB external SDRAM
- **Use cases:** Advanced motor control, image processing, audio DSP

### RP2040 (Raspberry Pi)
- **Core:** Dual-core ARM Cortex-M0+ @ 133MHz
- **RAM:** 264KB SRAM
- **Đặc biệt:** PIO (Programmable I/O) — hardware state machine có thể implement nhiều protocols
- **Frameworks:** Arduino, MicroPython, C SDK, CircuitPython
- **Use cases:** Prototype, education, DIY projects, USB HID devices

### Arduino Mega/Nano (AVR)
- **Core:** ATmega2560 (Mega) / ATmega328P (Nano) @ 16MHz
- **RAM:** 8KB (Mega) / 2KB (Nano) — **cực kỳ hạn chế**
- **Flash:** 256KB (Mega) / 32KB (Nano)
- **Lưu ý:** Phù hợp prototype và education, không phù hợp production IoT
- **Frameworks:** Arduino only (thực tế)

### nRF52840 (Nordic Semiconductor)
- **Core:** ARM Cortex-M4 @ 64MHz + FPU
- **RAM:** 256KB SRAM
- **Connectivity:** BLE 5.0 + IEEE 802.15.4 (ZigBee/Thread) + NFC
- **Đặc biệt:** Softdevice stack cho BLE (chia sẻ RAM với application)
- **Frameworks:** Zephyr RTOS (recommend), Nordic SDK
- **Use cases:** Wearables, beacons, mesh networks, BLE peripherals

---

## Development Frameworks

### Arduino Framework
```
setup()     — Chạy 1 lần khi khởi động
loop()      — Chạy lặp liên tục (polling model)
millis()    — Thời gian ms từ khi boot (dùng thay delay())
delay()     — BLOCKING — tránh dùng trong production
ISR()       — Interrupt Service Routine (ngắn, không blocking)
```
**Phù hợp:** Prototype, hobbyist, learning, simple sensors
**Không phù hợp:** Real-time strict, nhiều tasks song song

### ESP-IDF (Espressif IoT Development Framework)
- Dựa trên FreeRTOS
- API đầy đủ cho WiFi, BLE, NVS, OTA, MQTT
- `xTaskCreate()` thay vì loop()
- Event-driven architecture với `esp_event_loop`
- **Recommend cho production ESP32 projects**

### STM32 HAL (Hardware Abstraction Layer)
- HAL = Higher Abstraction (dễ port, chậm hơn)
- LL = Low Layer (gần hardware, nhanh hơn, khó port)
- STM32CubeMX: Tool generate init code từ GUI config

### Zephyr RTOS
- Linux Foundation project, open source
- Support 300+ boards
- Devicetree (`.dts`) configuration
- Strong security focus (cryptography, secure boot)
- **Recommend cho commercial, industrial, IoT product**

### MicroPython
- Python 3 subset chạy trên MCU
- REPL (interactive shell) trực tiếp trên device
- **Phù hợp:** Rapid prototype, educational
- **Không phù hợp:** Tight memory budget, real-time strict, production

---

## Common Patterns

### Sensor Reading
```
ADC (Analog): Đọc điện áp → convert sang giá trị (temperature, pressure, light)
  - Sampling rate: đọc bao nhiêu lần/giây
  - Oversampling: đọc nhiều lần rồi average để giảm noise

I2C Sensors (SHT30, BME280, MPU6050, ...):
  - Bus address (7-bit): tránh conflict khi nhiều sensor
  - Register map: đọc đúng register
  - Clock stretching: sensor cần thêm thời gian

SPI Sensors (MAX31856, ADS1256, ...):
  - CS (Chip Select) pin per device
  - CPOL/CPHA mode phải match sensor datasheet
  - Speed limit của sensor
```

### Actuator Control
```
PWM (servo, DC motor, LED dimming):
  - Frequency: 50Hz (servo), 1-20kHz (motor), 1kHz (LED)
  - Duty cycle: 0-100% → position/speed
  - Servo: 1000-2000µs pulse width

Relay control:
  - Debounce on mechanical relay (contact bounce)
  - Flyback diode bắt buộc với inductive loads
  - Optocoupler isolation cho high-voltage circuits

Stepper motor:
  - Step/direction interface (driver chip)
  - Acceleration/deceleration profile (smooth movement)
  - Home position và limit switches
```

### State Machine (FSM)
```
Pattern chuẩn cho embedded:
  States (enum) → Events (enum) → Transitions table → Actions (function pointers)

VD: Device FSM:
  INIT → (WIFI_CONNECTED) → CONNECTING → (AUTH_OK) → RUNNING
  RUNNING → (SENSOR_ERROR) → ERROR → (RESET) → INIT
  Mọi trạng thái đều xử lý watchdog reset
```

### Event-Driven Architecture
```
ISR (interrupt) → xQueueSendFromISR() → Task nhận queue → Xử lý
Không xử lý trong ISR — chỉ gửi signal/data vào queue
```

---

## Communication Protocols

### Wired Protocols
```
UART / Serial:
  - Asynchronous, 2 dây (TX/RX)
  - Baud rate: 9600, 115200 (phổ biến), 921600 (fast)
  - No clock sync → timing critical
  - Dùng cho: Debug console, GPS module, GSM modem

SPI:
  - Synchronous, 4 dây (MOSI, MISO, CLK, CS)
  - Full duplex, tốc độ cao (1-50MHz)
  - Dùng cho: Flash memory, ADC, DAC, display, SD card

I2C:
  - Synchronous, 2 dây (SDA, SCL)
  - Multi-master, multi-slave (địa chỉ 7-bit)
  - Tốc độ: 100kHz, 400kHz (fast), 1MHz (fast+)
  - Dùng cho: Sensor, EEPROM, RTC, OLED display

CAN Bus:
  - Differential bus, 2 dây (CAN-H, CAN-L)
  - Multi-master, collision detection
  - Tốc độ: 125kbps - 1Mbps
  - **Bắt buộc trong automotive**; phổ biến trong industrial
  - CAN FD: 8Mbps data rate

RS-485:
  - Half-duplex, multi-drop (32 nodes/segment)
  - Distance: 1200m
  - Dùng cho: Industrial Modbus RTU, HVAC, building automation
```

### Wireless Protocols
```
WiFi (IEEE 802.11):
  - Station mode: device kết nối AP
  - AP mode: device tạo hotspot
  - SmartConfig / BLE provisioning: config WiFi không cần màn hình

BLE (Bluetooth Low Energy):
  - GATT model: Service → Characteristic
  - Roles: Central (scanner) / Peripheral (advertiser)
  - Profiles: HID, Battery, Custom Service UUID
  - Connection interval: 7.5ms - 4s (trade-off power vs latency)
  - BLE Mesh: nhiều node, flood/relay

LoRa / LoRaWAN:
  - Long range (2-15km urban, 40km line-of-sight)
  - Low power, low data rate (0.3-50kbps)
  - Spreading factor: SF7 (fast, short range) - SF12 (slow, long range)
  - LoRaWAN: Network server (TTN, Chirpstack), ABP/OTAA activation
  - **Phù hợp: nông nghiệp, remote monitoring, smart meter**

MQTT (Protocol, không phải RF):
  - Publish/Subscribe trên TCP/IP (WiFi, Ethernet, LTE)
  - QoS 0 (at most once), 1 (at least once), 2 (exactly once)
  - Retained messages, Last Will and Testament
  - Broker: Mosquitto, EMQX, HiveMQ, AWS IoT Core

ZigBee / Thread (IEEE 802.15.4):
  - Mesh network, low power
  - ZigBee: Home automation, Philips Hue
  - Thread: Apple HomeKit, Google Home, Border Router to IP

NB-IoT / LTE-M:
  - Cellular IoT, SIM card
  - NB-IoT: Very low data rate, deep indoor penetration
  - LTE-M: Higher data rate, mobility support, VoLTE
  - **Phù hợp: smart meter, asset tracking, không có WiFi**
```

---

## Power Management

### Power Modes (ESP32 example)
```
Active mode:        ~240mA @ 3.3V = 792mW
Modem-sleep:        ~20mA  (CPU chạy, WiFi tắt giữa beacon)
Light sleep:        ~0.8mA (CPU pause, RAM retained, WiFi connected)
Deep sleep:         ~10µA  (CPU off, RTC + ULP chạy)
Hibernation:        ~5µA   (chỉ RTC timer, RAM mất)

Wake-up sources (deep sleep):
  - Timer: sau N giây
  - EXT0/EXT1: GPIO interrupt
  - Touch pad: capacitive touch
  - ULP program: kết quả tính toán của ULP co-processor
```

### Battery Life Calculation
```
Ví dụ: 2000mAh LiPo, đo đạc mỗi 10 phút:
  Active (30 giây): 200mA × 0.5min = 100mAh/day
  Deep sleep (9.5 phút): 0.01mA × 22.8h = 0.228mAh/day
  Total/day: ~100.2mAh
  Battery life: 2000 / 100.2 ≈ 20 ngày

Tối ưu: giảm active time, tăng sleep time
  → Dùng burst mode: đọc sensor, gửi data, ngủ ngay
```

### Power Supply Design
```
LDO vs Buck converter:
  - LDO (3.3V linear regulator): đơn giản, noise thấp, hiệu suất thấp nếu Vin cao
  - Buck (switching): hiệu suất cao (85-95%), noise radio frequency (cần filter)
  - LiPo 3.7V → Buck xuống 3.3V hoặc dùng LDO (0.4V drop OK)

Lưu ý:
  - Decoupling capacitor gần VCC pin MCU (100nF ceramic + 10µF electrolytic)
  - Battery fuel gauge (MAX17048) để đo % pin chính xác
  - Undervoltage lockout: tắt khi battery < 3.0V
```

---

## Business Rules đặc thù Embedded

### Watchdog Timer (BẮT BUỘC với production)
```
Hardware WDT: Built-in MCU, reset nếu không feed trong N ms
Software WDT: Application layer, detect hung tasks
Pattern:
  - Mỗi task "kick" WDT trong loop của mình
  - WDT aggregator: collect task heartbeats → feed HW WDT
  - Nếu task nào không kick → system reset → auto recovery
```

### Failsafe Behaviors
```
Nguyên tắc: "Fail safe, not fail operational"
  - WiFi mất kết nối → tiếp tục đo local, buffer data, retry
  - Sensor lỗi → dùng last known good value, cảnh báo
  - Flash đầy → xóa dữ liệu cũ nhất (circular buffer)
  - Power dip → save state trước khi mất nguồn (brown-out detection)
  - Firmware corrupt → rollback về version cũ (A/B partition)
```

### Safety Interlocks
```
Dùng cho: thiết bị gia nhiệt, motor, relay high power
  - Hardware interlock: OTP sensor cắt nguồn độc lập với MCU
  - Software interlock: max temperature check trước mỗi lần enable heater
  - Timeout: nếu không nhận command trong N giây → tắt actuator
  - Dual confirmation: cần 2 sensors đồng ý trước khi trigger action
```

### Sensor Calibration
```
Factory calibration:
  - Offset calibration: đo ở reference point, lưu offset vào NVS
  - Gain calibration: đo ở 2 reference points, tính scale factor
  - Temperature compensation: nhiệt độ ảnh hưởng đến nhiều sensors

Field calibration:
  - User-triggered: user đặt vào reference position và nhấn nút
  - Auto-calibration: phân tích distribution của samples theo thời gian
```

### Data Logging Strategies
```
Local logging (Flash/SD):
  - Circular buffer: ghi liên tục, overwrite cũ nhất khi đầy
  - Chunked write: gom nhiều samples, ghi 1 lần (giảm wear Flash)
  - Power-safe write: flush + sync trước khi sleep
  - Format: binary (compact) vs CSV (readable) vs JSON (flexible)

Upload strategies:
  - Real-time: gửi ngay khi có data (cần kết nối liên tục)
  - Batch upload: gom N records, gửi khi có WiFi
  - Store-and-forward: lưu local khi offline, sync khi online
```

---

## Storage

### NVS (Non-Volatile Storage — ESP-IDF)
```
Key-value store trong Flash, namespace support
Use cases:
  - Lưu WiFi credentials
  - Device configuration (thresholds, intervals)
  - Calibration data
  - Device ID, secret keys

Giới hạn:
  - Key max 15 ký tự
  - Value: int, uint, string, blob
  - Flash write cycles: 100,000 (sẽ wear out nếu ghi quá thường)
  - Không dùng NVS để log sensor data (wear out)
```

### SPIFFS / LittleFS
```
File system trên Flash (không cần SD card)
LittleFS > SPIFFS: power-safe write, better wear leveling

Use cases:
  - HTML/JS files cho web server nhúng
  - Config files (JSON)
  - Certificates (TLS)
  - Firmware update staging

Giới hạn:
  - Không support subdirectory (SPIFFS)
  - Không concurrent access
  - Size: thường partition 1-2MB
```

### SD Card
```
FAT32 filesystem (FatFs library)
Use cases:
  - Data logging dài hạn (GB+)
  - Audio playback (WAV, MP3)
  - Configuration file lớn

Lưu ý:
  - SPI mode (chậm) vs SDIO mode (nhanh, 4-bit)
  - f_sync() sau mỗi write để tránh corruption
  - Detect card removal hot-plug
  - Industrial SD card cho harsh environment
```

---

## VN Context — Ứng dụng phổ biến tại Việt Nam

### IoT Nông nghiệp
```
Cảm biến:
  - Độ ẩm đất: capacitive (ít drift hơn resistive)
  - Nhiệt độ/độ ẩm không khí: SHT30, DHT22
  - Ánh sáng: BH1750, TSL2561
  - pH đất: cần calibration thường xuyên
  - EC (Electrical Conductivity): độ dinh dưỡng đất

Connectivity:
  - LoRa: vùng nông thôn, đồng ruộng xa WiFi
  - NB-IoT: không cần gateway, roaming network
  - WiFi: nhà kính, nhà màng gần điện

Power:
  - Solar panel + LiPo 18650
  - Deep sleep 99% thời gian (đo mỗi 15-30 phút)
```

### Smart Home / Smart Building
```
Protocols phổ biến tại VN:
  - WiFi (Tuya, ESP32) — rẻ, phổ biến
  - ZigBee (Xiaomi, Aqara) — mesh, low power
  - Z-Wave (ít phổ biến hơn ở VN)
  - BLE (Bluetooth) — mobile control, keylock

Local vs Cloud control:
  - Cloud-dependent (Tuya, Alexa) — dễ setup, mất internet = mất control
  - Local (Home Assistant, MQTT Mosquitto) — tự chủ, cần setup server
```

### Thiết bị Y tế Cầm tay
```
Regulatory:
  - TCVN/ISO 13485: Quality Management for Medical Devices
  - IEC 62304: Software lifecycle for medical device software
  - Risk management (ISO 14971) — phân loại Class I/II/III

Design requirements:
  - Accuracy validation: calibration certificate
  - Safety class: Type B (body), BF (floating body applied part), CF (cardiac)
  - ESD protection: IEC 61000-4-2
  - EMC: CISPR 11, EN 55011
  - Battery backup + low battery warning
  - Display readable in bright sunlight (outdoor use)
```

### Hệ thống Giám sát Công nghiệp
```
Environment harsh:
  - Temperature: -40°C đến +85°C (industrial grade IC)
  - Vibration: IEC 60068-2-6
  - IP rating: IP65+ (dust and water protection)
  - Humidity: 5-95% non-condensing

Protocols:
  - Modbus RTU/TCP: kết nối PLC, SCADA
  - CANopen: machine-to-machine trong factory
  - OPC-UA: industrial IoT standard, secure

Power:
  - DIN rail power supply (24VDC industrial standard)
  - Isolated power supply (galvanic isolation)
  - Redundant power input
```

---

## Common Pitfalls (Cảnh báo)

- ⚠️ **Stack overflow**: Không đặt large arrays trong task stack — dùng heap hoặc global
- ⚠️ **Blocking trong ISR**: ISR phải ngắn (< 1µs) — không gọi printf, malloc, I2C trong ISR
- ⚠️ **Integer overflow**: `uint8_t counter = 255; counter++` = 0 (wrap around) — dùng đúng type
- ⚠️ **Float trên AVR**: Dùng fixed-point math trên AVR (không có FPU) — float rất chậm
- ⚠️ **Flash wear**: NVS/EEPROM write cycles hữu hạn — không ghi liên tục trong loop
- ⚠️ **WiFi reconnect loop**: ESP32 reconnect liên tục → drain battery → dùng exponential backoff
- ⚠️ **Time synchronization**: `millis()` drift theo nhiệt độ — dùng NTP hoặc RTC với crystal tốt
- ⚠️ **Memory fragmentation**: `malloc/free` nhiều lần → heap fragmentation → crash sau vài giờ
- ⚠️ **Race condition**: Shared variable giữa task và ISR mà không có critical section/atomic
- ⚠️ **Brownout reset**: Nguồn yếu khi WiFi active (spike 300mA) → cần capacitor bulk
- ⚠️ **OTA without rollback**: Flash firmware mới fail → brick device — luôn dùng A/B partition
- ⚠️ **No timeout**: Chờ response từ sensor/server vô hạn → deadlock — always set timeout

---

## Đề xuất thêm vào Scope (Thường bị bỏ quên)

- **Remote monitoring dashboard**: Web UI xem data realtime — user thường muốn nhưng quên mention
- **OTA update capability**: Cập nhật firmware không cần kết nối vật lý
- **Device provisioning**: Cách user cấu hình WiFi lần đầu (BLE provisioning, SmartConfig, AP mode)
- **Factory reset**: Nút hold 5 giây → xóa config → về default (bắt buộc cho product)
- **Diagnostic mode**: LED blink pattern hoặc UART debug để troubleshoot field issues
- **Timestamp logging**: RTC module để log có timestamp chính xác (không chỉ millis)
- **Data export**: USB mass storage hoặc HTTP download để lấy dữ liệu ra
- **Calibration procedure**: Quy trình calibration có thể làm field không cần fixture đặc biệt
