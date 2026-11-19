type Props = { items: { title: string; body: string }[] };

export function HowIWork({ items }: Props) {
  return (
    <section aria-labelledby="how-title">
      <h2 className="section-title" id="how-title">how I work</h2>
      <div className="grid-2">
        {items.map((i) => (
          <div className="panel" key={i.title}>
            <p className="card-title">{i.title}</p>
            <p style={{ margin: 0 }}>{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
