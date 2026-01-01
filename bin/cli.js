#!/usr/bin/env node
/**
 * feng3d-cli
 * feng3d 命令行工具，包含项目规范、OSS 上传等功能
 */

import fs from 'fs';
import { Command } from 'commander';
import chalk from 'chalk';
import { createProject, updateProject, ossUploadDir } from '../dist/index.js';

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
    .command('oss_upload_dir')
    .description('上传文件夹到阿里云 OSS')
    .option('-l, --local_dir <string>', '本地目录', './public')
    .option('-o, --oss_dir <string>', 'OSS 目录', '')
    .action(async (options) =>
    {
        const localDir = options.local_dir;
        let ossDir = options.oss_dir;

        if (!fs.existsSync(localDir))
        {
            console.log(chalk.red(`\n❌ 本地目录 ${localDir} 不存在!\n`));

            return;
        }

        if (!ossDir)
        {
            // 获取当前目录下 package.json 的 name 字段
            try
            {
                const packageJson = fs.readFileSync('package.json', 'utf-8');
                const packageJsonObj = JSON.parse(packageJson);

                ossDir = packageJsonObj.name.split('/').pop();
            }
            catch
            {
                console.log(chalk.red('\n❌ 无法读取 package.json 获取项目名称\n'));

                return;
            }
        }

        console.log(chalk.blue(`\n📤 上传文件夹到阿里云 OSS: ${localDir} -> ${ossDir}\n`));

        try
        {
            await ossUploadDir(localDir, ossDir);
            console.log(chalk.green('\n✅ 上传完成！\n'));
        }
        catch (error)
        {
            console.error(chalk.red(`\n❌ 上传失败: ${error}\n`));
            process.exit(1);
        }
    });

program.parse();
