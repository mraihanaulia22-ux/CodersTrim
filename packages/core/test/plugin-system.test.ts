import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '../src/plugins/registry.js';
import { HookDispatcher } from '../src/plugins/dispatcher.js';
import { createPluginContext } from '../src/plugins/context-factory.js';
import { CodersTrimConfigSchema } from '../src/types/config.js';
import type { CodersTrimPlugin } from '../src/types/plugin.js';

describe('Plugin System & Hook Dispatcher', () => {
  let registry: PluginRegistry;
  let dispatcher: HookDispatcher;
  const config = CodersTrimConfigSchema.parse({});

  beforeEach(() => {
    registry = new PluginRegistry();
    dispatcher = new HookDispatcher(registry);
  });

  it('validates and registers a compliant plugin manifest', () => {
    const validPlugin: CodersTrimPlugin = {
      name: '@coderstrim/plugin-test',
      version: '1.0.0',
      type: 'linter',
      hooks: {
        onLintFile: async () => [],
      },
    };

    const registered = registry.register(validPlugin);
    expect(registered).toBe(true);
    expect(registry.has('@coderstrim/plugin-test')).toBe(true);
    expect(registry.get('@coderstrim/plugin-test')?.version).toBe('1.0.0');
  });

  it('rejects an invalid plugin manifest with invalid semver', () => {
    const invalidPlugin = {
      name: 'broken-plugin',
      version: 'invalid-version',
    };

    const registered = registry.register(invalidPlugin);
    expect(registered).toBe(false);
    expect(registry.has('broken-plugin')).toBe(false);
  });

  it('dispatches onInit hook and returns created files', async () => {
    const mockFrameworkPlugin: CodersTrimPlugin = {
      name: '@coderstrim/plugin-mock-framework',
      version: '2.0.0',
      type: 'framework',
      hooks: {
        onInit: async (_ctx, opts) => {
          return {
            filesCreated: ['package.json', 'src/main.ts'],
            nextSteps: ['npm install', 'npm run dev'],
          };
        },
      },
    };

    registry.register(mockFrameworkPlugin);
    const ctx = createPluginContext(process.cwd(), config);

    const result = await dispatcher.dispatchOnInit('@coderstrim/plugin-mock-framework', ctx);
    expect(result.success).toBe(true);
    expect(result.data?.filesCreated).toEqual(['package.json', 'src/main.ts']);
    expect(result.data?.nextSteps).toEqual(['npm install', 'npm run dev']);
  });

  it('isolates errors if a plugin throws during onLintFile without crashing', async () => {
    const brokenPlugin: CodersTrimPlugin = {
      name: 'broken-linter',
      version: '1.0.0',
      type: 'linter',
      hooks: {
        onLintFile: async () => {
          throw new Error('Simulated parser crash!');
        },
      },
    };

    const healthyPlugin: CodersTrimPlugin = {
      name: 'healthy-linter',
      version: '1.0.0',
      type: 'linter',
      hooks: {
        onLintFile: async () => [
          {
            id: 'issue-1',
            file: 'app.tsx',
            line: 1,
            column: 1,
            type: 'typo',
            original: 'flx',
            suggested: 'flex',
            confidence: 0.9,
            range: [0, 3],
            message: 'Invalid class flx',
          },
        ],
      },
    };

    registry.register(brokenPlugin);
    registry.register(healthyPlugin);

    const ctx = createPluginContext(process.cwd(), config);
    const { allIssues, results } = await dispatcher.dispatchOnLintFile(ctx, {
      path: 'app.tsx',
      content: '<div className="flx"></div>',
    });

    // Healthy issues are collected despite broken plugin
    expect(allIssues.length).toBe(1);
    expect(allIssues[0]?.suggested).toBe('flex');

    // Individual results reflect the failure gracefully
    const brokenResult = results.find((r) => r.pluginName === 'broken-linter');
    expect(brokenResult?.success).toBe(false);
    expect(brokenResult?.error).toContain('Simulated parser crash!');

    const healthyResult = results.find((r) => r.pluginName === 'healthy-linter');
    expect(healthyResult?.success).toBe(true);
  });
});
