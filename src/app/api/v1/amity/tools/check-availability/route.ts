import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
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
  if (!isAuthorizedToolRequest(request)) return unauthorizedResponse();

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slots = findAvailableSlots({
    maxResults: parsed.data.max_results,
    preferredDate: parsed.data.preferred_date,
  });

  return NextResponse.json({
    message:
      slots.length > 0 ? "Available slots found." : "No available slots found.",
    slots,
    success: true,
  });
}
