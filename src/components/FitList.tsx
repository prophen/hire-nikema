type Props = { yes: string[]; no: string[] };

export function FitList({ yes, no }: Props) {
  return (
    <section aria-labelledby="fit-title">
      <h2 className="section-title" id="fit-title">what I'm looking for</h2>
      <div className="grid-2 fit">
        <div className="panel yes">
          <h3>I'm a fit if…</h3>
          <ul>{yes.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="panel no">
          <h3>probably not a fit if…</h3>
          <ul>{no.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
