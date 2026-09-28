import fs from 'node:fs/promises';
import path from 'node:path';
import { select, input } from '@inquirer/prompts';
import { Command } from 'commander';
import pc from 'picocolors';
import { logger } from './services/logger.js';
import { restoreLatestSnapshot } from './services/snapshot.js';
import { executeSafeInjectionPipeline } from './services/safe-injection-pipeline.js';
import { executeDoctorPipeline } from './services/doctor-pipeline.js';
import { checkPortAvailability, diagnoseCommonPorts } from './services/port-guard.js';
import { generateProject } from './services/project-generator.js';
import { DevRunner } from './services/dev-runner.js';
import { loadConfig } from './plugins/config-loader.js';
import { defaultRegistry } from './plugins/registry.js';
import { createPluginContext } from './plugins/context-factory.js';
import { HookDispatcher } from './plugins/dispatcher.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('coderstrim')
    .description('CodersTrim CLI v2 - Universal Developer Engine with Open Plugin Architecture')
    .version('2.0.0');

  // Command: init
  program
    .command('init [projectName]')
    .description('Initialize a new project scaffolded with your chosen framework')
    .option('-t, --template <template>', 'Starter template or preset (react, nextjs, laravel, fastapi, gofiber, react-fastapi, react-laravel, react-gofiber)')
    .action(async (projectName, options) => {
      logger.banner();

      let targetName = projectName;
      if (!targetName) {
        targetName = await input({
          message: 'What is your project name?',
          default: 'my-coderstrim-app',
        });
      }

      let template = options.template?.toLowerCase();
      let mode: 'standalone' | 'fullstack' = 'standalone';
      let frontendTemplate: 'react' | 'nextjs' | 'expo' | 'capacitor' | 'flutter' | 'none' | undefined;
      let backendTemplate:
        | 'fastapi'
        | 'laravel'
        | 'laravel-api'
        | 'gofiber'
        | 'supabase'
        | 'firebase'
        | 'none'
        | undefined;

      if (!template) {
        const archChoice = await select({
          message: 'How would you like to build your project?',
          pageSize: 15,
          loop: true,
          choices: [
            {
              name: `${pc.cyan('★ [Recommended]')} Pre-configured Frontend + Backend connected`,
              value: 'recommended',
              description: 'Batteries-included fullstack setup with pre-wired API client and CORS',
            },
            {
              name: `${pc.yellow('◆ [Custom]')}      Mix & match your own Client and Backend`,
              value: 'custom',
              description: 'Choose frontend and backend frameworks independently',
            },
            {
              name: `${pc.magenta('● [Standalone]')}  Scaffold a single standalone framework project`,
              value: 'standalone',
              description: 'Scaffold a single standalone framework project',
            },
          ],
        });

        if (archChoice === 'recommended') {
          const stackChoice = await select({
            message: 'Select a Recommended Fullstack Stack:',
            pageSize: 15,
            loop: true,
            choices: [
              {
                name: `${pc.cyan('◆ [Mobile]')}     Expo (React Native) + Supabase (PostgreSQL BaaS + Auth)`,
                value: 'rec-expo-supabase',
              },
              {
                name: `${pc.green('★ [Mobile]')}     Expo (React Native) + Go Fiber (Golang Microservice)`,
                value: 'rec-expo-gofiber',
              },
              {
                name: `${pc.yellow('▲ [Mobile]')}     Expo (React Native) + FastAPI (Python Backend)`,
                value: 'rec-expo-fastapi',
              },
              {
                name: `${pc.magenta('■ [Hybrid]')}     Capacitor (React 19) + FastAPI (Python Backend)`,
                value: 'rec-capacitor-fastapi',
              },
              {
                name: `${pc.yellow('▲ [Web API]')}    React 19 (Vite) + FastAPI (Python Backend + SQLite)`,
                value: 'rec-react-fastapi',
              },
              {
                name: `${pc.red('■ [Enterprise]')} React 19 (Vite) + Laravel 11 (PHP Modular REST API + SQLite)`,
                value: 'rec-react-laravel',
              },
              {
                name: `${pc.green('★ [High-Perf]')}  React 19 (Vite) + Go Fiber (Golang Microservice)`,
                value: 'rec-react-gofiber',
              },
              {
                name: `${pc.blue('● [Fullstack]')}  Next.js 15+ (React App Router + Server Actions)`,
                value: 'standalone-nextjs',
              },
              {
                name: `${pc.red('■ [Fullstack]')}  Laravel 11 (Blade Templates + MVC + SQLite)`,
                value: 'standalone-laravel',
              },
            ],
          });

          if (stackChoice === 'rec-expo-supabase') {
            mode = 'fullstack';
            frontendTemplate = 'expo';
            backendTemplate = 'supabase';
          } else if (stackChoice === 'rec-expo-gofiber') {
            mode = 'fullstack';
            frontendTemplate = 'expo';
            backendTemplate = 'gofiber';
          } else if (stackChoice === 'rec-expo-fastapi') {
            mode = 'fullstack';
            frontendTemplate = 'expo';
            backendTemplate = 'fastapi';
          } else if (stackChoice === 'rec-capacitor-fastapi') {
            mode = 'fullstack';
            frontendTemplate = 'capacitor';
            backendTemplate = 'fastapi';
          } else if (stackChoice === 'rec-react-fastapi') {
            mode = 'fullstack';
            frontendTemplate = 'react';
            backendTemplate = 'fastapi';
          } else if (stackChoice === 'rec-react-laravel') {
            mode = 'fullstack';
            frontendTemplate = 'react';
            backendTemplate = 'laravel-api';
          } else if (stackChoice === 'rec-react-gofiber') {
            mode = 'fullstack';
            frontendTemplate = 'react';
            backendTemplate = 'gofiber';
          } else if (stackChoice === 'standalone-nextjs') {
            mode = 'standalone';
            template = 'nextjs';
          } else if (stackChoice === 'standalone-laravel') {
            mode = 'standalone';
            template = 'laravel';
          }
        } else if (archChoice === 'custom') {
          frontendTemplate = await select({
            message: 'Step 1: Choose your Client / Frontend:',
            pageSize: 15,
            loop: true,
            choices: [
              { name: `${pc.blue('● [Web]')}    React 19 + Vite (Tailwind CSS SPA)`, value: 'react' },
              { name: `${pc.blue('● [Web]')}    Next.js 15+ (App Router Client)`, value: 'nextjs' },
              { name: `${pc.cyan('◆ [Mobile]')} Expo (React Native + TypeScript + File Routing)`, value: 'expo' },
              { name: `${pc.magenta('■ [Hybrid]')} Capacitor (React 19 + Tailwind Mobile Hybrid)`, value: 'capacitor' },
              { name: `${pc.cyan('◆ [Mobile]')} Flutter (Dart Native Mobile & Web)`, value: 'flutter' },
              { name: `${pc.gray('○ [None]')}   None (Backend / Monolith Only)`, value: 'none' },
            ],
          });

          backendTemplate = await select({
            message: 'Step 2: Choose your Backend / BaaS:',
            pageSize: 15,
            loop: true,
            choices: [
              { name: `${pc.yellow('▲ [Python API]')} FastAPI (Python 3.10+ Async API + SQLite)`, value: 'fastapi' },
              { name: `${pc.red('■ [PHP API]')}    Laravel 11 (PHP Modular REST API + SQLite)`, value: 'laravel-api' },
              { name: `${pc.green('★ [Go Micro]')}   Go Fiber (High-Performance Golang API)`, value: 'gofiber' },
              { name: `${pc.cyan('✦ [Cloud BaaS]')} Supabase (PostgreSQL BaaS + Auth + RLS Migrations)`, value: 'supabase' },
              { name: `${pc.yellow('✦ [Cloud BaaS]')} Firebase (Google Firestore + Auth + Cloud Functions)`, value: 'firebase' },
              { name: `${pc.gray('○ [None]')}       None (Frontend / Mobile Only)`, value: 'none' },
            ],
          });

          if (frontendTemplate !== 'none' && backendTemplate !== 'none') {
            mode = 'fullstack';
          } else if (frontendTemplate !== 'none') {
            mode = 'standalone';
            template = frontendTemplate;
          } else if (backendTemplate !== 'none') {
            mode = 'standalone';
            template = backendTemplate;
          }
        } else {
          // Standalone
          template = await select({
            message: 'Select your framework / language ecosystem:',
            pageSize: 15,
            loop: true,
            choices: [
              {
                name: `${pc.blue('● [Web]')}         React 19 + Vite (TypeScript + Tailwind CSS)`,
                value: 'react',
                description: 'Lightweight client-side Single Page Application',
              },
              {
                name: `${pc.blue('● [Web]')}         Next.js 15+ (App Router + Tailwind CSS)`,
                value: 'nextjs',
                description: 'Production React framework with server-side rendering & server actions',
              },
              {
                name: `${pc.cyan('◆ [Mobile]')}      Expo (React Native + TypeScript + Expo Router)`,
                value: 'expo',
                description: 'Cross-platform mobile application with file-based routing and Metro bundler',
              },
              {
                name: `${pc.magenta('■ [Hybrid]')}      Capacitor (React 19 + Tailwind Mobile Hybrid)`,
                value: 'capacitor',
                description: 'Universal web-to-mobile hybrid container for Android & iOS APKs',
              },
              {
                name: `${pc.cyan('◆ [Mobile]')}      Flutter (Google Dart Mobile & Web App)`,
                value: 'flutter',
                description: 'High performance native ARM app with Skia rendering',
              },
              {
                name: `${pc.red('■ [Fullstack]')}   Laravel 11+ (Blade MVC + Tailwind + SQLite)`,
                value: 'laravel',
                description: 'Modern PHP web framework with modular routing and templating',
              },
              {
                name: `${pc.yellow('▲ [API]')}         FastAPI (Python 3.10+ + Pydantic v2 + SQLite)`,
                value: 'fastapi',
                description: 'High performance asynchronous Python API backend',
              },
              {
                name: `${pc.green('★ [Microservice]')} Go Fiber (Go 1.22+ Microservice)`,
                value: 'gofiber',
                description: 'Blazing fast Go API with Express-like routing',
              },
              {
                name: `${pc.cyan('✦ [BaaS]')}         Supabase (PostgreSQL BaaS + Auth + SQL Schema)`,
                value: 'supabase',
                description: 'Open-source Firebase alternative with PostgreSQL, RLS policies & client SDK',
              },
              {
                name: `${pc.yellow('✦ [BaaS]')}         Firebase (Google Firestore + Auth Schema)`,
                value: 'firebase',
                description: 'Google mobile platform with Firestore, Auth & Cloud Messaging',
              },
            ],
          });
        }
      } else {
        // Flag-driven selection
        if (template === 'expo-supabase') {
          mode = 'fullstack';
          frontendTemplate = 'expo';
          backendTemplate = 'supabase';
        } else if (template === 'expo-gofiber') {
          mode = 'fullstack';
          frontendTemplate = 'expo';
          backendTemplate = 'gofiber';
        } else if (template === 'expo-fastapi') {
          mode = 'fullstack';
          frontendTemplate = 'expo';
          backendTemplate = 'fastapi';
        } else if (template === 'expo-laravel' || template === 'expo-laravel-api') {
          mode = 'fullstack';
          frontendTemplate = 'expo';
          backendTemplate = 'laravel-api';
        } else if (template === 'capacitor-fastapi') {
          mode = 'fullstack';
          frontendTemplate = 'capacitor';
          backendTemplate = 'fastapi';
        } else if (template === 'capacitor-supabase') {
          mode = 'fullstack';
          frontendTemplate = 'capacitor';
          backendTemplate = 'supabase';
        } else if (template === 'react-fastapi') {
          mode = 'fullstack';
          frontendTemplate = 'react';
          backendTemplate = 'fastapi';
        } else if (template === 'react-laravel' || template === 'react-laravel-api') {
          mode = 'fullstack';
          frontendTemplate = 'react';
          backendTemplate = 'laravel-api';
        } else if (template === 'react-gofiber') {
          mode = 'fullstack';
          frontendTemplate = 'react';
          backendTemplate = 'gofiber';
        }
      }

      logger.info(`Initializing project '${targetName}'...`);

      const result = await generateProject({
        projectName: targetName,
        templateId: template as any,
        mode,
        frontendTemplate,
        backendTemplate,
        cwd: process.cwd(),
      });

      if (!result.success) {
        logger.error(result.message);
        return;
      }

      logger.success(`Created project files (${result.filesCreated.length} files generated)`);
      if (mode === 'fullstack') {
        logger.info(`✔ Configured CORS & Pre-configured API client (frontend -> backend)`);
      }
      logger.vcs('Initialized clean Git repository with main branch.');
      logger.heading('\n👉 Next Steps:');
      for (const step of result.nextSteps) {
        console.log(`   ${step}`);
      }
      console.log('');
    });

  // Command: dev (alias: run)
  program
    .command('dev')
    .alias('run')
    .description('Start unified development server with Process Watchdog, log multiplexing, and hotkeys')
    .option('-f, --frontend', 'Start only the frontend development server')
    .option('-b, --backend', 'Start only the backend development server')
    .option('--no-watchdog', 'Disable unexpected process crash watchdog')
    .action(async (options) => {
      logger.banner();

      const runner = new DevRunner({
        cwd: process.cwd(),
        frontendOnly: options.frontend,
        backendOnly: options.backend,
        enableWatchdog: options.watchdog,
        enableHotkeys: true,
      });

      await runner.run();
    });

  // Command: add
  program
    .command('add [feature]')
    .description('Safely inject a feature module into the active project')
    .option('-f, --force', 'Bypass dirty git working tree guard')
    .option('-l, --list', 'List all available injectables registered across plugins')
    .action(async (feature, options) => {
      const cwd = process.cwd();
      const config = await loadConfig(cwd);

      if (options.list || !feature) {
        logger.heading('Available Feature Injectables:');
        const plugins = defaultRegistry.getAll();
        let totalFound = 0;

        for (const p of plugins) {
          if (p.contributes?.injectables && p.contributes.injectables.length > 0) {
            for (const inj of p.contributes.injectables) {
              logger.info(`  • ${inj.id.padEnd(20)} [${p.name}] ${inj.description}`);
              totalFound++;
            }
          }
        }

        if (totalFound === 0) {
          logger.info('No injectables currently registered. Install framework plugins to enable feature injection.');
        }
        return;
      }

      const ctx = createPluginContext(cwd, config);
      const dispatcher = new HookDispatcher(defaultRegistry);

      const result = await executeSafeInjectionPipeline({
        cwd,
        feature,
        force: Boolean(options.force),
        dispatcher,
        ctx,
      });

      if (result.success) {
        logger.success(result.message);
      } else {
        logger.error(result.message);
      }
    });

  // Command: ui
  const uiCmd = program.command('ui').description('Generate clean, uncompiled Tailwind UI components');

  uiCmd
    .command('list')
    .description('List all available UI component templates')
    .action(async () => {
      logger.heading('Available UI Components:');
      const plugins = defaultRegistry.getAll();
      let totalFound = 0;

      for (const p of plugins) {
        if (p.contributes?.uiComponents) {
          for (const comp of p.contributes.uiComponents) {
            logger.info(`  • ${comp.id.padEnd(15)} [${p.name}] ${comp.description}`);
            totalFound++;
          }
        }
      }

      if (totalFound === 0) {
        logger.info('  • card            [Official] Modern Card with title, badge, and content');
        logger.info('  • button          [Official] Accessible Button with variants');
      }
    });

  uiCmd
    .command('add <component>')
    .description('Scaffold an uncompiled Tailwind component into your project')
    .option('-f, --framework <framework>', 'Target framework (react, blade, vue, html)', 'react')
    .option('-o, --output <dir>', 'Target output directory', 'components')
    .action(async (component, options) => {
      const cwd = process.cwd();
      const compId = component.toLowerCase().trim();

      let templateCode: string | undefined;
      let compName = compId;

      for (const p of defaultRegistry.getAll()) {
        const found = p.contributes?.uiComponents?.find((c) => c.id === compId);
        if (found) {
          templateCode = found.template;
          compName = found.name;
          break;
        }
      }

      if (!templateCode) {
        if (compId === 'card') {
          templateCode = `import React from 'react';\n\nexport function Card({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {\n  return (\n    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">\n      <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>\n      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>\n      {children && <div className="mt-4">{children}</div>}\n    </div>\n  );\n}\n`;
        } else if (compId === 'button') {
          templateCode = `import React from 'react';\n\nexport function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {\n  return (\n    <button className={\`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 \${className}\`} {...props}>\n      {children}\n    </button>\n  );\n}\n`;
        }
      }

      if (!templateCode) {
        logger.error(`Component '${component}' not found. Run 'coderstrim ui list' to see available components.`);
        return;
      }

      const ext = options.framework === 'blade' ? 'blade.php' : options.framework === 'vue' ? 'vue' : options.framework === 'html' ? 'html' : 'tsx';
      const fileName = `${compId.charAt(0).toUpperCase() + compId.slice(1)}.${ext}`;
      const targetDir = path.resolve(cwd, options.output);
      const targetFilePath = path.join(targetDir, fileName);

      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(targetFilePath, templateCode, 'utf-8');

      logger.success(`Created ${compName} component at: ${path.relative(cwd, targetFilePath)}`);
      logger.info('Clean, uncompiled code generated. You own 100% of the code (no dependency lock-in).');
    });

  // Command: doctor
  program
    .command('doctor')
    .description('Diagnose project for syntax mistakes, Tailwind typos, and issues with diff preview')
    .option('--dry-run', 'Preview fixes without applying changes to disk')
    .option('--fix', 'Automatically apply recommended fixes to files')
    .option('-p, --path <targetPath>', 'Target directory or file path to scan')
    .action(async (options) => {
      const cwd = process.cwd();
      const config = await loadConfig(cwd);
      const ctx = createPluginContext(cwd, config);
      const dispatcher = new HookDispatcher(defaultRegistry);

      const isFix = Boolean(options.fix);
      const isDryRun = Boolean(options.dryRun) || !isFix;

      logger.heading(`🔍 CodersTrim Doctor v2.0 - Scanning project...`);

      const result = await executeDoctorPipeline({
        cwd,
        dryRun: isDryRun,
        fix: isFix,
        targetPath: options.path,
        dispatcher,
        ctx,
      });

      logger.info(`Scanned ${result.totalFilesScanned} files. Found ${result.totalIssuesFound} diagnostic issues.`);

      if (result.filesWithIssues.length === 0) {
        logger.success('All clean! No syntax mistakes or typos detected.');
        return;
      }

      for (const report of result.filesWithIssues) {
        logger.heading(`\n📄 ${report.file} (${report.issues.length} issue${report.issues.length > 1 ? 's' : ''}):`);
        for (const issue of report.issues) {
          logger.warn(`  • [${issue.type}] Line ${issue.line}:${issue.column} - '${issue.original}' -> '${issue.suggested}' (${Math.round(issue.confidence * 100)}% match)`);
        }

        if (report.diffPreview) {
          console.log('\n--- DIFF PREVIEW ---');
          console.log(report.diffPreview);
          console.log('-------------------\n');
        }
      }

      if (isFix) {
        logger.success(`Applied fixes to ${result.filesFixed} file(s) with pre-fix backup snapshot.`);
        logger.info(`To rollback, run: coderstrim undo`);
      } else {
        logger.info(`Dry-run complete. To apply these fixes automatically, run: coderstrim doctor --fix`);
      }
    });

  // Command: port
  program
    .command('port [portNumber]')
    .description('Diagnose development port availability and detect collisions')
    .action(async (portNumber) => {
      if (portNumber) {
        const port = parseInt(portNumber, 10);
        if (isNaN(port)) {
          logger.error('Invalid port number provided');
          return;
        }

        const isAvailable = await checkPortAvailability(port);
        if (isAvailable) {
          logger.success(`Port ${port} is AVAILABLE.`);
        } else {
          logger.warn(`Port ${port} is OCCUPIED (EADDRINUSE).`);
        }
        return;
      }

      logger.heading('Dev Ports Diagnostic:');
      const results = await diagnoseCommonPorts();
      for (const r of results) {
        if (r.isAvailable) {
          logger.info(`  • Port ${r.port.toString().padEnd(6)} : ${r.statusText}`);
        } else {
          logger.warn(`  • Port ${r.port.toString().padEnd(6)} : ${r.statusText}`);
        }
      }
    });

  // Command: undo
  program
    .command('undo')
    .description('Restore project files from the most recent CodersTrim snapshot')
    .action(async () => {
      logger.heading('CodersTrim Undo Service');
      const result = await restoreLatestSnapshot(process.cwd());
      if (result.success) {
        logger.success(result.message);
      } else {
        logger.warn(result.message);
      }
    });

  // Command: plugin
  const pluginCmd = program.command('plugin').description('Manage and inspect CodersTrim plugins');

  pluginCmd
    .command('list')
    .description('List all active and registered plugins')
    .action(async () => {
      const config = await loadConfig(process.cwd());
      logger.heading('Active CodersTrim Plugins');

      const registered = defaultRegistry.getAll();
      if (registered.length === 0 && config.plugins.length === 0) {
        logger.info('No external plugins currently loaded. Core defaults are active.');
        return;
      }

      for (const p of registered) {
        const badge = p.name.startsWith('@coderstrim/') ? '[Official]' : '[Community]';
        logger.info(`${badge} ${p.name} v${p.version} (${p.type || 'utility'})`);
      }
    });

  return program;
}

export function runCLI(): void {
  const program = createProgram();
  program.parse(process.argv);
}
