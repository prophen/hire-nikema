import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-mcp",
    "@storybook/addon-vitest"
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  // Serve /public so stories can load the intro video, poster and captions.
  staticDirs: ["../public"],
};
export default config;
