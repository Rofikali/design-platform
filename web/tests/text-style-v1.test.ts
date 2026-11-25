import { describe, expect, it } from "vitest";
import cases from "../../fixtures/text-style-v1-cases.json";
import { DEFAULT_TEXT_STYLE_V1, parseTextStyleV1 } from "../utils/text-style-v1";

describe("staged text style contract", () => {
  for (const entry of cases) {
    it(entry.name, () => {
      if (entry.valid) {
        const style = parseTextStyleV1(entry.input);
        expect(style).toEqual(entry.input);
        expect(Object.isFrozen(style)).toBe(true);
      } else {
        expect(() => parseTextStyleV1(entry.input)).toThrow("Invalid text style");
      }
    });
  }

  it("preserves legacy defaults", () => {
    expect(DEFAULT_TEXT_STYLE_V1).toEqual({
      font_family: "sans", font_weight: "normal", font_style: "normal",
    });
    expect(Object.isFrozen(DEFAULT_TEXT_STYLE_V1)).toBe(true);
  });
});
