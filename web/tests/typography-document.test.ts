import { describe, expect, it } from "vitest";
import v1 from "../../fixtures/document-v1.json";
import v2 from "../../fixtures/document-v2-a4.json";
import v3 from "../../fixtures/document-v3-background-image.json";
import v4 from "../../fixtures/document-v4-frames-grids.json";
import v5 from "../../fixtures/document-v5-semantic-table.json";
import { parseDocument, toDocument } from "../utils/document";
import { normalizeTypographyDocument } from "../utils/typography-document";
import { DEFAULT_TEXT_STYLE_V1 } from "../utils/text-style-v1";

describe("proposed typography document migration", () => {
  for (const fixture of [v1, v2, v3, v4, v5]) {
    it(`preserves legacy v${fixture.schema_version} data and round trips`, () => {
      const normalized = normalizeTypographyDocument(fixture);
      const parsed = parseDocument(fixture);
      const expected = toDocument(parsed.elements, {
        width: parsed.width, height: parsed.height, background: parsed.background,
        ...(parsed.backgroundImage ? { background_image: parsed.backgroundImage } : {}),
      }, parsed.outputSizeMm, parsed.template);
      expect(normalized).toEqual({
        ...expected, schema_version: 7,
        text_styles: parsed.elements.filter(e => e.type === "text").map(e => ({
          element_id: e.id, style: DEFAULT_TEXT_STYLE_V1,
        })),
      });
      expect(normalizeTypographyDocument(JSON.parse(JSON.stringify(normalized)))).toEqual(normalized);
    });
  }

  it("preserves a nondefault style through JSON and rejects unsupported versions", () => {
    const doc = normalizeTypographyDocument(v1);
    doc.text_styles[0] = { element_id: "title-1", style: {
      font_family: "serif", font_weight: "bold", font_style: "italic",
    }};
    expect(normalizeTypographyDocument(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
    expect(() => normalizeTypographyDocument({ ...v1, schema_version: 6 })).toThrow();
    expect(() => parseDocument(doc)).toThrow("Unsupported document schema version");
  });

  it("rejects missing, duplicate, non-text, null and legacy style entries", () => {
    const doc = normalizeTypographyDocument(v1);
    const entry = doc.text_styles[0]!;
    for (const styles of [undefined, null, [], [entry, entry],
      [{ ...entry, element_id: "rect-2" }], [{ ...entry, element_id: "missing" }],
      [{ ...entry, extra: true }]]) {
      expect(() => normalizeTypographyDocument({ ...doc, text_styles: styles })).toThrow();
    }
    expect(() => normalizeTypographyDocument({ ...v1, text_styles: [entry] })).toThrow();
  });
});
