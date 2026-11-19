import { useState } from "react";
import type { Profile } from "../data/profile";

export function Footer({ profile }: { profile: Profile }) {
  const [sudo, setSudo] = useState(false);
  const contact = profile.bookingUrl || `mailto:${profile.email}`;
  return (
    <footer className="footer">
      <div>
        <button type="button" className="egg" onClick={() => setSudo(true)}>$ sudo hire {profile.handle}</button>
        {sudo && (
          <div className="egg-out" role="status">
            [sudo] permission granted. <a href={contact}>Let's talk →</a>
          </div>
        )}
      </div>
      <a className="btn" href={contact}>{profile.bookingUrl ? "book a 20-min chat →" : "say hi →"}</a>
    </footer>
  );
}
