import type { Metadata } from "next";
import VideoDownloader from "@/components/video-downloader";

export const metadata: Metadata = {
  title: "YouTube Video Downloader — Free HD MP4 | Vidverse",
  description:
    "Free online YouTube downloader. Download YouTube videos and entire playlists in HD MP4 up to 1080p. No app install, no signup, no watermark. Works on any device.",
  keywords: [
    "youtube downloader",
    "youtube video downloader",
    "youtube downloader online",
    "youtube to mp4",
    "youtube playlist downloader",
    "download youtube video free",
    "youtube hd downloader",
    "youtube 1080p downloader",
    "youtube mp4 converter",
    "youtube video saver",
  ],
  alternates: {
    canonical:
      "https://yt-downloader-livid-xi.vercel.app/youtube-downloader",
  },
  openGraph: {
    title: "Free YouTube Downloader — Videos & Playlists in HD | Vidverse",
    description:
      "Download YouTube videos and full playlists in HD. Free, online, no app needed.",
    type: "website",
    siteName: "Vidverse",
  },
};

const youtubeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "YouTube Video Downloader",
  url: "https://yt-downloader-livid-xi.vercel.app/youtube-downloader",
  description:
    "Free online YouTube downloader for videos and playlists in HD MP4.",
  mainEntity: {
    "@type": "WebApplication",
    name: "Vidverse YouTube Downloader",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Download YouTube videos in 1080p HD",
      "Download entire YouTube playlists at once",
      "No app install or signup required",
      "Works on mobile, tablet, and desktop",
    ],
  },
};

export default function YouTubeDownloaderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(youtubeJsonLd) }}
      />
      <VideoDownloader
        initialPlatform="youtube"
        heroTitle={
          <>
            Free YouTube <span className="text-red-500">Video Downloader</span>
          </>
        }
        heroSubtitle="Download YouTube videos and full playlists in HD MP4 up to 1080p. No app, no signup — paste a link and download in seconds."
      />
    </>
  );
}
