import { z } from 'zod';

/**
 * Zod schema to validate project configuration (coderstrim.config.ts / .js)
 */
export const CodersTrimConfigSchema = z.object({
  /** Active plugins in this project */
  plugins: z.array(z.string()).default([]),

  /** Typo engine options */
  doctor: z
    .object({
      maxLevenshteinDistance: z.number().min(1).max(5).default(2),
      confidenceThreshold: z.number().min(0.5).max(1.0).default(0.85),
      ignorePatterns: z.array(z.string()).default(['**/node_modules/**', '**/dist/**', '**/.git/**']),
    })
    .default({
      maxLevenshteinDistance: 2,
      confidenceThreshold: 0.85,
      ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    }),

  /** Custom project overrides */
  customSettings: z.record(z.unknown()).optional(),
});

export type CodersTrimConfig = z.infer<typeof CodersTrimConfigSchema>;
