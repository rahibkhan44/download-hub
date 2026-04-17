import { NextRequest, NextResponse } from "next/server";
import TiktokDL from "@tobyg74/tiktok-api-dl";
import { isTikTokUrl } from "@/lib/url-parser";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isTikTokUrl(url)) {
    return NextResponse.json({ error: "Not a TikTok URL" }, { status: 400 });
  }

  try {
    const response = await TiktokDL.Downloader(url, { version: "v1" });

    if (response.status !== "success" || !response.result) {
      return NextResponse.json(
        { error: response.message ?? "Failed to fetch TikTok info" },
        { status: 502 }
      );
    }

    const r = response.result;

    if (r.type !== "video") {
      return NextResponse.json(
        { error: "Only video posts are supported" },
        { status: 400 }
      );
    }

    const stats = r.statistics ?? {};
    const toNum = (v: unknown) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") return parseInt(v, 10) || 0;
      return 0;
    };

    return NextResponse.json({
      id: r.id ?? "",
      title: r.desc ?? "TikTok Video",
      author: r.author?.nickname ?? "Unknown",
      authorAvatar: r.author?.avatar ?? "",
      thumbnail: r.video?.cover?.[0] ?? "",
      duration: r.video?.duration ?? 0,
      pageUrl: url,
      likeCount: toNum(stats.likeCount),
      playCount: toNum(stats.playCount),
    });
  } catch (error) {
    console.error("TikTok info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch TikTok info" },
      { status: 500 }
    );
  }
}
