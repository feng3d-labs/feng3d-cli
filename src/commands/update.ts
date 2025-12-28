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
    getFeng3dConfigTemplate,
    detectSchemaPath,
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
 * 读取项目的 feng3d.json 配置文件，如果不存在则自动创建
 */
async function loadProjectConfig(projectDir: string): Promise<Feng3dConfig>
{
    const configPath = path.join(projectDir, 'feng3d.json');

    // 检测可用的 schema 路径
    const schemaPath = detectSchemaPath(projectDir);

    if (!await fs.pathExists(configPath))
    {
        // 从 package.json 读取项目名称
        const packageJsonPath = path.join(projectDir, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        const name = packageJson.name || path.basename(projectDir);

        // 自动创建 feng3d.json，使用检测到的 schema 路径
        const configTemplate = getFeng3dConfigTemplate({ name, schemaPath });

        await fs.writeJson(configPath, configTemplate, { spaces: 4 });
        console.log(chalk.gray('  创建: feng3d.json'));

        return { ...DEFAULT_CONFIG, name };
    }

    try
    {
        const configData = await fs.readJson(configPath);

        // 更新 $schema 路径（如果需要）
        if (configData.$schema !== schemaPath)
        {
            configData.$schema = schemaPath;
            await fs.writeJson(configPath, configData, { spaces: 4 });
            console.log(chalk.gray(`  更新: feng3d.json $schema -> ${schemaPath}`));
        }
        else
        {
            console.log(chalk.gray('  加载配置: feng3d.json'));
        }

        return { ...DEFAULT_CONFIG, ...configData };
    }
    catch (error)
    {
        console.log(chalk.yellow(`  警告: 无法加载 feng3d.json，使用默认配置 (${error})`));

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
 * 检查 feng3d.json 是否与默认配置相同（忽略 name 字段）
 */
async function isFeng3dConfigModified(projectDir: string): Promise<boolean>
{
    const configPath = path.join(projectDir, 'feng3d.json');

    if (!await fs.pathExists(configPath))
    {
        return false;
    }

    try
    {
        const configData = await fs.readJson(configPath);

        // 比较时忽略 name 和 $schema 字段
        const { name: _name, $schema: _schema, ...userConfig } = configData;
        const { name: _defaultName, ...defaultConfig } = DEFAULT_CONFIG;

        return JSON.stringify(userConfig) !== JSON.stringify(defaultConfig);
    }
    catch
    {
        return true; // 解析失败视为已修改
    }
}

/**
 * 自动生成文件的注释说明
 */
const AUTO_GENERATED_COMMENT = `# 以下文件可由 feng3d-cli 自动生成，无需提交
# 运行 \`feng3d-cli update\` 可重新生成`;

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

    // 需要添加到 .gitignore 的文件列表
    const filesToAdd: string[] = [];
    // 需要从 .gitignore 移除的文件列表
    const filesToRemove: string[] = [];

    // 处理 feng3d.json（特殊处理，比较 JSON 内容而非字符串）
    const feng3dConfigPath = 'feng3d.json';
    const feng3dConfigFullPath = path.join(projectDir, feng3dConfigPath);

    if (await fs.pathExists(feng3dConfigFullPath))
    {
        const isConfigModified = await isFeng3dConfigModified(projectDir);
        const escapedPath = feng3dConfigPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedPath}$`, 'm');
        const isInGitignore = regex.test(gitignoreContent);

        if (isConfigModified && isInGitignore)
        {
            filesToRemove.push(feng3dConfigPath);
            console.log(chalk.yellow(`  从 .gitignore 移除: ${feng3dConfigPath}（检测到自定义修改）`));
        }
        else if (!isConfigModified && !isInGitignore)
        {
            filesToAdd.push(feng3dConfigPath);
            console.log(chalk.gray(`  添加到 .gitignore: ${feng3dConfigPath}（与默认配置相同）`));
        }
    }

    // 处理其他自动生成的文件
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
            filesToRemove.push(file.path);
            console.log(chalk.yellow(`  从 .gitignore 移除: ${file.path}（检测到自定义修改）`));
        }
        else if (!isModified && !isInGitignore)
        {
            filesToAdd.push(file.path);
            console.log(chalk.gray(`  添加到 .gitignore: ${file.path}（与模板相同）`));
        }
    }

    // 移除需要删除的文件
    for (const filePath of filesToRemove)
    {
        const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedPath}$`, 'm');

        gitignoreContent = gitignoreContent.replace(regex, '');
        modified = true;
    }

    // 添加需要添加的文件
    if (filesToAdd.length > 0)
    {
        // 检查是否已有注释说明
        const hasComment = gitignoreContent.includes('# 以下文件可由 feng3d-cli 自动生成');

        if (!hasComment)
        {
            // 添加注释和文件
            gitignoreContent = gitignoreContent.trim() + '\n\n' + AUTO_GENERATED_COMMENT + '\n' + filesToAdd.join('\n') + '\n';
        }
        else
        {
            // 在注释后添加文件
            for (const filePath of filesToAdd)
            {
                gitignoreContent = gitignoreContent.trim() + '\n' + filePath + '\n';
            }
        }
        modified = true;
    }

    // 清理多余的空行
    if (modified)
    {
        gitignoreContent = gitignoreContent.replace(/\n\n+/g, '\n\n').trim() + '\n';
        await fs.writeFile(gitignorePath, gitignoreContent);
    }
}
