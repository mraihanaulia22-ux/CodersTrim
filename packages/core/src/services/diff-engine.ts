import { createTwoFilesPatch } from 'diff';
import pc from 'picocolors';

export interface DiffPreviewResult {
  hasDifferences: boolean;
  rawPatch: string;
  formattedOutput: string;
}

/**
 * Generates a unified diff and returns a colorized terminal string.
 * Green for additions, Red for deletions, Dim for headers and context.
 */
export function generateDiffPreview(
  filePath: string,
  originalContent: string,
  modifiedContent: string
): DiffPreviewResult {
  if (originalContent === modifiedContent) {
    return {
      hasDifferences: false,
      rawPatch: '',
      formattedOutput: '',
    };
  }

  const patch = createTwoFilesPatch(
    filePath,
    filePath,
    originalContent,
    modifiedContent,
    'original',
    'suggested fix',
    { context: 2 }
  );

  const lines = patch.split('\n');
  const formattedLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++')) {
      formattedLines.push(pc.dim(pc.bold(line)));
    } else if (line.startsWith('@@')) {
      formattedLines.push(pc.cyan(line));
    } else if (line.startsWith('+')) {
      formattedLines.push(pc.green(line));
    } else if (line.startsWith('-')) {
      formattedLines.push(pc.red(line));
    } else {
      formattedLines.push(pc.dim(line));
    }
  }

  return {
    hasDifferences: true,
    rawPatch: patch,
    formattedOutput: formattedLines.join('\n'),
  };
}
