# Integration Patterns — Code-Gen Reference

Hướng dẫn sinh code **tích hợp giữa các systems** (HTTP client, events, circuit breaker).

---

## A. HTTP Client Wrapper

### A1. Axios Instance chuẩn

```typescript
// src/shared/http/create-http-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  serviceName: string; // Tên service gọi đến — dùng trong logs/errors
}

export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 10000, // 10s default
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor — inject auth token
  client.interceptors.request.use((req) => {
    // Token sẽ được inject từ context (AsyncLocalStorage hoặc param)
    const token = requestContext.getToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    // Propagate correlation ID cho distributed tracing
    const correlationId = requestContext.getCorrelationId();
    if (correlationId) {
      req.headers['X-Correlation-Id'] = correlationId;
    }

    return req;
  });

  // Response interceptor — normalize errors
  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.response) {
        // Server error (4xx, 5xx)
        const status = error.response.status;
        const data = error.response.data as { error?: { code?: string; message?: string } };

        if (status === 404) {
          throw new RemoteNotFoundError(
            config.serviceName,
            data?.error?.message ?? 'Resource not found'
          );
        }
        if (status === 403) {
          throw new RemoteForbiddenError(config.serviceName, data?.error?.message);
        }
        if (status >= 500) {
          throw new RemoteServiceError(
            config.serviceName,
            status,
            data?.error?.message ?? 'Internal server error'
          );
        }

        throw new RemoteClientError(config.serviceName, status, data?.error?.message);
      } else if (error.code === 'ECONNABORTED') {
        throw new RemoteTimeoutError(config.serviceName, config.timeout ?? 10000);
      } else {
        throw new RemoteNetworkError(config.serviceName, error.message);
      }
    }
  );

  return client;
}
```

### A2. Retry với Exponential Backoff

```typescript
// src/shared/http/with-retry.ts

interface RetryConfig {
  maxAttempts?: number;   // Số lần retry tối đa (default: 3)
  baseDelay?: number;     // Delay ban đầu ms (default: 500)
  maxDelay?: number;      // Delay tối đa ms (default: 10000)
  retryOn?: number[];     // HTTP status codes cần retry (default: [502, 503, 504])
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 500,
    maxDelay = 10000,
    retryOn = [502, 503, 504],
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Kiểm tra có nên retry không
      const shouldRetry =
        attempt < maxAttempts &&
        (error instanceof RemoteServiceError && retryOn.includes(error.statusCode)) ||
        (error instanceof RemoteTimeoutError) ||
        (error instanceof RemoteNetworkError);

      if (!shouldRetry) throw error;

      // Exponential backoff với jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100,
        maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Dùng:
const product = await withRetry(
  () => catalogClient.getProduct(productId),
  { maxAttempts: 3, retryOn: [503, 504] }
);
```

---

## B. Circuit Breaker Pattern

```typescript
// src/shared/http/circuit-breaker.ts

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;   // Số failures để open circuit (default: 5)
  successThreshold: number;   // Số successes để close lại (default: 2)
  timeout: number;            // Thời gian OPEN trước khi thử HALF_OPEN (ms, default: 30000)
  serviceName: string;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private openedAt: number | null = null;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // OPEN state — kiểm tra có nên thử HALF_OPEN không
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.openedAt!;
      if (elapsed < this.config.timeout) {
        throw new CircuitOpenError(this.config.serviceName);
      }
      // Chuyển sang HALF_OPEN để thử lại
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = 'CLOSED'; // Khôi phục
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    if (
      this.state === 'HALF_OPEN' ||
      (this.state === 'CLOSED' && this.failures >= this.config.failureThreshold)
    ) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
      this.failures = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Service client với circuit breaker
export class CatalogClient {
  private http: AxiosInstance;
  private breaker: CircuitBreaker;

  constructor(baseURL: string) {
    this.http = createHttpClient({ baseURL, serviceName: 'catalog' });
    this.breaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
      serviceName: 'catalog',
    });
  }

  async getProduct(productId: string): Promise<ProductDto> {
    return this.breaker.execute(async () => {
      const res = await this.http.get<ApiResponse<ProductDto>>(
        `/api/v1/catalog/products/${productId}`
      );
      return res.data.data;
    });
  }
}
```

---

## C. Event Publishing (Bull/BullMQ)

### C1. Event Publisher

```typescript
// src/shared/events/event-publisher.ts
import { Queue } from 'bullmq';
import type { DomainEvent } from '@{project}/shared-types';

const EVENT_QUEUE_NAME = 'domain-events';

let eventQueue: Queue | null = null;

function getEventQueue(): Queue {
  if (!eventQueue) {
    eventQueue = new Queue(EVENT_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 1000, // Giữ 1000 completed jobs
        removeOnFail: 5000,     // Giữ 5000 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }
  return eventQueue;
}

export async function publishEvent<T>(event: DomainEvent<T>): Promise<void> {
  const queue = getEventQueue();
  await queue.add(event.eventType, event, {
    jobId: event.eventId, // Idempotency: cùng eventId không process lại
  });
}

// Dùng trong service:
async confirmOrder(orderId: string, userId: string): Promise<Order> {
  const order = await this.orderRepo.updateStatus(orderId, 'CONFIRMED', userId);

  await publishEvent({
    eventId: `order-confirmed-${orderId}-${Date.now()}`,
    eventType: 'order.confirmed',
    version: '1.0',
    timestamp: new Date().toISOString(),
    aggregateId: orderId,
    aggregateType: 'Order',
    data: { orderId, totalAmount: order.totalAmount, customerId: order.customerId },
    metadata: { correlationId: requestContext.getCorrelationId(), userId },
  });

  return order;
}
```

### C2. Event Consumer (Worker)

```typescript
// src/shared/events/create-event-worker.ts
import { Worker, Job } from 'bullmq';
import type { DomainEvent } from '@{project}/shared-types';

type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

// Map của event handlers
const handlers = new Map<string, EventHandler[]>();

export function onEvent<T>(eventType: string, handler: EventHandler<T>): void {
  if (!handlers.has(eventType)) {
    handlers.set(eventType, []);
  }
  handlers.get(eventType)!.push(handler as EventHandler);
}

export function startEventWorker(): Worker {
  const worker = new Worker(
    EVENT_QUEUE_NAME,
    async (job: Job<DomainEvent>) => {
      const event = job.data;
      const eventHandlers = handlers.get(event.eventType) ?? [];

      // Idempotency check
      const processed = await eventIdempotencyCache.has(event.eventId);
      if (processed) {
        return; // Bỏ qua duplicate events
      }

      for (const handler of eventHandlers) {
        await handler(event);
      }

      await eventIdempotencyCache.set(event.eventId, true, 86400); // TTL 24h
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[EventWorker] Job ${job?.id} failed:`, err.message);
    // Ghi vào dead letter queue hoặc alert
  });

  return worker;
}

// Đăng ký handler trong module init:
// inventory.module.ts
onEvent<OrderConfirmedData>('order.confirmed', async (event) => {
  // Reserve stock khi order confirmed
  for (const item of event.data.items) {
    await inventoryService.reserveStock(item.productId, item.quantity, event.aggregateId);
  }
});
```

---

## D. Dead Letter Queue Handling

```typescript
// src/shared/events/dead-letter-queue.ts

export async function monitorDeadLetterQueue(queueName: string): Promise<void> {
  const queue = new Queue(queueName, { connection: redisConnection });

  // Kiểm tra failed jobs
  const failedJobs = await queue.getFailed(0, 100);

  for (const job of failedJobs) {
    console.error(`[DLQ] Failed job ${job.id}:`, {
      eventType: job.data.eventType,
      failedReason: job.failedReason,
      attempts: job.attemptsMade,
    });

    // Notify ops team
    await alertService.sendAlert({
      level: 'ERROR',
      message: `Dead letter: ${job.data.eventType} after ${job.attemptsMade} attempts`,
      context: { jobId: job.id, eventId: job.data.eventId },
    });
  }
}
```

---

## E. Error Types cho Inter-Service Communication

```typescript
// src/shared/errors/remote-errors.ts

export class RemoteServiceError extends Error {
  constructor(
    public readonly serviceName: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(`[${serviceName}] Remote error ${statusCode}: ${message}`);
    this.name = 'RemoteServiceError';
  }
}

export class RemoteNotFoundError extends RemoteServiceError {
  constructor(serviceName: string, message: string) {
    super(serviceName, 404, message);
    this.name = 'RemoteNotFoundError';
  }
}

export class RemoteForbiddenError extends RemoteServiceError {
  constructor(serviceName: string, message?: string) {
    super(serviceName, 403, message ?? 'Forbidden');
    this.name = 'RemoteForbiddenError';
  }
}

export class RemoteTimeoutError extends Error {
  constructor(public readonly serviceName: string, timeoutMs: number) {
    super(`[${serviceName}] Request timeout after ${timeoutMs}ms`);
    this.name = 'RemoteTimeoutError';
  }
}

export class RemoteNetworkError extends Error {
  constructor(public readonly serviceName: string, details: string) {
    super(`[${serviceName}] Network error: ${details}`);
    this.name = 'RemoteNetworkError';
  }
}

export class CircuitOpenError extends Error {
  constructor(public readonly serviceName: string) {
    super(`[${serviceName}] Circuit breaker is OPEN — service unavailable`);
    this.name = 'CircuitOpenError';
  }
}

export class RemoteClientError extends Error {
  constructor(
    public readonly serviceName: string,
    public readonly statusCode: number,
    message?: string
  ) {
    super(`[${serviceName}] Client error ${statusCode}: ${message}`);
    this.name = 'RemoteClientError';
  }
}
```

---

## F. Service Client Generation

Từ mỗi INT-{SYS}-NNN spec trong MODSPEC, sinh client class:

```typescript
// Từ INT-ORD-001: "Order service gọi Catalog API để lấy thông tin sản phẩm"
// Sinh:
// src/order/external/catalog.client.ts

/**
 * Catalog Service Client — Order System
 * @int-ids INT-ORD-001
 */
export class CatalogServiceClient {
  private http: AxiosInstance;
  private breaker: CircuitBreaker;

  constructor(
    @Inject(CATALOG_BASE_URL) baseURL: string,
  ) {
    this.http = createHttpClient({ baseURL, serviceName: 'catalog', timeout: 5000 });
    this.breaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
      serviceName: 'catalog',
    });
  }

  /**
   * Lấy thông tin sản phẩm (INT-ORD-001)
   * @throws RemoteNotFoundError nếu sản phẩm không tồn tại
   * @throws CircuitOpenError nếu Catalog service không khả dụng
   */
  async getProduct(productId: string): Promise<CatalogProductDto> {
    return withRetry(
      () => this.breaker.execute(async () => {
        const res = await this.http.get<ApiResponse<CatalogProductDto>>(
          `/api/v1/catalog/products/${productId}`
        );
        return res.data.data;
      }),
      { maxAttempts: 2, retryOn: [503] }
    );
  }
}
```

---

## G. Inter-Service Request Context

```typescript
// src/shared/context/request-context.ts
// Dùng AsyncLocalStorage để propagate context qua async calls

import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  correlationId: string;
  userId?: string;
  token?: string;
  tenantId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const requestContext = {
  run: <T>(context: RequestContext, fn: () => T) => storage.run(context, fn),
  get: () => storage.getStore(),
  getCorrelationId: () => storage.getStore()?.correlationId ?? 'unknown',
  getToken: () => storage.getStore()?.token,
  getUserId: () => storage.getStore()?.userId,
};

// Middleware để init context từ HTTP request:
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? randomUUID();
  const token = req.headers.authorization?.split(' ')[1];

  requestContext.run({ correlationId, token }, () => {
    res.setHeader('X-Correlation-Id', correlationId);
    next();
  });
}
```
