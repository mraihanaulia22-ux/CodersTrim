import type { LintIssue } from './lint.js';

/**
 * Standardized Context exposed to all plugins during execution.
 * Grants safe file operations, UI helpers, string utilities, and VCS queries.
 */
export interface PluginContext {
  /** Current working directory of the project */
  cwd: string;

  /** Active project configuration */
  config: Record<string, unknown>;

  /** Colorized UI output helpers */
  ui: {
    info: (message: string) => void;
    success: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    heading: (title: string) => void;
  };

  /** Safe File System abstraction */
  fs: {
    readFile: (relPath: string) => Promise<string>;
    writeFileSafe: (relPath: string, content: string) => Promise<void>;
    injectAtAnchor: (relPath: string, anchor: string, content: string) => Promise<boolean>;
    exists: (relPath: string) => Promise<boolean>;
  };

  /** String distance & typo detection utilities */
  typo: {
    findClosest: (
      input: string,
      dictionary: string[],
      maxDistance?: number
    ) => { match: string; distance: number } | null;
    calculateDistance: (a: string, b: string) => number;
  };

  /** Version control queries & snapshot triggers */
  git: {
    isClean: () => Promise<boolean>;
    createSnapshot: (label: string) => Promise<string>;
  };
}

/**
 * Lifecycle hooks that plugins can implement.
 */
export interface PluginLifecycleHooks {
  /** Invoked during `coderstrim init` */
  onInit?: (
    ctx: PluginContext,
    options?: Record<string, unknown>
  ) => Promise<{ filesCreated: string[]; nextSteps: string[] }>;

  /** Invoked during `coderstrim add <feature>` */
  onInject?: (ctx: PluginContext, feature: string) => Promise<void>;

  /** Invoked during `coderstrim doctor` */
  onLintFile?: (
    ctx: PluginContext,
    file: { path: string; content: string }
  ) => Promise<LintIssue[]>;

  /** Invoked when auto-fixes are applied */
  onFix?: (ctx: PluginContext, issues: LintIssue[]) => Promise<void>;
}

/**
 * Standard manifest contract required for every CodersTrim plugin.
 */
export interface CodersTrimPlugin {
  name: string;
  version: string;
  author?: string;
  description?: string;
  type?: 'framework' | 'linter' | 'ui' | 'utility';
  hooks: PluginLifecycleHooks;
  contributes?: {
    initPrompts?: Array<{
      name: string;
      message: string;
      type: 'input' | 'select' | 'confirm' | 'checkbox';
      choices?: Array<{ name: string; value: unknown }>;
      default?: unknown;
    }>;
    injectables?: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    uiComponents?: Array<{
      id: string;
      name: string;
      framework: string;
      description: string;
      template: string;
    }>;
  };
}
