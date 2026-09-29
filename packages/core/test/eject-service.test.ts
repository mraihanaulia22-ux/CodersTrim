import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { executeEject } from '../src/services/eject-service.js';
import { generateProject } from '../src/services/project-generator.js';
import { getStarterTemplates } from '../src/services/starter-templates.js';

describe('CodersTrim Eject Engine & Zero-Lockin Verification', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ct-eject-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('performs a dry-run eject preview without touching disk files', async () => {
    const projDir = path.join(tempDir, 'react-app');
    await generateProject({
      projectName: 'react-app',
      templateId: 'react',
      mode: 'standalone',
      cwd: tempDir,
    });

    const toolbarPath = path.join(projDir, 'src', 'components', 'CodersTrimDevToolbar.tsx');
    const configPath = path.join(projDir, 'coderstrim.config.json');
    expect(await fs.stat(toolbarPath)).toBeDefined();
    expect(await fs.stat(configPath)).toBeDefined();

    const dryResult = await executeEject({
      cwd: projDir,
      dryRun: true,
    });

    expect(dryResult.success).toBe(true);
    expect(dryResult.filesDeleted).toContain('src/components/CodersTrimDevToolbar.tsx');
    expect(dryResult.filesDeleted).toContain('coderstrim.config.json');
    expect(dryResult.filesModified).toContain('src/App.tsx');

    // Confirm files still exist on disk after dry-run
    expect(await fs.stat(toolbarPath)).toBeDefined();
    expect(await fs.stat(configPath)).toBeDefined();
  });

  it('completely strips dev toolbar, config, and anchor comments on real eject', async () => {
    const projDir = path.join(tempDir, 'react-app');
    await generateProject({
      projectName: 'react-app',
      templateId: 'react',
      mode: 'standalone',
      cwd: tempDir,
    });

    const ejectResult = await executeEject({
      cwd: projDir,
      dryRun: false,
    });

    expect(ejectResult.success).toBe(true);

    // 1. Toolbar and config files must be deleted
    const toolbarPath = path.join(projDir, 'src', 'components', 'CodersTrimDevToolbar.tsx');
    const configPath = path.join(projDir, 'coderstrim.config.json');

    await expect(fs.stat(toolbarPath)).rejects.toThrow();
    await expect(fs.stat(configPath)).rejects.toThrow();

    // 2. App.tsx must have no toolbar imports, invocations, or @CodersTrim-Inject comments
    const appTsx = await fs.readFile(path.join(projDir, 'src', 'App.tsx'), 'utf-8');
    expect(appTsx).not.toContain('CodersTrimDevToolbar');
    expect(appTsx).not.toContain('@CodersTrim-Inject');

    // 3. App.tsx should still contain valid React code
    expect(appTsx).toContain('export default function App');
    expect(appTsx).toContain('react-app');
  });

  it('guarantees ZERO residual dependencies on @coderstrim/* in all templates (Delete CodersTrim Test)', () => {
    const templates = getStarterTemplates();

    for (const [id, tpl] of Object.entries(templates)) {
      // Check package.json if present
      const pkgFile = tpl.files['package.json'];
      if (pkgFile) {
        const pkg = JSON.parse(pkgFile);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        for (const dep of Object.keys(deps)) {
          expect(dep.startsWith('@coderstrim/')).toBe(false);
          expect(dep).not.toBe('coderstrim');
        }
      }

      // Check composer.json if present
      const composerFile = tpl.files['composer.json'];
      if (composerFile) {
        const composer = JSON.parse(composerFile);
        const reqs = { ...composer.require, ...composer['require-dev'] };
        for (const req of Object.keys(reqs)) {
          expect(req.toLowerCase()).not.toContain('coderstrim');
        }
      }
    }
  });
});
