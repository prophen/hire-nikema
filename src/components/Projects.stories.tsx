import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { Projects } from "./Projects";

const meta = { component: Projects, args: { projects: profile.projects, more: profile.moreProjects } } satisfies Meta<typeof Projects>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
