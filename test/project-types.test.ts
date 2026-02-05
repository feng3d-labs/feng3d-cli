import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { updateProject } from '../src/commands/update.js';
import { createProject } from '../src/commands/create.js';

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

describe('不同类型项目的创建和更新', () =>
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

    describe('项目创建', () =>
    {
        test('创建普通 TypeScript 项目', async () =>
        {
            await createProject('my-project', {
                directory: tempDir,
                examples: false,
                vitest: true,
            });

            const projectDir = path.join(tempDir, 'my-project');

            // 检查基础文件
            expect(await fs.pathExists(path.join(projectDir, 'package.json'))).toBe(true);
            expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(projectDir, 'src/index.ts'))).toBe(true);

            const packageJson = await fs.readJson(path.join(projectDir, 'package.json'));

            expect(packageJson.name).toBe('@feng3d/my-project');
        });

        test('创建带 examples 的项目', async () =>
        {
            await createProject('my-project', {
                directory: tempDir,
                examples: true,
                vitest: true,
            });

            const projectDir = path.join(tempDir, 'my-project');

            // 检查 examples 目录
            expect(await fs.pathExists(path.join(projectDir, 'examples'))).toBe(true);

            const packageJson = await fs.readJson(path.join(projectDir, 'package.json'));

            // 检查基本配置
            expect(packageJson.name).toBe('@feng3d/my-project');
        });

        test('创建不带测试配置的项目', async () =>
        {
            await createProject('my-project', {
                directory: tempDir,
                examples: false,
                vitest: false,
            });

            const projectDir = path.join(tempDir, 'my-project');

            const packageJson = await fs.readJson(path.join(projectDir, 'package.json'));

            expect(packageJson.name).toBe('@feng3d/my-project');
        });
    });

    describe('普通项目更新', () =>
    {
        test('更新一个基础的 TypeScript 项目', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'my-ts-project',
                devDependencies: {
                    typescript: '4.9.5', // 旧版本
                },
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该更新到新版本
            expect(packageJson.devDependencies.typescript).toBe('5.8.3');
            // 应该添加其他依赖
            expect(packageJson.devDependencies.vite).toBeDefined();
            expect(packageJson.devDependencies.vitest).toBeDefined();
        });

        test('更新已有自定义配置的项目', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'custom-project',
                scripts: {
                    dev: 'vite --port 3000',
                    'custom-script': 'echo custom',
                },
                devDependencies: {
                    vite: '5.0.0',
                },
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该保留自定义 scripts
            expect(packageJson.scripts.dev).toBe('vite --port 3000');
            expect(packageJson.scripts['custom-script']).toBe('echo custom');
            // 应该添加标准 scripts
            expect(packageJson.scripts.build).toBeDefined();
            expect(packageJson.scripts.test).toBeDefined();
        });
    });

    describe('Monorepo 项目更新', () =>
    {
        test('更新 monorepo 根目录', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'my-monorepo',
                workspaces: ['packages/*'],
                devDependencies: {
                    typescript: '4.9.5',
                },
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该更新 typescript
            expect(packageJson.devDependencies.typescript).toBe('5.8.3');
            // 不应该添加 vitest 和 typedoc
            expect(packageJson.devDependencies.vitest).toBeUndefined();
            expect(packageJson.devDependencies.typedoc).toBeUndefined();
            // 不应该有 test 和 docs scripts
            expect(packageJson.scripts.test).toBeUndefined();
            expect(packageJson.scripts.docs).toBeUndefined();
            // 应该有其他 scripts
            expect(packageJson.scripts.build).toBeDefined();
            expect(packageJson.scripts.lint).toBeDefined();
        });

        test('monorepo 根目录不创建测试和文档配置文件', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'my-monorepo',
                workspaces: ['packages/*'],
            });

            await updateProject({ directory: tempDir });

            // 不应该创建这些文件
            expect(await fs.pathExists(path.join(tempDir, 'vitest.config.ts'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'typedoc.json'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'test/_.test.ts'))).toBe(false);
        });

        test('更新 monorepo 子包', async () =>
        {
            // 创建子包目录
            const packageDir = path.join(tempDir, 'packages/my-package');

            await fs.ensureDir(packageDir);
            await createPackageJson(packageDir, {
                name: '@my-monorepo/my-package',
            });

            await updateProject({ directory: packageDir });

            const packageJson = await fs.readJson(path.join(packageDir, 'package.json'));

            // 子包应该有完整的配置
            expect(packageJson.devDependencies.vitest).toBeDefined();
            expect(packageJson.devDependencies.typedoc).toBeDefined();
            expect(packageJson.scripts.test).toBeDefined();
            expect(packageJson.scripts.docs).toBeDefined();

            // 应该创建配置文件
            expect(await fs.pathExists(path.join(packageDir, 'vitest.config.ts'))).toBe(true);
            expect(await fs.pathExists(path.join(packageDir, 'typedoc.json'))).toBe(true);
        });
    });

    describe('不同合并策略的测试', () =>
    {
        test('merge 策略：保留用户配置并添加标准配置', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'merge-test',
                scripts: {
                    'custom-build': 'custom build command',
                },
                devDependencies: {
                    'custom-dep': '1.0.0',
                },
            });

            await updateProject({
                directory: tempDir,
                mergeStrategy: 'merge',
            });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该保留自定义配置
            expect(packageJson.scripts['custom-build']).toBe('custom build command');
            expect(packageJson.devDependencies['custom-dep']).toBe('1.0.0');
            // 应该添加标准配置
            expect(packageJson.scripts.build).toBeDefined();
            expect(packageJson.devDependencies.typescript).toBeDefined();
        });

        test('overwrite 策略：完全覆盖配置文件', async () =>
        {
            const customConfig = 'export default { custom: true };';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, 'vite.config.js'), customConfig);

            await updateProject({
                directory: tempDir,
                mergeStrategy: 'overwrite',
            });

            const content = await fs.readFile(path.join(tempDir, 'vite.config.js'), 'utf-8');

            // 应该被标准配置覆盖
            expect(content).not.toBe(customConfig);
            expect(content).toContain('defineConfig');
        });

        test('skip-existing 策略：保持现有文件不变', async () =>
        {
            const customConfig = '# Custom cursorrules\nMy custom rules';

            await createPackageJson(tempDir);
            await fs.writeFile(path.join(tempDir, '.cursorrules'), customConfig);

            await updateProject({
                directory: tempDir,
                mergeStrategy: 'skip-existing',
            });

            const content = await fs.readFile(path.join(tempDir, '.cursorrules'), 'utf-8');

            // 应该保持不变
            expect(content).toBe(customConfig);
        });
    });

    describe('特殊项目类型', () =>
    {
        test('更新空项目（只有 package.json）', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'empty-project',
            });

            await updateProject({ directory: tempDir });

            // 应该创建所有必要的文件
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'eslint.config.js'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, '.gitignore'))).toBe(true);

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson.name).toBe('empty-project');
            expect(packageJson.devDependencies).toBeDefined();
            expect(packageJson.scripts).toBeDefined();
            expect(packageJson.devDependencies.typescript).toBeDefined();
            expect(packageJson.scripts.build).toBeDefined();
        });

        test('更新只有源码的项目（无配置文件）', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'source-only',
            });

            // 创建一些源码文件
            await fs.ensureDir(path.join(tempDir, 'src'));
            await fs.writeFile(path.join(tempDir, 'src/index.ts'), 'export const hello = "world";');
            await fs.writeFile(path.join(tempDir, 'src/utils.ts'), 'export const add = (a, b) => a + b;');

            await updateProject({ directory: tempDir });

            // 应该创建所有配置文件
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(true);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(true);

            // 不应该覆盖源码文件
            const indexContent = await fs.readFile(path.join(tempDir, 'src/index.ts'), 'utf-8');

            expect(indexContent).toBe('export const hello = "world";');
        });

        test('更新已有完整配置的项目', async () =>
        {
            await createPackageJson(tempDir, {
                name: 'full-config',
                scripts: {
                    build: 'tsc',
                    test: 'jest',
                },
                devDependencies: {
                    typescript: '4.9.5',
                    jest: '29.0.0',
                },
            });

            // 创建一些配置文件
            await fs.writeFile(path.join(tempDir, 'tsconfig.json'), JSON.stringify({
                compilerOptions: { target: 'ES2015' },
            }));

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // 应该保留用户的 jest 配置
            expect(packageJson.devDependencies.jest).toBe('29.0.0');
            // 应该更新 typescript 版本
            expect(packageJson.devDependencies.typescript).toBe('5.8.3');
            // 应该保留用户的脚本
            expect(packageJson.scripts.test).toBe('jest');
        });
    });

    describe('Dry-run 模式测试', () =>
    {
        test('dry-run 不修改现有项目', async () =>
        {
            const originalContent = {
                name: 'dry-run-test',
                version: '1.0.0',
                scripts: { dev: 'vite' },
            };

            await createPackageJson(tempDir, originalContent);
            await fs.writeFile(path.join(tempDir, 'README.md'), '# Original README');

            await updateProject({
                directory: tempDir,
                dryRun: true,
            });

            // package.json 不应该被修改
            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson).toEqual(originalContent);

            // 不应该创建新文件
            expect(await fs.pathExists(path.join(tempDir, 'tsconfig.json'))).toBe(false);
            expect(await fs.pathExists(path.join(tempDir, 'vite.config.js'))).toBe(false);

            // README 不应该被修改
            const readmeContent = await fs.readFile(path.join(tempDir, 'README.md'), 'utf-8');

            expect(readmeContent).toBe('# Original README');
        });
    });

    describe('边界情况测试', () =>
    {
        test('项目名称包含特殊字符', async () =>
        {
            await createPackageJson(tempDir, {
                name: '@my-scope/my-project-name',
            });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            expect(packageJson.name).toBe('@my-scope/my-project-name');
            expect(packageJson.devDependencies).toBeDefined();
        });

        test('处理没有 name 字段的 package.json', async () =>
        {
            await fs.writeJson(path.join(tempDir, 'package.json'), {
                version: '1.0.0',
            }, { spaces: 4 });

            await updateProject({ directory: tempDir });

            const packageJson = await fs.readJson(path.join(tempDir, 'package.json'));

            // package.json 应该被更新
            expect(packageJson.version).toBe('1.0.0');
            expect(packageJson.devDependencies).toBeDefined();
        });

        test('处理格式错误的 JSON 文件', async () =>
        {
            await createPackageJson(tempDir);

            // 创建一个格式错误的 typedoc.json
            await fs.writeFile(path.join(tempDir, 'typedoc.json'), '{ invalid json }');

            // 应该能够覆盖错误的文件
            await expect(updateProject({ directory: tempDir, mergeStrategy: 'overwrite' })).resolves.not.toThrow();

            // 应该创建正确的 typedoc.json
            const typedocContent = await fs.readFile(path.join(tempDir, 'typedoc.json'), 'utf-8');
            const typedoc = JSON.parse(typedocContent);

            expect(typedoc.$schema).toBeDefined();
        });
    });
});
