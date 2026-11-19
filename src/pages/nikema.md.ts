// /nikema.md: agent-readable profile in the dot-md person.md format, generated from the same data as the page.
import type { APIRoute } from "astro";
import { profile as p } from "../data/profile";

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? "";
  const md = `# ${p.name}

${p.role}. ${p.summary}

## Status
- ${p.status}
${p.logistics.map((l) => `- ${l.k}: ${l.v}`).join("\n")}

## Looking for
${p.fit.yes.map((x) => `- ${x}`).join("\n")}

## Not a fit
${p.fit.no.map((x) => `- ${x}`).join("\n")}

## Projects
${p.projects.map((x) => `- [${x.name}](${x.url}): ${x.tagline}${x.badge ? ` (${x.badge})` : ""}`).join("\n")}
${p.moreProjects.map((x) => `- ${x.name}: ${x.note}`).join("\n")}

## How I work
${p.howIWork.map((x) => `- **${x.title}.** ${x.body}`).join("\n")}

## Community
${p.community.map((x) => `- ${x}`).join("\n")}

## Contact
- Email: ${p.email}
${p.bookingUrl ? `- Book a call: ${p.bookingUrl}\n` : ""}${p.socials.map((s) => `- ${s.label}: ${s.href}`).join("\n")}
- Web: ${base}/
`;
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
