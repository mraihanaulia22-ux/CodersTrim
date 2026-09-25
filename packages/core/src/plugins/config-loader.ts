import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CodersTrimConfigSchema, type CodersTrimConfig } from '../types/config.js';
import { logger } from '../services/logger.js';

const CONFIG_FILENAMES = [
  'coderstrim.config.js',
  'coderstrim.config.mjs',
  'coderstrim.config.cjs',
  'coderstrim.config.json',
];

/**
 * Searches for and loads the project's CodersTrim configuration file.
 * Falls back to validated default settings if no configuration file is present.
 */
export async function loadConfig(cwd: string): Promise<CodersTrimConfig> {
  for (const filename of CONFIG_FILENAMES) {
    const filePath = path.join(cwd, filename);
    try {
      await fs.access(filePath);

      if (filename.endsWith('.json')) {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const parsedJson = JSON.parse(rawContent);
        return CodersTrimConfigSchema.parse(parsedJson);
      }

      // For JS/MJS/CJS modules, import dynamically via file URL
      const fileUrl = pathToFileURL(filePath).href;
      // Add timestamp to bust Node module cache if config changed
      const imported = await import(`${fileUrl}?t=${Date.now()}`);
      const rawConfig = imported.default || imported;
      return CodersTrimConfigSchema.parse(rawConfig);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        logger.warn(`Failed to parse ${filename}: ${err.message}. Falling back to default settings.`);
      }
    }
  }

  // Return standard defaults if no config file is found
  return CodersTrimConfigSchema.parse({});
}
