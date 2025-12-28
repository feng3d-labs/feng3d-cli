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
    getPagesWorkflowTemplate,
    getFeng3dConfigTemplate,
    getTypedocConfigTemplate,
    getTestIndexTemplate,
    getHuskyPreCommitTemplate,
    detectSchemaPath,
} from '../templates.js';
import { Feng3dConfig, DEFAULT_CONFIG, DEFAULT_UPDATE_CONFIG, UpdateConfig } from '../types/config.js';

export interface UpdateOptions {
    directory: string;
    config?: boolean;
    eslint?: boolean;
    gitignore?: boolean;
    cursorrules?: boolean;
    publish?: boolean;
    pages?: boolean;
    typedoc?: boolean;
    test?: boolean;
    deps?: boolean;
    husky?: boolean;
    all?: boolean;
}

/**
 * 模板上下文
 */
interface TemplateContext {
    name: string;
    repoName: string;
}

/**
 * 需要检查是否与模板相同的自动生成文件配置
 * 注意：workflow 文件不在此列表中，因为它们需要提交到仓库才能触发 CI
 */
const AUTO_GENERATED_FILES: Array<{
    path: string;
    getTemplate: (ctx: TemplateContext) => string;
}> = [
    { path: '.cursorrules', getTemplate: () => getCursorrrulesTemplate() },
    { path: 'eslint.config.js', getTemplate: () => getEslintConfigTemplate() },
    { path: 'typedoc.json', getTemplate: (ctx) => getTypedocConfigTemplate({ name: ctx.name, repoName: ctx.repoName }) },
    { path: 'test/_.test.ts', getTemplate: (ctx) => getTestIndexTemplate({ name: ctx.name }) },
    { path: '.husky/pre-commit', getTemplate: () => getHuskyPreCommitTemplate() },
];

/**
 * 检查文件是否在 .gitignore 的自动生成文件列表中
 */
async function isFileInGitignore(projectDir: string, filePath: string): Promise<boolean>
{
    const gitignorePath = path.join(projectDir, '.gitignore');

    if (!await fs.pathExists(gitignorePath))
    {
        return false;
    }

    const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedPath}$`, 'm');

    return regex.test(gitignoreContent);
}

/**
 * 更新 feng3d.json 配置文件
 */
async function updateFeng3dConfig(projectDir: string): Promise<void>
{
    const configPath = path.join(projectDir, 'feng3d.json');
    const schemaPath = detectSchemaPath(projectDir);

    // 从 package.json 读取项目名称
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    const name = packageJson.name || path.basename(projectDir);

    // 检查文件是否在 .gitignore 中（自动生成的文件直接覆盖）
    const isInGitignore = await isFileInGitignore(projectDir, 'feng3d.json');

    if (!await fs.pathExists(configPath) || isInGitignore)
    {
        // 创建或覆盖 feng3d.json
        const configTemplate = getFeng3dConfigTemplate({ name, schemaPath });

        await fs.writeJson(configPath, configTemplate, { spaces: 4 });
        console.log(chalk.gray(isInGitignore ? '  覆盖: feng3d.json（在忽略列表中）' : '  创建: feng3d.json'));
    }
    else
    {
        // 更新现有的 feng3d.json（保留用户自定义配置）
        try
        {
            const configData = await fs.readJson(configPath);
            let updated = false;

            // 更新 $schema 路径
            if (configData.$schema !== schemaPath)
            {
                configData.$schema = schemaPath;
                updated = true;
            }

            // 更新 name（如果与 package.json 不同）
            if (configData.name !== name)
            {
                configData.name = name;
                updated = true;
            }

            if (updated)
            {
                await fs.writeJson(configPath, configData, { spaces: 4 });
                console.log(chalk.gray('  更新: feng3d.json'));
            }
            else
            {
                console.log(chalk.gray('  跳过: feng3d.json（无需更新）'));
            }
        }
        catch (error)
        {
            // 文件损坏，重新创建
            const configTemplate = getFeng3dConfigTemplate({ name, schemaPath });

            await fs.writeJson(configPath, configTemplate, { spaces: 4 });
            console.log(chalk.gray('  重建: feng3d.json'));
        }
    }
}

/**
 * 读取项目的 feng3d.json 配置文件
 */
async function loadProjectConfig(projectDir: string): Promise<Feng3dConfig>
{
    const configPath = path.join(projectDir, 'feng3d.json');

    if (!await fs.pathExists(configPath))
    {
        return DEFAULT_CONFIG;
    }

    try
    {
        const configData = await fs.readJson(configPath);

        return { ...DEFAULT_CONFIG, ...configData };
    }
    catch (error)
    {
        console.log(chalk.yellow(`  警告: 无法加载 feng3d.json，使用默认配置 (${error})`));

        return DEFAULT_CONFIG;
    }
}

/**
 * 检查是否有任何 CLI 更新选项被指定
 */
function hasAnyUpdateOption(options: UpdateOptions): boolean
{
    return !!(options.config || options.eslint || options.gitignore || options.cursorrules ||
              options.publish || options.pages || options.typedoc || options.test || options.deps || options.husky);
}

/**
 * 合并 CLI 选项和配置文件中的更新选项
 * CLI 选项优先级高于配置文件
 */
function mergeUpdateOptions(cliOptions: UpdateOptions, configUpdate: UpdateConfig): UpdateConfig
{
    // 如果用户指定了 --all，则全部更新
    if (cliOptions.all)
    {
        return DEFAULT_UPDATE_CONFIG;
    }

    // 如果用户指定了任何特定选项，则只使用 CLI 选项
    if (hasAnyUpdateOption(cliOptions))
    {
        return {
            config: cliOptions.config || false,
            eslint: cliOptions.eslint || false,
            gitignore: cliOptions.gitignore || false,
            cursorrules: cliOptions.cursorrules || false,
            publish: cliOptions.publish || false,
            pages: cliOptions.pages || false,
            typedoc: cliOptions.typedoc || false,
            test: cliOptions.test || false,
            deps: cliOptions.deps || false,
            husky: cliOptions.husky || false,
        };
    }

    // 否则使用配置文件中的设置
    return { ...DEFAULT_UPDATE_CONFIG, ...configUpdate };
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

    // 合并 CLI 选项和配置文件中的更新选项
    const updateConfig = mergeUpdateOptions(options, config.update || {});

    // 更新 feng3d.json 配置
    if (updateConfig.config)
    {
        await updateFeng3dConfig(projectDir);
    }

    // 获取项目信息用于模板
    const packageJson = await fs.readJson(packageJsonPath);
    const name = packageJson.name || path.basename(projectDir);
    const repoName = name.replace(/^@[^/]+\//, ''); // 移除 scope 前缀
    const templateContext: TemplateContext = { name, repoName };

    // 更新 .gitignore（仅在文件不存在时创建）
    if (updateConfig.gitignore)
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
    if (updateConfig.cursorrules)
    {
        await fs.writeFile(path.join(projectDir, '.cursorrules'), getCursorrrulesTemplate());
        console.log(chalk.gray('  更新: .cursorrules'));
    }

    // 更新 eslint.config.js（根据配置决定是否启用）
    if (updateConfig.eslint)
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
    if (updateConfig.publish)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
        await fs.writeFile(path.join(projectDir, '.github/workflows/publish.yml'), getPublishWorkflowTemplate());
        console.log(chalk.gray('  更新: .github/workflows/publish.yml'));
    }

    // 更新 .github/workflows/pages.yml
    if (updateConfig.pages)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
        await fs.writeFile(path.join(projectDir, '.github/workflows/pages.yml'), getPagesWorkflowTemplate());
        console.log(chalk.gray('  更新: .github/workflows/pages.yml'));
    }

    // 更新 typedoc.json（根据配置决定是否启用）
    if (updateConfig.typedoc)
    {
        if (config.typedoc?.enabled !== false)
        {
            const typedocContent = getTypedocConfigTemplate({ name, repoName });

            await fs.writeFile(path.join(projectDir, 'typedoc.json'), typedocContent);
            console.log(chalk.gray('  更新: typedoc.json'));
        }
        else
        {
            console.log(chalk.gray('  跳过: typedoc.json（配置中已禁用）'));
        }
    }

    // 更新 test/index.test.ts（根据配置决定是否启用）
    if (updateConfig.test)
    {
        if (config.vitest?.enabled !== false)
        {
            const testDir = path.join(projectDir, 'test');
            const testFilePath = path.join(testDir, '_.test.ts');

            // 检查测试目录是否有其他文件
            let hasOtherFiles = false;

            if (await fs.pathExists(testDir))
            {
                const files = await fs.readdir(testDir);

                // 排除 _.test.ts 本身，检查是否有其他文件
                hasOtherFiles = files.some(file => file !== '_.test.ts');
            }

            // 只有在测试目录没有其他文件时才生成
            if (!hasOtherFiles)
            {
                await fs.ensureDir(testDir);
                const testContent = getTestIndexTemplate({ name });

                await fs.writeFile(testFilePath, testContent);
                console.log(chalk.gray('  更新: test/_.test.ts'));
            }
            else
            {
                console.log(chalk.gray('  跳过: test/_.test.ts（测试目录已有其他文件）'));
            }
        }
        else
        {
            console.log(chalk.gray('  跳过: test/_.test.ts（vitest 配置中已禁用）'));
        }
    }

    // 更新依赖版本（根据配置决定包含哪些依赖）
    if (updateConfig.deps)
    {
        await updateDependencies(projectDir, config);
        console.log(chalk.gray('  更新: package.json devDependencies'));
    }

    // 更新 husky pre-commit hook
    if (updateConfig.husky)
    {
        await fs.ensureDir(path.join(projectDir, '.husky'));
        await fs.writeFile(path.join(projectDir, '.husky/pre-commit'), getHuskyPreCommitTemplate());
        console.log(chalk.gray('  更新: .husky/pre-commit'));
    }

    // 同步 .gitignore，检查自动生成的文件是否被修改
    await syncGitignoreForModifiedFiles(projectDir, templateContext);
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
async function syncGitignoreForModifiedFiles(projectDir: string, ctx: TemplateContext): Promise<void>
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
        const templateContent = file.getTemplate(ctx);
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
