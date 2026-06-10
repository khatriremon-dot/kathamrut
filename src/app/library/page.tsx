'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { slugify } from '@/components/share-buttons';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useAppStore, type Novel } from '@/store/app-store';
import {
  Book,
  Star,
  Search,
  Globe,
  X,
  Library,
} from 'lucide-react';

const LANGUAGES = [
  { key: 'all', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'हिंदी' },
  { key: 'ne', label: 'नेपाली' },
] as const;

const CATEGORIES = [
  'all',
  'adventure',
  'mystery',
  'fantasy',
  'romance',
  'literary',
  'sci-fi',
  'horror',
  'action',
  'drama',
  'historical',
] as const;

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

function LibraryNovelCard({
  novel,
}: {
  novel: Novel;
}) {
  return (
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
  );
}

export default function LibraryPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredNovels = useMemo(() => {
    let result = novels;
    if (languageFilter !== 'all') {
      result = result.filter((n) => n.language === languageFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(
        (n) => n.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [novels, languageFilter, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold">Novel Library</h1>
          </div>

          {/* Filters */}
          <section className="space-y-4">
            {/* Language pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Globe className="w-4 h-4 text-muted-foreground mr-1" />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setLanguageFilter(lang.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    languageFilter === lang.key
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat === 'all'
                    ? 'All'
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search novels by title, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </section>

          {/* Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Novels</h2>
              <span className="text-sm text-muted-foreground">
                {filteredNovels.length} novels
              </span>
            </div>

            {loading && novels.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNovels.length === 0 ? (
              <div className="text-center py-12">
                <Book className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No novels found matching your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNovels.map((novel) => (
                  <LibraryNovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}