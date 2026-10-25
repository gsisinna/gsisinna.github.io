import type { APIRoute } from "astro";
import { escapeXml, getLastModified, getPublishedPosts, slugifyTag } from "../lib/content";

const SITE_URL = import.meta.env.SITE;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const latest = (items: typeof posts) =>
    items.length > 0 ? new Date(Math.max(...items.map((post) => getLastModified(post).getTime()))) : undefined;
  const siteLastMod = latest(posts);

  const tagPosts = new Map<string, typeof posts>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      if (slug) tagPosts.set(slug, [...(tagPosts.get(slug) ?? []), post]);
    }
  }

  const urls: Array<{ path: string; lastmod?: Date }> = [
    { path: "/", lastmod: siteLastMod },
    { path: "/journal/", lastmod: siteLastMod },
    ...posts.map((post) => ({ path: `/journal/${post.id}/`, lastmod: getLastModified(post) })),
    { path: "/tags/", lastmod: siteLastMod },
    ...[...tagPosts].map(([slug, items]) => ({ path: `/tags/${slug}/`, lastmod: latest(items) })),
    { path: "/projects/" },
    { path: "/contact/" },
    { path: "/privacy/" },
    { path: "/terms/" }
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(new URL(url.path, SITE_URL).toString())}</loc>${
      url.lastmod ? `\n    <lastmod>${url.lastmod.toISOString()}</lastmod>` : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
