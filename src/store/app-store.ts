import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppView = 'home' | 'library' | 'reader' | 'roleplay' | 'roleplay-game' | 'bookshelf';
export type Language = 'en' | 'hi' | 'ne' | 'all';
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'green' | 'night';

export interface ReadingSettings {
  fontSize: number;
  theme: ThemeMode;
  lineHeight: number;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  language: string;
  category: string;
  rating: number;
  views: number;
  status: string;
  chapters: { id: string; number: number; title: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
}

export interface RoleplayStory {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  language: string;
  genre: string;
  scenes: RoleplayScene[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleplayScene {
  id: string;
  storyId: string;
  title: string;
  narrative: string;
  imageUrl: string;
  choices: string;
  isStart: boolean;
  createdAt: string;
}

export interface Choice {
  text: string;
  nextScene: number;
}

interface AppState {
  // Navigation
  currentView: AppView;
  previousView: AppView | null;
  setView: (view: AppView) => void;
  goBack: () => void;

  // Language filter
  languageFilter: Language;
  setLanguageFilter: (lang: Language) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Library
  bookshelf: string[];
  addToBookshelf: (novelId: string) => void;
  removeFromBookshelf: (novelId: string) => void;
  isInBookshelf: (novelId: string) => boolean;

  // Reader
  currentNovel: Novel | null;
  currentChapter: Chapter | null;
  readingProgress: Record<string, { chapterId: string; scrollPosition: number }>;
  setCurrentNovel: (novel: Novel) => void;
  setCurrentChapter: (chapter: Chapter) => void;
  saveProgress: (novelId: string, chapterId: string, scrollPosition: number) => void;
  getProgress: (novelId: string) => { chapterId: string; scrollPosition: number } | null;

  // Reading settings
  readingSettings: ReadingSettings;
  setReadingSettings: (settings: Partial<ReadingSettings>) => void;

  // Roleplay
  currentRoleplayStory: RoleplayStory | null;
  currentScene: RoleplayScene | null;
  roleplayHistory: string[];
  setCurrentRoleplayStory: (story: RoleplayStory) => void;
  setCurrentScene: (scene: RoleplayScene) => void;
  addToHistory: (sceneId: string) => void;

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Data
  novels: Novel[];
  roleplayStories: RoleplayStory[];
  setNovels: (novels: Novel[]) => void;
  setRoleplayStories: (stories: RoleplayStory[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      previousView: null,
      setView: (view) => set({ previousView: get().currentView, currentView: view }),
      goBack: () => {
        const prev = get().previousView;
        if (prev) set({ currentView: prev, previousView: null });
        else set({ currentView: 'home', previousView: null });
      },

      // Language filter
      languageFilter: 'all',
      setLanguageFilter: (lang) => set({ languageFilter: lang }),
      categoryFilter: 'all',
      setCategoryFilter: (cat) => set({ categoryFilter: cat }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Library
      bookshelf: [],
      addToBookshelf: (novelId) => set((state) => ({ bookshelf: [...new Set([...state.bookshelf, novelId])] })),
      removeFromBookshelf: (novelId) => set((state) => ({ bookshelf: state.bookshelf.filter((id) => id !== novelId) })),
      isInBookshelf: (novelId) => get().bookshelf.includes(novelId),

      // Reader
      currentNovel: null,
      currentChapter: null,
      readingProgress: {},
      setCurrentNovel: (novel) => set({ currentNovel: novel }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      saveProgress: (novelId, chapterId, scrollPosition) =>
        set((state) => ({
          readingProgress: { ...state.readingProgress, [novelId]: { chapterId, scrollPosition } },
        })),
      getProgress: (novelId) => get().readingProgress[novelId] || null,

      // Reading settings
      readingSettings: {
        fontSize: 18,
        theme: 'light',
        lineHeight: 1.8,
      },
      setReadingSettings: (settings) =>
        set((state) => ({ readingSettings: { ...state.readingSettings, ...settings } })),

      // Roleplay
      currentRoleplayStory: null,
      currentScene: null,
      roleplayHistory: [],
      setCurrentRoleplayStory: (story) => {
        const startScene = story.scenes.find((s) => s.isStart);
        set({
          currentRoleplayStory: story,
          currentScene: startScene || story.scenes[0] || null,
          roleplayHistory: startScene ? [startScene.id] : [],
        });
      },
      setCurrentScene: (scene) => set((state) => ({ currentScene: scene, roleplayHistory: [...state.roleplayHistory, scene.id] })),
      addToHistory: (sceneId) => set((state) => ({ roleplayHistory: [...state.roleplayHistory, sceneId] })),

      // Loading
      loading: true,
      setLoading: (loading) => set({ loading }),

      // Data
      novels: [],
      roleplayStories: [],
      setNovels: (novels) => set({ novels, loading: false }),
      setRoleplayStories: (stories) => set({ roleplayStories: stories }),
    }),
    {
      name: 'kathamrut-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        bookshelf: state.bookshelf,
        readingProgress: state.readingProgress,
        readingSettings: state.readingSettings,
        languageFilter: state.languageFilter,
        categoryFilter: state.categoryFilter,
      }),
    }
  )
);