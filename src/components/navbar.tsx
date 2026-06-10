'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  Library,
  Bookmark,
  Swords,
  Home as HomeIcon,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const activeTab = (() => {
    if (pathname === '/' || pathname === '') return 'home';
    if (pathname === '/library' || pathname.startsWith('/novel/')) return 'library';
    if (pathname === '/bookshelf') return 'bookshelf';
    if (pathname === '/roleplay' || pathname.startsWith('/roleplay/')) return 'roleplay';
    return 'home';
  })();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 flex items-center h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg mr-8 hover:text-amber-600 transition-colors"
          >
            <Book className="w-5 h-5 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Kathamrut
            </span>
          </Link>

          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/library"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Library className="w-4 h-4" />
            Library
          </Link>

          <Link
            href="/bookshelf"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bookshelf'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Bookshelf
          </Link>

          <Link
            href="/roleplay"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'roleplay'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Swords className="w-4 h-4" />
            Roleplay
          </Link>


        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'home'
                ? 'text-amber-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HomeIcon className={`w-5 h-5 ${activeTab === 'home' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            href="/library"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'library'
                ? 'text-amber-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Library className={`w-5 h-5 ${activeTab === 'library' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">Library</span>
          </Link>

          <Link
            href="/bookshelf"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'bookshelf'
                ? 'text-amber-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${activeTab === 'bookshelf' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">Bookshelf</span>
          </Link>

          <Link
            href="/roleplay"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'roleplay'
                ? 'text-amber-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Swords className={`w-5 h-5 ${activeTab === 'roleplay' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">Roleplay</span>
          </Link>


        </div>
      </nav>
    </>
  );
}