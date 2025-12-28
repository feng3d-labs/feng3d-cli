/**
 * feng3d 项目配置文件
 * 用于自定义项目规范和 CLI 行为
 */

export default {
    /**
     * 项目名称
     */
    name: 'feng3d-cli',

    /**
     * ESLint 配置选项
     */
    eslint: {
        /** 是否启用 ESLint */
        enabled: true,
        /** 额外需要忽略的目录 */
        ignores: [],
        /** 额外的规则覆盖 */
        rules: {},
    },

    /**
     * 测试配置选项
     */
    vitest: {
        /** 是否启用 vitest */
        enabled: true,
        /** 测试超时时间（0 表示无限制） */
        testTimeout: 0,
    },

    /**
     * 文档配置选项
     */
    typedoc: {
        /** 是否启用 typedoc */
        enabled: true,
        /** 输出目录 */
        outDir: 'public/docs',
    },

    /**
     * OSS 上传配置
     */
    oss: {
        /** 本地目录 */
        localDir: './public',
        /** OSS 目录（默认使用 package.json 的 name） */
        ossDir: '',
    },

    /**
     * 项目模板选项
     */
    templates: {
        /** 是否创建示例目录 */
        examples: true,
        /** 是否创建测试目录 */
        test: true,
    },
};

