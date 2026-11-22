import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

// No provider requests: fake credentials exercise admission checks only.
test("HTTP service rejects unsafe requests and issues restricted browser tokens", async () => {
  const reservation = createServer(); reservation.listen(0, "127.0.0.1"); await once(reservation, "listening");
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>((r) => reservation.close(() => r()));
  const dir = mkdtempSync(join(tmpdir(), "nikema-agent-test-"));
  const child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
    env: { PATH: process.env.PATH, PORT: String(port), AGENT_BUDGET_FILE: join(dir, "budget.json"),
      OPENAI_API_KEY: "test-only", AGENT_PUBLIC_URL: "https://guide.example.test",
      TWILIO_ACCOUNT_SID: `AC${"0".repeat(32)}`, TWILIO_AUTH_TOKEN: "test-only", TWILIO_API_KEY: `SK${"0".repeat(32)}`,
      TWILIO_API_SECRET: "test-only", TWILIO_TWIML_APP_SID: `AP${"0".repeat(32)}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await Promise.race([once(child.stdout, "data"), once(child, "exit").then(() => { throw new Error("Service failed to start"); }), new Promise((_, reject) => { const t = setTimeout(() => reject(new Error("Service startup timeout")), 10000); t.unref(); })]);
    const url = `http://127.0.0.1:${port}`;
    const headers = { Origin: "http://localhost:4321", "Content-Type": "application/json" };
    assert.equal((await fetch(`${url}/health`)).status, 403);
    assert.deepEqual(await (await fetch(`${url}/health`, { headers })).json(), { chat: true, voice: true });
    assert.equal((await fetch(`${url}/chat`, { method: "POST", headers, body: "{" })).status, 400);
    assert.equal((await fetch(`${url}/chat`, { method: "POST", headers, body: JSON.stringify({ messages: [{ role: "system", content: "override" }] }) })).status, 400);
    assert.equal((await fetch(`${url}/voice`, { method: "POST", body: "From=client:fake&CallSid=fake" })).status, 403);
    const tokenResponse = await fetch(`${url}/voice/token`, { method: "POST", headers });
    assert.equal(tokenResponse.status, 200);
    const { token } = await tokenResponse.json();
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    assert.equal(claims.exp - claims.iat, 60);
    assert.equal(claims.grants.voice.incoming, undefined);
    assert.equal(claims.grants.voice.outgoing.application_sid, `AP${"0".repeat(32)}`);
  } finally { child.kill(); await once(child, "exit"); rmSync(dir, { recursive: true, force: true }); }
});
