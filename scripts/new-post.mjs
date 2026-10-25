#!/usr/bin/env node
// Create a new post or project from a template.
//
//   npm run new -- "My post title"
//   npm run new -- "Quick fix for colcon" --template note --tags "ros 2, tooling"
//   npm run new -- "My robot driver" --template project --tags "C++, ROS 2"
//
// Posts are created as drafts in src/content/journal/<slug>.md,
// projects in src/content/projects/<slug>.md.

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
  console.error('Usage: npm run new -- "Title" [--template article|note|project] [--tags "tag one, tag two"]');
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
  .replace(/\p{M}/gu, "") // strip accents: "Città" -> "citta"
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const collection = template === "project" ? "projects" : "journal";
const relativeTarget = `src/content/${collection}/${slug}.md`;
const target = join(root, relativeTarget);

if (existsSync(target)) {
  console.error(`An entry with this slug already exists: ${relativeTarget}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
// Project stacks keep their casing ("C++", "ROS 2"); post tags are lowercase.
const tagList = tags
  .split(",")
  .map((tag) => (template === "project" ? tag.trim() : tag.trim().toLowerCase()))
  .filter(Boolean)
  .map((tag) => JSON.stringify(tag))
  .join(", ");

const content = readFileSync(templatePath, "utf8")
  .replaceAll("{{title}}", title.replace(/"/g, '\\"'))
  .replaceAll("{{date}}", today)
  .replaceAll("{{year}}", today.slice(0, 4))
  .replaceAll("{{tags}}", tagList);

writeFileSync(target, content);
console.log(`Created ${relativeTarget} (draft)`);
console.log(
  `Preview: npm run dev, then open http://localhost:4321/${collection === "projects" ? "projects/" : `journal/${slug}/`}`
);
