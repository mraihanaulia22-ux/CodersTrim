/**
 * Represents a diagnostic finding discovered by a linter or typo engine.
 */
export interface LintIssue {
  /** Unique identifier for this issue instance */
  id: string;

  /** Absolute or relative path to the affected source file */
  file: string;

  /** Line number (1-indexed) where the issue starts */
  line: number;

  /** Column number (1-indexed) where the issue starts */
  column: number;

  /** Categorization of the issue */
  type: 'typo' | 'invalid_class' | 'deprecated' | 'syntax_warning';

  /** The original string snippet or class name */
  original: string;

  /** The suggested replacement string snippet */
  suggested: string;

  /** Confidence score between 0.0 and 1.0 */
  confidence: number;

  /** Character range [startIndex, endIndex] within the file string */
  range: [number, number];

  /** User-friendly explanation of why this was flagged */
  message: string;
}

/**
 * Result of applying an automated fix.
 */
export interface FixResult {
  file: string;
  issuesFixed: number;
  originalContent: string;
  modifiedContent: string;
}
