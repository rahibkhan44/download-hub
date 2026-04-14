import { getInnertube } from "@/lib/youtube";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    const info = await yt.getBasicInfo(extractVideoId(url));

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
      description: videoDetails.short_description,
      thumbnail: videoDetails.thumbnail?.[0]?.url,
      duration: videoDetails.duration,
      author: videoDetails.author,
      viewCount: videoDetails.view_count,
      channelId: videoDetails.channel_id,
      formats,
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Failed to fetch video information. Please check the URL." },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error("Invalid YouTube URL");
}
