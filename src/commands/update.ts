/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies } from '../versions.js';
import {
    getGitignoreTemplate,
    getCursorrrulesTemplate,
    getEslintConfigTemplate,
    getPublishWorkflowTemplate,
} from '../templates.js';

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

    // 更新 eslint.config.js
    if (updateAll || options.eslint)
    {
        await createEslintConfigFile(projectDir);
        console.log(chalk.gray('  更新: eslint.config.js'));
    }

    // 更新 .github/workflows/publish.yml
    if (updateAll || options.workflow)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
        await fs.writeFile(path.join(projectDir, '.github/workflows/publish.yml'), getPublishWorkflowTemplate());
        console.log(chalk.gray('  更新: .github/workflows/publish.yml'));
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
    await fs.writeFile(path.join(projectDir, 'eslint.config.js'), getEslintConfigTemplate());
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

