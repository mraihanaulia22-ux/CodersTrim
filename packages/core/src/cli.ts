import { Command } from 'commander';
import { logger } from './services/logger.js';
import { restoreLatestSnapshot } from './services/snapshot.js';
import { executeSafeInjectionPipeline } from './services/safe-injection-pipeline.js';
import { executeDoctorPipeline } from './services/doctor-pipeline.js';
import { checkPortAvailability, diagnoseCommonPorts } from './services/port-guard.js';
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
    .option('-t, --template <template>', 'Specific starter template/plugin to use')
    .action(async (projectName, options) => {
      logger.banner();
      const config = await loadConfig(process.cwd());
      logger.info(`Initializing project: ${projectName || 'new-app'}`);
      logger.info(`Active configured plugins: ${config.plugins.length}`);
      if (options.template) {
        logger.info(`Selected template: ${options.template}`);
      }
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
