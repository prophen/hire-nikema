import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RoleFitChecker } from "./RoleFitChecker";

const meta = { component: RoleFitChecker } satisfies Meta<typeof RoleFitChecker>;
export default meta;
type Story = StoryObj<typeof meta>;

const JD =
  "We're hiring a Developer Advocate to write tutorials and docs, build sample apps in TypeScript, grow our open source community, and give conference keynotes. Kubernetes experience a plus.";

export const Empty: Story = {};

export const StrongMatch: Story = { args: { initialText: JD } };

/** Interaction test: pasting a JD and running the check shows matches and gaps. */
export const RunsCheck: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText("Job description"), JD);
    await userEvent.click(c.getByRole("button", { name: /run fit-check/i }));
    await expect(await c.findByText("[✓] developer advocacy")).toBeInTheDocument();
    await expect(c.getByText("[~] Kubernetes")).toBeInTheDocument();
  },
};
