import fs from 'node:fs/promises';
import path from 'node:path';
import type { PluginContext } from '../types/plugin.js';
import type { CodersTrimConfig } from '../types/config.js';
import { logger } from '../services/logger.js';
import { injectAtAnchor } from '../services/anchor-inject.js';
import { calculateDistance, findClosest } from '../services/typo-engine.js';
import { getVCSStatus } from '../services/vcs-guard.js';
import { createSnapshot } from '../services/snapshot.js';

/**
 * Creates an isolated and feature-complete PluginContext instance.
 */
export function createPluginContext(cwd: string, config: CodersTrimConfig): PluginContext {
  return {
    cwd,
    config: config as unknown as Record<string, unknown>,

    ui: {
      info: (msg: string) => logger.info(msg),
      success: (msg: string) => logger.success(msg),
      warn: (msg: string) => logger.warn(msg),
      error: (msg: string) => logger.error(msg),
      heading: (title: string) => logger.heading(title),
    },

    fs: {
      async readFile(relPath: string): Promise<string> {
        const fullPath = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);
        return fs.readFile(fullPath, 'utf-8');
      },

      async writeFileSafe(relPath: string, content: string): Promise<void> {
        const fullPath = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');
      },

      async injectAtAnchor(relPath: string, anchor: string, content: string): Promise<boolean> {
        const fullPath = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);
        try {
          const source = await fs.readFile(fullPath, 'utf-8');
          const result = injectAtAnchor(source, anchor, content);
          if (result.injected) {
            // Snapshot before updating
            await createSnapshot(cwd, [relPath], `inject_${anchor}`);
            await fs.writeFile(fullPath, result.content, 'utf-8');
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      async exists(relPath: string): Promise<boolean> {
        const fullPath = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);
        try {
          await fs.access(fullPath);
          return true;
        } catch {
          return false;
        }
      },
    },

    typo: {
      findClosest: (input, dictionary, maxDistance) => findClosest(input, dictionary, maxDistance),
      calculateDistance: (a, b) => calculateDistance(a, b),
    },

    git: {
      async isClean(): Promise<boolean> {
        const status = await getVCSStatus(cwd);
        return status.isClean;
      },
      async createSnapshot(label: string): Promise<string> {
        return createSnapshot(cwd, [], label);
      },
    },
  };
}
