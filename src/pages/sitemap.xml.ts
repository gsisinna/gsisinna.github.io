import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { getPublishedTagSummaries } from "../lib/content";

const SITE_URL = "https://gsisinna.github.io";
const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

export const GET: APIRoute = async () => {
  const pages = [
    { path: "/", source: join(process.cwd(), "src/pages/index.astro") },
    { path: "/journal/", source: join(process.cwd(), "src/pages/journal/index.astro") },
    { path: "/contact/", source: join(process.cwd(), "src/pages/contact.astro") },
    { path: "/privacy/", source: join(process.cwd(), "src/pages/privacy.astro") },
    { path: "/terms/", source: join(process.cwd(), "src/pages/terms.astro") }
  ];
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  const tags = await getPublishedTagSummaries();
  const staticPageEntries = await Promise.all(
    pages.map(async (page) => {
      const fileStats = await stat(page.source);
      return {
        loc: new URL(page.path, SITE_URL).toString(),
        lastmod: fileStats.mtime.toISOString()
      };
    })
  );

  const urls = [
    ...staticPageEntries,
    ...posts.map((post) => ({
      loc: new URL(`/journal/${post.id}/`, SITE_URL).toString(),
      lastmod: post.data.date.toISOString()
    })),
    {
      loc: new URL("/tags/", SITE_URL).toString(),
      lastmod: new Date().toISOString()
    },
    ...tags.map((tag) => ({
      loc: new URL(`/tags/${tag.slug}/`, SITE_URL).toString(),
      lastmod: new Date().toISOString()
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};
