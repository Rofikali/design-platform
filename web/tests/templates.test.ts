import { describe, expect, it } from "vitest";
import { parseDocument } from "../utils/document";
import {
  createTemplateDocument,
  getTemplateDefinition,
  listTemplates,
} from "../utils/templates";

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
    "creates a valid schema-v5 document for %s",
    (id, width, height, outputWidth, outputHeight) => {
      const document = createTemplateDocument(id);
      expect(() => parseDocument(document)).not.toThrow();
      expect(document.schema_version).toBe(5);
      expect(document.page).toMatchObject({ width, height });
      expect(document.output_size_mm).toEqual({ width: outputWidth, height: outputHeight });
      expect(document.template).toEqual({ id, version: 1 });
      expect(document.elements.length).toBeGreaterThan(0);
    },
  );

  it("returns a fresh document and protects catalog definitions from mutation", () => {
    const first = createTemplateDocument("exam-paper-a4");
    const firstElement = first.elements[0]!;
    if (firstElement.kind.type === "text") firstElement.kind.text = "Changed";

    const exposed = getTemplateDefinition("exam-paper-a4");
    if (exposed) exposed.elements[0] = {
      id: "tampered", type: "text", text: "Tampered",
      x: 0, y: 0, width: 100, height: 30, fontSize: 12, color: "#000000",
    };

    const second = createTemplateDocument("exam-paper-a4");
    expect(second.elements[0]!.kind).toMatchObject({ type: "text", text: "EXAMINATION" });
    expect(second.elements[0]!.id).toBe("exam-title");
  });

  it("returns undefined for unknown template metadata", () => {
    expect(getTemplateDefinition("not-a-template")).toBeUndefined();
  });
});
