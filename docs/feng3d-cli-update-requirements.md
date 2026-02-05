# feng3d-cli update 命令功能需求清单

## 命令基础功能

```bash
npx feng3d-cli update [options]
```

### 选项参数
- [ ] `-d, --directory <dir>` - 指定项目目录（默认当前目录）
- [ ] `--dry-run` - 预览更改而不实际修改文件
- [ ] `--force` - 强制覆盖已存在的配置文件
- [ ] `--interactive` - 交互式模式，让用户选择要更新的部分

---

## 功能模块详细清单

### 1. ESLint 配置更新

- [ ] 检测是否存在旧的 `.eslintrc.json` / `.eslintrc.js` / `.eslintrc.yml`
- [ ] 自动迁移到新的 `eslint.config.js` (ESLint 9.x 扁平配置)
- [ ] 保留用户自定义规则，智能合并 feng3d 标准规则
- [ ] 更新 `.eslintignore` 或在 `eslint.config.js` 中配置 ignore
- [ ] 更新 package.json 中的 lint 脚本：
  ```json
  {
    "scripts": {
      "lint": "eslint .",
      "lintfix": "eslint . --fix"
    }
  }
  ```

**标准 ESLint 配置要点**：
- 使用 4 空格缩进
- 使用单引号
- 命名规范：camelCase (变量/函数)、PascalCase (类/接口)、UPPER_SNAKE_CASE (常量)

---

### 2. TypeScript 配置更新

- [ ] 更新 `tsconfig.json` 到 feng3d 标准配置
- [ ] 保留项目特定配置（如 Vue、React 相关配置）
- [ ] 确保以下关键配置项：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "experimentalDecorators": true
  }
}
```

---

### 3. Vite 配置更新

- [ ] 检测是否存在 `vite.config.js` / `vite.config.ts`
- [ ] 更新基础配置，保留项目自定义插件
- [ ] 确保包含标准的 build 配置
- [ ] 保持用户自定义的 server 配置和插件

---

### 4. Vitest 配置

- [ ] 创建或更新 `vitest.config.ts`
- [ ] 检查是否已经安装 vitest 相关依赖
- [ ] 提供基础配置模板：

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

---

### 5. TypeDoc 配置

- [ ] 创建或更新 `typedoc.json`
- [ ] 标准配置模板：

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "README.md",
  "excludePrivate": true,
  "excludeProtected": false
}
```

---

### 6. package.json 更新

#### 依赖版本统一
- [ ] 更新以下依赖到统一标准版本：
  - `typescript`: `5.8.3`
  - `eslint`: `9.26.0`
  - `vite`: `^6.3.5`
  - `vitest`: `^3.1.3`
  - `typedoc`: `^0.28.4`

#### 标准 Scripts
- [ ] 添加或更新标准 scripts：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lintfix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "docs": "typedoc",
    "prepare": "husky install",
    "prepublishOnly": "node scripts/prepublish.js",
    "postpublish": "node scripts/postpublish.js"
  }
}
```

- [ ] 保留项目已有的自定义 scripts
- [ ] 检测并合并重复的脚本命令

---

### 7. Husky 预提交钩子

- [ ] 检查是否已安装 husky
- [ ] 如未安装，添加 husky 到 devDependencies
- [ ] 初始化 husky：`npx husky install`
- [ ] 创建 `.husky/pre-commit` 钩子：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行代码检查
npm run lint

# 运行测试
npm test
```

- [ ] 在 package.json 添加 `"prepare": "husky install"`
- [ ] 确保钩子文件具有执行权限

---

### 8. 脚本文件创建

#### scripts/prepublish.js
- [ ] 创建发布前检查脚本：
  - 检查是否有未提交的更改
  - 运行 lint 检查
  - 运行测试
  - 运行构建
  - 验证构建产物

#### scripts/postpublish.js
- [ ] 创建发布后脚本：
  - 打标签
  - 推送到远程仓库
  - 上传到 OSS（可选）

#### scripts/postdocs.js
- [ ] 创建文档生成后脚本：
  - 优化文档输出
  - 上传文档到 OSS 或 GitHub Pages

---

### 9. GitHub Actions 工作流

#### .github/workflows/pull-request.yml
- [ ] 创建 PR 检查工作流：
  - 代码风格检查 (ESLint)
  - 类型检查 (TypeScript)
  - 单元测试
  - 构建测试

```yaml
name: Pull Request Checks

on:
  pull_request:
    branches: [main, master, develop]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

#### .github/workflows/publish.yml
- [ ] 创建 npm 发布工作流

#### .github/workflows/pages.yml
- [ ] 创建 GitHub Pages 部署工作流

#### .github/workflows/upload-oss.yml
- [ ] 创建阿里云 OSS 上传工作流
- [ ] 需要的 Secrets：
  - `OSS_REGION`
  - `OSS_ACCESS_KEY_ID`
  - `OSS_ACCESS_KEY_SECRET`
  - `OSS_BUCKET`

---

### 10. 其他标准文件

#### LICENSE
- [ ] 创建或更新 MIT 许可证（中文版）

#### .gitignore
- [ ] 更新 .gitignore，添加 feng3d 标准忽略项：
  ```
  # 依赖
  node_modules/

  # 构建产物
  dist/
  dist-*/
  lib/
  *.tsbuildinfo

  # 测试覆盖率
  coverage/
  .nyc_output/

  # 文档
  docs/

  # 编辑器
  .vscode/
  .idea/
  *.swp
  *.swo
  *~

  # 系统文件
  .DS_Store
  Thumbs.db

  # 环境变量
  .env
  .env.local
  ```

#### .vscode/settings.json
- [ ] 创建或更新 VS Code 设置：

```json
{
  "editor.tabSize": 4,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

#### .cursorrules
- [ ] 创建或更新 Cursor AI 规则文件

---

### 11. 智能合并策略

- [ ] **不覆盖用户自定义配置**，采用智能合并
- [ ] 对于已存在的配置文件，提供三种处理方式：
  1. **覆盖** - 完全使用 feng3d 标准配置
  2. **合并** - 保留用户配置，添加缺失的标准配置
  3. **跳过** - 不修改该文件
- [ ] 在交互模式下，逐个文件询问用户选择
- [ ] 在非交互模式下，默认使用合并策略
- [ ] 提供 `--merge-strategy` 选项：
  - `overwrite` - 覆盖所有文件
  - `merge` - 智能合并（默认）
  - `skip-existing` - 跳过已存在的文件

---

### 12. Monorepo 支持

- [ ] 检测是否是 monorepo（检查 workspaces 字段）
- [ ] 对每个子包递归应用相同的更新策略
- [ ] 支持 `--packages <names>` 选项指定要更新的包
- [ ] 支持 `--root-only` 选项仅更新根目录
- [ ] 根目录和子包使用不同的配置策略：
  - 根目录：共享配置文件
  - 子包：继承根配置，可覆盖部分选项

---

### 13. 版本兼容性检查

- [ ] 检查 Node.js 版本（建议 >= 18.0.0）
- [ ] 检查 npm/yarn/pnpm 版本
- [ ] 检查是否有冲突的依赖版本
- [ ] 提供依赖升级建议和破坏性变更警告
- [ ] 生成依赖升级报告

---

### 14. 回滚功能

- [ ] 在更新前自动创建备份到 `.feng3d-cli-backup/`
- [ ] 备份内容包括：
  - 所有被修改的配置文件
  - package.json
  - package-lock.json / yarn.lock / pnpm-lock.yaml
- [ ] 提供 `npx feng3d-cli rollback` 命令恢复更新
- [ ] 支持 `--backup-id` 选项恢复指定时间点的备份
- [ ] 自动清理超过 7 天的备份

---

### 15. 更新日志与报告

- [ ] 生成 `.feng3d-cli-update.log` 记录详细更新内容
- [ ] 在控制台输出清晰的更新摘要：
  ```
  ✓ 已更新文件：
    - eslint.config.js (迁移自 .eslintrc.json)
    - package.json (更新依赖版本)
    - tsconfig.json (更新配置)

  + 已创建文件：
    - vitest.config.ts
    - .husky/pre-commit
    - scripts/prepublish.js

  ! 需要手动处理：
    - vite.config.js 包含自定义插件，请手动检查

  → 下一步操作：
    1. 运行 npm install 安装新依赖
    2. 运行 npm run lint 检查代码风格
    3. 运行 npm test 确保测试通过
  ```

---

## 实现优先级

### P0 (必须实现)
1. ✅ ESLint 配置迁移（.eslintrc.json → eslint.config.js）
2. ✅ package.json 依赖版本更新
3. ✅ TypeScript 配置更新
4. ✅ 标准 scripts 添加
5. ✅ 智能合并策略（基础版本）

### P1 (重要功能)
6. ✅ Vitest 配置创建
7. ✅ Husky 预提交钩子设置
8. ✅ GitHub Actions 工作流
9. ✅ 更新日志与报告
10. ✅ 版本兼容性检查

### P2 (增强功能)
11. ✅ TypeDoc 配置
12. ✅ 脚本文件创建
13. ✅ 回滚功能
14. ✅ 交互式模式

### P3 (可选功能)
15. ✅ Monorepo 支持
16. ✅ 自定义模板支持
17. ✅ 配置文件验证

---

## Git 提交规范

项目应遵循以下 Git 提交规范（Conventional Commits）：

- **类型**：feat, fix, refactor, perf, style, docs, test, chore, build, ci
- **语言**：使用简体中文
- **格式**：`<type>: <description>`

示例：
- `feat: 添加用户登录功能`
- `fix: 修复按钮点击无响应的问题`
- `refactor: 重构用户服务层代码`
- `docs: 更新 API 文档`

---

## 代码风格标准

### 缩进
- 使用 4 个空格缩进

### 引号
- 使用单引号（'）

### 命名规范
- 变量和函数：camelCase (例: `getUserData`, `isActive`)
- 类和接口：PascalCase (例: `UserService`, `IUserData`)
- 常量：UPPER_SNAKE_CASE (例: `MAX_COUNT`, `API_URL`)

### 其他规范
- 使用分号结尾
- 大括号风格：Allman 风格（大括号独占一行）
- 箭头函数：优先使用箭头函数

---

## 测试要求

更新后项目应支持以下测试命令：

```bash
# 运行测试（监视模式）
npm test

# 运行测试（单次）
npm run test:run

# 运行测试并生成覆盖率报告
npm run coverage

# 运行测试 UI
npm run test:ui
```

---

## 文档生成

更新后项目应支持以下文档命令：

```bash
# 生成 API 文档
npm run docs

# 文档应输出到 docs/ 目录
# 支持 TypeDoc 插件生成 Markdown 格式文档
```

---

## 依赖管理

### 统一版本的依赖

| 依赖 | 版本 |
|------|------|
| TypeScript | 5.8.3 |
| ESLint | 9.26.0 |
| Vitest | ^3.1.3 |
| Vite | ^6.3.5 |
| TypeDoc | ^0.28.4 |
| Husky | ^9.0.0 |

### ESLint 相关依赖
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `eslint-config-standard` (可选)

### Vitest 相关依赖
- `vitest`
- `@vitest/ui`
- `@vitest/coverage-v8`

---

## 注意事项

1. **备份重要性**：更新前务必创建备份，避免丢失用户自定义配置
2. **增量更新**：优先支持增量更新，而非完全覆盖
3. **兼容性**：考虑不同项目类型（纯 TS、Vue、React 等）的差异
4. **错误处理**：提供清晰的错误提示和恢复建议
5. **文档**：为每个更新操作提供详细的说明文档
6. **测试**：对 update 命令进行充分测试，覆盖各种场景

---

## 附录：相关资源

- [ESLint 扁平配置迁移指南](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Vitest 配置文档](https://vitest.dev/config/)
- [TypeDoc 配置文档](https://typedoc.org/options/)
- [Husky 使用文档](https://typicode.github.io/husky/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**文档版本**: 1.0
**创建日期**: 2026-02-05
**最后更新**: 2026-02-05
