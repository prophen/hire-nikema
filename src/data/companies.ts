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
    // Files live in /public/twilio. Both the TV and the page use this instead of the general intro.
    video: {
      src: "/twilio/my-journey-with-twilio.mp4",
      poster: "/twilio/my-journey-with-twilio-poster.jpg",
      captions: "/twilio/my-journey-with-twilio.vtt",
      // Just before each sentence, and past the previous caption’s end so two captions never show at once.
      chapters: [
        { label: "Who I am", start: 0 },
        { label: "SIGNAL 2019", start: 10.54 },
        { label: "What I took away", start: 34.77 },
        { label: "Applying to Twilio", start: 51.84 },
        { label: "Building with Twilio again", start: 79.32 },
        { label: "Meet my AI guide", start: 108.4 },
      ],
      // Shown under the video. Keep it in sync with public/twilio/my-journey-with-twilio.vtt.
      transcript: [
        "Hi, my name is Nikema Prophet. I'm a software engineer and developer advocate, and I want to tell you how Twilio influenced my tech career.",
        "My first tech conference was SIGNAL in 2019, and I attended as a scholarship recipient. And it was at the event that happened before the conference for the scholarship recipients where I discovered that developer relations and community roles existed. And I knew immediately that this is what I wanted to do in my tech career.",
        "I walked away from SIGNAL with a Magic Leap, which was super cool, that I won during TwilioQuest, and also feeling like I had a place in tech and I belonged in tech. And it was a really positive experience.",
        "I applied for the software engineering apprenticeship. Unfortunately, I didn't make it past the coding screen, but I was still... I still felt really positive about Twilio as a company just because of the people who I met that were working there. Like, everyone was very welcoming and inclusive and were just really supportive of someone who was trying to break into tech.",
        "Fast forward to 2026, and I participated in CodeTV's Web Dev Challenge. Twilio was the sponsor, so it felt very nostalgic to be building with Twilio again. It brought me back to that TwilioQuest in 2019.",
        "Today I'm applying for the Developer Evangelist role, and I wanted to show you that I can build with Twilio. So I added an AI guide to this site where you can chat by text or by voice with my AI guide and ask it about my experience. So I hope that you will check it out. You can either click the red phone on the game, or you can just scroll down the page until you reach the AI guide.",
        "I hope you will check it out, and I am super excited to continue the conversation.",
      ],
    },
  },
  {
    slug: "example",
    name: "Example Co",
    role: "Developer Advocate",
    note: "Your SDK docs are already good. I'd like to help make the sample apps just as good.",
  },
];
