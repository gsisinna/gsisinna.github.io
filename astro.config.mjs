import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "aside", "details", "summary", "figure", "figcaption"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    "*": [...((defaultSchema.attributes && defaultSchema.attributes["*"]) ?? []), "className"],
    a: [...((defaultSchema.attributes && defaultSchema.attributes.a) ?? []), "target", "rel"],
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes.img) ?? []),
      "loading",
      "decoding",
      "referrerPolicy"
    ]
  }
};

export default defineConfig({
  site: "https://gsisinna.github.io",
  markdown: {
    // Astro only parses raw HTML after user plugins run, so parse it first;
    // otherwise the sanitizer drops inline HTML blocks (callouts, figures) entirely.
    rehypePlugins: [rehypeRaw, [rehypeSanitize, sanitizeSchema]]
  }
});
