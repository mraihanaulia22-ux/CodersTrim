import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getStarterTemplates, StarterTemplate } from './starter-templates.js';

const execAsync = promisify(exec);

export type SupportedTemplateId = 'react' | 'nextjs' | 'laravel' | 'laravel-api' | 'fastapi' | 'gofiber';

export interface ProjectGeneratorOptions {
  projectName: string;
  templateId?: SupportedTemplateId;
  mode?: 'standalone' | 'fullstack';
  frontendTemplate?: 'react' | 'nextjs' | 'none';
  backendTemplate?: 'fastapi' | 'laravel' | 'laravel-api' | 'gofiber' | 'none';
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
 * Scaffolds a new project with standalone or decoupled fullstack architecture,
 * configures CORS & API client wiring, and initializes a clean Git repository.
 */
export async function generateProject(
  options: ProjectGeneratorOptions
): Promise<ProjectGeneratorResult> {
  const { projectName, cwd } = options;
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
  const filesCreated: string[] = [];
  const nextSteps: string[] = [];

  const isFullstack =
    options.mode === 'fullstack' ||
    (options.frontendTemplate &&
      options.backendTemplate &&
      options.frontendTemplate !== 'none' &&
      options.backendTemplate !== 'none');

  if (isFullstack) {
    const feKey = options.frontendTemplate ?? 'react';
    const beKey = options.backendTemplate ?? 'fastapi';

    const feTpl = templates[feKey];
    const beTpl = templates[beKey];

    if (!feTpl || !beTpl) {
      return {
        success: false,
        projectPath,
        filesCreated: [],
        nextSteps: [],
        message: `Invalid template combination: frontend='${feKey}', backend='${beKey}'`,
      };
    }

    const bePort = beTpl.defaultPort ?? 8000;
    const fePort = feTpl.defaultPort ?? 5173;

    // 1. Write frontend files into frontend/
    for (const [relPath, content] of Object.entries(feTpl.files)) {
      let finalContent = content;
      // Wire API client port to backend port
      if (relPath === 'src/services/api.ts') {
        finalContent = finalContent.replace(
          /http:\/\/localhost:\d+/g,
          `http://localhost:${bePort}`
        );
      }
      const fullPath = path.join(projectPath, 'frontend', relPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, finalContent, 'utf-8');
      filesCreated.push(path.join('frontend', relPath).replace(/\\/g, '/'));
    }

    // 2. Write backend files into backend/
    for (const [relPath, content] of Object.entries(beTpl.files)) {
      let finalContent = content;
      // Ensure backend CORS explicitly includes frontend port
      if (relPath === 'main.py' || relPath === 'main.go' || relPath === 'config/cors.php') {
        if (!finalContent.includes(`http://localhost:${fePort}`)) {
          finalContent = finalContent.replace(
            /http:\/\/localhost:5173/g,
            `http://localhost:${fePort}`
          );
        }
      }
      const fullPath = path.join(projectPath, 'backend', relPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, finalContent, 'utf-8');
      filesCreated.push(path.join('backend', relPath).replace(/\\/g, '/'));
    }

    // 3. Write Root Monorepo Configurations
    const rootConfig = {
      name: projectName,
      mode: 'fullstack',
      frontend: { framework: feKey, port: fePort },
      backend: { framework: beKey, port: bePort },
      plugins: ['@coderstrim/plugin-tailwind'],
    };

    const rootConfigPath = path.join(projectPath, 'coderstrim.config.json');
    await fs.writeFile(rootConfigPath, JSON.stringify(rootConfig, null, 2), 'utf-8');
    filesCreated.push('coderstrim.config.json');

    const readmeContent = `# ${projectName}

Fullstack application created with [CodersTrim](https://github.com/mraihanaulia22-ux/CodersTrim).

## Architecture
- **Frontend**: ${feTpl.name} (\`frontend/\`) - Running on http://localhost:${fePort}
- **Backend**: ${beTpl.name} (\`backend/\`) - Running on http://localhost:${bePort}
- **API Wiring**: Pre-configured with automatic CORS and \`frontend/src/services/api.ts\`.

## Getting Started

### 1. Start the Backend
\`\`\`bash
cd backend
${beTpl.nextSteps.slice(1).join('\n')}
\`\`\`

### 2. Start the Frontend
\`\`\`bash
cd frontend
${feTpl.nextSteps.slice(1).join('\n')}
\`\`\`
`;
    const readmePath = path.join(projectPath, 'README.md');
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
    filesCreated.push('README.md');

    nextSteps.push(
      `Backend: cd ${projectName}/backend && ${beTpl.nextSteps.slice(1).join(' && ')}`,
      `Frontend: cd ${projectName}/frontend && ${feTpl.nextSteps.slice(1).join(' && ')}`
    );
  } else {
    // Standalone Single App
    let activeKey = options.templateId;
    if (!activeKey) {
      if (options.frontendTemplate && options.frontendTemplate !== 'none') {
        activeKey = options.frontendTemplate as SupportedTemplateId;
      } else if (options.backendTemplate && options.backendTemplate !== 'none') {
        activeKey = options.backendTemplate as SupportedTemplateId;
      } else {
        activeKey = 'react';
      }
    }

    const tpl: StarterTemplate | undefined = templates[activeKey];
    if (!tpl) {
      return {
        success: false,
        projectPath,
        filesCreated: [],
        nextSteps: [],
        message: `Unknown starter template '${activeKey}'.`,
      };
    }

    for (const [relPath, content] of Object.entries(tpl.files)) {
      const fullFilePath = path.join(projectPath, relPath);
      await fs.mkdir(path.dirname(fullFilePath), { recursive: true });
      await fs.writeFile(fullFilePath, content, 'utf-8');
      filesCreated.push(relPath.replace(/\\/g, '/'));
    }

    nextSteps.push(...tpl.nextSteps);
  }

  // Initialize git repository
  try {
    await execAsync('git init -b main', { cwd: projectPath });
  } catch {
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
    message: isFullstack
      ? `Fullstack project '${projectName}' created successfully with ${options.frontendTemplate ?? 'react'} + ${options.backendTemplate ?? 'fastapi'}.`
      : `Project '${projectName}' created successfully.`,
  };
}
