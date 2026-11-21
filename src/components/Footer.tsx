import { useState } from "react";

type Props = { handle: string; contactUrl: string; contactLabel: string };

export function Footer({ handle, contactUrl, contactLabel }: Props) {
  const [joined, setJoined] = useState(false);
  return (
    <footer className="footer">
      <div>
        <button type="button" className="egg" onClick={() => setJoined(true)}>CONTINUE? ▶ YES</button>
        {joined && (
          <div className="egg-out" role="status">
            {handle.toUpperCase()} joined your team! <a href={contactUrl}>Let's talk</a>
          </div>
        )}
      </div>
      <a className="btn" href={contactUrl}>{contactLabel}</a>
    </footer>
  );
}
