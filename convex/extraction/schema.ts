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

export const DEFAULT_AGENT_ISSUE_CONFIG: AgentIssueConfig = {
  issueCreationCriteria:
    "Create an issue when the caller needs staff follow-up for a real property enquiry, property-management request, emergency, or request to speak to the team. Do not create an issue for spam, wrong numbers, silent calls, duplicate no-action calls, test calls, or calls where no request was made.",
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
    {
      key: "property_interested_in",
      label: "Property interested in",
      description: "Property the caller wants to view",
    },
    {
      key: "availability_notes",
      label: "Availability notes",
      description: "Best times or unavailable times",
    },
    { key: "property_type", label: "Property type" },
    { key: "bedrooms", label: "Bedrooms" },
    {
      key: "valuation_property_address",
      label: "Valuation property address",
    },
    {
      key: "team_member_or_reason",
      label: "Team member or reason",
      description:
        "Who the caller wants to speak to, or what the call is about",
    },
    { key: "notes", label: "Notes" },
  ],
};
