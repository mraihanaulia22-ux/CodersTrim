export interface InjectionResult {
  injected: boolean;
  content: string;
  reason?: string;
}

/**
 * Injects code content safely into target source code using anchor comments.
 * Automatically aligns with the anchor's indentation and ensures idempotency.
 */
export function injectAtAnchor(
  sourceContent: string,
  anchorKey: string,
  contentToInject: string
): InjectionResult {
  // Check if content is already present to prevent duplicate injections
  if (sourceContent.includes(contentToInject.trim())) {
    return {
      injected: false,
      content: sourceContent,
      reason: 'Content already exists in source file (idempotent skip)',
    };
  }

  // Regex patterns supporting JS/TS, Python, and HTML/JSX anchor styles
  const escapedKey = anchorKey.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const anchorRegex = new RegExp(
    `^([ \\t]*)(?://|#|<!--|{\\/\\*)[ \\t]*@CodersTrim-Inject-${escapedKey}(?:[ \\t]*(?:-->|\\*\\/))?[ \\t]*$`,
    'm'
  );

  const match = sourceContent.match(anchorRegex);
  if (!match || match.index === undefined) {
    return {
      injected: false,
      content: sourceContent,
      reason: `Anchor key '@CodersTrim-Inject-${anchorKey}' not found`,
    };
  }

  const indentation = match[1] || '';
  const anchorFullLine = match[0];

  // Indent every line of the injected content to match the anchor's level
  const formattedLines = contentToInject
    .split('\n')
    .map((line) => (line.trim().length > 0 ? `${indentation}${line}` : line))
    .join('\n');

  // Place the injected code right below the anchor comment
  const replacement = `${anchorFullLine}\n${formattedLines}`;
  const updatedContent =
    sourceContent.slice(0, match.index) +
    replacement +
    sourceContent.slice(match.index + anchorFullLine.length);

  return {
    injected: true,
    content: updatedContent,
  };
}
