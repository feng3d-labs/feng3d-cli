/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies } from '../versions.js';
import { gitignoreTemplate, cursorrrulesTemplate } from '../templates.js';

export interface UpdateOptions {
    directory: string;
    eslint?: boolean;
    gitignore?: boolean;
    cursorrules?: boolean;
    deps?: boolean;
    all?: boolean;
}

/**
 * 更新项目的规范配置
 */
export async function updateProject(options: UpdateOptions): Promise<void>
{
    const projectDir = path.resolve(options.directory);

    // 检查是否是有效的项目目录
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (!await fs.pathExists(packageJsonPath))
    {
        throw new Error(`${projectDir} 不是有效的项目目录（未找到 package.json）`);
    }

    const updateAll = options.all || (!options.eslint && !options.gitignore && !options.cursorrules && !options.deps);

    // 更新 .gitignore
    if (updateAll || options.gitignore)
    {
        await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreTemplate);
        console.log(chalk.gray('  更新: .gitignore'));
    }

    // 更新 .cursorrules
    if (updateAll || options.cursorrules)
    {
        await fs.writeFile(path.join(projectDir, '.cursorrules'), cursorrrulesTemplate);
        console.log(chalk.gray('  更新: .cursorrules'));
    }

    // 更新 eslint.config.js
    if (updateAll || options.eslint)
    {
        await createEslintConfigFile(projectDir);
        console.log(chalk.gray('  更新: eslint.config.js'));
    }

    // 更新依赖版本
    if (updateAll || options.deps)
    {
        await updateDependencies(projectDir);
        console.log(chalk.gray('  更新: package.json devDependencies'));
    }
}

/**
 * 创建 ESLint 配置文件
 */
export async function createEslintConfigFile(projectDir: string): Promise<void>
{
    const eslintConfigContent = `// 导入 ESLint 核心模块
import eslint from '@eslint/js';
// 导入 TypeScript ESLint 配置
import tseslint from 'typescript-eslint';
// 导入全局变量定义
import globals from 'globals';

// 导出 ESLint 配置
export default [
    // 忽略检查的文件和目录
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/lib/**',
            '**/public/**',
            '**/coverage/**',
            '**/.git/**',
        ],
    },
    // 使用 ESLint 推荐配置
    eslint.configs.recommended,
    // 使用 TypeScript ESLint 推荐配置
    ...tseslint.configs.recommended,
    {
        // 语言选项配置
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                global: false,
            },
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-prototype-builtins': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unsafe-declaration-merging': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            'prefer-const': 'off',
            'no-fallthrough': 'off',
            'no-constant-binary-expression': 'off',

            // 注释格式规则
            'spaced-comment': ['warn', 'always', {
                'line': { 'markers': ['/'], 'exceptions': ['-', '+'] },
                'block': { 'markers': ['!'], 'exceptions': ['*'], 'balanced': true },
            }],

            // 空格和换行规则
            'no-trailing-spaces': ['warn', { 'skipBlankLines': false, 'ignoreComments': false }],
            'no-multiple-empty-lines': ['warn', { 'max': 1, 'maxEOF': 1, 'maxBOF': 0 }],
            'lines-between-class-members': ['warn', 'always', { 'exceptAfterSingleLine': true }],
            'padding-line-between-statements': [
                'warn',
                { 'blankLine': 'always', 'prev': '*', 'next': 'return' },
                { 'blankLine': 'any', 'prev': ['const', 'let', 'var'], 'next': ['const', 'let', 'var'] },
            ],

            // 缩进规则 - 4 空格
            'indent': ['warn', 4, {
                'SwitchCase': 1,
                'VariableDeclarator': 'first',
                'outerIIFEBody': 1,
                'MemberExpression': 1,
                'FunctionDeclaration': { 'parameters': 1, 'body': 1 },
                'FunctionExpression': { 'parameters': 1, 'body': 1 },
                'CallExpression': { 'arguments': 1 },
                'ArrayExpression': 1,
                'ObjectExpression': 1,
                'ImportDeclaration': 1,
                'flatTernaryExpressions': false,
                'ignoreComments': false,
            }],

            // 引号规则 - 单引号
            'quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],

            // 其他格式规则
            'semi': ['off'],
            'comma-dangle': ['warn', 'always-multiline'],
            'object-curly-spacing': ['warn', 'always'],
            'array-bracket-spacing': ['warn', 'never'],
            'arrow-spacing': ['warn', { 'before': true, 'after': true }],
            'block-spacing': ['warn', 'always'],
            'comma-spacing': ['warn', { 'before': false, 'after': true }],
            'comma-style': ['warn', 'last'],
            'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true }],
            'keyword-spacing': ['warn', { 'before': true, 'after': true }],
            'space-before-blocks': ['warn', 'always'],
            'space-before-function-paren': ['warn', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' }],
            'space-in-parens': ['warn', 'never'],
            'space-infix-ops': ['warn'],
            'space-unary-ops': ['warn', { 'words': true, 'nonwords': false }],
        },
    },
];
`;

    await fs.writeFile(path.join(projectDir, 'eslint.config.js'), eslintConfigContent);
}

/**
 * 更新 package.json 中的 devDependencies 版本
 */
async function updateDependencies(projectDir: string): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    const standardDeps = getDevDependencies({ includeVitest: true, includeTypedoc: true });

    // 只更新已存在的依赖的版本
    if (packageJson.devDependencies)
    {
        for (const [key, value] of Object.entries(standardDeps))
        {
            if (key in packageJson.devDependencies)
            {
                packageJson.devDependencies[key] = value;
            }
        }
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
}

