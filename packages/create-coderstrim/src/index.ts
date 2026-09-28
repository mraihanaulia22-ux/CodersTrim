import { select, input } from '@inquirer/prompts';
import { Command } from 'commander';
import pc from 'picocolors';
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
        // Flag-driven presets
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
