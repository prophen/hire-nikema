import type { Project } from "../data/profile";
import { ProjectCard } from "./ProjectCard";

type Props = { projects: Project[]; more?: { name: string; note: string }[] };

export function Projects({ projects, more = [] }: Props) {
  return (
    <section aria-labelledby="projects-title">
      <h2 className="section-title" id="projects-title">ls ./projects</h2>
      <div className="grid-3">{projects.map((p) => <ProjectCard key={p.slug} project={p} />)}</div>
      {more.length > 0 && (
        <ul className="more">
          {more.map((m) => <li key={m.name}><b>{m.name}</b> <span className="dim">· {m.note}</span></li>)}
        </ul>
      )}
    </section>
  );
}
