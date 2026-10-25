import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight
} from "@shikijs/transformers";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "aside", "details", "summary", "figure", "figcaption"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    "*": [...((defaultSchema.attributes && defaultSchema.attributes["*"]) ?? []), "className"],
    a: [...((defaultSchema.attributes && defaultSchema.attributes.a) ?? []), "target", "rel"],
    code: [...((defaultSchema.attributes && defaultSchema.attributes.code) ?? []), "metastring"],
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes.img) ?? []),
      "loading",
      "decoding",
      "referrerPolicy"
    ]
  }
};

/**
 * rehype-raw and the sanitizer rebuild nodes and drop `data`, which is where code fence meta
 * (`title="..."`, `{1,3}`, `showLineNumbers`) lives. Keep it as an attribute
 * that @shikijs/rehype reads instead.
 */
const rehypeKeepCodeMeta = () => (tree) => {
  const visit = (node) => {
    if (node.tagName === "code" && node.data?.meta) {
      node.properties = { ...node.properties, metastring: node.data.meta };
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};

const languageLabels = {
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cmake: "CMake",
  css: "CSS",
  diff: "Diff",
  docker: "Dockerfile",
  dockerfile: "Dockerfile",
  html: "HTML",
  java: "Java",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  kotlin: "Kotlin",
  md: "Markdown",
  markdown: "Markdown",
  py: "Python",
  python: "Python",
  rust: "Rust",
  sql: "SQL",
  toml: "TOML",
  ts: "TypeScript",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML"
};

/**
 * Adds data attributes the post page uses to draw the code block header:
 * language label, optional `title="file.ext"`, and optional `showLineNumbers`.
 */
const transformerCodeFrame = () => ({
  name: "code-frame",
  pre(node) {
    const lang = this.options.lang?.toLowerCase() ?? "text";
    const meta = this.options.meta?.__raw ?? "";
    const title = meta.match(/title="([^"]+)"/)?.[1];
    if (!["text", "plaintext", "txt"].includes(lang)) {
      node.properties["data-language"] = languageLabels[lang] ?? lang;
    }
    if (title) node.properties["data-title"] = title;
    if (/\bshowLineNumbers\b/.test(meta)) this.addClassToHast(node, "line-numbers");
  }
});

export default defineConfig({
  site: "https://gsisinna.github.io",
  markdown: {
    // Highlighting runs after sanitizing (below) so token colors survive.
    syntaxHighlight: false,
    // Astro only parses raw HTML after user plugins run, so parse it first;
    // otherwise the sanitizer drops inline HTML blocks (callouts, figures) entirely.
    rehypePlugins: [
      rehypeKeepCodeMeta,
      rehypeRaw,
      [rehypeSanitize, sanitizeSchema],
      [
        rehypeShiki,
        {
          theme: "vitesse-dark",
          defaultLanguage: "text",
          fallbackLanguage: "text",
          transformers: [
            transformerMetaHighlight(),
            transformerNotationHighlight(),
            transformerNotationDiff(),
            transformerCodeFrame()
          ]
        }
      ]
    ]
  }
});
