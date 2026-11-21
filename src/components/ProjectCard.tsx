import type { Project } from "../data/profile";

export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className="panel project">
      <h3><a href={p.url} rel="noopener">{p.name}</a></h3>
      {p.badge && <div className="badge">{p.badge}</div>}
      <p className="tagline">{p.tagline}</p>
      <dl>
        <div><dt>What was hard</dt><dd>{p.hard}</dd></div>
        <div><dt>What I learned</dt><dd>{p.learned}</dd></div>
      </dl>
      <ul className="stack" aria-label="Stack">{p.stack.map((s) => <li className="chip" key={s}>{s}</li>)}</ul>
    </article>
  );
}
