/**
 * 创建新项目命令
 */
export interface CreateOptions {
    directory: string;
    examples?: boolean;
    vitest?: boolean;
}
/**
 * 创建符合 feng3d 规范的新项目
 */
export declare function createProject(name: string, options: CreateOptions): Promise<void>;
//# sourceMappingURL=create.d.ts.map