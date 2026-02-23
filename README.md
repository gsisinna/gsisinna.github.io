# gsisinna.github.io

Personal blog built with Astro, styled like a Linux terminal app.

## Stack

- Astro
- Markdown content (Astro content collections)
- GitHub Pages (via GitHub Actions)

## Local Development

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

## Content

Posts live in:

- `src/content/journal/`

Current setup is intentionally minimal and keeps a single article explaining the blog's purpose and style.

## Editing the Main Article

Update:

- `src/content/journal/first-week-reset.md`

You can change:

- `title`
- `excerpt`
- `date`
- `tags`
- markdown body content

## Design / UI

Main terminal-style UI and theme live in:

- `src/layouts/BaseLayout.astro`

Pages:

- Home: `src/pages/index.astro`
- Notes list: `src/pages/journal/index.astro`
- Post page: `src/pages/journal/[slug].astro`

## Deployment (GitHub Pages)

This repo is configured to deploy with GitHub Actions:

- Workflow: `.github/workflows/deploy.yml`

Requirements:

1. Repository name is `gsisinna.github.io`
2. GitHub Pages source is set to `GitHub Actions`
3. Push to `main` branch

## Notes

- `astro.config.mjs` uses `site: "https://gsisinna.github.io"` (correct for a user/org Pages site)
- No `base` path is needed for `gsisinna.github.io`

