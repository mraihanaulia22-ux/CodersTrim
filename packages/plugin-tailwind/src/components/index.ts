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
};
