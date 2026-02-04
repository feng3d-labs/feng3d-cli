#!/usr/bin/env node
/**
 * feng3d-cli
 * feng3d 命令行工具，包含项目规范、OSS 上传等功能
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject, updateProject, installSkill } from '../dist/index.js';

const program = new Command();

program
    .name('feng3d-cli')
    .description('feng3d 命令行工具')
    .version('0.0.1');

program
    .command('create <name>')
    .description('创建符合 feng3d 规范的新项目')
    .option('-d, --directory <dir>', '项目目录', '.')
    .option('--no-examples', '不创建示例目录')
    .option('--no-vitest', '不包含 vitest 测试配置')
    .action(async (name, options) =>
    {
        console.log(chalk.blue(`\n🚀 创建项目: ${name}\n`));
        try
        {
            await createProject(name, options);
            console.log(chalk.green(`\n✅ 项目 ${name} 创建成功！\n`));
        }
        catch (error)
        {
            console.error(chalk.red(`\n❌ 创建失败: ${error}\n`));
            process.exit(1);
        }
    });

program
    .command('update')
    .description('更新当前项目的规范配置')
    .option('-d, --directory <dir>', '项目目录', '.')
    .action(async (options) =>
    {
        console.log(chalk.blue('\n🔄 更新项目规范配置\n'));
        try
        {
            await updateProject(options.directory);
            console.log(chalk.green('\n✅ 规范配置更新成功！\n'));
        }
        catch (error)
        {
            console.error(chalk.red(`\n❌ 更新失败: ${error}\n`));
            process.exit(1);
        }
    });

program
    .command('install-skill')
    .alias('skill')
    .description('安装 feng3d Claude Code Skill')
    .action(async () =>
    {
        try
        {
            await installSkill();
        }
        catch (error)
        {
            console.error(chalk.red(`\n❌ 安装失败: ${error}\n`));
            process.exit(1);
        }
    });

program.parse();
