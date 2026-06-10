import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ChapterReaderClient from './chapter-reader-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kathamrut.com';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; number: string }> }): Promise<Metadata> {
  const { slug, number } = await params;
  const novels = await db.novel.findMany({
    include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
  });
  const novel = novels.find((n) => slugify(n.title) === slug);
  if (!novel) return { title: 'Not Found' };

  const chapter = novel.chapters.find((c) => c.number === parseInt(number));
  if (!chapter) return { title: 'Chapter Not Found' };

  const chapterUrl = `${siteUrl}/novel/${slug}/chapter/${number}`;

  return {
    title: `${chapter.title} — ${novel.title}`,
    description: `Read ${chapter.title} of ${novel.title} by ${novel.author} on Kathamrut. Chapter ${number} of ${novel.chapters.length}.`,
    openGraph: {
      title: `${chapter.title} — ${novel.title}`,
      description: `Read ${chapter.title} of ${novel.title} by ${novel.author} on Kathamrut.`,
      url: chapterUrl,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: [novel.author],
      tags: [novel.category, novel.language === 'hi' ? 'Hindi' : novel.language === 'ne' ? 'Nepali' : 'English'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chapter.title} — ${novel.title}`,
      description: `Read ${chapter.title} of ${novel.title} by ${novel.author} on Kathamrut.`,
    },
    alternates: { canonical: chapterUrl },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; number: string }> }) {
  const { slug, number } = await params;
  const novels = await db.novel.findMany({
    include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
  });
  const novel = novels.find((n) => slugify(n.title) === slug);
  if (!novel) notFound();

  const chapterNumber = parseInt(number);
  const chapter = await db.chapter.findFirst({
    where: { novelId: novel.id, number: chapterNumber },
  });
  if (!chapter) notFound();

  const chapterUrl = `${siteUrl}/novel/${slug}/chapter/${number}`;
  const novelUrl = `${siteUrl}/novel/${slug}`;

  // Article structured data
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    author: { '@type': 'Person', name: novel.author },
    description: `Chapter ${number} of ${novel.title}`,
    url: chapterUrl,
    isPartOf: {
      '@type': 'Book',
      name: novel.title,
      author: { '@type': 'Person', name: novel.author },
      url: novelUrl,
    },
    position: chapterNumber,
    wordCount: chapter.content.split(/\s+/).filter(Boolean).length,
  };

  // Breadcrumb structured data
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Library', item: `${siteUrl}/library` },
      { '@type': 'ListItem', position: 3, name: novel.title, item: novelUrl },
      { '@type': 'ListItem', position: 4, name: `Chapter ${number}: ${chapter.title}`, item: chapterUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ChapterReaderClient
        novel={JSON.parse(JSON.stringify(novel))}
        chapter={JSON.parse(JSON.stringify(chapter))}
      />
    </>
  );
}