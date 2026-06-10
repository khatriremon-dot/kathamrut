"use client";

import { Twitter, Facebook, MessageCircle, Send, Link2 } from "lucide-react";
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

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

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
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="space-y-0.5">
      {shareLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
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