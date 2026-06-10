'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ShareButtons, slugify } from '@/components/share-buttons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Swords,
  Play,
  ChevronLeft,
  Clock,
  Globe,
  Share2,
} from 'lucide-react';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ne: 'नेपाली',
};

interface RoleplaySceneData {
  id: string;
  storyId: string;
  title: string;
  narrative: string;
  imageUrl: string;
  choices: string;
  isStart: boolean;
  createdAt: string;
}

interface RoleplayStoryData {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  language: string;
  genre: string;
  scenes: RoleplaySceneData[];
  createdAt: string;
  updatedAt: string;
}

export function RoleplayDetailClient({
  story,
  slug,
}: {
  story: RoleplayStoryData;
  slug: string;
}) {
  const router = useRouter();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/roleplay/${slug}`;

  const handleBegin = () => {
    router.push(`/roleplay/${slug}/play`);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Story Details */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-4 right-4 w-32 h-32 rounded-full bg-purple-500 blur-3xl"
            style={{ animation: 'subtleGlow 4s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-indigo-500 blur-3xl"
            style={{ animation: 'subtleGlow 4s ease-in-out infinite 2s' }}
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-purple-300" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Badge className="bg-purple-500/50 text-purple-200 border-purple-400/30 text-xs">
                {story.genre}
              </Badge>
              <Badge className="bg-white/10 text-white/80 border-white/10 text-xs">
                {LANGUAGE_LABELS[story.language] || story.language}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{story.title}</h1>
            <p className="text-white/70 mt-3 max-w-2xl leading-relaxed">
              {story.description}
            </p>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Story
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Share this adventure
            </p>
            <ShareButtons
              url={shareUrl}
              title={story.title}
              description={story.description}
            />
          </PopoverContent>
        </Popover>
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
              <p className="text-lg font-bold">{story.scenes.length}</p>
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
              <p className="text-lg font-bold">
                ~{Math.ceil(story.scenes.length / 3)} min
              </p>
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
              <p className="text-lg font-bold">
                {LANGUAGE_LABELS[story.language] || story.language}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Begin Button */}
      <div className="text-center pt-4">
        <Link href={`/roleplay/${slug}/play`}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25"
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Adventure
          </Button>
        </Link>
      </div>
    </div>
  );
}