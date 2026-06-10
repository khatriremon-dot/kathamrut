import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kathamrut — Stories Across Languages",
  description: "Discover novels in English, Hindi, and Nepali. Read immersive stories and play interactive roleplaying adventures.",
  keywords: ["Kathamrut", "novels", "multilingual", "English", "Hindi", "Nepali", "stories", "roleplay"],
  authors: [{ name: "Kathamrut" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Kathamrut — Stories Across Languages",
    description: "Discover novels in English, Hindi, and Nepali. Read immersive stories and play interactive roleplaying adventures.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kathamrut — Stories Across Languages",
    description: "Discover novels in English, Hindi, and Nepali. Read immersive stories and play interactive roleplaying adventures.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
