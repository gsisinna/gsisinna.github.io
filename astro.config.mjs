import { defineConfig } from "astro/config";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "aside", "details", "summary"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    "*": [...((defaultSchema.attributes && defaultSchema.attributes["*"]) ?? []), "className"],
    a: [...((defaultSchema.attributes && defaultSchema.attributes.a) ?? []), "target", "rel"],
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes.img) ?? []),
      "loading",
      "decoding",
      "referrerpolicy"
    ]
  }
};

export default defineConfig({
  site: "https://gsisinna.github.io",
  markdown: {
    rehypePlugins: [[rehypeSanitize, sanitizeSchema]]
  }
});
