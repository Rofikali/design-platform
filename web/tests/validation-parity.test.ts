import { describe, expect, it } from "vitest";
import validationCases from "../../fixtures/validation-cases-v1.json";
import { parseDocument } from "../utils/document";

describe("shared Rust/TypeScript document validation cases", () => {
  it("uses the expected fixture version", () => {
    expect(validationCases.schema_version).toBe(1);
    expect(validationCases.cases.length).toBeGreaterThan(0);
  });

  it.each(validationCases.cases)("$name", (testCase) => {
    const { document, valid } = testCase;

    if (valid) {
      expect(() => parseDocument(document)).not.toThrow();
    } else {
      expect(() => parseDocument(document)).toThrow();
    }
  });
});
