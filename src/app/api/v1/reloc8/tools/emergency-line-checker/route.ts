import { NextResponse } from "next/server";
import {
  isAuthorizedToolRequest,
  unauthorizedResponse,
} from "@/lib/amity-tools/auth";
import { logToolCall } from "@/lib/amity-tools/logging";
import { isEmergencyLineAvailable } from "@/lib/reloc8-tools/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toolAuthOptions = {
  headerNames: ["x-reloc8-tool-secret", "x-elevenlabs-tool-secret"],
  secretEnvNames: ["RELOC8_TOOL_SECRET", "ELEVENLABS_TOOL_SECRET"],
};

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  if (!isAuthorizedToolRequest(request, toolAuthOptions)) {
    logToolCall({
      event: "reloc8_tool_call",
      requestId,
      status: 401,
      tool: "emergency_line_checker",
    });
    return unauthorizedResponse();
  }

  const available = isEmergencyLineAvailable();

  logToolCall({
    available,
    event: "reloc8_tool_call",
    requestId,
    status: 200,
    tool: "emergency_line_checker",
  });

  return NextResponse.json({ available });
}
