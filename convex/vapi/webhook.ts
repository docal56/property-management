import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { normalize } from "./adapter";

const PROVIDER = "vapi";

async function sha256Hex12(body: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex.slice(0, 12);
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function readSecret(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }
  return (
    request.headers.get("x-vapi-secret") ?? request.headers.get("X-Vapi-Secret")
  );
}

export const handleVapiWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) {
    console.error("VAPI_WEBHOOK_SECRET is not set on the Convex deployment");
    return new Response("Server misconfigured", { status: 500 });
  }

  const providedSecret = readSecret(request);
  if (!providedSecret || !constantTimeEqual(providedSecret, secret)) {
    console.warn("Vapi webhook rejected: invalid secret");
    return new Response("Invalid secret", { status: 401 });
  }

  const rawBody = await request.text();
  const rawStorageId = await ctx.storage.store(
    new Blob([rawBody], { type: "application/json" }),
  );

  let envelope: unknown;
  try {
    envelope = JSON.parse(rawBody);
  } catch {
    await ctx.runMutation(internal.webhookEvents.log, {
      provider: PROVIDER,
      eventType: "invalid_json",
      providerConversationId: null,
      orgId: null,
      status: "error",
      errorMessage: "invalid_json_body",
      rawPayloadStorageId: rawStorageId,
    });
    return new Response(null, { status: 200 });
  }

  const env = envelope as {
    message?: {
      type?: unknown;
      call?: { id?: unknown };
    };
  };
  const eventType =
    typeof env.message?.type === "string" ? env.message.type : "unknown";
  const providerConversationId =
    typeof env.message?.call?.id === "string" ? env.message.call.id : null;

  if (eventType !== "end-of-call-report") {
    await ctx.runMutation(internal.webhookEvents.log, {
      provider: PROVIDER,
      eventType,
      providerConversationId,
      orgId: null,
      status: "ignored",
      errorMessage: "unknown_event_type",
      rawPayloadStorageId: rawStorageId,
    });
    return new Response(null, { status: 200 });
  }

  try {
    const bodyHash12 = await sha256Hex12(rawBody);
    const normalized = normalize(envelope, bodyHash12);
    const ingest = await ctx.runMutation(
      internal.conversations.ingestFromWebhook,
      { normalized, rawStorageId },
    );

    if (ingest.outcome === "unknown_agent") {
      await ctx.runMutation(internal.webhookEvents.log, {
        provider: PROVIDER,
        eventType,
        providerConversationId,
        orgId: null,
        status: "ignored",
        errorMessage: "unknown_agent",
        rawPayloadStorageId: rawStorageId,
      });
    } else if (ingest.outcome === "duplicate_active_agent") {
      await ctx.runMutation(internal.webhookEvents.log, {
        provider: PROVIDER,
        eventType,
        providerConversationId,
        orgId: null,
        status: "error",
        errorMessage: "duplicate_active_agent",
        rawPayloadStorageId: rawStorageId,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Vapi ingest failed", err);
    await ctx.runMutation(internal.webhookEvents.log, {
      provider: PROVIDER,
      eventType,
      providerConversationId,
      orgId: null,
      status: "error",
      errorMessage: message,
      rawPayloadStorageId: rawStorageId,
    });
  }

  return new Response(null, { status: 200 });
});
