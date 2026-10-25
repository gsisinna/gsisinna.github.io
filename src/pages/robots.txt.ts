import type { APIRoute } from "astro";

const SITE_URL = import.meta.env.SITE;

export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search-index.json",
    "",
    `Sitemap: ${new URL("/sitemap.xml", SITE_URL).toString()}`
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
