/**
 * 合并策略枚举
 */
export type MergeStrategy = 'overwrite' | 'merge' | 'skip-existing';

/**
 * 文件处理方式
 */
export type FileAction = 'overwrite' | 'merge' | 'skip';

/**
 * 更新项目选项
 */
export interface UpdateOptions
{
    /**
     * 项目目录（默认当前目录）
     */
    directory?: string;

    /**
     * 合并策略
     * - overwrite: 覆盖所有文件
     * - merge: 智能合并（默认）
     * - skip-existing: 跳过已存在的文件
     */
    mergeStrategy?: MergeStrategy;

    /**
     * 交互式模式，让用户选择要更新的部分
     */
    interactive?: boolean;

    /**
     * 预览更改而不实际修改文件
     */
    dryRun?: boolean;

    /**
     * 强制覆盖已存在的配置文件
     */
    force?: boolean;
}

/**
 * 文件更新结果
 */
export interface FileUpdateResult
{
    /**
     * 文件路径（相对于项目根目录）
     */
    filePath: string;

    /**
     * 执行的操作
     */
    action: 'created' | 'updated' | 'merged' | 'skipped';

    /**
     * 操作说明
     */
    message?: string;
}

/**
 * 更新报告
 */
export interface UpdateReport
{
    /**
     * 已更新的文件
     */
    updated: FileUpdateResult[];

    /**
     * 已创建的文件
     */
    created: FileUpdateResult[];

    /**
     * 已跳过的文件
     */
    skipped: FileUpdateResult[];

    /**
     * 需要手动处理的项目
     */
    manualActions: string[];
}
