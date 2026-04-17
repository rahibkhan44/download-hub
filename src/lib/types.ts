export interface VideoFormat {
  itag: number;
  qualityLabel: string;
  mimeType: string;
  hasAudio: boolean;
  hasVideo: boolean;
  contentLength: string;
  bitrate: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  author: string;
  viewCount: number;
  channelId: string;
  formats: VideoFormat[];
}

export interface PlaylistVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  author: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  videoCount: number;
  videos: PlaylistVideoItem[];
}

export interface TikTokInfo {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  duration: number;
  pageUrl: string;
  likeCount: number;
  playCount: number;
}
