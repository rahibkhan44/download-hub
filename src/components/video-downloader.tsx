"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Search,
  Download,
  Loader2,
  CirclePlay,
  Clock,
  Eye,
  Video,
  Zap,
  Shield,
  MonitorSmartphone,
  CloudDownload,
  Link2,
  ListChecks,
  MousePointerClick,
  Mail,
  ListVideo,
  ArrowLeft,
  PackageCheck,
  StopCircle,
  Heart,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  VideoInfo,
  VideoFormat,
  PlaylistInfo,
  PlaylistVideoItem,
  TikTokInfo,
} from "@/lib/types";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: CirclePlay, active: true },
  { id: "tiktok", label: "TikTok", icon: Zap, active: true },
  { id: "facebook", label: "Facebook", icon: Video, active: false },
  { id: "instagram", label: "Instagram", icon: MonitorSmartphone, active: false },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Download videos in seconds with our optimized server infrastructure.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "No ads, no malware, no tracking. Your privacy is our priority.",
  },
  {
    icon: MonitorSmartphone,
    title: "All Devices",
    description: "Works on desktop, tablet, and mobile — no app installation needed.",
  },
  {
    icon: CloudDownload,
    title: "Multiple Qualities",
    description: "Choose from 360p to 1080p Full HD with audio included.",
  },
];

const STEPS = [
  {
    icon: Link2,
    step: "1",
    title: "Paste Link",
    description: "Copy the video URL and paste it in the input field above.",
  },
  {
    icon: ListChecks,
    step: "2",
    title: "Choose Quality",
    description: "Select your preferred video quality and format.",
  },
  {
    icon: MousePointerClick,
    step: "3",
    title: "Download",
    description: "Click download and save the video to your device.",
  },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "Unknown size";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getMuxedFormats(formats: VideoFormat[]) {
  return formats
    .filter((f) => f.hasVideo && f.hasAudio)
    .sort((a, b) => b.bitrate - a.bitrate);
}

function isPlaylistUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    /youtube\.com\/playlist\b/i.test(trimmed) ||
    (/[?&]list=/i.test(trimmed) && !/[?&]v=/i.test(trimmed))
  );
}

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [tiktokInfo, setTiktokInfo] = useState<TikTokInfo | null>(null);
  const [tiktokDownloading, setTiktokDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
  const [downloadingPlaylistId, setDownloadingPlaylistId] = useState<string | null>(null);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState("youtube");
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    title: string;
    failed: number;
  } | null>(null);
  const bulkCancelRef = useRef(false);

  const resetMedia = () => {
    setVideoInfo(null);
    setPlaylistInfo(null);
    setTiktokInfo(null);
  };

  const handleSearch = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    resetMedia();

    let endpoint: string;
    let targetKey: "video" | "playlist" | "tiktok";

    if (activePlatform === "tiktok") {
      endpoint = `/api/tiktok-info?url=${encodeURIComponent(trimmed)}`;
      targetKey = "tiktok";
    } else if (isPlaylistUrl(trimmed)) {
      endpoint = `/api/playlist-info?url=${encodeURIComponent(trimmed)}`;
      targetKey = "playlist";
    } else {
      endpoint = `/api/video-info?url=${encodeURIComponent(trimmed)}`;
      targetKey = "video";
    }

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch info");
        return;
      }

      if (targetKey === "tiktok") setTiktokInfo(data);
      else if (targetKey === "playlist") setPlaylistInfo(data);
      else setVideoInfo(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platformId: string) => {
    if (platformId === activePlatform) return;
    setActivePlatform(platformId);
    setUrl("");
    setError("");
    resetMedia();
  };

  const handleTikTokDownload = () => {
    if (!tiktokInfo) return;
    setTiktokDownloading(true);
    const link = document.createElement("a");
    link.href = `/api/tiktok-download?url=${encodeURIComponent(tiktokInfo.pageUrl)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setTiktokDownloading(false), 8000);
  };

  const handleDownload = (videoId: string, itag: number) => {
    setDownloadingItag(itag);
    const link = document.createElement("a");
    link.href = `/api/download?id=${videoId}&itag=${itag}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingItag(null), 8000);
  };

  const handleDownloadBest = (videoId: string) => {
    setDownloadingPlaylistId(videoId);
    const link = document.createElement("a");
    link.href = `/api/download?id=${videoId}&best=1`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingPlaylistId(null), 8000);
  };

  const handleSelectPlaylistVideo = async (videoId: string) => {
    setLoadingVideoId(videoId);
    setError("");
    try {
      const res = await fetch(
        `/api/video-info?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch video info");
        return;
      }
      setVideoInfo(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingVideoId(null);
    }
  };

  const handleBackToPlaylist = () => {
    setVideoInfo(null);
    setError("");
  };

  const sanitizeFilename = (s: string) =>
    s.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "video";

  const handleDownloadAll = async () => {
    if (!playlistInfo || bulkProgress) return;

    bulkCancelRef.current = false;
    const videos = playlistInfo.videos;
    let failed = 0;

    setBulkProgress({ current: 0, total: videos.length, title: "", failed: 0 });

    for (let i = 0; i < videos.length; i++) {
      if (bulkCancelRef.current) break;
      const video = videos[i];

      setBulkProgress({
        current: i + 1,
        total: videos.length,
        title: video.title,
        failed,
      });

      try {
        const res = await fetch(`/api/download?id=${video.id}&best=1`);
        if (!res.ok) {
          failed++;
          continue;
        }
        const blob = await res.blob();
        if (bulkCancelRef.current) break;

        const ext = blob.type.includes("webm") ? "webm" : "mp4";
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${sanitizeFilename(video.title)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      } catch {
        failed++;
      }
    }

    setBulkProgress(null);
    bulkCancelRef.current = false;
  };

  const handleCancelBulk = () => {
    bulkCancelRef.current = true;
  };

  const muxedFormats = videoInfo ? getMuxedFormats(videoInfo.formats) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-lg p-2">
              <CirclePlay className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DownloadHub</h1>
              <p className="text-xs text-neutral-400">Video Downloader</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <a href="#downloader" className="hover:text-white transition-colors">Downloader</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero + Downloader Section */}
        <section id="downloader" className="container mx-auto px-4 pt-12 pb-16 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Download Videos <span className="text-red-500">Instantly</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Free online video downloader. Save videos from YouTube, Facebook, Instagram & TikTok in HD quality.
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => p.active && handlePlatformChange(p.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activePlatform === p.id
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : p.active
                        ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                        : "bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                  {!p.active && (
                    <span className="text-[10px] bg-neutral-700 text-neutral-400 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              type="url"
              placeholder={
                activePlatform === "youtube"
                  ? "Paste YouTube video or playlist URL..."
                  : activePlatform === "tiktok"
                    ? "Paste TikTok video URL..."
                    : "Coming soon..."
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={activePlatform !== "youtube" && activePlatform !== "tiktok"}
              className="flex-1 h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-red-500 focus:ring-red-500/20"
            />
            <Button
              onClick={handleSearch}
              disabled={
                loading ||
                !url.trim() ||
                (activePlatform !== "youtube" && activePlatform !== "tiktok")
              }
              className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 max-w-2xl mx-auto p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <Card className="bg-neutral-900 border-neutral-800 mt-8">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-64 h-36 rounded-lg bg-neutral-800" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-neutral-800" />
                    <Skeleton className="h-4 w-1/2 bg-neutral-800" />
                    <Skeleton className="h-4 w-1/3 bg-neutral-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Playlist View */}
          {playlistInfo && !videoInfo && (
            <div className="space-y-6 mt-8">
              <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {playlistInfo.thumbnail && (
                      <div className="relative md:w-80 flex-shrink-0 aspect-video md:aspect-auto md:h-auto">
                        <Image
                          src={playlistInfo.thumbnail}
                          alt={playlistInfo.title}
                          width={320}
                          height={180}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <ListVideo className="h-3 w-3" />
                          {playlistInfo.videoCount}
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex-1 min-w-0 flex flex-col">
                      <Badge className="bg-red-600/10 text-red-400 border-red-800 mb-2 w-fit">
                        <ListVideo className="h-3 w-3 mr-1" />
                        Playlist
                      </Badge>
                      <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                        {playlistInfo.title}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-1">
                        {playlistInfo.author}
                      </p>
                      <p className="text-xs text-neutral-500 mb-4">
                        {playlistInfo.videoCount} videos
                      </p>
                      <div className="mt-auto">
                        {!bulkProgress ? (
                          <Button
                            onClick={handleDownloadAll}
                            disabled={playlistInfo.videos.length === 0}
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                          >
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Download All ({playlistInfo.videos.length})
                          </Button>
                        ) : (
                          <div className="space-y-2 w-full">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-300 font-medium">
                                Downloading {bulkProgress.current} / {bulkProgress.total}
                                {bulkProgress.failed > 0 && (
                                  <span className="text-red-400 ml-2">
                                    ({bulkProgress.failed} failed)
                                  </span>
                                )}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelBulk}
                                className="h-7 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                              >
                                <StopCircle className="h-3.5 w-3.5 mr-1" />
                                Stop
                              </Button>
                            </div>
                            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{
                                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-neutral-500 truncate">
                              {bulkProgress.title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <ListVideo className="h-4 w-4" />
                    Videos in Playlist
                    <Badge variant="outline" className="text-neutral-500 border-neutral-700 ml-auto">
                      {playlistInfo.videos.length} videos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <Separator className="bg-neutral-800" />
                <CardContent className="p-3">
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {playlistInfo.videos.map((video, idx) => (
                      <PlaylistVideoRow
                        key={video.id}
                        video={video}
                        index={idx + 1}
                        isLoading={loadingVideoId === video.id}
                        isDownloading={downloadingPlaylistId === video.id}
                        onSelect={() => handleSelectPlaylistVideo(video.id)}
                        onDownloadBest={() => handleDownloadBest(video.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Video Info */}
          {videoInfo && (
            <div className="space-y-6 mt-8">
              {playlistInfo && (
                <Button
                  onClick={handleBackToPlaylist}
                  variant="outline"
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to playlist
                </Button>
              )}
              <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-80 flex-shrink-0 aspect-video md:aspect-auto md:h-auto">
                      <Image
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(videoInfo.duration)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                        {videoInfo.title}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-3">
                        {videoInfo.author}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {formatViews(videoInfo.viewCount)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(videoInfo.duration)}
                        </span>
                      </div>
                      {videoInfo.description && (
                        <p className="text-xs text-neutral-500 mt-3 line-clamp-2">
                          {videoInfo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {muxedFormats && muxedFormats.length > 0 && (
                <FormatSection
                  title="Video + Audio"
                  icon={<Video className="h-4 w-4" />}
                  formats={muxedFormats}
                  videoId={videoInfo.id}
                  downloadingItag={downloadingItag}
                  onDownload={handleDownload}
                />
              )}
            </div>
          )}

          {/* TikTok View */}
          {tiktokInfo && (
            <div className="mt-8">
              <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {tiktokInfo.thumbnail && (
                      <div className="relative md:w-72 flex-shrink-0 aspect-[9/16] md:aspect-auto md:h-auto bg-neutral-950">
                        <Image
                          src={tiktokInfo.thumbnail}
                          alt={tiktokInfo.title}
                          width={288}
                          height={512}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        {tiktokInfo.duration > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(tiktokInfo.duration)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex-1 min-w-0 flex flex-col">
                      <Badge className="bg-red-600/10 text-red-400 border-red-800 mb-3 w-fit">
                        <Zap className="h-3 w-3 mr-1" />
                        TikTok
                      </Badge>
                      <h3 className="text-base font-semibold text-white line-clamp-3 mb-2">
                        {tiktokInfo.title}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-3">
                        {tiktokInfo.author}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mb-4">
                        {tiktokInfo.playCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Play className="h-3.5 w-3.5" />
                            {formatViews(tiktokInfo.playCount)}
                          </span>
                        )}
                        {tiktokInfo.likeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {formatViews(tiktokInfo.likeCount)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <Button
                          onClick={handleTikTokDownload}
                          disabled={tiktokDownloading}
                          className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                        >
                          {tiktokDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download (No Watermark)
                            </>
                          )}
                        </Button>
                        <p className="text-[11px] text-neutral-600 mt-2">
                          Clean video — no TikTok tag or username overlay.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!videoInfo && !playlistInfo && !tiktokInfo && !loading && !error && (
            <div className="text-center py-12 text-neutral-600">
              <CirclePlay className="h-14 w-14 mx-auto mb-3 opacity-20" />
              <p className="text-base">
                {activePlatform === "tiktok"
                  ? "Paste a TikTok video URL above to get started"
                  : "Paste a video or playlist URL above to get started"}
              </p>
            </div>
          )}
        </section>

        {/* Supported Platforms Banner */}
        <section className="border-y border-neutral-800 bg-neutral-900/50">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-sm text-neutral-500 mb-4">Supported Platforms</p>
            <div className="flex justify-center items-center gap-8 md:gap-16">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.id} className={`flex flex-col items-center gap-1.5 ${p.active ? "text-white" : "text-neutral-600"}`}>
                    <Icon className="h-7 w-7" />
                    <span className="text-xs font-medium">{p.label}</span>
                    {!p.active && <span className="text-[9px] text-neutral-600">Coming Soon</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Why Choose DownloadHub?</h2>
            <p className="text-neutral-400">The simplest way to download videos from the internet.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="bg-red-600/10 rounded-xl p-3 w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-neutral-800 bg-neutral-900/30">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
              <p className="text-neutral-400">Download any video in 3 simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="text-center">
                    <div className="relative mx-auto mb-4">
                      <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto">
                        {s.step}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1">
                        <Icon className="h-4 w-4 text-red-400" />
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">{s.title}</h3>
                    <p className="text-neutral-500 text-sm">{s.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is DownloadHub free to use?",
                a: "Yes, DownloadHub is completely free to use with no hidden charges or subscriptions.",
              },
              {
                q: "What video qualities are supported?",
                a: "We support 360p, 480p, 720p HD, and 1080p Full HD with audio included.",
              },
              {
                q: "Do I need to install any software?",
                a: "No installation required. DownloadHub works entirely in your browser on any device.",
              },
              {
                q: "Will Facebook, Instagram & TikTok be supported?",
                a: "Yes! Support for Facebook, Instagram, and TikTok downloads is coming very soon.",
              },
            ].map((item) => (
              <Card key={item.q} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-5">
                  <h3 className="text-white font-medium mb-1">{item.q}</h3>
                  <p className="text-neutral-500 text-sm">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-600 rounded-lg p-1.5">
                  <CirclePlay className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">DownloadHub</span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Free online video downloader for YouTube, Facebook, Instagram & TikTok. Fast, safe, and easy to use.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3">Platforms</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#downloader" className="hover:text-white transition-colors">YouTube Downloader</a></li>
                <li className="text-neutral-600">Facebook Downloader (Soon)</li>
                <li className="text-neutral-600">Instagram Downloader (Soon)</li>
                <li className="text-neutral-600">TikTok Downloader (Soon)</li>
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h4 className="text-white font-semibold mb-3">Developer</h4>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-300 font-medium">Rahib Khan</p>
                <a
                  href="mailto:rahibkhan.dev88@gmail.com"
                  className="flex items-center gap-2 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  rahibkhan.dev88@gmail.com
                </a>
                <a
                  href="https://github.com/rahibkhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-800 mb-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-neutral-600">
            <p>&copy; {new Date().getFullYear()} DownloadHub. All rights reserved.</p>
            <p>
              Developed with <span className="text-red-500">&hearts;</span> by{" "}
              <span className="text-neutral-400">Rahib Khan</span>
            </p>
            <p>For personal use only. Respect content creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FormatSection({
  title,
  icon,
  formats,
  videoId,
  downloadingItag,
  onDownload,
}: {
  title: string;
  icon: React.ReactNode;
  formats: VideoFormat[];
  videoId: string;
  downloadingItag: number | null;
  onDownload: (videoId: string, itag: number) => void;
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="outline" className="text-neutral-500 border-neutral-700 ml-auto">
            {formats.length} options
          </Badge>
        </CardTitle>
      </CardHeader>
      <Separator className="bg-neutral-800" />
      <CardContent className="p-3">
        <div className="space-y-2">
          {formats.map((format) => {
            const ext = format.mimeType.includes("mp4")
              ? "MP4"
              : format.mimeType.includes("webm")
                ? "WEBM"
                : format.mimeType.includes("audio/mp4")
                  ? "M4A"
                  : format.mimeType.split(";")[0].split("/")[1]?.toUpperCase() ?? "???";

            return (
              <div
                key={format.itag}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-neutral-700 text-neutral-200 text-xs font-mono">
                    {ext}
                  </Badge>
                  <div>
                    <span className="text-sm font-medium text-white">
                      {format.qualityLabel}
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">
                      {formatBytes(parseInt(format.contentLength))}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onDownload(videoId, format.itag)}
                  disabled={downloadingItag === format.itag}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                >
                  {downloadingItag === format.itag ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Download className="h-3.5 w-3.5 mr-1" />
                  )}
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PlaylistVideoRow({
  video,
  index,
  isLoading,
  isDownloading,
  onSelect,
  onDownloadBest,
}: {
  video: PlaylistVideoItem;
  index: number;
  isLoading: boolean;
  isDownloading: boolean;
  onSelect: () => void;
  onDownloadBest: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors">
      <span className="text-xs text-neutral-500 w-6 text-right flex-shrink-0 tabular-nums">
        {index}
      </span>
      <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-neutral-900">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={96}
          height={56}
          className="w-full h-full object-cover"
          unoptimized
        />
        {video.duration > 0 && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[10px] px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium line-clamp-2 leading-snug">
          {video.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 truncate">{video.author}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          onClick={onSelect}
          disabled={isLoading}
          variant="outline"
          className="border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white text-xs h-8"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Formats"
          )}
        </Button>
        <Button
          size="sm"
          onClick={onDownloadBest}
          disabled={isDownloading}
          className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
