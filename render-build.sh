#!/usr/bin/env bash
set -e

# Install dependencies
npm install

# Install ffmpeg
apt-get update && apt-get install -y ffmpeg || true

# Install yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

# Build the app
npm run build
