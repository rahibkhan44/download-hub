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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "DownloadHub",
      url: "https://yt-downloader-livid-xi.vercel.app",
      description:
        "Download YouTube videos, playlists, and TikTok without watermark online for free. No app install, no signup.",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires a modern web browser",
      featureList: [
        "YouTube video download in HD",
        "YouTube playlist bulk download",
        "TikTok video download without watermark",
        "No app installation required",
        "Works on mobile, tablet, and desktop",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I download a YouTube video for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Paste the YouTube video URL into DownloadHub, choose your preferred quality, and click Download. No signup or app install needed.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download TikTok videos without watermark?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DownloadHub downloads TikTok videos without the watermark or username overlay, giving you a clean video file.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download an entire YouTube playlist?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Paste a YouTube playlist URL and DownloadHub will list all videos. You can download them individually or use the Download All button.",
          },
        },
        {
          "@type": "Question",
          name: "Is DownloadHub free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, DownloadHub is completely free with no hidden charges, no ads, and no signup required.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to download videos from YouTube or TikTok",
      step: [
        {
          "@type": "HowToStep",
          name: "Copy the video URL",
          text: "Copy the URL of the YouTube or TikTok video you want to download.",
        },
        {
          "@type": "HowToStep",
          name: "Paste and search",
          text: "Paste the URL into DownloadHub and click the search button.",
        },
        {
          "@type": "HowToStep",
          name: "Download",
          text: "Choose your quality and click Download. The file saves directly to your device.",
        },
      ],
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
