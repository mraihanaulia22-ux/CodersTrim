/**
 * Standard dictionary of core Tailwind CSS utilities.
 * Covers layout, flexbox, grid, spacing, sizing, typography, colors, borders, and effects.
 */
export const TAILWIND_CLASSES = [
  // Display & Layout
  'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden',
  'contents', 'table', 'table-row', 'table-cell',

  // Flexbox & Grid
  'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
  'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
  'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
  'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
  'content-start', 'content-end', 'content-center', 'content-between', 'content-around',
  'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch',
  'place-items-start', 'place-items-end', 'place-items-center', 'place-items-stretch',
  'place-content-start', 'place-content-end', 'place-content-center', 'place-content-between',
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-6', 'grid-cols-12',
  'col-span-1', 'col-span-2', 'col-span-3', 'col-span-full',
  'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12',

  // Spacing (Padding & Margin)
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16',
  'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
  'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-auto',
  'mx-auto', 'my-auto', 'mx-2', 'mx-4', 'my-2', 'my-4',

  // Sizing
  'w-full', 'w-screen', 'w-auto', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4',
  'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-full',
  'h-full', 'h-screen', 'h-auto', 'min-h-screen', 'min-h-full',

  // Typography
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl',
  'font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold',
  'text-left', 'text-center', 'text-right', 'text-justify',
  'text-white', 'text-black', 'text-transparent',
  'text-slate-100', 'text-slate-200', 'text-slate-300', 'text-slate-400', 'text-slate-500', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-900',
  'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
  'text-blue-500', 'text-blue-600', 'text-indigo-500', 'text-indigo-600', 'text-emerald-500', 'text-red-500',
  'tracking-tight', 'tracking-normal', 'tracking-wide',
  'leading-none', 'leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose',

  // Backgrounds
  'bg-white', 'bg-black', 'bg-transparent',
  'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-800', 'bg-slate-900', 'bg-slate-950',
  'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-800', 'bg-gray-900', 'bg-gray-950',
  'bg-blue-50', 'bg-blue-500', 'bg-blue-600', 'bg-indigo-500', 'bg-indigo-600', 'bg-emerald-500', 'bg-red-500',

  // Borders & Rounded
  'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full', 'rounded-none',
  'border', 'border-0', 'border-2', 'border-4', 'border-8',
  'border-slate-200', 'border-slate-300', 'border-slate-700', 'border-slate-800',
  'border-gray-200', 'border-gray-700', 'border-white/10', 'border-white/20',

  // Effects & Shadows
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none',
  'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',
  'backdrop-blur', 'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg', 'backdrop-blur-xl',

  // Position
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'inset-0', 'top-0', 'bottom-0', 'left-0', 'right-0', 'z-0', 'z-10', 'z-20', 'z-30', 'z-50',

  // Transitions
  'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-transform',
  'duration-150', 'duration-200', 'duration-300', 'duration-500',
  'ease-in', 'ease-out', 'ease-in-out',
  'cursor-pointer', 'select-none', 'overflow-hidden', 'overflow-auto'
];

const DICTIONARY_SET = new Set(TAILWIND_CLASSES);

const VALID_MODIFIERS = new Set([
  'hover', 'focus', 'focus-visible', 'focus-within', 'active', 'disabled',
  'visited', 'checked', 'first', 'last', 'odd', 'even',
  'dark', 'sm', 'md', 'lg', 'xl', '2xl', 'group-hover', 'peer-checked'
]);

/**
 * Validates if a CSS token is a valid Tailwind class (handling modifiers & arbitrary values).
 */
export function isValidTailwindClass(token: string): boolean {
  if (!token || token.trim().length === 0) return true;

  // Split modifiers (e.g., "dark:hover:bg-slate-800")
  const parts = token.split(':');
  const baseClass = parts[parts.length - 1] ?? '';
  const modifiers = parts.slice(0, -1);

  // Validate modifiers
  for (const mod of modifiers) {
    if (!VALID_MODIFIERS.has(mod)) {
      return false;
    }
  }

  // Exact match
  if (DICTIONARY_SET.has(baseClass)) {
    return true;
  }

  // Arbitrary values e.g. w-[100px], bg-[#123], top-[calc(100%-10px)]
  if (/^[a-z-]+\[.+\]$/.test(baseClass)) {
    return true;
  }

  return false;
}
