import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  getUserPreferences,
  saveUserPreferences,
  formatEducationalStep,
  getPreferencesFilePath,
} from '../src/services/user-preferences.js';

describe('UserPreferences Service & Guided Learning', () => {
  const prefPath = getPreferencesFilePath();
  let originalContent: string | null = null;

  beforeEach(async () => {
    try {
      originalContent = await fs.readFile(prefPath, 'utf-8');
    } catch {
      originalContent = null;
    }
  });

  afterEach(async () => {
    if (originalContent !== null) {
      await fs.writeFile(prefPath, originalContent, 'utf-8');
    } else {
      try {
        await fs.unlink(prefPath);
      } catch {
        // Ignore
      }
    }
  });

  it('reads default preferences if file does not exist', async () => {
    try {
      await fs.unlink(prefPath);
    } catch {
      // Ignore
    }

    const prefs = await getUserPreferences();
    expect(prefs.skillLevel).toBe('beginner');
    expect(prefs.showTerminalTips).toBe(true);
  });

  it('updates and persists preferences across calls', async () => {
    await saveUserPreferences({ skillLevel: 'pro', showTerminalTips: false });
    const prefs = await getUserPreferences();
    expect(prefs.skillLevel).toBe('pro');
    expect(prefs.showTerminalTips).toBe(false);
  });

  it('formats educational steps with annotations in beginner mode', () => {
    const formatted = formatEducationalStep('npm install', 'beginner');
    expect(formatted).toContain('npm install');
    expect(formatted).toContain('Mengunduh dependensi pustaka');

    const formattedCd = formatEducationalStep('cd my-app', 'beginner');
    expect(formattedCd).toContain('Masuk ke direktori folder proyek');
  });

  it('formats steps cleanly without annotations in pro mode', () => {
    const formatted = formatEducationalStep('npm install', 'pro');
    expect(formatted).toContain('npm install');
    expect(formatted).not.toContain('Mengunduh dependensi pustaka');
  });
});
