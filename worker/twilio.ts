const encoder = new TextEncoder();
async function hmac(secret: string, hash: "SHA-1" | "SHA-256", usages: ("sign" | "verify")[]) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash }, false, usages);
}
export async function validSignature(secret: string, signature: string, url: string, params: Record<string, string> = {}) {
  try {
    const data = url + Object.keys(params).sort().map((key) => key + params[key]).join("");
    const key = await hmac(secret, "SHA-1", ["verify"]);
    return await crypto.subtle.verify("HMAC", key, Uint8Array.from(atob(signature), (c) => c.charCodeAt(0)), encoder.encode(data));
  } catch { return false; }
}
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const encode = (value: unknown) => base64url(encoder.encode(JSON.stringify(value)));
export async function voiceToken(account: string, apiKey: string, apiSecret: string, app: string, identity: string) {
  const now = Math.floor(Date.now() / 1000);
  const data = `${encode({ typ: "JWT", alg: "HS256", cty: "twilio-fpa;v=1" })}.${encode({
    jti: `${apiKey}-${now}-${crypto.randomUUID()}`, iss: apiKey, sub: account, iat: now, nbf: now, exp: now + 600,
    grants: { identity, voice: { outgoing: { application_sid: app } } },
  })}`;
  const signature = await crypto.subtle.sign("HMAC", await hmac(apiSecret, "SHA-256", ["sign"]), encoder.encode(data));
  return `${data}.${base64url(new Uint8Array(signature))}`;
}
export function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}
