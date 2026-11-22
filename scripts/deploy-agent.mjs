// Run after npm run build:agent. Secrets are read from the environment, never arguments.
import { readFile } from "node:fs/promises";
const account = "160d5b77d6425b37173ade0c3db3023f";
const name = "hire-nikema-agent";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error("Set CLOUDFLARE_API_TOKEN privately, or deploy with the connected Cloudflare tool.");
const metadata = await readFile(new URL("../worker/generated/metadata.json", import.meta.url), "utf8");
const code = await readFile(new URL("../worker/generated/worker.js", import.meta.url));
const form = new FormData();
form.append("metadata", new Blob([metadata], { type: "application/json" }));
form.append("worker.js", new Blob([code], { type: "application/javascript+module" }), "worker.js");
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${name}`, {
  method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: form,
});
const result = await response.json();
if (!response.ok || !result.success) throw new Error(`Worker upload failed (${response.status}): ${JSON.stringify(result.errors)}`);
console.log(`Deployed https://${name}.nikema.workers.dev`);
