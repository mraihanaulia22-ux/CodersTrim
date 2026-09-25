import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getStarterTemplates } from './starter-templates.js';

const execAsync = promisify(exec);

export interface ProjectGeneratorOptions {
  projectName: string;
  templateId: 'react' | 'nextjs' | 'laravel' | 'fastapi';
  cwd: string;
}

export interface ProjectGeneratorResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  nextSteps: string[];
  message: string;
}

/**
 * Scaffolds a new project with the chosen framework, generates configuration,
 * and initializes a clean Git repository.
 */
export async function generateProject(
  options: ProjectGeneratorOptions
): Promise<ProjectGeneratorResult> {
  const { projectName, templateId, cwd } = options;
  const projectPath = path.resolve(cwd, projectName);

  // Check if directory already exists and is not empty
  try {
    const existing = await fs.readdir(projectPath);
    if (existing.length > 0) {
      return {
        success: false,
        projectPath,
        filesCreated: [],
        nextSteps: [],
        message: `Directory '${projectName}' already exists and is not empty.`,
      };
    }
  } catch {
    // Directory does not exist yet, proceed
  }

  await fs.mkdir(projectPath, { recursive: true });

  const templates = getStarterTemplates(projectName);
  let filesToCreate: Record<string, string> = {};
  let nextSteps: string[] = [];

  if (templateId === 'react') {
    // Basic react template fallback for core
    filesToCreate = {
      'package.json': JSON.stringify({ name: projectName, version: '0.1.0', private: true, dependencies: { react: '^19.0.0' } }, null, 2),
      'src/App.tsx': `export default function App() { return <h1>${projectName}</h1>; }\n// @CodersTrim-Inject-Components\n`,
      'coderstrim.config.json': JSON.stringify({ plugins: ['@coderstrim/plugin-tailwind', '@coderstrim/plugin-react'] }, null, 2),
    };
    nextSteps = [`cd ${projectName}`, 'npm install', 'npm run dev'];
  } else if (templates[templateId]) {
    const tpl = templates[templateId];
    filesToCreate = tpl.files;
    nextSteps = tpl.nextSteps;
  } else {
    return {
      success: false,
      projectPath,
      filesCreated: [],
      nextSteps: [],
      message: `Unknown starter template '${templateId}'. Supported: react, nextjs, laravel, fastapi`,
    };
  }

  const filesCreated: string[] = [];
  for (const [relPath, content] of Object.entries(filesToCreate)) {
    const fullFilePath = path.join(projectPath, relPath);
    await fs.mkdir(path.dirname(fullFilePath), { recursive: true });
    await fs.writeFile(fullFilePath, content, 'utf-8');
    filesCreated.push(relPath);
  }

  // Initialize git repository
  try {
    await execAsync('git init -b main', { cwd: projectPath });
  } catch {
    // Fallback if -b main is unsupported by old git
    try {
      await execAsync('git init', { cwd: projectPath });
    } catch {
      // Git not available on system, skip
    }
  }

  return {
    success: true,
    projectPath,
    filesCreated,
    nextSteps,
    message: `Project '${projectName}' created successfully with ${templateId}.`,
  };
}
