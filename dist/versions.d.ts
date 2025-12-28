/**
 * feng3d 项目统一依赖版本
 */
export declare const VERSIONS: {
    readonly typescript: "5.8.3";
    readonly tslib: "^2.8.1";
    readonly eslint: "9.26.0";
    readonly '@eslint/js': "^9.0.0";
    readonly '@typescript-eslint/eslint-plugin': "8.32.1";
    readonly '@typescript-eslint/parser': "8.32.1";
    readonly 'typescript-eslint': "^8.32.1";
    readonly globals: "^14.0.0";
    readonly vitest: "^3.1.3";
    readonly '@vitest/coverage-v8': "^3.2.4";
    readonly 'happy-dom': "^20.0.11";
    readonly vite: "^6.3.5";
    readonly rimraf: "6.0.1";
    readonly 'cross-env': "7.0.3";
    readonly typedoc: "^0.28.4";
};
/**
 * 获取 devDependencies 配置
 */
export declare function getDevDependencies(options?: {
    includeVitest?: boolean;
    includeTypedoc?: boolean;
    includeCoverage?: boolean;
}): Record<string, string>;
//# sourceMappingURL=versions.d.ts.map