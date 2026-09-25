import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { generateProject } from '../src/services/project-generator.js';

describe('ProjectGenerator Service', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-scaffold-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('scaffolds a Next.js 15 App Router project with config and git init', async () => {
    const result = await generateProject({
      projectName: 'my-next-app',
      templateId: 'nextjs',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('package.json');
    expect(result.filesCreated).toContain('app/page.tsx');
    expect(result.filesCreated).toContain('coderstrim.config.json');

    // Verify git initialized
    const gitDir = path.join(tempDir, 'my-next-app', '.git');
    expect(await fs.stat(gitDir).then((s) => s.isDirectory()).catch(() => false)).toBe(true);
  });

  it('scaffolds a Laravel 11 project with anchor comments', async () => {
    const result = await generateProject({
      projectName: 'my-laravel-app',
      templateId: 'laravel',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('composer.json');
    expect(result.filesCreated).toContain('routes/web.php');

    const routesContent = await fs.readFile(path.join(tempDir, 'my-laravel-app', 'routes/web.php'), 'utf-8');
    expect(routesContent).toContain('// @CodersTrim-Inject-Routes');
  });

  it('scaffolds a FastAPI Python project with requirements and main.py', async () => {
    const result = await generateProject({
      projectName: 'my-fastapi-app',
      templateId: 'fastapi',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('requirements.txt');
    expect(result.filesCreated).toContain('main.py');

    const mainPy = await fs.readFile(path.join(tempDir, 'my-fastapi-app', 'main.py'), 'utf-8');
    expect(mainPy).toContain('# @CodersTrim-Inject-Routers');
  });

  it('prevents accidental overwrite if target directory is non-empty', async () => {
    const existingDir = path.join(tempDir, 'occupied-app');
    await fs.mkdir(existingDir, { recursive: true });
    await fs.writeFile(path.join(existingDir, 'existing.txt'), 'data', 'utf-8');

    const result = await generateProject({
      projectName: 'occupied-app',
      templateId: 'react',
      cwd: tempDir,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists and is not empty');
  });
});
