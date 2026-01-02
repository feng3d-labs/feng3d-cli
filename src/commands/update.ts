/**
 * 更新项目规范命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies, VERSIONS } from '../versions.js';
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
    getPrepublishScriptTemplate,
    getPostpublishScriptTemplate,
    getPostdocsScriptTemplate,
    getSrcIndexTemplate,
} from '../templates.js';

/**
 * 模板上下文
 */
interface TemplateContext {
    name: string;
    repoName: string;
}

/**
 * 更新项目的规范配置
 * @param directory 项目目录路径
 */
export async function updateProject(directory: string = '.'): Promise<void>
{
    const projectDir = path.resolve(directory);
    const packageJsonPath = path.join(projectDir, 'package.json');

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
    const templateContext: TemplateContext = { name, repoName };

    // feng3d-cli 项目：不更新 tsconfig.json 和 vite.config.js（有自定义配置）
    const isFeng3dCli = name === 'feng3d-cli';

    // 更新 .gitignore（仅在文件不存在时创建）
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

    // 更新 .cursorrules
    await fs.writeFile(path.join(projectDir, '.cursorrules'), getCursorrrulesTemplate());
    console.log(chalk.gray('  更新: .cursorrules'));

    // 更新 eslint.config.js
    await createEslintConfigFile(projectDir);
    console.log(chalk.gray('  更新: eslint.config.js'));

    // 更新 .github/workflows/publish.yml
    await fs.ensureDir(path.join(projectDir, '.github/workflows'));
    await fs.writeFile(path.join(projectDir, '.github/workflows/publish.yml'), getPublishWorkflowTemplate());
    console.log(chalk.gray('  更新: .github/workflows/publish.yml'));

    // 更新 .github/workflows/pages.yml
    await fs.writeFile(path.join(projectDir, '.github/workflows/pages.yml'), getPagesWorkflowTemplate());
    console.log(chalk.gray('  更新: .github/workflows/pages.yml'));

    // 更新 .github/workflows/pull-request.yml
    await fs.writeFile(path.join(projectDir, '.github/workflows/pull-request.yml'), getPullRequestWorkflowTemplate());
    console.log(chalk.gray('  更新: .github/workflows/pull-request.yml'));

    // 更新 .github/workflows/upload-oss.yml
    await fs.writeFile(path.join(projectDir, '.github/workflows/upload-oss.yml'), getUploadOssWorkflowTemplate());
    console.log(chalk.gray('  更新: .github/workflows/upload-oss.yml'));

    // 更新 typedoc.json
    const typedocContent = getTypedocConfigTemplate({ repoName });

    await fs.writeFile(path.join(projectDir, 'typedoc.json'), typedocContent);
    console.log(chalk.gray('  更新: typedoc.json'));

    // 更新 test/_.test.ts
    const testDir = path.join(projectDir, 'test');
    const testFilePath = path.join(testDir, '_.test.ts');

    // 检查测试目录是否有其他文件
    let hasOtherFiles = false;

    if (await fs.pathExists(testDir))
    {
        const files = await fs.readdir(testDir);

        hasOtherFiles = files.some(file => file !== '_.test.ts');
    }

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

    // 更新依赖版本
    await updateDependencies(projectDir);
    console.log(chalk.gray('  更新: package.json devDependencies'));

    // 更新 husky pre-commit hook
    await fs.ensureDir(path.join(projectDir, '.husky'));
    await fs.writeFile(path.join(projectDir, '.husky/pre-commit'), getHuskyPreCommitTemplate());
    console.log(chalk.gray('  更新: .husky/pre-commit'));
    await updateHuskyConfig(projectDir);

    // 更新 LICENSE 文件（仅在不存在时创建）
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

    // 更新 .vscode/settings.json
    await fs.ensureDir(path.join(projectDir, '.vscode'));
    await fs.writeFile(path.join(projectDir, '.vscode/settings.json'), getVscodeSettingsTemplate());
    console.log(chalk.gray('  更新: .vscode/settings.json'));

    // 更新 tsconfig.json（仅在不存在时创建，feng3d-cli 跳过）
    if (!isFeng3dCli)
    {
        const tsconfigPath = path.join(projectDir, 'tsconfig.json');

        if (!await fs.pathExists(tsconfigPath))
        {
            await fs.writeFile(tsconfigPath, getTsconfigTemplateString());
            console.log(chalk.gray('  创建: tsconfig.json'));
        }
        else
        {
            console.log(chalk.gray('  跳过: tsconfig.json（已存在）'));
        }
    }

    // 更新 vite.config.js（仅在不存在时创建，feng3d-cli 跳过）
    if (!isFeng3dCli)
    {
        const viteConfigPath = path.join(projectDir, 'vite.config.js');

        if (!await fs.pathExists(viteConfigPath))
        {
            await fs.writeFile(viteConfigPath, getViteConfigTemplate());
            console.log(chalk.gray('  创建: vite.config.js'));
        }
        else
        {
            console.log(chalk.gray('  跳过: vite.config.js（已存在）'));
        }
    }

    // 更新发布脚本（仅在不存在时创建）
    const scriptsDir = path.join(projectDir, 'scripts');
    const prepublishPath = path.join(scriptsDir, 'prepublish.js');
    const postpublishPath = path.join(scriptsDir, 'postpublish.js');

    if (!await fs.pathExists(prepublishPath))
    {
        await fs.ensureDir(scriptsDir);
        await fs.writeFile(prepublishPath, getPrepublishScriptTemplate());
        console.log(chalk.gray('  创建: scripts/prepublish.js'));
    }

    if (!await fs.pathExists(postpublishPath))
    {
        await fs.ensureDir(scriptsDir);
        await fs.writeFile(postpublishPath, getPostpublishScriptTemplate());
        console.log(chalk.gray('  创建: scripts/postpublish.js'));
    }

    // 如果存在 examples 目录，创建 postdocs.js 脚本
    const examplesDir = path.join(projectDir, 'examples');
    const postdocsPath = path.join(scriptsDir, 'postdocs.js');

    if (await fs.pathExists(examplesDir))
    {
        if (!await fs.pathExists(postdocsPath))
        {
            await fs.ensureDir(scriptsDir);
            await fs.writeFile(postdocsPath, getPostdocsScriptTemplate());
            console.log(chalk.gray('  创建: scripts/postdocs.js'));
        }
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
 */
async function updateDependencies(projectDir: string): Promise<void>
{
    const packageJsonPath = path.join(projectDir, 'package.json');

    // 读取原始内容以检测缩进风格
    const originalContent = await fs.readFile(packageJsonPath, 'utf-8');
    const indent = detectIndent(originalContent);
    const hasTrailingNewline = originalContent.endsWith('\n');

    const packageJson = JSON.parse(originalContent);

    const standardDeps = getDevDependencies({
        includeVitest: true,
        includeTypedoc: true,
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
        watch: 'concurrently "vite build --watch" "tsc -w" "vitest"',
        test: 'vitest run',
        lint: 'eslint . --ext .js,.ts --max-warnings 0',
        lintfix: 'npm run lint -- --fix',
        docs: 'typedoc',
        prepublishOnly: 'node scripts/prepublish.js',
        release: 'npm run clean && npm run lint && npm test && npm run build && npm run docs && npm publish',
        postpublish: 'node scripts/postpublish.js',
    };

    // 检查是否存在 examples 目录，添加相关脚本
    const examplesDir = path.join(projectDir, 'examples');

    if (await fs.pathExists(examplesDir))
    {
        standardScripts['examples:dev'] = 'cd examples && npm run dev';
        standardScripts.postdocs = 'node scripts/postdocs.js && cd examples && vite build --outDir ../public';
    }

    for (const [key, value] of Object.entries(standardScripts))
    {
        if (!(key in packageJson.scripts))
        {
            packageJson.scripts[key] = value;
            updated = true;
            console.log(chalk.gray(`  添加: scripts.${key}`));
        }
    }

    // 设置标准入口点配置（配合 prepublish/postpublish 脚本使用，仅在不存在时添加）
    if (!packageJson.type)
    {
        packageJson.type = 'module';
        updated = true;
        console.log(chalk.gray('  添加: type = "module"'));
    }

    const entryPoints = {
        main: './src/index.ts',
        types: './src/index.ts',
        module: './src/index.ts',
    };

    for (const [key, value] of Object.entries(entryPoints))
    {
        if (!(key in packageJson))
        {
            packageJson[key] = value;
            updated = true;
            console.log(chalk.gray(`  添加: ${key} = "${value}"`));
        }
    }

    // 设置 exports 配置（仅在不存在时添加）
    if (!packageJson.exports)
    {
        packageJson.exports = {
            '.': {
                types: './src/index.ts',
                import: './src/index.ts',
                require: './src/index.ts',
            },
        };
        updated = true;
        console.log(chalk.gray('  添加: exports'));
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
        const orderedPackageJson = reorderPackageJson(packageJson);
        let newContent = JSON.stringify(orderedPackageJson, null, indent);

        if (hasTrailingNewline)
        {
            newContent += '\n';
        }
        await fs.writeFile(packageJsonPath, newContent);
    }
}
