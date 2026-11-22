import { test } from "node:test";
import assert from "node:assert/strict";
import twilio from "twilio";
import { createHmac } from "node:crypto";
import { validSignature, voiceToken } from "../worker/twilio.ts";

test("Workers signatures validate Twilio SDK signatures and reject altered payloads", async () => {
  const secret = "test-only", url = "https://guide.example.test/voice", params = { From: "client:visitor-test", CallSid: `CA${"0".repeat(32)}` };
  const signature = twilio.getExpectedTwilioSignature(secret, url, params);
  assert.equal(await validSignature(secret, signature, url, params), true);
  assert.equal(await validSignature(secret, signature, url, { ...params, From: "attacker" }), false);
  assert.equal(await validSignature(secret, "bad", url, params), false);
});
test("Workers voice JWT has a valid HMAC and grants only the designated app", async () => {
  const token = await voiceToken("account", "key", "secret", "app", "visitor");
  const [header, body, signature] = token.split(".");
  assert.equal(signature, createHmac("sha256", "secret").update(`${header}.${body}`).digest("base64url"));
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  assert.equal(payload.exp - payload.iat, 600);
  assert.deepEqual(payload.grants, { identity: "visitor", voice: { outgoing: { application_sid: "app" } } });
});
