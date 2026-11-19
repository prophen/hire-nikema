import type { Testimonial } from "../data/profile";

/** Renders nothing until there are quotes to show. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="quotes-title">
      <h2 className="section-title" id="quotes-title">what teammates say</h2>
      <div className="grid-3">
        {items.map((t) => (
          <figure className="panel" key={t.name} style={{ margin: 0 }}>
            <blockquote style={{ margin: 0 }}>“{t.quote}”</blockquote>
            <figcaption className="dim mono" style={{ fontSize: 13, marginTop: 10 }}>— {t.name}, {t.role}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
