import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [cloudflareTest({
    main: "./worker/index.ts",
    miniflare: {
      compatibilityDate: "2026-11-19", compatibilityFlags: ["nodejs_compat"],
      bindings: { ALLOWED_ORIGINS: "https://hirenikema.app,http://localhost:4321", AGENT_PUBLIC_URL: "https://guide.example.test", OPENAI_API_KEY: "test-only", OPENAI_MODEL: "gpt-4.1-mini" },
      durableObjects: { BUDGET: { className: "DailyBudget", useSQLite: true }, SESSIONS: { className: "VoiceSession", useSQLite: true } },
    },
  })],
  test: { include: ["worker/*.test.ts"] },
});
