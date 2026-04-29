import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
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
  if (!isAuthorizedToolRequest(request)) return unauthorizedResponse();

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
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

  return NextResponse.json({
    log,
    message: "Call log recorded.",
    success: true,
  });
}
