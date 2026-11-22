import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import config from "../worker/cloudflare.config.ts";
import { loadKnowledge } from "../server/agent.ts";

mkdirSync("worker/generated", { recursive: true });
writeFileSync("worker/generated/knowledge.json", JSON.stringify(loadKnowledge()));
const bindings = config.worker.env;
await build({ entryPoints: ["worker/index.ts"], bundle: true, format: "esm", platform: "browser", external: ["cloudflare:workers"], outfile: "worker/generated/worker.js" });
const metadata = {
  main_module: "worker.js", compatibility_date: config.worker.compatibilityDate,
  bindings: Object.entries(bindings).map(([name, value]) => value.type === "durable-object"
    ? { type: "durable_object_namespace", name, class_name: value.exportName }
    : { type: "plain_text", name, text: value.value }),
  exports: config.worker.exports,
  keep_bindings: ["secret_text"],
  observability: { enabled: true, redact_query_string: true, traces: { enabled: true, head_sampling_rate: 0.1 } },
};
writeFileSync("worker/generated/metadata.json", JSON.stringify(metadata, null, 2));
console.log("Built Worker, knowledge, bindings, and upload metadata.");
