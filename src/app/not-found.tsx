import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#d97706" />
            <text x="16" y="23" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="20" fill="white">K</text>
          </svg>
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground text-lg">This page seems to have wandered off, like a story without an ending.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
        >
          Return to Stories
        </Link>
      </div>
    </div>
  );
}