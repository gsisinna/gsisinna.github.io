---
title: "The Software Architecture of This Blog: How I Built a Fast, Terminal-Style Astro Site"
excerpt: "A meta-post about the software architecture behind this blog: Astro content collections, shared layout design, SEO metadata, RSS and sitemap generation, GitHub Pages deployment, and the practical decisions that keep it maintainable."
date: 2026-02-24
tags: ["software architecture", "astro", "blog", "meta", "frontend", "seo"]
readingTime: "10 min read"
image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1600&q=80"
draft: false
---

I like blogs that feel small, focused, and fast.

I also like systems that are easy to reason about.

This site is where those two preferences meet.

It looks like a terminal, but under the surface it is a static site built with **Astro**, content collections, a shared layout system, and a small set of custom routes for SEO and discoverability.

This post is a meta-walkthrough of the software architecture of the blog itself: what is in the stack, how content flows, what I optimized for, and what tradeoffs I made.

If you want the more personal "why" behind this project before reading the implementation details, start with
["About This Blog"](/journal/about-this-blog/).

<figure style="margin:1.2rem 0; display:grid; gap:0.5rem;">
  <img
    src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1600&q=80"
    alt="Laptop with code editor in a dark workspace representing the engineering setup behind the blog"
    loading="lazy"
    decoding="async"
    referrerpolicy="no-referrer"
    style="width:100%; display:block; border-radius:12px; border:1px solid rgba(82,255,168,0.12);"
  />
  <figcaption style="color:var(--muted); font-size:0.78rem;">
    The blog is intentionally simple in UX, but the architecture is designed to scale cleanly as content grows.
  </figcaption>
</figure>

## Design goals

Before code structure, there were product constraints.

I wanted the blog to be:

- fast and static
- easy to write in
- SEO-friendly by default
- visually distinctive (terminal-style, but still readable)
- maintainable without a backend

That pushed me toward a static architecture with a strong shared layout and a content-first workflow.

<aside class="callout callout-note">
  <p class="callout-title">Architecture principle</p>
  <p>
    I optimize this blog for <strong>clarity over cleverness</strong>: simple routing, centralized metadata, and features
    that are derived from the content itself (TOC, related posts, RSS) instead of bolted on manually.
  </p>
</aside>

## High-level architecture

At a high level, the blog is a static Astro app with a clear separation between:

- **content** (Markdown posts)
- **rendering** (Astro pages/components/layouts)
- **metadata/SEO** (shared layout + JSON-LD + custom routes)
- **deployment** (GitHub Actions -> GitHub Pages)

```text
src/content/journal/*.md
        |
        v
Astro content collection (schema validation)
        |
        v
Page routes (/journal, /journal/[slug])
        |
        v
BaseLayout (meta tags, canonical, OG, CSP, global styles)
        |
        v
Static HTML in /dist
        |
        v
GitHub Pages deploy (GitHub Actions)
```

This structure keeps the system predictable. Content stays content, while layout/SEO logic stays centralized.

## Why Astro fits this project well

Astro is a good fit for this blog because the project is mostly content and UI, not interactive application state.

The main benefits for this use case are:

- **static output by default**
- **simple file-based routing**
- **content collections with schema validation**
- **clean component model for layout and page composition**

That means I can write posts in Markdown, keep type-safe metadata, and still build custom pages (RSS, sitemap, robots, 404) without introducing a backend.

## Content architecture: Markdown + schema validation

Posts live in:

```text
src/content/journal/
```

The collection schema in `src/content.config.ts` validates frontmatter fields like:

- `title`
- `excerpt`
- `date`
- `tags`
- `draft`
- `readingTime`
- optional `image`

This matters more than it seems.

Without schema validation, content errors become runtime surprises (missing titles, malformed dates, inconsistent metadata). With the schema, mistakes are caught during build.

### Practical effect

When I add a post, I get a consistent contract:

```md
---
title: "..."
excerpt: "..."
date: 2026-02-24
tags: ["..."]
readingTime: "8 min read"
image: "https://..."
draft: false
---
```

That contract now powers:

- archive cards
- article metadata
- OG image fallback behavior
- related post matching (via tags)

## Rendering architecture: shared layout first

The most important file in this project is the shared layout:

- `src/layouts/BaseLayout.astro`

This layout centralizes:

- canonical URLs
- meta description / robots
- Open Graph and Twitter cards
- JSON-LD injection
- CSP meta policy
- global visual system (colors, typography, panels, buttons, terminal styling)
- responsive behavior

That design choice reduces duplication across pages and keeps SEO behavior consistent.

```text
BaseLayout
 ├─ metadata (title, description, canonical, OG/Twitter)
 ├─ JSON-LD
 ├─ CSP + security-oriented defaults
 ├─ global styles (terminal visual language)
 ├─ header / nav / footer shell
 └─ <slot /> page content
```

In practice, this means every page can stay focused on content and page-specific logic, while layout concerns remain centralized.

## Page architecture

The site uses a small number of focused pages:

- `src/pages/index.astro` -> homepage / profile / sections
- `src/pages/journal/index.astro` -> notes archive
- `src/pages/journal/[slug].astro` -> post detail pages
- `src/pages/contact.astro`
- `src/pages/privacy.astro`
- `src/pages/terms.astro`
- `src/pages/404.astro`

For content pages, the two key routes are the journal archive and the journal post page.

### Archive page (`/journal/`)

The archive page:

- loads all published entries
- sorts them (via helper utilities)
- renders metadata pills (date, reading time, tags)
- now optionally renders featured thumbnails when `image` is present

This keeps the archive compact, but still visually richer when posts include cover images.

### Post page (`/journal/[slug]/`)

The post page is where most of the content UX logic lives.

It currently handles:

- article metadata + JSON-LD
- per-post OG image fallback strategy
- featured image rendering (optional)
- table of contents (generated from headings)
- related posts (tag-based matching)
- readable article layout + responsive styling

That page has evolved into a good example of a composable content view: Markdown stays simple, but the page wraps it with useful structure.

## Table of contents + related posts: content UX features

I recently added two features that improve long-form reading without making the design noisy:

### 1. Table of contents (TOC)

The TOC is generated from Astro-rendered Markdown headings (`h2`/`h3`), so it stays in sync automatically.

```text
Markdown post
   -> render(entry)
      -> headings[]
         -> TOC links
```

This is exactly the kind of feature I like architecturally: useful, low-maintenance, and derived from existing content structure.

### 2. Related posts

Related posts are computed using a simple tag-overlap score.

It is not “smart AI recommendations,” but it is:

- deterministic
- explainable
- cheap to compute
- good enough for a small blog

The logic is intentionally simple because simplicity is a feature in personal sites.

## SEO architecture: built into the page system

I wanted SEO to be a default behavior, not something I add later post-by-post.

So the blog includes:

- canonical URLs (from `Astro.site`)
- Open Graph + Twitter metadata
- JSON-LD for home, archive, and posts
- `sitemap.xml`
- `robots.txt`
- `rss.xml`
- custom `404` page

### Metadata flow

```text
Page / Post data
   -> BaseLayout props
      -> canonical URL
      -> OG/Twitter tags
      -> JSON-LD
      -> robots directives
```

This gives me a single place to improve metadata behavior later.

### OG image strategy

There are now two default OG images:

- `public/og-default.svg` -> generic site pages
- `public/og-article-default.svg` -> article pages

And posts can override both with a frontmatter `image`.

That gives a nice balance between:

- consistency (good defaults)
- flexibility (per-post image when needed)

## Security and practical hardening

Even for a personal blog, I wanted reasonable defaults.

The shared layout includes a CSP meta policy with a whitelist aligned to the current stack:

- self-hosted content
- Google Fonts
- Formspree (contact form)
- HTTPS images / data URLs

There is also a lightweight anti-framing script in the layout. It is not a substitute for proper headers at the host/CDN level, but it reflects the same principle: use sensible defaults, even on small projects.

## Build and deployment pipeline

Deployment is intentionally boring, which is a good thing.

The site builds on GitHub Actions and deploys to GitHub Pages.

```text
git push main
   -> GitHub Actions workflow
      -> npm ci
      -> npm run build
      -> upload dist artifact
      -> deploy to GitHub Pages
```

I also added a small `prebuild` cache cleanup step to remove `.astro` before builds. This works around an intermittent duplicate content ID warning I observed on my local Windows setup.

That is a good example of the kind of engineering tradeoff I prefer:

- not a perfect root-cause fix yet
- but a reliable, low-risk workaround that stabilizes the build process

## Why the architecture feels sustainable

What I like most about this setup is not any individual feature. It is the shape of the system.

The architecture scales in a way that fits a personal blog:

- adding a post is easy
- adding a page is straightforward
- improving metadata improves the whole site
- design updates happen mostly in one layout
- content enhancements (TOC, related posts, images) build on existing data

That is the kind of compounding I want in personal software: small improvements that make future work easier.

## If I evolve this architecture next

The next likely upgrades are:

- richer post images / captions conventions
- more internal linking between topic clusters
- optional search once the archive grows
- reusable article components for diagrams/callouts

But the core architecture will probably stay the same:

**static-first, content-first, shared layout, simple primitives, incremental improvements.**

## Final note

I wanted this blog to feel personal in the interface, but disciplined in the implementation.

That is why it looks like a terminal but is structured like a maintainable software project.

For me, that is the fun part of building it.
