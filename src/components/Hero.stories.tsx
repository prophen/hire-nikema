import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { Hero } from "./Hero";

const meta = { component: Hero, args: { profile } } satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ForCompany: Story = {
  args: { companyNote: { name: "Example Co", role: "Developer Advocate", note: "Your SDK docs are great; I'd love to make the sample apps match." } },
};
export const WithBookingLink: Story = { args: { profile: { ...profile, bookingUrl: "https://cal.com/example" } } };
