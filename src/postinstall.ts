/**
 * postinstall 脚本
 * 当用户项目安装 feng3d-cli 后自动执行更新
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// INIT_CWD 是 npm install 执行时的目录（用户项目目录）
const projectDir = process.env.INIT_CWD;

// 如果没有 INIT_CWD，说明不是通过 npm install 安装的
if (!projectDir)
{
    process.exit(0);
}

// 检查是否是 feng3d-cli 自身的安装（开发环境）
const packageJsonPath = path.join(projectDir, 'package.json');

if (fs.existsSync(packageJsonPath))
{
    try
    {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // 如果是 feng3d-cli 自身，跳过
        if (packageJson.name === 'feng3d-cli')
        {
            process.exit(0);
        }
    }
    catch
    {
        // 忽略解析错误
    }
}

// 执行更新命令
try
{
    console.log('feng3d-cli: 正在更新项目配置...');
    execSync('npx feng3d-cli update', {
        cwd: projectDir,
        stdio: 'inherit',
    });
}
catch
{
    // 更新失败不影响安装
    console.log('feng3d-cli: 更新配置失败，可手动执行 npx feng3d-cli update');
}

