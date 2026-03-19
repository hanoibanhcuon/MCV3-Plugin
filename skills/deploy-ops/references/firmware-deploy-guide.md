# Firmware Deploy Guide — Deploy-Ops cho Embedded Projects

## Tổng quan

Deployment firmware khác hoàn toàn với web/backend:
- **Flash programming**: Ghi trực tiếp vào Flash memory của MCU
- **Physical access**: Cần kết nối vật lý (USB, JTAG, SWD) lần đầu
- **OTA (Over-The-Air)**: Cập nhật qua mạng sau khi deploy lần đầu
- **Brick risk**: Firmware lỗi = thiết bị không boot được → cần rollback
- **Scale challenge**: Cập nhật 1000+ devices trong field

---

## Flash Programming Tools

### esptool.py (ESP32/ESP8266)
```bash
# Install
pip install esptool

# Flash firmware lần đầu (full)
esptool.py --chip esp32 \
           --port /dev/ttyUSB0 \
           --baud 921600 \
           --before default_reset \
           --after hard_reset \
           write_flash \
           -z \
           --flash_mode dio \
           --flash_freq 40m \
           --flash_size 4MB \
           0x1000  bootloader.bin \
           0x8000  partition-table.bin \
           0x10000 firmware.bin

# Flash chỉ application (giữ bootloader và partitions)
esptool.py --chip esp32 \
           --port /dev/ttyUSB0 \
           --baud 921600 \
           write_flash 0x10000 firmware.bin

# Erase flash (factory reset)
esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash

# Verify sau khi flash
esptool.py --chip esp32 --port /dev/ttyUSB0 \
           verify_flash 0x10000 firmware.bin

# Đọc MAC address (cho provisioning)
esptool.py --chip esp32 --port /dev/ttyUSB0 read_mac
```

### STM32CubeProgrammer (STM32)
```bash
# Command line (STM32_Programmer_CLI)
# Flash via ST-Link
STM32_Programmer_CLI \
    --connect port=SWD freq=4000 reset=HWrst \
    --write firmware.hex \
    --verify \
    --go

# Flash via UART (DFU mode)
STM32_Programmer_CLI \
    --connect port=COM3 br=115200 mode=UR parity=EVEN \
    --write firmware.bin 0x08000000 \
    --verify

# Mass erase
STM32_Programmer_CLI --connect port=SWD --erase all
```

### OpenOCD (Đa nền tảng — STM32, nRF, RP2040)
```bash
# Flash STM32F4 via ST-Link
openocd \
    -f interface/stlink.cfg \
    -f target/stm32f4x.cfg \
    -c "program firmware.elf verify reset exit"

# Flash nRF52 via J-Link
openocd \
    -f interface/jlink.cfg \
    -c "transport select swd" \
    -f target/nrf52.cfg \
    -c "program firmware.hex verify reset exit"
```

### avrdude (Arduino AVR)
```bash
# Arduino Mega via USB
avrdude -v \
        -p atmega2560 \
        -c wiring \
        -P /dev/ttyACM0 \
        -b 115200 \
        -D \
        -U flash:w:firmware.hex:i

# Arduino Uno via ISP programmer
avrdude -v \
        -p atmega328p \
        -c usbasp \
        -U flash:w:firmware.hex:i
```

### PlatformIO Upload (Unified)
```bash
# Upload qua PlatformIO (tự chọn tool phù hợp)
pio run --target upload

# Upload port cụ thể
pio run --target upload --upload-port /dev/ttyUSB0

# Upload và monitor serial
pio run --target upload && pio device monitor
```

---

## OTA Update Strategies

### A/B Partition (Rollback-Safe) — ESP32

Đây là phương pháp an toàn nhất cho production:

```
Flash Layout:
┌─────────────────┐ 0x1000
│   Bootloader    │ (32KB)
├─────────────────┤ 0x8000
│  Partition Table│ (4KB)
├─────────────────┤ 0x9000
│      NVS        │ (24KB — config, creds)
├─────────────────┤ 0xF000
│    OTA Data     │ (8KB — slot selection)
├─────────────────┤ 0x10000
│   App OTA_0     │ (1.9MB — running app)
├─────────────────┤ 0x200000
│   App OTA_1     │ (1.9MB — update target)
├─────────────────┤ 0x3F0000
│   User Data     │ (64KB)
└─────────────────┘ 0x400000
```

**Flow OTA update:**
```
1. Server push notification: "New firmware v1.2.3 available"
2. Device download → ghi vào partition không đang chạy (OTA_1 nếu đang dùng OTA_0)
3. Verify SHA256 hash sau khi download
4. Validate firmware header (magic bytes, version, size)
5. Set boot slot → OTA_1
6. Reboot
7. Nếu OTA_1 boot OK + health check pass → mark OTA_1 valid
8. Nếu OTA_1 fail 3 lần boot → bootloader tự rollback về OTA_0
```

**ESP-IDF OTA code skeleton:**
```c
#include "esp_ota_ops.h"
#include "esp_http_client.h"

esp_err_t perform_ota_update(const char *firmware_url) {
    esp_ota_handle_t ota_handle;
    const esp_partition_t *update_partition = esp_ota_get_next_update_partition(NULL);

    ESP_LOGI(TAG, "Target partition: %s", update_partition->label);

    // Bắt đầu OTA vào partition kế tiếp
    esp_err_t ret = esp_ota_begin(update_partition, OTA_WITH_SEQUENTIAL_WRITES, &ota_handle);
    if (ret != ESP_OK) return ret;

    // Download và ghi từng chunk
    esp_http_client_config_t http_cfg = { .url = firmware_url };
    esp_http_client_handle_t http = esp_http_client_init(&http_cfg);
    esp_http_client_open(http, 0);

    char buf[4096];
    int bytes_read;
    while ((bytes_read = esp_http_client_read(http, buf, sizeof(buf))) > 0) {
        ret = esp_ota_write(ota_handle, buf, bytes_read);
        if (ret != ESP_OK) goto cleanup;
    }

    // Kết thúc OTA, set boot partition
    ret = esp_ota_end(ota_handle);
    if (ret != ESP_OK) goto cleanup;

    ret = esp_ota_set_boot_partition(update_partition);
    if (ret != ESP_OK) goto cleanup;

    ESP_LOGI(TAG, "OTA success, rebooting in 3s...");
    vTaskDelay(pdMS_TO_TICKS(3000));
    esp_restart();

cleanup:
    esp_http_client_cleanup(http);
    return ret;
}

// Gọi trong app_main sau khi confirm firmware hoạt động
void mark_ota_valid(void) {
    const esp_partition_t *running = esp_ota_get_running_partition();
    esp_ota_img_states_t ota_state;
    esp_ota_get_state_partition(running, &ota_state);

    if (ota_state == ESP_OTA_IMG_PENDING_VERIFY) {
        // Chạy health checks
        if (all_systems_ok()) {
            esp_ota_mark_app_valid_cancel_rollback();
            ESP_LOGI(TAG, "OTA marked valid");
        } else {
            esp_ota_mark_app_invalid_rollback_and_reboot();
            // ↑ Reboot về firmware cũ
        }
    }
}
```

### Delta OTA (Update nhỏ, tiết kiệm bandwidth)
```
Full OTA: Download toàn bộ firmware (~1.5MB)
Delta OTA: Chỉ download phần thay đổi (~50-200KB)

Tools:
  - JanPatch: C library tạo/apply binary patch
  - ESP Delta OTA: Espressif's delta update lib
  - bsdiff/bspatch: Classic diff/patch tool

Trade-off:
  + Bandwidth tiết kiệm 80-90%
  - Cần compute patch trên server
  - Apply patch cần RAM để reconstruct
  - Phức tạp hơn để implement
```

### Boot Count + Health Check Pattern
```c
// app_main.c — chạy NGAY KHI boot
void check_ota_health(void) {
    // Lấy state của partition đang chạy
    const esp_partition_t *running = esp_ota_get_running_partition();
    esp_ota_img_states_t state;
    esp_ota_get_state_partition(running, &state);

    if (state != ESP_OTA_IMG_PENDING_VERIFY) return;

    // Increment boot count
    uint32_t boot_count = 0;
    nvs_get_u32(nvs_handle, "boot_count", &boot_count);
    boot_count++;
    nvs_set_u32(nvs_handle, "boot_count", boot_count);
    nvs_commit(nvs_handle);

    if (boot_count > 3) {
        ESP_LOGE(TAG, "Too many reboots after OTA — rolling back!");
        esp_ota_mark_app_invalid_rollback_and_reboot();
        // Không return — thiết bị sẽ reboot
    }

    // Chạy health checks sau vài giây
    vTaskDelay(pdMS_TO_TICKS(5000));
    if (health_check_all()) {
        nvs_set_u32(nvs_handle, "boot_count", 0);  // Reset counter
        esp_ota_mark_app_valid_cancel_rollback();
        ESP_LOGI(TAG, "OTA validated successfully");
    }
}
```

---

## Manufacturing Workflow

### Quy trình Batch Flash

```bash
#!/bin/bash
# batch_flash.sh — Flash nhiều devices cùng lúc

FIRMWARE="build/firmware_v1.2.3.bin"
LOG_DIR="flash_logs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

# Tìm tất cả ESP32 kết nối
PORTS=$(ls /dev/ttyUSB* 2>/dev/null)

if [ -z "$PORTS" ]; then
    echo "ERROR: Không tìm thấy thiết bị nào"
    exit 1
fi

PASS=0; FAIL=0

for PORT in $PORTS; do
    echo "Flashing $PORT..."

    esptool.py --chip esp32 \
               --port "$PORT" \
               --baud 921600 \
               write_flash 0x10000 "$FIRMWARE" \
               > "$LOG_DIR/${PORT##*/}.log" 2>&1

    if [ $? -eq 0 ]; then
        echo "  ✓ $PORT — PASS"
        PASS=$((PASS+1))
    else
        echo "  ✗ $PORT — FAIL (xem $LOG_DIR/${PORT##*/}.log)"
        FAIL=$((FAIL+1))
    fi
done

echo ""
echo "Kết quả: $PASS PASS, $FAIL FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1
```

### Serial Number Provisioning
```python
# provision_device.py — Nạp serial number và device credentials
import serial
import json
import uuid
import requests

def provision_device(port, device_type):
    """Nạp unique credentials vào device qua UART provisioning CLI"""
    ser = serial.Serial(port, 115200, timeout=5)

    # Tạo unique ID
    device_id = f"{device_type}-{uuid.uuid4().hex[:8].upper()}"

    # Đăng ký với backend và lấy MQTT credentials
    response = requests.post('https://api.example.com/devices/register', json={
        'device_id': device_id,
        'device_type': device_type
    })
    creds = response.json()

    # Gửi credentials vào device qua provisioning UART CLI
    cmds = [
        f'set device_id {device_id}\n',
        f'set mqtt_user {creds["mqtt_user"]}\n',
        f'set mqtt_pass {creds["mqtt_pass"]}\n',
        f'commit\n',
        f'reboot\n'
    ]

    for cmd in cmds:
        ser.write(cmd.encode())
        response = ser.readline().decode().strip()
        print(f"  {cmd.strip()} → {response}")

    ser.close()
    print(f"Provisioned: {device_id}")
    return device_id
```

### Factory Test Firmware
```
Quy trình:
1. Flash factory_test firmware (riêng, không phải production firmware)
2. Chạy automated test sequence:
   a. Đọc các sensors — verify range
   b. Toggle relay — verify với multimeter/tester
   c. WiFi scan — verify RF antenna
   d. BLE advertise — verify với tester
   e. Flash LED — visual check
3. Nếu pass → ghi serial number, flash production firmware
4. Nếu fail → fail LED pattern, reject device

Factory test firmware output (Serial):
  "FACTORY TEST v1.0"
  "TEST: I2C_SCAN       → PASS (found: 0x44, 0x23)"
  "TEST: ADC_CH0        → PASS (3.28V nominal 3.30V ±0.1V)"
  "TEST: RELAY_1        → PASS"
  "TEST: WIFI_SCAN      → PASS (RSSI -45dBm)"
  "TEST: BLE_ADV        → PASS"
  "ALL TESTS PASSED — READY FOR PROVISIONING"
  "DEVICE_ID: IOT-A3F2B1C9"
```

---

## Firmware Versioning

### Semantic Versioning cho Firmware
```
MAJOR.MINOR.PATCH+BUILD_METADATA

MAJOR: Breaking changes (incompatible protocol, hardware rev change)
MINOR: New features (backward compatible)
PATCH: Bug fixes, security patches

Build metadata:
  1.2.3+build.456           ← Build number
  1.2.3+20240315.abc1234    ← Date + git hash

Ví dụ:
  1.0.0       ← Initial release
  1.1.0       ← New MQTT topics (new feature)
  1.1.1       ← Fix memory leak in sensor task
  1.2.0       ← Add BLE config portal
  2.0.0       ← New hardware revision, different pin map
```

### Version baked vào firmware
```c
// version.h — auto-generated bởi CI/CD
#pragma once

#define FW_VERSION_MAJOR  1
#define FW_VERSION_MINOR  2
#define FW_VERSION_PATCH  3
#define FW_VERSION_STR    "1.2.3"
#define FW_BUILD_DATE     "2024-03-15"
#define FW_GIT_HASH       "abc1234"
#define FW_VERSION_INT    ((1 << 16) | (2 << 8) | 3)  // 0x010203
```

---

## Release Process

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/firmware_release.yml
name: Firmware Build & Release

on:
  push:
    tags:
      - 'v*'  # Trigger khi push tag v1.2.3

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup PlatformIO
        run: pip install platformio

      - name: Build firmware
        run: |
          pio run -e esp32-prod
          # Output: .pio/build/esp32-prod/firmware.bin

      - name: Run unit tests
        run: pio test -e native_test

      - name: Static analysis
        run: cppcheck --error-exitcode=1 src/

      - name: Sign firmware
        run: |
          # Tạo SHA256 hash để verify trên device
          sha256sum .pio/build/esp32-prod/firmware.bin \
            > .pio/build/esp32-prod/firmware.sha256

      - name: Upload to release server
        env:
          OTA_SERVER_TOKEN: ${{ secrets.OTA_SERVER_TOKEN }}
        run: |
          curl -X POST https://ota.example.com/api/releases \
            -H "Authorization: Bearer $OTA_SERVER_TOKEN" \
            -F "firmware=@.pio/build/esp32-prod/firmware.bin" \
            -F "sha256=@.pio/build/esp32-prod/firmware.sha256" \
            -F "version=${{ github.ref_name }}" \
            -F "release_notes=@CHANGELOG.md"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            .pio/build/esp32-prod/firmware.bin
            .pio/build/esp32-prod/firmware.sha256
```

### Rollout Chiến lược
```
Phased rollout cho IoT fleet lớn:

Phase 1 (5%): Beta devices, monitored manually (24h)
  → Nếu không có P0 issues → Phase 2

Phase 2 (25%): General devices, monitored with dashboards (48h)
  → Nếu error rate < 0.1% → Phase 3

Phase 3 (100%): Full rollout
  → Monitor 7 ngày

Rollback trigger:
  - Error rate > 5% sau Phase 1
  - Device offline rate tăng > 10%
  - P0 bug được report

Rollback action:
  - Set current_version về version cũ trên OTA server
  - Devices sẽ nhận notification rollback khi checkin
```

---

## Go-Live Checklist — Firmware Project

### Pre-Release (T-7 ngày)
```
Hardware:
  [ ] PCB design review complete
  [ ] BOM (Bill of Materials) finalized
  [ ] EMC pre-compliance testing (nếu cần CE/FCC)
  [ ] Antenna tuning verified (WiFi RSSI, BLE range)

Firmware:
  [ ] All P0 test cases PASS trên hardware thật
  [ ] OTA rollback tested (upgrade → simulate fail → rollback verify)
  [ ] Watchdog tested (force hang → verify reboot < 10s)
  [ ] Power consumption measured (meet NFR-NNN target)
  [ ] Factory test script complete và validated
  [ ] Provisioning flow tested end-to-end

Infrastructure:
  [ ] OTA server deployed và accessible
  [ ] MQTT broker scaled cho fleet size
  [ ] Monitoring dashboards setup (device online count, error rates)
  [ ] Alerting configured (device offline, high error rate)

Documentation:
  [ ] ADMIN-GUIDE.md (troubleshooting, factory reset, OTA)
  [ ] Flashing instructions
  [ ] Provisioning guide

### Production Go (T-0)
  [ ] Final firmware build từ release tag (không phải development branch)
  [ ] SHA256 hash verified
  [ ] Batch flash 10 devices → run factory test → 100% pass
  [ ] OTA server: set current version = release version
  [ ] Smoke test: 5 devices deployed, monitored 2 giờ
  [ ] Sign-off từ Hardware Lead + Firmware Lead
```

### Post-Deploy Monitoring (T+7 ngày)
```
Theo dõi hàng ngày:
  [ ] Devices online %: Target ≥ 95%
  [ ] OTA success rate: Target ≥ 99%
  [ ] Sensor data flow: Không interruption > 30 phút
  [ ] Error rate: Target < 0.5%
  [ ] Memory (min heap): Trend không giảm theo thời gian
```
