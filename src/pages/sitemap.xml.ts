import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE_URL = "https://gsisinna.github.io";

export const GET: APIRoute = async () => {
  const pages = ["/", "/journal/", "/contact/"];
  const posts = await getCollection("journal", ({ data }) => !data.draft);

  const urls = [
    ...pages.map((path) => ({
      loc: new URL(path, SITE_URL).toString(),
      lastmod: new Date().toISOString()
    })),
    ...posts.map((post) => ({
      loc: new URL(`/journal/${post.slug}/`, SITE_URL).toString(),
      lastmod: post.data.date.toISOString()
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
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

