import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  const items = posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((post) => ({
      id: post.id,
      title: post.data.title,
      excerpt: post.data.excerpt,
      tags: post.data.tags,
      date: post.data.date.toISOString(),
      readingTime: post.data.readingTime ?? "",
      image: post.data.image ?? null
    }));

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
};
