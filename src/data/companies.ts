// One entry per application. Each becomes /for/<slug> with a custom note in the hero.
// Example only; replace with real targets.
export type Company = {
  slug: string;
  name: string;
  note: string; // one or two sentences on why this team
  role?: string;
};

export const companies: Company[] = [
  {
    slug: "example",
    name: "Example Co",
    role: "Developer Advocate",
    note: "Your SDK docs are already good. I'd like to help make the sample apps just as good.",
  },
];
