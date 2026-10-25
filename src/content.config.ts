import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const journal = defineCollection({
  loader: glob({
    base: "./src/content/journal",
    pattern: ["**/*.md", "!**/*~*.md"]
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    // Set when you meaningfully revise a published post; shown as "Updated" on the page.
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional override; computed from the body when omitted.
    readingTime: z.string().optional(),
    image: z.string().optional()
  })
});

export const collections = { journal };
