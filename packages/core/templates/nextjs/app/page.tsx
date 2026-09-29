import { CodersTrimDevToolbar } from '../components/CodersTrimDevToolbar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-md w-full">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 mb-6">
          <span className="text-2xl">👋</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hello World!
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Welcome to <span className="font-semibold text-slate-200">__CT_PROJECT_NAME__</span>
        </p>

        {/* @CodersTrim-Inject-Components */}
        <div className="mt-8 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs font-mono text-slate-400">
          Edit <span className="text-indigo-400">app/page.tsx</span> to start building
        </div>
      </div>
      {process.env.NODE_ENV === 'development' && <CodersTrimDevToolbar />}
    </main>
  );
}
