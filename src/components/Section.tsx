import type { ReactNode } from "react";

type Props = { id: string; title: string; bare?: boolean; children: ReactNode };

/**
 * A titled page section. `bare` drops the wrapper and heading, for use inside a game panel
 * that already has its own heading.
 */
export function Section({ id, title, bare, children }: Props) {
  if (bare) return <>{children}</>;
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <h2 className="section-title" id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}
