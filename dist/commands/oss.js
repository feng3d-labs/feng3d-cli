/**
 * OSS 上传命令
 */
import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
// 定义 JSON 配置文件的路径
const configPath = 'C:/Users/Administrator/oss_config.json';
/**
 * 将本地目录中的所有文件上传到指定的 OSS 目录中。
 *
 * @param localDirPath - 本地目录的路径，包含需要上传的文件。
 * @param ossDirPath - OSS 目录的路径，文件将被上传到此目录。
 */
export async function ossUploadDir(localDirPath, ossDirPath) {
    // 读取配置文件以获取 OSS 相关的配置信息
    const config = readConfig(configPath);
    if (!config) {
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
    if (failureCount > 0) {
        console.log('上传失败的文件列表:');
        failedFiles.forEach((file) => console.log(file));
    }
}
/**
 * 读取并解析 JSON 配置文件
 */
function readConfig(filePath) {
    try {
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 解析 JSON 内容
        const config = JSON.parse(fileContent);
        return config;
    }
    catch (error) {
        console.error('读取或解析配置文件时出错:', error);
        return null;
    }
}
/**
 * 初始化 OSS 客户端
 */
function initializeOSS(config) {
    return new OSS({
        region: config.region,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.bucket,
    });
}
/**
 * 计算文件夹中所有需要上传的文件以及需要上传的地址
 */
function collectFiles(dirPath, ossDirPath) {
    const files = [];
    const failedFiles = [];
    function traverseDirectory(currentDirPath, currentOssPath) {
        const items = fs.readdirSync(currentDirPath);
        for (const item of items) {
            const localFilePath = path.join(currentDirPath, item);
            const ossFilePath = `${currentOssPath}/${item}`;
            if (fs.statSync(localFilePath).isDirectory()) {
                traverseDirectory(localFilePath, ossFilePath);
            }
            else {
                files.push({ localFilePath, ossFilePath });
            }
        }
    }
    traverseDirectory(dirPath, ossDirPath);
    return { files, failedFiles };
}
/**
 * 执行上传一系列文件
 */
async function uploadFiles(files, client, failedFiles) {
    let successCount = 0;
    let failureCount = 0;
    let uploadedCount = 0;
    for (const { localFilePath, ossFilePath } of files) {
        try {
            // 上传文件
            await client.put(ossFilePath, localFilePath);
            successCount++;
        }
        catch (e) {
            console.error(`文件上传失败: ${localFilePath}`, e);
            failedFiles.push(localFilePath);
            failureCount++;
        }
        uploadedCount++;
        console.log(`上传进度: ${uploadedCount}/${files.length}`);
    }
    return { successCount, failureCount, uploadedCount };
}
//# sourceMappingURL=oss.js.map