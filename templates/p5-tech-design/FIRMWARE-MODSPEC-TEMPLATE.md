# FIRMWARE-MODSPEC-{MOD} — Module Specification (Firmware)

## DOCUMENT INFO

| Thuộc tính | Giá trị |
|-----------|---------|
| **Project** | {PROJECT_NAME} |
| **System** | {SYSTEM_CODE} |
| **Module** | {MODULE_NAME} |
| **MCU Target** | {VD: ESP32-WROOM-32E / STM32F407VGT6 / RP2040} |
| **Framework** | {VD: ESP-IDF v5.1 / STM32 HAL / Arduino} |
| **RTOS** | {VD: FreeRTOS 10.5 / Zephyr 3.4 / Bare-metal} |
| **Phase** | Phase 5 — Technical Design |
| **Version** | 1.0.0 |
| **Ngày tạo** | {DATE} |
| **Tác giả** | {AUTHOR} |

## DEPENDENCY MAP

```
Derives from:
  - {SYSTEM}/P1-REQUIREMENTS/URS-{MOD}.md
  - _PROJECT/DATA-DICTIONARY.md
  - _PROJECT/PROJECT-OVERVIEW.md (hardware context)
Used by:
  - {SYSTEM}/P3-QA-DOCS/TEST-{MOD}.md (test design)
  - code-gen (firmware scaffolding)
  - /mcv3:verify (traceability check)
IDs defined here:
  - PIN-{SYS}-NNN: GPIO/Pin assignments
  - PERIPH-{SYS}-NNN: Peripheral configurations
  - TASK-{SYS}-NNN: RTOS tasks
  - SM-{SYS}-NNN: State machine states
  - MSG-{SYS}-NNN: Message/packet formats
  - API-{SYS}-NNN: REST/MQTT/BLE endpoints (nếu có)
  - NFR-{SYS}-NNN: Non-functional requirements
```

---

## PHẦN 1 — HARDWARE INTERFACE SPECIFICATION

### 1.1 Pin Assignment Table

| ID | GPIO/Pin | Direction | Type | Pull | Function | Notes |
|----|---------|-----------|------|------|----------|-------|
| PIN-{SYS}-001 | GPIO{N} | OUTPUT | Digital | - | {Tên chức năng} | {VD: LED Status} |
| PIN-{SYS}-002 | GPIO{N} | INPUT | Digital | PULL_UP | {Tên} | {VD: Button BOOT} |
| PIN-{SYS}-003 | GPIO{N} | INPUT | ADC | - | {Tên} | {VD: Soil moisture 0-3.3V} |
| PIN-{SYS}-004 | GPIO{N} | OUTPUT | PWM | - | {Tên} | {VD: Fan speed control} |
| PIN-{SYS}-005 | GPIO{N} | BIDIR | I2C SDA | PULL_UP | I2C Bus 0 | 4.7kΩ external pull-up |
| PIN-{SYS}-006 | GPIO{N} | OUTPUT | I2C SCL | PULL_UP | I2C Bus 0 | 4.7kΩ external pull-up |
| PIN-{SYS}-007 | GPIO{N} | OUTPUT | SPI MOSI | - | SPI Bus 2 | {Tên} |
| PIN-{SYS}-008 | GPIO{N} | INPUT | SPI MISO | - | SPI Bus 2 | {Tên} |
| PIN-{SYS}-009 | GPIO{N} | OUTPUT | SPI CLK | - | SPI Bus 2 | {Tên} |
| PIN-{SYS}-010 | GPIO{N} | OUTPUT | SPI CS | - | {Device CS} | Active LOW |
| PIN-{SYS}-011 | GPIO{N} | INPUT/OUTPUT | UART TX | - | UART0 | Debug console |
| PIN-{SYS}-012 | GPIO{N} | INPUT/OUTPUT | UART RX | - | UART0 | Debug console |

**Nguồn cấp:**
| Điện áp | Dòng tối đa | Cung cấp bởi |
|---------|------------|--------------|
| 3.3V | {N}mA | LDO {tên chip} từ {nguồn vào} |
| 5V | {N}mA | USB / Buck converter |
| {N}V | {N}mA | {chức năng đặc biệt} |

### 1.2 Peripheral Configuration

**I2C Bus 0:**

| Tham số | Giá trị |
|---------|---------|
| SDA Pin | GPIO{N} (PIN-{SYS}-005) |
| SCL Pin | GPIO{N} (PIN-{SYS}-006) |
| Clock speed | 400kHz (Fast Mode) |
| Pull-up | 4.7kΩ → 3.3V |
| Timeout | 100ms |
| Retry count | 3 |

**Devices trên I2C Bus 0:**
| Device | Address | Tốc độ | Chức năng |
|--------|---------|--------|-----------|
| {VD: SHT30} | 0x44 | 400kHz | Nhiệt độ, Độ ẩm |
| {VD: BH1750} | 0x23 | 400kHz | Ánh sáng lux |
| {VD: SSD1306} | 0x3C | 400kHz | OLED 128x64 |

**SPI Bus 2:**

| Tham số | Giá trị |
|---------|---------|
| MOSI Pin | GPIO{N} |
| MISO Pin | GPIO{N} |
| CLK Pin | GPIO{N} |
| Mode | CPOL=0, CPHA=0 (SPI Mode 0) |
| Clock speed | {N}MHz |
| Bit order | MSB first |

**ADC Configuration:**

| Channel | GPIO | Attenuation | Range | Sensor |
|---------|------|-------------|-------|--------|
| ADC1_CH{N} | GPIO{N} | 11dB | 0-3.1V | {Tên sensor} |
| ADC1_CH{N} | GPIO{N} | 6dB  | 0-2.2V | {Tên sensor} |

*Lưu ý ESP32: ADC2 không dùng được khi WiFi active*

**PWM Channels:**

| Channel | GPIO | Frequency | Resolution | Chức năng |
|---------|------|-----------|-----------|-----------|
| LEDC_CH0 | GPIO{N} | {N}kHz | 10-bit | {Tên} |
| LEDC_CH1 | GPIO{N} | 50Hz | 16-bit | Servo {Tên} |

### 1.3 External Component Connections

**Sensor: {Tên sensor — VD: SHT30}**
```
SHT30 ──── VCC  → 3.3V
      ──── GND  → GND
      ──── SDA  → GPIO{N} (I2C SDA)
      ──── SCL  → GPIO{N} (I2C SCL)
      ──── ALERT → GPIO{N} (Optional interrupt)
```

**Actuator: {Tên actuator — VD: Relay module}**
```
RELAY ──── VCC → 5V
      ──── GND → GND
      ──── IN  → GPIO{N} (OUTPUT, Active {HIGH/LOW})
External:
      ──── COM → {Load power +}
      ──── NO  → {Load} (Normally Open)
      ──── NC  → (Normally Closed — không dùng)
```

---

## PHẦN 2 — MEMORY LAYOUT

### 2.1 Flash Partition Table

*(ESP32 example — điều chỉnh theo MCU target)*

| Partition | Type | Subtype | Offset | Size | Mục đích |
|-----------|------|---------|--------|------|----------|
| nvs | data | nvs | 0x9000 | 0x6000 (24KB) | Key-value config storage |
| otadata | data | ota | 0xF000 | 0x2000 (8KB) | OTA slot selection |
| phy_init | data | phy | 0x11000 | 0x1000 (4KB) | RF calibration data |
| ota_0 | app | ota_0 | 0x20000 | 0x1E0000 (1.9MB) | App partition A |
| ota_1 | app | ota_1 | 0x200000 | 0x1E0000 (1.9MB) | App partition B |
| nvs_data | data | nvs | 0x3E0000 | 0x20000 (128KB) | User data NVS |

*Total Flash: 4MB*

### 2.2 RAM Allocation

| Vùng nhớ | Kích thước | Mục đích |
|----------|-----------|----------|
| FreeRTOS kernel | ~10KB | Scheduler, task control blocks |
| Task stacks (tổng) | {N}KB | Xem bảng task design |
| Heap | {N}KB | Dynamic allocations |
| Static buffers | {N}KB | Ring buffers, packet buffers |
| WiFi stack | ~80KB | ESP-IDF WiFi (nếu có) |
| BLE stack | ~70KB | ESP-IDF BLE (nếu có) |
| **Total used** | **{N}KB** | |
| **Available** | **{N}KB** | Free heap target: ≥ 20KB |

### 2.3 Memory Budget Table

| Component | Flash (.text) | Flash (.rodata) | RAM (.data+.bss) |
|-----------|-------------|-----------------|-----------------|
| FreeRTOS | ~40KB | ~5KB | ~10KB |
| WiFi + TCP/IP | ~500KB | ~100KB | ~80KB |
| BLE Softdevice | ~200KB | ~50KB | ~70KB |
| Application | ~{N}KB | ~{N}KB | ~{N}KB |
| **Total** | **~{N}KB** | **~{N}KB** | **~{N}KB** |
| **Budget** | **< {N}KB** | **< {N}KB** | **< {N}KB** |

---

## PHẦN 3 — RTOS TASK DESIGN

### 3.1 Task Table

| ID | Task Name | Priority | Stack Size | Core | Period/Trigger | Mô tả |
|----|-----------|----------|-----------|------|----------------|-------|
| TASK-{SYS}-001 | `sensor_task` | 5 | 4096B | Core 0 | 1000ms timer | Đọc tất cả sensors |
| TASK-{SYS}-002 | `comm_task` | 4 | 8192B | Core 0 | Queue event | Gửi data qua WiFi/BLE |
| TASK-{SYS}-003 | `control_task` | 6 | 2048B | Core 1 | 100ms timer | Điều khiển actuators |
| TASK-{SYS}-004 | `ui_task` | 3 | 3072B | Core 0 | 500ms timer | Cập nhật display |
| TASK-{SYS}-005 | `watchdog_task` | 7 | 1024B | Core 1 | 5000ms timer | Monitor tasks health |

*Priority: 0 (thấp nhất) → configMAX_PRIORITIES-1 (cao nhất)*
*Core: 0 = Protocol CPU, 1 = Application CPU (ESP32)*

### 3.2 Inter-Task Communication

**Queues:**
| Queue Name | Size | Item Type | Producer | Consumer |
|------------|------|-----------|----------|----------|
| `sensor_data_queue` | 10 items | `SensorData_t` | sensor_task | comm_task |
| `command_queue` | 5 items | `Command_t` | comm_task | control_task |
| `log_queue` | 20 items | `LogEntry_t` | tất cả tasks | log_task |

**Semaphores / Mutexes:**
| Name | Type | Mục đích |
|------|------|----------|
| `i2c_mutex` | Mutex | Bảo vệ I2C bus (nhiều tasks cùng dùng) |
| `nvs_mutex` | Mutex | Bảo vệ NVS read/write |
| `data_ready_sem` | Binary Semaphore | Signal từ sensor ISR → sensor_task |

**Event Groups:**
| Event Group | Bit | Event | Ý nghĩa |
|-------------|-----|-------|---------|
| `system_events` | Bit 0 | `WIFI_CONNECTED` | WiFi đã kết nối |
| | Bit 1 | `MQTT_CONNECTED` | MQTT broker đã kết nối |
| | Bit 2 | `SENSOR_ERROR` | Sensor đọc lỗi liên tục |
| | Bit 3 | `OTA_AVAILABLE` | Firmware update available |

### 3.3 Critical Sections

| Vùng code | Lý do cần protect | Cơ chế |
|-----------|------------------|--------|
| I2C transactions | Multi-task access | `i2c_mutex` |
| Shared sensor buffer | sensor_task ghi, comm_task đọc | `portENTER_CRITICAL` hoặc Queue |
| NVS write | Không concurrent write | `nvs_mutex` |

---

## PHẦN 4 — STATE MACHINE SPECIFICATION

### 4.1 SM-{SYS}-001: {Tên State Machine — VD: Device Lifecycle}

**States:**
```c
typedef enum {
    STATE_INIT = 0,          // Khởi động, init peripherals
    STATE_PROVISIONING,      // Chờ WiFi credentials từ user
    STATE_CONNECTING,        // Đang kết nối WiFi/Server
    STATE_RUNNING,           // Hoạt động bình thường
    STATE_ERROR,             // Lỗi cần recovery
    STATE_OTA,               // Đang cập nhật firmware
    STATE_SLEEP,             // Low power mode
    STATE_COUNT              // Số lượng states (sentinel)
} DeviceState_t;
```

**Transition Table:**

| Current State | Event | Next State | Action | Guard Condition |
|--------------|-------|-----------|--------|----------------|
| STATE_INIT | `EVT_INIT_DONE` | STATE_PROVISIONING | `start_ble_provisioning()` | credentials chưa có |
| STATE_INIT | `EVT_INIT_DONE` | STATE_CONNECTING | `start_wifi_connect()` | credentials đã có trong NVS |
| STATE_PROVISIONING | `EVT_CREDENTIALS_SET` | STATE_CONNECTING | `save_credentials(), start_wifi()` | - |
| STATE_CONNECTING | `EVT_WIFI_CONNECTED` | STATE_RUNNING | `start_services()` | - |
| STATE_CONNECTING | `EVT_CONNECT_TIMEOUT` | STATE_ERROR | `log_error(), set_led_red()` | retry > 5 |
| STATE_RUNNING | `EVT_SENSOR_ERROR` | STATE_ERROR | `log_error(), set_led_blink()` | - |
| STATE_RUNNING | `EVT_OTA_START` | STATE_OTA | `pause_services()` | ota_ready == true |
| STATE_RUNNING | `EVT_SLEEP_CMD` | STATE_SLEEP | `flush_data(), enter_deep_sleep()` | - |
| STATE_ERROR | `EVT_RESET` | STATE_INIT | `clear_errors(), restart()` | - |
| STATE_OTA | `EVT_OTA_DONE` | STATE_INIT | `restart()` | ota_success == true |
| STATE_OTA | `EVT_OTA_FAIL` | STATE_RUNNING | `resume_services()` | - |

**State Diagram:**
```
        ┌─────────────────────────────────────────────────────┐
        │                                                     │
   ┌────▼────┐  INIT_DONE     ┌──────────────┐               │
   │  INIT   │ ─────────────► │ PROVISIONING │               │
   └────┬────┘ (no creds)     └──────┬───────┘               │
        │                           │ CREDENTIALS_SET         │
        │ INIT_DONE (has creds)      ▼                         │
        └──────────────────► ┌─────────────┐                 │
                             │  CONNECTING  │                 │
                             └──────┬──────┘                 │
                                    │ WIFI_CONNECTED          │
                                    ▼                         │
                             ┌─────────────┐  OTA_START      │
                             │   RUNNING   │ ──────────────► ┌─────┐
                             └──────┬──────┘                 │ OTA │
                                    │ SENSOR_ERROR            └──┬──┘
                                    ▼                           │
                             ┌─────────────┐          OTA_DONE │
                             │    ERROR    │ ◄─────────────────┘
                             └─────────────┘
```

---

## PHẦN 5 — COMMUNICATION PROTOCOL SPECIFICATION

### 5.1 MQTT Topics (nếu dùng MQTT)

**Topic naming convention:**
```
{project}/{device_id}/{direction}/{data_type}
```

**Topics:**
| Topic | Direction | QoS | Retained | Payload Format | Mô tả |
|-------|-----------|-----|----------|----------------|-------|
| `{proj}/{dev}/telemetry/sensors` | Device→Server | 1 | No | JSON | Dữ liệu sensor |
| `{proj}/{dev}/telemetry/status` | Device→Server | 1 | Yes | JSON | Device status |
| `{proj}/{dev}/command/control` | Server→Device | 1 | No | JSON | Lệnh điều khiển |
| `{proj}/{dev}/command/ota` | Server→Device | 1 | No | JSON | OTA trigger |
| `{proj}/{dev}/response/{cmd_id}` | Device→Server | 1 | No | JSON | Command response |

**Payload: Sensor Telemetry**
```json
{
  "device_id": "dev-001",
  "timestamp": 1704067200,
  "fw_version": "1.2.3",
  "sensors": {
    "temperature": 28.5,
    "humidity": 65.2,
    "soil_moisture": 42,
    "light_lux": 1250
  },
  "battery_mv": 3750,
  "rssi": -65
}
```

**Payload: Control Command**
```json
{
  "cmd_id": "cmd-abc123",
  "command": "SET_RELAY",
  "params": {
    "relay_id": 1,
    "state": true,
    "duration_sec": 300
  },
  "timestamp": 1704067200
}
```

### 5.2 BLE GATT Services (nếu dùng BLE)

**Service: Device Info (Standard)**
- UUID: `0x180A`
- Manufacturer Name (0x2A29): Read only
- Firmware Revision (0x2A26): Read only

**Service: {Custom Service Name}**
- UUID: `{UUID tự định nghĩa — VD: 4fafc201-1fb5-459e-8fcc-c5c9c331914b}`

| Characteristic | UUID | Properties | Size | Mô tả |
|---------------|------|-----------|------|-------|
| Sensor Data | `{UUID}` | Read, Notify | 20B | Latest sensor readings |
| Control | `{UUID}` | Write, Write No Response | 10B | Set relay/actuator |
| Config | `{UUID}` | Read, Write | 64B | Device configuration |
| OTA Data | `{UUID}` | Write No Response | 512B | Firmware data chunk |

**BLE Advertising Packet:**
```
Flags: LE General Discoverable, BR/EDR not supported
Local Name: "{device_name}"
Manufacturer Data: Company ID (0xFFFF) + device_type(1B) + device_id(4B)
Service UUID: {Custom Service UUID}
TX Power: 0dBm
```

### 5.3 Packet Error Handling

| Lỗi | Detection | Retry | Fallback |
|-----|-----------|-------|----------|
| MQTT publish fail | Return code ≠ 0 | 3 lần, exponential backoff 1s/2s/4s | Store in ring buffer, retry khi reconnect |
| WiFi disconnect | Event callback | Auto reconnect (exponential backoff) | Continue local operation + log |
| BLE disconnect | GAP event | Re-advertise sau 1s | Continue standalone operation |
| Sensor read fail | I2C NACK | 3 lần, 10ms delay | Dùng last known value, flag error |
| CRC mismatch | Packet validation | Request retransmit | Discard packet, log |

---

## PHẦN 6 — API ENDPOINTS (REST / HTTP — nếu có Web Server nhúng)

*Dành cho thiết bị có HTTP server nhúng (ESP32 với web configuration portal)*

### API-{SYS}-001: Lấy trạng thái device

**Method:** GET
**Path:** `/api/v1/status`
**Auth:** Basic Auth hoặc Bearer Token
**Origin FT:** FT-{MOD}-NNN

**Response — 200 OK:**
```json
{
  "device_id": "esp32-001",
  "fw_version": "1.2.3",
  "uptime_sec": 3600,
  "state": "RUNNING",
  "wifi_rssi": -65,
  "sensors": { "temperature": 28.5, "humidity": 65 },
  "battery_mv": 3750
}
```

### API-{SYS}-002: Cập nhật cấu hình

**Method:** POST
**Path:** `/api/v1/config`
**Auth:** Bearer Token
**Origin FT:** FT-{MOD}-NNN

**Request Body:**
```json
{
  "mqtt_broker": "mqtt.example.com",
  "mqtt_port": 1883,
  "sample_interval_sec": 60,
  "sleep_enabled": true
}
```

---

## PHẦN 7 — NON-FUNCTIONAL REQUIREMENTS

### 7.1 Power Budget

| Mode | CPU State | WiFi | BLE | Sensors | Current | Duration/Cycle |
|------|-----------|------|-----|---------|---------|---------------|
| Active (measure + send) | Active 240MHz | TX | - | All on | ~250mA | 10 giây |
| Active (measure only) | Active | - | Adv | All on | ~80mA | 5 giây |
| Light Sleep | Paused | Connected | - | Off | ~5mA | 45 giây |
| Deep Sleep | Off | Off | Off | Off | ~0.01mA | {N} phút |

**Tính toán battery life:**
```
Cycle time: {N} phút
Active time: {N} giây
Deep sleep: {N-active} giây

Current per cycle:
  Active: {I_active}mA × {t_active}s = {mAms}
  Sleep:  {I_sleep}mA  × {t_sleep}s = {mAms}
  Total per cycle: {mAms} / 3600 = {mAh}

Battery: {capacity}mAh
Expected life: {capacity} / ({mAh_per_cycle} × {cycles_per_hour}) hours = {N} ngày
```

**Target:** Hoạt động {N} ngày với pin {capacity}mAh.

### 7.2 Boot Time Requirements

| Milestone | Target | Đo từ |
|-----------|--------|-------|
| Power-on đến main() | < 100ms | Power stable |
| Peripherals initialized | < 500ms | main() |
| WiFi connected | < 5s | Boot (nếu DHCP ok) |
| First sensor reading | < 6s | Boot |
| Ready to receive commands | < 7s | Boot |

### 7.3 Response Time / Latency Budget

| Tác vụ | Target | Worst Case |
|--------|--------|-----------|
| Button press → LED response | < 50ms | < 100ms |
| Sensor read (I2C) | < 100ms | < 500ms |
| MQTT publish | < 1s | < 5s |
| Command receive → execute | < 500ms | < 2s |
| OTA chunk receive → write Flash | < 2s/chunk | < 5s/chunk |

### 7.4 Memory Usage Budget

| Metric | Target | Alert threshold |
|--------|--------|----------------|
| Minimum free heap | ≥ 20KB | < 10KB → log warning |
| Stack watermark per task | ≥ 25% stack | < 10% → increase stack |
| NVS usage | < 80% | > 90% → cleanup |
| OTA partition fill | ≤ 95% of partition | > 95% → error |

### 7.5 Operating Conditions

| Tham số | Min | Typical | Max |
|---------|-----|---------|-----|
| Operating temperature | {N}°C | 25°C | {N}°C |
| Storage temperature | {N}°C | - | {N}°C |
| Supply voltage (VCC) | 3.0V | 3.3V | 3.6V |
| Humidity | 10%RH | - | 90%RH (non-condensing) |
| Supply ripple | - | - | < 100mV p-p |

### 7.6 Reliability Requirements

| Metric | Target |
|--------|--------|
| MTBF (Mean Time Between Failures) | > {N} giờ |
| Auto-recovery từ crash | < 30 giây (watchdog reset) |
| OTA rollback khi boot fail | Tự động trong 3 boot lần |
| Data loss window | < {N} phút (local buffer) |
| Flash erase cycles (NVS config area) | > 100,000 cycles |

---

## PHẦN 8 — FIRMWARE ARCHITECTURE OVERVIEW

### 8.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Sensor   │  │ Control  │  │   Comm   │  │   Config     │   │
│  │ Manager  │  │ Manager  │  │ Manager  │  │   Manager    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │               │            │
│  ┌────▼──────────────▼──────────────▼───────────────▼──────┐   │
│  │                  Event Bus / Message Queue               │   │
│  └────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        Middleware Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  MQTT    │  │   BLE    │  │   OTA    │  │     NVS      │   │
│  │  Client  │  │  Stack   │  │  Manager │  │    Storage   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                       Driver / HAL Layer                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ GPIO │  │ I2C  │  │ SPI  │  │ ADC  │  │ UART │  │ PWM  │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
├─────────────────────────────────────────────────────────────────┤
│              Hardware (MCU + Peripherals + Sensors)              │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Architecture Decision Records

**ADR-{SYS}-001: Chọn RTOS Task Model vs Event Loop**

| | Nội dung |
|---|---|
| **Bối cảnh** | Cần xử lý nhiều tasks song song (sensor, WiFi, control) |
| **Option A** | FreeRTOS multiple tasks — mỗi task độc lập |
| **Option B** | Single event loop (Arduino style) — non-blocking polling |
| **Quyết định** | Option A — FreeRTOS tasks |
| **Lý do** | Phân tách rõ ràng, dễ prioritize, WiFi stack yêu cầu RTOS |
| **Trade-off** | Stack memory cho mỗi task, cần mutex/semaphore |

**ADR-{SYS}-002: Chọn Communication Protocol**

| | Nội dung |
|---|---|
| **Bối cảnh** | Device cần gửi data và nhận command |
| **Option A** | MQTT — lightweight pub/sub, phổ biến IoT |
| **Option B** | HTTP REST — đơn giản, stateless |
| **Option C** | WebSocket — bidirectional, real-time |
| **Quyết định** | {Option} |
| **Lý do** | {Giải thích} |

---

## TRACEABILITY

| Requirement ID | Design Element | Notes |
|---------------|---------------|-------|
| FT-{MOD}-001 | TASK-{SYS}-001 sensor_task | Đọc sensors theo schedule |
| FT-{MOD}-002 | API-{SYS}-001 + TASK-{SYS}-002 | Gửi data qua MQTT |
| FT-{MOD}-003 | SM-{SYS}-001 STATE_RUNNING | Control loop |
| BR-{DOM}-001 | Watchdog trong TASK-{SYS}-005 | Failsafe recovery |
| NFR-{SYS}-001 | Deep sleep implementation | Power budget target |
