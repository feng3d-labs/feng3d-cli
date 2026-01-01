feng3d 命令行工具，包含项目规范、配置模板、OSS 上传等功能。

## 功能特性

- 📋 统一的代码规范（ESLint 配置）
- 📦 统一的依赖版本管理
- 🛠️ CLI 工具支持创建和更新项目
- 📝 项目模板（LICENSE, .gitignore, .cursorrules, tsconfig.json, vite.config.js 等）
- 🔄 GitHub Actions 工作流模板
- 📤 阿里云 OSS 文件上传

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

### 上传到阿里云 OSS

```bash
npx feng3d-cli oss_upload_dir                           # 上传 ./public 目录
npx feng3d-cli oss_upload_dir -l ./dist                 # 指定本地目录
npx feng3d-cli oss_upload_dir -l ./public -o my-project # 指定 OSS 目录
```

选项：
- `-l, --local_dir <dir>` - 本地目录（默认：./public）
- `-o, --oss_dir <dir>` - OSS 目录（默认：从 package.json 的 name 获取）

> 注意：需要在用户目录下创建 `oss_config.json` 配置 OSS 访问密钥（如 `~/oss_config.json`）
>
> 配置文件格式：
> ```json
> {
>   "region": "oss-cn-hangzhou",
>   "accessKeyId": "your-access-key-id",
>   "accessKeySecret": "your-access-key-secret",
>   "bucket": "your-bucket-name"
> }
> ```

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
    ossUploadDir,
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
| .husky/pre-commit | Git pre-commit hook |
| .github/workflows/*.yml | GitHub Actions 工作流 |
| scripts/prepublish.js | 发布前脚本 |
| scripts/postpublish.js | 发布后脚本 |

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

## 许可证

MIT
