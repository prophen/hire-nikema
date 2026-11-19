type Props = {
  now: { building: string; learning: string; writing: string };
  logistics: { k: string; v: string }[];
};

export function NowAndLogistics({ now, logistics }: Props) {
  return (
    <section className="grid-2" aria-label="Now and logistics">
      <div>
        <h2 className="section-title">now</h2>
        <dl className="panel kv">
          <dt>building</dt><dd>{now.building}</dd>
          <dt>learning</dt><dd>{now.learning}</dd>
          <dt>writing</dt><dd>{now.writing}</dd>
        </dl>
      </div>
      <div>
        <h2 className="section-title">logistics</h2>
        <dl className="panel kv">
          {logistics.map((l) => [<dt key={l.k + "k"}>{l.k}</dt>, <dd key={l.k + "v"}>{l.v}</dd>])}
        </dl>
      </div>
    </section>
  );
}
