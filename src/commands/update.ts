/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies, VERSIONS,

}  from '../versions.js';
import {
    getGitignoreTemplate,
    getCursorrrulesTemplate,
    getEslintConfigTemplate,
    getPublishWorkflowTemplate,
    getPagesWorkflowTemplate,
    getPullRequestWorkflowTemplate,
    getFeng3dConfigTemplate,
    getTypedocConfigTemplate,
    getTestIndexTemplate,
    getHuskyPreCommitTemplate,
    getLicenseTemplate,
    getVscodeSettingsTemplate,
    getTsconfigTemplateString,
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
    pullRequest?: boolean;
    typedoc?: boolean;
    test?: boolean;
    deps?: boolean;
    husky?: boolean;
    license?: boolean;
    vscode?: boolean;
    tsconfig?: boolean;
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
    { path: '.vscode/settings.json', getTemplate: () => getVscodeSettingsTemplate() },
    // tsconfig.json 不在此列表中，因为它通常需要项目特定的自定义配置
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
              options.publish || options.pages || options.pullRequest || options.typedoc ||
              options.test || options.deps || options.husky || options.license || options.vscode ||
              options.tsconfig);
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
            pullRequest: cliOptions.pullRequest || false,
            typedoc: cliOptions.typedoc || false,
            test: cliOptions.test || false,
            deps: cliOptions.deps || false,
            husky: cliOptions.husky || false,
            license: cliOptions.license || false,
            vscode: cliOptions.vscode || false,
            tsconfig: cliOptions.tsconfig || false,
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

    // 更新 .github/workflows/pull-request.yml
    if (updateConfig.pullRequest)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
        await fs.writeFile(path.join(projectDir, '.github/workflows/pull-request.yml'), getPullRequestWorkflowTemplate());
        console.log(chalk.gray('  更新: .github/workflows/pull-request.yml'));
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

        // 更新 package.json 添加 husky 配置
        await updateHuskyConfig(projectDir);
    }

    // 更新 LICENSE 文件（仅在不存在时创建）
    if (updateConfig.license)
    {
        const licensePath = path.join(projectDir, 'LICENSE');

        if (!await fs.pathExists(licensePath))
        {
            await fs.writeFile(licensePath, getLicenseTemplate());
            console.log(chalk.gray('  创建: LICENSE'));
        }
        else
        {
            console.log(chalk.gray('  跳过: LICENSE（已存在）'));
        }
    }

    // 更新 .vscode/settings.json
    if (updateConfig.vscode)
    {
        await fs.ensureDir(path.join(projectDir, '.vscode'));
        await fs.writeFile(path.join(projectDir, '.vscode/settings.json'), getVscodeSettingsTemplate());
        console.log(chalk.gray('  更新: .vscode/settings.json'));
    }

    // 更新 tsconfig.json（仅在忽略列表中时覆盖）
    if (updateConfig.tsconfig)
    {
        const tsconfigPath = path.join(projectDir, 'tsconfig.json');
        const isIgnored = await isFileInGitignore(projectDir, 'tsconfig.json');

        if (isIgnored || !await fs.pathExists(tsconfigPath))
        {
            await fs.writeFile(tsconfigPath, getTsconfigTemplateString());
            console.log(chalk.gray(isIgnored ? '  覆盖: tsconfig.json（在忽略列表中）' : '  创建: tsconfig.json'));
        }
        else
        {
            console.log(chalk.gray('  跳过: tsconfig.json（已存在且不在忽略列表中）'));
        }
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
 * 检测 JSON 文件的缩进风格
 */
function detectIndent(content: string): string
{
    const match = content.match(/^[ \t]+/m);

    return match ? match[0] : '    ';
}

/**
 * 更新 package.json 中的 devDependencies 版本
 */
async function updateDependencies(projectDir: string, config: Feng3dConfig): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');

    // 读取原始内容以检测缩进风格
    const originalContent = await fs.readFile(packageJsonPath, 'utf-8');
    const indent = detectIndent(originalContent);
    const hasTrailingNewline = originalContent.endsWith('\n');

    const packageJson = JSON.parse(originalContent);

    const standardDeps = getDevDependencies({
        includeVitest: config.vitest?.enabled !== false,
        includeTypedoc: config.typedoc?.enabled !== false,
    });

    // 添加或更新 devDependencies
    let updated = false;

    if (!packageJson.devDependencies)
    {
        packageJson.devDependencies = {};
    }

    for (const [key, value] of Object.entries(standardDeps))
    {
        if (!(key in packageJson.devDependencies))
        {
            packageJson.devDependencies[key] = value;
            updated = true;
            console.log(chalk.gray(`  添加: devDependencies.${key} = "${value}"`));
        }
        else if (packageJson.devDependencies[key] !== value)
        {
            packageJson.devDependencies[key] = value;
            updated = true;
            console.log(chalk.gray(`  更新: devDependencies.${key} = "${value}"`));
        }
    }

    // 添加标准 scripts
    if (!packageJson.scripts)
    {
        packageJson.scripts = {};
    }

    const standardScripts: Record<string, string> = {
        lint: 'eslint . --ext .js,.ts --max-warnings 0',
        lintfix: 'npm run lint -- --fix',
        docs: 'typedoc',
        upload_oss: 'npm run docs && feng3d-cli oss_upload_dir',
        update: 'npx feng3d-cli update && npm install',
    };

    for (const [key, value] of Object.entries(standardScripts))
    {
        if (!(key in packageJson.scripts))
        {
            packageJson.scripts[key] = value;
            updated = true;
            console.log(chalk.gray(`  添加: scripts.${key}`));
        }
    }

    // 只有在有更新时才写入文件
    if (updated)
    {
        let newContent = JSON.stringify(packageJson, null, indent);

        if (hasTrailingNewline)
        {
            newContent += '\n';
        }
        await fs.writeFile(packageJsonPath, newContent);
    }
}

/**
 * 更新 package.json 添加 husky 配置
 */
async function updateHuskyConfig(projectDir: string): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');

    // 读取原始内容以检测缩进风格
    const originalContent = await fs.readFile(packageJsonPath, 'utf-8');
    const indent = detectIndent(originalContent);
    const hasTrailingNewline = originalContent.endsWith('\n');

    const packageJson = JSON.parse(originalContent);
    let updated = false;

    // 添加 husky 和 lint-staged 依赖
    if (!packageJson.devDependencies)
    {
        packageJson.devDependencies = {};
    }
    if (!packageJson.devDependencies.husky)
    {
        packageJson.devDependencies.husky = VERSIONS.husky;
        updated = true;
        console.log(chalk.gray(`  添加: devDependencies.husky = "${VERSIONS.husky}"`));
    }
    if (!packageJson.devDependencies['lint-staged'])
    {
        packageJson.devDependencies['lint-staged'] = VERSIONS['lint-staged'];
        updated = true;
        console.log(chalk.gray(`  添加: devDependencies.lint-staged = "${VERSIONS['lint-staged']}"`));
    }

    // 添加 prepare 脚本
    if (!packageJson.scripts)
    {
        packageJson.scripts = {};
    }
    if (packageJson.scripts.prepare !== 'husky')
    {
        packageJson.scripts.prepare = 'husky';
        updated = true;
        console.log(chalk.gray('  添加: scripts.prepare = "husky"'));
    }

    // 添加 lint-staged 配置
    if (!packageJson['lint-staged'])
    {
        packageJson['lint-staged'] = {
            '*.{js,ts}': ['eslint --fix --max-warnings 0'],
        };
        updated = true;
        console.log(chalk.gray('  添加: lint-staged 配置'));
    }

    // 只有在有更新时才写入文件
    if (updated)
    {
        let newContent = JSON.stringify(packageJson, null, indent);

        if (hasTrailingNewline)
        {
            newContent += '\n';
        }
        await fs.writeFile(packageJsonPath, newContent);
    }
}

/**
 * 自动生成文件的注释说明
 */
const AUTO_GENERATED_COMMENT = `# 以下文件可由 feng3d-cli 自动生成，无需提交
# 运行 \`feng3d-cli update\` 可重新生成`;

/**
 * 同步 .gitignore，确保自动生成的文件在忽略列表中
 */
async function syncGitignoreForModifiedFiles(projectDir: string, _ctx: TemplateContext): Promise<void>
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

    // 检查 feng3d.json 是否在 .gitignore 中
    const feng3dConfigPath = 'feng3d.json';
    const escapedFeng3dPath = feng3dConfigPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const feng3dRegex = new RegExp(`^${escapedFeng3dPath}$`, 'm');

    if (!feng3dRegex.test(gitignoreContent))
    {
        filesToAdd.push(feng3dConfigPath);
    }

    // 检查其他自动生成的文件是否在 .gitignore 中
    for (const file of AUTO_GENERATED_FILES)
    {
        const escapedPath = file.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedPath}$`, 'm');

        if (!regex.test(gitignoreContent))
        {
            filesToAdd.push(file.path);
        }
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

        for (const filePath of filesToAdd)
        {
            console.log(chalk.gray(`  添加到 .gitignore: ${filePath}`));
        }
    }

    // 清理多余的空行
    if (modified)
    {
        gitignoreContent = gitignoreContent.replace(/\n\n+/g, '\n\n').trim() + '\n';
        await fs.writeFile(gitignorePath, gitignoreContent);
    }
}
