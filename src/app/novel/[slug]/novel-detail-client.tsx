'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Star, Book, ChevronRight, ChevronLeft, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShareButtons, slugify } from '@/components/share-buttons';
import { Navbar } from '@/components/navbar';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import type { Novel } from '@/store/app-store';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ne: 'नेपाली',
};

// ─── Rating Stars ───────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400/50 text-amber-400" />);
    } else {
      stars.push(<Star key={i} className="w-4 h-4 text-muted-foreground/30" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

// ─── Similar Novel Card ─────────────────────────────────────────────────────
function SimilarNovelCard({ novel }: { novel: Novel }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link href={`/novel/${slugify(novel.title)}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col cursor-pointer">
          <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center overflow-hidden">
            <Book className="w-12 h-12 text-amber-600/40 group-hover:scale-110 transition-transform" />
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                {LANGUAGE_LABELS[novel.language] || novel.language}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="secondary"
                className={`text-xs backdrop-blur-sm ${
                  novel.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}
              >
                {novel.status === 'completed' ? 'Completed' : 'Ongoing'}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-4 pb-2">
            <h3 className="font-semibold text-base leading-tight group-hover:text-amber-600 transition-colors line-clamp-1">
              {novel.title}
            </h3>
            <p className="text-sm text-muted-foreground">{novel.author}</p>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{novel.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <RatingStars rating={novel.rating} />
            <span className="text-xs text-muted-foreground">
              {novel.chapters.length} chapter{novel.chapters.length !== 1 ? 's' : ''}
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

// ─── Novel Detail Client ────────────────────────────────────────────────────
export default function NovelDetailClient({ novel: initialNovel }: { novel: Novel }) {
  const router = useRouter();
  const { bookshelf, addToBookshelf, removeFromBookshelf, novels, setCurrentNovel, setView } = useAppStore();
  const [similarNovels, setSimilarNovels] = useState<Novel[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const isInShelf = bookshelf.includes(initialNovel.id);
  const slug = slugify(initialNovel.title);

  // Sync novel into Zustand store for SPA navigation
  useEffect(() => {
    setCurrentNovel(initialNovel);
  }, [initialNovel, setCurrentNovel]);

  // Fetch similar novels from API if store is empty
  useEffect(() => {
    const stored = novels;
    if (stored.length > 0) {
      const similar = stored
        .filter(
          (n) =>
            n.id !== initialNovel.id &&
            (n.language === initialNovel.language || n.category === initialNovel.category)
        )
        .slice(0, 3);
      setSimilarNovels(similar);
      setLoadingSimilar(false);
    } else {
      // Fetch from API
      const fetchSimilar = async () => {
        try {
          const res = await fetch('/api/novels');
          const data = await res.json();
          if (data && Array.isArray(data)) {
            const similar = data
              .filter(
                (n: Novel) =>
                  n.id !== initialNovel.id &&
                  (n.language === initialNovel.language || n.category === initialNovel.category)
              )
              .slice(0, 3);
            setSimilarNovels(similar);
          }
        } catch {
          // silent
        } finally {
          setLoadingSimilar(false);
        }
      };
      fetchSimilar();
    }
  }, [novels, initialNovel]);

  const handleToggleBookshelf = useCallback(() => {
    if (isInShelf) {
      removeFromBookshelf(initialNovel.id);
    } else {
      addToBookshelf(initialNovel.id);
    }
  }, [isInShelf, initialNovel.id, addToBookshelf, removeFromBookshelf]);

  const handleChapterClick = useCallback(
    (chapterId: string, chapterNumber: number) => {
      setView('reader');
      router.push(`/novel/${slug}/chapter/${chapterNumber}`);
    },
    [slug, setView, router]
  );

  const handleSimilarNovelClick = useCallback(
    (novel: Novel) => {
      setCurrentNovel(novel);
      setView('library');
      router.push(`/novel/${slugify(novel.title)}`);
    },
    [setCurrentNovel, setView, router]
  );

  const shareUrl = `/novel/${slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 pt-20 pb-20 md:pb-6">
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => { setView('home'); router.push('/'); }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Novel Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-48 h-64 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
              <Book className="w-16 h-16 text-amber-600/40" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{initialNovel.title}</h1>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {LANGUAGE_LABELS[initialNovel.language] || initialNovel.language}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    initialNovel.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }
                >
                  {initialNovel.status === 'completed' ? 'Completed' : 'Ongoing'}
                </Badge>
              </div>
              <p className="text-muted-foreground">by {initialNovel.author}</p>
              <div className="flex items-center gap-3">
                <RatingStars rating={initialNovel.rating} />
                <span className="text-sm text-muted-foreground">{initialNovel.rating.toFixed(1)}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">{initialNovel.description}</p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant={isInShelf ? 'secondary' : 'default'}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleToggleBookshelf}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${isInShelf ? 'fill-current' : ''}`} />
                  {isInShelf ? 'In Bookshelf' : 'Add to Bookshelf'}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />Share
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Share this novel</p>
                    <ShareButtons url={shareUrl} title={initialNovel.title} description={initialNovel.description} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Chapter List */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Chapters ({initialNovel.chapters.length})
            </h2>
            {initialNovel.chapters.length === 0 ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar rounded-lg border">
                {initialNovel.chapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-center gap-1">
                    <button
                      onClick={() => handleChapterClick(chapter.id, chapter.number)}
                      className="flex-1 flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-bold flex items-center justify-center">
                        {chapter.number}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate group-hover:text-amber-600 transition-colors">
                        {chapter.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-amber-600 transition-colors" />
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-auto">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Share chapter {chapter.number}</p>
                        <ShareButtons
                          url={`/novel/${slug}/chapter/${chapter.number}`}
                          title={`${initialNovel.title} — ${chapter.title}`}
                          description={`Read "${chapter.title}" from ${initialNovel.title} on Kathamrut`}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Similar Novels */}
          {!loadingSimilar && similarNovels.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-lg font-semibold mb-4">Similar Novels</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarNovels.map((n) => (
                    <SimilarNovelCard
                      key={n.id}
                      novel={n}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}