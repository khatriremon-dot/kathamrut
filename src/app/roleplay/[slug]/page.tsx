import { db } from '@/lib/db';
import { generateRoleplayMetadata, slugify } from '@/lib/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { RoleplayDetailClient } from './roleplay-detail-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kathamrut.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stories = await db.roleplayStory.findMany({
    include: { scenes: true },
    orderBy: { createdAt: 'desc' },
  });

  const story = stories.find((s) => slugify(s.title) === slug);
  if (!story) {
    return { title: 'Story Not Found — Kathamrut' };
  }

  return generateRoleplayMetadata({
    title: story.title,
    description: story.description,
    language: story.language,
    genre: story.genre,
    coverUrl: story.coverUrl,
  });
}

export default async function RoleplayStoryPage({ params }: Props) {
  const { slug } = await params;
  const stories = await db.roleplayStory.findMany({
    include: { scenes: true },
    orderBy: { createdAt: 'desc' },
  });

  const story = stories.find((s) => slugify(s.title) === slug);
  if (!story) {
    notFound();
  }

  const serializedStory = {
    id: story.id,
    title: story.title,
    description: story.description,
    coverUrl: story.coverUrl,
    language: story.language,
    genre: story.genre,
    scenes: story.scenes.map((scene) => ({
      id: scene.id,
      storyId: scene.storyId,
      title: scene.title,
      narrative: scene.narrative,
      imageUrl: scene.imageUrl,
      choices: scene.choices,
      isStart: scene.isStart,
      createdAt: scene.createdAt.toISOString(),
    })),
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
  };

  // Interactive story structured data
  const storyLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: story.title,
    description: story.description,
    genre: story.genre,
    inLanguage: story.language === 'hi' ? 'hi' : story.language === 'ne' ? 'ne' : 'en',
    url: `${siteUrl}/roleplay/${slug}`,
    image: story.coverUrl || undefined,
    playMode: 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Breadcrumb structured data
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Roleplay', item: `${siteUrl}/roleplay` },
      { '@type': 'ListItem', position: 3, name: story.title, item: `${siteUrl}/roleplay/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storyLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <RoleplayDetailClient story={serializedStory} slug={slug} />
        </main>
      </div>
    </>
  );
}