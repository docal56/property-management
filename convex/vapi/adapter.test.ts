import { describe, expect, it } from "vitest";
import { normalize } from "./adapter";

const FALLBACK_HASH = "abcdef012345";

const baseEndOfCallReport = {
  message: {
    type: "end-of-call-report",
    endedReason: "customer-ended-call",
    startedAt: "2026-05-14T10:00:00.000Z",
    endedAt: "2026-05-14T10:01:05.000Z",
    call: {
      id: "call_123",
      assistantId: "asst_123",
      status: "ended",
      customer: { number: "+15551112222" },
      phoneNumber: { number: "+15553334444" },
    },
    artifact: {
      transcript:
        "AI: Hello, this is Buzz Property Management.\nUser: Hi, my sink is leaking.",
      messages: [
        {
          role: "assistant",
          message: "Hello, this is Buzz Property Management.",
          secondsFromStart: 0,
        },
        {
          role: "user",
          message: "Hi, my sink is leaking.",
          secondsFromStart: 4,
        },
      ],
    },
    analysis: {
      summary: "Caller reported a leaking sink.",
      successEvaluation: true,
      structuredData: {
        caller_name: "Jane Doe",
        issue: "Leaking sink",
      },
    },
  },
};

describe("normalize Vapi", () => {
  it("produces a transcription NormalizedConversation", () => {
    const out = normalize(baseEndOfCallReport, FALLBACK_HASH);
    expect(out.kind).toBe("transcription");
    expect(out.channel).toBe("call");
    expect(out.provider).toBe("vapi");
    expect(out.providerEventType).toBe("end-of-call-report");
    expect(out.providerConversationId).toBe("call_123");
    expect(out.providerDedupeKey).toBe("call_123");
    expect(out.providerStatus).toBe("ended");
    expect(out.occurredAtUnixSecs).toBe(1778752800);
    expect(out.callAgentExternalId).toBe("asst_123");
    expect(out.callFromNumber).toBe("+15551112222");
    expect(out.callToNumber).toBe("+15553334444");
    expect(out.callDurationSecs).toBe(65);
    expect(out.callSuccessful).toBe("success");
    expect(out.subject).toBe("Caller reported a leaking sink.");
    expect(out.messages).toHaveLength(2);
    expect(out.messages?.[0]?.role).toBe("agent");
    expect(out.messages?.[1]?.role).toBe("user");
    expect(out.bodyText).toContain("Hi, my sink is leaking.");
    expect(out.dataCollectionResultsRaw).toEqual({
      caller_name: "Jane Doe",
      issue: "Leaking sink",
    });
  });

  it("falls back to transcript text when artifact messages are absent", () => {
    const env = {
      message: {
        type: "end-of-call-report",
        call: {
          id: "call_transcript_only",
          assistantId: "asst_123",
          status: "ended",
        },
        artifact: { transcript: "User: I need a valuation." },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.messages).toBeNull();
    expect(out.bodyText).toBe("User: I need a valuation.");
  });

  it("uses computed dedupe key when call id is missing", () => {
    const env = {
      message: {
        type: "end-of-call-report",
        endedAt: "2026-05-14T10:01:05.000Z",
        call: { assistantId: "asst_xx" },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.providerConversationId).toBeNull();
    expect(out.providerDedupeKey).toBe(
      "end-of-call-report:asst_xx:1778752865:abcdef012345",
    );
  });

  it("treats unsupported success values as null", () => {
    const env = {
      message: {
        type: "end-of-call-report",
        call: { id: "call_weird", assistantId: "asst_123" },
        analysis: { successEvaluation: "maybe" },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.callSuccessful).toBeNull();
  });

  it("skips system messages", () => {
    const env = {
      message: {
        type: "end-of-call-report",
        call: { id: "call_system", assistantId: "asst_123" },
        artifact: {
          messages: [
            { role: "system", message: "Long prompt" },
            { role: "bot", message: "Hello" },
          ],
        },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.messages).toEqual([
      {
        role: "agent",
        body: "Hello",
        senderName: null,
        occurredAtUnixSecs: null,
        timeInCallSecs: null,
      },
    ]);
  });
});
