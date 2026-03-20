﻿﻿# ============================================================
# install.ps1 — MCV3-Plugin Installer (Windows PowerShell)
# MasterCraft DevKit v3.x
# ============================================================
#
# Cài đặt MCV3-Plugin vào dự án của bạn trên Windows.
#
# Cách dùng (chạy trong PowerShell):
#   .\scripts\install.ps1                       # Cài vào thư mục hiện tại
#   .\scripts\install.ps1 C:\path\to\project    # Cài vào thư mục chỉ định
#
# Ví dụ:
#   .\mcv3-devkit-3.11.2\scripts\install.ps1 C:\projects\my-app
#
# Yêu cầu: Node.js v18+, PowerShell 5.1+

param(
    [Parameter(Position=0)]
    [string]$TargetDir = "."
)

$ErrorActionPreference = "Stop"

# ── Hằng số ─────────────────────────────────────────────────────────────────
$PLUGIN_DIR_NAME = "mcv3-devkit"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginSource = Split-Path -Parent $ScriptDir

# ── Logging ─────────────────────────────────────────────────────────────────
function Log   { Write-Host "[MCV3] $args" -ForegroundColor Cyan }
function OK    { Write-Host "[MCV3] ✅ $args" -ForegroundColor Green }
function Warn  { Write-Host "[MCV3] ⚠  $args" -ForegroundColor Yellow }
function Fail  { Write-Host "[MCV3] ❌ $args" -ForegroundColor Red; exit 1 }
function Section { Write-Host ""; Write-Host "── $args ──────────────────────────────────────" -ForegroundColor Blue }

# ── Đọc version plugin ──────────────────────────────────────────────────────
function Get-PluginVersion {
    $manifest = Join-Path $PluginSource ".claude-plugin\plugin.json"
    if (-not (Test-Path $manifest)) { return "unknown" }
    try {
        $json = Get-Content $manifest -Raw | ConvertFrom-Json
        return $json.version
    } catch { return "unknown" }
}

# ── Main ────────────────────────────────────────────────────────────────────
function Main {
    # Resolve target directory
    try {
        $target = (Resolve-Path $TargetDir).Path
    } catch {
        $target = $TargetDir
        New-Item -ItemType Directory -Path $target -Force | Out-Null
        $target = (Resolve-Path $target).Path
    }

    $pluginVersion = Get-PluginVersion
    $pluginInstallDir = Join-Path $target $PLUGIN_DIR_NAME

    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║  MasterCraft DevKit v$pluginVersion — Installer          ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
    Log "Plugin source : $PluginSource"
    Log "Cài đặt vào  : $target"
    Write-Host ""

    # 1. Kiểm tra prerequisites
    Section "Kiểm tra prerequisites"
    Test-Prerequisites

    # 2. Copy plugin files
    Section "Copy plugin files"
    Copy-PluginFiles -InstallDir $pluginInstallDir

    # 3. Cài đặt slash commands
    Section "Cài đặt slash commands"
    Install-Commands -TargetDir $target

    # 4. Cấu hình .mcp.json
    Section "Cấu hình MCP Server (.mcp.json)"
    Setup-McpJson -TargetDir $target

    # 5. Tạo .claude/CLAUDE.md
    Section "Tạo .claude/CLAUDE.md"
    Setup-ClaudeMd -TargetDir $target -PluginVersion $pluginVersion

    # 6. Cấu hình hooks
    Section "Cấu hình hooks (.claude/settings.json)"
    Setup-SettingsJson -TargetDir $target

    # 7. Build MCP Server
    Section "Build MCP Server"
    Build-McpServer -PluginDir $pluginInstallDir

    # 8. Verify
    Section "Kiểm tra cài đặt"
    $verifyScript = Join-Path $pluginInstallDir "scripts\verify-install.sh"
    if (Test-Path $verifyScript) {
        try { bash $verifyScript $target } catch { Warn "Verify script cần bash" }
    }

    # Hoàn thành
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ Cài đặt thành công!                          ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Plugin  : MasterCraft DevKit v$pluginVersion"
    Write-Host "  Vị trí  : $pluginInstallDir"
    Write-Host ""
    Write-Host "  Bước tiếp theo:" -ForegroundColor Cyan
    Write-Host "  1. Mở dự án bằng Claude Code"
    Write-Host "  2. Gõ: /mcv3:onboard"
    Write-Host ""
    Write-Host "  Bắt đầu ngay:" -ForegroundColor Cyan
    Write-Host "  > /mcv3:discovery   (dự án mới)"
    Write-Host "  > /mcv3:assess      (dự án đang chạy)"
    Write-Host ""
}

# ── Test Prerequisites ───────────────────────────────────────────────────────
function Test-Prerequisites {
    # Kiểm tra Node.js
    try {
        $nodeVersion = node --version 2>&1
        $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($nodeMajor -lt 18) {
            Fail "Node.js v18+ yêu cầu. Hiện tại: $nodeVersion`n  Tải: https://nodejs.org"
        }
        OK "Node.js $nodeVersion"
    } catch {
        Fail "Node.js chưa được cài đặt.`n  Tải tại: https://nodejs.org (yêu cầu v18+)"
    }

    # Kiểm tra npm
    try {
        $npmVersion = npm --version 2>&1
        OK "npm $npmVersion"
    } catch {
        Warn "npm không tìm thấy — sẽ dùng dist/ được đóng gói sẵn"
    }
}

# ── Copy Plugin Files ────────────────────────────────────────────────────────
function Copy-PluginFiles {
    param([string]$InstallDir)

    $items = @(
        ".claude-plugin", "skills", "agents", "templates", "scripts",
        "hooks", "knowledge", "mcp-servers", "CLAUDE.md", "CHANGELOG.md",
        "LICENSE", "README.md"
    )
    if (Test-Path (Join-Path $PluginSource "INSTALL.md")) { $items += "INSTALL.md" }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

    foreach ($item in $items) {
        $src = Join-Path $PluginSource $item
        if (-not (Test-Path $src)) { continue }

        $dst = Join-Path $InstallDir $item
        $dstParent = Split-Path -Parent $dst

        if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
        if (-not (Test-Path $dstParent)) { New-Item -ItemType Directory -Path $dstParent -Force | Out-Null }

        if (Test-Path $src -PathType Container) {
            Copy-Item $src $InstallDir -Recurse -Force
        } else {
            Copy-Item $src $dst -Force
        }
    }

    # Dọn node_modules
    Get-ChildItem -Path $InstallDir -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    OK "Plugin files → $PLUGIN_DIR_NAME\"
}

# ── Install Commands ─────────────────────────────────────────────────────────
function Install-Commands {
    param([string]$TargetDir)

    $srcDir = Join-Path $PluginSource ".claude\commands\mcv3"
    $dstDir = Join-Path $TargetDir ".claude\commands\mcv3"

    if (-not (Test-Path $srcDir)) {
        Warn "Command files không tìm thấy — bỏ qua"
        return
    }

    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $count = 0
    foreach ($file in (Get-ChildItem -Path $srcDir -Filter "*.md")) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        # Cập nhật paths: skills/{name}/SKILL.md → mcv3-devkit/skills/{name}/SKILL.md
        $content = $content -replace 'skills/([a-z-]+)/SKILL\.md', "$PLUGIN_DIR_NAME/skills/`$1/SKILL.md"
        # Ghi UTF-8 không BOM
        [System.IO.File]::WriteAllText((Join-Path $dstDir $file.Name), $content, $utf8NoBom)
        $count++
    }

    OK "$count slash commands → .claude\commands\mcv3\"
}

# ── Setup .mcp.json ──────────────────────────────────────────────────────────
function Setup-McpJson {
    param([string]$TargetDir)

    $mcpFile = Join-Path $TargetDir ".mcp.json"

    # Kiểm tra đã có chưa
    if (Test-Path $mcpFile) {
        $content = Get-Content $mcpFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "mcv3-project-memory") {
            OK ".mcp.json đã có mcv3-project-memory — giữ nguyên"
            return
        }
    }

    # Tạo node script tạm
    $tmpJs = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript = @"
const fs = require('fs');
const mcpFile = process.argv[2];
const pluginDir = process.argv[3];
let json = { mcpServers: {} };
if (fs.existsSync(mcpFile)) {
  try { json = JSON.parse(fs.readFileSync(mcpFile, 'utf8')); }
  catch(e) { console.error('Parse error:', e.message); process.exit(1); }
}
if (!json.mcpServers) json.mcpServers = {};
json.mcpServers['mcv3-project-memory'] = {
  "type": "stdio",
  "command": "node",
  "args": ["./" + pluginDir + "/mcp-servers/project-memory/dist/index.js"],
  "env": { "MCV3_PROJECT_ROOT": "." },
  "description": "MCV3 Project Memory Server"
};
fs.writeFileSync(mcpFile, JSON.stringify(json, null, 2) + '\n');
"@
    Set-Content $tmpJs $nodeScript -Encoding UTF8

    try {
        node $tmpJs $mcpFile $PLUGIN_DIR_NAME 2>&1 | Out-Null
        OK ".mcp.json → mcv3-project-memory đã cấu hình"
    } catch {
        Warn "Không thể cập nhật .mcp.json tự động. Thêm thủ công."
    } finally {
        Remove-Item $tmpJs -Force -ErrorAction SilentlyContinue
    }
}

# ── Setup .claude/CLAUDE.md ──────────────────────────────────────────────────
function Setup-ClaudeMd {
    param([string]$TargetDir, [string]$PluginVersion)

    $claudeDir = Join-Path $TargetDir ".claude"
    $claudeMd = Join-Path $claudeDir "CLAUDE.md"

    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null

    if (Test-Path $claudeMd) {
        $content = Get-Content $claudeMd -Raw -ErrorAction SilentlyContinue
        if ($content -match "mcv3-devkit") {
            OK ".claude\CLAUDE.md đã có MCV3 reference — giữ nguyên"
            return
        }
    }

    # Nội dung CLAUDE.md
    $claudeContent = @"

---

## MCV3-Plugin v$PluginVersion

Plugin MasterCraft DevKit đã cài đặt tại ``$PLUGIN_DIR_NAME/``.

### Quy tắc bắt buộc

1. **Bắt đầu session mới**: Gọi ``mc_status()`` để xem project context
2. **Lưu tài liệu**: Dùng ``mc_save`` — KHÔNG ghi ``.mc-data/`` trực tiếp
3. **Ngôn ngữ**: Documentation và comments bằng tiếng Việt
4. **Scale-aware**: Không cần full 8 phases cho mọi dự án
5. **Auto-Mode**: Skills tự chạy hoàn toàn — KHÔNG hỏi "confirm không?"

### MCP Tools (19 tools — mcv3-project-memory)

```
mc_init_project   mc_save        mc_load        mc_list        mc_status
mc_checkpoint     mc_resume      mc_validate    mc_export      mc_search
mc_snapshot       mc_rollback    mc_impact_analysis            mc_traceability
mc_dependency     mc_compare     mc_merge       mc_changelog   mc_summary
```

### Slash Commands

| Lệnh | Mục đích |
|------|---------|
| ``/mcv3:discovery`` | Phase 1: Khởi động dự án mới |
| ``/mcv3:expert-panel`` | Phase 2: Phân tích chuyên gia |
| ``/mcv3:biz-docs`` | Phase 3: Tài liệu nghiệp vụ |
| ``/mcv3:requirements`` | Phase 4: User Requirements |
| ``/mcv3:tech-design`` | Phase 5: Technical Design |
| ``/mcv3:qa-docs`` | Phase 6: QA & Documentation |
| ``/mcv3:code-gen`` | Phase 7: Code Generation |
| ``/mcv3:verify`` | Phase 8a: Verification |
| ``/mcv3:deploy-ops`` | Phase 8b: Deploy Ops |
| ``/mcv3:status`` | Dashboard tiến độ |
| ``/mcv3:assess`` | Đánh giá dự án in-progress |
| ``/mcv3:change-manager`` | Quản lý thay đổi |
| ``/mcv3:evolve`` | Thêm features mới |
| ``/mcv3:onboard`` | Tutorial user mới |

### Quick Start

```
/mcv3:discovery   (dự án mới)
/mcv3:assess      (dự án đang chạy)
/mcv3:status      (xem tiến độ)
```

Tài liệu đầy đủ: ``$PLUGIN_DIR_NAME/CLAUDE.md``
"@

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    if (Test-Path $claudeMd) {
        $existing = [System.IO.File]::ReadAllText($claudeMd, $utf8NoBom)
        [System.IO.File]::WriteAllText($claudeMd, $existing + $claudeContent, $utf8NoBom)
        OK ".claude\CLAUDE.md đã cập nhật với MCV3 instructions"
    } else {
        [System.IO.File]::WriteAllText($claudeMd, "# CLAUDE.md — Project Configuration$claudeContent", $utf8NoBom)
        OK ".claude\CLAUDE.md đã tạo với MCV3 instructions"
    }
}

# ── Setup .claude/settings.json ──────────────────────────────────────────────
function Setup-SettingsJson {
    param([string]$TargetDir)

    $claudeDir = Join-Path $TargetDir ".claude"
    $settingsFile = Join-Path $claudeDir "settings.json"

    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null

    if (Test-Path $settingsFile) {
        $content = Get-Content $settingsFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "auto-checkpoint") {
            OK ".claude\settings.json đã có MCV3 hooks — giữ nguyên"
            return
        }
    }

    $tmpJs = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript = @"
const fs = require('fs');
const settingsFile = process.argv[2];
const pluginDir = process.argv[3];
let json = {};
try { json = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch(e) {}
if (!json.hooks) json.hooks = {};
if (!json.hooks.Stop) json.hooks.Stop = [];
const has = json.hooks.Stop.some(
  h => h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('auto-checkpoint'))
);
if (!has) {
  json.hooks.Stop.push({
    "matcher": "",
    "hooks": [{ "type": "command", "command": "bash " + pluginDir + "/scripts/auto-checkpoint.sh" }]
  });
}
fs.writeFileSync(settingsFile, JSON.stringify(json, null, 2) + '\n');
"@
    Set-Content $tmpJs $nodeScript -Encoding UTF8

    try {
        node $tmpJs $settingsFile $PLUGIN_DIR_NAME 2>&1 | Out-Null
        OK ".claude\settings.json → hooks đã cấu hình"
    } catch {
        Warn "Không thể cập nhật settings.json tự động"
    } finally {
        Remove-Item $tmpJs -Force -ErrorAction SilentlyContinue
    }
}

# ── Build MCP Server ─────────────────────────────────────────────────────────
function Build-McpServer {
    param([string]$PluginDir)

    $serverDir = Join-Path $PluginDir "mcp-servers\project-memory"
    $distIndex = Join-Path $serverDir "dist\index.js"

    # Nếu dist/ đã có → dùng sẵn
    if (Test-Path $distIndex) {
        OK "MCP Server: sử dụng dist/ được đóng gói sẵn"
        return
    }

    # Cần npm để build
    try { npm --version | Out-Null } catch {
        Warn "npm không có và dist/ chưa có — build thủ công:"
        Warn "  cd '$serverDir'"
        Warn "  npm install; npm run build"
        return
    }

    if (-not (Test-Path (Join-Path $serverDir "package.json"))) {
        Warn "package.json không tìm thấy"
        return
    }

    try {
        Log "npm install..."
        Push-Location $serverDir
        npm install --silent 2>&1 | Out-Null
        Log "npm run build..."
        npm run build 2>&1 | Out-Null
        Pop-Location

        if (Test-Path $distIndex) {
            OK "MCP Server đã build thành công"
        } else {
            Warn "Build có vẻ thất bại — kiểm tra thủ công"
        }
    } catch {
        Pop-Location -ErrorAction SilentlyContinue
        Warn "Build thất bại: $_"
        Warn "Thử thủ công: cd '$serverDir'; npm install; npm run build"
    }
}

# ── Run ──────────────────────────────────────────────────────────────────────
Main
