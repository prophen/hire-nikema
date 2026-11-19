import { useState } from "react";
import { checkFit } from "../data/skills";
import { TerminalWindow } from "./TerminalWindow";

type Props = { initialText?: string };

/** Paste a job description; get a keyword match against Nikema's experience. Runs entirely in the browser. */
export function RoleFitChecker({ initialText = "" }: Props) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState(() => (initialText ? checkFit(initialText) : null));

  return (
    <section id="fit-check" aria-labelledby="checker-title">
      <h2 className="section-title" id="checker-title">does this role fit?</h2>
      <TerminalWindow title="fit-check — paste a job description">
        <form
          className="checker"
          onSubmit={(e) => { e.preventDefault(); setResult(checkFit(text)); }}
        >
          <label htmlFor="jd" className="sr-only">Job description</label>
          <textarea
            id="jd"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="> paste a job description here_"
          />
          <div className="row">
            <button className="btn" type="submit" disabled={!text.trim()}>run fit-check</button>
            <span className="dim mono" style={{ fontSize: 12 }}>keyword match · nothing leaves your browser</span>
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
                      <li key={m.label}><span style={{ color: "var(--yellow)" }}>[~] {m.label}</span> <span className="dim">· not on my résumé yet. Happy to talk about it.</span></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </form>
      </TerminalWindow>
    </section>
  );
}
