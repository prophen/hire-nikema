import type { Preview } from "@storybook/react-vite";
import "../src/styles/global.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: "padded",
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};
export default preview;
