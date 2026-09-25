import { z } from 'zod';

/**
 * Zod validation schema for plugin manifests.
 * Ensures runtime stability and protects Core from broken third-party plugins.
 */
export const PluginManifestSchema = z.object({
  name: z.string().min(1, 'Plugin name cannot be empty'),
  version: z.string().regex(/^\d+\.\d+\.\d+/, 'Plugin version must follow semver (e.g. 1.0.0)'),
  author: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['framework', 'linter', 'ui', 'utility']).default('utility'),
  hooks: z
    .object({
      onInit: z.function().optional(),
      onInject: z.function().optional(),
      onLintFile: z.function().optional(),
      onFix: z.function().optional(),
    })
    .default({}),
  contributes: z
    .object({
      initPrompts: z
        .array(
          z.object({
            name: z.string(),
            message: z.string(),
            type: z.enum(['input', 'select', 'confirm', 'checkbox']),
            choices: z.array(z.object({ name: z.string(), value: z.unknown() })).optional(),
            default: z.unknown().optional(),
          })
        )
        .optional(),
      injectables: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
          })
        )
        .optional(),
      uiComponents: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            framework: z.string(),
            description: z.string(),
            template: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

export type ValidatedPluginManifest = z.infer<typeof PluginManifestSchema>;
