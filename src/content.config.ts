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
    image: z.string().optional(),
    // Describe the cover for screen readers; defaults to the post title.
    imageAlt: z.string().optional(),
    // "cover" fills the frame (photos); "contain" shows the whole image on a light card
    // (diagrams, screenshots, transparent PNGs, social cards).
    imageFit: z.enum(["cover", "contain"]).default("cover"),
    // CSS object-position for "cover", e.g. "center", "left", "50% 30%".
    imagePosition: z.string().regex(/^[a-z0-9%. -]+$/i).default("center")
  })
});

export const collections = { journal };
