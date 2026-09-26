export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack';
  defaultPort?: number;
  files: Record<string, string>;
  nextSteps: string[];
}

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
        'src/App.tsx': `import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api';

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
    <title>{{ $appName ?? '${projectName}' }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-6 text-center">
    <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-lg w-full">
        <h1 class="text-3xl font-extrabold tracking-tight text-white">{{ $appName ?? '${projectName}' }}</h1>
        <p class="mt-4 text-sm text-slate-400">Scaffolded with <span class="font-semibold text-red-500">CodersTrim</span> (Laravel 11 Modular MVC).</p>
        <div class="mt-6 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-400">
            <div>Controllers: <span class="text-emerald-400">app/Http/Controllers/HomeController.php</span></div>
            <div>Models: <span class="text-emerald-400">app/Models/User.php</span></div>
            <div>Database: <span class="text-emerald-400">database/database.sqlite</span></div>
        </div>
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
  };
}
