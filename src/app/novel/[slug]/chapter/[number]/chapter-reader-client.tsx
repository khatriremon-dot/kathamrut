'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Settings, Sun, Moon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import { Navbar } from '@/components/navbar';
import { useAppStore, type Novel, type Chapter } from '@/store/app-store';
import { ShareButtons, slugify } from '@/components/share-buttons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ─── Reading theme colors (same 5 as ReaderView in page.tsx) ─────────────────
const THEME_COLORS: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  light: { bg: '#ffffff', text: '#1a1a1a', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  dark: { bg: '#1a1a2e', text: '#e0e0e0', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  sepia: { bg: '#f4ecd8', text: '#5b4636', label: 'Sepia', icon: <Sun className="w-4 h-4" /> },
  green: { bg: '#e8f0e4', text: '#2d4a22', label: 'Green', icon: <Sun className="w-4 h-4" /> },
  night: { bg: '#0d1117', text: '#c9d1d9', label: 'Night', icon: <Moon className="w-4 h-4" /> },
};

// ─── Chapter Reader Client ───────────────────────────────────────────────────
export default function ChapterReaderClient({ novel: initialNovel, chapter: initialChapter }: { novel: Novel; chapter: Chapter }) {
  const router = useRouter();
  const { readingSettings, setReadingSettings, saveProgress, setCurrentChapter, setView, setCurrentNovel } = useAppStore();
  const [chapter, setChapter] = useState<Chapter>(initialChapter);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const novelSlug = slugify(initialNovel.title);
  const currentIdx = initialNovel.chapters.findIndex((c) => c.number === chapter.number);
  const prevChapter = currentIdx > 0 ? initialNovel.chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < initialNovel.chapters.length - 1 ? initialNovel.chapters[currentIdx + 1] : null;

  const themeColors = THEME_COLORS[readingSettings.theme] || THEME_COLORS.light;

  // Sync novel + chapter into Zustand store
  useEffect(() => {
    setCurrentNovel(initialNovel);
    setCurrentChapter(initialChapter);
  }, [initialNovel, initialChapter, setCurrentNovel, setCurrentChapter]);

  // Load a chapter by ID (for prev/next navigation via keyboard)
  const loadChapter = useCallback(
    async (ch: { id: string; number: number }) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chapters/${ch.id}`);
        const data = await res.json();
        if (data && !data.error) {
          setChapter(data);
          setCurrentChapter(data);
          contentRef.current?.scrollTo({ top: 0 });
          router.push(`/novel/${novelSlug}/chapter/${ch.number}`);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [novelSlug, setCurrentChapter, router]
  );

  const goToChapter = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && prevChapter) {
        loadChapter(prevChapter);
      } else if (direction === 'next' && nextChapter) {
        loadChapter(nextChapter);
      }
    },
    [prevChapter, nextChapter, loadChapter]
  );

  // Auto-scroll to saved position on mount / chapter change
  useEffect(() => {
    const progress = useAppStore.getState().getProgress(initialNovel.id);
    if (progress && contentRef.current) {
      // Only restore if we're on the same chapter
      if (progress.chapterId === initialChapter.id) {
        contentRef.current.scrollTop = progress.scrollPosition;
      }
    }
  }, [initialNovel.id, initialChapter.id]);

  // Keyboard navigation: ArrowLeft = prev, ArrowRight = next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToChapter('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToChapter('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToChapter]);

  // Auto-save scroll position (debounced)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (contentRef.current) {
        saveProgress(initialNovel.id, chapter.id, contentRef.current.scrollTop);
      }
    }, 300);
  }, [initialNovel.id, chapter.id, saveProgress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 pt-20 pb-20 md:pb-6">
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
          {/* Back button + title + settings */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setView('library'); router.push(`/novel/${novelSlug}`); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {initialNovel.title}
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Share this chapter</p>
                  <ShareButtons
                    url={`/novel/${novelSlug}/chapter/${chapter.number}`}
                    title={`${initialNovel.title} — ${chapter.title}`}
                    description={chapter.content?.substring(0, 200) || `Chapter ${chapter.number} of ${initialNovel.title}`}
                  />
                </PopoverContent>
              </Popover>
            </div>
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

                  {/* Theme Selector (same 5 themes as ReaderView) */}
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
            <h2 className="text-xl font-bold">{chapter.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Chapter {chapter.number} of {initialNovel.chapters.length}
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
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" style={{ backgroundColor: themeColors.text + '20' }} />
                  <Skeleton className="h-4 w-full" style={{ backgroundColor: themeColors.text + '20' }} />
                  <Skeleton className="h-4 w-full" style={{ backgroundColor: themeColors.text + '20' }} />
                  <Skeleton className="h-4 w-5/6" style={{ backgroundColor: themeColors.text + '20' }} />
                </div>
              ) : (
                chapter.content
              )}
            </div>
          </div>

          {/* Bottom Toolbar — Previous / Share / Next with real URLs */}
          <div className="flex-shrink-0 mt-4 flex items-center justify-between bg-muted/50 rounded-lg p-3">
            {prevChapter ? (
              <Link href={`/novel/${novelSlug}/chapter/${prevChapter.number}`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground font-medium">
              {currentIdx + 1} / {initialNovel.chapters.length}
            </span>
            {nextChapter ? (
              <Link href={`/novel/${novelSlug}/chapter/${nextChapter.number}`}>
                <Button variant="ghost" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}