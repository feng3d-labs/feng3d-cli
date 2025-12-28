#!/usr/bin/env node
/**
 * feng3d-cli
 * feng3d 命令行工具，包含项目规范、OSS 上传等功能
 */

import fs from 'fs';
import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create.js';
import { updateProject } from './commands/update.js';
import { ossUploadDir } from './commands/oss.js';

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
    .action(async (name: string, options) =>
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
    .option('--config', '仅更新 feng3d.json 配置')
    .option('--eslint', '仅更新 ESLint 配置')
    .option('--gitignore', '仅更新 .gitignore')
    .option('--cursorrules', '仅更新 .cursorrules')
    .option('--publish', '仅更新 npm publish workflow')
    .option('--pages', '仅更新 GitHub Pages workflow')
    .option('--pull-request', '仅更新 Pull Request CI workflow')
    .option('--typedoc', '仅更新 typedoc.json')
    .option('--test', '仅更新 test/_.test.ts')
    .option('--deps', '仅更新依赖版本')
    .option('--husky', '仅更新 husky pre-commit hook')
    .option('--license', '仅更新 LICENSE 文件')
    .option('--vscode', '仅更新 .vscode/settings.json')
    .option('--tsconfig', '仅更新 tsconfig.json')
    .option('--vite', '仅更新 vite.config.js')
    .option('--all', '更新所有配置')
    .action(async (options) =>
    {
        console.log(chalk.blue('\n🔄 更新项目规范配置\n'));
        try
        {
            await updateProject(options);
            console.log(chalk.green('\n✅ 规范配置更新成功！\n'));
        }
        catch (error)
        {
            console.error(chalk.red(`\n❌ 更新失败: ${error}\n`));
            process.exit(1);
        }
    });

program
    .command('check')
    .description('检查当前项目是否符合 feng3d 规范')
    .option('-d, --directory <dir>', '项目目录', '.')
    .action(async () =>
    {
        console.log(chalk.blue('\n🔍 检查项目规范\n'));
        // TODO: 实现规范检查
        console.log(chalk.yellow('暂未实现'));
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

