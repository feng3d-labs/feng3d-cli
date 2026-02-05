/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies, VERSIONS } from '../versions.js';
import type { UpdateOptions, MergeStrategy, FileAction } from '../types.js';
import {
    determineFileAction,
    askFileAction,
    handleFileUpdate,
} from '../utils/merge.js';
import {
    getGitignoreTemplate,
    getCursorrrulesTemplate,
    getEslintConfigTemplate,
    getPublishWorkflowTemplate,
    getPagesWorkflowTemplate,
    getPullRequestWorkflowTemplate,
    getUploadOssWorkflowTemplate,
    getTypedocConfigTemplate,
    getTestIndexTemplate,
    getHuskyPreCommitTemplate,
    getLicenseTemplate,
    getVscodeSettingsTemplate,
    getTsconfigTemplateString,
    getViteConfigTemplate,
    getVitestConfigTemplate,
    getPrepublishScriptTemplate,
    getPostpublishScriptTemplate,
    getPostdocsScriptTemplate,
    getSrcIndexTemplate,
} from '../templates.js';

/**
 * 更新项目的规范配置
 * @param options 更新选项
 */
export async function updateProject(options: UpdateOptions = {}): Promise<void>
{
    // 解析选项
    const directory = options.directory || '.';
    const projectDir = path.resolve(directory);
    const packageJsonPath = path.join(projectDir, 'package.json');

    // 确定合并策略
    let mergeStrategy: MergeStrategy = options.mergeStrategy || 'merge';

    if (options.force)
    {
        mergeStrategy = 'overwrite';
    }

    const interactive = options.interactive || false;
    const dryRun = options.dryRun || false;

    if (dryRun)
    {
        console.log(chalk.yellow('  [预览模式] 不会实际修改文件\n'));
    }
    if (interactive)
    {
        console.log(chalk.cyan('  [交互模式] 将逐个询问文件处理方式\n'));
    }

    // 如果 package.json 不存在，创建基础 package.json
    if (!await fs.pathExists(packageJsonPath))
    {
        await fs.ensureDir(projectDir);
        const dirName = path.basename(projectDir);
        const initialPackageJson = {
            name: `@feng3d/${dirName}`,
            version: '0.0.1',
            description: '',
        };

        await fs.writeJson(packageJsonPath, initialPackageJson, { spaces: 4 });
        console.log(chalk.gray('  创建: package.json'));

        // 创建 src/index.ts
        const srcDir = path.join(projectDir, 'src');

        await fs.ensureDir(srcDir);
        await fs.writeFile(path.join(srcDir, 'index.ts'), getSrcIndexTemplate({ name: `@feng3d/${dirName}` }));
        console.log(chalk.gray('  创建: src/index.ts'));
    }

    // 获取项目信息用于模板
    const packageJson = await fs.readJson(packageJsonPath);
    const name = packageJson.name || path.basename(projectDir);
    const repoName = name.replace(/^@[^/]+\//, ''); // 移除 scope 前缀

    // 检测是否是 monorepo 根目录
    const isMonorepoRoot = Boolean(packageJson.workspaces);

    // feng3d-cli 项目：不更新 tsconfig.json 和 vite.config.js（有自定义配置）
    const isFeng3dCli = name === 'feng3d-cli';

    // 更新 .gitignore（强制覆盖）
    await updateSingleFile(
        path.join(projectDir, '.gitignore'),
        getGitignoreTemplate(),
        'overwrite', // .gitignore 总是覆盖
        false,
        dryRun,
    );

    // 更新 .cursorrules
    await updateSingleFile(
        path.join(projectDir, '.cursorrules'),
        getCursorrrulesTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 eslint.config.js
    await updateSingleFile(
        path.join(projectDir, 'eslint.config.js'),
        getEslintConfigTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 确保 .github/workflows 目录存在
    if (!dryRun)
    {
        await fs.ensureDir(path.join(projectDir, '.github/workflows'));
    }

    // 更新 .github/workflows/publish.yml
    await updateSingleFile(
        path.join(projectDir, '.github/workflows/publish.yml'),
        getPublishWorkflowTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 .github/workflows/pages.yml
    await updateSingleFile(
        path.join(projectDir, '.github/workflows/pages.yml'),
        getPagesWorkflowTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 .github/workflows/pull-request.yml
    await updateSingleFile(
        path.join(projectDir, '.github/workflows/pull-request.yml'),
        getPullRequestWorkflowTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 .github/workflows/upload-oss.yml
    await updateSingleFile(
        path.join(projectDir, '.github/workflows/upload-oss.yml'),
        getUploadOssWorkflowTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 typedoc.json（monorepo 根目录跳过）
    if (!isMonorepoRoot)
    {
        await updateSingleFile(
            path.join(projectDir, 'typedoc.json'),
            getTypedocConfigTemplate({ repoName }),
            mergeStrategy,
            interactive,
            dryRun,
        );
    }

    // 创建 test/_.test.ts（monorepo 根目录跳过，仅当 test 目录为空时）
    if (!isMonorepoRoot)
    {
        const testDir = path.join(projectDir, 'test');

        if (!dryRun)
        {
            await fs.ensureDir(testDir);
        }
        const testFiles = dryRun ? [] : await fs.readdir(testDir);

        if (testFiles.length === 0)
        {
            await updateSingleFile(
                path.join(testDir, '_.test.ts'),
                getTestIndexTemplate({ name }),
                'overwrite', // 新文件，直接创建
                false,
                dryRun,
            );
        }
    }

    // 更新依赖版本
    if (!dryRun)
    {
        await updateDependencies(projectDir, isMonorepoRoot);
        console.log(chalk.gray('  更新: package.json devDependencies'));
    }

    // 确保 .husky 目录存在
    if (!dryRun)
    {
        await fs.ensureDir(path.join(projectDir, '.husky'));
    }

    // 更新 husky pre-commit hook
    await updateSingleFile(
        path.join(projectDir, '.husky/pre-commit'),
        getHuskyPreCommitTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 更新 Husky 配置（dry-run 模式跳过）
    if (!dryRun)
    {
        await updateHuskyConfig(projectDir);
    }

    // 更新 LICENSE 文件（强制覆盖）
    await updateSingleFile(
        path.join(projectDir, 'LICENSE'),
        getLicenseTemplate(),
        'overwrite', // LICENSE 总是覆盖
        false,
        dryRun,
    );

    // 确保 .vscode 目录存在
    if (!dryRun)
    {
        await fs.ensureDir(path.join(projectDir, '.vscode'));
    }

    // 更新 .vscode/settings.json（强制覆盖，因为可能包含注释）
    await updateSingleFile(
        path.join(projectDir, '.vscode/settings.json'),
        getVscodeSettingsTemplate(),
        'overwrite', // VS Code 设置文件总是覆盖
        false,
        dryRun,
    );

    // 更新 tsconfig.json（强制覆盖，因为可能包含注释，feng3d-cli 跳过）
    if (!isFeng3dCli)
    {
        await updateSingleFile(
            path.join(projectDir, 'tsconfig.json'),
            getTsconfigTemplateString(),
            'overwrite', // tsconfig.json 总是覆盖
            false,
            dryRun,
        );
    }

    // 更新 vite.config.js（feng3d-cli 跳过）
    if (!isFeng3dCli)
    {
        await updateSingleFile(
            path.join(projectDir, 'vite.config.js'),
            getViteConfigTemplate(),
            mergeStrategy,
            interactive,
            dryRun,
        );
    }

    // 更新 vitest.config.ts（monorepo 根目录和 feng3d-cli 跳过）
    if (!isFeng3dCli && !isMonorepoRoot)
    {
        await updateSingleFile(
            path.join(projectDir, 'vitest.config.ts'),
            getVitestConfigTemplate(),
            mergeStrategy,
            interactive,
            dryRun,
        );
    }

    // 确保 scripts 目录存在
    const scriptsDir = path.join(projectDir, 'scripts');

    if (!dryRun)
    {
        await fs.ensureDir(scriptsDir);
    }

    // 更新发布脚本
    await updateSingleFile(
        path.join(scriptsDir, 'prepublish.js'),
        getPrepublishScriptTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    await updateSingleFile(
        path.join(scriptsDir, 'postpublish.js'),
        getPostpublishScriptTemplate(),
        mergeStrategy,
        interactive,
        dryRun,
    );

    // 如果存在 examples 目录，更新 postdocs.js 脚本
    const examplesDir = path.join(projectDir, 'examples');
    const hasExamples = dryRun ? false : await fs.pathExists(examplesDir);

    if (hasExamples)
    {
        await updateSingleFile(
            path.join(scriptsDir, 'postdocs.js'),
            getPostdocsScriptTemplate(),
            mergeStrategy,
            interactive,
            dryRun,
        );
    }
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
 * package.json 字段的标准顺序
 */
const PACKAGE_JSON_FIELD_ORDER = [
    'name',
    'version',
    'description',
    'homepage',
    'author',
    'license',
    'type',
    'main',
    'types',
    'module',
    'exports',
    'bin',
    'scripts',
    'repository',
    'publishConfig',
    'files',
    'devDependencies',
    'dependencies',
    'peerDependencies',
    'lint-staged',
    'workspaces',
];

/**
 * scripts 字段的标准顺序
 */
const SCRIPTS_ORDER = [
    'examples:dev',
    'test_web',
    'postdocs',
    'clean',
    'build',
    'watch',
    'test',
    'lint',
    'lintfix',
    'docs',
    'prepublishOnly',
    'release',
    'postpublish',
    'prepare',
];

/**
 * 按标准顺序重新排列对象字段
 */
function reorderObject(obj: Record<string, unknown>, order: string[]): Record<string, unknown>
{
    const ordered: Record<string, unknown> = {};

    // 先按标准顺序添加已存在的字段
    for (const key of order)
    {
        if (key in obj)
        {
            ordered[key] = obj[key];
        }
    }

    // 再添加其他未在标准顺序中的字段
    for (const key of Object.keys(obj))
    {
        if (!(key in ordered))
        {
            ordered[key] = obj[key];
        }
    }

    return ordered;
}

/**
 * 按标准顺序重新排列 package.json 字段
 */
function reorderPackageJson(packageJson: Record<string, unknown>): Record<string, unknown>
{
    const ordered = reorderObject(packageJson, PACKAGE_JSON_FIELD_ORDER);

    // 重新排列 scripts
    if (ordered.scripts && typeof ordered.scripts === 'object')
    {
        ordered.scripts = reorderObject(ordered.scripts as Record<string, unknown>, SCRIPTS_ORDER);
    }

    return ordered;
}

/**
 * 更新 package.json 中的 devDependencies 版本
 * @param projectDir 项目目录
 * @param isMonorepoRoot 是否是 monorepo 根目录
 */
async function updateDependencies(projectDir: string, isMonorepoRoot: boolean = false): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');

    // 读取原始内容以检测缩进风格
    const originalContent = await fs.readFile(packageJsonPath, 'utf-8');
    const indent = detectIndent(originalContent);
    const hasTrailingNewline = originalContent.endsWith('\n');

    const packageJson = JSON.parse(originalContent);

    // monorepo 根目录不包含 vitest 和 typedoc
    const standardDeps = getDevDependencies({
        includeVitest: !isMonorepoRoot,
        includeTypedoc: !isMonorepoRoot,
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
        clean: 'rimraf lib dist public',
        build: 'vite build && tsc',
        lint: 'eslint . --ext .js,.ts --max-warnings 0',
        lintfix: 'npm run lint -- --fix',
        prepublishOnly: 'node scripts/prepublish.js',
        postpublish: 'node scripts/postpublish.js',
    };

    // monorepo 根目录不添加 test、docs、watch 相关脚本
    if (!isMonorepoRoot)
    {
        standardScripts.watch = 'concurrently "vite build --watch" "tsc -w" "vitest"';
        standardScripts.test = 'vitest run';
        standardScripts.docs = 'typedoc';
        standardScripts.release = 'npm run clean && npm run lint && npm test && npm run build && npm run docs && npm publish';
    }
    else
    {
        // monorepo 根目录的 release 脚本
        standardScripts.release = 'npm run clean && npm run lint && npm run build && npm publish';
    }

    // 检查是否存在 examples 目录，添加相关脚本
    const examplesDir = path.join(projectDir, 'examples');

    if (await fs.pathExists(examplesDir))
    {
        standardScripts['examples:dev'] = 'cd examples && npm run dev';
        standardScripts.postdocs = 'node scripts/postdocs.js && cd examples && vite build --outDir ../public';
    }

    // 如果 scripts 不存在则添加，存在时不覆盖
    for (const [key, value] of Object.entries(standardScripts))
    {
        if (!(key in packageJson.scripts))
        {
            packageJson.scripts[key] = value;
            updated = true;
            console.log(chalk.gray(`  添加: scripts.${key}`));
        }
    }

    // 设置标准入口点配置（强制覆盖）
    if (packageJson.type !== 'module')
    {
        packageJson.type = 'module';
        updated = true;
        console.log(chalk.gray('  更新: type = "module"'));
    }

    const entryPoints = {
        main: './src/index.ts',
        types: './src/index.ts',
        module: './src/index.ts',
    };

    for (const [key, value] of Object.entries(entryPoints))
    {
        if (packageJson[key] !== value)
        {
            packageJson[key] = value;
            updated = true;
            console.log(chalk.gray(`  更新: ${key} = "${value}"`));
        }
    }

    // 设置 exports 配置（强制覆盖）
    const standardExports = {
        '.': {
            types: './src/index.ts',
            import: './src/index.ts',
            require: './src/index.ts',
        },
    };

    if (JSON.stringify(packageJson.exports) !== JSON.stringify(standardExports))
    {
        packageJson.exports = standardExports;
        updated = true;
        console.log(chalk.gray('  更新: exports'));
    }

    // 如果 workspaces 不存在则添加
    if (!packageJson.workspaces)
    {
        packageJson.workspaces = [
            '.',
            './examples',
            './test_web',
            'packages/*',
            'packages/*/examples',
        ];
        updated = true;
        console.log(chalk.gray('  添加: workspaces'));
    }

    // 只有在有更新时才写入文件
    if (updated)
    {
        const orderedPackageJson = reorderPackageJson(packageJson);
        let newContent = JSON.stringify(orderedPackageJson, null, indent);

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

    // 强制覆盖 husky 和 lint-staged 依赖
    if (!packageJson.devDependencies)
    {
        packageJson.devDependencies = {};
    }
    if (packageJson.devDependencies.husky !== VERSIONS.husky)
    {
        packageJson.devDependencies.husky = VERSIONS.husky;
        updated = true;
        console.log(chalk.gray(`  更新: devDependencies.husky = "${VERSIONS.husky}"`));
    }
    if (packageJson.devDependencies['lint-staged'] !== VERSIONS['lint-staged'])
    {
        packageJson['lint-staged'] = VERSIONS['lint-staged'];
        updated = true;
        console.log(chalk.gray(`  更新: devDependencies.lint-staged = "${VERSIONS['lint-staged']}"`));
    }

    // 强制覆盖 prepare 脚本
    if (!packageJson.scripts)
    {
        packageJson.scripts = {};
    }
    if (packageJson.scripts.prepare !== 'husky')
    {
        packageJson.scripts.prepare = 'husky';
        updated = true;
        console.log(chalk.gray('  更新: scripts.prepare = "husky"'));
    }

    // 强制覆盖 lint-staged 配置
    const standardLintStaged = {
        '*.{js,ts}': ['eslint --fix --max-warnings 0'],
    };

    if (JSON.stringify(packageJson['lint-staged']) !== JSON.stringify(standardLintStaged))
    {
        packageJson['lint-staged'] = standardLintStaged;
        updated = true;
        console.log(chalk.gray('  更新: lint-staged 配置'));
    }

    // 只有在有更新时才写入文件
    if (updated)
    {
        const orderedPackageJson = reorderPackageJson(packageJson);
        let newContent = JSON.stringify(orderedPackageJson, null, indent);

        if (hasTrailingNewline)
        {
            newContent += '\n';
        }
        await fs.writeFile(packageJsonPath, newContent);
    }
}

/**
 * 更新单个文件的辅助函数
 * @param filePath 文件路径
 * @param content 文件内容
 * @param mergeStrategy 合并策略
 * @param interactive 是否交互式
 * @param dryRun 是否预览模式
 */
async function updateSingleFile(
    filePath: string,
    content: string,
    mergeStrategy: MergeStrategy,
    interactive: boolean,
    dryRun: boolean,
): Promise<void>
{
    let action: FileAction;

    if (interactive)
    {
        const exists = await fs.pathExists(filePath);

        if (exists)
        {
            action = await askFileAction(path.relative(process.cwd(), filePath));
        }
        else
        {
            action = 'overwrite'; // 文件不存在，直接创建
        }
    }
    else
    {
        action = await determineFileAction(filePath, mergeStrategy);
    }

    await handleFileUpdate(filePath, content, action, dryRun);
}
