export type ParsedYouTubeUrl =
  | { type: "video"; videoId: string }
  | { type: "playlist"; playlistId: string };

const VIDEO_ID_RE = /(?:v=|youtu\.be\/|\/embed\/|\/v\/|\/shorts\/)([a-zA-Z0-9_-]{11})/;
const PLAYLIST_ID_RE = /[?&]list=([A-Za-z0-9_-]+)/;
const BARE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl {
  const trimmed = input.trim();

  const isPlaylistPage = /youtube\.com\/playlist\b/i.test(trimmed);
  const videoMatch = trimmed.match(VIDEO_ID_RE);
  const playlistMatch = trimmed.match(PLAYLIST_ID_RE);

  if (isPlaylistPage && playlistMatch) {
    return { type: "playlist", playlistId: playlistMatch[1] };
  }

  if (videoMatch) {
    return { type: "video", videoId: videoMatch[1] };
  }

  if (BARE_VIDEO_ID_RE.test(trimmed)) {
    return { type: "video", videoId: trimmed };
  }

  if (playlistMatch) {
    return { type: "playlist", playlistId: playlistMatch[1] };
  }

  throw new Error("Invalid YouTube URL");
}

export function isTikTokUrl(input: string): boolean {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    return /(^|\.)tiktok\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}
