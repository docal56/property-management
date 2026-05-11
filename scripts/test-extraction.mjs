import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";

const MODEL = process.env.EXTRACTION_TEST_MODEL ?? "claude-haiku-4-5";

function loadEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is required. Set it in the shell, .env, or .env.local.",
  );
  process.exit(1);
}

const extractionFields = [
  { key: "name", label: "Name", description: "Caller name" },
  { key: "phone", label: "Phone number", description: "Best callback number" },
  { key: "email", label: "Email", description: "Caller email address" },
  {
    key: "address",
    label: "Address",
    description: "Relevant caller or property address",
  },
  {
    key: "code_word",
    label: "Code word",
    description: "If caller mentions a code word or secret code",
  },
];

const agentIssueConfig = {
  allowedIssueTypes: ["rental", "valuation", "viewing", "emergency"],
  extractionFields,
  issueCreationCriteria:
    "Create an issue when the caller needs staff to follow up on a real request, enquiry, or emergency. Do not create an issue for spam, wrong numbers, silent calls, duplicate no-action calls, test calls, or calls where no request was made.",
  issueTypeGuidance:
    "Assign every issue type that applies to the call. Use multiple types when the caller covers multiple use cases, for example a viewing request plus a valuation request, or a rental issue that is also an emergency.",
};

const issueTypes = [
  { color: "purple", key: "rental", label: "Rental Issue" },
  { color: "blue", key: "valuation", label: "Valuation Request" },
  { color: "orange", key: "viewing", label: "Book a Viewing" },
  { color: "red", key: "emergency", label: "Rental Emergency" },
];

const acceptance = {
  confidence: "high",
  issueTypes: ["emergency"],
  reason: null,
  shouldCreateIssue: true,
};

const transcript = `agent: This call may be recorded and shared with service providers for quality assurance and service improvement purposes.

Hi. Relocate properties - how can I help you today?
user: Hi, I'm Alex Morgan. I'm calling about a rental issue at 14 King Street, Flat 2. The boiler has stopped working and I need someone from Reloc8 to call me back today. My number is 07123 456789. The code word is bee.
agent: Thanks for that. The office is closed at the moment, so I'll make sure the team gets your details first thing.

Just to confirm - is there anything else you'd like to add about the boiler, or is that everything for now?
user: all good for now
agent: No problem - I'll get all of that over to the team and someone will be in touch as soon as they can.`;

const system = `You extract structured fields from a completed phone-call transcript.

Use only the configured extraction field keys from the agent issue config. Fill a field only when the value is supported by the transcript or call metadata. Return null for unknown values.

# Rules
- Do not invent values.
- Keep field values concise and factual.
- Use the configured field keys exactly.
- The fields object must include every configured extraction field key exactly once.
- Use null for configured fields that are unknown or not present.
- Review the transcript directly for every configured field.
- If a value is stated by the caller or repeated back by the agent, fill the matching configured field.
- Use call metadata only as fallback context. For phone/contact fields, prefer a callback number stated in the transcript over the inbound fromNumber.
- It is fine for some fields to be null.
- notes should contain useful extra context for staff, or null when there is none.`;

const prompt = [
  "Agent:",
  "Reloc8 Receptionist Agent",
  "",
  "Agent issue config:",
  JSON.stringify(agentIssueConfig, null, 2),
  "",
  "Org issue taxonomy:",
  JSON.stringify(issueTypes, null, 2),
  "",
  "Acceptance result:",
  JSON.stringify(acceptance, null, 2),
  "",
  "Call metadata:",
  JSON.stringify(
    {
      fromNumber: null,
      toNumber: null,
      durationSecs: 20,
      outcome: "success",
    },
    null,
    2,
  ),
  "",
  "Transcript:",
  transcript,
].join("\n");

const ExtractionValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const strictFieldsSchema = z.object(
  Object.fromEntries(
    extractionFields.map((field) => [field.key, ExtractionValueSchema]),
  ),
);

const StrictExtractionResultsSchema = z.object({
  fields: strictFieldsSchema,
  notes: z.string().nullable(),
});

console.log(`Model: ${MODEL}`);
console.log("\n--- Prompt ---\n");
console.log(prompt);

const result = await generateText({
  model: anthropic(MODEL),
  system,
  prompt,
  output: Output.object({ schema: StrictExtractionResultsSchema }),
});

console.log("\n--- Output ---\n");
console.log(JSON.stringify(result.output, null, 2));
