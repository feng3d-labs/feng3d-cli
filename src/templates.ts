/**
 * 项目模板文件内容
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 模板目录路径
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

/**
 * 获取 .gitignore 模板内容
 */
export function getGitignoreTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.gitignore'), 'utf-8');
}

/**
 * 获取 .cursorrules 模板内容
 */
export function getCursorrrulesTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.cursorrules'), 'utf-8');
}

/**
 * 获取 tsconfig.json 模板内容
 */
export function getTsconfigTemplate(): object
{
    return fs.readJsonSync(path.join(TEMPLATES_DIR, 'tsconfig.json'));
}

/**
 * 获取 vitest.config.ts 模板内容
 */
export function getVitestConfigTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'vitest.config.ts'), 'utf-8');
}

/**
 * 获取 eslint.config.js 模板内容
 */
export function getEslintConfigTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'eslint.config.js'), 'utf-8');
}

/**
 * 获取 typedoc.json 模板内容（返回对象）
 */
export function getTypedocConfig(options: {
    name: string;
    repoName: string;
}): object
{
    return JSON.parse(getTypedocConfigTemplate(options));
}

/**
 * 获取 typedoc.json 模板内容（返回字符串）
 */
export function getTypedocConfigTemplate(options: {
    name: string;
    repoName: string;
}): string
{
    const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'typedoc.json'), 'utf-8');

    return templateContent
        .replace(/\{\{name\}\}/g, options.name)
        .replace(/\{\{repoName\}\}/g, options.repoName);
}

/**
 * 获取 test/index.test.ts 模板内容
 */
export function getTestIndexTemplate(options: { name: string }): string
{
    const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'test/index.test.ts'), 'utf-8');

    return templateContent.replace(/\{\{name\}\}/g, options.name);
}

/**
 * 获取 GitHub Actions publish workflow 模板内容
 */
export function getPublishWorkflowTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.github/workflows/publish.yml'), 'utf-8');
}

/**
 * 获取 GitHub Actions pages workflow 模板内容
 */
export function getPagesWorkflowTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.github/workflows/pages.yml'), 'utf-8');
}

/**
 * 可能的 schema 路径列表（按优先级排序）
 */
const SCHEMA_PATHS = [
    './schemas/feng3d.schema.json',
    './node_modules/feng3d-cli/schemas/feng3d.schema.json',
];

/**
 * 检测可用的 schema 路径
 * 优先级：当前项目 -> 依赖目录
 */
export function detectSchemaPath(projectDir: string): string
{
    for (const schemaPath of SCHEMA_PATHS)
    {
        const fullPath = path.join(projectDir, schemaPath);

        if (fs.existsSync(fullPath))
        {
            return schemaPath;
        }
    }

    // 默认返回 node_modules 路径
    return SCHEMA_PATHS[1];
}

/**
 * 获取 feng3d.json 模板内容
 */
export function getFeng3dConfigTemplate(options: { name: string; schemaPath?: string }): object
{
    const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'feng3d.json'), 'utf-8');
    const content = templateContent.replace(/\{\{name\}\}/g, options.name);
    const config = JSON.parse(content);

    // 如果提供了 schemaPath，则使用它
    if (options.schemaPath)
    {
        config.$schema = options.schemaPath;
    }

    return config;
}

// 为了向后兼容，保留原有的变量导出
/** @deprecated 请使用 getGitignoreTemplate() 函数 */
export const gitignoreTemplate = getGitignoreTemplate();
/** @deprecated 请使用 getCursorrrulesTemplate() 函数 */
export const cursorrrulesTemplate = getCursorrrulesTemplate();
/** @deprecated 请使用 getTsconfigTemplate() 函数 */
export const tsconfigTemplate = getTsconfigTemplate();
/** @deprecated 请使用 getVitestConfigTemplate() 函数 */
export const vitestConfigTemplate = getVitestConfigTemplate();
/** @deprecated 请使用 getTypedocConfig() 函数 */
export const createTypedocConfig = getTypedocConfig;
