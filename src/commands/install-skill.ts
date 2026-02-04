import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 安装 Claude Code Skill
 */
export async function installSkill()
{
    try
    {
        // 获取用户主目录
        const homeDir = os.homedir();
        const claudeSkillsDir = path.join(homeDir, '.claude', 'skills', 'feng3d');

        // 获取 .claude-skill 源目录
        // 尝试多个可能的路径
        const possiblePaths = [
            // 从当前文件位置向上查找（开发环境）
            path.resolve(__dirname, '../../.claude-skill'),
            path.resolve(__dirname, '../../../.claude-skill'),
            path.resolve(__dirname, '../.claude-skill'),
            // 从 package.json 所在目录查找
            path.resolve(process.cwd(), '.claude-skill'),
            // 从 node_modules 查找（全局安装）
            path.resolve(__dirname, '../../../../feng3d-cli/.claude-skill'),
        ];

        let sourceDir = '';

        for (const tryPath of possiblePaths)
        {
            if (fs.existsSync(path.join(tryPath, 'skill.json')))
            {
                sourceDir = tryPath;
                break;
            }
        }

        if (!sourceDir)
        {
            console.error(chalk.red('❌ 错误：找不到 .claude-skill 目录'));
            console.log(chalk.yellow('尝试的路径：'));
            possiblePaths.forEach((p) => console.log(`  - ${p}`));
            console.log(chalk.yellow('\n请确保 feng3d-cli 已正确安装'));
            process.exit(1);
        }

        // 检查 skill.json 是否存在
        if (!fs.existsSync(path.join(sourceDir, 'skill.json')))
        {
            console.error(chalk.red('❌ 错误：.claude-skill/skill.json 不存在'));
            process.exit(1);
        }

        // 创建目标目录
        console.log(chalk.blue('\n📦 开始安装 feng3d Claude Code Skill...\n'));

        // 检查是否已安装
        if (fs.existsSync(claudeSkillsDir))
        {
            console.log(chalk.yellow('⚠️  检测到已安装的 skill，将进行覆盖更新...'));
            await fs.remove(claudeSkillsDir);
        }

        // 确保父目录存在
        await fs.ensureDir(path.dirname(claudeSkillsDir));

        // 复制 skill 文件
        console.log(chalk.blue('📂 复制 skill 文件...'));
        await fs.copy(sourceDir, claudeSkillsDir, {
            overwrite: true,
            errorOnExist: false,
        });

        // 验证安装
        if (fs.existsSync(path.join(claudeSkillsDir, 'skill.json')))
        {
            console.log(chalk.green('\n✅ feng3d Skill 安装成功！\n'));
            console.log(chalk.cyan(`安装位置: ${claudeSkillsDir}\n`));
            console.log(chalk.yellow('使用方法:'));
            console.log('  /feng3d create my-project');
            console.log('  /feng3d update\n');
            console.log(chalk.yellow('或直接对话: "用 feng3d 创建一个新项目"\n'));
            console.log(chalk.cyan('💡 提示: 可能需要重启 Claude Code 使 skill 生效\n'));
        }
        else
        {
            console.error(chalk.red('\n❌ 安装失败：无法验证安装结果\n'));
            process.exit(1);
        }
    }
    catch (error)
    {
        console.error(chalk.red(`\n❌ 安装失败: ${error}\n`));
        process.exit(1);
    }
}
