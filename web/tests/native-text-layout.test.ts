import { describe, expect, it } from "vitest";
import { DEFAULT_NATIVE_TEXT_LAYOUT, lineAdvance, nativeLayoutAttributes, parseNativeTextLayout } from "../utils/native-text-layout";

describe("native text layout contract", () => {
  it("preserves the existing renderer line advance", () => {
    expect(lineAdvance(10)).toBe(12.5);
    expect(lineAdvance(12)).toBe(15);
    expect(nativeLayoutAttributes(DEFAULT_NATIVE_TEXT_LAYOUT)).toEqual({
      css: { textAlign: "left", lineHeight: "1.25", letterSpacing: "0px" },
      svg: { textAnchor: "start", letterSpacing: 0 },
    });
  });
  it("maps bounded native controls without injecting arbitrary CSS", () => {
    const center = { alignment: "center", lineHeight: 2, letterSpacing: 3 };
    expect(nativeLayoutAttributes(center)).toEqual({
      css: { textAlign: "center", lineHeight: "2", letterSpacing: "3px" },
      svg: { textAnchor: "middle", letterSpacing: 3 },
    });
    expect(lineAdvance(24, parseNativeTextLayout(center))).toBe(48);
    expect(nativeLayoutAttributes({ ...center, alignment: "right" }).svg.textAnchor).toBe("end");
  });
  it("rejects missing, unknown, nonfinite, coercible and out-of-range fields", () => {
    for (const value of [null, [], {}, { ...DEFAULT_NATIVE_TEXT_LAYOUT, css: "url(x)" },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, alignment: "justify" },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, lineHeight: "2" },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, lineHeight: Infinity },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, lineHeight: 0.5 },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, lineHeight: 4 },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: NaN },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: -3 },
      { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: 11 }]) {
      expect(() => parseNativeTextLayout(value)).toThrow("Invalid text layout");
    }
  });
});
