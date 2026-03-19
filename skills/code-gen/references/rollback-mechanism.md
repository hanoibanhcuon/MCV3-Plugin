# Rollback Mechanism — Code Generation Safety

Tài liệu này mô tả cách bảo vệ trạng thái project trước và trong quá trình gen code,
cũng như cách rollback khi cần.

---

## Trước khi bắt đầu gen code

### Bước 1: MCP Checkpoint

```
mc_checkpoint({
  projectSlug: "{project-slug}",
  label: "pre-codegen-{sys}-{mod}",
  sessionSummary: "Trước khi gen code module {MOD} — System {SYS}",
  nextActions: [
    "Gen code cho {sys}/{mod}",
    "Chạy verification loop",
    "Rollback tới checkpoint này nếu gen thất bại"
  ]
})
```

### Bước 2: Git Branch (nếu project có git)

```bash
# Kiểm tra git repo
git rev-parse --is-inside-work-tree 2>/dev/null

# Nếu có git → tạo branch riêng cho codegen
git checkout -b codegen/{sys}/{mod}
# Hoặc nếu đã ở branch feature
git stash -m "pre-codegen-{sys}/{mod}"
```

### Bước 3: Ghi nhận danh sách files sẽ tạo

Trước khi gen, liệt kê rõ các files sẽ được tạo/sửa:

```
FILES SẼ TẠO — {sys}/{mod}:
  src/{sys}/{mod}/controllers/{mod}.controller.ts  (NEW)
  src/{sys}/{mod}/services/{mod}.service.ts        (NEW)
  src/{sys}/{mod}/repositories/{mod}.repository.ts (NEW)
  src/{sys}/{mod}/validators/{mod}.validator.ts    (NEW)
  src/{sys}/{mod}/__tests__/{mod}.service.test.ts  (NEW)
  db/migrations/V{NNN}__create_{table}.sql         (NEW)
  .github/workflows/ci.yml                         (NEW or MERGE)

FILES SẼ SỬA (nếu có):
  src/{sys}/index.ts                               (APPEND export)
  src/app.ts                                       (APPEND route mount)
```

---

## Trong quá trình gen code

### Checkpoint theo phase

```
Phase 2 (Structure) xong → mc_checkpoint "structure-created-{mod}"
Phase 3 (Code Gen) xong → mc_checkpoint "code-generated-{mod}"
Phase 4 (Config) xong → mc_checkpoint "config-done-{mod}"
```

### Nếu một phase fail

```
NGUYÊN TẮC: Không rollback phase trước đã PASS

Phase 2 PASS → Phase 3 FAIL:
  → Xóa chỉ các files được tạo trong Phase 3
  → Giữ nguyên cấu trúc thư mục từ Phase 2
  → Fix issue → retry Phase 3

Phase 3 PASS → Verification FAIL (không tự fix được):
  → Giữ code Phase 3 (đã qua compile)
  → Đánh dấu issues rõ ràng trong code
  → Báo user danh sách files và issues
```

---

## Rollback khi cần

### Khi nào rollback

| Tình huống | Hành động |
|---|---|
| Compile fail sau 3 retry | Rollback toàn bộ module |
| Test fail > 50% test cases | Rollback module, giữ migration |
| Security CRITICAL không tự fix được | Rollback code, giữ migration |
| User yêu cầu rollback | Rollback theo yêu cầu |
| Verification loop cho kết quả sai hoàn toàn | Rollback + trao đổi với user |

### Cách rollback

**Option A: Git rollback (ưu tiên)**
```bash
# Nếu đang ở branch riêng
git checkout main
git branch -D codegen/{sys}/{mod}

# Nếu đã commit lên branch chính
git revert HEAD --no-edit

# Nếu dùng git stash
git stash pop  # Để restore trạng thái trước codegen
```

**Option B: Xóa files thủ công**
```bash
# Xóa toàn bộ module folder (nếu là NEW hoàn toàn)
rm -rf src/{sys}/{mod}/

# Xóa migration nếu chưa migrate
rm db/migrations/V{NNN}__create_{table}.sql

# Rollback append vào existing files
git checkout src/{sys}/index.ts
git checkout src/app.ts
```

**Option C: MCP Rollback (nếu đã lưu documents qua mc_save)**
```
mc_rollback({
  projectSlug: "{project-slug}",
  targetLabel: "pre-codegen-{sys}-{mod}"
})
```

---

## Danh sách files để xóa khi rollback

Khi rollback module, xóa **đúng các files này** (không xóa file user đã viết):

```
RULE: Chỉ xóa files được tạo bởi /mcv3:code-gen
KHÔNG xóa:
  - Files không trong danh sách "FILES SẼ TẠO" đã lập
  - Files có commit history trước khi gen
  - .mc-data/ (project memory)
  - .env, .env.local (user config)
```

---

## Thông báo rollback cho user

```
⚠️ ROLLBACK REQUIRED — {sys}/{mod}

Lý do: [Compile fail sau 3 lần retry / Test fail > 50% / User yêu cầu]

Các files đã được rollback:
  ❌ src/{sys}/{mod}/controllers/{mod}.controller.ts  (đã xóa)
  ❌ src/{sys}/{mod}/services/{mod}.service.ts        (đã xóa)
  ❌ src/{sys}/{mod}/repositories/{mod}.repository.ts (đã xóa)
  ❌ src/{sys}/{mod}/validators/{mod}.validator.ts    (đã xóa)
  ❌ src/{sys}/{mod}/__tests__/{mod}.service.test.ts  (đã xóa)

Còn lại (không rollback):
  ✅ db/migrations/V{NNN}__create_{table}.sql  (giữ lại — đã review OK)
  ✅ .github/workflows/ci.yml                  (giữ lại — không bị ảnh hưởng)

Vấn đề chưa giải quyết:
  [Mô tả vấn đề cụ thể cần user xử lý]

Đề xuất tiếp theo:
  Option A: Xem lại MODSPEC để làm rõ specs → retry /mcv3:code-gen
  Option B: Giải quyết thủ công file [cụ thể] → báo lại khi xong
  Option C: Chạy /mcv3:tech-design để cập nhật specs rồi retry
```

---

## Retry sau rollback

```
Sau khi rollback và fix vấn đề:

1. Xác nhận vấn đề đã được giải quyết:
   - Nếu là specs thiếu → MODSPEC đã được cập nhật chưa?
   - Nếu là compile error → type definition đã fix chưa?
   - Nếu là security issue → đã có plan xử lý chưa?

2. Retry codegen:
   - mc_load lại MODSPEC (layer 3) để đọc specs mới nhất
   - Thực hiện lại từ Phase 1

3. Không cần tạo checkpoint mới — dùng lại pre-codegen checkpoint
```
