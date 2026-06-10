const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kathamrut.netlify.app";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ne: "Nepali",
};

export function generateNovelMetadata(novel: {
  title: string;
  author: string;
  description: string;
  language: string;
  category: string;
  rating: number;
  status: string;
  coverUrl: string;
}) {
  const slug = slugify(novel.title);
  const url = `${siteUrl}/novel/${slug}`;
  return {
    title: novel.title,
    description: novel.description.slice(0, 160),
    openGraph: {
      title: novel.title,
      description: novel.description.slice(0, 160),
      url,
      type: "book" as const,
      book: {
        author: novel.author,
        isbn: "",
        language: LANGUAGE_NAMES[novel.language] || novel.language,
      },
      images: novel.coverUrl ? [{ url: novel.coverUrl, width: 1200, height: 630, alt: novel.title }] : [],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: novel.title,
      description: novel.description.slice(0, 160),
    },
    alternates: { canonical: url },
  };
}

export function generateRoleplayMetadata(story: {
  title: string;
  description: string;
  language: string;
  genre: string;
  coverUrl: string;
}) {
  const slug = slugify(story.title);
  const url = `${siteUrl}/roleplay/${slug}`;
  return {
    title: story.title,
    description: story.description.slice(0, 160),
    openGraph: {
      title: `${story.title} — Interactive Adventure`,
      description: story.description.slice(0, 160),
      url,
      type: "article" as const,
      images: story.coverUrl ? [{ url: story.coverUrl, width: 1200, height: 630, alt: story.title }] : [],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${story.title} — Interactive Adventure`,
      description: story.description.slice(0, 160),
    },
    alternates: { canonical: url },
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export { slugify };