import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { safeInjectIntoFile, executeSafeInjectionPipeline } from '../src/services/safe-injection-pipeline.js';
import { restoreLatestSnapshot } from '../src/services/snapshot.js';
import { PluginRegistry } from '../src/plugins/registry.js';
import { HookDispatcher } from '../src/plugins/dispatcher.js';
import { createPluginContext } from '../src/plugins/context-factory.js';
import { CodersTrimConfigSchema } from '../src/types/config.js';
import type { CodersTrimPlugin } from '../src/types/plugin.js';

describe('SafeInjectionPipeline & VCS Integration', () => {
  let tempDir: string;
  let registry: PluginRegistry;
  let dispatcher: HookDispatcher;
  const config = CodersTrimConfigSchema.parse({});

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-inject-test-'));
    registry = new PluginRegistry();
    dispatcher = new HookDispatcher(registry);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('safely injects code into target file with automated snapshot and undo capability', async () => {
    const routeFile = path.join(tempDir, 'routes.ts');
    const initialContent = [
      'import { Router } from "express";',
      'const router = Router();',
      '',
      '// @CodersTrim-Inject-Routes',
      '',
      'export default router;',
    ].join('\n');

    await fs.writeFile(routeFile, initialContent, 'utf-8');

    // Perform safe injection
    const injectResult = await safeInjectIntoFile(
      tempDir,
      'routes.ts',
      'Routes',
      'router.get("/users", listUsers);'
    );

    expect(injectResult.success).toBe(true);

    const updatedContent = await fs.readFile(routeFile, 'utf-8');
    expect(updatedContent).toContain('router.get("/users", listUsers);');

    // Test instant rollback via restoreLatestSnapshot
    const undoResult = await restoreLatestSnapshot(tempDir);
    expect(undoResult.success).toBe(true);
    expect(undoResult.restoredCount).toBe(1);

    const rolledBackContent = await fs.readFile(routeFile, 'utf-8');
    expect(rolledBackContent).toBe(initialContent);
    expect(rolledBackContent).not.toContain('router.get("/users", listUsers);');
  });

  it('fails gracefully when target file does not exist', async () => {
    const result = await safeInjectIntoFile(tempDir, 'non-existent.ts', 'Routes', 'code');
    expect(result.success).toBe(false);
    expect(result.reason).toContain('does not exist');
  });

  it('executes injection pipeline through registered plugin hooks', async () => {
    const mockAuthPlugin: CodersTrimPlugin = {
      name: '@coderstrim/plugin-auth',
      version: '1.0.0',
      type: 'framework',
      contributes: {
        injectables: [
          { id: 'auth-jwt', name: 'JWT Auth', description: 'JWT Authentication middleware' },
        ],
      },
      hooks: {
        onInject: async (ctx, feature) => {
          if (feature === 'auth-jwt') {
            await ctx.fs.writeFileSafe('auth.ts', 'export const auth = true;');
          }
        },
      },
    };

    registry.register(mockAuthPlugin);
    const ctx = createPluginContext(tempDir, config);

    const pipelineResult = await executeSafeInjectionPipeline({
      cwd: tempDir,
      feature: 'auth-jwt',
      force: true,
      dispatcher,
      ctx,
    });

    expect(pipelineResult.success).toBe(true);
    expect(pipelineResult.message).toContain('injected successfully');

    // Check file created by hook
    const authFileCreated = await fs.readFile(path.join(tempDir, 'auth.ts'), 'utf-8');
    expect(authFileCreated).toBe('export const auth = true;');
  });

  it('returns failure when requested feature is not registered by any plugin', async () => {
    const ctx = createPluginContext(tempDir, config);

    const pipelineResult = await executeSafeInjectionPipeline({
      cwd: tempDir,
      feature: 'unknown-feature',
      force: true,
      dispatcher,
      ctx,
    });

    expect(pipelineResult.success).toBe(false);
    expect(pipelineResult.message).toContain("No plugins provided an injectable for 'unknown-feature'");
  });
});
