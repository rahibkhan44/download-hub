import { getInnertube } from "@/lib/youtube";
import { parseYouTubeUrl } from "@/lib/url-parser";
import { NextRequest, NextResponse } from "next/server";
import { YTNodes } from "youtubei.js";

const MAX_VIDEOS = 500;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const rawId = request.nextUrl.searchParams.get("id");

  let playlistId: string | null = rawId;

  if (!playlistId && url) {
    try {
      const parsed = parseYouTubeUrl(url);
      if (parsed.type !== "playlist") {
        return NextResponse.json(
          { error: "URL is not a playlist" },
          { status: 400 }
        );
      }
      playlistId = parsed.playlistId;
    } catch {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
  }

  if (!playlistId) {
    return NextResponse.json(
      { error: "Playlist URL or id is required" },
      { status: 400 }
    );
  }

  if (!/^[A-Za-z0-9_-]+$/.test(playlistId)) {
    return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    let playlist = await yt.getPlaylist(playlistId);
    const info = playlist.info;

    const collected: InstanceType<typeof YTNodes.PlaylistVideo>[] = [
      ...playlist.items.filterType(YTNodes.PlaylistVideo),
    ];

    while (playlist.has_continuation && collected.length < MAX_VIDEOS) {
      try {
        playlist = await playlist.getContinuation();
        collected.push(...playlist.items.filterType(YTNodes.PlaylistVideo));
      } catch (err) {
        console.error("Playlist continuation error:", err);
        break;
      }
    }

    const videos = collected
      .slice(0, MAX_VIDEOS)
      .filter((v) => v.is_playable && v.id)
      .map((v) => ({
        id: v.id,
        title: v.title.text ?? "Untitled",
        thumbnail:
          v.thumbnails?.[0]?.url ??
          `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.duration?.seconds ?? 0,
        author: v.author?.name ?? "Unknown",
      }));

    return NextResponse.json({
      id: playlistId,
      title: info.title ?? "Untitled Playlist",
      thumbnail: info.thumbnails?.[0]?.url ?? videos[0]?.thumbnail ?? "",
      author: info.author?.name ?? "Unknown",
      videoCount: videos.length,
      videos,
    });
  } catch (error) {
    console.error("Playlist info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist info" },
      { status: 500 }
    );
  }
}
