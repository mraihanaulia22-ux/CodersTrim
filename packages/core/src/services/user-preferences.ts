import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import pc from 'picocolors';

export interface UserPreferences {
  skillLevel: 'beginner' | 'pro';
  showTerminalTips: boolean;
  telemetry: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  skillLevel: 'beginner',
  showTerminalTips: true,
  telemetry: false,
};

export function getPreferencesFilePath(): string {
  return path.join(os.homedir(), '.coderstrimrc');
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const filePath = getPreferencesFilePath();
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      skillLevel: parsed.skillLevel === 'pro' ? 'pro' : 'beginner',
      showTerminalTips: parsed.showTerminalTips !== false,
      telemetry: Boolean(parsed.telemetry),
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await getUserPreferences();
  const updated: UserPreferences = {
    ...current,
    ...prefs,
  };

  const filePath = getPreferencesFilePath();
  try {
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Graceful fallback if filesystem permission denied
  }
  return updated;
}

const STEP_EXPLANATIONS: Record<string, string> = {
  'npm install': 'Mengunduh dependensi pustaka JavaScript/TypeScript ke node_modules',
  'npm run dev': 'Menjalankan server pengembangan lokal (Hot Module Replacement)',
  'composer install': 'Mengunduh dependensi PHP dari Packagist ke folder vendor',
  'cp .env.example .env': 'Menyalin file konfigurasi environment lokal (.env)',
  'php artisan key:generate': 'Membuat enkripsi APP_KEY unik untuk session Laravel',
  'php artisan migrate': 'Menerapkan struktur skema tabel database lokal',
  'php artisan serve': 'Menjalankan server web bawaan PHP Laravel (port 8000)',
  'npx expo start --web': 'Menjalankan Metro bundler Expo untuk pengujian di browser',
  'flutter pub get': 'Mengunduh paket pustaka Dart dan Flutter dari pub.dev',
  'flutter run -d chrome': 'Menjalankan aplikasi native Flutter di browser Google Chrome',
  'python -m venv venv': 'Membuat virtual environment Python agar dependensi terisolasi',
  'pip install -r requirements.txt': 'Menginstal pustaka FastAPI & Uvicorn ke virtual environment',
  'uvicorn main:app --reload': 'Menjalankan server ASGI Python dengan reload otomatis',
  'go mod tidy': 'Mengunduh dan merapikan dependensi Go modul (go.mod & go.sum)',
  'go run main.go': 'Mengompilasi dan menjalankan server microservice Go Fiber',
  'npx cap add android': 'Menginisialisasi folder native Android untuk Capacitor',
  'npx cap sync': 'Menyalin hasil web build ke dalam container native mobile',
  'npx supabase start': 'Menyalakan database PostgreSQL & BaaS Supabase lokal',
  'npx supabase db reset': 'Menerapkan migrasi database SQL dan data awal Supabase',
  'npx firebase login': 'Autentikasi akun Google developer untuk Firebase CLI',
  'npx firebase emulators:start': 'Menjalankan Firebase Emulator Suite lokal',
  'coderstrim dev': 'Menjalankan seluruh server (frontend + backend) secara simultan',
};

export function formatEducationalStep(step: string, skillLevel: 'beginner' | 'pro'): string {
  if (skillLevel === 'pro') {
    return `   ${pc.green(step)}`;
  }

  // Beginner mode: annotate with description
  let explanation = '';
  if (step.startsWith('cd ')) {
    explanation = `Masuk ke direktori folder proyek '${step.slice(3).trim()}'`;
  } else {
    explanation = STEP_EXPLANATIONS[step] || 'Jalankan perintah ini di terminal proyek kamu';
  }

  return `   ${pc.bold(pc.green(step.padEnd(30)))} ${pc.dim('→')} ${pc.white(explanation)}`;
}
