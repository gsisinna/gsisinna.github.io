import type { APIRoute } from "astro";

const SITE_URL = "https://gsisinna.github.io";

export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search-index.json",
    "",
    `Sitemap: ${new URL("/sitemap.xml", SITE_URL).toString()}`,
    `Host: ${new URL("/", SITE_URL).host}`
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
