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
 * 获取 typedoc.json 模板内容
 */
export function getTypedocConfig(options: {
    name: string;
    repoName: string;
}): object
{
    const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'typedoc.json'), 'utf-8');
    const content = templateContent
        .replace(/\{\{name\}\}/g, options.name)
        .replace(/\{\{repoName\}\}/g, options.repoName);

    return JSON.parse(content);
}

/**
 * 获取 GitHub Actions publish workflow 模板内容
 */
export function getPublishWorkflowTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.github/workflows/publish.yml'), 'utf-8');
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
