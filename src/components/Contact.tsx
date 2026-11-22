import type { Profile } from "../data/profile";
import { Logistics } from "./NowAndLogistics";

/** Booking link, socials, and logistics: what the door mat opens. */
export function Contact({ profile }: { profile: Profile }) {
  const contact = profile.bookingUrl || `mailto:${profile.email}`;
  return (
    <div className="contact">
      <p style={{ marginTop: 0 }}>
        {profile.status}. The fastest way to reach me is a short call.
      </p>
      <div className="actions">
        <a className="btn" href={contact}>{profile.bookingUrl ? "Book a 15-min chat" : "Say hi"}</a>
      </div>
      <nav className="socials" aria-label="Links">
        {profile.socials.map((s) => <a key={s.href} href={s.href} rel="me noopener">{s.label}</a>)}
        <a href={profile.resumeUrl}>Résumé (PDF)</a>
        {profile.email && <a href={`mailto:${profile.email}`}>Email me</a>}
        <a href="/nikema.md">nikema.md</a>
      </nav>
      <h3 className="card-title">Logistics</h3>
      <Logistics logistics={profile.logistics} />
    </div>
  );
}
