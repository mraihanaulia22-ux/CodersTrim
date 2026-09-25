import { Command } from 'commander';
import { logger } from './services/logger.js';
import { restoreLatestSnapshot } from './services/snapshot.js';

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
      logger.info(`Initializing project: ${projectName || 'new-app'}`);
      logger.info(`Selected template options: ${JSON.stringify(options)}`);
      // Plugin hook dispatcher will be wired in Phase 2
    });

  // Command: add
  program
    .command('add <feature>')
    .description('Safely inject a feature module into the active project')
    .option('-f, --force', 'Bypass dirty git working tree guard')
    .action(async (feature, options) => {
      logger.info(`Injecting feature: ${feature} (force=${Boolean(options.force)})`);
      // Safe-injection dispatcher will be wired in Phase 2 & 3
    });

  // Command: doctor
  program
    .command('doctor')
    .description('Diagnose project for syntax mistakes, Tailwind typos, and issues')
    .option('--dry-run', 'Preview fixes without applying changes to disk')
    .option('--fix', 'Automatically apply recommended fixes')
    .action(async (options) => {
      logger.info(`Running CodersTrim Doctor (dryRun=${Boolean(options.dryRun)}, fix=${Boolean(options.fix)})`);
      // Doctor dispatcher wired in Phase 4
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

  return program;
}

export function runCLI(): void {
  const program = createProgram();
  program.parse(process.argv);
}
