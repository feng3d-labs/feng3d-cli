/**
 * 项目模板文件内容
 */

/**
 * .gitignore 模板
 */
export const gitignoreTemplate = `node_modules
dist
lib
public
out
# 自动生成的测试配置文件
**/test-config.ts
# 测试构建输出目录
test_dist
# 测试覆盖率
coverage
`;

/**
 * .cursorrules 模板
 */
export const cursorrrulesTemplate = `# Cursor 项目规则

## Git 提交信息规范

当生成 Git 提交信息时：

1. **语言**：始终使用简体中文

2. **格式**：遵循约定式提交（Conventional Commits）格式
   \`\`\`
   <类型>(<范围>): <简短描述>

   [可选的详细说明]

   [可选的脚注]
   \`\`\`

3. **提交类型**（中文描述）：
   - \`feat\`: 新增功能
   - \`fix\`: 修复问题
   - \`refactor\`: 代码重构（不改变功能）
   - \`perf\`: 性能优化
   - \`style\`: 代码格式调整（不影响代码含义）
   - \`docs\`: 文档更新
   - \`test\`: 测试相关
   - \`chore\`: 构建过程或辅助工具的变动
   - \`build\`: 构建系统或外部依赖项的更改
   - \`ci\`: CI 配置文件和脚本的更改

4. **范围**（可选）：可以是模块、组件或功能区域

5. **提交信息要求**：
   - 第一行简短描述，不超过 50 个字符
   - 使用祈使句，如"添加"、"修复"、"优化"
   - 描述要清晰、具体、有意义

## 代码风格

- 优先使用 TypeScript
- 遵循现有代码的命名约定和格式
- 添加必要的中文注释以提高代码可读性
- 使用 ESLint 保持代码格式一致
- 提交前必须通过 lint 检查
- 避免使用 \`any\` 类型，优先使用明确的类型定义

## 命名规范

- **变量和函数**：使用驼峰命名（camelCase）
- **类和接口**：使用帕斯卡命名（PascalCase）
- **常量**：使用全大写下划线分隔（UPPER_SNAKE_CASE）
- **文件名**：使用小写字母和连字符（kebab-case）或与导出的主要类/函数同名

## 注释规范

- 公共 API 必须添加 JSDoc 注释
- 复杂逻辑必须添加中文注释说明
- 临时解决方案或待优化代码必须添加 TODO 注释
- 注释应该解释"为什么"而不是"是什么"

## 模块结构

- 避免使用默认导出，优先使用命名导出
- 每个文件应该有一个明确的职责
- 每个文件应该不超过 300 行代码
- 相关功能应该组织在同一个目录下

## 测试规范

- 新功能必须包含相应的测试
- 修复 bug 时必须添加回归测试
- 测试覆盖率应该保持在合理水平（建议 > 80%）
- 测试应该清晰、独立、可重复

## Agent 规则

- 没有正确修复问题时重新修复时，尽量还原上次修改的内容后再进行修复
- 每次完成代码修改后，必须检查并处理编译错误
- 确保所有测试通过后再告知用户任务完成
`;

/**
 * tsconfig.json 模板
 */
export const tsconfigTemplate = {
    compilerOptions: {
        target: 'ES5',
        module: 'CommonJS',
        noImplicitAny: false,
        sourceMap: true,
        declarationMap: true,
        declaration: true,
        experimentalDecorators: true,
        emitDeclarationOnly: true,
        skipLibCheck: true,
        esModuleInterop: true,
        downlevelIteration: true,
        lib: ['ES2015', 'ES2017', 'ES2020', 'DOM'],
        outDir: 'lib',
    },
    include: ['src/**/*.ts'],
};

/**
 * vitest.config.ts 模板
 */
export const vitestConfigTemplate = `import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        testTimeout: 0,
    },
});
`;

/**
 * typedoc.json 模板
 */
export function createTypedocConfig(options: {
    name: string;
    repoName: string;
}): object
{
    return {
        name: options.name,
        $schema: 'https://typedoc.org/schema.json',
        entryPoints: ['src/index.ts'],
        sourceLinkTemplate: `https://github.com/feng3d-labs/${options.repoName}/tree/master/{path}#L{line}`,
        out: 'public/docs',
    };
}

