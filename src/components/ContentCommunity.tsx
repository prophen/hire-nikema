import type { Credit, Link } from "../data/profile";
import { LinkRow } from "./LinkRow";
import { Section } from "./Section";

type Props = { content: (Link & { note: string })[]; community: Credit[]; bare?: boolean };

export function ContentCommunity({ content, community, bare }: Props) {
  return (
    <Section id="content" title="Content & community" bare={bare}>
      <div className="grid-2">
        <div className="panel">
          <h3 className="card-title">Published</h3>
          <ul className="plain">
            {content.map((c) => (
              <li key={c.label}>
                {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}{" "}
                <span className="dim">· {c.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="card-title">Community</h3>
          <ul className="plain trophies">
            {community.map((c) => (
              <li key={c.label}>
                {c.href ? <a href={c.href} rel="noopener">{c.label}</a> : c.label}
                <LinkRow links={c.links} label={`${c.label} links`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
