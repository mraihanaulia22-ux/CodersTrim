import { describe, it, expect } from 'vitest';
import { createBootstrapProgram } from '../src/index.js';

describe('create-coderstrim bootstrap program', () => {
  it('initializes program with name create-coderstrim and version 2.0.0', () => {
    const program = createBootstrapProgram();
    expect(program.name()).toBe('create-coderstrim');
    expect(program.version()).toBe('2.0.0');
  });

  it('declares the -t, --template option for framework selection', () => {
    const program = createBootstrapProgram();
    const templateOption = program.options.find((opt) => opt.name() === 'template');
    expect(templateOption).toBeDefined();
    expect(templateOption?.short).toBe('-t');
  });
});
