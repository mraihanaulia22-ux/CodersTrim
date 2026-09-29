import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.ico',
  '.webp',
  '.gif',
  '.jar',
  '.so',
  '.dylib',
  '.class',
  '.tar',
  '.gz',
  '.zip',
  '.sqlite',
]);

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.dart_tool',
  'build',
  'dist',
  '.next',
  'vendor',
  '.expo'
]);

/**
 * Resolves the absolute directory path where starter templates are located.
 * Works across ESM, CJS, local monorepo development, and npm published bundles.
 */
export function getTemplatesDir(): string {
  let currentDir = '';
  try {
    if (typeof __dirname !== 'undefined') {
      currentDir = __dirname;
    } else {
      currentDir = path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    currentDir = process.cwd();
  }

  const candidatePaths = [
    path.resolve(currentDir, '../templates'),
    path.resolve(currentDir, '../../templates'),
    path.resolve(currentDir, 'templates'),
    path.resolve(process.cwd(), 'packages/core/templates'),
    path.resolve(process.cwd(), 'node_modules/@coderstrim/core/templates'),
  ];

  for (const candidate of candidatePaths) {
    if (fsSync.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(currentDir, '../templates');
}

export function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack';
  defaultPort?: number;
  nextSteps: string[];
}

export const TEMPLATE_METADATA_MAP: Record<string, TemplateMetadata> = {
  react: {
    id: 'react',
    name: 'React 19 + Vite 6 (SPA)',
    description: 'Modern single-page application with React 19, Vite 6, TypeScript, and Tailwind CSS v4',
    type: 'frontend',
    defaultPort: 5173,
    nextSteps: ['npm install', 'npm run dev'],
  },
  nextjs: {
    id: 'nextjs',
    name: 'Next.js 16+ (App Router)',
    description: 'Modern fullstack React framework with Next.js 16 App Router and Tailwind CSS v4',
    type: 'fullstack',
    defaultPort: 3000,
    nextSteps: ['npm install', 'npm run dev'],
  },
  laravel: {
    id: 'laravel',
    name: 'Laravel 13+ (Blade MVC Fullstack)',
    description: 'Modern PHP fullstack monolith with MVC structure, Blade, SQLite, and Tailwind CSS',
    type: 'fullstack',
    defaultPort: 8000,
    nextSteps: ['composer install', 'cp .env.example .env', 'php artisan key:generate', 'php artisan migrate', 'php artisan serve'],
  },
  'laravel-api': {
    id: 'laravel-api',
    name: 'Laravel 13+ (Modular REST API)',
    description: 'Headless PHP REST API with JSON resources, SQLite, CORS support, and Sanctum',
    type: 'backend',
    defaultPort: 8000,
    nextSteps: ['composer install', 'cp .env.example .env', 'php artisan key:generate', 'php artisan migrate', 'php artisan serve'],
  },
  expo: {
    id: 'expo',
    name: 'Expo (React Native Mobile)',
    description: 'Universal mobile app for iOS, Android, and Web built with Expo SDK 57 and React Native 0.86',
    type: 'frontend',
    defaultPort: 8081,
    nextSteps: ['npm install', 'npx expo start --web'],
  },
  flutter: {
    id: 'flutter',
    name: 'Flutter (Dart Multi-Platform Mobile)',
    description: 'Native mobile app for iOS and Android built with Flutter and modular clean architecture',
    type: 'frontend',
    nextSteps: ['flutter pub get', 'flutter run -d chrome'],
  },
  fastapi: {
    id: 'fastapi',
    name: 'FastAPI (Python REST Backend)',
    description: 'High-performance asynchronous Python API with automatic OpenAPI docs and CORS',
    type: 'backend',
    defaultPort: 8000,
    nextSteps: ['python -m venv venv', 'pip install -r requirements.txt', 'cp .env.example .env', 'uvicorn main:app --reload'],
  },
  gofiber: {
    id: 'gofiber',
    name: 'Go Fiber (High-Performance Backend)',
    description: 'Ultra-fast web and REST API service built with Go and Go Fiber',
    type: 'backend',
    defaultPort: 8080,
    nextSteps: ['go mod tidy', 'cp .env.example .env', 'go run main.go'],
  },
  capacitor: {
    id: 'capacitor',
    name: 'Capacitor (React 19 + Tailwind Mobile Hybrid)',
    description: 'Universal web-to-mobile hybrid container for wrapping React/Tailwind into native Android & iOS APKs',
    type: 'frontend',
    defaultPort: 5173,
    nextSteps: ['npm install', 'npm run build', 'npx cap add android', 'npx cap sync'],
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase (PostgreSQL Cloud BaaS)',
    description: 'Cloud PostgreSQL database with Row Level Security (RLS) schemas and config',
    type: 'backend',
    defaultPort: 54321,
    nextSteps: ['npx supabase start', 'npx supabase db reset'],
  },
  firebase: {
    id: 'firebase',
    name: 'Firebase (Realtime BaaS)',
    description: 'Firebase Cloud Firestore, Storage rules, and CLI project configuration',
    type: 'backend',
    nextSteps: ['npx firebase login', 'npx firebase emulators:start'],
  },
};

export interface LoadTemplateOptions {
  templateId: string;
  projectName: string;
  backendPort?: number;
  apiBaseUrl?: string;
}

/**
 * Loads all files from the real template directory synchronously.
 * Guarantees zero latency and full compatibility with existing services.
 */
export function loadTemplateFilesSync(
  options: LoadTemplateOptions
): Record<string, string> {
  const { templateId, projectName = 'my-coderstrim-app', backendPort = 8000, apiBaseUrl = `http://localhost:${backendPort}` } = options;
  const safeProjectName = projectName || 'my-coderstrim-app';
  const templatesRoot = getTemplatesDir();
  const templateDir = path.join(templatesRoot, templateId);

  const filesRecord: Record<string, string> = {};
  const appId = safeProjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dartPackage = safeProjectName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  if (!fsSync.existsSync(templateDir)) {
    return filesRecord;
  }

  function walkDirSync(currentPath: string, relativePath: string = '') {
    const entries = fsSync.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(currentPath, entry.name);
      
      let targetName = entry.name;
      if (targetName === '_gitignore') {
        targetName = '.gitignore';
      } else {
        targetName = targetName
          .replace(/__CT_PROJECT_NAME__/g, safeProjectName)
          .replace(/coderstrim_app/g, dartPackage);
      }

      const relPath = relativePath ? `${relativePath}/${targetName}` : targetName;

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          walkDirSync(srcPath, relPath);
        }
      } else if (entry.isFile()) {
        if (isBinaryFile(srcPath)) {
          // For backwards-compatibility with Record<string, string>, encode binary as latin1 string
          filesRecord[relPath] = fsSync.readFileSync(srcPath, 'binary');
        } else {
          let text = fsSync.readFileSync(srcPath, 'utf-8');
          text = text
            .replace(/__CT_PROJECT_NAME__/g, safeProjectName)
            .replace(/__CT_APP_ID__/g, appId)
            .replace(/__CT_BACKEND_PORT__/g, String(backendPort))
            .replace(/__CT_API_BASE_URL__/g, apiBaseUrl)
            .replace(/coderstrim_app/g, dartPackage)
            .replace(/com\.coderstrim\.coderstrim_app/g, `com.coderstrim.${dartPackage}`);
          
          filesRecord[relPath] = text;
        }
      }
    }
  }

  walkDirSync(templateDir);
  return filesRecord;
}

/**
 * Asynchronously loads all files from the template directory.
 */
export async function loadTemplateFiles(
  options: LoadTemplateOptions
): Promise<Record<string, string | Buffer>> {
  const { templateId, projectName = 'my-coderstrim-app', backendPort = 8000, apiBaseUrl = `http://localhost:${backendPort}` } = options;
  const safeProjectName = projectName || 'my-coderstrim-app';
  const templatesRoot = getTemplatesDir();
  const templateDir = path.join(templatesRoot, templateId);

  const filesRecord: Record<string, string | Buffer> = {};
  const appId = safeProjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dartPackage = safeProjectName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  async function walkDir(currentPath: string, relativePath: string = '') {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(currentPath, entry.name);
      
      let targetName = entry.name;
      if (targetName === '_gitignore') {
        targetName = '.gitignore';
      } else {
        targetName = targetName
          .replace(/__CT_PROJECT_NAME__/g, safeProjectName)
          .replace(/coderstrim_app/g, dartPackage);
      }

      const relPath = relativePath ? `${relativePath}/${targetName}` : targetName;

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          await walkDir(srcPath, relPath);
        }
      } else if (entry.isFile()) {
        if (isBinaryFile(srcPath)) {
          filesRecord[relPath] = await fs.readFile(srcPath);
        } else {
          let text = await fs.readFile(srcPath, 'utf-8');
          text = text
            .replace(/__CT_PROJECT_NAME__/g, safeProjectName)
            .replace(/__CT_APP_ID__/g, appId)
            .replace(/__CT_BACKEND_PORT__/g, String(backendPort))
            .replace(/__CT_API_BASE_URL__/g, apiBaseUrl)
            .replace(/coderstrim_app/g, dartPackage)
            .replace(/com\.coderstrim\.coderstrim_app/g, `com.coderstrim.${dartPackage}`);
          
          filesRecord[relPath] = text;
        }
      }
    }
  }

  await walkDir(templateDir);
  return filesRecord;
}
