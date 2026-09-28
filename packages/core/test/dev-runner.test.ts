import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { DevRunner } from '../src/services/dev-runner.js';

describe('DevRunner Service', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-devrunner-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('detects fullstack services from coderstrim.config.json', async () => {
    const config = {
      name: 'test-app',
      mode: 'fullstack',
      frontend: {
        framework: 'react',
        directory: 'frontend',
        command: 'npm run dev',
        port: 5173,
      },
      backend: {
        framework: 'fastapi',
        directory: 'backend',
        command: 'uvicorn main:app --reload --port 8000',
        port: 8000,
      },
    };

    await fs.writeFile(
      path.join(tempDir, 'coderstrim.config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    const runner = new DevRunner({ cwd: tempDir });
    const services = await runner.detectServices();

    expect(services.length).toBe(2);
    expect(services[0]?.id).toBe('frontend');
    expect(services[0]?.port).toBe(5173);
    expect(services[1]?.id).toBe('backend');
    expect(services[1]?.port).toBe(8000);
  });

  it('auto-detects fullstack folders when config is absent', async () => {
    await fs.mkdir(path.join(tempDir, 'frontend'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'backend'), { recursive: true });
    await fs.writeFile(path.join(tempDir, 'backend', 'main.py'), '# python backend');

    const runner = new DevRunner({ cwd: tempDir });
    const services = await runner.detectServices();

    expect(services.length).toBe(2);
    expect(services.some((s) => s.id === 'frontend')).toBe(true);
    expect(services.some((s) => s.id === 'backend')).toBe(true);
    expect(services.find((s) => s.id === 'backend')?.label).toContain('FastAPI');
  });

  it('falls back to standalone service for single root apps', async () => {
    const runner = new DevRunner({ cwd: tempDir });
    const services = await runner.detectServices();

    expect(services.length).toBe(1);
    expect(services[0]?.id).toBe('standalone');
  });

  it('triggers watchdog callback when a child process exits with an error code', async () => {
    // Setup a dummy service that exits immediately with error code 42
    let crashedService = '';
    let crashCode: number | null = null;

    const isWin = process.platform === 'win32';
    const crashCommand = isWin ? 'cmd /c exit 42' : 'sh -c "exit 42"';

    const config = {
      name: 'crash-app',
      mode: 'fullstack',
      frontend: {
        framework: 'react',
        directory: '.',
        command: crashCommand,
        port: 5173,
      },
      backend: {
        framework: 'fastapi',
        directory: '.',
        command: isWin ? 'cmd /c ping 127.0.0.1 -n 2' : 'sleep 1',
        port: 8000,
      },
    };

    await fs.writeFile(
      path.join(tempDir, 'coderstrim.config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    const runner = new DevRunner({
      cwd: tempDir,
      enableWatchdog: true,
      enableHotkeys: false,
      onCrash: (serviceId, code) => {
        crashedService = serviceId;
        crashCode = code;
      },
    });

    await runner.run();

    // Allow process exit event to propagate
    await new Promise((resolve) => setTimeout(resolve, 800));
    await runner.stopAll();

    expect(crashedService).toBe('frontend');
    expect(crashCode).toBe(42);
  });
});
