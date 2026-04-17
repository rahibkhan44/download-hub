import { NextRequest, NextResponse } from "next/server";
import TiktokDL from "@tobyg74/tiktok-api-dl";
import { isTikTokUrl } from "@/lib/url-parser";

const ALLOWED_CDN_HOST_SUFFIXES = [
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokv.com",
  "tiktokv.us",
  "byteoversea.com",
  "muscdn.com",
  "bytedance.map.fastly.net",
];

const CDN_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isAllowedCdnHost(hostname: string): boolean {
  return ALLOWED_CDN_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith("." + suffix)
  );
}

export async function GET(request: NextRequest) {
  const pageUrl = request.nextUrl.searchParams.get("url");

  if (!pageUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isTikTokUrl(pageUrl)) {
    return NextResponse.json({ error: "Not a TikTok URL" }, { status: 400 });
  }

  try {
    const response = await TiktokDL.Downloader(pageUrl, { version: "v1" });

    if (response.status !== "success" || !response.result?.video?.playAddr?.[0]) {
      return NextResponse.json(
        { error: response.message ?? "No video URL available" },
        { status: 502 }
      );
    }

    const r = response.result;
    const videoUrl = r.video!.playAddr![0];

    let parsedVideoUrl: URL;
    try {
      parsedVideoUrl = new URL(videoUrl);
    } catch {
      return NextResponse.json({ error: "Invalid CDN URL" }, { status: 502 });
    }

    if (!isAllowedCdnHost(parsedVideoUrl.hostname)) {
      return NextResponse.json(
        { error: "Unexpected CDN host" },
        { status: 502 }
      );
    }

    const upstream = await fetch(parsedVideoUrl.toString(), {
      headers: {
        "User-Agent": CDN_USER_AGENT,
        Referer: "https://www.tiktok.com/",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Failed to fetch video from TikTok CDN" },
        { status: 502 }
      );
    }

    const rawTitle = r.desc && r.desc.trim().length > 0 ? r.desc : r.id ?? "tiktok";
    const safeTitle =
      rawTitle
        .replace(/[\r\n]+/g, " ")
        .replace(/[^a-zA-Z0-9_\- ]/g, "")
        .trim()
        .slice(0, 80) || "tiktok";

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeTitle}.mp4"`
    );
    headers.set("Content-Type", "video/mp4");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error("TikTok download error:", error);
    return NextResponse.json(
      { error: "Failed to download TikTok video" },
      { status: 500 }
    );
  }
}
