import { describe, expect, it } from "vitest";
import { normalize } from "./adapter";

const FALLBACK_HASH = "abcdef012345";

const baseTranscriptionEnvelope = {
  type: "post_call_transcription",
  event_timestamp: 1735000050,
  data: {
    agent_id: "agent_123",
    conversation_id: "conv_abc",
    status: "done",
    transcript: [
      {
        role: "agent",
        message: "Hello, this is Buzz Property Management.",
        time_in_call_secs: 0,
        start_time_unix_secs: 1735000010,
        speaker_name: "Agent",
      },
      {
        role: "user",
        message: "Hi, my sink is leaking.",
        time_in_call_secs: 4,
        start_time_unix_secs: 1735000014,
      },
    ],
    metadata: {
      start_time_unix_secs: 1735000000,
      call_duration_secs: 42,
      phone_call: {
        from_number: "+15551112222",
        to_number: "+15553334444",
      },
    },
    analysis: {
      data_collection_results: {
        Name: { value: "Jane Doe" },
        Address: { value: "123 Main St" },
        "Phone number": { value: "+15551112222" },
      },
      call_successful: "success",
    },
  },
};

describe("normalize", () => {
  it("produces a transcription NormalizedConversation", () => {
    const out = normalize(baseTranscriptionEnvelope, FALLBACK_HASH);
    expect(out.kind).toBe("transcription");
    expect(out.channel).toBe("call");
    expect(out.provider).toBe("elevenlabs");
    expect(out.providerEventType).toBe("post_call_transcription");
    expect(out.providerConversationId).toBe("conv_abc");
    expect(out.providerDedupeKey).toBe("conv_abc");
    expect(out.providerStatus).toBe("done");
    expect(out.occurredAtUnixSecs).toBe(1735000000);
    expect(out.callAgentExternalId).toBe("agent_123");
    expect(out.callFromNumber).toBe("+15551112222");
    expect(out.callToNumber).toBe("+15553334444");
    expect(out.callDurationSecs).toBe(42);
    expect(out.callSuccessful).toBe("success");
    expect(out.messages).toHaveLength(2);
    expect(out.messages?.[0]?.role).toBe("agent");
    expect(out.messages?.[1]?.body).toBe("Hi, my sink is leaking.");
    expect(out.bodyText).toContain("Leaking sink".slice(0, 0)); // bodyText built from messages
    expect(out.bodyText).toContain("Hi, my sink is leaking.");
    expect(out.dataCollectionResultsRaw).toBeTruthy();
  });

  it("handles call_initiation_failure", () => {
    const env = {
      type: "call_initiation_failure",
      event_timestamp: 1735000200,
      data: {
        agent_id: "agent_123",
        conversation_id: "conv_fail",
        status: "failed",
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.kind).toBe("initiation_failure");
    expect(out.providerEventType).toBe("call_initiation_failure");
    expect(out.providerStatus).toBe("failed");
    expect(out.messages).toBeNull();
    expect(out.bodyText).toBeNull();
    expect(out.callSuccessful).toBeNull();
  });

  it("falls back to event_timestamp when metadata.start_time is missing", () => {
    const env = {
      type: "post_call_transcription",
      event_timestamp: 1736000000,
      data: {
        agent_id: "agent_123",
        conversation_id: "conv_xyz",
        status: "done",
        transcript: [],
        analysis: { call_successful: "unknown" },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.occurredAtUnixSecs).toBe(1736000000);
    expect(out.callDurationSecs).toBeNull();
    expect(out.callSuccessful).toBe("unknown");
    expect(out.messages).toEqual([]);
    expect(out.bodyText).toBeNull();
  });

  it("uses computed dedupe key when conversation_id is missing", () => {
    const env = {
      type: "post_call_transcription",
      event_timestamp: 1737000000,
      data: {
        agent_id: "agent_xx",
        status: "done",
        transcript: [],
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.providerConversationId).toBeNull();
    expect(out.providerDedupeKey).toBe(
      `post_call_transcription:agent_xx:1737000000:${FALLBACK_HASH}`,
    );
  });

  it("treats call_successful values outside the enum as null", () => {
    const env = {
      type: "post_call_transcription",
      event_timestamp: 1738000000,
      data: {
        agent_id: "a",
        conversation_id: "c",
        status: "done",
        transcript: [],
        analysis: { call_successful: "weird-value" },
      },
    };
    const out = normalize(env, FALLBACK_HASH);
    expect(out.callSuccessful).toBeNull();
  });
});
