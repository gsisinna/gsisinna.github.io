import { getCollection, type CollectionEntry } from "astro:content";

// Drafts are listed while running `npm run dev` so you can preview them, never in builds.
export function isVisible({ data }: { data: { draft: boolean } }) {
  return import.meta.env.DEV || !data.draft;
}

/** Published posts only (never drafts, even in dev). Use for feeds, sitemap, and search. */
export async function getPublishedPosts() {
  const entries = await getCollection("journal", ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Last meaningful change of a post: `updated` when set, otherwise the publish date. */
export function getLastModified(entry: CollectionEntry<"journal">) {
  return entry.data.updated ?? entry.data.date;
}

export function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export async function getPublishedJournalEntries() {
  const entries = await getCollection("journal", isVisible);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPublishedTagSummaries() {
  const entries = await getPublishedJournalEntries();
  const tags = new Map<
    string,
    { name: string; slug: string; count: number; latest: CollectionEntry<"journal"> }
  >();

  for (const entry of entries) {
    for (const rawTag of entry.data.tags) {
      const name = rawTag.trim();
      const slug = slugifyTag(name);
      if (!name || !slug) continue;

      const existing = tags.get(slug);
      if (existing) {
        existing.count += 1;
        continue;
      }

      // Entries are sorted newest first, so the first hit is the latest note.
      tags.set(slug, { name, slug, count: 1, latest: entry });
    }
  }

  return [...tags.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

const WORDS_PER_MINUTE = 220;

export function getReadingTime(entry: CollectionEntry<"journal">) {
  if (entry.data.readingTime) return entry.data.readingTime;
  const text = (entry.body ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

export function groupByYear(entries: CollectionEntry<"journal">[]) {
  const groups = new Map<number, CollectionEntry<"journal">[]>();
  for (const entry of entries) {
    const year = entry.data.date.getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

export async function getProjects() {
  const projects = await getCollection("projects", isVisible);
  return projects.sort((a, b) => a.data.order - b.data.order || b.data.year.localeCompare(a.data.year));
}
