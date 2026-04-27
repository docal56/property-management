import { z } from "zod";

export const ExtractionSchema = z.object({
  shouldCreateIssue: z.boolean(),
  reason: z.string().nullable(),
  callerName: z.string().nullable(),
  address: z.string().nullable(),
  phoneNumber: z.string().nullable(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
