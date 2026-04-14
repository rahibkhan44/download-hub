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
  title: "DownloadHub - Free Video Downloader | YouTube, Facebook, Instagram, TikTok",
  description:
    "Download videos from YouTube, Facebook, Instagram & TikTok for free. Fast, safe, and easy — no app needed. HD quality up to 1080p.",
  keywords: ["video downloader", "youtube downloader", "facebook downloader", "instagram downloader", "tiktok downloader", "free", "online"],
  authors: [{ name: "Rahib Khan", url: "mailto:rahibkhan.dev88@gmail.com" }],
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
