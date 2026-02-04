#!/bin/bash
# feng3d Skill 安装脚本（macOS/Linux）

set -e

SKILL_DIR="$HOME/.claude/skills/feng3d"
REPO_URL="https://github.com/feng3d-labs/feng3d-cli.git"

echo "📦 开始安装 feng3d Claude Code Skill..."

# 创建 skills 目录
echo "1. 创建 skills 目录..."
mkdir -p "$HOME/.claude/skills"

# 检查是否已安装
if [ -d "$SKILL_DIR" ]; then
    echo "⚠️  检测到已安装的 skill，将进行更新..."
    rm -rf "$SKILL_DIR"
fi

# 检测安装方式
if [ -d ".git" ] && [ -f ".claude-skill/skill.json" ]; then
    # 本地仓库
    echo "2. 从本地仓库复制..."
    cp -r .claude-skill "$SKILL_DIR"
elif command -v npm &> /dev/null; then
    # 尝试从 npm 安装
    echo "2. 尝试从 npm 包安装..."
    npm_root=$(npm root -g 2>/dev/null || echo "")
    if [ -n "$npm_root" ] && [ -d "$npm_root/feng3d-cli/.claude-skill" ]; then
        cp -r "$npm_root/feng3d-cli/.claude-skill" "$SKILL_DIR"
    else
        echo "   npm 包未找到，从 GitHub 克隆..."
        TEMP_DIR=$(mktemp -d)
        git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
        cp -r "$TEMP_DIR/.claude-skill" "$SKILL_DIR"
        rm -rf "$TEMP_DIR"
    fi
else
    # 从 GitHub 克隆
    echo "2. 从 GitHub 克隆..."
    TEMP_DIR=$(mktemp -d)
    git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
    cp -r "$TEMP_DIR/.claude-skill" "$SKILL_DIR"
    rm -rf "$TEMP_DIR"
fi

# 验证安装
if [ -f "$SKILL_DIR/skill.json" ]; then
    echo ""
    echo "✅ feng3d Skill 安装成功！"
    echo ""
    echo "安装位置: $SKILL_DIR"
    echo ""
    echo "使用方法:"
    echo "  /feng3d create my-project"
    echo "  /feng3d update"
    echo ""
    echo "或直接对话: \"用 feng3d 创建一个新项目\""
    echo ""
    echo "💡 提示: 可能需要重启 Claude Code 使 skill 生效"
else
    echo ""
    echo "❌ 安装失败，请检查错误信息"
    exit 1
fi
