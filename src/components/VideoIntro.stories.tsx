import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { VideoIntro } from "./VideoIntro";

const meta = {
  component: VideoIntro,
  args: { ...profile.video },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
} satisfies Meta<typeof VideoIntro>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Before the intro is recorded: placeholder slot, transcript open, chapters disabled. */
export const NotRecordedYet: Story = {
  args: { src: "", poster: "", captions: "" },
};
/** After recording: real player, chapters seek. */
export const WithVideo: Story = {};
