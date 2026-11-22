import { useRef } from "react";
import type { Chapter } from "../data/profile";
import { track } from "../lib/analytics";

type Props = {
  bookingUrl?: string;
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
export function VideoIntro({ src, poster, captions, chapters, transcript, bookingUrl }: Props) {
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
          <video
            ref={ref} src={src} poster={poster || undefined} controls playsInline preload="none"
            onPlay={(e) => track("intro_video_played", { at: Math.round(e.currentTarget.currentTime) })}
            onEnded={() => track("intro_video_finished")}
          >
            {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
          </video>
        ) : (
          <div className="video-empty">
            <div className="play" aria-hidden="true" />
            <div className="file">NO SIGNAL</div>
            <div className="rec">intro tape still recording</div>
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
      {bookingUrl && <p><a className="btn" href={bookingUrl}>Let’s chat — book a 15-min call</a></p>}
      <details className="transcript" open={!hasVideo}>
        <summary>{hasVideo ? "Read the transcript" : "Transcript"}</summary>
        <div>{transcript.map((p, i) => {
          const closing = "Let's chat. You can find my booking link on this page.";
          return <p key={i}>{bookingUrl && p.endsWith(closing)
            ? <>{p.slice(0, -closing.length)}<a href={bookingUrl}>Let’s chat. Book a 15-min call.</a></>
            : p}</p>;
        })}</div>
      </details>
    </div>
  );
}
