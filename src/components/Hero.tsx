import type { Profile } from "../data/profile";
import { TerminalWindow } from "./TerminalWindow";
import { VideoIntro } from "./VideoIntro";

type Props = {
  profile: Profile;
  /** Optional per-company line shown on /for/<company> pages. */
  companyNote?: { name: string; note: string; role?: string };
};

export function Hero({ profile, companyNote }: Props) {
  const contact = profile.bookingUrl || `mailto:${profile.email}`;
  const role = companyNote?.role ?? "devrel";

  return (
    <TerminalWindow>
      <div className="hero">
        <div>
          <div className="prompt">
            <span className="path">~/{profile.handle}</span> <span className="sym">$</span> hire {profile.handle}{" "}
            --role <span className="pink">{role}</span>
            {companyNote && <> --team <span className="pink">"{companyNote.name}"</span></>}
          </div>
          <h1>
            {profile.headline[0]}
            <br />
            <span className="l2">{profile.headline[1]}</span>
            <span className="cursor" aria-hidden="true" />
          </h1>
          {companyNote && <p className="note">// for {companyNote.name}: {companyNote.note}</p>}
          <p className="summary">{profile.summary}</p>
          <div className="status">
            // status: <b>{profile.status}</b> · {profile.location}
          </div>
          <div className="actions">
            <a className="btn" href={contact}>{profile.bookingUrl ? "book a 20-min chat →" : "say hi →"}</a>
            <a className="btn ghost" href="#fit-check">check my fit</a>
          </div>
          <nav className="socials" aria-label="Social links">
            {profile.socials.map((s) => <a key={s.href} href={s.href} rel="me noopener">{s.label}</a>)}
            <a href={profile.resumeUrl}>résumé.pdf</a>
            <a href="/nikema.md">nikema.md</a>
          </nav>
        </div>
        <VideoIntro {...profile.video} />
      </div>
    </TerminalWindow>
  );
}
