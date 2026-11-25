import { describe, expect, it } from "vitest";
import { DEFAULT_NATIVE_TEXT_LAYOUT, lineAdvance, nativeLayoutAttributes, parseNativeTextLayout, measureNativeTextWidth } from "../utils/native-text-layout";

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

describe("native Canvas spacing measurement", () => {
  const metric = (width: number) => ({ width }) as TextMetrics;
  it("applies and restores native spacing including the default", () => {
    const context = { letterSpacing: "7px", measureText() { return metric(Number.parseFloat(this.letterSpacing) + 10); } };
    expect(measureNativeTextWidth(context, "AB", { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: 3 })).toBe(13);
    expect(context.letterSpacing).toBe("7px");
    expect(measureNativeTextWidth(context, "AB")).toBe(10);
    expect(context.letterSpacing).toBe("7px");
  });
  it("preserves default behavior and fails closed when spacing is unavailable", () => {
    const context = { measureText: () => metric(20) };
    expect(measureNativeTextWidth(context, "AB")).toBe(20);
    expect(() => measureNativeTextWidth(context, "AB", { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: 3 })).toThrow("unavailable");
  });
  it("restores spacing even when native measurement throws", () => {
    const context = { letterSpacing: "7px", measureText(): TextMetrics { throw new Error("measurement failed"); } };
    expect(() => measureNativeTextWidth(context, "AB", { ...DEFAULT_NATIVE_TEXT_LAYOUT, letterSpacing: -2 })).toThrow("measurement failed");
    expect(context.letterSpacing).toBe("7px");
  });
});
