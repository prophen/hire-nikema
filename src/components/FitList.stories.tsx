import type { Meta, StoryObj } from "@storybook/react-vite";
import { profile } from "../data/profile";
import { FitList } from "./FitList";

const meta = { component: FitList, args: profile.fit } satisfies Meta<typeof FitList>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
