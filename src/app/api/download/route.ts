import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { unlink, readFile, stat } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const ytDlpPath = join(process.cwd(), "bin", "yt-dlp.exe");
const ffmpegPath = join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe");

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

  const id = randomUUID();
  const outputPath = join(tmpdir(), `yt-${id}.mp4`);

  try {
    // Use yt-dlp to download with specific itag + best audio, merged into mp4
    const args = [
      `https://www.youtube.com/watch?v=${videoId}`,
      "-f", `${itagNum}+bestaudio[ext=m4a]/${itagNum}+bestaudio/${itagNum}`,
      "--merge-output-format", "mp4",
      "--ffmpeg-location", ffmpegPath,
      "-o", outputPath,
      "--no-playlist",
      "--no-check-certificates",
    ];

    console.log("[download] yt-dlp args:", args.join(" "));
    await execFileAsync(ytDlpPath, args, { timeout: 300000 });

    // Check if output exists
    await stat(outputPath);
    const buffer = await readFile(outputPath);

    // Get title from yt-dlp
    let safeTitle = "video";
    try {
      const { stdout } = await execFileAsync(ytDlpPath, [
        `https://www.youtube.com/watch?v=${videoId}`,
        "--get-title",
        "--no-playlist",
      ], { timeout: 15000 });
      safeTitle = stdout.trim().replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "video";
    } catch {
      // ignore title fetch errors
    }

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${safeTitle}.mp4"`);
    headers.set("Content-Length", buffer.length.toString());
    headers.set("Content-Type", "video/mp4");

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  } finally {
    unlink(outputPath).catch(() => {});
  }
}
