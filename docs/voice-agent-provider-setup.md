# Voice Agent Provider Setup

Buzz supports external voice agents from ElevenLabs and Vapi. Each external
agent is represented by one Buzz `agents` row.

The important fields are:

```text
provider          elevenlabs | vapi
providerAgentId   external provider agent/assistant id
agentId           internal Buzz Convex document id
```

`agentId` stays internal to Buzz. `providerAgentId` is the ID copied from
ElevenLabs or Vapi.

## Environments

Development and production use the same webhook code but different Convex
deployments and databases.

| Environment | Convex HTTP action URL |
|---|---|
| Development | `https://efficient-capybara-895.eu-west-1.convex.site` |
| Production | `https://brilliant-vulture-770.eu-west-1.convex.site` |

Use `.convex.site` for webhooks. `.convex.cloud` is the Convex client/API host
and will not handle these HTTP action routes correctly.

Current webhook paths:

| Provider | Path |
|---|---|
| ElevenLabs | `/elevenlabs-webhook` |
| Vapi | `/vapi-webhook` |

Full Vapi URLs:

```text
Development: https://efficient-capybara-895.eu-west-1.convex.site/vapi-webhook
Production:  https://brilliant-vulture-770.eu-west-1.convex.site/vapi-webhook
```

If an external agent points at the development URL, calls land in the
development database. If it points at the production URL, calls land in the
production database.

## Buzz Admin Setup

In Buzz admin, create or edit an agent for the correct org.

Set:

```text
Provider: Vapi or ElevenLabs
Provider agent id: external provider agent/assistant id
```

For Vapi, the provider agent ID is the assistant ID shown under the assistant
name in Vapi. For example:

```text
fc3d74bc-67d8-4ec6-a8c0-fc2ace1aabfe
```

This value must match the assistant ID that Vapi sends in its webhook payload.
If the provider and provider agent ID do not match an active Buzz agent in the
same Convex database, the webhook is accepted but ingestion returns
`unknown_agent`.

Multiple Buzz agents can write into the same org board. This is how multiple
providers or multiple provider agents feed one board.

## Vapi Setup

In the Vapi assistant:

1. Open the assistant.
2. Go to `Advanced`.
3. Find `Webhook Server`.
4. Set `Server URL` to the matching Buzz webhook URL.
5. Set `Timeout` to `20` seconds.
6. Under `Authorization`, choose the `VAPI_WEBHOOK_SECRET` credential.
7. Publish the assistant.

The credential should be:

```text
Authentication type: Bearer Token
Header name: Authorization
Include bearer prefix: enabled
```

The token value must match `VAPI_WEBHOOK_SECRET` on the target Convex
deployment. The current experiment uses the same token for development and
production, but the intended production setup is separate tokens per
environment.

Vapi must send `end-of-call-report` server messages. Buzz ignores other Vapi
server message types for now.

## ElevenLabs Setup

In ElevenLabs, configure the agent's post-call webhook to the matching Buzz
webhook URL:

```text
Development: https://efficient-capybara-895.eu-west-1.convex.site/elevenlabs-webhook
Production:  https://brilliant-vulture-770.eu-west-1.convex.site/elevenlabs-webhook
```

The Convex deployment must have `ELEVENLABS_WEBHOOK_SECRET` set. ElevenLabs
signs the raw body with its webhook signature header, and Buzz verifies that
signature before storing or ingesting the payload.

In Buzz admin, set:

```text
Provider: ElevenLabs
Provider agent id: ElevenLabs agent id
```

Existing migrated agents are treated as ElevenLabs agents. During the provider
migration, `elevenlabsAgentId` is kept as a deprecated compatibility field, but
new provider-aware logic uses `provider` and `providerAgentId`.

## What Buzz Stores

Both providers are normalized into the same conversation pipeline:

1. Verify the provider webhook.
2. Store the raw webhook payload.
3. Normalize provider call ID, provider agent ID, transcript/messages, phone
   numbers, duration, status, and success where present.
4. Match an active Buzz agent by `(provider, providerAgentId)`.
5. Store or update the conversation.
6. Run issue acceptance and extraction.
7. Create an issue when the configured agent rules say the call needs follow-up.

The visible call transcript should render provider messages the same way:
provider assistant/bot turns are Buzz `agent` messages and caller turns are
Buzz `user` messages.

## Quick Smoke Checks

For Vapi:

1. Confirm the Vapi assistant server URL uses `.convex.site`.
2. Confirm the Vapi credential is selected and includes the bearer prefix.
3. Confirm Buzz admin has a matching Vapi agent row.
4. Make a short call.
5. Check Vapi logs for a `200` response.
6. Check Buzz calls/issues in the matching environment.

A `401` response means the route exists but the token is missing or wrong.
A `404` response usually means the URL is wrong or the Convex deployment has
not deployed the route.
An `unknown_agent` ingestion result means the webhook was authenticated, but no
active Buzz agent matched the provider and provider agent ID.
