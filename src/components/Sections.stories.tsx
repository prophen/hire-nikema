import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { HowIWork } from "./HowIWork";
import { ContentCommunity } from "./ContentCommunity";
import { NowAndLogistics } from "./NowAndLogistics";
import { Testimonials } from "./Testimonials";
import { Footer } from "./Footer";

const meta = { title: "Sections" } satisfies Meta;
export default meta;
type Story = StoryObj;

export const HowIWorkSection: Story = { render: () => <HowIWork items={profile.howIWork} /> };
export const ContentAndCommunity: Story = { render: () => <ContentCommunity content={profile.content} community={profile.community} /> };
export const NowLogistics: Story = { render: () => <NowAndLogistics now={profile.now} logistics={profile.logistics} /> };
export const TestimonialsFilled: Story = {
  render: () => <Testimonials items={[{ quote: "Placeholder quote, to be replaced with a real one.", name: "Teammate Name", role: "Role, Company" }]} />,
};
export const FooterWithEasterEgg: Story = { render: () => <Footer handle={profile.handle} contactUrl={profile.bookingUrl} contactLabel="book a 20-min chat →" /> };
