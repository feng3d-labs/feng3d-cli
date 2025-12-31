/**
 * OSS 上传命令
 */

import OSS from 'ali-oss';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 定义 JSON 配置文件的路径（用户目录下的 oss_config.json）
const configPath = path.join(os.homedir(), 'oss_config.json');

/**
 * 将本地目录中的所有文件上传到指定的 OSS 目录中。
 *
 * @param localDirPath - 本地目录的路径，包含需要上传的文件。
 * @param ossDirPath - OSS 目录的路径，文件将被上传到此目录。
 */
export async function ossUploadDir(localDirPath: string, ossDirPath: string): Promise<void>
{
    // 读取配置文件以获取 OSS 相关的配置信息
    const config = readConfig(configPath);

    if (!config)
    {
        console.error('无法读取配置文件');

        return;
    }

    // 根据配置初始化 OSS 客户端
    const client = initializeOSS(config);

    // 收集本地目录中所有需要上传的文件，并计算它们在 OSS 中的目标路径
    const { files, failedFiles } = collectFiles(localDirPath, ossDirPath);

    console.log(`总文件数: ${files.length}`);

    // 执行文件上传操作，并统计成功和失败的文件数量
    const { successCount, failureCount } = await uploadFiles(files, client, failedFiles);

    console.log(`上传完成: 成功 ${successCount} 个, 失败 ${failureCount} 个`);
    if (failureCount > 0)
    {
        console.log('上传失败的文件列表:');
        failedFiles.forEach((file) => console.log(file));
    }

    // 打印访问路径
    if (successCount > 0)
    {
        const baseUrl = config.baseUrl || `https://${config.bucket}.${config.region}.aliyuncs.com`;
        const accessUrl = `${baseUrl}/${ossDirPath}/`;

        console.log(`\n📎 访问路径: ${accessUrl}`);
    }
}

/**
 * 读取并解析 JSON 配置文件
 */
function readConfig(filePath: fs.PathOrFileDescriptor): OSSConfig | null
{
    try
    {
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 解析 JSON 内容
        const config = JSON.parse(fileContent);

        return config;
    }
    catch (error)
    {
        console.error('读取或解析配置文件时出错:', error);

        return null;
    }
}

interface OSSConfig {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    /** 自定义访问域名，如 https://feng3d.com */
    baseUrl?: string;
}

/**
 * 初始化 OSS 客户端
 */
function initializeOSS(config: OSSConfig): OSS
{
    return new OSS({
        region: config.region,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.bucket,
    });
}

interface FileInfo {
    localFilePath: string;
    ossFilePath: string;
}

/**
 * 计算文件夹中所有需要上传的文件以及需要上传的地址
 */
function collectFiles(dirPath: string, ossDirPath: string): { files: FileInfo[]; failedFiles: string[] }
{
    const files: FileInfo[] = [];
    const failedFiles: string[] = [];

    function traverseDirectory(currentDirPath: string, currentOssPath: string): void
    {
        const items = fs.readdirSync(currentDirPath);

        for (const item of items)
        {
            const localFilePath = path.join(currentDirPath, item);
            const ossFilePath = `${currentOssPath}/${item}`;

            if (fs.statSync(localFilePath).isDirectory())
            {
                traverseDirectory(localFilePath, ossFilePath);
            }
            else
            {
                files.push({ localFilePath, ossFilePath });
            }
        }
    }

    traverseDirectory(dirPath, ossDirPath);

    return { files, failedFiles };
}

/**
 * 渲染进度条
 */
function renderProgressBar(current: number, total: number, barLength = 30): string
{
    const percent = current / total;
    const filled = Math.round(barLength * percent);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percentText = (percent * 100).toFixed(0).padStart(3, ' ');

    return `[${bar}] ${percentText}% (${current}/${total})`;
}

/**
 * 执行上传一系列文件
 */
async function uploadFiles(
    files: FileInfo[],
    client: OSS,
    failedFiles: string[],
): Promise<{ successCount: number; failureCount: number; uploadedCount: number }>
{
    let successCount = 0;
    let failureCount = 0;
    let uploadedCount = 0;
    const total = files.length;

    // 显示初始进度条
    process.stdout.write(`上传进度: ${renderProgressBar(0, total)}`);

    for (const { localFilePath, ossFilePath } of files)
    {
        try
        {
            // 上传文件
            await client.put(ossFilePath, localFilePath);
            successCount++;
        }
        catch (e)
        {
            // 换行后打印错误，再重新显示进度条
            process.stdout.write('\n');
            console.error(`文件上传失败: ${localFilePath}`, e);
            failedFiles.push(localFilePath);
            failureCount++;
        }
        uploadedCount++;
        // 使用 \r 回到行首更新进度条
        process.stdout.write(`\r上传进度: ${renderProgressBar(uploadedCount, total)}`);
    }

    // 完成后换行
    process.stdout.write('\n');

    return { successCount, failureCount, uploadedCount };
}

