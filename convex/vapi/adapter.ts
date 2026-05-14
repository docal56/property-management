/**
 * Vapi end-of-call webhook envelope -> stable internal NormalizedConversation.
 * The rest of the system never sees Vapi field paths.
 */

export type NormalizedVapiConversation = {
  channel: "call";
  provider: "vapi";
  providerEventType: string;
  kind: "transcription";
  providerConversationId: string | null;
  providerDedupeKey: string;
  providerStatus: string;

  occurredAtUnixSecs: number;

  subject: string | null;
  bodyText: string | null;
  messages: Array<{
    role: string;
    body: string;
    senderName: string | null;
    occurredAtUnixSecs: number | null;
    timeInCallSecs: number | null;
  }> | null;

  callAgentExternalId: string | null;
  callFromNumber: string | null;
  callToNumber: string | null;
  callDurationSecs: number | null;
  callSuccessful: "success" | "failure" | "unknown" | null;

  dataCollectionResultsRaw: unknown;
};

type RawMessage = {
  role?: unknown;
  message?: unknown;
  content?: unknown;
  text?: unknown;
  time?: unknown;
  secondsFromStart?: unknown;
  startTime?: unknown;
};

type RawEnvelope = {
  message?: {
    type?: unknown;
    endedReason?: unknown;
    startedAt?: unknown;
    endedAt?: unknown;
    call?: {
      id?: unknown;
      assistantId?: unknown;
      status?: unknown;
      startedAt?: unknown;
      endedAt?: unknown;
      cost?: unknown;
      customer?: { number?: unknown };
      phoneNumber?: { number?: unknown };
    };
    assistant?: { id?: unknown };
    customer?: { number?: unknown };
    phoneNumber?: { number?: unknown };
    artifact?: {
      transcript?: unknown;
      messages?: unknown;
    };
    analysis?: {
      summary?: unknown;
      successEvaluation?: unknown;
      structuredData?: unknown;
      dataCollectionResults?: unknown;
    };
  };
};

const MAX_MESSAGES = 100;
const MAX_MESSAGE_BODY_CHARS = 2_000;
const MAX_BODY_TEXT_CHARS = 50_000;

function asString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) : s;
}

function unixSecs(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v > 10_000_000_000 ? Math.floor(v / 1000) : Math.floor(v);
  }
  if (typeof v !== "string" || v.length === 0) return null;
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : null;
}

function normalizeCallSuccessful(
  value: unknown,
): NormalizedVapiConversation["callSuccessful"] {
  if (value === true || value === "true" || value === "success") {
    return "success";
  }
  if (value === false || value === "false" || value === "failure") {
    return "failure";
  }
  if (value === "unknown") return "unknown";
  return null;
}

function normalizeMessages(
  raw: unknown,
): NormalizedVapiConversation["messages"] {
  if (!Array.isArray(raw)) return null;
  const out: NonNullable<NormalizedVapiConversation["messages"]> = [];
  for (const item of raw as RawMessage[]) {
    if (out.length >= MAX_MESSAGES) break;
    if (!item || typeof item !== "object") continue;
    const role = normalizeRole(item.role);
    if (!role) continue;
    const body =
      asString(item.message) ?? asString(item.content) ?? asString(item.text);
    if (!body) continue;
    out.push({
      role,
      body: truncate(body, MAX_MESSAGE_BODY_CHARS),
      senderName: null,
      occurredAtUnixSecs: unixSecs(item.time) ?? unixSecs(item.startTime),
      timeInCallSecs: asNumber(item.secondsFromStart),
    });
  }
  return out;
}

function normalizeRole(raw: unknown) {
  const role = asString(raw)?.toLowerCase();
  if (role === "system") return null;
  if (role === "bot" || role === "assistant" || role === "ai") return "agent";
  if (role === "user" || role === "customer") return "user";
  return role ?? "unknown";
}

function transcriptBody(raw: unknown) {
  const transcript = asString(raw);
  return transcript ? truncate(transcript, MAX_BODY_TEXT_CHARS) : null;
}

export function normalize(
  envelope: unknown,
  rawBodyHash12: string,
): NormalizedVapiConversation {
  const env = (envelope ?? {}) as RawEnvelope;
  const message = env.message ?? {};
  const call = message.call ?? {};
  const artifact = message.artifact ?? {};
  const analysis = message.analysis ?? {};

  const eventType = asString(message.type) ?? "unknown";
  const providerConversationId = asString(call.id);
  const callAgentExternalId =
    asString(call.assistantId) ?? asString(message.assistant?.id);
  const startedAt = unixSecs(call.startedAt) ?? unixSecs(message.startedAt);
  const endedAt = unixSecs(call.endedAt) ?? unixSecs(message.endedAt);
  const occurredAtUnixSecs =
    startedAt ?? endedAt ?? Math.floor(Date.now() / 1000);
  const durationSecs =
    startedAt !== null && endedAt !== null
      ? Math.max(0, endedAt - startedAt)
      : null;
  const messages = normalizeMessages(artifact.messages);
  const bodyText =
    messages && messages.length > 0
      ? truncate(
          messages.map((m) => `${m.role}: ${m.body}`).join("\n"),
          MAX_BODY_TEXT_CHARS,
        )
      : transcriptBody(artifact.transcript);

  return {
    channel: "call",
    provider: "vapi",
    providerEventType: eventType,
    kind: "transcription",
    providerConversationId,
    providerDedupeKey:
      providerConversationId ??
      `${eventType}:${callAgentExternalId ?? "no-agent"}:${endedAt ?? startedAt ?? 0}:${rawBodyHash12}`,
    providerStatus:
      asString(call.status) ?? asString(message.endedReason) ?? "unknown",

    occurredAtUnixSecs,

    subject: asString(analysis.summary),
    bodyText: bodyText && bodyText.length > 0 ? bodyText : null,
    messages,

    callAgentExternalId,
    callFromNumber:
      asString(message.customer?.number) ?? asString(call.customer?.number),
    callToNumber:
      asString(message.phoneNumber?.number) ??
      asString(call.phoneNumber?.number),
    callDurationSecs: durationSecs,
    callSuccessful: normalizeCallSuccessful(analysis.successEvaluation),

    dataCollectionResultsRaw:
      analysis.structuredData ?? analysis.dataCollectionResults ?? null,
  };
}
