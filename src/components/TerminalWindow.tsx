import type { ReactNode } from "react";

type Props = { title?: string; children: ReactNode };

/** Window chrome shared by the hero and the role-fit checker. */
export function TerminalWindow({ title = "~/nikema — zsh", children }: Props) {
  return (
    <div className="term">
      <div className="term-bar" aria-hidden="true">
        <i /><i /><i />
        <span>{title}</span>
      </div>
      <div className="term-body">{children}</div>
    </div>
  );
}
