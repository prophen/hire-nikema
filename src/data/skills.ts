// Keyword map for the role-fit checker. `evidence` is what the checker cites back.
export type Skill = { label: string; terms: string[]; evidence: string };

export const skills: Skill[] = [
  { label: "developer advocacy", terms: ["developer advocate", "developer relations", "devrel", "advocacy", "evangelis"], evidence: "Developer Advocate at PayPal (2022–2023)" },
  { label: "docs & tutorials", terms: ["documentation", "docs", "tutorial", "technical writ", "guide"], evidence: "PayPal Donate SDK guide with three demo implementations" },
  { label: "sample apps & demos", terms: ["sample app", "demo", "example app", "prototype", "quickstart"], evidence: "Ships a live demo and write-up for every project" },
  { label: "video content", terms: ["video", "livestream", "stream", "youtube", "screencast"], evidence: "Video demos and walkthroughs for each AI project" },
  { label: "community", terms: ["community", "open source", "open-source", "contributor", "meetup", "discord", " event ", " events", "hackathon", "in-person", "in person"], evidence: "Spinnaker Contributor Experience co-lead; CDF Most Valuable Contributor; Women Who Code weekly sessions" },
  { label: "developer feedback loop", terms: ["feedback", "product team", "friction", "developer experience", "dx"], evidence: "Audited PayPal docs and brought integration friction to product and engineering" },
  { label: "API onboarding", terms: ["api", "sdk", "onboarding", "integration"], evidence: "Created API onboarding materials at PayPal" },
  { label: "AI / LLM apps", terms: ["ai", "llm", "machine learning", "genai", "agent", "mcp", "rag"], evidence: "Talk to the Book, Fact Card Workflow, Ask California Black Stories" },
  { label: "JavaScript / TypeScript", terms: ["javascript", "typescript", "node", "react", "next.js", "nextjs", "remix"], evidence: "React and TypeScript in production at PayPal" },
  { label: "edge / serverless", terms: ["cloudflare", "workers", "serverless", "edge", "vercel"], evidence: "impossible hires and MotionBrief run on Cloudflare Workers" },
  { label: "testing", terms: ["testing", "playwright", "cypress", "jest", "ci/cd"], evidence: "Jest and Cypress at PayPal; Playwright on impossible hires" },
  { label: "content marketing", terms: ["blog", "newsletter", "content strategy", "editorial", "marketing"], evidence: "Community Marketing Manager at Armory" },
  { label: "accessibility", terms: ["accessib", "a11y", "wcag"], evidence: "Built an accessible public site for impossible hires" },
];

// Things a job post might ask for that the résumé doesn't show. Listed honestly as gaps.
export const gaps: { label: string; terms: string[] }[] = [
  { label: "Go", terms: ["golang"] },
  { label: "Rust", terms: ["rust"] },
  { label: "Java / Kotlin", terms: ["java ", "java,", "kotlin"] },
  { label: "Kubernetes", terms: ["kubernetes", "k8s"] },
  { label: "mobile (iOS / Android)", terms: ["ios", "android", "swift"] },
  { label: ".NET / C#", terms: [".net", "c#"] },
  { label: "conference keynotes", terms: ["keynote", "conference speak", "public speaking"] },
];

export function checkFit(text: string) {
  const t = ` ${text.toLowerCase()} `;
  const hits = skills.filter((s) => s.terms.some((term) => t.includes(term)));
  const misses = gaps.filter((g) => g.terms.some((term) => t.includes(term)));
  const total = hits.length + misses.length;
  const score = total === 0 ? 0 : Math.round((hits.length / total) * 100);
  return { hits, misses, score };
}
