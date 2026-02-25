---
title: "Improving the Performance of This Astro Site: What I Measured, What I Changed, and What Actually Helped"
excerpt: "A practical performance pass on this Astro blog: baseline measurements, HTML payload reductions, script delivery changes, font loading improvements, and a repeatable local perf report workflow."
date: 2026-02-25
tags: ["performance", "astro", "frontend", "web vitals", "meta"]
readingTime: "8 min read"
image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"
draft: false
---

I wanted to improve performance on this site without turning it into a different project.

That meant a short, disciplined pass:

- measure first
- change a few high-impact things
- measure again
- leave behind tooling so future changes are easier to evaluate

This post documents that pass.

## What I was optimizing for

The site was already static and reasonably fast, but there were still obvious opportunities:

- reduce HTML payload on key pages
- avoid shipping JS to pages that do not need it
- improve the render path for fonts and above-the-fold content
- make performance checks repeatable during normal development

I was not trying to "micro-optimize" everything. I focused on changes with a clear payoff and low maintenance cost.

## Baseline: what I checked first

I started with a local production build and looked at generated files in `dist/`.

Two quick checks were enough to get direction:

1. Which files were largest?
2. What was being inlined vs cached as shared assets?

The first build showed the homepage and search page HTML were heavier than they needed to be, and some page scripts were being embedded directly in HTML.

## What I changed

### 1. Added a local performance report command

I added a small script that scans `dist/` and reports:

- largest HTML files
- CSS assets
- JS assets
- raw size and gzip size

Commands:

```bash
npm run perf
# or
npm run perf:report
```

This is not a replacement for Lighthouse, but it is fast and useful for spotting regressions before deploy.

## 2. Improved font loading (less render-blocking)

The site uses Google Fonts. The original setup used a standard stylesheet link, which can block rendering.

I changed it to:

- `dns-prefetch`
- `preconnect`
- stylesheet `preload` with `onload` swap
- `noscript` fallback

This keeps the same visual design while improving the critical rendering path.

## 3. Stopped shipping the typing-effect script to every page

The terminal typing animation is a nice detail, but only a few pages use it (`home`, `contact`, `journal index`).

I introduced an `enableCommandTyping` prop in the base layout so the script is only included where it is needed.

That is a small change in code, but it matters because shared layout scripts are easy to accidentally over-deliver.

## 4. Moved homepage interaction JS to a deferred static script

The homepage has some small interactions:

- reading progress bar
- active section highlighting
- pointer glow on cards

I moved that code into a deferred static file (`/scripts/home-page.js`) instead of keeping it inline in the page HTML.

Benefits:

- smaller `index.html`
- less HTML parsing work up front
- browser can cache the script separately

## 5. Prioritized the hero image for LCP

The avatar image in the homepage hero is above the fold, so I marked it with:

```html
fetchpriority="high"
```

This is a small but sensible signal for browsers when the image is part of the initial view.

## Results (local build)

After the optimization pass:

- `dist/index.html`: `42,634 B` -> `37,856 B` (about **-11%**)
- `dist/search/index.html`: `17,601 B` -> `7,777 B` (about **-56%**)

From the new `npm run perf` report (current local build):

- total `dist/`: about `256.3 KB`
- homepage HTML gzip: about `7.0 KB`
- search page JS bundle gzip: about `1.7 KB`
- deferred homepage script gzip: about `998 B`
- deferred typing script gzip: about `779 B`

These are not benchmark trophies, but they are meaningful improvements with minimal complexity.

## What did not change (on purpose)

I did not do a large visual refactor or remove the design details that give the site its character.

I also did not aggressively rewrite all inline styles in page templates. That can help in some cases, but it quickly becomes a maintainability project of its own.

The goal here was better performance without making the codebase worse to work in.

## Next performance work I would do

The next high-impact item is image strategy on the journal listing page.

That page currently uses remote Unsplash thumbnails. They look good, but they are outside my asset pipeline and can hurt page performance, especially on slower connections.

The better long-term path is:

- use local images where possible
- generate optimized sizes/formats
- serve responsive images

After that, I would add Lighthouse CI with simple budgets for:

- homepage
- search page
- journal index

That keeps performance work from becoming a one-time cleanup.

## A simple workflow that works

This is the workflow I want to keep using:

1. Run `npm run perf`
2. Build a hypothesis ("this script/font/image delivery is expensive")
3. Make one focused change
4. Rebuild and compare
5. Validate with Lighthouse/Web Vitals

It is not glamorous, but it works.

Performance improvements usually come from a handful of clear decisions repeated consistently, not from one clever trick.
