import fs from 'node:fs/promises';
import path from 'node:path';

export interface SnapshotManifest {
  id: string;
  label: string;
  timestamp: number;
  files: Array<{
    relativePath: string;
    backupPath: string;
  }>;
}

/**
 * Creates an atomic backup snapshot of files prior to mutation.
 */
export async function createSnapshot(
  cwd: string,
  filesToBackup: string[],
  label: string = 'backup'
): Promise<string> {
  const timestamp = Date.now();
  const snapshotId = `snapshot_${timestamp}`;
  const backupDir = path.join(cwd, '.coderstrim', 'backups', snapshotId);

  await fs.mkdir(backupDir, { recursive: true });

  const backedUpFiles: SnapshotManifest['files'] = [];

  for (const relativePath of filesToBackup) {
    const fullSourcePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(cwd, relativePath);

    try {
      const stats = await fs.stat(fullSourcePath);
      if (stats.isFile()) {
        const destRelative = path.relative(cwd, fullSourcePath);
        const destPath = path.join(backupDir, destRelative);

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(fullSourcePath, destPath);

        backedUpFiles.push({
          relativePath: destRelative,
          backupPath: path.relative(cwd, destPath),
        });
      }
    } catch {
      // File might not exist yet (e.g. brand new file created)
    }
  }

  const manifest: SnapshotManifest = {
    id: snapshotId,
    label,
    timestamp,
    files: backedUpFiles,
  };

  await fs.writeFile(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  return snapshotId;
}

/**
 * Restores the most recent snapshot backup created by CodersTrim.
 */
export async function restoreLatestSnapshot(
  cwd: string
): Promise<{ success: boolean; restoredCount: number; message: string }> {
  const backupsRoot = path.join(cwd, '.coderstrim', 'backups');

  try {
    let entries;
    try {
      entries = await fs.readdir(backupsRoot, { withFileTypes: true });
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { success: false, restoredCount: 0, message: 'No snapshots found to undo.' };
      }
      throw err;
    }

    const snapshotDirs = entries
      .filter((e) => e.isDirectory() && e.name.startsWith('snapshot_'))
      .map((e) => e.name)
      .sort()
      .reverse();

    if (snapshotDirs.length === 0) {
      return { success: false, restoredCount: 0, message: 'No snapshots found to undo.' };
    }

    const latestDir = path.join(backupsRoot, snapshotDirs[0]!);
    const manifestRaw = await fs.readFile(path.join(latestDir, 'manifest.json'), 'utf-8');
    const manifest: SnapshotManifest = JSON.parse(manifestRaw);

    let restoredCount = 0;
    for (const file of manifest.files) {
      const backupFile = path.join(cwd, file.backupPath);
      const targetFile = path.join(cwd, file.relativePath);

      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.copyFile(backupFile, targetFile);
      restoredCount++;
    }

    // Remove the applied snapshot so multiple undos step backwards
    await fs.rm(latestDir, { recursive: true, force: true });

    return {
      success: true,
      restoredCount,
      message: `Successfully rolled back ${restoredCount} files from snapshot ${manifest.id}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      restoredCount: 0,
      message: `Failed to restore snapshot: ${err.message}`,
    };
  }
}
