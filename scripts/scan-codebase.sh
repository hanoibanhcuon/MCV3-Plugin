#!/bin/bash
# scan-codebase.sh — Quét cấu trúc codebase để hỗ trợ /mcv3:assess
#
# Phát hiện tech stack, API routes, DB models, test files, và project structure.
# Output: manifest.json trong thư mục hiện tại (hoặc đường dẫn chỉ định)
#
# Cách dùng:
#   ./scripts/scan-codebase.sh [PROJECT_ROOT] [OUTPUT_FILE]
#
#   PROJECT_ROOT: Thư mục gốc của codebase (mặc định: thư mục hiện tại)
#   OUTPUT_FILE:  Đường dẫn output manifest.json (mặc định: ./manifest.json)
#
# Biến môi trường:
#   MCV3_PROJECT_ROOT: Ghi đè PROJECT_ROOT
#   MCV3_SCAN_OUTPUT:  Ghi đè OUTPUT_FILE

set -euo pipefail

# ─── Tham số ──────────────────────────────────────────────────────────────
PROJECT_ROOT="${1:-${MCV3_PROJECT_ROOT:-.}}"
OUTPUT_FILE="${2:-${MCV3_SCAN_OUTPUT:-./manifest.json}}"
SCANNED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

# Chuyển sang absolute path
PROJECT_ROOT=$(cd "$PROJECT_ROOT" && pwd)

echo "🔍 Đang quét codebase tại: $PROJECT_ROOT" >&2
echo "📝 Output sẽ được lưu tại: $OUTPUT_FILE" >&2
echo "" >&2

# ─── Helper functions ──────────────────────────────────────────────────────

# Đếm files theo pattern (bỏ qua thư mục thường gặp)
count_files() {
  local dir="$1"
  local pattern="$2"
  find "$dir" -name "$pattern" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/.venv/*" \
    -not -path "*/venv/*" \
    -not -path "*/target/*" \
    2>/dev/null | wc -l | tr -d ' '
}

# Tìm files theo pattern, trả về danh sách JSON array
find_files_json() {
  local dir="$1"
  local pattern="$2"
  local limit="${3:-20}"
  local files
  files=$(find "$dir" -name "$pattern" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/__pycache__/*" \
    2>/dev/null | head -"$limit")

  # Chuyển thành JSON array
  local json="["
  local first=true
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    # Relative path từ PROJECT_ROOT
    local rel_path="${f#$PROJECT_ROOT/}"
    if [ "$first" = true ]; then
      json="${json}\"${rel_path}\""
      first=false
    else
      json="${json}, \"${rel_path}\""
    fi
  done <<< "$files"
  json="${json}]"
  echo "$json"
}

# Escape string cho JSON
json_escape() {
  local str="$1"
  echo "$str" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/' | tr -d '\n' | sed 's/\\n$//'
}

# ─── 1. Tech Stack Detection ────────────────────────────────────────────────

echo "  [1/7] Phát hiện tech stack..." >&2

LANGUAGE=""
RUNTIME=""
FRAMEWORK=""
DATABASE=""
ORM=""
TESTING=""

# Node.js / TypeScript
if [ -f "$PROJECT_ROOT/package.json" ]; then
  LANGUAGE="JavaScript/TypeScript"
  RUNTIME="Node.js"

  # Detect Node version
  if [ -f "$PROJECT_ROOT/.nvmrc" ]; then
    RUNTIME="Node.js $(cat "$PROJECT_ROOT/.nvmrc" | tr -d 'v\n')"
  fi

  # Detect TypeScript
  if [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
    LANGUAGE="TypeScript"
  fi

  # Detect framework từ package.json
  if grep -q '"@nestjs/core"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    FRAMEWORK="NestJS"
  elif grep -q '"express"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    FRAMEWORK="Express"
  elif grep -q '"fastify"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    FRAMEWORK="Fastify"
  elif grep -q '"koa"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    FRAMEWORK="Koa"
  elif grep -q '"next"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    FRAMEWORK="Next.js"
  fi

  # Detect ORM
  if grep -q '"typeorm"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    ORM="TypeORM"
  elif grep -q '"@prisma/client"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    ORM="Prisma"
  elif grep -q '"sequelize"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    ORM="Sequelize"
  elif grep -q '"mongoose"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    ORM="Mongoose"
    DATABASE="MongoDB"
  fi

  # Detect database từ package.json
  if [ -z "$DATABASE" ]; then
    if grep -q '"pg"\|"postgres"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
      DATABASE="PostgreSQL"
    elif grep -q '"mysql2"\|"mysql"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
      DATABASE="MySQL"
    elif grep -q '"sqlite3"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
      DATABASE="SQLite"
    fi
  fi

  # Detect testing framework
  if grep -q '"jest"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    TESTING="Jest"
  elif grep -q '"vitest"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    TESTING="Vitest"
  elif grep -q '"mocha"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    TESTING="Mocha"
  fi

# Python
elif [ -f "$PROJECT_ROOT/requirements.txt" ] || [ -f "$PROJECT_ROOT/pyproject.toml" ] || [ -f "$PROJECT_ROOT/setup.py" ]; then
  LANGUAGE="Python"
  RUNTIME="Python 3"

  # Detect Python framework
  if [ -f "$PROJECT_ROOT/manage.py" ]; then
    FRAMEWORK="Django"
  elif grep -q "fastapi\|FastAPI" "$PROJECT_ROOT/requirements.txt" 2>/dev/null \
    || grep -q "fastapi" "$PROJECT_ROOT/pyproject.toml" 2>/dev/null; then
    FRAMEWORK="FastAPI"
  elif grep -q "flask\|Flask" "$PROJECT_ROOT/requirements.txt" 2>/dev/null; then
    FRAMEWORK="Flask"
  fi

  # Detect Python ORM
  if grep -q "sqlalchemy\|SQLAlchemy" "$PROJECT_ROOT/requirements.txt" 2>/dev/null; then
    ORM="SQLAlchemy"
  fi

  # Detect Python testing
  if grep -q "pytest" "$PROJECT_ROOT/requirements.txt" 2>/dev/null \
    || [ -f "$PROJECT_ROOT/pytest.ini" ] || [ -f "$PROJECT_ROOT/setup.cfg" ]; then
    TESTING="pytest"
  fi

# Java / Kotlin
elif [ -f "$PROJECT_ROOT/pom.xml" ] || [ -f "$PROJECT_ROOT/build.gradle" ] || [ -f "$PROJECT_ROOT/build.gradle.kts" ]; then
  if [ -f "$PROJECT_ROOT/build.gradle.kts" ]; then
    LANGUAGE="Kotlin"
  else
    LANGUAGE="Java"
  fi
  RUNTIME="JVM"

  if grep -q "spring-boot\|spring.boot" "$PROJECT_ROOT/pom.xml" 2>/dev/null \
    || grep -q "spring-boot" "$PROJECT_ROOT/build.gradle" 2>/dev/null; then
    FRAMEWORK="Spring Boot"
  fi

  TESTING="JUnit"

# Go
elif [ -f "$PROJECT_ROOT/go.mod" ]; then
  LANGUAGE="Go"
  RUNTIME="Go $(grep "^go " "$PROJECT_ROOT/go.mod" | awk '{print $2}')"

  if grep -q "github.com/gin-gonic/gin" "$PROJECT_ROOT/go.mod" 2>/dev/null; then
    FRAMEWORK="Gin"
  elif grep -q "github.com/labstack/echo" "$PROJECT_ROOT/go.mod" 2>/dev/null; then
    FRAMEWORK="Echo"
  elif grep -q "github.com/gofiber/fiber" "$PROJECT_ROOT/go.mod" 2>/dev/null; then
    FRAMEWORK="Fiber"
  fi

  TESTING="Go testing"

# Ruby
elif [ -f "$PROJECT_ROOT/Gemfile" ]; then
  LANGUAGE="Ruby"
  RUNTIME="Ruby"

  if grep -q "rails\|Rails" "$PROJECT_ROOT/Gemfile" 2>/dev/null; then
    FRAMEWORK="Ruby on Rails"
  elif grep -q "sinatra\|Sinatra" "$PROJECT_ROOT/Gemfile" 2>/dev/null; then
    FRAMEWORK="Sinatra"
  fi

  TESTING="RSpec"
fi

echo "    ✅ Language: ${LANGUAGE:-không phát hiện được}" >&2
echo "    ✅ Framework: ${FRAMEWORK:-không phát hiện được}" >&2

# ─── 2. Project Structure Detection ─────────────────────────────────────────

echo "  [2/7] Phân tích cấu trúc dự án..." >&2

STRUCTURE_TYPE="unknown"
SYSTEMS_JSON="[]"

# Phát hiện mono-repo
if [ -f "$PROJECT_ROOT/lerna.json" ] || [ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ] || [ -f "$PROJECT_ROOT/turbo.json" ]; then
  STRUCTURE_TYPE="monorepo"
fi

# Phát hiện multi-system trong src/
if [ -d "$PROJECT_ROOT/src" ]; then
  # Đếm top-level directories trong src/
  SRC_DIRS=$(find "$PROJECT_ROOT/src" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SRC_DIRS" -gt 1 ]; then
    if [ "$STRUCTURE_TYPE" = "unknown" ]; then
      STRUCTURE_TYPE="multi-module"
    fi
  else
    STRUCTURE_TYPE="single-module"
  fi
fi

# Thu thập systems/modules từ src/
SYSTEMS_JSON="["
FIRST_SYS=true

if [ -d "$PROJECT_ROOT/src" ]; then
  while IFS= read -r sys_dir; do
    [ -z "$sys_dir" ] && continue
    sys_name=$(basename "$sys_dir")
    # Bỏ qua thư mục common/shared/utils
    case "$sys_name" in
      common|shared|utils|helpers|core|lib|types|interfaces|config) continue ;;
    esac

    # Tìm modules trong system
    MODULES_JSON="["
    FIRST_MOD=true
    while IFS= read -r mod_dir; do
      [ -z "$mod_dir" ] && continue
      mod_name=$(basename "$mod_dir")
      case "$mod_name" in
        common|shared|utils|helpers|__tests__|test|spec) continue ;;
      esac

      if [ "$FIRST_MOD" = true ]; then
        MODULES_JSON="${MODULES_JSON}\"${mod_name}\""
        FIRST_MOD=false
      else
        MODULES_JSON="${MODULES_JSON}, \"${mod_name}\""
      fi
    done < <(find "$sys_dir" -maxdepth 1 -mindepth 1 -type d 2>/dev/null)
    MODULES_JSON="${MODULES_JSON}]"

    if [ "$FIRST_SYS" = true ]; then
      SYSTEMS_JSON="${SYSTEMS_JSON}{\"code\": \"$(echo "$sys_name" | tr '[:lower:]' '[:upper:)')\", \"path\": \"src/${sys_name}\", \"modules\": ${MODULES_JSON}}"
      FIRST_SYS=false
    else
      SYSTEMS_JSON="${SYSTEMS_JSON}, {\"code\": \"$(echo "$sys_name" | tr '[:lower:]' '[:upper:]')\", \"path\": \"src/${sys_name}\", \"modules\": ${MODULES_JSON}}"
    fi
  done < <(find "$PROJECT_ROOT/src" -maxdepth 1 -mindepth 1 -type d 2>/dev/null)
fi

SYSTEMS_JSON="${SYSTEMS_JSON}]"

echo "    ✅ Structure: $STRUCTURE_TYPE" >&2

# ─── 3. API Endpoint Detection ───────────────────────────────────────────────

echo "  [3/7] Phát hiện API endpoints..." >&2

API_TOTAL=0
API_METHODS_JSON="{}"

# Node.js / TypeScript
if [ "$LANGUAGE" = "TypeScript" ] || [ "$LANGUAGE" = "JavaScript/TypeScript" ]; then
  # NestJS decorators
  NESTJS_APIS=$(grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch" "$PROJECT_ROOT/src" \
    --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  # Express routes
  EXPRESS_APIS=$(grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" \
    "$PROJECT_ROOT/src" --include="*.ts" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')

  API_TOTAL=$((NESTJS_APIS + EXPRESS_APIS))

# Python
elif [ "$LANGUAGE" = "Python" ]; then
  PYTHON_APIS=$(grep -rn "@app\.\(get\|post\|put\|delete\|patch\)\|@router\.\(get\|post\|put\|delete\|patch\)" \
    "$PROJECT_ROOT" --include="*.py" 2>/dev/null | wc -l | tr -d ' ')
  API_TOTAL=$PYTHON_APIS

# Java
elif [ "$LANGUAGE" = "Java" ]; then
  JAVA_APIS=$(grep -rn "@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping\|@RequestMapping" \
    "$PROJECT_ROOT/src" --include="*.java" 2>/dev/null | wc -l | tr -d ' ')
  API_TOTAL=$JAVA_APIS
fi

# Đọc một số routes mẫu
SAMPLE_ROUTES="[]"
if [ "$FRAMEWORK" = "NestJS" ]; then
  SAMPLE_LINES=$(grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch\|@Controller" \
    "$PROJECT_ROOT/src" --include="*.ts" 2>/dev/null | head -10)
  if [ -n "$SAMPLE_LINES" ]; then
    SAMPLE_ROUTES="[\"(see NestJS controller files for routes)\"]"
  fi
fi

echo "    ✅ APIs detected: ~$API_TOTAL endpoints" >&2

# ─── 4. Database Detection ───────────────────────────────────────────────────

echo "  [4/7] Phát hiện cấu trúc database..." >&2

DB_TABLES_JSON="[]"
DB_MIGRATION_COUNT=0
DB_HAS_VERSIONING=false

# TypeORM migrations
TYPEORM_MIGRATIONS=$(count_files "$PROJECT_ROOT" "*.migration.ts")
FLYWAY_MIGRATIONS=$(find "$PROJECT_ROOT" -name "V*.sql" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
DJANGO_MIGRATIONS=$(count_files "$PROJECT_ROOT" "0*.py")
ALEMBIC_MIGRATIONS=$(find "$PROJECT_ROOT" -path "*/alembic/versions/*.py" 2>/dev/null | wc -l | tr -d ' ')

DB_MIGRATION_COUNT=$((TYPEORM_MIGRATIONS + FLYWAY_MIGRATIONS + DJANGO_MIGRATIONS + ALEMBIC_MIGRATIONS))

if [ "$DB_MIGRATION_COUNT" -gt 0 ]; then
  DB_HAS_VERSIONING=true
fi

# Prisma schema tables
if [ -f "$PROJECT_ROOT/prisma/schema.prisma" ]; then
  PRISMA_TABLES=$(grep "^model " "$PROJECT_ROOT/prisma/schema.prisma" | awk '{print $2}')
  TABLES_JSON="["
  FIRST_TABLE=true
  while IFS= read -r table; do
    [ -z "$table" ] && continue
    if [ "$FIRST_TABLE" = true ]; then
      TABLES_JSON="${TABLES_JSON}\"${table}\""
      FIRST_TABLE=false
    else
      TABLES_JSON="${TABLES_JSON}, \"${table}\""
    fi
  done <<< "$PRISMA_TABLES"
  TABLES_JSON="${TABLES_JSON}]"
  DB_TABLES_JSON="$TABLES_JSON"
fi

# SQL CREATE TABLE (từ migration files)
if [ "$DB_TABLES_JSON" = "[]" ]; then
  SQL_TABLES=$(find "$PROJECT_ROOT" -name "*.sql" \
    -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | \
    xargs grep -h "CREATE TABLE" 2>/dev/null | \
    grep -oP '(?<=TABLE\s)[`"'"'"'\w]+' | \
    tr -d '`"'"'" | head -20)

  if [ -n "$SQL_TABLES" ]; then
    TABLES_JSON="["
    FIRST_TABLE=true
    while IFS= read -r table; do
      [ -z "$table" ] && continue
      if [ "$FIRST_TABLE" = true ]; then
        TABLES_JSON="${TABLES_JSON}\"${table}\""
        FIRST_TABLE=false
      else
        TABLES_JSON="${TABLES_JSON}, \"${table}\""
      fi
    done <<< "$SQL_TABLES"
    TABLES_JSON="${TABLES_JSON}]"
    DB_TABLES_JSON="$TABLES_JSON"
  fi
fi

echo "    ✅ Migrations: $DB_MIGRATION_COUNT files" >&2

# ─── 5. Test File Detection ───────────────────────────────────────────────────

echo "  [5/7] Phát hiện test files..." >&2

TEST_FILE_COUNT=0
TEST_FRAMEWORK_DETECTED=""
HAS_COVERAGE_CONFIG=false

# JavaScript/TypeScript tests
TS_SPEC=$(count_files "$PROJECT_ROOT" "*.spec.ts")
TS_TEST=$(count_files "$PROJECT_ROOT" "*.test.ts")
JS_SPEC=$(count_files "$PROJECT_ROOT" "*.spec.js")
JS_TEST=$(count_files "$PROJECT_ROOT" "*.test.js")
TEST_FILE_COUNT=$((TS_SPEC + TS_TEST + JS_SPEC + JS_TEST))

if [ "$TEST_FILE_COUNT" -gt 0 ]; then
  TEST_FRAMEWORK_DETECTED="$TESTING"
  if [ -z "$TEST_FRAMEWORK_DETECTED" ]; then
    TEST_FRAMEWORK_DETECTED="Jest/Vitest (detected)"
  fi
fi

# Python tests
PY_TESTS=$(count_files "$PROJECT_ROOT" "test_*.py")
PY_TESTS2=$(count_files "$PROJECT_ROOT" "*_test.py")
PY_TEST_COUNT=$((PY_TESTS + PY_TESTS2))
TEST_FILE_COUNT=$((TEST_FILE_COUNT + PY_TEST_COUNT))

if [ "$PY_TEST_COUNT" -gt 0 ] && [ -z "$TEST_FRAMEWORK_DETECTED" ]; then
  TEST_FRAMEWORK_DETECTED="pytest"
fi

# Java tests
JAVA_TESTS=$(count_files "$PROJECT_ROOT" "*Test.java")
TEST_FILE_COUNT=$((TEST_FILE_COUNT + JAVA_TESTS))

# Coverage config
if [ -f "$PROJECT_ROOT/.nycrc" ] || [ -f "$PROJECT_ROOT/.nycrc.json" ] || \
   [ -f "$PROJECT_ROOT/jest.config.ts" ] || [ -f "$PROJECT_ROOT/jest.config.js" ]; then
  # Kiểm tra coverage trong jest config
  if grep -q "coverage\|collectCoverage" "$PROJECT_ROOT/jest.config.ts" 2>/dev/null || \
     grep -q "coverage\|collectCoverage" "$PROJECT_ROOT/jest.config.js" 2>/dev/null; then
    HAS_COVERAGE_CONFIG=true
  fi
fi

echo "    ✅ Test files: $TEST_FILE_COUNT files" >&2

# ─── 6. MCV3 Status Check ────────────────────────────────────────────────────

echo "  [6/7] Kiểm tra trạng thái MCV3..." >&2

HAS_REQ_ID_COMMENTS=false
HAS_MC_DATA=false

# Kiểm tra REQ-ID comments
REQ_ID_COUNT=$(grep -rn "@req-ids\|@api-ids\|REQ-ID:" "$PROJECT_ROOT/src" \
  --include="*.ts" --include="*.js" --include="*.py" --include="*.java" \
  2>/dev/null | wc -l | tr -d ' ')

if [ "$REQ_ID_COUNT" -gt 0 ]; then
  HAS_REQ_ID_COMMENTS=true
fi

# Kiểm tra .mc-data
if [ -d "$PROJECT_ROOT/.mc-data" ]; then
  HAS_MC_DATA=true
fi

echo "    ✅ REQ-ID comments: $REQ_ID_COUNT found" >&2

# ─── 7. Summary ─────────────────────────────────────────────────────────────

echo "  [7/7] Tạo manifest.json..." >&2

# Tạo JSON output
cat > "$OUTPUT_FILE" << EOF
{
  "scannedAt": "${SCANNED_AT}",
  "projectRoot": "${PROJECT_ROOT}",
  "techStack": {
    "language": "${LANGUAGE:-unknown}",
    "runtime": "${RUNTIME:-unknown}",
    "framework": "${FRAMEWORK:-unknown}",
    "database": "${DATABASE:-unknown}",
    "orm": "${ORM:-unknown}",
    "testing": "${TEST_FRAMEWORK_DETECTED:-unknown}"
  },
  "structure": {
    "type": "${STRUCTURE_TYPE}",
    "systems": ${SYSTEMS_JSON}
  },
  "apis": {
    "total": ${API_TOTAL},
    "sampleRoutes": ${SAMPLE_ROUTES},
    "note": "Chạy grep thủ công để lấy danh sách đầy đủ — xem code-patterns-detection.md"
  },
  "database": {
    "tables": ${DB_TABLES_JSON},
    "migrationCount": ${DB_MIGRATION_COUNT},
    "hasVersioning": ${DB_HAS_VERSIONING}
  },
  "tests": {
    "framework": "${TEST_FRAMEWORK_DETECTED:-unknown}",
    "fileCount": ${TEST_FILE_COUNT},
    "hasConfigCoverage": ${HAS_COVERAGE_CONFIG},
    "estimatedCoverage": "unknown — chạy test suite để biết chính xác"
  },
  "mcv3": {
    "hasReqIdComments": ${HAS_REQ_ID_COMMENTS},
    "reqIdCount": ${REQ_ID_COUNT},
    "hasMcData": ${HAS_MC_DATA}
  }
}
EOF

echo "" >&2
echo "✅ Quét hoàn thành! Kết quả lưu tại: $OUTPUT_FILE" >&2
echo "" >&2
echo "📊 Tóm tắt:" >&2
echo "  - Language: ${LANGUAGE:-không phát hiện được}" >&2
echo "  - Framework: ${FRAMEWORK:-không phát hiện được}" >&2
echo "  - APIs: ~$API_TOTAL endpoints" >&2
echo "  - DB Tables: $(echo "$DB_TABLES_JSON" | grep -o '"' | wc -l | awk '{print int($1/2)}')" >&2
echo "  - Migrations: $DB_MIGRATION_COUNT files" >&2
echo "  - Tests: $TEST_FILE_COUNT files" >&2
echo "  - REQ-ID comments: $REQ_ID_COUNT" >&2
echo "  - .mc-data exists: $HAS_MC_DATA" >&2
echo "" >&2
echo "📌 Bước tiếp theo: Chạy /mcv3:assess để phân tích đầy đủ" >&2
