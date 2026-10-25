import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { formatDate, getReadingTime, isVisible } from "../../lib/content";
import { renderOgImage, type OgOptions } from "../../lib/og";

// One share image per post (/og/<slug>.png) plus a few section pages.
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("journal", isVisible);
  const postPaths = posts.map((post) => ({
    params: { slug: post.id },
    props: {
      section: "notes",
      title: post.data.title,
      tags: post.data.tags,
      meta: [formatDate(post.data.date), getReadingTime(post)]
    } satisfies OgOptions
  }));

  return [
    ...postPaths,
    {
      params: { slug: "projects" },
      props: {
        section: "projects",
        title: "Projects",
        subtitle: "Robotics control software, ROS architectures, and experiments in C++ and Python."
      } satisfies OgOptions
    },
    {
      params: { slug: "notes" },
      props: {
        section: "notes",
        title: "Notes",
        subtitle: "Writing about robotics software, architecture, and the projects behind them."
      } satisfies OgOptions
    }
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as OgOptions);
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" }
  });
};
