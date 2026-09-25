import type { PluginContext } from '../types/plugin.js';
import type { LintIssue } from '../types/lint.js';
import { logger } from '../services/logger.js';
import type { PluginRegistry } from './registry.js';

export interface DispatcherResult<T> {
  pluginName: string;
  success: boolean;
  data?: T;
  error?: string;
}

export class HookDispatcher {
  constructor(private registry: PluginRegistry) {}

  /**
   * Dispatches the `onInit` hook to a specific framework plugin.
   */
  public async dispatchOnInit(
    pluginName: string,
    ctx: PluginContext,
    options?: Record<string, unknown>
  ): Promise<DispatcherResult<{ filesCreated: string[]; nextSteps: string[] }>> {
    const plugin = this.registry.get(pluginName);
    if (!plugin) {
      return {
        pluginName,
        success: false,
        error: `Plugin '${pluginName}' is not registered`,
      };
    }

    if (!plugin.hooks.onInit) {
      return {
        pluginName,
        success: false,
        error: `Plugin '${pluginName}' does not implement the onInit hook`,
      };
    }

    try {
      const data = await plugin.hooks.onInit(ctx, options);
      return { pluginName, success: true, data };
    } catch (err: any) {
      logger.error(`Error in plugin '${pluginName}' during onInit: ${err.message}`);
      return { pluginName, success: false, error: err.message };
    }
  }

  /**
   * Dispatches the `onInject` hook across plugins that declare the injectable.
   */
  public async dispatchOnInject(
    feature: string,
    ctx: PluginContext
  ): Promise<Array<DispatcherResult<void>>> {
    const results: Array<DispatcherResult<void>> = [];

    for (const plugin of this.registry.getAll()) {
      if (typeof plugin.hooks.onInject === 'function') {
        try {
          await plugin.hooks.onInject(ctx, feature);
          results.push({ pluginName: plugin.name, success: true });
        } catch (err: any) {
          logger.error(`Error in plugin '${plugin.name}' during onInject: ${err.message}`);
          results.push({ pluginName: plugin.name, success: false, error: err.message });
        }
      }
    }

    return results;
  }

  /**
   * Dispatches the `onLintFile` hook across all registered linters.
   * Aggregates all discovered issues into a unified list.
   */
  public async dispatchOnLintFile(
    ctx: PluginContext,
    file: { path: string; content: string }
  ): Promise<{ allIssues: LintIssue[]; results: Array<DispatcherResult<LintIssue[]>> }> {
    const allIssues: LintIssue[] = [];
    const results: Array<DispatcherResult<LintIssue[]>> = [];

    for (const plugin of this.registry.getAll()) {
      if (typeof plugin.hooks.onLintFile === 'function') {
        try {
          const issues = await plugin.hooks.onLintFile(ctx, file);
          allIssues.push(...issues);
          results.push({ pluginName: plugin.name, success: true, data: issues });
        } catch (err: any) {
          logger.warn(`Plugin '${plugin.name}' encountered an error while linting '${file.path}': ${err.message}`);
          results.push({ pluginName: plugin.name, success: false, error: err.message });
        }
      }
    }

    return { allIssues, results };
  }

  /**
   * Dispatches the `onFix` hook across registered plugins.
   */
  public async dispatchOnFix(
    ctx: PluginContext,
    issues: LintIssue[]
  ): Promise<Array<DispatcherResult<void>>> {
    const results: Array<DispatcherResult<void>> = [];

    for (const plugin of this.registry.getAll()) {
      if (typeof plugin.hooks.onFix === 'function') {
        try {
          await plugin.hooks.onFix(ctx, issues);
          results.push({ pluginName: plugin.name, success: true });
        } catch (err: any) {
          logger.error(`Error in plugin '${plugin.name}' during onFix: ${err.message}`);
          results.push({ pluginName: plugin.name, success: false, error: err.message });
        }
      }
    }

    return results;
  }
}
