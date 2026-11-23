import type { Profile } from "../data/profile";
import { GameConsole } from "./GameConsole";

type Props = {
  profile: Profile;
  /** Optional per-company line shown on /for/<company> pages. */
  companyNote?: { locationNote?: string; name: string; note: string; role?: string; agent?: boolean; jobDescription?: string };
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
        <p className="hero-kicker desktop-only">
          <span className="status-dot" aria-hidden="true" /> {profile.status}
        </p>
        <h1>
          {profile.name}
          <span className="l2">{profile.headline.join(" ")}</span>
        </h1>
        <p className="proof mobile-only">{profile.mobileProof}</p>
        {companyNote?.locationNote && <p className="hero-location">{companyNote.locationNote}</p>}
        {companyNote && (
          <p className="note">
            <b>For {companyNote.name}:</b> {companyNote.note}
          </p>
        )}
      </div>
      <div className="hero-copy">
        <div className="hero-cta actions">
          <a className="btn" href={contact}>{profile.bookingUrl ? "Book a 15-min chat" : "Say hi"}</a>
          <a className="btn ghost desktop-only" href="#profile">See the work ↓</a>
        </div>
        <div className="hero-rest">
          <p className="summary">{profile.summary}</p>
          <p className="proof desktop-only">{profile.proof}</p>
          <p className="quest">
            Explore my room to see my work. The TV has my intro, the PC has my projects, and the cat checks job posts. {(!companyNote || companyNote.agent) && "The red phone opens my AI guide."}
          </p>
          <nav className="socials" aria-label="Social links">
            {profile.socials.map((s) => <a key={s.href} href={s.href} rel="me noopener">{s.label}</a>)}
            <a href={profile.resumeUrl}>Résumé</a>
            {profile.email && <a href={`mailto:${profile.email}`}>Email me</a>}
            <a href="/nikema.md">nikema.md</a>
          </nav>
        </div>
      </div>
      <div className="hero-game">
        <GameConsole profile={profile} company={companyNote} classic={classic} frozen={frozen} />
        {(!companyNote || companyNote.agent) && <div className="voice-proof">
          <strong>Built with Twilio Voice</strong>
          <p>The red phone opens my AI guide. Choose Call to talk in your browser: Twilio Voice and ConversationRelay connect you to answers grounded in my résumé and projects.</p>
          <a href="https://github.com/prophen/hire-nikema/blob/main/docs/twilio-page.md">How it works & source code ↗</a>
        </div>}
      </div>
    </header>
  );
}
