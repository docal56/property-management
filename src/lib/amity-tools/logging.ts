import "server-only";

type LogPayload = Record<string, unknown>;

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length > 6 && /\d/.test(value)) return `${value.slice(0, 3)}...`;
    return value;
  }

  if (Array.isArray(value)) return value.map(redact);

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (/secret|authorization|token/i.test(key)) {
        redacted[key] = "[redacted]";
      } else if (/phone/i.test(key)) {
        redacted[key] = redact(nestedValue);
      } else {
        redacted[key] = redact(nestedValue);
      }
    }
    return redacted;
  }

  return value;
}

export function logToolCall(event: LogPayload): void {
  const redactedEvent = redact(event) as LogPayload;
  console.info(
    JSON.stringify({
      event: "amity_tool_call",
      ...redactedEvent,
      timestamp: new Date().toISOString(),
    }),
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
