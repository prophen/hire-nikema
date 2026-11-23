# AI guide maintainer notes

For the public walkthrough, see [Building a browser voice guide with Twilio](twilio-page.md). This document covers recording, configuration, deployment, and maintenance.

The static company page builds at `/for/twilio`. Its colors, copy, optional video, and agent flag live in `src/data/companies.ts`. The homepage also includes the guide and links to the public walkthrough. The red phone and START → ASK NIKEMA open the same guide component as the section below the room.

## Optional company intro: draft recording script

Suggested script (edit to sound like you):

> Hi Twilio, I'm Nikema. I'm a developer advocate and engineer who builds things, then shows people how they work. I've worked on developer advocacy and developer experiences at PayPal, and lately I've been building AI-assisted apps in public.
>
> For this page, I wanted to make my work something you can ask questions about. The red phone connects to an AI guide grounded in my résumé and public profile. You can ask about my projects, what I've learned, or my experience helping developers.
>
> That's the kind of developer experience I like building: a working example you can try, with a clear explanation of how it works. Have a look around, and if you'd like to talk to the real me, my booking link is here too.

Record after the guide is live, or change the wording to describe it as in progress. Put the video, poster and captions in `public/twilio/`, then add a complete `video` object to the Twilio company entry: `src`, `poster`, `captions`, `chapters`, `transcript`. Both views switch together. Until then, both show the existing general intro. Use actual recording timestamps for chapters and captions.

## Cloudflare backend (deployed)

Worker: `hire-nikema-agent` in Nikema's Cloudflare account.

- API: https://hire-nikema-agent.nikema.workers.dev
- Health: https://hire-nikema-agent.nikema.workers.dev/health
- TwiML App Voice URL: https://hire-nikema-agent.nikema.workers.dev/voice (POST)

The local site's `.env` now sets `PUBLIC_AGENT_URL` to this service. Set the same build variable on the production site's host when publishing the Twilio page. The frontend is not redeployed by deploying this backend.

`worker/cloudflare.config.ts` is the source of truth for the Worker name, origins, model, and Durable Object bindings. The backend accepts the production site and `http://localhost:4321`; change the explicit allowlist for other preview origins.

`DailyBudget` coordinates quotas per UTC day. Each call gets its own `VoiceSession` Durable Object, with single-use admission, hibernating WebSockets, and an expiry alarm. Temporary voice conversation text is stored in that object so it survives hibernation; it is deleted on disconnect or expiry. HTTP chat history stays with the browser and is sent with each question. Provider retention is controlled by the provider accounts.

The old Node service remains available as an optional local alternative (`npm run agent`); Cloudflare does not run it.

## Recorded activation status (November 22, 2026)

Chat and browser calling are enabled. All six provider secrets are installed as encrypted Worker secrets. The dedicated TwiML App is `APac033fc08d1ee1b7077de2a0c4077244` (Hire Nikema AI Guide).

Verified on November 22, 2026: a real résumé question returned a grounded answer, an unsupported salary question was declined, and an automated browser call using synthetic microphone input connected through ConversationRelay, remained connected through the greeting interval, and hung up cleanly. A full spoken question/answer exchange, interruption quality, and the three-minute cutoff still need an audible user test.

Twilio signs the WebSocket URL with the `wss://` scheme. The handler accepts valid signatures for that URL or its HTTPS handshake equivalent. The provider call-duration limit is applied on ConversationRelay's setup message, after the call connects; applying it during the initial TwiML request caused Twilio to reject the update.

## Configure chat and voice

In the Worker's Settings → Variables and Secrets, configure these as encrypted secrets (never as `PUBLIC_` variables):

- `OPENAI_API_KEY` enables typed chat.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`, and `TWILIO_TWIML_APP_SID` enable browser calls.

Use a dedicated Twilio API key and TwiML App for this demo. Point the app's Voice URL at the `/voice` endpoint above. Follow Twilio's [ConversationRelay onboarding](https://www.twilio.com/docs/voice/conversationrelay/onboarding), including the account-level AI/ML terms. These terms require the account owner's action.

The `/health` response reports whether required secrets exist, not whether provider billing, permissions, or credentials are valid. After configuration, test a real question and a browser call, microphone rejection, interruption, hangup, the three-minute cutoff, and an unsupported question before sharing the demo.

Text chat calls the model through the Worker; Twilio powers the voice channel. This version does not use Twilio Conversations for typed messaging. Calls use the [Voice JavaScript SDK](https://www.twilio.com/docs/voice/sdks/javascript) and [ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay/websocket-messages). Direct phone-number dial-in is not enabled. Voice replies currently send one complete short response at a time; token streaming remains a possible latency improvement.

Limits: 20 accepted calls, 100 browser tokens, and 200 model requests per UTC day. Chat and voice share the model-request quota. Quotas persist across Worker restarts. Browser credentials last ten minutes so they remain valid throughout a call; each identity can start only one call and must start within one minute of issuance. Each call has a Twilio-enforced 180-second ceiling plus a Durable Object expiry alarm. The per-visitor implementation in PR #23 requires a separate Worker deployment; it was tested locally but has not been verified live. Per-visitor admission limits use Cloudflare's `CF-Connecting-IP`: 6 chat requests per fixed minute and 20 per UTC day, plus 1 voice token per fixed minute and 3 per UTC day. Separate named `DailyBudget` objects keep visitor counters atomic and persistent; rejected requests return 429 with `Retry-After` before model calls or voice credentials are issued. Keys hash the IP with the UTC date; raw IPs are not stored in these counters. Missing IPs share a limited fallback bucket. Counter storage expires after two days. Signed Twilio callbacks do not use visitor limits, because they originate from Twilio, not the visitor.

CORS is not authentication. Shared networks share limits, and clients with multiple IPs can still consume the global quota. Provider budgets remain useful; request limits are not exact dollar limits. These Worker protections do not apply to the optional local Node development server.

## Build and deploy updates

Run `npm run build:agent` to build the site, regenerate Cloudflare binding types, validate the résumé hash, and bundle the Worker with the current generated `/nikema.md`. Then run `npm run check:agent` and `npm run test:worker`.

The build writes `worker/generated/worker.js` and `metadata.json`. They are uploaded together through Cloudflare's authenticated Worker upload API, using the connected Cloudflare tool. Upload metadata preserves existing encrypted secret bindings and reconciles the declared SQLite Durable Object classes. The initial deployment also enabled the Worker's workers.dev subdomain. This build uses esbuild directly; it doesn't change Astro's build system or require a Cloudflare frontend adapter.

To reproduce the upload from a terminal, `scripts/deploy-agent.mjs` reads a scoped `CLOUDFLARE_API_TOKEN` from the environment and uploads the already-built bundle. The token needs Workers Scripts Write for the configured account. The connected Cloudflare tool does not share its login with the local CLI.

## Refresh knowledge and verify

Run `npm run build:agent` and deploy the bundle after profile changes. After replacing the PDF, run `python3 scripts/extract-resume.py` (requires `pypdf`), review the extracted text, then rebuild and redeploy. A PDF hash mismatch stops the agent build so stale résumé text isn't silently used.

Run `npm run check`, `npm run build`, `npm run test:agent`, `npm run check:agent`, `npm run test:worker`, and `npm test`. Automated checks do not establish real Twilio or model connectivity. See the activation status above for live verification and its remaining limits.

Theme reference: Twilio Paste's [design tokens](https://github.com/twilio-labs/paste/tree/main/packages/paste-design-tokens), brand red `#F22F46` and navy `#121C2D`. Buttons use a darker red for text contrast.
