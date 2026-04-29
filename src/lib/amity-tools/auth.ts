import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isAuthorizedToolRequest(request: Request): boolean {
  const secret =
    process.env.AMITY_TOOL_SECRET ?? process.env.ELEVENLABS_TOOL_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return true;
    console.error("AMITY_TOOL_SECRET is not configured");
    return false;
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const headerToken =
    request.headers.get("x-amity-tool-secret") ??
    request.headers.get("x-elevenlabs-tool-secret");
  const token = bearerToken ?? headerToken;

  return typeof token === "string" && constantTimeEqual(token, secret);
}
