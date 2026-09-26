import { select, input } from '@inquirer/prompts';
import { Command } from 'commander';
import { generateProject, logger } from '@coderstrim/core';

export function createBootstrapProgram(): Command {
  const program = new Command();

  program
    .name('create-coderstrim')
    .description('Zero-install bootstrapper for creating modern fullstack and web apps with CodersTrim')
    .version('2.0.0')
    .arguments('[projectName]')
    .option('-t, --template <template>', 'Starter template or preset (react, nextjs, laravel, fastapi, gofiber, react-fastapi, react-laravel, react-gofiber)')
    .action(async (projectName?: string, options?: { template?: string }) => {
      logger.banner();

      let targetName = projectName;
      if (!targetName) {
        targetName = await input({
          message: 'What is your project name?',
          default: 'my-coderstrim-app',
        });
      }

      let template = options?.template?.toLowerCase();
      let mode: 'standalone' | 'fullstack' = 'standalone';
      let frontendTemplate: 'react' | 'nextjs' | 'none' | undefined;
      let backendTemplate: 'fastapi' | 'laravel' | 'laravel-api' | 'gofiber' | 'none' | undefined;

      if (!template) {
        const archChoice = await select({
          message: 'How would you like to build your project?',
          choices: [
            {
              name: '🌟 Recommended Stacks (Pre-configured Frontend + Backend connected)',
              value: 'recommended',
              description: 'Batteries-included fullstack setup with pre-wired API client and CORS',
            },
            {
              name: '🛠️  Custom Combination (Mix & match your own Frontend and Backend)',
              value: 'custom',
              description: 'Choose frontend and backend frameworks independently',
            },
            {
              name: '📦 Standalone Single App (Only Frontend or only Backend/Fullstack)',
              value: 'standalone',
              description: 'Scaffold a single standalone framework project',
            },
          ],
        });

        if (archChoice === 'recommended') {
          const stackChoice = await select({
            message: 'Select a Recommended Fullstack Stack:',
            choices: [
              {
                name: '⚡ [Modern Web] React 19 (Vite) + FastAPI (Python Backend + SQLite)',
                value: 'rec-react-fastapi',
              },
              {
                name: '🏢 [Enterprise API] React 19 (Vite) + Laravel 11 (PHP Modular REST API + SQLite)',
                value: 'rec-react-laravel',
              },
              {
                name: '🚀 [High-Performance] React 19 (Vite) + Go Fiber (Golang Microservice)',
                value: 'rec-react-gofiber',
              },
              {
                name: '🌐 [Unified Fullstack] Next.js 15+ (React App Router + Server Actions)',
                value: 'standalone-nextjs',
              },
              {
                name: '🐘 [Classic Fullstack] Laravel 11 (Blade Templates + MVC + SQLite)',
                value: 'standalone-laravel',
              },
            ],
          });

          if (stackChoice === 'rec-react-fastapi') {
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
            message: 'Step 1: Choose your Frontend:',
            choices: [
              { name: 'React 19 + Vite (Tailwind CSS SPA)', value: 'react' },
              { name: 'Next.js 15+ (App Router Client)', value: 'nextjs' },
              { name: 'None (Backend / Monolith Only)', value: 'none' },
            ],
          });

          backendTemplate = await select({
            message: 'Step 2: Choose your Backend:',
            choices: [
              { name: 'FastAPI (Python 3.10+ Async API + SQLite)', value: 'fastapi' },
              { name: 'Laravel 11 (PHP Modular REST API + SQLite)', value: 'laravel-api' },
              { name: 'Go Fiber (High-Performance Golang API)', value: 'gofiber' },
              { name: 'None (Frontend Only)', value: 'none' },
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
            choices: [
              {
                name: 'React 19 + Vite (TypeScript + Tailwind CSS) [Client SPA]',
                value: 'react',
                description: 'Lightweight client-side Single Page Application',
              },
              {
                name: 'Next.js 15+ (App Router + Tailwind CSS) [Fullstack React]',
                value: 'nextjs',
                description: 'Production React framework with server-side rendering & server actions',
              },
              {
                name: 'Laravel 11+ (Blade MVC + Tailwind + SQLite) [Fullstack PHP]',
                value: 'laravel',
                description: 'Modern PHP web framework with modular routing and templating',
              },
              {
                name: 'FastAPI (Python 3.10+ + Pydantic v2 + SQLite) [Python API]',
                value: 'fastapi',
                description: 'High performance asynchronous Python API backend',
              },
              {
                name: 'Go Fiber (Go 1.22+ Microservice) [Golang API]',
                value: 'gofiber',
                description: 'Blazing fast Go API with Express-like routing',
              },
            ],
          });
        }
      } else {
        // Flag-driven presets
        if (template === 'react-fastapi') {
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

      logger.info(`Bootstrapping new project '${targetName}'...`);

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
        process.exit(1);
      }

      logger.success(`Successfully initialized '${targetName}'!`);
      if (mode === 'fullstack') {
        logger.info(`✔ Configured CORS & Pre-configured API client (frontend -> backend)`);
      }
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
