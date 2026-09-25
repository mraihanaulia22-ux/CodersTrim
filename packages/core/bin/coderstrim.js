#!/usr/bin/env node

import('../dist/cli.js').then((cli) => {
  if (cli && typeof cli.runCLI === 'function') {
    cli.runCLI();
  }
}).catch((err) => {
  console.error('\x1b[31m[CodersTrim Fatal Error]\x1b[0m', err);
  process.exit(1);
});
