# Embedded Tech Stack Guide — Code Generation

## Tổng quan

Hướng dẫn này cho `/mcv3:code-gen` khi generate code cho firmware/embedded projects. Khác với web/backend, firmware code có các ràng buộc đặc biệt:

- **Không dynamic allocation** trong critical paths
- **Subset C/C++ nghiêm ngặt** — không exceptions, không RTTI
- **Register-level awareness** — code phải biết hardware
- **Deterministic execution** — không garbage collector, không JIT

---

## C cho Embedded — Quy tắc quan trọng

### Nguyên tắc cốt lõi
```c
// KHÔNG dùng trong production firmware:
malloc() / free()       // Heap fragmentation sau thời gian dài
printf()               // Quá nặng — dùng ESP_LOGI / custom log
float trên AVR         // Không có FPU — cực chậm
strcat() / strcpy()    // Buffer overflow risk — dùng strncat/strncpy
recursive functions    // Stack overflow risk trên RAM nhỏ

// NÊN dùng:
static allocation       // Global hoặc function-local static arrays
fixed-size buffers      // char buf[MAX_SIZE] thay vì dynamic string
integer math            // Fixed-point: value * 100 để lưu 2 decimal places
strlcpy() / snprintf()  // Safe string operations
```

### MISRA C Subset thực tế (không full compliance)
```c
// Quy tắc quan trọng nhất:
// 1. Không implicit type conversion gây mất dữ liệu
uint8_t x = 300;  // WRONG: overflow silently
uint16_t x = 300; // CORRECT

// 2. Không dùng goto
// 3. Mọi switch phải có default case
switch (state) {
    case STATE_RUNNING: ...; break;
    case STATE_ERROR:   ...; break;
    default: log_error("Unknown state"); break;  // Bắt buộc
}

// 4. Kiểm tra return value của function quan trọng
esp_err_t ret = nvs_open("storage", NVS_READWRITE, &handle);
if (ret != ESP_OK) {
    ESP_LOGE(TAG, "NVS open failed: %s", esp_err_to_name(ret));
    return ret;
}

// 5. Volatile cho biến shared với ISR
volatile bool data_ready = false;  // ISR set, task read
```

### Fixed-Point Math
```c
// Khi không có FPU (AVR, Cortex-M0):
// Lưu nhiệt độ với 2 decimal places nhân 100
// 28.56°C → lưu là 2856 (int16_t)

int16_t temperature_raw = 2856;  // 28.56°C × 100

// Tính toán: giữ nguyên scale
int16_t avg_temp = (temp1 + temp2) / 2;  // Vẫn × 100 scale

// In ra: chia lại
ESP_LOGI(TAG, "Temp: %d.%02d°C",
    temperature_raw / 100,
    abs(temperature_raw % 100));
// Output: "Temp: 28.56°C"
```

---

## C++ cho Embedded — Quy tắc

### Được phép
```cpp
// Classes và structs: YES
class SensorManager {
public:
    bool init();
    SensorData read();
private:
    I2CDriver& i2c_;  // Reference injection
};

// Templates đơn giản: YES (nhưng cẩn thận code bloat)
template<size_t N>
class RingBuffer {
    T data_[N];  // Fixed size, no heap
};

// Constructors/Destructors: YES (nhưng không virtual destructor nếu không cần)
// Namespaces: YES
// References: YES (safer than raw pointers)
// constexpr: YES (compile-time constants)
```

### Không được phép
```cpp
// Exceptions: NO (overhead quá lớn, cần -fno-exceptions)
try { } catch() { }  // Không dùng

// RTTI: NO (cần -fno-rtti)
dynamic_cast<>        // Không dùng
typeid()              // Không dùng

// STL containers với heap: NO
std::vector<int>      // Heap allocation — không dùng
std::map<>            // Heap + overhead — không dùng
std::string           // Dynamic size — không dùng

// Thay thế:
std::array<int, 10>   // Fixed-size, OK
etl::vector<int, 10>  // Embedded Template Library — fixed capacity
```

---

## PlatformIO — Cấu hình

### `platformio.ini` — ESP32 với ESP-IDF

```ini
[env:esp32-espidf]
platform = espressif32
board = esp32dev
framework = espidf

; Build flags
build_flags =
    -DCORE_DEBUG_LEVEL=3
    -DCONFIG_FREERTOS_UNICORE=0
    -fno-exceptions
    -fno-rtti

; Partition table custom
board_build.partitions = partitions_custom.csv

; Monitor settings
monitor_speed = 115200
monitor_filters = esp32_exception_decoder

; Upload
upload_speed = 921600
```

### `platformio.ini` — ESP32 với Arduino Framework

```ini
[env:esp32-arduino]
platform = espressif32
board = esp32dev
framework = arduino

build_flags =
    -DCORE_DEBUG_LEVEL=3
    -DARDUINO_USB_MODE=1

lib_deps =
    ; Sensor libraries
    SHT3x=https://github.com/Sensirion/arduino-sht
    adafruit/Adafruit BusIO @ ^1.14.0
    ; MQTT
    knolleary/PubSubClient @ ^2.8
    ; JSON
    bblanchon/ArduinoJson @ ^6.21.0

monitor_speed = 115200
upload_speed = 921600
```

### `platformio.ini` — STM32 với HAL

```ini
[env:stm32f407]
platform = ststm32
board = disco_f407vg
framework = stm32cube

; HAL drivers
build_flags =
    -DUSE_HAL_DRIVER
    -DSTM32F407xx
    -DHSE_VALUE=8000000
    -fno-exceptions
    -fno-rtti

; Debugging
debug_tool = stlink
upload_protocol = stlink
```

### `platformio.ini` — Arduino Mega

```ini
[env:megaatmega2560]
platform = atmelavr
board = megaatmega2560
framework = arduino

lib_deps =
    Wire
    SPI
    adafruit/DHT sensor library @ ^1.4.4

monitor_speed = 115200
```

### `platformio.ini` — RP2040 (Raspberry Pi Pico)

```ini
[env:pico]
platform = raspberrypi
board = pico
framework = arduino

; Build flags
build_flags =
    -DBOARD_RP2040
    -DARDUINO_ARCH_RP2040

; Thư viện phổ biến
lib_deps =
    Wire
    SPI
    earlephilhower/ArduinoJson @ ^6.21.0

monitor_speed = 115200
upload_protocol = picotool
```

**RP2040 — Đặc điểm nổi bật:**
- Dual-core Cortex-M0+ (133MHz), 264KB SRAM, không có Flash on-chip (dùng external)
- PIO (Programmable I/O) — lập trình state machine tùy chỉnh cho protocol bất kỳ
- Hỗ trợ cả C/C++ SDK và MicroPython
- Board phổ biến: Raspberry Pi Pico, Pico W (với WiFi), SparkFun Pro Micro RP2040

**RP2040 C SDK — Cấu trúc cơ bản:**

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.13)
include($ENV{PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(my_project C CXX ASM)
pico_sdk_init()

add_executable(my_project main.c)
target_link_libraries(my_project pico_stdlib hardware_i2c hardware_spi)
pico_enable_stdio_usb(my_project 1)   # UART qua USB
pico_add_extra_outputs(my_project)    # Tạo .uf2 file để flash
```

```c
// main.c — RP2040 C SDK
#include "pico/stdlib.h"
#include "hardware/gpio.h"
#include "hardware/adc.h"

#define LED_PIN    25   // Onboard LED
#define SENSOR_PIN 26   // ADC0 = GPIO26

int main(void) {
    stdio_init_all();

    // GPIO setup
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    // ADC setup
    adc_init();
    adc_gpio_init(SENSOR_PIN);
    adc_select_input(0);  // ADC0

    while (true) {
        uint16_t raw = adc_read();           // 0-4095 (12-bit)
        float voltage = raw * 3.3f / 4095.0f;

        gpio_put(LED_PIN, 1);
        sleep_ms(500);
        gpio_put(LED_PIN, 0);
        sleep_ms(500);
    }
    return 0;
}
```

**RP2040 MicroPython:**

```python
# main.py — RP2040 MicroPython (Pico W)
from machine import Pin, ADC, I2C
import network
import time

# WiFi (Pico W)
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect('SSID', 'password')
while not wlan.isconnected():
    time.sleep(0.5)

# GPIO + ADC
led = Pin(25, Pin.OUT)
sensor = ADC(Pin(26))  # ADC0

def read_voltage():
    return sensor.read_u16() * 3.3 / 65535
```

---

## Arduino Framework — Patterns

### setup()/loop() Pattern
```cpp
// Biến global cho trạng thái
static SensorManager sensorMgr;
static MqttClient mqttClient;
static uint32_t lastSampleTime = 0;
static const uint32_t SAMPLE_INTERVAL_MS = 5000;

void setup() {
    Serial.begin(115200);
    Serial.println("Booting...");

    // Init hardware theo thứ tự
    if (!sensorMgr.init()) {
        Serial.println("ERROR: Sensor init failed");
        // Không halt — tiếp tục với limited functionality
    }

    // Connect WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    uint32_t wifiTimeout = millis() + 10000;
    while (WiFi.status() != WL_CONNECTED && millis() < wifiTimeout) {
        delay(500);
    }

    Serial.println("Ready");
}

void loop() {
    uint32_t now = millis();

    // Non-blocking periodic tasks
    if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
        lastSampleTime = now;
        sampleAndSend();
    }

    // Các tasks khác không blocking
    mqttClient.loop();
    handleButtons();

    // KHÔNG dùng delay() — sẽ block tất cả tasks
}
```

### ISR Conventions
```cpp
// ISR phải ngắn — chỉ set flag hoặc push to buffer
volatile bool buttonPressed = false;
volatile uint32_t isrTimestamp = 0;

void IRAM_ATTR buttonISR() {  // IRAM_ATTR: chạy từ RAM (không bị cache miss)
    buttonPressed = true;
    isrTimestamp = millis();
    // KHÔNG: Serial.print, Wire.read, delay, allocate memory
}

// Trong loop() hoặc task:
if (buttonPressed) {
    buttonPressed = false;  // Clear flag trước khi xử lý
    uint32_t ts = isrTimestamp;
    handleButtonPress(ts);
}
```

### millis() vs delay()
```cpp
// WRONG: blocking delay
void wrongApproach() {
    digitalWrite(LED, HIGH);
    delay(1000);  // Blocked! Không thể làm gì khác
    digitalWrite(LED, LOW);
}

// CORRECT: non-blocking với millis()
static uint32_t ledOnTime = 0;
static bool ledState = false;

void correctApproach() {
    if (!ledState && millis() - ledOnTime > 1000) {
        digitalWrite(LED, HIGH);
        ledState = true;
        ledOnTime = millis();
    } else if (ledState && millis() - ledOnTime > 1000) {
        digitalWrite(LED, LOW);
        ledState = false;
        ledOnTime = millis();
    }
}
```

---

## ESP-IDF — Patterns

### Task Creation Pattern
```c
// task.h
#pragma once
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

// Task handle để có thể delete sau nếu cần
static TaskHandle_t sensor_task_handle = NULL;

// Task function prototype
void sensor_task(void *pvParameters);

// task.c
#define TAG "sensor_task"
#define TASK_STACK_SIZE  4096
#define TASK_PRIORITY    5

void sensor_task_init(void) {
    BaseType_t ret = xTaskCreatePinnedToCore(
        sensor_task,        // Function
        "sensor_task",      // Name (debug)
        TASK_STACK_SIZE,    // Stack bytes
        NULL,               // Parameters
        TASK_PRIORITY,      // Priority
        &sensor_task_handle, // Handle
        0                   // Core (0 hoặc 1)
    );

    if (ret != pdPASS) {
        ESP_LOGE(TAG, "Task creation failed!");
        // Handle error — có thể restart
    }
}

void sensor_task(void *pvParameters) {
    ESP_LOGI(TAG, "Started");

    while (1) {
        // Đo sensors
        SensorData_t data = read_all_sensors();

        // Gửi vào queue (block 100ms nếu queue đầy)
        if (xQueueSend(sensor_data_queue, &data, pdMS_TO_TICKS(100)) != pdTRUE) {
            ESP_LOGW(TAG, "Queue full — dropped sample");
        }

        // Wait theo period
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
    // Không bao giờ reach ở đây
    vTaskDelete(NULL);  // Xóa chính mình nếu cần exit
}
```

### NVS Read/Write Pattern
```c
#include "nvs_flash.h"
#include "nvs.h"

#define NVS_NAMESPACE "app_config"

typedef struct {
    char wifi_ssid[32];
    char wifi_pass[64];
    uint32_t sample_interval_sec;
    int16_t temp_threshold;
} AppConfig_t;

// Load config từ NVS, dùng defaults nếu chưa có
esp_err_t config_load(AppConfig_t *cfg) {
    // Defaults
    strncpy(cfg->wifi_ssid, "", sizeof(cfg->wifi_ssid));
    strncpy(cfg->wifi_pass, "", sizeof(cfg->wifi_pass));
    cfg->sample_interval_sec = 60;
    cfg->temp_threshold = 3000;  // 30.00°C × 100

    nvs_handle_t handle;
    esp_err_t ret = nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle);
    if (ret == ESP_ERR_NVS_NOT_FOUND) {
        return ESP_OK;  // Chưa có → dùng defaults
    }
    if (ret != ESP_OK) return ret;

    size_t ssid_len = sizeof(cfg->wifi_ssid);
    nvs_get_str(handle, "wifi_ssid", cfg->wifi_ssid, &ssid_len);

    size_t pass_len = sizeof(cfg->wifi_pass);
    nvs_get_str(handle, "wifi_pass", cfg->wifi_pass, &pass_len);

    nvs_get_u32(handle, "sample_interval", &cfg->sample_interval_sec);
    nvs_get_i16(handle, "temp_threshold", &cfg->temp_threshold);

    nvs_close(handle);
    return ESP_OK;
}

esp_err_t config_save(const AppConfig_t *cfg) {
    nvs_handle_t handle;
    esp_err_t ret = nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle);
    if (ret != ESP_OK) return ret;

    nvs_set_str(handle, "wifi_ssid", cfg->wifi_ssid);
    nvs_set_str(handle, "wifi_pass", cfg->wifi_pass);
    nvs_set_u32(handle, "sample_interval", cfg->sample_interval_sec);
    nvs_set_i16(handle, "temp_threshold", cfg->temp_threshold);

    ret = nvs_commit(handle);  // Quan trọng: commit để write thực sự
    nvs_close(handle);
    return ret;
}
```

### WiFi Provisioning (BLE-based)
```c
// Dùng ESP-IDF Unified Provisioning
#include "wifi_provisioning/manager.h"
#include "wifi_provisioning/scheme_ble.h"

void start_provisioning(void) {
    wifi_prov_mgr_config_t config = {
        .scheme = wifi_prov_scheme_ble,
        .scheme_event_handler = WIFI_PROV_SCHEME_BLE_EVENT_HANDLER_FREE_BTDM
    };

    wifi_prov_mgr_init(config);

    bool provisioned = false;
    wifi_prov_mgr_is_provisioned(&provisioned);

    if (!provisioned) {
        ESP_LOGI(TAG, "Starting BLE provisioning...");
        char service_name[16];
        snprintf(service_name, sizeof(service_name), "PROV_%s", device_id);
        wifi_prov_mgr_start_provisioning(
            WIFI_PROV_SECURITY_1,
            NULL,  // pop (proof of possession) — NULL for demo
            service_name,
            NULL   // service_key
        );
    } else {
        wifi_prov_mgr_deinit();
        // Connect với stored credentials
        wifi_connect();
    }
}
```

---

## STM32 HAL — Patterns

### GPIO Init Pattern
```c
// gpio.c — Generated bởi STM32CubeMX, customize thêm
#include "gpio.h"

void MX_GPIO_Init(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};

    // Enable clocks trước khi dùng GPIO
    __HAL_RCC_GPIOA_CLK_ENABLE();
    __HAL_RCC_GPIOB_CLK_ENABLE();
    __HAL_RCC_GPIOC_CLK_ENABLE();

    // LED output
    HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);
    GPIO_InitStruct.Pin = LED_Pin;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    HAL_GPIO_Init(LED_GPIO_Port, &GPIO_InitStruct);

    // Button input với interrupt
    GPIO_InitStruct.Pin = BUTTON_Pin;
    GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;  // Falling edge trigger
    GPIO_InitStruct.Pull = GPIO_PULLUP;
    HAL_GPIO_Init(BUTTON_GPIO_Port, &GPIO_InitStruct);

    // Enable EXTI interrupt
    HAL_NVIC_SetPriority(EXTI0_IRQn, 0, 0);
    HAL_NVIC_EnableIRQ(EXTI0_IRQn);
}

// interrupt handler
void EXTI0_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(BUTTON_Pin);  // HAL clears flag
}

// HAL callback (override weak function)
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == BUTTON_Pin) {
        button_pressed_flag = true;  // Set flag, process in main loop
    }
}
```

### I2C Sensor Read (HAL)
```c
// Đọc SHT30 qua I2C
#include "i2c.h"

#define SHT30_ADDR    (0x44 << 1)  // HAL dùng 8-bit address (shift left 1)
#define SHT30_CMD_MEASURE_HIGH  0x2C06  // Single shot, high repeatability

esp_err_t sht30_read(float *temp, float *humidity) {
    uint8_t cmd[2] = {0x2C, 0x06};
    uint8_t data[6];

    // Gửi measurement command
    HAL_StatusTypeDef ret = HAL_I2C_Master_Transmit(
        &hi2c1, SHT30_ADDR, cmd, 2, HAL_MAX_DELAY);
    if (ret != HAL_OK) return ESP_FAIL;

    // Chờ measurement (SHT30 cần ~15ms ở high repeatability)
    HAL_Delay(20);

    // Đọc 6 bytes kết quả
    ret = HAL_I2C_Master_Receive(
        &hi2c1, SHT30_ADDR, data, 6, HAL_MAX_DELAY);
    if (ret != HAL_OK) return ESP_FAIL;

    // Parse raw data
    uint16_t raw_temp = (data[0] << 8) | data[1];
    uint16_t raw_hum  = (data[3] << 8) | data[4];

    // Convert (theo datasheet)
    *temp     = -45.0f + 175.0f * ((float)raw_temp / 65535.0f);
    *humidity = 100.0f * ((float)raw_hum / 65535.0f);

    return ESP_OK;
}
```

---

## FreeRTOS — Patterns

### Queue Pattern (ISR → Task)
```c
// QUAN TRỌNG: Không xử lý trực tiếp trong ISR
// Pattern đúng: ISR → Queue → Task

// Định nghĩa ở global scope
QueueHandle_t adc_queue;
#define ADC_QUEUE_SIZE 10

typedef struct {
    uint16_t raw_value;
    uint32_t timestamp;
    uint8_t  channel;
} AdcSample_t;

// Init (gọi trong app_main hoặc setup)
void queues_init(void) {
    adc_queue = xQueueCreate(ADC_QUEUE_SIZE, sizeof(AdcSample_t));
    configASSERT(adc_queue != NULL);  // Crash nếu tạo queue fail
}

// ISR — gửi vào queue
void IRAM_ATTR adc_conversion_done_isr(void) {
    AdcSample_t sample = {
        .raw_value = adc_get_raw_isr(),
        .timestamp = esp_timer_get_time(),  // ISR-safe
        .channel   = 0
    };

    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xQueueSendFromISR(adc_queue, &sample, &xHigherPriorityTaskWoken);

    // Nếu task với priority cao hơn đang block chờ queue này → yield
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

// Task — nhận từ queue và xử lý
void adc_processing_task(void *pvParam) {
    AdcSample_t sample;

    while (1) {
        // Block đến khi có item trong queue (không timeout)
        if (xQueueReceive(adc_queue, &sample, portMAX_DELAY) == pdTRUE) {
            float voltage = (float)sample.raw_value * 3.3f / 4095.0f;
            process_voltage_reading(voltage, sample.channel);
        }
    }
}
```

### Mutex Pattern
```c
// Protect shared resource (I2C bus)
static SemaphoreHandle_t i2c_mutex = NULL;

void i2c_mutex_init(void) {
    i2c_mutex = xSemaphoreCreateMutex();
    configASSERT(i2c_mutex != NULL);
}

// Wrapper function — tất cả I2C access qua đây
esp_err_t i2c_read_bytes(uint8_t dev_addr, uint8_t reg, uint8_t *buf, size_t len) {
    if (xSemaphoreTake(i2c_mutex, pdMS_TO_TICKS(1000)) != pdTRUE) {
        ESP_LOGE(TAG, "I2C mutex timeout!");
        return ESP_ERR_TIMEOUT;
    }

    esp_err_t ret = i2c_master_read_register(dev_addr, reg, buf, len);

    xSemaphoreGive(i2c_mutex);
    return ret;
}
```

### Software Timer Pattern
```c
#include "freertos/timers.h"

static TimerHandle_t blink_timer = NULL;
static bool led_state = false;

void led_timer_callback(TimerHandle_t xTimer) {
    led_state = !led_state;
    gpio_set_level(LED_GPIO, led_state ? 1 : 0);
}

void blink_start(uint32_t interval_ms) {
    if (blink_timer == NULL) {
        blink_timer = xTimerCreate(
            "blink_timer",              // Name
            pdMS_TO_TICKS(interval_ms), // Period
            pdTRUE,                     // Auto-reload
            NULL,                       // Timer ID
            led_timer_callback          // Callback
        );
    }
    xTimerStart(blink_timer, 0);
}

void blink_stop(void) {
    if (blink_timer) xTimerStop(blink_timer, 0);
    gpio_set_level(LED_GPIO, 0);  // LED off khi stop
}
```

---

## MicroPython — Patterns

### asyncio cho Embedded
```python
import asyncio
import machine
import time

# Async task cho sensor reading
async def sensor_task(sensor, queue):
    while True:
        try:
            temp, humidity = sensor.measurements
            await queue.put({'temp': temp, 'hum': humidity, 'ts': time.ticks_ms()})
        except Exception as e:
            print(f"Sensor error: {e}")
        await asyncio.sleep(5)  # Non-blocking wait 5s

# Async task cho MQTT publish
async def mqtt_task(client, queue):
    while True:
        data = await queue.get()
        try:
            payload = f'{{"temp":{data["temp"]:.1f},"hum":{data["hum"]:.1f}}}'
            await client.publish('sensors/data', payload, qos=1)
        except Exception as e:
            print(f"MQTT error: {e}")
            # Reconnect logic...
        await asyncio.sleep(0)

# Main
async def main():
    import sht30
    sensor = sht30.SHT30(scl=22, sda=21)
    queue = asyncio.Queue(10)

    await asyncio.gather(
        sensor_task(sensor, queue),
        mqtt_task(mqtt_client, queue),
        watchdog_task()
    )

asyncio.run(main())
```

### machine module
```python
from machine import Pin, ADC, PWM, I2C, SPI, UART
import time

# GPIO
led = Pin(2, Pin.OUT)
button = Pin(0, Pin.IN, Pin.PULL_UP)  # Pull-up, active LOW

# ADC (ESP32: GPIO32-39)
adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)  # 0-3.6V range
raw = adc.read()           # 0-4095
voltage = raw * 3.3 / 4095

# PWM
pwm = PWM(Pin(16), freq=50)   # 50Hz for servo
pwm.duty(77)                  # 77/1023 ≈ 7.5% = 1.5ms pulse (center)

# I2C
i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)
devices = i2c.scan()           # [0x44, 0x23, ...]

# Đọc register
data = i2c.readfrom_mem(0x44, 0x00, 6)  # addr, reg, num_bytes

# UART
uart = UART(2, baudrate=9600, tx=17, rx=16)
uart.write('Hello\r\n')
if uart.any():
    line = uart.readline()
```
