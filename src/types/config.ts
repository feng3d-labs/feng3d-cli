/**
 * feng3d 项目配置类型定义
 */

/**
 * ESLint 配置选项
 */
export interface EslintConfig {
    /** 是否启用 ESLint */
    enabled?: boolean;
    /** 额外需要忽略的目录 */
    ignores?: string[];
    /** 额外的规则覆盖 */
    rules?: Record<string, unknown>;
}

/**
 * Vitest 配置选项
 */
export interface VitestConfig {
    /** 是否启用 vitest */
    enabled?: boolean;
    /** 测试超时时间（0 表示无限制） */
    testTimeout?: number;
}

/**
 * TypeDoc 配置选项
 */
export interface TypedocConfig {
    /** 是否启用 typedoc */
    enabled?: boolean;
    /** 输出目录 */
    outDir?: string;
}

/**
 * OSS 上传配置
 */
export interface OssConfig {
    /** 本地目录 */
    localDir?: string;
    /** OSS 目录（默认使用 package.json 的 name） */
    ossDir?: string;
}

/**
 * 项目模板选项
 */
export interface TemplatesConfig {
    /** 是否创建示例目录 */
    examples?: boolean;
    /** 是否创建测试目录 */
    test?: boolean;
}

/**
 * 更新配置选项
 */
export interface UpdateConfig {
    /** 是否更新 feng3d.json 配置 */
    config?: boolean;
    /** 是否更新 ESLint 配置 */
    eslint?: boolean;
    /** 是否更新 .gitignore */
    gitignore?: boolean;
    /** 是否更新 .cursorrules */
    cursorrules?: boolean;
    /** 是否更新 npm publish workflow */
    publish?: boolean;
    /** 是否更新 GitHub Pages workflow */
    pages?: boolean;
    /** 是否更新 typedoc.json */
    typedoc?: boolean;
    /** 是否更新 test/_.test.ts */
    test?: boolean;
    /** 是否更新依赖版本 */
    deps?: boolean;
    /** 是否更新 husky pre-commit hook */
    husky?: boolean;
}

/**
 * feng3d 项目配置
 */
export interface Feng3dConfig {
    /** 项目名称 */
    name?: string;
    /** ESLint 配置 */
    eslint?: EslintConfig;
    /** Vitest 配置 */
    vitest?: VitestConfig;
    /** TypeDoc 配置 */
    typedoc?: TypedocConfig;
    /** OSS 配置 */
    oss?: OssConfig;
    /** 模板配置 */
    templates?: TemplatesConfig;
    /** 更新配置（指定 feng3d-cli update 时默认更新哪些项目） */
    update?: UpdateConfig;
}

/**
 * 默认更新配置（全部启用）
 */
export const DEFAULT_UPDATE_CONFIG: UpdateConfig = {
    config: true,
    eslint: true,
    gitignore: true,
    cursorrules: true,
    publish: true,
    pages: true,
    typedoc: true,
    test: true,
    deps: true,
    husky: true,
};

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Feng3dConfig = {
    eslint: {
        enabled: true,
        ignores: [],
        rules: {},
    },
    vitest: {
        enabled: true,
        testTimeout: 0,
    },
    typedoc: {
        enabled: true,
        outDir: 'public',
    },
    oss: {
        localDir: './public',
        ossDir: '',
    },
    templates: {
        examples: true,
        test: true,
    },
    update: DEFAULT_UPDATE_CONFIG,
};

