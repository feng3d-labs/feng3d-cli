/**
 * 创建新项目命令
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getDevDependencies } from '../versions.js';
import {
    getGitignoreTemplate,
    getCursorrrulesTemplate,
    getTsconfigTemplate,
    getTypedocConfig,
    getPublishWorkflowTemplate,
    getPrepublishScriptTemplate,
    getPostpublishScriptTemplate,
    getSrcIndexTemplate,
} from '../templates.js';
import { createEslintConfigFile } from './update.js';

export interface CreateOptions {
    directory: string;
    examples?: boolean;
    vitest?: boolean;
}

/**
 * 创建符合 feng3d 规范的新项目
 */
export async function createProject(name: string, options: CreateOptions): Promise<void>
{
    const projectDir = path.join(options.directory, name);

    // 检查目录是否已存在
    if (await fs.pathExists(projectDir))
    {
        throw new Error(`目录 ${projectDir} 已存在`);
    }

    // 创建项目目录
    await fs.ensureDir(projectDir);
    await fs.ensureDir(path.join(projectDir, 'src'));

    console.log(chalk.gray(`  创建目录: ${projectDir}`));

    // 创建 package.json
    const packageJson = createPackageJson(name, options);

    await fs.writeJson(path.join(projectDir, 'package.json'), packageJson, { spaces: 4 });
    console.log(chalk.gray('  创建: package.json'));

    // 创建 tsconfig.json
    await fs.writeJson(path.join(projectDir, 'tsconfig.json'), getTsconfigTemplate(), { spaces: 4 });
    console.log(chalk.gray('  创建: tsconfig.json'));

    // 创建 .gitignore
    await fs.writeFile(path.join(projectDir, '.gitignore'), getGitignoreTemplate());
    console.log(chalk.gray('  创建: .gitignore'));

    // 创建 .cursorrules
    await fs.writeFile(path.join(projectDir, '.cursorrules'), getCursorrrulesTemplate());
    console.log(chalk.gray('  创建: .cursorrules'));

    // 创建 eslint.config.js
    await createEslintConfigFile(projectDir);
    console.log(chalk.gray('  创建: eslint.config.js'));

    // 创建 typedoc.json
    const typedocConfig = getTypedocConfig({ repoName: name });

    await fs.writeJson(path.join(projectDir, 'typedoc.json'), typedocConfig, { spaces: 4 });
    console.log(chalk.gray('  创建: typedoc.json'));

    // 创建 src/index.ts
    await fs.writeFile(path.join(projectDir, 'src/index.ts'), getSrcIndexTemplate({ name: `@feng3d/${name}` }));
    console.log(chalk.gray('  创建: src/index.ts'));

    // 创建 README.md
    await fs.writeFile(path.join(projectDir, 'README.md'), `# @feng3d/${name}\n`);
    console.log(chalk.gray('  创建: README.md'));

    // 创建示例目录
    if (options.examples !== false)
    {
        await fs.ensureDir(path.join(projectDir, 'examples'));
        console.log(chalk.gray('  创建: examples/'));
    }

    // 创建测试目录
    if (options.vitest !== false)
    {
        await fs.ensureDir(path.join(projectDir, 'test'));
        console.log(chalk.gray('  创建: test/'));
    }

    // 创建 .github/workflows 目录和 publish.yml
    await fs.ensureDir(path.join(projectDir, '.github/workflows'));
    await fs.writeFile(path.join(projectDir, '.github/workflows/publish.yml'), getPublishWorkflowTemplate());
    console.log(chalk.gray('  创建: .github/workflows/publish.yml'));

    // 创建 scripts 目录和发布脚本
    await fs.ensureDir(path.join(projectDir, 'scripts'));
    await fs.writeFile(path.join(projectDir, 'scripts/prepublish.js'), getPrepublishScriptTemplate());
    await fs.writeFile(path.join(projectDir, 'scripts/postpublish.js'), getPostpublishScriptTemplate());
    console.log(chalk.gray('  创建: scripts/prepublish.js'));
    console.log(chalk.gray('  创建: scripts/postpublish.js'));
}

/**
 * 创建 package.json 内容
 */
function createPackageJson(name: string, options: CreateOptions): object
{
    const scripts: Record<string, string> = {
        dev: 'cd examples && npm run dev',
        clean: 'rimraf lib dist public',
        build: 'vite build && tsc',
        types: 'tsc',
        watch: 'tsc -w',
        lint: 'eslint . --ext .js,.ts --max-warnings 0',
        lintfix: 'npm run lint -- --fix',
        docs: 'typedoc',
        release: 'npm run clean && npm run lint && npm test && npm run build && npm run docs && npm publish',
        prepublishOnly: 'node scripts/prepublish.js',
        postpublish: 'node scripts/postpublish.js',
    };

    if (options.vitest !== false)
    {
        scripts.test = 'vitest run';
        scripts['test:watch'] = 'vitest';
    }

    return {
        name: `@feng3d/${name}`,
        version: '0.0.1',
        description: '',
        homepage: `https://feng3d.com/${name}/`,
        author: 'feng',
        type: 'module',
        main: './src/index.ts',
        types: './src/index.ts',
        module: './src/index.ts',
        exports: {
            '.': {
                types: './src/index.ts',
                import: './src/index.ts',
                require: './src/index.ts',
            },
        },
        scripts,
        repository: {
            type: 'git',
            url: `https://github.com/feng3d-labs/${name}.git`,
        },
        publishConfig: {
            access: 'public',
        },
        files: ['src', 'dist', 'lib'],
        devDependencies: getDevDependencies({
            includeVitest: options.vitest !== false,
            includeTypedoc: true,
        }),
    };
}

