import { useEffect, useId, useRef, useState } from "react";
import type { Device } from "@twilio/voice-sdk";

type Message = { role: "user" | "assistant"; content: string };
const endpoint = (import.meta.env.PUBLIC_AGENT_URL ?? "").replace(/\/$/, "");
const suggestions = ["What has Nikema built with AI?", "Tell me about her developer advocacy experience.", "Which project should I explore first?"];

export function AskNikema() {
  const inputId = useId();
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState({ chat: false, voice: false });
  const [checking, setChecking] = useState(Boolean(endpoint));
  const [callNotice, setCallNotice] = useState("");
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected">("idle");
  const device = useRef<Device | null>(null);
  const callTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callGeneration = useRef(0);
  const pending = useRef(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    if (endpoint) fetch(`${endpoint}/health`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((r) => setReady({ chat: r.chat === true, voice: r.voice === true }))
      .catch(() => {})
      .finally(() => setChecking(false));
    return () => { controller.abort(); if (callTimeout.current) clearTimeout(callTimeout.current); request.current?.abort(); callGeneration.current++; device.current?.destroy(); };
  }, []);

  async function ask(text: string) {
    const content = text.trim();
    if (!content || pending.current || !ready.chat) return;
    pending.current = true;
    setBusy(true); setError(""); setQuestion("");
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch(`${endpoint}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
      });
      if (!response.ok) throw new Error(response.status === 429 ? "The guide is taking a break. Please try again later." : "The guide couldn't answer right now. Please try again.");
      const result = await response.json();
      if (typeof result.answer !== "string") throw new Error("The guide returned an incomplete answer. Please try again.");
      setMessages([...next, { role: "assistant", content: result.answer }]);
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Please try again.");
        setMessages(messages); setQuestion(content);
      }
    } finally { pending.current = false; setBusy(false); }
  }

  function hangUp() {
    if (callTimeout.current) clearTimeout(callTimeout.current);
    callTimeout.current = null;
    callGeneration.current++;
    const previous = device.current; device.current = null;
    previous?.destroy(); setCallState("idle");
  }

  async function call() {
    if (callState !== "idle" || device.current) return;
    const generation = ++callGeneration.current;
    setError(""); setCallNotice(""); setCallState("connecting");
    callTimeout.current = setTimeout(() => {
      if (generation === callGeneration.current) {
        hangUp(); setError("The call took too long to connect. Please try again or use typed chat.");
      }
    }, 30000);
    try {
      const [sdk, response] = await Promise.all([
        import("@twilio/voice-sdk"),
        fetch(`${endpoint}/voice/token`, { method: "POST", signal: AbortSignal.timeout(15000) }),
      ]);
      if (!response.ok) throw new Error("Voice is unavailable right now. Please try typed chat.");
      const { token } = await response.json();
      if (generation !== callGeneration.current) return;
      const d = new sdk.Device(token);
      device.current = d;
      d.on("error", (error) => { if (generation === callGeneration.current) { hangUp(); setError(`The call couldn't connect (code ${error.code}). Check microphone permission or try typed chat.`); } });
      const activeCall = await d.connect();
      if (generation !== callGeneration.current) { d.destroy(); return; }
      activeCall.on("accept", () => { if (generation === callGeneration.current) { if (callTimeout.current) clearTimeout(callTimeout.current); setCallState("connected"); } });
      activeCall.on("disconnect", () => { if (generation === callGeneration.current) { hangUp(); setCallNotice("The call ended. You can start a new call or continue with typed chat."); } });
      activeCall.on("cancel", () => { if (generation === callGeneration.current) { hangUp(); setCallNotice("The call was canceled. You can try again."); } });
      activeCall.on("error", (error) => { if (generation === callGeneration.current) { hangUp(); setError(`The call ended unexpectedly (code ${error.code}). You can try again.`); } });
    } catch (e) {
      if (generation === callGeneration.current) { hangUp(); setError(e instanceof Error ? e.message : "The call couldn't connect."); }
    }
  }

  const remainingSuggestions = suggestions.filter((text) => !messages.some((message) =>
    message.role === "user" && message.content.trim().toLowerCase() === text.toLowerCase()));

  return <div className="panel ask-nikema">
    <p className="agent-eyebrow">ASK NIKEMA’S AI GUIDE</p>
    <p className="agent-intro">Ask about my work, projects, and experience.</p>
    <div className="agent-modes" role="group" aria-label="Choose how to talk">
      <button type="button" aria-pressed={mode === "chat"} aria-controls={`${inputId}-chat`} disabled={callState !== "idle"} onClick={() => { setMode("chat"); setError(""); }}>Chat</button>
      <button type="button" aria-pressed={mode === "voice"} aria-controls={`${inputId}-voice`} onClick={() => { setMode("voice"); setError(""); }}>Voice</button>
    </div>
    <section className="agent-chat" id={`${inputId}-chat`} hidden={mode !== "chat"} aria-label="Chat with the guide">
    {remainingSuggestions.length > 0 && <ul className="agent-suggestions" aria-label="Suggested questions">
      {remainingSuggestions.map((text) => <li key={text}><span aria-hidden="true">▸</span><button type="button" disabled={!ready.chat || busy} onClick={() => void ask(text)}>{text}</button></li>)}
    </ul>}
    <div className="agent-messages" role="log" aria-label="Conversation" aria-live="polite" aria-busy={busy}>
      {messages.map((m, i) => <p key={i} className={`agent-message ${m.role}`}><strong>{m.role === "user" ? "You" : "AI guide"}</strong><span>{m.content}</span></p>)}
    </div>
    <form onSubmit={(e) => { e.preventDefault(); void ask(question); }}>
      <label htmlFor={inputId}>What would you like to know?</label>
      <textarea id={inputId} value={question} maxLength={1000} rows={3} disabled={!ready.chat || busy} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about my projects, experience, or how I work…" />
      <button className="btn" disabled={!ready.chat || busy || !question.trim()} type="submit">{busy ? "Thinking…" : "Ask the guide"}</button>
    </form>
    {checking ? <p role="status">Checking guide availability…</p> : !ready.chat && <p role="status">Chat is coming soon. Explore my résumé below.</p>}
    </section>
    <section id={`${inputId}-voice`} className="agent-voice" hidden={mode !== "voice"} aria-label="Call the guide">
      <p>Talk with my AI guide in your browser. Powered by Twilio, with calls up to three minutes.</p>
      {callState === "idle" ? <button className="btn ghost" disabled={!ready.voice} onClick={() => void call()}>Talk to my AI guide</button>
        : <button className="btn" onClick={hangUp}>End call</button>}
      <p role="status">{callState === "connecting" ? "Connecting… allow microphone access when prompted." : callState === "connected" ? "Call connected. Your microphone is on." : checking ? "Checking guide availability…" : !ready.chat ? "The AI guide is coming soon. You can explore my résumé and profile below." : !ready.voice ? "Typed chat is available. Voice is coming soon." : callNotice || "Ready when you are."}</p>
    </section>
    {error && <p role="alert">{error}</p>}
    <p className="agent-disclosure">AI guide · Answers based on my résumé and public profile.</p>
    <details className="agent-details"><summary>Sources & privacy</summary>
    <p className="small dim">This is an AI guide, not Nikema. Questions and call audio are processed by AI and communications providers. Please keep sensitive information out of the conversation. The guide can make mistakes; check the sources.</p>
    <nav className="socials" aria-label="Guide sources"><a href="/Nikema_Prophet_Resume.pdf">Résumé</a><a href="/nikema.md">nikema.md</a><a href="#profile">Full profile</a></nav>
    </details>
  </div>;
}
