import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
import { logToolCall, readJsonBody } from "@/lib/amity-tools/logging";
import { bookSlot } from "@/lib/amity-tools/mock-availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  call_id: z.string().min(1).optional(),
  caller_name: z.string().min(1).max(120),
  caller_phone: z.string().min(7).max(40),
  slot_id: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await readJsonBody(request);

  if (!isAuthorizedToolRequest(request)) {
    logToolCall({
      requestId,
      status: 401,
      tool: "book_slot",
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
      tool: "book_slot",
    });
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = bookSlot({
    callId: parsed.data.call_id,
    callerName: parsed.data.caller_name,
    callerPhone: parsed.data.caller_phone,
    slotId: parsed.data.slot_id,
  });

  logToolCall({
    bookingId: result.success ? result.booking_id : null,
    payload: parsed.data,
    requestId,
    status: result.success ? 200 : 409,
    tool: "book_slot",
  });

  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
