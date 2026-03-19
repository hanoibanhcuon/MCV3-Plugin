# Code Patterns Detection — Nhận diện cấu trúc code

## Mục đích

Dùng trong Phase 1 của `/mcv3:assess` để auto-detect:
- Tech stack từ project files
- Systems và modules từ directory structure
- API endpoints từ route definitions
- DB models/tables từ schema files
- Test coverage từ test files

---

## Tech Stack Detection

### Node.js / TypeScript

```bash
# Detect via package files
-f package.json → Node.js project
  cat package.json | grep -E '"express|fastify|nestjs|koa|hapi"'
  → Express.js / Fastify / NestJS / Koa / Hapi

-f tsconfig.json → TypeScript
  cat tsconfig.json | grep '"target"'

# Framework specific
-d src/ AND -f src/main.ts       → NestJS likely
-f src/app.ts OR -f src/index.ts → Express/vanilla
-f next.config.js                → Next.js
-f nuxt.config.js                → Nuxt.js
```

### Python

```bash
-f requirements.txt → Python project
  grep -E "django|flask|fastapi|tornado" requirements.txt

-f pyproject.toml → Modern Python
  grep -E "\[tool.poetry\]\|\[build-system\]" pyproject.toml

-f manage.py → Django project
-f app.py OR -f main.py → Flask/FastAPI likely
-d alembic/ → SQLAlchemy + Alembic migrations
```

### Java / Kotlin

```bash
-f pom.xml → Maven / Java project
  grep -E "spring-boot|quarkus|micronaut" pom.xml

-f build.gradle OR -f build.gradle.kts → Gradle
-d src/main/java/ → Standard Java structure
-d src/main/kotlin/ → Kotlin
```

### Go

```bash
-f go.mod → Go module
  grep -E "gin-gonic|echo|fiber|chi" go.mod

-d cmd/ → Multiple binaries
-d internal/ → Private packages (standard layout)
-d pkg/ → Public packages
```

### Ruby

```bash
-f Gemfile → Ruby project
  grep -E "rails|sinatra|hanami" Gemfile
-f config/routes.rb → Rails project
```

---

## Project Structure Detection

### Mono-repo Detection

```bash
# NestJS Mono-repo
ls src/
  → auth/, orders/, products/, users/ ... = modules

# Node.js multi-package
ls packages/
  → api/, web/, mobile/, shared/ = systems

# Common monorepo signals
-d packages/ AND -f lerna.json     → Lerna monorepo
-d packages/ AND -f pnpm-workspace.yaml → PNPM workspace
-d apps/ AND -f turbo.json          → Turborepo
```

### Multi-system Detection

```bash
# Python
ls src/
  → erp/, web/, mobile/ = systems (mỗi là 1 Django app hoặc service)

# Kubernetes / Docker Compose
ls docker-compose.yml → biết có bao nhiêu services
cat docker-compose.yml | grep "services:" -A 50

# Nếu có nhiều Dockerfile
find . -name "Dockerfile" -not -path "*/node_modules/*"
→ Mỗi Dockerfile = 1 potential system
```

### Module Detection Patterns

**NestJS:**
```bash
# Mỗi file *.module.ts = 1 module
find src/ -name "*.module.ts" | sed 's/.*src\///' | sed 's/\/.*//'
```

**Express:**
```bash
# Mỗi directory trong routes/ = 1 module
ls src/routes/
ls src/controllers/
```

**Django:**
```bash
# Mỗi Django app = 1 module
find . -name "apps.py" | sed 's/\/apps.py//' | sed 's/.\///'
```

**Spring Boot:**
```bash
# Mỗi package trong controller/ = 1 module
find src/main/java -name "*Controller.java" | head -20
```

---

## API Endpoint Detection

### Express / Node.js

```bash
# Route definitions
grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" src/ --include="*.ts" --include="*.js"

# NestJS decorators
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch\|@Controller" src/ --include="*.ts"
```

### FastAPI / Python

```bash
grep -rn "@app\.\(get\|post\|put\|delete\|patch\)\|@router\.\(get\|post\|put\|delete\|patch\)" . --include="*.py"
```

### Django DRF

```bash
grep -rn "path\|url\|re_path" . --include="urls.py"
grep -rn "class.*ViewSet\|class.*APIView" . --include="*.py"
```

### Spring Boot

```bash
grep -rn "@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping\|@RequestMapping" . --include="*.java"
```

---

## Database Detection

### ORM/Migration Files

```bash
# TypeORM migrations
find . -name "*.migration.ts" -path "*/migrations/*"
find . -name "*.migration.js"

# Prisma
-f prisma/schema.prisma → Prisma ORM
cat prisma/schema.prisma | grep "model "

# Flyway / Liquibase
find . -name "V*.sql" -path "*/migrations/*"
find . -name "*.xml" -path "*/changelogs/*"

# Django migrations
find . -name "0*.py" -path "*/migrations/*"

# Alembic
find . -name "*.py" -path "*/alembic/versions/*"

# Sequelize
find . -name "*-create-*.js" -path "*/migrations/*"
```

### SQL Schema Files

```bash
find . -name "*.sql" | grep -v "node_modules\|dist\|build"
find . -name "schema.sql" -o -name "init.sql" -o -name "create_tables.sql"
```

### Extract Table Names

```bash
# From SQL files
grep -rh "CREATE TABLE" . --include="*.sql" | grep -oP "(?<=TABLE\s)[`\"'\w]+"

# From TypeORM entities
grep -rn "@Entity\|@Table" . --include="*.ts" | grep -oP '"[^"]*"'

# From Prisma schema
grep "^model " prisma/schema.prisma | awk '{print $2}'

# From Django models
grep "class.*models.Model" . -rn --include="*.py" | awk -F'class ' '{print $2}' | cut -d'(' -f1
```

---

## Test File Detection

### Identify Test Framework

```bash
# JavaScript/TypeScript
-f jest.config.ts OR -f jest.config.js → Jest
-f vitest.config.ts → Vitest
-f .mocharc.js → Mocha
-f cypress.config.ts → Cypress (e2e)
-f playwright.config.ts → Playwright (e2e)

# Python
-f pytest.ini OR -f setup.cfg (với [tool:pytest]) → pytest
grep -r "import unittest" . --include="*.py" | head -3 → unittest

# Java
grep -r "import org.junit" . --include="*.java" | head -3 → JUnit
grep -r "import org.testng" . --include="*.java" | head -3 → TestNG
```

### Count Test Files

```bash
# Jest/Vitest
find . -name "*.spec.ts" -o -name "*.test.ts" -o -name "*.spec.js" | grep -v "node_modules"
find . -name "__tests__" -type d | grep -v "node_modules"

# Pytest
find . -name "test_*.py" -o -name "*_test.py" | grep -v __pycache__

# JUnit
find . -name "*Test.java" -o -name "*Tests.java" | grep -v target
```

### Estimate Test Coverage

```bash
# Check if coverage config exists
-f .nycrc OR -f .nycrc.json     → Istanbul/NYC coverage
-f jest.config.* (search "coverage") → Jest coverage enabled
-f coverage.xml OR -d coverage/ → Coverage report exists

# Quick coverage estimate (không cần chạy tests)
# Đếm test functions vs source functions
TESTS=$(grep -rn "it\(\|test\(\|describe\(" src/ --include="*.spec.ts" | wc -l)
SOURCES=$(grep -rn "async " src/ --include="*.service.ts" | wc -l)
echo "Rough coverage estimate: $TESTS tests for ~$SOURCES service methods"
```

---

## Business Logic Detection

### Kiểm tra Business Rules trong code

```bash
# Tìm validation rules (có thể là implicit BRs)
grep -rn "throw.*Error\|validation\|if.*<\|if.*>\|minimum\|maximum\|required\|constraint" src/ --include="*.ts" | grep -v "node_modules\|dist" | head -30

# Tìm constants có thể là business rules
grep -rn "const.*=\s*[0-9]\|const.*LIMIT\|const.*MAX\|const.*MIN\|const.*RATE" src/ --include="*.ts" | grep -v "node_modules" | head -20

# Tìm configuration files
find . -name "*.config.ts" -o -name "constants.ts" -o -name "config.ts" | grep -v "node_modules"
```

### REQ-ID Comment Detection (MCV3 format)

```bash
# Kiểm tra code đã có MCV3 REQ-ID comments chưa
grep -rn "@req-ids\|@api-ids\|@feat-ids\|REQ-ID:" src/ --include="*.ts" | grep -v "node_modules"

# Output: nếu có → Phase 7 done; nếu không có → cần thêm REQ-ID
```

---

## Output Format (manifest.json)

Script `scripts/scan-codebase.sh` tạo file này:

```json
{
  "scannedAt": "2026-03-19T10:00:00Z",
  "projectRoot": "/path/to/project",
  "techStack": {
    "language": "TypeScript",
    "runtime": "Node.js 18",
    "framework": "NestJS",
    "database": "PostgreSQL",
    "orm": "TypeORM",
    "testing": "Jest"
  },
  "structure": {
    "type": "monorepo",
    "systems": [
      {
        "code": "ERP",
        "path": "src/erp",
        "modules": ["warehouse", "sales", "finance"]
      }
    ]
  },
  "apis": {
    "total": 45,
    "byModule": {
      "warehouse": ["GET /api/v1/items", "POST /api/v1/receipts", "..."],
      "sales": ["POST /api/v1/orders", "..."]
    }
  },
  "database": {
    "tables": ["orders", "order_items", "products", "..."],
    "migrationCount": 12,
    "hasVersioning": true
  },
  "tests": {
    "framework": "Jest",
    "fileCount": 23,
    "hasConfigCoverage": true,
    "estimatedCoverage": "medium"
  },
  "mcv3": {
    "hasReqIdComments": false,
    "hasMcData": false
  }
}
```
