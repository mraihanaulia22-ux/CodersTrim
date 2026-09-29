import React from 'react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl max-w-sm w-full">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
          📱
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          __CT_PROJECT_NAME__
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Scaffolded with <span className="font-semibold text-indigo-400">CodersTrim</span> (Capacitor 7 + React 19 + Tailwind v4).
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-emerald-400">
          Native Container Ready
        </div>

        {/* @CodersTrim-Inject-Components */}
        <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">src/App.tsx</span> to build your mobile app!
        </div>
      </div>
    </div>
  );
}
