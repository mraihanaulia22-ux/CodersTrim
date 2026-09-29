'use client';

import React, { useState, useEffect } from 'react';

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
              className={`rounded-lg px-2.5 py-1 transition ${mode === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              📱 Mobile (390px)
            </button>
            <button
              onClick={() => setMode('tablet')}
              className={`rounded-lg px-2.5 py-1 transition ${mode === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'}`}
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
            style={{ width: `${dims.w}px`, height: `${dims.h}px`, maxHeight: '85vh' }}
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
