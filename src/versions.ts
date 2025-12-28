/**
 * feng3d 项目统一依赖版本
 */
export const VERSIONS = {
    // TypeScript 相关
    typescript: '5.8.3',
    tslib: '^2.8.1',

    // ESLint 相关
    eslint: '9.26.0',
    '@eslint/js': '^9.0.0',
    '@typescript-eslint/eslint-plugin': '8.32.1',
    '@typescript-eslint/parser': '8.32.1',
    'typescript-eslint': '^8.32.1',
    globals: '^14.0.0',

    // 测试相关
    vitest: '^3.1.3',
    '@vitest/coverage-v8': '^3.2.4',
    'happy-dom': '^20.0.11',

    // 构建工具
    vite: '^6.3.5',
    rimraf: '6.0.1',
    'cross-env': '7.0.3',

    // 文档
    typedoc: '^0.28.4',

    // Git hooks
    husky: '^9.1.7',
    'lint-staged': '^15.2.10',
} as const;

/**
 * 获取 devDependencies 配置
 */
export function getDevDependencies(options: {
    includeVitest?: boolean;
    includeTypedoc?: boolean;
    includeCoverage?: boolean;
} = {}): Record<string, string>
{
    const deps: Record<string, string> = {
        '@eslint/js': VERSIONS['@eslint/js'],
        '@typescript-eslint/eslint-plugin': VERSIONS['@typescript-eslint/eslint-plugin'],
        '@typescript-eslint/parser': VERSIONS['@typescript-eslint/parser'],
        'cross-env': VERSIONS['cross-env'],
        eslint: VERSIONS.eslint,
        globals: VERSIONS.globals,
        rimraf: VERSIONS.rimraf,
        tslib: VERSIONS.tslib,
        typescript: VERSIONS.typescript,
        'typescript-eslint': VERSIONS['typescript-eslint'],
        vite: VERSIONS.vite,
    };

    if (options.includeVitest !== false)
    {
        deps.vitest = VERSIONS.vitest;
    }

    if (options.includeCoverage)
    {
        deps['@vitest/coverage-v8'] = VERSIONS['@vitest/coverage-v8'];
    }

    if (options.includeTypedoc !== false)
    {
        deps.typedoc = VERSIONS.typedoc;
    }

    // 默认包含 husky 和 lint-staged
    deps.husky = VERSIONS.husky;
    deps['lint-staged'] = VERSIONS['lint-staged'];

    return deps;
}

