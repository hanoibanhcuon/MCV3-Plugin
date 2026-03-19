# Embedded Test Guide — QA Docs cho Firmware

## Tổng quan

Testing firmware khác với testing web/backend vì:
- **Hardware dependency**: Code gọi trực tiếp hardware registers
- **Real-time constraints**: Timing và interrupt behavior
- **Limited resources**: Không thể chạy test framework nặng trên MCU
- **Two-tier testing**: Host-based (nhanh, CI/CD) + On-target (chậm, hardware required)

---

## Chiến lược Testing 2 Tầng

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: Host-Based Tests (fast, CI/CD)                 │
│  ├── Unit tests với mock HAL                             │
│  ├── Logic tests (FSM, algorithms, data processing)     │
│  └── Static analysis (Cppcheck, clang-tidy)             │
├─────────────────────────────────────────────────────────┤
│  Tier 2: On-Target Tests (hardware required)             │
│  ├── Hardware integration tests                          │
│  ├── Protocol tests (I2C, SPI, UART timing)             │
│  ├── Power consumption measurement                       │
│  └── Endurance tests (watchdog, OTA, power cycles)      │
└─────────────────────────────────────────────────────────┘
```

---

## Unity Test Framework

Unity là test framework C phổ biến nhất cho embedded, tích hợp sẵn với PlatformIO.

### Setup PlatformIO Native Test
```ini
; platformio.ini
[env:native_test]
platform = native
build_flags =
    -DUNIT_TEST
    -DCONFIG_LOG_DEFAULT_LEVEL=0  ; Tắt logs trong test
lib_deps =
    throwtheswitch/Unity @ ^2.5.2
    ; Thêm lib cần test
test_build_src = yes
```

### Cấu trúc thư mục test
```
test/
├── unity_config.h           ← Config Unity (output format, exit behavior)
├── test_main.c              ← Entry point chạy tất cả suites
├── mocks/
│   ├── mock_hal_i2c.h       ← Mock I2C driver
│   ├── mock_hal_i2c.c
│   ├── mock_hal_gpio.h
│   └── mock_hal_gpio.c
├── test_sensor_module/
│   ├── test_sensor.c        ← Unit tests cho sensor module
│   └── test_sensor_edge.c   ← Edge case tests
├── test_fsm/
│   └── test_device_fsm.c    ← State machine tests
└── test_ring_buffer/
    └── test_ring_buffer.c   ← Data structure tests
```

### Test file template
```c
/**
 * Test Suite: {Module Name}
 *
 * @tc-ids TC-{MOD}-001, TC-{MOD}-002, ...
 * @covers FT-{MOD}-001, FT-{MOD}-002
 */
#include "unity.h"
#include "{module}.h"
#include "mocks/mock_hal_i2c.h"

/* Setup/Teardown chạy trước/sau MỖI test */
void setUp(void) {
    // Reset mock state
    mock_hal_i2c_reset();
    // Reset module state
    {mod}_deinit();  // Nếu có
}

void tearDown(void) {
    // Cleanup sau mỗi test
}

/* ============================================================
 * TC-{MOD}-001: Happy path — đọc sensor thành công
 * AC: AC-{MOD}-001-01
 * ============================================================ */
void test_{mod}_read_success(void) {
    // Arrange: cấu hình mock trả về data hợp lệ
    uint8_t fake_response[] = {0x61, 0xB8, 0x00, 0x7F, 0x86, 0x00};
    // Temperature bytes: 0x61B8 = 25016 → 25.04°C
    // Humidity bytes:    0x7F86 = 32646 → 49.8%
    mock_hal_i2c_set_response(fake_response, sizeof(fake_response));

    // Khởi tạo module
    {Mod}Config_t cfg = { .i2c_address = 0x44, .sample_interval_ms = 1000 };
    TEST_ASSERT_EQUAL(ESP_OK, {mod}_init(&cfg));

    // Act
    {Mod}Data_t data;
    esp_err_t ret = {mod}_read(&data);

    // Assert
    TEST_ASSERT_EQUAL(ESP_OK, ret);
    TEST_ASSERT_TRUE(data.valid);
    // 25.04°C ± 0.1°C tolerance
    TEST_ASSERT_INT_WITHIN(10, 2504, data.temperature_x100);  // 25.04 × 100 = 2504
    TEST_ASSERT_INT_WITHIN(2, 49, data.humidity_pct);
}

/* ============================================================
 * TC-{MOD}-002: I2C error → error state sau 3 lần thất bại
 * AC: AC-{MOD}-001-02
 * ============================================================ */
void test_{mod}_read_i2c_fail_transitions_to_error(void) {
    // Arrange: mock trả về lỗi liên tục
    mock_hal_i2c_set_error(ESP_ERR_TIMEOUT);

    {Mod}Config_t cfg = { .i2c_address = 0x44, .sample_interval_ms = 1000 };
    {mod}_init(&cfg);

    // Act: đọc 3 lần
    {Mod}Data_t data;
    {mod}_read(&data);  // Lần 1 fail
    {mod}_read(&data);  // Lần 2 fail
    {mod}_read(&data);  // Lần 3 fail → chuyển ERROR state

    // Assert
    TEST_ASSERT_EQUAL({MOD_UPPER}_STATE_ERROR, {mod}_get_state());
    TEST_ASSERT_FALSE(data.valid);
}

/* ============================================================
 * TC-{MOD}-003: Đọc sensor trả về last known good value khi lỗi
 * AC: AC-{MOD}-001-03
 * ============================================================ */
void test_{mod}_read_returns_last_good_on_error(void) {
    // Arrange: lần đầu đọc OK
    uint8_t good_data[] = {0x61, 0xB8, 0x00, 0x7F, 0x86, 0x00};
    mock_hal_i2c_set_response(good_data, sizeof(good_data));

    {Mod}Config_t cfg = { .i2c_address = 0x44, .sample_interval_ms = 1000 };
    {mod}_init(&cfg);

    {Mod}Data_t good_reading;
    TEST_ASSERT_EQUAL(ESP_OK, {mod}_read(&good_reading));

    // Lần sau lỗi
    mock_hal_i2c_set_error(ESP_ERR_TIMEOUT);
    {Mod}Data_t error_reading;
    {mod}_read(&error_reading);

    // Assert: trả về last good data nhưng valid = false
    TEST_ASSERT_FALSE(error_reading.valid);
    TEST_ASSERT_EQUAL(good_reading.temperature_x100, error_reading.temperature_x100);
}

/* Entry point */
int runUnityTests(void) {
    UNITY_BEGIN();
    RUN_TEST(test_{mod}_read_success);
    RUN_TEST(test_{mod}_read_i2c_fail_transitions_to_error);
    RUN_TEST(test_{mod}_read_returns_last_good_on_error);
    return UNITY_END();
}

#ifdef ARDUINO
void setup() { runUnityTests(); }
void loop() {}
#else
int main(void) { return runUnityTests(); }
#endif
```

---

## Test Doubles cho Hardware (Mock HAL)

### `mock_hal_i2c.h`
```c
#pragma once
#include "hal_i2c.h"  // Interface thật

/* Cấu hình mock behavior */
void mock_hal_i2c_reset(void);
void mock_hal_i2c_set_response(const uint8_t *data, size_t len);
void mock_hal_i2c_set_error(esp_err_t error);

/* Verification */
int  mock_hal_i2c_get_write_count(void);
int  mock_hal_i2c_get_read_count(void);
const uint8_t *mock_hal_i2c_get_last_written(size_t *len);
```

### `mock_hal_i2c.c`
```c
#include "mock_hal_i2c.h"
#include <string.h>

#define MOCK_BUF_SIZE 64

static struct {
    uint8_t  response_data[MOCK_BUF_SIZE];
    size_t   response_len;
    esp_err_t error_code;
    bool     force_error;
    int      write_count;
    int      read_count;
    uint8_t  last_written[MOCK_BUF_SIZE];
    size_t   last_written_len;
} mock_state;

void mock_hal_i2c_reset(void) {
    memset(&mock_state, 0, sizeof(mock_state));
    mock_state.error_code = ESP_OK;
}

void mock_hal_i2c_set_response(const uint8_t *data, size_t len) {
    mock_state.force_error = false;
    memcpy(mock_state.response_data, data, len < MOCK_BUF_SIZE ? len : MOCK_BUF_SIZE);
    mock_state.response_len = len;
}

void mock_hal_i2c_set_error(esp_err_t error) {
    mock_state.error_code = error;
    mock_state.force_error = true;
}

/* Implement interface functions */
esp_err_t hal_i2c_write(uint8_t dev_addr, const uint8_t *data, size_t len) {
    (void)dev_addr;
    mock_state.write_count++;
    memcpy(mock_state.last_written, data, len < MOCK_BUF_SIZE ? len : MOCK_BUF_SIZE);
    mock_state.last_written_len = len;
    return mock_state.force_error ? mock_state.error_code : ESP_OK;
}

esp_err_t hal_i2c_read(uint8_t dev_addr, uint8_t *data, size_t len) {
    (void)dev_addr;
    mock_state.read_count++;
    if (mock_state.force_error) return mock_state.error_code;
    size_t copy_len = len < mock_state.response_len ? len : mock_state.response_len;
    memcpy(data, mock_state.response_data, copy_len);
    return ESP_OK;
}

esp_err_t hal_i2c_write_read(uint8_t dev_addr,
                              const uint8_t *wr_buf, size_t wr_len,
                              uint8_t *rd_buf, size_t rd_len) {
    esp_err_t ret = hal_i2c_write(dev_addr, wr_buf, wr_len);
    if (ret != ESP_OK) return ret;
    return hal_i2c_read(dev_addr, rd_buf, rd_len);
}
```

---

## Host-Based vs On-Target Testing

### Host-Based Testing (PlatformIO Native)
```bash
# Chạy tests trên máy tính (không cần hardware)
pio test -e native_test

# Với coverage
pio test -e native_test --coverage

# Output:
# test/test_sensor_module/test_sensor.c:45:test_{mod}_read_success PASSED
# test/test_sensor_module/test_sensor.c:78:test_{mod}_read_i2c_fail... PASSED
# -----------------------
# 3 Tests 0 Failures 0 Ignored
```

**Phù hợp cho:**
- Logic tests (FSM transitions, algorithms)
- Data processing (parsing, calculations)
- Ring buffer, configuration manager
- CI/CD pipeline (GitHub Actions, GitLab CI)

### On-Target Testing (trên hardware thật)
```bash
# Chạy tests trên ESP32 thật
pio test -e esp32_target

# Output qua Serial Monitor (115200 baud):
# [sensor_task] init OK
# test_sht30_read: PASS (temp=25.04, hum=49.8)
# test_i2c_timeout: PASS (recovered after 3 retries)
# -----------------------
# 5 Tests 0 Failures
```

**Bắt buộc cho:**
- Hardware integration (I2C timing, SPI, UART)
- Power consumption measurement
- WiFi/BLE connection tests
- OTA update tests
- Watchdog timer tests

---

## Static Analysis

### Cppcheck
```bash
# Install
sudo apt install cppcheck  # Ubuntu

# Chạy cho project
cppcheck --enable=all \
         --suppress=missingIncludeSystem \
         --std=c99 \
         --platform=unix32 \
         -I include/ \
         src/

# CI/CD: fail nếu có errors
cppcheck --error-exitcode=1 src/
```

### clang-tidy
```yaml
# .clang-tidy config file
Checks: >
    clang-diagnostic-*,
    clang-analyzer-*,
    bugprone-*,
    performance-*,
    readability-identifier-naming,
    -readability-magic-numbers,
    -clang-analyzer-security.insecureAPI.rand

CheckOptions:
  - key: readability-identifier-naming.VariableCase
    value: lower_case
  - key: readability-identifier-naming.FunctionCase
    value: lower_case
  - key: readability-identifier-naming.TypedefCase
    value: CamelCase
```

```bash
# Chạy clang-tidy
clang-tidy src/**/*.c -- -Iinclude -DUNIT_TEST
```

---

## MISRA C Compliance Notes

### Khi nào cần MISRA C full compliance
- Thiết bị y tế (Class II/III)
- Automotive (ISO 26262 ASIL B+)
- Industrial Safety (IEC 61508 SIL 2+)

### Khi nào đủ với MISRA subset
- Consumer IoT (smart home, agricultural)
- Industrial monitoring (non-safety-critical)
- Prototype và MVP

### Các rule MISRA thực tế nhất (áp dụng ngay cả không full compliance)
```
Rule 10.1: Không implicit conversion làm mất data
Rule 14.4: Điều kiện if/while phải có kiểu boolean
Rule 15.5: Mỗi function chỉ có 1 return statement (khuyến nghị)
Rule 17.7: Không bỏ qua return value của function
Rule 21.3: Không dùng malloc/free
Rule 21.4: Không dùng setjmp.h (exception mechanism)
```

---

## Memory Analysis

### Stack Watermark Check
```c
// Trong mỗi task (debug mode):
void check_stack_usage(void) {
    UBaseType_t watermark = uxTaskGetStackHighWaterMark(NULL);
    ESP_LOGI(TAG, "Stack watermark: %u words remaining", watermark);

    if (watermark < 64) {  // < 256 bytes
        ESP_LOGW(TAG, "CRITICAL: Stack almost full!");
        // Alert, tăng stack size trong FIRMWARE-MODSPEC
    }
}

// Chạy định kỳ hoặc sau mỗi stress test
```

### Heap Fragmentation Detection
```c
void check_heap_health(void) {
    size_t free_heap = esp_get_free_heap_size();
    size_t min_free  = esp_get_minimum_free_heap_size();
    size_t max_block = heap_caps_get_largest_free_block(MALLOC_CAP_8BIT);

    ESP_LOGI("heap", "Free: %u, Min ever: %u, Max block: %u",
             free_heap, min_free, max_block);

    // Cảnh báo nếu max_block << free_heap (fragmentation)
    if (max_block < free_heap / 4) {
        ESP_LOGW("heap", "Heap fragmentation detected!");
    }
}
```

---

## Integration Testing — Protocol Level

### Serial Protocol Testing
```python
# test_uart_protocol.py (chạy trên PC, kết nối qua USB-Serial)
import serial
import json
import time

def test_sensor_request():
    """TC-{MOD}-101: UART command → sensor response"""
    port = serial.Serial('/dev/ttyUSB0', 115200, timeout=2)

    # Gửi lệnh GET_SENSOR
    cmd = b'{"cmd":"GET_SENSOR","id":"temp"}\n'
    port.write(cmd)

    # Đọc response
    response_raw = port.readline()
    response = json.loads(response_raw)

    assert response['success'] == True
    assert 'temperature' in response['data']
    assert -10 < response['data']['temperature'] < 60  # Reasonable range

    port.close()
    print("PASS: test_sensor_request")

test_sensor_request()
```

### MQTT Message Testing
```python
# test_mqtt_messages.py
import paho.mqtt.client as mqtt
import json
import time

received_messages = []

def on_message(client, userdata, msg):
    received_messages.append({
        'topic': msg.topic,
        'payload': json.loads(msg.payload)
    })

def test_telemetry_format():
    """TC-{MOD}-201: Telemetry message format validation"""
    client = mqtt.Client()
    client.on_message = on_message
    client.connect("localhost", 1883)
    client.subscribe("devices/+/telemetry/#")
    client.loop_start()

    time.sleep(15)  # Chờ 1+ message (device send every 10s)
    client.loop_stop()

    assert len(received_messages) > 0, "No telemetry received"

    msg = received_messages[0]
    payload = msg['payload']

    # Validate format
    assert 'device_id' in payload
    assert 'timestamp' in payload
    assert 'sensors' in payload
    assert 'temperature' in payload['sensors']

    print(f"PASS: Received {len(received_messages)} telemetry messages")
```

---

## Acceptance Testing — Hardware-in-the-Loop

### Khái niệm HIL Testing
```
┌──────────────────────────────────────────────────────┐
│ Test Controller (PC)                                   │
│  - Chạy test script                                    │
│  - Kiểm soát power supply                             │
│  - Đọc serial output                                  │
│  - Subscribe MQTT                                      │
└─────────────────┬────────────────────────────────────┘
                  │ USB Serial + Power Control
┌─────────────────▼────────────────────────────────────┐
│ Device Under Test (DUT)                               │
│  - Firmware được test                                  │
│  - Sensors/Actuators thật hoặc emulator               │
└──────────────────────────────────────────────────────┘
```

### UAT Checklist cho Firmware
```
UAT-{MOD}-001: First-time setup
  [ ] Device bật lên, đèn LED blink 500ms (INIT mode)
  [ ] Kết nối WiFi qua BLE provisioning trong < 2 phút
  [ ] Sau khi provision: LED solid, data xuất hiện trên dashboard

UAT-{MOD}-002: Normal operation
  [ ] Sensor data gửi đúng interval (±5 giây)
  [ ] Data values trong khoảng hợp lý
  [ ] Dashboard cập nhật real-time

UAT-{MOD}-003: Network interruption
  [ ] Rút WiFi AP → device tiếp tục đo, lưu buffer
  [ ] Cắm lại WiFi → device reconnect trong < 30 giây
  [ ] Buffered data được upload sau khi reconnect

UAT-{MOD}-004: Power cycle
  [ ] Ngắt nguồn → cắm lại → boot trong < 10 giây
  [ ] Config được giữ nguyên (WiFi, intervals)
  [ ] Tiếp tục gửi data bình thường

UAT-{MOD}-005: Factory reset
  [ ] Giữ nút 5 giây → LED blink nhanh
  [ ] Thả nút → device reboot về provisioning mode
  [ ] WiFi credentials bị xóa
```

---

## Firmware-Specific Test Categories

| Loại Test | Tools | Chạy khi | Thời gian |
|-----------|-------|----------|-----------|
| Unit tests (logic) | Unity / PlatformIO native | Mỗi commit | < 30s |
| Static analysis | Cppcheck, clang-tidy | Mỗi commit | < 2min |
| Integration (on-target) | Unity on hardware | Trước merge | 5-10min |
| Protocol tests | Python scripts + serial | Feature complete | 15min |
| Power test | Multimeter + logging | Trước release | 1 giờ |
| Endurance test | Automated 72h run | Release candidate | 72h |
| OTA test | esptool + test server | Trước release | 30min |
