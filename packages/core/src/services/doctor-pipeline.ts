import fs from 'node:fs/promises';
import path from 'node:path';
import type { LintIssue } from '../types/lint.js';
import type { PluginContext } from '../types/plugin.js';
import type { HookDispatcher } from '../plugins/dispatcher.js';
import { applyReverseOffsetPatches } from './patcher.js';
import { generateDiffPreview } from './diff-engine.js';
import { createSnapshot } from './snapshot.js';

export interface DoctorPipelineOptions {
  cwd: string;
  dryRun?: boolean;
  fix?: boolean;
  targetPath?: string;
  dispatcher: HookDispatcher;
  ctx: PluginContext;
}

export interface DoctorFileReport {
  file: string;
  issues: LintIssue[];
  diffPreview: string;
  patchedContent: string;
}

export interface DoctorPipelineResult {
  totalFilesScanned: number;
  totalIssuesFound: number;
  filesWithIssues: DoctorFileReport[];
  filesFixed: number;
  snapshotId?: string;
}

const DEFAULT_IGNORE = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.coderstrim',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.php',
  '.html',
  '.py',
  '.go',
]);

/**
 * Recursively scans directory for scannable source files.
 */
async function collectFiles(dir: string, baseDir: string): Promise<string[]> {
  const results: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (DEFAULT_IGNORE.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await collectFiles(fullPath, baseDir);
        results.push(...nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          results.push(path.relative(baseDir, fullPath));
        }
      }
    }
  } catch {
    // Directory unreadable or doesn't exist
  }

  return results;
}

/**
 * Runs the CodersTrim Doctor pipeline across project files.
 */
export async function executeDoctorPipeline(
  options: DoctorPipelineOptions
): Promise<DoctorPipelineResult> {
  const { cwd, fix = false, targetPath, dispatcher, ctx } = options;

  const scanRoot = targetPath ? path.resolve(cwd, targetPath) : cwd;
  const fileList = await collectFiles(scanRoot, cwd);

  const reports: DoctorFileReport[] = [];
  let totalIssues = 0;

  for (const relPath of fileList) {
    const fullPath = path.join(cwd, relPath);
    let content: string;

    try {
      content = await fs.readFile(fullPath, 'utf-8');
    } catch {
      continue;
    }

    const { allIssues } = await dispatcher.dispatchOnLintFile(ctx, {
      path: relPath,
      content,
    });

    if (allIssues.length > 0) {
      totalIssues += allIssues.length;
      const { patchedContent } = applyReverseOffsetPatches(content, allIssues);
      const diff = generateDiffPreview(relPath, content, patchedContent);

      reports.push({
        file: relPath,
        issues: allIssues,
        diffPreview: diff.formattedOutput,
        patchedContent,
      });
    }
  }

  let snapshotId: string | undefined;
  let filesFixed = 0;

  if (fix && reports.length > 0) {
    // 1. Snapshot all affected files before applying fixes
    const filesToBackup = reports.map((r) => r.file);
    snapshotId = await createSnapshot(cwd, filesToBackup, 'doctor_fix');

    // 2. Write patched content to disk
    for (const report of reports) {
      const fullPath = path.join(cwd, report.file);
      await fs.writeFile(fullPath, report.patchedContent, 'utf-8');
      filesFixed++;
    }

    // 3. Dispatch onFix hook
    const allFixedIssues = reports.flatMap((r) => r.issues);
    await dispatcher.dispatchOnFix(ctx, allFixedIssues);
  }

  return {
    totalFilesScanned: fileList.length,
    totalIssuesFound: totalIssues,
    filesWithIssues: reports,
    filesFixed,
    snapshotId,
  };
}
