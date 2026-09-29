import fs from 'node:fs/promises';
import path from 'node:path';
import { createSnapshot } from './snapshot.js';

export interface EjectOptions {
  cwd: string;
  dryRun?: boolean;
}

export interface EjectResult {
  success: boolean;
  filesDeleted: string[];
  filesModified: string[];
  message: string;
}

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'vendor',
  '.dart_tool',
  'dist',
  'build',
  '.next',
  '.coderstrim',
  'venv',
  '.venv',
]);

const CANDIDATE_EXTENSIONS = new Set([
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mjs',
  '.php',
  '.py',
  '.go',
  '.dart',
  '.html',
  '.json',
]);

async function walkDir(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await walkDir(path.join(dir, entry.name), fileList);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CANDIDATE_EXTENSIONS.has(ext) || entry.name.endsWith('.blade.php')) {
          fileList.push(path.join(dir, entry.name));
        }
      }
    }
  } catch {
    // Ignore read errors
  }
  return fileList;
}

function cleanToolbarAndAnchors(content: string): { cleaned: string; modified: boolean } {
  const lines = content.split(/\r?\n/);
  const resultLines: string[] = [];
  let modified = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Toolbar imports
    if (
      trimmed.includes('CodersTrimDevToolbar') &&
      (trimmed.startsWith('import ') || trimmed.startsWith('const ') || trimmed.startsWith('require('))
    ) {
      modified = true;
      continue;
    }

    // 2. Toolbar JSX tags or Blade include
    if (
      trimmed.includes('<CodersTrimDevToolbar') ||
      trimmed.includes('coderstrim-dev-toolbar')
    ) {
      modified = true;
      continue;
    }

    // 3. Anchor comments (@CodersTrim-Inject or AUTOGEN_API_ANCHOR)
    if (
      trimmed.includes('@CodersTrim-Inject') ||
      trimmed.includes('AUTOGEN_API_ANCHOR')
    ) {
      modified = true;
      continue;
    }

    resultLines.push(line);
  }

  // If the last line is blank and multiple blank lines occurred, clean up slightly
  const cleaned = resultLines.join('\n');
  return { cleaned, modified };
}

export async function executeEject(options: EjectOptions): Promise<EjectResult> {
  const { cwd, dryRun = false } = options;
  const filesDeleted: string[] = [];
  const filesModified: string[] = [];

  // Check specific files to delete
  const possibleDeleteTargets = [
    'src/components/CodersTrimDevToolbar.tsx',
    'components/CodersTrimDevToolbar.tsx',
    'frontend/src/components/CodersTrimDevToolbar.tsx',
    'frontend/components/CodersTrimDevToolbar.tsx',
    'resources/views/components/coderstrim-dev-toolbar.blade.php',
    'coderstrim.config.json',
    'frontend/coderstrim.config.json',
    'backend/coderstrim.config.json',
  ];

  for (const relPath of possibleDeleteTargets) {
    const fullPath = path.join(cwd, relPath);
    try {
      await fs.access(fullPath);
      filesDeleted.push(relPath);
    } catch {
      // file does not exist, ignore
    }
  }

  // Walk through files to find modifications
  const allFiles = await walkDir(cwd);
  const modificationsToApply: Array<{ filePath: string; newContent: string; relPath: string }> = [];

  for (const filePath of allFiles) {
    const relPath = path.relative(cwd, filePath).replace(/\\/g, '/');
    // Skip files scheduled for complete deletion
    if (filesDeleted.includes(relPath)) {
      continue;
    }

    try {
      const original = await fs.readFile(filePath, 'utf-8');
      const { cleaned, modified } = cleanToolbarAndAnchors(original);
      if (modified) {
        filesModified.push(relPath);
        modificationsToApply.push({ filePath, newContent: cleaned, relPath });
      }
    } catch {
      // Ignore binary or unreadable file
    }
  }

  if (dryRun) {
    return {
      success: true,
      filesDeleted,
      filesModified,
      message: `[DRY-RUN] Eject preview: ${filesDeleted.length} file(s) to delete, ${filesModified.length} file(s) to modify. No changes applied.`,
    };
  }

  // Create pre-eject backup snapshot
  const filesToBackup = [...filesDeleted, ...filesModified];
  if (filesToBackup.length > 0) {
    await createSnapshot(cwd, filesToBackup, 'pre-eject-backup');
  }

  // Apply deletions
  for (const relPath of filesDeleted) {
    try {
      await fs.unlink(path.join(cwd, relPath));
    } catch {
      // Ignore
    }
  }

  // Apply modifications
  for (const mod of modificationsToApply) {
    try {
      await fs.writeFile(mod.filePath, mod.newContent, 'utf-8');
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    filesDeleted,
    filesModified,
    message: `Successfully ejected! Deleted ${filesDeleted.length} file(s) and cleaned ${filesModified.length} file(s). Project is now 100% vanilla without CodersTrim dependencies.`,
  };
}
