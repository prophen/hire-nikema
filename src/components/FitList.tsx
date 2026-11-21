import { Section } from "./Section";

type Props = { yes: string[]; no: string[]; bare?: boolean };

export function FitList({ yes, no, bare }: Props) {
  return (
    <Section id="fit" title="What I'm looking for" bare={bare}>
      <div className="grid-2 fit">
        <div className="panel yes">
          <h3>I'm a fit if…</h3>
          <ul>{yes.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="panel no">
          <h3>Probably not a fit if…</h3>
          <ul>{no.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}
