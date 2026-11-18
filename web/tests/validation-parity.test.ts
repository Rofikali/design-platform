import { describe, expect, it } from "vitest";
import validationCases from "../../fixtures/validation-cases-v1.json";
import { parseDocument } from "../utils/document";

describe("shared Rust/TypeScript document validation cases", () => {
  it("uses the expected fixture version", () => {
    expect(validationCases.schema_version).toBe(1);
    expect(validationCases.cases.length).toBeGreaterThan(0);
  });

  it.each(validationCases.cases)("$name", (testCase) => {
    // Vitest's callback row is not guaranteed to be present under stricter
    // TypeScript inference. Fail explicitly rather than dereferencing an
    // unchecked array element or hiding it behind a non-null assertion.
    if (!testCase) throw new Error("Validation fixture row is missing");
    const { document, valid } = testCase;

    if (valid) {
      expect(() => parseDocument(document)).not.toThrow();
    } else {
      expect(() => parseDocument(document)).toThrow();
    }
  });
});
