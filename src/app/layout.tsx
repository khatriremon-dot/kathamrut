import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kathamrut.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kathamrut — Stories Across Languages",
    template: "%s | Kathamrut",
  },
  description:
    "Discover captivating novels in English, Hindi, and Nepali. Read immersive stories, explore interactive roleplaying adventures, and experience literature across cultures.",
  keywords: [
    "Kathamrut",
    "novels",
    "multilingual",
    "English novels",
    "Hindi novels",
    "Nepali novels",
    "stories",
    "roleplay",
    "interactive fiction",
    "book reading",
    "online reading",
    "South Asian literature",
  ],
  authors: [{ name: "Kathamrut", url: siteUrl }],
  creator: "Kathamrut",
  publisher: "Kathamrut",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Kathamrut — Stories Across Languages",
    description:
      "Discover captivating novels in English, Hindi, and Nepali. Read immersive stories and play interactive roleplaying adventures.",
    type: "website",
    url: siteUrl,
    siteName: "Kathamrut",
    locale: "en_US",
    alternateLocale: ["hi_IN", "ne_NP"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kathamrut — Stories Across Languages",
    description:
      "Discover captivating novels in English, Hindi, and Nepali. Read immersive stories and play interactive roleplaying adventures.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#d97706" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Kathamrut",
              url: siteUrl,
              description: "Multilingual novel reading platform with stories in English, Hindi, and Nepali",
              inLanguage: ["en", "hi", "ne"],
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/?search={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}