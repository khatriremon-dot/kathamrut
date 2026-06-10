import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { generateNovelMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import NovelDetailClient from './novel-detail-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kathamrut.com';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const novels = await db.novel.findMany({
    include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
  });
  const novel = novels.find((n) => slugify(n.title) === slug);
  if (!novel) return { title: 'Novel Not Found' };
  return generateNovelMetadata(novel) as Metadata;
}

export default async function NovelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const novels = await db.novel.findMany({
    include: {
      chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } },
    },
  });
  const novel = novels.find((n) => slugify(n.title) === slug);

  if (!novel) notFound();

  const novelUrl = `${siteUrl}/novel/${slug}`;

  // Book structured data for Google rich results
  const bookLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: novel.title,
    author: { '@type': 'Person', name: novel.author },
    description: novel.description,
    inLanguage: novel.language === 'hi' ? 'hi' : novel.language === 'ne' ? 'ne' : 'en',
    url: novelUrl,
    image: novel.coverUrl || undefined,
    numberOfPages: novel.chapters.length,
    aggregateRating: novel.rating ? {
      '@type': 'AggregateRating',
      ratingValue: novel.rating,
      bestRating: 5,
      ratingCount: 1,
    } : undefined,
    hasPart: novel.chapters.map((ch) => ({
      '@type': 'Chapter',
      name: ch.title,
      position: ch.number,
      url: `${novelUrl}/chapter/${ch.number}`,
    })),
  };

  // Breadcrumb structured data
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Library', item: `${siteUrl}/library` },
      { '@type': 'ListItem', position: 3, name: novel.title, item: novelUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <NovelDetailClient novel={JSON.parse(JSON.stringify(novel))} />
    </>
  );
}