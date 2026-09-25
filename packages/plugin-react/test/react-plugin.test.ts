import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { reactPlugin, getReactTemplateFiles } from '../src/index.js';
import { createPluginContext, CodersTrimConfigSchema } from '@coderstrim/core';

describe('@coderstrim/plugin-react', () => {
  let tempDir: string;
  const config = CodersTrimConfigSchema.parse({});

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-react-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('generates complete template files for React + Vite', () => {
    const files = getReactTemplateFiles('my-test-app');
    expect(files['package.json']).toBeDefined();
    expect(files['vite.config.ts']).toBeDefined();
    expect(files['src/App.tsx']).toContain('my-test-app');
    expect(files['coderstrim.config.json']).toContain('@coderstrim/plugin-react');
  });

  it('scaffolds project files using onInit hook', async () => {
    const ctx = createPluginContext(tempDir, config);

    const result = await reactPlugin.hooks.onInit!(ctx, { projectName: 'demo-app' });

    expect(result.filesCreated.length).toBeGreaterThan(5);
    expect(result.nextSteps).toContain('npm install');

    // Verify files on disk
    const pkgJson = JSON.parse(await fs.readFile(path.join(tempDir, 'package.json'), 'utf-8'));
    expect(pkgJson.name).toBe('demo-app');
    expect(pkgJson.dependencies.react).toBe('^19.0.0');

    const appCode = await fs.readFile(path.join(tempDir, 'src/App.tsx'), 'utf-8');
    expect(appCode).toContain('demo-app');
  });

  it('injects router feature using onInject hook', async () => {
    const ctx = createPluginContext(tempDir, config);
    await reactPlugin.hooks.onInit!(ctx, { projectName: 'router-app' });

    await reactPlugin.hooks.onInject!(ctx, 'router');

    const updatedApp = await fs.readFile(path.join(tempDir, 'src/App.tsx'), 'utf-8');
    expect(updatedApp).toContain('React Router support active');
  });
});
