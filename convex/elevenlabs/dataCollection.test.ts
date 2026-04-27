import { describe, expect, it } from "vitest";
import { parseDataCollectionResults } from "./dataCollection";

describe("parseDataCollectionResults", () => {
  it("extracts the factual fields by their natural identifiers", () => {
    const raw = {
      Name: { value: "Jane Doe", rationale: "stated name" },
      Address: { value: "123 Main St" },
      "Phone number": { value: "+15551112222" },
    };
    const out = parseDataCollectionResults(raw);
    expect(out.callerName).toBe("Jane Doe");
    expect(out.address).toBe("123 Main St");
    expect(out.phoneNumber).toBe("+15551112222");
  });

  it("tolerates snake_case variants and missing keys", () => {
    const raw = {
      caller_name: { value: "Bob" },
    };
    const out = parseDataCollectionResults(raw);
    expect(out.callerName).toBe("Bob");
    expect(out.address).toBeNull();
    expect(out.phoneNumber).toBeNull();
  });

  it("returns null for entries with missing or empty values", () => {
    const raw = {
      Name: { rationale: "couldn't determine" },
      Address: { value: "   " },
      "Phone number": { value: null },
    };
    const out = parseDataCollectionResults(raw);
    expect(out.callerName).toBeNull();
    expect(out.address).toBeNull();
    expect(out.phoneNumber).toBeNull();
  });

  it("returns all-null for non-object input", () => {
    const out = parseDataCollectionResults(null);
    expect(out).toEqual({
      callerName: null,
      address: null,
      phoneNumber: null,
    });
  });

  it("ignores unknown identifiers", () => {
    const raw = {
      something_else: { value: "ignore me" },
      Name: { value: "Pat" },
    };
    const out = parseDataCollectionResults(raw);
    expect(out.callerName).toBe("Pat");
    expect(out.address).toBeNull();
  });
});
