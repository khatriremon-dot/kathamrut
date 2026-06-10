import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kathamrut.netlify.app";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [novels, roleplayStories] = await Promise.all([
    db.novel.findMany({ select: { title: true, updatedAt: true } }),
    db.roleplayStory.findMany({ select: { title: true, updatedAt: true } }),
  ]);

  const novelEntries: MetadataRoute.Sitemap = novels.map((novel) => ({
    url: `${siteUrl}/novel/${slugify(novel.title)}`,
    lastModified: novel.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const roleplayEntries: MetadataRoute.Sitemap = roleplayStories.map((story) => ({
    url: `${siteUrl}/roleplay/${slugify(story.title)}`,
    lastModified: story.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/admin`, lastModified: now, changeFrequency: "monthly", priority: 0.1 },
  ];

  return [...staticEntries, ...novelEntries, ...roleplayEntries];
}