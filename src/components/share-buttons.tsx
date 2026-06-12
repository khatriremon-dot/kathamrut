"use client";

import { Twitter, Facebook, MessageCircle, Send, Link2, Linkedin, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Convert relative URLs (e.g. /novel/slug) to absolute URLs using the current origin */
function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).href;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const rawUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareUrl = resolveUrl(rawUrl);

  const shareLinks = [
    {
      name: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-black/5 dark:hover:bg-white/5",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`,
      color: "hover:bg-green-50 dark:hover:bg-green-950/30",
    },
    {
      name: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-sky-50 dark:hover:bg-sky-950/30",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-sky-50 dark:hover:bg-sky-950/30",
    },
    {
      name: "Reddit",
      icon: Share2,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - silently ignore abort
        if ((err as DOMException)?.name !== 'AbortError') {
          toast.error("Could not share");
        }
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="space-y-0.5">
      {canNativeShare && (
        <>
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium text-amber-700 dark:text-amber-400"
          >
            <Share2 className="w-4 h-4" />
            Share via...
          </button>
          <div className="border-t my-1" />
        </>
      )}
      {shareLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // On desktop, open share URLs in a small centered popup
              if (!window.navigator.share) {
                e.preventDefault();
                const w = 600, h = 500;
                const left = (window.screen.width - w) / 2;
                const top = (window.screen.height - h) / 2;
                window.open(link.href, link.name, `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
              }
            }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${link.color}`}
          >
            <Icon className="w-4 h-4" />
            {link.name}
          </a>
        );
      })}
      <div className="border-t my-1" />
      <button
        onClick={copyLink}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-left"
      >
        <Link2 className="w-4 h-4" />
        Copy Link
      </button>
    </div>
  );
}