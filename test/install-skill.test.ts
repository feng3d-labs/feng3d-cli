import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { installSkill } from '../src/commands/install-skill.js';

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

describe('install-skill 命令', () =>
{
    let tempDir: string;
    let originalHome: string | undefined;

    beforeEach(async () =>
    {
        tempDir = await createTempDir();
        // 保存原始的 HOME 环境变量
        originalHome = process.env.HOME || process.env.USERPROFILE;
        // 临时设置 HOME 到测试目录
        process.env.HOME = tempDir;
        process.env.USERPROFILE = tempDir;
    });

    afterEach(async () =>
    {
        // 恢复原始的 HOME 环境变量
        if (originalHome)
        {
            process.env.HOME = originalHome;
            process.env.USERPROFILE = originalHome;
        }
        await cleanupTempDir(tempDir);
    });

    describe('基础功能', () =>
    {
        test('检查 skill 源文件是否存在', async () =>
        {
            // 检查项目中的 .claude-skill 目录
            const projectRoot = process.cwd();
            const skillSourceDir = path.join(projectRoot, '.claude-skill');

            expect(await fs.pathExists(skillSourceDir)).toBe(true);
            expect(await fs.pathExists(path.join(skillSourceDir, 'skill.json'))).toBe(true);
            expect(await fs.pathExists(path.join(skillSourceDir, 'README.md'))).toBe(true);
        });

        test('验证 skill.json 格式', async () =>
        {
            const projectRoot = process.cwd();
            const skillJsonPath = path.join(projectRoot, '.claude-skill/skill.json');

            const skillJson = await fs.readJson(skillJsonPath);

            // 验证必需字段
            expect(skillJson.name).toBeDefined();
            expect(skillJson.version).toBeDefined();
            expect(skillJson.commands).toBeDefined();
            expect(typeof skillJson.commands).toBe('object');

            // 验证命令格式
            const commandNames = Object.keys(skillJson.commands);

            expect(commandNames.length).toBeGreaterThan(0);

            for (const cmdName of commandNames)
            {
                const cmd = skillJson.commands[cmdName];

                expect(cmd.description).toBeDefined();
            }
        });
    });

    describe('Skill 内容验证', () =>
    {
        test('验证 README.md 包含必要信息', async () =>
        {
            const projectRoot = process.cwd();
            const readmePath = path.join(projectRoot, '.claude-skill/README.md');

            const readmeContent = await fs.readFile(readmePath, 'utf-8');

            // 应该包含安装说明
            expect(readmeContent).toContain('安装');
            // 应该包含使用说明
            expect(readmeContent).toContain('使用');
        });

        test('验证 SKILL.md 文档完整性', async () =>
        {
            const projectRoot = process.cwd();
            const skillMdPath = path.join(projectRoot, '.claude-skill/SKILL.md');

            if (await fs.pathExists(skillMdPath))
            {
                const content = await fs.readFile(skillMdPath, 'utf-8');

                // 应该包含功能说明
                expect(content.length).toBeGreaterThan(0);
            }
        });

        test('验证安装脚本存在', async () =>
        {
            const projectRoot = process.cwd();
            const skillDir = path.join(projectRoot, '.claude-skill');

            // 至少应该有一个安装脚本
            const hasInstallSh = await fs.pathExists(path.join(skillDir, 'install.sh'));
            const hasInstallPs1 = await fs.pathExists(path.join(skillDir, 'install.ps1'));

            expect(hasInstallSh || hasInstallPs1).toBe(true);
        });
    });

    describe('命令测试', () =>
    {
        test('create 命令的 prompt 应该包含必要说明', async () =>
        {
            const projectRoot = process.cwd();
            const skillJsonPath = path.join(projectRoot, '.claude-skill/skill.json');
            const skillJson = await fs.readJson(skillJsonPath);

            const createCommand = skillJson.commands?.create;

            expect(createCommand).toBeDefined();
            expect(createCommand.description).toBeDefined();
            expect(createCommand.description.length).toBeGreaterThan(10);
        });

        test('update 命令的 prompt 应该包含必要说明', async () =>
        {
            const projectRoot = process.cwd();
            const skillJsonPath = path.join(projectRoot, '.claude-skill/skill.json');
            const skillJson = await fs.readJson(skillJsonPath);

            const updateCommand = skillJson.commands?.update;

            expect(updateCommand).toBeDefined();
            expect(updateCommand.description).toBeDefined();
            expect(updateCommand.description.length).toBeGreaterThan(10);
        });
    });

    describe('版本信息', () =>
    {
        test('skill 版本应该与 package.json 一致', async () =>
        {
            const projectRoot = process.cwd();
            const packageJsonPath = path.join(projectRoot, 'package.json');
            const skillJsonPath = path.join(projectRoot, '.claude-skill/skill.json');

            const packageJson = await fs.readJson(packageJsonPath);
            const skillJson = await fs.readJson(skillJsonPath);

            // 版本号应该一致
            expect(skillJson.version).toBe(packageJson.version);
        });
    });
});
