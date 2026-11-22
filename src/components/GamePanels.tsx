import type { Profile } from "../data/profile";
import type { PanelId } from "../game/room";
import { Contact } from "./Contact";
import { ContentCommunity } from "./ContentCommunity";
import { FitList } from "./FitList";
import { HowIWork } from "./HowIWork";
import { Now } from "./NowAndLogistics";
import { Projects } from "./Projects";
import { RoleFitChecker } from "./RoleFitChecker";
import { VideoIntro } from "./VideoIntro";

/** What each thing in the room opens. */
export function PanelContent({ id, profile: p }: { id: PanelId; profile: Profile }) {
  switch (id) {
    case "intro":
      return <VideoIntro {...p.video} bookingUrl={p.bookingUrl} />;
    case "projects":
      return <Projects projects={p.projects} more={p.moreProjects} bare />;
    case "content":
      return <ContentCommunity content={p.content} community={p.community} bare />;
    case "fit":
      return <FitList {...p.fit} bare />;
    case "how":
      return <HowIWork items={p.howIWork} bare />;
    case "now":
      return <Now now={p.now} />;
    case "fitcheck":
      return <RoleFitChecker bare />;
    case "contact":
      return <Contact profile={p} />;
  }
}
