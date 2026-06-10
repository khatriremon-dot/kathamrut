'use client';

import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Novel, type Chapter, type RoleplayStory, type Choice } from '@/store/app-store';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Book,
  Library,
  Bookmark,
  Swords,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  Settings,
  Sun,
  Moon,
  X,
  Play,
  RotateCcw,
  Clock,
  Globe,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  { key: 'all', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'हिंदी' },
  { key: 'ne', label: 'नेपाली' },
] as const;

const CATEGORIES = [
  'All',
  'Adventure',
  'Mystery',
  'Fantasy',
  'Romance',
  'Literary',
  'Sci-Fi',
  'Horror',
  'Action',
  'Drama',
  'Historical',
] as const;

const THEME_COLORS: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  light: { bg: '#ffffff', text: '#1a1a1a', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  dark: { bg: '#1a1a2e', text: '#e0e0e0', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  sepia: { bg: '#f4ecd8', text: '#5b4636', label: 'Sepia', icon: <Sun className="w-4 h-4" /> },
  green: { bg: '#e8f0e4', text: '#2d4a22', label: 'Green', icon: <Sun className="w-4 h-4" /> },
  night: { bg: '#0d1117', text: '#c9d1d9', label: 'Night', icon: <Moon className="w-4 h-4" /> },
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ne: 'नेपाली',
};

// ─── Page Transitions ────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ─── Rating Stars ───────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  const stars = [];
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

// ─── Navigation Bar ───────────────────────────────────────────────────────
function NavBar() {
  const { currentView, setView } = useAppStore();

  const tabs = [
    { view: 'home' as const, label: 'Home', icon: HomeIcon },
    { view: 'library' as const, label: 'Library', icon: Library },
    { view: 'bookshelf' as const, label: 'Bookshelf', icon: Bookmark },
    { view: 'roleplay' as const, label: 'Roleplay', icon: Swords },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 flex items-center h-14">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 font-bold text-lg mr-8 hover:text-amber-600 transition-colors"
          >
            <Book className="w-5 h-5 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Kathamrut
            </span>
          </button>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.view === 'bookshelf'
                ? currentView === 'bookshelf'
                : currentView === tab.view || (tab.view === 'library' && currentView === 'reader');
            return (
              <button
                key={tab.view}
                onClick={() => setView(tab.view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.view === 'bookshelf'
                ? currentView === 'bookshelf'
                : currentView === tab.view || (tab.view === 'library' && currentView === 'reader');
            return (
              <button
                key={tab.view}
                onClick={() => setView(tab.view)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-amber-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// ─── Home View ──────────────────────────────────────────────────────────────
function HomeView() {
  const {
    novels,
    roleplayStories,
    languageFilter,
    setLanguageFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    setCurrentNovel,
    setView,
    loading,
  } = useAppStore();

  const filteredNovels = useMemo(() => {
    let result = novels;
    if (languageFilter !== 'all') {
      result = result.filter((n) => n.language === languageFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((n) => n.category === categoryFilter);
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

  const handleNovelClick = useCallback(
    (novel: Novel) => {
      setCurrentNovel(novel);
      setView('library');
    },
    [setCurrentNovel, setView]
  );

  const handleRoleplayClick = useCallback(
    (story: RoleplayStory) => {
      useAppStore.getState().setCurrentRoleplayStory(story);
      setView('roleplay');
    },
    [setView]
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0xMHY2aC02VjI0aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Book className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Kathamrut</h1>
            <p className="text-lg md:text-xl text-white/90 mt-1">Stories Across Languages</p>
            <p className="text-sm text-white/70 mt-2 max-w-md">
              Discover captivating novels in English, Hindi, and Nepali. Immerse yourself in interactive roleplaying adventures.
            </p>
          </div>
        </div>
      </section>

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
              {cat}
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

      {/* Novels Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Novels</h2>
          <span className="text-sm text-muted-foreground">{filteredNovels.length} novels</span>
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
            <p className="text-muted-foreground">No novels found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} onClick={() => handleNovelClick(novel)} />
            ))}
          </div>
        )}
      </section>

      <Separator className="my-8" />

      {/* Roleplay Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Swords className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-bold">Interactive Roleplaying</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Choose your path in immersive interactive stories. Your decisions shape the adventure.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleplayStories.map((story) => (
            <Card
              key={story.id}
              className="cursor-pointer overflow-hidden border-amber-200/50 hover:border-amber-400 dark:border-amber-900/50 dark:hover:border-amber-600 transition-all group"
              onClick={() => handleRoleplayClick(story)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-amber-600 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {LANGUAGE_LABELS[story.language] || story.language}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                    {story.genre}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Play className="w-3 h-3" />
                  <span>{story.scenes.length} scenes</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Novel Card ─────────────────────────────────────────────────────────────
function NovelCard({ novel, onClick }: { novel: Novel; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} onClick={onClick} style={{ cursor: 'pointer' }}>
      <Card
        className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col"
      >
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
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {novel.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <RatingStars rating={novel.rating} />
          <span className="text-xs text-muted-foreground">
            {novel.chapters.length} chapter{novel.chapters.length !== 1 ? 's' : ''}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ─── Library View ──────────────────────────────────────────────────────────
function LibraryView() {
  const {
    currentNovel,
    setCurrentNovel,
    setCurrentChapter,
    setView,
    bookshelf,
    addToBookshelf,
    removeFromBookshelf,
    novels,
    loading,
  } = useAppStore();
  const isInShelf = currentNovel ? bookshelf.includes(currentNovel.id) : false;

  // Fetch fresh novel data with all chapters on mount
  useEffect(() => {
    if (!currentNovel) return;
    let cancelled = false;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/novels/${currentNovel.id}`, { signal: controller.signal });
        const data = await res.json();
        if (!cancelled && data && !data.error) {
          setCurrentNovel(data);
        }
      } catch (err) {
        if ((err as DOMException)?.name !== 'AbortError') {
          // handle error silently
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentNovel?.id, setCurrentNovel]);

  const handleChapterClick = useCallback(
    async (novelId: string, chapterId: string) => {
      setView('reader');
      try {
        const res = await fetch(`/api/chapters/${chapterId}`);
        const chapter = await res.json();
        if (chapter && !chapter.error) {
          setCurrentChapter(chapter);
        }
      } catch {
        // handle error
      }
    },
    [setView, setCurrentChapter]
  );

  const handleToggleBookshelf = useCallback(() => {
    if (!currentNovel) return;
    if (isInShelf) {
      removeFromBookshelf(currentNovel.id);
    } else {
      addToBookshelf(currentNovel.id);
    }
  }, [currentNovel, isInShelf, addToBookshelf, removeFromBookshelf]);

  const similarNovels = useMemo(() => {
    if (!currentNovel) return [];
    return novels
      .filter(
        (n) =>
          n.id !== currentNovel.id &&
          (n.language === currentNovel.language || n.category === currentNovel.category)
      )
      .slice(0, 3);
  }, [novels, currentNovel]);

  if (!currentNovel) {
    return (
      <div className="text-center py-12">
        <Book className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No novel selected.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView('home')}>
          Browse Novels
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Library
      </button>

      {/* Novel Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 w-full md:w-48 h-64 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
          <Book className="w-16 h-16 text-amber-600/40" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{currentNovel.title}</h1>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {LANGUAGE_LABELS[currentNovel.language] || currentNovel.language}
            </Badge>
            <Badge
              variant="secondary"
              className={
                currentNovel.status === 'completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }
            >
              {currentNovel.status === 'completed' ? 'Completed' : 'Ongoing'}
            </Badge>
          </div>
          <p className="text-muted-foreground">by {currentNovel.author}</p>
          <div className="flex items-center gap-3">
            <RatingStars rating={currentNovel.rating} />
            <span className="text-sm text-muted-foreground">{currentNovel.rating.toFixed(1)}</span>
          </div>
          <p className="text-foreground/80 leading-relaxed">{currentNovel.description}</p>
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant={isInShelf ? 'secondary' : 'default'}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleToggleBookshelf}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isInShelf ? 'fill-current' : ''}`} />
              {isInShelf ? 'In Bookshelf' : 'Add to Bookshelf'}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Chapter List */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Chapters ({currentNovel.chapters.length})
        </h2>
        {currentNovel.chapters.length === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar rounded-lg border">
            {currentNovel.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(currentNovel.id, chapter.id)}
                className="w-full flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors text-left group"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-bold flex items-center justify-center">
                  {chapter.number}
                </span>
                <span className="flex-1 text-sm font-medium truncate group-hover:text-amber-600 transition-colors">
                  {chapter.title}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Similar Novels */}
      {similarNovels.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-4">Similar Novels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarNovels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  onClick={() => {
                    setCurrentNovel(novel);
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ─── Reader View ────────────────────────────────────────────────────────────
function ReaderView() {
  const {
    currentNovel,
    currentChapter,
    readingSettings,
    setReadingSettings,
    saveProgress,
    setCurrentChapter,
    setView,
  } = useAppStore();

  const contentRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Auto-scroll to saved position
  useEffect(() => {
    if (currentNovel && currentChapter) {
      const progress = useAppStore.getState().getProgress(currentNovel.id);
      if (progress && contentRef.current) {
        contentRef.current.scrollTop = progress.scrollPosition;
      }
    }
  }, [currentChapter?.id, currentNovel?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToChapter('prev');
      } else if (e.key === 'ArrowRight') {
        goToChapter('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter?.id, currentNovel]);

  // Auto-save scroll position
  const handleScroll = useCallback(() => {
    if (contentRef.current && currentNovel && currentChapter) {
      saveProgress(currentNovel.id, currentChapter.id, contentRef.current.scrollTop);
    }
  }, [currentNovel, currentChapter, saveProgress]);

  const goToChapter = useCallback(
    async (direction: 'prev' | 'next') => {
      if (!currentNovel || !currentChapter) return;
      const currentIdx = currentNovel.chapters.findIndex((c) => c.id === currentChapter.id);
      if (direction === 'prev' && currentIdx > 0) {
        const prev = currentNovel.chapters[currentIdx - 1];
        setLoadingChapter(true);
        try {
          const res = await fetch(`/api/chapters/${prev.id}`);
          const ch = await res.json();
          if (ch && !ch.error) {
            setCurrentChapter(ch);
            contentRef.current?.scrollTo({ top: 0 });
          }
        } catch {
          // handle error
        } finally {
          setLoadingChapter(false);
        }
      } else if (direction === 'next' && currentIdx < currentNovel.chapters.length - 1) {
        const next = currentNovel.chapters[currentIdx + 1];
        setLoadingChapter(true);
        try {
          const res = await fetch(`/api/chapters/${next.id}`);
          const ch = await res.json();
          if (ch && !ch.error) {
            setCurrentChapter(ch);
            contentRef.current?.scrollTo({ top: 0 });
          }
        } catch {
          // handle error
        } finally {
          setLoadingChapter(false);
        }
      }
    },
    [currentNovel, currentChapter, setCurrentChapter]
  );

  const currentChapterIdx = currentNovel
    ? currentNovel.chapters.findIndex((c) => c.id === currentChapter?.id)
    : -1;

  const themeColors = THEME_COLORS[readingSettings.theme] || THEME_COLORS.light;

  if (!currentNovel || !currentChapter) {
    return (
      <div className="text-center py-12">
        <Book className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Select a chapter to start reading.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView('library')}>
          Back to Novel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Back button + title */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          onClick={() => setView('library')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentNovel.title}
        </button>
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Settings className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[60vh]">
            <SheetHeader>
              <SheetTitle>Reading Settings</SheetTitle>
              <SheetDescription>Customize your reading experience</SheetDescription>
            </SheetHeader>
            <div className="p-4 space-y-6 overflow-y-auto">
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Font Size</label>
                  <span className="text-sm text-muted-foreground">{readingSettings.fontSize}px</span>
                </div>
                <Slider
                  value={[readingSettings.fontSize]}
                  onValueChange={([val]) => setReadingSettings({ fontSize: val })}
                  min={12}
                  max={28}
                  step={1}
                />
              </div>

              {/* Line Height */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Line Height</label>
                  <span className="text-sm text-muted-foreground">{readingSettings.lineHeight.toFixed(1)}</span>
                </div>
                <Slider
                  value={[readingSettings.lineHeight * 10]}
                  onValueChange={([val]) => setReadingSettings({ lineHeight: val / 10 })}
                  min={12}
                  max={30}
                  step={1}
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(THEME_COLORS).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setReadingSettings({ theme: key as typeof readingSettings.theme })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                        readingSettings.theme === key
                          ? 'border-amber-500 shadow-md'
                          : 'border-transparent hover:border-muted'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-md border"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.text,
                        }}
                      />
                      <span className="text-xs font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chapter Title */}
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold">{currentChapter.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Chapter {currentChapter.number} of {currentNovel.chapters.length}
        </p>
      </div>

      {/* Reader Content */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        data-reader-theme={readingSettings.theme}
        className="flex-1 overflow-y-auto custom-scrollbar rounded-lg"
        style={{
          backgroundColor: themeColors.bg,
          color: themeColors.text,
          padding: '1.5rem',
        }}
      >
        <div
          className="max-w-2xl mx-auto reader-content"
          style={{
            fontSize: `${readingSettings.fontSize}px`,
            lineHeight: `${readingSettings.lineHeight}`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {loadingChapter ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" style={{ backgroundColor: themeColors.text + '20' }} />
              <Skeleton className="h-4 w-full" style={{ backgroundColor: themeColors.text + '20' }} />
              <Skeleton className="h-4 w-full" style={{ backgroundColor: themeColors.text + '20' }} />
              <Skeleton className="h-4 w-5/6" style={{ backgroundColor: themeColors.text + '20' }} />
            </div>
          ) : (
            currentChapter.content
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex-shrink-0 mt-4 flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToChapter('prev')}
          disabled={currentChapterIdx <= 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentChapterIdx + 1} / {currentNovel.chapters.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToChapter('next')}
          disabled={currentChapterIdx >= currentNovel.chapters.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Roleplay View ──────────────────────────────────────────────────────────
function RoleplayView() {
  const { currentRoleplayStory, setView, setCurrentRoleplayStory } = useAppStore();

  if (!currentRoleplayStory) {
    return (
      <div className="text-center py-12">
        <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No story selected.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView('home')}>
          Browse Stories
        </Button>
      </div>
    );
  }

  const handleBegin = () => {
    setCurrentRoleplayStory(currentRoleplayStory);
    setView('roleplay-game');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Stories
      </button>

      {/* Story Details */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-purple-500 blur-3xl" style={{ animation: 'subtleGlow 4s ease-in-out infinite' }} />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-indigo-500 blur-3xl" style={{ animation: 'subtleGlow 4s ease-in-out infinite 2s' }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-purple-300" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Badge className="bg-purple-500/50 text-purple-200 border-purple-400/30 text-xs">
                {currentRoleplayStory.genre}
              </Badge>
              <Badge className="bg-white/10 text-white/80 border-white/10 text-xs">
                {LANGUAGE_LABELS[currentRoleplayStory.language] || currentRoleplayStory.language}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{currentRoleplayStory.title}</h1>
            <p className="text-white/70 mt-3 max-w-2xl leading-relaxed">{currentRoleplayStory.description}</p>
          </div>
        </div>
      </div>

      {/* Story Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Scenes</p>
              <p className="text-lg font-bold">{currentRoleplayStory.scenes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Time</p>
              <p className="text-lg font-bold">~{Math.ceil(currentRoleplayStory.scenes.length / 3)} min</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 col-span-2 md:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="text-lg font-bold">{LANGUAGE_LABELS[currentRoleplayStory.language] || currentRoleplayStory.language}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Begin Button */}
      <div className="text-center pt-4">
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25"
          onClick={handleBegin}
        >
          <Play className="w-5 h-5 mr-2" />
          Begin Adventure
        </Button>
      </div>
    </div>
  );
}

// ─── Roleplay Game View ─────────────────────────────────────────────────────
function RoleplayGameView() {
  const {
    currentRoleplayStory,
    currentScene,
    roleplayHistory,
    setCurrentScene,
    addToHistory,
    setCurrentRoleplayStory,
    setView,
  } = useAppStore();

  const [ended, setEnded] = useState(false);

  const choices: Choice[] = useMemo(() => {
    if (!currentScene) return [];
    try {
      const parsed = JSON.parse(currentScene.choices);
      return parsed;
    } catch {
      return [];
    }
  }, [currentScene]);

  const handleChoice = useCallback(
    (nextSceneNumber: number) => {
      if (!currentRoleplayStory) return;
      const nextScene = currentRoleplayStory.scenes.find((s) => {
        // Match by position index (1-based) in the scenes array
        const idx = currentRoleplayStory.scenes.indexOf(s) + 1;
        return idx === nextSceneNumber;
      });
      if (nextScene) {
        setCurrentScene(nextScene);
        setEnded(false);
      } else {
        setEnded(true);
      }
    },
    [currentRoleplayStory, setCurrentScene]
  );

  const handleRestart = useCallback(() => {
    if (!currentRoleplayStory) return;
    setCurrentRoleplayStory(currentRoleplayStory);
    setEnded(false);
  }, [currentRoleplayStory, setCurrentRoleplayStory]);

  const handleHistoryClick = useCallback(
    (sceneId: string) => {
      if (!currentRoleplayStory) return;
      const scene = currentRoleplayStory.scenes.find((s) => s.id === sceneId);
      if (scene) {
        setCurrentScene(scene);
        setEnded(false);
      }
    },
    [currentRoleplayStory, setCurrentScene]
  );

  if (!currentRoleplayStory || !currentScene) {
    return (
      <div className="text-center py-12">
        <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No adventure loaded.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView('roleplay')}>
          Back to Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('roleplay')}
          className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentRoleplayStory.title}
        </button>
        <Badge className="bg-purple-500/50 text-purple-200 border-purple-400/30">
          {roleplayHistory.length} steps
        </Badge>
      </div>

      {/* Progress indicator */}
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((roleplayHistory.length / currentRoleplayStory.scenes.length) * 100, 100)}%` }}
        />
      </div>

      {/* Scene Card */}
      <motion.div
        key={currentScene.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/20 text-white">
          {/* Atmospheric glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/10 blur-3xl rounded-full" style={{ animation: 'subtleGlow 4s ease-in-out infinite' }} />

          <CardHeader className="relative z-10 pt-6 pb-2 px-6">
            <h2 className="text-2xl font-bold text-purple-200">{currentScene.title}</h2>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/90 leading-relaxed text-base whitespace-pre-wrap">
                {currentScene.narrative}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Choices or Ending */}
      {ended ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-purple-300 fill-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-purple-200 mb-2">The adventure continues...</h3>
          <p className="text-white/60 mb-6">This path leads beyond the known story.</p>
          <Button
            onClick={handleRestart}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </motion.div>
      ) : choices.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-sm text-white/40 font-medium uppercase tracking-wider">What will you do?</p>
          {choices.map((choice, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChoice(choice.nextScene)}
              className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-400/40 transition-all text-white/90 group"
            >
              <span className="text-sm font-bold text-purple-300 mr-3">{String.fromCharCode(65 + idx)}</span>
              {choice.text}
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-white/60">No further choices available.</p>
          <Button
            onClick={handleRestart}
            variant="outline"
            className="mt-4 border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </motion.div>
      )}

      {/* History Trail */}
      {roleplayHistory.length > 1 && (
        <>
          <Separator className="bg-white/10" />
          <section>
            <h3 className="text-sm text-white/40 font-medium uppercase tracking-wider mb-3">Your Journey</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {roleplayHistory.map((sceneId, idx) => {
                const scene = currentRoleplayStory.scenes.find((s) => s.id === sceneId);
                const isLast = idx === roleplayHistory.length - 1;
                return (
                  <button
                    key={sceneId}
                    onClick={() => handleHistoryClick(sceneId)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isLast
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {scene?.title || `Scene ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ─── Bookshelf View ─────────────────────────────────────────────────────────
function BookshelfView() {
  const { bookshelf, novels, setCurrentNovel, setView, removeFromBookshelf } = useAppStore();

  const bookshelfNovels = useMemo(() => {
    return novels.filter((n) => bookshelf.includes(n.id));
  }, [novels, bookshelf]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="w-6 h-6 text-amber-600" />
        <h1 className="text-2xl font-bold">My Bookshelf</h1>
      </div>

      {bookshelfNovels.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your bookshelf is empty</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add novels to your bookshelf to keep track of your reading.
          </p>
          <Button
            onClick={() => setView('home')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Browse Novels
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookshelfNovels.map((novel) => (
            <div key={novel.id} className="relative group">
              <NovelCard
                novel={novel}
                onClick={() => {
                  setCurrentNovel(novel);
                  setView('library');
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromBookshelf(novel.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────
export default function KathamrutApp() {
  const { currentView, setNovels, setRoleplayStories, loading } = useAppStore();
  const isDarkRoleplayView = currentView === 'roleplay-game' || currentView === 'roleplay';

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [novelsRes, roleplayRes] = await Promise.all([
          fetch('/api/novels?language=all&category=all'),
          fetch('/api/roleplay?language=all'),
        ]);
        const novelsData = await novelsRes.json();
        const roleplayData = await roleplayRes.json();
        if (Array.isArray(novelsData)) setNovels(novelsData);
        if (Array.isArray(roleplayData)) setRoleplayStories(roleplayData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [setNovels, setRoleplayStories]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />

      {/* Main content - with padding for nav */}
      <main
        className={`flex-1 container mx-auto px-4 py-6 ${
          isDarkRoleplayView ? 'bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {currentView === 'home' && <HomeView />}
            {currentView === 'library' && <LibraryView />}
            {currentView === 'reader' && <ReaderView />}
            {currentView === 'roleplay' && <RoleplayView />}
            {currentView === 'roleplay-game' && <RoleplayGameView />}
            {currentView === 'bookshelf' && <BookshelfView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
