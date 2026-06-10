'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useAppStore, type Novel } from '@/store/app-store';
import { slugify } from '@/components/share-buttons';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Book,
  Star,
  X,
  ChevronRight,
} from 'lucide-react';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ne: 'नेपाली',
};

function RatingStars({ rating }: { rating: number }) {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star
          key={i}
          className="w-4 h-4 fill-amber-400/50 text-amber-400"
        />
      );
    } else {
      stars.push(
        <Star key={i} className="w-4 h-4 text-muted-foreground/30" />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function BookshelfNovelCard({
  novel,
  onRemove,
}: {
  novel: Novel;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative group">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ cursor: 'pointer' }}
      >
        <Link href={`/novel/${slugify(novel.title)}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
            <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center overflow-hidden">
              <Book className="w-12 h-12 text-amber-600/40 group-hover:scale-110 transition-transform" />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/80 dark:bg-black/50 backdrop-blur-sm"
                >
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
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {novel.description}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <RatingStars rating={novel.rating} />
              <span className="text-xs text-muted-foreground">
                {novel.chapters.length} chapter
                {novel.chapters.length !== 1 ? 's' : ''}
              </span>
            </CardFooter>
          </Card>
        </Link>
      </motion.div>

      {/* Remove button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 left-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(novel.id);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function BookshelfPage() {
  const { bookshelf, removeFromBookshelf } = useAppStore();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const res = await fetch('/api/novels?language=all&category=all');
        const data = await res.json();
        if (Array.isArray(data)) {
          setNovels(data);
        }
      } catch (err) {
        console.error('Failed to fetch novels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovels();
  }, []);

  const bookshelfNovels = useMemo(() => {
    return novels.filter((n) => bookshelf.includes(n.id));
  }, [novels, bookshelf]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold">My Bookshelf</h1>
            <span className="text-sm text-muted-foreground">
              {bookshelfNovels.length} novel{bookshelfNovels.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookshelfNovels.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Your bookshelf is empty. Browse novels to add some!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add novels to your bookshelf to keep track of your reading.
              </p>
              <Link href="/">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Book className="w-4 h-4 mr-2" />
                  Browse Novels
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookshelfNovels.map((novel) => (
                <BookshelfNovelCard
                  key={novel.id}
                  novel={novel}
                  onRemove={removeFromBookshelf}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}