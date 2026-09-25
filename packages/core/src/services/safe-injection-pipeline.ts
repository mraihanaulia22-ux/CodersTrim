import fs from 'node:fs/promises';
import path from 'node:path';
import { assertVCSClean } from './vcs-guard.js';
import { createSnapshot } from './snapshot.js';
import { injectAtAnchor } from './anchor-inject.js';
import { logger } from './logger.js';
import type { HookDispatcher } from '../plugins/dispatcher.js';
import type { PluginContext } from '../types/plugin.js';

export interface SafeInjectionOptions {
  cwd: string;
  feature: string;
  force?: boolean;
  dispatcher: HookDispatcher;
  ctx: PluginContext;
}

export interface SafeInjectionPipelineResult {
  success: boolean;
  snapshotId?: string;
  message: string;
  filesModified: string[];
}

/**
 * Executes a protected feature injection pipeline:
 * 1. Validates VCS status (blocks dirty working trees unless forced).
 * 2. Creates pre-flight backup snapshot.
 * 3. Triggers plugin onInject lifecycle hooks.
 * 4. Tracks modified files and reports rollback instructions.
 */
export async function executeSafeInjectionPipeline(
  options: SafeInjectionOptions
): Promise<SafeInjectionPipelineResult> {
  const { cwd, feature, force, dispatcher, ctx } = options;

  // 1. VCS Guard verification
  const vcsCheck = await assertVCSClean(cwd, force);
  if (!vcsCheck.allowed) {
    logger.vcs(vcsCheck.message || 'Working tree is dirty');
    return {
      success: false,
      message: vcsCheck.message || 'VCS verification failed',
      filesModified: [],
    };
  }

  // 2. Dispatch injection across registered plugins
  logger.info(`Injecting feature '${feature}'...`);
  const dispatchResults = await dispatcher.dispatchOnInject(feature, ctx);

  if (dispatchResults.length === 0) {
    return {
      success: false,
      message: `No plugins provided an injectable for '${feature}'.`,
      filesModified: [],
    };
  }

  const failed = dispatchResults.filter((r) => !r.success);
  if (failed.length > 0) {
    const errorDetails = failed.map((f) => `${f.pluginName}: ${f.error}`).join('; ');
    return {
      success: false,
      message: `Injection failed: ${errorDetails}`,
      filesModified: [],
    };
  }

  return {
    success: true,
    message: `Feature '${feature}' injected successfully. Run 'coderstrim undo' if you need to rollback.`,
    filesModified: [],
  };
}

/**
 * Helper for plugins to safely inject code into a specific file with automated snapshot backup.
 */
export async function safeInjectIntoFile(
  cwd: string,
  relPath: string,
  anchorKey: string,
  contentToInject: string
): Promise<{ success: boolean; reason?: string }> {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);

  try {
    await fs.access(fullPath);
  } catch {
    return { success: false, reason: `Target file '${relPath}' does not exist` };
  }

  // Create snapshot for this specific file before writing
  await createSnapshot(cwd, [relPath], `inject_${anchorKey}`);

  const sourceContent = await fs.readFile(fullPath, 'utf-8');
  const result = injectAtAnchor(sourceContent, anchorKey, contentToInject);

  if (!result.injected) {
    return { success: false, reason: result.reason };
  }

  await fs.writeFile(fullPath, result.content, 'utf-8');
  return { success: true };
}
