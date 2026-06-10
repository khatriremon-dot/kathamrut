'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ShareButtons } from '@/components/share-buttons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import {
  Swords,
  ChevronLeft,
  RotateCcw,
  Star,
  Share2,
} from 'lucide-react';

interface Choice {
  text: string;
  nextScene: number;
}

interface RoleplaySceneData {
  id: string;
  storyId: string;
  title: string;
  narrative: string;
  imageUrl: string;
  choices: string;
  isStart: boolean;
  index: number;
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

export function RoleplayGameClient({
  story,
  slug,
}: {
  story: RoleplayStoryData;
  slug: string;
}) {
  const router = useRouter();

  // Derive the initial scene and history
  const initialScene = story.scenes.find((s) => s.isStart) || story.scenes[0] || null;
  const initialHistory = initialScene ? [initialScene.id] : [];

  const [ended, setEnded] = useState(false);
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [currentScene, setCurrentScene] = useState<RoleplaySceneData | null>(initialScene);

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
    (nextSceneIndex: number) => {
      const nextScene = story.scenes[nextSceneIndex];
      if (nextScene) {
        setCurrentScene(nextScene);
        setHistory((prev) => [...prev, nextScene.id]);
        setEnded(false);
      } else {
        setEnded(true);
      }
    },
    [story.scenes]
  );

  const handleRestart = useCallback(() => {
    const start = story.scenes.find((s) => s.isStart) || story.scenes[0] || null;
    setCurrentScene(start);
    setHistory(start ? [start.id] : []);
    setEnded(false);
  }, [story.scenes]);

  const handleHistoryClick = useCallback(
    (sceneId: string) => {
      const scene = story.scenes.find((s) => s.id === sceneId);
      if (scene) {
        setCurrentScene(scene);
        setEnded(false);
      }
    },
    [story.scenes]
  );

  if (!story || !currentScene) {
    return (
      <div className="text-center py-12">
        <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No adventure loaded.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/roleplay/${slug}`)}
        >
          Back to Story
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/roleplay/${slug}`)}
          className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {story.title}
        </button>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Share this adventure
              </p>
              <ShareButtons
                url={`/roleplay/${slug}`}
                title={story.title}
                description={story.description}
              />
            </PopoverContent>
          </Popover>
          <Badge className="bg-purple-500/50 text-purple-200 border-purple-400/30">
            {history.length} steps
          </Badge>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((history.length / story.scenes.length) * 100, 100)}%`,
          }}
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
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/10 blur-3xl rounded-full"
            style={{ animation: 'subtleGlow 4s ease-in-out infinite' }}
          />

          <CardHeader className="relative z-10 pt-6 pb-2 px-6">
            <h2 className="text-2xl font-bold text-purple-200">
              {currentScene.title}
            </h2>
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
          <h3 className="text-xl font-bold text-purple-200 mb-2">
            The adventure continues...
          </h3>
          <p className="text-white/60 mb-6">
            This path leads beyond the known story.
          </p>
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
          <p className="text-sm text-white/40 font-medium uppercase tracking-wider">
            What will you do?
          </p>
          {choices.map((choice, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChoice(choice.nextScene)}
              className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-400/40 transition-all text-white/90 group"
            >
              <span className="text-sm font-bold text-purple-300 mr-3">
                {String.fromCharCode(65 + idx)}
              </span>
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
      {history.length > 1 && (
        <>
          <Separator className="bg-white/10" />
          <section>
            <h3 className="text-sm text-white/40 font-medium uppercase tracking-wider mb-3">
              Your Journey
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {history.map((sceneId, idx) => {
                const scene = story.scenes.find((s) => s.id === sceneId);
                const isLast = idx === history.length - 1;
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

      {/* Bottom actions */}
      <div className="flex items-center justify-center gap-4 pt-4 pb-8">
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={handleRestart}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => router.push(`/roleplay/${slug}`)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Button>
      </div>
    </div>
  );
}