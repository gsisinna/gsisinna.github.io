import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE_URL = "https://gsisinna.github.io";
const FEED_URL = new URL("/rss.xml", SITE_URL).toString();

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
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const buildDate = sorted[0]?.data.date?.toUTCString() ?? new Date().toUTCString();

  const items = sorted
    .map((post) => {
      const postUrl = new URL(`/journal/${post.slug}/`, SITE_URL).toString();
      const excerpt = post.data.excerpt ?? "";
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>gsisinna notes</title>
    <link>${escapeXml(new URL("/", SITE_URL).toString())}</link>
    <description>Robotics software notes, project updates, experiments, and practical learnings.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
};
