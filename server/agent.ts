import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { profile } from "../src/data/profile.ts";

import { answer as modelAnswer } from "./agent-core.ts";
import type { Message } from "./agent-core.ts";
export { validMessages, type Message } from "./agent-core.ts";

export function loadKnowledge() {
  const resume = JSON.parse(readFileSync(new URL("./resume.json", import.meta.url), "utf8"));
  const pdf = readFileSync(new URL("../public/Nikema_Prophet_Resume.pdf", import.meta.url));
  if (createHash("sha256").update(pdf).digest("hex") !== resume.sha256) throw new Error("Refresh server/resume.json after changing the résumé.");
  const markdown = readFileSync(new URL("../dist/nikema.md", import.meta.url), "utf8");
  return `PUBLIC PROFILE (/nikema.md):\n${markdown}\nRESUME (/Nikema_Prophet_Resume.pdf):\n${resume.text}\nPROJECT DETAILS:\n${JSON.stringify(profile.projects)}\nINTRO TRANSCRIPT:\n${profile.video.transcript.join("\n")}`;
}

export function answer(messages: Message[], knowledge: string, signal: AbortSignal, voice = false) {
  return modelAnswer(messages, knowledge, signal, voice, process.env);
}
