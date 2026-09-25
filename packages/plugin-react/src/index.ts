import type { CodersTrimPlugin, PluginContext } from '@coderstrim/core';
import { getReactTemplateFiles } from './templates.js';

export * from './templates.js';

/**
 * Official React.js (Vite + React 19) Plugin for CodersTrim.
 */
export const reactPlugin: CodersTrimPlugin = {
  name: '@coderstrim/plugin-react',
  version: '2.0.0',
  author: 'CodersTrim Team',
  description: 'Official React 19 + Vite + Tailwind CSS starter and injector for CodersTrim',
  type: 'framework',

  hooks: {
    async onInit(ctx: PluginContext, options?: Record<string, unknown>) {
      const projectName = (options?.projectName as string) || 'react-app';
      const files = getReactTemplateFiles(projectName);
      const filesCreated: string[] = [];

      for (const [relPath, content] of Object.entries(files)) {
        await ctx.fs.writeFileSafe(relPath, content);
        filesCreated.push(relPath);
      }

      ctx.ui.success(`Scaffolded ${filesCreated.length} files for React 19 + Vite + Tailwind.`);

      return {
        filesCreated,
        nextSteps: [
          `cd ${projectName}`,
          'npm install',
          'npm run dev',
        ],
      };
    },

    async onInject(ctx: PluginContext, feature: string) {
      if (feature === 'router') {
        const injected = await ctx.fs.injectAtAnchor(
          'src/App.tsx',
          'Components',
          '<p className="text-xs text-indigo-400">React Router support active.</p>'
        );
        if (injected) {
          ctx.ui.success('Injected router placeholder into src/App.tsx');
        }
      }
    },
  },

  contributes: {
    injectables: [
      {
        id: 'router',
        name: 'React Router',
        description: 'Single Page Application client routing setup',
      },
    ],
  },
};

export default reactPlugin;
