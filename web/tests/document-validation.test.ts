import { describe, expect, it } from "vitest";
import sharedDocumentFixture from "../../fixtures/document-v1.json";
import backgroundDocumentFixture from "../../fixtures/document-v3-background-image.json";
import { validateDocumentJson } from "../utils/document-validation";

describe("document validation adapter", () => {
  it("uses the TypeScript fallback in non-browser test environments", async () => {
    const result = await validateDocumentJson(JSON.stringify(sharedDocumentFixture));

    expect(result.engine).toBe("typescript");
    expect(JSON.parse(result.json)).toMatchObject({
      schema_version: 3,
      page: { width: 800, height: 600 },
      elements: [{ id: "title-1" }, { id: "rect-2" }],
    });
  });


  it("preserves the schema-v3 background image through the validation adapter", async () => {
    const result = await validateDocumentJson(JSON.stringify(backgroundDocumentFixture));
    const exported = JSON.parse(result.json) as typeof backgroundDocumentFixture;
    expect(exported.schema_version).toBe(3);
    expect(exported.page.background_image).toEqual(backgroundDocumentFixture.page.background_image);
  });

  it("rejects malformed JSON instead of silently accepting it", async () => {
    await expect(validateDocumentJson("{broken")).rejects.toThrow(/valid JSON/);
  });

  it("rejects inputs beyond the UTF-8 byte limit before parsing", async () => {
    await expect(validateDocumentJson('"😀"'.padEnd(2_000_000, "x"))).rejects.toThrow(/2 MB limit/);
  });
});
