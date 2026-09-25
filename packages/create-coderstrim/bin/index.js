#!/usr/bin/env node

import('../dist/index.js').then((pkg) => {
  if (pkg && typeof pkg.runBootstrap === 'function') {
    pkg.runBootstrap();
  }
}).catch((err) => {
  console.error('\x1b[31m[create-coderstrim Fatal Error]\x1b[0m', err);
  process.exit(1);
});
