import type { Project } from "../data/profile";

export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className="panel project">
      <div className="project-head">
        <h3><a href={p.url} rel="noopener">{p.name}</a></h3>
      </div>
      {p.badge && <div className="badge">{p.badge}</div>}
      <p className="tagline">{p.tagline}</p>
      <dl>
        <div><dt>// what was hard</dt><dd>{p.hard}</dd></div>
        <div><dt>// what I learned</dt><dd>{p.learned}</dd></div>
      </dl>
      <div className="stack">{p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
    </article>
  );
}
