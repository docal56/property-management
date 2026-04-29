import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
import { logToolCall, readJsonBody } from "@/lib/amity-tools/logging";
import { appendCallLog } from "@/lib/amity-tools/mock-availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  call_id: z.string().min(1).optional(),
  caller_phone: z.string().min(7).max(40).optional(),
  outcome: z.string().min(1).max(120),
  summary: z.string().max(5000).optional(),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await readJsonBody(request);

  if (!isAuthorizedToolRequest(request)) {
    logToolCall({
      requestId,
      status: 401,
      tool: "post_call_log",
    });
    return unauthorizedResponse();
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    logToolCall({
      issues: parsed.error.issues,
      payload: body,
      requestId,
      status: 400,
      tool: "post_call_log",
    });
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const log = appendCallLog({
    callId: parsed.data.call_id,
    callerPhone: parsed.data.caller_phone,
    outcome: parsed.data.outcome,
    summary: parsed.data.summary,
  });

  logToolCall({
    callId: log.call_id,
    outcome: log.outcome,
    payload: parsed.data,
    requestId,
    status: 200,
    tool: "post_call_log",
  });

  return NextResponse.json({
    log,
    message: "Call log recorded.",
    success: true,
  });
}
