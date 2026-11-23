// All page copy lives here so it can be edited without touching components.
// Lines marked DRAFT were written from the résumé and need Nikema's review.

export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  url: string;
  tagline: string;
  badge?: string;
  badgeUrl?: string;
  stack: string[];
  hard?: string; // what was hard (leave out if nothing was)
  learned: string; // what I learned / would do differently
  links?: Link[];
};

export type MoreProject = { name: string; note: string; url?: string; links?: Link[] };
export type Credit = { label: string; href?: string; links?: Link[] };

export type Chapter = { label: string; start: number }; // start in seconds

export type Testimonial = { quote: string; name: string; role: string };

export const profile = {
  name: "Nikema Prophet",
  handle: "nikema",
  role: "Developer Advocate",
  headline: ["Developer advocate.", "Demo builder."],
  summary:
    "I build AI-assisted apps in public, then show developers how they work: the implementation, the debugging, and the trade-offs.",
  proof: "Former PayPal Developer Advocate and engineer on developer.paypal.com. Winner, Best Use of ElevenLabs, Hacktoberfest 2026.",
  mobileProof: "Ex-PayPal DevRel · Best Use of ElevenLabs winner",
  experience: [
    { employer: "PayPal", role: "Software Engineer", dates: "Sep 2023 – Apr 2025", summary: "Built the Developer Program experience on developer.paypal.com and maintained onboarding and documentation apps." },
    { employer: "PayPal", role: "Developer Advocate", dates: "Apr 2022 – Sep 2023", summary: "Created API onboarding materials, integration guides, and tutorials; brought developer feedback to product and engineering." },
    { employer: "Armory", role: "Community Marketing Manager", dates: "Aug 2020 – Oct 2021", summary: "Produced developer content and educational series for DevOps and continuous-delivery audiences." },
  ],
  status: "open to DevRel & developer advocate roles",
  location: "Sacramento, CA",

  // Colors for the pixel-art player in the hero room. Change these to look like you.
  avatar: { skin: "#a8683c", hair: "#2a1a14", shirt: "#d0405a", pants: "#3a4a8a" },

  bookingUrl: "https://cal.boardy.ai/2239bee288d5", // falls back to email when empty
  // Public recruiting contact, also used when no booking URL is configured.
  email: "nikema+jobs@mail.grokbot.com",
  resumeUrl: "/Nikema_Prophet_Resume.pdf", // lives in /public

  socials: [
    { label: "GitHub", href: "https://github.com/prophen" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nikemaprophet" },
    { label: "Portfolio", href: "https://portfolio.nikema.dev" },
  ] satisfies Link[],

  video: {
    // All three files live in /public. Captions match the transcript below.
    src: "/intro.mp4",
    poster: "/intro-poster.jpg",
    captions: "/intro.vtt",
    chapters: [
      { label: "Who I am", start: 0 },
      { label: "What I'm building", start: 17 },
      { label: "What I'm looking for", start: 60 },
      { label: "Why your team", start: 66 },
    ] satisfies Chapter[],
    // Shown under the video. Keep it in sync with public/intro.vtt.
    transcript: [
      "Hi, I'm Nikema Prophet. I'm a developer advocate who builds things. I was a developer advocate at PayPal, then an engineer on developer.paypal.com. Before that, I ran community content at Armory and co-led contributor experience for Spinnaker.",
      "Right now I'm building Impossible Hires. It's an opt-in talent network for people whose work doesn't fit one job title: the people who build the demo, write the docs and notice where users get stuck. I've built it in public, one piece at a time. First the interest forms, then private profile sharing, where nobody's profile goes to an employer until that person approves the exact version being sent. Then a fictional demo that anyone can try, including an MCP server so AI agents can search it too.",
      "The biggest lesson so far: when I couldn't explain consent-based introductions with copy, an interactive demo with made-up profiles did it for me. I'm showing what's working and being honest about what isn't done yet.",
      "I'm looking for a developer advocate role at a company that builds developer tools, APIs or AI tooling.",
      "If you want an advocate who ships real demos, writes clear and accessible docs, and brings what developers say back to the product team, let's talk. I'd prefer remote. I'm based in Sacramento, and I'd move to the Bay Area for the right role. Let's chat. You can find my booking link on this page.",
    ],
  },

  // DRAFT
  fit: {
    yes: [
      "You want an advocate who ships real demos, not just slides",
      "Your docs, onboarding, or sample apps need someone who can write and code",
      "You build developer tools, APIs, or AI tooling",
      "You value accessibility and clear, honest technical writing",
      "You want someone who shows up for the developer and builder community, in person and online",
    ],
    no: [
      "AI tooling is off-limits on your team",
      "You need a pure sales engineer",
    ],
  },

  // DRAFT
  howIWork: [
    {
      title: "Build it, then explain it",
      body: "Every demo ships with a write-up covering how it works and where it fell over.",
    },
    {
      title: "Show the debugging",
      body: "The bug is usually the most useful part of a tutorial. I keep it in.",
    },
    {
      title: "Bring developer feedback back to the team",
      body: "At PayPal I audited docs for integration friction and took what developers needed to product and engineering.",
    },
    {
      title: "Accessible by default",
      body: "Semantic HTML, keyboard paths, and captions are part of done.",
    },
  ],

  projects: [
    {
      slug: "impossible-hires",
      name: "Impossible Hires",
      url: "https://impossiblehires.tech",
      tagline: "Work beyond the job title. An opt-in talent network for technical creatives.",
      badge: "in development",
      links: [{ label: "Try the fictional demo", href: "https://impossiblehires.tech/demo" }],
      stack: ["React", "TypeScript", "Cloudflare Workers", "Neon Postgres", "Playwright"],
      hard: "Explaining consent-based introductions before there were any real users to show.",
      learned:
        "An interactive demo with made-up profiles explains the product better than any copy I wrote.",
    },
    {
      slug: "talk-to-the-book",
      name: "Talk to the Book",
      url: "https://talktothebook.tech",
      tagline: "Dictate a memory, get a draft chapter, hear it read back.",
      badge: "🏆 Best Use of ElevenLabs · Hacktoberfest 2026",
      badgeUrl: "https://dev.to/devteam/congrats-to-the-hacktoberfest-open-source-ai-challenge-week-3-slow-and-steady-winners-3e4a",
      stack: ["Next.js", "TypeScript", "ElevenLabs", "Gemma", "Ollama"],
      hard: "The local model kept returning malformed JSON that broke the drafting step.",
      learned:
        "Treat model output like user input. I tuned the inference settings and added a forgiving parser so malformed JSON couldn't break the drafting step.",
      links: [
        { label: "Code", href: "https://github.com/prophen/talk-to-the-book" },
        { label: "Video demo", href: "https://www.youtube.com/watch?v=SUf2oJdjbjY" },
        { label: "Write-up", href: "https://dev.to/nikema/talk-to-the-book-dictating-the-book-i-owe-57-people-406p" },
      ],
    },
    {
      slug: "dot-md",
      name: "dot-md",
      url: "https://dotmd.page",
      tagline: "A person.md file, at a URL that's yours.",
      stack: ["Markdown", "Agents"],
      hard: "Designing one profile format readable by both people and AI agents.",
      learned: "How to treat AI agents as users and design features with them in mind.",
    },

    {
      slug: "fact-card-workflow",
      name: "Fact Card Workflow",
      stack: ["AI SDK", "Sanity", "Exa"],
      hard: "Keeping AI claim checking separate from human approval to publish.",
      learned: "Added rejection, revision, and review history before publication to Sanity.",
      tagline: "AI fact cards checked against their sources, with human review",
      url: "https://fact-card-workflow.nikema.dev/",
      links: [
        { label: "Code", href: "https://github.com/prophen/fact-card-workflow" },
        { label: "Walkthrough", href: "https://portfolio.nikema.dev/videos#fact-card-approval-gate" },
        { label: "Write-up", href: "https://dev.to/nikema/california-black-stories-an-ai-fact-card-workflow-with-a-human-approval-gate-1e8p" },
      ],
    },
    {
      slug: "ask-california-black-stories",
      name: "Ask California Black Stories",
      stack: ["Next.js", "AI SDK", "Sanity Context MCP"],
      hard: "Preventing general-knowledge fallback and fabricated citation URLs.",
      learned: "Tightened answer boundaries and supplied real source URLs, documenting the verification limits.",
      tagline: "Q&A agent over a 150-story archive that answers with source links",
      url: "https://californiablackstories.com/",
      links: [
        { label: "Code", href: "https://github.com/prophen/california-black-stories" },
        { label: "Walkthrough", href: "https://portfolio.nikema.dev/videos#ask-california-black-stories" },
        { label: "Write-up", href: "https://dev.to/nikema/ask-the-archive-a-qa-agent-grounded-in-150-stories-of-black-california-history-533c" },
      ],
    },
    {
      slug: "motionbrief",
      name: "MotionBrief",
      stack: ["Cloudflare Workers", "OpenAI", "fal", "ElevenLabs", "Shotstack"],
      hard: "Getting consistent video output and preserving editable work across reloads.",
      learned: "Used deterministic camera moves and documented resumable jobs, durable storage, and render preflight checks.",
      tagline: "Turns a campaign brief into a short video on Cloudflare Workers",
      url: "https://motion-brief.app.space/",
      links: [
        { label: "Code", href: "https://github.com/prophen/motion-brief" },
        { label: "Walkthrough", href: "https://portfolio.nikema.dev/videos#motionbrief" },
        { label: "Case study", href: "https://work.nikema.dev/case-studies/motionbrief" },
      ],
    },
  ] satisfies Project[],

  moreProjects: [] as MoreProject[],

  content: [
    { label: "PayPal Donate SDK tutorial", note: "guide + 3 demo implementations", href: "https://developer.paypal.com/community/blog/how-to-add-donations-to-your-website-with-paypals-donate-sdk/" },
    { label: "Talk to the Book technical write-up", note: "debugging malformed model JSON", href: "https://dev.to/nikema/talk-to-the-book-dictating-the-book-i-owe-57-people-406p" },
    { label: "Video demos", note: "walkthroughs of every project", href: "https://portfolio.nikema.dev/videos" },
  ] satisfies (Link & { note: string })[],

  community: [
    { label: "CDF Spinnaker Most Valuable Contributor (2021)" },
    { label: "AWS Community Builder (2021)" },
    { label: "Spinnaker Contributor Experience co-lead (Aug 2020 – Dec 2021)" },
    { label: "Rebuilt the Spinnaker community website in Hugo (2021)", href: "https://spinnaker.io/", links: [{ label: "Source", href: "https://github.com/spinnaker/spinnaker.io" }] },
    { label: "Women Who Code at Sacramento City College, Vice-President (Sep – Oct 2026)" },
  ] satisfies Credit[] as Credit[],

  // DRAFT
  now: {
    building: "impossible hires",
    learning: "MCP servers and agent-friendly docs",
    writing: "technical write-ups for each AI project",
  },

  logistics: [
    { k: "remote", v: "preferred" },
    { k: "hybrid / on-site", v: "Sacramento" },
    { k: "relocation", v: "Bay Area, for the right role" },
    { k: "location", v: "Sacramento, CA" },
  ],

  testimonials: [] as Testimonial[],
};

export type Profile = typeof profile;
