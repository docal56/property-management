import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
import { logToolCall, readJsonBody } from "@/lib/amity-tools/logging";
import { findAvailableSlots } from "@/lib/amity-tools/mock-availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  max_results: z.coerce.number().int().min(1).max(10).optional(),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await readJsonBody(request);

  if (!isAuthorizedToolRequest(request)) {
    logToolCall({
      requestId,
      status: 401,
      tool: "check_availability",
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
      tool: "check_availability",
    });
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slots = findAvailableSlots({
    maxResults: parsed.data.max_results,
    preferredDate: parsed.data.preferred_date,
  });

  logToolCall({
    payload: parsed.data,
    requestId,
    returnedSlotIds: slots.map((slot) => slot.slot_id),
    status: 200,
    tool: "check_availability",
  });

  return NextResponse.json({
    message:
      slots.length > 0 ? "Available slots found." : "No available slots found.",
    slots,
    success: true,
  });
}
