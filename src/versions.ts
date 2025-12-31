/**
 * feng3d 项目统一依赖版本
 * 从 templates/package.json 中读取
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 模板目录路径
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

/**
 * 从模板 package.json 中读取 devDependencies
 */
function loadVersionsFromTemplate(): Record<string, string>
{
    const packageJsonPath = path.join(TEMPLATES_DIR, 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);

    return packageJson.devDependencies || {};
}

/**
 * 统一依赖版本（从 templates/package.json 读取）
 */
export const VERSIONS = loadVersionsFromTemplate();

/**
 * 获取 devDependencies 配置
 */
export function getDevDependencies(options: {
    includeVitest?: boolean;
    includeTypedoc?: boolean;
    includeCoverage?: boolean;
} = {}): Record<string, string>
{
    // 从 VERSIONS 中复制所有依赖
    const deps: Record<string, string> = { ...VERSIONS };

    // 根据选项移除可选依赖
    if (options.includeVitest === false)
    {
        delete deps.vitest;
    }

    if (options.includeTypedoc === false)
    {
        delete deps.typedoc;
    }

    // 可选添加覆盖率依赖（默认不包含）
    if (options.includeCoverage && !deps['@vitest/coverage-v8'])
    {
        deps['@vitest/coverage-v8'] = '^3.2.4';
    }

    return deps;
}
