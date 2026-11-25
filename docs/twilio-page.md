# Building a browser voice guide with Twilio

I built the red phone on [my portfolio](https://hirenikema.app/) so visitors can ask about my work while exploring it. It opens an AI guide with typed chat and a browser call option. The same demo appears on [my Twilio application page](https://hirenikema.app/for/twilio).

The voice channel uses Twilio Voice and ConversationRelay. A Cloudflare Worker connects the conversation to an OpenAI model, with my résumé and public profile supplied as source material. The guide identifies itself as AI; it does not connect callers to me.

## Try it

Open the red phone, or scroll to “A conversation about my work.” Ask a question in Chat, or choose Call, start the call, and allow microphone access. Try “What did Nikema build at PayPal?” or “Which AI project should I explore first?” Calls are limited to three minutes.

For a conversation with me, [book a 15-minute chat](https://cal.boardy.ai/2239bee288d5).

## How the voice path works

1. The React interface requests a short-lived voice token from the Worker and initializes the Twilio Voice JavaScript SDK.
2. Twilio sends a signed request to the Worker's `/voice` endpoint. The Worker checks the signature and admits the single-use visitor session before returning TwiML that connects the call to ConversationRelay.
3. ConversationRelay connects to a signed WebSocket endpoint on the Worker. A `VoiceSession` Durable Object holds that call's conversation and expiry state.
4. The Worker handles transcribed prompt events, sends the recent conversation and source material to the model, and returns the answer text to ConversationRelay for speech playback.
5. Hangup or expiry closes the session and deletes its temporary stored conversation. Interruption events cancel pending model work and update the conversation history.

Typed chat uses the same answer-generation code through `/chat`. Twilio powers the voice path; typed chat goes directly through the Worker to the model.

## Read the implementation

| Part | Source |
| --- | --- |
| Chat UI, microphone permission, call controls | [AskNikema.tsx](../src/components/AskNikema.tsx) |
| HTTP routes, TwiML, voice sessions, quotas | [Worker](../worker/index.ts) |
| Twilio signature checks and restricted voice tokens | [Twilio helpers](../worker/twilio.ts) |
| Shared chat and voice instructions | [Answer generation](../server/agent-core.ts) |
| Résumé validation and profile loading | [Knowledge assembly](../server/agent.ts) |
| Persistent-session and quota tests | [Worker tests](../worker/worker.test.ts) |

## Design decisions and lessons

**Use the portfolio as the source.** The build combines the extracted résumé, generated public profile, project details, and intro transcript. A PDF hash check stops the build if the résumé extraction is stale. Instructions tell the guide to decline unsupported claims, but source grounding does not guarantee that every answer is correct.

**Keep each call's state separate.** Each call has its own Durable Object, so conversation history survives WebSocket hibernation. Signed callbacks, a single-use identity, and an expiry alarm control admission and lifetime. The browser receives a restricted voice token rather than provider credentials.

**Handle the actual Twilio handshake.** During integration, Twilio signed the WebSocket URL using `wss://`. The handler validates that form as well as the HTTPS handshake equivalent. Applying the call-duration limit during the initial TwiML request failed; the implementation applies it when ConversationRelay sends its setup event after connection.

**Start with complete, short replies.** Voice currently sends one complete response at a time. Streaming tokens is a possible latency improvement; it is not implemented here.

## Limits, privacy, and verification

The Worker implements daily caps of 20 calls, 100 voice tokens, and 200 model requests shared between chat and voice. Each call has a 180-second provider limit and an expiry alarm. The visitor-limit update in [PR #23](https://github.com/prophen/hire-nikema/pull/23) adds 6 chat requests per minute / 20 per day and 1 voice token per minute / 3 per day. That update was tested locally and still requires a separate Worker deployment before it protects the live demo.

Visitor counters use a date-hashed Cloudflare ingress IP. Shared networks share limits, and changing IPs can bypass an individual visitor's allowance; the global caps remain in place. CORS is not authentication, and request counts are not exact spending limits.

Questions and call audio are processed by the AI and communications providers. Temporary voice conversation text is deleted from the session object on disconnect or expiry; provider retention is separate. Please avoid sharing sensitive information.

The recorded live check on November 22, 2026 confirmed a grounded résumé answer, an unsupported-salary refusal, and a browser call that connected through the greeting and hung up. A full audible question-and-answer exchange, interruption quality, and the three-minute cutoff still need a live human check. Automated tests cover signature validation, single-use admission, quota concurrency and persistence, and rejection before model calls or token issuance. Tests of the prompt verify the instructions supplied to the model, not guaranteed model compliance.

Configuration, deployment commands, and intro-video notes are in the [maintainer notes](ai-guide-maintenance.md).
