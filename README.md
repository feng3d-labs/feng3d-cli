feng3d 命令行工具，包含项目规范、配置模板、OSS 上传等功能。

## 功能特性

- 📋 统一的代码规范（ESLint 配置）
- 📦 统一的依赖版本管理
- 🛠️ CLI 工具支持创建和更新项目
- 📝 项目模板（.gitignore, .cursorrules, tsconfig.json 等）
- 📤 阿里云 OSS 文件上传

## 安装

```bash
npm install -g feng3d-cli
```

或作为开发依赖：

```bash
npm install -D feng3d-cli
```

## CLI 使用

### 创建新项目

```bash
feng3d-cli create my-project
```

选项：
- `-d, --directory <dir>` - 项目目录（默认：当前目录）
- `--no-examples` - 不创建示例目录
- `--no-vitest` - 不包含 vitest 测试配置

### 更新现有项目

```bash
feng3d-cli update
```

选项：
- `-d, --directory <dir>` - 项目目录（默认：当前目录）
- `--eslint` - 仅更新 ESLint 配置
- `--gitignore` - 仅更新 .gitignore
- `--cursorrules` - 仅更新 .cursorrules
- `--deps` - 仅更新依赖版本
- `--all` - 更新所有配置

### 上传到阿里云 OSS

```bash
feng3d-cli oss_upload_dir                           # 上传 ./public 目录
feng3d-cli oss_upload_dir -l ./dist                 # 指定本地目录
feng3d-cli oss_upload_dir -l ./public -o my-project # 指定 OSS 目录
```

选项：
- `-l, --local_dir <dir>` - 本地目录（默认：./public）
- `-o, --oss_dir <dir>` - OSS 目录（默认：从 package.json 的 name 获取）

> 注意：需要在 `C:/Users/Administrator/oss_config.json` 配置 OSS 访问密钥

## 编程使用

### 获取统一版本

```typescript
import { VERSIONS, getDevDependencies } from 'feng3d-cli';

// 获取特定依赖版本
console.log(VERSIONS.typescript); // '5.8.3'
console.log(VERSIONS.vitest);     // '^3.1.3'

// 获取完整的 devDependencies
const deps = getDevDependencies({
    includeVitest: true,
    includeCoverage: true,
    includeTypedoc: true,
});
```

### 使用 ESLint 配置

在项目的 `eslint.config.js` 中：

```javascript
import { eslintRules } from 'feng3d-cli/eslint';

export default [
    // ... 其他配置
    {
        rules: eslintRules,
    },
];
```

### 使用模板

```typescript
import {
    gitignoreTemplate,
    cursorrrulesTemplate,
    tsconfigTemplate,
    createTypedocConfig,
} from 'feng3d-cli';

// 创建 typedoc 配置
const config = createTypedocConfig({
    name: '@feng3d/my-package',
    repoName: 'my-package',
});
```

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

