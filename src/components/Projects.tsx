import type { MoreProject, Project } from "../data/profile";
import { LinkRow } from "./LinkRow";
import { ProjectCard } from "./ProjectCard";
import { Section } from "./Section";

type Props = { projects: Project[]; more?: MoreProject[]; bare?: boolean };

export function Projects({ projects, more = [], bare }: Props) {
  return (
    <Section id="projects" title="Projects" bare={bare}>
      <div className="grid-3">{projects.map((p) => <ProjectCard key={p.slug} project={p} />)}</div>
      {more.length > 0 && (
        <>
          <h3 className="card-title more-title">More in storage</h3>
          <ul className="more">
            {more.map((m) => (
              <li key={m.name}>
                <b>{m.url ? <a href={m.url} rel="noopener">{m.name}</a> : m.name}</b> <span className="dim">· {m.note}</span>
                <LinkRow links={m.links} label={`${m.name} links`} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
