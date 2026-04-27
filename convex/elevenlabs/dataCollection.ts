import { z } from "zod";

/**
 * ElevenLabs `analysis.data_collection_results` is keyed by configured
 * identifier. Each entry is documented as `{ value, rationale, json_schema }`
 * but `value` may be missing if the model couldn't extract it.
 *
 * Per Dave, the agent is configured with exactly three factual fields:
 *   "Name", "Address", "Phone number"
 *
 * The identifier in the dashboard is free-form. We accept several common
 * casings/synonyms to stay tolerant — only the parsed result is persisted.
 */

const ENTRY_SCHEMA = z
  .object({
    value: z.unknown().optional(),
    rationale: z.string().optional().nullable(),
  })
  .passthrough();

const RESULTS_SCHEMA = z.record(z.string(), ENTRY_SCHEMA);

const FIELD_SYNONYMS = {
  callerName: ["name", "caller_name", "callerName", "caller"],
  address: ["address", "property_address", "location"],
  phoneNumber: [
    "phone_number",
    "phoneNumber",
    "phone",
    "callback_number",
    "callbackNumber",
  ],
} as const;

export type ParsedDataCollection = {
  callerName: string | null;
  address: string | null;
  phoneNumber: string | null;
};

function valueToString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return null;
}

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[\s-]+/g, "_");
}

function findField(
  entries: Record<string, z.infer<typeof ENTRY_SCHEMA>>,
  synonyms: readonly string[],
): string | null {
  const normalizedKeys = new Map<string, string>();
  for (const k of Object.keys(entries)) normalizedKeys.set(normalizeKey(k), k);
  for (const syn of synonyms) {
    const real = normalizedKeys.get(normalizeKey(syn));
    if (!real) continue;
    const entry = entries[real];
    if (!entry) continue;
    const v = valueToString(entry.value);
    if (v !== null) return v;
  }
  return null;
}

export function parseDataCollectionResults(raw: unknown): ParsedDataCollection {
  const empty: ParsedDataCollection = {
    callerName: null,
    address: null,
    phoneNumber: null,
  };
  if (raw == null || typeof raw !== "object") return empty;

  const parsed = RESULTS_SCHEMA.safeParse(raw);
  if (!parsed.success) return empty;

  const entries = parsed.data;
  return {
    callerName: findField(entries, FIELD_SYNONYMS.callerName),
    address: findField(entries, FIELD_SYNONYMS.address),
    phoneNumber: findField(entries, FIELD_SYNONYMS.phoneNumber),
  };
}
