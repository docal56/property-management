import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type ToolRequestAuthOptions = {
  headerNames?: string[];
  secretEnvNames?: string[];
};

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getFirstConfiguredSecret(
  secretEnvNames: string[],
): string | undefined {
  for (const envName of secretEnvNames) {
    const secret = process.env[envName];
    if (secret) return secret;
  }
  return undefined;
}

export function isAuthorizedToolRequest(
  request: Request,
  options: ToolRequestAuthOptions = {},
): boolean {
  const secretEnvNames = options.secretEnvNames ?? [
    "AMITY_TOOL_SECRET",
    "ELEVENLABS_TOOL_SECRET",
  ];
  const headerNames = options.headerNames ?? [
    "x-amity-tool-secret",
    "x-elevenlabs-tool-secret",
  ];
  const secret = getFirstConfiguredSecret(secretEnvNames);
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return true;
    console.error(`${secretEnvNames.join(" or ")} is not configured`);
    return false;
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const headerToken = headerNames
    .map((headerName) => request.headers.get(headerName))
    .find((value): value is string => typeof value === "string");
  const token = bearerToken ?? headerToken;

  return typeof token === "string" && constantTimeEqual(token, secret);
}
