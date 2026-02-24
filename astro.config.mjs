import { defineConfig } from "astro/config";
import rehypeSanitize from "rehype-sanitize";

export default defineConfig({
  site: "https://gsisinna.github.io",
  markdown: {
    rehypePlugins: [rehypeSanitize]
  }
});
