import { useId, useState } from "react";
import { checkFit } from "../data/skills";
import { PixelWindow } from "./PixelWindow";
import { Section } from "./Section";

type Props = { initialText?: string; bare?: boolean };

/** Paste a job description; get a keyword match against Nikema's experience. Runs entirely in the browser. */
export function RoleFitChecker({ initialText = "", bare }: Props) {
  const id = useId();
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState(() => (initialText ? checkFit(initialText) : null));

  return (
    <Section id="fit-check" title="Does this role fit?" bare={bare}>
      <PixelWindow title="FIT CHECK">
        <form
          className="checker"
          onSubmit={(e) => { e.preventDefault(); setResult(checkFit(text)); }}
        >
          <label htmlFor={id} className="sr-only">Job description</label>
          <textarea
            id={id}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a job description here…"
          />
          <div className="row">
            <button className="btn" type="submit" disabled={!text.trim()}>Run fit check</button>
            <span className="dim small">keyword match · nothing leaves your browser</span>
          </div>
          {result && (
            <div className="out" aria-live="polite">
              {result.hits.length + result.misses.length === 0 ? (
                <p className="dim">No DevRel signals found. Try pasting the full posting.</p>
              ) : (
                <>
                  <div><span className="score">{result.score}%</span> <span className="dim">of the skills this post asks for</span></div>
                  <div className="meter" aria-hidden="true"><i style={{ width: `${result.score}%` }} /></div>
                  <ul className="plain">
                    {result.hits.map((h) => (
                      <li key={h.label}><span className="green">[✓] {h.label}</span> <span className="dim">· {h.evidence}</span></li>
                    ))}
                    {result.misses.map((m) => (
                      <li key={m.label}><span style={{ color: "var(--gold)" }}>[~] {m.label}</span> <span className="dim">· not on my résumé yet. Happy to talk about it.</span></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </form>
      </PixelWindow>
    </Section>
  );
}
