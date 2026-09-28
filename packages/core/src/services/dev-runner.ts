import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, exec, ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import readline from 'node:readline';
import pc from 'picocolors';
import { checkPortAvailability } from './port-guard.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export interface DevServiceConfig {
  id: 'frontend' | 'backend' | 'standalone';
  label: string;
  directory: string;
  command: string;
  port?: number;
  colorFn: (text: string) => string;
}

export interface DevRunnerOptions {
  cwd?: string;
  frontendOnly?: boolean;
  backendOnly?: boolean;
  enableWatchdog?: boolean;
  enableHotkeys?: boolean;
  onCrash?: (serviceId: string, exitCode: number | null) => void;
}

export async function killProcessTree(pid: number | undefined): Promise<void> {
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      await execAsync(`taskkill /pid ${pid} /T /F`);
    } catch {
      // Process already terminated
    }
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Process already terminated
      }
    }
  }
}

export class DevRunner {
  private cwd: string;
  private options: DevRunnerOptions;
  private services: DevServiceConfig[] = [];
  private processes: Map<string, ChildProcess> = new Map();
  private manuallyStopped: Set<string> = new Set();
  private isShuttingDown = false;
  private stdinHandler?: (key: string) => void;

  constructor(options: DevRunnerOptions = {}) {
    this.options = {
      enableWatchdog: true,
      enableHotkeys: true,
      ...options,
    };
    this.cwd = options.cwd ?? process.cwd();
  }

  public async detectServices(): Promise<DevServiceConfig[]> {
    const services: DevServiceConfig[] = [];
    const configPath = path.join(this.cwd, 'coderstrim.config.json');

    let loadedConfig: any = null;
    try {
      const raw = await fs.readFile(configPath, 'utf-8');
      loadedConfig = JSON.parse(raw);
    } catch {
      // No config file, fallback to directory inspection
    }

    if (loadedConfig?.mode === 'fullstack') {
      const feDir = path.join(this.cwd, loadedConfig.frontend?.directory || 'frontend');
      const beDir = path.join(this.cwd, loadedConfig.backend?.directory || 'backend');

      const fePort = loadedConfig.frontend?.port ?? 5173;
      const bePort = loadedConfig.backend?.port ?? 8000;

      // Frontend
      services.push({
        id: 'frontend',
        label: `Frontend (${loadedConfig.frontend?.framework || 'Vite'})`,
        directory: feDir,
        command: loadedConfig.frontend?.command || 'npm run dev',
        port: fePort,
        colorFn: pc.cyan,
      });

      // Backend
      let defaultBeCmd = 'uvicorn main:app --reload --port 8000';
      if (loadedConfig.backend?.framework === 'laravel' || loadedConfig.backend?.framework === 'laravel-api') {
        defaultBeCmd = 'php artisan serve --port=8000';
      } else if (loadedConfig.backend?.framework === 'gofiber') {
        defaultBeCmd = 'go run main.go';
      }

      services.push({
        id: 'backend',
        label: `Backend (${loadedConfig.backend?.framework || 'API'})`,
        directory: beDir,
        command: loadedConfig.backend?.command || defaultBeCmd,
        port: bePort,
        colorFn: pc.magenta,
      });
    } else {
      // Auto-detect based on folder structure
      const feDir = path.join(this.cwd, 'frontend');
      const beDir = path.join(this.cwd, 'backend');

      const feExists = await fs.stat(feDir).then((s) => s.isDirectory()).catch(() => false);
      const beExists = await fs.stat(beDir).then((s) => s.isDirectory()).catch(() => false);

      if (feExists && beExists) {
        services.push({
          id: 'frontend',
          label: 'Frontend',
          directory: feDir,
          command: 'npm run dev',
          port: 5173,
          colorFn: pc.cyan,
        });

        // Determine backend engine
        const hasPython = await fs.stat(path.join(beDir, 'main.py')).then(() => true).catch(() => false);
        const hasPHP = await fs.stat(path.join(beDir, 'artisan')).then(() => true).catch(() => false);
        const hasGo = await fs.stat(path.join(beDir, 'main.go')).then(() => true).catch(() => false);

        let beCmd = 'npm run dev';
        let bePort = 8000;
        let beLabel = 'Backend';

        if (hasPython) {
          beCmd = 'uvicorn main:app --reload --port 8000';
          bePort = 8000;
          beLabel = 'Backend (FastAPI)';
        } else if (hasPHP) {
          beCmd = 'php artisan serve --port=8000';
          bePort = 8000;
          beLabel = 'Backend (Laravel)';
        } else if (hasGo) {
          beCmd = 'go run main.go';
          bePort = 8080;
          beLabel = 'Backend (Go Fiber)';
        }

        services.push({
          id: 'backend',
          label: beLabel,
          directory: beDir,
          command: beCmd,
          port: bePort,
          colorFn: pc.magenta,
        });
      } else {
        // Standalone project
        services.push({
          id: 'standalone',
          label: 'App',
          directory: this.cwd,
          command: 'npm run dev',
          port: 3000,
          colorFn: pc.green,
        });
      }
    }

    this.services = services;
    return services;
  }

  public async run(): Promise<void> {
    const allServices = await this.detectServices();

    let targetServices = allServices;
    if (this.options.frontendOnly) {
      targetServices = allServices.filter((s) => s.id === 'frontend');
      logger.info(pc.yellow('ℹ Running in Frontend-Only mode (-f). Backend is inactive.'));
    } else if (this.options.backendOnly) {
      targetServices = allServices.filter((s) => s.id === 'backend');
      logger.info(pc.yellow('ℹ Running in Backend-Only mode (-b). Frontend is inactive.'));
    }

    if (targetServices.length === 0) {
      logger.error('No matching services found to run in current directory.');
      return;
    }

    // Pre-flight Port Checks
    logger.info(pc.bold('🔍 [Pre-flight] Checking ports...'));
    for (const s of targetServices) {
      if (s.port) {
        const available = await checkPortAvailability(s.port);
        if (available) {
          console.log(`   ${pc.green('✔')} Port ${s.port} is free (${s.label})`);
        } else {
          console.log(
            `   ${pc.red('✖')} ${pc.bold(`Port ${s.port} is already in use!`)} (${s.label})`
          );
          console.log(
            `      ${pc.yellow(`Run 'coderstrim port' to diagnose or kill conflicting processes.`)}`
          );
        }
      }
    }

    console.log('');
    logger.heading('🚀 Starting development services...');
    for (const s of targetServices) {
      console.log(`   ${s.colorFn(`[${s.id}]`)} ${s.command} in ${path.relative(this.cwd, s.directory) || '.'}`);
    }
    console.log(pc.dim('─'.repeat(70)));

    // Sequential startup: start backend first to warm up, then frontend
    const beService = targetServices.find((s) => s.id === 'backend');
    const feService = targetServices.find((s) => s.id === 'frontend');
    const standaloneService = targetServices.find((s) => s.id === 'standalone');

    if (beService) {
      await this.spawnService(beService);
      // Give backend 500ms lead time to bind port
      if (feService) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (feService) {
      await this.spawnService(feService);
    }

    if (standaloneService) {
      await this.spawnService(standaloneService);
    }

    this.printHotkeysHelp();
    this.setupInteractivity();
    this.setupSignalHandlers();
  }

  private async spawnService(service: DevServiceConfig): Promise<void> {
    this.manuallyStopped.delete(service.id);

    const parts = service.command.split(' ');
    const cmd = parts[0] ?? 'npm';
    const args = parts.slice(1);

    const child = spawn(cmd, args, {
      cwd: service.directory,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    this.processes.set(service.id, child);

    const prefix = service.colorFn(`[${service.id}]`.padEnd(10));

    // Handle stdout
    if (child.stdout) {
      const rlOut = readline.createInterface({ input: child.stdout });
      rlOut.on('line', (line) => {
        console.log(`${prefix} ${line}`);
      });
    }

    // Handle stderr
    if (child.stderr) {
      const rlErr = readline.createInterface({ input: child.stderr });
      rlErr.on('line', (line) => {
        console.error(`${prefix} ${pc.dim(line)}`);
      });
    }

    // Process Watchdog
    child.on('exit', (code, signal) => {
      this.processes.delete(service.id);

      if (this.isShuttingDown || this.manuallyStopped.has(service.id)) {
        return;
      }

      if (this.options.enableWatchdog && code !== 0 && code !== null) {
        this.renderCrashAlert(service, code, signal);
        this.options.onCrash?.(service.id, code);
      } else {
        console.log(`\n${prefix} ${pc.yellow(`Service stopped (exit code: ${code ?? signal})`)}`);
      }
    });

    child.on('error', (err) => {
      console.error(`${prefix} ${pc.red(`Failed to spawn: ${err.message}`)}`);
    });
  }

  private renderCrashAlert(service: DevServiceConfig, code: number | null, signal: NodeJS.Signals | null): void {
    console.log('');
    console.log(pc.red('┌─────────────────────────────────────────────────────────────┐'));
    console.log(pc.red(`│ 🚨 [${service.id.toUpperCase()} SERVICE CRASHED] Exit Code: ${code ?? signal ?? 'ERR'} `.padEnd(62) + '│'));
    console.log(pc.red('├─────────────────────────────────────────────────────────────┤'));
    console.log(pc.red(`│ The ${service.label} process terminated unexpectedly.       │`));
    console.log(pc.red('│ Possible causes:                                            │'));
    if (service.id === 'backend') {
      console.log(pc.red('│ • Missing dependencies (run pip install / composer install) │'));
      console.log(pc.red('│ • Syntax or import error in backend files                   │'));
      console.log(pc.red('│ • Port conflict or database permission error                │'));
    } else {
      console.log(pc.red('│ • Missing node_modules (run npm install in frontend/)       │'));
      console.log(pc.red('│ • TypeScript or bundling configuration error                │'));
    }
    console.log(pc.red('│                                                             │'));
    console.log(pc.red(`│ 👉 Press '${service.id === 'backend' ? 'b' : 'f'}' to restart this service after fixing!      │`));
    console.log(pc.red('└─────────────────────────────────────────────────────────────┘'));
    console.log('');
  }

  public async stopService(serviceId: string): Promise<void> {
    const child = this.processes.get(serviceId);
    if (!child) return;

    this.manuallyStopped.add(serviceId);
    console.log(pc.yellow(`🛑 Stopping [${serviceId}] service...`));
    await killProcessTree(child.pid);
    this.processes.delete(serviceId);
    console.log(pc.green(`✔ [${serviceId}] stopped cleanly.`));
  }

  public async restartService(serviceId: string): Promise<void> {
    await this.stopService(serviceId);
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      console.log(pc.cyan(`🔄 Restarting [${serviceId}]...`));
      await this.spawnService(service);
    }
  }

  public async restartAll(): Promise<void> {
    console.log(pc.cyan('\n🔄 Restarting all active services...'));
    const activeIds = this.services.map((s) => s.id);
    for (const id of activeIds) {
      await this.stopService(id);
    }
    for (const s of this.services) {
      await this.spawnService(s);
    }
  }

  public async stopAll(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(pc.yellow('\n\n🛑 [CodersTrim] Gracefully shutting down all services...'));

    const killPromises: Promise<void>[] = [];
    for (const [id, child] of this.processes.entries()) {
      killPromises.push(
        killProcessTree(child.pid).then(() => {
          console.log(`   ${pc.green('✔')} ${id} process stopped.`);
        })
      );
    }

    await Promise.all(killPromises);
    this.processes.clear();

    if (process.stdin.isTTY && this.stdinHandler) {
      try {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', this.stdinHandler);
      } catch {
        // Stdin cleanup
      }
    }

    console.log(pc.bold(pc.green('✨ All ports released cleanly. Goodbye!\n')));
  }

  private printHotkeysHelp(): void {
    console.log(pc.dim('─'.repeat(70)));
    console.log(pc.bold('⌨️  Interactive Hotkeys:'));
    console.log(`   ${pc.cyan('[f]')} Toggle/Restart Frontend   ${pc.magenta('[b]')} Toggle/Restart Backend`);
    console.log(`   ${pc.yellow('[r]')} Restart All Services       ${pc.red('[q]')} Quit & Clean Exit`);
    console.log(pc.dim('─'.repeat(70)) + '\n');
  }

  private setupInteractivity(): void {
    if (!this.options.enableHotkeys || !process.stdin.isTTY) {
      return;
    }

    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf-8');

      this.stdinHandler = async (data: string) => {
        const key = data.toString().trim().toLowerCase();

        // Ctrl+C
        if (data === '\u0003' || key === 'q') {
          await this.stopAll();
          process.exit(0);
        } else if (key === 'f') {
          const isRunning = this.processes.has('frontend');
          if (isRunning) {
            await this.stopService('frontend');
          } else {
            const s = this.services.find((x) => x.id === 'frontend');
            if (s) await this.spawnService(s);
          }
        } else if (key === 'b') {
          const isRunning = this.processes.has('backend');
          if (isRunning) {
            await this.stopService('backend');
          } else {
            const s = this.services.find((x) => x.id === 'backend');
            if (s) await this.spawnService(s);
          }
        } else if (key === 'r') {
          await this.restartAll();
        }
      };

      process.stdin.on('data', this.stdinHandler);
    } catch {
      // In non-interactive environments (CI, pipes), skip raw mode
    }
  }

  private setupSignalHandlers(): void {
    const handleSignal = async () => {
      await this.stopAll();
      process.exit(0);
    };

    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);
  }
}
