export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  nextSteps: string[];
}

export function getStarterTemplates(projectName: string): Record<string, StarterTemplate> {
  return {
    nextjs: {
      id: 'nextjs',
      name: 'Next.js 15+ (App Router)',
      description: 'Modern fullstack React framework with App Router, Server Actions, and Tailwind CSS',
      files: {
        'package.json': JSON.stringify(
          {
            name: projectName,
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
            dependencies: {
              react: '^19.0.0',
              'react-dom': '^19.0.0',
              next: '^15.1.0',
            },
            devDependencies: {
              typescript: '^5.7.2',
              '@types/node': '^22.10.2',
              '@types/react': '^19.0.0',
              '@types/react-dom': '^19.0.0',
              tailwindcss: '^3.4.17',
              postcss: '^8.4.49',
              autoprefixer: '^10.4.20',
            },
          },
          null,
          2
        ),
        'app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Built with CodersTrim and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {/* @CodersTrim-Inject-Providers */}
        {children}
      </body>
    </html>
  );
}
`,
        'app/page.tsx': `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ${projectName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (Next.js 15 App Router).
        </p>
        {/* @CodersTrim-Inject-Components */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">app/page.tsx</span> to get started!
        </div>
      </div>
    </main>
  );
}
`,
        'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: ['@coderstrim/plugin-tailwind', '@coderstrim/plugin-nextjs'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'npm install', 'npm run dev'],
    },

    laravel: {
      id: 'laravel',
      name: 'Laravel 11+ (Modular PHP)',
      description: 'Modern PHP fullstack framework with clean directory layout and Blade templating',
      files: {
        'composer.json': JSON.stringify(
          {
            name: `app/${projectName}`,
            type: 'project',
            description: 'CodersTrim Laravel 11 starter project',
            require: {
              php: '^8.2',
              'laravel/framework': '^11.0',
            },
          },
          null,
          2
        ),
        'routes/web.php': `<?php

use Illuminate\\Support\\Facades\\Route;

Route::get('/', function () {
    return view('welcome');
});

// @CodersTrim-Inject-Routes
`,
        'resources/views/welcome.blade.php': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-6 text-center">
    <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 class="text-3xl font-extrabold tracking-tight text-white">${projectName}</h1>
        <p class="mt-4 text-sm text-slate-400">Scaffolded with <span class="font-semibold text-red-500">CodersTrim</span> (Laravel 11 Modular).</p>
        <!-- @CodersTrim-Inject-Components -->
    </div>
</body>
</html>
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: ['@coderstrim/plugin-tailwind', '@coderstrim/plugin-laravel'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'composer install', 'php artisan serve'],
    },

    fastapi: {
      id: 'fastapi',
      name: 'FastAPI (Python 3.10+)',
      description: 'Ultra-fast asynchronous Python web API with Pydantic v2 and automatic OpenAPI docs',
      files: {
        'requirements.txt': `fastapi>=0.115.0\nuvicorn[standard]>=0.32.0\npydantic>=2.10.0\n`,
        'main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="${projectName}",
    description="Built with CodersTrim and FastAPI",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "app": "${projectName}"}

# @CodersTrim-Inject-Routers
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: ['@coderstrim/plugin-fastapi'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'pip install -r requirements.txt', 'uvicorn main:app --reload'],
    },
  };
}
