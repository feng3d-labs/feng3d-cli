/**
 * feng3d ESLint 配置
 */
type ESLintConfig = any;
/**
 * 创建 ESLint 配置
 * @param options 配置选项
 */
export declare function createEslintConfig(options?: {
    /** 额外需要忽略的目录 */
    ignores?: string[];
    /** 额外的规则 */
    rules?: Record<string, unknown>;
}): ESLintConfig[];
/**
 * 默认 ESLint 规则配置
 */
export declare const eslintRules: {
    readonly '@typescript-eslint/no-unused-vars': "off";
    readonly '@typescript-eslint/no-explicit-any': "off";
    readonly 'no-prototype-builtins': "off";
    readonly '@typescript-eslint/ban-ts-comment': "off";
    readonly '@typescript-eslint/no-unused-expressions': "off";
    readonly '@typescript-eslint/no-empty-object-type': "off";
    readonly '@typescript-eslint/no-unsafe-declaration-merging': "off";
    readonly '@typescript-eslint/no-unsafe-function-type': "off";
    readonly '@typescript-eslint/no-this-alias': "off";
    readonly 'prefer-const': "off";
    readonly 'no-fallthrough': "off";
    readonly 'no-constant-binary-expression': "off";
    readonly 'spaced-comment': readonly ["warn", "always", {
        readonly line: {
            readonly markers: readonly ["/"];
            readonly exceptions: readonly ["-", "+"];
        };
        readonly block: {
            readonly markers: readonly ["!"];
            readonly exceptions: readonly ["*"];
            readonly balanced: true;
        };
    }];
    readonly 'no-trailing-spaces': readonly ["warn", {
        readonly skipBlankLines: false;
        readonly ignoreComments: false;
    }];
    readonly 'no-multiple-empty-lines': readonly ["warn", {
        readonly max: 1;
        readonly maxEOF: 1;
        readonly maxBOF: 0;
    }];
    readonly 'lines-between-class-members': readonly ["warn", "always", {
        readonly exceptAfterSingleLine: true;
    }];
    readonly 'padding-line-between-statements': readonly ["warn", {
        readonly blankLine: "always";
        readonly prev: "*";
        readonly next: "return";
    }, {
        readonly blankLine: "any";
        readonly prev: readonly ["const", "let", "var"];
        readonly next: readonly ["const", "let", "var"];
    }];
    readonly indent: readonly ["warn", 4, {
        readonly SwitchCase: 1;
        readonly VariableDeclarator: "first";
        readonly outerIIFEBody: 1;
        readonly MemberExpression: 1;
        readonly FunctionDeclaration: {
            readonly parameters: 1;
            readonly body: 1;
        };
        readonly FunctionExpression: {
            readonly parameters: 1;
            readonly body: 1;
        };
        readonly CallExpression: {
            readonly arguments: 1;
        };
        readonly ArrayExpression: 1;
        readonly ObjectExpression: 1;
        readonly ImportDeclaration: 1;
        readonly flatTernaryExpressions: false;
        readonly ignoreComments: false;
    }];
    readonly quotes: readonly ["warn", "single", {
        readonly avoidEscape: true;
        readonly allowTemplateLiterals: true;
    }];
    readonly semi: readonly ["off"];
    readonly 'comma-dangle': readonly ["warn", "always-multiline"];
    readonly 'object-curly-spacing': readonly ["warn", "always"];
    readonly 'array-bracket-spacing': readonly ["warn", "never"];
    readonly 'arrow-spacing': readonly ["warn", {
        readonly before: true;
        readonly after: true;
    }];
    readonly 'block-spacing': readonly ["warn", "always"];
    readonly 'comma-spacing': readonly ["warn", {
        readonly before: false;
        readonly after: true;
    }];
    readonly 'comma-style': readonly ["warn", "last"];
    readonly 'key-spacing': readonly ["warn", {
        readonly beforeColon: false;
        readonly afterColon: true;
    }];
    readonly 'keyword-spacing': readonly ["warn", {
        readonly before: true;
        readonly after: true;
    }];
    readonly 'space-before-blocks': readonly ["warn", "always"];
    readonly 'space-before-function-paren': readonly ["warn", {
        readonly anonymous: "always";
        readonly named: "never";
        readonly asyncArrow: "always";
    }];
    readonly 'space-in-parens': readonly ["warn", "never"];
    readonly 'space-infix-ops': readonly ["warn"];
    readonly 'space-unary-ops': readonly ["warn", {
        readonly words: true;
        readonly nonwords: false;
    }];
};
/**
 * 预构建的 ESLint 配置（用于直接导出使用）
 */
export declare const eslintConfig: {
    rules: {
        readonly '@typescript-eslint/no-unused-vars': "off";
        readonly '@typescript-eslint/no-explicit-any': "off";
        readonly 'no-prototype-builtins': "off";
        readonly '@typescript-eslint/ban-ts-comment': "off";
        readonly '@typescript-eslint/no-unused-expressions': "off";
        readonly '@typescript-eslint/no-empty-object-type': "off";
        readonly '@typescript-eslint/no-unsafe-declaration-merging': "off";
        readonly '@typescript-eslint/no-unsafe-function-type': "off";
        readonly '@typescript-eslint/no-this-alias': "off";
        readonly 'prefer-const': "off";
        readonly 'no-fallthrough': "off";
        readonly 'no-constant-binary-expression': "off";
        readonly 'spaced-comment': readonly ["warn", "always", {
            readonly line: {
                readonly markers: readonly ["/"];
                readonly exceptions: readonly ["-", "+"];
            };
            readonly block: {
                readonly markers: readonly ["!"];
                readonly exceptions: readonly ["*"];
                readonly balanced: true;
            };
        }];
        readonly 'no-trailing-spaces': readonly ["warn", {
            readonly skipBlankLines: false;
            readonly ignoreComments: false;
        }];
        readonly 'no-multiple-empty-lines': readonly ["warn", {
            readonly max: 1;
            readonly maxEOF: 1;
            readonly maxBOF: 0;
        }];
        readonly 'lines-between-class-members': readonly ["warn", "always", {
            readonly exceptAfterSingleLine: true;
        }];
        readonly 'padding-line-between-statements': readonly ["warn", {
            readonly blankLine: "always";
            readonly prev: "*";
            readonly next: "return";
        }, {
            readonly blankLine: "any";
            readonly prev: readonly ["const", "let", "var"];
            readonly next: readonly ["const", "let", "var"];
        }];
        readonly indent: readonly ["warn", 4, {
            readonly SwitchCase: 1;
            readonly VariableDeclarator: "first";
            readonly outerIIFEBody: 1;
            readonly MemberExpression: 1;
            readonly FunctionDeclaration: {
                readonly parameters: 1;
                readonly body: 1;
            };
            readonly FunctionExpression: {
                readonly parameters: 1;
                readonly body: 1;
            };
            readonly CallExpression: {
                readonly arguments: 1;
            };
            readonly ArrayExpression: 1;
            readonly ObjectExpression: 1;
            readonly ImportDeclaration: 1;
            readonly flatTernaryExpressions: false;
            readonly ignoreComments: false;
        }];
        readonly quotes: readonly ["warn", "single", {
            readonly avoidEscape: true;
            readonly allowTemplateLiterals: true;
        }];
        readonly semi: readonly ["off"];
        readonly 'comma-dangle': readonly ["warn", "always-multiline"];
        readonly 'object-curly-spacing': readonly ["warn", "always"];
        readonly 'array-bracket-spacing': readonly ["warn", "never"];
        readonly 'arrow-spacing': readonly ["warn", {
            readonly before: true;
            readonly after: true;
        }];
        readonly 'block-spacing': readonly ["warn", "always"];
        readonly 'comma-spacing': readonly ["warn", {
            readonly before: false;
            readonly after: true;
        }];
        readonly 'comma-style': readonly ["warn", "last"];
        readonly 'key-spacing': readonly ["warn", {
            readonly beforeColon: false;
            readonly afterColon: true;
        }];
        readonly 'keyword-spacing': readonly ["warn", {
            readonly before: true;
            readonly after: true;
        }];
        readonly 'space-before-blocks': readonly ["warn", "always"];
        readonly 'space-before-function-paren': readonly ["warn", {
            readonly anonymous: "always";
            readonly named: "never";
            readonly asyncArrow: "always";
        }];
        readonly 'space-in-parens': readonly ["warn", "never"];
        readonly 'space-infix-ops': readonly ["warn"];
        readonly 'space-unary-ops': readonly ["warn", {
            readonly words: true;
            readonly nonwords: false;
        }];
    };
};
export {};
//# sourceMappingURL=eslint.d.ts.map