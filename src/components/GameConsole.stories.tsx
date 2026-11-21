import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { profile } from "../data/profile";
import { GameConsole } from "./GameConsole";

const meta = { component: GameConsole, args: { profile } } satisfies Meta<typeof GameConsole>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ClassicPalette: Story = { args: { classic: true } };
export const ForCompany: Story = {
  args: { company: { name: "Example Co", note: "Your SDK docs are great; I'd love to make the sample apps match." } },
};

/** START opens the shortcut menu; with reduced motion off, picking an item walks over and inspects it. */
export const OpensMenu: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /B: back/ }));
    await userEvent.click(c.getByRole("button", { name: /Start: shortcut menu/ }));
    await expect(await c.findByRole("menu", { name: "Shortcut menu" })).toBeInTheDocument();
    await expect(c.getByRole("menuitem", { name: /PROJECTS/ })).toBeInTheDocument();
  },
};
