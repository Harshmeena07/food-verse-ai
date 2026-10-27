// Video frame extractor utility for browser-side video analysis

export interface ExtractedFrame {
  data: string; // base64 data URL
  timestamp: string; // e.g., "00:03"
  timeSeconds: number;
}

export async function extractVideoFrames(
  file: File,
  maxFrames: number = 4
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 10;
        const frames: ExtractedFrame[] = [];

        // Sample time offsets evenly across the video
        const interval = duration / (maxFrames + 1);
        const timePoints: number[] = [];
        for (let i = 1; i <= maxFrames; i++) {
          timePoints.push(Math.min(interval * i, duration - 0.5));
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale resolution down if large to keep under base64 limits
        const maxWidth = 720;
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 480;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        for (const t of timePoints) {
          await new Promise<void>((resSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                const mins = Math.floor(t / 60);
                const secs = Math.floor(t % 60);
                const timestamp = `${mins.toString().padStart(2, '0')}:${secs
                  .toString()
                  .padStart(2, '0')}`;
                frames.push({
                  data: dataUrl,
                  timestamp,
                  timeSeconds: Math.round(t),
                });
              }
              resSeek();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = t;
          });
        }

        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file for frame extraction.'));
    };
  });
}
