import { describe, expect, it } from "vitest";
import {
  type AgentIssueConfig,
  extractionResultsSchemaForConfig,
} from "./schema";

const config: AgentIssueConfig = {
  issueCreationCriteria: "Create issues for actionable calls.",
  issueTypeGuidance: "Use every matching type.",
  allowedIssueTypes: ["rental"],
  extractionFields: [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "code_word", label: "Code word" },
  ],
};

describe("extractionResultsSchemaForConfig", () => {
  it("requires every configured extraction field key", () => {
    const schema = extractionResultsSchemaForConfig(config);

    expect(
      schema.safeParse({
        fields: {},
        notes: null,
      }).success,
    ).toBe(false);
  });

  it("accepts configured field values and nulls", () => {
    const schema = extractionResultsSchemaForConfig(config);

    expect(
      schema.safeParse({
        fields: {
          name: "Alex Morgan",
          phone: "07123 456789",
          code_word: null,
        },
        notes: null,
      }).success,
    ).toBe(true);
  });
});
