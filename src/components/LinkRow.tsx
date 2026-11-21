import type { Link } from "../data/profile";

/** A short row of labeled links, like "Code · Video demo · Write-up". */
export function LinkRow({ links, label }: { links?: Link[]; label: string }) {
  if (!links?.length) return null;
  return (
    <ul className="link-row" aria-label={label}>
      {links.map((l) => <li key={l.href}><a href={l.href} rel="noopener">{l.label}</a></li>)}
    </ul>
  );
}
