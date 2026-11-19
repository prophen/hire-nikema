import { useRef } from "react";
import type { Chapter } from "../data/profile";

type Props = {
  src?: string;
  poster?: string;
  captions?: string;
  chapters: Chapter[];
  transcript: string[];
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Intro video with chapter buttons and a transcript.
 * With no `src` it shows a "recording in progress" slot and opens the transcript,
 * so the hero still says something before the video exists.
 */
export function VideoIntro({ src, poster, captions, chapters, transcript }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(src);

  const seek = (t: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = t;
    void v.play();
  };

  return (
    <div className="video">
      <div className="video-frame">
        {hasVideo ? (
          <video ref={ref} src={src} poster={poster || undefined} controls playsInline preload="metadata">
            {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
          </video>
        ) : (
          <div className="video-empty">
            <div className="play" aria-hidden="true">▶</div>
            <div className="file">intro.mp4</div>
            <div className="rec">recording in progress</div>
          </div>
        )}
      </div>
      <div className="chapters" aria-label="Video chapters">
        {chapters.map((c) => (
          <button key={c.start} type="button" disabled={!hasVideo} onClick={() => seek(c.start)}>
            <span className="ts">{fmt(c.start)}</span>
            {c.label}
          </button>
        ))}
      </div>
      <details className="transcript" open={!hasVideo}>
        <summary>{hasVideo ? "read the transcript" : "cat intro.txt"}</summary>
        <div>{transcript.map((p, i) => <p key={i}>{p}</p>)}</div>
      </details>
    </div>
  );
}
