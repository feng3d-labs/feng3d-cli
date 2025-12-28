/**
 * feng3d-cli 基础测试
 */

import { describe, it, expect } from 'vitest';
import { VERSIONS, getDevDependencies } from '../src/versions.js';

describe('versions', () =>
{
    it('应该导出 VERSIONS 常量', () =>
    {
        expect(VERSIONS).toBeDefined();
        expect(VERSIONS.typescript).toBeDefined();
        expect(VERSIONS.eslint).toBeDefined();
    });

    it('getDevDependencies 应该返回基础依赖', () =>
    {
        const deps = getDevDependencies();

        expect(deps.typescript).toBe(VERSIONS.typescript);
        expect(deps.eslint).toBe(VERSIONS.eslint);
    });

    it('getDevDependencies 应该支持可选参数', () =>
    {
        const depsWithVitest = getDevDependencies({ includeVitest: true });

        expect(depsWithVitest.vitest).toBe(VERSIONS.vitest);

        const depsWithoutVitest = getDevDependencies({ includeVitest: false });

        expect(depsWithoutVitest.vitest).toBeUndefined();
    });
});

