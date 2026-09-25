import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadConfig } from '../src/plugins/config-loader.js';

describe('ConfigLoader', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coderstrim-config-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('returns default configuration if no config file is present', async () => {
    const config = await loadConfig(tempDir);
    expect(config.plugins).toEqual([]);
    expect(config.doctor.maxLevenshteinDistance).toBe(2);
    expect(config.doctor.confidenceThreshold).toBe(0.85);
  });

  it('loads and validates coderstrim.config.json correctly', async () => {
    const customConfig = {
      plugins: ['@coderstrim/plugin-tailwind', 'coderstrim-plugin-custom'],
      doctor: {
        maxLevenshteinDistance: 3,
        confidenceThreshold: 0.9,
      },
    };

    await fs.writeFile(
      path.join(tempDir, 'coderstrim.config.json'),
      JSON.stringify(customConfig, null, 2),
      'utf-8'
    );

    const loaded = await loadConfig(tempDir);
    expect(loaded.plugins).toEqual(['@coderstrim/plugin-tailwind', 'coderstrim-plugin-custom']);
    expect(loaded.doctor.maxLevenshteinDistance).toBe(3);
    expect(loaded.doctor.confidenceThreshold).toBe(0.9);
  });

  it('falls back to defaults if config file is corrupted JSON', async () => {
    await fs.writeFile(
      path.join(tempDir, 'coderstrim.config.json'),
      '{ invalid_json: ',
      'utf-8'
    );

    const loaded = await loadConfig(tempDir);
    expect(loaded.plugins).toEqual([]);
    expect(loaded.doctor.maxLevenshteinDistance).toBe(2);
  });
});
