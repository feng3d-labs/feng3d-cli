/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import { getDevDependencies } from '../versions.js';
import {
    getGitignoreTemplate,
    getCursorrrulesTemplate,
    getEslintConfigTemplate,
    getPublishWorkflowTemplate,
} from '../templates.js';
import { Feng3dConfig, DEFAULT_CONFIG } from '../types/config.js';

export interface UpdateOptions {
    directory: string;
    eslint?: boolean;
    gitignore?: boolean;
    cursorrules?: boolean;
    workflow?: boolean;
    deps?: boolean;
    all?: boolean;
}

/**
 * 需要检查是否与模板相同的自动生成文件配置
 */
const AUTO_GENERATED_FILES = [
    { path: '.cursorrules', getTemplate: getCursorrrulesTemplate },
    { path: 'eslint.config.js', getTemplate: getEslintConfigTemplate },
    { path: '.github/workflows/publish.yml', getTemplate: getPublishWorkflowTemplate },
];

/**
 * 读取项目的 feng3dconfig.js 配置文件
 */
async function loadProjectConfig(projectDir: string): Promise<Feng3dConfig>
{
    const configPath = path.join(projectDir, 'feng3dconfig.js');

    if (!await fs.pathExists(configPath))
    {
        console.log(chalk.gray('  未找到 feng3dconfig.js，使用默认配置'));

        return DEFAULT_CONFIG;
    }

    try
    {
        // 使用动态 import 加载 ES module 配置文件
        const configUrl = pathToFileURL(configPath).href;
        const configModule = await import(configUrl);

        console.log(chalk.gray('  加载配置: feng3dconfig.js'));

        return { ...DEFAULT_CONFIG, ...configModule.default };
    }
    catch (error)
    {
        console.log(chalk.yellow(`  警告: 无法加载 feng3dconfig.js，使用默认配置 (${error})`));

        return DEFAULT_CONFIG;
    }
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

    // 加载项目配置
    const config = await loadProjectConfig(projectDir);

    const updateAll = options.all || (!options.eslint && !options.gitignore && !options.cursorrules && !options.workflow && !options.deps);

    // 更新 .gitignore（仅在文件不存在时创建）
    if (updateAll || options.gitignore)
    {
        const gitignorePath = path.join(projectDir, '.gitignore');
        if (!await fs.pathExists(gitignorePath))
        {
            await fs.writeFile(gitignorePath, getGitignoreTemplate());
            console.log(chalk.gray('  创建: .gitignore'));
        }
        else
        {
            console.log(chalk.gray('  跳过: .gitignore（已存在）'));
        }
    }

    // 更新 .cursorrules
    if (updateAll || options.cursorrules)
    {
        await fs.writeFile(path.join(projectDir, '.cursorrules'), getCursorrrulesTemplate());
        console.log(chalk.gray('  更新: .cursorrules'));
    }

    // 更新 eslint.config.js（根据配置决定是否启用）
    if (updateAll || options.eslint)
    {
        if (config.eslint?.enabled !== false)
        {
            await createEslintConfigFile(projectDir);
            console.log(chalk.gray('  更新: eslint.config.js'));
        }
        else
        {
            console.log(chalk.gray('  跳过: eslint.config.js（配置中已禁用）'));
        }
    }

    // 更新 .github/workflows/publish.yml
    if (updateAll || options.workflow)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
        await fs.writeFile(path.join(projectDir, '.github/workflows/publish.yml'), getPublishWorkflowTemplate());
        console.log(chalk.gray('  更新: .github/workflows/publish.yml'));
    }

    // 更新依赖版本（根据配置决定包含哪些依赖）
    if (updateAll || options.deps)
    {
        await updateDependencies(projectDir, config);
        console.log(chalk.gray('  更新: package.json devDependencies'));
    }

    // 同步 .gitignore，检查自动生成的文件是否被修改
    await syncGitignoreForModifiedFiles(projectDir);
}

/**
 * 创建 ESLint 配置文件
 */
export async function createEslintConfigFile(projectDir: string): Promise<void>
{
    await fs.writeFile(path.join(projectDir, 'eslint.config.js'), getEslintConfigTemplate());
}

/**
 * 更新 package.json 中的 devDependencies 版本
 */
async function updateDependencies(projectDir: string, config: Feng3dConfig): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    const standardDeps = getDevDependencies({
        includeVitest: config.vitest?.enabled !== false,
        includeTypedoc: config.typedoc?.enabled !== false,
    });

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

/**
 * 同步 .gitignore，如果自动生成的文件被用户修改，则从忽略列表中移除
 */
async function syncGitignoreForModifiedFiles(projectDir: string): Promise<void>
{
    const gitignorePath = path.join(projectDir, '.gitignore');

    if (!await fs.pathExists(gitignorePath))
    {
        return;
    }

    let gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    let modified = false;

    for (const file of AUTO_GENERATED_FILES)
    {
        const filePath = path.join(projectDir, file.path);

        if (!await fs.pathExists(filePath))
        {
            continue;
        }

        const fileContent = await fs.readFile(filePath, 'utf-8');
        const templateContent = file.getTemplate();
        const isModified = fileContent !== templateContent;

        // 检查文件是否在 .gitignore 中
        const escapedPath = file.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedPath}$`, 'm');
        const isInGitignore = regex.test(gitignoreContent);

        if (isModified && isInGitignore)
        {
            // 文件被修改，从 .gitignore 中移除
            gitignoreContent = gitignoreContent.replace(regex, '').replace(/\n\n+/g, '\n\n').trim() + '\n';
            modified = true;
            console.log(chalk.yellow(`  从 .gitignore 移除: ${file.path}（检测到自定义修改）`));
        }
        else if (!isModified && !isInGitignore)
        {
            // 文件未修改但不在 .gitignore 中，添加回去
            gitignoreContent = gitignoreContent.trim() + '\n' + file.path + '\n';
            modified = true;
            console.log(chalk.gray(`  添加到 .gitignore: ${file.path}（与模板相同）`));
        }
    }

    if (modified)
    {
        await fs.writeFile(gitignorePath, gitignoreContent);
    }
}
