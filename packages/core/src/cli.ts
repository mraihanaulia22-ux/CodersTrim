import { Command } from 'commander';
import { logger } from './services/logger.js';
import { restoreLatestSnapshot } from './services/snapshot.js';
import { executeSafeInjectionPipeline } from './services/safe-injection-pipeline.js';
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

      // List all injectables
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
    .description('Diagnose project for syntax mistakes, Tailwind typos, and issues')
    .option('--dry-run', 'Preview fixes without applying changes to disk')
    .option('--fix', 'Automatically apply recommended fixes')
    .action(async (options) => {
      const config = await loadConfig(process.cwd());
      logger.info(`Running CodersTrim Doctor (dryRun=${Boolean(options.dryRun)}, fix=${Boolean(options.fix)})`);
      logger.info(`Levenshtein threshold: ${config.doctor.maxLevenshteinDistance}`);
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
