import { describe, it, expect } from 'vitest';
import { isValidTailwindClass } from '../src/dictionary/classes.js';
import { sortTailwindClasses } from '../src/sorter/class-sorter.js';
import { tailwindPlugin } from '../src/index.js';
import { createPluginContext } from '@coderstrim/core';
import { CodersTrimConfigSchema } from '@coderstrim/core';

describe('@coderstrim/plugin-tailwind', () => {
  it('validates standard and modified Tailwind classes correctly', () => {
    expect(isValidTailwindClass('flex')).toBe(true);
    expect(isValidTailwindClass('items-center')).toBe(true);
    expect(isValidTailwindClass('hover:bg-blue-600')).toBe(true);
    expect(isValidTailwindClass('dark:text-white')).toBe(true);
    expect(isValidTailwindClass('w-[350px]')).toBe(true);

    // Typos should fail validation
    expect(isValidTailwindClass('flx')).toBe(false);
    expect(isValidTailwindClass('paddng-4')).toBe(false);
    expect(isValidTailwindClass('bg-blu-500')).toBe(false);
  });

  it('sorts Tailwind classes into standard category order', () => {
    const unsorted = 'hover:bg-blue-500 p-4 text-white flex rounded-xl relative';
    const sorted = sortTailwindClasses(unsorted);

    // Layout (relative) -> Display (flex) -> Spacing (p-4) -> Typography (text-white) -> Visuals (rounded-xl) -> Modifiers (hover:)
    expect(sorted).toBe('relative flex p-4 text-white rounded-xl hover:bg-blue-500');
  });

  it('detects typos and emits LintIssue with accurate character ranges', async () => {
    const config = CodersTrimConfigSchema.parse({});
    const ctx = createPluginContext(process.cwd(), config);

    const templateCode = `<div className="flx text-whit bg-blu-500">Hello</div>`;
    const issues = await tailwindPlugin.hooks.onLintFile!(ctx, {
      path: 'App.tsx',
      content: templateCode,
    });

    expect(issues.length).toBe(3);

    // Verify first issue (flx -> flex)
    const issue1 = issues.find((i) => i.original === 'flx');
    expect(issue1).toBeDefined();
    expect(issue1?.suggested).toBe('flex');
    expect(templateCode.slice(issue1!.range[0], issue1!.range[1])).toBe('flx');

    // Verify second issue (text-whit -> text-white)
    const issue2 = issues.find((i) => i.original === 'text-whit');
    expect(issue2).toBeDefined();
    expect(issue2?.suggested).toBe('text-white');
    expect(templateCode.slice(issue2!.range[0], issue2!.range[1])).toBe('text-whit');

    // Verify third issue (bg-blu-500 -> bg-blue-500)
    const issue3 = issues.find((i) => i.original === 'bg-blu-500');
    expect(issue3).toBeDefined();
    expect(issue3?.suggested).toBe('bg-blue-500');
    expect(templateCode.slice(issue3!.range[0], issue3!.range[1])).toBe('bg-blu-500');
  });
});
