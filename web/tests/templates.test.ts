import { describe, expect, it } from "vitest";
import { parseDocument } from "~/utils/document";
import {
  createTemplateDocument,
  getTemplateDefinition,
  listTemplates,
} from "~/utils/templates";

describe("starter template catalog", () => {
  it("exposes exactly the two MVP templates", () => {
    expect(listTemplates().map((template) => template.id)).toEqual([
      "exam-paper-a4",
      "shop-banner-landscape",
    ]);
  });

  it.each([
    ["exam-paper-a4", 794, 1123, 210, 297],
    ["shop-banner-landscape", 1200, 500, 300, 125],
  ] as const)(
    "creates a valid versioned document for %s",
    (id, width, height, outputWidth, outputHeight) => {
      const document = createTemplateDocument(id);
      expect(() => parseDocument(document)).not.toThrow();
      expect(document.schema_version).toBe(2);
      expect(document.page).toMatchObject({ width, height });
      expect(document.output_size_mm).toEqual({ width: outputWidth, height: outputHeight });
      expect(document.template).toEqual({ id, version: 1 });
      expect(document.elements.length).toBeGreaterThan(0);
    },
  );

  it("returns a fresh document without mutating the catalog", () => {
    const first = createTemplateDocument("exam-paper-a4");
    first.elements[0]!.kind.type === "text" && (first.elements[0]!.kind.text = "Changed");
    const second = createTemplateDocument("exam-paper-a4");

    expect(second.elements[0]!.kind).toMatchObject({ type: "text", text: "EXAMINATION" });
  });

  it("returns undefined for unknown template metadata", () => {
    expect(getTemplateDefinition("not-a-template")).toBeUndefined();
  });
});
