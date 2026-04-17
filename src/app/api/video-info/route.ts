import { getInnertube } from "@/lib/youtube";
import { parseYouTubeUrl } from "@/lib/url-parser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let videoId: string;
  try {
    const parsed = parseYouTubeUrl(url);
    if (parsed.type !== "video") {
      return NextResponse.json(
        { error: "URL is a playlist — use /api/playlist-info instead" },
        { status: 400 }
      );
    }
    videoId = parsed.videoId;
  } catch {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    const info = await yt.getBasicInfo(videoId);

    const videoDetails = info.basic_info;

    const formats: Array<{
      itag: number;
      qualityLabel: string;
      mimeType: string;
      hasAudio: boolean;
      hasVideo: boolean;
      contentLength: string;
      bitrate: number;
    }> = [];

    if (info.streaming_data?.formats) {
      for (const f of info.streaming_data.formats) {
        if (f.has_audio && f.has_video) {
          formats.push({
            itag: f.itag,
            qualityLabel: f.quality_label ?? `${f.height}p`,
            mimeType: f.mime_type,
            hasAudio: true,
            hasVideo: true,
            contentLength: f.content_length?.toString() ?? "0",
            bitrate: f.bitrate ?? 0,
          });
        }
      }
    }

    // Sort by resolution descending
    formats.sort((a, b) => {
      const aRes = parseInt(a.qualityLabel) || 0;
      const bRes = parseInt(b.qualityLabel) || 0;
      return bRes - aRes;
    });

    return NextResponse.json({
      id: videoDetails.id,
      title: videoDetails.title,
      thumbnail:
        videoDetails.thumbnail?.[0]?.url ??
        `https://i.ytimg.com/vi/${videoDetails.id}/hqdefault.jpg`,
      duration: videoDetails.duration,
      author: videoDetails.author ?? "Unknown",
      viewCount: videoDetails.view_count ?? 0,
      description: videoDetails.short_description ?? "",
      channelId: videoDetails.channel_id ?? "",
      formats,
    });
  } catch (error) {
    console.error("Video info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video info" },
      { status: 500 }
    );
  }
}

