export interface UIComponentDefinition {
  id: string;
  name: string;
  description: string;
  templates: {
    react: string;
    blade: string;
    vue: string;
    html: string;
  };
}

export const UI_COMPONENTS: Record<string, UIComponentDefinition> = {
  card: {
    id: 'card',
    name: 'Modern Card',
    description: 'A versatile card component with title, badge, content, and subtle border hover transition.',
    templates: {
      react: `import React from 'react';

export interface CardProps {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, badge, children }: CardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
`,
      blade: `<div {{ $attributes->merge(['class' => 'relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700']) }}>
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold tracking-tight text-white">{{ $title }}</h3>
    @if(isset($badge))
      <span class="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
        {{ $badge }}
      </span>
    @endif
  </div>
  <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ $description }}</p>
  <div class="mt-4">
    {{ $slot }}
  </div>
</div>
`,
      vue: `<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  badge?: string;
}>();
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold tracking-tight text-white">{{ title }}</h3>
      <span v-if="badge" class="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
        {{ badge }}
      </span>
    </div>
    <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
`,
      html: `<div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold tracking-tight text-white">Card Title</h3>
    <span class="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">Badge</span>
  </div>
  <p class="mt-2 text-sm leading-relaxed text-slate-400">Card description content goes here.</p>
</div>
`,
    },
  },

  button: {
    id: 'button',
    name: 'Modern Button',
    description: 'Accessible button with interactive hover and focus styles.',
    templates: {
      react: `import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:ring-indigo-500',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600',
    outline: 'border border-slate-700 bg-transparent text-slate-300 hover:border-slate-500 hover:text-white',
  };

  return (
    <button className={\`\${baseStyles} \${variants[variant]} \${className}\`} {...props}>
      {children}
    </button>
  );
}
`,
      blade: `@props(['variant' => 'primary'])

@php
$baseStyles = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
$variants = [
  'primary' => 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:ring-indigo-500',
  'secondary' => 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600',
  'outline' => 'border border-slate-700 bg-transparent text-slate-300 hover:border-slate-500 hover:text-white',
];
$classes = $baseStyles . ' ' . ($variants[$variant] ?? $variants['primary']);
@endphp

<button {{ $attributes->merge(['class' => $classes]) }}>
  {{ $slot }}
</button>
`,
      vue: `<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline';
}>(), {
  variant: 'primary',
});
</script>

<template>
  <button :class="[
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    variant === 'primary' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:ring-indigo-500' :
    variant === 'secondary' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600' :
    'border border-slate-700 bg-transparent text-slate-300 hover:border-slate-500 hover:text-white'
  ]">
    <slot />
  </button>
</template>
`,
      html: `<button class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  Click Here
</button>
`,
    },
  },

  'dev-toolbar': {
    id: 'dev-toolbar',
    name: 'CodersTrim Dev Toolbar',
    description: 'In-browser floating responsive preview widget with real-time viewport switcher (390px, 768px, Full) and breakpoint tags',
    templates: {
      react: `import React, { useState, useEffect } from 'react';

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
`,
      blade: `<!-- CodersTrim In-Browser Responsive Preview Toolbar -->
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

  function updateWidth() {
    if (widthDisplay) widthDisplay.textContent = window.innerWidth + 'px';
  }
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
      if (mode === 'mobile') {
        container.style.width = '390px';
        container.style.height = '844px';
      } else if (mode === 'tablet') {
        container.style.width = '768px';
        container.style.height = '1024px';
      }
      container.style.maxHeight = '85vh';
    }
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    badge.classList.remove('hidden');
  };
})();
</script>
`,
      vue: `<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const mode = ref<'full' | 'mobile' | 'tablet'>('full');
const isRotated = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1440);
const isExpanded = ref(false);

const updateWidth = () => { windowWidth.value = window.innerWidth; };
onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));
</script>

<template>
  <div v-if="typeof window !== 'undefined' && window.self === window.top" class="fixed bottom-5 right-5 z-40 flex items-center">
    <button @click="isExpanded = !isExpanded" class="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-2xl backdrop-blur-xl">
      <span class="text-indigo-400">⚡</span>
      <span>{{ windowWidth }}px</span>
    </button>
  </div>
</template>
`,
      html: `<!-- CodersTrim Dev Toolbar Placeholder -->
`,
    },
  },
};
