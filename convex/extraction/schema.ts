import { z } from "zod";

const ConvexRecordKeySchema = z
  .string()
  .min(1)
  .regex(/^[\x20-\x7E]+$/)
  .refine((key) => !key.startsWith("$") && !key.startsWith("_"));

export const AcceptanceSchema = z.object({
  shouldCreateIssue: z.boolean(),
  reason: z.string().nullable(),
  issueTypes: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
});

export const ExtractionValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const ExtractionResultsSchema = z.object({
  fields: z.record(z.string(), ExtractionValueSchema),
  notes: z.string().nullable(),
});

export const ExtractionSchema = z.object({
  shouldCreateIssue: z.boolean(),
  reason: z.string().nullable(),
  callerName: z.string().nullable(),
  address: z.string().nullable(),
  phoneNumber: z.string().nullable(),
});

export const IssueTypeConfigSchema = z.object({
  key: ConvexRecordKeySchema,
  label: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const IssueTypesSchema = z.array(IssueTypeConfigSchema);

export const AgentIssueConfigSchema = z.object({
  issueCreationCriteria: z.string(),
  issueTypeGuidance: z.string().optional(),
  allowedIssueTypes: z.array(ConvexRecordKeySchema),
  extractionFields: z.array(
    z.object({
      key: ConvexRecordKeySchema,
      label: z.string(),
      description: z.string().optional(),
    }),
  ),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
export type Acceptance = z.infer<typeof AcceptanceSchema>;
export type ExtractionResults = z.infer<typeof ExtractionResultsSchema>;
export type IssueTypes = z.infer<typeof IssueTypesSchema>;
export type AgentIssueConfig = z.infer<typeof AgentIssueConfigSchema>;

export function extractionResultsSchemaForConfig(
  agentIssueConfig: AgentIssueConfig,
) {
  return z.object({
    fields: z.object(
      Object.fromEntries(
        agentIssueConfig.extractionFields.map((field) => [
          field.key,
          ExtractionValueSchema,
        ]),
      ),
    ),
    notes: z.string().nullable(),
  });
}

export const DEFAULT_ISSUE_TYPES: IssueTypes = [
  {
    key: "enquiry",
    label: "Enquiry",
    description: "General enquiries that staff should follow up on",
    color: "purple",
  },
  {
    key: "emergency",
    label: "Emergency",
    description: "Urgent safety, access, or essential-service issues",
    color: "red",
  },
];

// Keys that the issue-creation mapping in `createIssueFromConversation`
// reads directly to populate first-class issue columns (contactName,
// contactPhone, contactEmail, address). Renaming or removing them silently
// breaks the auto-population, so they are seeded on agent create and
// protected from delete/rename in the admin UI.
export const BUILT_IN_EXTRACTION_KEYS = [
  "name",
  "phone",
  "email",
  "address",
] as const;

export type BuiltInExtractionKey = (typeof BUILT_IN_EXTRACTION_KEYS)[number];

export function isBuiltInExtractionKey(
  key: string,
): key is BuiltInExtractionKey {
  return (BUILT_IN_EXTRACTION_KEYS as readonly string[]).includes(key);
}

export const DEFAULT_AGENT_ISSUE_CONFIG: AgentIssueConfig = {
  issueCreationCriteria:
    "Create an issue when the caller needs staff to follow up on a real request, enquiry, or emergency. Do not create an issue for spam, wrong numbers, silent calls, duplicate no-action calls, test calls, or calls where no request was made.",
  issueTypeGuidance:
    "Assign every issue type that applies to the call. Use multiple types when the caller covers multiple use cases, for example a viewing request plus a valuation request, or a rental issue that is also an emergency.",
  allowedIssueTypes: DEFAULT_ISSUE_TYPES.map((type) => type.key),
  extractionFields: [
    { key: "name", label: "Name", description: "Caller name" },
    {
      key: "phone",
      label: "Phone number",
      description: "Best callback number",
    },
    { key: "email", label: "Email", description: "Caller email address" },
    {
      key: "address",
      label: "Address",
      description: "Relevant caller or property address",
    },
  ],
};
