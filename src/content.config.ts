import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/work.
// Fill the frontmatter, swap placeholder images for real ones, done.
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    role: z.string(),
    year: z.string(),
    // Which layers (disciplines) this project sits on
    disciplines: z.array(z.enum(['ux', 'brand', 'visual', 'film', 'photo'])),
    kind: z.enum(['Client', 'Internship', 'Academic', 'Freelance', 'Personal']),
    summary: z.string(),
    // The page tints to this colour while the project is in view
    accent: z.string().default('#2D5BFF'),
    // 'process' = UX-style case study, 'visual' = image/film-led case study
    template: z.enum(['process', 'visual']),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    tools: z.array(z.string()).default([]),
    // Real media: put files in /public/work/<slug>/ and reference them here
    cover: z.string().optional(),
    process: z.string().optional(),
    finalLabel: z.string().default('Final'),
    processLabel: z.string().default('Process'),
  }),
});

export const collections = { work };
