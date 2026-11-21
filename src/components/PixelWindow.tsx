import type { ReactNode } from "react";

type Props = { title?: string; children: ReactNode };

/** A text-box window with a title tab, shared by the role-fit checker and the static sections. */
export function PixelWindow({ title, children }: Props) {
  return (
    <div className="pxwin">
      {title && <div className="pxwin-title" aria-hidden="true">{title}</div>}
      <div className="pxwin-body">{children}</div>
    </div>
  );
}
