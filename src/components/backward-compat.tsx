'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { slugify } from '@/components/share-buttons';

export function useBackwardCompat() {
  const router = useRouter();
  const pathname = usePathname();
  const { novels, setView, roleplayStories } = useAppStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const novelSlug = params.get('novel');
    const roleplaySlug = params.get('roleplay');

    if (novelSlug && novels.length > 0) {
      const novel = novels.find((n) => slugify(n.title) === decodeURIComponent(novelSlug));
      if (novel) {
        useAppStore.getState().setCurrentNovel(novel);
        setView('library');
        router.replace('/novel/' + novelSlug);
        return;
      }
    }

    if (roleplaySlug && roleplayStories.length > 0) {
      const story = roleplayStories.find((s) => slugify(s.title) === decodeURIComponent(roleplaySlug));
      if (story) {
        useAppStore.getState().setCurrentRoleplayStory(story);
        setView('roleplay');
        router.replace('/roleplay/' + roleplaySlug);
      }
    }
  }, [pathname, novels, roleplayStories, setView, router]);
}