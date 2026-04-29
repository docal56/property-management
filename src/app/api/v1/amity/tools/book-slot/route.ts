import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
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
  if (!isAuthorizedToolRequest(request)) return unauthorizedResponse();

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
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

  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
