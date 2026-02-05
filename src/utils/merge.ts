/**
 * 配置文件智能合并工具
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import type { FileAction, MergeStrategy } from '../types.js';

/**
 * 深度合并两个对象
 * @param target 目标对象（用户配置）
 * @param source 源对象（标准配置）
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: T): T
{
    const result = { ...target };

    for (const key in source)
    {
        if (Object.prototype.hasOwnProperty.call(source, key))
        {
            const sourceValue = source[key];
            const targetValue = result[key];

            // 如果源值是对象且目标值也是对象，递归合并
            if (
                sourceValue
                && typeof sourceValue === 'object'
                && !Array.isArray(sourceValue)
                && targetValue
                && typeof targetValue === 'object'
                && !Array.isArray(targetValue)
            )
            {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            // 如果目标中不存在该键，添加源值
            else if (!(key in result))
            {
                result[key] = sourceValue;
            }
            // 否则保留目标值（用户配置优先）
        }
    }

    return result;
}

/**
 * 合并 JSON 配置文件
 * @param existingPath 现有文件路径
 * @param standardContent 标准配置内容（字符串）
 * @returns 合并后的内容
 */
export async function mergeJsonConfig(existingPath: string, standardContent: string): Promise<string>
{
    // 读取现有文件
    const existingContent = await fs.readFile(existingPath, 'utf-8');
    const existingJson = JSON.parse(existingContent);
    const standardJson = JSON.parse(standardContent);

    // 检测缩进
    const indent = detectIndent(existingContent);
    const hasTrailingNewline = existingContent.endsWith('\n');

    // 深度合并
    const merged = deepMerge(existingJson, standardJson);

    // 生成 JSON 字符串
    let result = JSON.stringify(merged, null, indent);

    if (hasTrailingNewline)
    {
        result += '\n';
    }

    return result;
}

/**
 * 检测 JSON 文件的缩进风格
 */
export function detectIndent(content: string): string
{
    const match = content.match(/^[ \t]+/m);

    return match ? match[0] : '    ';
}

/**
 * 根据合并策略决定文件处理方式
 * @param filePath 文件路径
 * @param mergeStrategy 合并策略
 * @returns 文件处理方式
 */
export async function determineFileAction(
    filePath: string,
    mergeStrategy: MergeStrategy,
): Promise<FileAction>
{
    const exists = await fs.pathExists(filePath);

    if (!exists)
    {
        return 'overwrite'; // 文件不存在，直接创建
    }

    switch (mergeStrategy)
    {
        case 'overwrite':
            return 'overwrite';
        case 'skip-existing':
            return 'skip';
        case 'merge':
        default:
        {
            // 对于可合并的文件（JSON），返回 merge
            // 对于其他文件，返回 overwrite
            const ext = path.extname(filePath);

            if (ext === '.json')
            {
                return 'merge';
            }

            return 'overwrite';
        }
    }
}

/**
 * 交互式询问用户如何处理文件
 * @param filePath 文件路径（相对路径，用于显示）
 * @returns 用户选择的处理方式
 */
export async function askFileAction(filePath: string): Promise<FileAction>
{
    const readline = await import('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
    {
        console.log(chalk.yellow(`\n文件已存在: ${filePath}`));
        console.log('请选择处理方式:');
        console.log('  1. 覆盖 (overwrite) - 完全使用标准配置');
        console.log('  2. 合并 (merge) - 保留用户配置，添加缺失项');
        console.log('  3. 跳过 (skip) - 不修改该文件');

        rl.question('请输入选项 (1/2/3，默认 2): ', (answer) =>
        {
            rl.close();

            switch (answer.trim())
            {
                case '1':
                    resolve('overwrite');
                    break;
                case '3':
                    resolve('skip');
                    break;
                case '2':
                case '':
                default:
                    resolve('merge');
                    break;
            }
        });
    });
}

/**
 * 写入文件内容（支持 dry-run）
 * @param filePath 文件路径
 * @param content 内容
 * @param dryRun 是否为预览模式
 */
export async function writeFileContent(
    filePath: string,
    content: string,
    dryRun: boolean = false,
): Promise<void>
{
    if (dryRun)
    {
        console.log(chalk.gray(`  [预览] 将写入: ${filePath}`));

        return;
    }

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
}

/**
 * 处理文件更新
 * @param filePath 文件完整路径
 * @param standardContent 标准配置内容
 * @param action 处理方式
 * @param dryRun 是否为预览模式
 * @returns 是否执行了操作
 */
export async function handleFileUpdate(
    filePath: string,
    standardContent: string,
    action: FileAction,
    dryRun: boolean = false,
): Promise<boolean>
{
    const exists = await fs.pathExists(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    switch (action)
    {
        case 'skip':
            console.log(chalk.yellow(`  跳过: ${relativePath}`));

            return false;

        case 'merge':
            if (!exists)
            {
                // 文件不存在，直接创建
                await writeFileContent(filePath, standardContent, dryRun);
                console.log(chalk.gray(`  创建: ${relativePath}`));

                return true;
            }

            // 尝试合并（目前仅支持 JSON）
            try
            {
                const ext = path.extname(filePath);

                if (ext === '.json')
                {
                    const merged = await mergeJsonConfig(filePath, standardContent);

                    await writeFileContent(filePath, merged, dryRun);
                    console.log(chalk.blue(`  合并: ${relativePath}`));

                    return true;
                }
                // 非 JSON 文件，回退到覆盖
                await writeFileContent(filePath, standardContent, dryRun);
                console.log(chalk.gray(`  更新: ${relativePath}`));

                return true;
            }
            catch (error)
            {
                console.log(chalk.red(`  合并失败，跳过: ${relativePath}`));
                console.log(chalk.red(`    错误: ${error}`));

                return false;
            }

        case 'overwrite':
        default:
            await writeFileContent(filePath, standardContent, dryRun);
            if (exists)
            {
                console.log(chalk.gray(`  更新: ${relativePath}`));
            }
            else
            {
                console.log(chalk.gray(`  创建: ${relativePath}`));
            }

            return true;
    }
}
