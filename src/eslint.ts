/**
 * feng3d ESLint 配置
 */

// 注意：实际使用时需要安装这些依赖
type ESLintConfig = any;

/**
 * 创建 ESLint 配置
 * @param options 配置选项
 */
export function createEslintConfig(options: {
    /** 额外需要忽略的目录 */
    ignores?: string[];
    /** 额外的规则 */
    rules?: Record<string, unknown>;
} = {}): ESLintConfig[]
{
    // 这个函数在运行时需要导入 eslint 相关模块
    // 返回配置数组
    return [
        // 忽略检查的文件和目录
        {
            ignores: [
                '**/node_modules/**',
                '**/dist/**',
                '**/lib/**',
                '**/public/**',
                '**/coverage/**',
                '**/.git/**',
                ...(options.ignores || []),
            ],
        },
    ];
}

/**
 * 默认 ESLint 规则配置
 */
export const eslintRules = {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-const': 'off',
    'no-fallthrough': 'off',
    'no-constant-binary-expression': 'off',

    // 注释格式规则
    'spaced-comment': ['warn', 'always', {
        line: {
            markers: ['/'],
            exceptions: ['-', '+'],
        },
        block: {
            markers: ['!'],
            exceptions: ['*'],
            balanced: true,
        },
    }],

    // 空格和换行规则
    'no-trailing-spaces': ['warn', {
        skipBlankLines: false,
        ignoreComments: false,
    }],
    'no-multiple-empty-lines': ['warn', {
        max: 1,
        maxEOF: 1,
        maxBOF: 0,
    }],
    'lines-between-class-members': ['warn', 'always', {
        exceptAfterSingleLine: true,
    }],
    'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    ],

    // 缩进规则 - 使用 4 空格
    indent: ['warn', 4, {
        SwitchCase: 1,
        VariableDeclarator: 'first',
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false,
    }],

    // 引号规则 - 使用单引号
    quotes: ['warn', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: true,
    }],

    // 其他格式规则
    semi: ['off'],
    'comma-dangle': ['warn', 'always-multiline'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'arrow-spacing': ['warn', { before: true, after: true }],
    'block-spacing': ['warn', 'always'],
    'comma-spacing': ['warn', { before: false, after: true }],
    'comma-style': ['warn', 'last'],
    'key-spacing': ['warn', { beforeColon: false, afterColon: true }],
    'keyword-spacing': ['warn', { before: true, after: true }],
    'space-before-blocks': ['warn', 'always'],
    'space-before-function-paren': ['warn', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
    }],
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': ['warn'],
    'space-unary-ops': ['warn', { words: true, nonwords: false }],
} as const;

/**
 * 预构建的 ESLint 配置（用于直接导出使用）
 */
export const eslintConfig = {
    rules: eslintRules,
};

