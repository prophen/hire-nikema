import type { Profile } from "../data/profile";
import { Section } from "./Section";

export function Experience({ items }: { items: Profile["experience"] }) {
  return <Section id="experience" title="Experience">
    <div className="experience-list">{items.map((item) => <article className="panel" key={`${item.employer}-${item.role}`}>
      <h3>{item.employer} · {item.role}</h3>
      <p className="dim">{item.dates}</p>
      <p>{item.summary}</p>
    </article>)}</div>
  </Section>;
}
