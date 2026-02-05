import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { updateProject } from '../src/commands/update.js';

/**
 * 创建临时测试目录
 */
async function createTempDir(): Promise<string>
{
    const tempDir = path.join(os.tmpdir(), `feng3d-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    await fs.ensureDir(tempDir);

    return tempDir;
}

/**
 * 清理临时目录
 */
async function cleanupTempDir(dir: string): Promise<void>
{
    await fs.remove(dir);
}

/**
 * 创建基础 package.json
 */
async function createPackageJson(dir: string, content: object = {}): Promise<void>
{
    const defaultContent = {
        name: 'test-project',
        version: '1.0.0',
        ...content,
    };

    await fs.writeJson(path.join(dir, 'package.json'), defaultContent, { spaces: 4 });
}

describe('feng3d-cli update', () =>
{
    let tempDir: string;

    beforeEach(async () =>
    {
        tempDir = await createTempDir();
    });

    afterEach(async () =>
    {
        await cleanupTempDir(tempDir);
    });

    describe('基础功能', () =>
    {
        test('在空项目中创建所有配置文件', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            // 检查文件是否创建
            expect(await fs.pathExists(path.join(tempDir, '.gitignore'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.cursorrules'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'eslint.config.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'typedoc.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'LICENSE'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.vscode/settings.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vitest.config.ts'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'scripts/prepublish.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'scripts/postpublish.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.husky/pre-commit'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/publish.yml'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/pages.yml'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/pull-request.yml'))).toBe(true);
        });

        test('不存在 package.json 时自动创建项目', async () =>
        {
            const newProjectDir = path.join(tempDir, 'new-project');

            await updateProject({ directory: newProjectDir });

            // 应该创建 package.json
            expect(await fs.pathExists(path.join(newProjectDir, 'package.json'))).toBe(true);
            const packageJson = await fs.readJson(path.join(newProjectDir, 'package.json'));

            expect(packageJson.name).toBe('@feng3d/new-project');
            expect(packageJson.version).toBe('0.0.1');

            // 应该创建 src/index.ts
            expect(await fs.pathExists(path.join(newProjectDir, 'src/index.ts'))).toBe(true);

            // 应该创建其他配置文件
            expect(await fs.pathExists(path.join(newProjectDir, '.gitignore'))).toBe(true);
            expect(await fs.pathExists(path.join(newProjectDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(newProjectDir, 'vite.config.js'))).toBe(true);
            expect(await fs.pathExists(path.join(newProjectDir, 'vitest.config.ts'))).toBe(true);
        });
    });

    describe('package.json 更新', () =>
    {
        test('添加标准脚本', async () =>
        {
            await createPackageJson(tempDir, { scripts: {} });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson.scripts.clean).toBe('rimraf lib dist public');
            expect(packageJson.scripts.build).toBe('vite build && tsc');
            expect(packageJson.scripts.test).toBe('vitest run');
            expect(packageJson.scripts.lint).toBeDefined();
            expect(packageJson.scripts.docs).toBe('typedoc');
            expect(packageJson.scripts.prepublishOnly).toBeDefined();
            expect(packageJson.scripts.postpublish).toBeDefined();
            expect(packageJson.scripts.release).toBeDefined();
        });

        test('不覆盖已存在的脚本', async () =>
        {
            await createPackageJson(tempDir, {
                scripts: {
                    build: 'custom build command',
                    test: 'custom test command',
                },
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 已存在的脚本不应被覆盖
            expect(packageJson.scripts.build).toBe('custom build command');
            expect(packageJson.scripts.test).toBe('custom test command');
            // 不存在的脚本应被添加
            expect(packageJson.scripts.clean).toBe('rimraf lib dist public');
        });

        test('添加 devDependencies', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson.devDependencies.typescript).toBeDefined();
            expect(packageJson.devDependencies.vite).toBeDefined();
            expect(packageJson.devDependencies.vitest).toBeDefined();
            expect(packageJson.devDependencies.eslint).toBeDefined();
            expect(packageJson.devDependencies.typedoc).toBeDefined();
        });

        test('添加入口点配置', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson.type).toBe('module');
            expect(packageJson.main).toBe('./src/index.ts');
            expect(packageJson.types).toBe('./src/index.ts');
            expect(packageJson.module).toBe('./src/index.ts');
            expect(packageJson.exports).toBeDefined();
        });

        test('强制覆盖已存在的入口点配置', async () =>
        {
            await createPackageJson(tempDir, {
                type: 'commonjs',
                main: './lib/index.js',
                types: './lib/index.d.ts',
                exports: { '.': './lib/index.js' },
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 配置应被强制覆盖为标准值
            expect(packageJson.type).toBe('module');
            expect(packageJson.main).toBe('./src/index.ts');
            expect(packageJson.types).toBe('./src/index.ts');
            expect(packageJson.exports).toEqual({
                '.': {
                    types: './src/index.ts',
                    import: './src/index.ts',
                    require: './src/index.ts',
                },
            });
        });
    });

    describe('文件创建与覆盖', () =>
    {
        test('.gitignore 强制覆盖', async () =>
        {
            const customGitignore = '# Custom gitignore\nnode_modules/\n';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, '.gitignore'), customGitignore);

            await updateProject({ directory: tempDir });

            const content = await fs.readFile(path.join(tempDir, '.gitignore'), 'utf-8');

            // .gitignore 应该被模板内容覆盖
            expect(content).not.toBe(customGitignore);
            expect(content).toContain('node_modules');
        });

        test('LICENSE 强制覆盖', async () =>
        {
            const customLicense = 'Custom License Content';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'LICENSE'), customLicense);

            await updateProject({ directory: tempDir });

            const content = await fs.readFile(path.join(tempDir, 'LICENSE'), 'utf-8');

            // LICENSE 应该被模板内容覆盖
            expect(content).not.toBe(customLicense);
            expect(content).toContain('MIT 许可证');
        });

        test('tsconfig.json 强制覆盖', async () =>
        {
            const customTsconfig = { compilerOptions: { target: 'ES5' } };

            await createPackageJson(tempDir);
            await fs.writeJson(path.join(tempDir, 'tsconfig.json'), customTsconfig);

            await updateProject({ directory: tempDir });

            const content = await fs.readJson(path.join(tempDir, 'tsconfig.json'));

            // tsconfig.json 应该被模板内容覆盖
            expect(content.compilerOptions.target).not.toBe('ES5');
        });

        test('vite.config.js 强制覆盖', async () =>
        {
            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'vite.config.js'), '// Custom config');

            await updateProject({ directory: tempDir });

            const content = await fs.readFile(path.join(tempDir, 'vite.config.js'), 'utf-8');

            // vite.config.js 应该被模板内容覆盖
            expect(content).not.toBe('// Custom config');
            expect(content).toContain('defineConfig');
        });

        test('vitest.config.ts 强制覆盖', async () =>
        {
            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'vitest.config.ts'), '// Custom vitest config');

            await updateProject({ directory: tempDir });

            const content = await fs.readFile(path.join(tempDir, 'vitest.config.ts'), 'utf-8');

            // vitest.config.ts 应该被模板内容覆盖
            expect(content).not.toBe('// Custom vitest config');
            expect(content).toContain('defineConfig');
        });
    });

    describe('发布脚本', () =>
    {
        test('创建 prepublish.js 和 postpublish.js', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            expect(await fs.pathExists(path.join(tempDir, 'scripts/prepublish.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'scripts/postpublish.js'))).toBe(true);

            const prepublish = await fs.readFile(path.join(tempDir, 'scripts/prepublish.js'), 'utf-8');
            const postpublish = await fs.readFile(path.join(tempDir, 'scripts/postpublish.js'), 'utf-8');

            expect(prepublish).toContain('replace');
            expect(postpublish).toContain('replace');
        });

        test('强制覆盖已存在的发布脚本', async () =>
        {
            const customScript = '// Custom prepublish script';

            await createPackageJson(tempDir);
            await fs.ensureDir(path.join(tempDir, 'scripts'));
            await fs.writeFile(path.join(tempDir, 'scripts/prepublish.js'), customScript);

            await updateProject({ directory: tempDir });

            const content = await fs.readFile(path.join(tempDir, 'scripts/prepublish.js'), 'utf-8');

            // 发布脚本应该被模板内容覆盖
            expect(content).not.toBe(customScript);
            expect(content).toContain('replace');
        });
    });

    describe('Husky 配置', () =>
    {
        test('创建 .husky/pre-commit', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            expect(await fs.pathExists(path.join(tempDir, '.husky/pre-commit'))).toBe(true);

            const content = await fs.readFile(path.join(tempDir, '.husky/pre-commit'), 'utf-8');

            expect(content).toContain('lint-staged');
        });

        test('添加 lint-staged 配置到 package.json', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson['lint-staged']).toBeDefined();
            expect(packageJson.scripts.prepare).toBe('husky');
        });
    });

    describe('GitHub Actions', () =>
    {
        test('创建所有 workflow 文件', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/publish.yml'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/pages.yml'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.github/workflows/pull-request.yml'))).toBe(true);
        });
    });

    describe('智能合并策略', () =>
    {
        test('merge 策略：JSON 文件智能合并', async () =>
        {
            const customTypedoc = {
                entryPoints: ['src/custom.ts'],
                out: 'custom-docs',
                customField: 'custom value',
            };

            await createPackageJson(tempDir);
            await fs.writeJson(path.join(tempDir, 'typedoc.json'), customTypedoc, { spaces: 2 });

            await updateProject({ directory: tempDir, mergeStrategy: 'merge' });

            const result = await fs.readJson(path.join(tempDir, 'typedoc.json'));

            // 应该保留用户的自定义字段
            expect(result.customField).toBe('custom value');
            // 应该保留用户的配置
            expect(result.entryPoints).toEqual(['src/custom.ts']);
            expect(result.out).toBe('custom-docs');
            // 应该添加标准配置中缺失的字段
            expect(result.$schema).toBeDefined();
        });

        test('overwrite 策略：完全覆盖已存在的文件', async () =>
        {
            const customContent = '// Custom eslint config';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'eslint.config.js'), customContent);

            await updateProject({ directory: tempDir, mergeStrategy: 'overwrite' });

            const content = await fs.readFile(path.join(tempDir, 'eslint.config.js'), 'utf-8');

            // 文件应该被完全覆盖
            expect(content).not.toBe(customContent);
            expect(content).toContain('export default');
        });

        test('skip-existing 策略：跳过已存在的文件', async () =>
        {
            const customContent = '// Custom config';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'vite.config.js'), customContent);

            await updateProject({ directory: tempDir, mergeStrategy: 'skip-existing' });

            const content = await fs.readFile(path.join(tempDir, 'vite.config.js'), 'utf-8');

            // 文件应该保持不变
            expect(content).toBe(customContent);
        });

        test('force 选项：强制覆盖（等同于 overwrite）', async () =>
        {
            const customContent = '# Custom cursorrules';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, '.cursorrules'), customContent);

            await updateProject({ directory: tempDir, force: true });

            const content = await fs.readFile(path.join(tempDir, '.cursorrules'), 'utf-8');

            // 文件应该被覆盖
            expect(content).not.toBe(customContent);
        });
    });

    describe('Monorepo 支持', () =>
    {
        test('monorepo 根目录不添加 vitest 和 typedoc 依赖', async () =>
        {
            await createPackageJson(tempDir, {
                workspaces: ['packages/*'],
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 不应该添加 vitest 和 typedoc
            expect(packageJson.devDependencies.vitest).toBeUndefined();
            expect(packageJson.devDependencies.typedoc).toBeUndefined();
            // 应该添加其他依赖
            expect(packageJson.devDependencies.typescript).toBeDefined();
            expect(packageJson.devDependencies.eslint).toBeDefined();
        });

        test('monorepo 根目录不添加 test 和 docs 相关 scripts', async () =>
        {
            await createPackageJson(tempDir, {
                workspaces: ['packages/*'],
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 不应该添加 test、docs、watch scripts
            expect(packageJson.scripts.test).toBeUndefined();
            expect(packageJson.scripts.docs).toBeUndefined();
            expect(packageJson.scripts.watch).toBeUndefined();
            // 应该添加其他 scripts
            expect(packageJson.scripts.build).toBeDefined();
            expect(packageJson.scripts.lint).toBeDefined();
            // release 脚本不应包含 npm test 和 npm run docs
            expect(packageJson.scripts.release).not.toContain('npm test');
            expect(packageJson.scripts.release).not.toContain('npm run docs');
        });

        test('monorepo 根目录不创建 typedoc.json 和 vitest.config.ts', async () =>
        {
            await createPackageJson(tempDir, {
                workspaces: ['packages/*'],
            });

            await updateProject({ directory: tempDir });

            // 不应该创建这些文件
            expect(await fs.pathExists(path.join(tempDir, 'typedoc.json'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'vitest.config.ts'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'test/_.test.ts'))).toBe(false);
            // 应该创建其他文件
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(true);
        });

        test('非 monorepo 项目正常添加所有依赖和配置', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该添加 vitest 和 typedoc
            expect(packageJson.devDependencies.vitest).toBeDefined();
            expect(packageJson.devDependencies.typedoc).toBeDefined();
            // 应该添加相关 scripts
            expect(packageJson.scripts.test).toBeDefined();
            expect(packageJson.scripts.docs).toBeDefined();
            expect(packageJson.scripts.watch).toBeDefined();
            // 应该创建相关文件
            expect(await fs.pathExists(path.join(tempDir, 'typedoc.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vitest.config.ts'))).toBe(true);
        });
    });

    describe('Dry-run 模式', () =>
    {
        test('dry-run 模式不实际修改文件', async () =>
        {
            await createPackageJson(tempDir);

            await updateProject({ directory: tempDir, dryRun: true });

            // 文件不应该被创建
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'eslint.config.js'))).toBe(false);
        });

        test('dry-run 模式不修改 package.json', async () =>
        {
            const originalContent = {
                name: 'test-project',
                version: '1.0.0',
                scripts: {},
            };

            await createPackageJson(tempDir, originalContent);

            await updateProject({ directory: tempDir, dryRun: true });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // package.json 不应该被修改
            expect(packageJson.devDependencies).toBeUndefined();
            expect(packageJson.scripts.build).toBeUndefined();
        });
    });
});
