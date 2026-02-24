import { defineCollection, z } from "astro:content";

const journal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readingTime: z.string().optional(),
    image: z.string().optional()
  })
});

export const collections = { journal };
