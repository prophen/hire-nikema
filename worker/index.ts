import { DurableObject } from "cloudflare:workers";
import { answer, validMessages, type Message } from "../server/agent-core";
import knowledge from "./generated/knowledge.json";
import { validSignature, voiceToken, escapeXml } from "./twilio";
import type { Env } from "./env";

function budget(env: Env) { return env.BUDGET.getByName(new Date().toISOString().slice(0, 10)); }
function voiceReady(env: Env) {
  return Boolean(env.OPENAI_API_KEY && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_API_KEY && env.TWILIO_API_SECRET && env.TWILIO_TWIML_APP_SID);
}
async function limitedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder(); let result = "", size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 30000) { await reader.cancel(); throw new Error("Body too large"); }
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally { reader.releaseLock(); }
}

// Cloudflare supplies this header at ingress. Never trust Origin, cookies, or
// X-Forwarded-For as a visitor identity. Missing IPs share a restricted bucket.
async function visitorBudget(request: Request, env: Env) {
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day}:${ip}`));
  const key = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return env.BUDGET.getByName(`visitor:${day}:${key}`);
}

/** Separate named objects hold global daily quotas and each visitor's daily quotas. */
export class DailyBudget extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS counts (kind TEXT PRIMARY KEY, n INTEGER NOT NULL)");
  }
  async spendVisitor(kind: "chat" | "tokens") {
    const limits = { chat: { minute: 6, day: 20 }, tokens: { minute: 1, day: 3 } }[kind];
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS visitor_counts (kind TEXT PRIMARY KEY, total INTEGER NOT NULL, minute INTEGER NOT NULL, recent INTEGER NOT NULL)");
    // A single conditional write keeps both limits atomic under concurrent requests.
    const rows = this.ctx.storage.sql.exec<{ total: number }>(
      `INSERT INTO visitor_counts (kind,total,minute,recent) VALUES (?,1,?,1)
       ON CONFLICT(kind) DO UPDATE SET total=total+1, minute=excluded.minute,
         recent=CASE WHEN minute=excluded.minute THEN recent+1 ELSE 1 END
       WHERE total < ? AND (minute != excluded.minute OR recent < ?) RETURNING total`,
      kind, minute, limits.day, limits.minute).toArray();
    if (!await this.ctx.storage.getAlarm()) await this.ctx.storage.setAlarm(now + 172800000);
    if (rows.length) return { allowed: true, retryAfter: 0 };
    const { total } = this.ctx.storage.sql.exec<{ total: number }>("SELECT total FROM visitor_counts WHERE kind=?", kind).one();
    const reset = total >= limits.day ? (Math.floor(now / 86400000) + 1) * 86400000 : (minute + 1) * 60000;
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)) };
  }
  async spend(kind: "answers" | "calls" | "tokens") {
    const limit = { answers: 200, calls: 20, tokens: 100 }[kind];
    const rows = this.ctx.storage.sql.exec<{ n: number }>(
      "INSERT INTO counts (kind,n) VALUES (?,1) ON CONFLICT(kind) DO UPDATE SET n=n+1 WHERE n < ? RETURNING n", kind, limit).toArray();
    if (!await this.ctx.storage.getAlarm()) await this.ctx.storage.setAlarm(Date.now() + 172800000);
    return rows.length > 0;
  }
  async alarm() { await this.ctx.storage.deleteAll(); }
}

type SessionState = { callSid?: string; expires: number; claimed: boolean; connected: boolean; history: Message[]; partial: string };
export class VoiceSession extends DurableObject<Env> {
  private generation = 0;
  private pending?: AbortController;
  private read(): SessionState | undefined { this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY,value TEXT NOT NULL)"); return this.ctx.storage.sql.exec<{ value: string }>("SELECT value FROM state WHERE id=1").toArray().map((r) => JSON.parse(r.value))[0]; }
  private save(state: SessionState) { this.ctx.storage.sql.exec("INSERT OR REPLACE INTO state (id,value) VALUES (1,?)", JSON.stringify(state)); }
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY,value TEXT NOT NULL)");
  }
  async issue() {
    if (this.read()) return false;
    this.save({ expires: Date.now() + 60000, claimed: false, connected: false, history: [], partial: "" });
    await this.ctx.storage.setAlarm(Date.now() + 60000);
    return true;
  }
  async claim(callSid?: string) {
    const state = this.read();
    if (!state || state.claimed || state.expires < Date.now()) return false;
    state.callSid = callSid; state.claimed = true; state.expires = Date.now() + 180000; this.save(state);
    await this.ctx.storage.setAlarm(state.expires);
    return true;
  }
  async fetch(request: Request) {
    const state = this.read();
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return new Response("WebSocket required", { status: 426 });
    if (!state || !state.claimed || state.connected || state.expires < Date.now()) return new Response("Expired session", { status: 403 });
    state.connected = true; this.save(state);
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    let turn = this.generation;
    try {
      if (typeof raw !== "string" || raw.length > 16000) { ws.close(1009, "Message too large"); return; }
      const state = this.read();
      if (!state || state.expires < Date.now()) { ws.close(1000, "Demo ended"); return; }
      const event = JSON.parse(raw);
      if (event.type === "error") { console.error(JSON.stringify({ event: "relay_error", code: event.code })); return; }
      if (event.type === "setup") {
        console.log(JSON.stringify({ event: "voice_setup" }));
        if (!state.callSid || event.callSid !== state.callSid) { ws.close(1008, "Invalid call"); return; }
        const cap = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Calls/${state.callSid}.json`, {
          method: "POST", headers: { Authorization: `Basic ${btoa(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: "TimeLimit=180", signal: AbortSignal.timeout(10000),
        });
        if (!cap.ok) { console.error(JSON.stringify({ event: "call_limit_failed", status: cap.status })); ws.close(1011, "Call limit unavailable"); }
        await cap.body?.cancel();
        return;
      }
      if (event.type === "interrupt") {
        this.generation++; this.pending?.abort();
        if (state.history.at(-1)?.role === "assistant") state.history.pop();
        if (typeof event.utteranceUntilInterrupt === "string" && event.utteranceUntilInterrupt) state.history.push({ role: "assistant", content: event.utteranceUntilInterrupt.slice(0, 2000) });
        this.save(state); return;
      }
      if (event.type !== "prompt" || typeof event.voicePrompt !== "string") return;
      state.partial += event.voicePrompt;
      if (state.partial.length > 2000) { ws.close(1009, "Question too long"); return; }
      this.save(state);
      if (!event.last || !state.partial.trim()) return;
      console.log(JSON.stringify({ event: "voice_prompt_received" }));
      const text = state.partial.trim(); state.partial = "";
      state.history.push({ role: "user", content: text }); state.history = state.history.slice(-12); this.save(state);
      this.pending?.abort(); turn = ++this.generation;
      const controller = new AbortController(); this.pending = controller;
      if (!await budget(this.env).spend("answers")) { ws.close(1000, "Daily demo limit reached"); return; }
      if (turn !== this.generation) return;
      const response = await answer(state.history, knowledge, controller.signal, true, this.env);
      if (turn !== this.generation || ws.readyState !== WebSocket.OPEN || state.expires < Date.now()) return;
      state.history.push({ role: "assistant", content: response }); this.save(state);
      ws.send(JSON.stringify({ type: "text", token: response, last: true }));
      console.log(JSON.stringify({ event: "voice_answer_sent" }));
    } catch (error) {
      console.error(JSON.stringify({ event: "voice_answer_failed", error: error instanceof Error ? error.name : "unknown" }));
      if (turn === this.generation && ws.readyState === WebSocket.OPEN && !this.pending?.signal.aborted)
        ws.send(JSON.stringify({ type: "text", token: "Sorry, I couldn't answer. Please try again or explore Nikema's profile.", last: true }));
    }
  }
  async webSocketClose(ws: WebSocket, code = 1000) {
    console.log(JSON.stringify({ event: "voice_closed", code }));
    this.generation++; this.pending?.abort();
    // CLOSING can mean we received a close frame and still owe the peer a reply.
    ws.close();
    await this.ctx.storage.deleteAll();
  }
  async webSocketError(ws: WebSocket) { await this.webSocketClose(ws); }
  async alarm() { this.generation++; this.pending?.abort(); for (const ws of this.ctx.getWebSockets()) ws.close(1000, "Demo ended"); await this.ctx.storage.deleteAll(); }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGINS.split(",").includes(origin);
    const headers: Record<string, string> = { "Cache-Control": "no-store", Vary: "Origin" };
    if (allowed) headers["Access-Control-Allow-Origin"] = origin;
    const json = (status: number, data: unknown) => Response.json(data, { status, headers });
    const limitVisitor = async (kind: "chat" | "tokens") => {
      const result = await (await visitorBudget(request, env)).spendVisitor(kind);
      if (result.allowed) return null;
      return Response.json({ error: "Visitor demo limit reached. Please try again later." }, {
        status: 429, headers: { ...headers, "Retry-After": String(result.retryAfter) },
      });
    };
    try {
      if (url.pathname === "/health" && request.method === "GET") return json(200, { chat: Boolean(env.OPENAI_API_KEY), voice: voiceReady(env) });
      const relayId = url.pathname.match(/^\/relay\/(visitor-[a-f0-9-]{36})$/)?.[1];
      if (relayId) {
        const signature = request.headers.get("X-Twilio-Signature") || "";
        const handshakeUrl = `${env.AGENT_PUBLIC_URL}${url.pathname}`;
        if (!voiceReady(env) || !(await validSignature(env.TWILIO_AUTH_TOKEN!, signature, handshakeUrl.replace(/^https:/, "wss:"))
          || await validSignature(env.TWILIO_AUTH_TOKEN!, signature, handshakeUrl))) return json(403, { error: "Invalid signature" });
        return env.SESSIONS.getByName(relayId).fetch(request);
      }
      if (url.pathname === "/voice" && request.method === "POST") {
        if (!voiceReady(env)) return json(503, { error: "Voice unavailable" });
        const params = Object.fromEntries(new URLSearchParams(await limitedBody(request)));
        if (!await validSignature(env.TWILIO_AUTH_TOKEN!, request.headers.get("X-Twilio-Signature") || "", `${env.AGENT_PUBLIC_URL}/voice`, params)) return json(403, { error: "Invalid signature" });
        const identity = params.From?.replace(/^client:/, "");
        if (!/^visitor-[a-f0-9-]{36}$/.test(identity || "") || !/^CA[a-f0-9]{32}$/i.test(params.CallSid || "")) return json(403, { error: "Invalid call" });
        const session = env.SESSIONS.getByName(identity);
        let xml = "<Response><Hangup/></Response>";
        if (await session.claim(params.CallSid) && await budget(env).spend("calls")) {
          const relay = escapeXml(`${env.AGENT_PUBLIC_URL.replace(/^https:/, "wss:")}/relay/${identity}`);
          xml = `<Response><Connect><ConversationRelay url="${relay}" welcomeGreeting="Hi! I'm Nikema's AI portfolio guide, not Nikema. Ask about her projects or experience. This demo lasts up to three minutes."/></Connect><Hangup/></Response>`;
        }
        return new Response(xml, { headers: { ...headers, "Content-Type": "text/xml" } });
      }
      if (!allowed) return json(403, { error: "Origin not allowed" });
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
      if (url.pathname === "/chat" && request.method === "POST") {
        if (!env.OPENAI_API_KEY) return json(503, { error: "Guide unavailable" });
        let data;
        try { data = JSON.parse(await limitedBody(request)); } catch { return json(400, { error: "Invalid JSON" }); }
        if (!validMessages(data?.messages)) return json(400, { error: "Invalid messages" });
        const limited = await limitVisitor("chat");
        if (limited) return limited;
        if (!await budget(env).spend("answers")) return json(429, { error: "Daily limit reached" });
        return json(200, { answer: await answer(data.messages, knowledge, request.signal, false, env) });
      }
      if (url.pathname === "/voice/token" && request.method === "POST") {
        if (!voiceReady(env)) return json(503, { error: "Voice unavailable" });
        const limited = await limitVisitor("tokens");
        if (limited) return limited;
        if (!await budget(env).spend("tokens")) return json(429, { error: "Daily limit reached" });
        const identity = `visitor-${crypto.randomUUID()}`;
        await env.SESSIONS.getByName(identity).issue();
        const token = await voiceToken(env.TWILIO_ACCOUNT_SID!, env.TWILIO_API_KEY!, env.TWILIO_API_SECRET!, env.TWILIO_TWIML_APP_SID!, identity);
        return json(200, { token });
      }
      return json(404, { error: "Not found" });
    } catch (error) {
      console.error(JSON.stringify({ event: "agent_request_failed", route: url.pathname.startsWith("/relay/") ? "/relay" : url.pathname, error: error instanceof Error ? error.name : "unknown" }));
      return json(503, { error: "Guide temporarily unavailable" });
    }
  },
} satisfies ExportedHandler<Env>;
