import { useState } from "react";

type Props = { handle: string; contactUrl: string; contactLabel: string };

export function Footer({ handle, contactUrl, contactLabel }: Props) {
  const [sudo, setSudo] = useState(false);
  return (
    <footer className="footer">
      <div>
        <button type="button" className="egg" onClick={() => setSudo(true)}>$ sudo hire {handle}</button>
        {sudo && (
          <div className="egg-out" role="status">
            [sudo] permission granted. <a href={contactUrl}>Let's talk →</a>
          </div>
        )}
      </div>
      <a className="btn" href={contactUrl}>{contactLabel}</a>
    </footer>
  );
}
