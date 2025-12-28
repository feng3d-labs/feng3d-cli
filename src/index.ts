/**
 * feng3d-cli
 * feng3d 命令行工具
 */

export { VERSIONS, getDevDependencies } from './versions.js';
export * from './templates.js';
export * from './types/config.js';
export { ossUploadDir } from './commands/oss.js';
export { createProject } from './commands/create.js';
export { updateProject } from './commands/update.js';

