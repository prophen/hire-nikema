import type { Profile } from "../data/profile";
import { GameConsole } from "./GameConsole";

type Props = {
  profile: Profile;
  /** Optional per-company line shown on /for/<company> pages. */
  companyNote?: { name: string; note: string; role?: string; agent?: boolean; jobDescription?: string };
  /** Start the room in the four-shade green palette. */
  classic?: boolean;
  /** Hold the room still, for visual tests. */
  frozen?: boolean;
};

export function Hero({ profile, companyNote, classic, frozen }: Props) {
  const contact = profile.bookingUrl || `mailto:${profile.email}`;

  return (
    <header className="hero">
      <div className="hero-top">
        <p className="hero-kicker">
          <span className="status-dot" aria-hidden="true" /> {profile.status}
        </p>
        <h1>
          {profile.name}
          <span className="l2">{profile.headline.join(" ")}</span>
        </h1>
        {companyNote && (
          <p className="note">
            <b>For {companyNote.name}:</b> {companyNote.note}
          </p>
        )}
      </div>
      <div className="hero-rest">
        <p className="summary">{profile.summary}</p>
        <p className="proof">{profile.proof}</p>
        <p className="quest">
          Explore my room to see my work. The TV has my intro, the PC has my projects, and the cat checks job posts. {(!companyNote || companyNote.agent) && "The red phone opens my AI guide."}
        </p>
        <div className="actions">
          <a className="btn" href={contact}>{profile.bookingUrl ? "Book a 15-min chat" : "Say hi"}</a>
          <a className="btn ghost" href="#profile">See the work ↓</a>
        </div>
        <nav className="socials" aria-label="Social links">
          {profile.socials.map((s) => <a key={s.href} href={s.href} rel="me noopener">{s.label}</a>)}
          <a href={profile.resumeUrl}>Résumé</a>
          {profile.email && <a href={`mailto:${profile.email}`}>Email me</a>}
          <a href="/nikema.md">nikema.md</a>
        </nav>
      </div>
      <div className="hero-game">
        <GameConsole profile={profile} company={companyNote} classic={classic} frozen={frozen} />
      </div>
    </header>
  );
}
