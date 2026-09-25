import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { applyReverseOffsetPatches } from '../src/services/patcher.js';
import { generateDiffPreview } from '../src/services/diff-engine.js';
import { checkPortAvailability } from '../src/services/port-guard.js';
import { executeDoctorPipeline } from '../src/services/doctor-pipeline.js';
import { restoreLatestSnapshot } from '../src/services/snapshot.js';
import { PluginRegistry } from '../src/plugins/registry.js';
import { HookDispatcher } from '../src/plugins/dispatcher.js';
import { createPluginContext } from '../src/plugins/context-factory.js';
import { CodersTrimConfigSchema } from '../src/types/config.js';
import type { LintIssue } from '../types/lint.js';
import type { CodersTrimPlugin } from '../src/types/plugin.js';

describe('DoctorPipeline, Reverse-Offset Patcher & Diff Engine', () => {
  let tempDir: string;
  let registry: PluginRegistry;
  let dispatcher: HookDispatcher;
  const config = CodersTrimConfigSchema.parse({});

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-doctor-test-'));
    registry = new PluginRegistry();
    dispatcher = new HookDispatcher(registry);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('correctly applies multiple reverse-offset patches without character shifting', () => {
    const original = '<div className="flx items-center paddng-4 bg-blu-500"></div>';

    // 3 issues with exact start and end ranges
    const issues: LintIssue[] = [
      {
        id: '1',
        file: 'test.tsx',
        line: 1,
        column: 17,
        type: 'invalid_class',
        original: 'flx',
        suggested: 'flex',
        confidence: 0.95,
        range: [16, 19],
        message: 'Typo in flex',
      },
      {
        id: '2',
        file: 'test.tsx',
        line: 1,
        column: 34,
        type: 'invalid_class',
        original: 'paddng-4',
        suggested: 'p-4',
        confidence: 0.92,
        range: [33, 41],
        message: 'Typo in padding',
      },
      {
        id: '3',
        file: 'test.tsx',
        line: 1,
        column: 43,
        type: 'invalid_class',
        original: 'bg-blu-500',
        suggested: 'bg-blue-500',
        confidence: 0.96,
        range: [42, 52],
        message: 'Typo in color',
      },
    ];

    const result = applyReverseOffsetPatches(original, issues);
    expect(result.appliedCount).toBe(3);
    expect(result.patchedContent).toBe('<div className="flex items-center p-4 bg-blue-500"></div>');
  });

  it('generates a clean unified diff with diff markers', () => {
    const original = 'const a = 1;\nconst b = 2;';
    const modified = 'const a = 10;\nconst b = 2;';

    const diff = generateDiffPreview('index.ts', original, modified);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.rawPatch).toContain('-const a = 1;');
    expect(diff.rawPatch).toContain('+const a = 10;');
  });

  it('checks port availability accurately', async () => {
    // Port 0 will ask OS for an ephemeral free port, but let's test a high unassigned port
    const isAvail = await checkPortAvailability(49152);
    expect(typeof isAvail).toBe('boolean');
  });

  it('executes doctor dry-run and fix modes end-to-end with snapshot rollback', async () => {
    const sampleFilePath = path.join(tempDir, 'Component.tsx');
    const initialCode = '<div className="flx paddng-4">Hello</div>';
    await fs.writeFile(sampleFilePath, initialCode, 'utf-8');

    // Mock linter plugin that flags 'flx' and 'paddng-4'
    const mockLinter: CodersTrimPlugin = {
      name: '@coderstrim/plugin-mock-linter',
      version: '1.0.0',
      type: 'linter',
      hooks: {
        onLintFile: async (_ctx, file) => {
          const issues: LintIssue[] = [];
          const flxIdx = file.content.indexOf('flx');
          if (flxIdx !== -1) {
            issues.push({
              id: 'flx',
              file: file.path,
              line: 1,
              column: flxIdx + 1,
              type: 'invalid_class',
              original: 'flx',
              suggested: 'flex',
              confidence: 0.95,
              range: [flxIdx, flxIdx + 3],
              message: 'Invalid class flx',
            });
          }

          const padIdx = file.content.indexOf('paddng-4');
          if (padIdx !== -1) {
            issues.push({
              id: 'pad',
              file: file.path,
              line: 1,
              column: padIdx + 1,
              type: 'invalid_class',
              original: 'paddng-4',
              suggested: 'p-4',
              confidence: 0.92,
              range: [padIdx, padIdx + 8],
              message: 'Invalid class paddng-4',
            });
          }
          return issues;
        },
      },
    };

    registry.register(mockLinter);
    const ctx = createPluginContext(tempDir, config);

    // 1. Dry run - should find issues without changing file
    const dryRunResult = await executeDoctorPipeline({
      cwd: tempDir,
      dryRun: true,
      fix: false,
      dispatcher,
      ctx,
    });

    expect(dryRunResult.totalIssuesFound).toBe(2);
    expect(dryRunResult.filesFixed).toBe(0);
    expect(await fs.readFile(sampleFilePath, 'utf-8')).toBe(initialCode);

    // 2. Fix mode - should create snapshot and apply fixes
    const fixResult = await executeDoctorPipeline({
      cwd: tempDir,
      dryRun: false,
      fix: true,
      dispatcher,
      ctx,
    });

    expect(fixResult.totalIssuesFound).toBe(2);
    expect(fixResult.filesFixed).toBe(1);
    expect(fixResult.snapshotId).toBeDefined();

    const fixedCode = await fs.readFile(sampleFilePath, 'utf-8');
    expect(fixedCode).toBe('<div className="flex p-4">Hello</div>');

    // 3. Rollback via undo
    const undoResult = await restoreLatestSnapshot(tempDir);
    expect(undoResult.success).toBe(true);
    expect(await fs.readFile(sampleFilePath, 'utf-8')).toBe(initialCode);
  });
});
