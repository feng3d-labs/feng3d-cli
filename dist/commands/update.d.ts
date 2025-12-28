/**
 * 更新项目规范命令
 */
export interface UpdateOptions {
    directory: string;
    eslint?: boolean;
    gitignore?: boolean;
    cursorrules?: boolean;
    deps?: boolean;
    all?: boolean;
}
/**
 * 更新项目的规范配置
 */
export declare function updateProject(options: UpdateOptions): Promise<void>;
/**
 * 创建 ESLint 配置文件
 */
export declare function createEslintConfigFile(projectDir: string): Promise<void>;
//# sourceMappingURL=update.d.ts.map