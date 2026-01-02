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
    // 模板文件命名为 gitignore（不带点），避免对 templates 目录生效
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'gitignore'), 'utf-8');
}

/**
 * 获取 .cursorrules 模板内容
 */
export function getCursorrrulesTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.cursorrules'), 'utf-8');
}

/**
 * 获取 tsconfig.json 模板内容（对象形式）
 */
export function getTsconfigTemplate(): object
{
    return fs.readJsonSync(path.join(TEMPLATES_DIR, 'tsconfig.json'));
}

/**
 * 获取 tsconfig.json 模板内容（字符串形式）
 */
export function getTsconfigTemplateString(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'tsconfig.json'), 'utf-8');
}

/**
 * 获取 vite.config.js 模板内容
 */
export function getViteConfigTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'vite.config.js'), 'utf-8');
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
    repoName: string;
}): object
{
    return JSON.parse(getTypedocConfigTemplate(options));
}

/**
 * 获取 typedoc.json 模板内容（返回字符串）
 */
export function getTypedocConfigTemplate(options: {
    repoName: string;
}): string
{
    const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'typedoc.json'), 'utf-8');

    return templateContent.replace(/\{\{repoName\}\}/g, options.repoName);
}

/**
 * 获取 test/_.test.ts 模板内容（空文件占位）
 */
export function getTestIndexTemplate(_options: { name: string }): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'test/_.test.ts'), 'utf-8');
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
 * 获取 GitHub Actions pull-request workflow 模板内容
 */
export function getPullRequestWorkflowTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.github/workflows/pull-request.yml'), 'utf-8');
}

/**
 * 获取 GitHub Actions upload-oss workflow 模板内容
 */
export function getUploadOssWorkflowTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.github/workflows/upload-oss.yml'), 'utf-8');
}

/**
 * 获取 .husky/pre-commit 模板内容
 */
export function getHuskyPreCommitTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.husky/pre-commit'), 'utf-8');
}

/**
 * 获取 LICENSE 模板内容
 */
export function getLicenseTemplate(ctx: { year?: number } = {}): string
{
    const year = ctx.year || new Date().getFullYear();
    const template = fs.readFileSync(path.join(TEMPLATES_DIR, 'LICENSE'), 'utf-8');

    return template.replace('{{year}}', String(year));
}

/**
 * 获取 .vscode/settings.json 模板内容
 */
export function getVscodeSettingsTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, '.vscode/settings.json'), 'utf-8');
}

/**
 * 获取 scripts/prepublish.js 模板内容
 */
export function getPrepublishScriptTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'scripts/prepublish.js'), 'utf-8');
}

/**
 * 获取 scripts/postpublish.js 模板内容
 */
export function getPostpublishScriptTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'scripts/postpublish.js'), 'utf-8');
}

/**
 * 获取 scripts/postdocs.js 模板内容
 */
export function getPostdocsScriptTemplate(): string
{
    return fs.readFileSync(path.join(TEMPLATES_DIR, 'scripts/postdocs.js'), 'utf-8');
}

/**
 * 获取 src/index.ts 模板内容
 */
export function getSrcIndexTemplate(options: { name: string }): string
{
    const template = fs.readFileSync(path.join(TEMPLATES_DIR, 'src/index.ts'), 'utf-8');

    return template.replace(/\{\{name\}\}/g, options.name);
}

