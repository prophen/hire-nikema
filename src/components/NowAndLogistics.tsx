type NowData = { building: string; learning: string; writing: string };
type LogisticsData = { k: string; v: string }[];

export function Now({ now }: { now: NowData }) {
  return (
    <dl className="panel kv">
      <dt>building</dt><dd>{now.building}</dd>
      <dt>learning</dt><dd>{now.learning}</dd>
      <dt>writing</dt><dd>{now.writing}</dd>
    </dl>
  );
}

export function Logistics({ logistics }: { logistics: LogisticsData }) {
  return (
    <dl className="panel kv">
      {logistics.map((l) => [<dt key={l.k + "k"}>{l.k}</dt>, <dd key={l.k + "v"}>{l.v}</dd>])}
    </dl>
  );
}

export function NowAndLogistics({ now, logistics }: { now: NowData; logistics: LogisticsData }) {
  return (
    <section className="grid-2" aria-label="Now and logistics">
      <div>
        <h2 className="section-title">Now</h2>
        <Now now={now} />
      </div>
      <div>
        <h2 className="section-title">Logistics</h2>
        <Logistics logistics={logistics} />
      </div>
    </section>
  );
}
