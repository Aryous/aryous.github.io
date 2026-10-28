// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aryous.github.io',
  // Astro 7 defaults to 'jsx', which drops spaces between inline elements.
  compressHTML: true,
  // We don't use advanced routing; keep src/fetch.ts free for anything else.
  fetchFile: null,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
