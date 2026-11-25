import { describe, expect, it } from "vitest";
import cases from "../../fixtures/text-layout-v1-cases.json";
import v1 from "../../fixtures/document-v1.json";
import v5 from "../../fixtures/document-v5-semantic-table.json";
import { parseNativeTextLayout } from "../utils/native-text-layout";
import { normalizeTypographyDocument } from "../utils/typography-document";
import { normalizeTextLayoutDocument } from "../utils/text-layout-document";

describe("staged v8 native layout persistence", () => {
  for (const entry of cases) {
    it(entry.name, () => {
      if (entry.valid) expect(parseNativeTextLayout(entry.input)).toEqual(entry.input);
      else expect(() => parseNativeTextLayout(entry.input)).toThrow();
    });
  }
  it("preserves legacy geometry, styles and table-only documents", () => {
    const styled = normalizeTypographyDocument(v1);
    styled.text_styles[0] = { element_id: styled.text_styles[0]!.element_id, style: {
      font_family: "serif", font_weight: "bold", font_style: "italic",
    }};
    const normalized = normalizeTextLayoutDocument(styled);
    expect(normalized.text_styles).toEqual(styled.text_styles);
    expect(normalized.elements).toEqual(styled.elements);
    expect(normalized.schema_version).toBe(8);
    normalized.text_layouts[0] = { element_id: styled.text_styles[0]!.element_id, layout: {
      alignment: "center", lineHeight: 2, letterSpacing: 3,
    }};
    expect(normalizeTextLayoutDocument(JSON.parse(JSON.stringify(normalized)))).toEqual(normalized);
    expect(normalizeTextLayoutDocument(v5).text_layouts).toEqual([]);
  });
  it("rejects unknown, duplicate, missing and non-text bindings and old-version smuggling", () => {
    const doc = normalizeTextLayoutDocument(v1);
    const entry = doc.text_layouts[0]!;
    for (const entries of [null, [], [entry, entry], [{ ...entry, element_id: "missing" }],
      [{ ...entry, layout: { ...entry.layout, letterSpacing: 100 } }]]) {
      expect(() => normalizeTextLayoutDocument({ ...doc, text_layouts: entries })).toThrow();
    }
    expect(() => normalizeTextLayoutDocument({ ...doc, schema_version: 7 })).toThrow();
    expect(() => normalizeTextLayoutDocument({ ...v1, schema_version: 6 })).toThrow();
  });
});
