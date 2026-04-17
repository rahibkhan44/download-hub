import { getInnertube } from "@/lib/youtube";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("id");
  const itag = request.nextUrl.searchParams.get("itag");
  const best = request.nextUrl.searchParams.get("best") === "1";

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  if (!itag && !best) {
    return NextResponse.json(
      { error: "Either itag or best=1 is required" },
      { status: 400 }
    );
  }

  let itagNum: number | null = null;
  if (itag) {
    itagNum = parseInt(itag, 10);
    if (isNaN(itagNum)) {
      return NextResponse.json({ error: "Invalid itag" }, { status: 400 });
    }
  }

  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);

    const muxedFormats = info.streaming_data?.formats ?? [];
    const allFormats = [
      ...muxedFormats,
      ...(info.streaming_data?.adaptive_formats ?? []),
    ];

    let format;
    if (itagNum !== null) {
      format = allFormats.find((f) => f.itag === itagNum);
    } else {
      format = [...muxedFormats]
        .filter((f) => f.has_audio && f.has_video)
        .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
    }

    if (!format) {
      return NextResponse.json({ error: "Format not found" }, { status: 404 });
    }

    const title = info.basic_info.title ?? "video";
    const safeTitle = title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "video";
    const ext = format.mime_type.includes("mp4") ? "mp4" : "webm";

    const stream = await info.download({ itag: format.itag });

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${safeTitle}.${ext}"`);
    headers.set("Content-Type", format.mime_type.split(";")[0] ?? "video/mp4");
    if (format.content_length != null) {
      headers.set("Content-Length", format.content_length.toString());
    }

    return new NextResponse(stream as unknown as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
