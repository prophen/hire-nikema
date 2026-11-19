import type { Link } from "../data/profile";

type Props = { content: (Link & { note: string })[]; community: string[] };

export function ContentCommunity({ content, community }: Props) {
  return (
    <section aria-labelledby="content-title">
      <h2 className="section-title" id="content-title">content &amp; community</h2>
      <div className="grid-2">
        <div className="panel">
          <p className="card-title">published</p>
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
          <p className="card-title">community</p>
          <ul className="plain">{community.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
