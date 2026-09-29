import React, { useEffect, useState } from 'react';
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
          __CT_PROJECT_NAME__
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (React 19 + Vite 6 + Tailwind CSS v4).
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300">
          Backend status: <span className="text-emerald-400">{apiStatus}</span>
        </div>

        {/* @CodersTrim-Inject-Components */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">src/App.tsx</span> to start building!
        </div>
      </div>
      {import.meta.env.DEV && <CodersTrimDevToolbar />}
    </div>
  );
}
