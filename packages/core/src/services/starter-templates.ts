export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack';
  defaultPort?: number;
  files: Record<string, string>;
  nextSteps: string[];
}

export const DEV_TOOLBAR_REACT_TEMPLATE = `import React, { useState, useEffect } from 'react';

type ViewportMode = 'full' | 'mobile' | 'tablet';

export function CodersTrimDevToolbar() {
  const [mode, setMode] = useState<ViewportMode>('full');
  const [isRotated, setIsRotated] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpoint = (w: number) => {
    if (w >= 1536) return '2xl';
    if (w >= 1280) return 'xl';
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 640) return 'sm';
    return 'default';
  };

  const getDeviceDimensions = () => {
    if (mode === 'mobile') return isRotated ? { w: 844, h: 390 } : { w: 390, h: 844 };
    if (mode === 'tablet') return isRotated ? { w: 1024, h: 768 } : { w: 768, h: 1024 };
    return { w: 0, h: 0 };
  };

  const dims = getDeviceDimensions();

  if (typeof window !== 'undefined' && window.self !== window.top) {
    return null;
  }

  return (
    <>
      {mode !== 'full' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-4 py-2 text-xs font-medium text-slate-300 shadow-2xl backdrop-blur-xl">
            <span className="font-semibold text-indigo-400">⚡ CodersTrim Preview</span>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setMode('mobile')}
              className={\`rounded-lg px-2.5 py-1 transition \${mode === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'}\`}
            >
              📱 Mobile (390px)
            </button>
            <button
              onClick={() => setMode('tablet')}
              className={\`rounded-lg px-2.5 py-1 transition \${mode === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'}\`}
            >
              💻 Tablet (768px)
            </button>
            <button
              onClick={() => setIsRotated(!isRotated)}
              className="rounded-lg px-2.5 py-1 hover:bg-slate-800 text-slate-400 transition"
              title="Rotate orientation"
            >
              🔄 Rotate
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setMode('full')}
              className="rounded-lg bg-red-500/20 px-2.5 py-1 text-red-400 hover:bg-red-500/30 transition font-semibold"
            >
              ✕ Exit
            </button>
          </div>

          <div
            style={{ width: \`\${dims.w}px\`, height: \`\${dims.h}px\`, maxHeight: '85vh' }}
            className="relative flex flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ring-1 ring-slate-700/50"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 h-5 w-28 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-800" />
            </div>

            <iframe
              src={typeof window !== 'undefined' ? window.location.href : '/'}
              title="CodersTrim Device Viewport"
              className="h-full w-full border-none pt-4 bg-slate-950"
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40 flex items-center">
        {isExpanded ? (
          <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl transition-all">
            <button
              onClick={() => { setMode('mobile'); setIsExpanded(false); }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
            >
              📱 <span>390px</span>
            </button>
            <button
              onClick={() => { setMode('tablet'); setIsExpanded(false); }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
            >
              💻 <span>768px</span>
            </button>
            <button
              onClick={() => { setMode('full'); setIsExpanded(false); }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              🖥️ <span>Full</span>
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="h-7 w-7 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="group flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-2xl backdrop-blur-xl transition hover:border-indigo-500/50 hover:bg-slate-800 hover:shadow-indigo-500/10"
          >
            <span className="text-indigo-400">⚡</span>
            <span>{windowWidth}px</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 group-hover:text-indigo-300">
              {getBreakpoint(windowWidth)}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
export default CodersTrimDevToolbar;
`;

export function getStarterTemplates(projectName: string): Record<string, StarterTemplate> {
  return {
    react: {
      id: 'react',
      name: 'React 19 + Vite (SPA)',
      description: 'Modern single-page application with React 19, Vite, TypeScript, and Tailwind CSS',
      type: 'frontend',
      defaultPort: 5173,
      files: {
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
        'src/components/CodersTrimDevToolbar.tsx': DEV_TOOLBAR_REACT_TEMPLATE,
        'src/App.tsx': `import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api';
import { CodersTrimDevToolbar } from './components/CodersTrimDevToolbar';

export default function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking backend...');

  useEffect(() => {
    checkBackendHealth()
      .then((res) => setApiStatus(res.message || 'Backend Connected!'))
      .catch(() => setApiStatus('Standalone mode (No backend connected)'));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ${projectName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (React 19 + Vite + Tailwind CSS).
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300">
          Backend status: <span className="text-emerald-400">{apiStatus}</span>
        </div>

        {/* @CodersTrim-Inject-Components */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">src/App.tsx</span> to start building!
        </div>
      </div>
      <CodersTrimDevToolbar />
    </div>
  );
}
`,
        'src/services/api.ts': `export const API_BASE_URL = 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(\`\${API_BASE_URL}/health\`);
    if (!res.ok) {
      const fallbackRes = await fetch(\`\${API_BASE_URL}/api/health\`);
      return await fallbackRes.json();
    }
    return await res.json();
  } catch {
    throw new Error('Backend unreachable');
  }
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
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'npm install', 'npm run dev'],
    },

    nextjs: {
      id: 'nextjs',
      name: 'Next.js 15+ (App Router)',
      description: 'Modern fullstack React framework with App Router, Server Actions, and Tailwind CSS',
      type: 'fullstack',
      defaultPort: 3000,
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
        'components/CodersTrimDevToolbar.tsx': "'use client';\\n" + DEV_TOOLBAR_REACT_TEMPLATE,
        'app/page.tsx': `import { CodersTrimDevToolbar } from '../components/CodersTrimDevToolbar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          \${projectName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (Next.js 15 App Router).
        </p>
        {/* @CodersTrim-Inject-Components */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">app/page.tsx</span> to get started!
        </div>
      </div>
      <CodersTrimDevToolbar />
    </main>
  );
}
`,
        'app/api/health/route.ts': `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    framework: 'Next.js 15 App Router',
    app: '${projectName}',
  });
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
      name: 'Laravel 11+ (Blade MVC Fullstack)',
      description: 'Modern PHP fullstack monolith with MVC structure, Blade templating, SQLite, and Tailwind CSS',
      type: 'fullstack',
      defaultPort: 8000,
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
        'app/Http/Controllers/Controller.php': `<?php

namespace App\\Http\\Controllers;

abstract class Controller
{
    // Base Controller
}
`,
        'app/Http/Controllers/HomeController.php': `<?php

namespace App\\Http\\Controllers;

class HomeController extends Controller
{
    public function index()
    {
        return view('welcome', [
            'appName' => '${projectName}',
            'status' => 'CodersTrim Laravel 11 Core Active'
        ]);
    }
}
`,
        'app/Models/User.php': `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];
}
`,
        'database/migrations/2026_01_01_000000_create_users_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
`,
        'database/database.sqlite': '',
        'routes/web.php': `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\HomeController;

Route::get('/', [HomeController::class, 'index']);

// @CodersTrim-Inject-Routes
`,
        'routes/api.php': `<?php

use Illuminate\\Support\\Facades\\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'app' => '${projectName}']);
});

// @CodersTrim-Inject-Routes
`,
        'resources/views/welcome.blade.php': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName ?? '\${projectName}' }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-6 text-center">
    <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 class="text-3xl font-extrabold tracking-tight text-white">{{ $appName ?? '\${projectName}' }}</h1>
        <p class="mt-4 text-sm text-slate-400">Scaffolded with <span class="font-semibold text-red-500">CodersTrim</span> (Laravel 11 Modular MVC).</p>
        <div class="mt-6 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
            <div>Controllers: <span class="text-emerald-400">app/Http/Controllers/HomeController.php</span></div>
            <div>Models: <span class="text-emerald-400">app/Models/User.php</span></div>
            <div>Database: <span class="text-emerald-400">database/database.sqlite</span></div>
        </div>
        <!-- @CodersTrim-Inject-Components -->
    </div>

    <!-- CodersTrim Floating Dev Toolbar -->
    <div id="coderstrim-dev-toolbar" class="fixed bottom-5 right-5 z-40 flex items-center font-sans text-xs">
        <button id="ct-badge-btn" class="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-slate-300 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition">
            <span class="text-indigo-400">⚡</span>
            <span id="ct-width-display">---px</span>
        </button>
        <div id="ct-menu" class="hidden items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
            <button onclick="window.__ctSetMode('mobile')" class="rounded-full px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 transition">📱 390px</button>
            <button onclick="window.__ctSetMode('tablet')" class="rounded-full px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 transition">💻 768px</button>
            <button onclick="window.__ctSetMode('full')" class="rounded-full px-3 py-1.5 font-semibold text-indigo-400 hover:bg-slate-800 transition">🖥️ Full</button>
        </div>
    </div>
    <div id="ct-modal" class="fixed inset-0 z-50 hidden flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
        <div class="mb-4 flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-300 shadow-2xl backdrop-blur-xl">
            <span class="font-semibold text-indigo-400">⚡ CodersTrim Preview</span>
            <button onclick="window.__ctSetMode('full')" class="rounded-lg bg-red-500/20 px-2.5 py-1 text-red-400 hover:bg-red-500/30 transition">✕ Exit</button>
        </div>
        <div id="ct-frame-container" class="relative flex flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300">
            <iframe id="ct-iframe" src="" class="h-full w-full border-none pt-4 bg-slate-950"></iframe>
        </div>
    </div>
    <script>
    (function() {
        if (window.self !== window.top) {
            var tb = document.getElementById('coderstrim-dev-toolbar');
            if (tb) tb.style.display = 'none';
            return;
        }
        var badge = document.getElementById('ct-badge-btn');
        var menu = document.getElementById('ct-menu');
        var widthDisplay = document.getElementById('ct-width-display');
        var modal = document.getElementById('ct-modal');
        var iframe = document.getElementById('ct-iframe');
        var container = document.getElementById('ct-frame-container');
        function updateWidth() { if (widthDisplay) widthDisplay.textContent = window.innerWidth + 'px'; }
        window.addEventListener('resize', updateWidth);
        updateWidth();
        if (badge) {
            badge.addEventListener('click', function() {
                badge.classList.add('hidden');
                menu.classList.remove('hidden');
                menu.classList.add('flex');
            });
        }
        window.__ctSetMode = function(mode) {
            if (mode === 'full') {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                iframe.src = '';
            } else {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                iframe.src = window.location.href;
                if (mode === 'mobile') { container.style.width = '390px'; container.style.height = '844px'; }
                else if (mode === 'tablet') { container.style.width = '768px'; container.style.height = '1024px'; }
                container.style.maxHeight = '85vh';
            }
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            badge.classList.remove('hidden');
        };
    })();
    </script>
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

    'laravel-api': {
      id: 'laravel-api',
      name: 'Laravel 11+ (Modular REST API)',
      description: 'Headless PHP REST API with JSON resources, SQLite, CORS support, and API routes',
      type: 'backend',
      defaultPort: 8000,
      files: {
        'composer.json': JSON.stringify(
          {
            name: `app/${projectName}`,
            type: 'project',
            description: 'CodersTrim Laravel 11 REST API starter',
            require: {
              php: '^8.2',
              'laravel/framework': '^11.0',
            },
          },
          null,
          2
        ),
        'app/Http/Controllers/Controller.php': `<?php

namespace App\\Http\\Controllers;

abstract class Controller
{
    // Base Controller
}
`,
        'app/Http/Controllers/Api/UserController.php': `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                ['id' => 1, 'name' => 'Demo User', 'role' => 'Developer']
            ]
        ]);
    }
}
`,
        'app/Models/User.php': `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];
}
`,
        'database/migrations/2026_01_01_000000_create_users_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
`,
        'database/database.sqlite': '',
        'routes/api.php': `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\UserController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'message' => 'Laravel 11 REST API connected!',
        'app' => '${projectName}'
    ]);
});

Route::get('/users', [UserController::class, 'index']);

// @CodersTrim-Inject-Routes
`,
        'config/cors.php': `<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'health'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: ['@coderstrim/plugin-laravel'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'composer install', 'php artisan serve --port=8000'],
    },

    fastapi: {
      id: 'fastapi',
      name: 'FastAPI (Python 3.10+)',
      description: 'Ultra-fast asynchronous Python web API with Pydantic v2, routers, and automatic OpenAPI docs',
      type: 'backend',
      defaultPort: 8000,
      files: {
        'requirements.txt': `fastapi>=0.115.0\nuvicorn[standard]>=0.32.0\npydantic>=2.10.0\n`,
        'main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import items

app = FastAPI(
    title="${projectName}",
    description="Built with CodersTrim and FastAPI",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router, prefix="/api/v1")

@app.get("/")
@app.get("/health")
def read_health():
    return {
        "status": "healthy",
        "message": "FastAPI Python backend connected!",
        "app": "${projectName}"
    }

# @CodersTrim-Inject-Routers
`,
        'app/models.py': `from pydantic import BaseModel

class Item(BaseModel):
    id: int
    title: str
    description: str | None = None
`,
        'app/routers/items.py': `from fastapi import APIRouter
from app.models import Item

router = APIRouter(tags=["Items"])

@router.get("/items", response_model=list[Item])
def get_items():
    return [
        {"id": 1, "title": "First Item", "description": "Scaffolded with CodersTrim"},
        {"id": 2, "title": "Second Item", "description": "Ready to customize"}
    ]
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
      nextSteps: [`cd ${projectName}`, 'pip install -r requirements.txt', 'uvicorn main:app --reload --port 8000'],
    },

    gofiber: {
      id: 'gofiber',
      name: 'Go Fiber (Go 1.22+)',
      description: 'Blazing fast Go microservice web framework with Express-inspired routing and SQLite readiness',
      type: 'backend',
      defaultPort: 8080,
      files: {
        'go.mod': `module ${projectName}

go 1.22

require (
\tgithub.com/gofiber/fiber/v2 v2.52.5
)
`,
        'main.go': `package main

import (
\t"log"
\t"${projectName}/handlers"

\t"github.com/gofiber/fiber/v2"
\t"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
\tapp := fiber.New()

\tapp.Use(cors.New(cors.Config{
\t\tAllowOrigins: "http://localhost:5173, http://localhost:3000, http://127.0.0.1:5173",
\t\tAllowHeaders: "Origin, Content-Type, Accept",
\t}))

\tapp.Get("/health", func(c *fiber.Ctx) error {
\t\treturn c.JSON(fiber.Map{
\t\t\t"status":  "healthy",
\t\t\t"message": "Go Fiber microservice connected!",
\t\t\t"app":     "${projectName}",
\t\t})
\t})

\tapp.Get("/api/users", handlers.GetUsers)

\t// @CodersTrim-Inject-Routes

\tlog.Fatal(app.Listen(":8080"))
}
`,
        'models/user.go': `package models

type User struct {
\tID   int    \`json:"id"\`
\tName string \`json:"name"\`
\tRole string \`json:"role"\`
}
`,
        'handlers/user.go': `package handlers

import (
\t"${projectName}/models"

\t"github.com/gofiber/fiber/v2"
)

func GetUsers(c *fiber.Ctx) error {
\tusers := []models.User{
\t\t{ID: 1, Name: "Admin User", Role: "Administrator"},
\t\t{ID: 2, Name: "Developer User", Role: "Engineer"},
\t}
\treturn c.JSON(users)
}
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: ['@coderstrim/plugin-gofiber'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'go mod tidy', 'go run main.go'],
    },

    expo: {
      id: 'expo',
      name: 'Expo (React Native + TypeScript)',
      description: 'Universal mobile app for iOS, Android, and Web powered by React Native and Expo Router',
      type: 'frontend',
      defaultPort: 8081,
      files: {
        'package.json': JSON.stringify(
          {
            name: projectName,
            version: '1.0.0',
            main: 'expo-router/entry',
            scripts: {
              start: 'expo start',
              dev: 'expo start --web',
              android: 'expo start --android',
              ios: 'expo start --ios',
              web: 'expo start --web',
            },
            dependencies: {
              expo: '~52.0.0',
              'expo-router': '~4.0.0',
              'expo-status-bar': '~2.0.0',
              react: '18.3.1',
              'react-native': '0.76.5',
            },
            devDependencies: {
              typescript: '^5.3.3',
              '@types/react': '~18.3.12',
            },
          },
          null,
          2
        ),
        'app.json': JSON.stringify(
          {
            expo: {
              name: projectName,
              slug: projectName,
              version: '1.0.0',
              orientation: 'portrait',
              icon: './assets/icon.png',
              scheme: projectName,
              userInterfaceStyle: 'automatic',
              newArchEnabled: true,
              ios: { supportsTablet: true },
              android: {
                adaptiveIcon: {
                  backgroundColor: '#020617',
                },
              },
              web: {
                bundler: 'metro',
                output: 'static',
              },
              plugins: ['expo-router'],
            },
          },
          null,
          2
        ),
        'app/_layout.tsx': `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#f8fafc',
        contentStyle: { backgroundColor: '#020617' },
      }} />
    </>
  );
}
`,
        'app/index.tsx': `import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { checkBackendHealth } from '../services/api';

export default function HomeScreen() {
  const [status, setStatus] = useState('Connecting to backend...');

  useEffect(() => {
    checkBackendHealth()
      .then((res) => setStatus(res.message || 'Backend Connected!'))
      .catch(() => setStatus('Standalone Mobile Mode'));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>📱 CodersTrim Mobile</Text>
        <Text style={styles.title}>${projectName}</Text>
        <Text style={styles.subtitle}>
          Powered by React Native, Expo Router, and TypeScript.
        </Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Backend Status:</Text>
          <Text style={styles.statusValue}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  badge: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statusBox: {
    marginTop: 24,
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
`,
        'services/api.ts': `export const API_BASE_URL = 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(\`\${API_BASE_URL}/health\`);
    if (!res.ok) {
      const fallback = await fetch(\`\${API_BASE_URL}/api/health\`);
      return await fallback.json();
    }
    return await res.json();
  } catch {
    throw new Error('Backend unreachable');
  }
}
`,
        'tsconfig.json': JSON.stringify(
          {
            extends: 'expo/tsconfig.base',
            compilerOptions: { strict: true },
          },
          null,
          2
        ),
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: [],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'npx expo start --web'],
    },

    capacitor: {
      id: 'capacitor',
      name: 'Capacitor (React 19 + Tailwind Mobile Hybrid)',
      description: 'Universal web-to-mobile hybrid container for wrapping React/Tailwind into native Android & iOS APKs',
      type: 'frontend',
      defaultPort: 5173,
      files: {
        'package.json': JSON.stringify(
          {
            name: projectName,
            private: true,
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc -b && vite build',
              'cap:sync': 'npx cap sync',
              'cap:android': 'npx cap run android',
              'cap:ios': 'npx cap run ios',
            },
            dependencies: {
              '@capacitor/android': '^7.0.0',
              '@capacitor/core': '^7.0.0',
              '@capacitor/ios': '^7.0.0',
              react: '^19.0.0',
              'react-dom': '^19.0.0',
            },
            devDependencies: {
              '@capacitor/cli': '^7.0.0',
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
        'capacitor.config.json': JSON.stringify(
          {
            appId: `com.coderstrim.${projectName.replace(/[^a-zA-Z0-9]/g, '')}`,
            appName: projectName,
            webDir: 'dist',
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
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
        'src/services/api.ts': `export const API_BASE_URL = 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(\`\${API_BASE_URL}/health\`);
    if (!res.ok) {
      const fallback = await fetch(\`\${API_BASE_URL}/api/health\`);
      return await fallback.json();
    }
    return await res.json();
  } catch {
    throw new Error('Backend unreachable');
  }
}
`,
        'src/components/CodersTrimDevToolbar.tsx': DEV_TOOLBAR_REACT_TEMPLATE,
        'src/App.tsx': `import React from 'react';
import { CodersTrimDevToolbar } from './components/CodersTrimDevToolbar';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl max-w-sm w-full">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
          🌐 Hybrid Mobile
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          ${projectName}
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          React 19 + Tailwind CSS wrapped in native Capacitor container (Android & iOS ready).
        </p>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300">
          Build APK: <span className="text-emerald-400">npx cap sync</span>
        </div>
      </div>
      <CodersTrimDevToolbar />
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
            plugins: ['@coderstrim/plugin-tailwind'],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'npm install', 'npm run dev', 'npx cap sync'],
    },

    flutter: {
      id: 'flutter',
      name: 'Flutter (Google Dart Mobile)',
      description: 'Multi-platform mobile app compiled to native ARM machine code with Skia rendering',
      type: 'frontend',
      defaultPort: 8080,
      files: {
        'pubspec.yaml': `name: ${projectName.replace(/-/g, '_')}
description: "A new Flutter project created with CodersTrim."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
        'lib/main.dart': `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${projectName}',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617),
        cardColor: const Color(0xFF0F172A),
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 380),
            padding: const EdgeInsets.all(32.0),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'FLUTTER MOBILE',
                  style: TextStyle(
                    color: Color(0xFF818CF8),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  '${projectName}',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Scaffolded with CodersTrim. Ready for Android, iOS, and Web deployment.',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`,
        'web/index.html': `<!DOCTYPE html>
<html>
<head>
  <base href="/">
  <meta charset="UTF-8">
  <title>${projectName}</title>
</head>
<body style="background-color: #020617; margin: 0;">
  <script src="flutter_bootstrap.js" async></script>
</body>
</html>
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: [],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'flutter pub get', 'flutter run -d chrome'],
    },

    supabase: {
      id: 'supabase',
      name: 'Supabase (PostgreSQL BaaS)',
      description: 'Open-source Firebase alternative with PostgreSQL, Instant Auth, Realtime, and SQL Migrations',
      type: 'backend',
      files: {
        'services/supabase.ts': `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`,
        'supabase/migrations/20260101_initial_schema.sql': `-- CodersTrim Supabase Initial Migration Schema
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
`,
        '.env.example': `SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: [],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'cp .env.example .env (and fill with your Supabase keys)'],
    },

    firebase: {
      id: 'firebase',
      name: 'Firebase (Google BaaS)',
      description: 'Google mobile and web backend platform with Firestore, Auth, and Cloud Messaging (FCM)',
      type: 'backend',
      files: {
        'services/firebase.ts': `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyYourApiKey",
  authDomain: "${projectName}.firebaseapp.com",
  projectId: "${projectName}",
  storageBucket: "${projectName}.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
`,
        'firestore.rules': `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`,
        '.env.example': `FIREBASE_API_KEY=AIzaSyYourApiKey
FIREBASE_PROJECT_ID=${projectName}
`,
        'coderstrim.config.json': JSON.stringify(
          {
            plugins: [],
            doctor: { maxLevenshteinDistance: 2, confidenceThreshold: 0.85 },
          },
          null,
          2
        ),
      },
      nextSteps: [`cd ${projectName}`, 'cp .env.example .env (and fill with your Firebase keys)'],
    },
  };
}
