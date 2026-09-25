import type { CodersTrimPlugin, LintIssue, PluginContext } from '@coderstrim/core';
import { TAILWIND_CLASSES, isValidTailwindClass } from './dictionary/classes.js';
import { UI_COMPONENTS } from './components/index.js';

export * from './dictionary/classes.js';
export * from './sorter/class-sorter.js';
export * from './components/index.js';

/**
 * Official Tailwind CSS Plugin for CodersTrim.
 */
export const tailwindPlugin: CodersTrimPlugin = {
  name: '@coderstrim/plugin-tailwind',
  version: '2.0.0',
  author: 'CodersTrim Team',
  description: 'Tailwind CSS utility corrector, class sorter, and modern UI component library',
  type: 'ui',

  hooks: {
    async onLintFile(ctx: PluginContext, file: { path: string; content: string }): Promise<LintIssue[]> {
      const issues: LintIssue[] = [];

      // Regex matching class="..." or className="..."
      const classAttrRegex = /(?:class|className)=["']([^"']*)["']/g;
      let match: RegExpExecArray | null;

      while ((match = classAttrRegex.exec(file.content)) !== null) {
        const fullClassString = match[1] ?? '';
        const attrValueStart = match.index + match[0].indexOf(fullClassString);

        const tokens = fullClassString.split(/\s+/);
        let tokenOffset = 0;

        for (const token of tokens) {
          if (!token || token.trim().length === 0) continue;

          const tokenStartInValue = fullClassString.indexOf(token, tokenOffset);
          tokenOffset = tokenStartInValue + token.length;

          if (!isValidTailwindClass(token)) {
            // Check if there is a close match in the dictionary
            const closest = ctx.typo.findClosest(token, TAILWIND_CLASSES, 2);

            if (closest) {
              const startCharIndex = attrValueStart + tokenStartInValue;
              const endCharIndex = startCharIndex + token.length;

              // Calculate line and column
              const linesUpToMatch = file.content.slice(0, startCharIndex).split('\n');
              const lineNumber = linesUpToMatch.length;
              const columnNumber = (linesUpToMatch[linesUpToMatch.length - 1]?.length ?? 0) + 1;

              const maxLen = Math.max(token.length, closest.match.length);
              const confidence = maxLen > 0 ? 1 - closest.distance / maxLen : 1;

              issues.push({
                id: `tailwind-typo-${startCharIndex}`,
                file: file.path,
                line: lineNumber,
                column: columnNumber,
                type: 'invalid_class',
                original: token,
                suggested: closest.match,
                confidence,
                range: [startCharIndex, endCharIndex],
                message: `Unrecognized Tailwind class '${token}'. Did you mean '${closest.match}'?`,
              });
            }
          }
        }
      }

      return issues;
    },

    async onFix(ctx: PluginContext, issues: LintIssue[]): Promise<void> {
      ctx.ui.success(`Tailwind plugin validated ${issues.length} auto-corrections.`);
    },
  },

  contributes: {
    uiComponents: Object.values(UI_COMPONENTS).map((comp) => ({
      id: comp.id,
      name: comp.name,
      framework: 'all',
      description: comp.description,
      template: comp.templates.react,
    })),
  },
};

export default tailwindPlugin;
