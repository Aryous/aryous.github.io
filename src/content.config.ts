import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "hello-world/zh.md" → id "hello-world/zh" (slug + language).
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.md', generateId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md', generateId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date().optional(),
      status: z.enum(['active', 'done', 'archived']).optional(),
      links: z.object({ repo: z.url().optional(), demo: z.url().optional() }).optional(),
      cover: image().optional(),
      object: image().optional(),
      featured: z.boolean().optional(),
      onCover: z.boolean().optional(),
      order: z.number().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = { writing, projects };
