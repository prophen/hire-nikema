// Keyword map for the role-fit checker. `evidence` is what the checker cites back.
// Terms match whole words (plurals included). End a term with * to match it as a word prefix,
// e.g. "evangelis*" matches "evangelist" and "evangelism".
export type Skill = { label: string; terms: string[]; evidence: string };

export const skills: Skill[] = [
  { label: "developer advocacy", terms: ["developer advocate", "developer relations", "devrel", "advocacy", "evangelis*"], evidence: "Developer Advocate at PayPal (2022–2023)" },
  { label: "docs & tutorials", terms: ["documentation", "docs", "tutorial", "technical writ*", "guide"], evidence: "PayPal Donate SDK guide with three demo implementations" },
  { label: "sample apps & demos", terms: ["sample app", "demo", "example app", "prototype", "quickstart"], evidence: "Ships a live demo and write-up for every project" },
  { label: "video content", terms: ["video", "livestream*", "stream*", "youtube", "screencast"], evidence: "Video demos and walkthroughs for each AI project" },
  { label: "community", terms: ["community", "open source", "open-source", "contributor", "meetup", "discord", "event", "hackathon"], evidence: "Spinnaker Contributor Experience co-lead; CDF Most Valuable Contributor; Women Who Code at Sacramento City College, Vice-President" },
  { label: "developer feedback loop", terms: ["feedback", "product team", "friction", "developer experience", "dx"], evidence: "Audited PayPal docs and brought integration friction to product and engineering" },
  { label: "API onboarding", terms: ["api", "sdk", "onboarding", "integration"], evidence: "Created API onboarding materials at PayPal" },
  { label: "AI / LLM apps", terms: ["ai", "llm", "machine learning", "genai", "agent", "mcp", "rag"], evidence: "Talk to the Book, Fact Card Workflow, Ask California Black Stories" },
  { label: "JavaScript / TypeScript", terms: ["javascript", "typescript", "node", "react", "next.js", "nextjs", "remix"], evidence: "React and TypeScript in production at PayPal" },
  { label: "edge / serverless", terms: ["cloudflare", "workers", "serverless", "edge", "vercel"], evidence: "impossible hires and MotionBrief run on Cloudflare Workers" },
  { label: "testing", terms: ["testing", "playwright", "cypress", "jest", "ci/cd"], evidence: "Jest and Cypress at PayPal; Playwright on impossible hires" },
  { label: "content marketing", terms: ["blog", "newsletter", "content strategy", "editorial", "marketing"], evidence: "Community Marketing Manager at Armory" },
  { label: "accessibility", terms: ["accessib*", "a11y", "wcag"], evidence: "Built an accessible public site for impossible hires" },
];

// Things a job post might ask for that the résumé doesn't show. Listed honestly as gaps.
export const gaps: { label: string; terms: string[] }[] = [
  { label: "Go", terms: ["golang"] },
  { label: "Rust", terms: ["rust"] },
  { label: "Java / Kotlin", terms: ["java", "kotlin"] },
  { label: "Kubernetes", terms: ["kubernetes", "k8s"] },
  { label: "mobile (iOS / Android)", terms: ["ios", "android", "swift"] },
  { label: ".NET / C#", terms: [".net", "c#"] },
  { label: "conference keynotes", terms: ["keynote", "conference speak"] },
  { label: "public speaking", terms: ["public speaking"] },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "rust" matches "Rust," but not "trust"; "api" matches "APIs" but not "rapid". */
function termPattern(term: string): RegExp {
  const prefix = term.endsWith("*");
  const body = escape(prefix ? term.slice(0, -1) : term);
  // Only require a word boundary next to a letter or digit, so ".net" still matches "ASP.NET".
  const start = /^[a-z0-9]/.test(term) ? "(?<![a-z0-9])" : "";
  const end = prefix || !/[a-z0-9]$/.test(term) ? "" : "(?:s|es)?(?![a-z0-9])";
  return new RegExp(`${start}${body}${end}`);
}

const matches = (text: string, terms: string[]) => terms.some((term) => termPattern(term).test(text));

export function checkFit(text: string) {
  const t = text.toLowerCase();
  const hits = skills.filter((s) => matches(t, s.terms));
  // This qualification offers alternatives; writing and organizing are documented.
  // Remove only that clause before checking gaps, preserving separate talk requirements.
  const alternatives = /public speaking,\s*writing,\s*(?:and\/or|or)\s*organizing(?: engaging)? programs/g;
  const gapText = t.replace(alternatives, "");
  if (gapText !== t) hits.push({
    label: "writing & program organizing",
    terms: [],
    evidence: "PayPal tutorials, project videos, and Spinnaker Contributor Experience co-lead; evidence for the writing/organizing alternatives, not conference keynotes",
  });
  const misses = gaps.filter((g) => matches(gapText, g.terms));
  const total = hits.length + misses.length;
  const score = total === 0 ? 0 : Math.round((hits.length / total) * 100);
  return { hits, misses, score };
}
