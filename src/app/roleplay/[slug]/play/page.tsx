import { db } from '@/lib/db';
import { slugify } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { RoleplayGameClient } from './roleplay-game-client';

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

  const storyUrl = `${siteUrl}/roleplay/${slug}/play`;

  return {
    title: `Play: ${story.title}`,
    description: story.description
      ? `Play "${story.title}" — an interactive ${story.genre} adventure in ${story.language === 'hi' ? 'Hindi' : story.language === 'ne' ? 'Nepali' : 'English'}. Your choices shape the story.`
      : `Play "${story.title}" — an interactive adventure on Kathamrut.`,
    openGraph: {
      title: `Play: ${story.title}`,
      description: story.description || `Interactive ${story.genre} adventure`,
      url: storyUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Play: ${story.title}`,
      description: story.description || `Interactive ${story.genre} adventure`,
    },
    alternates: { canonical: storyUrl },
  };
}

export default async function RoleplayPlayPage({ params }: Props) {
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
    scenes: story.scenes.map((scene, index) => ({
      id: scene.id,
      storyId: scene.storyId,
      title: scene.title,
      narrative: scene.narrative,
      imageUrl: scene.imageUrl,
      choices: scene.choices,
      isStart: scene.isStart,
      index,
      createdAt: scene.createdAt.toISOString(),
    })),
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
  };

  // Breadcrumb structured data
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Roleplay', item: `${siteUrl}/roleplay` },
      { '@type': 'ListItem', position: 3, name: `Play: ${story.title}`, item: `${siteUrl}/roleplay/${slug}/play` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <RoleplayGameClient story={serializedStory} slug={slug} />
        </main>
      </div>
    </>
  );
}