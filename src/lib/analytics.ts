import type { PostHog } from "posthog-js";

let posthog: PostHog | undefined;
let scheduled = false;

/**
 * PostHog analytics. `initAnalytics` runs once from the layout; components call `track`.
 * With no token (Storybook, tests, local dev without .env) nothing loads and `track` does nothing.
 */
export function initAnalytics() {
  const token = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST;
  if (!token || !host || scheduled) return;
  scheduled = true;

  const load = async () => {
    try {
      const { default: client } = await import("posthog-js");
      posthog = client;
      client.init(token, {
        api_host: host,
        defaults: "2026-08-30",
        cookieless_mode: "always",
      });
      const company = location.pathname.match(/^\/for\/([^/]+)/)?.[1];
      if (company) {
        client.register({ company });
        track("company_page_viewed", { company });
      }
    } catch {
      // Analytics must never prevent the page from working.
    }
  };
  const defer = () => {
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => { void load(); }, { timeout: 3000 });
      } else {
        void load();
      }
    }, 2000);
  };
  if (document.readyState === "complete") defer();
  else window.addEventListener("load", defer, { once: true });

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
  if (posthog?.__loaded) posthog.capture(event, properties);
}
