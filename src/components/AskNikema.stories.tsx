import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { AskNikema } from "./AskNikema";
const meta = { component: AskNikema } satisfies Meta<typeof AskNikema>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NotConfigured: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Ask the guide" })).toBeDisabled();
    await userEvent.click(c.getByRole("button", { name: "Voice" }));
    await expect(c.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(c.getByRole("button", { name: "Talk to my AI guide" })).toBeDisabled();
    await userEvent.click(c.getByText("Sources & privacy"));
    await expect(c.getByRole("link", { name: "Résumé" })).toHaveAttribute("href", "/Nikema_Prophet_Resume.pdf");
  },
};
