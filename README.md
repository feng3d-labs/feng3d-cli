feng3d 命令行工具，包含项目规范、配置模板等功能。

## 功能特性

- 📋 统一的代码规范（ESLint 配置）
- 📦 统一的依赖版本管理
- 🛠️ CLI 工具支持创建和更新项目
- 📝 项目模板（LICENSE, .gitignore, .cursorrules, tsconfig.json, vite.config.js 等）
- 🔄 GitHub Actions 工作流模板（CI/CD、GitHub Pages 部署、OSS 上传）
- ✅ Git pre-commit 钩子（代码规范检查 + 单元测试）

## 使用方式

推荐使用 `npx` 直接运行，无需安装：

```bash
npx feng3d-cli <command>
```

## CLI 命令

### 创建新项目

```bash
npx feng3d-cli create my-project
```

选项：
- `-d, --directory <dir>` - 项目目录（默认：当前目录）
- `--no-examples` - 不创建示例目录
- `--no-vitest` - 不包含 vitest 测试配置

### 更新现有项目

```bash
npx feng3d-cli update
npx feng3d-cli update -d ./my-project  # 指定项目目录
```

更新项目的所有规范配置文件，包括 ESLint、TypeScript、Vite、GitHub Actions 等。

> 注意：如果项目中存在 `examples` 目录，会自动添加 `examples:dev` 和 `postdocs` 脚本。

## 编程使用

```typescript
import {
    // 版本管理
    VERSIONS,
    getDevDependencies,
    // 模板
    gitignoreTemplate,
    cursorrrulesTemplate,
    getTypedocConfig,
    getLicenseTemplate,
    getVscodeSettingsTemplate,
    getTsconfigTemplate,
    getViteConfigTemplate,
    // 项目操作
    createProject,
    updateProject,
} from 'feng3d-cli';
```

## 模板文件

| 文件 | 说明 |
|------|------|
| LICENSE | MIT 许可证（中文） |
| .gitignore | Git 忽略规则 |
| .cursorrules | Cursor AI 规则 |
| tsconfig.json | TypeScript 配置 |
| vite.config.js | Vite 构建配置 |
| eslint.config.js | ESLint 配置 |
| typedoc.json | TypeDoc 配置 |
| .vscode/settings.json | VS Code 设置 |
| .husky/pre-commit | Git pre-commit 钩子（代码规范 + 单元测试） |
| scripts/prepublish.js | 发布前脚本 |
| scripts/postpublish.js | 发布后脚本 |
| scripts/postdocs.js | 文档生成后处理脚本（移动到 public/doc） |

## GitHub Actions 工作流

| 工作流文件 | 说明 |
|------|------|
| pull-request.yml | 代码检查和测试（PR 或推送时触发） |
| publish.yml | 发布到 npm（创建 Release 时触发） |
| pages.yml | 部署文档到 GitHub Pages（发布成功后或手动触发） |
| upload-oss.yml | 上传到阿里云 OSS（发布成功后或手动触发） |

### OSS 上传配置

要启用 OSS 上传功能，需要在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置以下密钥：

- `OSS_REGION` - OSS 区域（如 `oss-cn-hangzhou`）
- `OSS_ACCESS_KEY_ID` - 阿里云 AccessKey ID
- `OSS_ACCESS_KEY_SECRET` - 阿里云 AccessKey Secret
- `OSS_BUCKET` - OSS Bucket 名称

## 统一版本

| 依赖 | 版本 |
|------|------|
| TypeScript | 5.8.3 |
| ESLint | 9.26.0 |
| Vitest | ^3.1.3 |
| Vite | ^6.3.5 |
| TypeDoc | ^0.28.4 |

## 代码规范

### 缩进
- 使用 4 空格缩进

### 引号
- 使用单引号

### 命名规范
- 变量和函数：camelCase
- 类和接口：PascalCase
- 常量：UPPER_SNAKE_CASE

### Git 提交规范
- 使用简体中文
- 遵循 Conventional Commits 格式
- 类型：feat, fix, refactor, perf, style, docs, test, chore, build, ci

### Pre-commit 检查
提交代码前会自动执行：
1. **代码规范检查** - 使用 ESLint 检查代码风格
2. **单元测试** - 运行 vitest 确保测试通过

## 许可证

MIT
