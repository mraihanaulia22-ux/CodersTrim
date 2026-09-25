import pc from 'picocolors';

/**
 * Lightweight, colorized terminal logger for CodersTrim.
 * Avoids heavy styling dependencies for peak performance.
 */
export const logger = {
  info(message: string): void {
    console.log(`${pc.cyan('ℹ')} ${pc.dim('[CodersTrim]')} ${message}`);
  },

  success(message: string): void {
    console.log(`${pc.green('✔')} ${pc.dim('[CodersTrim]')} ${pc.green(message)}`);
  },

  warn(message: string): void {
    console.warn(`${pc.yellow('⚠')} ${pc.dim('[CodersTrim]')} ${pc.yellow(message)}`);
  },

  error(message: string): void {
    console.error(`${pc.red('✖')} ${pc.dim('[CodersTrim]')} ${pc.red(message)}`);
  },

  heading(title: string): void {
    console.log(`\n${pc.bold(pc.cyan(title))}`);
  },

  vcs(message: string): void {
    console.log(`${pc.magenta('⌥')} ${pc.dim('[VCS-Guard]')} ${message}`);
  },

  backup(message: string): void {
    console.log(`${pc.blue('💾')} ${pc.dim('[Snapshot]')} ${message}`);
  },

  banner(): void {
    console.log(
      pc.cyan(
        `\n   ___          __               ______      _          ` +
        `\n  / __\\___   __| | ___ _ __ ___ /__   \\_ __(_)_ __ ___  ` +
        `\n / /  / _ \\ / _\` |/ _ \\ '__/ __|  / /\\/ '__| | '_ \` _ \\ ` +
        `\n/ /__| (_) | (_| |  __/ |  \\__ \\ / /  | |  | | | | | | |` +
        `\n\\____/\\___/ \\__,_|\\___|_|  |___/ \\/   |_|  |_|_| |_| |_| v2.0.0\n`
      )
    );
  },
};
