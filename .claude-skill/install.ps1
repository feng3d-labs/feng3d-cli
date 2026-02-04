# feng3d Skill 安装脚本（Windows PowerShell）

$ErrorActionPreference = "Stop"

$SkillDir = "$env:USERPROFILE\.claude\skills\feng3d"
$RepoUrl = "https://github.com/feng3d-labs/feng3d-cli.git"

Write-Host "📦 开始安装 feng3d Claude Code Skill..." -ForegroundColor Cyan

# 创建 skills 目录
Write-Host "1. 创建 skills 目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills" | Out-Null

# 检查是否已安装
if (Test-Path $SkillDir) {
    Write-Host "⚠️  检测到已安装的 skill，将进行更新..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $SkillDir
}

# 检测安装方式
if ((Test-Path ".git") -and (Test-Path ".claude-skill\skill.json")) {
    # 本地仓库
    Write-Host "2. 从本地仓库复制..." -ForegroundColor Yellow
    Copy-Item -Path ".claude-skill" -Destination $SkillDir -Recurse -Force
}
elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    # 尝试从 npm 安装
    Write-Host "2. 尝试从 npm 包安装..." -ForegroundColor Yellow
    try {
        $npmRoot = npm root -g 2>$null
        $npmSkillPath = Join-Path $npmRoot "feng3d-cli\.claude-skill"

        if (Test-Path $npmSkillPath) {
            Copy-Item -Path $npmSkillPath -Destination $SkillDir -Recurse -Force
        }
        else {
            throw "npm 包未找到"
        }
    }
    catch {
        Write-Host "   npm 包未找到，从 GitHub 克隆..." -ForegroundColor Yellow
        $TempDir = Join-Path $env:TEMP "feng3d-cli-$(Get-Random)"
        git clone --depth 1 $RepoUrl $TempDir
        Copy-Item -Path "$TempDir\.claude-skill" -Destination $SkillDir -Recurse -Force
        Remove-Item -Recurse -Force $TempDir
    }
}
else {
    # 从 GitHub 克隆
    Write-Host "2. 从 GitHub 克隆..." -ForegroundColor Yellow
    $TempDir = Join-Path $env:TEMP "feng3d-cli-$(Get-Random)"
    git clone --depth 1 $RepoUrl $TempDir
    Copy-Item -Path "$TempDir\.claude-skill" -Destination $SkillDir -Recurse -Force
    Remove-Item -Recurse -Force $TempDir
}

# 验证安装
if (Test-Path "$SkillDir\skill.json") {
    Write-Host ""
    Write-Host "✅ feng3d Skill 安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "安装位置: $SkillDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "使用方法:" -ForegroundColor Yellow
    Write-Host "  /feng3d create my-project"
    Write-Host "  /feng3d update"
    Write-Host ""
    Write-Host "或直接对话: `"用 feng3d 创建一个新项目`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 提示: 可能需要重启 Claude Code 使 skill 生效" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "❌ 安装失败，请检查错误信息" -ForegroundColor Red
    exit 1
}
