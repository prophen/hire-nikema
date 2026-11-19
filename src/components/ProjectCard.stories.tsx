import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { ProjectCard } from "./ProjectCard";

const [impossible, book, dotmd] = profile.projects;
const meta = {
  component: ProjectCard,
  decorators: [(Story) => <div style={{ maxWidth: 340 }}><Story /></div>],
} satisfies Meta<typeof ProjectCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InDevelopment: Story = { args: { project: impossible } };
export const AwardWinner: Story = { args: { project: book } };
export const NoBadge: Story = { args: { project: dotmd } };
