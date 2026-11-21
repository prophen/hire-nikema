import type { Project } from "../data/profile";
import { ProjectCard } from "./ProjectCard";
import { Section } from "./Section";

type Props = { projects: Project[]; more?: { name: string; note: string }[]; bare?: boolean };

export function Projects({ projects, more = [], bare }: Props) {
  return (
    <Section id="projects" title="Projects" bare={bare}>
      <div className="grid-3">{projects.map((p) => <ProjectCard key={p.slug} project={p} />)}</div>
      {more.length > 0 && (
        <>
          <h3 className="card-title more-title">More in storage</h3>
          <ul className="more">
            {more.map((m) => <li key={m.name}><b>{m.name}</b> <span className="dim">· {m.note}</span></li>)}
          </ul>
        </>
      )}
    </Section>
  );
}
