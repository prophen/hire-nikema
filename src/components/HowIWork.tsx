import { Section } from "./Section";

type Props = { items: { title: string; body: string }[]; bare?: boolean };

export function HowIWork({ items, bare }: Props) {
  return (
    <Section id="how" title="How I work" bare={bare}>
      <div className="grid-2">
        {items.map((i) => (
          <div className="panel" key={i.title}>
            <h3 className="card-title">{i.title}</h3>
            <p style={{ margin: 0 }}>{i.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
