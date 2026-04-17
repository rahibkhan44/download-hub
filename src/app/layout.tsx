import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Free Online Video Downloader — YouTube & TikTok No Watermark | DownloadHub",
  description:
    "Download YouTube videos, playlists, and TikTok without watermark online for free. No app install, no signup. HD quality up to 1080p. Works on any device.",
  keywords: [
    "online youtube downloader",
    "youtube video downloader free",
    "youtube playlist downloader",
    "tiktok downloader no watermark",
    "tiktok download without watermark",
    "download tiktok video no logo",
    "free video downloader online",
    "download youtube video no app",
    "youtube to mp4 online",
    "save tiktok without watermark",
  ],
  authors: [{ name: "Rahib Khan", url: "mailto:rahibkhan.dev88@gmail.com" }],
  openGraph: {
    title: "DownloadHub — Free YouTube & TikTok Video Downloader Online",
    description:
      "Download YouTube videos, playlists, and TikTok without watermark. Free, fast, no app needed. HD quality on any device.",
    type: "website",
    siteName: "DownloadHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "DownloadHub — Free YouTube & TikTok Video Downloader",
    description:
      "Download YouTube videos & TikTok without watermark online. No app, no signup, HD quality.",
  },
  alternates: {
    canonical: "https://yt-downloader-livid-xi.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
