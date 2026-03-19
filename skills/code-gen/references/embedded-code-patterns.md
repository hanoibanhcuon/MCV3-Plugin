# Embedded Code Patterns — Code Generation Templates

## Mục đích

Tập hợp các code patterns chuẩn để `/mcv3:code-gen` sinh scaffolding firmware. Mỗi pattern là skeleton có thể customize theo FIRMWARE-MODSPEC.

---

## 1. Module Skeleton (C — Header + Implementation)

### `{module}.h`
```c
/**
 * {MODULE_NAME} — {Mô tả ngắn}
 *
 * @module {sys}/{mod}
 * @req-ids FT-{MOD}-001, FT-{MOD}-002
 * @version 1.0.0
 */
#pragma once

#include <stdint.h>
#include <stdbool.h>
#include "esp_err.h"     // Hoặc HAL_StatusTypeDef cho STM32

#ifdef __cplusplus
extern "C" {
#endif

/* ============================================================
 * Kiểu dữ liệu
 * ============================================================ */

/** Dữ liệu sensor từ module {MOD} */
typedef struct {
    int16_t temperature_x100;  /**< Nhiệt độ × 100 (VD: 2856 = 28.56°C) */
    uint8_t humidity_pct;      /**< Độ ẩm (0-100%) */
    uint32_t timestamp_ms;     /**< Thời gian đọc (ms từ boot) */
    bool valid;                /**< true nếu dữ liệu hợp lệ */
} {Mod}Data_t;

/** Cấu hình module {MOD} */
typedef struct {
    uint32_t sample_interval_ms; /**< Chu kỳ lấy mẫu */
    uint8_t  i2c_address;        /**< Địa chỉ I2C của sensor */
    bool     auto_start;         /**< Tự động start khi init */
} {Mod}Config_t;

/** Trạng thái module */
typedef enum {
    {MOD_UPPER}_STATE_UNINIT = 0,
    {MOD_UPPER}_STATE_IDLE,
    {MOD_UPPER}_STATE_RUNNING,
    {MOD_UPPER}_STATE_ERROR
} {Mod}State_t;

/* ============================================================
 * API
 * ============================================================ */

/**
 * Khởi tạo module với cấu hình cho trước.
 * Phải gọi trước tất cả function khác.
 *
 * @param config  Cấu hình, NULL dùng defaults
 * @return ESP_OK nếu thành công
 */
esp_err_t {mod}_init(const {Mod}Config_t *config);

/**
 * Đọc dữ liệu hiện tại từ sensor.
 * Thread-safe: dùng mutex nội bộ.
 *
 * @param[out] data  Kết quả đọc
 * @return ESP_OK nếu dữ liệu hợp lệ
 */
esp_err_t {mod}_read({Mod}Data_t *data);

/**
 * Bắt đầu lấy mẫu định kỳ theo config.sample_interval_ms.
 */
esp_err_t {mod}_start(void);

/** Dừng lấy mẫu định kỳ */
void {mod}_stop(void);

/** Lấy trạng thái hiện tại */
{Mod}State_t {mod}_get_state(void);

/** Xóa lỗi và reset về IDLE state */
void {mod}_clear_error(void);

#ifdef __cplusplus
}
#endif
```

### `{module}.c`
```c
/**
 * {MODULE_NAME} Implementation
 *
 * @req-ids FT-{MOD}-001, FT-{MOD}-002
 */
#include "{mod}.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "driver/i2c.h"

static const char *TAG = "{MOD}";

/* Giá trị mặc định */
static const {Mod}Config_t DEFAULT_CONFIG = {
    .sample_interval_ms = 5000,
    .i2c_address        = 0x44,
    .auto_start         = false
};

/* State nội bộ */
static struct {
    {Mod}Config_t  config;
    {Mod}Data_t    last_data;
    {Mod}State_t   state;
    SemaphoreHandle_t mutex;
    uint8_t error_count;
} s_{mod};  // Prefix s_ cho static module state

/* ============================================================
 * Private functions
 * ============================================================ */

static esp_err_t read_sensor_raw(int16_t *temp_x100, uint8_t *humidity) {
    // TODO: Implement theo FIRMWARE-MODSPEC PIN/PERIPH specs
    // Ví dụ: I2C read từ SHT30
    uint8_t cmd[2] = {0x2C, 0x06};
    uint8_t data[6];

    esp_err_t ret = i2c_master_write_read_device(
        I2C_NUM_0,
        s_{mod}.config.i2c_address,
        cmd, sizeof(cmd),
        data, sizeof(data),
        pdMS_TO_TICKS(100)
    );

    if (ret != ESP_OK) return ret;

    uint16_t raw_t = (data[0] << 8) | data[1];
    uint16_t raw_h = (data[3] << 8) | data[4];

    // Convert với fixed-point (tránh float)
    // temp (°C × 100) = -4500 + 17500 × raw_t / 65535
    *temp_x100 = (int16_t)(-4500 + (int32_t)17500 * raw_t / 65535);
    *humidity  = (uint8_t)(100 * raw_h / 65535);

    return ESP_OK;
}

/* ============================================================
 * Public API
 * ============================================================ */

esp_err_t {mod}_init(const {Mod}Config_t *config) {
    if (s_{mod}.state != {MOD_UPPER}_STATE_UNINIT) {
        ESP_LOGW(TAG, "Already initialized");
        return ESP_OK;
    }

    s_{mod}.config = (config != NULL) ? *config : DEFAULT_CONFIG;
    s_{mod}.error_count = 0;

    s_{mod}.mutex = xSemaphoreCreateMutex();
    if (s_{mod}.mutex == NULL) {
        ESP_LOGE(TAG, "Mutex creation failed");
        return ESP_ERR_NO_MEM;
    }

    // TODO: Verify sensor presence (đọc chip ID nếu có)

    s_{mod}.state = {MOD_UPPER}_STATE_IDLE;
    ESP_LOGI(TAG, "Initialized OK (addr=0x%02X, interval=%lums)",
             s_{mod}.config.i2c_address,
             s_{mod}.config.sample_interval_ms);

    if (s_{mod}.config.auto_start) {
        return {mod}_start();
    }
    return ESP_OK;
}

esp_err_t {mod}_read({Mod}Data_t *data) {
    if (data == NULL) return ESP_ERR_INVALID_ARG;
    if (s_{mod}.state == {MOD_UPPER}_STATE_UNINIT) return ESP_ERR_INVALID_STATE;

    if (xSemaphoreTake(s_{mod}.mutex, pdMS_TO_TICKS(500)) != pdTRUE) {
        ESP_LOGE(TAG, "Mutex timeout");
        return ESP_ERR_TIMEOUT;
    }

    int16_t temp; uint8_t hum;
    esp_err_t ret = read_sensor_raw(&temp, &hum);

    if (ret == ESP_OK) {
        s_{mod}.last_data.temperature_x100 = temp;
        s_{mod}.last_data.humidity_pct     = hum;
        s_{mod}.last_data.timestamp_ms     = xTaskGetTickCount() * portTICK_PERIOD_MS;
        s_{mod}.last_data.valid            = true;
        s_{mod}.error_count = 0;
        *data = s_{mod}.last_data;
    } else {
        s_{mod}.error_count++;
        ESP_LOGW(TAG, "Read failed (%d/3): %s",
                 s_{mod}.error_count, esp_err_to_name(ret));
        if (s_{mod}.error_count >= 3) {
            s_{mod}.state = {MOD_UPPER}_STATE_ERROR;
            // TODO: Gửi event lên event bus
        }
        // Trả về last known good data
        s_{mod}.last_data.valid = false;
        *data = s_{mod}.last_data;
    }

    xSemaphoreGive(s_{mod}.mutex);
    return ret;
}
```

---

## 2. FreeRTOS Task Skeleton

```c
/**
 * {task_name}_task — {Mô tả nhiệm vụ}
 *
 * @req-ids FT-{MOD}-NNN
 * @task-id TASK-{SYS}-NNN
 * @priority {N}
 * @stack {N}KB
 * @core {0/1}
 */
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_log.h"

static const char *TAG = "{task_name}";

// Extern queues/semaphores được tạo ở main
extern QueueHandle_t g_{task_name}_queue;

// Task config
#define {TASK_NAME}_STACK_SIZE   4096
#define {TASK_NAME}_PRIORITY     5
#define {TASK_NAME}_PERIOD_MS    5000
#define {TASK_NAME}_CORE         0

static TaskHandle_t s_task_handle = NULL;

// Forward declarations
static void on_data_received(const {DataType}_t *data);
static bool check_preconditions(void);

void {task_name}_task(void *pvParameters) {
    ESP_LOGI(TAG, "Task started (core=%d)", xPortGetCoreID());

    // Initialization nội bộ task
    if (!check_preconditions()) {
        ESP_LOGE(TAG, "Precondition failed — task exiting");
        vTaskDelete(NULL);
        return;
    }

    {DataType}_t data;
    TickType_t last_wake_time = xTaskGetTickCount();

    while (1) {
        // Option A: Periodic task (dùng vTaskDelayUntil để đúng period)
        vTaskDelayUntil(&last_wake_time, pdMS_TO_TICKS({TASK_NAME}_PERIOD_MS));
        // TODO: Thực hiện công việc định kỳ
        on_data_received(NULL);

        // Option B: Event-driven task (block chờ queue)
        // if (xQueueReceive(g_{task_name}_queue, &data, portMAX_DELAY) == pdTRUE) {
        //     on_data_received(&data);
        // }

        // Stack watermark monitoring (debug build)
#ifdef CONFIG_DEBUG_BUILD
        UBaseType_t watermark = uxTaskGetStackHighWaterMark(NULL);
        if (watermark < 256) {  // <256 words = stack nguy hiểm
            ESP_LOGW(TAG, "Stack watermark low: %u words", watermark);
        }
#endif
    }
}

void {task_name}_init(void) {
    BaseType_t ret = xTaskCreatePinnedToCore(
        {task_name}_task,
        "{task_name}",
        {TASK_NAME}_STACK_SIZE,
        NULL,
        {TASK_NAME}_PRIORITY,
        &s_task_handle,
        {TASK_NAME}_CORE
    );
    configASSERT(ret == pdPASS);
}

static void on_data_received(const {DataType}_t *data) {
    // TODO: Xử lý data
    // REQ-ID: FT-{MOD}-NNN
}

static bool check_preconditions(void) {
    // TODO: Kiểm tra hardware đã init, queues có sẵn, v.v.
    return true;
}
```

---

## 3. HAL Wrapper Pattern (Tách biệt hardware)

### `hal_i2c.h` — Hardware Abstraction Interface
```c
/**
 * HAL I2C — Abstract interface cho I2C operations
 * Giúp mock trong unit tests mà không cần hardware thật
 */
#pragma once
#include <stdint.h>
#include <stddef.h>
#include "esp_err.h"

/** Viết bytes tới I2C device */
esp_err_t hal_i2c_write(uint8_t dev_addr, const uint8_t *data, size_t len);

/** Đọc bytes từ I2C device */
esp_err_t hal_i2c_read(uint8_t dev_addr, uint8_t *data, size_t len);

/** Ghi lệnh rồi đọc kết quả (write-then-read) */
esp_err_t hal_i2c_write_read(uint8_t dev_addr,
                              const uint8_t *wr_buf, size_t wr_len,
                              uint8_t *rd_buf, size_t rd_len);
```

### `hal_i2c_esp32.c` — ESP32 Implementation
```c
#include "hal_i2c.h"
#include "driver/i2c.h"

#define I2C_PORT I2C_NUM_0
#define I2C_TIMEOUT_MS 100

esp_err_t hal_i2c_write(uint8_t dev_addr, const uint8_t *data, size_t len) {
    return i2c_master_write_to_device(
        I2C_PORT, dev_addr, data, len, pdMS_TO_TICKS(I2C_TIMEOUT_MS));
}

esp_err_t hal_i2c_read(uint8_t dev_addr, uint8_t *data, size_t len) {
    return i2c_master_read_from_device(
        I2C_PORT, dev_addr, data, len, pdMS_TO_TICKS(I2C_TIMEOUT_MS));
}

esp_err_t hal_i2c_write_read(uint8_t dev_addr,
                               const uint8_t *wr_buf, size_t wr_len,
                               uint8_t *rd_buf, size_t rd_len) {
    return i2c_master_write_read_device(
        I2C_PORT, dev_addr,
        wr_buf, wr_len,
        rd_buf, rd_len,
        pdMS_TO_TICKS(I2C_TIMEOUT_MS));
}
```

---

## 4. State Machine — Function Pointer Table Pattern

```c
/**
 * State Machine implementation cho Device Lifecycle
 * @sm-id SM-{SYS}-001
 * @req-ids FT-{MOD}-NNN
 */
#include "device_fsm.h"
#include "esp_log.h"

static const char *TAG = "device_fsm";

/* ============================================================
 * State handler prototypes
 * ============================================================ */
static void on_enter_init(void);
static void on_enter_connecting(void);
static void on_enter_running(void);
static void on_enter_error(void);
static void on_enter_sleep(void);

typedef void (*StateEnterFn)(void);

/* Bảng transition: indexed by [current_state][event] */
typedef struct {
    DeviceState_t next_state;
    StateEnterFn  on_enter;
} Transition_t;

/* Transition table — map (state, event) → (next_state, action) */
static const Transition_t TRANSITIONS[STATE_COUNT][EVT_COUNT] = {
    /* STATE_INIT */
    [STATE_INIT][EVT_INIT_DONE]       = { STATE_CONNECTING, on_enter_connecting },
    [STATE_INIT][EVT_FACTORY_RESET]   = { STATE_INIT,       on_enter_init       },

    /* STATE_CONNECTING */
    [STATE_CONNECTING][EVT_WIFI_OK]   = { STATE_RUNNING, on_enter_running },
    [STATE_CONNECTING][EVT_WIFI_FAIL] = { STATE_ERROR,   on_enter_error   },

    /* STATE_RUNNING */
    [STATE_RUNNING][EVT_SENSOR_ERROR] = { STATE_ERROR,   on_enter_error   },
    [STATE_RUNNING][EVT_SLEEP_CMD]    = { STATE_SLEEP,   on_enter_sleep   },

    /* STATE_ERROR */
    [STATE_ERROR][EVT_RESET]          = { STATE_INIT, on_enter_init },

    /* STATE_SLEEP */
    [STATE_SLEEP][EVT_WAKE]           = { STATE_INIT, on_enter_init },
};

static DeviceState_t s_current_state = STATE_INIT;

/* ============================================================
 * FSM Engine
 * ============================================================ */

void fsm_dispatch(DeviceEvent_t event) {
    if (event >= EVT_COUNT || s_current_state >= STATE_COUNT) return;

    const Transition_t *t = &TRANSITIONS[s_current_state][event];

    if (t->on_enter == NULL) {
        ESP_LOGD(TAG, "No transition: state=%d, event=%d", s_current_state, event);
        return;
    }

    ESP_LOGI(TAG, "Transition: %d → %d (event=%d)",
             s_current_state, t->next_state, event);

    s_current_state = t->next_state;
    t->on_enter();  // Gọi action khi enter state mới
}

DeviceState_t fsm_get_state(void) { return s_current_state; }

/* ============================================================
 * State entry handlers
 * ============================================================ */

static void on_enter_init(void) {
    ESP_LOGI(TAG, "→ INIT");
    // TODO: Khởi động lại peripherals nếu cần
    led_blink_start(500);  // Blink 500ms = đang init
}

static void on_enter_connecting(void) {
    ESP_LOGI(TAG, "→ CONNECTING");
    // TODO: Start WiFi connect sequence
    led_blink_start(200);  // Fast blink = đang connect
    wifi_connect_async();
}

static void on_enter_running(void) {
    ESP_LOGI(TAG, "→ RUNNING");
    led_set_solid(true);   // Solid on = running OK
    // TODO: Resume sensor sampling
    sensor_manager_start();
}

static void on_enter_error(void) {
    ESP_LOGE(TAG, "→ ERROR");
    led_blink_start(100);  // Very fast blink = error
    // TODO: Log error details, attempt auto-recovery sau 30s
}

static void on_enter_sleep(void) {
    ESP_LOGI(TAG, "→ SLEEP");
    // TODO: Flush data, lưu state, vào deep sleep
    data_manager_flush();
    esp_deep_sleep(60 * 1000000ULL);  // 60 giây
}
```

---

## 5. Circular Buffer (Data Logging)

```c
/**
 * Circular buffer thread-safe cho data logging
 * @req-ids FT-{MOD}-NNN (data buffering khi offline)
 */
#pragma once
#include <stdint.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"

#define RING_BUFFER_SIZE 100  // Số lượng samples tối đa

typedef struct {
    float    temperature;
    float    humidity;
    uint32_t timestamp;
} SensorSample_t;

typedef struct {
    SensorSample_t data[RING_BUFFER_SIZE];
    uint16_t       head;     // Write position
    uint16_t       tail;     // Read position
    uint16_t       count;    // Số items hiện tại
    uint32_t       dropped;  // Số samples bị drop khi đầy
    SemaphoreHandle_t mutex;
} RingBuffer_t;

void     ring_buffer_init(RingBuffer_t *rb);
bool     ring_buffer_push(RingBuffer_t *rb, const SensorSample_t *sample);
bool     ring_buffer_pop(RingBuffer_t *rb, SensorSample_t *sample);
bool     ring_buffer_peek(RingBuffer_t *rb, SensorSample_t *sample);
uint16_t ring_buffer_count(RingBuffer_t *rb);
bool     ring_buffer_is_full(RingBuffer_t *rb);

// Implementation
void ring_buffer_init(RingBuffer_t *rb) {
    rb->head = rb->tail = rb->count = rb->dropped = 0;
    rb->mutex = xSemaphoreCreateMutex();
}

bool ring_buffer_push(RingBuffer_t *rb, const SensorSample_t *sample) {
    if (xSemaphoreTake(rb->mutex, pdMS_TO_TICKS(100)) != pdTRUE) return false;

    if (rb->count >= RING_BUFFER_SIZE) {
        // Overwrite oldest — advance tail
        rb->tail = (rb->tail + 1) % RING_BUFFER_SIZE;
        rb->dropped++;
    } else {
        rb->count++;
    }

    rb->data[rb->head] = *sample;
    rb->head = (rb->head + 1) % RING_BUFFER_SIZE;

    xSemaphoreGive(rb->mutex);
    return true;
}

bool ring_buffer_pop(RingBuffer_t *rb, SensorSample_t *sample) {
    if (xSemaphoreTake(rb->mutex, pdMS_TO_TICKS(100)) != pdTRUE) return false;
    if (rb->count == 0) { xSemaphoreGive(rb->mutex); return false; }

    *sample = rb->data[rb->tail];
    rb->tail = (rb->tail + 1) % RING_BUFFER_SIZE;
    rb->count--;

    xSemaphoreGive(rb->mutex);
    return true;
}
```

---

## 6. GPIO Debounce Pattern

```c
/**
 * Software debounce cho button inputs
 * @req-ids FT-{MOD}-NNN (button input)
 */
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"
#include "driver/gpio.h"

#define DEBOUNCE_MS     50
#define LONG_PRESS_MS   2000

typedef void (*ButtonCallback_t)(bool long_press);

typedef struct {
    gpio_num_t      pin;
    TimerHandle_t   debounce_timer;
    TickType_t      press_time;
    ButtonCallback_t callback;
    bool            last_state;
} Button_t;

static void debounce_timer_cb(TimerHandle_t timer) {
    Button_t *btn = (Button_t *)pvTimerGetTimerID(timer);
    bool current = (gpio_get_level(btn->pin) == 0);  // Active LOW

    if (current != btn->last_state) {
        btn->last_state = current;
        if (current) {
            // Button pressed — ghi nhận thời gian
            btn->press_time = xTaskGetTickCount();
        } else {
            // Button released — tính duration
            uint32_t duration_ms =
                (xTaskGetTickCount() - btn->press_time) * portTICK_PERIOD_MS;
            if (btn->callback) {
                btn->callback(duration_ms >= LONG_PRESS_MS);
            }
        }
    }
}

static void IRAM_ATTR gpio_isr_handler(void *arg) {
    Button_t *btn = (Button_t *)arg;
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    // Reset timer mỗi khi có edge (debounce)
    xTimerResetFromISR(btn->debounce_timer, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

esp_err_t button_init(Button_t *btn, gpio_num_t pin, ButtonCallback_t cb) {
    btn->pin = pin;
    btn->callback = cb;
    btn->last_state = false;

    // Timer một lần, ID = con trỏ button struct
    btn->debounce_timer = xTimerCreate("debounce",
        pdMS_TO_TICKS(DEBOUNCE_MS), pdFALSE, btn, debounce_timer_cb);
    if (!btn->debounce_timer) return ESP_ERR_NO_MEM;

    gpio_config_t cfg = {
        .pin_bit_mask = 1ULL << pin,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .intr_type = GPIO_INTR_ANYEDGE,
    };
    gpio_config(&cfg);
    gpio_isr_handler_add(pin, gpio_isr_handler, btn);
    return ESP_OK;
}
```

---

## 7. Moving Average Filter (Sensor Smoothing)

```c
/**
 * Moving average filter — giảm noise từ sensor
 * @req-ids FT-{MOD}-NNN (sensor data quality)
 */
#define MA_WINDOW_SIZE 8  // Số samples trong window (phải là power of 2)

typedef struct {
    int32_t  buffer[MA_WINDOW_SIZE];
    uint8_t  index;
    uint8_t  count;   // Số samples đã nạp (đến MA_WINDOW_SIZE)
    int32_t  sum;
} MovingAvg_t;

void ma_init(MovingAvg_t *ma) {
    ma->index = ma->count = 0;
    ma->sum = 0;
    memset(ma->buffer, 0, sizeof(ma->buffer));
}

int32_t ma_update(MovingAvg_t *ma, int32_t new_value) {
    // Trừ giá trị cũ nhất
    ma->sum -= ma->buffer[ma->index];
    // Thêm giá trị mới
    ma->buffer[ma->index] = new_value;
    ma->sum += new_value;
    // Advance index (circular)
    ma->index = (ma->index + 1) % MA_WINDOW_SIZE;
    if (ma->count < MA_WINDOW_SIZE) ma->count++;
    // Trả về trung bình
    return ma->sum / ma->count;
}

// Sử dụng:
// MovingAvg_t temp_filter;
// ma_init(&temp_filter);
// int32_t smoothed = ma_update(&temp_filter, raw_adc_value);
```

---

## 8. Watchdog Pattern

```c
/**
 * Watchdog aggregator — monitor tất cả tasks
 * @req-ids BR-{DOM}-NNN (system reliability)
 */
#include "esp_task_wdt.h"

#define WDT_TIMEOUT_SEC   10

// Danh sách tasks cần monitor
#define WDT_TASK_COUNT    3
static const char *WDT_TASKS[] = {"sensor_task", "comm_task", "control_task"};

void watchdog_init(void) {
    // Config hardware watchdog
    esp_task_wdt_config_t wdt_config = {
        .timeout_ms = WDT_TIMEOUT_SEC * 1000,
        .idle_core_mask = 0,   // Không monitor idle tasks
        .trigger_panic = true  // Trigger panic dump khi WDT expire
    };
    esp_task_wdt_reconfigure(&wdt_config);
}

// Mỗi task tự đăng ký và kick WDT
void sensor_task(void *pvParam) {
    esp_task_wdt_add(NULL);  // Đăng ký task hiện tại với WDT

    while (1) {
        // ... công việc ...
        esp_task_wdt_reset();  // Kick WDT — "Tôi vẫn còn sống"
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
}
```

---

## 9. Configuration Manager (NVS)

```c
/**
 * Config manager với validation và defaults
 * @req-ids FT-{MOD}-NNN (device configuration)
 */
#include "nvs_flash.h"
#include "nvs.h"
#include "esp_log.h"

#define CFG_NAMESPACE "app_cfg"
static const char *TAG = "config";

typedef struct {
    char    wifi_ssid[32];
    char    wifi_pass[64];
    char    mqtt_host[64];
    uint16_t mqtt_port;
    uint32_t sample_interval_sec;
    int16_t  temp_threshold_x100;  /**< °C × 100 */
    bool     deep_sleep_enabled;
} AppConfig_t;

// Defaults khi NVS trống
static const AppConfig_t CONFIG_DEFAULTS = {
    .wifi_ssid           = "",
    .wifi_pass           = "",
    .mqtt_host           = "mqtt.example.com",
    .mqtt_port           = 1883,
    .sample_interval_sec = 60,
    .temp_threshold_x100 = 3500,  // 35.00°C
    .deep_sleep_enabled  = false
};

// Validation rules
static bool config_validate(const AppConfig_t *cfg) {
    if (cfg->mqtt_port < 1 || cfg->mqtt_port > 65535) {
        ESP_LOGW(TAG, "Invalid mqtt_port: %d", cfg->mqtt_port);
        return false;
    }
    if (cfg->sample_interval_sec < 1 || cfg->sample_interval_sec > 3600) {
        ESP_LOGW(TAG, "Invalid sample_interval: %lu", cfg->sample_interval_sec);
        return false;
    }
    return true;
}

esp_err_t config_load(AppConfig_t *cfg) {
    *cfg = CONFIG_DEFAULTS;  // Start với defaults

    nvs_handle_t h;
    esp_err_t ret = nvs_open(CFG_NAMESPACE, NVS_READONLY, &h);
    if (ret == ESP_ERR_NVS_NOT_FOUND) {
        ESP_LOGI(TAG, "No config found — using defaults");
        return ESP_OK;
    }
    if (ret != ESP_OK) return ret;

    #define NVS_GET_STR(key, dst) { \
        size_t len = sizeof(dst); \
        nvs_get_str(h, key, dst, &len); \
    }
    #define NVS_GET_U16(key, dst) nvs_get_u16(h, key, &dst)
    #define NVS_GET_U32(key, dst) nvs_get_u32(h, key, &dst)

    NVS_GET_STR("wifi_ssid",   cfg->wifi_ssid);
    NVS_GET_STR("wifi_pass",   cfg->wifi_pass);
    NVS_GET_STR("mqtt_host",   cfg->mqtt_host);
    NVS_GET_U16("mqtt_port",   cfg->mqtt_port);
    NVS_GET_U32("sample_int",  cfg->sample_interval_sec);

    nvs_close(h);

    if (!config_validate(cfg)) {
        ESP_LOGW(TAG, "Invalid config — reverting to defaults");
        *cfg = CONFIG_DEFAULTS;
    }

    return ESP_OK;
}
```
