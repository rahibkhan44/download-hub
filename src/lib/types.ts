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
