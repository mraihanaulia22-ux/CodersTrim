export function getReactTemplateFiles(projectName: string): Record<string, string> {
  return {
    'package.json': JSON.stringify(
      {
        name: projectName,
        private: true,
        version: '0.1.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.3.4',
          autoprefixer: '^10.4.20',
          postcss: '^8.4.49',
          tailwindcss: '^3.4.17',
          typescript: '~5.7.2',
          vite: '^6.0.7',
        },
      },
      null,
      2
    ),

    'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,

    'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

    'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

    'src/App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ${projectName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (React 19 + Vite + Tailwind CSS).
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {/* @CodersTrim-Inject-Components */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
            Edit <span className="text-indigo-400">src/App.tsx</span> to start building!
          </div>
        </div>
      </div>
    </div>
  );
}
`,

    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;
`,

    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,

    'coderstrim.config.json': JSON.stringify(
      {
        plugins: ['@coderstrim/plugin-tailwind', '@coderstrim/plugin-react'],
        doctor: {
          maxLevenshteinDistance: 2,
          confidenceThreshold: 0.85,
        },
      },
      null,
      2
    ),

    '.gitignore': `# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
`,
  };
}
