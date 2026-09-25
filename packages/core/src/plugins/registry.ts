import type { CodersTrimPlugin } from '../types/plugin.js';
import { PluginManifestSchema } from './schema.js';
import { logger } from '../services/logger.js';

export class PluginRegistry {
  private plugins = new Map<string, CodersTrimPlugin>();

  /**
   * Registers a plugin in the registry after validating its manifest.
   */
  public register(plugin: unknown): boolean {
    const parseResult = PluginManifestSchema.safeParse(plugin);

    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      logger.warn(`Rejected invalid plugin manifest: ${issues}`);
      return false;
    }

    const validated = plugin as CodersTrimPlugin;
    this.plugins.set(validated.name, validated);
    return true;
  }

  /**
   * Retrieves a plugin by its name.
   */
  public get(name: string): CodersTrimPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Returns all currently registered plugins.
   */
  public getAll(): CodersTrimPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Filters plugins by their role/type.
   */
  public getByType(type: NonNullable<CodersTrimPlugin['type']>): CodersTrimPlugin[] {
    return this.getAll().filter((p) => p.type === type);
  }

  /**
   * Checks whether a plugin is registered.
   */
  public has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Clears all registered plugins (useful for test isolation).
   */
  public clear(): void {
    this.plugins.clear();
  }
}

/** Global default plugin registry instance */
export const defaultRegistry = new PluginRegistry();
