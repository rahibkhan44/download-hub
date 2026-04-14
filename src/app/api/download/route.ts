import { Innertube, Platform } from "youtubei.js";
import { NextRequest, NextResponse } from "next/server";

// Set up JS evaluator for URL deciphering
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Platform.shim as any).eval = async (data: any, env: any) => {
  const properties: string[] = [];
  if (env.n) properties.push(`n: exportedVars.nFunction("${env.n}")`);
  if (env.sig) properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;
  return new Function(code)();
};

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("id");
  const itag = request.nextUrl.searchParams.get("itag");

  if (!videoId || !itag) {
    return NextResponse.json(
      { error: "Video ID and itag are required" },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  const itagNum = parseInt(itag, 10);
  if (isNaN(itagNum)) {
    return NextResponse.json({ error: "Invalid itag" }, { status: 400 });
  }

  try {
    const yt = await Innertube.create({ lang: "en", location: "US" });
    const info = await yt.getInfo(videoId);

    const allFormats = [
      ...(info.streaming_data?.formats ?? []),
      ...(info.streaming_data?.adaptive_formats ?? []),
    ];
    const format = allFormats.find((f) => f.itag === itagNum);

    if (!format) {
      return NextResponse.json({ error: "Format not found" }, { status: 404 });
    }

    const title = info.basic_info.title ?? "video";
    const safeTitle = title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "video";
    const ext = format.mime_type.includes("mp4") ? "mp4" : "webm";

    // Download the muxed stream
    const stream = await info.download({ itag: itagNum });
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${safeTitle}.${ext}"`);
    headers.set("Content-Length", buffer.length.toString());
    headers.set("Content-Type", format.mime_type.split(";")[0] ?? "video/mp4");

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
