import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createSnapshot, restoreLatestSnapshot } from '../src/services/snapshot.js';

describe('Snapshot Service', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('creates an atomic backup of target files and successfully rolls back', async () => {
    const testFile = path.join(tempDir, 'sample.txt');
    await fs.writeFile(testFile, 'Original Content', 'utf-8');

    // Create snapshot
    const snapshotId = await createSnapshot(tempDir, ['sample.txt'], 'test');
    expect(snapshotId).toMatch(/^snapshot_\d+$/);

    // Modify file
    await fs.writeFile(testFile, 'Modified Corrupted Content', 'utf-8');
    expect(await fs.readFile(testFile, 'utf-8')).toBe('Modified Corrupted Content');

    // Perform rollback
    const undoResult = await restoreLatestSnapshot(tempDir);
    expect(undoResult.success).toBe(true);
    expect(undoResult.restoredCount).toBe(1);

    // Verify original content restored
    const restoredContent = await fs.readFile(testFile, 'utf-8');
    expect(restoredContent).toBe('Original Content');
  });

  it('handles empty snapshot gracefully when none exist', async () => {
    const result = await restoreLatestSnapshot(tempDir);
    expect(result.success).toBe(false);
    expect(result.message).toContain('No snapshots found');
  });
});
