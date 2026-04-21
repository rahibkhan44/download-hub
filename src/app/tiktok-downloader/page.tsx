import type { Metadata } from "next";
import VideoDownloader from "@/components/video-downloader";

export const metadata: Metadata = {
  title: "TikTok Downloader No Watermark — Free Online MP4 | Vidverse",
  description:
    "Free TikTok video downloader without watermark. Download TikTok videos in HD MP4 without the username overlay or logo. No app, no signup — clean video every time.",
  keywords: [
    "tiktok downloader",
    "tiktok downloader no watermark",
    "tiktok download without watermark",
    "tiktok video downloader free",
    "save tiktok without watermark",
    "download tiktok no logo",
    "tiktok mp4 downloader",
    "tiktok video saver",
    "tiktok clean download",
    "remove tiktok watermark",
  ],
  alternates: {
    canonical:
      "https://yt-downloader-livid-xi.vercel.app/tiktok-downloader",
  },
  openGraph: {
    title: "Free TikTok Downloader — No Watermark, HD MP4 | Vidverse",
    description:
      "Download TikTok videos without watermark, no app needed. HD MP4 in seconds.",
    type: "website",
    siteName: "Vidverse",
  },
};

const tiktokJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "TikTok Downloader No Watermark",
  url: "https://yt-downloader-livid-xi.vercel.app/tiktok-downloader",
  description:
    "Free TikTok video downloader that saves clean videos without watermark or username overlay.",
  mainEntity: {
    "@type": "WebApplication",
    name: "Vidverse TikTok Downloader",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Download TikTok videos without watermark",
      "No TikTok logo or username overlay on saved video",
      "HD MP4 quality",
      "No app install or signup required",
      "Works on mobile and desktop",
    ],
  },
};

export default function TikTokDownloaderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tiktokJsonLd) }}
      />
      <VideoDownloader
        initialPlatform="tiktok"
        heroTitle={
          <>
            TikTok Downloader — <span className="text-red-500">No Watermark</span>
          </>
        }
        heroSubtitle="Download TikTok videos without the watermark or username overlay. Clean HD MP4 files — no app, no signup, nothing to install."
      />
    </>
  );
}
