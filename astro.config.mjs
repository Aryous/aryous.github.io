// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://aryous.github.io',
  // Astro 7 defaults to 'jsx', which drops spaces between inline elements.
  compressHTML: true,
  // We don't use advanced routing; keep src/fetch.ts free for anything else.
  fetchFile: null,
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    processor: satteri({
      features: {
        gfm: { footnotes: { label: '注释 · Notes', backLabel: '回到正文 · Back to reference {reference}' } },
      },
    }),
  },
});
