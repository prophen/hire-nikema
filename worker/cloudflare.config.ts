import { bindings, defineConfig, exports } from "cf/config";

export default defineConfig({
  accountId: "160d5b77d6425b37173ade0c3db3023f",
  worker: {
    name: "hire-nikema-agent",
    entrypoint: "./index.ts",
    compatibilityDate: "2026-11-22",
    env: {
      ALLOWED_ORIGINS: bindings.text("https://hirenikema.app,http://localhost:4321,https://mac-mini.tail5366c3.ts.net:8443"),
      AGENT_PUBLIC_URL: bindings.text("https://hire-nikema-agent.nikema.workers.dev"),
      OPENAI_MODEL: bindings.text("gpt-4.1-mini"),
      BUDGET: bindings.durableObject({ worker: "hire-nikema-agent", exportName: "DailyBudget" }),
      SESSIONS: bindings.durableObject({ worker: "hire-nikema-agent", exportName: "VoiceSession" }),
    },
    exports: {
      DailyBudget: exports.durableObject({ storage: "sqlite" }),
      VoiceSession: exports.durableObject({ storage: "sqlite" }),
    },
    observability: { enabled: true, redactQueryString: true, traces: { enabled: true, headSamplingRate: 0.1 } },
  },
});
