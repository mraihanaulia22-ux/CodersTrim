import { Command } from 'commander';
import { generateProject, logger } from '@coderstrim/core';

export function createBootstrapProgram(): Command {
  const program = new Command();

  program
    .name('create-coderstrim')
    .description('Zero-install bootstrapper for creating modern fullstack and web apps with CodersTrim')
    .version('2.0.0')
    .arguments('[projectName]')
    .option('-t, --template <template>', 'Starter template (react, nextjs, laravel, fastapi)', 'react')
    .action(async (projectName: string = 'my-coderstrim-app', options: { template: string } = { template: 'react' }) => {
      logger.banner();
      logger.info(`Bootstrapping new project '${projectName}' with ${options.template.toUpperCase()}...`);

      const validTemplates = ['react', 'nextjs', 'laravel', 'fastapi'];
      const templateId = options.template.toLowerCase();

      if (!validTemplates.includes(templateId)) {
        logger.error(`Invalid template '${options.template}'. Available: ${validTemplates.join(', ')}`);
        process.exit(1);
      }

      const result = await generateProject({
        projectName,
        templateId: templateId as any,
        cwd: process.cwd(),
      });

      if (!result.success) {
        logger.error(result.message);
        process.exit(1);
      }

      logger.success(`Successfully initialized '${projectName}'!`);
      logger.vcs('Git repository initialized with main branch.');
      logger.heading('\n👉 Next steps to launch your application:');
      for (const step of result.nextSteps) {
        console.log(`   ${step}`);
      }
      console.log('');
    });

  return program;
}

export function runBootstrap(): void {
  const program = createBootstrapProgram();
  program.parse(process.argv);
}
