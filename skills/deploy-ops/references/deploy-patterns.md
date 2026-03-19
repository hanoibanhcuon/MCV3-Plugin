# Deploy Patterns — Deploy-Ops Reference

## Deployment Strategies

### 1. Blue-Green Deployment (Khuyến nghị cho production)

```
[Traffic] → [Load Balancer]
                  ↓
          [Blue (Current)] ← 100% traffic

Deploy phase:
1. Deploy Green (new version) — zero traffic
2. Smoke test Green
3. Switch 100% traffic → Green
4. Monitor 30 phút
5. Retire Blue (giữ 24h để rollback)

Ưu điểm: Zero downtime, rollback tức thì (switch back)
Nhược điểm: Cần 2x infrastructure trong thời gian deploy
```

### 2. Canary Deployment (Cho high-risk releases)

```
[Traffic] → [Load Balancer]
                  ↓
       ┌─── 95% ───[Blue (Stable)]
       └─── 5% ────[Green (Canary)]

Stages:
5% → Monitor 30m → 25% → Monitor 1h → 100% → Retire Blue

Ưu điểm: Risk thấp nhất, test với real traffic
Nhược điểm: Phức tạp hơn, cần feature flags nếu có schema change
```

### 3. Rolling Deployment (Cho Kubernetes)

```
Pods: [v1][v1][v1][v1]
→ Replace 1 by 1:
  [v2][v1][v1][v1] → [v2][v2][v1][v1] → [v2][v2][v2][v1] → [v2][v2][v2][v2]

Kubernetes config:
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1   # Max 1 pod down at a time
    maxSurge: 1         # Max 1 extra pod during update

Ưu điểm: Simple, built-in Kubernetes
Nhược điểm: Mixed versions trong thời gian deploy
```

### 4. Big-Bang Deployment (Chỉ cho non-production hoặc small projects)

```
[Stop v1] → [Deploy v2] → [Start v2]

Downtime: minutes to hours
Chỉ dùng cho: dev/staging, small internal tools, maintenance windows OK
```

---

## Database Migration Strategy

### Zero-Downtime Migration Checklist

```
✅ Backward-compatible migrations: ALWAYS thêm, không xóa/rename
✅ 3-step migration for breaking changes:
   Step 1: Add new column/table (deploy v2 compatible with both)
   Step 2: Migrate data
   Step 3: Remove old column/table (deploy v3)
✅ Test migration on staging với production-size data
✅ Measure migration time — nếu > 5 phút: background migration
✅ Lock strategy: avoid full table locks
```

### Migration Rollback

```bash
# Flyway rollback
flyway -url=${DB_URL} undo

# Liquibase rollback
liquibase rollback --count=1

# Manual rollback (always document this)
psql ${DATABASE_URL} << 'EOF'
-- Rollback migration V{NNN}
DROP TABLE IF EXISTS {new_table};
ALTER TABLE {table} DROP COLUMN IF EXISTS {new_col};
EOF
```

---

## Container Deployment

### Docker Best Practices

```dockerfile
# Multi-stage build để giảm image size
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node  # Không chạy root
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app}-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {app}
  template:
    metadata:
      labels:
        app: {app}
    spec:
      containers:
      - name: {app}
        image: {registry}/{app}:{version}
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        env:
        - name: NODE_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {app}-secrets
              key: database-url
```

---

## Health Check Endpoints

```typescript
// PHẢI có 2 endpoints:

// /health — Liveness probe: app có đang chạy không?
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// /ready — Readiness probe: app có sẵn sàng nhận traffic không?
app.get('/ready', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;  // DB connection check
    await redis.ping();             // Cache check (nếu có)
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

---

## CI/CD Pipeline

### GitHub Actions — Full Pipeline

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run type-check

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker image
        run: |
          docker build -t $REGISTRY/$APP:$GITHUB_SHA .
          docker push $REGISTRY/$APP:$GITHUB_SHA

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/$APP $APP=$REGISTRY/$APP:$GITHUB_SHA
          kubectl rollout status deployment/$APP

  integration-test:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Run E2E tests against staging
        run: npm run test:e2e -- --env=staging

  deploy-production:
    needs: integration-test
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/$APP $APP=$REGISTRY/$APP:$GITHUB_SHA
          kubectl rollout status deployment/$APP
```

---

## Secrets Management

```
KHÔNG BAO GIỜ commit secrets vào git.

Options:
1. AWS Secrets Manager / GCP Secret Manager / Azure Key Vault
2. HashiCorp Vault
3. Kubernetes Secrets (encrypted at rest)
4. GitHub Actions Secrets (cho CI/CD)

Pattern trong code:
process.env.DATABASE_URL  // Luôn từ env, không hardcode
```

---

## Backup Strategy

```
Database backups:
- Frequency: Daily full, Hourly incremental
- Retention: 30 ngày hot, 1 năm cold
- Location: Different region/AZ từ production
- Test restore: Monthly

Application backups:
- Configuration files: In git (không commit secrets)
- Static assets: S3 với versioning enabled
- User uploads: S3 với versioning + replication
```
