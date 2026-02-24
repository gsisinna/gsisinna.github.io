import { getCollection } from "astro:content";

export async function getPublishedJournalEntries() {
  const entries = await getCollection("journal", ({ data }) => !data.draft);
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
  const tags = new Map<string, { name: string; slug: string; count: number }>();

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

      tags.set(slug, { name, slug, count: 1 });
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
