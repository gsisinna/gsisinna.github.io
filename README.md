# gsisinna.github.io

Personal site and blog of Gabriele Sisinna, built with [Astro](https://astro.build) and deployed to
GitHub Pages.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # production build in dist/, drafts excluded
```

Pushing to `main` deploys automatically (`.github/workflows/deploy.yml`).

## Writing a post

### 1. Create it from a template

```bash
npm run new -- "My post title"
npm run new -- "Fixing colcon caching" --template note --tags "ros 2, tooling"
```

This creates `src/content/journal/<slug>.md` with today's date and `draft: true`.

| Template | Use it for |
| --- | --- |
| `templates/article.md` | Long-form posts. Contains an example of every building block (callouts, code, images, tables). |
| `templates/note.md` | Short notes: one problem, one fix. |

The [Front Matter](https://frontmatter.codes) VS Code extension also picks these templates up
(`frontmatter.json`).

### 2. Preview while you write

Run `npm run dev` and open `http://localhost:4321/journal/<slug>/`. Drafts show a yellow
"Draft" label and never appear in the production build, RSS, sitemap, or search.

### 3. Publish

Set `draft: false`, commit, and push.

### Front matter

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | |
| `excerpt` | yes | 1–2 sentences. Used in lists, search, RSS, and link previews. |
| `date` | yes | `YYYY-MM-DD` publish date. |
| `updated` | no | Set when you meaningfully revise a post. Shown as "Updated …". |
| `tags` | no | Lowercase, e.g. `["ros 2", "cpp"]`. Each tag gets its own page. |
| `image` | no | Cover image URL or `/images/name.jpg` (files go in `public/images/`). |
| `readingTime` | no | Computed automatically; set only to override. |
| `draft` | no | `true` hides the post outside `npm run dev`. |

### Building blocks

Code blocks are highlighted by language ([Shiki](https://shiki.style), `vitesse-dark` theme) and
get a header with the language and a copy button.

````md
```cpp title="node.cpp" showLineNumbers {3}
// title → file label, showLineNumbers → line numbers, {3} → highlight line 3
```

```ts
const a = 1; // [!code --]
const a = 2; // [!code ++]
const b = 3; // [!code highlight]
```
````

Callouts (`callout-note`, `callout-tip`, `callout-warn`), figures, and collapsible sections use
small HTML blocks; copy them from `templates/article.md` or use the VS Code snippets in
`.vscode/blog.code-snippets` (`callout`, `figure`, `code`, `details`).

Posts with three or more `##` headings get an automatic table of contents.

Inline HTML is sanitized: scripts, event handlers, and `style` attributes are removed.

## Editing the site

| What | Where |
| --- | --- |
| Bio, headline, experience, skills, links | `src/data/profile.ts` |
| Global styles, light/dark theme tokens, animations | `src/styles/base.css` |
| Theme toggle, scroll reveal (`data-reveal`), reading progress | `src/scripts/site.ts` |
| Header, footer, SEO metadata | `src/layouts/BaseLayout.astro` |
| Home page | `src/pages/index.astro` |
| Notes archive / post page | `src/pages/journal/` |
| Topics | `src/pages/tags/` |
| Markdown pipeline (sanitizer, syntax highlighting) | `astro.config.mjs` |
