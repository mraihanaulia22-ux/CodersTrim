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

  it('scaffolds a Laravel 11 project with anchor comments and controllers', async () => {
    const result = await generateProject({
      projectName: 'my-laravel-app',
      templateId: 'laravel',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('composer.json');
    expect(result.filesCreated).toContain('routes/web.php');
    expect(result.filesCreated).toContain('app/Http/Controllers/HomeController.php');
    expect(result.filesCreated).toContain('app/Models/User.php');

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
    expect(result.filesCreated).toContain('app/routers/items.py');

    const mainPy = await fs.readFile(path.join(tempDir, 'my-fastapi-app', 'main.py'), 'utf-8');
    expect(mainPy).toContain('# @CodersTrim-Inject-Routers');
  });

  it('scaffolds a Go Fiber project with handlers and models', async () => {
    const result = await generateProject({
      projectName: 'my-gofiber-app',
      templateId: 'gofiber',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('go.mod');
    expect(result.filesCreated).toContain('main.go');
    expect(result.filesCreated).toContain('handlers/user.go');
    expect(result.filesCreated).toContain('models/user.go');

    const mainGo = await fs.readFile(path.join(tempDir, 'my-gofiber-app', 'main.go'), 'utf-8');
    expect(mainGo).toContain('fiber.New()');
  });

  it('scaffolds a decoupled fullstack project (React + FastAPI) with pre-wired API and CORS', async () => {
    const result = await generateProject({
      projectName: 'my-fullstack-app',
      mode: 'fullstack',
      frontendTemplate: 'react',
      backendTemplate: 'fastapi',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('frontend/package.json');
    expect(result.filesCreated).toContain('frontend/src/services/api.ts');
    expect(result.filesCreated).toContain('backend/requirements.txt');
    expect(result.filesCreated).toContain('backend/main.py');
    expect(result.filesCreated).toContain('coderstrim.config.json');
    expect(result.filesCreated).toContain('package.json');
    expect(result.filesCreated).toContain('.vscode/settings.json');
    expect(result.filesCreated).toContain('.vscode/extensions.json');
    expect(result.filesCreated).toContain('README.md');

    // Verify root package.json contains "coderstrim dev"
    const rootPkg = await fs.readFile(path.join(tempDir, 'my-fullstack-app', 'package.json'), 'utf-8');
    expect(rootPkg).toContain('coderstrim dev');

    // Verify API client points to port 8000
    const apiFile = await fs.readFile(path.join(tempDir, 'my-fullstack-app', 'frontend/src/services/api.ts'), 'utf-8');
    expect(apiFile).toContain('http://localhost:8000');

    // Verify git initialized at root monorepo
    const gitDir = path.join(tempDir, 'my-fullstack-app', '.git');
    expect(await fs.stat(gitDir).then((s) => s.isDirectory()).catch(() => false)).toBe(true);
  });

  it('scaffolds a decoupled fullstack project (React + Go Fiber) with port 8080 wiring', async () => {
    const result = await generateProject({
      projectName: 'my-go-fullstack',
      mode: 'fullstack',
      frontendTemplate: 'react',
      backendTemplate: 'gofiber',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    const apiFile = await fs.readFile(path.join(tempDir, 'my-go-fullstack', 'frontend/src/services/api.ts'), 'utf-8');
    expect(apiFile).toContain('http://localhost:8080');
  });

  it('scaffolds an Expo React Native mobile project with Expo Router and Metro config', async () => {
    const result = await generateProject({
      projectName: 'my-expo-app',
      templateId: 'expo',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('package.json');
    expect(result.filesCreated).toContain('app.json');
    expect(result.filesCreated).toContain('app/index.tsx');
    expect(result.filesCreated).toContain('services/api.ts');

    const appJson = await fs.readFile(path.join(tempDir, 'my-expo-app', 'app.json'), 'utf-8');
    expect(appJson).toContain('my-expo-app');
  });

  it('scaffolds a Capacitor hybrid mobile project with React 19 and mobile sync scripts', async () => {
    const result = await generateProject({
      projectName: 'my-capacitor-app',
      templateId: 'capacitor',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('package.json');
    expect(result.filesCreated).toContain('capacitor.config.json');
    expect(result.filesCreated).toContain('src/App.tsx');
    expect(result.filesCreated).toContain('src/services/api.ts');
  });

  it('scaffolds a Flutter Dart mobile project with Skia/Web canvas', async () => {
    const result = await generateProject({
      projectName: 'my-flutter-app',
      templateId: 'flutter',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('pubspec.yaml');
    expect(result.filesCreated).toContain('lib/main.dart');
    expect(result.filesCreated).toContain('web/index.html');
  });

  it('scaffolds a Supabase BaaS project with migrations and client config', async () => {
    const result = await generateProject({
      projectName: 'my-supabase-backend',
      templateId: 'supabase',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('services/supabase.ts');
    expect(result.filesCreated).toContain('supabase/migrations/20260101_initial_schema.sql');
    expect(result.filesCreated).toContain('.env.example');
  });

  it('scaffolds a mobile fullstack project (Expo + Supabase) with client injection and RLS schema', async () => {
    const result = await generateProject({
      projectName: 'my-mobile-fullstack',
      mode: 'fullstack',
      frontendTemplate: 'expo',
      backendTemplate: 'supabase',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('frontend/app/index.tsx');
    expect(result.filesCreated).toContain('frontend/services/supabase.ts');
    expect(result.filesCreated).toContain('backend/supabase/migrations/20260101_initial_schema.sql');
    expect(result.filesCreated).toContain('coderstrim.config.json');

    const configContent = await fs.readFile(
      path.join(tempDir, 'my-mobile-fullstack', 'coderstrim.config.json'),
      'utf-8'
    );
    const parsed = JSON.parse(configContent);
    expect(parsed.frontend.framework).toBe('expo');
    expect(parsed.frontend.port).toBe(8081);
    expect(parsed.backend.framework).toBe('supabase');
  });

  it('scaffolds a mobile fullstack project (Expo + Go Fiber) with port 8080 API wiring and 8081 CORS', async () => {
    const result = await generateProject({
      projectName: 'my-expo-fiber',
      mode: 'fullstack',
      frontendTemplate: 'expo',
      backendTemplate: 'gofiber',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.filesCreated).toContain('frontend/services/api.ts');
    expect(result.filesCreated).toContain('backend/main.go');

    const apiFile = await fs.readFile(
      path.join(tempDir, 'my-expo-fiber', 'frontend/services/api.ts'),
      'utf-8'
    );
    expect(apiFile).toContain('http://localhost:8080');

    const mainGo = await fs.readFile(
      path.join(tempDir, 'my-expo-fiber', 'backend/main.go'),
      'utf-8'
    );
    expect(mainGo).toContain('http://localhost:8081');
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
