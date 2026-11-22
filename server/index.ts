import { createServer, type IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import { answer, loadKnowledge, validMessages, type Message } from "./agent.ts";

const env = process.env;
const origin = env.SITE_ORIGIN || "http://localhost:4321";
const publicUrl = (env.AGENT_PUBLIC_URL || "").replace(/\/$/, "");
const chatReady = Boolean(env.OPENAI_API_KEY);
const voiceReady = chatReady && publicUrl.startsWith("https://") && ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_API_KEY", "TWILIO_API_SECRET", "TWILIO_TWIML_APP_SID"].every((k) => Boolean(env[k]));
const knowledge = loadKnowledge();
const identities = new Map<string, number>();
const relays = new Map<string, number>();
const budgetPath = resolve(env.AGENT_BUDGET_FILE || ".agent-state/budget.json");
mkdirSync(dirname(budgetPath), { recursive: true });
let budget = { day: "", answers: 0, calls: 0 };
try { budget = JSON.parse(readFileSync(budgetPath, "utf8")); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
function spend(kind: "answers" | "calls") {
  const day = new Date().toISOString().slice(0, 10);
  if (budget.day !== day) budget = { day, answers: 0, calls: 0 };
  const limit = kind === "answers" ? 200 : 20;
  if (budget[kind] >= limit) return false;
  budget[kind]++;
  writeFileSync(`${budgetPath}.tmp`, JSON.stringify(budget), { mode: 0o600 });
  renameSync(`${budgetPath}.tmp`, budgetPath);
  return true;
}
async function body(req: IncomingMessage) {
  let result = "";
  for await (const chunk of req) { result += chunk; if (Buffer.byteLength(result) > 30000) throw new Error("Body too large"); }
  return result;
}
const api = voiceReady ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN) : null;
const server = createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const json = (code: number, data: unknown) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
  const path = new URL(req.url || "/", "http://localhost").pathname;
  try {
    if (path === "/voice" && req.method === "POST") {
      if (!voiceReady) return json(503, { error: "Voice unavailable" });
      const params = Object.fromEntries(new URLSearchParams(await body(req)));
      if (!twilio.validateRequest(env.TWILIO_AUTH_TOKEN!, String(req.headers["x-twilio-signature"] || ""), `${publicUrl}/voice`, params)) return json(403, { error: "Invalid signature" });
      const identity = (params.From || "").replace(/^client:/, "");
      const expires = identities.get(identity);
      identities.delete(identity);
      const response = new twilio.twiml.VoiceResponse();
      if (!expires || expires < Date.now() || !spend("calls")) response.hangup();
      else {
        // Enforce the ceiling at Twilio even if this process stops during a call.
        await api!.calls(params.CallSid).update({ timeLimit: 180 });
        const relayId = randomUUID();
        for (const [key, expires] of relays) if (expires < Date.now()) relays.delete(key);
        relays.set(relayId, Date.now() + 60000);
        response.connect().conversationRelay({
          url: `${publicUrl.replace(/^https:/, "wss:")}/relay/${relayId}`,
          welcomeGreeting: "Hi! I'm Nikema's AI portfolio guide, not Nikema. Ask me about her projects or experience. This demo call lasts up to three minutes.",
        });
        response.hangup();
      }
      res.writeHead(200, { "Content-Type": "text/xml" }); return res.end(response.toString());
    }
    if (req.headers.origin !== origin) return json(403, { error: "Origin not allowed" });
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.writeHead(204); return res.end();
    }
    if (path === "/health" && req.method === "GET") return json(200, { chat: chatReady, voice: voiceReady });
    if (path === "/chat" && req.method === "POST") {
      if (!chatReady) return json(503, { error: "Guide unavailable" });
      let payload;
      try { payload = JSON.parse(await body(req)); } catch { return json(400, { error: "Invalid JSON" }); }
      const messages = payload?.messages;
      if (!validMessages(messages)) return json(400, { error: "Invalid messages" });
      if (!spend("answers")) return json(429, { error: "Daily limit reached" });
      const controller = new AbortController();
      res.on("close", () => controller.abort());
      return json(200, { answer: await answer(messages, knowledge, controller.signal) });
    }
    if (path === "/voice/token" && req.method === "POST") {
      if (!voiceReady) return json(503, { error: "Voice unavailable" });
      for (const [key, expires] of identities) if (expires < Date.now()) identities.delete(key);
      if (identities.size >= 50) return json(429, { error: "Please try later" });
      const identity = `visitor-${randomUUID()}`;
      identities.set(identity, Date.now() + 60000);
      const token = new twilio.jwt.AccessToken(env.TWILIO_ACCOUNT_SID!, env.TWILIO_API_KEY!, env.TWILIO_API_SECRET!, { identity, ttl: 60 });
      token.addGrant(new twilio.jwt.AccessToken.VoiceGrant({ outgoingApplicationSid: env.TWILIO_TWIML_APP_SID!, incomingAllow: false }));
      return json(200, { token: token.toJwt() });
    }
    json(404, { error: "Not found" });
  } catch { if (!res.headersSent) json(503, { error: "Guide temporarily unavailable" }); else res.end(); }
});
server.requestTimeout = 30000;
const sockets = new WebSocketServer({ noServer: true, maxPayload: 16000 });
server.on("upgrade", (req, socket, head) => {
  const id = req.url?.match(/^\/relay\/([a-f0-9-]+)$/)?.[1];
  const expires = id && relays.get(id);
  for (const [key, deadline] of relays) if (deadline < Date.now()) relays.delete(key);
  if (!voiceReady || !id || !expires || expires < Date.now()
    || !twilio.validateRequest(env.TWILIO_AUTH_TOKEN!, String(req.headers["x-twilio-signature"] || ""), `${publicUrl}${req.url}`, {})) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); socket.destroy(); return;
  }
  relays.delete(id);
  sockets.handleUpgrade(req, socket, head, (ws) => sockets.emit("connection", ws));
});
sockets.on("connection", (ws) => {
  let history: Message[] = [];
  let pending: AbortController | undefined;
  let generation = 0;
  let partial = "";
  const timer = setTimeout(() => ws.close(), 180000);
  ws.on("close", () => { clearTimeout(timer); pending?.abort(); });
  ws.on("error", () => { pending?.abort(); ws.close(); });
  ws.on("message", async (raw) => {
    let turn = generation;
    try {
      const event = JSON.parse(raw.toString());
      if (event.type === "interrupt") {
        generation++; pending?.abort();
        if (history.at(-1)?.role === "assistant") history.pop();
        if (typeof event.utteranceUntilInterrupt === "string" && event.utteranceUntilInterrupt) history.push({ role: "assistant", content: event.utteranceUntilInterrupt.slice(0, 2000) });
        return;
      }
      if (event.type !== "prompt" || typeof event.voicePrompt !== "string") return;
      partial += event.voicePrompt;
      if (partial.length > 2000) { ws.close(); return; }
      if (!event.last) return;
      const prompt = partial.trim(); partial = "";
      if (!prompt) return;
      pending?.abort(); const current = ++generation; turn = current;
      if (!spend("answers")) { ws.close(); return; }
      history.push({ role: "user", content: prompt }); history = history.slice(-12);
      pending = new AbortController();
      const text = await answer(history, knowledge, pending.signal, true);
      if (current !== generation || ws.readyState !== ws.OPEN) return;
      history.push({ role: "assistant", content: text });
      ws.send(JSON.stringify({ type: "text", token: text, last: true }));
    } catch {
      if (turn === generation && ws.readyState === ws.OPEN && !pending?.signal.aborted) ws.send(JSON.stringify({ type: "text", token: "Sorry, I couldn't answer that. Please try again or explore Nikema's profile on the page.", last: true }));
    }
  });
});
server.listen(Number(env.PORT || 3001), () => console.log("Nikema guide service listening"));
