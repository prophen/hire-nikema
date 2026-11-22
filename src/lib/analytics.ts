import posthog from "posthog-js";

/**
 * PostHog analytics. `initAnalytics` runs once from the layout; components call `track`.
 * With no token (Storybook, tests, local dev without .env) nothing loads and `track` does nothing.
 */
export function initAnalytics() {
  const token = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST;
  if (!token || !host || posthog.__loaded) return;

  posthog.init(token, {
    api_host: host,
    defaults: "2026-08-30",
    // No cookies or local storage, so no consent banner is needed.
    cookieless_mode: "always",
  });

  // Per-company pages: tag every event from /for/<slug> with the company.
  const company = location.pathname.match(/^\/for\/([^/]+)/)?.[1];
  if (company) {
    posthog.register({ company });
    track("company_page_viewed", { company });
  }

  // One listener covers every résumé, email, social, and project link on the page.
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.("a[href]");
    if (!(a instanceof HTMLAnchorElement)) return;
    const kind = linkKind(a);
    if (kind) track("link_clicked", { kind, href: a.href, text: a.textContent?.trim() });
  }, { capture: true });
}

function linkKind(a: HTMLAnchorElement): string | null {
  if (a.protocol === "mailto:") return "email";
  if (a.pathname.endsWith(".pdf")) return "resume";
  if (a.pathname === "/nikema.md") return "nikema_md";
  if (a.origin === location.origin) return null;
  if (a.rel.split(" ").includes("me")) return "social";
  return "external";
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (posthog.__loaded) posthog.capture(event, properties);
}
