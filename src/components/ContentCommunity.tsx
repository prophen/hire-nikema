import type { Link } from "../data/profile";
import { Section } from "./Section";

type Props = { content: (Link & { note: string })[]; community: string[]; bare?: boolean };

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
          <ul className="plain trophies">{community.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}
