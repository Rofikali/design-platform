import { describe, expect, it } from "vitest";
import sharedDocumentFixture from "../../fixtures/document-v1.json";
import backgroundDocumentFixture from "../../fixtures/document-v3-background-image.json";
import semanticTableFixture from "../../fixtures/document-v5-semantic-table.json";
import { validateDocumentJson } from "../utils/document-validation";

describe("document validation adapter", () => {
  it("uses the TypeScript fallback in non-browser test environments", async () => {
    const result = await validateDocumentJson(JSON.stringify(sharedDocumentFixture));

    expect(result.engine).toBe("typescript");
    expect(JSON.parse(result.json)).toMatchObject({
      schema_version: 5,
      page: { width: 800, height: 600 },
      elements: [{ id: "title-1" }, { id: "rect-2" }],
    });
  });

  it("upgrades schema-v3 background images to v5 without losing the image", async () => {
    const result = await validateDocumentJson(JSON.stringify(backgroundDocumentFixture));
    const exported = JSON.parse(result.json);
    expect(exported.schema_version).toBe(5);
    expect(exported.page.background_image).toEqual(backgroundDocumentFixture.page.background_image);
  });

  it("normalizes the shared schema-v5 table fixture without losing cell data", async () => {
    const result = await validateDocumentJson(JSON.stringify(semanticTableFixture));
    const exported = JSON.parse(result.json);
    expect(exported.schema_version).toBe(5);
    expect(exported.elements[0].kind.cells[1][2]).toBe("₹80");
  });

  it("rejects malformed JSON instead of silently accepting it", async () => {
    await expect(validateDocumentJson("{broken")).rejects.toThrow(/valid JSON/);
  });

  it("rejects inputs beyond the UTF-8 byte limit before parsing", async () => {
    await expect(validateDocumentJson('"😀"'.padEnd(2_000_000, "x"))).rejects.toThrow(/2 MB limit/);
  });
});
