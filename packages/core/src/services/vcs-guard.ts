import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface VCSStatus {
  isGitRepo: boolean;
  isClean: boolean;
  branch?: string;
  uncommittedFiles: string[];
}

/**
 * Checks Git repository status and guarantees working-tree safety.
 */
export async function getVCSStatus(cwd: string): Promise<VCSStatus> {
  try {
    // Check if inside work tree
    await execAsync('git rev-parse --is-inside-work-tree', { cwd });

    // Get current branch name
    let branch: string | undefined;
    try {
      const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd });
      branch = branchOut.trim();
    } catch {
      // Branch might not exist yet on empty init
      branch = 'main';
    }

    // Check porcelain status for dirty working tree
    const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd });
    const lines = statusOut
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return {
      isGitRepo: true,
      isClean: lines.length === 0,
      branch,
      uncommittedFiles: lines,
    };
  } catch {
    // Not a git repo
    return {
      isGitRepo: false,
      isClean: true,
      uncommittedFiles: [],
    };
  }
}

/**
 * Verifies that the project is safe for code mutation.
 * Throws or returns failure message if dirty changes exist and force flag is false.
 */
export async function assertVCSClean(
  cwd: string,
  force: boolean = false
): Promise<{ allowed: boolean; message?: string }> {
  const status = await getVCSStatus(cwd);

  if (!status.isGitRepo) {
    return { allowed: true };
  }

  if (status.isClean || force) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: `Aborted: You have ${status.uncommittedFiles.length} uncommitted changes. Please commit or stash your changes before running this command, or pass --force.`,
  };
}
