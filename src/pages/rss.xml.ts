import type { APIRoute } from "astro";
import { escapeXml, getLastModified, getPublishedPosts } from "../lib/content";
import { profile } from "../data/profile";

const SITE_URL = import.meta.env.SITE;
const FEED_URL = new URL("/rss.xml", SITE_URL).toString();

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const lastBuild = posts.length > 0
    ? new Date(Math.max(...posts.map((post) => getLastModified(post).getTime())))
    : new Date();

  const items = posts
    .map((post) => {
      const postUrl = new URL(`/journal/${post.id}/`, SITE_URL).toString();
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.excerpt)}</description>
${post.data.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} · Notes`)}</title>
    <link>${escapeXml(new URL("/", SITE_URL).toString())}</link>
    <description>${escapeXml(profile.siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
};
