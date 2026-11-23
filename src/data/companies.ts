import twilioJobDescription from "./jobs/twilio.txt?raw";

// One entry per application. Each becomes /for/<slug> with a custom note in the hero.
// Example only; replace with real targets.
export type Company = {
  slug: string;
  name: string;
  locationNote?: string;
  note: string; // one or two sentences on why this team
  role?: string;
  jobDescription?: string;
  theme?: "twilio";
  agent?: boolean;
  headline?: string[];
  status?: string;
  summary?: string;
  video?: import("./profile").Profile["video"];
};

export const companies: Company[] = [
  {
    slug: "twilio",
    name: "Twilio",
    locationNote: "Based in Sacramento · Willing to relocate to the Bay Area for this role.",
    role: "Developer Evangelist",
    jobDescription: twilioJobDescription.trim(),
    theme: "twilio",
    status: "Ready to help developers build with Twilio + AI",
    agent: true,
    headline: ["Hello, Twilio.", "Let's build a conversation."],
    note: "The best way to explain an API is to build something people can try. Here's a little room for a conversation about my work.",
    summary: "I build AI-assisted apps in public and help developers understand how they work. Explore my projects, watch my intro, or ask my AI guide about my experience.",
    // Add video: { src, poster, captions, chapters, transcript } after recording.
    // Both the TV and the page will use it; until then, they share the general intro.
  },
  {
    slug: "example",
    name: "Example Co",
    role: "Developer Advocate",
    note: "Your SDK docs are already good. I'd like to help make the sample apps just as good.",
  },
];
