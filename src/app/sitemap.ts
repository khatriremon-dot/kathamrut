import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { slugify } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kathamrut.com";

// Force dynamic rendering - sitemap needs live DB data
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  try {
    const [novels, roleplayStories] = await Promise.all([
      db.novel.findMany({
        include: { chapters: { select: { number: true }, orderBy: { number: "asc" } } },
      }),
      db.roleplayStory.findMany({
        include: { scenes: { select: { id: true } } },
      }),
    ]);

    // Novel entries
    const novelEntries: MetadataRoute.Sitemap = novels.map((novel) => ({
      url: `${siteUrl}/novel/${slugify(novel.title)}`,
      lastModified: novel.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Chapter entries — each chapter gets its own URL for SEO
    const chapterEntries: MetadataRoute.Sitemap = novels.flatMap((novel) =>
      novel.chapters.map((chapter) => ({
        url: `${siteUrl}/novel/${slugify(novel.title)}/chapter/${chapter.number}`,
        lastModified: novel.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );

    // Roleplay story entries
    const roleplayEntries: MetadataRoute.Sitemap = roleplayStories.map((story) => ({
      url: `${siteUrl}/roleplay/${slugify(story.title)}`,
      lastModified: story.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const staticEntries: MetadataRoute.Sitemap = [
      { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
      { url: `${siteUrl}/library`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/bookshelf`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ];

    return [...staticEntries, ...novelEntries, ...chapterEntries, ...roleplayEntries];
  } catch {
    // Fallback to static-only sitemap if DB is unavailable during build
    return [
      { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
      { url: `${siteUrl}/library`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/bookshelf`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ];
  }
}