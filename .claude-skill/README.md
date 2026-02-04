# feng3d Claude Code Skill

这是 feng3d-cli 的 Claude Code Skill 配置，允许你在 Claude Code 中直接使用 feng3d-cli 功能。

## 快速安装 🚀

### 方法 1：通过 Skills.sh（推荐）⭐

使用 [Skills.sh](https://skills.sh/) 生态系统标准方式：

```bash
npx skills add feng3d-labs/feng3d-cli
```

**为什么推荐？**
- ✅ 生态系统标准方式
- ✅ 自动索引和发现
- ✅ 支持多个 AI 代理（Claude Code, Cursor, Windsurf 等）
- ✅ 安装统计和排行榜

### 方法 2：使用 feng3d-cli 命令

```bash
npx feng3d-cli skill
```

**这条命令会：**
- ✅ 自动下载 feng3d-cli（如果未安装）
- ✅ 将 skill 复制到 `~/.claude/skills/feng3d`
- ✅ 无需额外配置或权限

> 💡 提示：也可以使用完整命令 `npx feng3d-cli install-skill`

**全局安装：**

```bash
npm install -g feng3d-cli
feng3d-cli skill
```

### 方法 2：一键安装脚本

**macOS / Linux**：
```bash
curl -fsSL https://raw.githubusercontent.com/feng3d-labs/feng3d-cli/master/.claude-skill/install.sh | bash
```

或者手动下载并执行：
```bash
wget https://raw.githubusercontent.com/feng3d-labs/feng3d-cli/master/.claude-skill/install.sh
chmod +x install.sh
./install.sh
```

**Windows (PowerShell)**：
```powershell
irm https://raw.githubusercontent.com/feng3d-labs/feng3d-cli/master/.claude-skill/install.ps1 | iex
```

或者手动下载并执行：
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/feng3d-labs/feng3d-cli/master/.claude-skill/install.ps1" -OutFile "install.ps1"
.\install.ps1
```

---

## 手动安装方法

### 方式 1：本地安装（推荐用于开发）

将此 skill 复制到你的 Claude Code skills 目录：

```bash
# 创建 skills 目录（如果不存在）
mkdir -p ~/.claude/skills

# 复制 skill 到 Claude 配置目录
cp -r .claude-skill ~/.claude/skills/feng3d
```

### 方式 2：作为 npm 包发布（推荐用于团队使用）

1. 在项目中添加 skill 相关文件到 npm 包：

```json
// package.json
{
  "files": [
    "bin",
    "dist",
    "lib",
    "templates",
    ".claude-skill"
  ]
}
```

2. 发布到 npm（如果还没发布）：

```bash
npm publish
```

3. 用户安装后，创建符号链接：

```bash
npm install -g feng3d-cli
ln -s $(npm root -g)/feng3d-cli/.claude-skill ~/.claude/skills/feng3d
```

### 方式 3：直接从 GitHub 使用

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/feng3d-labs/feng3d-cli.git /tmp/feng3d-cli
cp -r /tmp/feng3d-cli/.claude-skill ~/.claude/skills/feng3d
```

## 使用方法

安装后，在 Claude Code 中可以通过以下方式使用：

### 方法 1：使用 /feng3d 命令（推荐）

```bash
# 创建新项目
/feng3d create my-project

# 更新当前项目
/feng3d update

# 创建项目（带选项）
/feng3d create my-lib --no-examples
```

### 方法 2：直接对话

你也可以直接告诉 Claude：

- "用 feng3d 创建一个新项目"
- "更新我的项目到最新的 feng3d 规范"
- "帮我初始化一个 feng3d 项目"

Claude 会自动调用 feng3d skill 来完成任务。

## 功能说明

### 创建项目 (create)

创建一个符合 feng3d 规范的新项目，包含：

- 统一的项目结构
- 代码规范配置（ESLint）
- TypeScript 配置
- Vite 构建配置
- Vitest 测试配置
- GitHub Actions 工作流
- Git pre-commit 钩子
- 文档生成配置

**选项**：
- `-d, --directory <dir>` - 指定项目目录
- `--no-examples` - 不创建 examples 目录
- `--no-vitest` - 不包含 vitest 配置

### 更新项目 (update)

更新现有项目到最新的 feng3d 规范，会更新：

- 所有配置文件
- 依赖版本
- GitHub Actions 工作流
- 脚本文件

**选项**：
- `-d, --directory <dir>` - 指定项目目录

## 示例对话

### 示例 1：创建新项目

```
你：创建一个新的 feng3d 项目叫 my-library

Claude：我会为你创建一个 feng3d 项目。
[执行: npx feng3d-cli create my-library]

项目创建成功！接下来你需要：
1. cd my-library
2. npm install
3. npm run dev
```

### 示例 2：更新现有项目

```
你：更新当前项目到最新的 feng3d 标准

Claude：我会更新你的项目配置。建议先提交当前更改，这样可以清楚地看到更新了哪些文件。
[执行: npx feng3d-cli update]

配置已更新！建议：
1. 运行 git diff 查看更改
2. 运行 npm install 安装新依赖
3. 运行 npm test 确保测试通过
```

## 文件结构

```
.claude-skill/
├── skill.json       # Skill 元数据配置
├── prompt.md        # Skill 提示词指令
└── README.md        # 使用文档（本文件）
```

## 开发和贡献

如果你想改进这个 skill：

1. 修改 [prompt.md](./prompt.md) 来调整 Claude 的行为
2. 更新 [skill.json](./skill.json) 来修改元数据
3. 测试 skill 是否正常工作
4. 提交 Pull Request

## 技术细节

### 工作原理

这个 skill 是一个"包装器"skill，它：

1. 接收用户的指令
2. 通过 Claude 的 Bash 工具调用 `npx feng3d-cli`
3. 展示命令输出
4. 提供后续建议

### 与 feng3d-cli 的关系

- Skill 不修改 feng3d-cli 的核心代码
- 所有功能都通过调用 CLI 实现
- feng3d-cli 可以独立使用，不依赖 skill
- Skill 只是让在 Claude Code 中使用更方便

## 常见问题

### Q: 如何验证 skill 已安装？

A: 在 Claude Code 中输入 `/help`，应该能看到 feng3d skill 列出。

### Q: Skill 不工作怎么办？

A: 检查：
1. skill 文件是否正确复制到 `~/.claude/skills/feng3d/`
2. skill.json 格式是否正确
3. 重启 Claude Code

### Q: 可以自定义 skill 的行为吗？

A: 可以！编辑 `prompt.md` 文件来调整 Claude 的行为。

### Q: 这个 skill 会随 feng3d-cli 更新吗？

A: 如果使用方式 1 或 3，需要手动更新。如果使用方式 2（npm 包），运行 `npm update -g feng3d-cli` 后重新创建符号链接。

## 相关链接

- [feng3d-cli GitHub](https://github.com/feng3d-labs/feng3d-cli)
- [feng3d-cli 文档](https://feng3d.com/feng3d-cli/)
- [Claude Code 文档](https://github.com/anthropics/claude-code)

## 许可证

MIT
