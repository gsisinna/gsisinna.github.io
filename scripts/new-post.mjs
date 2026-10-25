#!/usr/bin/env node
// Create a new post from a template.
//
//   npm run new -- "My post title"
//   npm run new -- "Quick fix for colcon" --template note --tags "ros 2, tooling"
//
// The post is created as a draft in src/content/journal/<slug>.md.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = args[index + 1];
  args.splice(index, 2);
  return value;
};

const template = option("template", "article");
const tags = option("tags", "");
const title = args.join(" ").trim();

if (!title) {
  console.error('Usage: npm run new -- "Post title" [--template article|note] [--tags "tag one, tag two"]');
  process.exit(1);
}

const templatePath = join(root, "templates", `${template}.md`);
if (!existsSync(templatePath)) {
  console.error(`Template not found: templates/${template}.md`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const target = join(root, "src", "content", "journal", `${slug}.md`);

if (existsSync(target)) {
  console.error(`A post with this slug already exists: src/content/journal/${slug}.md`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const tagList = tags
  .split(",")
  .map((tag) => tag.trim().toLowerCase())
  .filter(Boolean)
  .map((tag) => JSON.stringify(tag))
  .join(", ");

const content = readFileSync(templatePath, "utf8")
  .replaceAll("{{title}}", title.replace(/"/g, '\\"'))
  .replaceAll("{{date}}", today)
  .replaceAll("{{tags}}", tagList);

writeFileSync(target, content);
console.log(`Created src/content/journal/${slug}.md (draft)`);
console.log(`Preview: npm run dev, then open http://localhost:4321/journal/${slug}/`);
