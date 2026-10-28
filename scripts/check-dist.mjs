import { existsSync } from 'node:fs';
if (!existsSync('dist/index.html')) { console.error('dist/index.html missing'); process.exit(1); }
console.log('check-dist: ok');
