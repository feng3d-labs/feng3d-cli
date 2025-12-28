// @see https://cn.vitejs.dev/guide/build.html#library-mode

import { resolve } from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json';

// 外部化 Node.js 内置模块和所有依赖
const external = [
    ...Object.keys(pkg.dependencies || {}),
    /^node:/,
    'path', 'fs', 'url', 'child_process', 'os', 'crypto', 'stream', 'util', 'events',
];

export default defineConfig({
    build: {
        target: 'node18',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'feng3dCli',
            formats: ['es', 'umd'],
            fileName: 'index',
        },
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external,
        },
    },
});
