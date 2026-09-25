import { describe, it, expect } from 'vitest';
import { injectAtAnchor } from '../src/services/anchor-inject.js';

describe('AnchorInject Service', () => {
  it('injects content directly below a JS/TS anchor comment', () => {
    const source = `
import express from 'express';
const app = express();

// @CodersTrim-Inject-Routes

app.listen(3000);
    `.trim();

    const result = injectAtAnchor(source, 'Routes', "app.get('/api', (req, res) => res.send('ok'));");

    expect(result.injected).toBe(true);
    expect(result.content).toContain("// @CodersTrim-Inject-Routes\napp.get('/api', (req, res) => res.send('ok'));");
  });

  it('preserves indentation matching the anchor comment line', () => {
    const source = [
      'function setup() {',
      '    // @CodersTrim-Inject-Middlewares',
      '    return true;',
      '}',
    ].join('\n');

    const result = injectAtAnchor(source, 'Middlewares', 'useAuth();\nuseLogger();');

    expect(result.injected).toBe(true);
    expect(result.content).toContain('    // @CodersTrim-Inject-Middlewares\n    useAuth();\n    useLogger();');
  });

  it('supports Python-style anchors (# @CodersTrim-Inject-KEY)', () => {
    const source = [
      'from fastapi import FastAPI',
      'app = FastAPI()',
      '# @CodersTrim-Inject-Routers',
    ].join('\n');

    const result = injectAtAnchor(source, 'Routers', 'app.include_router(auth_router)');

    expect(result.injected).toBe(true);
    expect(result.content).toContain('# @CodersTrim-Inject-Routers\napp.include_router(auth_router)');
  });

  it('supports HTML/JSX-style anchors (<!-- @CodersTrim-Inject-KEY -->)', () => {
    const source = [
      '<nav>',
      '  <!-- @CodersTrim-Inject-NavItems -->',
      '</nav>',
    ].join('\n');

    const result = injectAtAnchor(source, 'NavItems', '<a href="/dashboard">Dashboard</a>');

    expect(result.injected).toBe(true);
    expect(result.content).toContain('  <!-- @CodersTrim-Inject-NavItems -->\n  <a href="/dashboard">Dashboard</a>');
  });

  it('skips duplicate injection idempotently', () => {
    const source = '// @CodersTrim-Inject-Routes\napp.get("/status", ok);';
    const result = injectAtAnchor(source, 'Routes', 'app.get("/status", ok);');

    expect(result.injected).toBe(false);
    expect(result.reason).toContain('idempotent skip');
  });
});
